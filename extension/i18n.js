// 中英双语：跟着浏览器界面语言自动切换，侧栏「设置」里可以手动固定。
//
// 规则：浏览器语言是 zh-*（简体、繁体都算）就用中文，其余一律英文。
// 手动选择存在 storage.local.lang（'auto' | 'zh' | 'en'），改了之后打开着的扩展页面自己刷新。
//
// 用法：
//   脚本里  L('中文', 'English')——两种文字写在一处，改一边时另一边就在眼前，不会漏。
//   页面上  <span data-en="English">中文</span>，localizeDom() 换掉；
//           带标签的用 data-en-html，输入框提示用 data-en-placeholder，悬停提示用 data-en-title。
//           data-en-html 只放我们自己写死的文字，不放任何外来内容。
//
// 本文件不要求 chrome.*，service worker、扩展页面、测试里都能 import。

export const LANG_KEY = 'lang';

export const pickLang = (code) => (/^zh(\b|[-_])/i.test(String(code || '')) ? 'zh' : 'en');

function detect() {
  try { const ui = globalThis.chrome?.i18n?.getUILanguage?.(); if (ui) return pickLang(ui); } catch { /* 不在扩展里 */ }
  return pickLang(globalThis.navigator?.language);
}

export let LANG = detect();

export const L = (zh, en) => (LANG === 'zh' ? zh : en);

// 读手动设置。页面在第一次渲染前 await 它；service worker 在建菜单前 await 它。
export async function initLang() {
  let pref = 'auto';
  try { pref = (await chrome.storage.local.get(LANG_KEY))[LANG_KEY] || 'auto'; } catch { /* 没有 storage */ }
  LANG = pref === 'zh' || pref === 'en' ? pref : detect();
  if (globalThis.document?.documentElement) document.documentElement.lang = LANG === 'zh' ? 'zh-CN' : 'en';
  return LANG;
}

export function localizeDom(root = globalThis.document) {
  if (!root || LANG === 'zh') return;   // 页面源文件本来就是中文
  for (const e of root.querySelectorAll('[data-en]')) e.textContent = e.dataset.en;
  for (const e of root.querySelectorAll('[data-en-html]')) e.innerHTML = e.dataset.enHtml;
  for (const e of root.querySelectorAll('[data-en-placeholder]')) e.placeholder = e.dataset.enPlaceholder;
  for (const e of root.querySelectorAll('[data-en-title]')) e.title = e.dataset.enTitle;
}

// 扩展页面：语言设置一变就整页重载，免得一半中文一半英文
export function reloadOnLangChange() {
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && LANG_KEY in changes) location.reload();
    });
  } catch { /* 不在扩展里 */ }
}

// 页面入口一行搞定
export async function setupPage() {
  await initLang();
  localizeDom();
  reloadOnLangChange();
  return LANG;
}
