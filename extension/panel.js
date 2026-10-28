// 侧栏 —— agent 在这个窗口里做什么、连没连上、开关在哪，全在这一处。
//
// 2026-10-13 起它接替了两样东西：原 popup（连接状态、开关、会话列表）和页内
// 驾驶舱（准备做 / 正在做 / 时间线）。驾驶舱搬出页面是因为它常驻右下角，
// 正好压住聊天类页面的发送键（花叔收到的反馈，豆包实测复现）。
//
// 数据源：background 每条命令后把该 tab 的归属与时间线写进 storage.session
// （panel:<tabId>），这里只订阅、只渲染。所有外部文字（agent 声明的意图、
// 网页标题、client 名）一律 textContent——它们都可能源自被注入的页面。

import { compat, compatNote, cmpVersion } from './compat.js';

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const send = (msg) => chrome.runtime.sendMessage(msg).catch(() => null);
const MINE = chrome.runtime.getManifest().version;
const ACT_MS = 5000;   // 「正在做」只亮 5 秒——停手了还亮着就是在骗人

$('ver').textContent = `v${MINE}`;

const relTime = (t) => {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 5) return '刚刚';
  if (s < 60) return `${s}秒前`;
  if (s < 3600) return `${Math.floor(s / 60)}分前`;
  return `${Math.floor(s / 3600)}时前`;
};

let winId = null, tabId = null, actTimer = null;

// ---------- 这一页 ----------

async function renderPage() {
  const box = $('page');
  if (winId == null) winId = (await chrome.windows.getCurrent()).id;
  const [tab] = await chrome.tabs.query({ active: true, windowId: winId });
  tabId = tab?.id ?? null;
  const key = `panel:${tabId}`;
  const got = tabId == null ? {} : await chrome.storage.session.get([key, 'liveSids']);
  const lives = new Set(got.liveSids || []);
  const snap = got[key];
  // 会话结束后快照可能还没来得及摘（页面标记关着时没人去刷新它）——以在线名单为准
  const owners = (snap?.owners || []).filter((o) => lives.has(o.sid));

  box.textContent = '';
  if (!owners.length) {
    box.appendChild(el('div', 'empty', '这一页没有 agent 在操作。下面列着它们各自在哪一页，点一下就能切过去。'));
    return;
  }

  for (const o of owners) {
    const wrap = el('div');
    wrap.style.setProperty('--c', o.color);
    const head = el('div', 'owner');
    const sw = el('span', 'sw'); sw.style.background = o.color;
    head.append(sw, el('span', 'who', o.label), el('span', 'code', o.code));
    wrap.appendChild(head);

    if (snap.tabLabel) {
      const b = el('div', 'blk');
      b.append(el('div', 'lab', '本页'), el('div', null, snap.tabLabel));
      wrap.appendChild(b);
    }
    const intent = snap.intents?.[o.sid];
    if (intent?.text) {
      const b = el('div', 'blk');
      const q = el('div', 'intent', intent.text);
      q.appendChild(el('span', 'ago', relTime(intent.t)));
      b.append(el('div', 'lab', '准备做'), q);
      wrap.appendChild(b);
    }
    if (snap.plan?.length) {
      const p = snap.plan;
      const b = el('div', 'blk');
      b.append(el('div', 'lab', '接下来'),
        el('div', null, p.slice(0, 4).join(' → ') + (p.length > 4 ? ` →（还有 ${p.length - 4} 步）` : '')));
      wrap.appendChild(b);
    }
    if (snap.act && snap.sid === o.sid && Date.now() - snap.actAt < ACT_MS) {
      const b = el('div', 'blk');
      const n = el('div', 'now');
      const pl = el('span', 'pulse'); pl.style.background = o.color;
      n.append(pl, el('span', null, snap.act));
      b.append(el('div', 'lab', '正在做'), n);
      wrap.appendChild(b);
      clearTimeout(actTimer);
      actTimer = setTimeout(renderPage, ACT_MS - (Date.now() - snap.actAt) + 50);
    }
    const rows = snap.logs?.[o.sid] || [];
    if (rows.length) {
      const b = el('div', 'blk');
      const tl = el('div', 'tl');
      for (const r of rows) {
        const row = el('div', 'row');
        row.append(el('span', 'ago', relTime(r.t)), el('span', null, r.text));
        tl.appendChild(row);
      }
      b.append(el('div', 'lab', '时间线'), tl);
      wrap.appendChild(b);
    }
    box.appendChild(wrap);
  }
}

