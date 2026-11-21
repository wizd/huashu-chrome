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
import { setWrite } from './folders.js';
import { L, LANG, LANG_KEY, setupPage } from './i18n.js';

// 先定语言再渲染：下面的常量表也在用 L()
await setupPage();

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const send = (msg) => chrome.runtime.sendMessage(msg).catch(() => null);
const MINE = chrome.runtime.getManifest().version;
// 扩展在 chrome://extensions 上被重新加载之后，已经打开的侧栏还是旧文档，
// 版本号会停在重载前（控制台里的 service worker 已经是新的）。上下文一失效就刷新。
setInterval(() => {
  try { if (!chrome.runtime?.id) location.reload(); } catch { location.reload(); }
}, 1000);
const ACT_MS = 5000;   // 「正在做」只亮 5 秒——停手了还亮着就是在骗人

$('connJump').onclick = (e) => {
  e.preventDefault();
  $('conn').scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const relTime = (t) => {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 5) return L('刚刚', 'just now');
  if (s < 60) return L(`${s}秒前`, `${s}s ago`);
  if (s < 3600) return L(`${Math.floor(s / 60)}分前`, `${Math.floor(s / 60)}m ago`);
  return L(`${Math.floor(s / 3600)}时前`, `${Math.floor(s / 3600)}h ago`);
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
    box.appendChild(el('div', 'empty', L('这一页没有 agent 在操作。下面列着它们各自在哪一页，点一下就能切过去。', 'No agent is working on this page. The list below shows which page each one is on; click to switch there.')));
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
      b.append(el('div', 'lab', L('本页', 'Page')), el('div', null, snap.tabLabel));
      wrap.appendChild(b);
    }
    const intent = snap.intents?.[o.sid];
    if (intent?.text) {
      const b = el('div', 'blk');
      const q = el('div', 'intent', intent.text);
      q.appendChild(el('span', 'ago', relTime(intent.t)));
      b.append(el('div', 'lab', L('准备做', 'About to')), q);
      wrap.appendChild(b);
    }
    if (snap.plan?.length) {
      const p = snap.plan;
      const b = el('div', 'blk');
      b.append(el('div', 'lab', L('接下来', 'Next up')),
        el('div', null, p.slice(0, 4).join(' → ') + (p.length > 4 ? L(` →（还有 ${p.length - 4} 步）`, ` → (${p.length - 4} more)`) : '')));
      wrap.appendChild(b);
    }
    if (snap.act && snap.sid === o.sid && Date.now() - snap.actAt < ACT_MS) {
      const b = el('div', 'blk');
      const n = el('div', 'now');
      const pl = el('span', 'pulse'); pl.style.background = o.color;
      n.append(pl, el('span', null, snap.act));
      b.append(el('div', 'lab', L('正在做', 'Doing now')), n);
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
      b.append(el('div', 'lab', L('时间线', 'Timeline')), tl);
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
    box.appendChild(el('div', 'empty', L('还没有 agent 在线。在 Claude Code、Codex 这类工具里让它用 vcorp-chrome 做件事，这里就会出现。', 'No agents online yet. Ask Claude Code, Codex or a similar tool to do something with vcorp-chrome and it will show up here.')));
    return rows;
  }
  for (const s of rows) {
    const b = el('button');
    const sw = el('span', 'dot'); sw.style.background = s.color;
    b.append(sw, el('span', 'who', s.label), el('span', 'page', s.title ? `· ${s.title}` : L('· 还没打开页面', '· no page open yet')));
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
    const btn = el('button', 'btn ghost', L('复制', 'Copy'));
    btn.onclick = async () => {
      try { await navigator.clipboard.writeText(cmd); btn.textContent = L('已复制', 'Copied'); } catch { btn.textContent = L('请手动复制', 'Copy manually'); }
      setTimeout(() => { btn.textContent = L('复制', 'Copy'); }, 1600);
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
  box.appendChild(light('ok', L(`浏览器扩展 v${MINE}`, `Browser extension v${MINE}`), L('已装好，正在运行', 'Installed and running')));

  let pill = ['bad', L('未连接', 'Not connected')];
  if (r.connected) {
    const level = compat({ ext: MINE, cli: r.bridge });
    const note = compatNote(level, { ext: MINE, cli: r.bridge }, LANG);
    const needCli = level === 'cli-old' || (level === 'protocol' && cmpVersion(MINE, r.bridge) > 0);
    box.appendChild(light(note ? 'warn' : 'ok', L(`本地端 v${r.bridge || '?'}`, `Local bridge v${r.bridge || '?'}`), note || L('已连接', 'Connected'), needCli ? 'npx -y vcorp-chrome@latest install' : null));
    pill = note ? ['warn', L('已连接（有更新）', 'Connected (update available)')] : ['ok', L('已连接', 'Connected')];
  } else {
    const never = !r.lastRx;
    box.appendChild(light('bad', L('本地端未连接', 'Local bridge not connected'),
      never ? L('还没装本地端，或者装了但还没有 agent 用过它（本地端由 agent 第一次调用时拉起）。在终端里跑这一行，它会自动配好你电脑上的 agent：',
          'The local bridge is not installed yet, or no agent has used it yet (an agent starts it on first use). Run this in a terminal; it sets up the agents on your computer:')
        : L(`上次收到心跳是 ${relTime(r.lastRx)}。先点下面的「重连」；不行再在终端跑：`, `Last heartbeat ${relTime(r.lastRx)}. Click "Reconnect" below first; if that fails, run in a terminal:`),
      never ? 'npx -y vcorp-chrome@latest install' : 'npx vcorp-chrome doctor'));
    if (r.offscreenError) box.appendChild(light('warn', L('后台文档建不起来', 'Could not create the offscreen document'), r.offscreenError));
  }
  $('reconnRow').hidden = !!r.connected;

  // 没连着桥时，名单里只剩云端任务——本机 agent 不是「没有」，是看不见，话要说准
  const localUnknown = L('本机 agent 要等本地端连上才看得到', 'Local agents become visible once the local bridge connects');
  box.appendChild(sessionCount
    ? light('ok', L(`${sessionCount} 个 agent 在线`, `${sessionCount} agent${sessionCount === 1 ? '' : 's'} online`),
      r.connected ? L('每个 agent 用自己的颜色，页面描边和标签组同色', 'Each agent has its own color, matching its page outline and tab group')
        : L(`这里只算云端任务；${localUnknown}`, `Cloud tasks only; ${localUnknown}`))
    : r.connected
      ? light('', L('暂无 agent 在线', 'No agents online'), L('在你的 agent 里说一句「用 vcorp-chrome 打开……」就会出现在这里', 'Tell your agent "use vcorp-chrome to open …" and it will appear here'))
      : light('', L('本机 agent 状态未知', 'Local agent status unknown'), localUnknown));

  localPill = pill;
  paintPill();
}

// 顶部状态：本地端和云端任一条连着就算连上。只用 Maker 云端任务的电脑
// 根本不需要装本地端，以前这里照样亮红灯「未连接」，用户以为扩展坏了。
// 本地端「有更新」的黄灯仍然保留，那是要用户动手的事。
let localPill = null;
let cloudOnline = false;
function paintPill() {
  if (!localPill) return;
  const pill = localPill[0] === 'bad' && cloudOnline ? ['ok', L('已连接', 'Connected')] : localPill;
  $('pilldot').className = `dot ${pill[0]}`;
  $('pilltxt').textContent = pill[1];
  // 断了或有更新时，跳转链接改成「去修复」，修法在下面的连接区
  $('connJump').textContent = pill[0] === 'ok' ? L('连接详情', 'Connection details') : L('去修复', 'Fix it');
  $('connJump').className = `jump${pill[0] === 'bad' ? ' bad' : ''}`;
}

async function refreshAll() {
  const rows = await renderSessions();
  await renderConn(rows.length);
}

$('reconn').onclick = async () => {
  $('reconn').disabled = true;
  $('reconn').textContent = L('连接中…', 'Connecting…');
  await send({ __hcPopup: 'connect' });
  $('reconn').disabled = false;
  $('reconn').textContent = L('重连', 'Reconnect');
  refreshAll();
};

// ---------- 设置 ----------

$('guide').onclick = (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
};

chrome.storage.local.get(['l2Disabled', 'askIconDisabled', LANG_KEY], ({ l2Disabled, askIconDisabled, [LANG_KEY]: lang }) => {
  $('lang').value = lang === 'zh' || lang === 'en' ? lang : 'auto';
  $('l2').checked = !l2Disabled;
  $('askIcon').checked = !askIconDisabled;
});

// 改了就落盘；i18n.js 听到 storage 变化会把打开着的扩展页面都刷新一遍
$('lang').onchange = (e) => chrome.storage.local.set({ [LANG_KEY]: e.target.value });

$('askIcon').onchange = async (e) => {
  await chrome.storage.local.set({ askIconDisabled: !e.target.checked });
};

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
  if (!r?.ok) $('cloudErr').textContent = r?.error || L('扩展没有响应，稍后再试', 'The extension did not respond; try again later');
  if (r?.state) renderCloud(r.state);
  return r;
};

