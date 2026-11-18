// Flow 驱动（src/lib/flow-driver.js）：对着一个假的扩展 link 跑，页面那一半按能力包的回报来演。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createFlowDriver, pickChoice, creditShortfall, flowPrompt, pageLink, runSiteGeneration } from '../src/lib/flow-driver.js';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const MP4 = Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42'), Buffer.alloc(200, 7)]);
// 页面上显示的地址：不假定任何域名或格式
const MEDIA = 'https://cdn.example/asb/AbCdEf123=s1600-rw';
const quick = { sleep: async () => {} };
const fail = (code, message = code) => Object.assign(new Error(message), { code });

// 假扩展：记下每条命令，按 page 的状态回报，和 opus-video-maker 里的 fakeExt 演的是同一出
function fakeLink({ loggedIn = true, project = null, approval = true, refusal = null, blocker = null, media = PNG, chunk = 50, fetchFails = false, url = MEDIA, oldPack = false, oops = 0, ask = null, stall = null, credits = null } = {}) {
  const page = { blockLeft: blocker?.times || 0, loggedIn, project, prompt: '', ingredients: [], uploaded: [], approved: false, submitted: false, panel: false, editing: false, menu: false, got: false, oopsLeft: oops, oopsShown: 0, answer: null, replies: [], sent: [], tabs: 0 };
  const log = [];
  const state = () => ({
    loggedIn: page.loggedIn, project: page.project, promptChars: page.prompt.length,
    canStart: !!page.project && page.prompt.length > 0, ingredients: page.ingredients, options: page.panel ? page.uploaded.length : 0, editing: page.editing,
    marks: { back: page.editing, prompt: !!page.project, start: !!page.project, 'new-session': !!page.project, add: !!page.project,
      'open-project': !page.project, 'new-project': !page.project, 'uploads-tab': page.panel, account: !!credits && !page.account, 'close-account': !!page.account },
    credits: page.account ? credits : null,
  });
  const packs = {
    'flow.state': state,
    'flow.option': ({ name }) => ({ found: page.panel && page.uploaded.includes(name), disabled: false }),
    'flow.baseline': () => ({ known: 0 }),
    'flow.blocker': () => (page.blockLeft > 0 && blocker.loading
      ? { blocked: true, layout: true, by: { tag: 'flow-loading-page', cls: 'loading-page-fade-out' }, target: [1500 + page.blockLeft, 1222, 32, 32], viewport: [1558, 1299], hidden: true }
      : page.blockLeft > 0 && blocker.layout
        ? { blocked: true, layout: true, by: { tag: 'div', cls: 'content-container' }, target: [1462, 83, 34, 34], viewport: [1200, 800], hidden: true }
        : page.blockLeft > 0
          ? { blocked: true, by: { tag: 'div', role: 'dialog', label: 'Welcome to Flow' }, dismiss: !!blocker.dismiss }
          : { blocked: false }),
    'flow.result': ({ kind, exclude, approved, failures, sent }) => {
      assert.deepEqual(exclude, page.ingredients);
      if (page.sent[page.sent.length - 1] !== sent) page.sent.push(sent);
      if (refusal) return { done: false, refusal };
      if (ask && page.answer == null) return { done: false, question: ask.question, options: ask.options };
      if (stall && page.replies.length < stall.needs) return { done: false, talk: { text: stall.text, ask: !!stall.ask, quietMs: 30000, busy: !!stall.busy }, ...(stall.poster ? { poster: true } : {}) };
      if (page.oopsLeft > 0) {
        if (page.oopsShown <= (failures || 0)) page.oopsShown++;
        return { done: false, failed: 'Something went wrong. Please try again.', failures: page.oopsShown, retry: true };
      }
      if (approval && !approved) return { done: false, approval: true };
      return { done: true, kind, key: 'k1', url, width: 1376, height: 768 };
    },
    'flow.download': ({ key, arm, quality }) => {
      assert.equal(key, 'k1');
      assert.equal(quality, '720p');
      if (arm) page.got = false;
      return page.got ? { got: true, size: media.length } : { got: false, editor: page.editing, menu: page.menu };
    },
  };
  const link = {
    page, log,
    fetchParams: { binary: 'base64' },
    takeBytes: (data) => (data?.base64 ? Buffer.from(data.base64, 'base64') : null),
    async upload({ bytes, name, type }, dropSelector) {
      log.push('upload');
      assert.ok(bytes.length && type);
      assert.equal(dropSelector, '[data-vcorp-flow="prompt"]');
      page.uploaded.push(name);
    },
    async call(cmd, params, { tabId } = {}) {
      log.push(cmd === 'call' ? params.action : cmd === 'click' ? `click ${params.selector.match(/"(.+)"/)[1]}` : cmd);
      if (cmd === 'tabs') { page.tabs++; return { tabId: 7 }; }
      assert.equal(tabId, 7);
      if (cmd === 'load') return { version: '1' };
      if (cmd === 'navigate') { page.project = params.url.split('/').pop(); return {}; }
      if (cmd === 'call' && params.action === 'flow.fetch') {
        assert.equal(params.binary, 'base64');
        if (fetchFails) throw fail('LOAD_ERROR', 'flow.flow.fetch 失败：页面里取不到这个图片：Failed to fetch');
        const { offset } = params.payload;
        const part = media.subarray(offset, offset + chunk);
        return { text: JSON.stringify({ key: 'k1', size: media.length, offset, bytes: part.length, done: offset + part.length >= media.length }), base64: part.toString('base64') };
      }
      if (cmd === 'call' && oldPack && params.action === 'flow.download') throw fail('LOAD_DENIED', 'flow 小脑不接受 flow.download');
      if (cmd === 'call') return { text: JSON.stringify(packs[params.action](params.payload)) };
      if (cmd === 'fill') { page.prompt = params.fields[0].value; return {}; }
      if (cmd === 'key') { page.panel = false; if (blocker && !blocker.dismiss && !blocker.stuck) page.blockLeft = Math.max(0, page.blockLeft - 1); return {}; }
      if (cmd === 'click') {
        const what = params.selector.match(/"(.+)"/)[1];
        assert.equal(params.real === true, (['start', 'approve', 'account', 'retry', 'result', 'download-media', 'download-option'].includes(what) || /^choice-\d$/.test(what)), `real on ${what}`);
        if (what === 'dismiss') { if (!blocker.stuck) page.blockLeft = Math.max(0, page.blockLeft - 1); return {}; }
        if (blocker?.loading && what === blocker.on && page.blockLeft > 0) { page.blockLeft--; throw fail('NOT_INTERACTABLE'); }
        if (blocker && what === blocker.on && page.blockLeft > 0) throw fail('NOT_INTERACTABLE');
        if (what === 'open-project' || what === 'new-project') page.project = 'p1';
        if (what === 'add') page.panel = true;
        if (what === 'new-session') page.ingredients = [];
        if (what === 'option') page.ingredients.push(`ing${page.ingredients.length + 1}`);
        if (what === 'start') { if (page.submitted) page.replies.push(page.prompt); page.prompt = ''; page.submitted = true; }
        if (what === 'approve') page.approved = true;
        if (what === 'account') page.account = true;
        if (what === 'close-account') page.account = false;
        if (what === 'result') page.editing = true;
        if (what === 'download-media') page.menu = page.editing;
        if (what === 'download-option') { page.got = page.menu; page.menu = false; }
        if (what === 'back') page.editing = false;
        if (what === 'retry') page.oopsLeft--;
        if (/^choice-\d$/.test(what)) { page.clicked = [...(page.clicked || []), what]; if (!ask.stuck) page.answer = Number(what.slice(7)); }
        return {};
      }
      throw fail('X', cmd);
    },
  };
  return link;
}

