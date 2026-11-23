// 哨兵运行器 —— 按服务器下发、用户确认过的规则，定期用这个浏览器的登录看一眼目标网页或接口，
// 有新条目就报给服务器（type:'event'），服务器再叫醒任务去处理。约定见 opus-video-maker
// docs/TRIGGERS.md 第 11 节；规矩（什么规则能收、什么能出门）全在 watch-policy.js。
//
// 为什么在扩展里跑、不在服务器上跑：要看的是用户登录后才看得到的东西，cookie 不能离开浏览器。
// 为什么不调模型：「有没有新东西」是确定的比对，几乎零成本；只有真有事才花积分叫醒 agent。
//
// 存储：storage.local 的 cloudWatches = { master, list: { [id]: W } }，W 见 blank()。
// 驱动：background 的 30 秒 alarm 调 tickWatches()；服务器的 watch_check / 用户点「立即检查」直接跑一次。
// 可靠性：事件至少送达一次。没收到 event_ack 的留在 W.unacked，重连（welcome）后按 seq 顺序重发。

import * as wp from './watch-policy.js';
import { hostOf, hostMatches } from './cloud-policy.js';

const KEY = 'cloudWatches';
const GROUP_TITLE = 'vcorp 值守';
const UNACKED_MAX = 200;       // 离线太久时最多攒这么多个事件，再多丢最旧的
const RUNS_MAX = 50;           // 服务器回报的执行记录
const BATCHES_MAX = 50;        // 本机记的上报批次
const KEEP_MS = 7 * 864e5;     // 记录最多留 7 天
const STATE_BEAT_MS = 3600e3;  // 状态没变化也至少一小时报一次
const FETCH_MS = 20000;

let deps = null;               // { send(msg), raise(id, opts), settle(id), log(entry), paired() }
let lock = Promise.resolve();
const running = new Set();     // 正在检查的哨兵
const siteLast = new Map();    // 网站 → 上次检查开始的时间（同一网站至少隔开 WATCH_SITE_GAP_MS）

export function initWatches(d) { deps = d; }

// 读改写串行：服务器消息、alarm、侧栏操作会同时到
function serial(fn) {
  const run = lock.then(fn, fn);
  lock = run.catch(() => {});
  return run;
}
async function load() {
  const { [KEY]: v } = await chrome.storage.local.get(KEY);
  return { master: v?.master !== false, list: v?.list && typeof v.list === 'object' ? v.list : {} };
}
const save = (st) => chrome.storage.local.set({ [KEY]: st });
async function edit(fn) {
  return serial(async () => {
    const st = await load();
    const out = await fn(st);
    await save(st);
    return out;
  });
}

const blank = () => ({
  watch: null,          // 服务器最近一次下发、清洗过的规则
  status: 'pending',    // pending 等用户确认 | active | refused 用户拒绝 | invalid 规则不合规
  invalid: '',          // 不合规的原因
  confirmed: null,      // 用户确认过的目标 { site, url, fields }
  confirmedRev: null,
  hold: false,          // 所属任务正在运行：先不查，免得把 agent 自己的动作当成新事件
  based: false,         // 有没有基线；没有的话，下一次检查只记下现状、不上报
  seen: {},             // key → 内容指纹
  seq: 0,
  unacked: [],          // 还没收到 ack 的 event 消息
  nextAt: 0,
  failStreak: 0,
  last: null,           // { at, ok, error, count }
  sent: null,           // 最近报给服务器的状态 { ok, error, at }
  stats: { checks: 0, fails: 0, events: 0, items: 0, day: '', today: { checks: 0, fails: 0, events: 0, items: 0 } },
  batches: [],          // 本机上报的批次 { seq, at, n, preview }
  runs: [],             // 服务器回报的去向（watch_run / watch_log 的 entry）
  dirty: null,          // 用户在这里改了、服务器还没回执的设置
});

const notifyId = (id) => `hc-watch:${id}`;

