// 代码通道的 page 对象 —— 让模型用写程序的方式操作浏览器。
//
// 为什么要它：逐条工具调用时，每一步都是一次模型回合。发一条视频要几十个回合，
// 慢，而且中途任何一步看错就满盘皆输。改成模型写一段程序、程序自己跑完、
// 再把结果和证据一次交回来，回合数从几十降到一两个。
//
// 为什么长得像 Playwright：模型在训练里见过海量 Playwright 代码，
// locator / getByRole / waitForResponse 这些名字它不用读说明书就会用、而且一次写对。
// 只做常用子集，名字和语义尽量对齐；不一样的地方都在这里写明。
//
// 它跑在 MCP 进程（Node）里，每个方法 = 一条发给扩展的命令（本机 WebSocket，几十毫秒）。
// 页面跳转不会让程序丢状态——这是它和页面里 eval 的根本区别。
// 页面里的部分（找元素、填 ProseMirror、穿 shadow DOM）由下面的 inPage() 完成，
// 它被序列化后经扩展的 eval 注入（MAIN world；页面 CSP 拦下时扩展自动改走 CDP）。
//
// 和 Playwright 的差别：
//   - 选择器默认穿透开放的 shadow root、同源 iframe，以及站点自己挂出来的封闭 root（el._sr 之类）。
//   - 不做严格模式：匹配到多个时先挑可见的第一个，并在轨迹里写明「匹配 N 个」。
//   - 可见性不看几何尺寸：后台标签页里所有元素的 rect 都不可靠（小红书实测），只看样式。
//   - click 先走扩展的点击（有效果核对、无反应时自动升级成真实输入事件）；
//     元素在 shadow 里或扩展判定被遮挡时，退回页面内完整事件序列。
import fs from 'node:fs';
import { uploadFile } from './upload.js';

