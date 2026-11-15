// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/media/
// media 能力包没有上游代码，不需要补全局变量。build-loads.mjs 要求每个包都有这个文件。

(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // <define:__LOAD_ACTIONS__>
  var define_LOAD_ACTIONS_default = ["media.inspect", "media.comments", "media.list", "media.capture_frames"];

  // loads/media/lib/util.js
  function num(v) {
    if (v === null || v === void 0 || v === "") return null;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const s = String(v).replace(/[,\s]/g, "").trim();
    const m = /^(-?\d+(?:\.\d+)?)(万|w|W|亿|k|K|m|M|b|B)?\+?$/.exec(s);
    if (!m) return null;
    const mult = { \u4E07: 1e4, w: 1e4, W: 1e4, \u4EBF: 1e8, k: 1e3, K: 1e3, m: 1e6, M: 1e6, b: 1e9, B: 1e9 }[m[2]] || 1;
    return mult === 1 ? parseFloat(m[1]) : Math.round(parseFloat(m[1]) * mult);
  }
  function pick(o, ...keys) {
    if (!o || typeof o !== "object") return void 0;
    for (const k of keys) if (o[k] !== void 0 && o[k] !== null) return o[k];
    return void 0;
  }
  var first = (a) => Array.isArray(a) && a.length ? a[0] : void 0;
  function https(u) {
    if (typeof u !== "string" || !u) return null;
    if (u.startsWith("//")) return `https:${u}`;
    return u;
  }
  var sec = (x) => Number.isFinite(+x) ? Math.round(+x * 100) / 100 : null;
  function clock(s) {
    const parts = String(s).split(":").map(Number);
    if (!parts.length || parts.some((n) => !Number.isFinite(n))) return null;
    return parts.reduce((a, n) => a * 60 + n, 0);
  }
  function chaptersFromText(text) {
    const out = [];
    for (const line of String(text || "").split(/\n/)) {
      const m = /^\s*[[(（【]?((?:\d{1,2}:)?\d{1,2}:\d{2})[\])）】]?\s*[-–—:：|]?\s*(.+?)\s*$/.exec(line);
      if (!m) continue;
      const t = clock(m[1]);
      if (t !== null && m[2]) out.push({ title: m[2].slice(0, 120), detail: "", startSec: t, thumbUrl: null });
    }
    if (out.length < 2 || out[0].startSec > 10) return [];
    for (let i = 1; i < out.length; i++) if (out[i].startSec <= out[i - 1].startSec) return [];
    return out;
  }
  function hashtags(text) {
    const tags = /* @__PURE__ */ new Set();
    for (const m of String(text || "").matchAll(/#([^\s#[\]【】,，。!！?？@]{1,40})/g)) tags.add(m[1]);
    return [...tags];
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  function err(code, message) {
    return Object.assign(new Error(message), { code });
  }
  function uniqTags(list2) {
    const seen = /* @__PURE__ */ new Set();
    return list2.filter((t) => {
      const k = String(t || "").trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }
  function sortStreams(list2, max = 12) {
    const seen = /* @__PURE__ */ new Set();
    return list2.filter((s) => s && (s.url || s.ipBound) && !seen.has(s.url || `${s.quality}|${s.codec}|${s.format}`) && seen.add(s.url || `${s.quality}|${s.codec}|${s.format}`)).sort((a, b) => Math.min(b.height || 0, b.width || 0) - Math.min(a.height || 0, a.width || 0) || (a.sizeBytes || 9e15) - (b.sizeBytes || 9e15)).slice(0, max);
  }
  function mergeComments(lists, limit = 200) {
    const map = /* @__PURE__ */ new Map();
    for (const list2 of lists) {
      for (const c of list2 || []) {
        if (!c || !c.text) continue;
        const key = c.id || `${c.user}|${c.text}`;
        const old = map.get(key);
        if (!old || (c.likes ?? -1) > (old.likes ?? -1)) map.set(key, { ...old, ...c });
      }
    }
    return [...map.values()].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, limit);
  }
  function netJson(entries, test) {
    const out = [];
    for (const r of (typeof entries === "function" ? entries() : entries) || []) {
      const url = String(r?.url || "");
      if (!(typeof test === "function" ? test(url) : url.includes(test))) continue;
      if (!r.body) continue;
      try {
        out.push({ url, t: r.t, json: JSON.parse(r.body) });
      } catch {
      }
    }
    return out;
  }
  function walk(root, visit, maxDepth = 9) {
    const seen = /* @__PURE__ */ new Set();
    const go = (v, d) => {
      if (!v || typeof v !== "object" || d > maxDepth || seen.has(v)) return;
      seen.add(v);
      if (visit(v) === false) return;
      if (Array.isArray(v)) {
        for (const x of v) go(x, d + 1);
        return;
      }
      for (const k of Object.keys(v)) go(v[k], d + 1);
    };
    go(root, 0);
  }
  function ytText(t) {
    if (!t) return "";
    if (typeof t === "string") return t;
    if (t.simpleText) return t.simpleText;
    if (Array.isArray(t.runs)) return t.runs.map((r) => r.text || "").join("");
    if (typeof t.content === "string") return t.content;
    return "";
  }

  // loads/media/lib/douyin.js
  var douyin_exports = {};
  __export(douyin_exports, {
    REFERER: () => REFERER,
    commentMeta: () => commentMeta,
    commentsFrom: () => commentsFrom,
    findAweme: () => findAweme,
    inspect: () => inspect,
    openComments: () => openComments,
    parseAweme: () => parseAweme,
    parseComments: () => parseComments,
    targetId: () => targetId
  });
  var REFERER = "https://www.douyin.com/";
  function targetId(href) {
    try {
      const u = new URL(href);
      return u.searchParams.get("modal_id") || u.searchParams.get("vid") || (/\/(?:video|note|share\/video)\/(\d{8,})/.exec(u.pathname) || [])[1] || "";
    } catch {
      return "";
    }
  }
  var arr = (x) => Array.isArray(x) ? x : [];
  var srcOf = (addr) => {
    if (Array.isArray(addr)) return https(first(addr)?.src || first(addr));
    if (addr && Array.isArray(addr.url_list)) return https(first(addr.url_list));
    return null;
  };
  var urlList = (o) => {
    if (!o) return [];
    if (Array.isArray(o)) return o.map((x) => https(x?.src || x)).filter(Boolean);
    const l = pick(o, "urlList", "url_list");
    return Array.isArray(l) ? l.map((x) => https(x?.src || x)).filter(Boolean) : [];
  };
  function pickStreams(streams) {
    const seen = /* @__PURE__ */ new Set();
    const rank = (s) => s.format === "mp4" && s.codec === "h264" ? 0 : s.format === "mp4" ? 1 : 2;
    const side = (s) => Math.min(s.width || 0, s.height || 0);
    return sortStreams(streams, 64).filter((s) => {
      const k = `${side(s)}|${s.codec}|${s.format}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => side(b) - side(a) || rank(a) - rank(b)).slice(0, 8);
  }
  function parseAweme(vd, { href = "", ua = "" } = {}) {
    if (!vd) return null;
    const id = String(pick(vd, "awemeId", "aweme_id") || "");
    const video = vd.video || {};
    const stats = pick(vd, "stats", "statistics") || {};
    const author = pick(vd, "authorInfo", "author") || {};
    const durMs = num(pick(video, "duration")) || num(vd.duration) || 0;
    const durationSec = sec(durMs > 1e3 ? durMs / 1e3 : durMs);
    const streams = [];
    for (const b of arr(pick(video, "bitRateList", "bit_rate"))) {
      const fmt = pick(b, "format") || "mp4";
      const w = num(pick(b, "width")) || num(pick(b.play_addr || {}, "width"));
      const h = num(pick(b, "height")) || num(pick(b.play_addr || {}, "height"));
      streams.push({
        quality: h && w ? `${Math.min(w, h)}p` : "",
        gearName: pick(b, "gearName", "gear_name") || "",
        format: fmt,
        codec: num(pick(b, "isH265", "is_h265")) ? "h265" : "h264",
        hasAudio: fmt !== "dash",
        width: w,
        height: h,
        fps: num(b.fps),
        bitrate: num(pick(b, "bitRate", "bit_rate")),
        sizeBytes: num(pick(b, "dataSize")) || num(pick(b.play_addr || {}, "data_size")),
        url: srcOf(pick(b, "playAddr", "play_addr")),
        ipBound: false
      });
    }
    if (!streams.length) {
      const url = srcOf(pick(video, "playAddr", "play_addr"));
      if (url) streams.push({ quality: "", format: "mp4", codec: "h264", hasAudio: true, width: num(video.width), height: num(video.height), url, ipBound: false });
    }
    const audios = [];
    for (const a of arr(pick(video, "bitRateAudioList", "bit_rate_audio"))) {
      const meta2 = a.audio_meta || a;
      const ul = meta2.url_list;
      const url = first(urlList(a.urlList)) || https(ul?.main_url) || https(ul?.backup_url) || first(urlList(ul));
      if (!url) continue;
      audios.push({
        url,
        sizeBytes: num(pick(meta2, "size")),
        bitrate: num(pick(meta2, "bitrate", "bit_rate")),
        codec: "mp4a",
        ipBound: false
      });
    }
    audios.sort((a, b) => (a.sizeBytes || 9e15) - (b.sizeBytes || 9e15));
    const chapterInfo = pick(vd, "chapterInfo", "chapter_info") || {};
    const chapters = arr(pick(chapterInfo, "list", "chapter_list")).map((c) => ({
      title: c.desc || "",
      detail: c.detail || "",
      startSec: sec((num(c.timestamp) || 0) / 1e3),
      thumbUrl: https(c.url) || null
    }));
    const storyboards = arr(pick(video, "bigThumbs", "big_thumbs")).map((t) => {
      const cols = num(t.img_x_len) || 5;
      const rows = num(t.img_y_len) || 5;
      return {
        urls: (t.img_urls || [t.img_url]).map(https).filter(Boolean),
        cols,
        rows,
        frameWidth: num(t.img_x_size),
        frameHeight: num(t.img_y_size),
        intervalSec: num(t.interval),
        totalFrames: num(t.img_num)
      };
    }).filter((s) => s.urls.length);
    const images = arr(vd.images).map((im) => first(urlList(im))).filter(Boolean);
    const desc = vd.desc || "";
    const textExtra = arr(pick(vd, "textExtra", "text_extra"));
    const tags = uniqTags([
      ...textExtra.map((t) => pick(t, "hashtagName", "hashtag_name")).filter(Boolean),
      ...hashtags(desc)
    ]);
    const category = arr(pick(vd, "videoTag", "video_tag")).map((t) => pick(t, "tagName", "tag_name")).filter(Boolean);
    const searchWords = [];
    const suggest = pick(vd, "suggestWords", "suggest_words");
    for (const s of arr(suggest?.suggest_words ?? suggest?.suggestWords ?? suggest)) {
      for (const w of arr(s.words)) if (w.word) searchWords.push(w.word);
    }
    const music = vd.music ? {
      title: pick(vd.music, "title") || "",
      author: pick(vd.music, "author", "ownerNickname", "owner_nickname") || "",
      original: pick(vd.music, "isOriginal", "is_original") ?? null,
      durationSec: num(vd.music.duration),
      url: first(urlList(pick(vd.music, "playUrl", "play_url"))) || null
    } : null;
    const cover = first(urlList(pick(video, "originCoverUrlList"))) || first(urlList(pick(video, "coverUrlList"))) || first(urlList(pick(video, "origin_cover", "cover"))) || https(typeof video.cover === "string" ? video.cover : null);
    const meta = video.meta || {};
    const authorId = String(pick(author, "uid") || "");
    const secId = pick(author, "secUid", "sec_uid") || "";
    return {
      platform: "douyin",
      id,
      url: id ? `https://www.douyin.com/video/${id}` : href,
      pageUrl: href,
      type: images.length && !streams.length ? "images" : "video",
      title: pick(vd, "itemTitle", "item_title") || desc.split(/\s#/)[0].slice(0, 120),
      desc,
      createTime: num(pick(vd, "createTime", "create_time")),
      durationSec,
      author: {
        id: authorId,
        secId,
        name: pick(author, "nickname") || "",
        followers: num(pick(author, "followerCount", "follower_count")),
        totalLikes: num(pick(author, "totalFavorited", "total_favorited")),
        verified: pick(author, "enterpriseVerifyReason", "enterprise_verify_reason", "customVerify", "custom_verify") || "",
        url: secId ? `https://www.douyin.com/user/${secId}` : ""
      },
      stats: {
        // 抖音网页版不给播放量（playCount 恒为 0），不要拿 0 当真
        view: num(pick(stats, "playCount", "play_count")) || null,
        like: num(pick(stats, "diggCount", "digg_count")),
        collect: num(pick(stats, "collectCount", "collect_count")),
        share: num(pick(stats, "shareCount", "share_count")),
        comment: num(pick(stats, "commentCount", "comment_count")),
        recommend: num(pick(stats, "recommendCount", "recommend_count"))
      },
      tags,
      category,
      searchWords,
      music,
      requestHeaders: { Referer: REFERER, "User-Agent": ua },
      transcript: { inlineSegments: [], subtitleTracks: [], audioStream: audios[0] || null, audioStreams: audios.slice(0, 4) },
      visual: { coverUrl: cover || null, images, chapters, storyboards, videoStreams: pickStreams(streams) },
      intel: {
        chapterAbstract: pick(chapterInfo, "chapterAbstract", "chapter_abstract") || "",
        loudnessLufs: num(meta.loudness),
        brightnessMean: num(meta.brightness_mean),
        vqs: num(meta.vqs_origin),
        ocrContent: pick(vd.seoInfo || {}, "ocrContent") || "",
        mix: pick(vd.mixInfo || {}, "mixName") || pick(vd.mix_info || {}, "mix_name") || "",
        poi: pick(vd.poiInfo || {}, "poiName") || pick(vd.poi_info || {}, "poi_name") || "",
        isAds: !!pick(vd, "isAds", "is_ads")
      }
    };
  }
  function parseComments(json) {
    return (json?.comments || []).map((c) => ({
      id: String(c.cid || ""),
      user: c.user?.nickname || "",
      userId: c.user?.uid || "",
      text: c.text || "",
      likes: num(c.digg_count) ?? 0,
      repliesCount: num(c.reply_comment_total) ?? 0,
      location: c.ip_label || "",
      createTime: num(c.create_time),
      authorLiked: !!c.is_author_digged,
      pinned: !!c.stick_position,
      label: c.label_text || ""
    }));
  }
  function renderData() {
    const el = document.getElementById("RENDER_DATA");
    if (!el) return null;
    const raw = el.textContent || "";
    try {
      return JSON.parse(raw.trim().startsWith("{") ? raw : decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
  function findAweme(net2) {
    const want = targetId(location.href);
    const rd = renderData();
    const ssr = rd?.app?.videoDetail;
    if (ssr && (!want || String(ssr.awemeId) === want)) return { vd: ssr, from: "RENDER_DATA" };
    let found = null;
    for (const { json } of netJson(net2, (u) => /\/aweme\/v1\/web\//.test(u)).reverse()) {
      if (json?.aweme_detail && (!want || json.aweme_detail.aweme_id === want)) return { vd: json.aweme_detail, from: "aweme/detail" };
      walk(json, (o) => {
        if (found) return false;
        if (o.aweme_id && o.video && (!want || String(o.aweme_id) === want)) {
          found = o;
          return false;
        }
        return true;
      }, 6);
      if (found) return { vd: found, from: "aweme_list" };
    }
    if (ssr && !want) return { vd: ssr, from: "RENDER_DATA" };
    throw err("NOT_FOUND", want ? `\u9875\u9762\u6570\u636E\u91CC\u6CA1\u6709\u4F5C\u54C1 ${want}\uFF08\u7AD9\u5185\u5207\u6362\u8FC7\u6765\u7684\uFF09\u3002navigate \u5230 https://www.douyin.com/video/${want} \u518D inspect` : "\u8FD9\u4E0D\u662F\u4E00\u4E2A\u6296\u97F3\u4F5C\u54C1\u9875\u3002\u6253\u5F00\u4F5C\u54C1\u9875\uFF08/video/<id> \u6216\u5E26 modal_id\uFF09\u518D inspect");
  }
  function inspect(net2) {
    const { vd, from } = findAweme(net2);
    const d = parseAweme(vd, { href: location.href, ua: navigator.userAgent });
    d.source = from;
    d.comments = commentsFrom(net2, d.id);
    return d;
  }
  function commentsFrom(net2, id) {
    const lists = netJson(net2, "/comment/list/").filter(({ url }) => !id || url.includes(`aweme_id=${id}`)).map(({ json }) => parseComments(json));
    return mergeComments(lists);
  }
  function commentMeta(net2, id) {
    const last = netJson(net2, "/comment/list/").filter(({ url }) => !id || url.includes(`aweme_id=${id}`)).pop();
    return last ? { total: num(last.json.total), hasMore: !!last.json.has_more } : null;
  }
  async function openComments(net2, id, wait) {
    if (!netJson(net2(), "/comment/list/").some(({ url }) => !id || url.includes(`aweme_id=${id}`))) {
      const btn = [...document.querySelectorAll('[data-e2e="feed-comment-icon"]')].find((b) => b.getBoundingClientRect().height > 0) || document.querySelector('[data-e2e="feed-comment-icon"]');
      btn?.click();
      await wait(() => netJson(net2(), "/comment/list/").length > 0, 6e3);
    }
    return document.querySelector('[data-e2e="comment-list"]') || document.querySelector('[data-e2e="comment-item"]');
  }

  // loads/media/lib/xhs.js
  var xhs_exports = {};
  __export(xhs_exports, {
    REFERER: () => REFERER2,
    commentMeta: () => commentMeta2,
    commentsFrom: () => commentsFrom2,
    inspect: () => inspect2,
    openComments: () => openComments2,
    parseComment: () => parseComment,
    parseNote: () => parseNote,
    targetId: () => targetId2,
    unref: () => unref
  });
  var REFERER2 = "https://www.xiaohongshu.com/";
  function targetId2(href) {
    try {
      return (/\/(?:explore|discovery\/item|search_result)\/([0-9a-f]{24})/.exec(new URL(href).pathname) || [])[1] || "";
    } catch {
      return "";
    }
  }
  function unref(v) {
    for (let i = 0; i < 3 && v && typeof v === "object"; i++) {
      if ("_rawValue" in v) v = v._rawValue;
      else if ("_value" in v && v.__v_isRef) v = v._value;
      else break;
    }
    return v;
  }
  var picUrl = (im) => https(im?.urlDefault || im?.url_default || im?.url || first(im?.infoList || im?.info_list)?.url) || null;
  function parseNote(entry, { href = "", ua = "" } = {}) {
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
        quality: s.height && s.width ? `${Math.min(s.width, s.height)}p` : s.qualityType || "",
        gearName: String(s.streamType ?? s.stream_type ?? ""),
        format: s.format || "mp4",
        codec: /265|hev|EF[57]/i.test(String(s.videoCodec || "")) ? "h265?" : String(s.videoCodec || ""),
        hasAudio: (num(s.audioBitrate ?? s.audio_bitrate) ?? 1) > 0,
        width: num(s.width),
        height: num(s.height),
        fps: num(s.fps),
        bitrate: num(s.avgBitrate ?? s.avg_bitrate ?? s.videoBitrate),
        sizeBytes: num(s.size),
        url: https(s.masterUrl || s.master_url),
        backupUrls: (s.backupUrls || s.backup_urls || []).map(https).slice(0, 2),
        ipBound: false
      });
    }
    const rawStream = first(Object.values(media.stream || {}).flat().filter(Boolean));
    const durationSec = sec(num(n.video?.capa?.duration) || num(media.video?.duration) || (num(rawStream?.duration) || 0) / 1e3);
    const images = (n.imageList || n.image_list || []).map(picUrl).filter(Boolean);
    const tags = [.../* @__PURE__ */ new Set([...(n.tagList || n.tag_list || []).map((t) => t.name).filter(Boolean), ...hashtags((n.desc || "").replace(/\[话题\]#/g, " "))])];
    const time = num(n.time);
    return {
      platform: "xiaohongshu",
      id,
      url: `https://www.xiaohongshu.com/explore/${id}${n.xsecToken ? `?xsec_token=${encodeURIComponent(n.xsecToken)}&xsec_source=pc_feed` : ""}`,
      pageUrl: href,
      type: n.type === "video" ? "video" : "images",
      title: n.title || n.display_title || "",
      desc: (n.desc || "").replace(/\[话题\]#/g, "#"),
      createTime: time ? Math.round(time > 1e12 ? time / 1e3 : time) : null,
      durationSec: n.type === "video" ? durationSec : null,
      author: {
        id: user.userId || user.user_id || "",
        name: user.nickname || user.nickName || "",
        followers: null,
        url: user.userId ? `https://www.xiaohongshu.com/user/profile/${user.userId}` : ""
      },
      stats: {
        view: null,
        like: num(ii.likedCount ?? ii.liked_count),
        collect: num(ii.collectedCount ?? ii.collected_count),
        share: num(ii.shareCount ?? ii.share_count),
        comment: num(ii.commentCount ?? ii.comment_count)
      },
      tags,
      category: [],
      searchWords: [],
      music: null,
      requestHeaders: { Referer: REFERER2, "User-Agent": ua },
      transcript: { inlineSegments: [], subtitleTracks: [], audioStream: null, audioStreams: [] },
      visual: { coverUrl: images[0] || picUrl(n.video?.image) || null, images, chapters: [], storyboards: [], videoStreams: sortStreams(streams) },
      intel: {
        ipLocation: n.ipLocation || n.ip_location || "",
        statement: typeof n.noteStatement === "string" ? n.noteStatement : n.noteStatement?.desc || n.noteStatement?.text || "",
        atUsers: (n.atUserList || []).map((u) => u.nickname).filter(Boolean),
        lastUpdateTime: num(n.lastUpdateTime) ? Math.round(num(n.lastUpdateTime) / 1e3) : null,
        imageCount: images.length
      }
    };
  }
  function parseComment(c) {
    const out = {
      id: c.id || "",
      user: c.userInfo?.nickname || c.user_info?.nickname || "",
      userId: c.userInfo?.userId || c.user_info?.user_id || "",
      text: c.content || "",
      likes: num(c.likeCount ?? c.like_count) ?? 0,
      repliesCount: num(c.subCommentCount ?? c.sub_comment_count) ?? 0,
      location: c.ipLocation || c.ip_location || "",
      createTime: num(c.createTime ?? c.create_time) ? Math.round(num(c.createTime ?? c.create_time) / 1e3) : null,
      label: (c.showTags || c.show_tags || []).join(",")
    };
    const subs = (c.subComments || c.sub_comments || []).map((s) => ({
      user: s.userInfo?.nickname || s.user_info?.nickname || "",
      text: s.content || "",
      likes: num(s.likeCount ?? s.like_count) ?? 0,
      byAuthor: (s.showTags || s.show_tags || []).includes("is_author")
    }));
    if (subs.length) out.replies = subs;
    if (subs.some((s) => s.byAuthor)) out.authorReplied = true;
    return out;
  }
  function detailMap() {
    const s = window.__INITIAL_STATE__;
    return unref(unref(s?.note)?.noteDetailMap) || {};
  }
  function inspect2(net2) {
    const want = targetId2(location.href);
    const map = detailMap();
    let entry = want ? unref(map[want]) : unref(Object.values(map).find((e) => unref(e)?.note?.noteId));
    let from = "noteDetailMap";
    if (!entry?.note?.noteId) {
      for (const { json } of netJson(net2, "/api/sns/web/v1/feed").reverse()) {
        const item = (json?.data?.items || []).find((i) => !want || i.id === want);
        if (item?.note_card) {
          entry = { note: { ...item.note_card, noteId: item.id } };
          from = "feed";
          break;
        }
      }
    }
    if (!entry) throw err("NOT_FOUND", want ? `\u9875\u9762\u91CC\u6CA1\u6709\u7B14\u8BB0 ${want} \u7684\u6570\u636E\uFF0C\u5237\u65B0\uFF08navigate reload\uFF09\u540E\u518D inspect` : "\u8FD9\u4E0D\u662F\u4E00\u7BC7\u5C0F\u7EA2\u4E66\u7B14\u8BB0\u9875\uFF0C\u6253\u5F00 /explore/<id> \u518D inspect");
    const d = parseNote(entry, { href: location.href, ua: navigator.userAgent });
    if (!d.visual.videoStreams.length) {
      const v = [...document.querySelectorAll("video")].map((x) => x.currentSrc).find((u) => /^https?:/.test(u || ""));
      if (v && d.type === "video") d.visual.videoStreams.push({ quality: "", format: "mp4", hasAudio: true, url: v, ipBound: false });
    }
    d.source = from;
    d.comments = commentsFrom2(net2, d.id);
    return d;
  }
  function commentsFrom2(net2, id) {
    const map = detailMap();
    const mem = unref(unref(map[id])?.comments)?.list || [];
    const lists = [mem.map(parseComment)];
    for (const { url, json } of netJson(net2, "/api/sns/web/v2/comment/page")) {
      if (id && !url.includes(id)) continue;
      lists.push((json?.data?.comments || []).map(parseComment));
    }
    return mergeComments(lists);
  }
  function commentMeta2(net2, id) {
    const last = netJson(net2, "/api/sns/web/v2/comment/page").filter(({ url }) => !id || url.includes(id)).pop();
    const mem = unref(unref(detailMap()[id])?.comments);
    return { total: null, hasMore: last ? !!last.json?.data?.has_more : !!mem?.hasMore };
  }
  async function openComments2() {
    return document.querySelector(".note-scroller") || document.querySelector(".comments-container") || document.querySelector(".comment-item");
  }

  // loads/media/lib/bilibili.js
  var bilibili_exports = {};
  __export(bilibili_exports, {
    REFERER: () => REFERER3,
    commentMeta: () => commentMeta3,
    commentsFrom: () => commentsFrom3,
    fetchComments: () => fetchComments,
    inspect: () => inspect3,
    openComments: () => openComments3,
    parsePlayurl: () => parsePlayurl,
    parseReply: () => parseReply,
    parseSubtitle: () => parseSubtitle,
    targetId: () => targetId3
  });
  var REFERER3 = "https://www.bilibili.com/";
  function targetId3(href) {
    try {
      return (/\/video\/(BV[0-9A-Za-z]{10}|av\d+)/.exec(new URL(href).pathname) || [])[1] || "";
    } catch {
      return "";
    }
  }
  var QN = { 6: "240p", 16: "360p", 32: "480p", 64: "720p", 74: "720p60", 80: "1080p", 112: "1080p+", 116: "1080p60", 120: "4K", 125: "HDR", 126: "Dolby Vision", 127: "8K" };
  var codecOf = (c = "") => /^avc/.test(c) ? "h264" : /^(hev|hvc)/.test(c) ? "h265" : /^av01/.test(c) ? "av1" : c;
  function parsePlayurl(data, durationSec) {
    const streams = [];
    const audios = [];
    const dash = data?.dash;
    if (dash) {
      for (const v of dash.video || []) {
        const bw = num(v.bandwidth);
        streams.push({
          quality: QN[v.id] || `${Math.min(v.width, v.height)}p`,
          gearName: String(v.id),
          format: "dash",
          codec: codecOf(v.codecs),
          hasAudio: false,
          width: num(v.width),
          height: num(v.height),
          fps: num(v.frameRate || v.frame_rate),
          bitrate: bw,
          sizeBytes: bw && durationSec ? Math.round(bw / 8 * durationSec) : null,
          url: https(v.baseUrl || v.base_url),
          backupUrls: (v.backupUrl || v.backup_url || []).map(https).slice(0, 2),
          ipBound: false
        });
      }
      for (const a of [...dash.audio || [], ...dash.dolby?.audio || [], ...dash.flac?.audio ? [dash.flac.audio] : []]) {
        const bw = num(a.bandwidth);
        audios.push({
          url: https(a.baseUrl || a.base_url),
          backupUrls: (a.backupUrl || a.backup_url || []).map(https).slice(0, 2),
          sizeBytes: bw && durationSec ? Math.round(bw / 8 * durationSec) : null,
          bitrate: bw,
          codec: a.codecs || "mp4a",
          ipBound: false
        });
      }
    }
    for (const d of data?.durl || []) {
      streams.push({ quality: QN[data.quality] || "", format: "mp4", codec: "h264", hasAudio: true, sizeBytes: num(d.size), url: https(d.url), ipBound: false });
    }
    audios.sort((a, b) => (a.bitrate || 9e15) - (b.bitrate || 9e15));
    return { streams, audios };
  }
  function parseSubtitle(body) {
    return (body?.body || []).map((s) => ({ start: sec(s.from), end: sec(s.to), text: s.content || "" })).filter((s) => s.text);
  }
  function parseReply(r) {
    return {
      id: String(r.rpid_str || r.rpid || ""),
      user: r.member?.uname || "",
      userId: String(r.member?.mid || r.mid || ""),
      text: r.content?.message || "",
      likes: num(r.like) ?? 0,
      repliesCount: num(r.rcount) ?? 0,
      location: String(r.reply_control?.location || "").replace(/^IP属地：/, ""),
      createTime: num(r.ctime),
      authorLiked: !!r.up_action?.like,
      authorReplied: !!r.up_action?.reply,
      replies: (r.replies || []).slice(0, 3).map((s) => ({ user: s.member?.uname || "", text: s.content?.message || "", likes: num(s.like) ?? 0 }))
    };
  }
  async function getJson(url) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  async function inspect3(net2, { subtitles = true } = {}) {
    const s = window.__INITIAL_STATE__ || {};
    const vd = s.videoData;
    const want = targetId3(location.href);
    if (!vd || want && want !== vd.bvid && want !== `av${vd.aid}`) {
      throw err("NOT_FOUND", want ? `\u9875\u9762\u6570\u636E\u8FD8\u4E0D\u662F ${want}\uFF0Cnavigate reload \u540E\u518D inspect` : "\u8FD9\u4E0D\u662F B \u7AD9\u89C6\u9891\u9875\uFF0C\u6253\u5F00 /video/BV\u2026 \u518D inspect");
    }
    const p = Math.max(1, num(new URL(location.href).searchParams.get("p")) || 1);
    const page = (vd.pages || [])[p - 1];
    const cid = num(page?.cid) || num(s.cid) || num(vd.cid);
    const durationSec = sec(num(page?.duration) || num(vd.duration));
    const notes = [];
    let play = window.__playinfo__?.data;
    const playCid = (d2) => num(String(d2?.dash?.video?.[0]?.baseUrl || d2?.durl?.[0]?.url || "").match(/\/(\d{6,})-\d+-/)?.[1]);
    if (play && playCid(play) && playCid(play) !== cid) play = null;
    if (!play) {
      const hit = netJson(net2, "/x/player/wbi/playurl").reverse().find(({ url }) => url.includes(`cid=${cid}`));
      play = hit?.json?.data || null;
    }
    const { streams, audios } = parsePlayurl(play, durationSec);
    if (!streams.length) notes.push("\u9875\u9762\u91CC\u6CA1\u627E\u5230\u8FD9\u4E2A\u5206 P \u7684\u64AD\u653E\u5730\u5740\uFF1A\u5237\u65B0\u540E\u518D inspect");
    const v2 = netJson(net2, "/x/player/wbi/v2").reverse().find(({ json }) => num(json?.data?.cid) === cid)?.json?.data || netJson(net2, "/x/player/v2").reverse().find(({ json }) => num(json?.data?.cid) === cid)?.json?.data;
    const tracks = (v2?.subtitle?.subtitles || []).map((t) => ({
      lang: t.lan,
      name: t.lan_doc,
      kind: t.ai_type || /^ai-/.test(t.lan) ? "asr" : "manual",
      url: https(t.subtitle_url),
      ipBound: false
    })).filter((t) => t.url);
    let inline = [];
    if (subtitles && tracks.length) {
      const best = tracks.find((t) => t.kind === "manual" && /^zh/.test(t.lang)) || tracks.find((t) => /zh/.test(t.lang)) || tracks[0];
      try {
        inline = parseSubtitle(await getJson(best.url));
        best.used = true;
      } catch (e) {
        notes.push(`\u5B57\u5E55\u4E0B\u8F7D\u5931\u8D25\uFF1A${e.message}`);
      }
    } else if (!v2) notes.push("\u6CA1\u6709\u8BB0\u5F55\u5230 /x/player/wbi/v2\uFF08\u5B57\u5E55\u3001\u770B\u70B9\u5728\u8FD9\u91CC\uFF09\uFF1Anavigate reload \u540E\u518D inspect");
    else if (v2.need_login_subtitle) notes.push("\u8FD9\u4E2A\u89C6\u9891\u7684\u5B57\u5E55\u8981\u767B\u5F55\u540E\u624D\u7ED9");
    const chapters = (v2?.view_points || []).map((c) => ({ title: c.content || "", detail: "", startSec: sec(c.from), thumbUrl: https(c.imgUrl) || null }));
    let storyboards = [];
    try {
      const shot = (await getJson(`https://api.bilibili.com/x/player/videoshot?bvid=${vd.bvid}&cid=${cid}&index=1`))?.data;
      if (shot?.image?.length) {
        const per = (num(shot.img_x_len) || 10) * (num(shot.img_y_len) || 10);
        const total = Array.isArray(shot.index) ? shot.index.length - 1 : per * shot.image.length;
        storyboards = [{
          urls: shot.image.map(https),
          cols: num(shot.img_x_len),
          rows: num(shot.img_y_len),
          frameWidth: num(shot.img_x_size),
          frameHeight: num(shot.img_y_size),
          intervalSec: total > 0 && durationSec ? sec(durationSec / total) : null,
          totalFrames: total,
          frameTimes: Array.isArray(shot.index) ? shot.index.slice(1, 1001) : void 0
        }];
      }
    } catch (e) {
      notes.push(`\u96EA\u78A7\u56FE\u6CA1\u62FF\u5230\uFF1A${e.message}`);
    }
    const st = vd.stat || {};
    const tags = uniqTags([...(s.tags || []).map((t) => t.tag_name).filter(Boolean), ...hashtags(vd.desc)]);
    if (!loggedIn()) notes.push("Chrome \u6CA1\u767B\u5F55 B \u7AD9\uFF1A\u753B\u8D28\u6700\u9AD8 480p\uFF0C\u5B57\u5E55\u548C\u8BC4\u8BBA\u4E5F\u62FF\u4E0D\u5168\u3002\u8981\u5168\u7684\u8BDD\u8BF7\u7528\u6237\u767B\u5F55");
    const d = {
      platform: "bilibili",
      id: vd.bvid,
      url: `https://www.bilibili.com/video/${vd.bvid}${p > 1 ? `?p=${p}` : ""}`,
      pageUrl: location.href,
      type: "video",
      title: vd.title || "",
      desc: vd.desc || "",
      createTime: num(vd.pubdate),
      durationSec,
      author: {
        id: String(vd.owner?.mid || ""),
        name: vd.owner?.name || "",
        followers: num(s.upData?.fans),
        url: vd.owner?.mid ? `https://space.bilibili.com/${vd.owner.mid}` : ""
      },
      stats: {
        view: num(st.view),
        like: num(st.like),
        collect: num(st.favorite),
        share: num(st.share),
        comment: num(st.reply),
        coin: num(st.coin),
        danmaku: num(st.danmaku)
      },
      tags,
      category: [vd.tname_v2 || vd.tname].filter(Boolean),
      searchWords: [],
      music: v2?.bgm_info ? { title: v2.bgm_info.music_title || "", author: "", original: null, url: v2.bgm_info.jump_url || null } : null,
      requestHeaders: { Referer: REFERER3, "User-Agent": navigator.userAgent },
      transcript: { inlineSegments: inline, subtitleTracks: tracks, audioStream: audios[0] || null, audioStreams: audios.slice(0, 4) },
      visual: { coverUrl: https(vd.pic) || null, images: [], chapters, storyboards, videoStreams: sortStreams(streams, 10) },
      intel: {
        cid,
        part: page ? { p, title: page.part || "", count: (vd.pages || []).length } : null,
        honors: (vd.honor_reply?.honor || []).map((h) => h.desc).filter(Boolean),
        onlineNow: v2?.online_count ?? null,
        aigc: v2?.arc_aigc || null,
        season: vd.ugc_season?.title || "",
        copyright: vd.copyright === 1 ? "\u81EA\u5236" : vd.copyright === 2 ? "\u8F6C\u8F7D" : "",
        argue: vd.argue_info?.argue_msg || "",
        authorLevel: null
      },
      source: "__INITIAL_STATE__",
      notes
    };
    d.comments = commentsFrom3(net2, vd.aid);
    return d;
  }
  function commentsFrom3(net2, aid) {
    const lists = [];
    for (const { url, json } of netJson(net2, (u) => /\/x\/v2\/reply(\/wbi)?\/main|\/x\/v2\/reply\?/.test(u))) {
      if (aid && !url.includes(`oid=${aid}`)) continue;
      const d = json?.data || {};
      lists.push([...d.top_replies || [], ...d.upper?.top ? [d.upper.top] : [], ...d.replies || []].map(parseReply));
    }
    return mergeComments(lists);
  }
  function commentMeta3(net2, aid) {
    const last = netJson(net2, "/x/v2/reply").filter(({ url }) => !aid || url.includes(`oid=${aid}`)).pop();
    const c = last?.json?.data?.cursor;
    return c ? { total: num(c.all_count), hasMore: !c.is_end } : null;
  }
  var loggedIn = () => /(^|;\s*)DedeUserID=/.test(document.cookie);
  async function fetchComments(aid, count) {
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
    const comments2 = mergeComments(lists, count);
    return {
      comments: comments2,
      total,
      hasMore: total === null ? null : comments2.length < total,
      note: !loggedIn() && total > comments2.length ? `Chrome \u6CA1\u767B\u5F55 B \u7AD9\uFF0C${total} \u6761\u8BC4\u8BBA\u53EA\u7ED9\u4E86 ${comments2.length} \u6761\u3002\u8BF7\u7528\u6237\u767B\u5F55\u540E\u518D\u53D6` : ""
    };
  }
  async function openComments3() {
    const box = document.querySelector("#commentapp") || document.querySelector("bili-comments") || document.querySelector(".comment-container");
    box?.scrollIntoView({ block: "start" });
    return null;
  }

  // loads/media/lib/youtube.js
  var youtube_exports = {};
  __export(youtube_exports, {
    REFERER: () => REFERER4,
    commentMeta: () => commentMeta4,
    commentTotal: () => commentTotal,
    commentsFrom: () => commentsFrom4,
    dataFollowers: () => dataFollowers,
    fetchComments: () => fetchComments2,
    firstCommentToken: () => firstCommentToken,
    inspect: () => inspect4,
    nextCommentToken: () => nextCommentToken,
    openComments: () => openComments4,
    parseNextComments: () => parseNextComments,
    parsePlayer: () => parsePlayer,
    parseStoryboard: () => parseStoryboard,
    parseTimedtext: () => parseTimedtext,
    targetId: () => targetId4
  });
  var REFERER4 = "https://www.youtube.com/";
  function targetId4(href) {
    try {
      const u = new URL(href);
      return u.searchParams.get("v") || (/\/(?:shorts|live|embed)\/([\w-]{11})/.exec(u.pathname) || [])[1] || "";
    } catch {
      return "";
    }
  }
  function parseTimedtext(body) {
    const out = [];
    const text = String(body || "").trim();
    if (text.startsWith("{")) {
      let j;
      try {
        j = JSON.parse(text);
      } catch {
        return out;
      }
      for (const e of j.events || []) {
        const t = (e.segs || []).map((s) => s.utf8 || "").join("").replace(/\s*\n\s*/g, " ").trim();
        if (!t) continue;
        const start = (num(e.tStartMs) || 0) / 1e3;
        out.push({ start: sec(start), end: sec(start + (num(e.dDurationMs) || 0) / 1e3), text: t });
      }
      return out;
    }
    const dec = (s) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
    for (const m of text.matchAll(/<p\s+t="(\d+)"(?:\s+d="(\d+)")?[^>]*>([\s\S]*?)<\/p>/g)) {
      const t = dec(m[3]);
      if (t) out.push({ start: sec(+m[1] / 1e3), end: sec((+m[1] + (+m[2] || 0)) / 1e3), text: t });
    }
    if (!out.length) {
      for (const m of text.matchAll(/<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g)) {
        const t = dec(m[3]);
        if (t) out.push({ start: sec(+m[1]), end: sec(+m[1] + (+m[2] || 0)), text: t });
      }
    }
    return out;
  }
  function parseStoryboard(spec, durationSec) {
    if (!spec) return [];
    const [base, ...levels] = String(spec).split("|");
    if (!levels.length) return [];
    const li = levels.length - 1;
    const [w, h, count, cols, rows, interval, name, sigh] = levels[li].split("#");
    const n = num(count) || 0;
    const per = (num(cols) || 1) * (num(rows) || 1);
    const sheets = Math.max(1, Math.ceil(n / per));
    const urls = [];
    for (let i = 0; i < sheets && i < 200; i++) {
      let u = base.replace("$L", String(li)).replace("$N", String(name || "").replace("$M", String(i)));
      if (sigh) u += `${u.includes("?") ? "&" : "?"}sigh=${sigh}`;
      urls.push(https(u));
    }
    const iv = num(interval);
    return [{
      urls,
      cols: num(cols),
      rows: num(rows),
      frameWidth: num(w),
      frameHeight: num(h),
      intervalSec: iv ? sec(iv / 1e3) : n && durationSec ? sec(durationSec / n) : null,
      totalFrames: n
    }];
  }
  function parsePlayer(pr, { ua = "", href = "" } = {}) {
    const vd = pr?.videoDetails || {};
    const mf = pr?.microformat?.playerMicroformatRenderer || {};
    const id = vd.videoId || "";
    const durationSec = num(vd.lengthSeconds) || num(mf.lengthSeconds);
    const tracks = (pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []).map((t) => ({
      lang: t.languageCode,
      name: ytText(t.name),
      kind: t.kind === "asr" ? "asr" : "manual",
      // 没有 pot 的 baseUrl：常常回空。真正能用的是 timedtextUrls 里播放器自己请求过的那条
      url: https(t.baseUrl),
      ipBound: false,
      needsPot: true
    }));
    const formats = [...pr?.streamingData?.formats || [], ...pr?.streamingData?.adaptiveFormats || []];
    const videoStreams = formats.filter((f) => /^video/.test(f.mimeType || "")).map((f) => ({
      quality: f.qualityLabel || "",
      gearName: String(f.itag),
      format: /mp4/.test(f.mimeType) ? "mp4" : "webm",
      codec: (/codecs="([^".]+)/.exec(f.mimeType || "") || [])[1] || "",
      hasAudio: !!f.audioQuality,
      width: num(f.width),
      height: num(f.height),
      fps: num(f.fps),
      bitrate: num(f.bitrate),
      sizeBytes: num(f.contentLength),
      url: null,
      ipBound: true
    })).sort((a, b) => (b.height || 0) - (a.height || 0)).filter((s, i, a) => i === a.findIndex((x) => x.quality === s.quality)).slice(0, 8);
    const desc = vd.shortDescription || mf.description?.simpleText || "";
    const thumbs = vd.thumbnail?.thumbnails || [];
    return {
      platform: "youtube",
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      pageUrl: href,
      type: "video",
      title: vd.title || ytText(mf.title),
      desc,
      createTime: mf.publishDate ? Math.round(Date.parse(mf.publishDate) / 1e3) : null,
      durationSec,
      author: { id: vd.channelId || mf.externalChannelId || "", name: vd.author || mf.ownerChannelName || "", followers: null, url: mf.ownerProfileUrl || (vd.channelId ? `https://www.youtube.com/channel/${vd.channelId}` : "") },
      stats: { view: num(vd.viewCount) ?? num(mf.viewCount), like: num(mf.likeCount), collect: null, share: null, comment: null },
      tags: [.../* @__PURE__ */ new Set([...vd.keywords || [], ...hashtags(desc)])],
      category: [mf.category].filter(Boolean),
      searchWords: [],
      music: null,
      requestHeaders: { Referer: REFERER4, "User-Agent": ua },
      transcript: { inlineSegments: [], subtitleTracks: tracks, audioStream: null, audioStreams: [] },
      visual: {
        coverUrl: id ? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg` : https(thumbs[thumbs.length - 1]?.url),
        images: [],
        chapters: chaptersFromText(desc),
        storyboards: parseStoryboard(pr?.storyboards?.playerStoryboardSpecRenderer?.spec || pr?.storyboards?.playerLiveStoryboardSpecRenderer?.spec, durationSec),
        videoStreams
      },
      intel: {
        isLive: !!vd.isLiveContent,
        isShorts: /\/shorts\//.test(href),
        familySafe: mf.isFamilySafe ?? null,
        uploadDate: mf.uploadDate || "",
        availableCountries: (mf.availableCountries || []).length || null,
        captionLanguages: tracks.map((t) => `${t.lang}${t.kind === "asr" ? "(\u81EA\u52A8)" : ""}`)
      }
    };
  }
  function parseNextComments(json) {
    const out = [];
    walk(json, (o) => {
      const p = o.commentEntityPayload;
      if (p) {
        const pr = p.properties || {};
        out.push({
          id: pr.commentId || "",
          user: p.author?.displayName || "",
          userId: p.author?.channelId || "",
          text: pr.content?.content || "",
          likes: num(p.toolbar?.likeCountNotliked || p.toolbar?.likeCountLiked) ?? 0,
          repliesCount: num(p.toolbar?.replyCount) ?? 0,
          location: "",
          publishedText: pr.publishedTime || "",
          byAuthor: !!p.author?.isCreator,
          authorLiked: !!p.toolbar?.creatorThumbnailUrl
        });
        return false;
      }
      const r = o.commentRenderer;
      if (r) {
        out.push({
          id: r.commentId || "",
          user: ytText(r.authorText),
          text: ytText(r.contentText),
          likes: num(ytText(r.voteCount)) ?? 0,
          repliesCount: num(r.replyCount) ?? 0,
          location: "",
          publishedText: ytText(r.publishedTimeText),
          byAuthor: !!r.authorIsChannelOwner
        });
        return false;
      }
      return true;
    }, 14);
    return out;
  }
  var player = () => document.querySelector("#movie_player");
  function playerResponse(want) {
    let pr = null;
    try {
      pr = player()?.getPlayerResponse?.();
    } catch {
    }
    if (pr?.videoDetails?.videoId === want || !want && pr) return pr;
    const init = window.ytInitialPlayerResponse;
    if (init?.videoDetails?.videoId === want || !want && init) return init;
    return pr || null;
  }
  var timedtextFor = (net2, id) => ((typeof net2 === "function" ? net2() : net2) || []).filter((r) => String(r.url).includes("/api/timedtext") && String(r.url).includes(`v=${id}`) && r.body);
  async function captureCaptions(net2, id, wait) {
    if (timedtextFor(net2, id).length) return { toggled: false };
    const btn = document.querySelector(".ytp-subtitles-button");
    if (!btn || btn.getAttribute("aria-disabled") === "true") return { toggled: false, reason: "\u6CA1\u6709\u5B57\u5E55\u6309\u94AE" };
    const wasOn = btn.getAttribute("aria-pressed") === "true";
    if (wasOn) {
      btn.click();
      await sleep(300);
    }
    btn.click();
    const ok = await wait(() => timedtextFor(net2, id).length > 0, 8e3);
    if (!wasOn) btn.click();
    return { toggled: true, ok };
  }
  function domStats() {
    const out = {};
    const like = document.querySelector("like-button-view-model button, #segmented-like-button button, ytd-toggle-button-renderer#like-button button");
    const label = like?.getAttribute("aria-label") || "";
    const m = /([\d,.]+\s*[KMB万亿]?)/.exec(label.replace(/[^\d,.KMB万亿\s]/g, " ").trim());
    if (m) out.like = num(m[1].replace(/\s/g, ""));
    const subs = document.querySelector("#owner-sub-count")?.textContent || "";
    const sm = /([\d.,]+\s*[KMB万亿]?)/.exec(subs);
    if (sm) out.followers = num(sm[1].replace(/\s/g, ""));
    const cc = document.querySelector("ytd-comments-header-renderer #count")?.textContent || "";
    const cm = /([\d,.]+\s*[KMB万亿]?)/.exec(cc);
    if (cm) out.comment = num(cm[1].replace(/\s/g, ""));
    return out;
  }
  function dataFollowers(data, want) {
    if (!data || data.currentVideoEndpoint?.watchEndpoint?.videoId !== want) return null;
    let text = "";
    walk(data.contents, (o) => {
      if (text) return false;
      if (o.videoOwnerRenderer) {
        text = ytText(o.videoOwnerRenderer.subscriberCountText);
        return false;
      }
      return true;
    }, 12);
    const m = /[\d.,]+\s*[KMB万亿]?/.exec(text);
    return m ? num(m[0].replace(/\s/g, "")) : null;
  }
  function dataChapters(want) {
    const d = window.ytInitialData;
    if (!d || d.currentVideoEndpoint?.watchEndpoint?.videoId !== want) return [];
    const out = [];
    walk(d.playerOverlays, (o) => {
      if (o.chapterRenderer) {
        const c = o.chapterRenderer;
        out.push({ title: ytText(c.title), detail: "", startSec: sec((num(c.timeRangeStartMillis) || 0) / 1e3), thumbUrl: https(c.thumbnail?.thumbnails?.slice(-1)[0]?.url) || null });
        return false;
      }
      return true;
    }, 16);
    return out;
  }
  async function inspect4(net2, { subtitles = true } = {}, wait) {
    const want = targetId4(location.href);
    const pr = playerResponse(want);
    if (!pr?.videoDetails) throw err("NOT_FOUND", "\u9875\u9762\u4E0A\u6CA1\u6709\u64AD\u653E\u5668\u6570\u636E\uFF1A\u6253\u5F00 /watch?v=\u2026 \u7B49\u64AD\u653E\u5668\u51FA\u6765\u518D inspect");
    if (want && pr.videoDetails.videoId !== want) throw err("NOT_FOUND", `\u64AD\u653E\u5668\u8FD8\u662F\u4E0A\u4E00\u4E2A\u89C6\u9891\uFF08${pr.videoDetails.videoId}\uFF09\uFF0C\u7B49\u51E0\u79D2\u6216 navigate reload \u540E\u518D inspect`);
    const d = parsePlayer(pr, { ua: navigator.userAgent, href: location.href });
    d.notes = [];
    const fromData = dataChapters(d.id);
    if (fromData.length) d.visual.chapters = fromData;
    if (subtitles && d.transcript.subtitleTracks.length) {
      const cap = await captureCaptions(net2, d.id, wait);
      if (cap.toggled && !cap.ok) d.notes.push("\u70B9\u4E86\u5B57\u5E55\u6309\u94AE\uFF0C\u4F46\u6CA1\u7B49\u5230 /api/timedtext\uFF1A\u7F51\u7EDC\u8BB0\u5F55\u53EF\u80FD\u8FD8\u6CA1\u5F00\uFF08navigate reload \u540E\u518D inspect\uFF09");
    } else if (!d.transcript.subtitleTracks.length) d.notes.push("\u8FD9\u4E2A\u89C6\u9891\u6CA1\u6709\u5B57\u5E55\u8F68\uFF1A\u8981\u6587\u6848\u5C31\u7528 capture_frames \u770B\u753B\u9762\uFF0C\u6216\u8BF7\u7528\u6237\u53E6\u884C\u63D0\u4F9B\u97F3\u9891");
    const tt = timedtextFor(net2, d.id);
    if (tt.length) {
      const last = tt[tt.length - 1];
      d.transcript.inlineSegments = parseTimedtext(last.body);
      const u = new URL(String(last.url), location.href);
      d.transcript.timedtextUrls = tt.map((r) => {
        const x = new URL(String(r.url), location.href);
        return { url: x.href, lang: x.searchParams.get("lang") || "", tlang: x.searchParams.get("tlang") || "", ipBound: !["0.0.0.0", null].includes(x.searchParams.get("ip")) && x.searchParams.has("ip") };
      }).filter((t, i, a) => i === a.findIndex((y) => y.url === t.url)).slice(-4);
      d.transcript.inlineLang = u.searchParams.get("tlang") || u.searchParams.get("lang") || "";
    }
    const ds = domStats();
    if (d.stats.like == null && ds.like != null) d.stats.like = ds.like;
    if (ds.comment != null) d.stats.comment = ds.comment;
    d.author.followers = dataFollowers(window.ytInitialData, d.id) ?? ds.followers ?? null;
    d.source = "getPlayerResponse";
    d.comments = commentsFrom4(net2, d.id);
    return d;
  }
  function commentsFrom4(net2) {
    const lists = netJson(net2, "/youtubei/v1/next").map(({ json }) => parseNextComments(json));
    lists.push([...document.querySelectorAll("ytd-comment-thread-renderer")].slice(0, 300).map((t) => ({
      id: t.querySelector("#comment, ytd-comment-view-model")?.getAttribute?.("data-comment-id") || "",
      user: (t.querySelector("#author-text")?.textContent || "").trim(),
      text: (t.querySelector("#content-text")?.textContent || "").trim(),
      likes: num((t.querySelector("#vote-count-middle")?.textContent || "").trim()) ?? 0,
      repliesCount: null,
      publishedText: (t.querySelector("#published-time-text")?.textContent || "").trim(),
      byAuthor: !!t.querySelector("ytd-author-comment-badge-renderer")
    })));
    return mergeComments(lists);
  }
  function commentMeta4() {
    const cc = document.querySelector("ytd-comments-header-renderer #count")?.textContent || "";
    return { total: num((/([\d,.]+)/.exec(cc) || [])[1]), hasMore: !!document.querySelector("ytd-comments ytd-continuation-item-renderer") };
  }
  async function openComments4(_net, _id, wait) {
    const box = document.querySelector("ytd-comments#comments") || document.querySelector("#comments");
    box?.scrollIntoView({ block: "start" });
    if (document.visibilityState !== "hidden") await wait(() => document.querySelector("ytd-comment-thread-renderer"), 6e3);
    return null;
  }
  function firstCommentToken(data, want) {
    if (!data || want && data.currentVideoEndpoint?.watchEndpoint?.videoId !== want) return null;
    let token = null;
    walk(data.contents, (o) => {
      if (token) return false;
      const s = o.itemSectionRenderer;
      if (s?.sectionIdentifier === "comment-item-section") {
        token = s.contents?.[0]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token || null;
        return false;
      }
      return true;
    }, 12);
    return token;
  }
  function nextCommentToken(json) {
    for (const e of json?.onResponseReceivedEndpoints || []) {
      const items = (e.reloadContinuationItemsCommand || e.appendContinuationItemsAction)?.continuationItems;
      const t = items?.[items.length - 1]?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
      if (t) return t;
    }
    return null;
  }
  function commentTotal(json) {
    let total = null;
    walk(json?.onResponseReceivedEndpoints, (o) => {
      if (total !== null) return false;
      if (o.commentsHeaderRenderer) {
        total = num((/[\d,.]+\s*[KMB万亿]?/.exec(ytText(o.commentsHeaderRenderer.countText)) || [""])[0].replace(/\s/g, ""));
        return false;
      }
      return true;
    }, 10);
    return total;
  }
  async function fetchComments2(id, count) {
    const cfg = window.ytcfg;
    let token = firstCommentToken(window.ytInitialData, id);
    const context = cfg?.get?.("INNERTUBE_CONTEXT");
    if (!token || !context) return { note: "\u9875\u9762\u91CC\u6CA1\u6709\u8BC4\u8BBA\u7684 continuation\uFF08\u7AD9\u5185\u5207\u6362\u8FC7\u6765\u7684\uFF0C\u6216\u8BC4\u8BBA\u5DF2\u5173\u95ED\uFF09\uFF1Anavigate \u5230\u8FD9\u4E2A\u89C6\u9891\u518D\u8BD5" };
    const lists = [];
    let total = null;
    let got = 0;
    for (let page = 0; page < 12 && token && got < count; page++) {
      const res = await fetch("/youtubei/v1/next?prettyPrint=false", {
        method: "POST",
        credentials: "omit",
        headers: { "content-type": "application/json", "x-youtube-client-name": "1", "x-youtube-client-version": context.client?.clientVersion || "" },
        body: JSON.stringify({ context, continuation: token })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      total = commentTotal(json) ?? total;
      const list2 = parseNextComments(json);
      lists.push(list2);
      got += list2.length;
      token = nextCommentToken(json);
      if (!list2.length && page > 0) break;
      if (token && got < count) await sleep(300);
    }
    const comments2 = mergeComments(lists, count);
    return { comments: comments2, total, hasMore: !!token };
  }

  // loads/media/lib/page.js
  function mainVideo() {
    const vids = [...document.querySelectorAll("video")];
    const score = (v) => {
      const r = v.getBoundingClientRect();
      return r.width * r.height + (v.readyState >= 2 ? 1e7 : 0) + (v.duration > 0 ? 1e6 : 0);
    };
    return vids.sort((a, b) => score(b) - score(a))[0] || null;
  }
  function fallback(net2) {
    const meta = (p) => document.querySelector(`meta[property="${p}"], meta[name="${p}"]`)?.getAttribute("content") || "";
    const v = mainVideo();
    const urls = /* @__PURE__ */ new Set();
    if (v?.currentSrc && /^https?:/.test(v.currentSrc)) urls.add(v.currentSrc);
    for (const s of document.querySelectorAll("video source[src]")) if (/^https?:/.test(s.src)) urls.add(s.src);
    for (const r of net2() || []) {
      const u = String(r.url || "");
      if (/\.(mp4|m3u8|m4a|m4s|webm)(\?|$)/i.test(u) || /mime_type=video|media-(video|audio)/.test(u)) urls.add(https(u));
    }
    return {
      title: meta("og:title") || document.title,
      desc: meta("og:description") || meta("description"),
      coverUrl: https(meta("og:image")) || (v?.poster || null),
      durationSec: v && Number.isFinite(v.duration) ? Math.round(v.duration * 100) / 100 : null,
      mediaUrls: [...urls].slice(0, 12)
    };
  }
  function scrollable(el) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 20) return n;
    }
    return null;
  }
  async function scrollMore(box, times, waitMs) {
    const target = box ? scrollable(box) || box : null;
    for (let i = 0; i < times; i++) {
      if (target) target.scrollBy({ top: target.clientHeight * 0.9 || 800 });
      else window.scrollBy({ top: window.innerHeight * 0.9 || 800 });
      (target || document.scrollingElement)?.dispatchEvent(new WheelEvent("wheel", { deltaY: 800, bubbles: true }));
      await sleep(waitMs);
    }
  }
  function seek(v, t, ms = 6e3) {
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        v.removeEventListener("seeked", on);
        resolve(ok);
      };
      const on = () => finish(true);
      v.addEventListener("seeked", on);
      setTimeout(() => finish(false), ms);
      v.currentTime = t;
    });
  }
  function frameReady(v, ms = 1500) {
    return new Promise((resolve) => {
      if (typeof v.requestVideoFrameCallback !== "function") {
        setTimeout(resolve, 250);
        return;
      }
      const t = setTimeout(resolve, ms);
      v.requestVideoFrameCallback(() => {
        clearTimeout(t);
        resolve();
      });
    });
  }
  async function wakeVideo(v) {
    if (v.readyState >= 1) return;
    const was = { muted: v.muted, paused: v.paused };
    v.muted = true;
    v.play()?.catch?.(() => {
    });
    const until = Date.now() + 6e3;
    while (v.readyState < 1 && Date.now() < until) await sleep(200);
    if (v.readyState >= 1) {
      v.muted = was.muted;
      return;
    }
    if (was.paused) v.pause();
    v.muted = was.muted;
    throw err(
      document.visibilityState === "hidden" ? "TAB_HIDDEN" : "NO_VIDEO",
      document.visibilityState === "hidden" ? "\u6807\u7B7E\u9875\u5728\u540E\u53F0\uFF0CChrome \u6CA1\u6709\u52A0\u8F7D\u89C6\u9891\uFF1A\u628A\u5B83\u5207\u5230\u524D\u53F0\u4E00\u6B21\u518D\u622A\uFF0C\u6216\u8005\u6539\u7528\u96EA\u78A7\u56FE\u3001\u7AE0\u8282\u56FE\u3001\u4E91\u7AEF ffmpeg" : "\u89C6\u9891\u8FD8\u6CA1\u52A0\u8F7D\u51FA\u6765\uFF1A\u7B49\u5B83\u5F00\u59CB\u64AD\u653E\u518D\u622A"
    );
  }
  var FRAMES_MAX = 12;
  var BYTES_MAX = 2.4 * 1024 * 1024;
  async function captureFrames({ timestamps = [1, 5, 15], maxWidth = 1280, quality = 0.82 } = {}) {
    const v = mainVideo();
    if (!v) throw err("NO_VIDEO", "\u9875\u9762\u4E0A\u6CA1\u6709 <video>");
    await wakeVideo(v);
    const list2 = [...new Set(timestamps.map(Number).filter((t) => Number.isFinite(t) && t >= 0))].slice(0, FRAMES_MAX);
    if (!list2.length) throw err("BAD_PARAMS", "timestamps \u8981\u7ED9\u79D2\u6570\u6570\u7EC4\uFF0C\u6BD4\u5982 [1, 15, 45]");
    const mw = Math.min(Math.max(num(maxWidth) || 1280, 160), 1920);
    let q = Math.min(Math.max(Number(quality) || 0.82, 0.3), 0.95);
    const was = { t: v.currentTime, paused: v.paused, muted: v.muted };
    const out = [];
    let bytes = 0;
    try {
      v.muted = true;
      if (!v.paused) v.pause();
      for (const raw of list2) {
        const t = Number.isFinite(v.duration) ? Math.min(raw, Math.max(0, v.duration - 0.1)) : raw;
        const ok = await seek(v, t);
        await frameReady(v);
        const w = v.videoWidth;
        const h = v.videoHeight;
        if (!ok || !w || !h) {
          out.push({ timestamp: raw, error: ok ? "\u8FD9\u4E00\u5E27\u6CA1\u89E3\u7801\u51FA\u6765\uFF08\u6807\u7B7E\u9875\u5728\u540E\u53F0\u65F6\u4F1A\u8FD9\u6837\uFF0C\u53EF\u4EE5\u8BF7\u7528\u6237\u628A\u5B83\u5207\u5230\u524D\u53F0\uFF09" : "\u8DF3\u8F6C\u8D85\u65F6" });
          continue;
        }
        const scale = Math.min(1, mw / w);
        const c = document.createElement("canvas");
        c.width = Math.round(w * scale);
        c.height = Math.round(h * scale);
        try {
          c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
          let dataUrl = c.toDataURL("image/jpeg", q);
          while (bytes + dataUrl.length > BYTES_MAX && q > 0.35) {
            q -= 0.15;
            dataUrl = c.toDataURL("image/jpeg", q);
          }
          if (bytes + dataUrl.length > BYTES_MAX) {
            out.push({ timestamp: raw, error: "\u8FD9\u4E00\u6279\u592A\u5927\u4E86\uFF0C\u5269\u4E0B\u7684\u5206\u6279\u518D\u622A" });
            break;
          }
          bytes += dataUrl.length;
          out.push({ timestamp: raw, at: Math.round(v.currentTime * 1e3) / 1e3, width: c.width, height: c.height, dataUrl });
        } catch (e) {
          out.push({ timestamp: raw, error: /tainted|SecurityError/i.test(String(e)) ? "\u8DE8\u57DF\u89C6\u9891\uFF0C\u6D4F\u89C8\u5668\u4E0D\u8BA9\u8BFB\u753B\u9762\uFF1A\u6539\u7528\u4E91\u7AEF ffmpeg \u62BD\u5E27" : String(e.message || e) });
        }
      }
    } finally {
      try {
        await seek(v, was.t, 3e3);
      } catch {
      }
      v.muted = was.muted;
      if (!was.paused) v.play().catch(() => {
      });
    }
    return { frames: out, videoWidth: v.videoWidth, videoHeight: v.videoHeight, durationSec: Number.isFinite(v.duration) ? v.duration : null };
  }

  // loads/media/lib/list.js
  function douyin(o) {
    if (!o.aweme_id || !(o.statistics || o.stats) || typeof o.desc !== "string") return null;
    const st = o.statistics || o.stats;
    const dur = num(o.video?.duration ?? o.duration);
    return {
      id: String(o.aweme_id),
      url: `https://www.douyin.com/video/${o.aweme_id}`,
      title: o.item_title || o.desc.split(/\s#/)[0].slice(0, 120),
      desc: o.desc,
      author: o.author?.nickname || "",
      authorId: o.author?.sec_uid || "",
      durationSec: dur ? dur > 1e3 ? Math.round(dur / 100) / 10 : dur : null,
      createTime: num(o.create_time),
      stats: { view: num(st.play_count) || null, like: num(st.digg_count), comment: num(st.comment_count), collect: num(st.collect_count), share: num(st.share_count) },
      cover: https(first(o.video?.cover?.url_list)) || null,
      type: o.images?.length ? "images" : "video",
      pinned: !!o.is_top
    };
  }
  function xhs(o) {
    const card = o.note_card || o.noteCard || (o.display_title !== void 0 || o.displayTitle !== void 0 ? o : null);
    if (!card) return null;
    const id = o.id || o.note_id || o.noteId || card.note_id || card.noteId;
    if (!id || !/^[0-9a-f]{24}$/.test(id)) return null;
    const ii = card.interact_info || card.interactInfo || {};
    const token = o.xsec_token || o.xsecToken || card.xsec_token || card.xsecToken || "";
    return {
      id,
      url: `https://www.xiaohongshu.com/explore/${id}${token ? `?xsec_token=${encodeURIComponent(token)}&xsec_source=pc_search` : ""}`,
      title: card.display_title || card.displayTitle || card.title || "",
      desc: "",
      author: card.user?.nickname || card.user?.nick_name || card.user?.nickName || "",
      authorId: card.user?.user_id || card.user?.userId || "",
      durationSec: null,
      createTime: null,
      stats: { view: null, like: num(ii.liked_count ?? ii.likedCount), comment: num(ii.comment_count ?? ii.commentCount), collect: num(ii.collected_count ?? ii.collectedCount), share: num(ii.shared_count ?? ii.shareCount) },
      cover: https(card.cover?.url_default || card.cover?.urlDefault || card.cover?.url) || null,
      type: card.type === "video" ? "video" : "images"
    };
  }
  function bili(o) {
    const bvid = o.bvid;
    if (!bvid || !/^BV/.test(bvid) || !(o.title || o.name)) return null;
    const st = o.stat || {};
    const len = typeof o.length === "string" ? clock(o.length) : null;
    const dur = num(o.duration) ?? (typeof o.duration === "string" ? clock(o.duration) : null) ?? len;
    return {
      id: bvid,
      url: `https://www.bilibili.com/video/${bvid}`,
      title: String(o.title || "").replace(/<[^>]+>/g, ""),
      desc: o.description || o.desc || "",
      author: o.owner?.name || o.author || "",
      authorId: String(o.owner?.mid || o.mid || ""),
      durationSec: dur,
      createTime: num(o.pubdate ?? o.created ?? o.ctime),
      stats: {
        view: num(st.view ?? o.play),
        like: num(st.like ?? o.like),
        comment: num(st.reply ?? o.comment ?? o.review),
        collect: num(st.favorite ?? o.favorites),
        share: num(st.share),
        danmaku: num(st.danmaku ?? o.video_review ?? o.danmaku)
      },
      cover: https(o.pic || o.cover) || null,
      type: "video"
    };
  }
  function yt(o) {
    const r = o.videoRenderer || o.gridVideoRenderer || o.compactVideoRenderer || o.reelItemRenderer;
    if (r?.videoId) {
      const views = num(String(ytText(r.viewCountText) || ytText(r.shortViewCountText)).replace(/[^\d.,KMB万亿]/g, "").replace(/,/g, ""));
      return {
        id: r.videoId,
        url: `https://www.youtube.com/watch?v=${r.videoId}`,
        title: ytText(r.title) || ytText(r.headline),
        desc: ytText(r.descriptionSnippet || first(r.detailedMetadataSnippets)?.snippetText),
        author: ytText(r.ownerText || r.longBylineText || r.shortBylineText),
        authorId: "",
        durationSec: clock(ytText(r.lengthText)),
        createTime: null,
        publishedText: ytText(r.publishedTimeText),
        stats: { view: views, like: null, comment: null, collect: null, share: null },
        cover: `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`,
        type: o.reelItemRenderer ? "short" : "video"
      };
    }
    const l = o.lockupViewModel;
    if (l?.contentId && /VIDEO/.test(l.contentType || "")) {
      const meta = l.metadata?.lockupMetadataViewModel;
      const parts = [];
      walk(meta?.metadata, (x) => {
        if (typeof x.content === "string") {
          parts.push(x.content);
          return false;
        }
        return true;
      }, 10);
      const viewPart = parts.find((p) => /view|观看|次/.test(p)) || "";
      let dur = null;
      walk(l.contentImage, (x) => {
        if (typeof x.text === "string" && /^\d+(:\d{2})+$/.test(x.text)) {
          dur = clock(x.text);
          return false;
        }
        return true;
      }, 12);
      return {
        id: l.contentId,
        url: `https://www.youtube.com/watch?v=${l.contentId}`,
        title: meta?.title?.content || "",
        desc: "",
        author: parts[0] || "",
        authorId: "",
        durationSec: dur,
        createTime: null,
        publishedText: parts.find((p) => /ago|前/.test(p)) || "",
        stats: { view: num(viewPart.replace(/[^\d.,KMB万亿]/g, "").replace(/,/g, "")), like: null, comment: null, collect: null, share: null },
        cover: `https://i.ytimg.com/vi/${l.contentId}/hqdefault.jpg`,
        type: "video"
      };
    }
    return null;
  }
  var PARSERS = { douyin, xiaohongshu: xhs, bilibili: bili, youtube: yt };
  function collect(platform2, roots, limit = 100) {
    const parse = PARSERS[platform2];
    const map = /* @__PURE__ */ new Map();
    for (const root of roots) {
      walk(root, (o) => {
        const item = parse(o);
        if (item) {
          const old = map.get(item.id);
          if (!old || Object.values(item.stats).filter((x) => x != null).length > Object.values(old.stats).filter((x) => x != null).length) map.set(item.id, { platform: platform2, ...item });
          return false;
        }
        return true;
      }, 14);
    }
    return [...map.values()].slice(0, limit);
  }
  function listPage(platform2, net2, limit) {
    const roots = [];
    if (platform2 === "douyin") {
      const el = document.getElementById("RENDER_DATA");
      if (el) {
        try {
          roots.push(JSON.parse(decodeURIComponent(el.textContent)));
        } catch {
        }
      }
      for (const { json } of netJson(net2, (u) => /\/aweme\/v1\/web\/(aweme\/post|general\/search|search\/item|tab\/feed|module\/feed|mix\/aweme|aweme\/favorite|hot\/search|channel\/feed)/.test(u))) roots.push(json);
    } else if (platform2 === "xiaohongshu") {
      const s = window.__INITIAL_STATE__;
      if (s) {
        roots.push(unref(unref(s.search)?.feeds), unref(unref(s.user)?.notes), unref(unref(s.feed)?.feeds));
      }
      for (const { json } of netJson(net2, (u) => /\/api\/sns\/web\/v\d\/(search\/notes|user_posted|homefeed)/.test(u))) roots.push(json);
    } else if (platform2 === "bilibili") {
      const s = window.__INITIAL_STATE__;
      if (s) roots.push(s.related, s.recommendList, s.flow, s.allData, s.searchResult);
      const pinia = window.__pinia;
      if (pinia) roots.push(pinia.state?.value || pinia);
      for (const { json } of netJson(net2, (u) => /\/x\/(web-interface\/(wbi\/)?search|space\/wbi\/arc\/search|web-interface\/(wbi\/)?index\/top|web-interface\/ranking|web-interface\/popular|polymer\/web-space|series\/archives)/.test(u))) roots.push(json);
    } else if (platform2 === "youtube") {
      roots.push(window.ytInitialData);
      for (const { json } of netJson(net2, (u) => /\/youtubei\/v1\/(browse|search|next)/.test(u))) roots.push(json);
    }
    return collect(platform2, roots.filter(Boolean), limit);
  }

  // loads/media/entry.js
  var ALLOWED = new Set(define_LOAD_ACTIONS_default);
  var ADAPTERS = { douyin: douyin_exports, xiaohongshu: xhs_exports, bilibili: bilibili_exports, youtube: youtube_exports };
  function platform() {
    const h = location.hostname;
    if (/(^|\.)douyin\.com$/.test(h)) return "douyin";
    if (/(^|\.)xiaohongshu\.com$/.test(h)) return "xiaohongshu";
    if (/(^|\.)bilibili\.com$/.test(h)) return "bilibili";
    if (/(^|\.)youtube\.com$/.test(h)) return "youtube";
    return "";
  }
  var net = () => window.__hcNet || [];
  async function waitFor(test, ms) {
    const until = Date.now() + ms;
    while (Date.now() < until) {
      try {
        if (test()) return true;
      } catch {
      }
      await sleep(250);
    }
    return false;
  }
  function capture() {
    const on = Array.isArray(window.__hcNet);
    const first2 = on && window.__hcNet.length ? window.__hcNet[0].t : null;
    return {
      netHook: on,
      netEntries: on ? window.__hcNet.length : 0,
      // 记录是从这一刻开始的：之前页面发的请求（首屏评论、字幕）没记下来
      since: first2 ? new Date(first2).toISOString() : null,
      ...on ? {} : { note: "\u7F51\u7EDC\u8BB0\u5F55\u6CA1\u5F00\uFF1A\u8BC4\u8BBA\u548C\u5B57\u5E55\u53EF\u80FD\u62FF\u4E0D\u5168\u3002navigate reload \u540E\u518D\u8C03\u4E00\u6B21" }
    };
  }
  var truncate = (s, n) => typeof s === "string" && s.length > n ? `${s.slice(0, n)}\u2026` : s;
  async function inspect5(payload = {}) {
    const p = platform();
    const a = ADAPTERS[p];
    if (!a) throw err("UNSUPPORTED", `media \u4E0D\u8BA4\u8BC6 ${location.hostname}`);
    const d = await a.inspect(net, { subtitles: payload.subtitles !== false }, waitFor);
    const fb = fallback(net);
    if (!d.title) d.title = fb.title;
    if (!d.visual.coverUrl) d.visual.coverUrl = fb.coverUrl;
    if (!d.durationSec && fb.durationSec) d.durationSec = fb.durationSec;
    d.visual.pageMediaUrls = d.visual.videoStreams.length ? [] : fb.mediaUrls;
    if (payload.comments === false) delete d.comments;
    else d.comments = (d.comments || []).slice(0, Math.min(Number(payload.commentLimit) || 50, 200));
    d.desc = truncate(d.desc, 5e3);
    d.capture = capture();
    d.extractedAt = (/* @__PURE__ */ new Date()).toISOString();
    return d;
  }
  async function comments(payload = {}) {
    const p = platform();
    const a = ADAPTERS[p];
    if (!a) throw err("UNSUPPORTED", `media \u4E0D\u8BA4\u8BC6 ${location.hostname}`);
    const count = Math.min(Math.max(Number(payload.count) || 50, 1), 500);
    const times = Math.min(Math.max(Number(payload.scrollTimes ?? 3), 0), 30);
    const waitMs = Math.min(Math.max(Number(payload.waitMs) || 900, 300), 5e3);
    const id = idOf(p);
    const started = Date.now();
    const deadline = started + Math.min(Math.max(Number(payload.budgetMs) || 35e3, 5e3), 15e4);
    const box = await a.openComments(net, id, waitFor);
    let list2 = a.commentsFrom(net, id);
    const scrolls = document.visibilityState === "hidden" && a.fetchComments ? 0 : times;
    for (let i = 0; i < scrolls && list2.length < count && Date.now() < deadline; i++) {
      await scrollMore(box, 1, waitMs);
      list2 = a.commentsFrom(net, id);
    }
    const meta = a.commentMeta(net, id) || {};
    let direct = null;
    if (list2.length < count && a.fetchComments) {
      try {
        direct = await a.fetchComments(id, count);
      } catch (e) {
        direct = { note: `\u8BC4\u8BBA\u63A5\u53E3\u5931\u8D25\uFF1A${e.message}` };
      }
    }
    const merged = mergeComments([list2, direct?.comments], count);
    const note = direct?.note || (merged.length ? "" : "\u4E00\u6761\u8BC4\u8BBA\u90FD\u6CA1\u62FF\u5230\uFF1A\u8BC4\u8BBA\u533A\u53EF\u80FD\u8981\u5728\u524D\u53F0\u624D\u52A0\u8F7D");
    return {
      platform: p,
      id,
      total: direct?.total ?? meta.total ?? null,
      hasMore: direct?.hasMore ?? meta.hasMore ?? null,
      fetched: merged.length,
      comments: merged,
      tookMs: Date.now() - started,
      ...note ? { note } : {},
      capture: capture()
    };
  }
  function idOf(p) {
    if (p === "bilibili") return window.__INITIAL_STATE__?.videoData?.aid || "";
    return ADAPTERS[p].targetId(location.href);
  }
  async function list(payload = {}) {
    const p = platform();
    if (!p) throw err("UNSUPPORTED", `media \u4E0D\u8BA4\u8BC6 ${location.hostname}`);
    const limit = Math.min(Math.max(Number(payload.limit) || 60, 1), 300);
    const times = Math.min(Math.max(Number(payload.scrollTimes ?? 0), 0), 30);
    let items = listPage(p, net, limit);
    for (let i = 0; i < times && items.length < limit; i++) {
      await scrollMore(null, 1, Math.min(Math.max(Number(payload.waitMs) || 1200, 300), 5e3));
      items = listPage(p, net, limit);
    }
    return { platform: p, pageUrl: location.href, pageTitle: document.title, count: items.length, items, capture: capture() };
  }
  var ACTIONS = {
    "media.inspect": inspect5,
    "media.comments": comments,
    "media.list": list,
    "media.capture_frames": (payload) => captureFrames(payload)
  };
  (window.__vcorpLoads ||= {}).media = {
    version: "1.0.0+a6380d",
    async ready() {
      const p = platform();
      if (!p) return { ok: false, reason: `\u4E0D\u662F\u652F\u6301\u7684\u89C6\u9891\u7F51\u7AD9\uFF1A${location.hostname}` };
      return { ok: true, platform: p, netHook: Array.isArray(window.__hcNet) };
    },
    call(action, payload) {
      if (!ALLOWED.has(action) || !ACTIONS[action]) {
        throw Object.assign(new Error(`media \u80FD\u529B\u5305\u4E0D\u63A5\u53D7 ${action}`), { code: "LOAD_DENIED" });
      }
      return ACTIONS[action](payload || {});
    }
  };
})();