const CLOUD_STATE = {
  online: ['ok', L('已连接', 'Connected')],
  connecting: ['warn', L('连接中', 'Connecting')],
  paused: ['warn', L('已暂停', 'Paused')],
  error: ['bad', L('连接失败', 'Connection failed')],
  off: ['', L('未连接', 'Not connected')],
};
const LOG_TEXT = LANG === 'zh' ? {
  paired: '配对', unpaired: '解除配对', renamed: '改名为', approved: '批准任务', denied: '拒绝任务', ended: '任务结束',
  sites_on: '允许了新网站', sites_off: '拒绝了新网站', sites_timeout: '新网站没回应',
  folders_on: '允许了本地文件夹', folders_auto: '自动放行本地文件夹', folders_off: '拒绝了本地文件夹', folders_timeout: '本地文件夹没回应',
  apps_on: '允许了桌面应用', apps_off: '拒绝了桌面应用', apps_timeout: '桌面应用没回应', grant_on: '允许组织成员控制', grant_off: '不再允许组织成员控制', grant_auto_on: '组织成员的任务改为自动批准', grant_auto_off: '组织成员的任务改为逐个批准', grant_desk_on: '允许组织成员操作这台电脑', grant_desk_off: '不再允许组织成员操作这台电脑',
  desk_confirm: '同意了桌面动作', desk_declined: '没同意桌面动作', desktop_on: '启用桌面能力', desktop_off: '停用桌面能力',
  desktop_reload: '为启用桌面能力重载扩展', desktop_fail: '桌面能力没启用成功：',
  site_on: '网站加入允许名单', site_off: '从允许名单移除网站', auto_on: '打开自动允许', auto_off: '关闭自动允许',
  notes_saved: '记下网站经验', notes_deleted: '删除网站经验',
  eval_on: '允许云端执行脚本', eval_off: '禁止云端执行脚本', confirm_on: '打开对外动作免确认', confirm_off: '关闭对外动作免确认', ask_auto: '免确认放行', confirm_task: '本任务内都同意',
  paused: '暂停', resumed: '恢复', asked: '交给 maker：',
} : {
  paired: 'Paired', unpaired: 'Unpaired', renamed: 'Renamed to', approved: 'Approved task', denied: 'Denied task', ended: 'Task ended',
  sites_on: 'Allowed new sites', sites_off: 'Denied new sites', sites_timeout: 'No answer on new sites',
  folders_on: 'Allowed local folders', folders_auto: 'Auto-allowed local folders', folders_off: 'Denied local folders', folders_timeout: 'No answer on local folders',
  apps_on: 'Allowed desktop apps', apps_off: 'Denied desktop apps', apps_timeout: 'No answer on desktop apps', grant_on: 'Allowed org members to control', grant_off: 'Stopped org members controlling', grant_auto_on: 'Org members’ tasks now auto-approved', grant_auto_off: 'Org members’ tasks now asked one by one', grant_desk_on: 'Allowed org members to operate this computer', grant_desk_off: 'Stopped org members operating this computer',
  desk_confirm: 'Approved desktop action', desk_declined: 'Declined desktop action', desktop_on: 'Enabled desktop control', desktop_off: 'Disabled desktop control',
  desktop_reload: 'Reloaded extension to enable desktop control', desktop_fail: 'Desktop control failed to enable:',
  site_on: 'Site added to allow list', site_off: 'Site removed from allow list', auto_on: 'Turned on auto-approve', auto_off: 'Turned off auto-approve',
  notes_saved: 'Saved site notes', notes_deleted: 'Deleted site notes',
  eval_on: 'Allowed cloud scripts', eval_off: 'Blocked cloud scripts', confirm_on: 'Turned on skip-confirmation', confirm_off: 'Turned off skip-confirmation', ask_auto: 'Let through without asking', confirm_task: 'Approved for the rest of this task',
  paused: 'Paused', resumed: 'Resumed', asked: 'Handed to maker:',
};

