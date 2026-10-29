// 云端通道 —— 让一个配对过的服务（默认 maker.vcorp.ai）在这个浏览器里替用户发布。
//
// 和本机那条桥是两回事：桥只有本机进程能连，agent 拿到的是全套工具；
// 云端通道是**这个浏览器主动连出去**的一条 WebSocket，对面是公网上的服务器。
// 所以这里的每一条命令都按「对面可能已经被攻破」来处理，规矩全在 cloud-policy.js：
// 只有页面操作那一小组命令、只能停在用户勾选的平台（以及本任务里逐个批准的额外网站）上、只能碰自己开的标签页、
// 上传只能用服务器上的素材、每个任务要用户点头。
//
// 身份：配对时在这里生成一对 ECDSA P-256 密钥，私钥以不可导出的 CryptoKey 存在
// IndexedDB，服务器只拿到公钥。每次连接对服务器给的随机数签名，签名里带上服务器
// 地址——换一台服务器重放这个签名没有用。服务器那边没有可被偷走后冒充本机的口令。
//
// socket 放在 SW 里，不放 offscreen：Chrome 116+ 上 WebSocket 收发消息会续 SW 的命，
// 20 秒一次心跳足够；SW 真被回收了，30 秒的 alarm 会把它连回来（见 background.js）。

import * as policy from './cloud-policy.js';
import * as folders from './folders.js';

const CFG = 'cloud';                 // storage.local：配对信息和用户的选择
const TASKS = 'cloudTasks';          // storage.local：任务（批准状态、自己开的标签页）
const LOG = 'cloudLog';              // storage.local：审计日志，侧栏可看
const STATUS = 'cloudStatus';        // storage.session：连接状态，侧栏订阅
const CLAIM = 'cloudClaim';          // storage.session：配对第一步拿到的账号，等用户确认
const LOG_CAP = 200;
const PING_MS = 20000;
const DEAD_MS = 65000;
const APPROVE_MS = 5 * 60 * 1000;
const PER_MINUTE = 120;
const DROP_MAX = 48 * 1024 * 1024;   // SW 读字节再交给页面的那条路的上限（同本机 upload）

let deps = null;     // background 注入：run(cmd, params, tabId, sid, label)、setCloudLive(sids)
let ws = null;
let pingTimer = null;
let retryTimer = null;
let retryDelay = 0;
let lastRx = 0;
let connecting = false;
const waiters = new Map();   // jobId → Set<fn(allow)>，等用户批准的命令
const recent = [];           // 最近一分钟的命令时间戳
let lock = Promise.resolve();
let mountWin = null;

const err = (code, message) => Object.assign(new Error(message), { code });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 任务表的读改写串行化：同一任务的几条命令可能并发到达，读改写交错会丢标签页
function serial(fn) {
  const run = lock.then(fn, fn);
  lock = run.catch(() => {});
  return run;
}

// ---------- 密钥 ----------

function idb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('hc-cloud', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('keys');
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function idbOp(mode, fn) {
  const db = await idb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('keys', mode);
      const req = fn(tx.objectStore('keys'));
      tx.oncomplete = () => resolve(req?.result);
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}
const keyGet = () => idbOp('readonly', (s) => s.get('device'));
const keySet = (v) => idbOp('readwrite', (s) => s.put(v, 'device'));
const keyDel = () => idbOp('readwrite', (s) => s.delete('device'));

async function newKey() {
  // 私钥 extractable:false —— 连扩展自己的代码也导不出原始私钥
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  return { privateKey: pair.privateKey, publicJwk: { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y } };
}

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sign(text) {
  const k = await keyGet();
  if (!k?.privateKey) throw err('CLOUD_UNPAIRED', '本机没有配对密钥');
  return b64url(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.privateKey, new TextEncoder().encode(text)));
}

// 签名内容的格式，和服务器那侧（opus-video-maker/extlink.js）逐字一致
export const helloText = (origin, deviceId, nonce) => `vcorp-cloud-v1\n${origin}\n${deviceId}\n${nonce}`;

// ---------- 配置 ----------

const getCfg = async () => (await chrome.storage.local.get(CFG))[CFG] || null;
const setCfg = (v) => chrome.storage.local.set({ [CFG]: v });
const setStatus = (state, message = '') => chrome.storage.session.set({ [STATUS]: { state, message, at: Date.now() } }).catch(() => {});

async function log(entry) {
  try {
    const { [LOG]: list = [] } = await chrome.storage.local.get(LOG);
    list.push({ t: Date.now(), ...entry });
    await chrome.storage.local.set({ [LOG]: list.slice(-LOG_CAP) });
  } catch { /* 日志写不进不影响干活 */ }
}

function deviceName() {
  const plat = navigator.userAgentData?.platform || (/Windows/.test(navigator.userAgent) ? 'Windows' : /Mac/.test(navigator.userAgent) ? 'macOS' : 'Linux');
  const ver = (navigator.userAgent.match(/Chrome\/(\d+)/) || [])[1] || '';
  return `Chrome ${ver} · ${plat}`.trim();
}

// ---------- 配对 ----------
//
// 两步：先 claim 拿到「这个码属于哪个账号」，给用户看一眼，确认了才 confirm 生成密钥。
// 多这一步是为了防「把这个码填进你的扩展」式的钓鱼——填别人给的码，等于把自己的
// 平台账号交给别人的 maker 账号发帖。确认框里写着账号名，看一眼就知道不对。

