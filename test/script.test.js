// 代码通道（script 工具）的执行器逻辑。浏览器用假的桥代替：
// eval 收到的表达式里认出 inPage 的操作名，按剧本回答。真实页面上的行为见 test/script-live.mjs。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vc-sites-'));
process.env.HUASHU_CHROME_SITES_DIR = dir;
const { ScriptRunner } = await import('../src/lib/script.js');
const { listSites, describeSites, parseId } = await import('../src/lib/sites.js');

// 假桥：记录命令；eval 里按 inPage 的第一个参数分派
function fakeBridge(handlers = {}) {
  const calls = [];
  return {
    calls,
    ws: null,   // 失败时不去做诊断截图
    async call(cmd, params) {
      calls.push({ cmd, params });
      if (cmd === 'eval') {
        const m = /\)\("(\w+)"/.exec(params.expr);
        const op = m ? m[1] : 'raw';
        const h = handlers[op] ?? handlers.raw;
        const v = typeof h === 'function' ? h(params.expr) : h;
        return { untrusted: true, text: v === undefined ? 'undefined' : JSON.stringify(v) };
      }
      if (handlers[cmd]) return handlers[cmd](params);
      return { text: `ok ${cmd}` };
    },
  };
}

test('成功：返回结果、日志和轨迹', async () => {
  const b = fakeBridge({ count: 1, stamp: { id: 'vcx', count: 1, visibleCount: 1, inDoc: true, desc: '<button> "发布"' }, netLen: 0 });
  const r = new ScriptRunner(b);
  const out = await r.handle({ code: `log('开始'); await page.getByRole('button',{name:'发布'}).click(); return {ok:1}` });
  assert.match(out, /^✅ 完成/);
  assert.match(out, /"ok": 1/);
  assert.match(out, /开始/);
  assert.match(out, /✓  1\. click role=button\[name=发布\]/);
  // 页面里打了标记，扩展的 click 用这个标记的 selector
  assert.ok(b.calls.some((c) => c.cmd === 'click' && c.params.selector === '[data-vc="vcx"]'));
});

