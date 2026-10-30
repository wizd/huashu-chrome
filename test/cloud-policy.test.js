// 云端通道的规矩 —— 不需要浏览器，进 `npm test`
//
// cloud-policy.js 是「服务器被攻破时这个浏览器还剩什么」的全部答案。
// 这里每一条都对应一种真实的攻击：服务器下发 eval 读邮箱、导航到网银、
// 把 ~/.ssh/id_rsa 当素材上传、把危险步骤藏进 act 的 if 里。任何一条松动都必须测出来。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCommand, urlAllowed, allowedHosts, grantedPlatforms, initialTask, normalizeOrigin, mediaAllowed, CLOUD_CMDS,
  PROBES, PLATFORMS, judgeProbe, normalizeSite, cleanSites, SITES_MAX, taskHosts, sitesToAsk,
  cleanFolderName, cleanFolderNames, foldersToAsk, normalizeRelPath, fileAllowed, skipEntry, matchGlob, pullUrlAllowed,
  FS_EXTS, FS_DEPTH_MAX, FS_FOLDERS_MAX,
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

test('通用任务的站点：只收公网域名，去掉 www.，子域跟着放行', () => {
  assert.equal(normalizeSite('zhipin.com'), 'zhipin.com');
  assert.equal(normalizeSite('https://www.liepin.com/job/123?x=1'), 'liepin.com');
  assert.equal(normalizeSite('WWW.58.COM'), '58.com');
  assert.equal(normalizeSite('jobs.example.org'), 'jobs.example.org');
  for (const bad of ['', 'localhost', 'printer.local', '127.0.0.1', '10.0.0.8', '[::1]', 'intranet', 'com.cn', 'github.io',
    'javascript:alert(1)', 'file:///etc/passwd', 'chrome://settings', 'http://u:p@a.com', 'bad_host.com', '-a.com', 'a.123']) {
    assert.equal(normalizeSite(bad), null, bad);
  }
  assert.ok(urlAllowed('https://m.zhipin.com/x', ['zhipin.com']));
  assert.ok(!urlAllowed('https://zhipin.com.evil.cn/', ['zhipin.com']));
  assert.ok(!urlAllowed('https://mail.qq.com/', ['zhipin.com']));
});

test('通用任务的站点：去重、限量，不合规的另列', () => {
  const r = cleanSites(['zhipin.com', 'www.zhipin.com', 'localhost', ...Array.from({ length: 30 }, (_, i) => `s${i}.com`)]);
  assert.equal(r.sites.length, SITES_MAX);
  assert.equal(r.sites[0], 'zhipin.com');
  assert.deepEqual(r.bad, ['localhost']);
  assert.deepEqual(cleanSites('zhipin.com').sites, []);
});

test('混合任务：平台根域和额外网站一起放行，老任务没有 sites 也不报错', () => {
  const mixed = taskHosts({ platforms: ['douyin', 'shipinhao'], sites: ['pexels.com'] });
  assert.ok(urlAllowed('https://creator.douyin.com/creator-micro/content/upload', mixed));
  assert.ok(urlAllowed('https://www.pexels.com/search/cat/', mixed));
  assert.ok(urlAllowed('https://channels.weixin.qq.com/platform', mixed));
  assert.ok(!urlAllowed('https://unsplash.com/', mixed));
  assert.ok(!urlAllowed('https://mp.weixin.qq.com/', mixed));
  assert.deepEqual(taskHosts({ platforms: ['douyin'] }), allowedHosts(['douyin']));
  assert.deepEqual(taskHosts(undefined), []);
});

