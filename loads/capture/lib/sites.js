// 站点适配器：只管播放器怎么控制（锁画质、播放、跳转）和怎么认出正片。
// 没有适配器的站只用 <video> 的标准属性。录制本身（early.js）不分站点。

const youtube = {
  match: (host) => /(^|\.)youtube\.com$/.test(host),
  player: () => document.querySelector('#movie_player'),
  info() {
    const p = this.player();
    const d = p?.getVideoData?.() || {};
    return {
      id: d.video_id || '', title: d.title || '', author: d.author || '',
      duration: Number(p?.getDuration?.()) || 0,
      quality: p?.getPlaybackQuality?.() || '',
      ad: !!p?.classList?.contains('ad-showing'),
      live: !!d.isLive,
    };
  },
  // 画质标签 → 高度。auto 不算
  HEIGHT: { tiny: 144, small: 240, medium: 360, large: 480, hd720: 720, hd1080: 1080, hd1440: 1440, hd2160: 2160, hd2880: 2880, highres: 4320 },
  lockQuality(maxHeight) {
    const p = this.player();
    const levels = (p?.getAvailableQualityLevels?.() || []).filter((q) => this.HEIGHT[q]);
    const pick = levels.filter((q) => this.HEIGHT[q] <= maxHeight).sort((a, b) => this.HEIGHT[b] - this.HEIGHT[a])[0] || levels.sort((a, b) => this.HEIGHT[a] - this.HEIGHT[b])[0];
    if (pick && p?.setPlaybackQualityRange) p.setPlaybackQualityRange(pick, pick);
    return pick || '';
  },
  // 播放器自己记着音量和静音：只改 <video> 的，换画质重建播放源时会被它改回去
  isMuted() { const p = this.player(); return p?.isMuted ? !!p.isMuted() : null; },
  volume() { const p = this.player(); return p?.getVolume ? Number(p.getVolume()) / 100 : null; },
  // 播放器把音量记进用户偏好：quiet(false) 时按 start 前的值还回去
  quiet(on, volume, muted) {
    const p = this.player();
    if (!p?.setVolume) return false;
    if (on) { p.setVolume(0); p.unMute(); } else { p.setVolume(Math.round((volume ?? 1) * 100)); if (muted) p.mute(); else p.unMute(); }
    return true;
  },
  seek(t) { const p = this.player(); if (p?.seekTo) { p.seekTo(t, true); return true; } return false; },
  play() { const p = this.player(); if (p?.playVideo) { p.playVideo(); return true; } return false; },
  pause() { const p = this.player(); if (p?.pauseVideo) { p.pauseVideo(); return true; } return false; },
};

const generic = {
  match: () => true,
  info: () => ({ id: '', title: document.title.slice(0, 200), author: '', duration: 0, quality: '', ad: false, live: false }),
  lockQuality: () => '',
  isMuted: () => null,
  volume: () => null,
  quiet: () => false,
  seek: () => false,
  play: () => false,
  pause: () => false,
};

export function siteFor(host) {
  return [youtube].find((s) => s.match(host)) || generic;
}