test('失败：报出用户代码的行号和卡住的那一步', async () => {
  const b = fakeBridge({ count: 0, diagnose: { url: 'u' } });
  const r = new ScriptRunner(b);
  const code = `const a = 1;\nawait page.locator('#nope').click({timeout: 50});\nreturn a;`;
  const out = await r.handle({ code });
  assert.match(out, /^❌ 失败/);
  assert.match(out, /NOT_FOUND/);
  assert.match(out, /第 2 行/);
  assert.match(out, /卡在第 1 步：click #nope/);
});

test('fill 读回不一致就报错，不带着错数据往下走', async () => {
  const b = fakeBridge({ count: 1, netLen: 0, fill: { desc: '<input>', got: '只填进去一半' } });
  const r = new ScriptRunner(b);
  const out = await r.handle({ code: `await page.fill('input', '只填进去一半的标题很长很长')` });
  assert.match(out, /FILL_MISMATCH/);
});

test('state 跨调用保留', async () => {
  const r = new ScriptRunner(fakeBridge());
  await r.handle({ code: 'state.n = 41' });
  const out = await r.handle({ code: 'return state.n + 1' });
  assert.match(out, /42/);
});

test('只有跑通的代码才会存成站点函数；之后可以 run，战绩累加', async () => {
  const r = new ScriptRunner(fakeBridge());
  const bad = await r.handle({ code: 'throw new Error("还没写好")', save: 'example.com/hello' });
  assert.match(bad, /^❌/);
  assert.equal(listSites('example.com').length, 0);

  const ok = await r.handle({ code: 'return "hi " + args.who', args: { who: 'a' }, save: { id: 'example.com/hello', doc: '打招呼' } });
  assert.match(ok, /已存成站点函数 example\.com\/hello/);
  const out = await r.handle({ run: 'example.com/hello', args: { who: 'b' } });
  assert.match(out, /hi b/);

  const [fn] = listSites('www.example.com');
  assert.equal(fn.id, 'example.com/hello');
  assert.equal(fn.doc, '打招呼');
  assert.equal(fn.stats.ok, 1);
  assert.match(describeSites('example.com'), /战绩 1\/1/);
});

test('站点函数失败时报出源码路径和连续失败次数', async () => {
  const r = new ScriptRunner(fakeBridge());
  await r.handle({ code: 'if (args.boom) throw new Error("改版了"); return 1', args: {}, save: 'example.com/flaky' });
  await r.handle({ run: 'example.com/flaky', args: { boom: true } });
  const out = await r.handle({ run: 'example.com/flaky', args: { boom: true } });
  assert.match(out, /这是站点函数 example\.com\/flaky/);
  assert.match(out, /已连续失败 2 次/);
  // 脚本里调用也一样记战绩
  const nested = await r.handle({ code: 'return await sites.run("example.com/flaky", {})' });
  assert.match(nested, /^✅/);
});

test('后台任务：先返回任务号，之后取结果', async () => {
  const r = new ScriptRunner(fakeBridge());
  const started = await r.handle({ code: 'await sleep(50); return "done!"', background: true });
  const id = /任务号 (j\d+)/.exec(started)[1];
  const res = await r.handle({ job: id, wait: 2000 });
  assert.match(res, /done!/);
});

test('前台超时转后台，不取消', async () => {
  const r = new ScriptRunner(fakeBridge());
  const out = await r.handle({ code: 'await sleep(200); return "late"', timeout: 20 });
  assert.match(out, /转为后台任务 (j\d+)/);
  const id = /转为后台任务 (j\d+)/.exec(out)[1];
  assert.match(await r.handle({ job: id, wait: 2000 }), /late/);
});

test('站点函数 id 校验', () => {
  assert.throws(() => parseId('nodomain'), /域名\/函数名/);
  assert.throws(() => parseId('a.com/1bad'), /函数名/);
  assert.deepEqual(parseId('https://www.A.com/doIt'.replace('https://', '')), { domain: 'a.com', name: 'doIt' });
});

test('locator 认 Playwright 选择器写法，不再原样塞给 querySelectorAll', async () => {
  const { parseSelector } = await import('../src/lib/page.js');
  assert.deepEqual(parseSelector('button:has-text("tune")'), { css: 'button', hasText: 'tune' });
  assert.deepEqual(parseSelector('text="发布"'), { text: '发布', exact: true });
  assert.deepEqual(parseSelector('text=发布'), { text: '发布', exact: false });
  assert.deepEqual(parseSelector('text=/发.布/i'), { text: { re: '发.布', flags: 'i' } });
  assert.deepEqual(parseSelector('role=button[name="发布"]'), { role: 'button', name: '发布', exact: true });
  assert.deepEqual(parseSelector('a >> nth=1'), { css: 'a', nth: 1 });
  assert.deepEqual(parseSelector('div.card >> button:visible'), { css: 'button', visible: true, parent: { css: 'div.card' } });
  assert.deepEqual(parseSelector("button[aria-label='x >> y']"), { css: "button[aria-label='x >> y']" });
  assert.deepEqual(parseSelector('div.card'), { css: 'div.card' });
  assert.throws(() => parseSelector('div:has-text("x") > a'), /只能写在最后/);
});

test('TOO_BIG 报真实上限而不是写死 4MB，且新版扩展保留旧截断后缀以兼容旧客户端', async () => {
  // 旧客户端 + 新扩展兼容检查：extension 截断输出仍以 \n…（已截断） 结尾
  const bgSrc = fs.readFileSync(new URL('../extension/background.js', import.meta.url), 'utf8');
  const cdpSrc = fs.readFileSync(new URL('../extension/cdp.js', import.meta.url), 'utf8');
  assert.match(bgSrc, /s\.slice\(0, max\) \+ '\\n…（已截断）'/);
  assert.match(cdpSrc, /s\.slice\(0, maxLength\) \+ '\\n…（已截断）'/);
  const oldClientRe = /\n…（已截断）$/;
  const newExtReply = { untrusted: true, text: 'a'.repeat(400000) + '\n…（已截断）', truncated: true, maxLength: 400000 };
  assert.ok(oldClientRe.test(newExtReply.text), '旧客户端仍能识别新版扩展的截断输出');

  const make = (reply) => ({
    calls: [],
    ws: null,
    async call(cmd) {
      if (cmd === 'eval') return reply;
      return { text: 'ok' };
    },
  });
  for (const [reply, re] of [
    [newExtReply, /上限约 400KB \/ 400000 字符.*低于 280KB/],
    [{ untrusted: true, text: 'a'.repeat(400000) + '\n…（已截断）' }, /已保留 400000 字符后被截断.*低于 280KB/],
    [{ untrusted: true, text: 'a'.repeat(200000) + '\n…（结果太大，已截断）' }, /超过云端传输上限.*仅保留前 200000 字符/],
  ]) {
    const r = new ScriptRunner(make(reply));
    const out = await r.handle({ code: 'return await page.evaluate(() => 1)' });
    assert.match(out, /TOO_BIG/);
    assert.match(out, re);
    assert.doesNotMatch(out, /超过 4MB/);
  }
});

test('page.keyboard 兼容函数调用与 Playwright 风格 press/type，单参数 page.press 立刻报 BAD_PARAMS', async () => {
  const b = fakeBridge({ typeActive: { desc: '<input>', got: 'hi' } });
  const r = new ScriptRunner(b);
  const ok = await r.handle({ code: `await page.keyboard('Escape'); await page.keyboard.press('Enter'); await page.keyboard.type('hi'); return 'ok'` });
  assert.match(ok, /^✅ 完成/);
  assert.deepEqual(b.calls.filter((c) => c.cmd === 'key').map((c) => c.params.key), ['Escape', 'Enter']);
  const typeCall = b.calls.find((c) => c.cmd === 'eval' && c.params.expr.includes('"typeActive"'));
  assert.ok(typeCall);

  // 直接在沙箱里跑注入页面的 typeActive：验证中间光标、选区替换和 readonly/disabled 拒绝
  const { default: vm } = await import('node:vm');
  const runTypeActive = (activeElement, text) => {
    const expr = typeCall.params.expr.replace(/"hi"\)$/, `${JSON.stringify(text)})`);
    const ctx = {
      document: { activeElement, body: {}, documentElement: {} },
      Event: class { constructor(t) { this.type = t; } },
      HTMLInputElement: class {},
      HTMLTextAreaElement: class {},
    };
    return vm.runInNewContext(expr, ctx);
  };
  const makeInput = (value, selectionStart, selectionEnd, extra = {}) => ({
    tagName: 'INPUT', value, selectionStart, selectionEnd, ...extra,
    getAttribute: () => '', dispatchEvent: () => {},
    setSelectionRange(s, e) { this.selectionStart = s; this.selectionEnd = e; },
  });
  // 光标在中间插入
  const mid = makeInput('abef', 2, 2);
  runTypeActive(mid, 'cd');
  assert.equal(mid.value, 'abcdef');
  assert.equal(mid.selectionStart, 4);
  assert.equal(mid.selectionEnd, 4);
  // 有选区时替换选区
  const sel = makeInput('hello world', 6, 11);
  runTypeActive(sel, 'claude');
  assert.equal(sel.value, 'hello claude');
  assert.equal(sel.selectionStart, 12);
  // 只读/禁用拒绝
  assert.throws(() => runTypeActive(makeInput('x', 1, 1, { readOnly: true }), 'y'), /不可编辑/);
  assert.throws(() => runTypeActive(makeInput('x', 1, 1, { disabled: true }), 'y'), /不可编辑/);

  const bad = await r.handle({ code: `await page.press('Escape')` });
  assert.match(bad, /^❌ 失败/);
  assert.match(bad, /BAD_PARAMS/);
  assert.match(bad, /page\.keyboard\.press\("Escape"\)/);
});