async function post(origin, path, body) {
  const res = await fetch(origin + path, {
    method: 'POST', credentials: 'omit', cache: 'no-store',
    headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  let data = null;
  try { data = await res.json(); } catch { /* 下面按状态码报 */ }
  if (!res.ok) throw err('CLOUD_PAIR', data?.error || `服务器返回 ${res.status}`);
  return data;
}

async function claim(rawOrigin, rawCode) {
  const origin = policy.normalizeOrigin(rawOrigin || policy.DEFAULT_ORIGIN);
  if (!origin) throw err('CLOUD_PAIR', '服务器地址必须是 https://（本机调试可用 http://localhost）');
  const code = String(rawCode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 8) throw err('CLOUD_PAIR', '配对码是 8 位字母和数字');
  const r = await post(origin, '/api/ext/pair/claim', { code });
  const pending = { origin, code, account: String(r.account || ''), expiresAt: r.expiresAt || Date.now() + 600000 };
  await chrome.storage.session.set({ [CLAIM]: pending });
  return pending;
}

async function confirmClaim() {
  const { [CLAIM]: c } = await chrome.storage.session.get(CLAIM);
  if (!c) throw err('CLOUD_PAIR', '没有待确认的配对，重新输入配对码');
  const key = await newKey();
  const r = await post(c.origin, '/api/ext/pair/confirm', { code: c.code, publicKey: key.publicJwk, name: deviceName() });
  if (!r?.deviceId) throw err('CLOUD_PAIR', '服务器没有返回设备号');
  await keySet({ privateKey: key.privateKey, deviceId: r.deviceId, origin: c.origin });
  const old = await getCfg();
  await setCfg({
    origin: c.origin, deviceId: r.deviceId, account: String(r.account || c.account), pairedAt: Date.now(),
    // 换绑时沿用用户之前的选择；第一次配对什么平台都不开，由用户逐个勾
    platforms: old?.platforms || [], auto: false, paused: false,
  });
  await chrome.storage.session.remove(CLAIM);
  await log({ ev: 'paired', account: r.account || c.account, origin: c.origin });
  clearTimeout(retryTimer); retryTimer = null;
  retryDelay = 0;
  void connect();
  return getCfg();
}

// 解除配对：先告诉服务器作废这个设备，再把本机的密钥、任务、云端开的标签页全部清掉。
// 服务器那一步失败也照样清本机——用户点了「断开」，本机就不能再听那边的话。
async function unpair() {
  const cfg = await getCfg();
  if (ws?.readyState === 1) { try { ws.send(JSON.stringify({ type: 'unpair' })); } catch { /* 下面照样清 */ } }
  await sleep(200);
  disconnect();
  const { [TASKS]: tasks = {} } = await chrome.storage.local.get(TASKS);
  for (const t of Object.values(tasks)) await closeTaskTabs(t, { force: true });
  await keyDel().catch(() => {});
  await chrome.storage.local.remove([CFG, TASKS]);
  deps?.setCloudLive([]);
  await setStatus('off');
  await log({ ev: 'unpaired', origin: cfg?.origin || '' });
}

// ---------- 连接 ----------

function disconnect() {
  clearInterval(pingTimer); pingTimer = null;
  clearTimeout(retryTimer); retryTimer = null;
  if (ws) { try { ws.onclose = null; ws.close(); } catch { /* 已经废了 */ } }
  ws = null;
}

function scheduleReconnect(minDelay = 0) {
  if (retryTimer) return;
  const grown = retryDelay ? Math.min(retryDelay * 2, 60000) : 1000;
  retryDelay = Math.max(grown, minDelay);
  retryTimer = setTimeout(() => { retryTimer = null; void connect(); }, retryDelay);
}

function socketUrl(origin) {
  const u = new URL(origin);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/api/ext/ws';
  u.search = '';
  u.hash = '';
  return u.href;
}

export async function connect() {
  // readyState 2 是 CLOSING。只挡 0 和 1 的话，旧连接还在关、新连接已经握上，
  // 代理会把叠在一起的升级请求回 503。
  if (connecting || retryTimer || (ws && ws.readyState !== 3)) return;
  const cfg = await getCfg();
  if (!cfg?.deviceId) return setStatus('off');
  if (cfg.paused) return setStatus('paused', '已暂停：云端命令一律不接');
  connecting = true;
  let sock;
  let opened = false;
  try {
    await setStatus('connecting');
    // 地址不合法时构造函数会抛，接住后重连。握手被拒（代理 503 等）不会抛：
    // Chrome 把 HTTP 状态写进自己的网络日志，脚本取消不了那一行。
    // 这种失败走下面的 onclose，并且把重试间隔拉到至少 15 秒，避免每秒一条。
    try { sock = new WebSocket(socketUrl(cfg.origin)); }
    catch { scheduleReconnect(); return; }
    ws = sock;
    lastRx = Date.now();
    sock.onopen = () => { opened = true; };
    sock.onerror = (ev) => { ev?.preventDefault?.(); };
    sock.onmessage = (ev) => {
      void (async () => {
        try {
          lastRx = Date.now();
          let m;
          try { m = JSON.parse(ev.data); } catch { return; }
          if (!m || typeof m !== 'object') return;
          if (m.type === 'ping') { if (sock.readyState === 1) sock.send(JSON.stringify({ type: 'pong' })); return; }
          if (m.type === 'pong') return;
          if (m.type === 'challenge') {
            try {
              const sig = await sign(helloText(cfg.origin, cfg.deviceId, String(m.nonce || '')));
              const mounted = await folders.names().catch(() => []);
              sock.send(JSON.stringify({
                type: 'hello', v: 1, deviceId: cfg.deviceId, sig,
                version: chrome.runtime.getManifest().version, platforms: cfg.platforms || [], auto: !!cfg.auto,
                folders: mounted,
              }));
            } catch { try { sock.close(); } catch { /* 已经废了 */ } }
            return;
          }
          if (m.type === 'welcome') {
            retryDelay = 0;
            await setStatus('online', String(m.account || cfg.account || ''));
            return;
          }
          // 服务器说这个设备已经被作废（用户在网页上删了它）：本机跟着解除，不再重连
          if (m.type === 'revoked') { await unpair(); await setStatus('off', '这个浏览器已在网页上被移除'); return; }
          if (m.type === 'cmd') { await handle(m); return; }
          if (m.type === 'probe') { await handleProbe(m); return; }
          if (m.type === 'mount_request') { await openMount(); return; }
          if (m.type === 'job_end') { await endTask(String(m.jobId || ''), 'server'); }
        } catch { /* 一条消息处理失败不能变成未捕获异常 */ }
      })();
    };
    sock.onclose = (ev) => {
      if (ws !== sock) return;
      ws = null;
      clearInterval(pingTimer); pingTimer = null;
      if (ev.code === 4401) { void setStatus('error', '服务器不认这个设备的签名，请重新配对'); return; }
      void setStatus('connecting');
      scheduleReconnect(opened ? 0 : 15000);
    };
    clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      try {
        if (sock.readyState !== 1) return;
        if (Date.now() - lastRx > DEAD_MS) { sock.close(); return; }
        sock.send(JSON.stringify({ type: 'ping' }));
      } catch { /* 发送时已经断开 */ }
    }, PING_MS);
  } catch {
    await setStatus('connecting');
    scheduleReconnect();
  } finally {
    connecting = false;
  }
}