const fetchPng = async (u) => {
  assert.equal(u, MEDIA);
  fetchPng.calls = (fetchPng.calls || 0) + 1;
  return { ok: true, status: 200, headers: { get: () => null }, arrayBuffer: async () => PNG.buffer.slice(PNG.byteOffset, PNG.byteOffset + PNG.length) };
};
const gen = (link, req, { log = () => {}, ...o } = {}) => createFlowDriver({ link, fetchFn: fetchPng, ...quick, ...o }).generate({}, { kind: 'image', prompt: 'x', timeoutMs: 60000, ...req }, log);

test('Flow 驱动：开项目、挂参考图、提交、确认一次、取回结果；同一个 run 复用标签页', async () => {
  const link = fakeLink();
  const d = createFlowDriver({ link, fetchFn: () => assert.fail('页面自己交出字节'), ...quick });
  const run = {};
  const out = await d.generate(run, { kind: 'image', prompt: 'a hill. Only one image.', refs: [{ bytes: PNG, mime: 'image/png' }], timeoutMs: 60000 });
  assert.equal(out.mime, 'image/png');
  assert.deepEqual(out.bytes, PNG);
  assert.equal(out.width, 1376);
  assert.equal(out.project, 'p1');
  assert.match(link.page.uploaded[0], /^ref1-[0-9a-f]{6}\.png$/);
  const seq = link.log.filter((s) => !/flow\.state|flow\.option/.test(s));
  assert.deepEqual(seq, ['tabs', 'load', 'click open-project', 'click new-session', 'upload', 'click add', 'click uploads-tab', 'click option', 'key', 'fill', 'flow.baseline', 'click start', 'flow.result', 'click approve', 'flow.result', 'flow.fetch', 'flow.fetch']);
  link.log.length = 0;
  await d.generate(run, { kind: 'image', prompt: 'b', timeoutMs: 60000 });
  assert.equal(link.log.includes('tabs'), false);
});

