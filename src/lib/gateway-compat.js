// flow2api 兼容层：把 OpenAI / Gemini 格式的请求翻译成网关任务（image.generate / video.generate）。
//
// 老客户端（Cherry Studio、NextChat、new-api 渠道……）原来指向 flow2api，改个 base URL 就能接过来：
//   GET  /v1/models                                   OpenAI 模型列表（flow2api 同名）
//   POST /v1/chat/completions                         stream 走 SSE；进度放 reasoning_content，结果放 content
//   GET  /v1/media?url=<flow-content 签名 URL>         取结果字节（先给本机已下好的文件，没有再代拉）
//   GET  /v1beta/models[/{model}]                     Gemini 模型列表
//   POST /v1beta/models/{model}:generateContent       Gemini；图片回 inlineData，视频回 fileData
//   POST /v1beta/models/{model}:streamGenerateContent ?alt=sse 走 SSE，否则回 JSON 数组
// 模型名沿用 flow2api（gemini-3.1-flash-image-landscape、veo-3.1-fast-8s-portrait、omni-1.2-flash-i2v…），
// 解析成站点函数的 args（model/aspect/seconds/mode），提示词照常交给 Flow 页面里的 agent。
// 输入图（data URI / http URL / inlineData / fileData）先落到临时目录，站点函数再拖进页面。
//
// 和 flow2api 的差别：2K/4K 放大、视频延长（extend）还没做，请求这些模型名直接 400，不悄悄降级。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ASPECT = { landscape: '16:9', portrait: '9:16', square: '1:1', 'four-three': '4:3', 'three-four': '3:4' };
const IMG_FAMILY = {
  'gemini-3.1-flash-image': 'Nano Banana 2.1',
  'gemini-3.1-flash-lite-image': 'Nano Banana 2.1',
  'gemini-3.0-pro-image': 'Nano Banana Pro',
  'gemini-3-pro-image-preview': 'Nano Banana Pro',
};
const VID_FAMILY = {
  'veo-3.1-lite': { model: 'Veo 3.1 Lite', seconds: 8 },
  'veo-3.1-fast': { model: 'Veo 3.1 Fast', seconds: 8 },
  'veo-3.1-quality': { model: 'Veo 3.1 Quality', seconds: 8 },
  'omni-1.2-flash': { model: 'Omni 1.2 Flash', seconds: 8 },
  'omni-1.1-flash': { model: 'Omni 1.1 Flash', seconds: 8 },
};
const GEMINI_ASPECT = { '16:9': '16:9', '9:16': '9:16', '1:1': '1:1', '4:3': '4:3', '3:4': '3:4' };

const unsupported = (msg) => Object.assign(new Error(msg), { status: 400, code: 'UNSUPPORTED_MODEL' });

