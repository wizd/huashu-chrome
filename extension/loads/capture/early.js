// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/capture/early.js
// capture 小脑的早期钩子：document_start 时装进页面（MAIN world），先于页面自己的脚本。
//
// 只做一件事：播放器把字节交给 <video> 时（MSE 的 SourceBuffer.appendBuffer），复制一份留在页面内存里。
// 原调用永远照常执行，钩子出错不影响页面。字节只有经 capture 小脑的 capture.pull 才会离开页面。
//
// 只在任务要录的那个标签页被重载时注入（见 background.js ensureLoad 的 early）。
// 同站别的标签页恰好在那几秒里加载，也会装上：它们最多留 PRESTART_MAX 字节，之后就只透传。
// 看到 DRM（setMediaKeys 设了密钥、encrypted 事件）立刻停录、丢掉已录的字节。
(() => {
  if (window.__vcorpEarly?.capture) return;
  const MS = window.MediaSource;
  const SB = window.SourceBuffer;
  if (!MS || !SB) return;

  const PRESTART_MAX = 192 * 1024 * 1024;
  const st = {
    started: false, stopped: false, drm: false, overflow: false,
    held: 0, recorded: 0, pulled: 0,
    sources: [],      // { id, ms, url, tracks: [] }
    tracks: [],       // { id, source, mime, run, chunks: [{ run, bytes }], appends, bytes }
  };
  const bySource = new WeakMap();
  const byBuffer = new WeakMap();
  const byUrl = new Map();

  const sourceOf = (ms) => {
    let s = bySource.get(ms);
    if (!s) {
      s = { id: st.sources.length, ms, url: '', tracks: [] };
      st.sources.push(s);
      bySource.set(ms, s);
    }
    return s;
  };

  // 新的一段连续字节：seek、abort、changeType 之后，后面的字节不能和前面的直接接上
  const newRun = (tr) => { tr.run += 1; };

  const drop = () => {
    for (const tr of st.tracks) tr.chunks.length = 0;
    st.held = 0;
  };

  function record(tr, data) {
    if (st.stopped || st.drm || st.overflow) return;
    let view;
    if (data instanceof ArrayBuffer) view = new Uint8Array(data);
    else if (ArrayBuffer.isView(data)) view = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    else return;
    if (!view.byteLength) return;
    if (!st.started && st.held + view.byteLength > PRESTART_MAX) { st.overflow = true; drop(); return; }
    tr.chunks.push({ run: tr.run, bytes: view.slice() });
    tr.appends += 1;
    tr.bytes += view.byteLength;
    st.held += view.byteLength;
    st.recorded += view.byteLength;
  }

  const origCreate = URL.createObjectURL;
  URL.createObjectURL = function (obj) {
    const url = origCreate.apply(this, arguments);
    try { if (obj instanceof MS) { const s = sourceOf(obj); s.url = url; byUrl.set(url, s); } } catch { /* 不影响页面 */ }
    return url;
  };

  const origAdd = MS.prototype.addSourceBuffer;
  MS.prototype.addSourceBuffer = function (mime) {
    const sb = origAdd.apply(this, arguments);
    try {
      const s = sourceOf(this);
      const tr = { id: st.tracks.length, source: s.id, mime: String(mime).slice(0, 200), run: 0, chunks: [], appends: 0, bytes: 0, sb };
      st.tracks.push(tr);
      s.tracks.push(tr.id);
      byBuffer.set(sb, tr);
    } catch { /* 不影响页面 */ }
    return sb;
  };

  const origAppend = SB.prototype.appendBuffer;
  SB.prototype.appendBuffer = function (data) {
    try { const tr = byBuffer.get(this); if (tr) record(tr, data); } catch { /* 不影响页面 */ }
    return origAppend.apply(this, arguments);
  };

  for (const name of ['abort', 'changeType', 'remove']) {
    const orig = SB.prototype[name];
    if (typeof orig !== 'function') continue;
    SB.prototype[name] = function () {
      try {
        const tr = byBuffer.get(this);
        if (tr && name !== 'remove') newRun(tr);
        if (tr && name === 'changeType') tr.mime = String(arguments[0]).slice(0, 200);
      } catch { /* 不影响页面 */ }
      return orig.apply(this, arguments);
    };
  }

  // DRM：设了 MediaKeys 或页面收到 encrypted，就是加密内容。停录，已录的丢掉。
  const HME = window.HTMLMediaElement;
  const origKeys = HME?.prototype?.setMediaKeys;
  if (origKeys) {
    HME.prototype.setMediaKeys = function (keys) {
      try { if (keys) { st.drm = true; drop(); } } catch { /* 不影响页面 */ }
      return origKeys.apply(this, arguments);
    };
  }
  document.addEventListener('encrypted', () => { st.drm = true; drop(); }, true);

  // 媒体元素 seek 时，各轨的下一段都另起一段
  document.addEventListener('seeking', () => { for (const tr of st.tracks) newRun(tr); }, true);

  const api = {
    version: 1,
    st,
    sourceForUrl: (url) => byUrl.get(url) || null,
    drop,
  };
  Object.defineProperty(window, '__vcorpEarly', { value: window.__vcorpEarly || {}, configurable: false, enumerable: false });
  Object.defineProperty(window.__vcorpEarly, 'capture', { value: api, configurable: false, enumerable: false });
})();
