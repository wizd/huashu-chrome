// B 站。window.__INITIAL_STATE__（videoData、tags、upData）+ window.__playinfo__（dash 流）。
// 站内切换后 __playinfo__ 可能还是上一个视频的：按 cid 核对，不对就去 /x/player/wbi/playurl 的记录里找。
// 字幕、看点在 /x/player/wbi/v2 的响应里（同样按 cid 核对，防止拿到上一个视频的字幕）。
// bilivideo.com / akamaized.net 不绑 IP，要 Referer。
import { num, https, sec, err, sleep, sortStreams, mergeComments, netJson, hashtags, uniqTags } from './util.js';

export const REFERER = 'https://www.bilibili.com/';

export function targetId(href) {
  try { return (/\/video\/(BV[0-9A-Za-z]{10}|av\d+)/.exec(new URL(href).pathname) || [])[1] || ''; } catch { return ''; }
}

const QN = { 6: '240p', 16: '360p', 32: '480p', 64: '720p', 74: '720p60', 80: '1080p', 112: '1080p+', 116: '1080p60', 120: '4K', 125: 'HDR', 126: 'Dolby Vision', 127: '8K' };
const codecOf = (c = '') => (/^avc/.test(c) ? 'h264' : /^(hev|hvc)/.test(c) ? 'h265' : /^av01/.test(c) ? 'av1' : c);

export function parsePlayurl(data, durationSec) {
  const streams = [];
  const audios = [];
  const dash = data?.dash;
  if (dash) {
    for (const v of dash.video || []) {
      const bw = num(v.bandwidth);
      streams.push({
        quality: QN[v.id] || `${Math.min(v.width, v.height)}p`,
        gearName: String(v.id),
        format: 'dash', codec: codecOf(v.codecs), hasAudio: false,
        width: num(v.width), height: num(v.height),
        fps: num(v.frameRate || v.frame_rate),
        bitrate: bw,
        sizeBytes: bw && durationSec ? Math.round(bw / 8 * durationSec) : null,
        url: https(v.baseUrl || v.base_url),
        backupUrls: (v.backupUrl || v.backup_url || []).map(https).slice(0, 2),
        ipBound: false,
      });
    }
    for (const a of [...(dash.audio || []), ...(dash.dolby?.audio || []), ...(dash.flac?.audio ? [dash.flac.audio] : [])]) {
      const bw = num(a.bandwidth);
      audios.push({
        url: https(a.baseUrl || a.base_url),
        backupUrls: (a.backupUrl || a.backup_url || []).map(https).slice(0, 2),
        sizeBytes: bw && durationSec ? Math.round(bw / 8 * durationSec) : null,
        bitrate: bw, codec: a.codecs || 'mp4a', ipBound: false,
      });
    }
  }
  for (const d of data?.durl || []) {
    streams.push({ quality: QN[data.quality] || '', format: 'mp4', codec: 'h264', hasAudio: true, sizeBytes: num(d.size), url: https(d.url), ipBound: false });
  }
  audios.sort((a, b) => (a.bitrate || 9e15) - (b.bitrate || 9e15));
  return { streams, audios };
}

export function parseSubtitle(body) {
  return (body?.body || []).map((s) => ({ start: sec(s.from), end: sec(s.to), text: s.content || '' })).filter((s) => s.text);
}

export function parseReply(r) {
  return {
    id: String(r.rpid_str || r.rpid || ''),
    user: r.member?.uname || '',
    userId: String(r.member?.mid || r.mid || ''),
    text: r.content?.message || '',
    likes: num(r.like) ?? 0,
    repliesCount: num(r.rcount) ?? 0,
    location: String(r.reply_control?.location || '').replace(/^IP属地：/, ''),
    createTime: num(r.ctime),
    authorLiked: !!r.up_action?.like,
    authorReplied: !!r.up_action?.reply,
    replies: (r.replies || []).slice(0, 3).map((s) => ({ user: s.member?.uname || '', text: s.content?.message || '', likes: num(s.like) ?? 0 })),
  };
}

// ---- 页面侧 ----

