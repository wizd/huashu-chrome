// YouTube。播放器的 getPlayerResponse()（站内切换后也是当前视频）兜底 ytInitialPlayerResponse。
// 页面开了 Trusted Types，字符串 eval 不能用；能力包是扩展文件注入，不受影响。
// 视频流是 SABR 且绑客户端 IP，云端拉不了：要画面就用雪碧图（i.ytimg.com，不绑 IP）或 capture_frames。
// 字幕：播放器请求 /api/timedtext 时带 pot，签名里 ip=0.0.0.0，这条 URL 云端也能直接下。
// 字幕没开时播放器不会请求，这里替用户点一下字幕按钮，拿到后再点回去。
import { num, https, sec, err, mergeComments, netJson, walk, ytText, chaptersFromText, hashtags, sleep } from './util.js';

export const REFERER = 'https://www.youtube.com/';

export function targetId(href) {
  try {
    const u = new URL(href);
    return u.searchParams.get('v') || (/\/(?:shorts|live|embed)\/([\w-]{11})/.exec(u.pathname) || [])[1] || '';
  } catch { return ''; }
}

// json3：{events:[{tStartMs, dDurationMs, segs:[{utf8}]}]}；srv3/XML：<p t="" d="">…</p> 或 <text start dur>
export function parseTimedtext(body) {
  const out = [];
  const text = String(body || '').trim();
  if (text.startsWith('{')) {
    let j;
    try { j = JSON.parse(text); } catch { return out; }
    for (const e of j.events || []) {
      const t = (e.segs || []).map((s) => s.utf8 || '').join('').replace(/\s*\n\s*/g, ' ').trim();
      if (!t) continue;
      const start = (num(e.tStartMs) || 0) / 1000;
      out.push({ start: sec(start), end: sec(start + (num(e.dDurationMs) || 0) / 1000), text: t });
    }
    return out;
  }
  const dec = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  for (const m of text.matchAll(/<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g)) {
    const t = dec(m[3]);
    if (t) out.push({ start: sec(+m[1] / 1000), end: sec((+m[1] + (+m[2] || 0)) / 1000), text: t });
  }
  if (!out.length) {
    for (const m of text.matchAll(/<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g)) {
      const t = dec(m[3]);
      if (t) out.push({ start: sec(+m[1]), end: sec(+m[1] + (+m[2] || 0)), text: t });
    }
  }
  return out;
}

// spec: "<url 模板>|w#h#count#cols#rows#interval#name#sigh|…"，最后一级最清楚
export function parseStoryboard(spec, durationSec) {
  if (!spec) return [];
  const [base, ...levels] = String(spec).split('|');
  if (!levels.length) return [];
  const li = levels.length - 1;
  const [w, h, count, cols, rows, interval, name, sigh] = levels[li].split('#');
  const n = num(count) || 0;
  const per = (num(cols) || 1) * (num(rows) || 1);
  const sheets = Math.max(1, Math.ceil(n / per));
  const urls = [];
  for (let i = 0; i < sheets && i < 200; i++) {
    let u = base.replace('$L', String(li)).replace('$N', String(name || '').replace('$M', String(i)));
    if (sigh) u += `${u.includes('?') ? '&' : '?'}sigh=${sigh}`;
    urls.push(https(u));
  }
  const iv = num(interval);
  return [{
    urls, cols: num(cols), rows: num(rows), frameWidth: num(w), frameHeight: num(h),
    intervalSec: iv ? sec(iv / 1000) : (n && durationSec ? sec(durationSec / n) : null),
    totalFrames: n,
  }];
}

