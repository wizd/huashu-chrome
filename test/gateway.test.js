// HTTP 网关的门禁和路由。不碰真桥：只用不声明前提的站点函数，核验不需要开标签页。
// 真实页面上的端到端（Flow 生图）见提交说明，需要用户的 Chrome 和 Google 登录。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vc-gw-'));
process.env.HUASHU_CHROME_SITES_DIR = dir;
process.env.VCORP_CHROME_OUT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'vc-gw-out-'));   // 任务落盘别进用户的 ~/.vcorp-chrome/out
fs.mkdirSync(path.join(dir, 'example.com'));
fs.writeFileSync(path.join(dir, 'example.com', 'echo.js'), [
  '// @doc 回声',
  '// @capability text.echo, text.repeat',
  '// @home https://example.com/',
  'export default async function ({ args }) { return args; }',
].join('\n'));
fs.writeFileSync(path.join(dir, 'example.com', 'internal.js'), '// @doc 不对外\nexport default async function () {}\n');
fs.writeFileSync(path.join(dir, 'example.com', 'needs.js'), '// @capability text.login\n// @requires google-account\nexport default async function () {}\n');
fs.writeFileSync(path.join(dir, 'example.com', 'img.js'), '// @capability image.generate\nexport default async function () { return {}; }\n');

const { createGateway } = await import('../src/lib/gateway.js');
const { parseModel, listModels, _test: compatT } = await import('../src/lib/gateway-compat.js');
const { listSites } = await import('../src/lib/sites.js');

const TOKEN = 'a'.repeat(64);
const fakeClient = () => ({
  ws: null, async connect() { this.ws = {}; }, close() {},
  async call() { throw Object.assign(new Error('测试里没有浏览器'), { code: 'NO_EXTENSION' }); },
});
const gw = createGateway({ token: TOKEN, makeClient: fakeClient });
const server = http.createServer((req, res) => gw.handle(req, res));
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const root = `http://127.0.0.1:${server.address().port}`;
const base = `${root}/v1`;
test.after(() => { server.close(); gw.close(); });

const call = async (p, { method = 'GET', body, headers = {}, token = TOKEN } = {}) => {
  const res = await fetch(base + p, {
    method, body: body && JSON.stringify(body),
    headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
  });
  return { status: res.status, json: await res.json() };
};

test('站点函数头部的能力声明被解析', () => {
  const echo = listSites().find((s) => s.id === 'example.com/echo');
  assert.deepEqual(echo.capabilities, ['text.echo', 'text.repeat']);
  assert.deepEqual(echo.requires, []);
  assert.equal(echo.home, 'https://example.com/');
  assert.deepEqual(listSites().find((s) => s.id === 'example.com/needs').requires, ['google-account']);
});

test('没有 token / token 错 → 401', async () => {
  assert.equal((await call('/capabilities', { token: null })).status, 401);
  assert.equal((await call('/capabilities', { token: 'b'.repeat(64) })).status, 401);
});

test('浏览器网页发起的请求（带 Origin）→ 403，哪怕 token 对', async () => {
  const r = await call('/capabilities', { headers: { origin: 'https://evil.example' } });
  assert.equal(r.status, 403);
  assert.equal(r.json.error.code, 'FORBIDDEN_ORIGIN');
});

test('不认识的能力 → 404，并列出现有能力', async () => {
  const r = await call('/jobs', { method: 'POST', body: { capability: 'music.generate' } });
  assert.equal(r.status, 404);
  assert.match(r.json.error.message, /text\.echo/);
});

test('没声明 @capability 的站点函数不对外', async () => {
  const r = await call('/jobs', { method: 'POST', body: { fn: 'example.com/internal' } });
  assert.equal(r.status, 403);
  assert.equal(r.json.error.code, 'NOT_EXPOSED');
});

test('坏 JSON → 400；查不存在的任务 → 404；任务号不许带路径', async () => {
  const res = await fetch(base + '/jobs', { method: 'POST', body: '{', headers: { authorization: `Bearer ${TOKEN}` } });
  assert.equal(res.status, 400);
  assert.equal((await call('/jobs/20990101-deadbeef00')).status, 404);
  assert.equal((await call('/jobs/..%2F..%2Fapi')).status, 404);
});

test('能力目录：无前提的直接可用；前提核验不了的列为不可用并说明原因', async () => {
  const rows = (await call('/capabilities')).json.capabilities;
  const echo = rows.filter((r) => r.fn === 'example.com/echo');
  assert.deepEqual(echo.map((r) => r.capability).sort(), ['text.echo', 'text.repeat']);
  assert.ok(echo.every((r) => r.available));
  const needs = rows.find((r) => r.fn === 'example.com/needs');
  assert.equal(needs.available, false);
  assert.match(needs.reason, /没有浏览器/);
  assert.ok(!rows.some((r) => r.fn === 'example.com/internal'));
});