// alarm 每 30 秒叫一次：配了对、没暂停、却没连着，就连
export async function ensureCloud() {
  if (retryTimer || (ws && ws.readyState !== 3)) return;
  const cfg = await getCfg();
  if (cfg?.deviceId && !cfg.paused) await connect();
}

const send = (m) => { try { if (ws?.readyState === 1) ws.send(JSON.stringify(m)); } catch { /* 发送时已经断开 */ } };

// ---------- 任务 ----------

const getTasks = async () => (await chrome.storage.local.get(TASKS))[TASKS] || {};
const setTasks = (t) => chrome.storage.local.set({ [TASKS]: t });
const sidOf = (jobId) => `cloud-${jobId}`;
// 带大写字母，identity.js 才会原样当显示名用（不然会被当 slug 机械美化）。
// sid 里没有冒号，页面标记上的短码就是任务号末 6 位，用户能和网页上的任务对上
const labelOf = (origin) => `Cloud · ${policy.hostOf(origin)}`;

async function pushLive() {
  const tasks = await getTasks();
  deps?.setCloudLive(Object.values(tasks).filter((t) => t.state === 'approved').map((t) => sidOf(t.jobId)));
}

// 通用任务（信封上带 sites 而不是 platforms）：能去哪些站点由用户逐个批准。
// 发布任务的白名单是勾选平台的根域，加上这个任务里另行批准的额外网站。
const isBrowse = (job) => Array.isArray(job?.sites);
const hostsOf = (t) => policy.taskHosts(t);

// 这条不是用户点的「拒绝」，是旧逻辑在没有勾选平台时自己记的。
// 浏览器任务（信封带 sites）或用户后来勾了平台，都要能重新评，不能把任务号卡死。
const STALE_DENY = '这个任务要用的平台你都没有在侧栏里勾选';

// 批准与否只由用户决定（或用户主动开了自动允许；通用任务和额外网站不算）。服务器只能申请。
// reason：通用任务第一次申请站点时 agent 写的用途，放进批准框里给用户看。
async function taskFor(job, cfg, reason = '', { allowEmpty = false } = {}) {
  const jobId = String(job?.id || '');
  if (!/^[\w-]{1,64}$/.test(jobId)) throw err('CLOUD_DENIED', '命令缺少有效的任务号');
  const title = String(job?.title || '').slice(0, 80);

  const t = await serial(async () => {
    const tasks = await getTasks();
    let task = tasks[jobId];
    if (task?.state === 'approved' && Date.now() - task.lastAt > policy.TASK_IDLE_MS) task = null;   // 闲置太久，重新问
    if (task?.state === 'denied' && task.why === STALE_DENY) { delete tasks[jobId]; task = null; await setTasks(tasks); }
    if (task?.state === 'denied') return task;
    if (task?.state === 'approved' || task?.state === 'pending') return task;
    if (isBrowse(job)) {
      const { sites } = policy.cleanSites(job.sites);
      // 只读本地文件夹的任务可以还没有网站。文件夹本身仍要单独点头，这里不替用户答应。
      if (!sites.length && !allowEmpty) return { state: 'nosites' };
      task = {
        jobId, title, kind: 'browse', requested: [], platforms: [], sites: [], ask: sites, refused: [], purpose: reason,
        folders: [], folderRefused: [], folderAsk: [], folderBytes: 0,
        tabs: [], cur: null, count: 0, state: sites.length ? 'pending' : 'approved', createdAt: Date.now(), lastAt: Date.now(), why: '',
      };
      tasks[jobId] = task;
      await setTasks(tasks);
      return task;
    }
    const requested = (Array.isArray(job?.platforms) ? job.platforms : []).map(String);
    const platforms = policy.grantedPlatforms(requested, cfg.platforms);
    task = {
      jobId, title, requested, platforms, sites: [], refused: [], ask: [],
      folders: [], folderRefused: [], folderAsk: [], folderBytes: 0,
      tabs: [], cur: null, count: 0,
      state: platforms.length ? (cfg.auto ? 'approved' : 'pending') : 'denied',
      createdAt: Date.now(), lastAt: Date.now(),
      why: platforms.length ? '' : STALE_DENY,
    };
    tasks[jobId] = task;
    await setTasks(tasks);
    return task;
  });

  if (t.state === 'nosites') throw err('NO_SITES', '通用任务要先用 sites 申请要访问的网站（如 sites {"add":["zhipin.com"],"reason":"找兼职"}），或用 folders 申请本地文件夹。用户批准后才能继续。');
  if (t.state === 'denied') throw err('CLOUD_DENIED', `用户拒绝了这个任务${t.why ? `：${t.why}` : ''}。不要重试。`);
  if (t.state === 'approved') return t;

  // 等用户点头。通知是把人叫回来的唯一办法；侧栏里同样有一张卡片
  notifyPending(t, cfg);
  const allow = await waitFor(jobId);
  if (allow === null) throw err('CLOUD_TIMEOUT', '用户 5 分钟内没有批准这个任务。告诉用户打开浏览器扩展侧栏批准后再继续。');
  if (!allow) throw err('CLOUD_DENIED', '用户拒绝了这个任务。不要重试。');
  return (await getTasks())[jobId];
}

// 用户的决定：true 允许、false 拒绝、null 5 分钟没理
function waitFor(key) {
  return new Promise((resolve) => {
    const set = waiters.get(key) || new Set();
    const fn = (v) => { clearTimeout(timer); set.delete(fn); resolve(v); };
    const timer = setTimeout(() => fn(null), APPROVE_MS);
    set.add(fn);
    waiters.set(key, set);
  });
}

function notifyPending(t, cfg) {
  const browse = t.kind === 'browse';
  const names = browse ? t.ask.join('、') : t.platforms.map((id) => policy.PLATFORMS[id]?.name || id).join('、');
  chrome.notifications?.create(`hc-cloud:${t.jobId}`, {
    type: 'basic', iconUrl: 'icons/icon128.png', priority: 2, requireInteraction: true,
    title: `${policy.hostOf(cfg.origin)} 请求在你的浏览器里${browse ? '操作这些网站' : '发布'}`,
    message: `${t.title ? `「${t.title}」` : browse ? '一个任务' : '一个发布任务'} → ${names}${browse && t.purpose ? `\n用途：${t.purpose}` : ''}`,
    buttons: [{ title: '允许' }, { title: '拒绝' }],
  }, () => void chrome.runtime.lastError);
}

