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
//   2. 域名白名单：云端开的标签页只能停在用户勾选过的创作平台上，跳出去就屏蔽内容。
//   3. 标签页隔离：云端只看得见、只碰得到它自己开的标签页，用户自己的页面一个都不行。
//   4. 文件来源：上传只能用配对服务器上的素材 URL，不收本机路径——否则一句
//      upload(path:"~/.ssh/id_rsa") 就能把私钥发到公开平台上。
//   5. 每个任务要用户点头（或用户主动开了自动允许），且有命令数上限。

// 平台 → 允许停留的站点（含子域）。只放创作者后台和它们的登录/作品页需要的根域。
// 视频号只放 channels.weixin.qq.com：weixin.qq.com 底下还有公众号后台、微信支付这些。
export const PLATFORMS = {
  douyin: { name: '抖音', hosts: ['douyin.com'] },
  xiaohongshu: { name: '小红书', hosts: ['xiaohongshu.com'] },
  bilibili: { name: 'B站', hosts: ['bilibili.com'] },
  shipinhao: { name: '视频号', hosts: ['channels.weixin.qq.com'] },
  kuaishou: { name: '快手', hosts: ['kuaishou.com'] },
  weibo: { name: '微博', hosts: ['weibo.com', 'weibo.cn'] },
  zhihu: { name: '知乎', hosts: ['zhihu.com'] },
};

export const DEFAULT_ORIGIN = 'https://maker.vcorp.ai';

// 远端能调的命令。tabs 的子动作另外管（见 checkCommand）。
export const CLOUD_CMDS = new Set([
  'tabs', 'navigate', 'snapshot', 'click', 'type', 'fill', 'select', 'key', 'scroll',
  'wait', 'read_text', 'query', 'read', 'screenshot', 'upload', 'act', 'ask', 'status',
]);

// act 里允许出现的步骤
const ACT_STEPS = new Set(['click', 'type', 'fill', 'select', 'key', 'scroll', 'wait', 'navigate', 'read', 'assert', 'if', 'repeat']);

export const TASK_CMD_CAP = 1500;        // 一个任务最多这么多条命令，防失控循环把账号刷进风控
export const TASK_IDLE_MS = 3 * 3600e3;  // 批准过的任务闲置 3 小时作废，下次要重新点头
export const MEDIA_MAX = 2 * 1024 ** 3;  // 素材上限，与 maker 那侧的上传上限一致

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

// 这些平台合起来允许哪些根域
export function allowedHosts(platforms) {
  const out = [];
  for (const id of platforms || []) for (const h of PLATFORMS[id]?.hosts || []) out.push(h);
  return out;
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

// 素材地址必须指回配对的那台服务器的素材接口——扩展只从那里取文件
export function mediaAllowed(url, origin) {
  let u;
  try { u = new URL(url); } catch { return false; }
  return u.origin === origin && u.pathname.startsWith('/api/ext/media/') && !u.username && !u.password;
}

// 任务真正生效的平台：服务器申请的 ∩ 用户在侧栏里勾选的
export function grantedPlatforms(requested, enabled) {
  const on = new Set(enabled || []);
  return [...new Set(requested || [])].filter((id) => PLATFORMS[id] && on.has(id));
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
      throw err('CLOUD_DENIED', `不在本任务允许的平台上：${hostOf(st.url) || st.url}`);
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
        throw err('CLOUD_DENIED', `不在本任务允许的平台上：${hostOf(p.url) || p.url}`);
      }
      p.focus = false;   // 后台干活，不抢用户的视线
      return p;
    }
    case 'navigate': {
      if (p.url !== undefined) {
        if (!urlAllowed(p.url, hosts)) throw err('CLOUD_DENIED', `不在本任务允许的平台上：${hostOf(p.url) || p.url}`);
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
    default:
      return p;
  }
}

// 命令执行完、结果发回服务器之前，标签页若已经跳出白名单（点了个外链、被重定向），
// 结果里那一页的内容不能出去。只留一句说明。
export function redactOffList(url) {
  return {
    text: `⛔ 标签页跳到了本任务允许范围以外的地址（${hostOf(url) || '非网页地址'}），`
      + '内容已屏蔽，标签页已退回。回到平台页面继续，或用 ask 请用户处理。',
    offList: true,
  };
}

// 结果瘦身：截图以外的大块数据不往回传。上限防止一份异常大的快照把通道堵死。
export const RESULT_MAX = 3 * 1024 * 1024;
