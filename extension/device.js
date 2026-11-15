// 设备模型 —— 一个用户、多台设备。纯函数，不碰任何 chrome / node API。
//
// 桥（本机）、扩展（云端中继）、服务器（opus-video-maker/extlink.js 抄一份）按同一套规则
// 回答两个问题：命令要下到哪台设备，结果是从哪台设备来的。协议见 docs/协议.md 第十二节。
//
// 四个概念：
// - 设备 device：能执行命令的独立终端。有自己的 id、类型 kind、能力清单 caps、所在机器 machine。
// - 链路 link：设备怎么连上来。浏览器自己连；云端的桌面经同机浏览器中继。身份不随链路变。
// - 机器 machine：同一台电脑上的设备共用一个 machineId。交接只在同机设备之间成立。
// - 任务绑定：任务开始时把需要的设备钉住，整个任务不换设备。

export const PROTOCOL_V = 2;

export const KINDS = ['browser', 'desktop', 'mobile'];

// 命令属于哪种能力。没写 cap 的老消息一律是浏览器命令——老扩展、老服务器照常工作。
export const CAPS = ['browser', 'desktop'];

export const DEVICE_ERRORS = {
  NO_DEVICE: 'NO_DEVICE',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  DEVICE_NOT_IN_JOB: 'DEVICE_NOT_IN_JOB',
  AMBIGUOUS_DEVICE: 'AMBIGUOUS_DEVICE',
  DEVICE_NOT_HERE: 'DEVICE_NOT_HERE',
};

const ID_RE = /^[\w.:-]{1,80}$/;

const err = (code, message, details) => Object.assign(new Error(message), { code, ...(details ? { details } : {}) });

// 一个账号下常有好几个浏览器实例（家里的 Chrome、公司的 Edge、Mac 上的 Brave）。
// 用户给每个实例起名字来区分；服务器再按浏览器种类和系统画图标。
// 种类和系统只认下面这几个词，别的一律归到 chromium / 空——它们只决定图标，不决定权限。
export const BROWSERS = ['chrome', 'edge', 'brave', 'opera', 'chromium'];
export const PLATFORMS = ['windows', 'macos', 'linux', 'chromeos'];
const BROWSER_LABEL = { chrome: 'Chrome', edge: 'Edge', brave: 'Brave', opera: 'Opera', chromium: 'Chromium' };
const PLATFORM_LABEL = { windows: 'Windows', macos: 'macOS', linux: 'Linux', chromeos: 'ChromeOS' };
export const DEVICE_NAME_MAX = 40;