// ---------- 服务器消息 ----------

export async function onWatchMessage(m) {
  const id = String(m.id || m.watch?.id || '');
  switch (m.type) {
    case 'watch_set': return watchSet(m.watch);
    case 'watch_del': return removeLocal(id, false);
    case 'watch_hold': {
      const go = await edit((st) => {
        const w = st.list[id];
        if (!w) return false;
        w.hold = !!m.hold;
        if (!m.hold && m.rebaseline) { w.based = false; w.nextAt = 0; }
        return !m.hold;
      });
      if (go) void checkSoon(id);
      return;
    }
    case 'watch_check':
      await edit((st) => { if (st.list[id]) st.list[id].nextAt = 0; });
      void checkSoon(id, { manual: true });
      return;
    case 'watch_run':
      return edit((st) => {
        const w = st.list[id];
        const e = cleanRun(m.entry);
        if (!w || !e) return;
        w.runs = [e, ...w.runs.filter((x) => x.id !== e.id)].sort((a, b) => b.at - a.at).slice(0, RUNS_MAX);
      });
    case 'watch_log':
      return edit((st) => {
        const w = st.list[id];
        if (!w) return;
        w.runs = (Array.isArray(m.entries) ? m.entries : []).map(cleanRun).filter(Boolean).sort((a, b) => b.at - a.at).slice(0, RUNS_MAX);
      });
    case 'event_ack':
      return edit((st) => {
        const w = st.list[id];
        const seq = Number(m.seq);
        if (w && Number.isFinite(seq)) w.unacked = w.unacked.filter((e) => e.seq > seq);
      });
    default:
  }
}

const RUN_STATUS = new Set(['queued', 'held', 'skipped', 'running', 'done', 'failed', 'needs_user']);
const cleanText = (v, max) => String(v ?? '').replace(/[\x00-\x1f\x7f]+/g, ' ').trim().slice(0, max);
function cleanRun(e) {
  if (!e || typeof e !== 'object' || !RUN_STATUS.has(e.status)) return null;
  const at = Number(e.at);
  return {
    id: cleanText(e.id, 80) || String(at),
    at: Number.isFinite(at) ? at : Date.now(),
    status: e.status,
    n: Number.isFinite(Number(e.n)) ? Number(e.n) : null,
    seqs: Array.isArray(e.seqs) ? e.seqs.map(Number).filter(Number.isFinite).slice(0, 50) : [],
    reason: cleanText(e.reason, 200),
    runId: cleanText(e.runId, 80),
    cost: Number.isFinite(Number(e.cost)) ? Number(e.cost) : null,
    title: cleanText(e.title, 200),
  };
}

async function watchSet(raw) {
  const out = await edit((st) => {
    const id = String(raw?.id || '');
    const count = Object.keys(st.list).filter((k) => k !== id).length;
    const chk = wp.checkWatch(raw, { count });
    if (!chk.ok) {
      if (!/^w_[A-Za-z0-9_-]{1,80}$/.test(id)) return null;
      const w = st.list[id] || blank();
      w.status = 'invalid';
      w.invalid = chk.error;
      st.list[id] = w;
      return { id, invalid: chk.error };
    }
    const nw = chk.watch;
    const w = st.list[nw.id] || blank();
    // 服务器回的旧版本（用户刚在这里改过、服务器还没看到）不盖新的
    if (w.watch && nw.rev < w.watch.rev) return null;
    const revUp = !w.watch || nw.rev > w.watch.rev;
    const wasPaused = !!w.watch?.settings?.paused;
    const detectChanged = w.watch && JSON.stringify(w.watch.detect) !== JSON.stringify(nw.detect);
    const targetChanged = w.watch && JSON.stringify(w.watch.target) !== JSON.stringify(nw.target);
    w.watch = nw;
    w.invalid = '';
    w.dirty = null;
    // 识别方法变了，旧的 key 未必还对得上：重新取基线，别把整页当成新的
    if (detectChanged || targetChanged) { w.based = false; w.seen = {}; }
    const covered = wp.targetCovered(w.confirmed, nw.target);
    if (covered) {
      if (w.status !== 'active' || (wasPaused && !nw.settings.paused)) w.nextAt = 0;
      w.status = 'active';
      w.confirmedRev = Math.max(w.confirmedRev ?? 0, nw.rev);
    } else if (w.status !== 'refused' || targetChanged || revUp) {
      w.status = 'pending';
    }
    if (!w.nextAt || detectChanged || targetChanged) w.nextAt = 0;
    st.list[nw.id] = w;
    return { id: nw.id, pending: w.status === 'pending', watch: nw, active: w.status === 'active' && !nw.settings.paused };
  });
  if (!out) return;
  if (out.invalid) {
    reportState(out.id, { ok: false, error: `规则不合规：${out.invalid}` }, true);
    return;
  }
  if (out.pending) askConfirm(out.watch);
  else deps?.settle(notifyId(out.id));
  if (out.active) void checkSoon(out.id);
}

