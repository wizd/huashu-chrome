// 桌面能力的规矩 —— 纯函数，不碰任何 chrome / node API。
//
// 本机 MCP（src/lib/desktop.js）和云端通道（cloud.js → 原生宿主）用同一份。
// agent-desktop 自己只管系统权限，不管「哪个应用能碰」，所以闸门全在这里，
// 和页面侧一样：安全判断不放在模型里。
//
// 2026-11-02 在 Windows 上实测（agent-desktop 1.0.2）定下的几条：
// - Chrome 主窗口在 UIA 里整个是敞开的：地址栏、MetaMask / OKX 钱包按钮、密码管理、
//   扩展按钮，连 vcorp-chrome 侧栏里的「暂停」「断开并忘记这个服务器」「移除」网站、
//   「高保真模式」开关都有 ref。桌面一侧能点到它们，扩展里的每一道闸就都白设了。
//   所以浏览器的主窗口一律不碰，只放行浏览器弹出的系统文件对话框。
// - 系统文件对话框的控件有固定的自动化 id：文件名 1148、打开/保存 1、取消 2。
//   判断「这是文件对话框」认这组 id，不认标题（标题随语言变，也可能被页面影响）。
// - 每次调用要起一个进程，list-windows 最少约 730ms，Chrome 快照约 2.4s。

const err = (code, message) => Object.assign(new Error(message), { code });

// ---------- 应用身份 ----------

// 进程名 / 应用名的规范形式：小写、去掉 .exe / .app。「Weixin.exe」和「weixin」是同一个。
export function appKey(raw) {
  return String(raw ?? '').trim().toLowerCase().replace(/\.(exe|app)$/, '').slice(0, 80);
}

const BROWSERS = new Set([
  'chrome', 'google chrome', 'msedge', 'microsoft edge', 'brave', 'brave browser', 'chromium',
  'firefox', 'mozilla firefox', 'opera', 'vivaldi', 'arc', 'safari', 'yandex', '360se', '360chrome',
  'qqbrowser', 'sogouexplorer', 'doubao',
]);

export function isBrowserApp(app) {
  return BROWSERS.has(appKey(app));
}

// 浏览器主窗口的标题以浏览器名收尾（「VCorp Super Agent - Google Chrome」）
const BROWSER_TITLE = /\s[-–—]\s(Google Chrome|Chromium|Microsoft​? Edge|Brave|Mozilla Firefox|Opera|Vivaldi|Arc)$/i;

export function isBrowserMainTitle(title) {
  return BROWSER_TITLE.test(String(title ?? ''));
}

// 快照树里有没有系统文件对话框的那组控件
export function isFileDialogTree(tree) {
  let name = false;
  let ok = false;
  const walk = (n, depth) => {
    if (!n || typeof n !== 'object' || depth > 40 || (name && ok)) return;
    const id = n.native_id?.value;
    if (id === '1148') name = true;
    if (id === '1' && n.role === 'button') ok = true;
    for (const c of Array.isArray(n.children) ? n.children : []) walk(c, depth + 1);
  };
  walk(tree, 0);
  return name && ok;
}

// 两条通道都不碰的：密码管理器（凭据不进上下文）
const SECRET_APPS = new Set([
  '1password', 'bitwarden', 'keepass', 'keepassxc', 'lastpass', 'dashlane', 'enpass', 'keychain access',
  'keeper', 'nordpass', 'roboform', 'proton pass',
]);

// 云端还不碰的：能拿到整台机器的东西。本机 agent 本来就有 shell，拦它们没有意义
const CLOUD_DENIED_APPS = new Set([
  'powershell', 'pwsh', 'cmd', 'windowsterminal', 'terminal', 'iterm2', 'conhost', 'wt', 'openconsole',
  'regedit', 'mmc', 'taskmgr', 'sechealthui', 'systemsettings', 'control', 'system preferences',
  'system settings', 'mstsc', 'gnome-terminal', 'konsole', 'xterm', 'alacritty', 'wezterm', 'kitty',
  'cursor', 'code', 'goose', 'claude', 'codex',
]);

export function deniedApp(app, channel) {
  const k = appKey(app);
  if (!k) return null;
  if (SECRET_APPS.has(k)) return `${app} 是密码管理器，桌面能力不碰它`;
  if (channel === 'cloud' && CLOUD_DENIED_APPS.has(k)) return `云端任务不能操作 ${app}`;
  return null;
}

