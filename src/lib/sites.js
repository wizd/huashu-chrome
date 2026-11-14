// 站点函数库 —— 跑通过的代码，下次直接调用。
//
// 经验笔记是给模型读的文字，每次都要重新理解、重新摸索；站点函数是能直接跑的程序。
// 两层，和经验库同构：
//   出厂  <包>/sites/<域名>/<函数名>.js         随 npm 包分发
//   本机  ~/.vcorp-chrome/sites/<域名>/<函数名>.js   模型自己写、自己修，永不被升级覆盖（同名优先）
//
// 进化闭环：
//   1. 模型用 script 写代码，在真实页面上跑；失败就拿到错误、轨迹、页面诊断，改了再跑。
//   2. 跑通了带 save → 只有这一次**成功**的代码才会被存成站点函数（没验证过的代码进不了库）。
//   3. 以后 learnings(domain) 会列出这些函数和它们的战绩；script 里 sites.run('域名/函数', args) 一行调用。
//   4. 站点改版、函数失败：报错里带着函数源码路径和失败统计，模型修好再 save 覆盖。
//
// 文件格式就是一个 ESM 模块，头部注释是元数据：
//   // @doc 一句话说明这个函数做什么、参数是什么
//   // @args {"title":"标题","video":"本机路径"}
//   // @saved 2026-11-14
//   export default async function ({ page, args, browser, state, sites, log, sleep }) { … }
// 战绩记在同目录 <函数名>.stats.json：runs / ok / fail / lastOk / lastError。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HOME } from './paths.js';

export const SEED_SITES = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'sites');
export const LOCAL_SITES = process.env.HUASHU_CHROME_SITES_DIR || path.join(HOME, 'sites');

const NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;

export function siteKey(domain) {
  let d = String(domain || '').trim().toLowerCase();
  d = d.replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0].split(':')[0].replace(/^www\./, '');
  if (!/^[a-z0-9.-]+\.[a-z0-9-]+$/.test(d)) throw new Error(`不像一个域名：${domain}`);
  return d;
}

// 'xiaohongshu.com/publishVideo' → {domain, name}
export function parseId(id) {
  const m = /^([^/]+)\/([^/]+)$/.exec(String(id || '').trim());
  if (!m) throw new Error(`站点函数的写法是 "域名/函数名"，比如 "xiaohongshu.com/publishVideo"，收到的是 ${JSON.stringify(id)}`);
  if (!NAME_RE.test(m[2])) throw new Error(`函数名只能用字母、数字、下划线，且以字母开头：${m[2]}`);
  return { domain: siteKey(m[1]), name: m[2] };
}

function dirsFor(domain) {
  // 子域归到主域：creator.xiaohongshu.com 的函数和 xiaohongshu.com 的放在一起找
  const parts = domain.split('.');
  const keys = [];
  for (let i = 0; i < parts.length - 1; i++) keys.push(parts.slice(i).join('.'));
  return keys;
}

function meta(src) {
  const get = (k) => new RegExp(`^//\\s*@${k}\\s+(.+)$`, 'm').exec(src)?.[1]?.trim();
  return { doc: get('doc') || '', args: get('args') || '', saved: get('saved') || '' };
}

function readStats(file) {
  try { return JSON.parse(fs.readFileSync(file.replace(/\.js$/, '.stats.json'), 'utf8')); } catch { return {}; }
}

export function locate(id) {
  const { domain, name } = parseId(id);
  for (const key of dirsFor(domain)) {
    for (const [base, layer] of [[LOCAL_SITES, 'local'], [SEED_SITES, 'seed']]) {
      const file = path.join(base, key, `${name}.js`);
      if (fs.existsSync(file)) return { file, layer, domain: key, name };
    }
  }
  return null;
}

export function listSites(domain) {
  const out = [];
  const seen = new Set();
  const keys = domain ? dirsFor(siteKey(domain)) : null;
  for (const [base, layer] of [[LOCAL_SITES, 'local'], [SEED_SITES, 'seed']]) {
    let doms = [];
    try { doms = fs.readdirSync(base); } catch { continue; }
    for (const d of doms) {
      if (keys && !keys.includes(d)) continue;
      let files = [];
      try { files = fs.readdirSync(path.join(base, d)).filter((f) => f.endsWith('.js')); } catch { continue; }
      for (const f of files) {
        const id = `${d}/${f.slice(0, -3)}`;
        if (seen.has(id)) continue;
        seen.add(id);
        const file = path.join(base, d, f);
        const src = fs.readFileSync(file, 'utf8');
        out.push({ id, layer, file, ...meta(src), stats: readStats(file) });
      }
    }
  }
  return out;
}