// ---------------- flow2api 兼容层 ----------------

test('模型名解析：flow2api 的图片/视频名 → 站点函数 args', () => {
  assert.deepEqual(parseModel('gemini-3.1-flash-image-portrait'), { kind: 'image', capability: 'image.generate', args: { model: 'Nano Banana 2.1', aspect: '9:16' } });
  assert.equal(parseModel('models/gemini-3.0-pro-image-four-three').args.aspect, '4:3');
  assert.equal(parseModel('gemini-3.1-flash-image').args.aspect, undefined);
  assert.deepEqual(parseModel('omni-1.2-flash').args, { model: 'Omni 1.2 Flash', seconds: 8, aspect: '16:9' });
  assert.deepEqual(parseModel('veo-3.1-fast-i2v-6s-portrait').args, { model: 'Veo 3.1 Fast', seconds: 6, aspect: '9:16', mode: 'frames' });
  assert.equal(parseModel('veo-3.1-lite-r2v-8s-landscape').args.mode, 'reference');
  assert.equal(parseModel('veo-3.1-lite-r2v-8s-landscape').needsImages, true);
  assert.equal(parseModel('gpt-4o'), null);
  assert.equal(parseModel('gemini-3.1-flash-image-sideways'), null);
  assert.throws(() => parseModel('gemini-3.1-flash-image-landscape-4k'), /2K\/4K/);
  assert.throws(() => parseModel('veo-3.1-fast-extend-8s-landscape'), /延长/);
  // 列出来的每个名字都解析得了
  for (const m of listModels()) assert.ok(parseModel(m.id), m.id);
});

test('请求归一化：OpenAI messages / Gemini contents 取最后一条用户消息、带上 system 和图', () => {
  const o = compatT.fromOpenAI({ messages: [
    { role: 'system', content: 'be bold' },
    { role: 'user', content: 'old' },
    { role: 'user', content: [{ type: 'text', text: 'a cat' }, { type: 'image_url', image_url: { url: 'data:image/png;base64,AAAA' } }] },
  ] });
  assert.equal(o.prompt, 'be bold\na cat');
  assert.deepEqual(o.images, [{ uri: 'data:image/png;base64,AAAA' }]);
  const g = compatT.fromGemini({
    systemInstruction: { parts: [{ text: 'sys' }] },
    contents: [{ role: 'user', parts: [{ text: 'a dog' }, { inlineData: { mimeType: 'image/jpeg', data: 'BBBB' } }] }],
    generationConfig: { imageConfig: { aspectRatio: '1:1', imageSize: '2K' } },
  });
  assert.equal(g.prompt, 'sys\na dog');
  assert.deepEqual(g.images, [{ data: 'BBBB', mimeType: 'image/jpeg' }]);
  assert.equal(g.aspect, '1:1');
  assert.equal(g.size, '2K');
});

test('token 也能放在 x-goog-api-key 或 ?key=', async () => {
  assert.equal((await fetch(`${root}/v1beta/models`, { headers: { 'x-goog-api-key': TOKEN } })).status, 200);
  assert.equal((await fetch(`${root}/v1beta/models?key=${TOKEN}`)).status, 200);
  const bad = await fetch(`${root}/v1beta/models?key=nope`);
  assert.equal(bad.status, 401);
  assert.equal((await bad.json()).error.status, 'UNAUTHENTICATED');   // Gemini 风格错误体
});

test('/v1/models 是 OpenAI 列表；/v1beta/models 是 Gemini 列表', async () => {
  const o = (await call('/models')).json;
  assert.equal(o.object, 'list');
  assert.ok(o.data.some((m) => m.id === 'veo-3.1-fast-8s-landscape'));
  const g = await (await fetch(`${root}/v1beta/models/gemini-3.1-flash-image-square`, { headers: { 'x-goog-api-key': TOKEN } })).json();
  assert.equal(g.name, 'models/gemini-3.1-flash-image-square');
  assert.ok(g.supportedGenerationMethods.includes('generateContent'));
});

