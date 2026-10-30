// 云端通道的规矩 —— 远端（maker.vcorp.ai 这类服务）能让这个浏览器做什么，全写在这里。
//
// 这个文件是整条云端链路的安全边界，所以它是纯函数、不碰任何 chrome.* API，
// 能在 Node 里逐条测（test/cloud-policy.test.js）。
//
// 设计前提：**服务器会被攻破**。本机那条桥只有本机进程能连（verifyClient + token），
// 云端通道却是这个浏览器主动连出去的——对面要是被人拿下，下发的每一条命令都是敌意的。
// 所以安全不能靠「服务器不会乱发」，只能靠扩展这一侧拒绝：
//
//   1. 命令白名单：只有操作页面的那一小组。eval / fetch / network / download / reload
//      一律没有——它们能读任意接口、带着 cookie 发请求、往磁盘写东西。
//   2. 域名白名单：云端开的标签页只能停在用户允许过的网站上（侧栏里的名单），
//      以及这个任务里用户点头的网站上，跳出去就屏蔽内容。扩展里没有预设的平台表。
//   3. 标签页隔离：云端只看得见、只碰得到它自己开的标签页，用户自己的页面一个都不行。
//   4. 文件来源：上传只能用配对服务器上的素材 URL，不收本机路径——否则一句
//      upload(path:"~/.ssh/id_rsa") 就能把私钥发到公开平台上。
//   5. 每个任务要用户点头，或用户主动开了自动允许。自动允许盖住新任务，以及通用
//      任务信封上一开始带着的网站；盖不住任务开始之后追加的网站和文件夹。有命令数上限。
//
// 站点申请（sites 命令）：每个任务（发布也好、「到兼职网站上帮我找个工作」也好）
// 都靠它说明要去哪些网站。没开自动允许时，新任务的第一份网站清单要用户点头；
// 任务开始之后每多一个站点都要再点一次头，自动允许管不到这次追加。
// 用户亲手点「允许」的网站进入允许名单（侧栏可逐个移除），以后的任务用到它们不再问；
// 自动允许只放行这一个任务，不往名单里加。一个任务新批的网站最多 SITES_MAX 个。

export const DEFAULT_ORIGIN = 'https://maker.vcorp.ai';

// 远端能调的命令。tabs 的子动作另外管（见 checkCommand）。
export const CLOUD_CMDS = new Set([
  'tabs', 'navigate', 'snapshot', 'click', 'type', 'fill', 'select', 'key', 'scroll',
  'wait', 'read_text', 'query', 'read', 'screenshot', 'upload', 'act', 'ask', 'status', 'sites',
  // 本地文件夹：只读、按任务批准、扩展名白名单。读文件在 service worker 里做，
  // 选文件夹和重新授权只能发生在扩展自己的页面（见 folders.js 顶部的结论）。
  'folders', 'fs_list', 'fs_read',
]);

// ---------- 站点申请 ----------

export const SITES_MAX = 20;

// 这些「后缀」底下是千千万万个别人的网站，批准了它等于批准了全部
const SHARED_SUFFIXES = new Set([
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn', 'ac.cn', 'com.hk', 'com.tw', 'org.tw', 'com.sg',
  'co.uk', 'org.uk', 'ac.uk', 'co.jp', 'ne.jp', 'or.jp', 'co.kr', 'com.au', 'net.au', 'co.nz', 'com.br',
  'github.io', 'gitee.io', 'vercel.app', 'netlify.app', 'pages.dev', 'workers.dev', 'herokuapp.com',
  'blogspot.com', 'appspot.com', 'web.app', 'firebaseapp.com', 'azurewebsites.net', 'cloudfront.net',
]);

// 「zhipin.com」「https://www.zhipin.com/web/geek/job」→ 'zhipin.com'；不像一个公网站点就 null。
// www. 去掉：批准的是这个站点，含它的子域。IP、localhost、单段名、共享后缀一律不收。
export function normalizeSite(raw) {
  let s = String(raw || '').trim().toLowerCase();
  if (!s) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//.test(s)) s = `https://${s}`;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.username || u.password) return null;
  let h = u.hostname.replace(/\.$/, '');
  if (h.startsWith('www.')) h = h.slice(4);
  if (h.length > 253 || !h.includes('.')) return null;
  if (/^[\d.]+$/.test(h) || h.includes(':') || h.startsWith('[')) return null;
  if (!h.split('.').every((l) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l))) return null;
  if (/^\d+$/.test(h.split('.').at(-1))) return null;
  if (SHARED_SUFFIXES.has(h) || h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local')) return null;
  return h;
}