// 模型名 → {capability, args, kind}；不认识返回 null
export function parseModel(name) {
  const m0 = String(name || '').replace(/^models\//, '').toLowerCase();
  for (const [fam, model] of Object.entries(IMG_FAMILY)) {
    if (m0 !== fam && !m0.startsWith(`${fam}-`)) continue;
    const rest = m0.slice(fam.length).split('-').filter(Boolean).join('-');
    const m = /^(landscape|portrait|square|four-three|three-four)?-?(2k|4k)?$/.exec(rest);
    if (!m) return null;
    if (m[2]) throw unsupported(`${name}：2K/4K 放大还没接上，请用不带 -2k/-4k 的模型名`);
    return { kind: 'image', capability: 'image.generate', args: { model, ...(m[1] ? { aspect: ASPECT[m[1]] } : {}) } };
  }
  for (const [fam, def] of Object.entries(VID_FAMILY)) {
    if (m0 !== fam && !m0.startsWith(`${fam}-`)) continue;
    const m = /^(?:-(i2v|r2v|t2v|extend))?(?:-(\d{1,2})s)?(?:-(landscape|portrait))?$/.exec(m0.slice(fam.length));
    if (!m) return null;
    if (m[1] === 'extend') throw unsupported(`${name}：视频延长还没接上`);
    const mode = m[1] === 'i2v' ? 'frames' : m[1] === 'r2v' ? 'reference' : undefined;
    return {
      kind: 'video', capability: 'video.generate',
      args: { model: def.model, seconds: m[2] ? Number(m[2]) : def.seconds, aspect: ASPECT[m[3] || 'landscape'], ...(mode ? { mode } : {}) },
      needsImages: !!mode,
    };
  }
  return null;
}

// /v1/models 列出来的名字（和 flow2api 对齐，去掉还不支持的 2k/4k/extend）
export function listModels() {
  const out = [];
  for (const fam of ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3.0-pro-image']) {
    for (const a of Object.keys(ASPECT)) out.push({ id: `${fam}-${a}`, kind: 'image' });
  }
  for (const v of ['lite', 'fast', 'quality']) {
    for (const o of ['landscape', 'portrait']) {
      for (const s of [4, 6, 8]) out.push({ id: `veo-3.1-${v}-${s}s-${o}`, kind: 'video' });
      for (const s of [4, 6, 8]) out.push({ id: `veo-3.1-${v}-i2v-${s}s-${o}`, kind: 'video' });
      if (v !== 'quality') out.push({ id: `veo-3.1-${v}-r2v-8s-${o}`, kind: 'video' });
    }
  }
  out.push({ id: 'omni-1.2-flash', kind: 'video' });
  for (let s = 3; s <= 15; s++) for (const o of s <= 10 ? ['landscape', 'portrait'] : ['portrait']) out.push({ id: `omni-1.2-flash-${s}s-${o}`, kind: 'video' });
  for (const s of [4, 6, 8, 10]) for (const o of ['landscape', 'portrait']) out.push({ id: `omni-1.1-flash-${s}s-${o}`, kind: 'video' });
  return out;
}

// ---------- 输入图 ----------

const IMG_MAX = 20 * 1024 * 1024;
const EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };

async function saveImage(src, dir, i) {
  let buf; let type;
  const d = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(src.uri || '');
  if (src.data) { buf = Buffer.from(src.data, 'base64'); type = src.mimeType; }
  else if (d) { buf = d[2] ? Buffer.from(d[3], 'base64') : Buffer.from(decodeURIComponent(d[3])); type = d[1]; }
  else if (/^https?:\/\//i.test(src.uri || '')) {
    const r = await fetch(src.uri, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) throw Object.assign(new Error(`取输入图失败 ${r.status}：${src.uri.slice(0, 120)}`), { status: 400, code: 'BAD_IMAGE' });
    buf = Buffer.from(await r.arrayBuffer());
    type = r.headers.get('content-type')?.split(';')[0];
  } else throw Object.assign(new Error('输入图只接受 data URI、http(s) URL 或 inlineData'), { status: 400, code: 'BAD_IMAGE' });
  if (!buf.length || buf.length > IMG_MAX) throw Object.assign(new Error('输入图为空或超过 20MB'), { status: 400, code: 'BAD_IMAGE' });
  const f = path.join(dir, `input-${i + 1}${EXT[type] || '.png'}`);
  fs.writeFileSync(f, buf);
  return f;
}

// ---------- 请求归一化 ----------

function textOf(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.filter((p) => p?.type === 'text' || typeof p?.text === 'string').map((p) => p.text).join('\n');
  return '';
}

function fromOpenAI(body) {
  const msgs = Array.isArray(body.messages) ? body.messages : [];
  const last = [...msgs].reverse().find((m) => m.role === 'user');
  if (!last) throw Object.assign(new Error('messages 里没有 user 消息'), { status: 400, code: 'BAD_REQUEST' });
  const sys = msgs.filter((m) => m.role === 'system').map((m) => textOf(m.content)).filter(Boolean).join('\n');
  const images = Array.isArray(last.content)
    ? last.content.filter((p) => p?.type === 'image_url').map((p) => ({ uri: typeof p.image_url === 'string' ? p.image_url : p.image_url?.url }))
    : [];
  return { prompt: [sys, textOf(last.content)].filter(Boolean).join('\n').trim(), images };
}