// ---------------- 页面里跑的部分 ----------------
//
// 必须自包含：它会被 toString() 后注入页面，不能引用外面任何东西。
/* eslint-disable no-undef */
function inPage(op, spec, arg) {
  const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

  // 所有可搜索的根：document、开放/被挂出来的 shadow root、同源 iframe 的 document
  const roots = () => {
    const out = [];
    const seen = new Set();
    const add = (r) => {
      if (!r || seen.has(r)) return;
      seen.add(r); out.push(r);
      for (const el of r.querySelectorAll('*')) {
        const sr = el.shadowRoot || el._sr || el.__shadowRoot || null;
        if (sr && sr.querySelectorAll) add(sr);
        if (el.tagName === 'IFRAME' || el.tagName === 'FRAME') {
          try { if (el.contentDocument) add(el.contentDocument); } catch { /* 跨源 */ }
        }
      }
    };
    add(document);
    return out;
  };

  const visible = (el) => {
    if (!el || !el.isConnected) return false;
    if (typeof el.checkVisibility === 'function') {
      try { return el.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true }); } catch { /* 旧浏览器 */ }
    }
    for (let n = el; n && n.nodeType === 1; n = n.parentElement || n.getRootNode()?.host) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    }
    return true;
  };

  const ROLES = {
    button: 'button,[role=button],input[type=button],input[type=submit],input[type=reset]',
    link: 'a[href],[role=link]',
    textbox: 'input:not([type]),input[type=text],input[type=search],input[type=email],input[type=tel],input[type=url],input[type=password],input[type=number],textarea,[contenteditable=""],[contenteditable=true],[role=textbox]',
    checkbox: 'input[type=checkbox],[role=checkbox],[role=switch]',
    radio: 'input[type=radio],[role=radio]',
    combobox: 'select,[role=combobox]',
    option: 'option,[role=option]',
    tab: '[role=tab]',
    menuitem: '[role=menuitem]',
    heading: 'h1,h2,h3,h4,h5,h6,[role=heading]',
    dialog: 'dialog,[role=dialog],[role=alertdialog]',
    img: 'img,[role=img]',
    listitem: 'li,[role=listitem]',
  };
  const nameOf = (el) => norm(el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.textContent
    || el.value || el.getAttribute('placeholder') || el.getAttribute('alt') || '');

  const textMatch = (have, want, exact) => {
    if (want instanceof RegExp) return want.test(have);
    if (want && typeof want === 'object' && want.re) return new RegExp(want.re, want.flags || '').test(have);
    return exact ? have === norm(want) : have.toLowerCase().includes(norm(want).toLowerCase());
  };

  const find = (s) => {
    let els = [];
    const rs = roots();
    if (s.css) {
      for (const r of rs) { try { els.push(...r.querySelectorAll(s.css)); } catch (e) { throw new Error(`选择器写错了：${s.css}（${e.message}）`); } }
    } else if (s.role) {
      const sel = ROLES[s.role] || `[role=${s.role}]`;
      for (const r of rs) els.push(...r.querySelectorAll(sel));
      if (s.name != null) els = els.filter((el) => textMatch(nameOf(el), s.name, s.exact));
    } else if (s.text != null) {
      // 取最内层：自己的文本匹配、且没有任何子元素也匹配的那个
      for (const r of rs) {
        for (const el of r.querySelectorAll('*')) {
          if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(el.tagName)) continue;
          const t = norm(el.textContent);
          if (!t || !textMatch(t, s.text, s.exact)) continue;
          if ([...el.children].some((c) => textMatch(norm(c.textContent), s.text, s.exact))) continue;
          els.push(el);
        }
      }
    } else if (s.placeholder != null) {
      for (const r of rs) els.push(...[...r.querySelectorAll('[placeholder]')].filter((el) => textMatch(norm(el.getAttribute('placeholder')), s.placeholder, s.exact)));
    } else if (s.label != null) {
      for (const r of rs) {
        for (const lab of r.querySelectorAll('label')) {
          if (!textMatch(norm(lab.textContent), s.label, s.exact)) continue;
          const t = lab.control || (lab.htmlFor && r.getElementById?.(lab.htmlFor)) || lab.querySelector('input,textarea,select');
          if (t) els.push(t);
        }
        els.push(...[...r.querySelectorAll('[aria-label]')].filter((el) => textMatch(norm(el.getAttribute('aria-label')), s.label, s.exact)));
      }
    }
    if (s.parent) {
      const ps = find(s.parent);
      els = els.filter((el) => ps.some((p) => p !== el && (p.contains(el) || p.shadowRoot?.contains(el) || p._sr?.contains(el))));
    }
    if (s.hasText != null) els = els.filter((el) => textMatch(norm(el.textContent), s.hasText, false));
    if (s.visible) els = els.filter(visible);
    els = [...new Set(els)];
    if (s.nth != null) {
      const i = s.nth < 0 ? els.length + s.nth : s.nth;
      els = els[i] ? [els[i]] : [];
    }
    return els;
  };

  // 动作要一个元素：多个时先挑可见的
  const one = (s) => {
    const all = find(s);
    if (!all.length) return { el: null, count: 0 };
    const vis = all.filter(visible);
    return { el: vis[0] || all[0], count: all.length, visibleCount: vis.length };
  };

  const describe = (el) => {
    if (!el) return '';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const t = norm(el.innerText || el.value || el.getAttribute('aria-label') || '').slice(0, 30);
    return `<${tag}${id}${cls}>${t ? ` "${t}"` : ''}`;
  };

  const notFound = (s) => {
    const e = new Error(`没找到元素 ${JSON.stringify(s)}`);
    e.code = 'NOT_FOUND';
    throw e;
  };

  const editable = (el) => el.isContentEditable || el.getAttribute?.('contenteditable') === 'true';

  // 输入框：走原生 setter，React/Vue 才认这次修改
  const setNative = (el, v) => {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype
      : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    setter ? setter.call(el, v) : (el.value = v);
    el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  // ProseMirror / tiptap / 任何 contenteditable：用 execCommand，编辑器把它当真实输入处理。
  // 段落之间 insertParagraph；空行也插一次。
  const insertLines = (el, text) => {
    const lines = String(text).split('\n');
    lines.forEach((line, i) => {
      if (i > 0) document.execCommand('insertParagraph');
      if (line) document.execCommand('insertText', false, line);
    });
  };
  const caretToEnd = (el) => {
    const sel = el.ownerDocument.getSelection();
    const range = el.ownerDocument.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
  };

  const fire = (el, type, extra = {}) => {
    const r = el.getBoundingClientRect();
    const init = { bubbles: true, cancelable: true, composed: true, view: window, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, button: 0, ...extra };
    const E = type.startsWith('pointer') ? PointerEvent : MouseEvent;
    el.dispatchEvent(new E(type, type.startsWith('pointer') ? { pointerId: 1, pointerType: 'mouse', isPrimary: true, ...init } : init));
  };

  const valueOf = (el) => (editable(el) ? el.innerText : 'value' in el ? el.value : el.textContent);

  switch (op) {
    case 'count': return find(spec).length;
    case 'exists': return find(spec).length > 0;
    case 'visible': { const { el } = one(spec); return !!el && visible(el); }
    case 'describe': { const all = find(spec); return all.slice(0, 20).map((el) => ({ desc: describe(el), visible: visible(el) })); }
    case 'text': { const { el } = one(spec); if (!el) notFound(spec); return norm(el.innerText || el.textContent); }
    case 'allTexts': return find(spec).map((el) => norm(el.innerText || el.textContent));
    case 'value': { const { el } = one(spec); if (!el) notFound(spec); return valueOf(el); }
    case 'attr': { const { el } = one(spec); if (!el) notFound(spec); return el.getAttribute(arg); }
    case 'html': { const { el } = one(spec); if (!el) notFound(spec); return el.outerHTML.slice(0, arg || 5000); }

    // 给元素打一个标记，好让扩展的 click / upload 用普通 selector 找到它。
    // 在 shadow root 里的元素 document.querySelector 找不到，此时 inDoc=false。
    case 'stamp': {
      const { el, count, visibleCount } = one(spec);
      if (!el) return { count: 0 };
      const id = 'vc' + Math.random().toString(36).slice(2, 9);
      el.setAttribute('data-vc', id);
      return { id, count, visibleCount, inDoc: el.getRootNode() === document, desc: describe(el), tag: el.tagName, type: el.type || '' };
    }

    case 'click': {
      const { el, count } = one(spec);
      if (!el) notFound(spec);
      el.scrollIntoView?.({ block: 'center' });
      for (const t of ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'pointermove', 'mousemove', 'pointerdown', 'mousedown']) fire(el, t);
      el.focus?.({ preventScroll: true });
      for (const t of ['pointerup', 'mouseup']) fire(el, t);
      el.click();
      return { desc: describe(el), count };
    }

    case 'fill': {
      const { el, count } = one(spec);
      if (!el) notFound(spec);
      el.focus?.({ preventScroll: true });
      if (editable(el)) {
        el.ownerDocument.execCommand('selectAll');
        el.ownerDocument.execCommand('delete');
        insertLines(el, arg);
      } else if (el.tagName === 'SELECT') {
        const opt = [...el.options].find((o) => o.value === arg || norm(o.textContent) === norm(arg));
        if (!opt) throw new Error(`下拉框里没有「${arg}」，可选：${[...el.options].map((o) => norm(o.textContent)).join(' / ')}`);
        setNative(el, opt.value);
      } else {
        setNative(el, String(arg));
      }
      return { desc: describe(el), count, got: valueOf(el) };
    }

    // 在当前内容末尾追加（contenteditable 用 insertText，真实编辑器会触发联想，例如话题候选）
    case 'append': {
      const { el } = one(spec);
      if (!el) notFound(spec);
      el.focus?.({ preventScroll: true });
      if (editable(el)) { caretToEnd(el); insertLines(el, arg); } else setNative(el, (el.value || '') + arg);
      return { desc: describe(el), got: valueOf(el) };
    }

    case 'check': {
      const { el } = one(spec);
      if (!el) notFound(spec);
      const now = el.checked ?? el.getAttribute('aria-checked') === 'true';
      if (!!now !== !!arg) el.click();
      return { desc: describe(el), checked: el.checked ?? el.getAttribute('aria-checked') === 'true' };
    }

    // 页面状态的一句话诊断：脚本出错时连同错误一起交回给模型
    // 页面自己取素材、造 File 投进去：file input 在 shadow DOM 里、或页面只认拖放时用。
    // arg = {url, name, type, drop}。素材地址是配对服务器给的一次性地址（带 CORS）。
    case 'putFile': return (async () => {
      const { el } = one(spec);
      if (!el) notFound(spec);
      const res = await fetch(arg.url, { credentials: 'omit', cache: 'no-store' });
      if (!res.ok) throw new Error(`页面里取素材失败：HTTP ${res.status}`);
      const file = new File([await res.blob()], arg.name, { type: arg.type || 'application/octet-stream' });
      const dt = new DataTransfer();
      dt.items.add(file);
      if (!arg.drop && el.tagName === 'INPUT' && el.type === 'file') {
        el.files = dt.files;
        el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        return { desc: describe(el), how: 'input', size: file.size };
      }
      for (const t of ['dragenter', 'dragover', 'drop']) {
        el.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, composed: true, dataTransfer: dt }));
      }
      return { desc: describe(el), how: 'drop', size: file.size };
    })();

    case 'diagnose': {
      const dialogs = find({ css: 'dialog[open],[role=dialog],[role=alertdialog],[aria-modal=true]', visible: true })
        .slice(0, 3).map((el) => norm(el.innerText).slice(0, 200));
      const toasts = find({ css: '[class*=toast],[class*=message],[class*=notice],[class*=alert],[role=alert]', visible: true })
        .map((el) => norm(el.innerText)).filter((t) => t && t.length < 120).slice(0, 5);
      const errs = find({ css: '[class*=error],[class*=Error],[aria-invalid=true]', visible: true })
        .map((el) => norm(el.innerText)).filter((t) => t && t.length < 120).slice(0, 5);
      return { url: location.href, title: document.title, hidden: document.hidden, dialogs, toasts, errors: errs };
    }

    // 网络记录（net-hook.js 写在 window.__hcNet）
    case 'netLen': return window.__hcNet ? window.__hcNet.length : -1;
    case 'netFind': {
      const all = window.__hcNet || [];
      const from = arg?.from ?? 0;
      const m = spec;
      const re = m.re ? new RegExp(m.re, m.flags || '') : null;
      for (let i = from; i < all.length; i++) {
        const r = all[i];
        if (re ? re.test(r.url || '') : String(r.url || '').includes(m.part)) {
          if (m.method && String(r.method || 'GET').toUpperCase() !== m.method.toUpperCase()) continue;
          return { i, url: r.url, status: r.status, method: r.method, body: String(r.body || '').slice(0, arg?.maxBody || 400000) };
        }
      }
      return null;
    }
    case 'netList': {
      const all = window.__hcNet || [];
      return all.slice(-(arg || 50)).map((r) => ({ m: r.method, s: r.status, url: String(r.url).slice(0, 200), kb: Math.round((r.body || '').length / 1024) }));
    }
    default: throw new Error(`未知页面操作 ${op}`);
  }
}
/* eslint-enable no-undef */

