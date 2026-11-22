// 哨兵（watch）的规矩 —— 和 cloud-policy.js 一样是纯函数、不碰 chrome.*，在 Node 里逐条测
// （test/watch-policy.test.js）。
//
// 哨兵是一条长期的读取：每隔一会儿，用这个浏览器的登录去看一个网页或接口，有新条目才告诉服务器，
// 服务器再叫醒任务去处理（opus-video-maker docs/TRIGGERS.md 第 11 节是双方的约定）。
// 规则是服务器下发的，按「服务器会被攻破」来收：
//   - 只认声明式规则（JSON 路径、CSS 选择器），不收代码；
//   - 只读用户在扩展里确认过的那个网站和地址，目标变大就得重新确认；
//   - 出门的只有规则里点名的字段，每个都截短，一次最多 50 条。

import { normalizeSite, hostMatches } from './cloud-policy.js';

export const WATCH_MAX = 20;              // 一个浏览器最多这么多个哨兵
export const WATCH_EVERY_MIN = 60;        // 秒
export const WATCH_EVERY_DEFAULT = 300;
export const WATCH_KEY_MAX = 200;
export const WATCH_FIELD_MAX = 500;
export const WATCH_FIELDS_MAX = 12;
export const WATCH_EVENT_ITEMS = 50;      // 一个事件最多带这么多条
export const WATCH_SCAN_MAX = 500;        // 一次检查最多认这么多条（比对用，不全出门）
export const WATCH_SEEN_MAX = 2000;       // 记住看过的条目数
export const WATCH_BODY_MAX = 1024 * 1024;
export const WATCH_FAIL_MAX = 5;          // 连续失败这么多次，算哨兵失效
export const WATCH_SITE_GAP_MS = 10000;   // 同一个网站两次检查至少隔开
export const WATCH_PROBE_ITEMS = 10;
export const WATCH_READY_MS = 20000;      // 页面模式等 ready 最多这么久

