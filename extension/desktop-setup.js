// 桌面能力安装指南：一步一步带用户装 Node.js 和桌面组件，顶上实时显示装到哪一步。
//
// 启用桌面能力失败时 cloud.js 自动打开本页（?err= 带上刚才的错误），侧栏「安装步骤」也打开它。
// 本页是标签页，cloud.js 的 __hcCloud 只接受侧栏，所以这里不走它：
//   - 已启用没有：直接读 storage.local.cloudDesktop
//   - 组件装好没有：nativeMessaging 权限已授予时，本页自己 sendNativeMessage 一句 hello
// 启用这一步仍然回侧栏点（申请权限、必要时重载扩展都在那里）。

import { L, setupPage } from './i18n.js';

await setupPage();

const $ = (id) => document.getElementById(id);
const HOST = 'ai.vcorp.desktop';
const DESK = 'cloudDesktop';

// ---------- 系统 ----------

const isMac = /mac/i.test(navigator.userAgentData?.platform || navigator.platform || '');
function showOs(mac) {
  $('win').hidden = mac;
  $('mac').hidden = !mac;
  $('osWin').classList.toggle('on', !mac);
  $('osMac').classList.toggle('on', mac);
}
$('osWin').onclick = () => showOs(false);
$('osMac').onclick = () => showOs(true);
showOs(isMac);

// ---------- 复制、侧栏、常见问题跳转 ----------

for (const btn of document.querySelectorAll('[data-copy]')) {
  btn.onclick = async () => {
    try { await navigator.clipboard.writeText($(btn.dataset.copy).textContent); btn.textContent = L('已复制', 'Copied'); } catch { btn.textContent = L('请手动复制', 'Copy manually'); }
    setTimeout(() => { btn.textContent = L('复制', 'Copy'); }, 1600);
  };
}

// 侧栏只能在用户手势里打开：这一下点击就是
for (const btn of document.querySelectorAll('.open-panel')) {
  btn.onclick = async () => {
    const win = await chrome.windows.getCurrent();
    chrome.sidePanel.open({ windowId: win.id }).catch(() => {
      btn.textContent = L('点工具栏上的 vcorp-chrome 图标', 'Click the vcorp-chrome icon in the toolbar');
    });
  };
}

function flashFaq(id) {
  const row = $(id);
  if (!row) return;
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  row.classList.remove('flash'); void row.offsetWidth; row.classList.add('flash');
}
for (const a of document.querySelectorAll('.faq-link')) {
  a.onclick = (e) => { e.preventDefault(); flashFaq(a.getAttribute('href').slice(1)); };
}

// ---------- 刚才的错误 ----------

const lastErr = new URLSearchParams(location.search).get('err');
if (lastErr) {
  $('lastErrTxt').textContent = lastErr.slice(0, 400);
  $('lastErr').hidden = false;
}

// ---------- 实时状态 ----------

function setLive(kind, text, { panel = false } = {}) {
  const live = $('live');
  live.className = `live ${kind}`;
  $('liveTxt').textContent = text;
  $('liveBtn').hidden = !panel;
}

function markDone(...ids) {
  for (const id of ids) {
    const li = $(id);
    if (!li || li.classList.contains('done')) continue;
    li.classList.add('done');
    li.querySelector('.n').textContent = '✓';
  }
}

function hello() {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendNativeMessage(HOST, { op: 'hello' }, (r) => {
        const e = chrome.runtime.lastError;
        resolve(e ? { fail: e.message } : r || { fail: L('宿主没有回包', 'The host sent no reply') });
      });
    } catch (e) { resolve({ fail: e.message }); }
  });
}

let timer = 0;
async function check() {
  clearTimeout(timer);
  const d = (await chrome.storage.local.get(DESK))[DESK];
  const granted = await chrome.permissions.contains({ permissions: ['nativeMessaging'] }).catch(() => false);
  if (d?.device && granted && d.ready !== false) {
    markDone('w1', 'w2', 'w3', 'w4', 'w5');
    setLive('ok', L(`桌面能力已启用 · ${d.device.id}。这一页可以关了。`, `Desktop control is on · ${d.device.id}. You can close this page.`));
    return;   // 成功了就不再起宿主进程
  }

  // 标签页在后台时不去起宿主进程，切回来再测
  if (document.hidden) { timer = setTimeout(check, 3000); return; }
  // 本页拿到 nativeMessaging 绑定的前提：页面打开时权限已经授予
  if (chrome.runtime.sendNativeMessage) {
    const r = await hello();
    if (r.fail) {
      setLive('', L(`还没检测到桌面组件（${r.fail}）。照下面的步骤装好，这里会自己变。`,
        `Desktop component not detected yet (${r.fail}). Follow the steps below; this bar updates by itself.`));
    } else if (!r.ready) {
      markDone('w1', 'w2', 'w3');
      setLive('bad', L(`桌面组件装好了，但 agent-desktop 用不了：${r.error?.message || '原因不明'}。看下面常见问题里的「agent-desktop 用不了」。`,
        `The desktop component is installed, but agent-desktop is unavailable: ${r.error?.message || 'unknown reason'}. See "agent-desktop is unavailable" in the FAQ below.`));
    } else {
      markDone('w1', 'w2', 'w3', 'w4');
      setLive('half', d?.device
        ? L('桌面组件正常。回侧栏点「停用」，再点「启用桌面能力」刷新状态。', 'The desktop component works. In the side panel, click Disable, then Enable desktop control to refresh.')
        : L('桌面组件装好了。最后一步：回侧栏点「启用桌面能力」。', 'The desktop component is installed. Last step: click Enable desktop control in the side panel.'),
      { panel: true });
    }
  } else {
    setLive('', L('照下面的步骤装好桌面组件，然后回侧栏点「启用桌面能力」，这里会自动变绿。',
      'Install the desktop component with the steps below, then click Enable desktop control in the side panel; this bar turns green by itself.'),
    { panel: true });
  }
  timer = setTimeout(check, 3000);
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (DESK in changes || 'cloudDesktopError' in changes)) void check();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) void check(); });
void check();