// 进行中的任务又要新站点：单独问一次，只问这几个。发布任务和通用任务都走这里。
function notifySites(t, cfg) {
  const kind = t.kind === 'browse' ? '任务' : '发布任务';
  chrome.notifications?.create(`hc-cloud-sites:${t.jobId}`, {
    type: 'basic', iconUrl: 'icons/icon128.png', priority: 2, requireInteraction: true,
    title: `${policy.hostOf(cfg.origin)} 的${kind}还想访问新的网站`,
    message: `${t.title ? `「${t.title}」` : kind} → ${(t.ask || []).join('、')}${t.askWhy ? `\n用途：${t.askWhy}` : ''}`,
    buttons: [{ title: '允许' }, { title: '拒绝' }],
  }, () => void chrome.runtime.lastError);
}

// 任务申请额外网站。平台根域已经盖住的不再问；用户拒绝过的同一任务不再问。
// 「自动允许」管不到这里。总数超过 SITES_MAX 的部分这次不询问。
async function requestSites(task, p, cfg) {
  const split = policy.sitesToAsk(p.add, {
    covered: policy.allowedHosts(task.platforms),
    sites: task.sites || [],
    refused: task.refused || [],
  });
  if (split.ask.length) {
    const t = await updateTask(task.jobId, (x) => {
      if (!Array.isArray(x.sites)) x.sites = [];
      if (!Array.isArray(x.refused)) x.refused = [];
      x.ask = split.ask;
      x.askWhy = p.reason;
    });
    if (!t) throw err('CLOUD_DENIED', '这个任务已经结束');
    notifySites(t, cfg);
    const allow = await waitFor(`sites:${task.jobId}`);
    await updateTask(task.jobId, (x) => {
      if (!Array.isArray(x.sites)) x.sites = [];
      if (!Array.isArray(x.refused)) x.refused = [];
      if (allow) for (const h of split.ask) if (!x.sites.includes(h)) x.sites.push(h);
      else if (allow === false) for (const h of split.ask) if (!x.refused.includes(h)) x.refused.push(h);
      x.ask = [];
      x.askWhy = '';
    });
    chrome.notifications?.clear(`hc-cloud-sites:${task.jobId}`, () => void chrome.runtime.lastError);
    await log({ ev: allow ? 'sites_on' : allow === false ? 'sites_off' : 'sites_timeout', job: task.jobId, msg: split.ask.join(',') });
  }
  const now = (await getTasks())[task.jobId] || task;
  const sites = now.sites || [];
  const refused = now.refused || [];
  const lines = [`允许访问：${policy.taskHosts(now).join('、') || '（无）'}`];
  if (split.covered.length) lines.push(`已包含在勾选的平台里：${split.covered.join('、')}`);
  const no = p.add.filter((h) => refused.includes(h) && !split.covered.includes(h));
  const later = split.ask.filter((h) => !sites.includes(h) && !refused.includes(h));
  if (no.length) lines.push(`用户不同意：${no.join('、')}。不要再申请，换别的办法或在报告里说明。`);
  if (later.length) lines.push(`用户 5 分钟内没有回应：${later.join('、')}。可以稍后再申请一次。`);
  if (split.overflow.length) lines.push(`超出本任务额外网站上限（最多 ${policy.SITES_MAX} 个），这次没有询问：${split.overflow.join('、')}`);
  if (p.bad.length) lines.push(`不是可以申请的网站（要写域名，如 zhipin.com）：${p.bad.join('、')}`);
  return { text: lines.join('\n'), sites };
}

function notifyFolders(t, cfg) {
  const kind = t.kind === 'browse' ? '任务' : '发布任务';
  chrome.notifications?.create(`hc-cloud-folders:${t.jobId}`, {
    type: 'basic', iconUrl: 'icons/icon128.png', priority: 2, requireInteraction: true,
    title: `${policy.hostOf(cfg.origin)} 的${kind}想读取你的本地文件夹`,
    message: `${t.title ? `「${t.title}」` : kind} → ${(t.folderAsk || []).join('、')}${t.folderAskWhy ? `\n用途：${t.folderAskWhy}` : ''}`,
    buttons: [{ title: '允许' }, { title: '拒绝' }],
  }, () => void chrome.runtime.lastError);
}

// 和额外网站一样：「自动允许」管不到文件夹。没挂载的名字不弹窗，直接告诉 agent。
async function requestFolders(task, p, cfg) {
  const mounted = await folders.names().catch(() => []);
  const have = new Set(mounted.map((f) => f.name));
  const known = p.use.filter((name) => have.has(name));
  const unknown = p.use.filter((name) => !have.has(name));
  const split = policy.foldersToAsk(known, { granted: task.folders || [], refused: task.folderRefused || [] });
  if (split.ask.length) {
    const t = await updateTask(task.jobId, (x) => {
      if (!Array.isArray(x.folders)) x.folders = [];
      if (!Array.isArray(x.folderRefused)) x.folderRefused = [];
      x.folderAsk = split.ask;
      x.folderAskWhy = p.reason;
    });
    if (!t) throw err('CLOUD_DENIED', '这个任务已经结束');
    notifyFolders(t, cfg);
    const allow = await waitFor(`folders:${task.jobId}`);
    await updateTask(task.jobId, (x) => {
      if (!Array.isArray(x.folders)) x.folders = [];
      if (!Array.isArray(x.folderRefused)) x.folderRefused = [];
      if (allow) for (const name of split.ask) if (!x.folders.includes(name) && x.folders.length < policy.FS_FOLDERS_MAX) x.folders.push(name);
      else if (allow === false) for (const name of split.ask) if (!x.folderRefused.includes(name)) x.folderRefused.push(name);
      x.folderAsk = [];
      x.folderAskWhy = '';
    });
    chrome.notifications?.clear(`hc-cloud-folders:${task.jobId}`, () => void chrome.runtime.lastError);
    await log({ ev: allow ? 'folders_on' : allow === false ? 'folders_off' : 'folders_timeout', job: task.jobId, msg: split.ask.join(',') });
  }
  const now = (await getTasks())[task.jobId] || task;
  const granted = now.folders || [];
  const refused = now.folderRefused || [];
  const lines = [`已挂载：${mounted.map((f) => f.name).join('、') || '（无）'}`];
  lines.push(`本任务可以读：${granted.join('、') || '（无）'}`);
  const no = known.filter((name) => refused.includes(name));
  const later = split.ask.filter((name) => !granted.includes(name) && !refused.includes(name));
  if (no.length) lines.push(`用户不同意：${no.join('、')}。不要再申请。`);
  if (later.length) lines.push(`用户 5 分钟内没有回应：${later.join('、')}。可以稍后再申请一次。`);
  if (unknown.length) lines.push(`这个浏览器没有挂载：${unknown.join('、')}。请用户在网页上点「挂载本地文件夹」。`);
  if (p.bad.length) lines.push(`不是合法的文件夹名：${p.bad.join('、')}`);
  return { text: lines.join('\n'), folders: granted, audit: `folders ${p.use.join(',') || '(list)'}` };
}