export function parsePlayer(pr, { ua = '', href = '' } = {}) {
  const vd = pr?.videoDetails || {};
  const mf = pr?.microformat?.playerMicroformatRenderer || {};
  const id = vd.videoId || '';
  const durationSec = num(vd.lengthSeconds) || num(mf.lengthSeconds);
  const tracks = (pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []).map((t) => ({
    lang: t.languageCode, name: ytText(t.name), kind: t.kind === 'asr' ? 'asr' : 'manual',
    // 没有 pot 的 baseUrl：常常回空。真正能用的是 timedtextUrls 里播放器自己请求过的那条
    url: https(t.baseUrl), ipBound: false, needsPot: true,
  }));
  const formats = [...(pr?.streamingData?.formats || []), ...(pr?.streamingData?.adaptiveFormats || [])];
  const videoStreams = formats.filter((f) => /^video/.test(f.mimeType || '')).map((f) => ({
    quality: f.qualityLabel || '', gearName: String(f.itag), format: /mp4/.test(f.mimeType) ? 'mp4' : 'webm',
    codec: (/codecs="([^".]+)/.exec(f.mimeType || '') || [])[1] || '', hasAudio: !!f.audioQuality,
    width: num(f.width), height: num(f.height), fps: num(f.fps), bitrate: num(f.bitrate), sizeBytes: num(f.contentLength),
    url: null, ipBound: true,
  })).sort((a, b) => (b.height || 0) - (a.height || 0)).filter((s, i, a) => i === a.findIndex((x) => x.quality === s.quality)).slice(0, 8);
  const desc = vd.shortDescription || mf.description?.simpleText || '';
  const thumbs = vd.thumbnail?.thumbnails || [];
  return {
    platform: 'youtube',
    id,
    url: `https://www.youtube.com/watch?v=${id}`,
    pageUrl: href,
    type: 'video',
    title: vd.title || ytText(mf.title),
    desc,
    createTime: mf.publishDate ? Math.round(Date.parse(mf.publishDate) / 1000) : null,
    durationSec,
    author: { id: vd.channelId || mf.externalChannelId || '', name: vd.author || mf.ownerChannelName || '', followers: null, url: mf.ownerProfileUrl || (vd.channelId ? `https://www.youtube.com/channel/${vd.channelId}` : '') },
    stats: { view: num(vd.viewCount) ?? num(mf.viewCount), like: num(mf.likeCount), collect: null, share: null, comment: null },
    tags: [...new Set([...(vd.keywords || []), ...hashtags(desc)])],
    category: [mf.category].filter(Boolean),
    searchWords: [],
    music: null,
    requestHeaders: { Referer: REFERER, 'User-Agent': ua },
    transcript: { inlineSegments: [], subtitleTracks: tracks, audioStream: null, audioStreams: [] },
    visual: {
      coverUrl: id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : https(thumbs[thumbs.length - 1]?.url),
      images: [],
      chapters: chaptersFromText(desc),
      storyboards: parseStoryboard(pr?.storyboards?.playerStoryboardSpecRenderer?.spec || pr?.storyboards?.playerLiveStoryboardSpecRenderer?.spec, durationSec),
      videoStreams,
    },
    intel: {
      isLive: !!vd.isLiveContent,
      isShorts: /\/shorts\//.test(href),
      familySafe: mf.isFamilySafe ?? null,
      uploadDate: mf.uploadDate || '',
      availableCountries: (mf.availableCountries || []).length || null,
      captionLanguages: tracks.map((t) => `${t.lang}${t.kind === 'asr' ? '(自动)' : ''}`),
    },
  };
}

// 新版评论：frameworkUpdates.entityBatchUpdate.mutations[].payload.commentEntityPayload
// 旧版：commentThreadRenderer.comment.commentRenderer
export function parseNextComments(json) {
  const out = [];
  walk(json, (o) => {
    const p = o.commentEntityPayload;
    if (p) {
      const pr = p.properties || {};
      out.push({
        id: pr.commentId || '', user: p.author?.displayName || '', userId: p.author?.channelId || '',
        text: pr.content?.content || '', likes: num(p.toolbar?.likeCountNotliked || p.toolbar?.likeCountLiked) ?? 0,
        repliesCount: num(p.toolbar?.replyCount) ?? 0, location: '', publishedText: pr.publishedTime || '',
        byAuthor: !!p.author?.isCreator, authorLiked: !!p.toolbar?.creatorThumbnailUrl,
      });
      return false;
    }
    const r = o.commentRenderer;
    if (r) {
      out.push({
        id: r.commentId || '', user: ytText(r.authorText), text: ytText(r.contentText),
        likes: num(ytText(r.voteCount)) ?? 0, repliesCount: num(r.replyCount) ?? 0, location: '',
        publishedText: ytText(r.publishedTimeText), byAuthor: !!r.authorIsChannelOwner,
      });
      return false;
    }
    return true;
  }, 14);
  return out;
}

// ---- 页面侧 ----

const player = () => document.querySelector('#movie_player');

function playerResponse(want) {
  let pr = null;
  try { pr = player()?.getPlayerResponse?.(); } catch { /* 播放器还没好 */ }
  if (pr?.videoDetails?.videoId === want || (!want && pr)) return pr;
  const init = window.ytInitialPlayerResponse;
  if (init?.videoDetails?.videoId === want || (!want && init)) return init;
  return pr || null;
}

const timedtextFor = (net, id) => ((typeof net === 'function' ? net() : net) || []).filter((r) => String(r.url).includes('/api/timedtext') && String(r.url).includes(`v=${id}`) && r.body);

