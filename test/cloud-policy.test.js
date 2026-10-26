// 云端通道的规矩 —— 不需要浏览器，进 `npm test`
//
// cloud-policy.js 是「服务器被攻破时这个浏览器还剩什么」的全部答案。
// 这里每一条都对应一种真实的攻击：服务器下发 eval 读邮箱、导航到网银、
// 把 ~/.ssh/id_rsa 当素材上传、把危险步骤藏进 act 的 if 里。任何一条松动都必须测出来。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCommand, urlAllowed, allowedHosts, grantedPlatforms, normalizeOrigin, mediaAllowed, CLOUD_CMDS,
  PROBES, PLATFORMS, judgeProbe,
} from '../extension/cloud-policy.js';

test('登录探测：每个平台都有探测，探测地址都在该平台自己的白名单里', () => {
  assert.deepEqual(Object.keys(PROBES).sort(), Object.keys(PLATFORMS).sort());
  for (const [id, p] of Object.entries(PROBES)) assert.ok(urlAllowed(p.url, allowedHosts([id])), id);
});

test('登录探测：重定向到登录页算没登录，看到账号号码算登录着，看不出来就再等', () => {
  // 2026-10-26 实测：已登录的抖音、小红书首页；未登录的视频号被重定向到 login.html
  assert.equal(judgeProbe(PROBES.douyin, { url: 'https://creator.douyin.com/creator-micro/home', text: '首页\n抖音号：84592557832\n关注' }), 'valid');
  assert.equal(judgeProbe(PROBES.xiaohongshu, { url: 'https://creator.xiaohongshu.com/new/home', text: '小红书账号: 26539503357' }), 'valid');
  assert.equal(judgeProbe(PROBES.shipinhao, { url: 'https://channels.weixin.qq.com/login.html', text: '登录视频号助手' }), 'invalid');
  assert.equal(judgeProbe(PROBES.xiaohongshu, { url: 'https://creator.xiaohongshu.com/login', text: '' }), 'invalid');
  assert.equal(judgeProbe(PROBES.douyin, { url: 'https://creator.douyin.com/', text: '扫码登录' }), 'invalid');
  assert.equal(judgeProbe(PROBES.douyin, { url: 'https://creator.douyin.com/creator-micro/home', text: '' }), null);
});

const ORIGIN = 'https://maker.vcorp.ai';
const hosts = allowedHosts(['douyin', 'shipinhao']);
const ctx = { hosts, origin: ORIGIN };
const denied = (fn) => assert.throws(fn, (e) => e.code === 'CLOUD_DENIED');

test('读接口、带 cookie 发请求、写盘、执行脚本的命令一律没有', () => {
  for (const cmd of ['eval', 'fetch', 'network', 'download', 'reload', '__pay_timeout', 'learnings', 'nope']) {
    assert.ok(!CLOUD_CMDS.has(cmd), cmd);
    denied(() => checkCommand(cmd, {}, ctx));
  }
});

test('白名单按平台根域放行子域，别的站和伪装域名一律不行', () => {
  assert.ok(urlAllowed('https://creator.douyin.com/creator-micro/content/upload', hosts));
  assert.ok(urlAllowed('https://douyin.com/', hosts));
  assert.ok(urlAllowed('https://channels.weixin.qq.com/platform/post/create', hosts));
  assert.ok(urlAllowed('about:blank', hosts));
  assert.ok(!urlAllowed('https://mp.weixin.qq.com/', hosts), '视频号不等于整个 weixin.qq.com');
  assert.ok(!urlAllowed('https://pay.weixin.qq.com/', hosts));
  assert.ok(!urlAllowed('https://evildouyin.com/', hosts));
  assert.ok(!urlAllowed('https://douyin.com.evil.cn/', hosts));
  assert.ok(!urlAllowed('https://mail.google.com/', hosts));
  assert.ok(!urlAllowed('https://user:pw@creator.douyin.com/', hosts));
  for (const u of ['chrome://settings', 'file:///C:/Users/x/.ssh/id_rsa', 'javascript:alert(1)', 'data:text/html,hi', 'chrome-extension://abc/panel.html', 'not a url']) {
    assert.ok(!urlAllowed(u, hosts), u);
  }
});

test('没授权的平台不进白名单', () => {
  assert.deepEqual(grantedPlatforms(['douyin', 'xiaohongshu', 'bogus'], ['douyin', 'bilibili']), ['douyin']);
  assert.deepEqual(grantedPlatforms(['douyin'], []), []);
  assert.deepEqual(allowedHosts([]), []);
  assert.ok(!urlAllowed('https://creator.douyin.com/', allowedHosts([])));
});