function fromGemini(body) {
  const contents = Array.isArray(body.contents) ? body.contents : body.contents ? [body.contents] : [];
  const last = [...contents].reverse().find((c) => !c.role || c.role === 'user');
  if (!last) throw Object.assign(new Error('contents 里没有 user 内容'), { status: 400, code: 'BAD_REQUEST' });
  const parts = last.parts || [];
  const sys = (body.systemInstruction?.parts || body.system_instruction?.parts || []).map((p) => p.text).filter(Boolean).join('\n');
  const images = [];
  for (const p of parts) {
    const inl = p.inlineData || p.inline_data;
    const fd = p.fileData || p.file_data;
    if (inl?.data) images.push({ data: inl.data, mimeType: inl.mimeType || inl.mime_type });
    else if (fd?.fileUri || fd?.file_uri) images.push({ uri: fd.fileUri || fd.file_uri });
  }
  const text = parts.map((p) => p.text).filter(Boolean).join('\n');
  const gc = body.generationConfig || body.generation_config || {};
  const ic = gc.imageConfig || gc.image_config || {};
  return { prompt: [sys, text].filter(Boolean).join('\n').trim(), images, aspect: GEMINI_ASPECT[ic.aspectRatio || ic.aspect_ratio], size: ic.imageSize || ic.image_size };
}

// ---------- 主体 ----------

