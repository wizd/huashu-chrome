// capture 小脑的页面侧入口：把页面播放器交给 <video> 的字节（early.js 录下的）分段交给沙箱。
//
// 浏览器能播的视频就能这样拿到：不碰站点的接口和签名，不冒充客户端，不读 Cookie。
// 拿到的是用户自己的浏览器正常播放时收到的字节。有 DRM 的不录（early.js 会停）。
//
// 流程（沙箱的 relay.mjs capture 照这个走）：
//   load capture（扩展装 early.js 并重载标签页）→ capture.start → 循环 capture.status / capture.pull
//   → 有缺口就 capture.seek → 播完 capture.stop。字节经扩展传到服务器的一次性 pull 槽。
import { siteFor } from './lib/sites.js';

const ALLOWED = new Set(__LOAD_ACTIONS__);
const PULL_DEFAULT = 8 * 1024 * 1024;
const PULL_MAX = 16 * 1024 * 1024;

const err = (code, message) => Object.assign(new Error(message), { code });
const early = () => window.__vcorpEarly?.capture || null;
const site = () => siteFor(location.hostname);
// 录制时要保持的倍速、静音和正片播放源，存在页面状态里（early.js 的 st），扩展的服务端调用之间不丢
const W = () => (early().st.want ||= { rate: 0, muted: false, source: null, repins: 0, id: '' });
const S = () => (early().st.saved ||= { muted: null, rate: null, volume: null });

function need() {
  const e = early();
  if (!e) throw err('EARLY_MISSING', '页面里没有录制钩子：要先 load capture（扩展会重载标签页把钩子装上）');
  if (e.st.drm) throw err('DRM', '这个视频有 DRM（加密），不录。只能在官方播放器里看');
  return e;
}

const finite = (x) => (Number.isFinite(x) ? x : 0);

// 正片：start 时定下的那个 MediaSource；还没定时，取挂在 <video> 上、时长最长的（广告短，播完自动接的下一条在 start 之后才出现）
function main(e) {
  const want = W();
  const vids = [...document.querySelectorAll('video')];
  let pinned = want.source != null ? e.st.sources[want.source] : null;
  // 播放器为正片换了一个播放源（时长一样、挂在 <video> 上的新源）：跟过去。沙箱按音/视频把各源的字节接起来
  if (pinned && !vids.some((v) => v.src && v.src === pinned.url)) {
    const dur = finite(pinned.ms.duration);
    const next = e.st.sources.find((s) => s.id > pinned.id && s.tracks.length && vids.some((v) => v.src && v.src === s.url) && Math.abs(finite(s.ms.duration) - dur) < 2);
    // 只跟同一条视频：播完自动接下一条时，新源时长可能差不多，但站点的视频 id 变了
    if (next && site().info().id === want.id) { want.source = next.id; want.repins = (want.repins || 0) + 1; pinned = next; }
  }
  if (pinned) {
    const video = vids.find((v) => v.src && v.src === pinned.url) || vids[0] || null;
    return { source: pinned, video, duration: finite(pinned.ms.duration) };
  }
  let best = null;
  for (const s of e.st.sources) {
    if (!s.tracks.length) continue;
    const video = vids.find((v) => v.src && v.src === s.url) || null;
    const dur = finite(s.ms.duration);
    const score = dur * 2 + (video ? 1 : 0);
    if (!best || score > best.score) best = { s, video, dur, score };
  }
  if (!best) return { source: null, video: vids.find((v) => !v.paused) || vids[0] || null, duration: 0 };
  return { source: best.s, video: best.video || vids[0] || null, duration: best.dur };
}

function ranges(tr) {
  const out = [];
  for (let i = 0; tr && i < tr.length; i++) out.push([+tr.start(i).toFixed(2), +tr.end(i).toFixed(2)]);
  return out;
}