function decideFolders(jobId, allow) {
  chrome.notifications?.clear(`hc-cloud-folders:${jobId}`, () => void chrome.runtime.lastError);
  for (const fn of waiters.get(`folders:${jobId}`) || []) fn(!!allow);
}

async function notifyLocked(entry) {
  chrome.notifications?.create(`hc-folder:${entry.id}`, {
    type: 'basic', iconUrl: 'icons/icon128.png', priority: 2, requireInteraction: true,
    title: '本地文件夹需要重新允许',
    message: `「${entry.name}」的读取权限失效了。点这里打开窗口，再点「恢复访问」。`,
  }, () => void chrome.runtime.lastError);
  await openMount(entry.id).catch(() => {});
}

async function fsCmd(cmd, p, task) {
  const granted = task.folders || [];
  if (!granted.includes(p.folder)) {
    throw err('CLOUD_DENIED', `本任务还不能读「${p.folder}」。先用 folders 申请，用户点头之后再读。`);
  }
  const entry = await folders.getByName(p.folder);
  if (!entry?.handle) throw err('CLOUD_DENIED', `这个浏览器上没有「${p.folder}」。请用户在网页上重新挂载。`);
  try {
    if (cmd === 'fs_list') return await folders.listTree(entry.handle, { path: p.path, depth: p.depth, glob: p.glob, folder: p.folder });
    const file = await folders.readFile(entry.handle, p.path);
    let reserved = false;
    const held = await updateTask(task.jobId, (x) => {
      const used = x.folderBytes || 0;
      if (used + file.size > policy.FS_TASK_MAX) return;
      x.folderBytes = used + file.size;
      reserved = true;
    });
    if (!held) throw err('CLOUD_DENIED', '这个任务已经结束');
    if (!reserved) throw err('CLOUD_DENIED', '这个任务读取本地文件已到 256MB 上限');
    try {
      const up = await folders.uploadFile(file, p.upload.url);
      return { text: `已读取 ${p.folder}/${p.path}（${up.bytes} 字节），可以拉取了。`, bytes: up.bytes, name: up.name, audit: `read ${p.folder}/${p.path} ${up.bytes}` };
    } catch (e) {
      await updateTask(task.jobId, (x) => { x.folderBytes = Math.max(0, (x.folderBytes || 0) - file.size); });
      throw e;
    }
  } catch (e) {
    if (e.code === 'FOLDER_LOCKED') {
      await notifyLocked(entry);
      throw err('FOLDER_LOCKED', `文件夹「${entry.name}」需要你重新允许一次。已打开窗口，点「恢复访问」后再试。`);
    }
    throw e;
  }
}

async function openMount(folderId = '') {
  const url = chrome.runtime.getURL('mount.html') + (folderId ? `?id=${encodeURIComponent(folderId)}` : '');
  if (mountWin != null) {
    const existing = await chrome.windows.get(mountWin).catch(() => null);
    if (existing) {
      await chrome.windows.update(mountWin, { focused: true, drawAttention: true }).catch(() => {});
      const [tab] = await chrome.tabs.query({ windowId: mountWin });
      if (tab) await chrome.tabs.update(tab.id, { url }).catch(() => {});
      return;
    }
    mountWin = null;
  }
  const created = await chrome.windows.create({ url, type: 'popup', width: 440, height: 560, focused: true });
  mountWin = created?.id ?? null;
}

async function reportFolders() {
  const mounted = await folders.names().catch(() => []);
  const cfg = await getCfg();
  if (cfg && ws?.readyState === 1) send({ type: 'config', platforms: cfg.platforms || [], auto: !!cfg.auto, folders: mounted });
  await chrome.storage.session.set({ folderTick: Date.now() }).catch(() => {});
}

function decideSites(jobId, allow) {
  chrome.notifications?.clear(`hc-cloud-sites:${jobId}`, () => void chrome.runtime.lastError);
  for (const fn of waiters.get(`sites:${jobId}`) || []) fn(!!allow);
}

async function decide(jobId, allow) {
  await serial(async () => {
    const tasks = await getTasks();
    const t = tasks[jobId];
    if (!t || t.state !== 'pending') return;
    t.state = allow ? 'approved' : 'denied';
    t.lastAt = Date.now();
    if (!allow) t.why = '';
    if (allow && t.kind === 'browse') { t.sites = t.ask; t.ask = []; }
    await setTasks(tasks);
  });
  chrome.notifications?.clear(`hc-cloud:${jobId}`, () => void chrome.runtime.lastError);
  await log({ ev: allow ? 'approved' : 'denied', job: jobId });
  await pushLive();
  for (const fn of waiters.get(jobId) || []) fn(!!allow);
}

// 任务结束（服务器说完了，或用户在侧栏里收回）：从此不再接它的命令，关掉它开的标签页。
// 用户正盯着的那一页不关——他可能正在核对刚发出去的作品。
async function endTask(jobId, by) {
  const t = await serial(async () => {
    const tasks = await getTasks();
    const task = tasks[jobId];
    if (!task) return null;
    delete tasks[jobId];
    await setTasks(tasks);
    return task;
  });
  if (!t) return;
  for (const fn of waiters.get(jobId) || []) fn(false);
  for (const fn of waiters.get(`sites:${jobId}`) || []) fn(false);
  for (const fn of waiters.get(`folders:${jobId}`) || []) fn(false);
  chrome.notifications?.clear(`hc-cloud:${jobId}`, () => void chrome.runtime.lastError);
  chrome.notifications?.clear(`hc-cloud-sites:${jobId}`, () => void chrome.runtime.lastError);
  chrome.notifications?.clear(`hc-cloud-folders:${jobId}`, () => void chrome.runtime.lastError);
  await closeTaskTabs(t, { force: by === 'user' });
  await pushLive();
  await log({ ev: 'ended', job: jobId, by });
}

