// 哨兵运行器（watch-runner.js）的状态机和协议测试 —— 模拟 chrome.storage 与 fetch，不需要真实浏览器

import { test } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
const sessionStore = new Map();
const tabs = new Map();
const tabGroups = new Map();
const updatedListeners = new Set();
let nextTabId = 100;
let nextGroupId = 1;
let scriptHandler = null;
let tabMsgHandler = null;

globalThis.chrome = {
  storage: {
    local: {
      async get(key) {
        if (typeof key === 'string') return { [key]: store.get(key) };
        return Object.fromEntries([...store.entries()]);
      },
      async set(obj) {
        for (const [k, v] of Object.entries(obj)) store.set(k, structuredClone(v));
      },
    },
    session: {
      async get(key) {
        if (typeof key === 'string') return { [key]: sessionStore.get(key) };
        return Object.fromEntries([...sessionStore.entries()]);
      },
      async set(obj) {
        for (const [k, v] of Object.entries(obj)) sessionStore.set(k, structuredClone(v));
      },
    },
  },
  tabs: {
    async create({ url, active }) {
      const id = nextTabId++;
      const t = { id, url, active: !!active, status: 'complete', windowId: 1, discarded: false, autoDiscardable: true };
      tabs.set(id, t);
      return { ...t };
    },
    async get(id) {
      const t = tabs.get(id);
      if (!t) throw new Error('No tab');
      return { ...t };
    },
    async update(id, patch) {
      const t = tabs.get(id);
      if (!t) throw new Error('No tab');
      Object.assign(t, patch);
      return { ...t };
    },
    async remove(id) {
      tabs.delete(id);
    },
    async reload(id) {
      const t = tabs.get(id);
      if (t) t.discarded = false;
    },
    async query(q = {}) {
      return [...tabs.values()].filter((t) => (q.groupId == null || t.groupId === q.groupId)).map((t) => ({ ...t }));
    },
    async group({ tabIds, groupId, createProperties }) {
      const gid = groupId ?? nextGroupId++;
      if (!tabGroups.has(gid)) tabGroups.set(gid, { id: gid, windowId: createProperties?.windowId ?? 1, title: '', collapsed: false });
      for (const tid of Array.isArray(tabIds) ? tabIds : [tabIds]) {
        const t = tabs.get(tid);
        if (t) t.groupId = gid;
      }
      return gid;
    },
    async sendMessage(tabId, msg) {
      if (!tabMsgHandler) throw new Error('No listener');
      return tabMsgHandler(tabId, msg);
    },
    onUpdated: {
      addListener(fn) { updatedListeners.add(fn); },
      removeListener(fn) { updatedListeners.delete(fn); },
    },
  },
  tabGroups: {
    async get(id) {
      const g = tabGroups.get(id);
      if (!g) throw new Error('No group');
      return { ...g };
    },
    async update(id, patch) {
      const g = tabGroups.get(id);
      if (g) Object.assign(g, patch);
      return g ? { ...g } : null;
    },
    async query(q = {}) {
      return [...tabGroups.values()].filter((g) => (q.title == null || g.title === q.title) && (q.windowId == null || g.windowId === q.windowId));
    },
  },
  scripting: {
    async executeScript(opts) {
      if (!scriptHandler) throw new Error('No scriptHandler');
      return [{ result: await scriptHandler(opts) }];
    },
  },
};

const runner = await import('../extension/watch-runner.js');

const origFetch = globalThis.fetch;

function makeWatch(over = {}) {
  const id = over.id || 'w_j1';
  const site = over.site || 'example.com';
  return {
    id,
    jobId: over.jobId || id.slice(2),
    title: over.title || '测试任务',
    rev: over.rev ?? 1,
    target: { site, url: `https://${site}/api/list`, fields: ['from', 'text'], ...(over.target || {}) },
    detect: { mode: 'api', items: '$.list[*]', key: 'id', fields: { from: 'u', text: 't' }, ...(over.detect || {}) },
    settings: { name: '测试哨兵', every: 300, hours: null, tz: 'Asia/Shanghai', include: [], exclude: [], paused: false, batchMs: 120000, maxRunsPerDay: 48, ...(over.settings || {}) },
    note: '列表',
  };
}