const err = (message) => Object.assign(new Error(message), { code: 'WATCH_BAD' });
const oneLine = (v, max) => String(v ?? '').replace(/[\x00-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const shortText = (v, max) => String(v ?? '').replace(/[\x00-\x08\x0b-\x1f\x7f]+/g, ' ').trim().slice(0, max);
const OWN = (o, k) => o !== null && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k);

const FIELD_NAME = /^[A-Za-z_][A-Za-z0-9_]{0,31}$/;
const NAME = '[A-Za-z_$][\\w$-]*';
const ITEMS_PATH = new RegExp(`^\\$(?:\\.${NAME}|\\[\\d{1,6}\\]|\\[\\*\\])*$`);
const REL_PATH = new RegExp(`^(?:${NAME}|\\[\\d{1,6}\\])(?:\\.${NAME}|\\[\\d{1,6}\\])*$`);
const ATTR = /^[A-Za-z_:][-A-Za-z0-9_:.]{0,63}$/;
const SEL_MAX = 300;

// ---------- 路径 ----------

// 「$.data.list[*]」「a.b[0].c」→ [{k:'data'},{k:'list'},{all:true}]；不合语法回 null
export function parsePath(path) {
  const s = String(path ?? '');
  const out = [];
  const re = /\.?([A-Za-z_$][\w$-]*)|\[(\d{1,6})\]|\[\*\]/y;
  let i = s.startsWith('$') ? 1 : 0;
  while (i < s.length) {
    re.lastIndex = i;
    const m = re.exec(s);
    if (!m) return null;
    if (m[1] !== undefined) out.push({ k: m[1] });
    else if (m[2] !== undefined) out.push({ i: Number(m[2]) });
    else out.push({ all: true });
    i = re.lastIndex;
  }
  return out;
}

function walk(cur, segs) {
  for (const s of segs) {
    if (cur === undefined || s.all) return undefined;
    if (s.k !== undefined) cur = OWN(cur, s.k) ? cur[s.k] : undefined;   // 只走自有属性，不碰原型链
    else cur = Array.isArray(cur) && s.i < cur.length ? cur[s.i] : undefined;
  }
  return cur;
}

// 条目里取一个值（相对路径，不带 [*]）。空路径就是条目自己。取不到回 undefined。
export function pickJson(obj, path) {
  if (path === '' || path == null) return obj;
  const segs = parsePath(path);
  return segs ? walk(obj, segs) : undefined;
}

// 接口响应 → 条目数组。路径里有一个 [*] 就从那里展开；没有的话，路径指到的必须是数组。
export function jsonItems(obj, path) {
  const segs = parsePath(path);
  if (!segs) return [];
  const star = segs.findIndex((s) => s.all);
  if (star < 0) {
    const v = walk(obj, segs);
    return Array.isArray(v) ? v : [];
  }
  const arr = walk(obj, segs.slice(0, star));
  if (!Array.isArray(arr)) return [];
  const rest = segs.slice(star + 1);
  return arr.map((x) => walk(x, rest)).filter((x) => x !== undefined);
}

// 页面模式的字段写法：''（条目自己的文字）、'@属性'、'子选择器'（取文字）、'子选择器@属性'
export function parsePageField(raw) {
  const s = String(raw ?? '').trim();
  if (s.length > SEL_MAX || /[{}]/.test(s)) return null;
  if (!s) return { sel: '', attr: '' };
  const at = s.lastIndexOf('@');
  // 选择器 [href^="mailto:a@b"] 里也有 @：只有 @ 后面整段像属性名才算
  if (at >= 0 && ATTR.test(s.slice(at + 1))) return { sel: s.slice(0, at).trim(), attr: s.slice(at + 1) };
  return { sel: s, attr: '' };
}

const okSelector = (s) => typeof s === 'string' && !!s.trim() && s.length <= SEL_MAX && !/[{}]/.test(s);

// ---------- 规则 ----------

function cleanWords(list) {
  const out = [];
  for (const w of Array.isArray(list) ? list : []) {
    const t = oneLine(w, 60);
    if (t && !out.includes(t)) out.push(t);
    if (out.length >= 20) break;
  }
  return out;
}

function validTz(tz) {
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
}

// 用户设置：缺的补默认值，越界的夹回范围；认不出来的才报错。
export function cleanWatchSettings(raw, fallbackName = '') {
  const s = raw && typeof raw === 'object' ? raw : {};
  const every = Number(s.every ?? WATCH_EVERY_DEFAULT);
  if (!Number.isFinite(every)) throw err('检查间隔要是数字（秒）');
  let hours = null;
  if (s.hours != null) {
    const h = Array.isArray(s.hours) ? s.hours.map(Number) : [];
    if (h.length !== 2 || !h.every((n) => Number.isInteger(n) && n >= 0 && n <= 24) || h[0] === h[1]) {
      throw err('运行时段要是 0 到 24 点之间的两个不同整点');
    }
    hours = h;
  }
  const batch = Number(s.batchMs ?? 120000);
  const runs = Number(s.maxRunsPerDay ?? 48);
  return {
    name: oneLine(s.name, 60) || oneLine(fallbackName, 60) || '哨兵',
    every: Math.min(Math.max(Math.round(every), WATCH_EVERY_MIN), 86400),
    hours,
    tz: typeof s.tz === 'string' && s.tz.length <= 64 && validTz(s.tz) ? s.tz : 'Asia/Shanghai',
    include: cleanWords(s.include),
    exclude: cleanWords(s.exclude),
    paused: s.paused === true,
    batchMs: Number.isFinite(batch) ? Math.min(Math.max(Math.round(batch), 0), 3600000) : 120000,
    maxRunsPerDay: Number.isFinite(runs) ? Math.min(Math.max(Math.round(runs), 1), 288) : 48,
  };
}

// 要用户确认的那部分：网站、地址、出门的字段名
export function cleanWatchTarget(raw) {
  const t = raw && typeof raw === 'object' ? raw : {};
  const site = normalizeSite(t.site);
  if (!site) throw err('target.site 要是一个网站域名，比如 goofish.com');
  const url = String(t.url ?? '');
  let u;
  try { u = new URL(url); } catch { throw err('target.url 要是完整的网址'); }
  if (url.length > 2048 || (u.protocol !== 'https:' && u.protocol !== 'http:') || u.username || u.password) {
    throw err('target.url 只能是 http(s) 网址，不带账号密码');
  }
  if (!hostMatches(u.hostname.toLowerCase(), site)) throw err(`target.url 不在 ${site} 上：${u.hostname}`);
  const fields = [];
  for (const f of Array.isArray(t.fields) ? t.fields : []) {
    if (typeof f !== 'string' || !FIELD_NAME.test(f)) throw err(`字段名不合规：${String(f).slice(0, 40)}（字母、数字、下划线）`);
    if (!fields.includes(f)) fields.push(f);
  }
  if (!fields.length) throw err('target.fields 至少要有一个字段名');
  if (fields.length > WATCH_FIELDS_MAX) throw err(`最多 ${WATCH_FIELDS_MAX} 个字段`);
  return { site, url: u.href, fields };
}

// 怎么认出条目：归 agent 管。形状在这里查；选择器到底选不选得中，在页面里才知道。
export function cleanWatchDetect(raw, fields) {
  const d = raw && typeof raw === 'object' ? raw : {};
  const { mode } = d;
  if (mode !== 'api' && mode !== 'page') throw err('detect.mode 只能是 api 或 page');
  const map = d.fields && typeof d.fields === 'object' && !Array.isArray(d.fields) ? d.fields : null;
  if (!map) throw err('detect.fields 要是 { 字段名: 路径 }');
  const keys = Object.keys(map);
  if (keys.length !== fields.length || !fields.every((f) => OWN(map, f))) {
    throw err(`detect.fields 的字段名要和 target.fields 一致：${fields.join(', ')}`);
  }
  const out = {};
  if (mode === 'api') {
    const items = String(d.items ?? '');
    if (!ITEMS_PATH.test(items) || (items.match(/\[\*\]/g) || []).length > 1) {
      throw err('detect.items 要是 $ 开头的路径，比如 $.data.list[*]（最多一个 [*]）');
    }
    const key = String(d.key ?? '');
    if (!REL_PATH.test(key)) throw err('detect.key 要是条目里的路径，比如 id 或 user.id');
    for (const f of fields) {
      const p = String(map[f] ?? '');
      if (p !== '' && !REL_PATH.test(p)) throw err(`字段 ${f} 的路径不合规：${p.slice(0, 60)}`);
      out[f] = p;
    }
    return { mode, items, key, fields: out };
  }
  if (!okSelector(d.items)) throw err('detect.items 要是选出条目的 CSS 选择器');
  if (!parsePageField(d.key)) throw err('detect.key 的写法：@属性、子选择器，或 子选择器@属性');
  for (const f of fields) {
    if (!parsePageField(map[f])) throw err(`字段 ${f} 的写法不合规`);
    out[f] = String(map[f] ?? '').trim();
  }
  if (d.ready !== undefined && d.ready !== '' && !okSelector(d.ready)) throw err('detect.ready 要是 CSS 选择器');
  return { mode, items: d.items.trim(), key: String(d.key ?? '').trim(), fields: out, ...(d.ready ? { ready: String(d.ready).trim() } : {}) };
}

// 服务器下发的一个哨兵 → { ok: true, watch } 或 { ok: false, error }。
// count：这个浏览器上已有的别的哨兵数（不含它自己）。
export function checkWatch(raw, { count = 0 } = {}) {
  try {
    const w = raw && typeof raw === 'object' ? raw : {};
    const id = String(w.id ?? '');
    const jobId = String(w.jobId ?? '');
    if (!/^w_[A-Za-z0-9_-]{1,80}$/.test(id)) throw err('哨兵 id 不合规');
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(jobId)) throw err('jobId 不合规');
    if (count >= WATCH_MAX) throw err(`一个浏览器最多 ${WATCH_MAX} 个哨兵`);
    const rev = Number(w.rev ?? 0);
    if (!Number.isSafeInteger(rev) || rev < 0) throw err('rev 不合规');
    const title = oneLine(w.title, 120);
    const target = cleanWatchTarget(w.target);
    const detect = cleanWatchDetect(w.detect, target.fields);
    const settings = cleanWatchSettings(w.settings, title);
    return { ok: true, watch: { id, jobId, title, rev, target, detect, settings, note: oneLine(w.note, 500) } };
  } catch (e) {
    return { ok: false, error: e.code === 'WATCH_BAD' ? e.message : `哨兵规则不合规：${e.message}` };
  }
}