async function closeTaskTabs(t, { force = false } = {}) {
  for (const id of t.tabs || []) {
    const tab = await chrome.tabs.get(id).catch(() => null);
    if (!tab) continue;
    if (!force && tab.active) continue;
    await chrome.tabs.remove(id).catch(() => {});
  }
}

const updateTask = (jobId, fn) => serial(async () => {
  const tasks = await getTasks();
  if (!tasks[jobId]) return null;
  fn(tasks[jobId]);
  await setTasks(tasks);
  return tasks[jobId];
});

// ---------- 命令 ----------

async function handle(m) {
  const started = Date.now();
  const jobId = String(m.job?.id || '');
  try {
    const data = await exec(m);
    let out = data;
    const audit = out && typeof out === 'object' ? out.audit : '';
    if (out && typeof out === 'object') delete out.audit;
    if (JSON.stringify(out ?? null).length > policy.RESULT_MAX) {
      out = { text: String(data?.text || '').slice(0, 200000) + '\n…（结果太大，已截断）' };
    }
    send({ type: 'res', id: m.id, ok: true, data: out });
    await log({ job: jobId, cmd: m.cmd, ok: true, ms: Date.now() - started, ...(audit ? { msg: String(audit).slice(0, 160) } : {}) });
  } catch (e) {
    send({ type: 'res', id: m.id, ok: false, error: { code: e.code || 'INTERNAL', message: e.message || String(e) } });
    await log({ job: jobId, cmd: m.cmd, ok: false, code: e.code || 'INTERNAL', msg: String(e.message || e).slice(0, 120) });
  }
}

// 地址：正在加载的那个（pendingUrl）也要算——导航提交之前 url 还是旧的
const urlsOf = (tab) => [tab.url || '', tab.pendingUrl || ''].filter(Boolean);
const tabAllowed = (tab, hosts) => urlsOf(tab).every((u) => policy.urlAllowed(u, hosts));

// 跳出白名单的页先退回；退不回就清空成空白页。内容一律不出去。
async function bounce(tabId, hosts) {
  await chrome.tabs.goBack(tabId).catch(() => {});
  await sleep(1500);
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (tab && !tabAllowed(tab, hosts)) await chrome.tabs.update(tabId, { url: 'about:blank' }).catch(() => {});
}

async function exec(m) {
  const cfg = await getCfg();
  if (!cfg?.deviceId) throw err('CLOUD_UNPAIRED', '这个浏览器没有配对');
  if (cfg.paused) throw err('CLOUD_PAUSED', '用户暂停了云端控制。告诉用户在扩展侧栏里恢复后再继续。');
  const now = Date.now();
  while (recent.length && now - recent[0] > 60000) recent.shift();
  if (recent.length >= PER_MINUTE) throw err('CLOUD_RATE', '命令太密（每分钟最多 120 条），放慢一点');
  recent.push(now);

  const reason = m.cmd === 'sites' || m.cmd === 'folders' ? String(m.params?.reason || '').slice(0, 200) : '';
  const task = await taskFor(m.job, cfg, reason, { allowEmpty: m.cmd === 'folders' });
  const jobId = task.jobId;
  const updated = await updateTask(jobId, (t) => { t.count += 1; t.lastAt = Date.now(); });
  if (!updated) throw err('CLOUD_DENIED', '这个任务已经结束');
  if (updated.count > policy.TASK_CMD_CAP) throw err('CLOUD_DENIED', `一个任务最多 ${policy.TASK_CMD_CAP} 条命令，已经用完`);

  const hosts = hostsOf(updated);
  const p = policy.checkCommand(m.cmd, m.params, { hosts, origin: cfg.origin });
  if (m.cmd === 'sites') return requestSites(updated, p, cfg);
  if (m.cmd === 'folders') return requestFolders(updated, p, cfg);
  if (m.cmd === 'fs_list' || m.cmd === 'fs_read') return fsCmd(m.cmd, p, updated);
  const sid = sidOf(jobId);
  const label = labelOf(cfg.origin);
  const own = new Set(updated.tabs);

  if (m.cmd === 'tabs') return tabsCmd(p, m, updated, { sid, label, hosts, own });

  const tid = Number(m.tabId ?? m.params?.tabId ?? updated.cur);
  if (!tid || !own.has(tid)) {
    throw err('NO_TAB', updated.tabs.length
      ? `只能操作本任务自己开的标签页：${updated.tabs.join('、')}`
      : '本任务还没有标签页——先 tabs(action:"new", url:…) 开一个');
  }
  const tab = await chrome.tabs.get(tid).catch(() => null);
  if (!tab) throw err('NO_TAB', `标签页 ${tid} 已经关了`);
  if (!tabAllowed(tab, hosts)) {
    await bounce(tid, hosts);
    return policy.redactOffList(tab.pendingUrl || tab.url);
  }

  // 浮条上写明是谁在问：云端发来的文字可能是钓鱼，用户得知道这不是本机 agent 说的
  if (m.cmd === 'ask') p.title = `☁ ${policy.hostOf(cfg.origin)}：${String(p.title || '需要你搭把手').slice(0, 60)}`;
  const data = m.cmd === 'upload'
    ? await uploadMedia(p, tid, sid, label)
    : await deps.run(m.cmd, p, tid, sid, label);

  // 结果出门前再查一遍本任务所有标签页：有一页跳出了白名单，整份结果都不能出去
  const after = (await getTasks())[jobId]?.tabs || [];
  for (const id of after) {
    const t = await chrome.tabs.get(id).catch(() => null);
    if (t && !tabAllowed(t, hosts)) {
      await bounce(id, hosts);
      return policy.redactOffList(t.pendingUrl || t.url);
    }
  }
  // 点击开出了新标签页，后台已经跟过去了：下一条缺省命令落在新页上
  const next = Number(data?.tabId) && after.includes(Number(data.tabId)) ? Number(data.tabId) : tid;
  await updateTask(jobId, (t) => { t.cur = next; });
  return data;
}