// 一份申请清单 → 去重、合规、限量的站点；不合规的另列出来告诉 agent
export function cleanSites(list) {
  const ok = [];
  const bad = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const h = normalizeSite(raw);
    if (!h) { bad.push(String(raw).slice(0, 80)); continue; }
    if (!ok.includes(h)) ok.push(h);
  }
  return { sites: ok.slice(0, SITES_MAX), bad };
}

// act 里允许出现的步骤
const ACT_STEPS = new Set(['click', 'type', 'fill', 'select', 'key', 'scroll', 'wait', 'navigate', 'read', 'assert', 'if', 'repeat']);

export const TASK_CMD_CAP = 1500;        // 一个任务最多这么多条命令，防失控循环把账号刷进风控
export const TASK_IDLE_MS = 3 * 3600e3;  // 批准过的任务闲置 3 小时作废，下次要重新点头
export const MEDIA_MAX = 2 * 1024 ** 3;  // 素材上限，与 maker 那侧的上传上限一致

// 本地文件夹。数字和 opus-video-maker/extlink.js 的 PULL_MAX 必须一致：
// 扩展拒绝超限的文件，服务器拒绝超限的上传，两边对不齐就会一截一放。
export const FS_FILE_MAX = 32 * 1024 * 1024;     // 单个文件
export const FS_TASK_MAX = 256 * 1024 * 1024;    // 一个任务累计读走的字节
export const FS_LIST_MAX = 2000;                 // 一次列出的条目
export const FS_DEPTH_MAX = 8;
export const FS_FOLDERS_MAX = 8;                 // 一个浏览器最多挂这么多个；一个任务也最多批准这么多个
export const FS_EXTS = new Set(['.md', '.markdown', '.txt', '.pdf', '.docx', '.csv', '.json', '.html', '.htm']);
const FS_SKIP = new Set(['node_modules', '__pycache__', '.git', '.venv']);

const err = (code, message) => Object.assign(new Error(message), { code });

// 配对的服务器地址：只收 https，开发时允许本机 http。路径、账号、端口外的东西一律不认。
export function normalizeOrigin(raw) {
  let u;
  try { u = new URL(String(raw || '').trim()); } catch { return null; }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname);
  if (u.protocol !== 'https:' && !(u.protocol === 'http:' && local)) return null;
  if (u.username || u.password) return null;
  return u.origin;
}

export function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

export const hostMatches = (host, root) => host === root || host.endsWith('.' + root);

// 允许名单：用户点过「允许」的根域。读存储时也过一遍，坏数据不进白名单。
export function cleanAllowList(list) {
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const h = normalizeSite(raw);
    if (h && !out.includes(h)) out.push(h);
  }
  return out;
}

// 一个任务实际能停的根域：允许名单，加上这个任务里批准过的网站。
export function taskHosts(task, allow = []) {
  return [...new Set([...cleanAllowList(allow), ...(task?.sites || [])])];
}

// 一份申请里，哪些还要问用户。
// covered 是允许名单：申请的站点被某个根域盖住（含子域）就不用问。
// 已经批准或拒绝过的不重复问。本任务新批的网站总数不超过 SITES_MAX，多出来的放 overflow。
export function sitesToAsk(add, { covered = [], sites = [], refused = [] } = {}) {
  const have = new Set(sites);
  const no = new Set(refused);
  const byList = [];
  const fresh = [];
  const seen = new Set();
  for (const h of Array.isArray(add) ? add : []) {
    if (typeof h !== 'string' || seen.has(h)) continue;
    seen.add(h);
    if (covered.some((root) => hostMatches(h, root))) { byList.push(h); continue; }
    if (have.has(h) || no.has(h)) continue;
    fresh.push(h);
  }
  const room = Math.max(0, SITES_MAX - sites.length);
  return { ask: fresh.slice(0, room), covered: byList, overflow: fresh.slice(room) };
}