async function getJson(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function inspect(net, { subtitles = true } = {}) {
  const s = window.__INITIAL_STATE__ || {};
  const vd = s.videoData;
  const want = targetId(location.href);
  if (!vd || (want && want !== vd.bvid && want !== `av${vd.aid}`)) {
    throw err('NOT_FOUND', want ? `页面数据还不是 ${want}，navigate reload 后再 inspect` : '这不是 B 站视频页，打开 /video/BV… 再 inspect');
  }
  const p = Math.max(1, num(new URL(location.href).searchParams.get('p')) || 1);
  const page = (vd.pages || [])[p - 1];
  const cid = num(page?.cid) || num(s.cid) || num(vd.cid);
  const durationSec = sec(num(page?.duration) || num(vd.duration));
  const notes = [];

  // 流：__playinfo__ 只认 cid 对得上的
  let play = window.__playinfo__?.data;
  const playCid = (d) => num(String(d?.dash?.video?.[0]?.baseUrl || d?.durl?.[0]?.url || '').match(/\/(\d{6,})-\d+-/)?.[1]);
  if (play && playCid(play) && playCid(play) !== cid) play = null;
  if (!play) {
    const hit = netJson(net, '/x/player/wbi/playurl').reverse().find(({ url }) => url.includes(`cid=${cid}`));
    play = hit?.json?.data || null;
  }
  const { streams, audios } = parsePlayurl(play, durationSec);
  if (!streams.length) notes.push('页面里没找到这个分 P 的播放地址：刷新后再 inspect');

  // 字幕和看点
  const v2 = netJson(net, '/x/player/wbi/v2').reverse().find(({ json }) => num(json?.data?.cid) === cid)?.json?.data
    || netJson(net, '/x/player/v2').reverse().find(({ json }) => num(json?.data?.cid) === cid)?.json?.data;
  const tracks = (v2?.subtitle?.subtitles || []).map((t) => ({
    lang: t.lan, name: t.lan_doc, kind: t.ai_type || /^ai-/.test(t.lan) ? 'asr' : 'manual', url: https(t.subtitle_url), ipBound: false,
  })).filter((t) => t.url);
  let inline = [];
  if (subtitles && tracks.length) {
    const best = tracks.find((t) => t.kind === 'manual' && /^zh/.test(t.lang)) || tracks.find((t) => /zh/.test(t.lang)) || tracks[0];
    try { inline = parseSubtitle(await getJson(best.url)); best.used = true; } catch (e) { notes.push(`字幕下载失败：${e.message}`); }
  } else if (!v2) notes.push('没有记录到 /x/player/wbi/v2（字幕、看点在这里）：navigate reload 后再 inspect');
  else if (v2.need_login_subtitle) notes.push('这个视频的字幕要登录后才给');

  const chapters = (v2?.view_points || []).map((c) => ({ title: c.content || '', detail: '', startSec: sec(c.from), thumbUrl: https(c.imgUrl) || null }));

  // 雪碧图：/x/player/videoshot 不要签名，页面自己不会主动请求，这里补一次
  let storyboards = [];
  try {
    const shot = (await getJson(`https://api.bilibili.com/x/player/videoshot?bvid=${vd.bvid}&cid=${cid}&index=1`))?.data;
    if (shot?.image?.length) {
      const per = (num(shot.img_x_len) || 10) * (num(shot.img_y_len) || 10);
      const total = Array.isArray(shot.index) ? shot.index.length - 1 : per * shot.image.length;
      storyboards = [{
        urls: shot.image.map(https), cols: num(shot.img_x_len), rows: num(shot.img_y_len),
        frameWidth: num(shot.img_x_size), frameHeight: num(shot.img_y_size),
        intervalSec: total > 0 && durationSec ? sec(durationSec / total) : null,
        totalFrames: total,
        frameTimes: Array.isArray(shot.index) ? shot.index.slice(1, 1001) : undefined,
      }];
    }
  } catch (e) { notes.push(`雪碧图没拿到：${e.message}`); }

  const st = vd.stat || {};
  const tags = uniqTags([...(s.tags || []).map((t) => t.tag_name).filter(Boolean), ...hashtags(vd.desc)]);
  if (!loggedIn()) notes.push('Chrome 没登录 B 站：画质最高 480p，字幕和评论也拿不全。要全的话请用户登录');
  const d = {
    platform: 'bilibili',
    id: vd.bvid,
    url: `https://www.bilibili.com/video/${vd.bvid}${p > 1 ? `?p=${p}` : ''}`,
    pageUrl: location.href,
    type: 'video',
    title: vd.title || '',
    desc: vd.desc || '',
    createTime: num(vd.pubdate),
    durationSec,
    author: {
      id: String(vd.owner?.mid || ''),
      name: vd.owner?.name || '',
      followers: num(s.upData?.fans),
      url: vd.owner?.mid ? `https://space.bilibili.com/${vd.owner.mid}` : '',
    },
    stats: {
      view: num(st.view), like: num(st.like), collect: num(st.favorite), share: num(st.share),
      comment: num(st.reply), coin: num(st.coin), danmaku: num(st.danmaku),
    },
    tags,
    category: [vd.tname_v2 || vd.tname].filter(Boolean),
    searchWords: [],
    music: v2?.bgm_info ? { title: v2.bgm_info.music_title || '', author: '', original: null, url: v2.bgm_info.jump_url || null } : null,
    requestHeaders: { Referer: REFERER, 'User-Agent': navigator.userAgent },
    transcript: { inlineSegments: inline, subtitleTracks: tracks, audioStream: audios[0] || null, audioStreams: audios.slice(0, 4) },
    visual: { coverUrl: https(vd.pic) || null, images: [], chapters, storyboards, videoStreams: sortStreams(streams, 10) },
    intel: {
      cid,
      part: page ? { p, title: page.part || '', count: (vd.pages || []).length } : null,
      honors: (vd.honor_reply?.honor || []).map((h) => h.desc).filter(Boolean),
      onlineNow: v2?.online_count ?? null,
      aigc: v2?.arc_aigc || null,
      season: vd.ugc_season?.title || '',
      copyright: vd.copyright === 1 ? '自制' : vd.copyright === 2 ? '转载' : '',
      argue: vd.argue_info?.argue_msg || '',
      authorLevel: null,
    },
    source: '__INITIAL_STATE__',
    notes,
  };
  d.comments = commentsFrom(net, vd.aid);
  return d;
}

export function commentsFrom(net, aid) {
  const lists = [];
  for (const { url, json } of netJson(net, (u) => /\/x\/v2\/reply(\/wbi)?\/main|\/x\/v2\/reply\?/.test(u))) {
    if (aid && !url.includes(`oid=${aid}`)) continue;
    const d = json?.data || {};
    lists.push([...(d.top_replies || []), ...(d.upper?.top ? [d.upper.top] : []), ...(d.replies || [])].map(parseReply));
  }
  return mergeComments(lists);
}

export function commentMeta(net, aid) {
  const last = netJson(net, '/x/v2/reply').filter(({ url }) => !aid || url.includes(`oid=${aid}`)).pop();
  const c = last?.json?.data?.cursor;
  return c ? { total: num(c.all_count), hasMore: !c.is_end } : null;
}

const loggedIn = () => /(^|;\s*)DedeUserID=/.test(document.cookie);

// /x/v2/reply 不要 wbi 签名，也不依赖评论区进入视口。没登录时 B 站只给几条热评
export async function fetchComments(aid, count) {
  if (!aid) return null;
  const lists = [];
  let total = null;
  let got = 0;
  for (let pn = 1; pn <= 15 && got < count; pn++) {
    const j = await getJson(`https://api.bilibili.com/x/v2/reply?type=1&oid=${aid}&sort=1&ps=20&pn=${pn}`);
    if (j?.code !== 0) throw new Error(j?.message || `code ${j?.code}`);
    total = num(j.data?.page?.count) ?? total;
    const replies = j.data?.replies || [];
    if (!replies.length) break;
    lists.push(replies.map(parseReply));
    got += replies.length;
    if (replies.length < 20) break;
    await sleep(350);
  }
  const comments = mergeComments(lists, count);
  return {
    comments, total,
    hasMore: total === null ? null : comments.length < total,
    note: !loggedIn() && total > comments.length ? `Chrome 没登录 B 站，${total} 条评论只给了 ${comments.length} 条。请用户登录后再取` : '',
  };
}

export async function openComments() {
  const box = document.querySelector('#commentapp') || document.querySelector('bili-comments') || document.querySelector('.comment-container');
  box?.scrollIntoView({ block: 'start' });
  return null;   // B 站评论跟着整页滚
}