test('开页和导航只能去白名单里的地址', () => {
  assert.equal(checkCommand('tabs', { action: 'new', url: 'https://creator.douyin.com/', focus: true }, ctx).focus, false);
  denied(() => checkCommand('tabs', { action: 'new', url: 'https://online.bank.example/' }, ctx));
  denied(() => checkCommand('navigate', { url: 'https://mail.qq.com/' }, ctx));
  denied(() => checkCommand('navigate', { url: 'chrome://extensions' }, ctx));
  assert.ok(checkCommand('navigate', { url: 'https://creator.douyin.com/x' }, ctx));
  assert.ok(checkCommand('navigate', { action: 'back' }, ctx));
  denied(() => checkCommand('tabs', { action: 'groupAll' }, ctx));
});

test('参数里的 tabId 一律剥掉，归属由信封和任务表决定', () => {
  assert.equal(checkCommand('click', { ref: 'e1', tabId: 999 }, ctx).tabId, undefined);
});

test('act 里藏一层的危险步骤也查得出来，且批处理不代做敏感动作', () => {
  denied(() => checkCommand('act', { steps: [{ do: 'eval', expr: '1' }] }, ctx));
  denied(() => checkCommand('act', { steps: [{ do: 'if', cond: {}, then: [{ do: 'navigate', url: 'https://evil.example/' }] }] }, ctx));
  denied(() => checkCommand('act', { steps: [{ do: 'repeat', steps: [{ do: 'fetch', url: 'https://x' }] }] }, ctx));
  denied(() => checkCommand('act', { steps: 'nope' }, ctx));
  const p = checkCommand('act', { steps: [{ do: 'click', ref: 'e1' }, { do: 'navigate', url: 'https://creator.douyin.com/' }], allowSensitive: true }, ctx);
  assert.equal(p.allowSensitive, false);
});

test('上传只收配对服务器上的素材，本机路径和字节一概不收', () => {
  const media = { url: `${ORIGIN}/api/ext/media/abc`, name: 'v.mp4', type: 'video/mp4', size: 1024 };
  const p = checkCommand('upload', { media, path: 'C:/Users/me/.ssh/id_rsa', base64: 'AAAA', selector: 'input' }, ctx);
  assert.deepEqual(p, { media, selector: 'input' });
  denied(() => checkCommand('upload', { path: '/etc/passwd', name: 'x' }, ctx));
  denied(() => checkCommand('upload', { media: { ...media, url: 'https://evil.example/api/ext/media/abc' } }, ctx));
  denied(() => checkCommand('upload', { media: { ...media, url: `${ORIGIN}/api/jobs/1` } }, ctx));
  denied(() => checkCommand('upload', { media: { ...media, url: 'file:///etc/passwd' } }, ctx));
  denied(() => checkCommand('upload', { media: { ...media, size: 0 } }, ctx));
  denied(() => checkCommand('upload', { media: { ...media, name: '.bashrc' } }, ctx));
  denied(() => checkCommand('upload', { media: { ...media, name: '../../x.mp4' } }, ctx));
  assert.equal(checkCommand('upload', { media: { ...media, name: 'a/b\\c.mp4' } }, ctx).media.name, 'a_b_c.mp4');
});

test('截图不许借道切前台，ask 的等待有上限', () => {
  assert.equal(checkCommand('screenshot', { focus: true }, ctx).focus, undefined);
  assert.equal(checkCommand('ask', { timeout: 99999999 }, ctx).timeout, 600000);
});

test('服务器地址只收 https（本机调试可 http），素材地址认准同源和路径', () => {
  assert.equal(normalizeOrigin('https://maker.vcorp.ai/some/path'), 'https://maker.vcorp.ai');
  assert.equal(normalizeOrigin('http://localhost:5170'), 'http://localhost:5170');
  assert.equal(normalizeOrigin('http://maker.vcorp.ai'), null);
  assert.equal(normalizeOrigin('https://u:p@maker.vcorp.ai'), null);
  assert.equal(normalizeOrigin('javascript:alert(1)'), null);
  assert.ok(mediaAllowed(`${ORIGIN}/api/ext/media/x`, ORIGIN));
  assert.ok(!mediaAllowed(`${ORIGIN}.evil.cn/api/ext/media/x`, ORIGIN));
  assert.ok(!mediaAllowed(`${ORIGIN}/api/ext/medias/x`, ORIGIN));
});