const PERM_WORD = {
  granted: L('可读', 'Readable'), prompt: L('需要恢复访问', 'Access needs restoring'),
  denied: L('已拒绝', 'Denied'), unknown: L('打不开', 'Unavailable'),
};

function renderFolders(s) {
  const box = $('folderList');
  if (!box) return;
  box.textContent = '';
  const rows = s.folders || [];
  if (!rows.length) {
    box.appendChild(el('div', 'empty', L('还没有。添加后，任务要读的时候会再问你一次。', 'None yet. Once added, you will be asked again when a task wants to read it.')));
    return;
  }
  for (const f of rows) {
    const row = el('div', 'sw-row');
    const text = el('span', 'txt');
    const word = f.permission === 'granted' && f.write ? L('可读写', 'Read & write') : PERM_WORD[f.permission] || PERM_WORD.unknown;
    text.append(el('div', null, f.name), el('div', 'sub', word));
    row.appendChild(text);
    if (f.permission !== 'granted') {
      const restore = el('button', 'btn', L('恢复访问', 'Restore access'));
      restore.onclick = () => cloudCall('openMount', { folderId: f.id });
      row.appendChild(restore);
    } else {
      // requestPermission 要用户手势，侧栏是扩展页面，这一下点击就够
      const flip = el('button', 'btn ghost', f.write ? L('改为只读', 'Make read-only') : L('允许写入', 'Allow writing'));
      flip.title = f.write ? L('任务不能再往里存文件', 'Tasks will no longer save files here')
        : L('让任务可以把做好的文件（下载的视频、报告）存进来', 'Let tasks save finished files (downloaded videos, reports) here');
      flip.onclick = async () => {
        flip.disabled = true;
        try {
          const state = await setWrite(f.id, !f.write);
          if (state !== 'granted') alert(L('没有允许写入，这个文件夹仍是只读。', 'Writing was not allowed; this folder stays read-only.'));
        } catch (e) { alert(e.message || String(e)); }
        await cloudCall('foldersChanged');
        flip.disabled = false;
      };
      row.appendChild(flip);
    }
    const del = el('button', 'btn ghost', L('移除', 'Remove'));
    del.onclick = () => {
      if (confirm(L(`移除「${f.name}」？已经批准的任务也不能再读它。文件夹本身不会被删除。`,
        `Remove "${f.name}"? Already-approved tasks can no longer read it either. The folder itself is not deleted.`))) cloudCall('removeFolder', { id: f.id });
    };
    row.appendChild(del);
    box.appendChild(row);
  }
}