test('Flow 驱动：出结果后打开账户面板读剩余 credits，再关上；读不到是 null', async () => {
  const left = { left: 565, unit: 'credits', resetsAt: 1794924120000, resetsText: 'Resets Nov 18 at 11:22 PM' };
  const link = fakeLink({ credits: left });
  const out = await gen(link, {});
  assert.deepEqual(out.credits, left);
  assert.equal(link.page.account, false);
  assert.ok(link.log.includes('click account') && link.log.includes('click close-account'));
  assert.equal((await gen(fakeLink(), {})).credits, null);
});

test('Flow 驱动：给了 project 就进那个项目', async () => {
  const link = fakeLink({ project: 'p1', approval: false });
  const out = await createFlowDriver({ link, ...quick }).generate({ tabId: 7, project: 'p9' }, { kind: 'image', prompt: 'x', timeoutMs: 60000 });
  assert.equal(out.project, 'p9');
  assert.equal(link.page.tabs, 0);
  assert.ok(link.log.includes('navigate'));
});

test('Flow 驱动：run.fresh 新建自己的项目，不进主人上次的项目；之后一直用它', async () => {
  const link = fakeLink({ project: 'p0', approval: false });
  const d = createFlowDriver({ link, ...quick });
  const run = { fresh: true };
  const out = await d.generate(run, { kind: 'image', prompt: 'x', timeoutMs: 60000 });
  assert.equal(out.project, 'p1');
  assert.equal(run.project, 'p1');
  const seq = link.log.filter((s) => !/flow\.state|flow\.option/.test(s));
  assert.deepEqual(seq.slice(0, 5), ['tabs', 'load', 'navigate', 'load', 'click new-project']);
  assert.equal(seq.includes('click open-project'), false);
  link.log.length = 0;
  link.page.project = 'p0';   // 有人在这个标签页里点去了别的项目
  await d.generate(run, { kind: 'image', prompt: 'y', timeoutMs: 60000 });
  assert.equal(link.page.project, 'p1');
  assert.equal(link.log.includes('click new-project'), false);
});