async function tabsCmd(p, m, task, { sid, label, hosts, own }) {
  if (p.action === 'list') {
    const lines = [];
    for (const id of task.tabs) {
      const t = await chrome.tabs.get(id).catch(() => null);
      if (!t) continue;
      const ok = tabAllowed(t, hosts);
      lines.push(`[${id}]${id === task.cur ? ' *' : '  '} ${ok ? `${t.title || '(无标题)'} — ${t.url}` : '（已跳出允许范围，内容屏蔽）'}`);
    }
    return { text: lines.length ? `本任务的标签页（* = 缺省）：\n${lines.join('\n')}` : '本任务还没有标签页' };
  }
  if (p.action === 'new') {
    // 不动全局的「最近受控标签页」：本机 agent 不该继承到云端任务开的页
    const { activeTabId } = await chrome.storage.local.get('activeTabId');
    const r = await deps.run('tabs', p, undefined, sid, label);
    if (activeTabId) await chrome.storage.local.set({ activeTabId });
    else await chrome.storage.local.remove('activeTabId');
    const id = Number(r?.tabId);
    if (id) await updateTask(task.jobId, (t) => { if (!t.tabs.includes(id)) t.tabs.push(id); t.cur = id; });
    return r;
  }
  const id = Number(m.params?.tabId ?? m.tabId);
  if (!own.has(id)) throw err('NO_TAB', `只能操作本任务自己开的标签页：${task.tabs.join('、') || '（还没有）'}`);
  if (p.action === 'select') {
    await updateTask(task.jobId, (t) => { t.cur = id; });
    return { text: `受控标签页切到 [${id}]` };
  }
  await chrome.tabs.remove(id).catch(() => {});
  await updateTask(task.jobId, (t) => { t.tabs = t.tabs.filter((x) => x !== id); if (t.cur === id) t.cur = t.tabs.at(-1) || null; });
  return { text: `已关闭标签页 ${id}` };
}

