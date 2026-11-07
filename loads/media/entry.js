// media 能力包的页面侧入口：视频页的情报探针。
//
// 只读：从页面已经拿到的数据里取（状态树、<video>、net-hook.js 记在 window.__hcNet 里的接口响应），
// 需要时替用户点开评论区、打开字幕、滚动，或在 <video> 上截帧。不点赞、不关注、不发东西。
// 页面自己的请求带着它的签名（a_bogus、x-s、wbi、pot），这里不逆向任何签名算法。
// 返回的 CDN 直链加 requestHeaders 就能在别处下载，不需要 cookie。
//
// 白名单在扩展侧（cloud-policy.js、background.js）查过一遍，这里再查一遍。
import { err, sleep, mergeComments } from './lib/util.js';
import * as douyin from './lib/douyin.js';
import * as xhs from './lib/xhs.js';
import * as bilibili from './lib/bilibili.js';
import * as youtube from './lib/youtube.js';
import { fallback, scrollMore, captureFrames } from './lib/page.js';
import { listPage } from './lib/list.js';

const ALLOWED = new Set(__LOAD_ACTIONS__);
const ADAPTERS = { douyin, xiaohongshu: xhs, bilibili, youtube };

function platform() {
  const h = location.hostname;
  if (/(^|\.)douyin\.com$/.test(h)) return 'douyin';
  if (/(^|\.)xiaohongshu\.com$/.test(h)) return 'xiaohongshu';
  if (/(^|\.)bilibili\.com$/.test(h)) return 'bilibili';
  if (/(^|\.)youtube\.com$/.test(h)) return 'youtube';
  return '';
}

const net = () => window.__hcNet || [];

async function waitFor(test, ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try { if (test()) return true; } catch { /* 页面还在变 */ }
    await sleep(250);
  }
  return false;
}

function capture() {
  const on = Array.isArray(window.__hcNet);
  const first = on && window.__hcNet.length ? window.__hcNet[0].t : null;
  return {
    netHook: on,
    netEntries: on ? window.__hcNet.length : 0,
    // 记录是从这一刻开始的：之前页面发的请求（首屏评论、字幕）没记下来
    since: first ? new Date(first).toISOString() : null,
    ...(on ? {} : { note: '网络记录没开：评论和字幕可能拿不全。navigate reload 后再调一次' }),
  };
}

const truncate = (s, n) => (typeof s === 'string' && s.length > n ? `${s.slice(0, n)}…` : s);

async function inspect(payload = {}) {
  const p = platform();
  const a = ADAPTERS[p];
  if (!a) throw err('UNSUPPORTED', `media 不认识 ${location.hostname}`);
  const d = await a.inspect(net, { subtitles: payload.subtitles !== false }, waitFor);
  const fb = fallback(net);
  if (!d.title) d.title = fb.title;
  if (!d.visual.coverUrl) d.visual.coverUrl = fb.coverUrl;
  if (!d.durationSec && fb.durationSec) d.durationSec = fb.durationSec;
  // 网络记录里什么媒体都有（推荐流、预加载的下一条），只有适配器一条流都没找到时才值得看
  d.visual.pageMediaUrls = d.visual.videoStreams.length ? [] : fb.mediaUrls;
  if (payload.comments === false) delete d.comments;
  else d.comments = (d.comments || []).slice(0, Math.min(Number(payload.commentLimit) || 50, 200));
  d.desc = truncate(d.desc, 5000);
  d.capture = capture();
  d.extractedAt = new Date().toISOString();
  return d;
}

async function comments(payload = {}) {
  const p = platform();
  const a = ADAPTERS[p];
  if (!a) throw err('UNSUPPORTED', `media 不认识 ${location.hostname}`);
  const count = Math.min(Math.max(Number(payload.count) || 50, 1), 500);
  const times = Math.min(Math.max(Number(payload.scrollTimes ?? 3), 0), 30);
  const waitMs = Math.min(Math.max(Number(payload.waitMs) || 900, 300), 5000);
  const id = idOf(p);
  const started = Date.now();
  // 后台标签页的定时器被限流，滚动和等待都会变慢：到点就把拿到的先交回去，不要等到整个调用超时
  const deadline = started + Math.min(Math.max(Number(payload.budgetMs) || 35000, 5000), 150000);
  const box = await a.openComments(net, id, waitFor);
  let list = a.commentsFrom(net, id);
  // 后台标签页滚动触发不了懒加载，有接口的平台就别空转
  const scrolls = document.visibilityState === 'hidden' && a.fetchComments ? 0 : times;
  for (let i = 0; i < scrolls && list.length < count && Date.now() < deadline; i++) {
    await scrollMore(box, 1, waitMs);
    list = a.commentsFrom(net, id);
  }
  const meta = a.commentMeta(net, id) || {};
  // 评论区常常要滚到眼前才加载，后台标签页里等不到：平台有不用签名的接口就主动拉一次
  let direct = null;
  if (list.length < count && a.fetchComments) {
    try { direct = await a.fetchComments(id, count); } catch (e) { direct = { note: `评论接口失败：${e.message}` }; }
  }
  const merged = mergeComments([list, direct?.comments], count);
  const note = direct?.note || (merged.length ? '' : '一条评论都没拿到：评论区可能要在前台才加载');
  return {
    platform: p, id,
    total: direct?.total ?? meta.total ?? null,
    hasMore: direct?.hasMore ?? meta.hasMore ?? null,
    fetched: merged.length,
    comments: merged,
    tookMs: Date.now() - started,
    ...(note ? { note } : {}),
    capture: capture(),
  };
}

function idOf(p) {
  if (p === 'bilibili') return window.__INITIAL_STATE__?.videoData?.aid || '';
  return ADAPTERS[p].targetId(location.href);
}

async function list(payload = {}) {
  const p = platform();
  if (!p) throw err('UNSUPPORTED', `media 不认识 ${location.hostname}`);
  const limit = Math.min(Math.max(Number(payload.limit) || 60, 1), 300);
  const times = Math.min(Math.max(Number(payload.scrollTimes ?? 0), 0), 30);
  let items = listPage(p, net, limit);
  for (let i = 0; i < times && items.length < limit; i++) {
    await scrollMore(null, 1, Math.min(Math.max(Number(payload.waitMs) || 1200, 300), 5000));
    items = listPage(p, net, limit);
  }
  return { platform: p, pageUrl: location.href, pageTitle: document.title, count: items.length, items, capture: capture() };
}

const ACTIONS = {
  'media.inspect': inspect,
  'media.comments': comments,
  'media.list': list,
  'media.capture_frames': (payload) => captureFrames(payload),
};

(window.__vcorpLoads ||= {}).media = {
  version: __LOAD_VERSION__,

  async ready() {
    const p = platform();
    if (!p) return { ok: false, reason: `不是支持的视频网站：${location.hostname}` };
    return { ok: true, platform: p, netHook: Array.isArray(window.__hcNet) };
  },

  call(action, payload) {
    if (!ALLOWED.has(action) || !ACTIONS[action]) {
      throw Object.assign(new Error(`media 能力包不接受 ${action}`), { code: 'LOAD_DENIED' });
    }
    return ACTIONS[action](payload || {});
  },
};