export function describeSites(domain) {
  const list = listSites(domain);
  if (!list.length) return '';
  const lines = list.map((s) => {
    const st = s.stats;
    const rec = st.runs ? `战绩 ${st.ok || 0}/${st.runs}${st.lastOk ? `，最近成功 ${st.lastOk.slice(0, 10)}` : ''}${st.lastError ? `，最近失败：${String(st.lastError).slice(0, 80)}` : ''}` : '还没被调用过';
    return `- \`${s.id}\`${s.doc ? ` — ${s.doc}` : ''}${s.args ? `\n  args: ${s.args}` : ''}\n  ${rec}（${s.layer === 'local' ? '本机' : '出厂'}，${s.file}）`;
  });
  return `## 可运行的站点函数\n\n跑过、验证过的代码。用 script({run:"<id>", args:{…}}) 直接调用，`
    + `或在脚本里 await sites.run("<id>", args)。失败了读源码修好，带 save 覆盖。\n\n${lines.join('\n')}`;
}

export function recordRun(file, ok, error) {
  const sf = file.replace(/\.js$/, '.stats.json');
  // 出厂函数的战绩记在本机目录，不往 npm 包里写
  const target = sf.startsWith(SEED_SITES) ? path.join(LOCAL_SITES, path.relative(SEED_SITES, sf)) : sf;
  const st = readStats(target.replace(/\.stats\.json$/, '.js'));
  st.runs = (st.runs || 0) + 1;
  const now = new Date().toISOString();
  if (ok) { st.ok = (st.ok || 0) + 1; st.lastOk = now; st.consecutiveFails = 0; } else {
    st.fail = (st.fail || 0) + 1; st.lastFailAt = now; st.lastError = String(error || '').slice(0, 300);
    st.consecutiveFails = (st.consecutiveFails || 0) + 1;
  }
  try { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(st, null, 2)); } catch { /* 统计写不下不影响结果 */ }
  return st;
}

export async function loadSite(id) {
  const hit = locate(id);
  if (!hit) {
    const { domain } = parseId(id);
    const have = listSites(domain).map((s) => s.id);
    throw Object.assign(new Error(`没有站点函数 ${id}。${have.length ? `这个站有：${have.join('、')}` : '这个站还没有任何函数——先用 script 写一段跑通，再带 save 存下来。'}`), { code: 'NO_SITE_FN' });
  }
  const mtime = fs.statSync(hit.file).mtimeMs;
  // 带 mtime 绕开 ESM 缓存：函数被修好覆盖后，同一个进程里也拿到新版
  const mod = await import(`${pathToFileURL(hit.file).href}?v=${mtime}`);
  if (typeof mod.default !== 'function') throw Object.assign(new Error(`${hit.file} 没有 export default 函数`), { code: 'BAD_SITE_FN' });
  return { fn: mod.default, ...hit };
}

// 把一段刚跑通的脚本存成站点函数。脚本体原样放进函数里，用到的 args.xxx 就是参数。
export function saveSite({ id, doc, args, code }) {
  const { domain, name } = parseId(id);
  const file = path.join(LOCAL_SITES, domain, `${name}.js`);
  const head = [
    `// @doc ${String(doc || '').replace(/\n/g, ' ').trim() || '(没写说明)'}`,
    args ? `// @args ${typeof args === 'string' ? args : JSON.stringify(args)}` : null,
    `// @saved ${new Date().toISOString().slice(0, 10)}`,
    '// 由 script({save}) 生成：这段代码在真实页面上跑通过一次才会被存下来。改它就是改这个文件，或再 save 一次覆盖。',
  ].filter(Boolean).join('\n');
  const body = String(code).replace(/\r\n/g, '\n').split('\n').map((l) => (l ? '  ' + l : l)).join('\n');
  const src = `${head}\nexport default async function ({ page, browser, args = {}, state, sites, log, sleep, expect }) {\n${body}\n}\n`;
  let previous = null;
  if (fs.existsSync(file)) {
    previous = file.replace(/\.js$/, `.prev.${Date.now()}.js.txt`);
    fs.copyFileSync(file, previous);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, src);
  return { file, previous };
}
