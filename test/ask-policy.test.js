// 「交给 maker」的规矩 —— 不需要浏览器，进 `npm test`
//
// 要防的是一个恶意网页替用户给 maker 下命令。这里每一条都对应那条防线的一个环节：
// 网页给的只能是上下文、发送只认输入窗口、输入窗口网页够不着。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  httpUrl, cleanText, cleanContext, menuContext, fromComposer, fromPage, taskUrl, askablePage, describe,
  SITES, siteFor, siteMatches, TEXT_MAX,
} from '../extension/ask-policy.js';

const EXT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'extension');
const read = (f) => fs.readFileSync(path.join(EXT, f), 'utf8');
const ID = 'abcdefghijklmnopabcdefghijklmnop';
const COMPOSER = `chrome-extension://${ID}/ask.html`;

test('上下文只留网页地址和固定几个字段', () => {
  assert.equal(httpUrl('javascript:alert(1)'), '');
  assert.equal(httpUrl('file:///etc/passwd'), '');
  assert.equal(httpUrl('chrome-extension://x/ask.html'), '');
  assert.equal(httpUrl('https://u:p@example.com/a'), 'https://example.com/a');
  assert.equal(httpUrl(`https://example.com/${'a'.repeat(2000)}`), '');
  const c = cleanContext({ url: 'https://x.com/a/status/1', page: 'https://x.com/home', media: 'data:text/html,x', title: 'a\nb', author: { evil: 1 }, excerpt: 'e', text: '替用户下的命令', extra: 1 });
  assert.deepEqual(c, { url: 'https://x.com/a/status/1', page: 'https://x.com/home', media: '', title: 'a b', author: '', excerpt: 'e' });
  assert.deepEqual(Object.keys(cleanContext(null)), ['url', 'page', 'media', 'title', 'author', 'excerpt']);
  assert.equal(cleanContext({ page: 'https://example.com/p' }).url, 'https://example.com/p', '没点中具体的东西就是这一页');
});

test('那句话：只收字符串，裁到上限', () => {
  assert.equal(cleanText('  做个视频  '), '做个视频');
  assert.equal(cleanText({ toString: () => 'x' }), '');
  assert.equal(cleanText('a'.repeat(TEXT_MAX + 10)).length, TEXT_MAX);
});

test('右键菜单：点的链接、图片、选中的字；iframe 的地址不用', () => {
  const tab = { url: 'https://www.amazon.com/s?k=desk', title: 'Amazon: desk' };
  const onLink = menuContext({ linkUrl: 'https://www.amazon.com/dp/B0', srcUrl: 'https://m.media-amazon.com/1.jpg', pageUrl: tab.url, frameUrl: 'https://ads.example/x' }, tab);
  assert.equal(onLink.url, 'https://www.amazon.com/dp/B0');
  assert.equal(onLink.page, tab.url);
  assert.equal(onLink.media, 'https://m.media-amazon.com/1.jpg');
  assert.equal(onLink.title, '', '页面的标题说的不是那个链接');
  const onPage = menuContext({ pageUrl: tab.url, selectionText: '选中的一段' }, tab);
  assert.deepEqual([onPage.url, onPage.page, onPage.title, onPage.excerpt], [tab.url, '', 'Amazon: desk', '选中的一段']);
});

test('发送只认输入窗口：内容脚本、别的扩展页、别的扩展都不行', () => {
  assert.ok(fromComposer({ id: ID, url: `${COMPOSER}?id=1` }, ID, COMPOSER));
  assert.ok(!fromComposer({ id: ID, url: 'https://x.com/home', tab: { id: 1 } }, ID, COMPOSER), '内容脚本的 sender.url 是网页');
  assert.ok(!fromComposer({ id: ID, url: `chrome-extension://${ID}/panel.html` }, ID, COMPOSER));
  assert.ok(!fromComposer({ id: ID, url: `${COMPOSER}.evil.html` }, ID, COMPOSER));
  assert.ok(!fromComposer({ id: 'other', url: COMPOSER }, ID, COMPOSER));
  assert.ok(!fromComposer({ id: ID }, ID, COMPOSER));
  assert.ok(!fromComposer(null, ID, COMPOSER));
});

