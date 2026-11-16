// 「交给 maker」：从页面上认出「这一项」——它的链接、作者、文字。
//
// 普通脚本（不是模块），跑在页面的隔离世界里：站点图标的内容脚本（ask-site.js）和快捷键
// （background 用 executeScript 注入）共用这一份。它读到的全是页面的东西，只当上下文用；
// 出了页面还要过 ask-policy.js 的 cleanContext，再过服务器那一遍。
(() => {
  if (globalThis.__hcAskPick) return;

  const abs = (h) => { try { return new URL(h, location.href).href; } catch { return ''; } };
  const textOf = (el, max) => String(el?.innerText || '').trim().slice(0, max);

  // 按站点配置取：item 是配置里说的「一项」
  function fromSite(site, item) {
    let url = '';
    let re = null;
    try { re = site.linkRe ? new RegExp(site.linkRe) : null; } catch { re = null; }
    for (const sel of site.link || []) {
      let links = [];
      try { links = [...item.querySelectorAll(sel)]; } catch { links = []; }
      for (const a of links) {
        const href = abs(a.getAttribute('href'));
        if (!href) continue;
        if (!re) { url = href; break; }
        const u = new URL(href);
        const m = u.pathname.match(re);
        if (m) { url = u.origin + m[0]; break; }
      }
      if (url) break;
    }
    const q = (sel) => { try { return sel ? item.querySelector(sel) : null; } catch { return null; } };
    return {
      url,
      title: textOf(q(site.title), 200),
      author: textOf(q(site.author), 200).split('\n').slice(0, 2).join(' '),
      excerpt: textOf(q(site.text), 1500),
    };
  }

  // 不认识的网站：鼠标指着链接就是那个链接；否则往上找一张「有很多同样的兄弟、里面带链接」的卡片
  function generic(el) {
    const media = el.closest('img, video');
    const out = { media: media ? abs(media.currentSrc || media.src || '') : '' };
    const a = el.closest('a[href]');
    if (a) return { ...out, url: abs(a.getAttribute('href')), title: textOf(a, 200) || a.getAttribute('title') || a.querySelector('img')?.alt || '' };
    for (let n = el, i = 0; n && n !== document.body && i < 10; n = n.parentElement, i++) {
      const p = n.parentElement;
      if (!p || [...p.children].filter((c) => c.tagName === n.tagName).length < 3) continue;
      const links = [...n.querySelectorAll('a[href]')].filter((l) => /^https?:/.test(abs(l.getAttribute('href'))));
      if (!links.length) continue;
      const main = links.reduce((best, l) => (textOf(l, 400).length > textOf(best, 400).length ? l : best), links[0]);
      return { ...out, url: abs(main.getAttribute('href')), title: textOf(main, 200), excerpt: textOf(n, 1500) };
    }
    return out;
  }

  // el 不给就用鼠标正指着的元素。什么都没指着（或认不出）时只有页面本身。
  globalThis.__hcAskPick = (site, el) => {
    const target = el || [...document.querySelectorAll(':hover')].pop() || null;
    const selected = String(globalThis.getSelection?.() || '').trim().slice(0, 1500);
    let picked = {};
    if (target) {
      let item = null;
      try { item = site ? target.closest(site.item) : null; } catch { item = null; }
      picked = item ? fromSite(site, item) : generic(target);
    }
    return { ...picked, page: location.href, excerpt: selected || picked.excerpt || '' };
  };
})();
