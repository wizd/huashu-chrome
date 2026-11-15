// script 工具的执行器 —— 模型写程序，程序操作浏览器，结果和证据回到模型。
//
// 闭环的三段：
//   出：模型的代码在这里跑，通过 page 对象渗透进浏览器（每个方法一条扩展命令）。
//   回：不论成败，交回的都是「结果 + 日志 + 每一步轨迹」；失败时再加出错行、页面现状诊断、
//       自动截图——模型拿到就能判断错在哪、改哪一行，而不是重新摸索。
//   存：跑通的代码带 save 存进站点函数库（sites.js），下次一行调用；失败时战绩记一笔，提示修。
//
// 状态：同一个 MCP 会话里，`state` 对象跨 script 调用保留（像一个 REPL），
// 长任务（上传大视频、等转码）可以 background:true 放到后台，用 job 查进度，不占模型回合。
//
// 安全边界：这段代码跑在本机 MCP 进程里，权限等同于 agent 已经有的 shell——
// node:vm 在这里是为了给代码一个干净的作用域、拿到准确的行号，不是沙箱。
// 云端通道不用这条路（见 extension/cloud-policy.js：云端拿不到 eval）。
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { Page, ScriptError } from './page.js';
import { HOME } from './paths.js';
import { loadSite, saveSite, recordRun, listSites, locate } from './sites.js';

const FG_MAX = 590000;            // 前台最多等这么久，宿主的工具调用超时一般在 10 分钟上下
const BG_MAX = 30 * 60 * 1000;    // 后台任务的硬上限
const OUT_MAX = 12000;            // 结果交回模型的字符上限

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 等 p 完成，最多 ms 毫秒；返回是否完成。计时器用完就清，不让它吊着进程。
async function within(p, ms) {
  let t;
  const timer = new Promise((r) => { t = setTimeout(() => r(false), ms); });
  try { return await Promise.race([p.then(() => true, () => true), timer]); } finally { clearTimeout(t); }
}

