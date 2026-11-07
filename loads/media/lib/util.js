// media 能力包的公用小工具。纯函数的部分在 Node 里也能跑（test/media-load.test.js）。

// 「1.2万」「3.4w」「12,345」「1.5M」→ 数字；读不出来给 null
export function num(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[,\s]/g, '').trim();
  const m = /^(-?\d+(?:\.\d+)?)(万|w|W|亿|k|K|m|M|b|B)?\+?$/.exec(s);
  if (!m) return null;
  const mult = { 万: 1e4, w: 1e4, W: 1e4, 亿: 1e8, k: 1e3, K: 1e3, m: 1e6, M: 1e6, b: 1e9, B: 1e9 }[m[2]] || 1;
  return mult === 1 ? parseFloat(m[1]) : Math.round(parseFloat(m[1]) * mult);
}

// 取第一个有值的键：同一份数据有驼峰（SSR）和下划线（接口原样）两种写法
export function pick(o, ...keys) {
  if (!o || typeof o !== 'object') return undefined;
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
}

export const first = (a) => (Array.isArray(a) && a.length ? a[0] : undefined);

export function https(u) {
  if (typeof u !== 'string' || !u) return null;
  if (u.startsWith('//')) return `https:${u}`;
  return u;
}

// 秒，最多两位小数
export const sec = (x) => (Number.isFinite(+x) ? Math.round(+x * 100) / 100 : null);

// "1:02:03" / "02:03" → 秒
export function clock(s) {
  const parts = String(s).split(':').map(Number);
  if (!parts.length || parts.some((n) => !Number.isFinite(n))) return null;
  return parts.reduce((a, n) => a * 60 + n, 0);
}

// 描述里的「0:00 开场」「12:30 - 结尾」这种时间轴 → 章节
export function chaptersFromText(text) {
  const out = [];
  for (const line of String(text || '').split(/\n/)) {
    const m = /^\s*[[(（【]?((?:\d{1,2}:)?\d{1,2}:\d{2})[\])）】]?\s*[-–—:：|]?\s*(.+?)\s*$/.exec(line);
    if (!m) continue;
    const t = clock(m[1]);
    if (t !== null && m[2]) out.push({ title: m[2].slice(0, 120), detail: '', startSec: t, thumbUrl: null });
  }
  // 只有从 0 开始、按顺序排的才像章节；零散一两个时间点不算
  if (out.length < 2 || out[0].startSec > 10) return [];
  for (let i = 1; i < out.length; i++) if (out[i].startSec <= out[i - 1].startSec) return [];
  return out;
}

// 文字里的 #话题
export function hashtags(text) {
  const tags = new Set();
  for (const m of String(text || '').matchAll(/#([^\s#[\]【】,，。!！?？@]{1,40})/g)) tags.add(m[1]);
  return [...tags];
}

export function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export function err(code, message) { return Object.assign(new Error(message), { code }); }

// 标签去重，不分大小写（「ai教程」和「AI教程」算一个），留先出现的写法
export function uniqTags(list) {
  const seen = new Set();
  return list.filter((t) => {
    const k = String(t || '').trim().toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// 视频流按清晰度从高到低、同清晰度按体积从小到大；最多留 max 条
export function sortStreams(list, max = 12) {
  const seen = new Set();
  return list
    .filter((s) => s && (s.url || s.ipBound) && !seen.has(s.url || `${s.quality}|${s.codec}|${s.format}`) && seen.add(s.url || `${s.quality}|${s.codec}|${s.format}`))
    .sort((a, b) => (Math.min(b.height || 0, b.width || 0) - Math.min(a.height || 0, a.width || 0)) || ((a.sizeBytes || 9e15) - (b.sizeBytes || 9e15)))
    .slice(0, max);
}

// 评论去重（按 id，没有 id 按 用户+正文），按赞数排
export function mergeComments(lists, limit = 200) {
  const map = new Map();
  for (const list of lists) {
    for (const c of list || []) {
      if (!c || !c.text) continue;
      const key = c.id || `${c.user}|${c.text}`;
      const old = map.get(key);
      if (!old || (c.likes ?? -1) > (old.likes ?? -1)) map.set(key, { ...old, ...c });
    }
  }
  return [...map.values()].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, limit);
}

// 网页里 window.__hcNet 的记录（net-hook.js），按 URL 片段挑出来、把 JSON 解开
// entries 可以是数组，也可以是返回数组的函数（页面侧传函数，每次读到的都是最新记录）
export function netJson(entries, test) {
  const out = [];
  for (const r of (typeof entries === 'function' ? entries() : entries) || []) {
    const url = String(r?.url || '');
    if (!(typeof test === 'function' ? test(url) : url.includes(test))) continue;
    if (!r.body) continue;
    try { out.push({ url, t: r.t, json: JSON.parse(r.body) }); } catch { /* 不是 JSON */ }
  }
  return out;
}

// 递归找满足条件的对象（列表页的接口结构各式各样，按「长得像一条视频」找）
export function walk(root, visit, maxDepth = 9) {
  const seen = new Set();
  const go = (v, d) => {
    if (!v || typeof v !== 'object' || d > maxDepth || seen.has(v)) return;
    seen.add(v);
    if (visit(v) === false) return;
    if (Array.isArray(v)) { for (const x of v) go(x, d + 1); return; }
    for (const k of Object.keys(v)) go(v[k], d + 1);
  };
  go(root, 0);
}

// YouTube / 通用：{simpleText} 或 {runs:[{text}]} 或 {content}
export function ytText(t) {
  if (!t) return '';
  if (typeof t === 'string') return t;
  if (t.simpleText) return t.simpleText;
  if (Array.isArray(t.runs)) return t.runs.map((r) => r.text || '').join('');
  if (typeof t.content === 'string') return t.content;
  return '';
}
