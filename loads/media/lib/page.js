// 页面侧的通用部分：主 <video>、保底提取、滚动、浏览器内截帧。
import { https, num, sleep, err } from './util.js';

export function mainVideo() {
  const vids = [...document.querySelectorAll('video')];
  const score = (v) => {
    const r = v.getBoundingClientRect();
    return (r.width * r.height) + (v.readyState >= 2 ? 1e7 : 0) + (v.duration > 0 ? 1e6 : 0);
  };
  return vids.sort((a, b) => score(b) - score(a))[0] || null;
}

// 不认识的页面（或适配器漏掉的字段）：og 标签 + <video> + 网络记录里的媒体地址
export function fallback(net) {
  const meta = (p) => document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.getAttribute('content') || '';
  const v = mainVideo();
  const urls = new Set();
  if (v?.currentSrc && /^https?:/.test(v.currentSrc)) urls.add(v.currentSrc);
  for (const s of document.querySelectorAll('video source[src]')) if (/^https?:/.test(s.src)) urls.add(s.src);
  for (const r of net() || []) {
    const u = String(r.url || '');
    if (/\.(mp4|m3u8|m4a|m4s|webm)(\?|$)/i.test(u) || /mime_type=video|media-(video|audio)/.test(u)) urls.add(https(u));
  }
  return {
    title: meta('og:title') || document.title,
    desc: meta('og:description') || meta('description'),
    coverUrl: https(meta('og:image')) || (v?.poster || null),
    durationSec: v && Number.isFinite(v.duration) ? Math.round(v.duration * 100) / 100 : null,
    mediaUrls: [...urls].slice(0, 12),
  };
}

export function scrollable(el) {
  for (let n = el; n && n !== document.body; n = n.parentElement) {
    const cs = getComputedStyle(n);
    if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 20) return n;
  }
  return null;
}

// 滚 times 次，每次等 waitMs；box 为空就滚整页
export async function scrollMore(box, times, waitMs) {
  const target = box ? (scrollable(box) || box) : null;
  for (let i = 0; i < times; i++) {
    if (target) target.scrollBy({ top: target.clientHeight * 0.9 || 800 });
    else window.scrollBy({ top: window.innerHeight * 0.9 || 800 });
    // 有的站只认 wheel 事件才翻页
    (target || document.scrollingElement)?.dispatchEvent(new WheelEvent('wheel', { deltaY: 800, bubbles: true }));
    await sleep(waitMs);
  }
}

function seek(v, t, ms = 6000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (ok) => { if (done) return; done = true; v.removeEventListener('seeked', on); resolve(ok); };
    const on = () => finish(true);
    v.addEventListener('seeked', on);
    setTimeout(() => finish(false), ms);
    v.currentTime = t;
  });
}

// 等这一帧真的解码出来（后台标签页里 seeked 之后画面可能还没到）
function frameReady(v, ms = 1500) {
  return new Promise((resolve) => {
    if (typeof v.requestVideoFrameCallback !== 'function') { setTimeout(resolve, 250); return; }
    const t = setTimeout(resolve, ms);
    v.requestVideoFrameCallback(() => { clearTimeout(t); resolve(); });
  });
}

// Chrome 不给从没到过前台的标签页加载视频（readyState 一直是 0，play() 也不返回）。
// 静音试播一下，还是不动就明说，别让调用方当成视频坏了
async function wakeVideo(v) {
  if (v.readyState >= 1) return;
  const was = { muted: v.muted, paused: v.paused };
  v.muted = true;
  v.play()?.catch?.(() => {});
  const until = Date.now() + 6000;
  while (v.readyState < 1 && Date.now() < until) await sleep(200);
  if (v.readyState >= 1) { v.muted = was.muted; return; }
  if (was.paused) v.pause();
  v.muted = was.muted;
  throw err(
    document.visibilityState === 'hidden' ? 'TAB_HIDDEN' : 'NO_VIDEO',
    document.visibilityState === 'hidden'
      ? '标签页在后台，Chrome 没有加载视频：把它切到前台一次再截，或者改用雪碧图、章节图、云端 ffmpeg'
      : '视频还没加载出来：等它开始播放再截',
  );
}

export const FRAMES_MAX = 12;
const BYTES_MAX = 2.4 * 1024 * 1024;   // 扩展回云端的结果上限是 3MB

export async function captureFrames({ timestamps = [1, 5, 15], maxWidth = 1280, quality = 0.82 } = {}) {
  const v = mainVideo();
  if (!v) throw err('NO_VIDEO', '页面上没有 <video>');
  await wakeVideo(v);
  const list =[...new Set(timestamps.map(Number).filter((t) => Number.isFinite(t) && t >= 0))].slice(0, FRAMES_MAX);
  if (!list.length) throw err('BAD_PARAMS', 'timestamps 要给秒数数组，比如 [1, 15, 45]');
  const mw = Math.min(Math.max(num(maxWidth) || 1280, 160), 1920);
  let q = Math.min(Math.max(Number(quality) || 0.82, 0.3), 0.95);
  const was = { t: v.currentTime, paused: v.paused, muted: v.muted };
  const out = [];
  let bytes = 0;
  try {
    v.muted = true;
    if (!v.paused) v.pause();
    for (const raw of list) {
      const t = Number.isFinite(v.duration) ? Math.min(raw, Math.max(0, v.duration - 0.1)) : raw;
      const ok = await seek(v, t);
      await frameReady(v);
      const w = v.videoWidth;
      const h = v.videoHeight;
      if (!ok || !w || !h) { out.push({ timestamp: raw, error: ok ? '这一帧没解码出来（标签页在后台时会这样，可以请用户把它切到前台）' : '跳转超时' }); continue; }
      const scale = Math.min(1, mw / w);
      const c = document.createElement('canvas');
      c.width = Math.round(w * scale);
      c.height = Math.round(h * scale);
      try {
        c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
        let dataUrl = c.toDataURL('image/jpeg', q);
        // 太大就降画质，保证整批回得去
        while (bytes + dataUrl.length > BYTES_MAX && q > 0.35) { q -= 0.15; dataUrl = c.toDataURL('image/jpeg', q); }
        if (bytes + dataUrl.length > BYTES_MAX) { out.push({ timestamp: raw, error: '这一批太大了，剩下的分批再截' }); break; }
        bytes += dataUrl.length;
        out.push({ timestamp: raw, at: Math.round(v.currentTime * 1000) / 1000, width: c.width, height: c.height, dataUrl });
      } catch (e) {
        out.push({ timestamp: raw, error: /tainted|SecurityError/i.test(String(e)) ? '跨域视频，浏览器不让读画面：改用云端 ffmpeg 抽帧' : String(e.message || e) });
      }
    }
  } finally {
    try { await seek(v, was.t, 3000); } catch { /* 还原尽力而为 */ }
    v.muted = was.muted;
    if (!was.paused) v.play().catch(() => {});
  }
  return { frames: out, videoWidth: v.videoWidth, videoHeight: v.videoHeight, durationSec: Number.isFinite(v.duration) ? v.duration : null };
}