test('initialTask：自动允许放行新任务和它一开始的网站，追加的网站仍要问', () => {
  assert.deepEqual(initialTask({ platforms: ['douyin'], auto: false }), { state: 'pending', sites: [], ask: [] });
  assert.deepEqual(initialTask({ platforms: ['douyin'], auto: true }), { state: 'approved', sites: [], ask: [] });
  assert.deepEqual(initialTask({ platforms: [], auto: true }), { state: 'denied', sites: [], ask: [] });

  const sites = ['zhipin.com', 'liepin.com'];
  assert.deepEqual(initialTask({ browse: true, sites, auto: false }), { state: 'pending', sites: [], ask: ['zhipin.com', 'liepin.com'] });
  assert.deepEqual(sites, ['zhipin.com', 'liepin.com'], '不改调用方的清单');
  assert.deepEqual(initialTask({ browse: true, sites, auto: true }), { state: 'approved', sites: ['zhipin.com', 'liepin.com'], ask: [] });
  assert.deepEqual(initialTask({ browse: true, sites: [], auto: false }), { state: 'approved', sites: [], ask: [] });
  assert.deepEqual(initialTask({ browse: true, sites: [], auto: true }), { state: 'approved', sites: [], ask: [] });

  const opened = initialTask({ browse: true, sites, auto: true });
  assert.deepEqual(sitesToAsk(['zhipin.com', 'liepin.com', 'bank.example'], { sites: opened.sites }).ask, ['bank.example']);
  assert.deepEqual(foldersToAsk(['知识库'], { granted: [], refused: [] }).ask, ['知识库']);
});

test('sitesToAsk：平台已覆盖、已批准、已拒绝的不再问，到上限就截断', () => {
  const covered = allowedHosts(['douyin', 'shipinhao']);
  const r = sitesToAsk(
    ['douyin.com', 'creator.douyin.com', 'pexels.com', 'unsplash.com', 'weixin.qq.com'],
    { covered, sites: ['pexels.com'], refused: ['unsplash.com'] },
  );
  assert.deepEqual(r.covered, ['douyin.com', 'creator.douyin.com']);
  assert.deepEqual(r.ask, ['weixin.qq.com'], '视频号的根域盖不住整个 weixin.qq.com');
  assert.deepEqual(r.overflow, []);

  const many = Array.from({ length: 5 }, (_, i) => `s${i}.com`);
  const held = Array.from({ length: SITES_MAX - 2 }, (_, i) => `old${i}.com`);
  const r2 = sitesToAsk(many, { covered: [], sites: held, refused: ['s0.com'] });
  assert.deepEqual(r2.ask, ['s1.com', 's2.com']);
  assert.deepEqual(r2.overflow, ['s3.com', 's4.com']);
  assert.deepEqual(sitesToAsk(['a.com', 'a.com'], { sites: [], refused: [] }).ask, ['a.com']);
});

test('混合白名单：额外网站能导航，没批的不行', () => {
  const c = { hosts: taskHosts({ platforms: ['douyin'], sites: ['pexels.com'] }), origin: ORIGIN };
  assert.ok(checkCommand('navigate', { url: 'https://www.pexels.com/search/cat' }, c));
  assert.ok(checkCommand('tabs', { action: 'new', url: 'https://creator.douyin.com/' }, c));
  assert.ok(checkCommand('act', { steps: [{ do: 'navigate', url: 'https://pexels.com/' }] }, c));
  denied(() => checkCommand('navigate', { url: 'https://unsplash.com/' }, c));
  denied(() => checkCommand('act', { steps: [{ do: 'if', then: [{ do: 'navigate', url: 'https://evil.example/' }] }] }, c));
});

test('sites 命令：清洗申请清单和用途，空申请不收', () => {
  const p = checkCommand('sites', { add: ['https://www.zhipin.com/', '127.0.0.1'], reason: '  找\n兼职 ', tabId: 9 }, ctx);
  assert.deepEqual(p, { add: ['zhipin.com'], bad: ['127.0.0.1'], reason: '找 兼职' });
  denied(() => checkCommand('sites', {}, ctx));
  denied(() => checkCommand('sites', { add: [] }, ctx));
});

const PULL = `${ORIGIN}/api/ext/pull/${'a'.repeat(24)}`;