// 新哨兵、或目标变大：自动允许管不到，一定要用户点头
function askConfirm(w) {
  const t = w.target;
  deps?.raise(notifyId(w.id), {
    type: 'basic', iconUrl: 'icons/icon128.png', priority: 2, requireInteraction: true,
    title: `新的哨兵等你确认：${w.settings.name}`,
    message: `每 ${Math.round(w.settings.every / 60)} 分钟查看 ${t.site}，只把新条目的 ${t.fields.join('、')} 发给服务器。${w.note ? `\n${w.note}` : ''}`,
    contextMessage: `任务「${w.title || w.jobId}」`,
    buttons: [{ title: '允许' }, { title: '拒绝' }],
  });
}

// 重连（welcome）之后：报上自己有哪些哨兵，补发没确认的事件、没回执的设置和确认
export async function onWelcome() {
  const st = await load();
  const list = Object.entries(st.list);
  deps?.send({ type: 'watch_list', watches: list.map(([id, w]) => ({ id, rev: w.watch?.rev ?? 0 })) });
  for (const [id, w] of list) {
    if (w.status === 'active' && w.confirmedRev != null) deps?.send({ type: 'watch_confirm', id, rev: w.confirmedRev, ok: true });
    if (w.status === 'refused') deps?.send({ type: 'watch_confirm', id, rev: w.watch?.rev ?? 0, ok: false });
    if (w.dirty) deps?.send({ type: 'watch_update', id, settings: w.dirty });
    for (const e of [...w.unacked].sort((a, b) => a.seq - b.seq)) deps?.send(e);
    if (!st.master) deps?.send({ type: 'watch_state', id, at: Date.now(), ok: false, off: true, error: '浏览器的值守总开关关着' });
  }
}

// ---------- 侧栏操作 ----------

export async function confirmWatch(id, allow, settings) {
  const out = await edit((st) => {
    const w = st.list[id];
    if (!w?.watch) return null;
    if (allow) {
      let changed = false;
      if (settings) {
        const before = JSON.stringify(w.watch.settings);
        const merged = wp.cleanWatchSettings({ ...w.watch.settings, ...settings }, w.watch.title);
        if (JSON.stringify(merged) !== before) {
          w.watch.settings = merged;
          w.dirty = merged;
          changed = true;
        }
      }
      w.confirmed = { ...w.watch.target, fields: [...w.watch.target.fields] };
      w.confirmedRev = w.watch.rev;
      w.status = 'active';
      w.based = false;
      w.nextAt = 0;
      return { rev: w.watch.rev, settings: changed ? w.dirty : null };
    }
    w.status = 'refused';
    return { rev: w.watch.rev, settings: null };
  });
  if (!out) return;
  deps?.settle(notifyId(id));
  await deps?.log({ ev: allow ? 'watch_on' : 'watch_off', job: id, msg: id });
  deps?.send({ type: 'watch_confirm', id, rev: out.rev, ok: !!allow });
  if (out.settings) deps?.send({ type: 'watch_update', id, settings: out.settings });
  if (allow) void checkSoon(id);
}

