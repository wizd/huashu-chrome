// HTTP 网关 —— 把站点函数变成本机 HTTP API（webapp → API）。
//
// 动机：flow2api 这类项目是逆向一个网站的协议，再伪造身份去调它——打码、指纹、cookie 同步，
// 3.7 万行代码大半在对付风控，网站一改版就停摆。这里反过来：请求由用户自己的 Chrome、
// 在网站自己的页面里发出，身份天然是真的；网站改了界面，只需修那一个站点函数。
//
// 能力声明写在站点函数头部（见 sites.js meta）：
//   // @capability video.generate
//   // @requires google-account
//   // @home https://flow.google.com/
// 「能力在不在」只看前提成不成立：登录了 Google 账号，就意味着 Flow 可用。
// 前提在网关为该站开的工作标签页里核验，读的是页面自己已有的状态，不额外请求 Google
// ——实测从扩展后台直接请求 myaccount.google.com 会被判成异常流量。
//
// 接口（全部要 Authorization: Bearer <api token>，token 见 ~/.vcorp-chrome/api.json）：
//   GET    /v1/capabilities[?refresh=1]       有哪些能力、各自是否可用
//   POST   /v1/jobs {capability|fn, args}     提交任务，立即返回 202 + 任务号
//   GET    /v1/jobs[/:id][?wait=ms]            查任务；wait 长轮询到完成或超时
//   DELETE /v1/jobs/:id                        取消
//   GET    /v1/jobs/:id/files/:name            取产物
// 另有 flow2api 兼容层（OpenAI /v1/chat/completions、/v1/models，Gemini /v1beta/models/*:generateContent），
// 见 gateway-compat.js。为了兼容那些客户端，token 也可以放在 x-goog-api-key 头或 ?key= 里。
//
// 并发：每个站一个工作标签页、一条串行队列——一个账号本来就只有一个浏览器身份，
// 并发提交只会让页面状态互相踩。要更多吞吐就多开 Chrome profile，不是多开线程。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { BridgeClient } from './rpc.js';
import { ScriptRunner } from './script.js';
import { Page } from './page.js';
import { listSites, loadSite, recordRun } from './sites.js';
import { HOME, ensureHome, newToken, tokenEquals } from './paths.js';
import { createCompat, compatError } from './gateway-compat.js';

export const OUT_DIR = process.env.VCORP_CHROME_OUT_DIR || path.join(HOME, 'out');
export const API_FILE = path.join(HOME, 'api.json');
const CHECK_TTL = 10 * 60 * 1000;      // 前提核验结果的缓存时间
const JOB_MAX_MS = 30 * 60 * 1000;     // 单个任务的硬上限
const CLIENT_IDLE_MS = 10 * 60 * 1000; // 没任务时断开内部连接，别挡住桥的空闲退出
const BODY_MAX = 1024 * 1024;
const KEEP_JOBS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// API token 和桥的 token 分开：桥的每次启动都轮换，外部程序没法长期持有。
function readApiFile() {
  try { return JSON.parse(fs.readFileSync(API_FILE, 'utf8')) || {}; } catch { return {}; }
}
function writeApiFile(obj) {
  ensureHome();
  fs.writeFileSync(API_FILE, JSON.stringify(obj, null, 2), { mode: 0o600 });
}

export function apiToken() {
  const cfg = readApiFile();
  if (typeof cfg.token === 'string' && cfg.token.length >= 32) return cfg.token;
  const token = newToken();
  writeApiFile({ ...cfg, token });
  return token;
}

// 前提核验器。page 是该站的工作标签页，已经打开在 @home 上。
// 返回 {ok, account?, reason?}；页面还没渲染出来就多等一会儿。
const REQUIREMENTS = {
  'google-account': async (page) => {
    for (let i = 0; i < 20; i++) {
      const r = await page.evaluate(() => {
        if (/(^|\.)accounts\.google\.com$/.test(location.hostname)) return { ok: false, reason: '页面跳到了 Google 登录页' };
        const el = document.querySelector('[aria-label^="Google Account:"]');
        if (!el) return null;
        const m = /\(([^)\s]+@[^)\s]+)\)/.exec(el.getAttribute('aria-label') || '');
        return { ok: true, account: m ? m[1] : undefined };
      }).catch(() => null);
      if (r) return r;
      await sleep(750);
    }
    return { ok: false, reason: '页面上找不到 Google 账号按钮（多半没登录，或页面没加载出来）' };
  },
};