// 上传：素材从配对服务器取，本机磁盘一个字节都不碰。
//   ① 页面里的内容脚本自己去取（服务器的素材接口带 CORS），在页面里造 File 投进去——
//      不经过消息通道，几百 MB 的视频也不用转 base64
//   ② 取不到（极少数页面拦得住）就由 SW 取、转 base64 交给页面，限 48MB
async function uploadMedia(p, tid, sid, label) {
  const { media } = p;
  const base = { name: media.name, type: media.type, bytes: media.size, selector: p.selector, dropSelector: p.dropSelector };
  let why = '';
  try {
    return await deps.run('upload', { ...base, url: media.url }, tid, sid, label);
  } catch (e) {
    if (e.code !== 'FETCH_FAILED') throw e;
    why = e.message;
  }
  if (media.size > DROP_MAX) {
    throw err('INTERNAL', `页面里取不到素材（${why}），而素材 ${(media.size / 1048576).toFixed(0)}MB 超过 48MB，没法改由扩展转交。`);
  }
  const res = await fetch(media.url, { credentials: 'omit', cache: 'no-store' });
  if (!res.ok) throw err('INTERNAL', `取素材失败：${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length !== media.size) throw err('INTERNAL', `素材大小不对：应为 ${media.size}，实际 ${bytes.length}`);
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return deps.run('upload', { ...base, base64: btoa(s) }, tid, sid, label);
}

// ---------- 登录探测 ----------
//
// 服务器问「这几个平台登录了没有」（做视频时勾了自动发布，提交前要先确认）。
// 只探用户勾选过的平台，地址和判据写死在 cloud-policy.js 的 PROBES 里，
// 回去的只有每个平台一个状态词，页面内容一个字都不出去。
// 在后台开一个标签页看完就关；2 分钟内同一平台复用上次结果，防止服务器刷开标签页。

const PROBE_TTL_MS = 2 * 60 * 1000;
const PROBE_WAIT_MS = 15000;
const probeCache = new Map();   // platform → { state, at }
let probeLock = Promise.resolve();

async function probeOne(id) {
  const probe = policy.PROBES[id];
  const hit = probeCache.get(id);
  if (hit && Date.now() - hit.at < PROBE_TTL_MS) return hit.state;
  const tab = await chrome.tabs.create({ url: probe.url, active: false });
  let state = null;
  try {
    const until = Date.now() + PROBE_WAIT_MS;
    while (!state && Date.now() < until) {
      await sleep(1000);
      const t = await chrome.tabs.get(tab.id).catch(() => null);
      if (!t) break;
      let text = '';
      if (t.status === 'complete') {
        try {
          const [r] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => document.body?.innerText.slice(0, 20000) || '' });
          text = r?.result || '';
        } catch { /* 页面还在跳 */ }
      }
      state = policy.judgeProbe(probe, { url: t.pendingUrl || t.url || '', text });
    }
  } finally {
    await chrome.tabs.remove(tab.id).catch(() => {});
  }
  state = state || 'unknown';
  probeCache.set(id, { state, at: Date.now() });
  return state;
}

async function handleProbe(m) {
  const run = probeLock.then(async () => {
    const cfg = await getCfg();
    const out = {};
    for (const id of [...new Set(Array.isArray(m.platforms) ? m.platforms.map(String) : [])].slice(0, 8)) {
      if (!policy.PROBES[id]) continue;
      out[id] = cfg?.platforms?.includes(id) ? await probeOne(id) : 'denied';
    }
    return out;
  });
  probeLock = run.catch(() => {});
  try {
    const data = await run;
    send({ type: 'res', id: m.id, ok: true, data });
    await log({ ev: 'probe', msg: Object.entries(data).map(([k, v]) => `${policy.PLATFORMS[k]?.name || k}:${v}`).join(' ') });
  } catch (e) {
    send({ type: 'res', id: m.id, ok: false, error: { code: 'INTERNAL', message: e.message || String(e) } });
  }
}

// ---------- 侧栏 ----------

// 只认扩展自己的页面（侧栏）发来的。内容脚本跑在网页里，页面被攻破时它也可能被利用，
// 配对、批准、解除这些动作不能从那里发起。
const fromPanel = (sender) => !sender.tab && typeof sender.url === 'string' && sender.url.startsWith(chrome.runtime.getURL(''));

async function panelState() {
  const [cfg, { [STATUS]: status }, { [CLAIM]: claimed }, tasks, { [LOG]: list = [] }] = await Promise.all([
    getCfg(), chrome.storage.session.get(STATUS), chrome.storage.session.get(CLAIM), getTasks(), chrome.storage.local.get(LOG),
  ]);
  return {
    cfg: cfg && { origin: cfg.origin, account: cfg.account, platforms: cfg.platforms, auto: cfg.auto, paused: cfg.paused, pairedAt: cfg.pairedAt },
    status: status || { state: 'off' },
    claim: claimed && claimed.expiresAt > Date.now() ? { origin: claimed.origin, account: claimed.account } : null,
    tasks: Object.values(tasks).sort((a, b) => b.lastAt - a.lastAt),
    folders: await folders.listFolders().catch(() => []),
    log: list.slice(-40).reverse(),
    platforms: Object.entries(policy.PLATFORMS).map(([id, p]) => ({ id, name: p.name, hosts: p.hosts })),
    defaultOrigin: policy.DEFAULT_ORIGIN,
  };
}

async function patchCfg(patch) {
  const cfg = await getCfg();
  if (!cfg) throw err('CLOUD_UNPAIRED', '还没有配对');
  const next = { ...cfg, ...patch };
  await setCfg(next);
  const mounted = await folders.names().catch(() => []);
  send({ type: 'config', platforms: next.platforms, auto: !!next.auto, folders: mounted });
  return next;
}

async function onPanel(m) {
  switch (m.op) {
    case 'state': return panelState();
    case 'claim': await claim(m.origin, m.code); return panelState();
    case 'cancelClaim': await chrome.storage.session.remove(CLAIM); return panelState();
    case 'confirm': await confirmClaim(); return panelState();
    case 'unpair': await unpair(); return panelState();
    case 'setPlatforms': {
      const ids = (Array.isArray(m.platforms) ? m.platforms : []).filter((id) => policy.PLATFORMS[id]);
      await patchCfg({ platforms: ids });
      // 收回的平台立刻从进行中的任务里摘掉
      await serial(async () => {
        const tasks = await getTasks();
        for (const t of Object.values(tasks)) t.platforms = t.platforms.filter((id) => ids.includes(id));
        await setTasks(tasks);
      });
      await log({ ev: 'platforms', platforms: ids.join(',') });
      return panelState();
    }
    case 'setAuto': await patchCfg({ auto: !!m.auto }); await log({ ev: m.auto ? 'auto_on' : 'auto_off' }); return panelState();
    case 'setPaused': {
      await patchCfg({ paused: !!m.paused });
      await log({ ev: m.paused ? 'paused' : 'resumed' });
      if (m.paused) { disconnect(); await setStatus('paused', '已暂停：云端命令一律不接'); } else void connect();
      return panelState();
    }
    case 'decide': await decide(String(m.jobId), !!m.allow); return panelState();
    case 'decideSites': decideSites(String(m.jobId), !!m.allow); return panelState();
    case 'decideFolders': decideFolders(String(m.jobId), !!m.allow); return panelState();
    case 'openMount': await openMount(m.folderId ? String(m.folderId) : ''); return panelState();
    case 'removeFolder': await folders.removeFolder(String(m.id || '')); await reportFolders(); return panelState();
    case 'foldersChanged': await reportFolders(); return panelState();
    case 'endTask': await endTask(String(m.jobId), 'user'); return panelState();
    case 'reconnect': disconnect(); retryDelay = 0; await connect(); return panelState();
    default: throw err('INTERNAL', `未知操作 ${m.op}`);
  }
}

// ---------- 装配 ----------

export function initCloud(d) {
  deps = d;

  chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
    if (!m?.__hcCloud) return false;
    if (!fromPanel(sender)) { sendResponse({ ok: false, error: '只接受扩展侧栏发来的操作' }); return false; }
    onPanel({ ...m, op: m.__hcCloud }).then(
      (state) => sendResponse({ ok: true, state }),
      (e) => sendResponse({ ok: false, error: e.message || String(e) }),
    );
    return true;
  });

  chrome.notifications?.onButtonClicked.addListener((id, idx) => {
    if (id.startsWith('hc-cloud-folders:')) decideFolders(id.slice('hc-cloud-folders:'.length), idx === 0);
    else if (id.startsWith('hc-cloud-sites:')) decideSites(id.slice('hc-cloud-sites:'.length), idx === 0);
    else if (id.startsWith('hc-cloud:')) void decide(id.slice('hc-cloud:'.length), idx === 0);
    else if (id.startsWith('hc-folder:')) void openMount(id.slice('hc-folder:'.length));
  });
  chrome.notifications?.onClicked.addListener((id) => {
    if (id.startsWith('hc-folder:')) void openMount(id.slice('hc-folder:'.length));
  });
  chrome.windows?.onRemoved.addListener((id) => { if (id === mountWin) mountWin = null; });

  // 从本任务的页面里点开的新标签页（「去发布」常在新页打开）归同一个任务，
  // 白名单照样管它：下一条命令前、结果出门前都会核对地址
  chrome.tabs.onCreated.addListener((tab) => {
    if (!tab.openerTabId) return;
    void serial(async () => {
      const tasks = await getTasks();
      const t = Object.values(tasks).find((x) => x.state === 'approved' && x.tabs.includes(tab.openerTabId));
      if (!t || t.tabs.includes(tab.id)) return;
      t.tabs.push(tab.id);
      await setTasks(tasks);
    });
  });
  chrome.tabs.onRemoved.addListener((tabId) => {
    void serial(async () => {
      const tasks = await getTasks();
      let hit = false;
      for (const t of Object.values(tasks)) {
        if (!t.tabs.includes(tabId)) continue;
        t.tabs = t.tabs.filter((x) => x !== tabId);
        if (t.cur === tabId) t.cur = t.tabs.at(-1) || null;
        hit = true;
      }
      if (hit) await setTasks(tasks);
    });
  });

  // 闲置太久的批准作废，结束了的任务不留在侧栏里
  void serial(async () => {
    const tasks = await getTasks();
    let dirty = false;
    for (const [id, t] of Object.entries(tasks)) {
      if (Date.now() - t.lastAt > policy.TASK_IDLE_MS) { delete tasks[id]; dirty = true; }
    }
    if (dirty) await setTasks(tasks);
  }).then(pushLive);

  void ensureCloud();
}