// 一个页面地址在不在白名单里。about:blank 是新开标签页的出生地，放行；
// 其它非 http(s) 一律不行（chrome://、file://、data:、javascript: 都在这里被挡）。
export function urlAllowed(url, hosts) {
  if (url === 'about:blank' || url === '') return true;
  let u;
  try { u = new URL(url); } catch { return false; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  if (u.username || u.password) return false;
  const h = u.hostname.toLowerCase();
  return hosts.some((root) => hostMatches(h, root));
}

// 显示名是用户自己起的，不是磁盘路径。不要斜杠，这样它才能当成本地目录名，也才能安全地报给服务器。
export function cleanFolderName(raw) {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!s || s.length > 40 || s === '.' || s === '..') return null;
  if (/[\\/\x00-\x1f]/.test(s)) return null;
  return s;
}

export function cleanFolderNames(list) {
  const ok = [];
  const bad = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const name = cleanFolderName(raw);
    if (!name) { bad.push(String(raw).slice(0, 80)); continue; }
    if (!ok.includes(name)) ok.push(name);
  }
  return { names: ok.slice(0, FS_FOLDERS_MAX), bad };
}

// 已经允许、已经拒绝的不再问。空名单就是「先告诉我挂了哪些」，什么都不问。
export function foldersToAsk(use, { granted = [], refused = [] } = {}) {
  const have = new Set(granted);
  const no = new Set(refused);
  const ask = [];
  const already = [];
  const denied = [];
  for (const name of Array.isArray(use) ? use : []) {
    if (typeof name !== 'string') continue;
    if (have.has(name)) { if (!already.includes(name)) already.push(name); continue; }
    if (no.has(name)) { if (!denied.includes(name)) denied.push(name); continue; }
    if (!ask.includes(name)) ask.push(name);
  }
  return { ask, already, refused: denied };
}

// 相对路径。'' 是文件夹根；不合法返回 null（和根区分开）。
// 不收绝对路径、反斜杠、.. 和控制字符——服务器被攻破时这是唯一一道路径闸。
export function normalizeRelPath(raw) {
  const s = String(raw ?? '');
  // 冒号挡掉 Windows 盘符（C:/...）和 NTFS 流。句柄只能按名字往下走，盘符在这里没有意义。
  if (s.includes('\\') || s.includes(':') || /[\x00-\x1f]/.test(s) || s.startsWith('/')) return null;
  const parts = s.split('/').filter((p) => p && p !== '.');
  if (parts.some((p) => p === '..')) return null;
  return parts.join('/');
}

export const skipEntry = (name) => !name || name.startsWith('.') || FS_SKIP.has(name);

export function fileAllowed(name) {
  const base = String(name || '').split('/').pop();
  if (!base || base.startsWith('.')) return false;
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return false;
  return FS_EXTS.has(base.slice(dot).toLowerCase());
}