// 用户在这里改设置：本机立即生效，同时告诉服务器
function applySettings(w, patch) {
  const merged = wp.cleanWatchSettings({ ...w.watch.settings, ...patch }, w.watch.title);
  w.watch.settings = merged;
  w.dirty = merged;
  return merged;
}

export async function updateWatch(id, patch) {
  const settings = await edit((st) => {
    const w = st.list[id];
    if (!w?.watch) return null;
    const before = w.watch.settings.every;
    const s = applySettings(w, patch || {});
    if (s.every !== before) w.nextAt = Math.min(w.nextAt || 0, Date.now() + s.every * 1000);
    return s;
  });
  if (settings) deps?.send({ type: 'watch_update', id, settings });
}

export async function checkNow(id) {
  await edit((st) => { if (st.list[id]) st.list[id].nextAt = 0; });
  await checkOnce(id, { manual: true });
}

export async function rebaseline(id) {
  await edit((st) => { const w = st.list[id]; if (w) { w.based = false; w.nextAt = 0; } });
  await checkOnce(id, { manual: true });
}

export async function deleteWatch(id) { await removeLocal(id, true); }

async function removeLocal(id, byUser) {
  const had = await edit((st) => {
    if (!st.list[id]) return false;
    delete st.list[id];
    return true;
  });
  deps?.settle(notifyId(id));
  if (had && byUser) {
    deps?.send({ type: 'watch_deleted', id });
    await deps?.log({ ev: 'watch_deleted', job: id, msg: id });
  }
}

export async function setMaster(on) {
  const ids = await edit((st) => { st.master = !!on; return Object.keys(st.list); });
  for (const id of ids) {
    deps?.send(on ? { type: 'watch_state', id, at: Date.now(), ok: true, off: false }
      : { type: 'watch_state', id, at: Date.now(), ok: false, off: true, error: '浏览器的值守总开关关着' });
  }
  if (on) void tickWatches();
}

// 给侧栏的：不带「看过」表和待发事件的正文
export async function watchPanelState() {
  const st = await load();
  const now = Date.now();
  return {
    master: st.master,
    list: Object.entries(st.list).map(([id, w]) => {
      const day = w.watch ? wp.watchDay(now, w.watch.settings.tz) : '';
      const today = w.stats.day === day ? w.stats.today : { checks: 0, fails: 0, events: 0, items: 0 };
      const runsToday = w.runs.filter((r) => wp.watchDay(r.at, w.watch?.settings.tz) === day);
      return {
        id, status: w.status, invalid: w.invalid, watch: w.watch, hold: w.hold, based: w.based,
        last: w.last, failStreak: w.failStreak, nextAt: w.nextAt, unacked: w.unacked.length,
        stats: { ...w.stats, today },
        ranToday: runsToday.filter((r) => ['running', 'done', 'failed', 'needs_user'].includes(r.status)).length,
        batches: w.batches.filter((b) => now - b.at < KEEP_MS),
        runs: w.runs.filter((r) => now - r.at < KEEP_MS),
        narrowed: w.confirmed && w.watch ? !wp.targetCovered(w.confirmed, w.watch.target) : false,
      };
    }).sort((a, b) => (a.status === 'pending' ? -1 : 0) - (b.status === 'pending' ? -1 : 0) || (a.watch?.settings.name || '').localeCompare(b.watch?.settings.name || '')),
  };
}

// ---------- 检查 ----------

