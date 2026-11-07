// 抖音。数据有两种写法，同一套解析：
//   SSR：#RENDER_DATA（URL 编码 JSON）→ app.videoDetail，驼峰（bitRateList、chapterInfo）
//   接口：/aweme/v1/web/aweme/detail/、各种 aweme_list，下划线（bit_rate、chapter_info）
// 视频流、音频流、雪碧图都在 douyinvod.com / douyinpic.com，不绑 IP，要 Referer。
import { num, pick, first, https, sec, err, sortStreams, mergeComments, netJson, walk, hashtags, uniqTags } from './util.js';

export const REFERER = 'https://www.douyin.com/';

export function targetId(href) {
  try {
    const u = new URL(href);
    return u.searchParams.get('modal_id') || u.searchParams.get('vid')
      || (/\/(?:video|note|share\/video)\/(\d{8,})/.exec(u.pathname) || [])[1] || '';
  } catch { return ''; }
}

// 同一个字段在不同页面上形状不一样：不是数组就当没有，别让一个字段拖垮整条
const arr = (x) => (Array.isArray(x) ? x : []);

const srcOf = (addr) => {
  // SSR：playAddr: [{src}]；接口：play_addr: {url_list: []}
  if (Array.isArray(addr)) return https(first(addr)?.src || first(addr));
  if (addr && Array.isArray(addr.url_list)) return https(first(addr.url_list));
  return null;
};
const urlList = (o) => {
  if (!o) return [];
  if (Array.isArray(o)) return o.map((x) => https(x?.src || x)).filter(Boolean);
  const l = pick(o, 'urlList', 'url_list');
  return Array.isArray(l) ? l.map((x) => https(x?.src || x)).filter(Boolean) : [];
};