// 已播过的范围之外、超过 1 秒的空档
function gaps(played, duration) {
  if (!duration) return [];
  const out = [];
  let at = 0;
  for (const [a, b] of [...played].sort((x, y) => x[0] - y[0])) {
    if (a - at > 1) out.push([+at.toFixed(2), +a.toFixed(2)]);
    at = Math.max(at, b);
  }
  if (duration - at > 1) out.push([+at.toFixed(2), +duration.toFixed(2)]);
  return out;
}

// 播放器换画质、跳广告时会把倍速和静音改回去：每次 status/pull 都再设一遍
function keepRate(video) {
  const want = W();
  if (video && want.rate && video.playbackRate !== want.rate) {
    try { video.playbackRate = want.rate; } catch { /* 不支持这个倍速 */ }
  }
  if (want.muted && video && (video.muted || video.volume > 0)) quiet(video, true);
}

// 不出声：音量 0、不静音。Chrome 会暂停后台标签页里静音的视频，音量 0 的不会
function quiet(video, on) {
  const saved = S();
  if (on) {
    if (saved.volume === null) saved.volume = site().volume() ?? video?.volume ?? 1;
    site().quiet(true);
    if (video) { video.volume = 0; video.muted = false; }
  } else {
    site().quiet(false, saved.volume, saved.muted);
    if (video) { video.volume = saved.volume ?? 1; video.muted = !!saved.muted; }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function status() {
  const e = need();
  const m = main(e);
  keepRate(m.video);
  const info = site().info();
  const duration = info.duration || m.duration || finite(m.video?.duration);
  const played = ranges(m.video?.played);
  const v = m.video;
  return {
    started: e.st.started, stopped: e.st.stopped, drm: e.st.drm, overflow: e.st.overflow,
    hidden: document.hidden,
    site: info,
    video: v ? {
      currentTime: +v.currentTime.toFixed(2), duration: +finite(v.duration).toFixed(2), paused: v.paused, ended: v.ended,
      rate: v.playbackRate, muted: v.muted, volume: +v.volume.toFixed(2), readyState: v.readyState,
    } : null,
    duration: +duration.toFixed(2),
    played,
    gaps: gaps(played, duration),
    main: m.source ? m.source.id : null,
    pinned: W().source ?? null, repins: W().repins || 0,
    sources: e.st.sources.filter((s) => s.tracks.length).map((s) => ({
      id: s.id, duration: +finite(s.ms.duration).toFixed(2), attached: !!m.video && m.video.src === s.url,
      tracks: s.tracks.map((id) => {
        const tr = e.st.tracks[id];
        return { id, mime: tr.mime, appends: tr.appends, bytes: tr.bytes, queued: tr.chunks.reduce((n, c) => n + c.bytes.byteLength, 0), run: tr.run };
      }),
    })),
    held: e.st.held, recorded: e.st.recorded, pulled: e.st.pulled,
  };
}

function play(video) {
  if (site().play()) return;
  video?.play?.().catch(() => {});
}

function seekTo(video, t) {
  if (site().seek(t)) return;
  if (video) video.currentTime = t;
}

const ACTIONS = {
  'capture.status': () => status(),

  // 先静音、锁画质；播放器为换画质重建播放源的话，等它稳定下来再跳到 from、加速、播放
  'capture.start': async (p = {}) => {
    const e = need();
    if (e.st.overflow) throw err('OVERFLOW', '页面在开始录之前已经缓冲了太多，录制钩子停了。重新 load capture（带 reload:true）再 start');
    const maxHeight = Math.max(144, Math.min(Number(p.maxHeight) || 1080, 4320));
    const rate = Math.max(1, Math.min(Number(p.rate) || 16, 16));
    const from = Math.max(0, Number(p.from) || 0);
    // 停过的页面，已录的初始化段丢了，后面的字节接不上：重载一次（load 带 reload:true）重新装钩子
    if (e.st.stopped) throw err('NEED_RELOAD', '这个页面录过一次已经停了。load capture 带 reload:true 重载后再 start');
    e.st.started = true;
    let { video } = main(e);
    const saved = S();
    if (saved.muted === null) {
      saved.muted = site().isMuted() ?? video?.muted ?? false;
      saved.rate = video?.playbackRate || 1;
    }
    Object.assign(W(), { rate: 0, muted: true, source: null, repins: 0 });
    quiet(video, true);
    const before = e.st.sources.length;
    const quality = site().lockQuality(maxHeight);
    // 换画质时播放器会建新的播放源：等它出现（最多 3 秒；画质本来就对的话不会建），再等它能播
    for (const until = Date.now() + 3000; e.st.sources.length === before && Date.now() < until;) await sleep(200);
    for (const until = Date.now() + 8000; ;) {
      ({ video } = main(e));
      if ((video && video.readyState >= 1 && main(e).duration > 0) || Date.now() > until) break;
      await sleep(300);
    }
    quiet(video, true);
    Object.assign(W(), { rate, muted: true, source: main(e).source?.id ?? null, repins: 0, id: site().info().id });
    // 播放器重建播放源后会跳回它记着的续播位置：跳到 from，确认到了
    for (let i = 0; i < 4 && video && Math.abs(video.currentTime - from) > 1; i++) {
      seekTo(video, from);
      await sleep(700);
      ({ video } = main(e));
    }
    keepRate(video);
    play(video);
    await sleep(500);
    keepRate(main(e).video);
    return { quality, ...status() };
  },

  'capture.seek': (p = {}) => {
    const e = need();
    const t = Math.max(0, Number(p.t) || 0);
    const { video } = main(e);
    seekTo(video, t);
    keepRate(video);
    play(video);
    return status();
  },

  // 一条轨上排在最前面的、同一段连续字节里的若干次 append，拼起来最多 max 字节
  'capture.pull': (p = {}) => {
    const e = need();
    const tr = e.st.tracks[Number(p.track)];
    if (!tr) throw err('BAD_PARAMS', `没有第 ${p.track} 条轨`);
    const max = Math.max(64 * 1024, Math.min(Number(p.max) || PULL_DEFAULT, PULL_MAX));
    if (!tr.chunks.length) return { track: tr.id, mime: tr.mime, bytes: 0, more: 0 };
    const run = tr.chunks[0].run;
    const take = [];
    let n = 0;
    while (tr.chunks.length && tr.chunks[0].run === run && (n === 0 || n + tr.chunks[0].bytes.byteLength <= max)) {
      const c = tr.chunks.shift();
      take.push(c.bytes);
      n += c.bytes.byteLength;
    }
    const buf = new Uint8Array(n);
    let at = 0;
    for (const b of take) { buf.set(b, at); at += b.byteLength; }
    e.st.held -= n;
    e.st.pulled += n;
    let bin = '';
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return {
      track: tr.id, source: tr.source, mime: tr.mime, run, bytes: n, more: tr.chunks.length,
      __binary: { data: btoa(bin), type: tr.mime.split(';')[0] },
    };
  },

  'capture.stop': () => {
    const e = early();
    if (!e) return { stopped: true };
    const { video } = main(e);
    e.st.stopped = true;
    site().pause() || video?.pause?.();
    const saved = S();
    Object.assign(W(), { rate: 0, muted: false });
    if (video) {
      if (saved.rate) video.playbackRate = saved.rate;
      if (saved.volume !== null) quiet(video, false);
    }
    e.st.saved = null;
    const left = e.st.held;
    e.drop();
    return { stopped: true, dropped: left, recorded: e.st.recorded, pulled: e.st.pulled };
  },
};

(window.__vcorpLoads ||= {}).capture = {
  version: __LOAD_VERSION__,

  async ready() {
    if (!window.MediaSource) return { ok: false, reason: '这个页面没有 MediaSource' };
    return { ok: true, early: !!early() };
  },

  call(action, payload) {
    if (!ALLOWED.has(action) || !ACTIONS[action]) throw err('LOAD_DENIED', `capture 小脑不接受 ${action}`);
    return ACTIONS[action](payload || {});
  },
};