async function captureCaptions(net, id, wait) {
  if (timedtextFor(net, id).length) return { toggled: false };
  const btn = document.querySelector('.ytp-subtitles-button');
  if (!btn || btn.getAttribute('aria-disabled') === 'true') return { toggled: false, reason: '没有字幕按钮' };
  const wasOn = btn.getAttribute('aria-pressed') === 'true';
  if (wasOn) { btn.click(); await sleep(300); }
  btn.click();
  const ok = await wait(() => timedtextFor(net, id).length > 0, 8000);
  // 用户本来没开字幕：还原
  if (!wasOn) btn.click();
  return { toggled: true, ok };
}

function domStats() {
  const out = {};
  const like = document.querySelector('like-button-view-model button, #segmented-like-button button, ytd-toggle-button-renderer#like-button button');
  const label = like?.getAttribute('aria-label') || '';
  const m = /([\d,.]+\s*[KMB万亿]?)/.exec(label.replace(/[^\d,.KMB万亿\s]/g, ' ').trim());
  if (m) out.like = num(m[1].replace(/\s/g, ''));
  const subs = document.querySelector('#owner-sub-count')?.textContent || '';
  const sm = /([\d.,]+\s*[KMB万亿]?)/.exec(subs);
  if (sm) out.followers = num(sm[1].replace(/\s/g, ''));
  const cc = document.querySelector('ytd-comments-header-renderer #count')?.textContent || '';
  const cm = /([\d,.]+\s*[KMB万亿]?)/.exec(cc);
  if (cm) out.comment = num(cm[1].replace(/\s/g, ''));
  return out;
}

export function dataFollowers(data, want) {
  if (!data || data.currentVideoEndpoint?.watchEndpoint?.videoId !== want) return null;
  let text = '';
  walk(data.contents, (o) => {
    if (text) return false;
    if (o.videoOwnerRenderer) { text = ytText(o.videoOwnerRenderer.subscriberCountText); return false; }
    return true;
  }, 12);
  const m = /[\d.,]+\s*[KMB万亿]?/.exec(text);
  return m ? num(m[0].replace(/\s/g, '')) : null;
}

// ytInitialData 里的章节（只有当前视频对得上时才用）
function dataChapters(want) {
  const d = window.ytInitialData;
  if (!d || d.currentVideoEndpoint?.watchEndpoint?.videoId !== want) return [];
  const out = [];
  walk(d.playerOverlays, (o) => {
    if (o.chapterRenderer) {
      const c = o.chapterRenderer;
      out.push({ title: ytText(c.title), detail: '', startSec: sec((num(c.timeRangeStartMillis) || 0) / 1000), thumbUrl: https(c.thumbnail?.thumbnails?.slice(-1)[0]?.url) || null });
      return false;
    }
    return true;
  }, 16);
  return out;
}

export async function inspect(net, { subtitles = true } = {}, wait) {
  const want = targetId(location.href);
  const pr = playerResponse(want);
  if (!pr?.videoDetails) throw err('NOT_FOUND', '页面上没有播放器数据：打开 /watch?v=… 等播放器出来再 inspect');
  if (want && pr.videoDetails.videoId !== want) throw err('NOT_FOUND', `播放器还是上一个视频（${pr.videoDetails.videoId}），等几秒或 navigate reload 后再 inspect`);
  const d = parsePlayer(pr, { ua: navigator.userAgent, href: location.href });
  d.notes = [];
  const fromData = dataChapters(d.id);
  if (fromData.length) d.visual.chapters = fromData;

  if (subtitles && d.transcript.subtitleTracks.length) {
    const cap = await captureCaptions(net, d.id, wait);
    if (cap.toggled && !cap.ok) d.notes.push('点了字幕按钮，但没等到 /api/timedtext：网络记录可能还没开（navigate reload 后再 inspect）');
  } else if (!d.transcript.subtitleTracks.length) d.notes.push('这个视频没有字幕轨：要文案就用 capture_frames 看画面，或请用户另行提供音频');
  const tt = timedtextFor(net, d.id);
  if (tt.length) {
    const last = tt[tt.length - 1];
    d.transcript.inlineSegments = parseTimedtext(last.body);
    const u = new URL(String(last.url), location.href);
    d.transcript.timedtextUrls = tt.map((r) => {
      const x = new URL(String(r.url), location.href);
      return { url: x.href, lang: x.searchParams.get('lang') || '', tlang: x.searchParams.get('tlang') || '', ipBound: !['0.0.0.0', null].includes(x.searchParams.get('ip')) && x.searchParams.has('ip') };
    }).filter((t, i, a) => i === a.findIndex((y) => y.url === t.url)).slice(-4);
    d.transcript.inlineLang = u.searchParams.get('tlang') || u.searchParams.get('lang') || '';
  }

  const ds = domStats();
  if (d.stats.like == null && ds.like != null) d.stats.like = ds.like;
  if (ds.comment != null) d.stats.comment = ds.comment;
  // 刚刷新或在后台时页面还没渲染出来，粉丝数先从 ytInitialData 取
  d.author.followers = dataFollowers(window.ytInitialData, d.id) ?? ds.followers ?? null;
  d.source = 'getPlayerResponse';
  d.comments = commentsFrom(net, d.id);
  return d;
}

