#!/usr/bin/env node
// 构建能力包（load）：loads/<name>/ 是源，extension/loads/ 是产物，产物入库、随扩展发布。
//
// 为什么产物要入库：MV3 不允许远程代码，商店审核也会查。能力包只能是扩展包里的文件，
// 云端只能按名字点它、按白名单调 action，不能下发任何 JS（见 cloud-policy.js 顶部）。
//
//   node scripts/build-loads.mjs          → 构建全部能力包
//   node scripts/build-loads.mjs eda      → 只构建 eda
//
// 每个能力包：
//   load.json  清单：hosts、waitFor、limits、vendor（上游仓库 + 固定 commit）、actions.read/write、denied
//   setup.js   跑在上游代码之前，补上页面缺的全局变量
//   entry.js   页面侧入口，注册 window.__vcorpLoads[name] = { version, ready(), call(action, payload) }
// 上游源码按 vendor.commit 拉到 .cache/loads/ 里，用 @upstream 引用。升级上游只改 commit 再跑一遍。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'loads');
const OUT = path.join(ROOT, 'extension', 'loads');
const CACHE = path.join(ROOT, '.cache', 'loads');
const NAME_RE = /^[a-z][a-z0-9-]{0,31}$/;

function upstream(name, vendor) {
  if (!/^[0-9a-f]{40}$/.test(vendor.commit || '')) throw new Error(`${name}: vendor.commit 要写完整的 40 位 commit`);
  const dir = path.join(CACHE, `${name}@${vendor.commit.slice(0, 12)}`);
  if (fs.existsSync(path.join(dir, '.git'))) return dir;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(CACHE, { recursive: true });
  execFileSync('git', ['clone', '-q', '--no-checkout', vendor.repo, dir], { stdio: 'inherit' });
  execFileSync('git', ['-C', dir, '-c', 'core.autocrlf=false', 'checkout', '-q', vendor.commit], { stdio: 'inherit' });
  return dir;
}

async function build(name) {
  const dir = path.join(SRC, name);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'load.json'), 'utf8'));
  if (manifest.name !== name) throw new Error(`${name}: load.json 的 name 是 ${manifest.name}`);
  const { vendor } = manifest;
  const up = upstream(name, vendor);
  const actions = [...manifest.actions.read, ...manifest.actions.write];
  // 版本里带上适配层的指纹：只改了 entry.js / setup.js / 白名单时，页面上那份旧的也要被换掉
  // （ensureLoad 按版本号判断要不要重新注入）
  const adapter = crypto.createHash('sha256');
  for (const f of ['load.json', 'setup.js', 'entry.js']) adapter.update(fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n'));
  const version = `${vendor.version}+${vendor.commit.slice(0, 7)}.${adapter.digest('hex').slice(0, 6)}`;

  const outDir = path.join(OUT, name);
  fs.mkdirSync(outDir, { recursive: true });
  const outfile = path.join(outDir, 'agent.js');
  await esbuild.build({
    entryPoints: [path.join(dir, 'entry.js')],
    outfile,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome116',
    // 不压缩：商店审核要能读懂，出了问题也要能在页面里对着源码查
    minify: false,
    legalComments: 'inline',
    alias: { '@upstream': up },
    nodePaths: [path.join(ROOT, 'node_modules')],
    define: {
      __CONNECTOR_VERSION__: JSON.stringify(vendor.version),
      __LOAD_VERSION__: JSON.stringify(version),
      __LOAD_ACTIONS__: JSON.stringify(actions),
    },
    banner: {
      js: `// 由 scripts/build-loads.mjs 生成，不要手改。上游：${vendor.repo} @ ${vendor.commit}（${vendor.license}）\n`
        + fs.readFileSync(path.join(dir, 'setup.js'), 'utf8'),
    },
    logLevel: 'warning',
  });
  // 上游的许可证跟着产物走
  for (const f of ['LICENSE', 'NOTICE']) {
    const from = [path.join(up, 'extension', f), path.join(up, f)].find((p) => fs.existsSync(p));
    if (from) fs.copyFileSync(from, path.join(outDir, f));
  }
  const bytes = fs.readFileSync(outfile);
  const { read, write } = manifest.actions;
  return {
    name,
    title: manifest.title,
    description: manifest.description,
    version,
    hosts: manifest.hosts,
    waitFor: manifest.waitFor || '',
    files: manifest.files.map((f) => `loads/${name}/${f}`),
    limits: manifest.limits,
    actions: { read, write },
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
  };
}

const wanted = process.argv.slice(2);
const names = fs.readdirSync(SRC).filter((n) => NAME_RE.test(n) && fs.existsSync(path.join(SRC, n, 'load.json')));
for (const n of wanted) if (!names.includes(n)) throw new Error(`没有能力包 ${n}`);

// 注册表要包含全部能力包；只构建一部分时，其余的沿用上一次的产物
const indexFile = path.join(OUT, 'index.js');
const prev = fs.existsSync(indexFile) ? (await import(`${new URL(`file://${indexFile.replace(/\\/g, '/')}`).href}?t=${Date.now()}`)).LOADS : {};
const loads = {};
for (const n of names) {
  if (wanted.length && !wanted.includes(n) && prev[n]) { loads[n] = prev[n]; continue; }
  loads[n] = await build(n);
  console.log(`${n}: ${loads[n].version}，${Math.round(loads[n].bytes / 1024)}KB，sha256 ${loads[n].sha256.slice(0, 12)}…`);
}
fs.writeFileSync(indexFile,
  '// 由 scripts/build-loads.mjs 生成，不要手改。数据源是 loads/<name>/load.json。\n'
  + '// 纯数据：cloud-policy.js 在 Node 里也要能 import 它。\n'
  + `export const LOADS = ${JSON.stringify(loads, null, 2)};\n`);
console.log(`→ ${path.relative(ROOT, indexFile)}`);