test('Flow 驱动：没登录、被拒、交来的不是图，都停下', async () => {
  const now = (() => { let t = 0; return () => (t += 5000); })();
  await assert.rejects(gen(fakeLink({ loggedIn: false }), {}, { now }), (e) => e.status === 409 && e.code === 'NOT_LOGGED_IN');
  await assert.rejects(gen(fakeLink({ project: 'p1', refusal: 'not enough credits' }), { kind: 'video' }), (e) => e.status === 422 && /credits/.test(e.message));
  await assert.rejects(gen(fakeLink({ project: 'p1', approval: false, media: Buffer.from('<!doctype html>') }), {}), (e) => e.code === 'BAD_MEDIA' && /不是图片/.test(e.message));
  // 没有浏览器：码原样带出，状态 409
  const none = { call: async () => { throw fail('NO_BROWSER', '扩展没有在线'); } };
  await assert.rejects(createFlowDriver({ link: none, ...quick }).generate({}, { kind: 'image', prompt: 'x', timeoutMs: 60000 }), (e) => e.status === 409 && e.code === 'NO_BROWSER');
});

test('Flow 驱动：关掉挡住按钮的东西接着做；关不掉就说是什么挡着', async () => {
  const refs = [{ bytes: PNG, mime: 'image/png' }];
  const logs = [];
  assert.deepEqual((await gen(fakeLink({ project: 'p1', approval: false, blocker: { on: 'add', times: 1, dismiss: true } }), { refs }, { log: (s) => logs.push(s) })).bytes, PNG);
  assert.ok(logs.some((l) => /「add」被dialog「Welcome to Flow」挡住，点它的关闭按钮后重试/.test(l)), logs.join('\n'));
  await gen(fakeLink({ project: 'p1', approval: false, blocker: { on: 'start', times: 2 } }), {});
  await assert.rejects(gen(fakeLink({ project: 'p1', approval: false, blocker: { on: 'start', times: 99, dismiss: true, stuck: true } }), {}),
    (e) => e.code === 'FLOW_BLOCKED' && /Welcome to Flow/.test(e.message) && /原样重试没有用/.test(e.message));
  // 页面自己的内容盖着：不按 Escape；新会话那一步跳过
  const lay = fakeLink({ project: 'p1', approval: false, blocker: { on: 'new-session', times: 99, layout: true, stuck: true } });
  const l4 = [];
  assert.deepEqual((await gen(lay, {}, { log: (s) => l4.push(s) })).bytes, PNG);
  assert.ok(l4.some((l) => /「new-session」点不到（被页面内容.*不是弹窗.*标签页在后台）.*跳过/.test(l)), l4.join('\n'));
  assert.equal(lay.log.filter((x) => x === 'key').length, 0);
  await assert.rejects(gen(fakeLink({ project: 'p1', approval: false, blocker: { on: 'start', times: 99, layout: true, stuck: true } }), {}),
    (e) => e.code === 'FLOW_BLOCKED' && /不是弹窗/.test(e.message));
  // 还在加载：等它
  const busy = fakeLink({ project: 'p1', approval: false, blocker: { on: 'add', times: 5, loading: true } });
  const l5 = [];
  assert.deepEqual((await gen(busy, { refs }, { log: (s) => l5.push(s) })).bytes, PNG);
  assert.equal(l5.filter((l) => /页面还在加载/.test(l)).length, 1, l5.join('\n'));
});

