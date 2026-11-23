// 哨兵的规矩 —— 不需要浏览器，进 `npm test`
//
// 哨兵是服务器下发、长期运行的读取规则。服务器被攻破时，攻击者会试着：
// 把目标换成别的网站、多报几个字段、塞代码进选择器、用原型链路径读出不该读的东西。
// 下面每一条都要挡住。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkWatch, checkWatchProbe, targetCovered, cleanEventItems, apiExtract, diffItems, itemHash, watchMatch,
  chunkEvents, watchInHours, watchDay, parsePath, pickJson, jsonItems, parsePageField, cleanWatchSettings,
  pageObservedAttrs, WATCH_MAX, WATCH_EVERY_MIN, WATCH_FIELD_MAX, WATCH_SEEN_MAX,
} from '../extension/watch-policy.js';

const base = () => ({
  id: 'w_job1', jobId: 'job1', title: '闲鱼买家消息', rev: 1,
  target: { site: 'goofish.com', url: 'https://h5api.m.goofish.com/list?x=1', fields: ['from', 'text'] },
  detect: { mode: 'api', items: '$.data.list[*]', key: 'id', fields: { from: 'user.nick', text: 'lastMsg' } },
  settings: { every: 300 },
  note: '未读会话列表',
});

test('合规的哨兵原样通过，缺的设置补默认值', () => {
  const r = checkWatch(base());
  assert.equal(r.ok, true);
  assert.equal(r.watch.target.site, 'goofish.com');
  assert.equal(r.watch.settings.name, '闲鱼买家消息');
  assert.equal(r.watch.settings.batchMs, 120000);
  assert.equal(r.watch.settings.maxRunsPerDay, 48);
  assert.equal(r.watch.settings.paused, false);
});

test('地址不在声明的网站上：拒', () => {
  const w = base();
  w.target.url = 'https://mail.google.com/mail/feed';
  assert.equal(checkWatch(w).ok, false);
  w.target.url = 'https://goofish.com.evil.cn/x';
  assert.equal(checkWatch(w).ok, false);
});

test('网址只收 http(s)、不带账号密码', () => {
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'https://a:b@goofish.com/x', 'chrome://settings']) {
    const w = base();
    w.target.url = url;
    assert.equal(checkWatch(w).ok, false, url);
  }
});

test('共享后缀、IP 当网站：拒', () => {
  for (const site of ['github.io', '127.0.0.1', 'localhost', 'com.cn']) {
    const w = base();
    w.target.site = site;
    assert.equal(checkWatch(w).ok, false, site);
  }
});

test('detect.fields 和 target.fields 不一致：拒（不能偷偷多报字段）', () => {
  const w = base();
  w.detect.fields.cookie = 'token';
  assert.equal(checkWatch(w).ok, false);
  const w2 = base();
  delete w2.detect.fields.text;
  assert.equal(checkWatch(w2).ok, false);
});

test('字段名允许中英文和连字符，拒绝空格和原型链键', () => {
  const ok = base();
  ok.target.fields = ['标题', 'last-msg'];
  ok.detect.fields = { '标题': 'title', 'last-msg': 'lastMsg' };
  assert.equal(checkWatch(ok).ok, true);
  for (const bad of ['a b', '__proto__', 'constructor', 'prototype', '']) {
    const w = base();
    w.target.fields = [bad];
    w.detect.fields = { [bad]: 'a' };
    assert.equal(checkWatch(w).ok, false, bad);
  }
});

test('选择器里不收花括号，路径不收过滤表达式和多个 [*]', () => {
  const p = base();
  p.detect = { mode: 'page', items: '.row{}', key: '@data-id', fields: { from: '.nick', text: '.msg' } };
  assert.equal(checkWatch(p).ok, false);
  const a = base();
  a.detect.items = '$.data.list[?(@.x)]';
  assert.equal(checkWatch(a).ok, false);
  a.detect.items = '$.a[*].b[*]';
  assert.equal(checkWatch(a).ok, false);
});