// 抖音一条视频能给十几档，大多只差码率。同清晰度同编码同封装只留最小的一条，
// 自带音频的 h264 mp4 排在同清晰度的最前面（下载后不用再合并），最多 8 条
function pickStreams(streams) {
  const seen = new Set();
  const rank = (s) => (s.format === 'mp4' && s.codec === 'h264' ? 0 : s.format === 'mp4' ? 1 : 2);
  const side = (s) => Math.min(s.width || 0, s.height || 0);
  return sortStreams(streams, 64)
    .filter((s) => {
      const k = `${side(s)}|${s.codec}|${s.format}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => (side(b) - side(a)) || (rank(a) - rank(b)))
    .slice(0, 8);
}

export function parseAweme(vd, { href = '', ua = '' } = {}) {
  if (!vd) return null;
  const id = String(pick(vd, 'awemeId', 'aweme_id') || '');
  const video = vd.video || {};
  const stats = pick(vd, 'stats', 'statistics') || {};
  const author = pick(vd, 'authorInfo', 'author') || {};
  const durMs = num(pick(video, 'duration')) || num(vd.duration) || 0;
  const durationSec = sec(durMs > 1000 ? durMs / 1000 : durMs);

  const streams = [];
  for (const b of arr(pick(video, 'bitRateList', 'bit_rate'))) {
    const fmt = pick(b, 'format') || 'mp4';
    const w = num(pick(b, 'width')) || num(pick(b.play_addr || {}, 'width'));
    const h = num(pick(b, 'height')) || num(pick(b.play_addr || {}, 'height'));
    streams.push({
      quality: h && w ? `${Math.min(w, h)}p` : '',
      gearName: pick(b, 'gearName', 'gear_name') || '',
      format: fmt,
      codec: num(pick(b, 'isH265', 'is_h265')) ? 'h265' : 'h264',
      hasAudio: fmt !== 'dash',
      width: w, height: h,
      fps: num(b.fps),
      bitrate: num(pick(b, 'bitRate', 'bit_rate')),
      sizeBytes: num(pick(b, 'dataSize')) || num(pick(b.play_addr || {}, 'data_size')),
      url: srcOf(pick(b, 'playAddr', 'play_addr')),
      ipBound: false,
    });
  }
  if (!streams.length) {
    const url = srcOf(pick(video, 'playAddr', 'play_addr'));
    if (url) streams.push({ quality: '', format: 'mp4', codec: 'h264', hasAudio: true, width: num(video.width), height: num(video.height), url, ipBound: false });
  }

  const audios = [];
  for (const a of arr(pick(video, 'bitRateAudioList', 'bit_rate_audio'))) {
    // SSR：{urlList:[{src}], size, bitrate}；接口：{audio_meta:{url_list:{main_url, backup_url}, size, bitrate}}
    const meta = a.audio_meta || a;
    const ul = meta.url_list;
    const url = first(urlList(a.urlList)) || https(ul?.main_url) || https(ul?.backup_url) || first(urlList(ul));
    if (!url) continue;
    audios.push({
      url,
      sizeBytes: num(pick(meta, 'size')),
      bitrate: num(pick(meta, 'bitrate', 'bit_rate')),
      codec: 'mp4a',
      ipBound: false,
    });
  }
  audios.sort((a, b) => (a.sizeBytes || 9e15) - (b.sizeBytes || 9e15));

  const chapterInfo = pick(vd, 'chapterInfo', 'chapter_info') || {};
  const chapters = arr(pick(chapterInfo, 'list', 'chapter_list')).map((c) => ({
    title: c.desc || '',
    detail: c.detail || '',
    startSec: sec((num(c.timestamp) || 0) / 1000),
    thumbUrl: https(c.url) || null,
  }));

  const storyboards = arr(pick(video, 'bigThumbs', 'big_thumbs')).map((t) => {
    const cols = num(t.img_x_len) || 5;
    const rows = num(t.img_y_len) || 5;
    return {
      urls: (t.img_urls || [t.img_url]).map(https).filter(Boolean),
      cols, rows,
      frameWidth: num(t.img_x_size), frameHeight: num(t.img_y_size),
      intervalSec: num(t.interval),
      totalFrames: num(t.img_num),
    };
  }).filter((s) => s.urls.length);

  const images = arr(vd.images).map((im) => first(urlList(im))).filter(Boolean);

  const desc = vd.desc || '';
  const textExtra = arr(pick(vd, 'textExtra', 'text_extra'));
  const tags = uniqTags([
    ...textExtra.map((t) => pick(t, 'hashtagName', 'hashtag_name')).filter(Boolean),
    ...hashtags(desc),
  ]);
  const category = arr(pick(vd, 'videoTag', 'video_tag')).map((t) => pick(t, 'tagName', 'tag_name')).filter(Boolean);
  const searchWords = [];
  // 接口和有的 SSR 页面是 {suggest_words:[…]}，有的 SSR 页面直接是数组
  const suggest = pick(vd, 'suggestWords', 'suggest_words');
  for (const s of arr(suggest?.suggest_words ?? suggest?.suggestWords ?? suggest)) {
    for (const w of arr(s.words)) if (w.word) searchWords.push(w.word);
  }
  const music = vd.music ? {
    title: pick(vd.music, 'title') || '',
    author: pick(vd.music, 'author', 'ownerNickname', 'owner_nickname') || '',
    original: pick(vd.music, 'isOriginal', 'is_original') ?? null,
    durationSec: num(vd.music.duration),
    url: first(urlList(pick(vd.music, 'playUrl', 'play_url'))) || null,
  } : null;
  const cover = first(urlList(pick(video, 'originCoverUrlList'))) || first(urlList(pick(video, 'coverUrlList')))
    || first(urlList(pick(video, 'origin_cover', 'cover'))) || https(typeof video.cover === 'string' ? video.cover : null);

  const meta = video.meta || {};
  const authorId = String(pick(author, 'uid') || '');
  const secId = pick(author, 'secUid', 'sec_uid') || '';
  return {
    platform: 'douyin',
    id,
    url: id ? `https://www.douyin.com/video/${id}` : href,
    pageUrl: href,
    type: images.length && !streams.length ? 'images' : 'video',
    title: pick(vd, 'itemTitle', 'item_title') || desc.split(/\s#/)[0].slice(0, 120),
    desc,
    createTime: num(pick(vd, 'createTime', 'create_time')),
    durationSec,
    author: {
      id: authorId,
      secId,
      name: pick(author, 'nickname') || '',
      followers: num(pick(author, 'followerCount', 'follower_count')),
      totalLikes: num(pick(author, 'totalFavorited', 'total_favorited')),
      verified: pick(author, 'enterpriseVerifyReason', 'enterprise_verify_reason', 'customVerify', 'custom_verify') || '',
      url: secId ? `https://www.douyin.com/user/${secId}` : '',
    },
    stats: {
      // 抖音网页版不给播放量（playCount 恒为 0），不要拿 0 当真
      view: num(pick(stats, 'playCount', 'play_count')) || null,
      like: num(pick(stats, 'diggCount', 'digg_count')),
      collect: num(pick(stats, 'collectCount', 'collect_count')),
      share: num(pick(stats, 'shareCount', 'share_count')),
      comment: num(pick(stats, 'commentCount', 'comment_count')),
      recommend: num(pick(stats, 'recommendCount', 'recommend_count')),
    },
    tags,
    category,
    searchWords,
    music,
    requestHeaders: { Referer: REFERER, 'User-Agent': ua },
    transcript: { inlineSegments: [], subtitleTracks: [], audioStream: audios[0] || null, audioStreams: audios.slice(0, 4) },
    visual: { coverUrl: cover || null, images, chapters, storyboards, videoStreams: pickStreams(streams) },
    intel: {
      chapterAbstract: pick(chapterInfo, 'chapterAbstract', 'chapter_abstract') || '',
      loudnessLufs: num(meta.loudness),
      brightnessMean: num(meta.brightness_mean),
      vqs: num(meta.vqs_origin),
      ocrContent: pick(vd.seoInfo || {}, 'ocrContent') || '',
      mix: pick(vd.mixInfo || {}, 'mixName') || pick(vd.mix_info || {}, 'mix_name') || '',
      poi: pick(vd.poiInfo || {}, 'poiName') || pick(vd.poi_info || {}, 'poi_name') || '',
      isAds: !!pick(vd, 'isAds', 'is_ads'),
    },
  };
}

export function parseComments(json) {
  return (json?.comments || []).map((c) => ({
    id: String(c.cid || ''),
    user: c.user?.nickname || '',
    userId: c.user?.uid || '',
    text: c.text || '',
    likes: num(c.digg_count) ?? 0,
    repliesCount: num(c.reply_comment_total) ?? 0,
    location: c.ip_label || '',
    createTime: num(c.create_time),
    authorLiked: !!c.is_author_digged,
    pinned: !!c.stick_position,
    label: c.label_text || '',
  }));
}

// ---- 页面侧 ----

function renderData() {
  const el = document.getElementById('RENDER_DATA');
  if (!el) return null;
  const raw = el.textContent || '';
  try { return JSON.parse(raw.trim().startsWith('{') ? raw : decodeURIComponent(raw)); } catch { return null; }
}

// 当前要看的那条：地址里的 modal_id / /video/<id>；SSR 不是它（站内切换过）就去接口记录里找
export function findAweme(net) {
  const want = targetId(location.href);
  const rd = renderData();
  const ssr = rd?.app?.videoDetail;
  if (ssr && (!want || String(ssr.awemeId) === want)) return { vd: ssr, from: 'RENDER_DATA' };
  let found = null;
  for (const { json } of netJson(net, (u) => /\/aweme\/v1\/web\//.test(u)).reverse()) {
    if (json?.aweme_detail && (!want || json.aweme_detail.aweme_id === want)) return { vd: json.aweme_detail, from: 'aweme/detail' };
    walk(json, (o) => {
      if (found) return false;
      if (o.aweme_id && o.video && (!want || String(o.aweme_id) === want)) { found = o; return false; }
      return true;
    }, 6);
    if (found) return { vd: found, from: 'aweme_list' };
  }
  if (ssr && !want) return { vd: ssr, from: 'RENDER_DATA' };
  throw err('NOT_FOUND', want
    ? `页面数据里没有作品 ${want}（站内切换过来的）。navigate 到 https://www.douyin.com/video/${want} 再 inspect`
    : '这不是一个抖音作品页。打开作品页（/video/<id> 或带 modal_id）再 inspect');
}

export function inspect(net) {
  const { vd, from } = findAweme(net);
  const d = parseAweme(vd, { href: location.href, ua: navigator.userAgent });
  d.source = from;
  d.comments = commentsFrom(net, d.id);
  return d;
}

export function commentsFrom(net, id) {
  const lists = netJson(net, '/comment/list/')
    .filter(({ url }) => !id || url.includes(`aweme_id=${id}`))
    .map(({ json }) => parseComments(json));
  return mergeComments(lists);
}

export function commentMeta(net, id) {
  const last = netJson(net, '/comment/list/').filter(({ url }) => !id || url.includes(`aweme_id=${id}`)).pop();
  return last ? { total: num(last.json.total), hasMore: !!last.json.has_more } : null;
}

// 评论区没打开就点开它；返回滚动容器
export async function openComments(net, id, wait) {
  if (!netJson(net(), '/comment/list/').some(({ url }) => !id || url.includes(`aweme_id=${id}`))) {
    const btn = [...document.querySelectorAll('[data-e2e="feed-comment-icon"]')]
      .find((b) => b.getBoundingClientRect().height > 0) || document.querySelector('[data-e2e="feed-comment-icon"]');
    btn?.click();
    await wait(() => netJson(net(), '/comment/list/').length > 0, 6000);
  }
  return document.querySelector('[data-e2e="comment-list"]') || document.querySelector('[data-e2e="comment-item"]');
}