// ---------- 敏感动作 ----------

export const PAY_NAME = /支付|付款|下单|结算|购买|充值|提现|转账|打赏|续费|红包|pay\s?now|checkout|place\s?order|buy\s?now|purchase|transfer/i;
export const SENSITIVE_NAME = /发送|发布|提交|删除|移除|清空|卸载|格式化|退出登录|注销|send|submit|publish|delete|remove|erase|uninstall|format|sign\s?out|log\s?out/i;

// 'pay'：要花钱，必须人点头，没有跳过的办法；'sensitive'：对外或不可逆，不自动重试、不进批处理
export function sensitivity(name) {
  const s = String(name ?? '');
  if (PAY_NAME.test(s)) return 'pay';
  if (SENSITIVE_NAME.test(s)) return 'sensitive';
  return null;
}

// ---------- 命令表 ----------

// kind：read 只看不动，write 会改应用状态。ref：要不要一个快照里的 ref。
// cloud / local：这条通道能不能用。
const C = (kind, o = {}) => ({ kind, cloud: true, local: true, ref: false, ...o });
export const DESKTOP_CMDS = {
  'list-apps': C('read'),
  'list-windows': C('read'),
  snapshot: C('read'),
  find: C('read'),
  get: C('read', { ref: true }),
  screenshot: C('read', { cloud: false }),   // 原生消息单条回包 1MB 上限，PNG 常常超
  wait: C('read'),
  click: C('write', { ref: true }),
  'double-click': C('write', { ref: true }),
  'right-click': C('write', { ref: true }),
  type: C('write', { ref: true }),
  'set-value': C('write', { ref: true }),
  clear: C('write', { ref: true }),
  focus: C('write', { ref: true }),
  select: C('write', { ref: true }),
  toggle: C('write', { ref: true }),
  check: C('write', { ref: true }),
  uncheck: C('write', { ref: true }),
  expand: C('write', { ref: true }),
  collapse: C('write', { ref: true }),
  scroll: C('write', { ref: true }),
  'scroll-to': C('write', { ref: true }),
  press: C('write'),
  launch: C('write'),
  'focus-window': C('write', { cloud: false }),   // 抢用户的焦点
  'clipboard-set': C('write'),
  'clipboard-get': C('read', { cloud: false }),   // 剪贴板里常常是刚复制的密码
  'list-notifications': C('read', { cloud: false }),   // 私信、验证码
  'notification-action': C('write', { cloud: false }),
};

export const REF_RE = /^@s[a-z0-9]{4,40}:e\d{1,6}$/;
const SESSION_RE = /^[\w-]{1,64}$/;
const WINDOW_RE = /^w-\d{1,20}$/;
const COMBO_RE = /^[a-z0-9][a-z0-9+_-]{0,39}$/i;
const ROLE_RE = /^[a-z_-]{1,30}$/;

const str = (v, max) => String(v ?? '').replace(/\0/g, '').slice(0, max);
const int = (v, lo, hi, dflt) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};

export function snapshotIdOf(ref) {
  const m = /^@(s[a-z0-9]+):e\d+$/.exec(String(ref ?? ''));
  return m ? m[1] : '';
}

// 一份快照的户口：这些 ref 属于哪个应用、哪个窗口，是不是文件对话框，每个 ref 叫什么。
// 执行器在快照（和 find）回来之后记下它，之后每条 ref 命令都对着它判。
export function recordOf(data) {
  if (!data || typeof data !== 'object' || !data.snapshot_id) return null;
  const refs = {};
  let n = 0;
  const walk = (node, depth) => {
    if (!node || typeof node !== 'object' || depth > 60 || n > 4000) return;
    if (node.ref_id) {
      const e = /:(e\d+)$/.exec(node.ref_id)?.[1];
      if (e) { refs[e] = { role: str(node.role, 30), name: str(node.name, 80) }; n += 1; }
    }
    for (const c of Array.isArray(node.children) ? node.children : []) walk(c, depth + 1);
  };
  walk(data.tree, 0);
  if (data.match) walk(data.match, 0);
  for (const m of Array.isArray(data.matches) ? data.matches : []) walk(m, 0);
  return {
    id: String(data.snapshot_id),
    app: str(data.app, 80),
    window: data.window && typeof data.window === 'object'
      ? { id: str(data.window.id, 40), title: str(data.window.title, 200) } : null,
    fileDialog: data.tree ? isFileDialogTree(data.tree) : false,
    refs,
  };
}

