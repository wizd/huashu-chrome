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
//   load.json  清单：hosts、waitFor、limits、vendor（上游仓库 + 固定 commit）、actions.read/write、
//              confirm（云端调用前扩展要用户点头的 write action → 给用户看的说明）、denied
//   setup.js   跑在上游代码之前，补上页面缺的全局变量
//   entry.js   页面侧入口，注册 window.__vcorpLoads[name] = { version, ready(), call(action, payload) }
// 上游源码按 vendor.commit 拉到 .cache/loads/ 里，用 @upstream 引用。升级上游只改 commit 再跑一遍。
// 没有 vendor 的是自研能力包（如 media）：源码全在 loads/<name>/ 里，load.json 自己写 version。
// netHook: true：包要读页面的接口响应，background.js 装包前在它的 hosts 上开网络记录（net-hook.js）。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';
import { loadVersion } from './load-version.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'loads');
const OUT = path.join(ROOT, 'extension', 'loads');
const CACHE = path.join(ROOT, '.cache', 'loads');
const NAME_RE = /^[a-z][a-z0-9-]{0,31}$/;
// 宿主接口版本和能认的 needs：和 extension/load.js 的 HOST_API、NEEDS 保持一致（test/loads.test.js 核对）
const HOST_API = 1;
const NEEDS = new Set(['netHook', 'early', 'binaryOut']);

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
  const up = vendor ? upstream(name, vendor) : null;
  const actions = [...manifest.actions.read, ...manifest.actions.write];
  const version = loadVersion(dir, manifest);

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
    alias: up ? { '@upstream': up } : {},
    nodePaths: [path.join(ROOT, 'node_modules')],
    define: {
      __CONNECTOR_VERSION__: JSON.stringify(vendor ? vendor.version : manifest.version),
      __LOAD_VERSION__: JSON.stringify(version),
      __LOAD_ACTIONS__: JSON.stringify(actions),
    },
    banner: {
      js: (vendor
        ? `// 由 scripts/build-loads.mjs 生成，不要手改。上游：${vendor.repo} @ ${vendor.commit}（${vendor.license}）\n`
        : `// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/${name}/\n`)
        + fs.readFileSync(path.join(dir, 'setup.js'), 'utf8'),
    },
    logLevel: 'warning',
  });
  // 上游的许可证跟着产物走
  for (const f of up ? ['LICENSE', 'NOTICE'] : []) {
    const from = [path.join(up, 'extension', f), path.join(up, f)].find((p) => fs.existsSync(p));
    if (from) fs.copyFileSync(from, path.join(outDir, f));
  }
  // early：document_start 注入的钩子，原样拷过去（不打包：它要在页面任何脚本之前、自己独立跑）
  const early = [];
  for (const f of manifest.early || []) {
    if (!/^[a-z0-9-]+\.js$/.test(f)) throw new Error(`${name}: early 文件名不对：${f}`);
    const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
    fs.writeFileSync(path.join(outDir, f), `// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/${name}/${f}\n${src}`);
    early.push(`loads/${name}/${f}`);
  }
  const needs = [...new Set([...(manifest.needs || []), ...(manifest.netHook ? ['netHook'] : []), ...(early.length ? ['early'] : [])])].sort();
  for (const n of needs) if (!NEEDS.has(n)) throw new Error(`${name}: 不认识的 needs：${n}`);
  if (needs.includes('early') && !early.length) throw new Error(`${name}: needs 有 early，却没有 early 文件`);
  if (needs.includes('binaryOut') !== !!Object.keys(manifest.outputs || {}).length) throw new Error(`${name}: needs 的 binaryOut 和 outputs 要一起写`);
  for (const [ch, o] of Object.entries(manifest.outputs || {})) {
    if (o.sniff !== 'media' || o.quota !== 'media') throw new Error(`${name}: outputs.${ch} 目前只支持 sniff/quota 为 media`);
  }
  if ((manifest.api || 1) > HOST_API) throw new Error(`${name}: 要宿主接口 ${manifest.api}，扩展只有 ${HOST_API}`);
  if (manifest.hosts !== 'task' && !(Array.isArray(manifest.hosts) && manifest.hosts.length)) throw new Error(`${name}: hosts 要是非空列表或 "task"`);
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
    confirm: manifest.confirm || {},
    ...(manifest.netHook ? { netHook: true } : {}),
    api: manifest.api || 1,
    needs,
    ...(early.length ? { early } : {}),
    ...(manifest.outputs ? { outputs: manifest.outputs } : {}),
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