test('chat/completions：不认识的模型、2K、i2v 没给图 → 400，OpenAI 错误体', async () => {
  const chat = (body) => call('/chat/completions', { method: 'POST', body });
  let r = await chat({ model: 'gpt-4o', messages: [{ role: 'user', content: 'hi' }] });
  assert.equal(r.status, 400);
  assert.equal(r.json.error.type, 'invalid_request_error');
  assert.equal((await chat({ model: 'gemini-3.1-flash-image-landscape-2k', messages: [{ role: 'user', content: 'x' }] })).status, 400);
  r = await chat({ model: 'veo-3.1-fast-i2v-6s-landscape', messages: [{ role: 'user', content: 'x' }] });
  assert.equal(r.status, 400);
  assert.match(r.json.error.message, /输入图/);
  r = await chat({ model: 'gemini-3.1-flash-image-landscape', messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'ftp://x' } }, { type: 'text', text: 'x' }] }] });
  assert.equal(r.status, 400);
});

test('chat/completions：任务失败时非流式回 502，流式回错误块 + [DONE]', async () => {
  const msg = { model: 'gemini-3.1-flash-image-square', messages: [{ role: 'user', content: 'a cat' }] };
  const r = await call('/chat/completions', { method: 'POST', body: msg });
  assert.equal(r.status, 502);
  assert.match(r.json.error.message, /没有浏览器/);
  const s = await fetch(`${base}/chat/completions`, { method: 'POST', body: JSON.stringify({ ...msg, stream: true }), headers: { authorization: `Bearer ${TOKEN}` } });
  assert.equal(s.status, 200);
  assert.match(s.headers.get('content-type'), /event-stream/);
  const text = await s.text();
  assert.match(text, /"role":"assistant"/);
  assert.match(text, /❌/);
  assert.ok(text.trimEnd().endsWith('data: [DONE]'));
});

test('Gemini generateContent：任务失败 → Gemini 错误体；输入图的临时目录随任务清掉', async () => {
  const before = fs.readdirSync(os.tmpdir()).filter((n) => n.startsWith('vc-gw-in-')).length;
  const r = await fetch(`${root}/v1beta/models/gemini-3.1-flash-image-square:generateContent`, {
    method: 'POST', headers: { 'x-goog-api-key': TOKEN },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'a cat' }, { inlineData: { mimeType: 'image/png', data: Buffer.from('png').toString('base64') } }] }] }),
  });
  assert.equal(r.status, 502);
  assert.equal((await r.json()).error.status, 'INTERNAL');
  assert.equal(fs.readdirSync(os.tmpdir()).filter((n) => n.startsWith('vc-gw-in-')).length, before);
});

test('兼容层用到的每种能力，仓库里都带着出厂站点函数（新用户装上就能用）', () => {
  const seed = listSites().filter((s) => s.layer === 'seed');
  for (const cap of new Set(listModels().map((m) => parseModel(m.id).capability))) {
    const fn = seed.find((s) => s.capabilities.includes(cap));
    assert.ok(fn, `没有出厂函数提供 ${cap}`);
    assert.ok(fn.requires.includes('google-account') && fn.home, `${fn.id} 缺 @requires / @home`);
  }
});

test('/v1/media：按签名 URL 里的 mediaId 交回本机任务目录里的文件；别的地址 400', async () => {
  const id = '11111111-2222-3333-4444-555555555555';
  const d = path.join(process.env.VCORP_CHROME_OUT_DIR, '20990101-media00001');
  fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, `${id}.jpg`), Buffer.from([0xff, 0xd8, 0xff, 0x00]));
  const u = encodeURIComponent(`https://flow-content.google/image/${id}?Expires=1&KeyName=k&Signature=s`);
  const r = await fetch(`${base}/media?url=${u}`, { headers: { authorization: `Bearer ${TOKEN}` } });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'image/jpeg');
  assert.deepEqual([...Buffer.from(await r.arrayBuffer())], [0xff, 0xd8, 0xff, 0x00]);
  assert.equal((await call(`/media?url=${encodeURIComponent('http://169.254.169.254/latest')}`)).status, 400);
  assert.equal((await call('/media?url=' + encodeURIComponent('https://evil.example/image/' + id))).status, 400);
});

test('生图收 4 张参考图，生视频最多 3 张', async () => {
  const img = { type: 'image_url', image_url: { url: 'ftp://x' } };
  // 张数先过检查，才会去读图（ftp 读不了 → 400 BAD_IMAGE，而不是张数错）
  let r = await call('/chat/completions', { method: 'POST', body: { model: 'gemini-3.1-flash-image-square', messages: [{ role: 'user', content: [{ type: 'text', text: 'x' }, img, img, img, img] }] } });
  assert.equal(r.status, 400);
  assert.doesNotMatch(r.json.error.message, /最多/);
  r = await call('/chat/completions', { method: 'POST', body: { model: 'omni-1.1-flash-4s-landscape', messages: [{ role: 'user', content: [{ type: 'text', text: 'x' }, img, img, img, img] }] } });
  assert.match(r.json.error.message, /最多 3 张/);
});