// 浏览器的窗口只认文件对话框。preflight：对一个非主窗口先拍一张快照，
// 拍回来由 checkObserved 认它是不是文件对话框——在那之前它的 ref 不进户口。
function browserGate(app, title, fileDialog, { preflight = false } = {}) {
  if (!isBrowserApp(app) || fileDialog) return null;
  if (preflight && title && !isBrowserMainTitle(title)) return null;
  return `不能操作浏览器窗口（${app}${title ? `「${title.slice(0, 40)}」` : ''}）：网页用浏览器工具；`
    + '浏览器弹出的打开/另存为对话框，先 list-windows 拿到它的 window 再 snapshot。';
}

// 审一条桌面命令，返回 agent-desktop 的参数数组（不含可执行文件本身）。
// ctx.channel：'local' | 'cloud'；ctx.session：快照命名空间；
// ctx.lookup(snapshotId)：取 recordOf 记下的户口；ctx.apps：云端本任务批准的应用（appKey 列表）；
// ctx.windows(windowId)：取 list-windows 里那个窗口的 {app, title}（执行器预取）。
// 返回 { cmd, argv, kind, app, target, sensitive }，不合规直接抛。
export function checkDesktop(params, ctx = {}) {
  const p = params && typeof params === 'object' ? params : {};
  const channel = ctx.channel === 'cloud' ? 'cloud' : 'local';
  // 完全模式（用户在本机打开的）：不认应用名单、不挡浏览器窗口、不查快照户口，参数形状照旧规整
  const full = ctx.full === true;
  const cmd = String(p.cmd || '');
  const spec = DESKTOP_CMDS[cmd];
  if (!spec) throw err('DESKTOP_DENIED', `desktop 不支持 ${cmd || '（没写 cmd）'}${full ? '：其它命令用 argv 原样传' : ''}`);
  if (!full && !spec[channel]) throw err('DESKTOP_DENIED', `${channel === 'cloud' ? '云端任务' : '本机'}不能用 desktop ${cmd}`);
  if (!full && p.headed && channel === 'cloud') throw err('DESKTOP_DENIED', '云端任务不能用真实鼠标键盘（headed）');

  const argv = [cmd];
  let app = p.app !== undefined ? str(p.app, 80).trim() : '';
  const win = p.window !== undefined ? str(p.window, 40) : '';
  if (win && !WINDOW_RE.test(win)) throw err('DESKTOP_DENIED', 'window 要用 list-windows 给的 id，如 w-460112');
  let title = '';
  if (win) {
    const w = ctx.windows?.(win);
    if (!w && !full) throw err('DESKTOP_DENIED', `不认识窗口 ${win}：先 list-windows`);
    if (w) {
      app = app || w.app;
      title = w.title || '';
      if (appKey(w.app) !== appKey(app)) throw err('DESKTOP_DENIED', `窗口 ${win} 属于 ${w.app}，不是 ${app}`);
    }
  }

  let rec = null;
  let target = null;
  if (spec.ref || p.root !== undefined) {
    const ref = str(spec.ref ? p.ref : p.root, 60);
    if (!REF_RE.test(ref)) throw err('DESKTOP_DENIED', 'ref 要用快照里完整的形式，如 @s8f3k2p9:e8');
    rec = ctx.lookup?.(snapshotIdOf(ref)) || null;
    if (!rec && !full) throw err('DESKTOP_DENIED', `不认识 ${ref} 所属的快照：先在这个会话里 snapshot 一次`);
    if (rec) {
      app = rec.app;
      title = rec.window?.title || '';
      target = rec.refs[/:(e\d+)$/.exec(ref)[1]] || null;
    }
    if (spec.ref) argv.push(ref);
    else argv.push('--root', ref);
  }

  const appless = ['list-apps', 'clipboard-set', 'clipboard-get', 'list-notifications', 'notification-action'];
  if (!full && !app && !appless.includes(cmd) && !(cmd === 'wait' && p.ms !== undefined && p.text === undefined)) {
    if (channel === 'cloud' || cmd !== 'list-windows') throw err('DESKTOP_DENIED', `desktop ${cmd} 要给 app 或 window`);
  }
  if (app && !full) {
    const why = deniedApp(app, channel);
    if (why) throw err('DESKTOP_DENIED', why);
    if (channel === 'cloud' && !(ctx.apps || []).includes(appKey(app))) {
      throw err('APP_NOT_APPROVED', `本任务还不能操作 ${app}。先用 apps 申请，用户点头之后再来。`);
    }
    const gate = cmd === 'list-windows' ? null
      : browserGate(app, title, rec?.fileDialog, { preflight: cmd === 'snapshot' && !!win && !rec });
    if (gate) throw err('DESKTOP_DENIED', gate);
  }

  // 用户给的文字一律不能被当成开关：选项值写成 --opt=值，自由文本放到 -- 之后。
  // 实测 `type @ref --headed` 会被 agent-desktop 当成开关解析——云端的一段文字就能换成真实输入。
  const opt = (name, v) => argv.push(`${name}=${v}`);
  const tail = [];
  const where = () => (win ? opt('--window-id', win) : opt('--app', app));
  switch (cmd) {
    case 'list-windows':
      if (app) opt('--app', app);
      break;
    case 'snapshot':
      if (!rec) where();
      if (!p.all) argv.push('-i');
      argv.push('--compact');
      if (p.skeleton) argv.push('--skeleton');
      if (p.timeout !== undefined) opt('--timeout-ms', int(p.timeout, 500, 20000, 3000));
      break;
    case 'find': {
      if (!rec) where();
      if (p.role === undefined && p.name === undefined && p.text === undefined) throw err('DESKTOP_DENIED', 'find 要给 role / name / text 里至少一个');
      if (p.role !== undefined) {
        const role = str(p.role, 30);
        if (!ROLE_RE.test(role)) throw err('DESKTOP_DENIED', 'role 不合法');
        opt('--role', role);
      }
      if (p.name !== undefined) opt('--name', str(p.name, 200));
      if (p.text !== undefined) opt('--text', str(p.text, 200));
      if (p.nth !== undefined) opt('--nth', int(p.nth, 0, 500, 0));
      else opt('--limit', 20);
      break;
    }
    case 'get':
      if (p.property !== undefined) {
        const prop = str(p.property, 10);
        if (!['text', 'value', 'title', 'bounds', 'role', 'states'].includes(prop)) throw err('DESKTOP_DENIED', 'property 不合法');
        opt('--property', prop);
      }
      break;
    case 'screenshot':
      where();
      break;
    case 'wait':
      if (p.text !== undefined) { opt('--text', str(p.text, 200)); opt('--app', app); opt('--timeout', int(p.timeout, 100, 60000, 10000)); }
      else if (p.windowTitle !== undefined) { opt('--window', str(p.windowTitle, 200)); opt('--timeout', int(p.timeout, 100, 60000, 10000)); }
      else argv.push(String(int(p.ms, 0, 30000, 1000)));
      break;
    case 'type':
      if (p.text === undefined) throw err('DESKTOP_DENIED', 'type 要给 text');
      tail.push(str(p.text, 5000));
      break;
    case 'set-value':
    case 'select':
      if (p.value === undefined) throw err('DESKTOP_DENIED', `${cmd} 要给 value`);
      tail.push(str(p.value, 5000));
      break;
    case 'scroll':
      opt('--direction', ['up', 'down', 'left', 'right'].includes(p.direction) ? p.direction : 'down');
      opt('--amount', int(p.amount, 1, 50, 3));
      break;
    case 'press': {
      const combo = str(p.keys, 40);
      if (!COMBO_RE.test(combo)) throw err('DESKTOP_DENIED', 'keys 要写成 return / escape / ctrl+s 这样');
      argv.push(combo);
      where();
      break;
    }
    case 'launch':
      tail.push(app);
      break;
    case 'focus-window':
      where();
      break;
    case 'clipboard-set':
      if (p.text === undefined) throw err('DESKTOP_DENIED', 'clipboard-set 要给 text');
      tail.push(str(p.text, 20000));
      break;
    case 'list-notifications':
      if (p.app !== undefined) opt('--app', str(p.app, 80));
      opt('--limit', 20);
      break;
    case 'notification-action': {
      const by = str(p.app, 80);
      if (!by) throw err('DESKTOP_DENIED', 'notification-action 要给 app：通知来自哪个应用');
      if (isBrowserApp(by) || /vcorp/i.test(by)) throw err('DESKTOP_DENIED', '不能替用户点浏览器发出的通知——那里面有任务批准和付款确认');
      opt('--expected-app', by);
      argv.push(String(int(p.index, 1, 100, 1)));
      tail.push(str(p.action, 60));
      break;
    }
    default:
      break;
  }

  if (p.headed) argv.push('--headed');
  const session = str(ctx.session, 64);
  if (session) {
    if (!SESSION_RE.test(session)) throw err('DESKTOP_DENIED', 'session 不合法');
    if (cmd !== 'list-apps' && cmd !== 'clipboard-set' && cmd !== 'clipboard-get') opt('--session', session);
  }
  if (tail.length) argv.push('--', ...tail);

  const sensitive = spec.kind === 'write' ? sensitivity(target?.name) : null;
  return { cmd, argv, kind: spec.kind, app, target, sensitive };
}

