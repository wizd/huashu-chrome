// 原生消息宿主的安装 / 卸载 / 体检（npx vcorp-chrome desktop install|uninstall|status）。
//
// Chrome 找宿主靠一份清单：Windows 在注册表 HKCU 下登记清单路径，macOS / Linux 把清单放进
// 浏览器约定的目录。清单的 path 指向一个启动脚本，脚本用装它时的那个 node 跑 native-host/host.js。
// allowed_origins 只写本扩展：开发者模式加载的 id 由 manifest.json 里的 key 算出来，再加上商店版的 id。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { HOME, ensureHome } from './paths.js';

export const HOST_NAME = 'ai.vcorp.desktop';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const HOST_JS = path.join(ROOT, 'native-host', 'host.js');
const DIR = path.join(HOME, 'desktop-host');
const MANIFEST = path.join(DIR, `${HOST_NAME}.json`);

// Chrome 的扩展 id：公钥 DER 的 sha256 前 16 字节，每个十六进制位 0-f 映射成 a-p
export function extensionId(manifestKey) {
  const hex = crypto.createHash('sha256').update(Buffer.from(manifestKey, 'base64')).digest('hex').slice(0, 32);
  return [...hex].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

function ourExtensionId() {
  const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'extension', 'manifest.json'), 'utf8'));
  return extensionId(mf.key);
}

// 商店版的 id 是商店分配的：打商店包时 manifest.key 被剥掉（scripts/pack-extension.mjs），算不出来，只能写死
export const STORE_EXTENSION_ID = 'migojdmaegllchbambngejkclndannnf';

// 清单放行的来源：开发者模式加载的（id 由 key 算出）和商店装的，两种都是本扩展
export function allowedOrigins(id = ourExtensionId()) {
  return [...new Set([id, STORE_EXTENSION_ID])].map((x) => `chrome-extension://${x}/`);
}

const REG_KEYS = [
  `HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\${HOST_NAME}`,
  `HKCU\\Software\\Microsoft\\Edge\\NativeMessagingHosts\\${HOST_NAME}`,
];

function manifestDirs() {
  const h = os.homedir();
  if (process.platform === 'darwin') {
    const base = path.join(h, 'Library', 'Application Support');
    return ['Google/Chrome', 'Chromium', 'Microsoft Edge', 'BraveSoftware/Brave-Browser'].map((b) => path.join(base, b, 'NativeMessagingHosts'));
  }
  return ['google-chrome', 'chromium', 'microsoft-edge', 'BraveSoftware/Brave-Browser'].map((b) => path.join(h, '.config', b, 'NativeMessagingHosts'));
}

export function install() {
  ensureHome();
  fs.mkdirSync(DIR, { recursive: true });
  const win = process.platform === 'win32';
  const launcher = path.join(DIR, win ? 'vcorp-desktop-host.cmd' : 'vcorp-desktop-host');
  fs.writeFileSync(launcher, win
    ? `@echo off\r\n"${process.execPath}" "${HOST_JS}" %*\r\n`
    : `#!/bin/sh\nexec "${process.execPath}" "${HOST_JS}" "$@"\n`);
  if (!win) fs.chmodSync(launcher, 0o755);
  const id = ourExtensionId();
  fs.writeFileSync(MANIFEST, JSON.stringify({
    name: HOST_NAME,
    description: 'vcorp-chrome desktop host',
    path: launcher,
    type: 'stdio',
    allowed_origins: allowedOrigins(id),
  }, null, 2));
  const placed = [];
  if (win) {
    for (const key of REG_KEYS) {
      execFileSync('reg', ['add', key, '/ve', '/t', 'REG_SZ', '/d', MANIFEST, '/f'], { stdio: 'ignore', windowsHide: true });
      placed.push(key);
    }
  } else {
    for (const dir of manifestDirs()) {
      if (!fs.existsSync(path.dirname(dir))) continue;   // 没装这个浏览器
      fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(MANIFEST, path.join(dir, `${HOST_NAME}.json`));
      placed.push(dir);
    }
  }
  return { id, launcher, manifest: MANIFEST, placed };
}

export function uninstall() {
  const removed = [];
  if (process.platform === 'win32') {
    for (const key of REG_KEYS) {
      try { execFileSync('reg', ['delete', key, '/f'], { stdio: 'ignore', windowsHide: true }); removed.push(key); } catch { /* 本来就没登记 */ }
    }
  } else {
    for (const dir of manifestDirs()) {
      const f = path.join(dir, `${HOST_NAME}.json`);
      if (fs.existsSync(f)) { fs.rmSync(f); removed.push(f); }
    }
  }
  fs.rmSync(DIR, { recursive: true, force: true });
  return { removed };
}

// 按 Chrome 的方式跟宿主说一句话：起启动脚本、写一条带长度前缀的消息、读一条回包
export function talk(msg, { launcher, timeoutMs = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    const win = process.platform === 'win32';
    const child = win
      ? spawn('cmd.exe', ['/d', '/c', launcher, `chrome-extension://${ourExtensionId()}/`], { windowsHide: true })
      : spawn(launcher, [`chrome-extension://${ourExtensionId()}/`]);
    const chunks = [];
    const timer = setTimeout(() => { child.kill(); reject(new Error(`宿主 ${timeoutMs / 1000}s 没有回包`)); }, timeoutMs);
    child.stdout.on('data', (b) => chunks.push(b));
    child.on('error', (e) => { clearTimeout(timer); reject(e); });
    child.on('close', () => {
      clearTimeout(timer);
      const buf = Buffer.concat(chunks);
      if (buf.length < 4) return reject(new Error('宿主没有回包'));
      resolve(JSON.parse(buf.subarray(4, 4 + buf.readUInt32LE(0)).toString('utf8')));
    });
    const body = Buffer.from(JSON.stringify(msg), 'utf8');
    const len = Buffer.alloc(4);
    len.writeUInt32LE(body.length, 0);
    child.stdin.end(Buffer.concat([len, body]));
  });
}

export async function status() {
  const lines = [];
  let launcher = '';
  if (!fs.existsSync(MANIFEST)) return { installed: false, lines: ['没有安装：运行 npx vcorp-chrome desktop install'] };
  const mf = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  launcher = mf.path;
  lines.push(`清单 ${MANIFEST}`);
  if (process.platform === 'win32') {
    for (const key of REG_KEYS) {
      let ok = false;
      try { ok = execFileSync('reg', ['query', key, '/ve'], { encoding: 'utf8', windowsHide: true }).includes(MANIFEST); } catch { /* 没登记 */ }
      lines.push(`${ok ? '✅' : '❌'} ${key}`);
    }
  }
  if (!fs.existsSync(HOST_JS)) lines.push(`❌ 启动脚本指向的 ${HOST_JS} 不在了（npx 缓存被清过？）：重新运行 desktop install`);
  const hello = await talk({ op: 'hello' }, { launcher });
  lines.push(hello.ready
    ? `✅ 宿主应答 · 设备 ${hello.device.id} · agent-desktop 可用`
    : `❌ 宿主应答了，但 agent-desktop 用不了：[${hello.error?.code}] ${hello.error?.message}`);
  return { installed: true, ready: !!hello.ready, device: hello.device, lines };
}
