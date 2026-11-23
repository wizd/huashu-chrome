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
const KEY_LIVE = 'cloudWatchLiveTabs';  // session: { [watchId]: { tabId, token, url, rev, lastSyncAt } }
const GROUP_TITLE = 'vcorp 值守';
const UNACKED_MAX = 200;       // 离线太久时最多攒这么多个事件，再多丢最旧的
const RUNS_MAX = 50;           // 服务器回报的执行记录
const BATCHES_MAX = 50;        // 本机记的上报批次
const KEEP_MS = 7 * 864e5;     // 记录最多留 7 天
const STATE_BEAT_MS = 3600e3;  // 状态没变化也至少一小时报一次
const FETCH_MS = 20000;
const LOAD_WAIT_MS = 15000;    // 等待 status=complete 的软超时：超时后若 DOM 已就绪仍尝试抽取
const LIVE_RESYNC_MS = 300e3;  // live 混合兜底同步间隔（5 分钟），防容器替换/休眠静默漏变更

let deps = null;               // { send(msg), raise(id, opts), settle(id), log(entry), paired() }
let lock = Promise.resolve();
let liveLock = Promise.resolve();
const running = new Set();     // 正在检查 / 建立实时监听的哨兵
const pageTabs = new Set();    // page 模式临时标签页（孤儿清理跳过）
const siteLast = new Map();    // 网站 → 上次检查开始的时间（同一网站至少隔开 WATCH_SITE_GAP_MS）
const apiValidators = new Map(); // watchId → { url, etag, lastModified }（HTTP 条件请求 304）

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

export function initWatches(d) { deps = d; }