// 沙箱的 watch 命令：{ action: 'probe', watch: { target, detect } }。网站必须是本任务能去的。
export function checkWatchProbe(params, hosts) {
  if (params?.action !== 'probe') throw err('watch 只支持 action: "probe"（试跑一次规则，什么都不保存）');
  const w = params.watch && typeof params.watch === 'object' ? params.watch : {};
  const target = cleanWatchTarget(w.target);
  if (!(hosts || []).some((root) => hostMatches(target.site, root) || hostMatches(root, target.site))) {
    throw err(`只能试跑本任务允许的网站：${target.site}。先用 sites 申请`);
  }
  return { action: 'probe', watch: { target, detect: cleanWatchDetect(w.detect, target.fields) } };
}

// 新的目标在不在用户确认过的范围里：同一个网站、同一个地址，字段只少不多
export function targetCovered(confirmed, target) {
  if (!confirmed || !target) return false;
  return confirmed.site === target.site && confirmed.url === target.url
    && Array.isArray(target.fields) && target.fields.every((f) => (confirmed.fields || []).includes(f));
}

// ---------- 条目 ----------

const fieldText = (v) => {
  if (v == null) return '';
  if (typeof v === 'object') { try { return JSON.stringify(v); } catch { return ''; } }
  return String(v);
};