// alarm 每 30 秒：到点的、在时段里的哨兵逐个查。页面模式开标签页，一轮最多一个。
// 没连上服务器也照查：事件攒在 unacked 里，连上再发。没配对就不查（paired 由 cloud.js 给）。
export async function tickWatches() {
  if (!(await deps?.paired?.())) return;
  const st = await load();
  if (!st.master) return;
  const now = Date.now();
  let pages = 0;
  for (const [id, w] of Object.entries(st.list)) {
    if (w.status !== 'active' || w.hold || !w.watch || w.watch.settings.paused) continue;
    if (w.nextAt > now || !wp.watchInHours(w.watch.settings, now)) continue;
    if (w.watch.detect.mode === 'page' && pages >= 1) continue;
    if (w.watch.detect.mode === 'page') pages++;
    await checkOnce(id);
  }
}

// 服务器或用户要求的检查：不等下一轮 alarm
async function checkSoon(id, opts = {}) {
  try { await checkOnce(id, opts); } catch { /* 结果已记在状态里 */ }
}

async function checkOnce(id, { manual = false } = {}) {
  if (running.has(id)) return;
  const st = await load();
  const w0 = st.list[id];
  if (!st.master || !w0?.watch || w0.status !== 'active' || w0.hold) return;
  if (!manual && w0.watch.settings.paused) return;
  const { watch } = w0;
  const site = watch.target.site;
  const gap = Date.now() - (siteLast.get(site) || 0);
  if (!manual && gap < wp.WATCH_SITE_GAP_MS) {
    // 同一个网站刚查过：挪到下一轮，不在这里干等
    await edit((s) => { if (s.list[id]) s.list[id].nextAt = Date.now() + (wp.WATCH_SITE_GAP_MS - gap); });
    return;
  }
  running.add(id);
  siteLast.set(site, Date.now());
  const at = Date.now();
  let res;
  try {
    res = watch.detect.mode === 'api' ? await fetchApi(watch) : await readPage(watch);
  } catch (e) {
    res = { ok: false, error: String(e?.message || e).slice(0, 200) };
  } finally {
    running.delete(id);
  }
  const events = [];
  const state = await edit((s) => {
    const w = s.list[id];
    if (!w?.watch) return null;
    const day = wp.watchDay(at, w.watch.settings.tz);
    if (w.stats.day !== day) { w.stats.day = day; w.stats.today = { checks: 0, fails: 0, events: 0, items: 0 }; }
    w.stats.checks++; w.stats.today.checks++;
    w.nextAt = at + w.watch.settings.every * 1000;
    if (!res.ok) {
      w.stats.fails++; w.stats.today.fails++;
      w.failStreak++;
      w.last = { at, ok: false, error: res.error, count: null };
      return { ok: false, error: res.error, streak: w.failStreak };
    }
    w.failStreak = 0;
    const items = wp.cleanEventItems(res.items, w.watch.target.fields);
    w.last = { at, ok: true, error: '', count: items.length };
    const { fresh, seen } = wp.diffItems(items, w.seen, w.watch.target.fields);
    w.seen = seen;
    if (!w.based) { w.based = true; return { ok: true, count: items.length, based: true }; }
    const wanted = fresh.filter((it) => wp.watchMatch(it, w.watch.settings));
    for (const chunk of wp.chunkEvents(wanted)) {
      w.seq++;
      const ev = { type: 'event', id, seq: w.seq, at, items: chunk };
      w.unacked.push(ev);
      events.push(ev);
      w.batches.unshift({ seq: w.seq, at, n: chunk.length, preview: chunk.slice(0, 3).map((x) => Object.values(x.fields).join(' · ').slice(0, 80)) });
    }
    if (w.unacked.length > UNACKED_MAX) w.unacked = w.unacked.slice(-UNACKED_MAX);
    w.batches = w.batches.filter((b) => Date.now() - b.at < KEEP_MS).slice(0, BATCHES_MAX);
    if (events.length) {
      w.stats.events += events.length; w.stats.today.events += events.length;
      w.stats.items += wanted.length; w.stats.today.items += wanted.length;
    }
    return { ok: true, count: items.length };
  });
  if (!state) return;
  for (const ev of events) deps?.send(ev);
  reportState(id, state, false);
}