function renderDesktop(s) {
  const d = s.desktop || {};
  $('deskOn').hidden = !!d.device;
  $('deskOff').hidden = !d.device;
  // 没启用、或启用了但 agent-desktop 用不了，都给出安装指南
  $('deskGuide').hidden = !!d.device && d.ready !== false;
  $('deskState').textContent = d.device
    ? L(`已启用 · ${d.device.id}${d.ready === false ? ' · agent-desktop 用不了，点「安装步骤」看常见问题' : ''}`,
      `Enabled · ${d.device.id}${d.ready === false ? ' · agent-desktop is unavailable; click "Setup steps" for the FAQ' : ''}`)
    : d.error || L('未启用。第一次用要先装桌面组件，点「安装步骤」。', 'Not enabled. The first time, install the desktop component: click "Setup steps".');
}

// 一条待批准的申请，放进顶上的「需要你处理」
function askBox(title, lines, yesText, noText, op, jobId) {
  const box = el('div', 'task pending');
  box.appendChild(el('div', 't', title));
  for (const line of lines) box.appendChild(el('div', 'sub', line));
  const row = el('div', 'row');
  const yes = el('button', 'btn', yesText);
  const no = el('button', 'btn ghost', noText);
  yes.onclick = () => cloudCall(op, { jobId, allow: true });
  no.onclick = () => cloudCall(op, { jobId, allow: false });
  row.append(yes, no);
  box.appendChild(row);
  $('asks').appendChild(box);
}

// 有事要处理：顶上区块和标题栏的闪烁徽标一起亮，处理完一起收
function syncAlert() {
  const n = $('asks').childElementCount + ($('cloudClaim').hidden ? 0 : 1);
  $('alert').hidden = !n;
  $('needPill').hidden = !n;
  $('needPill').textContent = L(`${n} 项待处理`, `${n} pending`);
  document.title = n ? `(${n}) vcorp-chrome` : 'vcorp-chrome';
}
$('needPill').onclick = () => $('alert').scrollIntoView({ behavior: 'smooth', block: 'start' });

function renderNotes(rows) {
  const box = $('cloudNotes');
  if (!box) return;
  box.textContent = '';
  if (!rows.length) { box.appendChild(el('div', 'empty', L('还没有。', 'None yet.'))); return; }
  for (const n of rows) {
    const d = el('details', 'note');
    const sum = el('summary', null, `${n.site} · ${L(`${n.text.length} 字`, `${n.text.length} chars`)} · ${new Date(n.at).toLocaleDateString()}`);
    const body = el('pre', 'log', n.text);
    body.style.whiteSpace = 'pre-wrap';
    const del = el('button', 'btn ghost', L('删除', 'Delete'));
    del.onclick = () => { if (confirm(L(`删除 ${n.site} 的经验笔记？`, `Delete the notes for ${n.site}?`))) cloudCall('deleteNotes', { site: n.site }); };
    d.append(sum, body, del);
    box.appendChild(d);
  }
}

