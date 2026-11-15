// Google Flow 驱动 —— 在用户自己的 Chrome 里像人一样用 Flow 生图、生视频。
//
// 从 opus-video-maker 的 src/flowgen.js 搬来，和浏览器之间隔一层 link，所以同一份逻辑既能走本机桥
// （站点函数 sites/flow.google.com/*，HTTP 网关用的就是它们），也能走配对服务器的云端通道。
//
// 页面那一半在扩展的 flow 能力包里（loads/flow）：它只读页面——报状态、给要按的元素打
// data-vcorp-flow="<名字>" 标记、记下提交前已有的媒体、提交后认出新出现的那张图或那段视频、
// 读对话里智能体最后说了什么。这里的一半是人的那一半：点、填、传图、看对话、回话、取结果。
// 不依赖 Flow 的 RPC 名、组件名或 URL 格式。
//
// link（由调用方给）：
//   call(cmd, params, {tabId, timeoutMs}) → 扩展命令的 data；失败时抛出带 code 的 Error
//   upload({bytes, name, type}, dropSelector, {tabId}) → 把字节拖进页面
//   fetchParams                       → flow.fetch 要多带的参数（本机 {binary:'base64'}，云端 {pull:true}）
//   takeBytes(data)                   → 从 flow.fetch 的回执里拿出那一段字节（Buffer）或 null
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const FLOW_HOME = 'https://flow.google.com/';
export const FLOW_SITE = 'flow.google.com';
const MARK = (name) => `[data-vcorp-flow="${name}"]`;
const IMAGE_MAX = 32 * 1024 * 1024;
const VIDEO_MAX = 120 * 1024 * 1024;
const EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp' };

export const flowError = (status, message, code) => Object.assign(new Error(message), { status, ...(code ? { code } : {}) });

// 浏览器报的「没有浏览器能做这件事」：调用方据此停下，不要重试
export const BROWSER_CODES = { NO_BROWSER: 409, DENIED: 409, DEVICE_OFFLINE: 409, CLOUD_DENIED: 403, CONFIRM_DECLINED: 403, NO_DEVICE: 409, AMBIGUOUS_DEVICE: 409 };

export function sniffMedia(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length >= 12 && bytes.toString('ascii', 4, 8) === 'ftyp') return 'video/mp4';
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  return '';
}

// 敲进 Flow 输入框的话。Flow 的智能体按提示词选模型和画幅，设置面板只是它可以不理的默认值，所以全写出来。
export function flowPrompt({ kind, prompt, model, aspect, seconds, resolution = '720p', refs = 0, mode }) {
  const text = String(prompt).trim().replace(/[.。]+$/, '');
  if (kind === 'image') {
    return [
      `${text}.`,
      model && `Use ${model}.`,
      refs ? (refs > 1 ? `Use the ${refs} attached images (in order) as references.` : 'Use the attached image as the reference.') : '',
      aspect && `Aspect ratio ${aspect}.`,
      'Only one image.',
    ].filter(Boolean).join(' ');
  }
  const use = !refs ? ''
    : mode === 'frames' ? (refs === 1 ? ' Use the attached image as the first frame.' : ' Use attached image 1 as the first frame and attached image 2 as the last frame.')
    : ` Use the ${refs} attached images as reference ingredients (keep their subjects and style), not as frames.`;
  return `Generate one video with ${model}, ${seconds} seconds, ${resolution}, ${aspect}: ${text}.${use} Only this one video, nothing else.`;
}

// Flow 的智能体有时反问（「Veo 3.1 - Fast 只能 8 秒：用 8 秒，还是换 Omni 做 6 秒？」）。
// 选最接近要求的：先保模型，再保时长至少够（长了能剪，短了长不出来）。
const squash = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
export function pickChoice(options, want = {}) {
  const model = squash(want.model);
  const score = (o) => {
    let n = 0;
    if (model && squash(o).includes(model)) n += 2;
    const secs = [...String(o).matchAll(/(\d+)\s*(?:-?\s*)?(?:s\b|sec|second)/gi)].map((m) => Number(m[1]));
    if (want.seconds && secs.length) n += secs.some((s) => s >= want.seconds) ? 1 : -1;
    return n;
  };
  let best = 0;
  options.forEach((o, i) => { if (score(o) > score(options[best])) best = i; });
  return best;
}