const isLiveWatch = (w) => w?.watch?.detect?.mode === 'live';
const makeToken = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`);

// 读改写串行：服务器消息、alarm、侧栏操作会同时到
function serial(fn) {
  const run = lock.then(fn, fn);
  lock = run.catch(() => {});
  return run;
}
function serialLive(fn) {
  const run = liveLock.then(fn, fn);
  liveLock = run.catch(() => {});
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
let liveMem = {};
async function loadLive() {
  if (!chrome.storage?.session) return { ...liveMem };
  const { [KEY_LIVE]: v } = await chrome.storage.session.get(KEY_LIVE);
  return v && typeof v === 'object' ? v : {};
}
async function editLive(fn) {
  return serialLive(async () => {
    const m = await loadLive();
    const out = await fn(m);
    if (chrome.storage?.session) await chrome.storage.session.set({ [KEY_LIVE]: m });
    else liveMem = m;
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
      if (!m.hold && m.rebaseline) apiValidators.delete(id);
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
    const prevMode = w.watch?.detect?.mode;
    const prevUrl = w.watch?.target?.url;
    const detectChanged = w.watch && JSON.stringify(w.watch.detect) !== JSON.stringify(nw.detect);
    const targetChanged = w.watch && JSON.stringify(w.watch.target) !== JSON.stringify(nw.target);
    w.watch = nw;
    w.invalid = '';
    w.dirty = null;
    // 识别方法变了，旧的 key 未必还对得上：重新取基线，别把整页当成新的
    if (detectChanged || targetChanged) { w.based = false; w.seen = {}; apiValidators.delete(nw.id); }
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
    const active = w.status === 'active' && !nw.settings.paused;
    const liveDrop = (prevMode === 'live' && nw.detect.mode !== 'live')
      || (nw.detect.mode === 'live' && (!active || (prevUrl && prevUrl !== nw.target.url)));
    return { id: nw.id, pending: w.status === 'pending', watch: nw, active, liveDrop, reattach: active && nw.detect.mode === 'live' && detectChanged && !liveDrop };
  });
  if (!out) return;
  if (out.invalid) {
    await closeLiveTab(out.id);
    reportState(out.id, { ok: false, error: `规则不合规：${out.invalid}` }, true);
    return;
  }
  if (out.liveDrop) await closeLiveTab(out.id);
  if (out.pending) askConfirm(out.watch);
  else deps?.settle(notifyId(out.id));
  if (out.active) void checkSoon(out.id, { reattach: out.reattach });
}

// 新哨兵、或目标变大：自动允许管不到，一定要用户点头
function askConfirm(w) {
  const t = w.target;
  const how = w.detect.mode === 'live'
    ? `实时监听 ${t.site}`
    : `每 ${Math.round(w.settings.every / 60)} 分钟查看 ${t.site}`;
  deps?.raise(notifyId(w.id), {
    type: 'basic', iconUrl: 'icons/icon128.png', priority: 2, requireInteraction: true,
    title: `新的哨兵等你确认：${w.settings.name}`,
    message: `${how}，只把新条目的 ${t.fields.join('、')} 发给服务器。${w.note ? `\n${w.note}` : ''}`,
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
  else await closeLiveTab(id);
}

// 用户在这里改设置：本机立即生效，同时告诉服务器
function applySettings(w, patch) {
  const merged = wp.cleanWatchSettings({ ...w.watch.settings, ...patch }, w.watch.title);
  w.watch.settings = merged;
  w.dirty = merged;
  return merged;
}

export async function updateWatch(id, patch) {
  const res = await edit((st) => {
    const w = st.list[id];
    if (!w?.watch) return null;
    const before = w.watch.settings.every;
    const s = applySettings(w, patch || {});
    if (s.every !== before) w.nextAt = Math.min(w.nextAt || 0, Date.now() + s.every * 1000);
    return { settings: s, live: isLiveWatch(w), active: w.status === 'active' && !s.paused && st.master };
  });
  if (!res) return;
  deps?.send({ type: 'watch_update', id, settings: res.settings });
  if (res.live) {
    if (!res.active || !wp.watchInHours(res.settings, Date.now())) await closeLiveTab(id);
    else void ensureLiveTab(id);
  }
}

export async function checkNow(id) {
  await edit((st) => { if (st.list[id]) st.list[id].nextAt = 0; });
  await checkOnce(id, { manual: true });
}

export async function rebaseline(id) {
  apiValidators.delete(id);
  await edit((st) => { const w = st.list[id]; if (w) { w.based = false; w.nextAt = 0; } });
  await checkOnce(id, { manual: true });
}

export async function deleteWatch(id) { await removeLocal(id, true); }

async function removeLocal(id, byUser) {
  apiValidators.delete(id);
  const had = await edit((st) => {
    if (!st.list[id]) return false;
    delete st.list[id];
    return true;
  });
  await closeLiveTab(id);
  deps?.settle(notifyId(id));
  if (had && byUser) {
    deps?.send({ type: 'watch_deleted', id });
    await deps?.log({ ev: 'watch_deleted', job: id, msg: id });
  }
}

export async function setMaster(on) {
  const ids = await edit((st) => { st.master = !!on; return Object.keys(st.list); });
  if (!on) await closeAllLiveTabs();
  for (const id of ids) {
    deps?.send(on ? { type: 'watch_state', id, at: Date.now(), ok: true, off: false }
      : { type: 'watch_state', id, at: Date.now(), ok: false, off: true, error: '浏览器的值守总开关关着' });
  }
  if (on) void tickWatches();
}

// 给侧栏的：不带「看过」表和待发事件的正文
export async function watchPanelState() {
  const [st, liveTabs] = await Promise.all([load(), loadLive()]);
  const now = Date.now();
  return {
    master: st.master,
    list: Object.entries(st.list).map(([id, w]) => {
      const day = w.watch ? wp.watchDay(now, w.watch.settings.tz) : '';
      const today = w.stats.day === day ? w.stats.today : { checks: 0, fails: 0, events: 0, items: 0 };
      const runsToday = w.runs.filter((r) => wp.watchDay(r.at, w.watch?.settings.tz) === day);
      return {
        id, status: w.status, invalid: w.invalid, watch: w.watch, hold: w.hold, based: w.based,
        liveTab: !!liveTabs[id]?.tabId,
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

// ---------- 检查与实时值守 ----------

// alarm 每 30 秒：
// - live 模式：不轮询网站；只核对常驻后台标签页和观察器还活着，不在时段/已暂停的把标签页关掉；
// - api / page 模式：到点的、在时段里的哨兵逐个查。页面模式开标签页，一轮最多一个。
// 没连上服务器也照常干活：事件攒在 unacked 里，连上再发。没配对就不跑（paired 由 cloud.js 给）。
export async function tickWatches() {
  if (!(await deps?.paired?.())) { await closeAllLiveTabs(); return; }
  const st = await load();
  if (!st.master) { await closeAllLiveTabs(); return; }
  const now = Date.now();
  const offline = isOffline();
  let pages = 0;
  for (const [id, w] of Object.entries(st.list)) {
    if (isLiveWatch(w)) {
      const shouldRun = w.status === 'active' && !w.watch.settings.paused && wp.watchInHours(w.watch.settings, now);
      if (!shouldRun) {
        await closeLiveTab(id);
      } else if (!offline && w.nextAt <= now) {
        await maintainLiveWatch(id);
      }
      continue;
    }
    if (offline) continue;
    if (w.status !== 'active' || w.hold || !w.watch || w.watch.settings.paused) continue;
    if (w.nextAt > now || !wp.watchInHours(w.watch.settings, now)) continue;
    if (w.watch.detect.mode === 'page' && pages >= 1) continue;
    if (w.watch.detect.mode === 'page') pages++;
    await checkOnce(id);
  }
  await reapOrphanLiveTabs().catch(() => {});
}

// 服务器或用户要求的检查：不等下一轮 alarm
async function checkSoon(id, opts = {}) {
  try { await checkOnce(id, opts); } catch { /* 结果已记在状态里 */ }
}

async function checkOnce(id, { manual = false, reattach = false } = {}) {
  const st0 = await load();
  const w0 = st0.list[id];
  if (!st0.master || !w0?.watch || w0.status !== 'active') return;
  if (isLiveWatch(w0)) {
    if (w0.hold && !manual) return;
    if (!manual && w0.watch.settings.paused) return;
    await ensureLiveTab(id, { manual, reattach });
    return;
  }
  if (w0.hold) return;
  if (!manual && w0.watch.settings.paused) return;
  if (!manual && isOffline()) {
    await edit((s) => { if (s.list[id]) s.list[id].nextAt = Date.now() + 30_000; });
    return;
  }
  if (running.has(id)) return;
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
    res = watch.detect.mode === 'api'
      ? await fetchApi(watch, { id, conditional: w0.based && !manual })
      : await readPage(watch);
  } catch (e) {
    res = { ok: false, transient: true, error: String(e?.message || e).slice(0, 200) };
  } finally {
    running.delete(id);
  }
  if (!res.ok) {
    await recordError(id, res.error, at, { live: false, transient: !!res.transient, retryAfterMs: res.retryAfterMs || 0 });
    return;
  }
  if (res.notModified) {
    await recordNotModified(id, at);
    return;
  }
  await ingestItems(id, res.items, { at, live: false, manual });
}

async function recordNotModified(id, at) {
  const state = await edit((s) => {
    const w = s.list[id];
    if (!w?.watch || w.status !== 'active' || !s.master) return null;
    const day = wp.watchDay(at, w.watch.settings.tz);
    if (w.stats.day !== day) { w.stats.day = day; w.stats.today = { checks: 0, fails: 0, events: 0, items: 0 }; }
    w.stats.checks++; w.stats.today.checks++;
    w.nextAt = at + wp.nextDelayMs({ everySec: w.watch.settings.every, jitter: Math.random() });
    w.failStreak = 0;
    const count = w.last?.count ?? Object.keys(w.seen || {}).length;
    w.last = { at, ok: true, error: '', count };
    return { ok: true, count };
  });
  if (state) reportState(id, state, false);
}

async function recordError(id, error, at, opts = false) {
  const { live = false, transient = false, retryAfterMs = 0 } = typeof opts === 'boolean' ? { live: opts } : (opts || {});
  const state = await edit((s) => {
    const w = s.list[id];
    if (!w?.watch) return null;
    const day = wp.watchDay(at, w.watch.settings.tz);
    if (w.stats.day !== day) { w.stats.day = day; w.stats.today = { checks: 0, fails: 0, events: 0, items: 0 }; }
    w.stats.checks++; w.stats.today.checks++;
    w.stats.fails++; w.stats.today.fails++;
    w.failStreak++;
    // live 模式、限流（429）或 5xx/超时使用指数退避（并尊重 Retry-After），避免反复轰炸站点或开关标签页
    w.nextAt = at + wp.nextDelayMs({
      live,
      everySec: w.watch.settings.every,
      failStreak: w.failStreak,
      transient,
      retryAfterMs,
    });
    w.last = { at, ok: false, error, count: null };
    return { ok: false, error, streak: w.failStreak };
  });
  if (state) reportState(id, state, false);
}

// 统一比对入口（live / api / page 共用）：清洗字段、和 seen 比对、按关键词过滤、入 unacked 并发给服务器。
async function ingestItems(id, rawItems, { at = Date.now(), live = false, manual = false } = {}) {
  const events = [];
  const state = await edit((s) => {
    const w = s.list[id];
    if (!w?.watch || w.status !== 'active' || !s.master) return null;
    // 任务运行期间（hold）收到 live DOM 变化先忽略，等任务结束 rebaseline 再对齐
    if (live && !manual && (w.hold || w.watch.settings.paused || !wp.watchInHours(w.watch.settings, at))) return null;
    const day = wp.watchDay(at, w.watch.settings.tz);
    if (w.stats.day !== day) { w.stats.day = day; w.stats.today = { checks: 0, fails: 0, events: 0, items: 0 }; }
    w.stats.checks++; w.stats.today.checks++;
    w.nextAt = isLiveWatch(w)
      ? 0
      : at + wp.nextDelayMs({ everySec: w.watch.settings.every, jitter: manual ? 0 : Math.random() });
    w.failStreak = 0;
    const items = wp.cleanEventItems(rawItems, w.watch.target.fields);
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
// 在 service worker 里用用户的 cookie GET 一次。支持条件请求（ETag / Last-Modified → 304 零解析），
// 遇到 429 / 5xx 自动带 Retry-After 退避；跳到别的网站（多半是登录页）算失败，不读内容。

async function fetchApi(watch, { id = '', conditional = false } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_MS);
  try {
    const headers = { Accept: 'application/json, text/plain, */*' };
    const cached = id && conditional ? apiValidators.get(id) : null;
    if (cached && cached.url === watch.target.url) {
      if (cached.etag) headers['If-None-Match'] = cached.etag;
      if (cached.lastModified) headers['If-Modified-Since'] = cached.lastModified;
    }
    const r = await fetch(watch.target.url, {
      method: 'GET', credentials: 'include', cache: 'no-store', redirect: 'follow', signal: ctl.signal,
      headers,
    });
    if (!hostMatches(hostOf(r.url), watch.target.site)) return { ok: false, error: `被转到了别的网站（${hostOf(r.url)}），可能是登录过期了` };
    if (r.status === 304) {
      if (id) {
        const etag = r.headers?.get?.('etag') || cached?.etag || '';
        const lastModified = r.headers?.get?.('last-modified') || cached?.lastModified || '';
        if (etag || lastModified) apiValidators.set(id, { url: watch.target.url, etag, lastModified });
      }
      return { ok: true, notModified: true };
    }
    if (!r.ok) {
      if (r.status === 401 || r.status === 403) return { ok: false, error: `HTTP ${r.status}：可能是登录过期了` };
      if (r.status === 429) {
        const retryAfterMs = wp.parseRetryAfterMs(r.headers?.get?.('retry-after'));
        return { ok: false, transient: true, retryAfterMs, error: 'HTTP 429：触发网站限流，已自动退避重试' };
      }
      if (r.status >= 500 && r.status < 600) {
        const retryAfterMs = r.status === 503 ? wp.parseRetryAfterMs(r.headers?.get?.('retry-after')) : 0;
        return { ok: false, transient: true, retryAfterMs, error: `HTTP ${r.status}：目标网站暂时出错` };
      }
      return { ok: false, error: `HTTP ${r.status}` };
    }
    if (id) {
      const etag = r.headers?.get?.('etag') || '';
      const lastModified = r.headers?.get?.('last-modified') || '';
      if (etag || lastModified) apiValidators.set(id, { url: watch.target.url, etag, lastModified });
      else apiValidators.delete(id);
    }
    const text = await readCapped(r, wp.WATCH_BODY_MAX);
    if (text == null) return { ok: false, error: '响应超过 1MB' };
    let json;
    try { json = JSON.parse(text); } catch { return { ok: false, error: '响应不是 JSON（可能是登录页或网站改版）' }; }
    // 空列表（真的没有）不算失败；连续读不到东西由 agent 在修复时判断
    return { ok: true, items: wp.apiExtract(json, watch.detect).slice(0, wp.WATCH_SCAN_MAX) };
  } catch (e) {
    return { ok: false, transient: true, error: e?.name === 'AbortError' ? '接口 20 秒没响应' : `请求失败：${String(e?.message || e).slice(0, 120)}` };
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
    pageTabs.add(tabId);
    await groupTab(tab).catch(() => {});
    const done = await waitLoaded(tabId, LOAD_WAIT_MS);
    const now = await chrome.tabs.get(tabId).catch(() => null);
    if (!now) return { ok: false, error: '标签页被关掉了' };
    const host = hostOf(now.url || now.pendingUrl || '');
    if (!hostMatches(host, watch.target.site)) return { ok: false, error: `被转到了别的网站（${host || '空白页'}），可能是登录过期了` };
    // 即使第三方广告/统计脚本拖慢了 status=complete，只要主 DOM 已就绪也尝试抽取，减少误超时
    const [res] = await chrome.scripting.executeScript({
      target: { tabId }, func: pageExtract, args: [watch.detect, wp.WATCH_SCAN_MAX, done ? 8000 : 5000],
    });
    const out = res?.result;
    if (!out?.ok) {
      if (!done) return { ok: false, transient: true, error: '页面 20 秒没加载完' };
      return { ok: false, error: String(out?.error || '页面里没读到东西').slice(0, 200) };
    }
    return { ok: true, items: out.items };
  } finally {
    if (tabId != null) {
      pageTabs.delete(tabId);
      await chrome.tabs.remove(tabId).catch(() => {});
    }
  }
}

let groupId = null;
async function groupTab(tab) {
  if (groupId != null) {
    const g = await chrome.tabGroups.get(groupId).catch(() => null);
    if (g && g.windowId === tab.windowId) { await chrome.tabs.group({ tabIds: tab.id, groupId }); return; }
  }
  const existing = await chrome.tabGroups.query({ windowId: tab.windowId, title: GROUP_TITLE }).catch(() => []);
  if (existing.length) {
    groupId = existing[0].id;
    await chrome.tabs.group({ tabIds: tab.id, groupId });
    return;
  }
  groupId = await chrome.tabs.group({ tabIds: tab.id, createProperties: { windowId: tab.windowId } });
  await chrome.tabGroups.update(groupId, { title: GROUP_TITLE, collapsed: true, color: 'grey' });
}

// ---------- 实时监听模式（live） ----------
// 在折叠的「vcorp 值守」标签组里常驻一个后台标签页（autoDiscardable: false），
// 注入纯声明式 MutationObserver（零模型调用、零轮询间隔），DOM 一变就地比对，
// 真的有新条目才唤醒 SW 发给服务器。

async function closeLiveTab(id) {
  const entry = await editLive((m) => {
    const prev = m[id];
    delete m[id];
    return prev || null;
  });
  if (!entry?.tabId) return;
  await chrome.tabs.sendMessage(entry.tabId, { __hcWatchStop: id }).catch(() => {});
  await chrome.tabs.remove(entry.tabId).catch(() => {});
}

export async function closeAllLiveTabs() {
  const all = await editLive((m) => {
    const entries = Object.entries(m);
    for (const k of Object.keys(m)) delete m[k];
    return entries;
  });
  for (const [id, entry] of all) {
    if (!entry?.tabId) continue;
    await chrome.tabs.sendMessage(entry.tabId, { __hcWatchStop: id }).catch(() => {});
    await chrome.tabs.remove(entry.tabId).catch(() => {});
  }
  await reapOrphanLiveTabs().catch(() => {});
}

async function findOrphanLiveTab(url, claimedTabIds) {
  const groups = await chrome.tabGroups?.query?.({ title: GROUP_TITLE }).catch(() => []) || [];
  for (const g of groups) {
    const tabs = await chrome.tabs?.query?.({ groupId: g.id }).catch(() => []) || [];
    for (const t of tabs) {
      if (claimedTabIds.has(t.id) || pageTabs.has(t.id) || t.discarded) continue;
      if ((t.url || t.pendingUrl) === url) return t;
    }
  }
  return null;
}

// 清理「vcorp 值守」标签组里无人认领的残留标签页（比如浏览器崩溃、扩展重载或规则删除后的遗留）
async function reapOrphanLiveTabs() {
  if (running.size > 0 || !chrome.tabGroups?.query || !chrome.tabs?.query) return;
  const liveMap = await loadLive();
  const keep = new Set([...Object.values(liveMap).map((x) => x?.tabId).filter(Boolean), ...pageTabs]);
  const groups = await chrome.tabGroups.query({ title: GROUP_TITLE }).catch(() => []);
  for (const g of groups) {
    const tabs = await chrome.tabs.query({ groupId: g.id }).catch(() => []);
    for (const t of tabs) {
      if (!keep.has(t.id)) await chrome.tabs.remove(t.id).catch(() => {});
    }
  }
}

// 30 秒保活：不轮询网站；核对常驻标签页和观察器还活着，每 5 分钟做一次混合兜底比对（无变化不写存储）。
async function maintainLiveWatch(id) {
  if (running.has(id)) return;
  const liveMap = await loadLive();
  const entry = liveMap[id];
  if (entry?.tabId) {
    const tab = await chrome.tabs.get(entry.tabId).catch(() => null);
    if (tab) {
      if (tab.discarded) {
        await chrome.tabs.update(tab.id, { autoDiscardable: false }).catch(() => {});
        await chrome.tabs.reload(tab.id).catch(() => {});
        return;
      }
      const host = hostOf(tab.url || tab.pendingUrl || '');
      const st = await load();
      const w = st.list[id];
      if (!w?.watch || !hostMatches(host, w.watch.target.site)) {
        // 跳转到登录页等外站：关掉失效标签页并退避，等用户重新登录后下轮能重新打开目标页
        await closeLiveTab(id);
        await recordError(id, `被转到了别的网站（${host || '空白页'}），可能是登录过期了`, Date.now(), true);
        return;
      }
      const now = Date.now();
      const needSync = !w.based || (now - (entry.lastSyncAt || 0) >= LIVE_RESYNC_MS);
      const alive = await chrome.tabs.sendMessage(tab.id, {
        __hcWatchPing: id, token: entry.token, sync: needSync, force: !w.based,
      }).catch(() => null);
      if (alive?.ok) {
        if (needSync) {
          await editLive((m) => { if (m[id]?.token === entry.token) m[id].lastSyncAt = now; });
          if ((!w.based || alive.changed) && Array.isArray(alive.items)) {
            await ingestItems(id, alive.items, { at: now, live: true });
          } else if (alive.count != null) {
            reportState(id, { ok: true, count: alive.count }, false);
          }
        }
        return;
      }
      // 标签页还在但观察器没响应（如页面重载或扩展刚更新）：原地重挂观察器
      await ensureLiveTab(id, { reattach: true });
      return;
    }
    await editLive((m) => { if (m[id]?.tabId === entry.tabId) delete m[id]; });
  }
  await ensureLiveTab(id);
}

async function ensureLiveTab(id, { manual = false, reattach = false } = {}) {
  if (running.has(id)) return;
  const st = await load();
  const w0 = st.list[id];
  if (!st.master || !w0?.watch || w0.status !== 'active' || !isLiveWatch(w0)) return;
  if (!manual && (w0.watch.settings.paused || !wp.watchInHours(w0.watch.settings, Date.now()))) return;
  const { watch } = w0;
  running.add(id);
  const at = Date.now();
  let createdTabId = null;
  try {
    const liveMap = await loadLive();
    const existing = liveMap[id];
    let tabId = null;
    let token = existing?.token || makeToken();
    let loadedOk = true;

    if (existing?.tabId) {
      const tab = await chrome.tabs.get(existing.tabId).catch(() => null);
      if (tab) {
        const host = hostOf(tab.url || tab.pendingUrl || '');
        if (!hostMatches(host, watch.target.site)) {
          await closeLiveTab(id);
          await recordError(id, `被转到了别的网站（${host || '空白页'}），可能是登录过期了`, at, true);
          return;
        }
        tabId = tab.id;
        await chrome.tabs.update(tabId, { autoDiscardable: false }).catch(() => {});
        if (tab.discarded) {
          await chrome.tabs.reload(tabId);
          loadedOk = await waitLoaded(tabId, LOAD_WAIT_MS);
        } else if (!reattach) {
          // 标签页已在实时监听：直接拉一次当前 DOM（供「立即检查 / 重建基线 / hold 结束」复用，不重载页面）
          const pulled = await chrome.tabs.sendMessage(tabId, { __hcWatchPull: id, token: existing.token }).catch(() => null);
          if (pulled?.ok && Array.isArray(pulled.items)) {
            const now = Date.now();
            await editLive((m) => { if (m[id]?.token === existing.token) m[id].lastSyncAt = now; });
            await ingestItems(id, pulled.items, { at: now, live: true, manual });
            return;
          }
        }
      } else {
        await editLive((m) => { if (m[id]?.tabId === existing.tabId) delete m[id]; });
      }
    }

    if (tabId == null) {
      const gap = Date.now() - (siteLast.get(watch.target.site) || 0);
      if (!manual && gap < wp.WATCH_SITE_GAP_MS) {
        await edit((s) => { if (s.list[id]) s.list[id].nextAt = Date.now() + (wp.WATCH_SITE_GAP_MS - gap); });
        return;
      }
      siteLast.set(watch.target.site, Date.now());
      const claimed = new Set(Object.values(await loadLive()).map((x) => x.tabId).filter(Boolean));
      const orphan = await findOrphanLiveTab(watch.target.url, claimed);
      const tab = orphan || await chrome.tabs.create({ url: watch.target.url, active: false });
      tabId = tab.id;
      if (!orphan) createdTabId = tabId;
      token = makeToken();
      await chrome.tabs.update(tabId, { autoDiscardable: false }).catch(() => {});
      await groupTab(tab).catch(() => {});
      await editLive((m) => { m[id] = { tabId, token, url: watch.target.url, rev: watch.rev, lastSyncAt: Date.now() }; });
      loadedOk = await waitLoaded(tabId, LOAD_WAIT_MS);
      const nowTab = await chrome.tabs.get(tabId).catch(() => null);
      if (!nowTab) {
        await editLive((m) => { if (m[id]?.tabId === tabId) delete m[id]; });
        await recordError(id, '值守标签页被关掉了', Date.now(), true);
        return;
      }
      const host = hostOf(nowTab.url || nowTab.pendingUrl || '');
      if (!hostMatches(host, watch.target.site)) {
        await closeLiveTab(id);
        await recordError(id, `被转到了别的网站（${host || '空白页'}），可能是登录过期了`, Date.now(), true);
        return;
      }
    } else {
      token = makeToken();
      await editLive((m) => { m[id] = { tabId, token, url: watch.target.url, rev: watch.rev, lastSyncAt: Date.now() }; });
    }

    const ok = await attachLiveObserver(id, tabId, token, watch, { manual, loadedOk });
    if (!ok && createdTabId != null) await closeLiveTab(id);
  } catch (e) {
    if (createdTabId != null) await closeLiveTab(id).catch(() => {});
    await recordError(id, String(e?.message || e).slice(0, 200), Date.now(), true);
  } finally {
    running.delete(id);
  }
}

async function attachLiveObserver(id, tabId, token, watch, { manual = false, loadedOk = true } = {}) {
  const attrs = wp.pageObservedAttrs(watch.detect);
  const readyMs = loadedOk ? wp.WATCH_READY_MS : 5000;
  const [res] = await chrome.scripting.executeScript({
    target: { tabId },
    func: liveAttach,
    args: [id, token, watch.detect, wp.WATCH_SCAN_MAX, readyMs, attrs],
  });
  const out = res?.result;
  if (!out?.ok) {
    const msg = !loadedOk ? '页面 20 秒没加载完' : String(out?.error || '实时监听挂载失败').slice(0, 200);
    await recordError(id, msg, Date.now(), { live: true, transient: !loadedOk });
    return false;
  }
  const now = Date.now();
  await editLive((m) => { if (m[id]?.token === token) m[id].lastSyncAt = now; });
  await ingestItems(id, out.items, { at: now, live: true, manual });
  return true;
}

// 收到常驻后台标签页发来的实时 DOM 变化或错误：严格核对 tabId、随机 token 与域名，防页面篡改。
export async function onLiveMessage(m, sender) {
  const kind = m?.__hcWatch;
  if (kind !== 'live_items' && kind !== 'live_error') return;
  const id = String(m.id || '');
  const tabId = sender?.tab?.id;
  if (!id || tabId == null) return;
  const liveMap = await loadLive();
  const entry = liveMap[id];
  if (!entry || entry.tabId !== tabId || entry.token !== m.token) return;
  const st = await load();
  const w = st.list[id];
  if (!w?.watch || w.status !== 'active' || !isLiveWatch(w)) return;
  const host = hostOf(sender.tab.url || '');
  if (!hostMatches(host, w.watch.target.site)) return;
  if (kind === 'live_error') {
    await recordError(id, String(m.error || '页面监听出错').slice(0, 200), Date.now(), true);
    return;
  }
  if (Array.isArray(m.items)) {
    const now = Date.now();
    await editLive((lm) => { if (lm[id]?.token === entry.token) lm[id].lastSyncAt = now; });
    await ingestItems(id, m.items, { at: now, live: true });
  }
}

export async function onWatchTabRemoved(tabId) {
  await editLive((m) => {
    for (const [id, entry] of Object.entries(m)) {
      if (entry?.tabId === tabId) delete m[id];
    }
  });
}

export async function onWatchTabUpdated(tabId, info) {
  if (info?.status !== 'complete') return;
  const liveMap = await loadLive();
  const hit = Object.entries(liveMap).find(([, entry]) => entry?.tabId === tabId);
  if (!hit) return;
  const [id] = hit;
  if (running.has(id)) return;
  const st = await load();
  const w = st.list[id];
  if (!st.master || !w?.watch || w.status !== 'active' || !isLiveWatch(w) || w.watch.settings.paused) return;
  await ensureLiveTab(id, { reattach: true });
}

// 注入到常驻页面（ISOLATED world）：必须自成一体，只读 DOM，不改页面，不调模型。
// 用 MutationObserver + 800ms 防抖监听 DOM 变化；就地算快照指纹，内容真的变了才唤醒 SW。
async function liveAttach(id, token, detect, max, readyMs, attrFilter) {
  try {
    window.__vcorpWatchers = window.__vcorpWatchers || {};
    if (window.__vcorpWatchers[id]?.stop) {
      try { window.__vcorpWatchers[id].stop(); } catch { /* 清理旧观察器 */ }
    }
    const want = detect.ready || detect.items;
    const until = Date.now() + readyMs;
    while (!document.querySelector(want) && Date.now() < until) await new Promise((r) => setTimeout(r, 300));
    if (!document.querySelector(want)) return { ok: false, error: `页面上找不到 ${want}（可能没登录，或网站改版了）` };

    const ATTR = /^[A-Za-z_:][-A-Za-z0-9_:.]{0,63}$/;
    const fieldNames = Object.keys(detect.fields || {});
    const read = (node, spec) => {
      const s = String(spec || '').trim();
      let sel = s;
      let attr = '';
      const at = s.lastIndexOf('@');
      if (at >= 0 && ATTR.test(s.slice(at + 1))) { sel = s.slice(0, at).trim(); attr = s.slice(at + 1); }
      const el = sel ? node.querySelector(sel) : node;
      if (!el) return '';
      if (attr) return el.getAttribute(attr) || '';
      return (el.innerText || '').trim() || (el.textContent || '').replace(/\s+/g, ' ').trim();
    };
    const extract = () => [...document.querySelectorAll(detect.items)].slice(0, max).map((n) => ({
      key: read(n, detect.key),
      fields: Object.fromEntries(fieldNames.map((f) => [f, read(n, detect.fields[f])])),
    }));
    const snapHash = (items) => {
      let h = 0x811c9dc5;
      for (const it of items) {
        const line = `${it.key}\u0002${fieldNames.map((f) => it.fields[f] ?? '').join('\u0001')}\u0003`;
        for (let i = 0; i < line.length; i++) { h ^= line.charCodeAt(i); h = Math.imul(h, 0x01000193); }
      }
      return `${items.length}:${(h >>> 0).toString(16)}`;
    };

    const initial = extract();
    let lastHash = snapHash(initial);
    let lastSentAt = Date.now();
    let timer = null;
    let stopped = false;

    const sendSafe = (msg) => {
      try {
        chrome.runtime.sendMessage(msg).catch(() => {});
      } catch {
        stop();
      }
    };
    const flush = () => {
      timer = null;
      if (stopped) return;
      try {
        const items = extract();
        const h = snapHash(items);
        if (h === lastHash) return;
        lastHash = h;
        lastSentAt = Date.now();
        sendSafe({ __hcWatch: 'live_items', id, token, items });
      } catch (e) {
        sendSafe({ __hcWatch: 'live_error', id, token, error: `选择器不对：${String(e?.message || e).slice(0, 160)}` });
      }
    };
    const schedule = () => {
      if (stopped) return;
      if (timer != null) clearTimeout(timer);
      const wait = Math.max(800, 1500 - (Date.now() - lastSentAt));
      timer = setTimeout(flush, wait);
    };

    const obs = new MutationObserver(schedule);
    const root = document.body || document.documentElement;
    const opts = { childList: true, subtree: true, characterData: true };
    if (Array.isArray(attrFilter) && attrFilter.length) {
      opts.attributes = true;
      opts.attributeFilter = attrFilter;
    }
    obs.observe(root, opts);

    const onMsg = (m, _sender, sendResponse) => {
      if (stopped) return false;
      if (m?.__hcWatchPing === id && m.token === token) { sendResponse({ ok: true }); return false; }
      if (m?.__hcWatchPull === id && m.token === token) {
        try {
          const items = extract();
          lastHash = snapHash(items);
          sendResponse({ ok: true, items });
        } catch (e) {
          sendResponse({ ok: false, error: String(e?.message || e).slice(0, 160) });
        }
        return false;
      }
      if (m?.__hcWatchStop === id) { stop(); sendResponse({ ok: true }); return false; }
      return false;
    };
    chrome.runtime.onMessage.addListener(onMsg);

    function stop() {
      if (stopped) return;
      stopped = true;
      if (timer != null) { clearTimeout(timer); timer = null; }
      try { obs.disconnect(); } catch { /* noop */ }
      try { chrome.runtime.onMessage.removeListener(onMsg); } catch { /* noop */ }
      if (window.__vcorpWatchers?.[id]?.token === token) delete window.__vcorpWatchers[id];
    }
    window.__vcorpWatchers[id] = { token, stop };
    return { ok: true, items: initial };
  } catch (e) {
    return { ok: false, error: `选择器不对：${String(e?.message || e).slice(0, 160)}` };
  }
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
      return (el.innerText || '').trim() || (el.textContent || '').replace(/\s+/g, ' ').trim();
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
