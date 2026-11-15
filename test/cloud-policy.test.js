// 云端通道的规矩 —— 不需要浏览器，进 `npm test`
//
// cloud-policy.js 是「服务器被攻破时这个浏览器还剩什么」的全部答案。
// 这里每一条都对应一种真实的攻击：服务器下发 eval 读邮箱、导航到网银、
// 把 ~/.ssh/id_rsa 当素材上传、把危险步骤藏进 act 的 if 里。任何一条松动都必须测出来。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkCommand, urlAllowed, initialTask, normalizeOrigin, mediaAllowed, mediaFetchMs, MEDIA_MAX, CLOUD_CMDS,
  normalizeSite, cleanSites, cleanAllowList, SITES_MAX, taskHosts, sitesToAsk,
  cleanFolderName, cleanFolderNames, foldersToAsk, normalizeRelPath, fileAllowed, writeAllowed, skipEntry, matchGlob, pullUrlAllowed,
  FS_EXTS, FS_DEPTH_MAX, FS_FOLDERS_MAX, mediaBody, PULL_CHUNK_MAX,
} from '../extension/cloud-policy.js';

const ORIGIN = 'https://maker.vcorp.ai';
const hosts = ['douyin.com', 'channels.weixin.qq.com'];
const ctx = { hosts, origin: ORIGIN };
const denied = (fn) => assert.throws(fn, (e) => e.code === 'CLOUD_DENIED');

test('经验笔记：只认本任务允许的网站，文本有上限', () => {
  assert.deepEqual(checkCommand('notes', { site: 'https://www.douyin.com/x' }, ctx), { site: 'douyin.com' });
  assert.deepEqual(checkCommand('notes', { site: 'creator.douyin.com', save: '先关弹窗' }, ctx), { site: 'creator.douyin.com', save: '先关弹窗' });
  // 允许的是子域时，查上级域的笔记也行（channels.weixin.qq.com → weixin.qq.com）
  assert.deepEqual(checkCommand('notes', { site: 'weixin.qq.com' }, ctx), { site: 'weixin.qq.com' });
  assert.deepEqual(checkCommand('notes', { site: 'douyin.com', save: '' }, ctx), { site: 'douyin.com', save: '' });
  denied(() => checkCommand('notes', { site: 'xiaohongshu.com' }, ctx));
  denied(() => checkCommand('notes', {}, ctx));
  denied(() => checkCommand('notes', { site: 'douyin.com', save: 1 }, ctx));
  denied(() => checkCommand('notes', { site: 'douyin.com', save: 'x'.repeat(8001) }, ctx));
});

test('eval 只听用户的开关：关着一律拒，开着只放行代码本身', () => {
  denied(() => checkCommand('eval', { expr: '1' }, ctx));
  denied(() => checkCommand('eval', { expr: '1' }, { ...ctx, allowEval: false }));
  const on = { ...ctx, allowEval: true };
  assert.deepEqual(checkCommand('eval', { expr: 'document.title', tabId: 9, junk: 1 }, on), { expr: 'document.title', maxLength: 20000 });
  denied(() => checkCommand('eval', { expr: '  ' }, on));
  denied(() => checkCommand('eval', { expr: 'x'.repeat(200001) }, on));
  // act 里塞 eval 仍然不行：开关只放行单独一条、能审计的 eval
  denied(() => checkCommand('act', { steps: [{ do: 'eval', expr: '1' }] }, on));
});

test('读接口、带 cookie 发请求、写盘的命令一律没有（eval 不带开关时也拒）', () => {
  for (const cmd of ['eval', 'fetch', 'network', 'download', 'reload', '__pay_timeout', 'learnings', 'nope']) {
    assert.ok(!CLOUD_CMDS.has(cmd), cmd);
    denied(() => checkCommand(cmd, {}, ctx));
  }
});

test('白名单按根域放行子域，别的站和伪装域名一律不行', () => {
  assert.ok(urlAllowed('https://creator.douyin.com/creator-micro/content/upload', hosts));
  assert.ok(urlAllowed('https://douyin.com/', hosts));
  assert.ok(urlAllowed('https://channels.weixin.qq.com/platform/post/create', hosts));
  assert.ok(urlAllowed('about:blank', hosts));
  assert.ok(!urlAllowed('https://mp.weixin.qq.com/', hosts), 'channels.weixin.qq.com 不等于整个 weixin.qq.com');
  assert.ok(!urlAllowed('https://pay.weixin.qq.com/', hosts));
  assert.ok(!urlAllowed('https://evildouyin.com/', hosts));
  assert.ok(!urlAllowed('https://douyin.com.evil.cn/', hosts));
  assert.ok(!urlAllowed('https://mail.google.com/', hosts));
  assert.ok(!urlAllowed('https://user:pw@creator.douyin.com/', hosts));
  for (const u of ['chrome://settings', 'file:///C:/Users/x/.ssh/id_rsa', 'javascript:alert(1)', 'data:text/html,hi', 'chrome-extension://abc/panel.html', 'not a url']) {
    assert.ok(!urlAllowed(u, hosts), u);
  }
});

