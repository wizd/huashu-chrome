// 哨兵运行器（watch-runner.js）的状态机和协议测试 —— 模拟 chrome.storage 与 fetch，不需要真实浏览器

import { test } from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
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