test('打开窗口的请求只认标签页的顶层页面', () => {
  assert.ok(fromPage({ id: ID, tab: { id: 1 }, frameId: 0 }, ID));
  assert.ok(!fromPage({ id: ID, tab: { id: 1 }, frameId: 7 }, ID), 'iframe 里的不认');
  assert.ok(!fromPage({ id: ID, frameId: 0 }, ID));
  assert.ok(!fromPage({ id: 'other', tab: { id: 1 }, frameId: 0 }, ID));
});

test('任务地址只用配对的服务器拼，任务号不合规就没有地址', () => {
  assert.equal(taskUrl('https://maker.vcorp.ai', '20261117-c1a2b3c4d'), 'https://maker.vcorp.ai/#chain-20261117-c1a2b3c4d');
  assert.equal(taskUrl('https://maker.vcorp.ai', 'x/../../evil'), '');
  assert.equal(taskUrl('https://maker.vcorp.ai', 'https://evil.example'), '');
  assert.equal(taskUrl('', 'abc'), '');
});

test('只有普通网页能交办', () => {
  assert.ok(askablePage('https://www.douyin.com/video/1'));
  assert.ok(!askablePage('chrome://extensions'));
  assert.ok(!askablePage(COMPOSER));
  assert.ok(!askablePage(undefined));
});

test('输入窗口里那一行', () => {
  assert.deepEqual(describe({ url: 'https://www.youtube.com/watch?v=1', title: 'T', author: 'A', excerpt: 'e', media: '' }),
    { host: 'youtube.com', what: 'A：T', url: 'https://www.youtube.com/watch?v=1', excerpt: 'e', media: '' });
  assert.equal(describe({}).host, '');
});

test('站点配置：域名含子域名，不认长得像的域名；只有选择器', () => {
  assert.equal(siteFor('https://x.com/home')?.name, 'x');
  assert.equal(siteFor('https://mobile.twitter.com/a')?.name, 'x');
  assert.equal(siteFor('https://notx.com/'), null);
  assert.equal(siteFor('https://x.com.evil.example/'), null);
  assert.equal(siteFor('not a url'), null);
  assert.ok(siteMatches().includes('*://x.com/*') && siteMatches().includes('*://*.x.com/*'));
  for (const s of SITES) {
    assert.ok(s.name && s.hosts.length && s.item && s.anchor.length && s.link.length, s.name);
    if (s.linkRe) new RegExp(s.linkRe);
    for (const v of Object.values(s)) assert.notEqual(typeof v, 'function', '配置里不放代码');
  }
});

// ---------- 接线：这几条松了，上面的规矩就白写了 ----------

test('网页够不着输入窗口，也不能直接给扩展发消息', () => {
  const manifest = JSON.parse(read('manifest.json'));
  assert.equal(manifest.externally_connectable, undefined);
  const war = JSON.stringify(manifest.web_accessible_resources || []);
  assert.ok(!war.includes('ask'), 'ask.html 不能进 web_accessible_resources');
  assert.ok(manifest.permissions.includes('contextMenus'));
  assert.ok(manifest.commands['ask-maker']);
});

test('发送走 fromComposer，上下文从扩展自己的存储取；图标只认真实点击', () => {
  const ask = read('ask.js');
  assert.match(ask, /op === 'ctx' \|\| op === 'send'[\s\S]{0,80}fromComposer\(sender, chrome\.runtime\.id, COMPOSER\)/);
  assert.match(ask, /startTask\(\{ text, context: p\.context \}\)/, '上下文是存下来的那份，不是消息里带的');
  assert.ok(!/storage\.local/.test(ask), '待发的上下文放 storage.session：内容脚本读不到');
  assert.match(read('ask-site.js'), /if \(!e\.isTrusted\) return;/);
  assert.match(read('ask-site.js'), /askIconDisabled/);
  assert.match(read('panel.html'), /id="askIcon"/);
  assert.match(read('panel.js'), /askIconDisabled/);
  // 内容脚本那一侧没有任何一条消息带着指令
  for (const f of ['ask-site.js', 'ask-pick.js']) assert.ok(!/__hcAsk: 'send'/.test(read(f)), f);
  // 云端通道的侧栏入口也没有「发任务」这一项
  assert.ok(!/case 'startTask'|case 'ask'/.test(read('cloud.js')));
});