function fmt(v) {
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
const clip = (s, n = OUT_MAX) => (s.length > n ? s.slice(0, n) + `\n…（还有 ${s.length - n} 字符没放进来；只返回需要的字段，或写进文件再读）` : s);

// 从错误栈里找出脚本自己的行号（包装函数占了 1 行）
function userLine(err, code, file) {
  const m = new RegExp(`${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:(\\d+)`).exec(String(err?.stack || ''));
  if (!m) return null;
  const n = Number(m[1]) - 1;
  const lines = code.split('\n');
  return n >= 1 && n <= lines.length ? { n, text: lines[n - 1].trim() } : null;
}

const WRITE_OPS = new Set(['click', 'fill', 'type', 'press', 'check', 'uncheck', 'setInputFiles']);

function traceText(trace, max = 25) {
  const rows = trace.length > max ? [`  …前 ${trace.length - max} 步省略`, ...trace.slice(-max)] : trace;
  return rows.map((t) => (typeof t === 'string' ? t
    : `  ${t.ok === false ? '✗' : '✓'} ${String(t.i).padStart(2)}. ${t.op} ${t.target}${t.ms != null ? ` (${t.ms}ms)` : ''}${t.note ? ` → ${t.note}` : ''}`)).join('\n');
}

export class ScriptRunner {
  // bridge: BridgeClient；wrap: 把页面来的文本裹进 untrusted 边界
  constructor(bridge, { wrap = (s) => s } = {}) {
    this.bridge = bridge;
    this.wrap = wrap;
    this.state = {};          // 跨调用保留
    this.jobs = new Map();
    this.seq = 0;
  }

  // 入口：一次 script 工具调用
  async handle(args = {}) {
    if (args.job) return this.jobStatus(args);
    if (args.list !== undefined) return this.listText(args.list);
    if (!args.code && !args.run) throw new ScriptError('script 需要 code（一段 JS）或 run（站点函数 id）', 'BAD_PARAMS');
    if (args.save && !args.code) throw new ScriptError('save 只能和 code 一起用：存的是这次跑通的代码', 'BAD_PARAMS');

    const job = this.start(args);
    if (args.background) {
      return `▶ 已在后台运行，任务号 ${job.id}。用 script({job:"${job.id}", wait:60000}) 等结果（最多等这么久，跑完立刻返回），`
        + `{job, cancel:true} 取消。期间可以做别的事。`;
    }
    const limit = Math.min(Number(args.timeout) || 120000, FG_MAX);
    const done = await within(job.promise, limit);
    if (!done) {
      return `⏳ ${Math.round(limit / 1000)} 秒还没跑完，转为后台任务 ${job.id}（没有取消，仍在跑）。`
        + `用 script({job:"${job.id}", wait:60000}) 继续等，不要重新提交同一段代码——会做两遍。\n\n`
        + `到目前为止：\n${traceText(job.trace, 10)}`;
    }
    return job.text;
  }

  start(args) {
    const id = `j${++this.seq}`;
    const ac = new AbortController();
    const trace = [];
    const logs = [];
    const job = { id, status: 'running', startedAt: Date.now(), trace, logs, ac, text: '' };
    job.promise = this.exec(args, job).then((text) => { job.text = text; job.status = job.status === 'running' ? 'done' : job.status; });
    if (args.background) {
      const t = setTimeout(() => ac.abort(), Math.min(Number(args.timeout) || BG_MAX, BG_MAX));
      job.promise.finally(() => clearTimeout(t));
    }
    this.jobs.set(id, job);
    // 只留最近 20 个
    if (this.jobs.size > 20) this.jobs.delete(this.jobs.keys().next().value);
    return job;
  }

  async jobStatus({ job: id, wait = 0, cancel }) {
    const job = this.jobs.get(id);
    if (!job) return `没有任务 ${id}（只保留本会话最近 20 个）`;
    if (cancel && job.status === 'running') {
      job.ac.abort();
      job.status = 'cancelled';
      await within(job.promise, 5000);
      return `已取消 ${id}。取消发生在两步之间，已完成的步骤不会撤回：\n${traceText(job.trace)}`;
    }
    if (job.status === 'running' && wait > 0) await within(job.promise, Math.min(Number(wait), FG_MAX));
    if (job.status === 'running') {
      return `⏳ ${id} 还在跑（${Math.round((Date.now() - job.startedAt) / 1000)} 秒）。最近几步：\n${traceText(job.trace, 6)}`
        + (job.logs.length ? `\n日志：\n${job.logs.slice(-5).join('\n')}` : '');
    }
    return job.text;
  }

  listText(domain) {
    const list = listSites(domain || undefined);
    if (!list.length) return domain ? `${domain} 还没有站点函数。` : '还没有任何站点函数。';
    return list.map((s) => `${s.id}${s.doc ? ` — ${s.doc}` : ''}${s.stats.runs ? `（${s.stats.ok || 0}/${s.stats.runs}）` : ''}`).join('\n');
  }

  // 给脚本用的全局对象
  scope(job, args) {
    const bridge = this.bridge;
    const trace = job.trace;
    const signal = job.ac.signal;
    const mk = (tabId) => new Page(bridge, { tabId, trace, signal });
    const page = mk(args.tabId);
    const log = (...a) => {
      const line = a.map((x) => (typeof x === 'string' ? x : fmt(x))).join(' ');
      job.logs.push(line.length > 2000 ? line.slice(0, 2000) + '…' : line);
    };
    const browser = {
      // 后台开一个新标签页，返回绑定它的 page
      async newPage(url, { label } = {}) {
        const r = await bridge.call('tabs', { action: 'new', label: label || 'script' }, {});
        const p = mk(r.tabId);
        trace.push({ i: trace.length + 1, op: 'newPage', target: `[${r.tabId}] ${label || ''}`, ok: true });
        if (url) await p.goto(url);
        return p;
      },
      page: (tabId) => mk(tabId),
      async close(p) { await bridge.call('tabs', { action: 'close', tabId: p.tabId }, {}); },
    };
    const runner = this;
    const sites = {
      // 调用一个站点函数；opts.page 不给就用脚本的默认 page
      async run(id, fnArgs = {}, opts = {}) {
        const { fn, file } = await loadSite(id);
        trace.push(`  ── 进入站点函数 ${id}`);
        try {
          const v = await fn({ ...scopeObj, page: opts.page || page, args: fnArgs });
          recordRun(file, true);
          trace.push(`  ── ${id} 完成`);
          return v;
        } catch (e) {
          const st = recordRun(file, false, `[${e.code || 'ERR'}] ${e.message}`);
          e.siteFn = { id, file, stats: st };
          throw e;
        }
      },
      list: (domain) => listSites(domain),
      source: (id) => { const h = locate(id); return h ? fs.readFileSync(h.file, 'utf8') : null; },
      _runner: runner,
    };
    const expect = (cond, msg = '断言失败') => { if (!cond) throw new ScriptError(msg, 'ASSERT'); };
    const scopeObj = { page, browser, state: this.state, sites, log, sleep: (ms) => sleep(ms), expect, args: args.args || {} };
    return scopeObj;
  }

  async exec(args, job) {
    const t0 = Date.now();
    const s = this.scope(job, args);
    const file = `script-${job.id}.js`;
    const code = String(args.code || '');
    let value; let error;
    let siteFile = null;
    try {
      if (args.run) {
        // 直接调用站点函数
        const { fn, file: f } = await loadSite(args.run);
        siteFile = f;
        value = await fn({ ...s, args: args.args || {} });
        recordRun(f, true);
      } else {
        const ctx = vm.createContext({
          ...s, console: { log: s.log, info: s.log, warn: s.log, error: s.log },
          URL, URLSearchParams, setTimeout, clearTimeout, TextEncoder, TextDecoder, structuredClone, fs, path,
        });
        const script = new vm.Script(`(async () => {\n${code}\n})()`, { filename: file });
        value = await script.runInContext(ctx);
      }
    } catch (e) {
      error = e;
      if (siteFile) {
        const st = recordRun(siteFile, false, `[${e.code || 'ERR'}] ${e.message}`);
        e.siteFn = { id: args.run, file: siteFile, stats: st };
      }
    }
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    const steps = job.trace.filter((t) => typeof t !== 'string').length;
    const logs = job.logs.length ? `\n\n日志：\n${this.wrap(clip(job.logs.join('\n'), 4000))}` : '';

    if (!error) {
      let saved = '';
      if (args.save) {
        const sv = typeof args.save === 'string' ? { id: args.save } : args.save;
        try {
          const r = saveSite({ id: sv.id, doc: sv.doc || args.doc, args: sv.args || args.args, code });
          saved = `\n\n💾 已存成站点函数 ${sv.id} → ${r.file}${r.previous ? `（旧版备份在 ${r.previous}）` : ''}。`
            + `下次 script({run:"${sv.id}", args:{…}}) 一行跑完；learnings(domain) 会列出它。`;
        } catch (e) { saved = `\n\n⚠️ 没存成站点函数：${e.message}`; }
      }
      const res = value === undefined ? '' : `\n\n结果：\n${this.wrap(clip(fmt(value)))}`;
      return `✅ 完成（${secs}s，${steps} 步）${res}${logs}\n\n轨迹：\n${traceText(job.trace)}${saved}`;
    }

    // ---- 失败：把能交回的证据全交回去 ----
    if (job.status === 'cancelled' || error.code === 'CANCELLED') job.status = 'cancelled';
    else job.status = 'failed';
    const where = userLine(error, code, file);
    const failed = [...job.trace].reverse().find((t) => typeof t !== 'string' && t.ok === false);
    const parts = [`❌ 失败（${secs}s，${steps} 步）：[${error.code || error.name || 'ERR'}] ${error.message}`];
    if (where) parts.push(`出错位置：第 ${where.n} 行  ${where.text}`);
    if (failed) parts.push(`卡在第 ${failed.i} 步：${failed.op} ${failed.target}`);
    if (error.siteFn) {
      const st = error.siteFn.stats || {};
      parts.push(`这是站点函数 ${error.siteFn.id}（${error.siteFn.file}），战绩 ${st.ok || 0}/${st.runs || 0}${st.consecutiveFails > 1 ? `，已连续失败 ${st.consecutiveFails} 次——站点多半改版了` : ''}。`
        + `读源码，用 script 改好跑通，再带 save:"${error.siteFn.id}" 覆盖。`);
    }
    const writes = job.trace.filter((t) => typeof t !== 'string' && t.ok && WRITE_OPS.has(t.op));
    if (writes.length) parts.push(`⚠️ 已经成功做过 ${writes.length} 个写操作（见轨迹 ✓）。修好后从失败处续做，别把提交类动作重做一遍。`);
    parts.push(`轨迹：\n${traceText(job.trace)}`);

    // 页面现状 + 截图：模型不用再花一个回合去看
    if (error.code !== 'CANCELLED' && error.code !== 'NO_SITE_FN' && this.bridge.ws !== null) {
      const page = new Page(this.bridge, { tabId: args.tabId });
      const diag = error.diag || await withTimeout(page.diagnose(), 8000).catch(() => null);
      if (diag) {
        const d = [`地址：${diag.url}`, `标题：${diag.title}`];
        if (diag.hidden) d.push('标签页在后台（document.hidden=true）：命中测试和 innerText 不可靠，优先用 textContent、页面内点击');
        if (diag.dialogs?.length) d.push(`弹窗：${diag.dialogs.join(' | ')}`);
        if (diag.toasts?.length) d.push(`提示：${diag.toasts.join(' | ')}`);
        if (diag.errors?.length) d.push(`报错文字：${diag.errors.join(' | ')}`);
        parts.push(`页面现状：\n${this.wrap(d.join('\n'))}`);
      }
      if (args.shot !== false) {
        try {
          const dir = path.join(HOME, 'shots');
          fs.mkdirSync(dir, { recursive: true });
          const out = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`);
          await withTimeout(page.screenshot({ path: out }), 10000);
          parts.push(`失败时的截图：${out}（需要看布局时 Read 它）`);
        } catch { /* 截不了就算了 */ }
      }
    }
    return parts.join('\n\n') + logs;
  }
}

function withTimeout(p, ms) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}