// 快照（或 find）回来之后的复核：浏览器的窗口只认文件对话框。
// snapshot 允许先拍一张浏览器的非主窗口，拍回来不是文件对话框就整份作废，树不出门。
export function checkObserved(rec) {
  if (!rec) return;
  const gate = browserGate(rec.app, rec.window?.title || '', rec.fileDialog);
  if (gate) throw err('DESKTOP_DENIED', gate);
}

// list-windows 的结果出门前过一道：浏览器主窗口的标题是用户正在看的网页，云端不给。
// 本机给，但标上「不可操作」，免得 agent 拿它去 snapshot。
export function filterWindows(list, channel) {
  const arr = Array.isArray(list) ? list : [];
  return arr.flatMap((w) => {
    const main = isBrowserApp(w.app_name) && isBrowserMainTitle(w.title);
    if (main && channel === 'cloud') return [];
    if (main) return [{ ...w, blocked: '浏览器主窗口：用浏览器工具操作' }];
    if (deniedApp(w.app_name, channel)) return channel === 'cloud' ? [] : [{ ...w, blocked: deniedApp(w.app_name, channel) }];
    return [w];
  });
}

// 批处理：一步一步过同一套检查。敏感动作不代做，和页面侧的 act 一个规矩。
export const STEPS_MAX = 20;
export function checkSteps(steps) {
  if (!Array.isArray(steps) || !steps.length) throw err('DESKTOP_DENIED', 'steps 要是非空数组');
  if (steps.length > STEPS_MAX) throw err('DESKTOP_DENIED', `steps 最多 ${STEPS_MAX} 步`);
  for (const st of steps) {
    if (!st || typeof st !== 'object' || Array.isArray(st)) throw err('DESKTOP_DENIED', 'steps 的每一步都要是对象');
    if (st.steps !== undefined) throw err('DESKTOP_DENIED', 'steps 不能嵌套');
    if (!DESKTOP_CMDS[st.cmd]) throw err('DESKTOP_DENIED', `steps 里不支持 ${st.cmd}`);
  }
  return steps;
}

// ---------- 云端：应用申请 ----------

export const APPS_MAX = 10;

export function cleanApps(list) {
  const apps = [];
  const bad = [];
  for (const raw of [].concat(list ?? [])) {
    const k = appKey(raw);
    if (!k || !/^[\p{L}\p{N} ._()-]{1,80}$/u.test(k)) { bad.push(String(raw).slice(0, 40)); continue; }
    if (isBrowserApp(k) || deniedApp(k, 'cloud')) { bad.push(String(raw).slice(0, 40)); continue; }
    if (!apps.includes(k)) apps.push(k);
  }
  return { apps: apps.slice(0, APPS_MAX), bad, overflow: apps.slice(APPS_MAX) };
}

export function appsToAsk(add, { covered = [], apps = [], refused = [] } = {}) {
  const ask = [];
  const already = [];
  for (const a of add) {
    if (covered.includes(a) || apps.includes(a)) already.push(a);
    else if (!refused.includes(a)) ask.push(a);
  }
  return { ask, covered: already };
}
