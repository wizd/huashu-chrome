// 列表页（搜索结果、作者主页、推荐流、合集）：从页面状态和网络记录里认出「长得像一条作品」的对象。
// 拿到的是每条的标题、作者、时长、发布时间、互动数——够挑出爆款，再逐条 inspect。
import { num, https, walk, ytText, netJson, clock, first } from './util.js';
import { unref } from './xhs.js';

function douyin(o) {
  if (!o.aweme_id || !(o.statistics || o.stats) || typeof o.desc !== 'string') return null;
  const st = o.statistics || o.stats;
  const dur = num(o.video?.duration ?? o.duration);
  return {
    id: String(o.aweme_id), url: `https://www.douyin.com/video/${o.aweme_id}`,
    title: o.item_title || o.desc.split(/\s#/)[0].slice(0, 120), desc: o.desc,
    author: o.author?.nickname || '', authorId: o.author?.sec_uid || '',
    durationSec: dur ? (dur > 1000 ? Math.round(dur / 100) / 10 : dur) : null,
    createTime: num(o.create_time),
    stats: { view: num(st.play_count) || null, like: num(st.digg_count), comment: num(st.comment_count), collect: num(st.collect_count), share: num(st.share_count) },
    cover: https(first(o.video?.cover?.url_list)) || null,
    type: o.images?.length ? 'images' : 'video',
    pinned: !!o.is_top,
  };
}

function xhs(o) {
  const card = o.note_card || o.noteCard || (o.display_title !== undefined || o.displayTitle !== undefined ? o : null);
  if (!card) return null;
  const id = o.id || o.note_id || o.noteId || card.note_id || card.noteId;
  if (!id || !/^[0-9a-f]{24}$/.test(id)) return null;
  const ii = card.interact_info || card.interactInfo || {};
  const token = o.xsec_token || o.xsecToken || card.xsec_token || card.xsecToken || '';
  return {
    id, url: `https://www.xiaohongshu.com/explore/${id}${token ? `?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_search` : ''}`,
    title: card.display_title || card.displayTitle || card.title || '', desc: '',
    author: card.user?.nickname || card.user?.nick_name || card.user?.nickName || '', authorId: card.user?.user_id || card.user?.userId || '',
    durationSec: null, createTime: null,
    stats: { view: null, like: num(ii.liked_count ?? ii.likedCount), comment: num(ii.comment_count ?? ii.commentCount), collect: num(ii.collected_count ?? ii.collectedCount), share: num(ii.shared_count ?? ii.shareCount) },
    cover: https(card.cover?.url_default || card.cover?.urlDefault || card.cover?.url) || null,
    type: card.type === 'video' ? 'video' : 'images',
  };
}

function bili(o) {
  const bvid = o.bvid;
  if (!bvid || !/^BV/.test(bvid) || !(o.title || o.name)) return null;
  const st = o.stat || {};
  const len = typeof o.length === 'string' ? clock(o.length) : null;
  const dur = num(o.duration) ?? (typeof o.duration === 'string' ? clock(o.duration) : null) ?? len;
  return {
    id: bvid, url: `https://www.bilibili.com/video/${bvid}`,
    title: String(o.title || '').replace(/<[^>]+>/g, ''), desc: o.description || o.desc || '',
    author: o.owner?.name || o.author || '', authorId: String(o.owner?.mid || o.mid || ''),
    durationSec: dur, createTime: num(o.pubdate ?? o.created ?? o.ctime),
    stats: {
      view: num(st.view ?? o.play), like: num(st.like ?? o.like), comment: num(st.reply ?? o.comment ?? o.review),
      collect: num(st.favorite ?? o.favorites), share: num(st.share), danmaku: num(st.danmaku ?? o.video_review ?? o.danmaku),
    },
    cover: https(o.pic || o.cover) || null, type: 'video',
  };
}

function yt(o) {
  const r = o.videoRenderer || o.gridVideoRenderer || o.compactVideoRenderer || o.reelItemRenderer;
  if (r?.videoId) {
    const views = num(String(ytText(r.viewCountText) || ytText(r.shortViewCountText)).replace(/[^\d.,KMB万亿]/g, '').replace(/,/g, ''));
    return {
      id: r.videoId, url: `https://www.youtube.com/watch?v=${r.videoId}`,
      title: ytText(r.title) || ytText(r.headline), desc: ytText(r.descriptionSnippet || first(r.detailedMetadataSnippets)?.snippetText),
      author: ytText(r.ownerText || r.longBylineText || r.shortBylineText), authorId: '',
      durationSec: clock(ytText(r.lengthText)), createTime: null, publishedText: ytText(r.publishedTimeText),
      stats: { view: views, like: null, comment: null, collect: null, share: null },
      cover: `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`, type: o.reelItemRenderer ? 'short' : 'video',
    };
  }
  const l = o.lockupViewModel;
  if (l?.contentId && /VIDEO/.test(l.contentType || '')) {
    const meta = l.metadata?.lockupMetadataViewModel;
    const parts = [];
    walk(meta?.metadata, (x) => { if (typeof x.content === 'string') { parts.push(x.content); return false; } return true; }, 10);
    const viewPart = parts.find((p) => /view|观看|次/.test(p)) || '';
    let dur = null;
    walk(l.contentImage, (x) => { if (typeof x.text === 'string' && /^\d+(:\d{2})+$/.test(x.text)) { dur = clock(x.text); return false; } return true; }, 12);
    return {
      id: l.contentId, url: `https://www.youtube.com/watch?v=${l.contentId}`,
      title: meta?.title?.content || '', desc: '', author: parts[0] || '', authorId: '',
      durationSec: dur, createTime: null, publishedText: parts.find((p) => /ago|前/.test(p)) || '',
      stats: { view: num(viewPart.replace(/[^\d.,KMB万亿]/g, '').replace(/,/g, '')), like: null, comment: null, collect: null, share: null },
      cover: `https://i.ytimg.com/vi/${l.contentId}/hqdefault.jpg`, type: 'video',
    };
  }
  return null;
}

const PARSERS = { douyin, xiaohongshu: xhs, bilibili: bili, youtube: yt };

export function collect(platform, roots, limit = 100) {
  const parse = PARSERS[platform];
  const map = new Map();
  for (const root of roots) {
    walk(root, (o) => {
      const item = parse(o);
      if (item) {
        const old = map.get(item.id);
        // 同一条在多处出现：留字段更全的那份
        if (!old || Object.values(item.stats).filter((x) => x != null).length > Object.values(old.stats).filter((x) => x != null).length) map.set(item.id, { platform, ...item });
        return false;
      }
      return true;
    }, 14);
  }
  return [...map.values()].slice(0, limit);
}

// 页面侧：从状态树 + 网络记录里收
export function listPage(platform, net, limit) {
  const roots = [];
  if (platform === 'douyin') {
    const el = document.getElementById('RENDER_DATA');
    if (el) { try { roots.push(JSON.parse(decodeURIComponent(el.textContent))); } catch { /* 有的页面没有 */ } }
    for (const { json } of netJson(net, (u) => /\/aweme\/v1\/web\/(aweme\/post|general\/search|search\/item|tab\/feed|module\/feed|mix\/aweme|aweme\/favorite|hot\/search|channel\/feed)/.test(u))) roots.push(json);
  } else if (platform === 'xiaohongshu') {
    const s = window.__INITIAL_STATE__;
    if (s) {
      roots.push(unref(unref(s.search)?.feeds), unref(unref(s.user)?.notes), unref(unref(s.feed)?.feeds));
    }
    for (const { json } of netJson(net, (u) => /\/api\/sns\/web\/v\d\/(search\/notes|user_posted|homefeed)/.test(u))) roots.push(json);
  } else if (platform === 'bilibili') {
    const s = window.__INITIAL_STATE__;
    if (s) roots.push(s.related, s.recommendList, s.flow, s.allData, s.searchResult);
    // 搜索页是服务端渲染进 pinia 的，首屏不发接口
    const pinia = window.__pinia;
    if (pinia) roots.push(pinia.state?.value || pinia);
    for (const { json } of netJson(net, (u) => /\/x\/(web-interface\/(wbi\/)?search|space\/wbi\/arc\/search|web-interface\/(wbi\/)?index\/top|web-interface\/ranking|web-interface\/popular|polymer\/web-space|series\/archives)/.test(u))) roots.push(json);
  } else if (platform === 'youtube') {
    roots.push(window.ytInitialData);
    for (const { json } of netJson(net, (u) => /\/youtubei\/v1\/(browse|search|next)/.test(u))) roots.push(json);
  }
  return collect(platform, roots.filter(Boolean), limit);
}