// 服务共享：这个账号在网页上共享出去的服务，和「允许替组织成员生成」开关。
// 列表由服务器推（opus-video-maker 新版才推）；没推过就是 null，只留开关。
const CAP_NAMES = { 'image.generate': L('生图', 'images'), 'video.generate': L('生视频', 'videos') };
const SEP = L('、', ', ');
function renderShares(s) {
  const list = s.shares;
  const running = (s.tasks || []).filter((t) => t.share && (t.state === 'pending' || t.state === 'approved'));
  // 连着服务器就一直显示：按「开关关着」来藏，关掉开关的那一刻整段就没了，再也打不开
  $('shareSec').hidden = !s.cfg;
  $('cloudShare').checked = !!s.cfg?.shareOk;
  const box = $('shareList');
  box.textContent = '';
  if (Array.isArray(list)) {
    if (!list.length) box.appendChild(el('div', 'empty', L('这个账号没有共享任何服务。', 'This account shares no services.')));
    for (const a of list) {
      const row = el('div', 'task');
      const head = el('div', 't', `${a.title} · ${a.caps.map((c) => CAP_NAMES[c] || c).join(SEP)}`);
      if (!a.enabled) head.appendChild(el('span', 'muted', L('（已暂停）', ' (paused)')));
      row.appendChild(head);
      const used = a.dailyMax == null ? L(`今天 ${a.usedToday} 次`, `${a.usedToday} today`) : L(`今天 ${a.usedToday} / ${a.dailyMax} 次`, `${a.usedToday} / ${a.dailyMax} today`);
      const hours = a.hours ? `${a.hours[0]}:00–${a.hours[1]}:00` : L('全天', 'all day');
      const orgs = a.orgs.join(SEP) || L('（没有组织）', '(no organizations)');
      row.appendChild(el('div', 'sub', `${L(`共享给 ${orgs}`, `Shared with ${orgs}`)} · ${used} · ${hours}`));
      if (!a.here) row.appendChild(el('div', 'sub', L('指定了另一个浏览器，不在这里做', 'Assigned to another browser, not run here')));
      box.appendChild(row);
    }
  }
  for (const t of running) box.appendChild(el('div', 'sub', t.state === 'pending'
    ? L(`等你批准替 ${t.share.for} 生成`, `Waiting for your OK to generate for ${t.share.for}`)
    : L(`正在替 ${t.share.for} 生成`, `Generating for ${t.share.for}`)));
  const manage = $('shareManage');
  manage.hidden = !s.cfg;
  if (s.cfg) manage.href = `${s.cfg.origin}/orgs`;
}

// 借给组织成员：两个开关，和正在借用这个浏览器的任务（停下按钮在下面的任务卡片上）。
function renderGrants(s) {
  $('grantSec').hidden = !s.cfg;
  $('cloudGrant').checked = !!s.cfg?.grantOk;
  $('cloudGrantAuto').checked = !!s.cfg?.grantAuto;
  $('cloudGrantAuto').disabled = !s.cfg?.grantOk;
  $('cloudGrantDesk').checked = !!s.cfg?.grantDesk;
  $('cloudGrantDesk').disabled = !s.cfg?.grantOk;
  const box = $('grantRunning');
  box.textContent = '';
  for (const t of (s.tasks || []).filter((x) => x.grant && (x.state === 'pending' || x.state === 'approved'))) {
    box.appendChild(el('div', 'sub', t.state === 'pending'
      ? L(`等你批准 ${t.grant.for} 的任务`, `Waiting for your OK on ${t.grant.for}'s task`)
      : L(`${t.grant.for} 正在用这个浏览器`, `${t.grant.for} is using this browser`)));
  }
  const manage = $('grantManage');
  manage.hidden = !s.cfg;
  if (s.cfg) manage.href = `${s.cfg.origin}/orgs`;
}

// 通知：服务器推来的和本机的权限请求在同一栏。文字是服务器给的，一律 textContent。
const NOTICE_DOT = { done: 'ok', failed: 'bad', needs: 'warn', progress: '' };
function renderNotices(s) {
  const rows = s.notices || [];
  const unread = rows.filter((n) => !n.read).length;
  $('noticeSec').hidden = !s.cfg;
  $('noticeCount').textContent = unread ? L(`${unread} 条未读`, `${unread} unread`) : '';
  $('noticeBtns').hidden = !rows.length;
  $('noticeRead').disabled = !unread;
  $('noticePopup').checked = s.cfg?.notify !== false;
  $('noticeProgress').checked = s.cfg?.notifyProgress !== false;
  $('noticeProgress').disabled = s.cfg?.notify === false;
  const box = $('noticeList');
  const top = box.scrollTop;
  box.textContent = '';
  if (!rows.length) box.appendChild(el('div', 'empty', L('还没有。任务做完了、编排有进度、有事等你，都会出现在这里。', 'Nothing yet. Finished tasks, progress and things that need you will show up here.')));
  for (const n of rows) {
    const row = el('button', n.read ? null : 'unread');
    row.type = 'button';
    row.title = n.url ? L('打开这个任务', 'Open this task') : n.local ? L('权限请求：在上面的「需要你处理」里点', 'Permission request: respond under "Needs your attention" above') : '';
    const body = el('span', 'body');
    body.appendChild(el('div', 'head', n.head));
    if (n.text) body.appendChild(el('div', 'sub', n.text));
    row.append(el('span', `dot ${NOTICE_DOT[n.kind] ?? ''}`), body, el('span', 'ago', relTime(n.at)));
    row.onclick = () => {
      if (n.local && !$('alert').hidden) $('alert').scrollIntoView({ behavior: 'smooth', block: 'start' });
      cloudCall('noticeOpen', { id: n.id });
    };
    box.appendChild(row);
  }
  box.scrollTop = top;
}