// 只支持 *（一段里）和 **（跨目录）。不解释 shell，不接收 ..。
export function matchGlob(rel, glob) {
  const g = String(glob || '').trim();
  if (!g) return true;
  let re = '';
  const s = g.replace(/\\/g, '/');
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '*' && s[i + 1] === '*') {
      if (s[i + 2] === '/') { re += '(?:.*/)?'; i += 2; }
      else { re += '.*'; i += 1; }
    } else if (s[i] === '*') re += '[^/]*';
    else if (s[i] === '?') re += '[^/]';
    else re += s[i].replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`).test(rel);
}

// 文件字节只能上传到配对服务器的一次性地址。和 mediaAllowed 同一条理由：
// 不然服务器会让扩展把用户的文件 PUT 到攻击者的主机上。
export function pullUrlAllowed(url, origin) {
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.origin === origin && /^\/api\/ext\/pull\/[A-Za-z0-9_-]{16,64}$/.test(u.pathname)
    && !u.username && !u.password && !u.search && !u.hash;
}

// 素材地址必须指回配对的那台服务器的素材接口——扩展只从那里取文件
export function mediaAllowed(url, origin) {
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.origin === origin && u.pathname.startsWith('/api/ext/media/') && !u.username && !u.password;
}

// 一条新任务开场时的批准状态。sites 是信封上一开始的网站清单（已清洗），covered 是允许名单。
// 名单里已有的放进 use，只给用户看；名单外的放进 ask，点「允许」才写进名单。
// 有网站的任务没开自动允许就要用户点头，哪怕网站全在名单里：每个任务都要一次同意。
// auto 打开：直接 approved，名单外的网站只给这个任务（写入 sites，不进名单），
// 也不要留在 ask，否则紧接着的 sites 命令会把同一份清单再问一遍。
// auto 盖不住任务开始之后追加的网站（sitesToAsk）和文件夹（foldersToAsk）。
// 没有网站的任务本来就是 approved（只能申请文件夹，文件夹仍另批）。
export function initialTask({ sites = [], covered = [], auto = false } = {}) {
  const list = Array.isArray(sites) ? sites.slice() : [];
  const use = list.filter((h) => covered.some((root) => hostMatches(h, root)));
  const fresh = list.filter((h) => !use.includes(h));
  if (!list.length) return { state: 'approved', sites: [], ask: [], use: [] };
  return auto
    ? { state: 'approved', sites: fresh, ask: [], use }
    : { state: 'pending', sites: [], ask: fresh, use };
}

// act 剧本静态检查：每一步都要是允许的动作，导航目标都要在白名单里。
// 嵌套（if/repeat）一起查——不查的话，危险步骤藏一层就能混过去。
function checkSteps(steps, hosts, depth = 0) {
  if (!Array.isArray(steps)) throw err('CLOUD_DENIED', 'act 的 steps 必须是数组');
  if (depth > 3) throw err('CLOUD_DENIED', 'act 嵌套太深');
  for (const st of steps) {
    if (!st || typeof st !== 'object') throw err('CLOUD_DENIED', 'act 的步骤必须是对象');
    if (!ACT_STEPS.has(st.do)) throw err('CLOUD_DENIED', `云端任务的 act 里不能用 ${JSON.stringify(st.do)}`);
    if (st.do === 'navigate' && st.url !== undefined && !urlAllowed(st.url, hosts)) {
      throw err('CLOUD_DENIED', `不在本任务允许的网站上：${hostOf(st.url) || st.url}`);
    }
    if (st.do === 'if') { checkSteps(st.then || [], hosts, depth + 1); checkSteps(st.else || [], hosts, depth + 1); }
    if (st.do === 'repeat') checkSteps(st.steps || [], hosts, depth + 1);
  }
}

// 审一条云端命令。返回清洗过的参数（只留安全的字段、补上强制值），不合规直接抛。
// tabId 不在这里管——它由 cloud.js 按「这个任务自己开过哪些页」单独核对。
export function checkCommand(cmd, params, { hosts, origin }) {
  if (!CLOUD_CMDS.has(cmd)) throw err('CLOUD_DENIED', `云端任务不能调用 ${cmd}`);
  const p = { ...(params && typeof params === 'object' ? params : {}) };
  delete p.tabId;   // tabId 只能出现在信封上，由 cloud.js 核对归属

  switch (cmd) {
    case 'tabs': {
      if (!['new', 'list', 'select', 'close'].includes(p.action)) throw err('CLOUD_DENIED', `tabs 不支持 ${p.action}`);
      if (p.action === 'new' && p.url !== undefined && !urlAllowed(p.url, hosts)) {
        throw err('CLOUD_DENIED', `不在本任务允许的网站上：${hostOf(p.url) || p.url}`);
      }
      p.focus = false;   // 后台干活，不抢用户的视线
      return p;
    }
    case 'navigate': {
      if (p.url !== undefined) {
        if (!urlAllowed(p.url, hosts)) throw err('CLOUD_DENIED', `不在本任务允许的网站上：${hostOf(p.url) || p.url}`);
      } else if (!['back', 'forward', 'reload'].includes(p.action || 'reload')) {
        throw err('CLOUD_DENIED', `navigate 不支持 ${p.action}`);
      }
      return p;
    }
    case 'act': {
      checkSteps(p.steps, hosts);
      // 批处理不代做提交/支付/删除——发布按钮也在其列，必须单独 click 一次，
      // 那一下有自己的效果证据，审计日志里也独立可查
      p.allowSensitive = false;
      return p;
    }
    case 'upload': {
      // 只认 media（服务器上的素材）。path/base64 是本机那条路的参数，云端一个都不收
      const m = p.media;
      if (!m || typeof m !== 'object' || !mediaAllowed(m.url, origin)) {
        throw err('CLOUD_DENIED', 'upload 只能用配对服务器上的素材（media.url）');
      }
      const size = Number(m.size);
      if (!Number.isFinite(size) || size <= 0 || size > MEDIA_MAX) throw err('CLOUD_DENIED', '素材大小不对');
      const name = String(m.name || '').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(0, 120);
      if (!name || name.startsWith('.')) throw err('CLOUD_DENIED', '素材文件名不对');
      return {
        media: { url: m.url, name, type: String(m.type || 'application/octet-stream').slice(0, 80), size },
        ...(typeof p.selector === 'string' ? { selector: p.selector } : {}),
        ...(typeof p.dropSelector === 'string' ? { dropSelector: p.dropSelector } : {}),
      };
    }
    case 'screenshot':
      delete p.focus;    // 只走 CDP 截后台页；退回老路要切前台，那会截到用户正在看的东西
      return p;
    case 'ask':
      p.timeout = Math.min(Math.max(Number(p.timeout) || 300000, 5000), 600000);
      return p;
    case 'sites': {
      const { sites, bad } = cleanSites(p.add);
      if (!sites.length && !bad.length) throw err('CLOUD_DENIED', 'sites 要给 add：要访问的网站，如 ["zhipin.com"]');
      return { add: sites, bad, reason: String(p.reason || '').replace(/\s+/g, ' ').trim().slice(0, 200) };
    }
    case 'folders': {
      // use 可以是空的：那是在问「这个浏览器挂了哪些」，不是在申请。
      const { names, bad } = cleanFolderNames(p.use);
      return { use: names, bad, reason: String(p.reason || '').replace(/\s+/g, ' ').trim().slice(0, 200) };
    }
    case 'fs_list': {
      const folder = cleanFolderName(p.folder);
      if (!folder) throw err('CLOUD_DENIED', 'fs_list 要给 folder：文件夹的显示名');
      const rel = normalizeRelPath(p.path ?? '');
      if (rel === null) throw err('CLOUD_DENIED', 'path 不合法');
      const depth = Math.min(FS_DEPTH_MAX, Math.max(1, Math.floor(Number(p.depth) || 3)));
      let glob = '';
      if (p.glob !== undefined && p.glob !== '') {
        glob = String(p.glob).trim().slice(0, 200);
        if (!glob || glob.includes('..') || /[\x00-\x1f\\]/.test(glob)) throw err('CLOUD_DENIED', 'glob 不合法');
      }
      return { folder, path: rel, depth, ...(glob ? { glob } : {}) };
    }
    case 'fs_read': {
      const folder = cleanFolderName(p.folder);
      if (!folder) throw err('CLOUD_DENIED', 'fs_read 要给 folder：文件夹的显示名');
      const rel = normalizeRelPath(p.path ?? '');
      if (!rel) throw err('CLOUD_DENIED', 'fs_read 要给文件的 path');
      const base = rel.split('/').pop();
      if (skipEntry(base) || !fileAllowed(base)) throw err('CLOUD_DENIED', `不读取这种文件：${base}`);
      if (!pullUrlAllowed(p.upload?.url, origin)) throw err('CLOUD_DENIED', 'fs_read 只能把文件传到配对服务器的 /api/ext/pull/');
      return { folder, path: rel, upload: { url: p.upload.url } };
    }
    default:
      return p;
  }
}

// 命令执行完、结果发回服务器之前，标签页若已经跳出白名单（点了个外链、被重定向），
// 结果里那一页的内容不能出去。只留一句说明。
export function redactOffList(url) {
  return {
    text: `⛔ 标签页跳到了本任务允许范围以外的地址（${hostOf(url) || '非网页地址'}），`
      + '内容已屏蔽，标签页已退回。回到允许的网站继续，或用 ask 请用户处理。',
    offList: true,
  };
}

// 结果瘦身：截图以外的大块数据不往回传。上限防止一份异常大的快照把通道堵死。
export const RESULT_MAX = 3 * 1024 * 1024;