// 状态有变化才报；没变化也至少一小时报一次，让网页上的「上次检查」不至于停住
async function reportState(id, s, force) {
  const now = Date.now();
  const msg = await edit((st) => {
    const w = st.list[id];
    if (!w) return null;
    const prev = w.sent;
    const streak = s.streak || 0;
    const streakChanged = !s.ok && streak <= wp.WATCH_FAIL_MAX && (prev?.streak || 0) !== streak;
    const changed = !prev || prev.ok !== s.ok || (prev.error || '') !== (s.error || '') || streakChanged;
    if (!force && !changed && now - prev.at < STATE_BEAT_MS) return null;
    w.sent = { ok: s.ok, error: s.error || '', streak, at: now };
    return { type: 'watch_state', id, at: now, ok: s.ok, ...(s.error ? { error: s.error } : {}), ...(s.count != null ? { count: s.count } : {}), ...(streak ? { streak } : {}) };
  });
  if (msg) deps?.send(msg);
}

// ---------- 接口模式 ----------
// 在 service worker 里用用户的 cookie GET 一次。跳到别的网站（多半是登录页）算失败，不读内容。

async function fetchApi(watch) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_MS);
  try {
    const r = await fetch(watch.target.url, {
      method: 'GET', credentials: 'include', cache: 'no-store', redirect: 'follow', signal: ctl.signal,
      headers: { Accept: 'application/json, text/plain, */*' },
    });
    if (!hostMatches(hostOf(r.url), watch.target.site)) return { ok: false, error: `被转到了别的网站（${hostOf(r.url)}），可能是登录过期了` };
    if (!r.ok) return { ok: false, error: r.status === 401 || r.status === 403 ? `HTTP ${r.status}：可能是登录过期了` : `HTTP ${r.status}` };
    const text = await readCapped(r, wp.WATCH_BODY_MAX);
    if (text == null) return { ok: false, error: '响应超过 1MB' };
    let json;
    try { json = JSON.parse(text); } catch { return { ok: false, error: '响应不是 JSON（可能是登录页或网站改版）' }; }
    // 空列表（真的没有）不算失败；连续读不到东西由 agent 在修复时判断
    return { ok: true, items: wp.apiExtract(json, watch.detect).slice(0, wp.WATCH_SCAN_MAX) };
  } catch (e) {
    return { ok: false, error: e?.name === 'AbortError' ? '接口 20 秒没响应' : `请求失败：${String(e?.message || e).slice(0, 120)}` };
  } finally {
    clearTimeout(timer);
  }
}

async function readCapped(r, max) {
  if (!r.body) return '';
  const reader = r.body.getReader();
  const chunks = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.length;
    if (n > max) { await reader.cancel().catch(() => {}); return null; }
    chunks.push(value);
  }
  const all = new Uint8Array(n);
  let off = 0;
  for (const c of chunks) { all.set(c, off); off += c.length; }
  return new TextDecoder().decode(all);
}

// ---------- 页面模式 ----------
// 在折叠的「vcorp 值守」标签组里开一个后台标签页，等页面就绪，按选择器抽完就关。
// 这个标签页不属于任何云端任务，云端命令碰不到它。

async function readPage(watch) {
  let tabId = null;
  try {
    const tab = await chrome.tabs.create({ url: watch.target.url, active: false });
    tabId = tab.id;
    await groupTab(tab).catch(() => {});
    const done = await waitLoaded(tabId, wp.WATCH_READY_MS);
    const now = await chrome.tabs.get(tabId).catch(() => null);
    if (!now) return { ok: false, error: '标签页被关掉了' };
    const host = hostOf(now.url || now.pendingUrl || '');
    if (!hostMatches(host, watch.target.site)) return { ok: false, error: `被转到了别的网站（${host || '空白页'}），可能是登录过期了` };
    if (!done) return { ok: false, error: '页面 20 秒没加载完' };
    const [res] = await chrome.scripting.executeScript({
      target: { tabId }, func: pageExtract, args: [watch.detect, wp.WATCH_SCAN_MAX, 8000],
    });
    const out = res?.result;
    if (!out?.ok) return { ok: false, error: String(out?.error || '页面里没读到东西').slice(0, 200) };
    return { ok: true, items: out.items };
  } finally {
    if (tabId != null) await chrome.tabs.remove(tabId).catch(() => {});
  }
}