test('允许名单：没有预设，存储里的坏数据不进白名单', () => {
  assert.deepEqual(cleanAllowList(undefined), []);
  assert.deepEqual(cleanAllowList(['www.Douyin.com', 'douyin.com', 'localhost', '10.0.0.1', 'com.cn', 42]), ['douyin.com']);
  assert.ok(!urlAllowed('https://creator.douyin.com/', taskHosts({ sites: [] }, [])));
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

test('ask 的 kind 只留 confirm，别的值当没写', () => {
  assert.equal(checkCommand('ask', { kind: 'confirm' }, ctx).kind, 'confirm');
  for (const kind of ['captcha', 'pay', 'login', '', 'CONFIRM', true, 1, null]) {
    assert.equal(checkCommand('ask', { kind }, ctx).kind, undefined, `不该留下 ${JSON.stringify(kind)}`);
  }
  assert.equal(checkCommand('ask', {}, ctx).kind, undefined);
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

test('任务白名单：允许名单和本任务批准的网站一起放行，没有 sites 也不报错', () => {
  const mixed = taskHosts({ sites: ['pexels.com'] }, ['douyin.com', 'channels.weixin.qq.com']);
  assert.ok(urlAllowed('https://creator.douyin.com/creator-micro/content/upload', mixed));
  assert.ok(urlAllowed('https://www.pexels.com/search/cat/', mixed));
  assert.ok(urlAllowed('https://channels.weixin.qq.com/platform', mixed));
  assert.ok(!urlAllowed('https://unsplash.com/', mixed));
  assert.ok(!urlAllowed('https://mp.weixin.qq.com/', mixed));
  assert.deepEqual(taskHosts({}, ['douyin.com']), ['douyin.com']);
  assert.deepEqual(taskHosts({ sites: ['douyin.com'] }, ['douyin.com']), ['douyin.com']);
  assert.deepEqual(taskHosts(undefined), []);
});

test('initialTask：自动允许放行新任务和它一开始的网站，追加的网站仍要问', () => {
  const sites = ['zhipin.com', 'liepin.com'];
  assert.deepEqual(initialTask({ sites, auto: false }), { state: 'pending', sites: [], ask: ['zhipin.com', 'liepin.com'], use: [] });
  assert.deepEqual(sites, ['zhipin.com', 'liepin.com'], '不改调用方的清单');
  assert.deepEqual(initialTask({ sites, auto: true }), { state: 'approved', sites: ['zhipin.com', 'liepin.com'], ask: [], use: [] });
  assert.deepEqual(initialTask({ sites: [], auto: false }), { state: 'approved', sites: [], ask: [], use: [] });
  assert.deepEqual(initialTask({ sites: [], auto: true }), { state: 'approved', sites: [], ask: [], use: [] });

  // 允许名单里已有的不再问，但新任务本身仍要点头
  assert.deepEqual(initialTask({ sites: ['creator.douyin.com', 'pexels.com'], covered: ['douyin.com'], auto: false }),
    { state: 'pending', sites: [], ask: ['pexels.com'], use: ['creator.douyin.com'] });
  assert.deepEqual(initialTask({ sites: ['creator.douyin.com'], covered: ['douyin.com'], auto: false }),
    { state: 'pending', sites: [], ask: [], use: ['creator.douyin.com'] });
  // 自动允许：名单外的网站只给这个任务，不在 ask 里等人
  assert.deepEqual(initialTask({ sites: ['creator.douyin.com', 'pexels.com'], covered: ['douyin.com'], auto: true }),
    { state: 'approved', sites: ['pexels.com'], ask: [], use: ['creator.douyin.com'] });

  const opened = initialTask({ sites, auto: true });
  assert.deepEqual(sitesToAsk(['zhipin.com', 'liepin.com', 'bank.example'], { sites: opened.sites }).ask, ['bank.example']);
  assert.deepEqual(foldersToAsk(['知识库'], { granted: [], refused: [] }).ask, ['知识库']);
});

test('sitesToAsk：允许名单已覆盖、已批准、已拒绝的不再问，到上限就截断', () => {
  const covered = ['douyin.com', 'channels.weixin.qq.com'];
  const r = sitesToAsk(
    ['douyin.com', 'creator.douyin.com', 'pexels.com', 'unsplash.com', 'weixin.qq.com'],
    { covered, sites: ['pexels.com'], refused: ['unsplash.com'] },
  );
  assert.deepEqual(r.covered, ['douyin.com', 'creator.douyin.com']);
  assert.deepEqual(r.ask, ['weixin.qq.com'], 'channels.weixin.qq.com 盖不住整个 weixin.qq.com');
  assert.deepEqual(r.overflow, []);

  const many = Array.from({ length: 5 }, (_, i) => `s${i}.com`);
  const held = Array.from({ length: SITES_MAX - 2 }, (_, i) => `old${i}.com`);
  const r2 = sitesToAsk(many, { covered: [], sites: held, refused: ['s0.com'] });
  assert.deepEqual(r2.ask, ['s1.com', 's2.com']);
  assert.deepEqual(r2.overflow, ['s3.com', 's4.com']);
  assert.deepEqual(sitesToAsk(['a.com', 'a.com'], { sites: [], refused: [] }).ask, ['a.com']);
});

test('混合白名单：额外网站能导航，没批的不行', () => {
  const c = { hosts: taskHosts({ sites: ['pexels.com'] }, ['douyin.com']), origin: ORIGIN };
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
  for (const ok of ['报价.xlsx', '汇报.PPTX', '照片.JPG', 'a.jpeg', 'a.png', 'a.webp', 'a.gif']) assert.ok(fileAllowed(ok), ok);
  for (const ext of FS_EXTS) assert.ok(fileAllowed(`a${ext}`), ext);
  for (const bad of ['.ssh/id_rsa', 'id_rsa', '.env', 'secret.pem', 'note.exe', 'old.xls', 'old.ppt', 'a.svg', 'a.xlsm', 'a.md/../../x', '.bashrc']) {
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
  assert.deepEqual(asked, { ask: [], grant: [], already: ['知识库'], refused: ['素材'] });
  // 自动允许：挂着的文件夹直接放行；用户拒绝过的仍然不给
  assert.deepEqual(foldersToAsk(['知识库', '素材', '简历'], { granted: ['知识库'], refused: ['素材'], auto: true }),
    { ask: [], grant: ['简历'], already: ['知识库'], refused: ['素材'] });

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

// 写进用户文件夹：字节只能来自配对服务器的素材，文件只能是文档、图片、音视频、字幕
test('fs_write：只写素材接口的字节，不写可执行文件和隐藏目录', () => {
  assert.ok(CLOUD_CMDS.has('fs_write'));
  const MEDIA = `${ORIGIN}/api/ext/media/abc`;
  const w = checkCommand('fs_write', { folder: 'share', path: './videos//a.mp4', media: { url: MEDIA, size: 1024, name: 'x' }, overwrite: 'yes', tabId: 1 }, ctx);
  assert.deepEqual(w, { folder: 'share', path: 'videos/a.mp4', media: { url: MEDIA, size: 1024 }, overwrite: false });
  assert.equal(checkCommand('fs_write', { folder: 'share', path: 'a.srt', media: { url: MEDIA, size: 1 }, overwrite: true }, ctx).overwrite, true);
  for (const ok of ['a.mp4', 'a.MKV', 'a.webm', 'a.m4a', 'a.mp3', 'a.vtt', 'a.md', 'a.png', '报告.docx']) assert.ok(writeAllowed(ok), ok);
  for (const bad of ['a.exe', 'a.bat', 'a.ps1', 'a.lnk', 'a.js', 'a.svg', 'a.zip', 'a.html.', 'a.mp4 ', '.a.mp4', 'mp4', 'a:b.mp4', 'a?.mp4', 'a.mp4\u0000']) {
    assert.equal(writeAllowed(bad), false, bad);
  }
  const base = { folder: 'share', media: { url: MEDIA, size: 10 } };
  denied(() => checkCommand('fs_write', { ...base, path: '' }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: '../a.mp4' }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'C:/a.mp4' }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: '.config/a.mp4' }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'node_modules/a.mp4' }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'run.exe' }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'a.mp4', media: { url: 'https://evil.example/api/ext/media/abc', size: 10 } }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'a.mp4', media: { url: PULL, size: 10 } }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'a.mp4', media: { url: MEDIA, size: 0 } }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'a.mp4', media: { url: MEDIA, size: 1.5 } }, ctx));
  denied(() => checkCommand('fs_write', { ...base, path: 'a.mp4', media: { url: MEDIA, size: MEDIA_MAX + 1 } }, ctx));
  denied(() => checkCommand('fs_write', { ...base, folder: 'a/b', path: 'a.mp4' }, ctx));
});