// makeClient：测试里换成假的，别让单元测试去连（甚至拉起）真桥
const realClient = () => new BridgeClient({ client: 'http-gateway', sessionId: 'gateway:http', label: 'HTTP API' });

export function createGateway({ log = () => {}, touch = () => {}, token = apiToken(), makeClient = realClient } = {}) {
  let client = null;
  let clientIdle = null;
  const tabs = new Map();      // domain → tabId
  const queues = new Map();    // domain → 串行队列的尾巴
  const checks = new Map();    // `${domain}|${req}` → {ok, account, reason, at}
  const jobs = new Map();
  const busy = new Set();      // 正在跑任务的站
  let running = 0;

  async function getClient() {
    clearTimeout(clientIdle);
    if (client?.ws) return client;
    client = makeClient();
    await client.connect();
    return client;
  }
  function releaseClientLater() {
    clearTimeout(clientIdle);
    clientIdle = setTimeout(() => { if (!running && client) { client.close(); client = null; } }, CLIENT_IDLE_MS);
    clientIdle.unref?.();
  }

  // 每个站一个工作标签页。用户把它关了也没关系，下次自动重开。
  async function workPage(domain, home, signal) {
    const c = await getClient();
    const id = tabs.get(domain);
    if (id) {
      const p = new Page(c, { tabId: id, signal });
      let alive = false;
      try { await p.url(); alive = true; } catch { tabs.delete(domain); }
      if (alive) return ensureNet(p);
    }
    const r = await c.call('tabs', { action: 'new', url: home || `https://${domain}/`, label: `API · ${domain}` }, { timeoutMs: 60000 });
    tabs.set(domain, r.tabId);
    log(`网关为 ${domain} 开了工作标签页 [${r.tabId}]`);
    return ensureNet(new Page(c, { tabId: r.tabId, signal }));
  }

  // 站点函数靠 waitForResponse 读结果，页面上必须有网络记录钩子。钩子是扩展按站动态注册的，
  // 扩展一重载就没了（2026-11-14 实测：重载后两个任务都已提交生成、却读不到结果）。
  // 没有就让扩展注册并刷新一次页面——和 page.goto 首次进站做的是同一件事。
  async function ensureNet(p) {
    if ((await p._in('netLen').catch(() => -1)) >= 0) return p;
    await p._cmd('network', {}, 60000).catch(() => {});
    for (let i = 0; i < 40 && (await p._in('netLen').catch(() => -1)) < 0; i++) await sleep(500);
    if ((await p._in('netLen').catch(() => -1)) < 0) {
      throw Object.assign(new Error('工作标签页装不上网络记录钩子，读不到结果，没有提交任何生成'), { code: 'NO_NET_HOOK' });
    }
    return p;
  }

  function fnDomain(id) { return id.split('/')[0]; }

  async function checkRequirements(fn, page, { refresh = false } = {}) {
    const domain = fnDomain(fn.id);
    const out = [];
    for (const req of fn.requires) {
      const key = `${domain}|${req}`;
      let c = checks.get(key);
      if (refresh || !c || Date.now() - c.at > CHECK_TTL) {
        const checker = REQUIREMENTS[req];
        if (!checker) c = { ok: false, reason: `网关不认识前提 ${req}` };
        else {
          const p = page || await workPage(domain, fn.home);
          c = await checker(p).catch((e) => ({ ok: false, reason: e.message }));
        }
        c.at = Date.now();
        checks.set(key, c);
      }
      out.push({ requirement: req, ...c, at: new Date(c.at).toISOString() });
    }
    return out;
  }

  // 能力目录：同一种能力可以由多个站提供，按顺序列出
  async function capabilities({ refresh = false } = {}) {
    const fns = listSites().filter((s) => s.capabilities.length);
    const rows = [];
    for (const fn of fns) {
      let reqs = [];
      let error;
      const domain = fnDomain(fn.id);
      // 这个站正在跑任务：别排在一个几分钟的视频后面，用上次核验的结果
      if (busy.has(domain)) {
        reqs = fn.requires.map((r) => {
          const c = checks.get(`${domain}|${r}`);
          return c ? { requirement: r, ...c, at: new Date(c.at).toISOString() } : { requirement: r, ok: null, reason: '该站正在跑任务，稍后再查' };
        });
      } else {
        try { reqs = await enqueue(domain, () => checkRequirements(fn, null, { refresh })); } catch (e) { error = e.message; }
      }
      const ok = !error && reqs.every((r) => r.ok);
      for (const cap of fn.capabilities) {
        rows.push({
          capability: cap, fn: fn.id, available: ok, doc: fn.doc, args: fn.args,
          account: reqs.find((r) => r.account)?.account,
          requires: reqs.map(({ requirement, ok: o, reason, at }) => ({ requirement, ok: o, reason, checkedAt: at })),
          ...(error ? { reason: error } : {}),
          stats: { runs: fn.stats.runs || 0, ok: fn.stats.ok || 0, lastOk: fn.stats.lastOk },
        });
      }
    }
    return rows;
  }

  function enqueue(domain, task) {
    const prev = queues.get(domain) || Promise.resolve();
    const p = prev.catch(() => {}).then(task);
    queues.set(domain, p.catch(() => {}));
    return p;
  }

  function publicJob(j) {
    const { ac, onDone, ...rest } = j;
    return rest;
  }
  function finishHook(j) {
    const f = j.onDone; j.onDone = null;
    try { f?.(j); } catch { /* 清理失败不影响任务 */ }
  }
  function cancel(id) {
    const job = jobs.get(id);
    if (!job) return null;
    if (job.status === 'queued') { job.status = 'cancelled'; job.finishedAt = new Date().toISOString(); persist(job); finishHook(job); }
    else if (job.status === 'running') job.ac.abort();
    return job;
  }
  function persist(j) {
    try {
      fs.mkdirSync(path.join(OUT_DIR, j.id), { recursive: true });
      fs.writeFileSync(path.join(OUT_DIR, j.id, 'job.json'), JSON.stringify(publicJob(j), null, 2));
    } catch { /* 落盘失败不影响内存里的状态 */ }
  }
  function loadJob(id) {
    if (jobs.has(id)) return jobs.get(id);
    if (!/^[a-z0-9-]{8,64}$/.test(id)) return null;
    try { return JSON.parse(fs.readFileSync(path.join(OUT_DIR, id, 'job.json'), 'utf8')); } catch { return null; }
  }

  function submit({ capability, fn: fnId, args = {}, onDone }) {
    const all = listSites();
    let fn;
    if (fnId) fn = all.find((s) => s.id === fnId);
    else if (capability) {
      const cands = all.filter((s) => s.capabilities.includes(capability));
      // 前提已知不成立的往后排，没核验过的照样可选
      fn = cands.find((s) => s.requires.every((r) => checks.get(`${fnDomain(s.id)}|${r}`)?.ok !== false)) || cands[0];
    }
    if (!fn) {
      const known = [...new Set(all.flatMap((s) => s.capabilities))];
      throw httpErr(404, 'NO_CAPABILITY', fnId ? `没有站点函数 ${fnId}` : `没有能力 ${capability}。现有：${known.join('、') || '（无）'}`);
    }
    if (!fn.capabilities.length) throw httpErr(403, 'NOT_EXPOSED', `${fn.id} 没有声明 @capability，不对外开放`);
    if (typeof args !== 'object' || Array.isArray(args)) throw httpErr(400, 'BAD_ARGS', 'args 必须是对象');

    const id = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(5).toString('hex')}`;
    const job = {
      id, capability: capability || fn.capabilities[0], fn: fn.id, args, status: 'queued',
      createdAt: new Date().toISOString(), ac: new AbortController(), onDone: typeof onDone === 'function' ? onDone : null,
    };
    jobs.set(id, job);
    if (jobs.size > KEEP_JOBS) for (const [k, v] of jobs) { if (v.status !== 'running' && v.status !== 'queued') { jobs.delete(k); break; } }
    persist(job);
    enqueue(fnDomain(fn.id), () => execute(job, fn));
    return job;
  }

  async function execute(job, fn) {
    if (job.status === 'cancelled') return finishHook(job);
    running++;
    busy.add(fnDomain(fn.id));
    touch();
    job.status = 'running';
    job.startedAt = new Date().toISOString();
    persist(job);
    const t0 = Date.now();
    const hard = setTimeout(() => job.ac.abort(), JOB_MAX_MS);
    const outDir = path.join(OUT_DIR, job.id);
    const ctx = { trace: [], logs: [], ac: job.ac };
    let file;
    try {
      const page = await workPage(fnDomain(fn.id), fn.home, job.ac.signal);
      const reqs = await checkRequirements(fn, page);
      const bad = reqs.find((r) => !r.ok);
      if (bad) throw Object.assign(new Error(`前提不成立：${bad.requirement}（${bad.reason || '未知原因'}）`), { code: 'REQUIREMENT' });
      job.account = reqs.find((r) => r.account)?.account;
      page.trace = ctx.trace;   // 函数的每一步记进这个任务的轨迹，失败时随结果交回

      const loaded = await loadSite(fn.id);
      file = loaded.file;
      const scope = new ScriptRunner(client).scope(ctx, { tabId: page.tabId, args: {} });
      // outDir 由网关定，不让 HTTP 调用方指定本机路径
      const value = await loaded.fn({ ...scope, page, args: { ...job.args, outDir } });
      recordRun(file, true);
      job.status = 'done';
      job.result = value;
    } catch (e) {
      if (file) recordRun(file, false, `[${e.code || 'ERR'}] ${e.message}`);
      job.status = job.ac.signal.aborted ? 'cancelled' : 'failed';
      job.error = { code: e.code || 'ERR', message: String(e.message).slice(0, 1000) };
      // 前提核验失败后清缓存，下一次重新看（用户可能刚登录）
      if (e.code === 'REQUIREMENT' || e.code === 'NOT_LOGGED_IN') for (const r of fn.requires) checks.delete(`${fnDomain(fn.id)}|${r}`);
    } finally {
      clearTimeout(hard);
      running--;
      busy.delete(fnDomain(fn.id));
      job.finishedAt = new Date().toISOString();
      job.secs = (Date.now() - t0) / 1000;
      job.logs = ctx.logs.slice(-20);
      job.trace = ctx.trace.filter((t) => typeof t !== 'string').slice(-15)
        .map((t) => `${t.ok === false ? '✗' : '✓'} ${t.op} ${t.target}${t.note ? ` → ${t.note}` : ''}`.slice(0, 300));
      job.files = listFiles(job.id);
      finishHook(job);
      persist(job);
      touch();
      releaseClientLater();
    }
  }

  function listFiles(id) {
    let names = [];
    try { names = fs.readdirSync(path.join(OUT_DIR, id)).filter((n) => n !== 'job.json'); } catch { /* 没有产物 */ }
    return names.map((name) => ({
      name, bytes: fs.statSync(path.join(OUT_DIR, id, name)).size,
      url: `/v1/jobs/${id}/files/${encodeURIComponent(name)}`,
    }));
  }

  async function waitJob(job, ms) {
    const until = Date.now() + Math.min(Math.max(Number(ms) || 0, 0), 590000);
    while ((job.status === 'queued' || job.status === 'running') && Date.now() < until) await sleep(500);
  }

  // ---------------- HTTP ----------------

  // mediaId → 某个任务目录里下好的文件。先看内存里的任务，再扫磁盘上的任务目录（桥重启过也找得到）
  function findMedia(mediaId) {
    for (const j of jobs.values()) if (j.result?.mediaId === mediaId && j.result.file && fs.existsSync(j.result.file)) return j.result.file;
    let dirs = [];
    try { dirs = fs.readdirSync(OUT_DIR).sort().reverse().slice(0, 500); } catch { return null; }
    for (const d of dirs) {
      let names = [];
      try { names = fs.readdirSync(path.join(OUT_DIR, d)); } catch { continue; }
      const hit = names.find((n) => n.startsWith(`${mediaId}.`));
      if (hit) return path.join(OUT_DIR, d, hit);
    }
    return null;
  }

  const compat = createCompat({ submit, cancel, readJson, json, findMedia, log });

  async function handle(req, res) {
    touch();
    let parts = [];
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      // 网页不许调：浏览器发起的请求一定带 Origin（含 DNS rebinding 过来的），本机程序不带
      if (req.headers.origin) throw httpErr(403, 'FORBIDDEN_ORIGIN', '不接受浏览器网页发起的请求');
      // token 三种放法：Authorization: Bearer（OpenAI）、x-goog-api-key 头或 ?key=（Gemini SDK）
      const got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '') || String(req.headers['x-goog-api-key'] || '') || url.searchParams.get('key') || '';
      if (!tokenEquals(got, token)) throw httpErr(401, 'BAD_TOKEN', `缺少或错误的 API token（Authorization: Bearer / x-goog-api-key / ?key=）。token 在 ${API_FILE}`);

      if (await compat.handle(req, res, url, parts)) return;
      if (parts[0] !== 'v1') throw httpErr(404, 'NOT_FOUND', '接口在 /v1、/v1beta 下');

      if (parts[1] === 'capabilities' && req.method === 'GET') {
        return json(res, 200, { capabilities: await capabilities({ refresh: url.searchParams.has('refresh') }) });
      }

      if (parts[1] === 'jobs') {
        if (parts.length === 2 && req.method === 'POST') {
          const job = submit(await readJson(req));
          return json(res, 202, publicJob(job));
        }
        if (parts.length === 2 && req.method === 'GET') {
          return json(res, 200, { jobs: [...jobs.values()].reverse().map(publicJob) });
        }
        const job = loadJob(parts[2]);
        if (!job) throw httpErr(404, 'NO_JOB', `没有任务 ${parts[2]}`);
        if (parts.length === 3 && req.method === 'GET') {
          if (url.searchParams.has('wait') && job.ac) await waitJob(job, url.searchParams.get('wait'));
          return json(res, 200, publicJob(job));
        }
        if (parts.length === 3 && req.method === 'DELETE') {
          return json(res, 200, publicJob(cancel(job.id) || job));
        }
        if (parts.length === 5 && parts[3] === 'files' && req.method === 'GET') {
          const name = path.basename(parts[4]);
          const f = path.join(OUT_DIR, job.id, name);
          if (name === 'job.json' || !fs.existsSync(f)) throw httpErr(404, 'NO_FILE', `任务 ${job.id} 没有文件 ${name}`);
          res.writeHead(200, { 'content-type': mime(name), 'content-length': fs.statSync(f).size });
          return fs.createReadStream(f).pipe(res);
        }
      }
      throw httpErr(404, 'NOT_FOUND', `${req.method} ${url.pathname} 不存在`);
    } catch (e) {
      const status = e.status || 500;
      if (status === 500) log(`网关出错：${e.stack || e.message}`);
      if (res.headersSent) { try { res.end(); } catch { /* 连接已断 */ } return; }
      const body = parts[0] === 'v1' && parts[1] !== 'chat' && parts[1] !== 'models'
        ? { error: { code: e.code || 'INTERNAL', message: e.message } }
        : compatError(parts, status, e.code || 'INTERNAL', e.message);
      return json(res, status, body);
    }
  }

  return { handle, capabilities, submit, cancel, jobs, close: () => { clearTimeout(clientIdle); client?.close(); client = null; } };
}

function httpErr(status, code, message) { return Object.assign(new Error(message), { status, code }); }

function json(res, status, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) });
  res.end(body);
}

function readJson(req, max = BODY_MAX) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > max) { reject(httpErr(413, 'TOO_LARGE', `请求体超过 ${Math.round(max / 1048576)}MB`)); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(httpErr(400, 'BAD_JSON', '请求体不是合法 JSON')); }
    });
    req.on('error', reject);
  });
}

function mime(name) {
  const ext = path.extname(name).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json',
    '.txt': 'text/plain; charset=utf-8' }[ext] || 'application/octet-stream';
}