// ---------- 所有会话 ----------

async function renderSessions() {
  const r = await send({ __hcPopup: 'sessions' });
  $('mark').checked = r?.enabled !== false;
  const box = $('sess');
  box.textContent = '';
  const rows = r?.sessions || [];
  if (!rows.length) {
    box.appendChild(el('div', 'empty', '还没有 agent 在线。在 Claude Code、Codex 这类工具里让它用 huashu-chrome 做件事，这里就会出现。'));
    return rows;
  }
  for (const s of rows) {
    const b = el('button');
    const sw = el('span', 'dot'); sw.style.background = s.color;
    b.append(sw, el('span', 'who', s.label), el('span', 'page', s.title ? `· ${s.title}` : '· 还没打开页面'));
    if (s.tabId) b.onclick = () => send({ __hcPopup: 'focusTab', tabId: s.tabId });
    else b.disabled = true;
    box.appendChild(b);
  }
  return rows;
}

// ---------- 连接：三盏灯 ----------
//
// 用户以前只看得到一盏灯，分不清是扩展断了、本地端没起、还是根本没有 agent 在跑。
// 每盏红灯旁边直接给能复制的修法。

function light(state, name, sub, cmd) {
  const row = el('div', 'light');
  const d = el('span', `dot ${state}`);
  const txt = el('div');
  txt.appendChild(el('div', 'name', name));
  if (sub) txt.appendChild(el('div', 'sub', sub));
  if (cmd) {
    const c = el('div', 'cmd');
    const code = el('code', null, cmd);
    const btn = el('button', 'btn ghost', '复制');
    btn.onclick = async () => {
      try { await navigator.clipboard.writeText(cmd); btn.textContent = '已复制'; } catch { btn.textContent = '请手动复制'; }
      setTimeout(() => { btn.textContent = '复制'; }, 1600);
    };
    c.append(code, btn);
    txt.appendChild(c);
  }
  row.append(d, txt);
  return row;
}

async function renderConn(sessionCount) {
  const r = (await send({ __hcPopup: 'status' })) || {};
  const box = $('lights');
  box.textContent = '';
  box.appendChild(light('ok', `浏览器扩展 v${MINE}`, '已装好，正在运行'));

  let pill = ['bad', '未连接'];
  if (r.connected) {
    const level = compat({ ext: MINE, cli: r.bridge });
    const note = compatNote(level, { ext: MINE, cli: r.bridge });
    const needCli = level === 'cli-old' || (level === 'protocol' && cmpVersion(MINE, r.bridge) > 0);
    box.appendChild(light(note ? 'warn' : 'ok', `本地端 v${r.bridge || '?'}`, note || '已连接', needCli ? 'npx -y huashu-chrome@latest install' : null));
    pill = note ? ['warn', '已连接（有更新）'] : ['ok', '已连接'];
  } else {
    const never = !r.lastRx;
    box.appendChild(light('bad', '本地端未连接',
      never ? '还没装本地端，或者装了但还没有 agent 用过它（本地端由 agent 第一次调用时拉起）。在终端里跑这一行，它会自动配好你电脑上的 agent：'
        : `上次收到心跳是 ${relTime(r.lastRx)}。先点下面的「重连」；不行再在终端跑：`,
      never ? 'npx -y huashu-chrome@latest install' : 'npx huashu-chrome doctor'));
    if (r.offscreenError) box.appendChild(light('warn', '后台文档建不起来', r.offscreenError));
  }
  $('reconnRow').hidden = !!r.connected;

  box.appendChild(sessionCount
    ? light('ok', `${sessionCount} 个 agent 在线`, '每个 agent 用自己的颜色，页面描边和标签组同色')
    : light('', '暂无 agent 在线', '在你的 agent 里说一句「用 huashu-chrome 打开……」就会出现在这里'));

  $('pilldot').className = `dot ${pill[0]}`;
  $('pilltxt').textContent = pill[1];
}

async function refreshAll() {
  const rows = await renderSessions();
  await renderConn(rows.length);
}

$('reconn').onclick = async () => {
  $('reconn').disabled = true;
  $('reconn').textContent = '连接中…';
  await send({ __hcPopup: 'connect' });
  $('reconn').disabled = false;
  $('reconn').textContent = '重连';
  refreshAll();
};

// ---------- 设置 ----------

$('guide').onclick = (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
};

chrome.storage.local.get('l2Disabled', ({ l2Disabled }) => { $('l2').checked = !l2Disabled; });

