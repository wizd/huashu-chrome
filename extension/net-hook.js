// 网络记录 hook —— 注入到页面的 MAIN world，document_start 执行。
//
// 必须赶在页面自己的 JS 之前跑，否则首屏那批 XHR 全漏掉，
// 而恰恰是首屏那批带着列表数据。
//
// 只往 window.__hcNet 里堆记录，不上报、不外发。读取由扩展按需拉。
(() => {
  if (window.__hcNet) return;
  window.__hcNet = [];

  const MAX_ENTRIES = 300;
  const MAX_BODY = 400000;

  // 页面冻结（freeze）期间，浏览器只放行 keepalive:true 的 fetch，其它调用会同步抛
  // 「Only fetch keepalive is allowed during onfreeze」，并把调用栈算在真正执行
  // fetch 的那一层。这里若是 async 包装再转调，控制台就指到本文件。
  // GitHub 的 RUM 会在冻结时用 fetch 把积压发出去，体积一大就不带 keepalive。
  // 那种请求浏览器反正会拒，这里直接拒绝、不再调用原生 fetch，控制台就不会记那一行。
  // keepalive 的则原样同步转交，不读响应体——冻结回调里多做一次 body 读取也会被拒。
  let pageFrozen = false;
  window.addEventListener('freeze', () => { pageFrozen = true; }, true);
  window.addEventListener('resume', () => { pageFrozen = false; }, true);

  const push = (r) => {
    window.__hcNet.push(r);
    if (window.__hcNet.length > MAX_ENTRIES) window.__hcNet.shift();
  };

  const keepaliveOf = (args) => {
    const init = args[1];
    if (init && typeof init === 'object' && init.keepalive === true) return true;
    const input = args[0];
    return typeof Request !== 'undefined' && input instanceof Request && input.keepalive === true;
  };

  const origFetch = window.fetch;
  if (origFetch) {
    window.fetch = function (...args) {
      if (pageFrozen && !keepaliveOf(args)) return Promise.reject(new TypeError('Failed to fetch'));
      let pending;
      try { pending = origFetch.apply(this, args); }
      catch (e) { return Promise.reject(e); }
      if (pageFrozen) return pending;
      // 不 await：页面拿到响应的时机必须和没挂钩之前一样。记录在旁边读 clone。
      Promise.resolve(pending).then((res) => {
        try {
          const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
          const ct = res.headers.get('content-type') || '';
          if (!/json|text|javascript/.test(ct)) {
            push({ t: Date.now(), method: args[1]?.method || 'GET', url, status: res.status, ct, body: '' });
            return;
          }
          // clone() 是必须的：响应体只能被读一次，直接读会把页面自己的那份吃掉
          res.clone().text().then((text) => {
            push({ t: Date.now(), method: args[1]?.method || 'GET', url, status: res.status, ct, body: text.slice(0, MAX_BODY) });
          }).catch(() => {});
        } catch { /* 记录失败绝不能影响页面本身 */ }
      }).catch(() => {});
      return pending;
    };
  }

  const oOpen = XMLHttpRequest.prototype.open;
  const oSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u, ...rest) {
    this.__hc = { method: m, url: String(u) };
    return oOpen.call(this, m, u, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...a) {
    this.addEventListener('load', () => {
      try {
        push({
          t: Date.now(),
          ...this.__hc,
          status: this.status,
          ct: this.getResponseHeader('content-type') || '',
          body: String(this.responseText || '').slice(0, MAX_BODY),
        });
      } catch {}
    });
    return oSend.apply(this, a);
  };
})();