// brands / platform 来自 navigator.userAgentData，ua 是 navigator.userAgent（老 Chrome 没有前者）
export function browserIdentity({ brands = [], platform = '', ua = '' } = {}) {
  const names = (Array.isArray(brands) ? brands : []).map((b) => String(b?.brand || ''));
  const text = String(ua || '');
  const seen = (brand, inUa) => names.some((n) => brand.test(n)) || (inUa ? inUa.test(text) : false);
  const browser = seen(/Microsoft Edge/, /\bEdg(A|iOS)?\//) ? 'edge'
    : seen(/Brave/) ? 'brave'
      : seen(/Opera/, /\bOPR\//) ? 'opera'
        : seen(/Google Chrome/) || (!names.length && /\bChrome\//.test(text)) ? 'chrome'
          : 'chromium';
  const p = `${platform || ''} ${text}`;
  const os = /Windows/i.test(p) ? 'windows'
    : /Mac/i.test(p) ? 'macos'
      : /CrOS|Chrome OS/i.test(p) ? 'chromeos'
        : /Linux|X11/i.test(p) ? 'linux'
          : '';
  return { browser, platform: os };
}

export const defaultDeviceName = ({ browser, platform } = {}) =>
  [BROWSER_LABEL[browser] || 'Chromium', PLATFORM_LABEL[platform]].filter(Boolean).join(' · ');

export function cleanDeviceName(raw) {
  return String(raw ?? '').replace(/\s+/g, ' ').replace(/[\x00-\x1f\x7f]/g, '').trim().slice(0, DEVICE_NAME_MAX);
}

export function cleanDeviceId(raw) {
  const s = String(raw ?? '').trim();
  return ID_RE.test(s) ? s : '';
}

export function cleanKind(raw) {
  return KINDS.includes(raw) ? raw : '';
}

export function capOf(msg) {
  const c = msg?.cap;
  return CAPS.includes(c) ? c : 'browser';
}

// 能力 → 能执行它的设备类型。手机以后会认领一部分 browser 命令（内置浏览器）和自己的 mobile 能力，
// 那时在这里加映射，而不是在每个调用方各写一份。
export function kindsFor(cap) {
  return cap === 'desktop' ? ['desktop'] : ['browser'];
}

// 设备记录的规范形状。所有一侧上报的、服务器存的、给 agent 看的，都过这一道。
export function cleanDevice(d) {
  if (!d || typeof d !== 'object') return null;
  const id = cleanDeviceId(d.id);
  const kind = cleanKind(d.kind);
  if (!id || !kind) return null;
  const caps = d.caps && typeof d.caps === 'object' ? d.caps : {};
  return {
    id,
    kind,
    name: String(d.name || '').replace(/\s+/g, ' ').trim().slice(0, 60) || kind,
    machine: cleanDeviceId(d.machine) || null,
    parent: cleanDeviceId(d.parent) || null,
    online: d.online !== false,
    caps: {
      platform: String(caps.platform || '').slice(0, 20),
      version: String(caps.version || '').slice(0, 40),
      cmds: Array.isArray(caps.cmds) ? caps.cmds.filter((c) => typeof c === 'string' && c.length <= 40).slice(0, 80) : [],
    },
  };
}

// 命令落到哪台设备。
// devices：调用方能看到的设备（服务器：本任务绑定的；桥：本机目录）。
// want：agent 显式指定的 device（可缺省）。cap：命令属于哪种能力。
// 规则：指定了就必须在名单里、类型对、在线；没指定就找同类，唯一才落，两台以上不猜。
export function resolveTarget(devices, { cap = 'browser', want = '' } = {}) {
  const list = (Array.isArray(devices) ? devices : []).map(cleanDevice).filter(Boolean);
  const kinds = kindsFor(cap);
  const id = cleanDeviceId(want);
  if (want && !id) throw err(DEVICE_ERRORS.NO_DEVICE, `设备号不合法：${String(want).slice(0, 40)}`);
  if (id) {
    const d = list.find((x) => x.id === id);
    if (!d) throw err(DEVICE_ERRORS.DEVICE_NOT_IN_JOB, `设备 ${id} 不在可用设备里。先用 devices 看看有哪些。`);
    if (!kinds.includes(d.kind)) throw err(DEVICE_ERRORS.NO_DEVICE, `设备 ${id} 是 ${d.kind}，不能执行 ${cap} 命令`);
    if (!d.online) throw err(DEVICE_ERRORS.DEVICE_OFFLINE, `设备 ${d.name}（${id}）离线`);
    return d;
  }
  const same = list.filter((x) => kinds.includes(x.kind));
  if (!same.length) throw err(DEVICE_ERRORS.NO_DEVICE, `没有可执行 ${cap} 命令的设备`);
  const live = same.filter((x) => x.online);
  if (!live.length) throw err(DEVICE_ERRORS.DEVICE_OFFLINE, `${same.map((x) => x.name).join('、')} 离线`);
  if (live.length > 1) {
    throw err(DEVICE_ERRORS.AMBIGUOUS_DEVICE,
      `有 ${live.length} 台设备都能执行 ${cap} 命令，用 device 指定一台：${live.map((x) => `${x.id}（${x.name}）`).join('、')}`,
      { candidates: live.map((x) => x.id) });
  }
  return live[0];
}

// 中继：这条链路（self）收到一条命令，判断该自己执行、交给名下子设备，还是拒绝。
// 不带 to 的老消息归自己。to 指向别人（包括同一用户的其它设备）一律拒绝——
// 中继只替自己名下的设备转发，服务器想借道去别的设备，这里不答应。
export function routeHere(msg, { self, children = [] }) {
  const to = cleanDeviceId(msg?.to?.device);
  const cap = capOf(msg);
  if (!to) {
    if (cap !== 'browser') {
      const kid = children.find((c) => kindsFor(cap).includes(c.kind));
      if (kid) return { device: kid, relay: true };
      throw err(DEVICE_ERRORS.NO_DEVICE, `这台设备上没有 ${cap} 能力`);
    }
    return { device: self, relay: false };
  }
  if (to === self.id) {
    if (!kindsFor(cap).includes(self.kind)) throw err(DEVICE_ERRORS.NO_DEVICE, `${self.kind} 设备不能执行 ${cap} 命令`);
    return { device: self, relay: false };
  }
  const kid = children.find((c) => c.id === to);
  if (!kid) throw err(DEVICE_ERRORS.DEVICE_NOT_HERE, `设备 ${to} 不在这条链路上`);
  if (!kindsFor(cap).includes(kid.kind)) throw err(DEVICE_ERRORS.NO_DEVICE, `${kid.kind} 设备不能执行 ${cap} 命令`);
  return { device: kid, relay: true };
}

// 结果和事件出门前盖上来源。from 只由执行它的一侧盖，信封里原有的 from 一律覆盖——
// 不能让 payload 里自带一个伪造的来源。
export function stampFrom(msg, device) {
  const d = cleanDevice(device);
  if (!d) return msg;
  return { ...msg, from: { device: d.id, kind: d.kind, ...(d.machine ? { machine: d.machine } : {}) } };
}

// 给 agent 看的一行行设备清单
export function describeDevices(devices) {
  const list = (Array.isArray(devices) ? devices : []).map(cleanDevice).filter(Boolean);
  if (!list.length) return '（没有可用设备）';
  return list.map((d) => {
    const bits = [d.kind, d.online ? '在线' : '离线'];
    if (d.machine) bits.push(`机器 ${d.machine}`);
    if (d.parent) bits.push(`经 ${d.parent} 中继`);
    if (d.caps.platform) bits.push(d.caps.platform);
    return `${d.id}  ${d.name}  (${bits.join(' · ')})`;
  }).join('\n');
}