export function commentsFrom(net) {
  const lists = netJson(net, '/youtubei/v1/next').map(({ json }) => parseNextComments(json));
  // DOM 兜底：网络记录开始之前加载的那一批
  lists.push([...document.querySelectorAll('ytd-comment-thread-renderer')].slice(0, 300).map((t) => ({
    id: t.querySelector('#comment, ytd-comment-view-model')?.getAttribute?.('data-comment-id') || '',
    user: (t.querySelector('#author-text')?.textContent || '').trim(),
    text: (t.querySelector('#content-text')?.textContent || '').trim(),
    likes: num((t.querySelector('#vote-count-middle')?.textContent || '').trim()) ?? 0,
    repliesCount: null,
    publishedText: (t.querySelector('#published-time-text')?.textContent || '').trim(),
    byAuthor: !!t.querySelector('ytd-author-comment-badge-renderer'),
  })));
  return mergeComments(lists);
}

export function commentMeta() {
  const cc = document.querySelector('ytd-comments-header-renderer #count')?.textContent || '';
  return { total: num((/([\d,.]+)/.exec(cc) || [])[1]), hasMore: !!document.querySelector('ytd-comments ytd-continuation-item-renderer') };
}

export async function openComments(_net, _id, wait) {
  const box = document.querySelector('ytd-comments#comments') || document.querySelector('#comments');
  box?.scrollIntoView({ block: 'start' });
  // 后台标签页不会懒加载评论，别白等：fetchComments 直接拉
  if (document.visibilityState !== 'hidden') await wait(() => document.querySelector('ytd-comment-thread-renderer'), 6000);
  return null;
}

// 评论区的第一个 continuation 就在 ytInitialData 里（只有当前视频对得上时才用）
export function firstCommentToken(data, want) {
  if (!data || (want && data.currentVideoEndpoint?.watchEndpoint?.videoId !== want)) return null;
  let token = null;
  walk(data.contents, (o) => {
    if (token) return false;
    const s = o.itemSectionRenderer;
    if (s?.sectionIdentifier === 'comment-item-section') {
      token = s.contents?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token || null;
      return false;
    }
    return true;
  }, 12);
  return token;
}

// 下一页：只看顶层列表的最后一项（回复区里也有 continuationItemRenderer，那个不是翻页）
export function nextCommentToken(json) {
  for (const e of json?.onResponseReceivedEndpoints || []) {
    const items = (e.reloadContinuationItemsCommand || e.appendContinuationItemsAction)?.continuationItems;
    const t = items?.[items.length - 1]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
    if (t) return t;
  }
  return null;
}

export function commentTotal(json) {
  let total = null;
  walk(json?.onResponseReceivedEndpoints, (o) => {
    if (total !== null) return false;
    if (o.commentsHeaderRenderer) {
      total = num((/[\d,.]+\s*[KMB万亿]?/.exec(ytText(o.commentsHeaderRenderer.countText)) || [''])[0].replace(/\s/g, ''));
      return false;
    }
    return true;
  }, 10);
  return total;
}

// /youtubei/v1/next 要 continuation，不要签名。不带 cookie：评论是公开的，带了反而要配登录签名头
export async function fetchComments(id, count) {
  const cfg = window.ytcfg;
  let token = firstCommentToken(window.ytInitialData, id);
  const context = cfg?.get?.('INNERTUBE_CONTEXT');
  if (!token || !context) return { note: '页面里没有评论的 continuation（站内切换过来的，或评论已关闭）：navigate 到这个视频再试' };
  const lists = [];
  let total = null;
  let got = 0;
  for (let page = 0; page < 12 && token && got < count; page++) {
    const res = await fetch('/youtubei/v1/next?prettyPrint=false', {
      method: 'POST',
      credentials: 'omit',
      headers: { 'content-type': 'application/json', 'x-youtube-client-name': '1', 'x-youtube-client-version': context.client?.clientVersion || '' },
      body: JSON.stringify({ context, continuation: token }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    total = commentTotal(json) ?? total;
    const list = parseNextComments(json);
    lists.push(list);
    got += list.length;
    token = nextCommentToken(json);
    if (!list.length && page > 0) break;
    if (token && got < count) await sleep(300);
  }
  const comments = mergeComments(lists, count);
  return { comments, total, hasMore: !!token };
}
