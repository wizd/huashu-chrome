// 小红书。window.__INITIAL_STATE__.note.noteDetailMap[noteId]（Vue 响应式对象，可能包着 ref）。
// 视频流的键名是混淆过的（h264/h265 常为空，真流在 EF4 之类的键下），所以不认键名，全摊平。
// xhscdn.com 不绑 IP、不验 Referer、支持 Range；音画合一，没有单独的音频流。
import { num, first, https, sec, err, sortStreams, mergeComments, netJson, hashtags } from './util.js';

export const REFERER = 'https://www.xiaohongshu.com/';

export function targetId(href) {
  try { return (/\/(?:explore|discovery\/item|search_result)\/([0-9a-f]{24})/.exec(new URL(href).pathname) || [])[1] || ''; } catch { return ''; }
}

// Vue ref / reactive 拆包
export function unref(v) {
  for (let i = 0; i < 3 && v && typeof v === 'object'; i++) {
    if ('_rawValue' in v) v = v._rawValue;
    else if ('_value' in v && v.__v_isRef) v = v._value;
    else break;
  }
  return v;
}

const picUrl = (im) => https(im?.urlDefault || im?.url_default || im?.url || first(im?.infoList || im?.info_list)?.url) || null;

export function parseNote(entry, { href = '', ua = '' } = {}) {
  const n = unref(entry?.note) || unref(entry);
  if (!n || !(n.noteId || n.note_id || n.id)) return null;
  const id = n.noteId || n.note_id || n.id;
  const ii = n.interactInfo || n.interact_info || {};
  const user = n.user || {};
  const media = n.video?.media || {};
  const streams = [];
  for (const s of Object.values(media.stream || {}).flat()) {
    if (!s || !(s.masterUrl || s.master_url)) continue;
    streams.push({
      quality: s.height && s.width ? `${Math.min(s.width, s.height)}p` : (s.qualityType || ''),
      gearName: String(s.streamType ?? s.stream_type ?? ''),
      format: s.format || 'mp4',
      codec: /265|hev|EF[57]/i.test(String(s.videoCodec || '')) ? 'h265?' : String(s.videoCodec || ''),
      hasAudio: (num(s.audioBitrate ?? s.audio_bitrate) ?? 1) > 0,
      width: num(s.width), height: num(s.height),
      fps: num(s.fps),
      bitrate: num(s.avgBitrate ?? s.avg_bitrate ?? s.videoBitrate),
      sizeBytes: num(s.size),
      url: https(s.masterUrl || s.master_url),
      backupUrls: (s.backupUrls || s.backup_urls || []).map(https).slice(0, 2),
      ipBound: false,
    });
  }
  // capa.duration、media.video.duration 是秒；流里的 duration 是毫秒
  const rawStream = first(Object.values(media.stream || {}).flat().filter(Boolean));
  const durationSec = sec(num(n.video?.capa?.duration) || num(media.video?.duration) || (num(rawStream?.duration) || 0) / 1000);
  const images = (n.imageList || n.image_list || []).map(picUrl).filter(Boolean);
  const tags = [...new Set([...(n.tagList || n.tag_list || []).map((t) => t.name).filter(Boolean), ...hashtags((n.desc || '').replace(/\[话题\]#/g, ' '))])];
  const time = num(n.time);
  return {
    platform: 'xiaohongshu',
    id,
    url: `https://www.xiaohongshu.com/explore/${id}${n.xsecToken ? `?xsec_token=${encodeURIComponent(n.xsecToken)}&xsec_source=pc_feed` : ''}`,
    pageUrl: href,
    type: n.type === 'video' ? 'video' : 'images',
    title: n.title || n.display_title || '',
    desc: (n.desc || '').replace(/\[话题\]#/g, '#'),
    createTime: time ? Math.round(time > 1e12 ? time / 1000 : time) : null,
    durationSec: n.type === 'video' ? durationSec : null,
    author: {
      id: user.userId || user.user_id || '',
      name: user.nickname || user.nickName || '',
      followers: null,
      url: user.userId ? `https://www.xiaohongshu.com/user/profile/${user.userId}` : '',
    },
    stats: {
      view: null,
      like: num(ii.likedCount ?? ii.liked_count),
      collect: num(ii.collectedCount ?? ii.collected_count),
      share: num(ii.shareCount ?? ii.share_count),
      comment: num(ii.commentCount ?? ii.comment_count),
    },
    tags,
    category: [],
    searchWords: [],
    music: null,
    requestHeaders: { Referer: REFERER, 'User-Agent': ua },
    transcript: { inlineSegments: [], subtitleTracks: [], audioStream: null, audioStreams: [] },
    visual: { coverUrl: images[0] || picUrl(n.video?.image) || null, images, chapters: [], storyboards: [], videoStreams: sortStreams(streams) },
    intel: {
      ipLocation: n.ipLocation || n.ip_location || '',
      statement: typeof n.noteStatement === 'string' ? n.noteStatement : (n.noteStatement?.desc || n.noteStatement?.text || ''),
      atUsers: (n.atUserList || []).map((u) => u.nickname).filter(Boolean),
      lastUpdateTime: num(n.lastUpdateTime) ? Math.round(num(n.lastUpdateTime) / 1000) : null,
      imageCount: images.length,
    },
  };
}

export function parseComment(c) {
  const out = {
    id: c.id || '',
    user: c.userInfo?.nickname || c.user_info?.nickname || '',
    userId: c.userInfo?.userId || c.user_info?.user_id || '',
    text: c.content || '',
    likes: num(c.likeCount ?? c.like_count) ?? 0,
    repliesCount: num(c.subCommentCount ?? c.sub_comment_count) ?? 0,
    location: c.ipLocation || c.ip_location || '',
    createTime: num(c.createTime ?? c.create_time) ? Math.round(num(c.createTime ?? c.create_time) / 1000) : null,
    label: (c.showTags || c.show_tags || []).join(','),
  };
  const subs = (c.subComments || c.sub_comments || []).map((s) => ({
    user: s.userInfo?.nickname || s.user_info?.nickname || '',
    text: s.content || '',
    likes: num(s.likeCount ?? s.like_count) ?? 0,
    byAuthor: (s.showTags || s.show_tags || []).includes('is_author'),
  }));
  if (subs.length) out.replies = subs;
  // 作者回了这条：showTags 里带 is_author 的子评论
  if (subs.some((s) => s.byAuthor)) out.authorReplied = true;
  return out;
}

// ---- 页面侧 ----

function detailMap() {
  const s = window.__INITIAL_STATE__;
  return unref(unref(s?.note)?.noteDetailMap) || {};
}

export function inspect(net) {
  const want = targetId(location.href);
  const map = detailMap();
  let entry = want ? unref(map[want]) : unref(Object.values(map).find((e) => unref(e)?.note?.noteId));
  let from = 'noteDetailMap';
  if (!entry?.note?.noteId) {
    // 站内点开的：接口 /api/sns/web/v1/feed 回的 items[].note_card
    for (const { json } of netJson(net, '/api/sns/web/v1/feed').reverse()) {
      const item = (json?.data?.items || []).find((i) => !want || i.id === want);
      if (item?.note_card) { entry = { note: { ...item.note_card, noteId: item.id } }; from = 'feed'; break; }
    }
  }
  if (!entry) throw err('NOT_FOUND', want ? `页面里没有笔记 ${want} 的数据，刷新（navigate reload）后再 inspect` : '这不是一篇小红书笔记页，打开 /explore/<id> 再 inspect');
  const d = parseNote(entry, { href: location.href, ua: navigator.userAgent });
  if (!d.visual.videoStreams.length) {
    const v = [...document.querySelectorAll('video')].map((x) => x.currentSrc).find((u) => /^https?:/.test(u || ''));
    if (v && d.type === 'video') d.visual.videoStreams.push({ quality: '', format: 'mp4', hasAudio: true, url: v, ipBound: false });
  }
  d.source = from;
  d.comments = commentsFrom(net, d.id);
  return d;
}

export function commentsFrom(net, id) {
  const map = detailMap();
  const mem = unref(unref(map[id])?.comments)?.list || [];
  const lists = [mem.map(parseComment)];
  for (const { url, json } of netJson(net, '/api/sns/web/v2/comment/page')) {
    if (id && !url.includes(id)) continue;
    lists.push((json?.data?.comments || []).map(parseComment));
  }
  return mergeComments(lists);
}

export function commentMeta(net, id) {
  const last = netJson(net, '/api/sns/web/v2/comment/page').filter(({ url }) => !id || url.includes(id)).pop();
  const mem = unref(unref(detailMap()[id])?.comments);
  return { total: null, hasMore: last ? !!last.json?.data?.has_more : !!mem?.hasMore };
}

export async function openComments() {
  return document.querySelector('.note-scroller') || document.querySelector('.comments-container') || document.querySelector('.comment-item');
}

