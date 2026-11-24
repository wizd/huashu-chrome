#!/usr/bin/env node
// 打 Chrome 扩展发布包（商店包 + 手动安装包），支持按部署参数化生成品牌变体。
//
// 上架是「自动更新 + 一键安装」的唯一路——unpacked 加载意味着开发者模式常开、
// 目录藏在 npx 缓存里、npx 原地刷新文件而 Chrome 跑的还是旧 SW。
// 商店包和开发目录只差一件事：manifest 里的 `key` 必须剥掉（首次上传带 key 会被拒，
// 商店会用自己的密钥签名；扩展 ID 由开发者账号下的首次上传决定）。
// 不改 extension/ 目录本身——那是 unpacked 加载和 doctor 指向的真源。
//
// 默认（vcorp-chrome）：
//   node scripts/pack-extension.mjs
//     → dist/vcorp-chrome-<version>.zip
//     → dist/vcorp-chrome-<version>-manual.zip
//
// 独立部署 / OEM 变体（必须提供独立 RSA 公钥，避免与 vcorp-chrome 扩展 ID 冲突）：
//   node scripts/pack-extension.mjs \
//     --name acme-chrome \
//     --origin https://maker.acme.example \
//     --key-file path/to/acme-public.pem
//     → dist/acme-chrome-<version>.zip
//     → dist/acme-chrome-<version>-manual.zip
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DEFAULT_ORIGIN, normalizeOrigin, hostOf } from '../extension/cloud-policy.js';
import { extensionId } from '../src/lib/native-install.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'extension');

// UI 文件里要替换展示名，但保留 CLI 命令（npx vcorp-chrome ...）和配置目录（.vcorp-chrome）
const DISPLAY_NAME_FILES = [
  'panel.html',
  'panel.js',
  'welcome.html',
  'welcome.js',
  'ask-page.js',
  'cloud.js',
  'offscreen.html',
  'desktop-setup.html',
  'desktop-setup.js',
];
const HOST_TEXT_FILES = ['panel.html', 'welcome.html'];
const DISPLAY_NAME_RE = /(?<!npx (?:-y )?|\.)vcorp-chrome(?!@| (?:doctor|desktop|install))/g;

export function normalizeManifestKey(raw) {
  const s = String(raw || '')
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  if (!s) throw new Error('manifest key 为空');
  const der = Buffer.from(s, 'base64');
  // 校验确实是合法的 SPKI 公钥 DER，避免打进无效 key 导致 Chrome 拒绝加载
  let pub;
  try {
    pub = crypto.createPublicKey({ key: der, format: 'der', type: 'spki' });
  } catch (e) {
    throw new Error(`manifest key 不是合法的 SPKI 公钥（base64 DER 或 PEM）：${e.message}`);
  }
  return pub.export({ format: 'der', type: 'spki' }).toString('base64');
}

export function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`参数 ${a} 缺少值`);
      return argv[++i];
    };
    if (a === '--name') opts.name = next();
    else if (a.startsWith('--name=')) opts.name = a.slice('--name='.length);
    else if (a === '--origin') opts.origin = next();
    else if (a.startsWith('--origin=')) opts.origin = a.slice('--origin='.length);
    else if (a === '--key') opts.key = next();
    else if (a.startsWith('--key=')) opts.key = a.slice('--key='.length);
    else if (a === '--key-file') opts.keyFile = next();
    else if (a.startsWith('--key-file=')) opts.keyFile = a.slice('--key-file='.length);
    else if (a === '--out-dir') opts.outDir = next();
    else if (a.startsWith('--out-dir=')) opts.outDir = a.slice('--out-dir='.length);
    else if (a === '-h' || a === '--help') opts.help = true;
    else throw new Error(`未知参数：${a}`);
  }
  return opts;
}

function patchStagedDir(dir, { baseName, name, origin }) {
  if (origin !== DEFAULT_ORIGIN) {
    const policyPath = path.join(dir, 'cloud-policy.js');
    const before = fs.readFileSync(policyPath, 'utf8');
    const target = `export const DEFAULT_ORIGIN = '${DEFAULT_ORIGIN}';`;
    if (!before.includes(target)) throw new Error('cloud-policy.js 中未找到 DEFAULT_ORIGIN 声明');
    fs.writeFileSync(policyPath, before.replace(target, `export const DEFAULT_ORIGIN = '${origin}';`));

    const defaultHost = hostOf(DEFAULT_ORIGIN);
    const nextHost = hostOf(origin);
    for (const rel of HOST_TEXT_FILES) {
      const f = path.join(dir, rel);
      fs.writeFileSync(f, fs.readFileSync(f, 'utf8').split(defaultHost).join(nextHost));
    }
  }

  if (name !== baseName) {
    for (const rel of DISPLAY_NAME_FILES) {
      const f = path.join(dir, rel);
      fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(DISPLAY_NAME_RE, name));
    }
  }
}