function setupHarness(fetchImpl) {
  store.clear();
  sessionStore.clear();
  tabs.clear();
  tabGroups.clear();
  scriptHandler = null;
  tabMsgHandler = null;
  const sent = [];
  const raised = [];
  const settled = [];
  const logs = [];
  runner.initWatches({
    send: (m) => sent.push(m),
    raise: (id, opts) => raised.push({ id, opts }),
    settle: (id) => settled.push(id),
    log: async (e) => logs.push(e),
    paired: async () => true,
  });
  globalThis.fetch = fetchImpl || (async (url) => new Response(JSON.stringify({ list: [] }), { status: 200, headers: { 'content-type': 'application/json' } }));
  return { sent, raised, settled, logs };
}

function jsonResp(body, url, status = 200) {
  const r = new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  Object.defineProperty(r, 'url', { value: url });
  return r;
}

const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms));

test('确认哨兵：未改设置只发 watch_confirm；改了设置先发 watch_confirm 再发 watch_update', async () => {
  const w1 = makeWatch({ id: 'w_confirm1', site: 'c1.example.com' });
  const h = setupHarness(async () => jsonResp({ list: [] }, w1.target.url));
  try {
    await runner.onWatchMessage({ type: 'watch_set', watch: w1 });
    assert.equal(h.raised.length, 1);
    // 面板点「允许」总会带上 form.read()，值没变时不该多余发 watch_update
    await runner.confirmWatch(w1.id, true, { ...w1.settings });
    await wait();
    const types1 = h.sent.map((m) => m.type);
    assert.equal(types1[0], 'watch_confirm');
    assert.equal(types1.includes('watch_update'), false);

    // 改了设置再允许：必须先 watch_confirm 后 watch_update
    const w2 = makeWatch({ id: 'w_confirm2', site: 'c2.example.com' });
    h.sent.length = 0;
    await runner.onWatchMessage({ type: 'watch_set', watch: w2 });
    await runner.confirmWatch(w2.id, true, { ...w2.settings, every: 600 });
    await wait();
    const idxConfirm = h.sent.findIndex((m) => m.type === 'watch_confirm');
    const idxUpdate = h.sent.findIndex((m) => m.type === 'watch_update');
    assert.ok(idxConfirm >= 0 && idxUpdate > idxConfirm, `expected watch_confirm before watch_update, got ${h.sent.map((m) => m.type)}`);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('离线确认并改设置后重连：onWelcome 先发 watch_confirm 再发 watch_update', async () => {
  const w = makeWatch({ id: 'w_welc', site: 'welc.example.com' });
  const h = setupHarness(async () => jsonResp({ list: [] }, w.target.url));
  try {
    await runner.onWatchMessage({ type: 'watch_set', watch: w });
    await runner.confirmWatch(w.id, true, { ...w.settings, every: 900 });
    await wait();
    // 模拟服务器没收到、重连触发 onWelcome
    h.sent.length = 0;
    await runner.onWelcome();
    const idxConfirm = h.sent.findIndex((m) => m.type === 'watch_confirm');
    const idxUpdate = h.sent.findIndex((m) => m.type === 'watch_update');
    assert.ok(idxConfirm >= 0 && idxUpdate > idxConfirm, `got ${h.sent.map((m) => m.type)}`);

    // 服务器发来覆盖已确认目标的新版 watch_set：同步 confirmedRev，且暂停时不自动检查
    let fetches = 0;
    globalThis.fetch = async () => { fetches++; return jsonResp({ list: [] }, w.target.url); };
    await runner.onWatchMessage({ type: 'watch_set', watch: { ...w, rev: 3, settings: { ...w.settings, every: 900, paused: true } } });
    await wait();
    assert.equal(fetches, 0, 'paused watch_set should not trigger a check');
    h.sent.length = 0;
    await runner.onWelcome();
    const c = h.sent.find((m) => m.type === 'watch_confirm');
    assert.equal(c.rev, 3, 'confirmedRev should advance to latest covered rev');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('拒绝后：同版本重发保持 refused，新版本（网页点恢复）重新弹出确认', async () => {
  const w = makeWatch({ id: 'w_refuse', site: 'ref.example.com', rev: 1 });
  const h = setupHarness();
  try {
    await runner.onWatchMessage({ type: 'watch_set', watch: w });
    await runner.confirmWatch(w.id, false);
    assert.equal((await runner.watchPanelState()).list[0].status, 'refused');

    // 重连收到同 rev 的 watch_set：仍保持 refused，不打扰用户
    h.raised.length = 0;
    await runner.onWatchMessage({ type: 'watch_set', watch: w });
    assert.equal((await runner.watchPanelState()).list[0].status, 'refused');
    assert.equal(h.raised.length, 0);

    // 用户在网页点「恢复值守」，服务器 rev++ 重发：回到 pending 并重新提示确认
    await runner.onWatchMessage({ type: 'watch_set', watch: { ...w, rev: 2 } });
    assert.equal((await runner.watchPanelState()).list[0].status, 'pending');
    assert.equal(h.raised.length, 1);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('手动立即检查和重建基线不受 10 秒同站冷却阻拦，中文字段也能跑通', async () => {
  const w = makeWatch({
    id: 'w_manual',
    site: 'manual.example.com',
    target: { site: 'manual.example.com', url: 'https://manual.example.com/api/list', fields: ['标题', 'last-msg'] },
    detect: { mode: 'api', items: '$.list[*]', key: 'id', fields: { '标题': 't', 'last-msg': 'm' } },
  });
  let items = [{ id: '1', t: '第一条', m: '你好' }];
  const h = setupHarness(async () => jsonResp({ list: items }, w.target.url));
  try {
    await runner.onWatchMessage({ type: 'watch_set', watch: w });
    await runner.confirmWatch(w.id, true);
    await wait();
    assert.equal(h.sent.filter((m) => m.type === 'event').length, 0, 'baseline emits no event');

    // 紧接着不到 10 秒内手动点「立即检查」：应立即生效并上报新条目
    items = [{ id: '1', t: '第一条', m: '你好' }, { id: '2', t: '第二条', m: '在吗' }];
    await runner.checkNow(w.id);
    const evs = h.sent.filter((m) => m.type === 'event');
    assert.equal(evs.length, 1);
    assert.deepEqual(evs[0].items, [{ key: '2', fields: { '标题': '第二条', 'last-msg': '在吗' } }]);

    // 紧接着重建基线：立刻把新条目记入基线而不上报
    items = [...items, { id: '3', t: '第三条', m: '跳过' }];
    await runner.rebaseline(w.id);
    assert.equal(h.sent.filter((m) => m.type === 'event').length, 1);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('连续同原因失败在达到 WATCH_FAIL_MAX（5 次）前逐次上报 streak，之后节流', async () => {
  const w = makeWatch({ id: 'w_fail', site: 'fail.example.com' });
  const h = setupHarness(async () => jsonResp({ error: 'unauth' }, w.target.url, 401));
  try {
    await runner.onWatchMessage({ type: 'watch_set', watch: w });
    await runner.confirmWatch(w.id, true);
    await wait();
    // 第一次检查已在 confirmWatch 后触发（streak=1）；再手动触发 5 次（streak=2..6）
    for (let i = 0; i < 5; i++) await runner.checkNow(w.id);
    const states = h.sent.filter((m) => m.type === 'watch_state' && m.ok === false);
    assert.deepEqual(states.map((m) => m.streak), [1, 2, 3, 4, 5], 'should report streaks 1..5 and throttle 6');
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('实时监听模式（live，以 Gmail 新邮件为例）：常驻后台标签页、零轮询即刻触发、防伪造、hold 重建基线与暂停关闭', async () => {
  const w = makeWatch({
    id: 'w_gmail',
    site: 'mail.google.com',
    target: { site: 'mail.google.com', url: 'https://mail.google.com/mail/u/0/#inbox', fields: ['from', 'subject', 'snippet'] },
    detect: {
      mode: 'live',
      items: 'div[role="main"] tr.zA',
      key: 'span[data-legacy-thread-id]@data-legacy-thread-id',
      fields: { from: '.yX .zF', subject: '.bog', snippet: '.y2' },
      ready: 'div[role="main"]',
    },
    settings: { batchMs: 5000 },
  });
  const h = setupHarness();
  let attached = null;
  let currentInbox = [{ key: 't1', fields: { from: 'Alice', subject: 'Hello', snippet: 'old email' } }];
  scriptHandler = async ({ target, args }) => {
    const [id, token, detect, _max, _readyMs, attrs] = args;
    attached = { tabId: target.tabId, id, token, detect, attrs };
    return { ok: true, items: currentInbox };
  };
  tabMsgHandler = async (tabId, msg) => {
    if (attached && tabId === attached.tabId && msg.__hcWatchPing === attached.id && msg.token === attached.token) return { ok: true };
    if (attached && tabId === attached.tabId && msg.__hcWatchPull === attached.id && msg.token === attached.token) return { ok: true, items: currentInbox };
    if (attached && tabId === attached.tabId && msg.__hcWatchStop === attached.id) return { ok: true };
    throw new Error('no listener');
  };

  try {
    await runner.onWatchMessage({ type: 'watch_set', watch: w });
    assert.ok(h.raised[0].opts.message.includes('实时监听'), 'confirm notification should describe live mode');
    await runner.confirmWatch(w.id, true);
    await wait();

    // 确认后应自动在折叠的「vcorp 值守」标签组打开后台标签页，并设 autoDiscardable=false
    assert.ok(attached, 'live observer should be attached');
    const tab = tabs.get(attached.tabId);
    assert.equal(tab.active, false);
    assert.equal(tab.autoDiscardable, false);
    assert.equal(tabGroups.get(tab.groupId).title, 'vcorp 值守');
    assert.equal(tabGroups.get(tab.groupId).collapsed, true);
    assert.ok(attached.attrs.includes('data-legacy-thread-id'));
    assert.equal(h.sent.filter((m) => m.type === 'event').length, 0, 'initial baseline emits no event');
    assert.equal((await runner.watchPanelState()).list[0].liveTab, true);

    // 伪造 token 或伪造 tabId 的消息必须被拒
    await runner.onLiveMessage(
      { __hcWatch: 'live_items', id: w.id, token: 'wrong-token', items: [{ key: 'spoof', fields: { from: 'x', subject: 'y', snippet: 'z' } }] },
      { tab: { id: attached.tabId, url: w.target.url } },
    );
    assert.equal(h.sent.filter((m) => m.type === 'event').length, 0, 'bad token must be ignored');

    // Gmail DOM 推来一封新邮件 → MutationObserver 立即回报 → 马上发 event（不靠轮询）
    const mail2 = { key: 't2', fields: { from: 'Boss', subject: 'Urgent', snippet: 'Please review' } };
    currentInbox = [mail2, ...currentInbox];
    await runner.onLiveMessage(
      { __hcWatch: 'live_items', id: w.id, token: attached.token, items: currentInbox },
      { tab: { id: attached.tabId, url: w.target.url } },
    );
    const evs = h.sent.filter((m) => m.type === 'event');
    assert.equal(evs.length, 1);
    assert.deepEqual(evs[0].items, [mail2]);

    // Agent 运行期间 hold=true：标签页保持常驻不关，但忽略这期间的 DOM 抖动
    await runner.onWatchMessage({ type: 'watch_hold', id: w.id, hold: true });
    assert.ok(tabs.has(attached.tabId), 'live tab stays open during hold');
    const mail3 = { key: 't3', fields: { from: 'Bot', subject: 'During run', snippet: 'ignored until rebaseline' } };
    currentInbox = [mail3, ...currentInbox];
    await runner.onLiveMessage(
      { __hcWatch: 'live_items', id: w.id, token: attached.token, items: currentInbox },
      { tab: { id: attached.tabId, url: w.target.url } },
    );
    assert.equal(h.sent.filter((m) => m.type === 'event').length, 1, 'mutations during hold must not emit');

    // Agent 结束 hold=false, rebaseline=true：直接向已开标签页 pull 重建基线，不新开标签页
    const tabCountBefore = tabs.size;
    await runner.onWatchMessage({ type: 'watch_hold', id: w.id, hold: false, rebaseline: true });
    await wait();
    assert.equal(tabs.size, tabCountBefore, 'rebaseline reuses existing live tab');
    assert.equal(h.sent.filter((m) => m.type === 'event').length, 1, 'rebaseline does not re-emit');

    // 暂停哨兵：自动关掉常驻后台标签页
    await runner.updateWatch(w.id, { paused: true });
    assert.equal(tabs.has(attached.tabId), false, 'pausing closes live tab');
    assert.equal((await runner.watchPanelState()).list[0].liveTab, false);
  } finally {
    globalThis.fetch = origFetch;
  }
});
