// 「交给 maker」：常用网站上每一项旁边的 maker 图标。
//
// 只注册在 ask-policy.js 的 SITES 那些域名上，配置（选择器）向 background 要。
// 这个脚本跑在网页里，所以它**只能请求打开输入窗口**：指令在扩展自己的窗口里写，
// 发送也只认那个窗口。图标只认真实的鼠标点击——页面脚本合成的 click 的 isTrusted 是 false。
(async () => {
  if (window.top !== window || globalThis.__hcAskSite) return;
  globalThis.__hcAskSite = true;

  const MARK = 'data-hc-ask';
  const ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="18" height="18" aria-hidden="true">
    <rect width="64" height="64" rx="14" fill="#ea580c"/>
    <path fill="#f6f4ef" stroke="#f6f4ef" stroke-width="3" stroke-linejoin="round" d="M19 15 L19 45 L26.5 38.2 L31.6 49.6 L37.2 47.1 L32.2 36 L42.4 35.4 Z"/>
    <path fill="#f6f4ef" d="M48 9 Q49 15.6 55.6 16.6 Q49 17.6 48 24.2 Q47 17.6 40.4 16.6 Q47 15.6 48 9 Z"/></svg>`;

  let site = null;
  let enabled = false;
  let observing = false;

  async function ensureSite() {
    if (site?.item && Array.isArray(site.anchor)) return site;
    try { site = (await chrome.runtime.sendMessage({ __hcAsk: 'site' }))?.site || null; } catch { site = null; }
    if (site?.item && Array.isArray(site.anchor) && !observing) {
      observing = true;
      // 无限滚动：帖子不断新增和回收，变了就再扫一遍（每帧最多一次）
      new MutationObserver(() => {
        if (!enabled || queued) return;
        queued = true;
        requestAnimationFrame(scan);
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
    return site;
  }

  function makeButton(item) {
    const host = document.createElement('div');
    host.setAttribute(MARK, '');
    host.style.cssText = 'display:flex;align-items:center;margin-right:8px;flex:none;';
    const root = host.attachShadow({ mode: 'closed' });
    root.innerHTML = `<style>
      button { all: unset; display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;
               border-radius: 5px; cursor: pointer; opacity: .78; transition: opacity .12s, transform .12s; }
      button:hover, button:focus-visible { opacity: 1; transform: scale(1.12); }
    </style><button type="button" title="交给 maker" aria-label="交给 maker">${ICON}</button>`;
    const btn = root.querySelector('button');
    // 不让这次点击落到帖子上（X 点帖子空白处会进详情页）
    for (const ev of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'dblclick']) btn.addEventListener(ev, (e) => e.stopPropagation());
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!e.isTrusted) return;
      let context = {};
      try { context = globalThis.__hcAskPick?.(site, item) || {}; } catch { context = {}; }
      chrome.runtime.sendMessage({ __hcAsk: 'open', context }).catch(() => {});
    });
    return host;
  }

  function decorate(item) {
    if (item.querySelector(`[${MARK}]`)) return;
    let anchor = null;
    for (const sel of site.anchor) {
      try { anchor = item.querySelector(sel); } catch { anchor = null; }
      if (anchor) break;
    }
    if (!anchor) return;
    for (let i = 0; i < (Number(site.up) || 0) && anchor.parentElement && anchor.parentElement !== item; i++) anchor = anchor.parentElement;
    anchor.parentElement?.insertBefore(makeButton(item), anchor);
  }

  let queued = false;
  function scan() {
    queued = false;
    if (!enabled || !site?.item || !Array.isArray(site.anchor)) return;
    let items = [];
    try { items = document.querySelectorAll(site.item); } catch { return; }
    for (const item of items) decorate(item);
  }

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local' || !('askIconDisabled' in changes)) return;
    enabled = !changes.askIconDisabled.newValue;
    if (!enabled) {
      document.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());
      return;
    }
    if (await ensureSite()) scan();
  });

  try { enabled = !(await chrome.storage.local.get('askIconDisabled')).askIconDisabled; } catch { return; }
  if (enabled && await ensureSite()) scan();
})();