const IN_PAGE_SRC = inPage.toString();

// RegExp 过不了 JSON：转成 {re, flags}，页面里再还原
// 脚本跑在 vm 上下文里，那边的 /re/ 不是这边的 RegExp，instanceof 认不出——按内部类型判断
export const isRe = (x) => Object.prototype.toString.call(x) === '[object RegExp]';
const ser = (v) => JSON.stringify(v, (_k, x) => (isRe(x) ? { re: x.source, flags: x.flags } : x));

export class ScriptError extends Error {
  constructor(message, code, extra = {}) { super(message); this.code = code; Object.assign(this, extra); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------- Node 侧的 page ----------------

export class Page {
  // bridge 只要有 call(cmd, params, {tabId, timeoutMs}) 就行——测试里换成假的
  constructor(bridge, { tabId, trace = [], device, signal } = {}) {
    this.bridge = bridge;
    this.tabId = tabId;
    this.device = device;
    this.trace = trace;
    this.signal = signal;
    this.defaultTimeout = 15000;
    this._netMark = 0;
  }

  _check() { if (this.signal?.aborted) throw new ScriptError('脚本已被取消', 'CANCELLED'); }

  async _cmd(cmd, params = {}, timeoutMs) {
    this._check();
    return this.bridge.call(cmd, params, { tabId: this.tabId, timeoutMs, device: this.device });
  }

  // 每一步都记进轨迹：出错时交回给模型的就是「做到哪一步、每一步看到了什么」
  async _step(op, target, fn) {
    const t0 = Date.now();
    const entry = { i: this.trace.length + 1, op, target: target == null ? '' : String(target).replace(/\n/g, '⏎').slice(0, 120) };
    this.trace.push(entry);
    try {
      const r = await fn();
      entry.ms = Date.now() - t0;
      entry.ok = true;
      if (r && typeof r === 'object' && r.__note) { entry.note = String(r.__note).slice(0, 200); return r.value; }
      return r;
    } catch (e) {
      entry.ms = Date.now() - t0;
      entry.ok = false;
      entry.note = `[${e.code || 'ERR'}] ${String(e.message).slice(0, 200)}`;
      throw e;
    }
  }

  // 在页面里求值。fn 可以是函数（会被序列化，arg 以 JSON 传入）或表达式字符串。
  async evaluate(fn, arg) {
    const expr = typeof fn === 'function' ? `(${fn.toString()})(${arg === undefined ? '' : ser(arg)})` : String(fn);
    return this._eval(expr);
  }

  async _eval(expr, timeoutMs) {
    const r = await this._cmd('eval', { expr, maxLength: 4_000_000 }, timeoutMs);
    const text = typeof r === 'string' ? r : r?.text ?? '';
    // 扩展的 eval 返回 JSON.stringify 的结果；顺带把它附加的提示去掉
    const body = text.replace(/\n\n（提示：[\s\S]*$/, '');
    if (body === 'undefined' || body === '') return undefined;
    if (/\n…（已截断）$/.test(body)) throw new ScriptError('页面返回的数据超过 4MB，被截断了。只取需要的字段再返回。', 'TOO_BIG');
    try { return JSON.parse(body); } catch { return body; }
  }

  _in(op, spec, arg) {
    return this._eval(`(${IN_PAGE_SRC})(${ser(op)}, ${ser(spec)}, ${arg === undefined ? 'undefined' : ser(arg)})`);
  }

  // ---- 导航 ----

  async goto(url, { network = true } = {}) {
    return this._step('goto', url, async () => {
      await this._cmd('navigate', { url }, 60000);
      // 网络记录：第一次在一个站上用时扩展会注册 document_start 钩子并刷新一次页面，
      // 之后每次导航都自动带上。刚打开的页面刷新一次没有损失。
      if (network && (await this._in('netLen')) < 0) {
        await this._cmd('network', {}, 60000).catch(() => {});
      }
      this._netMark = Math.max(0, await this._in('netLen'));
      return { value: undefined, __note: await this.url() };
    });
  }

  async reload() { return this._step('reload', '', () => this._cmd('navigate', { action: 'reload' }, 60000).then(() => undefined)); }
  async goBack() { return this._step('goBack', '', () => this._cmd('navigate', { action: 'back' }, 60000).then(() => undefined)); }
  async url() { return this._eval('location.href'); }
  async title() { return this._eval('document.title'); }

  // ---- 定位器 ----

  locator(css, opts = {}) { return new Locator(this, { css, ...pick(opts) }); }
  getByRole(role, opts = {}) { return new Locator(this, { role, name: opts.name, exact: opts.exact, ...pick(opts) }); }
  getByText(text, opts = {}) { return new Locator(this, { text, exact: opts.exact }); }
  getByPlaceholder(text, opts = {}) { return new Locator(this, { placeholder: text, exact: opts.exact }); }
  getByLabel(text, opts = {}) { return new Locator(this, { label: text, exact: opts.exact }); }

  // Playwright 风格的快捷写法：page.click(selector) 等价于 page.locator(selector).click()
  click(css, o) { return this.locator(css).click(o); }
  fill(css, v) { return this.locator(css).fill(v); }
  type(css, v) { return this.locator(css).pressSequentially(v); }
  press(css, key) { return this.locator(css).press(key); }
  check(css) { return this.locator(css).check(); }
  textContent(css) { return this.locator(css).textContent(); }
  inputValue(css) { return this.locator(css).inputValue(); }
  setInputFiles(css, files) { return this.locator(css).setInputFiles(files); }
  waitForSelector(css, o) { return this.locator(css).waitFor(o); }

  // 不带目标的按键：发给当前焦点
  async keyboard(key) { return this._step('key', key, () => this._cmd('key', { key }).then((r) => ({ __note: noteOf(r) }))); }

  // ---- 等待 ----

  async waitForTimeout(ms) { this._check(); await sleep(ms); }

  // 条件函数在页面里反复求值，直到返回真值；返回那个值
  async waitForFunction(fn, arg, { timeout = this.defaultTimeout, polling = 300 } = {}) {
    return this._step('waitForFunction', fn.toString().slice(0, 80), async () => {
      const t0 = Date.now();
      let last;
      while (Date.now() - t0 < timeout) {
        try { last = await this.evaluate(fn, arg); } catch (e) { last = `（求值出错：${e.message}）`; }
        if (last && !(typeof last === 'string' && last.startsWith('（求值出错'))) return last;
        await sleep(polling);
        this._check();
      }
      throw new ScriptError(`等了 ${timeout}ms 条件仍不成立（最后一次结果：${JSON.stringify(last)?.slice(0, 200)}）`, 'TIMEOUT');
    });
  }

  async waitForURL(pattern, { timeout = this.defaultTimeout } = {}) {
    return this._step('waitForURL', pattern, async () => {
      const t0 = Date.now();
      let u = '';
      while (Date.now() - t0 < timeout) {
        try { u = await this.url(); } catch { /* 正在跳转 */ }
        if (isRe(pattern) ? new RegExp(pattern.source, pattern.flags).test(u) : u.includes(pattern)) return u;
        await sleep(400);
        this._check();
      }
      throw new ScriptError(`等了 ${timeout}ms 地址仍不是 ${pattern}（现在是 ${u}）`, 'TIMEOUT');
    });
  }

  // 等一个接口响应。默认只认「上一次动作之后」新出现的请求——
  // 先 click 再 waitForResponse 不会漏掉在 click 期间就回来的那条。
  // 要从头找就传 {any:true}。返回 {url, status, body, json()}。
  async waitForResponse(match, { timeout = 30000, any = false, method } = {}) {
    const m = isRe(match) ? { re: match.source, flags: match.flags, method } : { part: String(match), method };
    return this._step('waitForResponse', match, async () => {
      const t0 = Date.now();
      if ((await this._in('netLen')) < 0) {
        throw new ScriptError('这个页面没有网络记录钩子。用 page.goto(url) 打开页面（默认会装上），再做动作。', 'NO_NET_HOOK');
      }
      while (Date.now() - t0 < timeout) {
        const r = await this._in('netFind', m, { from: any ? 0 : this._netMark });
        if (r) {
          this._netMark = r.i + 1;
          return { value: wrapResponse(r), __note: `${r.status} ${String(r.url).slice(0, 120)}` };
        }
        await sleep(400);
        this._check();
      }
      const recent = await this._in('netList', undefined, 8).catch(() => []);
      throw new ScriptError(`等了 ${timeout}ms 没等到匹配 ${match} 的响应。最近的请求：\n`
        + recent.map((x) => `  ${x.s} ${x.m} ${x.url}`).join('\n'), 'TIMEOUT');
    });
  }

  // 最近的请求目录（不含正文）
  async requests(n = 50) { return this._in('netList', undefined, n); }

  // ---- 观察 ----

  async screenshot({ path } = {}) {
    return this._step('screenshot', path || '', async () => {
      const data = await this._cmd('screenshot', {});
      if (!data?.dataUrl) throw new ScriptError('截图失败', 'INTERNAL');
      const b64 = data.dataUrl.split(',')[1];
      if (path) fs.writeFileSync(path, Buffer.from(b64, 'base64'));
      return { value: path || b64, __note: path || `${Math.round(b64.length * 0.75 / 1024)}KB` };
    });
  }

  async content() { return this._eval('document.documentElement.outerHTML'); }
  async innerText() { return this._eval('document.body.innerText'); }
  async diagnose() { return this._in('diagnose'); }

  // 交给真人（扫码、验证码、短信）。返回 continued / completed / cancelled / timed_out
  async ask(title, prompt, { timeout = 300000 } = {}) {
    return this._step('ask', title, async () => {
      const r = await this._cmd('ask', { title, prompt, timeout }, Math.min(timeout + 20000, 620000));
      return { value: r?.outcome || r?.text || r, __note: noteOf(r) };
    });
  }
}

function pick(o) {
  const out = {};
  if (o.hasText != null) out.hasText = o.hasText;
  if (o.visible != null) out.visible = o.visible;
  return out;
}

// 扩展的回执后面常跟着一整份快照；轨迹里只留「做了什么、效果如何」那几行
const noteOf = (r) => {
  const s = typeof r === 'string' ? r : r?.text ?? r?.note ?? (r == null ? '' : JSON.stringify(r));
  return String(s).split(/\n\s*\n/)[0].replace(/\n/g, ' ').slice(0, 240);
};

function wrapResponse(r) {
  return {
    url: r.url, status: r.status, method: r.method, body: r.body,
    ok: r.status >= 200 && r.status < 300,
    json() { try { return JSON.parse(r.body); } catch { throw new ScriptError(`响应不是 JSON：${String(r.body).slice(0, 200)}`, 'NOT_JSON'); } },
    text() { return r.body; },
  };
}

const descSpec = (s) => {
  const base = s.css ? s.css : s.role ? `role=${s.role}${s.name != null ? `[name=${s.name}]` : ''}`
    : s.text != null ? `text=${s.text}` : s.placeholder != null ? `placeholder=${s.placeholder}` : `label=${s.label}`;
  return (s.parent ? descSpec(s.parent) + ' >> ' : '') + base
    + (s.hasText != null ? `:has-text(${s.hasText})` : '') + (s.nth != null ? ` >> nth=${s.nth}` : '');
};

export class Locator {
  constructor(page, spec) { this.page = page; this.spec = spec; }

  toString() { return descSpec(this.spec); }
  locator(css) { return new Locator(this.page, { css, parent: this.spec }); }
  getByRole(role, o = {}) { return new Locator(this.page, { role, name: o.name, exact: o.exact, parent: this.spec }); }
  getByText(text, o = {}) { return new Locator(this.page, { text, exact: o.exact, parent: this.spec }); }
  filter({ hasText, visible } = {}) { return new Locator(this.page, { ...this.spec, ...(hasText != null ? { hasText } : {}), ...(visible != null ? { visible } : {}) }); }
  nth(i) { return new Locator(this.page, { ...this.spec, nth: i }); }
  first() { return this.nth(0); }
  last() { return this.nth(-1); }

  async count() { return this.page._in('count', this.spec); }
  async isVisible() { return this.page._in('visible', this.spec); }
  async describe() { return this.page._in('describe', this.spec); }
  async textContent() { return this.page._in('text', this.spec); }
  async innerText() { return this.page._in('text', this.spec); }
  async allTextContents() { return this.page._in('allTexts', this.spec); }
  async inputValue() { return this.page._in('value', this.spec); }
  async getAttribute(name) { return this.page._in('attr', this.spec, name); }
  async innerHTML(max) { return this.page._in('html', this.spec, max); }

  // 等元素到某个状态：attached（存在）/ visible（默认）/ hidden / detached
  async waitFor({ state = 'visible', timeout = this.page.defaultTimeout } = {}) {
    return this.page._step('waitFor', `${this} (${state})`, async () => {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) {
        const n = await this.page._in('count', this.spec).catch(() => 0);
        const vis = n ? await this.page._in('visible', this.spec).catch(() => false) : false;
        if ((state === 'attached' && n) || (state === 'visible' && vis) || (state === 'hidden' && !vis) || (state === 'detached' && !n)) return undefined;
        await sleep(300);
        this.page._check();
      }
      throw new ScriptError(`等了 ${timeout}ms，${this} 仍未 ${state}`, 'TIMEOUT');
    });
  }

  // 动作前等元素出现（Playwright 的自动等待）。只等存在，不强求可见——后台标签页里可见性不可靠。
  async _ready(timeout = this.page.defaultTimeout) {
    const t0 = Date.now();
    for (;;) {
      if (await this.page._in('count', this.spec)) return;
      if (Date.now() - t0 > timeout) {
        const diag = await this.page.diagnose().catch(() => null);
        throw new ScriptError(`等了 ${timeout}ms 没找到 ${this}`, 'NOT_FOUND', { diag });
      }
      await sleep(300);
      this.page._check();
    }
  }

  async _mark() { this.page._netMark = Math.max(0, await this.page._in('netLen').catch(() => 0)); }

  async click({ timeout, js = false } = {}) {
    return this.page._step('click', this, async () => {
      await this._ready(timeout);
      await this._mark();
      const st = await this.page._in('stamp', this.spec);
      const many = st.count > 1 ? `（匹配 ${st.count} 个，点了${st.visibleCount ? '第一个可见的' : '第一个'}）` : '';
      if (!js && st.inDoc) {
        try {
          const r = await this.page._cmd('click', { selector: `[data-vc="${st.id}"]` });
          return { __note: noteOf(r) + many };
        } catch (e) {
          // 后台标签页命中测试不可靠，扩展会误报被遮挡；退回页面内事件序列
          if (!/NOT_INTERACTABLE|REF_NOT_FOUND/.test(e.code || '')) throw e;
        }
      }
      const r = await this.page._in('click', this.spec);
      return { __note: `页面内点击 ${r.desc}${many}` };
    });
  }

  // 整体替换内容，并读回核对——填进去的不是你要的就直接报错，不让脚本带着错数据往下走
  async fill(value) {
    return this.page._step('fill', `${this} ← ${String(value).slice(0, 40)}`, async () => {
      await this._ready();
      await this._mark();
      const r = await this.page._in('fill', this.spec, String(value));
      const want = String(value).replace(/\s+/g, ' ').trim();
      const got = String(r.got ?? '').replace(/\s+/g, ' ').trim();
      if (got !== want && !got.includes(want)) {
        throw new ScriptError(`填完读回来不一致：想填「${want.slice(0, 60)}」，实际是「${got.slice(0, 60)}」（${r.desc}）。`
          + '可能有字数上限、输入格式限制，或填错了框。', 'FILL_MISMATCH');
      }
      return { __note: r.desc };
    });
  }

  // 在末尾追加文字（contenteditable 走 insertText，编辑器会照常触发话题、@ 之类的联想）
  async pressSequentially(text) {
    return this.page._step('type', `${this} ← ${String(text).slice(0, 40)}`, async () => {
      await this._ready();
      await this._mark();
      const r = await this.page._in('append', this.spec, String(text));
      return { __note: r.desc };
    });
  }

  async press(key) {
    return this.page._step('press', `${this} ${key}`, async () => {
      await this._ready();
      await this._mark();
      const st = await this.page._in('stamp', this.spec);
      if (!st.inDoc) throw new ScriptError(`${this} 在 shadow DOM 里，扩展的按键送不进去。先 click 让它获得焦点，再用 page.keyboard(key)。`, 'IN_SHADOW');
      const r = await this.page._cmd('key', { key, selector: `[data-vc="${st.id}"]` });
      return { __note: noteOf(r) };
    });
  }

  async check() { return this._setCheck(true); }
  async uncheck() { return this._setCheck(false); }
  async _setCheck(on) {
    return this.page._step(on ? 'check' : 'uncheck', this, async () => {
      await this._ready();
      const r = await this.page._in('check', this.spec, on);
      if (r.checked !== on) throw new ScriptError(`${this} 没有变成${on ? '勾选' : '未勾选'}（${r.desc}）`, 'CHECK_FAILED');
      return { __note: r.desc };
    });
  }

  async selectOption(value) { return this.fill(value); }

  // 页面只认拖放（没有 file input）时：把文件拖到这个区域上
  async dropFiles(files) { return this.setInputFiles(files, { drop: true }); }

  // 本机文件投进 file input（隐藏的也行）。多个文件按顺序一个一个投——
  // 很多编辑器靠投入顺序决定图片顺序，一次投多个顺序不保证。
  //
  // bridge 自带 upload({file, selector, spec, drop}) 时（云端：文件先传到配对服务器）交给它；
  // 否则走本机那条路（CDP 读盘，拖放才搬字节）。
  async setInputFiles(files, { drop = false } = {}) {
    const list = Array.isArray(files) ? files : [files];
    return this.page._step('setInputFiles', `${this} ← ${list.length} 个文件`, async () => {
      await this._ready();
      await this._mark();
      const notes = [];
      for (const f of list) {
        if (!fs.existsSync(f)) throw new ScriptError(`文件不存在：${f}`, 'NO_FILE');
        if (this.page.bridge.upload) {
          notes.push(noteOf(await this.page.bridge.upload({ file: f, locator: this, drop }, this.page)));
          continue;
        }
        const st = await this.page._in('stamp', this.spec);
        if (!st.inDoc) throw new ScriptError(`${this} 在 shadow DOM 里，扩展的上传投不进去`, 'IN_SHADOW');
        const sel = `[data-vc="${st.id}"]`;
        if (drop) {
          notes.push(noteOf(await uploadFile(this.page.bridge, { path: f, dropSelector: sel, tabId: this.page.tabId }, this.page.device)));
          continue;
        }
        if (st.tag !== 'INPUT' || st.type !== 'file') {
          throw new ScriptError(`${this} 不是 file input（是 ${st.desc}）。用 page.locator('input[type=file]') 找真正的上传框，页面只认拖放就用 dropFiles。`, 'NOT_FILE_INPUT');
        }
        const r = await uploadFile(this.page.bridge, { path: f, selector: sel, tabId: this.page.tabId }, this.page.device);
        notes.push(noteOf(r));
      }
      return { __note: notes.join('；') };
    });
  }
}