// 能力包：云端能点名装扩展自带的包、按白名单调 action，但不能借它塞进任何代码
test('load/call：只认注册表里的包和白名单里的 action', () => {
  assert.ok(CLOUD_CMDS.has('load') && CLOUD_CMDS.has('call'));
  assert.ok(!CLOUD_CMDS.has('eval'));

  assert.deepEqual(checkCommand('load', { name: 'eda', files: ['../../evil.js'] }, ctx), { name: 'eda' });
  denied(() => checkCommand('load', { name: 'nope' }, ctx));
  denied(() => checkCommand('load', { name: '__proto__' }, ctx));
  denied(() => checkCommand('load', {}, ctx));

  const r = checkCommand('call', { name: 'eda', action: 'project.current', tabId: 9 }, ctx);
  assert.deepEqual(r, { name: 'eda', action: 'project.current', payload: {}, timeout: 120000, confirm: '' });
  // 要不要用户点头只看注册表：服务器说「不用确认」不算数，说「要确认」也不会给只读的加戏
  assert.match(checkCommand('call', { name: 'eda', action: 'pcb.route.auto', confirm: '' }, ctx).confirm, /自动布线/);
  assert.match(checkCommand('call', { name: 'eda', action: 'schematic.component.delete', confirm: false }, ctx).confirm, /删除/);
  assert.equal(checkCommand('call', { name: 'eda', action: 'project.current', confirm: '钓鱼文字' }, ctx).confirm, '');
  const w = checkCommand('call', { name: 'eda', action: 'schematic.component.place', payload: { lcscId: 'C25804', x: 0, y: 0 } }, ctx);
  assert.equal(w.payload.lcscId, 'C25804');

  // 白名单外的、明确拒绝的
  for (const action of ['debug.exec_js', 'system.page_reload', 'project.import', 'board.delete', 'pcb.page.clear', 'toString', '']) {
    denied(() => checkCommand('call', { name: 'eda', action }, ctx));
  }
  // payload：只收普通对象，有大小上限，函数留不下来
  denied(() => checkCommand('call', { name: 'eda', action: 'project.find', payload: 'eda.sys_X()' }, ctx));
  denied(() => checkCommand('call', { name: 'eda', action: 'project.find', payload: [1] }, ctx));
  denied(() => checkCommand('call', { name: 'eda', action: 'project.find', payload: { s: 'x'.repeat(300000) } }, ctx));
  const f = checkCommand('call', { name: 'eda', action: 'project.find', payload: { q: 'a', fn() {} } }, ctx);
  assert.deepEqual(f.payload, { q: 'a' });
  // 超时：夹在 limits 里
  assert.equal(checkCommand('call', { name: 'eda', action: 'pcb.route.auto', timeout: 9e9 }, ctx).timeout, 600000);
});