test('页面模式的哨兵', () => {
  const w = base();
  w.target.url = 'https://www.goofish.com/im';
  w.detect = { mode: 'page', items: '.conversation-item', key: '@data-id', fields: { from: '.nick', text: '.last-msg' }, ready: '.conversation-list' };
  const r = checkWatch(w);
  assert.equal(r.ok, true, r.error);
  assert.equal(r.watch.detect.ready, '.conversation-list');
});

test('数量上限', () => {
  assert.equal(checkWatch(base(), { count: WATCH_MAX - 1 }).ok, true);
  assert.equal(checkWatch(base(), { count: WATCH_MAX }).ok, false);
});

test('设置夹回范围', () => {
  const s = cleanWatchSettings({ every: 5, batchMs: -3, maxRunsPerDay: 9999, tz: 'Not/AZone', include: ['价格', '价格', ''] });
  assert.equal(s.every, WATCH_EVERY_MIN);
  assert.equal(s.batchMs, 0);
  assert.equal(s.maxRunsPerDay, 288);
  assert.equal(s.tz, 'Asia/Shanghai');
  assert.deepEqual(s.include, ['价格']);
  assert.throws(() => cleanWatchSettings({ hours: [3, 3] }));
  assert.deepEqual(cleanWatchSettings({ hours: [22, 7] }).hours, [22, 7]);
});

test('目标覆盖：同站同地址、字段只少不多才算', () => {
  const c = { site: 'goofish.com', url: 'https://h5api.m.goofish.com/list?x=1', fields: ['from', 'text'] };
  assert.equal(targetCovered(c, { ...c, fields: ['from'] }), true);
  assert.equal(targetCovered(c, { ...c, fields: ['from', 'text', 'phone'] }), false);
  assert.equal(targetCovered(c, { ...c, url: 'https://h5api.m.goofish.com/other' }), false);
  assert.equal(targetCovered(null, c), false);
});

test('试跑命令：网站必须是本任务能去的', () => {
  const w = base();
  assert.equal(checkWatchProbe({ action: 'probe', watch: w }, ['goofish.com']).action, 'probe');
  assert.throws(() => checkWatchProbe({ action: 'probe', watch: w }, ['zhipin.com']), /sites/);
  assert.throws(() => checkWatchProbe({ action: 'set', watch: w }, ['goofish.com']));
});

test('路径：只走自有属性，原型链上的东西取不到', () => {
  assert.deepEqual(parsePath('$.a[2][*].b'), [{ k: 'a' }, { i: 2 }, { all: true }, { k: 'b' }]);
  assert.equal(parsePath('$.a..b'), null);
  assert.equal(pickJson({ a: { b: [1, 2] } }, 'a.b[1]'), 2);
  assert.equal(pickJson({}, 'constructor'), undefined);
  assert.equal(pickJson({}, '__proto__'), undefined);
  assert.deepEqual(jsonItems({ d: { l: [{ x: 1 }, { x: 2 }] } }, '$.d.l[*].x'), [1, 2]);
  assert.deepEqual(jsonItems({ d: [1, 2] }, '$.d'), [1, 2]);
  assert.deepEqual(jsonItems({ d: 'no' }, '$.d[*]'), []);
});

test('页面字段写法', () => {
  assert.deepEqual(parsePageField('@data-id'), { sel: '', attr: 'data-id' });
  assert.deepEqual(parsePageField('a.link@href'), { sel: 'a.link', attr: 'href' });
  assert.deepEqual(parsePageField('.nick'), { sel: '.nick', attr: '' });
  assert.deepEqual(parsePageField('a[href^="mailto:a@b.c"]'), { sel: 'a[href^="mailto:a@b.c"]', attr: '' });
  assert.equal(parsePageField('a{color:red}'), null);
});