test('Flow 驱动：视频走 Flow 自己的 Download media，下一次先退回项目；老能力包退回页面里取', async () => {
  const link = fakeLink({ project: 'p1', approval: false, media: MP4 });
  const logs = [];
  const d = createFlowDriver({ link, fetchFn: () => assert.fail('fetched'), ...quick });
  const run = {};
  const out = await d.generate(run, { kind: 'video', prompt: 'x', timeoutMs: 60000 }, (s) => logs.push(s));
  assert.equal(out.mime, 'video/mp4');
  assert.deepEqual(out.bytes, MP4);
  const seq = link.log.filter((s) => !/flow\.state|flow\.download/.test(s));
  assert.deepEqual(seq.slice(seq.indexOf('flow.result')), ['flow.result', 'click result', 'click download-media', 'click download-option', 'flow.fetch', 'flow.fetch', 'flow.fetch', 'flow.fetch', 'flow.fetch']);
  assert.ok(logs.some((l) => /用 Flow 自己的下载取到视频/.test(l)));
  link.log.length = 0;
  await d.generate(run, { kind: 'video', prompt: 'y', timeoutMs: 60000 });
  assert.equal(link.log.filter((s) => s !== 'flow.state')[1], 'click back');

  const l2 = [];
  assert.deepEqual((await gen(fakeLink({ project: 'p1', approval: false, media: MP4, oldPack: true }), { kind: 'video' }, { log: (s) => l2.push(s) })).bytes, MP4);
  assert.ok(l2.some((l) => /Flow 自己的下载没成/.test(l)));
});

test('Flow 驱动：Flow 报错点一次 Try again，再报错就停', async () => {
  const once = fakeLink({ project: 'p1', approval: false, oops: 1 });
  assert.deepEqual((await gen(once, {})).bytes, PNG);
  assert.equal(once.log.filter((x) => x === 'click retry').length, 1);
  const twice = fakeLink({ project: 'p1', approval: false, oops: 2 });
  await assert.rejects(gen(twice, {}), (e) => e.code === 'FLOW_ERROR' && /已经点过一次/.test(e.message));
  assert.equal(twice.log.filter((x) => x === 'click retry').length, 1);
});

test('pickChoice：先保要的模型，再保时长至少够', () => {
  const veo = ['Use 8s with Veo 3.1 - Fast', 'Switch to Omni 1.2 Flash for 6s'];
  assert.equal(pickChoice(veo, { model: 'Veo 3.1 Fast', seconds: 6 }), 0);
  assert.equal(pickChoice(veo, { model: 'Omni 1.2 Flash', seconds: 6 }), 1);
  assert.equal(pickChoice(veo, { model: 'Kling 2', seconds: 6 }), 0);
  assert.equal(pickChoice(['Make it 4 seconds', 'Make it 8 seconds'], { seconds: 6 }), 1);
  assert.equal(pickChoice(['Landscape', 'Portrait'], {}), 0);
  // 花钱的选项不替用户选
  assert.equal(pickChoice(['Upgrade subscription', 'Use a shorter 4s clip'], { seconds: 6 }), 1);
});

test('creditShortfall：读出 Flow 说的 credits 不够；只报价不算', () => {
  const said = 'Generating this video requires 20 credits, but your account currently has 3 credits available. To proceed, please visit the Flow subscription page to upgrade your plan or top up your balance, then let me know once that\'s complete!';
  assert.deepEqual(creditShortfall(said), { need: 20, left: 3 });
  assert.ok(creditShortfall('You can upgrade your subscription tier or top up your credits on the Flow subscription page.'));
  assert.ok(creditShortfall('Not enough credits'));
  assert.equal(creditShortfall('This video will use 20 credits. Shall I go ahead?'), null);
  assert.equal(creditShortfall('This requires 20 credits and you have 500 credits available.'), null);
  assert.equal(creditShortfall('Which style do you want?'), null);
});

test('Flow 驱动：回答反问；答了不生效两次就停', async () => {
  const ask = { question: 'Veo 3.1 - Fast only supports 8-second video durations. Would you like to:', options: ['Use 8s with Veo 3.1 - Fast', 'Switch to Omni 1.2 Flash for 6s'] };
  const want = { model: 'Veo 3.1 Fast', seconds: 6 };
  const link = fakeLink({ project: 'p1', approval: false, ask });
  const logs = [];
  await gen(link, { want }, { log: (s) => logs.push(s) });
  assert.deepEqual(link.page.clicked, ['choice-0']);
  assert.ok(logs.some((l) => /Flow 问：.*选了「Use 8s with Veo 3.1 - Fast」/.test(l)));
  const stuck = fakeLink({ project: 'p1', approval: false, ask: { ...ask, stuck: true } });
  await assert.rejects(gen(stuck, { want }), (e) => e.code === 'FLOW_QUESTION' && /Switch to Omni/.test(e.message));
  assert.equal(stuck.page.clicked.length, 2);
});