export function packExtension(opts = {}) {
  const baseManifest = JSON.parse(fs.readFileSync(path.join(SRC, 'manifest.json'), 'utf8'));
  const name = (opts.name || baseManifest.name).trim();
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(name)) {
    throw new Error(`--name 只能包含字母、数字和短横线：${name}`);
  }
  const origin = opts.origin ? normalizeOrigin(opts.origin) : DEFAULT_ORIGIN;
  if (!origin) throw new Error(`--origin 必须是合法的 https 地址（或本地 http）：${opts.origin}`);

  const isCustom = name !== baseManifest.name || origin !== DEFAULT_ORIGIN;
  let customKey = null;
  if (opts.key && opts.keyFile) throw new Error('--key 与 --key-file 不能同时指定');
  if (opts.key) customKey = normalizeManifestKey(opts.key);
  else if (opts.keyFile) customKey = normalizeManifestKey(fs.readFileSync(opts.keyFile, 'utf8'));

  if (isCustom && !customKey) {
    throw new Error('自定义 --name 或 --origin 时必须通过 --key 或 --key-file 提供独立公钥，否则手动安装包会与 vcorp-chrome 扩展 ID 冲突');
  }
  if (isCustom && customKey === baseManifest.key) {
    throw new Error('自定义扩展不能复用 vcorp-chrome 的默认 key，请生成独立 RSA-2048 密钥对');
  }

  const manualKey = customKey || baseManifest.key;
  const manualExtId = manualKey ? extensionId(manualKey) : null;
  const outDir = opts.outDir ? path.resolve(opts.outDir) : path.join(ROOT, 'dist');
  const out = path.join(outDir, `${name}-${baseManifest.version}.zip`);
  const manual = path.join(outDir, `${name}-${baseManifest.version}-manual.zip`);

  const copyFilter = (p) => !/\.DS_Store$|[\\/]content[\\/]?$/.test(p);
  const { key: _ignored, ...baseWithoutKey } = baseManifest;
  const storeManifest = {
    ...baseWithoutKey,
    name,
    action: { ...(baseManifest.action || {}), default_title: name },
  };
  const manualManifest = manualKey ? { ...storeManifest, key: manualKey } : storeManifest;
  const patchOpts = { baseName: baseManifest.name, name, origin, isCustom, manualExtId };

  // 1. 商店包（无 manifest.key）
  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-pack-'));
  try {
    fs.cpSync(SRC, stage, { recursive: true, filter: copyFilter });
    patchStagedDir(stage, patchOpts);
    fs.writeFileSync(path.join(stage, 'manifest.json'), JSON.stringify(storeManifest, null, 2) + '\n');
    fs.mkdirSync(outDir, { recursive: true });
    try { fs.unlinkSync(out); } catch { /* 没有旧包 */ }
    execFileSync('zip', ['-qr', out, '.'], { cwd: stage });
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
  }

  // 2. 手动安装包（保留/写入固定 manifest.key，包内顶层目录为 <name>/）
  const mstage = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-pack-'));
  try {
    const inner = path.join(mstage, name);
    fs.cpSync(SRC, inner, { recursive: true, filter: copyFilter });
    patchStagedDir(inner, patchOpts);
    fs.writeFileSync(path.join(inner, 'manifest.json'), JSON.stringify(manualManifest, null, 2) + '\n');
    try { fs.unlinkSync(manual); } catch { /* 没有旧包 */ }
    execFileSync('zip', ['-qr', manual, name], { cwd: mstage });
  } finally {
    fs.rmSync(mstage, { recursive: true, force: true });
  }

  return {
    name,
    version: baseManifest.version,
    origin,
    storeZip: out,
    manualZip: manual,
    manualExtId,
    hadKey: Boolean(manualKey),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log([
      '用法：node scripts/pack-extension.mjs [选项]',
      '  --name <name>         扩展名称与包名（默认 vcorp-chrome）',
      '  --origin <https://..> 默认配对服务器地址（默认 https://maker.vcorp.ai）',
      '  --key <base64>        手动安装包的独立 SPKI 公钥（base64 或 PEM）',
      '  --key-file <path>     从文件读取 SPKI 公钥（base64 或 PEM）',
      '  --out-dir <dir>       输出目录（默认 dist/）',
    ].join('\n'));
    process.exit(0);
  }
  const r = packExtension(opts);
  console.log(`${r.storeZip}  (${Math.round(fs.statSync(r.storeZip).size / 1024)}KB)`);
  console.log(`${r.manualZip}  (${Math.round(fs.statSync(r.manualZip).size / 1024)}KB)  手动安装包，带 key；复制到 opus-video-maker/public/downloads/${r.name}.zip`);
  console.log(`扩展名 ${r.name} · 版本 ${r.version} · 默认服务器 ${r.origin} · 手动版 ID ${r.manualExtId || '（无 key）'}`);
  if (r.name === 'vcorp-chrome') {
    console.log('下一步是人做的：https://chrome.google.com/webstore/devconsole → 上传商店 zip → 填隐私声明（PRIVACY.md）→ 提交审核。');
  }
}