// 抽出来的条目 → 只留声明的字段；key 非空、去重；每样截短
export function cleanEventItems(items, fields, max = WATCH_SCAN_MAX) {
  const out = [];
  const keys = new Set();
  for (const it of Array.isArray(items) ? items : []) {
    if (!it || typeof it !== 'object') continue;
    const key = shortText(fieldText(it.key), WATCH_KEY_MAX);
    if (!key || keys.has(key)) continue;
    keys.add(key);
    const f = {};
    for (const name of fields) f[name] = shortText(fieldText(it.fields?.[name]), WATCH_FIELD_MAX);
    out.push({ key, fields: f });
    if (out.length >= max) break;
  }
  return out;
}

// 接口模式：一份 JSON 响应 → 条目（还没清洗）
export function apiExtract(json, detect) {
  return jsonItems(json, detect.items).map((it) => ({
    key: pickJson(it, detect.key),
    fields: Object.fromEntries(Object.entries(detect.fields).map(([f, p]) => [f, pickJson(it, p)])),
  }));
}

// 字段内容的指纹：同一个 key 的内容变了（同一个会话来了新消息）也算新
export function itemHash(item, fields) {
  let h = 0x811c9dc5;
  const s = fields.map((f) => item.fields?.[f] ?? '').join('\u0001');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16);
}

// 和看过的比：返回新条目和更新后的「看过」表（这次看到的在前，旧的补到上限）。
// 旧的不马上丢：一条暂时从列表上掉下去、过会儿又回来，不该算新。
export function diffItems(items, seen, fields) {
  const old = seen && typeof seen === 'object' ? seen : {};
  const fresh = [];
  const next = {};
  for (const it of items) {
    const h = itemHash(it, fields);
    if (old[it.key] !== h) fresh.push(it);
    next[it.key] = h;
  }
  let n = Object.keys(next).length;
  for (const [k, h] of Object.entries(old)) {
    if (n >= WATCH_SEEN_MAX) break;
    if (!(k in next)) { next[k] = h; n++; }
  }
  return { fresh, seen: next };
}

// 包含/排除关键词：在声明的字段里找，不分大小写
export function watchMatch(item, settings) {
  const text = Object.values(item.fields || {}).join(' ').toLowerCase();
  const inc = settings?.include || [];
  const exc = settings?.exclude || [];
  if (inc.length && !inc.some((w) => text.includes(w.toLowerCase()))) return false;
  return !exc.some((w) => text.includes(w.toLowerCase()));
}

// 新条目切成一个个事件，每个最多 WATCH_EVENT_ITEMS 条
export function chunkEvents(items, size = WATCH_EVENT_ITEMS) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// ---------- 时间 ----------

function localParts(now, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz || 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(now)).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

// 用户那边的日期，统计「今天」用
export const watchDay = (now, tz) => localParts(now, tz).day;

// 运行时段 [from, to)，按用户的时区；[22, 7] 跨午夜
export function watchInHours(settings, now = Date.now()) {
  if (!settings?.hours) return true;
  const [from, to] = settings.hours;
  const h = localParts(now, settings.tz).hour;
  return from < to ? h >= from && h < to : h >= from || h < to;
}