$('l2').onchange = async (e) => {
  if (!e.target.checked) {
    // 关之前先把还挂着的调试会话断干净，否则开关关了、黄条还留在标签页上
    await send({ __hcPopup: 'detachAll' });
    await chrome.storage.local.set({ l2Disabled: true });
  } else {
    await chrome.storage.local.set({ l2Disabled: false });
  }
};

$('mark').onchange = async (e) => {
  await chrome.storage.local.set({ markDisabled: !e.target.checked });
  // 先落盘再让 background 去贴/摘——它读的就是这个开关
  await send({ __hcPopup: 'markSync' });
  refreshAll();
};

// ---------- 云端发布 ----------
//
// 状态全在 background（cloud.js），这里只发操作、只渲染。服务器给的文字
// （账号名、任务标题）一律 textContent——服务器被攻破时它们就是攻击者写的。

const cloudCall = async (op, extra = {}) => {
  const r = await send({ __hcCloud: op, ...extra });
  $('cloudErr').hidden = !!r?.ok;
  if (!r?.ok) $('cloudErr').textContent = r?.error || '扩展没有响应，稍后再试';
  if (r?.state) renderCloud(r.state);
  return r;
};

const CLOUD_STATE = {
  online: ['ok', '已连接'],
  connecting: ['warn', '连接中'],
  paused: ['warn', '已暂停'],
  error: ['bad', '连接失败'],
  off: ['', '未连接'],
};
const LOG_TEXT = {
  paired: '配对', unpaired: '解除配对', approved: '批准任务', denied: '拒绝任务', ended: '任务结束',
  sites_on: '允许了新网站', sites_off: '拒绝了新网站', sites_timeout: '新网站没回应',
  platforms: '改了允许的平台', probe: '检查登录', auto_on: '打开自动允许', auto_off: '关闭自动允许', paused: '暂停', resumed: '恢复',
};

function renderCloud(s) {
  const on = !!s.cfg;
  $('cloudPair').hidden = on || !!s.claim;
  $('cloudClaim').hidden = on || !s.claim;
  $('cloudOn').hidden = !on;
  if (!$('pairOrigin').value) $('pairOrigin').value = s.defaultOrigin;
  if (s.claim) {
    $('claimOrigin').textContent = new URL(s.claim.origin).host;
    $('claimAccount').textContent = `「${s.claim.account || '（未命名）'}」`;
  }
  if (!on) return;

  const [cls, word] = CLOUD_STATE[s.status?.state] || CLOUD_STATE.off;
  $('cloudDot').className = `dot ${cls}`;
  $('cloudName').textContent = `${new URL(s.cfg.origin).host} · ${word}`;
  $('cloudSub').textContent = s.status?.state === 'error' || s.status?.state === 'paused'
    ? s.status.message : `账号「${s.cfg.account || ''}」`;
  $('cloudAuto').checked = !!s.cfg.auto;
  $('cloudPause').checked = !!s.cfg.paused;

  const plats = $('cloudPlats');
  plats.textContent = '';
  for (const p of s.platforms) {
    const lab = el('label');
    const box = el('input');
    box.type = 'checkbox';
    box.value = p.id;
    box.checked = s.cfg.platforms.includes(p.id);
    box.onchange = () => cloudCall('setPlatforms', { platforms: [...plats.querySelectorAll('input:checked')].map((b) => b.value) });
    lab.title = p.hosts.join('、');
    lab.append(box, el('span', null, p.name));
    plats.appendChild(lab);
  }

  const names = (ids) => ids.map((id) => s.platforms.find((p) => p.id === id)?.name || id).join('、') || '（无）';
  const tasks = $('cloudTasks');
  tasks.textContent = '';
  for (const t of s.tasks.filter((x) => x.state !== 'denied')) {
    const box = el('div', `task ${t.state}`);
    box.appendChild(el('div', 't', t.title || `任务 ${t.jobId}`));
    const browse = t.kind === 'browse';
    if (t.state === 'pending') {
      box.appendChild(el('div', 'sub', browse
        ? `请求访问这些网站：${t.ask.join('、')}${t.purpose ? `。用途：${t.purpose}` : ''}`
        : `请求在 ${names(t.platforms)} 上发布`
        + (t.requested.length > t.platforms.length ? `（另请求了 ${names(t.requested.filter((id) => !t.platforms.includes(id)))}，你没勾选，不会给）` : '')));
      const row = el('div', 'row');
      const yes = el('button', 'btn', '允许');
      const no = el('button', 'btn ghost', '拒绝');
      yes.onclick = () => cloudCall('decide', { jobId: t.jobId, allow: true });
      no.onclick = () => cloudCall('decide', { jobId: t.jobId, allow: false });
      row.append(yes, no);
      box.appendChild(row);
    } else {
      const extra = t.sites || [];
      const where = browse
        ? extra.join('、')
        : names(t.platforms) + (extra.length ? ` + 额外网站：${extra.join('、')}` : '');
      box.appendChild(el('div', 'sub', `进行中 · ${where} · ${t.count} 条命令 · ${relTime(t.lastAt)}`));
      if (t.ask?.length) {
        box.appendChild(el('div', 'sub', `还想访问：${t.ask.join('、')}${t.askWhy ? `。用途：${t.askWhy}` : ''}`));
        const ask = el('div', 'row');
        const yes = el('button', 'btn', '允许这些网站');
        const no = el('button', 'btn ghost', '不允许');
        yes.onclick = () => cloudCall('decideSites', { jobId: t.jobId, allow: true });
        no.onclick = () => cloudCall('decideSites', { jobId: t.jobId, allow: false });
        ask.append(yes, no);
        box.appendChild(ask);
      }
      const row = el('div', 'row');
      const stop = el('button', 'btn ghost', '收回（关掉它的标签页）');
      stop.onclick = () => cloudCall('endTask', { jobId: t.jobId });
      row.appendChild(stop);
      box.appendChild(row);
    }
    tasks.appendChild(box);
  }

  const log = $('cloudLog');
  log.textContent = '';
  if (!s.log.length) log.appendChild(el('div', null, '还没有记录'));
  for (const r of s.log) {
    const row = el('div');
    const text = r.ev ? `${LOG_TEXT[r.ev] || r.ev}${r.msg ? ` ${r.msg}` : ''}` :`${r.cmd}${r.ok ? '' : ` ✗ ${r.code}${r.msg ? `：${r.msg}` : ''}`}`;
    row.append(el('span', 'ago', relTime(r.t)), el('span', r.ok === false ? 'no' : null, `${text}${r.job ? ` · ${String(r.job).slice(-6)}` : ''}`));
    log.appendChild(row);
  }
}

