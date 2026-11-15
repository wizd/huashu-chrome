// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/capture/
// capture 小脑没有上游代码，不需要补全局变量。build-loads.mjs 要求每个包都有这个文件。

(() => {
  // <define:__LOAD_ACTIONS__>
  var define_LOAD_ACTIONS_default = ["capture.status", "capture.start", "capture.seek", "capture.pull", "capture.stop"];

  // loads/capture/lib/sites.js
  var youtube = {
    match: (host) => /(^|\.)youtube\.com$/.test(host),
    player: () => document.querySelector("#movie_player"),
    info() {
      const p = this.player();
      const d = p?.getVideoData?.() || {};
      return {
        id: d.video_id || "",
        title: d.title || "",
        author: d.author || "",
        duration: Number(p?.getDuration?.()) || 0,
        quality: p?.getPlaybackQuality?.() || "",
        ad: !!p?.classList?.contains("ad-showing"),
        live: !!d.isLive
      };
    },
    // 画质标签 → 高度。auto 不算
    HEIGHT: { tiny: 144, small: 240, medium: 360, large: 480, hd720: 720, hd1080: 1080, hd1440: 1440, hd2160: 2160, hd2880: 2880, highres: 4320 },
    lockQuality(maxHeight) {
      const p = this.player();
      const levels = (p?.getAvailableQualityLevels?.() || []).filter((q) => this.HEIGHT[q]);
      const pick = levels.filter((q) => this.HEIGHT[q] <= maxHeight).sort((a, b) => this.HEIGHT[b] - this.HEIGHT[a])[0] || levels.sort((a, b) => this.HEIGHT[a] - this.HEIGHT[b])[0];
      if (pick && p?.setPlaybackQualityRange) p.setPlaybackQualityRange(pick, pick);
      return pick || "";
    },
    // 播放器自己记着音量和静音：只改 <video> 的，换画质重建播放源时会被它改回去
    isMuted() {
      const p = this.player();
      return p?.isMuted ? !!p.isMuted() : null;
    },
    volume() {
      const p = this.player();
      return p?.getVolume ? Number(p.getVolume()) / 100 : null;
    },
    // 播放器把音量记进用户偏好：quiet(false) 时按 start 前的值还回去
    quiet(on, volume, muted) {
      const p = this.player();
      if (!p?.setVolume) return false;
      if (on) {
        p.setVolume(0);
        p.unMute();
      } else {
        p.setVolume(Math.round((volume ?? 1) * 100));
        if (muted) p.mute();
        else p.unMute();
      }
      return true;
    },
    seek(t) {
      const p = this.player();
      if (p?.seekTo) {
        p.seekTo(t, true);
        return true;
      }
      return false;
    },
    play() {
      const p = this.player();
      if (p?.playVideo) {
        p.playVideo();
        return true;
      }
      return false;
    },
    pause() {
      const p = this.player();
      if (p?.pauseVideo) {
        p.pauseVideo();
        return true;
      }
      return false;
    }
  };
  var generic = {
    match: () => true,
    info: () => ({ id: "", title: document.title.slice(0, 200), author: "", duration: 0, quality: "", ad: false, live: false }),
    lockQuality: () => "",
    isMuted: () => null,
    volume: () => null,
    quiet: () => false,
    seek: () => false,
    play: () => false,
    pause: () => false
  };
  function siteFor(host) {
    return [youtube].find((s) => s.match(host)) || generic;
  }

  // loads/capture/entry.js
  var ALLOWED = new Set(define_LOAD_ACTIONS_default);
  var PULL_DEFAULT = 8 * 1024 * 1024;
  var PULL_MAX = 16 * 1024 * 1024;
  var err = (code, message) => Object.assign(new Error(message), { code });
  var early = () => window.__vcorpEarly?.capture || null;
  var site = () => siteFor(location.hostname);
  var W = () => early().st.want ||= { rate: 0, muted: false, source: null, repins: 0, id: "" };
  var S = () => early().st.saved ||= { muted: null, rate: null, volume: null };
  function need() {
    const e = early();
    if (!e) throw err("EARLY_MISSING", "\u9875\u9762\u91CC\u6CA1\u6709\u5F55\u5236\u94A9\u5B50\uFF1A\u8981\u5148 load capture\uFF08\u6269\u5C55\u4F1A\u91CD\u8F7D\u6807\u7B7E\u9875\u628A\u94A9\u5B50\u88C5\u4E0A\uFF09");
    if (e.st.drm) throw err("DRM", "\u8FD9\u4E2A\u89C6\u9891\u6709 DRM\uFF08\u52A0\u5BC6\uFF09\uFF0C\u4E0D\u5F55\u3002\u53EA\u80FD\u5728\u5B98\u65B9\u64AD\u653E\u5668\u91CC\u770B");
    return e;
  }
  var finite = (x) => Number.isFinite(x) ? x : 0;
  function main(e) {
    const want = W();
    const vids = [...document.querySelectorAll("video")];
    let pinned = want.source != null ? e.st.sources[want.source] : null;
    if (pinned && !vids.some((v) => v.src && v.src === pinned.url)) {
      const dur = finite(pinned.ms.duration);
      const next = e.st.sources.find((s) => s.id > pinned.id && s.tracks.length && vids.some((v) => v.src && v.src === s.url) && Math.abs(finite(s.ms.duration) - dur) < 2);
      if (next && site().info().id === want.id) {
        want.source = next.id;
        want.repins = (want.repins || 0) + 1;
        pinned = next;
      }
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
  function keepRate(video) {
    const want = W();
    if (video && want.rate && video.playbackRate !== want.rate) {
      try {
        video.playbackRate = want.rate;
      } catch {
      }
    }
    if (want.muted && video && (video.muted || video.volume > 0)) quiet(video, true);
  }
  function quiet(video, on) {
    const saved = S();
    if (on) {
      if (saved.volume === null) saved.volume = site().volume() ?? video?.volume ?? 1;
      site().quiet(true);
      if (video) {
        video.volume = 0;
        video.muted = false;
      }
    } else {
      site().quiet(false, saved.volume, saved.muted);
      if (video) {
        video.volume = saved.volume ?? 1;
        video.muted = !!saved.muted;
      }
    }
  }
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function status() {
    const e = need();
    const m = main(e);
    keepRate(m.video);
    const info = site().info();
    const duration = info.duration || m.duration || finite(m.video?.duration);
    const played = ranges(m.video?.played);
    const v = m.video;
    return {
      started: e.st.started,
      stopped: e.st.stopped,
      drm: e.st.drm,
      overflow: e.st.overflow,
      hidden: document.hidden,
      site: info,
      video: v ? {
        currentTime: +v.currentTime.toFixed(2),
        duration: +finite(v.duration).toFixed(2),
        paused: v.paused,
        ended: v.ended,
        rate: v.playbackRate,
        muted: v.muted,
        volume: +v.volume.toFixed(2),
        readyState: v.readyState
      } : null,
      duration: +duration.toFixed(2),
      played,
      gaps: gaps(played, duration),
      main: m.source ? m.source.id : null,
      pinned: W().source ?? null,
      repins: W().repins || 0,
      sources: e.st.sources.filter((s) => s.tracks.length).map((s) => ({
        id: s.id,
        duration: +finite(s.ms.duration).toFixed(2),
        attached: !!m.video && m.video.src === s.url,
        tracks: s.tracks.map((id) => {
          const tr = e.st.tracks[id];
          return { id, mime: tr.mime, appends: tr.appends, bytes: tr.bytes, queued: tr.chunks.reduce((n, c) => n + c.bytes.byteLength, 0), run: tr.run };
        })
      })),
      held: e.st.held,
      recorded: e.st.recorded,
      pulled: e.st.pulled
    };
  }
  function play(video) {
    if (site().play()) return;
    video?.play?.().catch(() => {
    });
  }
  function seekTo(video, t) {
    if (site().seek(t)) return;
    if (video) video.currentTime = t;
  }
  var ACTIONS = {
    "capture.status": () => status(),
    // 先静音、锁画质；播放器为换画质重建播放源的话，等它稳定下来再跳到 from、加速、播放
    "capture.start": async (p = {}) => {
      const e = need();
      if (e.st.overflow) throw err("OVERFLOW", "\u9875\u9762\u5728\u5F00\u59CB\u5F55\u4E4B\u524D\u5DF2\u7ECF\u7F13\u51B2\u4E86\u592A\u591A\uFF0C\u5F55\u5236\u94A9\u5B50\u505C\u4E86\u3002\u91CD\u65B0 load capture\uFF08\u5E26 reload:true\uFF09\u518D start");
      const maxHeight = Math.max(144, Math.min(Number(p.maxHeight) || 1080, 4320));
      const rate = Math.max(1, Math.min(Number(p.rate) || 16, 16));
      const from = Math.max(0, Number(p.from) || 0);
      if (e.st.stopped) throw err("NEED_RELOAD", "\u8FD9\u4E2A\u9875\u9762\u5F55\u8FC7\u4E00\u6B21\u5DF2\u7ECF\u505C\u4E86\u3002load capture \u5E26 reload:true \u91CD\u8F7D\u540E\u518D start");
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
      for (const until = Date.now() + 3e3; e.st.sources.length === before && Date.now() < until; ) await sleep(200);
      for (const until = Date.now() + 8e3; ; ) {
        ({ video } = main(e));
        if (video && video.readyState >= 1 && main(e).duration > 0 || Date.now() > until) break;
        await sleep(300);
      }
      quiet(video, true);
      Object.assign(W(), { rate, muted: true, source: main(e).source?.id ?? null, repins: 0, id: site().info().id });
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
    "capture.seek": (p = {}) => {
      const e = need();
      const t = Math.max(0, Number(p.t) || 0);
      const { video } = main(e);
      seekTo(video, t);
      keepRate(video);
      play(video);
      return status();
    },
    // 一条轨上排在最前面的、同一段连续字节里的若干次 append，拼起来最多 max 字节
    "capture.pull": (p = {}) => {
      const e = need();
      const tr = e.st.tracks[Number(p.track)];
      if (!tr) throw err("BAD_PARAMS", `\u6CA1\u6709\u7B2C ${p.track} \u6761\u8F68`);
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
      for (const b of take) {
        buf.set(b, at);
        at += b.byteLength;
      }
      e.st.held -= n;
      e.st.pulled += n;
      let bin = "";
      for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
      return {
        track: tr.id,
        source: tr.source,
        mime: tr.mime,
        run,
        bytes: n,
        more: tr.chunks.length,
        __binary: { data: btoa(bin), type: tr.mime.split(";")[0] }
      };
    },
    "capture.stop": () => {
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
    }
  };
  (window.__vcorpLoads ||= {}).capture = {
    version: "1.0.0+8bc837",
    async ready() {
      if (!window.MediaSource) return { ok: false, reason: "\u8FD9\u4E2A\u9875\u9762\u6CA1\u6709 MediaSource" };
      return { ok: true, early: !!early() };
    },
    call(action, payload) {
      if (!ALLOWED.has(action) || !ACTIONS[action]) throw err("LOAD_DENIED", `capture \u5C0F\u8111\u4E0D\u63A5\u53D7 ${action}`);
      return ACTIONS[action](payload || {});
    }
  };
})();