test('接口抽取 + 清洗：只留声明的字段，截短，去重', () => {
  const r = checkWatch(base()).watch;
  const json = { data: { list: [
    { id: 1, user: { nick: '买家A' }, lastMsg: '还在吗', secret: 'x' },
    { id: 1, user: { nick: '重复' }, lastMsg: '重复' },
    { id: 2, user: { nick: '买家B' }, lastMsg: 'x'.repeat(2000) },
    { user: { nick: '没 id' } },
  ] } };
  const items = cleanEventItems(apiExtract(json, r.detect), r.target.fields);
  assert.equal(items.length, 2);
  assert.deepEqual(Object.keys(items[0].fields), ['from', 'text']);
  assert.equal(items[0].key, '1');
  assert.equal(items[1].fields.text.length, WATCH_FIELD_MAX);
});

test('比对：新 key、或同 key 内容变了，才算新', () => {
  const f = ['text'];
  const a = [{ key: '1', fields: { text: 'hi' } }, { key: '2', fields: { text: 'yo' } }];
  const first = diffItems(a, {}, f);
  assert.equal(first.fresh.length, 2);
  const again = diffItems(a, first.seen, f);
  assert.equal(again.fresh.length, 0);
  const changed = diffItems([{ key: '1', fields: { text: 'hi again' } }], again.seen, f);
  assert.deepEqual(changed.fresh.map((x) => x.key), ['1']);
  // 暂时掉下去的那条还记着，回来不算新
  assert.equal(changed.seen['2'], itemHash(a[1], f));
  assert.equal(diffItems([a[1]], changed.seen, f).fresh.length, 0);
});

test('看过的表有上限', () => {
  const seen = {};
  for (let i = 0; i < WATCH_SEEN_MAX + 100; i++) seen[`k${i}`] = 'h';
  const r = diffItems([{ key: 'new', fields: { t: '' } }], seen, ['t']);
  assert.equal(Object.keys(r.seen).length, WATCH_SEEN_MAX);
  assert.ok('new' in r.seen);
});

test('关键词过滤', () => {
  const it = { key: '1', fields: { text: '最低多少钱' } };
  assert.equal(watchMatch(it, { include: [], exclude: [] }), true);
  assert.equal(watchMatch(it, { include: ['最低'] }), true);
  assert.equal(watchMatch(it, { include: ['包邮'] }), false);
  assert.equal(watchMatch(it, { exclude: ['钱'] }), false);
});

test('事件切块', () => {
  assert.deepEqual(chunkEvents([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
  assert.deepEqual(chunkEvents([]), []);
});

test('实时监听模式（live）的哨兵与监听属性推导', () => {
  const w = base();
  w.target = { site: 'mail.google.com', url: 'https://mail.google.com/mail/u/0/#inbox', fields: ['from', 'subject', 'snippet'] };
  w.detect = {
    mode: 'live',
    items: 'div[role="main"] tr.zA',
    key: 'span[data-legacy-thread-id]@data-legacy-thread-id',
    fields: { from: '.yX .zF', subject: '.bog', snippet: '.y2' },
    ready: 'div[role="main"]',
  };
  const r = checkWatch(w);
  assert.equal(r.ok, true, r.error);
  assert.equal(r.watch.detect.mode, 'live');
  assert.equal(checkWatchProbe({ action: 'probe', watch: w }, ['mail.google.com']).watch.detect.mode, 'live');
  const attrs = pageObservedAttrs(r.watch.detect);
  assert.ok(attrs.includes('class'));
  assert.ok(attrs.includes('role'));
  assert.ok(attrs.includes('data-legacy-thread-id'));
});

test('运行时段按用户的时区，跨午夜', () => {
  // 2026-11-23 15:00 UTC = 23:00 上海
  const t = Date.UTC(2026, 10, 23, 15);
  assert.equal(watchInHours({ hours: [22, 7], tz: 'Asia/Shanghai' }, t), true);
  assert.equal(watchInHours({ hours: [9, 18], tz: 'Asia/Shanghai' }, t), false);
  assert.equal(watchInHours({ hours: [9, 18], tz: 'Europe/London' }, t), true);
  assert.equal(watchInHours({ hours: null }, t), true);
  assert.equal(watchDay(t, 'Asia/Shanghai'), '2026-11-23');
  assert.equal(watchDay(Date.UTC(2026, 10, 23, 17), 'Asia/Shanghai'), '2026-11-24');
});