$('pairGo').onclick = async () => {
  $('pairGo').disabled = true;
  await cloudCall('claim', { origin: $('pairOrigin').value, code: $('pairCode').value });
  $('pairGo').disabled = false;
};
$('pairCode').onkeydown = (e) => { if (e.key === 'Enter') $('pairGo').click(); };
$('claimYes').onclick = async () => {
  $('claimYes').disabled = true;
  await cloudCall('confirm');
  $('claimYes').disabled = false;
  $('pairCode').value = '';
};
$('claimNo').onclick = () => cloudCall('cancelClaim');
$('cloudAuto').onchange = (e) => cloudCall('setAuto', { auto: e.target.checked });
$('cloudPause').onchange = (e) => cloudCall('setPaused', { paused: e.target.checked });
$('cloudReconn').onclick = () => cloudCall('reconnect');
$('cloudUnpair').onclick = () => {
  if (confirm('断开后这个服务器再也不能在本浏览器里发布，它开的标签页会被关掉。要再用得重新配对。')) cloudCall('unpair');
};

// ---------- 订阅 ----------

chrome.storage.onChanged.addListener((changes, area) => {
  const keys0 = Object.keys(changes);
  if (keys0.some((k) => ['cloud', 'cloudTasks', 'cloudLog', 'cloudStatus', 'cloudClaim'].includes(k))) void cloudCall('state');
  if (area !== 'session') return;
  const keys = Object.keys(changes);
  if (keys.includes(`panel:${tabId}`) || keys.includes('liveSids')) renderPage();
  if (keys.includes('liveSids') || keys.includes('bridgeConnected') || keys.includes('markedTabs')) refreshAll();
});
chrome.tabs.onActivated.addListener(({ windowId }) => { if (windowId === winId) renderPage(); });
chrome.tabs.onUpdated.addListener((id, info) => { if (info.title) refreshAll(); if (id === tabId && info.status === 'complete') renderPage(); });

renderPage();
refreshAll();
void cloudCall('state');
// 相对时间要走字，连接状态要跟上（桥的心跳不写 storage）
setInterval(() => { renderPage(); refreshAll(); void cloudCall('state'); }, 15000);