export function createFlowDriver({ link, fetchFn = globalThis.fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), now = Date.now } = {}) {
  if (!link?.call) throw new Error('Flow 驱动需要一条通往扩展的 link');

  async function cmd(run, name, params = {}, { soft = false, timeoutMs } = {}) {
    try {
      return await link.call(name, params, { tabId: run.tabId || undefined, timeoutMs, run });
    } catch (e) {
      if (soft) return null;
      if (e.status) throw e;
      const code = e.code || 'BROWSER';
      throw flowError(BROWSER_CODES[code] || 502, `浏览器里的 Flow 操作失败（${name}）：${e.message || code}`, code);
    }
  }

  async function pack(run, action, payload = {}, timeout) {
    const data = await cmd(run, 'call', { name: 'flow', action, payload, ...(timeout ? { timeout } : {}) }, timeout ? { timeoutMs: timeout + 10000 } : {});
    try { return JSON.parse(data?.text ?? 'null'); } catch { throw flowError(502, `flow.${action} 返回的不是 JSON`); }
  }

  const state = (run) => pack(run, 'flow.state');
  // 会自己治的点击：目标被盖住（弹窗、没关的菜单、只出一次的提示），问能力包是什么挡着，
  // 关掉它——它自己的关闭按钮，不然 Escape，不然点遮罩——再试。每一步都写进日志。
  const BLOCK_TRIES = 3;
  const POLL_MS = 1500;
  // 对话：智能体（和我们）安静多久之后才回它，最多回几次
  const QUIET_MS = 20000;
  const MAX_REPLIES = 2;
  // Flow 不认这些按钮上的合成点击，扩展也不会自己对提交类按钮改用真实事件（重试的提交可能跑两次）：明说要真实点击
  const REAL_CLICK = new Set(['start', 'approve', 'retry', 'result', 'download-media', 'download-option',
    'choice-0', 'choice-1', 'choice-2', 'choice-3', 'choice-4', 'choice-5']);
  const describe = (b) => {
    const by = b?.by;
    if (!by) return '未知浮层';
    const what = by.label || by.text || by.cls || by.tag;
    return `${by.role || by.tag}「${String(what).slice(0, 60)}」`;
  };
  const layoutNote = (b) => `被页面内容 ${b.by?.tag || ''}「${b.by?.cls || b.by?.label || ''}」盖住，不是弹窗`
    + `（按钮在 ${(b.target || []).join(',')}，窗口 ${(b.viewport || []).join('×')}${b.hidden ? '，标签页在后台' : ''}）`;
  // 盖住按钮的是页面自己的内容时，多半是页面还在安顿（面板滑进来、加载层淡出）：按钮在动或加载层盖着就等，停住了才放弃
  const LAYOUT_TRIES = 10;
  const settling = (b, prev) => /load|spinner|progress|splash|skeleton/i.test(`${b.by?.tag || ''} ${b.by?.cls || ''}`)
    || (!!prev?.target && String(prev.target) !== String(b.target));
  async function click(run, name, { optional = false } = {}) {
    let last = null;
    for (let i = 0; ; i++) {
      try {
        return await cmd(run, 'click', { selector: MARK(name), ...(REAL_CLICK.has(name) ? { real: true } : {}) });
      } catch (e) {
        if (e.code !== 'NOT_INTERACTABLE') throw e;
        const prev = last;
        last = await pack(run, 'flow.blocker', { name }).catch(() => null);
        if (last && !last.blocked && i < LAYOUT_TRIES) { await state(run); continue; }
        const stuck = last?.layout && (i >= LAYOUT_TRIES || (i >= 1 && !settling(last, prev)));
        if (stuck || (!last?.layout && i >= BLOCK_TRIES)) {
          if (optional) { run.log?.(`「${name}」点不到（${last?.layout ? layoutNote(last) : describe(last)}），跳过这一步`); return null; }
          throw flowError(502, last?.layout
            ? `Flow 页面上的「${name}」点不到：${layoutNote(last)}。这不是弹窗，原样重试没有用。`
            : `Flow 页面上的「${name}」被${describe(last)}挡住，自动关闭 ${BLOCK_TRIES} 次后仍在。原样重试没有用，请看一眼 Chrome 里的 Flow 页面。`, 'FLOW_BLOCKED');
        }
        if (last?.layout) {
          const moving = settling(last, prev);
          if (!moving || i === 0) run.log?.(`「${name}」${layoutNote(last)}，${moving ? '页面还在加载，等一下' : '滚到它再试'}`);
          await sleep(moving ? 1000 : 500); await state(run); continue;
        }
        const how = last?.dismiss ? '点它的关闭按钮' : (i === 0 || !last?.backdrop) ? '按 Escape' : '点浮层外的遮罩';
        run.log?.(`「${name}」被${describe(last)}挡住，${how}后重试`);
        if (last?.dismiss) await cmd(run, 'click', { selector: MARK('dismiss') }, { soft: true });
        else if (how === '按 Escape') await cmd(run, 'key', { key: 'Escape' }, { soft: true });
        else await cmd(run, 'click', { selector: MARK('backdrop') }, { soft: true });
        await sleep(800);
        await state(run);   // 按页面现在的样子重新打标记
      }
    }
  }

  async function waitState(run, ok, ms, every = 1000) {
    const until = now() + ms;
    let s = await state(run);
    while (!ok(s) && now() < until) { await sleep(every); s = await state(run); }
    return s;
  }

  // 标签页、能力包、登录、项目、新会话。标签页留给同一个 run 的下一次生成。
  async function ready(run) {
    if (!run.tabId) {
      const t = await cmd(run, 'tabs', { action: 'new', url: FLOW_HOME }, { timeoutMs: 60000 });
      run.tabId = Number(t?.tabId) || null;
      if (!run.tabId) throw flowError(502, '浏览器没有开出 Flow 标签页');
    }
    await cmd(run, 'load', { name: 'flow' }, { timeoutMs: 60000 });
    let s = await waitState(run, (x) => x.loggedIn, 20000);
    if (!s.loggedIn) throw flowError(409, 'Chrome 里的 Google 没有登录 Flow。登录后再试；不要反复重试。', 'NOT_LOGGED_IN');
    // 上一段视频是在它的编辑页里下载的：在那里输入会变成编辑那段视频
    if (s.editing) {
      if (s.marks?.back) await click(run, 'back', { optional: true });
      s = await waitState(run, (x) => !x.editing, 15000, 700);
      if (s.editing) throw flowError(502, 'Flow 停在上一个镜头的编辑页，退不回项目');
    }
    if (s.marks?.['close-account']) { await click(run, 'close-account'); s = await state(run); }
    if (run.project && s.project !== run.project) {
      await cmd(run, 'navigate', { url: `${FLOW_HOME}project/${encodeURIComponent(run.project)}` }, { timeoutMs: 60000 });
      await cmd(run, 'load', { name: 'flow' }, { timeoutMs: 60000 });
      s = await waitState(run, (x) => x.project === run.project && x.marks?.prompt, 30000);
      if (s.project !== run.project) throw flowError(502, `打不开 Flow 项目 ${run.project}`, 'NO_PROJECT');
    }
    if (!s.project) {
      s = await waitState(run, (x) => x.marks?.['open-project'] || x.marks?.['new-project'] || x.project, 15000);
      if (!s.project) {
        await click(run, s.marks?.['open-project'] ? 'open-project' : 'new-project');
        s = await waitState(run, (x) => x.project && x.marks?.prompt, 30000);
        if (!s.project) throw flowError(502, '没能打开 Flow 项目');
      }
    }
    s = await waitState(run, (x) => x.marks?.prompt, 15000, 700);
    if (!s.marks?.prompt) throw flowError(502, 'Flow 项目页上找不到提示词输入框');
    if (s.marks['new-session']) {
      // 新会话让智能体别把之前的请求混进来；基线本来就排除了旧媒体，不值得为它失败
      await click(run, 'new-session', { optional: true });
      await sleep(800);
      s = await waitState(run, (x) => x.marks?.prompt, 10000, 700);
    }
    return s;
  }

  // 每张参考图：拖到输入框上（传进项目）→ 配料面板 Uploads 里点它（这一下才挂到提示词上）
  async function attach(run, refs, log) {
    const tag = crypto.randomBytes(3).toString('hex');
    for (let i = 0; i < refs.length; i++) {
      const { bytes, mime } = refs[i];
      const name = `ref${i + 1}-${tag}${EXT[mime] || '.png'}`;
      const before = (await state(run)).ingredients?.length || 0;
      try {
        await link.upload({ bytes, name, type: mime }, MARK('prompt'), { tabId: run.tabId, run });
      } catch (e) {
        if (e.status) throw e;
        throw flowError(BROWSER_CODES[e.code] || 502, `第 ${i + 1} 张参考图传不进 Flow：${e.message}`, e.code || 'ATTACH_FAILED');
      }
      let done = false;
      for (let k = 0; k < 40 && !done; k++) {
        await sleep(1500);
        let s = await state(run);
        if (!s.options) {
          if (s.marks?.add) { await click(run, 'add'); await sleep(700); s = await state(run); }
          if (s.marks?.['uploads-tab']) { await click(run, 'uploads-tab'); await sleep(700); }
        }
        const o = await pack(run, 'flow.option', { name });
        if (o.found && !o.disabled) {
          await click(run, 'option');
          for (let w = 0; w < 10 && !done; w++) { await sleep(500); done = ((await state(run)).ingredients?.length || 0) > before; }
        } else if (!o.found && k % 3 === 2) {
          await cmd(run, 'key', { key: 'Escape' }, { soft: true });
        }
      }
      if (!done) throw flowError(502, `第 ${i + 1} 张参考图没挂上 Flow 的提示词`, 'ATTACH_FAILED');
      log(`参考图 ${i + 1}/${refs.length} 已挂上`);
    }
    await cmd(run, 'key', { key: 'Escape' }, { soft: true });
    return (await state(run)).ingredients || [];
  }

  function checked(bytes, kind) {
    const max = kind === 'video' ? VIDEO_MAX : IMAGE_MAX;
    if (!bytes.length || bytes.length > max) throw flowError(502, 'Flow 结果为空或超过大小限制', 'BAD_MEDIA');
    const mime = sniffMedia(bytes);
    if (!mime || !mime.startsWith(`${kind}/`)) throw flowError(502, `Flow 页面上认出的结果不是${kind === 'video' ? '视频' : '图片'}`, 'BAD_MEDIA');
    return { mime, bytes };
  }

  // 页面里取：flow.fetch 一次交出至多 8MB
  async function fetchInPage(run, hit, kind) {
    const max = kind === 'video' ? VIDEO_MAX : IMAGE_MAX;
    const parts = [];
    for (let offset = 0, n = 0; n < 64; n++) {
      const data = await cmd(run, 'call', { name: 'flow', action: 'flow.fetch', payload: { key: hit.key, offset }, timeout: 90000, ...(link.fetchParams || {}) }, { timeoutMs: 100000 });
      let info = null;
      try { info = JSON.parse(data?.text ?? 'null'); } catch { /* 下面报 */ }
      if (!info || !Number.isInteger(info.size)) throw flowError(502, 'flow.fetch 返回的不对');
      if (info.size > max) throw flowError(502, 'Flow 结果超过大小限制', 'BAD_MEDIA');
      const buf = link.takeBytes(data, run);
      if (!buf || buf.length !== info.bytes || !buf.length) throw flowError(502, 'Flow 结果的字节没有传过来');
      parts.push(buf);
      offset += buf.length;
      if (info.done || offset >= info.size) return checked(Buffer.concat(parts), kind);
    }
    throw flowError(502, 'Flow 结果分段太多');
  }

  // 页面取不到时的退路：一个公开的 https 地址（比如签名 CDN 链接）
  async function fetchHere(url, kind, timeoutMs) {
    let u;
    try { u = new URL(url); } catch { u = null; }
    if (!u || u.protocol !== 'https:' || /^(localhost|\d+\.\d+\.\d+\.\d+|\[.*\])$/i.test(u.hostname)) {
      throw flowError(502, '页面里取不到结果，它的地址也不能直接下载');
    }
    let res;
    try {
      res = await fetchFn(u.href, { redirect: 'follow', signal: AbortSignal.timeout(Math.max(timeoutMs, 30000)) });
    } catch (e) {
      throw flowError(e?.name === 'TimeoutError' ? 504 : 502, `下载 Flow 结果失败：${e?.message || e}`);
    }
    if (!res.ok) throw flowError(502, `下载 Flow 结果失败：HTTP ${res.status}`);
    const declared = Number(res.headers?.get?.('content-length'));
    if (Number.isFinite(declared) && declared > (kind === 'video' ? VIDEO_MAX : IMAGE_MAX)) throw flowError(502, 'Flow 结果超过大小限制');
    try {
      return checked(Buffer.from(await res.arrayBuffer()), kind);
    } catch {
      throw flowError(502, `页面里取不到结果，直接下载拿到的也不是${kind === 'video' ? '视频' : '图片'}（这个地址多半要登录才能下载）`, 'BAD_MEDIA');
    }
  }

  // 视频：页面显示的地址会跳到别的域，页面 fetch 不了，直接下载拿到的是登录页。Flow 自己的
  // Download media（720p 原尺寸）可以：点开结果，Download media → 720p；能力包留下 Flow 造出的文件
  // （也不让它落进用户的「下载」目录），再由 flow.fetch 交出来。
  async function viaFlowDownload(run, hit, kind, timeoutMs, log) {
    const until = now() + Math.min(timeoutMs, 120000);
    const look = (arm = false) => pack(run, 'flow.download', { key: hit.key, quality: '720p', ...(arm ? { arm: true } : {}) });
    let d = await look(true);
    if (!d.editor) {
      await click(run, 'result');
      while (!d.editor && !d.got && now() < until) { await sleep(700); d = await look(); }
      if (!d.editor && !d.got) throw flowError(502, '点开结果后没看到 Flow 的 Download media');
    }
    for (let opened = 0; !d.got && now() < until;) {
      if (d.menu) { await click(run, 'download-option'); d = await look(); while (!d.got && now() < until) { await sleep(1000); d = await look(); } break; }
      if (opened++ >= 3) throw flowError(502, 'Flow 的 Download media 菜单里没有 720p');
      await click(run, 'download-media');
      for (let k = 0; k < 6 && !d.menu && !d.got; k++) { await sleep(500); d = await look(); }
    }
    if (!d.got) throw flowError(504, 'Flow 的下载没有交出文件');
    log(`用 Flow 自己的下载取到视频（${Math.round(d.size / 1024)} KB）`);
    return fetchInPage(run, hit, kind);
  }

  async function download(run, hit, kind, timeoutMs, log) {
    if (kind === 'video') {
      try {
        return await viaFlowDownload(run, hit, kind, timeoutMs, log);
      } catch (e) {
        if (BROWSER_CODES[e.code] || e.code === 'BAD_MEDIA') throw e;
        log(`Flow 自己的下载没成（${e.message}），改为直接取`);
      }
    }
    try {
      return await fetchInPage(run, hit, kind);
    } catch (e) {
      if (BROWSER_CODES[e.code] || e.code === 'BAD_MEDIA' || !/^https:/i.test(String(hit.url || ''))) throw e;
      log(`页面里取结果失败（${e.message}），改为直接下载`);
      return fetchHere(hit.url, kind, timeoutMs);
    }
  }

  // run：{ tabId?, project? }，同一个 run 的多次生成共用一个标签页。
  // req：{ kind: 'image'|'video', prompt（完整的 Flow 提示词）, refs: [{bytes, mime}], timeoutMs, want: {model, seconds} }
  // 返回 { mime, bytes, width, height, key, url }
  async function generate(run, { kind, prompt, refs = [], timeoutMs, want = {} }, log = () => {}) {
    const deadline = now() + timeoutMs;
    run.log = log;
    const opened = await ready(run);
    const exclude = refs.length ? await attach(run, refs, log) : [];

    // 填，再核对填进去了
    let s = await state(run);
    if (!s.marks?.prompt) throw flowError(502, 'Flow 提示词输入框不见了');
    await cmd(run, 'fill', { fields: [{ selector: MARK('prompt'), value: prompt }] });
    s = await state(run);
    if (!s.promptChars) throw flowError(502, '提示词没有填进 Flow 的输入框');

    // 提交：第一下常常只是关掉建议浮层；输入框清空才算提交了
    await pack(run, 'flow.baseline');
    let submitted = false;
    for (let i = 0; i < 3 && !submitted; i++) {
      s = await waitState(run, (x) => x.canStart, 10000, 500);
      if (!s.canStart) throw flowError(502, 'Flow 的 Start generation 按钮一直不可用');
      const got = await click(run, 'start');
      for (let k = 0; k < 8 && !submitted; k++) { await sleep(500); submitted = (await state(run)).promptChars === 0; }
      if (!submitted) log(`第 ${i + 1} 次点击未提交，重试。扩展的回报：${String(got?.text || got?.note || JSON.stringify(got || {})).replace(/\s+/g, ' ').slice(0, 200)}`);
    }
    if (!submitted) throw flowError(502, '点了 3 次 Start generation，提示词仍在 Flow 的输入框里');

    // 等。等在这里而不是页面里：标签页在后台时 Chrome 会把页面计时器压到一分钟一次，
    // 所以每次 flow.result 只是看一眼页面。每一眼都读对话：反问、确认花 credits、报错、停住不动。
    let posterLogged = false; let approved = false; let failures = 0; let retried = 0;
    const answered = new Map();   // 问题 → 答过几次
    let sent = prompt; let lastAct = now(); let picked = null; let replies = 0;
    // 在输入框里打字、按 Start，像人在对话里回话
    const reply = async (text) => {
      await cmd(run, 'fill', { fields: [{ selector: MARK('prompt'), value: text }] });
      let ok = false;
      for (let i = 0; i < 3 && !ok; i++) {
        const st = await waitState(run, (x) => x.canStart, 10000, 500);
        if (!st.canStart) break;
        await click(run, 'start');
        for (let k = 0; k < 8 && !ok; k++) { await sleep(500); ok = (await state(run)).promptChars === 0; }
      }
      if (!ok) throw flowError(502, '在 Flow 的对话里回话没有发出去', 'FLOW_STALLED');
      sent = text; lastAct = now(); picked = null;
    };
    for (let first = true; ; first = false) {
      if (!first) await sleep(POLL_MS);
      if (deadline - now() <= 0) throw flowError(504, `Flow ${Math.round(timeoutMs / 1000)} 秒内没有出结果`, 'TIMEOUT');
      const r = await pack(run, 'flow.result', { kind, exclude, waitMs: 1000, failures, sent, ...(approved ? { approved: true } : {}) });
      if (r?.done && !r.key) throw flowError(502, 'vcorp-chrome 扩展版本太旧，认不出 Flow 现在的结果。更新扩展后再试；不要反复重试。', 'OLD_EXTENSION');
      if (r?.done) {
        log(`Flow 已出结果${r.width ? `（${r.width}×${r.height}）` : ''}，取回中`);
        const media = await download(run, r, kind, deadline - now(), log);
        return { ...media, width: r.width ?? null, height: r.height ?? null, key: r.key, url: r.url || null, project: opened?.project || null };
      }
      if (r?.refusal) throw flowError(422, `Flow 没有生成：${r.refusal}`, 'FLOW_REFUSED');
      // Flow 自己的报错（Something went wrong）：点一次它的 Try again，再报错就停，不干等到超时
      if (r?.failed) {
        failures = r.failures || failures + 1;
        if (retried < 1 && r.retry) { retried++; log(`Flow 报错「${r.failed}」，点它的 Try again 重试一次`); await click(run, 'retry'); continue; }
        throw flowError(502, `Flow 报错：「${r.failed}」${retried ? '（已经点过一次 Try again）' : ''}。这是 Flow 那边临时出错，过几分钟可以再试一次。`, 'FLOW_ERROR');
      }
      if (r?.question && r.options?.length) {
        const key = `${r.question}|${r.options.join('|')}`;
        const n = answered.get(key) || 0;
        if (n >= 2) throw flowError(502, `Flow 反问了一个问题，自动回答两次都没生效：「${r.question}」选项：${r.options.join(' / ')}`, 'FLOW_QUESTION');
        const pick = pickChoice(r.options, want);
        answered.set(key, n + 1);
        if (!n) log(`Flow 问：「${r.question.slice(-200)}」选了「${r.options[pick]}」`);
        await click(run, `choice-${pick}`);
        picked = r.options[pick]; lastAct = now();
        await sleep(2000);   // 给 Flow 一点时间接住这个回答
        continue;
      }
      if (r?.approval && !approved) { approved = true; await click(run, 'approve'); lastAct = now(); log('已点 Always approve in project'); continue; }
      if (r?.poster && !posterLogged) { posterLogged = true; log('出现了新封面，还在等视频本身'); }
      // 智能体停下来等我们：用话问了什么，或者接了我们的选择却没往下走。在对话里回它。
      // 有东西在生成时绝不回（第二次生成要花 credits），而且要它和我们都安静一阵之后。
      const t = r?.talk;
      const working = posterLogged || t?.busy;
      if (t && !working && (t.ask || picked) && t.quietMs >= QUIET_MS && now() - lastAct >= QUIET_MS) {
        const said = String(t.text || '').slice(-300);
        if (replies >= MAX_REPLIES) throw flowError(502, `Flow 的智能体停下了，回了 ${replies} 次也没继续。它最后说的是：「${said}」`, 'FLOW_STALLED');
        const text = picked
          ? `Go ahead with "${picked}" as chosen above, and generate it now.`
          : 'Yes, please go ahead and generate it now. Use your best judgment where my request does not fit, staying as close to it as you can.';
        replies++;
        log(`Flow 停在「${said.slice(-160)}」，在对话里回了：${text}`);
        await reply(text);
      }
    }
  }

  return { generate, ready };
}