test('取素材的时限随大小增长，且留在服务器 8 分钟的命令超时之内', () => {
  assert.equal(mediaFetchMs(1), 31000);
  assert.equal(mediaFetchMs(100 * 1048576), 130000);
  assert.equal(mediaFetchMs(MEDIA_MAX), 420000);
  assert.ok(mediaFetchMs(MEDIA_MAX) + 15000 < 8 * 60 * 1000);
});

// 取媒体字节：用户的登录只用来取视频，取不了接口数据，字节只能去配对服务器
test('media_pull：只 GET 允许网站上的媒体，字节只去一次性上传地址', () => {
  assert.ok(CLOUD_CMDS.has('media_pull'));
  const PULL = `${ORIGIN}/api/ext/pull/` + 'b'.repeat(24);
  const ok = checkCommand('media_pull', {
    url: 'https://v26.douyin.com/seg/1.ts?sign=x', referer: 'https://www.douyin.com/video/1', range: [0, 1023],
    upload: { url: PULL }, method: 'POST', headers: { Cookie: 'x' }, body: 'x', credentials: 'omit', tabId: 3,
  }, ctx);
  assert.deepEqual(ok, { url: 'https://v26.douyin.com/seg/1.ts?sign=x', referer: 'https://www.douyin.com/video/1', range: [0, 1023], upload: { url: PULL } });
  assert.deepEqual(checkCommand('media_pull', { url: 'https://douyin.com/a.m3u8', range: { start: 5, end: 5 }, upload: { url: PULL } }, ctx).range, [5, 5]);
  const base = { url: 'https://douyin.com/a.mp4', upload: { url: PULL } };
  denied(() => checkCommand('media_pull', { ...base, url: 'https://mail.google.com/mail/u/0' }, ctx));
  denied(() => checkCommand('media_pull', { ...base, url: 'https://evildouyin.com/a.mp4' }, ctx));
  denied(() => checkCommand('media_pull', { ...base, url: 'about:blank' }, ctx));
  denied(() => checkCommand('media_pull', { ...base, url: 'file:///C:/a.mp4' }, ctx));
  denied(() => checkCommand('media_pull', { ...base, url: 'https://u:p@douyin.com/a.mp4' }, ctx));
  denied(() => checkCommand('media_pull', { ...base, referer: 'https://evil.example/' }, ctx));
  denied(() => checkCommand('media_pull', { ...base, upload: { url: 'https://evil.example/api/ext/pull/' + 'b'.repeat(24) } }, ctx));
  denied(() => checkCommand('media_pull', { ...base, upload: { url: `${ORIGIN}/api/ext/media/x` } }, ctx));
  denied(() => checkCommand('media_pull', { url: base.url }, ctx));
  denied(() => checkCommand('media_pull', { ...base, range: [10, 9] }, ctx));
  denied(() => checkCommand('media_pull', { ...base, range: [-1, 9] }, ctx));
  denied(() => checkCommand('media_pull', { ...base, range: [0, PULL_CHUNK_MAX] }, ctx));
  denied(() => checkCommand('media_pull', { ...base, range: [0.5, 9] }, ctx));

  const b = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
  assert.equal(mediaBody('video/mp4', b('\0\0\0 ftypisom')).ok, true);
  assert.equal(mediaBody('image/png', b('\x89PNG\r\n')).ok, true, 'HLS 切片常伪装成图片');
  assert.equal(mediaBody('text/plain', b('\x47\x40\x11\x10')).ok, true, 'TS 切片被标成 text/plain');
  assert.equal(mediaBody('application/octet-stream', b('{\x9a\x01\xf3\x00\x88\x17\xe2\x05\x91\xbb\x02\x7f\x10\xc4\x03')).ok, true, 'AES 密钥碰巧以 { 开头');
  assert.equal(mediaBody('application/vnd.apple.mpegurl', b('#EXTM3U\n#EXT-X-VERSION:3')).kind, 'hls');
  assert.equal(mediaBody('text/plain', b('\xEF\xBB\xBF#EXTM3U\n')).kind, 'hls');
  assert.equal(mediaBody('application/dash+xml', b('<?xml version="1.0"?>\n<MPD xmlns="urn:mpeg:dash">')).kind, 'dash');
  // 服务器被攻破时想读的东西：接口、网页、protobuf、纯文本，换什么类型都出不去
  for (const [ct, body] of [['application/json', '{"msg":"私信"}'], ['application/octet-stream', '{"a":1}'],
    ['video/mp4', '[{"order":1}]'], ['text/html', '<!DOCTYPE html>'], ['video/mp2t', '<html>'], ['', ")]}'\n{}"],
    ['application/x-protobuf', '\x08\x01'], ['application/grpc-web', '\0\0'], ['text/javascript', 'var a'],
    ['text/plain', 'user=alice phone=123'], ['application/xml', '\x01\x02'], ['application/rss+xml', '\x01']]) {
    assert.equal(mediaBody(ct, b(body)).ok, false, `${ct} ${body}`);
  }
});

test('call 的 pull 槽：只能是配对服务器的 /api/ext/pull/，不带就没有', () => {
  const slot = `${ORIGIN}/api/ext/pull/${'a'.repeat(32)}`;
  const r = checkCommand('call', { name: 'capture', action: 'capture.pull', payload: { track: 0 }, upload: { url: slot } }, ctx);
  assert.deepEqual(r.upload, { url: slot });
  assert.equal(checkCommand('call', { name: 'capture', action: 'capture.status' }, ctx).upload, undefined);
  denied(() => checkCommand('call', { name: 'capture', action: 'capture.pull', upload: { url: `https://evil.example/api/ext/pull/${'a'.repeat(32)}` } }, ctx));
  denied(() => checkCommand('call', { name: 'capture', action: 'capture.pull', upload: { url: `${ORIGIN}/api/jobs/1` } }, ctx));
});