test('Flow 驱动：读对话——停住就在对话里回，问了就让它做，在生成时绝不回', async () => {
  const clock = () => { let t = 0; return () => (t += 5000); };
  const ask = { question: 'Veo 3.1 - Fast only supports 8-second video durations. Would you like to:', options: ['Use 8s with Veo 3.1 - Fast', 'Switch to Omni 1.2 Flash for 6s'] };
  const go = (link, timeoutMs = 600000) => gen(link, { prompt: 'a red fox in snow', timeoutMs, want: { model: 'Veo 3.1 Fast', seconds: 6 } }, { now: clock() });
  const a = fakeLink({ project: 'p1', approval: false, ask, stall: { text: 'Use 8s with Veo 3.1 - Fast', needs: 1 } });
  await go(a);
  assert.equal(a.page.replies.length, 1);
  assert.match(a.page.replies[0], /Use 8s with Veo 3\.1 - Fast/);
  assert.equal(a.page.sent[0], 'a red fox in snow');
  assert.equal(a.page.sent[a.page.sent.length - 1], a.page.replies[0]);
  const b = fakeLink({ project: 'p1', approval: false, stall: { text: 'Should I use a wider shot?', ask: true, needs: 1 } });
  await go(b);
  assert.match(b.page.replies[0], /go ahead/i);
  const c = fakeLink({ project: 'p1', approval: false, stall: { text: 'Which style do you prefer?', ask: true, needs: Infinity } });
  await assert.rejects(go(c), (e) => e.code === 'FLOW_STALLED' && /Which style do you prefer/.test(e.message));
  assert.equal(c.page.replies.length, 2);
  for (const stall of [{ text: 'Okay.', needs: Infinity }, { text: 'Should I?', ask: true, busy: true, needs: Infinity }, { text: 'Should I?', ask: true, poster: true, needs: Infinity }]) {
    const d = fakeLink({ project: 'p1', approval: false, stall });
    await assert.rejects(go(d, 120000), (e) => e.code === 'TIMEOUT');
    assert.equal(d.page.replies.length, 0, JSON.stringify(stall));
  }
});

test('Flow 驱动：credits 不够就停，不回话、不点升级，报 409 NO_CREDITS', async () => {
  const clock = () => { let t = 0; return () => (t += 5000); };
  const go = (link) => gen(link, { prompt: 'a red fox', timeoutMs: 600000, want: { model: 'Omni 1.2 Flash', seconds: 6 } }, { now: clock() });
  const said = 'Generating this video requires 20 credits, but your account currently has 3 credits available. To proceed, please upgrade your plan or top up your balance.';
  const a = fakeLink({ project: 'p1', approval: false, stall: { text: said, ask: true, needs: Infinity } });
  await assert.rejects(go(a), (e) => e.code === 'NO_CREDITS' && e.status === 409 && e.need === 20 && e.left === 3);
  assert.equal(a.page.replies.length, 0);
  const ask = { question: 'You do not have enough credits for this video. Would you like to:', options: ['Upgrade subscription', 'Top up credits'] };
  const b = fakeLink({ project: 'p1', approval: false, ask });
  await assert.rejects(go(b), (e) => e.code === 'NO_CREDITS');
  assert.deepEqual(b.page.clicked ?? [], []);
});

test('Flow 驱动：页面取不到时直接下载，但只认普通 https 地址', async () => {
  fetchPng.calls = 0;
  const logs = [];
  assert.deepEqual((await gen(fakeLink({ project: 'p1', approval: false, fetchFails: true }), {}, { log: (s) => logs.push(s) })).bytes, PNG);
  assert.equal(fetchPng.calls, 1);
  for (const url of ['blob:https://flow.google.com/1234', 'http://10.0.0.1/a.png', 'https://127.0.0.1/a.png']) {
    await assert.rejects(createFlowDriver({ link: fakeLink({ project: 'p1', approval: false, fetchFails: true, url }), fetchFn: () => assert.fail(url), ...quick })
      .generate({}, { kind: 'image', prompt: 'x', timeoutMs: 60000 }), (e) => e.status === 502);
  }
});