// ---------- 站点函数（sites/flow.google.com/generate_*）共用的那一段 ----------

const IMG_MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const SAVE_EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'video/mp4': 'mp4', 'video/webm': 'webm' };
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

// args 见两个站点函数的 @doc。返回 {mediaId, url, file, bytes, type, width, height, projectId, secs}。
// url：flow2api 的调用方拿它回 /v1/media 取字节，网关按其中的 mediaId 交回本机文件。
// 页面上显示的地址要登录才下得动，所以它不再是能直接下载的签名链接。
export async function runSiteGeneration(kind, { page, args = {}, log = () => {} }, deps = {}) {
  if (!args.prompt) throw Object.assign(new Error('缺 prompt'), { code: 'BAD_ARGS' });
  if (!args.outDir) throw Object.assign(new Error('缺 outDir'), { code: 'BAD_ARGS' });
  const t0 = Date.now();
  const files = Array.isArray(args.images) ? args.images : args.images ? [args.images] : [];
  const refs = files.map((f, i) => {
    if (!fs.existsSync(f)) throw Object.assign(new Error(`参考图 ${i + 1} 不存在：${f}`), { code: 'BAD_ARGS' });
    return { bytes: fs.readFileSync(f), mime: IMG_MIME[path.extname(f).toLowerCase()] || 'image/png' };
  });
  let want;
  let prompt;
  if (kind === 'image') {
    want = { model: args.model };
    prompt = flowPrompt({ kind, prompt: args.prompt, model: args.model, aspect: args.aspect, refs: refs.length });
  } else {
    const mode = args.mode || (refs.length && refs.length <= 2 ? 'frames' : 'reference');
    want = { model: args.model || 'Omni 1.2 Flash', seconds: Number(args.seconds) || 4 };
    prompt = flowPrompt({ kind, prompt: args.prompt, ...want, resolution: args.resolution || '720p', aspect: args.aspect || '16:9', refs: refs.length, mode });
  }
  const driver = createFlowDriver({ link: pageLink(page), ...deps });
  const run = { tabId: page.tabId, project: args.project || null };
  const out = await driver.generate(run, { kind, prompt, refs, timeoutMs: Number(args.timeoutMs) || (kind === 'video' ? 600000 : 300000), want }, log);

  const mediaId = String(out.url || '').match(UUID)?.[0]?.toLowerCase()
    || crypto.createHash('sha256').update(String(out.key)).digest('hex').slice(0, 32).replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
  fs.mkdirSync(args.outDir, { recursive: true });
  const type = out.mime;
  const file = path.join(args.outDir, `${mediaId}.${SAVE_EXT[type] || 'bin'}`);
  fs.writeFileSync(file, out.bytes);
  return {
    mediaId, url: `https://flow-content.google/${kind}/${mediaId}`, file, bytes: out.bytes.length, type,
    width: out.width, height: out.height, projectId: out.project, refs: refs.length, secs: (Date.now() - t0) / 1000,
  };
}

// 本机桥上的 link：站点函数拿到的 page 就绑着一个工作标签页
export function pageLink(page) {
  return {
    call: (name, params, { tabId, timeoutMs } = {}) => page._cmd(name, params, timeoutMs || 35000).then((d) => {
      if (name === 'tabs' && d?.tabId) page.tabId = d.tabId;
      return d;
    }),
    upload: ({ bytes, name, type }, dropSelector) => page._cmd('upload', { name, type, bytes: bytes.length, dropSelector, base64: Buffer.from(bytes).toString('base64') }, 120000),
    fetchParams: { binary: 'base64' },
    takeBytes: (data) => (typeof data?.base64 === 'string' ? Buffer.from(data.base64, 'base64') : null),
  };
}
