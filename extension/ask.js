// 「交给 maker」的装配 —— 右键菜单、快捷键、站点图标，都通向同一个输入窗口（ask.html）。
//
// 规矩在 ask-policy.js 顶上。落到这里是三件事：
//   1. 网页那一侧（右键点的东西、鼠标指着的东西、内容脚本）只能给「上下文」，并且只能让窗口打开。
//   2. 上下文存在 storage.session 里（内容脚本读不到），窗口凭 id 取；发送时也从这里取，不从消息里取。
//   3. 「发送」只认 ask.html 自己发来的消息。

import { menuContext, cleanContext, cleanText, fromComposer, fromPage, askablePage, describe, siteFor, siteMatches } from './ask-policy.js';
import { startTask, askTarget } from './cloud.js';
import { L, LANG_KEY, initLang } from './i18n.js';

const PENDING = 'askPending';   // storage.session：{ id: { context, at } }，等用户写那句话
const WIN = 'askWin';           // storage.session：输入窗口的 id（同时只开一个）
const PENDING_MS = 30 * 60 * 1000;
const MENU_ID = 'hc-ask';
const SITE_SCRIPT_ID = 'hc-ask-sites';
const COMPOSER = chrome.runtime.getURL('ask.html');
const sending = new Set();

async function openComposer(context, tab) {
  const id = crypto.randomUUID();
  const { [PENDING]: all = {}, [WIN]: winId = null } = await chrome.storage.session.get([PENDING, WIN]);
  for (const [k, v] of Object.entries(all)) if (Date.now() - v.at > PENDING_MS) delete all[k];
  all[id] = { context, at: Date.now() };
  await chrome.storage.session.set({ [PENDING]: all });
  const url = `${COMPOSER}?id=${id}`;
  if (winId != null) {
    const existing = await chrome.windows.get(winId, { populate: true }).catch(() => null);
    if (existing?.tabs?.[0]) {
      await chrome.tabs.update(existing.tabs[0].id, { url }).catch(() => {});
      await chrome.windows.update(winId, { focused: true }).catch(() => {});
      return;
    }
  }
  // 开在用户正看着的那个窗口中间
  const width = 460;
  const height = 400;
  const over = tab?.windowId != null ? await chrome.windows.get(tab.windowId).catch(() => null) : null;
  const place = over && over.width && over.height ? {
    left: Math.max(0, Math.round(over.left + (over.width - width) / 2)),
    top: Math.max(0, Math.round(over.top + (over.height - height) / 3)),
  } : {};
  const created = await chrome.windows.create({ url, type: 'popup', width, height, focused: true, ...place });
  await chrome.storage.session.set({ [WIN]: created?.id ?? null });
}

// 快捷键：鼠标正指着的那一项；什么都没指着就是当前页面
async function askAtCursor(tab) {
  if (!tab?.id || !askablePage(tab.url)) return;
  let picked = {};
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['ask-pick.js'] });
    const [{ result } = {}] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (site) => globalThis.__hcAskPick?.(site, null) || null,
      args: [siteFor(tab.url)],
    });
    picked = result || {};
  } catch { /* 注入不进去的页面：就按整页交办 */ }
  await openComposer(cleanContext({ ...picked, page: tab.url, title: picked.url ? picked.title : tab.title }), tab);
}

async function registerSites() {
  const script = { id: SITE_SCRIPT_ID, matches: siteMatches(), js: ['ask-pick.js', 'ask-site.js'], runAt: 'document_idle', allFrames: false };
  const [existing] = await chrome.scripting.getRegisteredContentScripts({ ids: [SITE_SCRIPT_ID] }).catch(() => []);
  if (!existing) await chrome.scripting.registerContentScripts([script]).catch(() => {});
  else if (JSON.stringify(existing.matches) !== JSON.stringify(script.matches)) await chrome.scripting.updateContentScripts([script]).catch(() => {});
}

async function onComposer(m) {
  const id = String(m.id || '');
  const { [PENDING]: all = {} } = await chrome.storage.session.get(PENDING);
  const p = all[id];
  if (!p || Date.now() - p.at > PENDING_MS) throw new Error('这个窗口过期了。关掉它，回到网页上重新点一次。');
  if (m.__hcAsk === 'ctx') return { item: describe(p.context), target: await askTarget() };
  const text = cleanText(m.text);
  if (!text) throw new Error('先写下要办的事');
  if (sending.has(id)) throw new Error('正在交给 maker，稍等');
  sending.add(id);
  try {
    const made = await startTask({ text, context: p.context });
    const { [PENDING]: now = {} } = await chrome.storage.session.get(PENDING);
    delete now[id];
    await chrome.storage.session.set({ [PENDING]: now });
    return made;
  } finally {
    sending.delete(id);
  }
}

export function initAsk() {
  // SW 每次醒来都重建一遍：菜单项是持久的，但升级、换版本后以这一份为准。
  // 菜单文字跟着界面语言；侧栏里改了语言就再建一遍。
  const buildMenu = () => initLang().then(() => chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID, title: L('交给 maker', 'Hand to maker'), contexts: ['page', 'link', 'image', 'video', 'selection'],
      documentUrlPatterns: ['http://*/*', 'https://*/*'],
    }, () => void chrome.runtime.lastError);
  }));
  void buildMenu();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && LANG_KEY in changes) void buildMenu();
  });
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === MENU_ID) void openComposer(menuContext(info, tab), tab).catch(() => {});
  });
  chrome.commands?.onCommand.addListener((command, tab) => {
    if (command !== 'ask-maker') return;
    void (async () => {
      const t = tab || (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
      await askAtCursor(t);
    })().catch(() => {});
  });

  chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
    const op = m?.__hcAsk;
    if (!op) return false;
    // 网页那一侧：要配置、请求打开窗口。别的一概不认。
    if (op === 'site' || op === 'open') {
      if (!fromPage(sender, chrome.runtime.id)) { sendResponse({ ok: false }); return false; }
      (async () => {
        if (op === 'site') return { ok: true, site: (await askTarget()) ? siteFor(sender.tab.url) : null };
        const c = m.context && typeof m.context === 'object' ? m.context : {};
        await openComposer(cleanContext({ ...c, page: sender.tab.url, title: c.url ? c.title : sender.tab.title }), sender.tab);
        return { ok: true };
      })().then(sendResponse, () => sendResponse({ ok: false }));
      return true;
    }
    // 输入窗口：取上下文、发送
    if (op === 'ctx' || op === 'send') {
      if (!fromComposer(sender, chrome.runtime.id, COMPOSER)) { sendResponse({ ok: false, error: '只接受输入窗口发来的操作' }); return false; }
      onComposer(m).then((data) => sendResponse({ ok: true, ...data }), (e) => sendResponse({ ok: false, error: e.message || String(e) }));
      return true;
    }
    sendResponse({ ok: false });
    return false;
  });

  void registerSites();
}