test('flowPrompt 把模型、时长、画幅和参考图用法都写进去', () => {
  assert.equal(flowPrompt({ kind: 'video', prompt: 'waves.', model: 'Omni 1.2 Flash', seconds: 6, aspect: '16:9', refs: 1, mode: 'frames' }),
    'Generate one video with Omni 1.2 Flash, 6 seconds, 720p, 16:9: waves. Use the attached image as the first frame. Only this one video, nothing else.');
  assert.equal(flowPrompt({ kind: 'image', prompt: 'a cat', aspect: '1:1' }), 'a cat. Aspect ratio 1:1. Only one image.');
});

test('站点函数：本机 page 上跑驱动，图存进 outDir，返回网关 /v1/media 认得的 url', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-site-'));
  try {
    const ref = path.join(dir, 'in.png');
    fs.writeFileSync(ref, PNG);
    // 页面显示的地址里带着 Flow 的媒体 id：用它
    const link = fakeLink({ project: 'p1', approval: false, url: 'https://flow-content.google/image/11111111-2222-3333-4444-555555555555?x=1' });
    const uploads = [];
    // 像 page.js 的 Page：_cmd(cmd, params, timeoutMs)，命令发到它绑定的标签页
    const page = { tabId: 7, _cmd: (cmd, params) => (cmd === 'upload' ? (uploads.push(params), link.upload({ bytes: Buffer.from(params.base64, 'base64'), name: params.name, type: params.type }, params.dropSelector)) : link.call(cmd, params, { tabId: 7 })) };
    const out = await runSiteGeneration('image', { page, args: { prompt: 'a cat', aspect: '1:1', images: [ref], outDir: path.join(dir, 'out') } }, quick);
    assert.equal(out.mediaId, '11111111-2222-3333-4444-555555555555');
    assert.equal(out.url, 'https://flow-content.google/image/11111111-2222-3333-4444-555555555555');
    assert.deepEqual(fs.readFileSync(out.file), PNG);
    assert.equal(path.basename(out.file), `${out.mediaId}.png`);
    assert.equal(uploads[0].type, 'image/png');
    assert.equal(link.page.tabs, 0, '用站点函数拿到的那个标签页');
    assert.match(link.page.sent[0], /^a cat\. Use the attached image as the reference\. Aspect ratio 1:1\. Only one image\.$/);

    // 地址里没有 id：由结果的 key 派生一个同样形状的
    const l2 = fakeLink({ project: 'p1', approval: false });
    const o2 = await runSiteGeneration('image', { page: { tabId: 7, _cmd: (c, p) => l2.call(c, p, { tabId: 7 }) }, args: { prompt: 'x', outDir: dir } }, quick);
    assert.match(o2.url, /^https:\/\/flow-content\.google\/image\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);

    await assert.rejects(runSiteGeneration('video', { page, args: { prompt: 'x' } }), (e) => e.code === 'BAD_ARGS');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('pageLink：字节走 base64，命令发给 page', async () => {
  const sent = [];
  const page = { tabId: 3, _cmd: async (cmd, params, t) => { sent.push([cmd, params, t]); return cmd === 'tabs' ? { tabId: 9 } : { base64: PNG.toString('base64') }; } };
  const l = pageLink(page);
  assert.deepEqual(l.fetchParams, { binary: 'base64' });
  assert.deepEqual(l.takeBytes(await l.call('call', {})), PNG);
  await l.upload({ bytes: PNG, name: 'a.png', type: 'image/png' }, '[x]');
  assert.equal(sent[1][0], 'upload');
  assert.equal(sent[1][1].base64, PNG.toString('base64'));
  await l.call('tabs', { action: 'new' });
  assert.equal(page.tabId, 9);
});