function renderCloud(s) {
  renderFolders(s);
  renderNotices(s);
  renderDesktop(s);
  $('asks').textContent = '';
  const on = !!s.cfg;
  $('cloudPair').hidden = on || !!s.claim;
  $('cloudClaim').hidden = on || !s.claim;
  $('cloudOn').hidden = !on;
  if (!$('pairOrigin').value) $('pairOrigin').value = s.defaultOrigin;
  if (s.claim) {
    $('claimOrigin').textContent = new URL(s.claim.origin).host;
    $('claimAccount').textContent = L(`「${s.claim.account || '（未命名）'}」`, `"${s.claim.account || '(unnamed)'}"`);
    if (!$('claimName').value) $('claimName').value = s.claim.name;
  }
  cloudOnline = on && s.status?.state === 'online';
  paintPill();
  if (!on) { syncAlert(); return; }
  if (document.activeElement !== $('deviceName')) $('deviceName').value = s.cfg.name;
  // 改名时没连上：连上那一刻 hello 已把名字写进服务器，提示跟着变
  if (namePending === s.cfg.name && s.status?.state === 'online') nameSaved(s);

  const [cls, word] = CLOUD_STATE[s.status?.state] || CLOUD_STATE.off;
  $('cloudDot').className = `dot ${cls}`;
  $('cloudName').textContent = `${new URL(s.cfg.origin).host} · ${word}`;
  $('cloudSub').textContent = s.status?.state === 'error' || s.status?.state === 'paused'
    ? s.status.message : L(`账号「${s.cfg.account || ''}」`, `Account "${s.cfg.account || ''}"`);
  $('cloudAuto').checked = !!s.cfg.auto;
  $('cloudAutoConfirm').checked = !!s.cfg.autoConfirm;
  renderShares(s);
  renderGrants(s);
  $('cloudEval').checked = s.cfg.allowEval !== false;
  $('cloudPause').checked = !!s.cfg.paused;

  renderNotes(s.notes || []);

  lastSites = s.cfg.sites;
  renderSites();

  // 要用户点头的一律进顶上的「需要你处理」，这里只留进行中任务的状态
  const tasks = $('cloudTasks');
  tasks.textContent = '';
  for (const t of s.tasks.filter((x) => x.state !== 'denied')) {
    const own = t.title || L(`任务 ${t.jobId}`, `Task ${t.jobId}`);
    const title = t.grant ? L(`${t.grant.for} 的任务：${own}`, `${t.grant.for}'s task: ${own}`) : own;
    const why = (w) => (w ? L(`。用途：${w}`, `. Purpose: ${w}`) : '');
    const no = L('不允许', 'Deny');
    if (t.state === 'pending') {
      const lines = [];
      if (t.ask?.length && t.grant) lines.push(L(`组织成员借用这个浏览器，请求访问这些网站：${t.ask.join(SEP)}（只对这个任务有效，不进允许名单）`, `An org member borrows this browser and requests these sites: ${t.ask.join(SEP)} (for this task only, not added to the allow list)`));
      else if (t.ask?.length) lines.push(L(`请求访问这些网站：${t.ask.join(SEP)}（允许后加入允许名单）`, `Requests these sites: ${t.ask.join(SEP)} (added to the allow list if you allow)`));
      if (t.use?.length) lines.push(L(`要用允许名单里的：${t.use.join(SEP)}`, `Will use from the allow list: ${t.use.join(SEP)}`));
      if (t.purpose) lines.push(L(`用途：${t.purpose}`, `Purpose: ${t.purpose}`));
      askBox(L(`新任务：${title}`, `New task: ${title}`), lines, L('允许', 'Allow'), L('拒绝', 'Deny'), 'decide', t.jobId);
      continue;
    }
    if (t.ask?.length) askBox(title, [L(`还想访问网站：${t.ask.join(SEP)}`, `Also wants these sites: ${t.ask.join(SEP)}`) + why(t.askWhy)], L('允许这些网站', 'Allow these sites'), no, 'decideSites', t.jobId);
    if (t.folderAsk?.length) askBox(title, [L(`还想读取本地文件夹：${t.folderAsk.join(SEP)}`, `Also wants to read local folders: ${t.folderAsk.join(SEP)}`) + why(t.folderAskWhy)], L('允许这些文件夹', 'Allow these folders'), no, 'decideFolders', t.jobId);
    if (t.appAsk?.length) askBox(title, [L(`还想操作桌面应用：${t.appAsk.join(SEP)}`, `Also wants to operate desktop apps: ${t.appAsk.join(SEP)}`) + why(t.appAskWhy)], L('允许这些应用', 'Allow these apps'), no, 'decideApps', t.jobId);
    if (t.deskAsk) askBox(title, [L(`要在桌面上：${t.deskAsk}`, `On the desktop, wants to: ${t.deskAsk}`)], L('同意', 'Approve'), L('不同意', 'Decline'), 'decideDesk', t.jobId);

    const box = el('div', 'task');
    box.appendChild(el('div', 't', title));
    const where = [...new Set([...(t.use || []), ...(t.sites || [])])].join(SEP) || L('（还没有网站）', '(no sites yet)');
    box.appendChild(el('div', 'sub', L(`进行中 · ${where} · ${t.count} 条命令 · ${relTime(t.lastAt)}`, `Running · ${where} · ${t.count} commands · ${relTime(t.lastAt)}`)));
    if (t.folders?.length) box.appendChild(el('div', 'sub', L(`可读本地文件夹：${t.folders.join(SEP)}`, `Can read local folders: ${t.folders.join(SEP)}`)));
    if (t.apps?.length) box.appendChild(el('div', 'sub', L(`可操作桌面应用：${t.apps.join(SEP)}`, `Can operate desktop apps: ${t.apps.join(SEP)}`)));
    const row = el('div', 'row');
    const stop = el('button', 'btn ghost', t.grant ? L('停下（关掉它的标签页，不再接它的命令）', 'Stop (close its tabs, take no more commands)') : L('收回（关掉它的标签页）', 'Revoke (close its tabs)'));
    stop.onclick = () => cloudCall('endTask', { jobId: t.jobId });
    row.appendChild(stop);
    box.appendChild(row);
    tasks.appendChild(box);
  }
  syncAlert();

  const log = $('cloudLog');
  log.textContent = '';
  if (!s.log.length) log.appendChild(el('div', null, L('还没有记录', 'No activity yet')));
  for (const r of s.log) {
    const row = el('div');
    const text = r.ev === 'approved' && r.msg === '自动放行'
      ? L('自动放行了任务', 'Auto-approved the task')
      : r.ev ? `${LOG_TEXT[r.ev] || r.ev}${r.msg ? ` ${r.msg}` : ''}` : `${r.cmd}${r.ok ? '' : ` ✗ ${r.code}${r.msg ? `${L('：', ': ')}${r.msg}` : ''}`}`;
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
  await cloudCall('confirm', { name: $('claimName').value });
  $('claimYes').disabled = false;
  $('pairCode').value = '';
  $('claimName').value = '';
};
$('claimNo').onclick = () => { $('claimName').value = ''; cloudCall('cancelClaim'); };
// 改名的结果就写在输入框下面，不弹窗；服务器确认写入才说「已保存」
// 允许名单：用户点过「允许」的网站，含子域。没有预设的平台。
// 用久了会有成百上千个：新加的排前面，默认只露几个，多了给搜索框。
const SITES_FEW = 8, SITES_SEARCH = 10, SITES_PAGE = 50;
let lastSites = [], sitesShown = SITES_FEW;
function renderSites() {
  const box = $('cloudSites'), q = $('cloudSitesQ');
  const all = [...lastSites].reverse();
  $('cloudSitesN').textContent = all.length ? L(`共 ${all.length} 个`, `${all.length} total`) : '';
  q.hidden = all.length <= SITES_SEARCH;
  const term = q.hidden ? '' : q.value.trim().toLowerCase();
  const list = term ? all.filter((h) => h.includes(term)) : all;
  box.textContent = '';
  if (!all.length) return box.appendChild(el('div', 'empty', L('还没有。任务申请网站、你点了允许，就会出现在这里。', 'None yet. Sites appear here once a task requests them and you allow it.')));
  if (!list.length) return box.appendChild(el('div', 'empty', L('没有匹配的网站', 'No matching sites')));
  for (const host of list.slice(0, sitesShown)) {
    const row = el('div', 'site');
    row.appendChild(el('span', 'host', host));
    const del = el('button', 'btn ghost', L('移除', 'Remove'));
    del.onclick = () => cloudCall('removeSite', { host });
    row.appendChild(del);
    box.appendChild(row);
  }
  const rest = list.length - sitesShown;
  if (rest > 0) {
    const more = el('button', 'btn ghost more', L(`再显示 ${Math.min(rest, SITES_PAGE)} 个（还有 ${rest} 个）`, `Show ${Math.min(rest, SITES_PAGE)} more (${rest} left)`));
    more.onclick = () => { sitesShown += SITES_PAGE; renderSites(); };
    box.appendChild(more);
  } else if (sitesShown > SITES_FEW && list.length > SITES_FEW) {
    const less = el('button', 'btn ghost more', L('收起', 'Show fewer'));
    less.onclick = () => { sitesShown = SITES_FEW; renderSites(); };
    box.appendChild(less);
  }
}
$('cloudSitesQ').addEventListener('input', () => { sitesShown = SITES_FEW; renderSites(); });

let namePending = null;
let nameMsgTimer = null;
function nameMsg(cls, text) {
  clearTimeout(nameMsgTimer);
  const box = $('deviceNameMsg');
  box.className = `msg ${cls}`;
  box.textContent = text;
  box.hidden = !text;
}
function nameSaved(s) {
  namePending = null;
  const host = new URL(s.cfg.origin).host;
  nameMsg('ok', L(`已保存，${host} 的「执行设备」里现在显示「${s.cfg.name}」`, `Saved. "Devices" on ${host} now shows "${s.cfg.name}"`));
  nameMsgTimer = setTimeout(() => nameMsg('', ''), 8000);
}
$('deviceNameSave').onclick = async () => {
  const name = $('deviceName').value;
  $('deviceNameSave').disabled = true;
  $('deviceName').blur();
  namePending = null;
  nameMsg('muted', L('保存中…', 'Saving…'));
  const r = await cloudCall('rename', { name });
  $('deviceNameSave').disabled = false;
  if (!r?.ok) { nameMsg('bad', L(`没有保存：${r?.error || '扩展没有响应，稍后再试'}`, `Not saved: ${r?.error || 'the extension did not respond; try again later'}`)); return; }
  const host = new URL(r.state.cfg.origin).host;
  if (r.state.rename === 'saved') nameSaved(r.state);
  else if (r.state.rename === 'unconfirmed') nameMsg('warn', L(`已发给 ${host}，但没等到确认。请到它的「执行设备」里看一下名字对不对`, `Sent to ${host} but no confirmation came back. Check the name under "Devices" there`));
  else {
    namePending = r.state.cfg.name;
    nameMsg('warn', r.state.status?.state === 'paused'
      ? L(`已存到本机。云端已暂停，恢复后会更新到 ${host}`, `Saved locally. The cloud link is paused; ${host} updates when you resume`)
      : L(`已存到本机，还没连上 ${host}，连上后会自动更新`, `Saved locally. Not connected to ${host} yet; it updates automatically once connected`));
  }
};
$('deviceName').onkeydown = (e) => { if (e.key === 'Enter') $('deviceNameSave').click(); };
$('cloudAuto').onchange = (e) => cloudCall('setAuto', { auto: e.target.checked });
$('cloudEval').onchange = (e) => cloudCall('setAllowEval', { allowEval: e.target.checked });
$('cloudAutoConfirm').onchange = (e) => cloudCall('setAutoConfirm', { autoConfirm: e.target.checked });
$('cloudShare').onchange = (e) => cloudCall('setShareOk', { shareOk: e.target.checked });
$('cloudGrant').onchange = (e) => cloudCall('setGrantOk', { grantOk: e.target.checked });
$('cloudGrantAuto').onchange = (e) => cloudCall('setGrantAuto', { grantAuto: e.target.checked });
$('cloudGrantDesk').onchange = (e) => cloudCall('setGrantDesk', { grantDesk: e.target.checked });
$('cloudPause').onchange = (e) => cloudCall('setPaused', { paused: e.target.checked });
$('noticePopup').onchange = (e) => cloudCall('setNotify', { notify: e.target.checked });
$('noticeProgress').onchange = (e) => cloudCall('setNotifyProgress', { notifyProgress: e.target.checked });
$('noticeRead').onclick = () => cloudCall('noticesRead');
$('noticeClear').onclick = () => cloudCall('noticesClear');
$('cloudReconn').onclick = () => cloudCall('reconnect');
$('cloudUnpair').onclick = () => {
  if (confirm(L('断开后这个服务器再也不能在本浏览器里发布，它开的标签页会被关掉。要再用得重新配对。', 'After disconnecting, this server can no longer publish in this browser and the tabs it opened will close. You will need to pair again to use it.'))) cloudCall('unpair');
};
$('folderAdd').onclick = () => cloudCall('openMount');
// 原生消息权限只能在用户手势里申请，所以在侧栏这里要，而不是在后台
$('deskOn').onclick = async () => {
  const granted = await chrome.permissions.request({ permissions: ['nativeMessaging'] }).catch(() => false);
  if (!granted) { $('deskState').textContent = L('没有拿到权限，桌面能力保持关闭', 'Permission not granted; desktop control stays off'); return; }
  $('deskState').textContent = L('启用中…第一次启用要重载扩展，侧栏若关掉了，重新打开即可', 'Enabling… The first time reloads the extension; if the side panel closes, just reopen it');
  const r = await cloudCall('desktopEnable');
  // 失败原因写在桌面这一栏，不要留着「启用中…」，也不用在顶上再报一遍
  if (r && !r.ok && r.error) { $('deskState').textContent = r.error; $('cloudErr').hidden = true; }
};
$('deskGuide').onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('desktop-setup.html') });
$('deskOff').onclick = async () => {
  await cloudCall('desktopDisable');
  await chrome.permissions.remove({ permissions: ['nativeMessaging'] }).catch(() => {});
};

// ---------- 订阅 ----------

chrome.storage.onChanged.addListener((changes, area) => {
  const keys0 = Object.keys(changes);
  if (keys0.some((k) => ['cloud', 'cloudTasks', 'cloudNotices', 'cloudLog', 'cloudStatus', 'cloudClaim', 'folderTick', 'cloudDesktop', 'cloudDesktopError', 'cloudShares'].includes(k))) void cloudCall('state');
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