const MEDIA_MAX = 200 * 1024 * 1024;
const mimeOf = (f) => ({ '.png': 'image/png', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm' })[path.extname(f).toLowerCase()] || 'image/jpeg';

// findMedia(mediaId) → 本机已下好的文件路径或 null（网关在任务目录里找）
export function createCompat({ submit, cancel, readJson, json, findMedia = () => null, log = () => {} }) {
  // 请求 → 任务。返回 {job, spec, tmp}
  async function startJob(modelName, norm) {
    const spec = parseModel(modelName);
    if (!spec) throw Object.assign(new Error(`不认识的模型 ${modelName}，GET /v1/models 看可用的`), { status: 400, code: 'UNKNOWN_MODEL' });
    if (!norm.prompt) throw Object.assign(new Error('提示词为空'), { status: 400, code: 'BAD_REQUEST' });
    if (norm.size && !/^1k$/i.test(norm.size)) throw unsupported(`imageSize ${norm.size}：2K/4K 放大还没接上`);
    if (spec.needsImages && !norm.images.length) throw Object.assign(new Error(`${modelName} 需要至少一张输入图`), { status: 400, code: 'BAD_REQUEST' });
    const maxImages = spec.kind === 'image' ? 4 : 3;
    if (norm.images.length > maxImages) throw Object.assign(new Error(`最多 ${maxImages} 张输入图`), { status: 400, code: 'BAD_REQUEST' });
    const tmp = norm.images.length ? fs.mkdtempSync(path.join(os.tmpdir(), 'vc-gw-in-')) : null;
    try {
      const images = [];
      for (let i = 0; i < norm.images.length; i++) images.push(await saveImage(norm.images[i], tmp, i));
      const args = { ...spec.args, prompt: norm.prompt, ...(norm.aspect ? { aspect: norm.aspect } : {}), ...(images.length ? { images } : {}) };
      const job = submit({ capability: spec.capability, args, onDone: () => tmp && fs.rmSync(tmp, { recursive: true, force: true }) });
      return { job, spec };
    } catch (e) {
      if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
      throw e;
    }
  }

  // 等任务结束，期间每 tick 毫秒回调一次进度（流式保活用）
  async function follow(job, res, onTick, tick = 10000) {
    let closed = false;
    res.on('close', () => { closed = true; if (job.status === 'queued') cancel(job.id); });
    let last = 0; let lastStatus = '';
    while (job.status === 'queued' || job.status === 'running') {
      if (closed) return false;
      if (onTick && (Date.now() - last > tick || job.status !== lastStatus)) {
        last = Date.now(); lastStatus = job.status;
        onTick(job);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return !closed;
  }

  const fail = (job) => Object.assign(new Error(`生成失败：[${job.error?.code || job.status}] ${job.error?.message || job.status}`),
    { status: job.status === 'cancelled' ? 499 : 502, code: job.error?.code || 'GENERATION_FAILED' });
  const progress = (job) => job.status === 'queued' ? '排队中（同一账号的任务按顺序在浏览器里跑）…\n'
    : `Flow 正在生成… ${Math.round((Date.now() - Date.parse(job.startedAt || job.createdAt)) / 1000)}s\n`;
  const fileUrl = (job) => job.files?.find((f) => !/^input-/.test(f.name))?.url;

  function markdown(job, spec) {
    const url = job.result?.url;
    return spec.kind === 'video'
      ? `\`\`\`html\n<video src='${url}' controls></video>\n\`\`\``
      : `![Generated Image](${url})`;
  }

  // ---- OpenAI ----
  async function chat(req, res, body) {
    const model = body.model;
    const { job, spec } = await startJob(model, fromOpenAI(body));
    const id = `chatcmpl-${job.id}`;
    const created = Math.floor(Date.now() / 1000);
    const extra = (j) => ({ vcorp: { job: j.id, file: fileUrl(j), mediaId: j.result?.mediaId, expiresNote: 'flow-content 签名 URL 约 6 小时有效；长期留存用 file（需 token）' } });

    if (!body.stream) {
      await follow(job, res);
      if (job.status !== 'done') throw fail(job);
      return json(res, 200, {
        id, object: 'chat.completion', created, model,
        choices: [{ index: 0, message: { role: 'assistant', content: markdown(job, spec) }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        ...extra(job),
      });
    }

    res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
    const send = (delta, finish = null, more = {}) => res.write(`data: ${JSON.stringify({ id, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta, finish_reason: finish }], ...more })}\n\n`);
    send({ role: 'assistant', reasoning_content: `任务 ${job.id} 已提交\n` });
    const alive = await follow(job, res, (j) => send({ reasoning_content: progress(j) }));
    if (!alive) return;
    if (job.status === 'done') send({ content: markdown(job, spec) }, 'stop', extra(job));
    else {
      const e = fail(job);
      send({ content: `❌ ${e.message}` }, 'stop');
      res.write(`data: ${JSON.stringify({ error: { message: e.message, type: 'server_error', code: e.code } })}\n\n`);
    }
    res.end('data: [DONE]\n\n');
  }

  // ---- Gemini ----
  function geminiParts(job, spec) {
    if (spec.kind === 'video') return [{ fileData: { mimeType: 'video/mp4', fileUri: job.result?.url } }];
    const f = job.result?.file;
    if (f && fs.existsSync(f)) return [{ inlineData: { mimeType: job.result.type || 'image/jpeg', data: fs.readFileSync(f).toString('base64') } }];
    return [{ fileData: { mimeType: 'image/jpeg', fileUri: job.result?.url } }];
  }
  const geminiPayload = (job, spec, model) => ({
    candidates: [{ content: { role: 'model', parts: geminiParts(job, spec) }, finishReason: 'STOP', index: 0 }],
    modelVersion: model,
    usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
  });

  async function gemini(req, res, model, body, { stream, sse }) {
    const { job, spec } = await startJob(model, fromGemini(body));
    if (stream && sse) {
      res.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', connection: 'keep-alive', 'x-accel-buffering': 'no' });
      const alive = await follow(job, res, () => res.write(': keepalive\n\n'), 15000);
      if (!alive) return;
      if (job.status === 'done') res.write(`data: ${JSON.stringify(geminiPayload(job, spec, model))}\n\n`);
      else { const e = fail(job); res.write(`data: ${JSON.stringify({ error: { code: e.status, message: e.message, status: 'INTERNAL' } })}\n\n`); }
      return res.end();
    }
    await follow(job, res);
    if (job.status !== 'done') throw fail(job);
    const payload = geminiPayload(job, spec, model);
    return json(res, 200, stream ? [payload] : payload);
  }

  const geminiModel = (m) => ({
    name: `models/${m.id}`, baseModelId: m.id, version: '1', displayName: m.id, description: `Flow (browser) ${m.kind}`,
    inputTokenLimit: 32768, outputTokenLimit: 8192, supportedGenerationMethods: ['generateContent', 'streamGenerateContent'],
  });

  // 返回 true 表示处理了
  // GET /v1/media?url=<flow-content 签名 URL>：flow2api 同名接口。调用方（如 opus-video-maker）只认 base URL
  // 同源的下载，不直接拉 Google 的链接。先找本机已下好的文件，找不到再由这里去拉签名 URL。
  async function media(res, raw) {
    let u;
    try { u = new URL(String(raw || '')); } catch { u = null; }
    const m = u && u.protocol === 'https:' && u.hostname === 'flow-content.google' && /^\/(image|video)\/([0-9a-f-]{36})$/.exec(u.pathname);
    if (!m) throw Object.assign(new Error('url 只接受 https://flow-content.google/image|video/{mediaId} 的签名链接'), { status: 400, code: 'UNSUPPORTED_MEDIA' });
    const local = findMedia(m[2]);
    if (local) {
      res.writeHead(200, { 'content-type': mimeOf(local), 'content-length': fs.statSync(local).size, 'cache-control': 'no-store' });
      fs.createReadStream(local).pipe(res);
      return;
    }
    let r;
    try { r = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(120000) }); } catch (e) {
      throw Object.assign(new Error(`下载媒体失败：${e.message}`), { status: 502, code: 'MEDIA_DOWNLOAD_FAILED' });
    }
    if (!r.ok) throw Object.assign(new Error(`下载媒体失败：HTTP ${r.status}（签名约 6 小时过期）`), { status: r.status === 403 || r.status === 404 ? 404 : 502, code: 'MEDIA_DOWNLOAD_FAILED' });
    const buf = Buffer.from(await r.arrayBuffer());
    if (!buf.length || buf.length > MEDIA_MAX) throw Object.assign(new Error('媒体为空或超过 200MB'), { status: 502, code: 'MEDIA_DOWNLOAD_FAILED' });
    res.writeHead(200, { 'content-type': r.headers.get('content-type') || (m[1] === 'video' ? 'video/mp4' : 'image/jpeg'), 'content-length': buf.length, 'cache-control': 'no-store' });
    res.end(buf);
  }

  async function handle(req, res, url, parts) {
    const p = parts[0] === 'v1beta' ? parts.slice(1) : parts[0] === 'models' ? parts : parts[0] === 'v1' ? parts.slice(1) : null;
    if (!p) return false;
    const isV1 = parts[0] === 'v1';

    if (isV1 && p[0] === 'media' && p.length === 1 && req.method === 'GET') {
      await media(res, url.searchParams.get('url'));
      return true;
    }
    if (isV1 && p[0] === 'models' && req.method === 'GET') {
      if (p.length === 1) return json(res, 200, { object: 'list', data: listModels().map((m) => ({ id: m.id, object: 'model', created: 0, owned_by: 'flow-browser', kind: m.kind })) }), true;
      if (p.length === 2) {
        if (!parseModel(p[1])) throw Object.assign(new Error(`没有模型 ${p[1]}`), { status: 404, code: 'NO_MODEL' });
        return json(res, 200, { id: p[1], object: 'model', created: 0, owned_by: 'flow-browser' }), true;
      }
    }
    if (isV1 && p[0] === 'chat' && p[1] === 'completions' && p.length === 2 && req.method === 'POST') {
      await chat(req, res, await readJson(req, BODY_MAX_MEDIA));
      return true;
    }
    if (!isV1 && p[0] === 'models') {
      if (p.length === 1 && req.method === 'GET') return json(res, 200, { models: listModels().map(geminiModel) }), true;
      const [name, action] = (p[1] || '').split(':');
      if (p.length === 2 && !action && req.method === 'GET') {
        const m = listModels().find((x) => x.id === name);
        if (!m && !parseModel(name)) throw Object.assign(new Error(`没有模型 ${name}`), { status: 404, code: 'NO_MODEL' });
        return json(res, 200, geminiModel(m || { id: name, kind: parseModel(name).kind })), true;
      }
      if (p.length === 2 && req.method === 'POST' && (action === 'generateContent' || action === 'streamGenerateContent')) {
        await gemini(req, res, name, await readJson(req, BODY_MAX_MEDIA), { stream: action === 'streamGenerateContent', sse: url.searchParams.get('alt') === 'sse' });
        return true;
      }
    }
    return false;
  }

  return { handle };
}

export const BODY_MAX_MEDIA = 64 * 1024 * 1024;

// OpenAI / Gemini 风格的错误体
export function compatError(parts, status, code, message) {
  if (parts[0] === 'v1beta' || parts[0] === 'models') {
    return { error: { code: status, message, status: status === 401 ? 'UNAUTHENTICATED' : status === 400 ? 'INVALID_ARGUMENT' : status === 404 ? 'NOT_FOUND' : 'INTERNAL' } };
  }
  return { error: { message, type: status >= 500 ? 'server_error' : 'invalid_request_error', code } };
}

export const _test = { fromOpenAI, fromGemini };
