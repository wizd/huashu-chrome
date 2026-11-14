// script 工具的真机实测 —— 需要开着的 Chrome 和装好的扩展。
// 用法：node test/script-live.mjs
//
// 在靶场（test/fixtures/script.html，模拟发布页）上跑一整条发布流程：
// 填标题 → 填正文 → 加两个话题 → 传文件 → iframe 里勾原创 → 点封闭 shadow 里的发布 →
// 等接口 → 跳到成功页。再验证：失败时的报告、存成站点函数、再次一行调用。
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sitesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vc-live-sites-'));
process.env.HUASHU_CHROME_SITES_DIR = sitesDir;
const { BridgeClient } = await import('../src/lib/rpc.js');
const { ScriptRunner } = await import('../src/lib/script.js');

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const PORT = 8125;
let published = null;
const server = http.createServer((req, res) => {
  const p = (req.url || '/').split('?')[0].replace(/^\//, '');
  if (p === 'api/publish') {
    let b = '';
    req.on('data', (c) => { b += c; });
    req.on('end', () => { published = JSON.parse(b); setTimeout(() => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ id: 4242 })); }, 300); });
    return;
  }
  fs.readFile(path.join(DIR, p), (e, buf) => {
    if (e) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(buf);
  });
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

const img = path.join(os.tmpdir(), 'vc-live-cover.png');
fs.writeFileSync(img, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'));

const c = new BridgeClient({ client: 'script-live' });
await c.connect();
if (!c.extensionOnline) { console.error('扩展没连上'); process.exit(2); }
const runner = new ScriptRunner(c);

const PUBLISH = `
const p = await browser.newPage(args.url, { label: 'script 实测' });
state.tab = p.tabId;
await p.getByPlaceholder('标题').fill(args.title);
const ed = p.locator('.ProseMirror');
await ed.fill(args.text);
for (const t of args.tags) {
  await ed.pressSequentially(' #' + t);
  await p.locator('div.item').filter({ hasText: '#' + t }).first().click();
}
const topics = await p.locator('a.topic').allTextContents();
expect(topics.length === args.tags.length, '话题数不对：' + JSON.stringify(topics));
await p.locator('input[type=file]').setInputFiles(args.files);
await p.waitForFunction((n) => document.getElementById('files').textContent === n + '/18', args.files.length);
await p.getByLabel('原创声明').check();
await p.getByRole('button', { name: '发布' }).click();
const r = await p.waitForResponse('/api/publish');
await p.waitForURL(/success=1/);
log('发布成功页', await p.url());
return { id: r.json().id, topics, done: await p.getByText('发布成功').isVisible() };
`;

const args = { url: `http://127.0.0.1:${PORT}/script.html`, title: '代码通道实测标题', text: '第一段文字\n\n第二段文字', tags: ['测试', '代码'], files: [img] };
let fails = 0;
const check = (ok, msg) => { console.log(`${ok ? '✓' : '✗'} ${msg}`); if (!ok) fails++; };

try {
  console.log('── 1. 整条发布流程');
  const t0 = Date.now();
  const out = await runner.handle({ code: PUBLISH, args, save: { id: '127.0.0.1/publishDemo', doc: '靶场发布：标题、正文、话题、文件、原创、发布' }, timeout: 120000 });
  console.log(out);
  check(out.startsWith('✅'), `脚本成功（${Date.now() - t0}ms）`);
  check(published?.title === args.title, `服务器收到的标题：${published?.title}`);
  check(/第一段文字/.test(published?.text) && /第二段文字/.test(published?.text), '服务器收到的正文分段');
  check(JSON.stringify(published?.topics) === JSON.stringify(['#测试', '#代码']), `话题：${JSON.stringify(published?.topics)}`);
  check(published?.files?.[0] === 'vc-live-cover.png', `文件：${JSON.stringify(published?.files)}`);
  check(published?.orig === true, 'iframe 里的原创声明已勾');
  check(/已存成站点函数/.test(out), '跑通后存成站点函数');
  await c.call('tabs', { action: 'close', tabId: runner.state.tab }).catch(() => {});

  console.log('\n── 2. 失败时交回的证据');
  const bad = await runner.handle({
    code: `const p = await browser.newPage(args.url, {label:'script 失败实测'});\nstate.tab = p.tabId;\nawait p.getByRole('button', { name: '不存在的按钮' }).click({ timeout: 1500 });`,
    args,
  });
  console.log(bad);
  check(bad.startsWith('❌'), '报失败');
  check(/第 3 行/.test(bad), '指出出错行');
  check(/页面现状/.test(bad) && /地址：/.test(bad), '带页面现状诊断');
  await c.call('tabs', { action: 'close', tabId: runner.state.tab }).catch(() => {});

  console.log('\n── 3. 一行调用存下来的站点函数');
  published = null;
  const t1 = Date.now();
  const again = await runner.handle({ run: '127.0.0.1/publishDemo', args: { ...args, title: '第二次直接调用' } });
  console.log(again.split('\n').slice(0, 8).join('\n'));
  check(again.startsWith('✅') && published?.title === '第二次直接调用', `站点函数直接调用成功（${Date.now() - t1}ms）`);
  await c.call('tabs', { action: 'close', tabId: runner.state.tab }).catch(() => {});
} finally {
  c.close();
  server.close();
}
console.log(fails ? `\n${fails} 项不通过` : '\n全部通过');
process.exit(fails ? 1 : 0);