test('本地文件夹：路径出不了根，隐藏文件和私钥这类扩展名读不了', () => {
  assert.equal(normalizeRelPath(''), '');
  assert.equal(normalizeRelPath('docs/a.md'), 'docs/a.md');
  assert.equal(normalizeRelPath('./docs//a.md'), 'docs/a.md');
  for (const bad of ['../a.md', '/etc/passwd', 'docs/../../x', 'a\\b.md', 'a\u0000.md', 'C:/Users/me']) {
    assert.equal(normalizeRelPath(bad), null, bad);
  }
  assert.equal(cleanFolderName(' 知识库 '), '知识库');
  assert.equal(cleanFolderName('a/b'), null);
  assert.equal(cleanFolderName('.'), null);
  assert.equal(cleanFolderName('x'.repeat(41)), null);
  assert.ok(fileAllowed('笔记.md'));
  assert.ok(fileAllowed('a.DOCX'));
  for (const ext of FS_EXTS) assert.ok(fileAllowed(`a${ext}`), ext);
  for (const bad of ['.ssh/id_rsa', 'id_rsa', '.env', 'secret.pem', 'note.exe', 'a.md/../../x', '.bashrc']) {
    assert.equal(fileAllowed(bad), false, bad);
  }
  assert.ok(skipEntry('.git'));
  assert.ok(skipEntry('node_modules'));
  assert.ok(!skipEntry('docs'));
  assert.ok(matchGlob('a.md', '**/*.md'));
  assert.ok(matchGlob('dir/a.md', '**/*.md'));
  assert.ok(!matchGlob('dir/a.md', '*.md'));
  assert.ok(matchGlob('dir/a.md', 'dir/*.md'));
  assert.ok(!matchGlob('dir/sub/a.md', 'dir/*.md'));
});

test('本地文件夹：命令只留安全字段，上传地址必须指回配对服务器', () => {
  assert.deepEqual(checkCommand('folders', { use: ['知识库', '知识库', 'a/b', ''], reason: ' 读\n文档 ' }, ctx), {
    use: ['知识库'], bad: ['a/b', ''], reason: '读 文档',
  });
  assert.deepEqual(checkCommand('folders', {}, ctx).use, [], '空申请是在问挂了哪些，不是拒绝');
  assert.equal(cleanFolderNames(Array.from({ length: 20 }, (_, i) => `夹${i}`)).names.length, FS_FOLDERS_MAX);

  const asked = foldersToAsk(['知识库', '素材', '知识库'], { granted: ['知识库'], refused: ['素材'] });
  assert.deepEqual(asked, { ask: [], already: ['知识库'], refused: ['素材'] });

  const list = checkCommand('fs_list', { folder: '知识库', path: './docs//a', depth: 99, glob: '**/*.md', tabId: 3 }, ctx);
  assert.equal(list.path, 'docs/a');
  assert.equal(list.depth, FS_DEPTH_MAX);
  assert.equal(list.glob, '**/*.md');
  assert.equal(list.tabId, undefined);
  denied(() => checkCommand('fs_list', { folder: '知识库', path: '../x' }, ctx));
  denied(() => checkCommand('fs_list', { folder: 'a/b' }, ctx));
  denied(() => checkCommand('fs_list', { folder: '知识库', glob: '../**' }, ctx));

  const read = checkCommand('fs_read', { folder: '知识库', path: 'a/b.pdf', upload: { url: PULL }, path2: 'C:/secret' }, ctx);
  assert.deepEqual(read, { folder: '知识库', path: 'a/b.pdf', upload: { url: PULL } });
  denied(() => checkCommand('fs_read', { folder: '知识库', path: '.ssh/id_rsa', upload: { url: PULL } }, ctx));
  denied(() => checkCommand('fs_read', { folder: '知识库', path: 'id_rsa', upload: { url: PULL } }, ctx));
  denied(() => checkCommand('fs_read', { folder: '知识库', path: 'a.exe', upload: { url: PULL } }, ctx));
  denied(() => checkCommand('fs_read', { folder: '知识库', path: 'a.md', upload: { url: 'https://evil.example/api/ext/pull/' + 'a'.repeat(24) } }, ctx));
  denied(() => checkCommand('fs_read', { folder: '知识库', path: 'a.md', upload: { url: `${ORIGIN}/api/ext/media/` + 'a'.repeat(24) } }, ctx));
  denied(() => checkCommand('fs_read', { folder: '知识库', path: 'a.md' }, ctx));
  assert.ok(pullUrlAllowed(PULL, ORIGIN));
  assert.ok(!pullUrlAllowed(`${PULL}?x=1`, ORIGIN));
  assert.ok(!pullUrlAllowed(`${ORIGIN}/api/ext/pull/short`, ORIGIN));
});