let groupId = null;
async function groupTab(tab) {
  if (groupId != null) {
    const g = await chrome.tabGroups.get(groupId).catch(() => null);
    if (g && g.windowId === tab.windowId) { await chrome.tabs.group({ tabIds: tab.id, groupId }); return; }
  }
  groupId = await chrome.tabs.group({ tabIds: tab.id, createProperties: { windowId: tab.windowId } });
  await chrome.tabGroups.update(groupId, { title: GROUP_TITLE, collapsed: true, color: 'grey' });
}

function waitLoaded(tabId, ms) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (v) => { if (settled) return; settled = true; chrome.tabs.onUpdated.removeListener(on); clearTimeout(t); resolve(v); };
    const on = (id, info) => { if (id === tabId && info.status === 'complete') finish(true); };
    const t = setTimeout(() => finish(false), ms);
    chrome.tabs.onUpdated.addListener(on);
    chrome.tabs.get(tabId).then((tab) => { if (tab?.status === 'complete') finish(true); }).catch(() => finish(false));
  });
}

// 注入到页面里跑：必须自成一体，不能引用外面的任何东西。只读 DOM，不改页面。
async function pageExtract(detect, max, readyMs) {
  try {
    const want = detect.ready || detect.items;
    const until = Date.now() + readyMs;
    while (!document.querySelector(want) && Date.now() < until) await new Promise((r) => setTimeout(r, 300));
    if (!document.querySelector(want)) return { ok: false, error: `页面上找不到 ${want}（可能没登录，或网站改版了）` };
    const ATTR = /^[A-Za-z_:][-A-Za-z0-9_:.]{0,63}$/;
    const read = (node, spec) => {
      const s = String(spec || '').trim();
      let sel = s;
      let attr = '';
      const at = s.lastIndexOf('@');
      if (at >= 0 && ATTR.test(s.slice(at + 1))) { sel = s.slice(0, at).trim(); attr = s.slice(at + 1); }
      const el = sel ? node.querySelector(sel) : node;
      if (!el) return '';
      if (attr) return el.getAttribute(attr) || '';
      return (el.innerText ?? el.textContent ?? '').trim();
    };
    const nodes = [...document.querySelectorAll(detect.items)].slice(0, max);
    const items = nodes.map((n) => ({
      key: read(n, detect.key),
      fields: Object.fromEntries(Object.entries(detect.fields).map(([f, spec]) => [f, read(n, spec)])),
    }));
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: `选择器不对：${String(e?.message || e).slice(0, 160)}` };
  }
}

// ---------- 沙箱的 watch probe ----------
// setup run 里 agent 试跑规则：查一次，回前几条给它看，什么都不存、不报事件。

export async function probeWatch(p) {
  const watch = { target: p.watch.target, detect: p.watch.detect };
  const res = watch.detect.mode === 'api' ? await fetchApi(watch) : await readPage(watch);
  if (!res.ok) return { count: 0, items: [], error: res.error };
  const items = wp.cleanEventItems(res.items, watch.target.fields);
  return {
    count: items.length,
    items: items.slice(0, wp.WATCH_PROBE_ITEMS),
    text: items.length
      ? `规则能用：读到 ${items.length} 条，下面是前 ${Math.min(items.length, wp.WATCH_PROBE_ITEMS)} 条。确认 key 每条不同、字段是你要的，再写进 output/WATCH.json。`
      : '规则跑通了，但一条都没读到：确认现在页面上确实有内容、items 路径或选择器对不对。',
  };
}
