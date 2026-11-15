// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/flow/
// flow 能力包没有上游代码，不需要补全局变量。build-loads.mjs 要求每个包都有这个文件。

(() => {
  // <define:__LOAD_ACTIONS__>
  var define_LOAD_ACTIONS_default = ["flow.state", "flow.option", "flow.blocker", "flow.baseline", "flow.result", "flow.fetch"];

  // loads/flow/entry.js
  var ALLOWED = new Set(define_LOAD_ACTIONS_default);
  var err = (code, message) => Object.assign(new Error(message), { code });
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  var ATTR = "data-vcorp-flow";
  var MIN_NATURAL = 256;
  var MIN_SHOWN = 64;
  var CHUNK = 8 * 1024 * 1024;
  var REFUSAL = /(couldn.t generate|could not generate|unable to (generate|create)|violat\w*|against (our|the) polic\w*|not enough credits|out of credits|timed out waiting for confirmation)[^\n]{0,160}/i;
  var visible = (el) => !!el && el.getClientRects().length > 0;
  var label = (el) => (el.getAttribute("aria-label") || "").trim();
  var lines = (el) => (el.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
  function byName(name, root = document, sel = 'button, a, [role="button"], [role="link"], [role="tab"]') {
    for (const el of root.querySelectorAll(sel)) {
      if (!visible(el)) continue;
      if (label(el) === name || lines(el).includes(name)) return el;
    }
    return null;
  }
  function byText(text, root = document.body) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while (n = w.nextNode()) {
      if (n.nodeValue.trim() === text && visible(n.parentElement)) return n.parentElement;
    }
    return null;
  }
  function mark(name, el) {
    for (const old of document.querySelectorAll(`[${ATTR}="${name}"]`)) if (old !== el) old.removeAttribute(ATTR);
    if (el) el.setAttribute(ATTR, name);
    return !!el;
  }
  function approveEl() {
    const el = byText("Always approve in project");
    if (!el) return null;
    const ctl = el.closest('[role="radio"], [role="button"], button, [role="menuitem"]');
    return ctl && disabled(ctl) ? null : el;
  }
  var disabled = (el) => !!el && (el.disabled || el.getAttribute("aria-disabled") === "true");
  var srcOf = (el) => el.currentSrc || el.src || el.querySelector?.("source[src]")?.src || "";
  function keyOf(src) {
    const s = String(src || "");
    if (!/^https?:/i.test(s)) return s.slice(0, 300);
    try {
      const u = new URL(s);
      return u.origin + u.pathname.replace(/=[\w-]+$/, "");
    } catch {
      return s.slice(0, 300);
    }
  }
  var allMedia = () => [...document.querySelectorAll("img, video")];
  function sizeOf(el) {
    const r = el.getBoundingClientRect();
    const video = el.tagName === "VIDEO";
    return {
      w: video ? el.videoWidth : el.naturalWidth,
      h: video ? el.videoHeight : el.naturalHeight,
      sw: r.width,
      sh: r.height,
      loaded: video ? el.readyState >= 1 && el.videoWidth > 0 : el.complete && el.naturalWidth > 0
    };
  }
  function sizeable(el) {
    const z = sizeOf(el);
    return z.loaded && visible(el) && Math.min(z.w, z.h) >= MIN_NATURAL && Math.min(z.sw, z.sh) >= MIN_SHOWN ? z : null;
  }
  function fresh(kind, skip, exclude) {
    const tag = kind === "video" ? "VIDEO" : "IMG";
    const seen = /* @__PURE__ */ new Map();
    for (const el of allMedia()) {
      if (el.tagName !== tag) continue;
      const src = srcOf(el);
      const key = keyOf(src);
      if (!src || skip.has(key) || exclude.some((x) => src.includes(x) || key.includes(x))) continue;
      const z = sizeable(el);
      if (!z) continue;
      const had = seen.get(key);
      if (!had || z.w * z.h > had.w * had.h) seen.set(key, { el, src, key, ...z });
    }
    return [...seen.values()].sort((a, b) => b.w * b.h - a.w * a.h || b.sw * b.sh - a.sw * a.sh);
  }
  function hover(el) {
    for (let n = el, i = 0; n && i < 4; n = n.parentElement, i++) {
      for (const t of ["pointerover", "pointerenter", "mouseover", "mouseenter"]) {
        n.dispatchEvent(new (t.startsWith("pointer") ? PointerEvent : MouseEvent)(t, { bubbles: !t.endsWith("enter"), view: window }));
      }
    }
  }
  var ingredients = () => [...document.querySelectorAll('img[alt="Ingredient image"]')].map((i) => keyOf(srcOf(i))).filter(Boolean);
  var overlay = () => document.querySelector(".cdk-overlay-container");
  var refusal = () => {
    const tail = (document.querySelector("main")?.innerText || "").slice(-2e3);
    return tail.match(REFUSAL)?.[0] || null;
  };
  var ACTIONS = {
    // 状态 + 标记。云端点 [data-vcorp-flow="<名字>"]，标记每次调用都重打一遍
    "flow.state": () => {
      const project = /\/project\/([0-9a-f-]{36})/.exec(location.pathname)?.[1] || null;
      const ov = overlay();
      const start = byName("Start generation");
      const marks = {
        prompt: mark("prompt", document.querySelector(".ProseMirror")),
        start: mark("start", start),
        "new-session": mark("new-session", byName("Start new session")),
        add: mark("add", byName("Add ingredients to the prompt box")),
        "open-project": mark("open-project", byName("Open project")),
        "new-project": mark("new-project", byName("New project")),
        "close-account": mark("close-account", byName("Close account panel")),
        "uploads-tab": mark("uploads-tab", ov ? byText("Uploads", ov) : null),
        approve: mark("approve", approveEl())
      };
      return {
        url: location.origin + location.pathname,
        // 只说登没登录，不把账号邮箱交出去
        loggedIn: !!document.querySelector('[aria-label^="Google Account:"]'),
        project,
        promptChars: (document.querySelector(".ProseMirror")?.textContent || "").trim().length,
        canStart: !!start && !disabled(start),
        ingredients: ingredients(),
        options: ov ? ov.querySelectorAll('button[role="option"]').length : 0,
        refusal: refusal(),
        marks
      };
    },
    // 配料面板 Uploads 里按文件名找那一项，标成 option。上传要几秒，期间它是灰的
    "flow.option": (p) => {
      const name = String(p.name || "");
      if (!name) throw err("BAD_PARAMS", "flow.option \u8981 name\uFF08\u4E0A\u4F20\u65F6\u7684\u6587\u4EF6\u540D\uFF09");
      const ov = overlay();
      const el = ov ? [...ov.querySelectorAll('button[role="option"]')].find((b) => (b.innerText || "").includes(name)) : null;
      mark("option", el || null);
      return { found: !!el, disabled: disabled(el) };
    },
    // 云端点 [data-vcorp-flow="<name>"] 时报「被遮挡」：看是谁盖在它中心点上。盖着的若是对话框、
    // 菜单或遮罩，顺手把里面的关闭按钮标成 dismiss、遮罩标成 backdrop，云端去点；这里不代点。
    // 只描述元素本身（标签、role、aria-label、开头一段文字），不读别的页面内容。
    "flow.blocker": (p) => {
      const name = String(p.name || "");
      if (!/^[a-z-]{1,24}$/.test(name)) throw err("BAD_PARAMS", "flow.blocker \u8981 name\uFF08\u88AB\u6321\u4F4F\u7684\u90A3\u4E2A\u6807\u8BB0\uFF09");
      const el = document.querySelector(`[${ATTR}="${name}"]`);
      mark("dismiss", null);
      mark("backdrop", null);
      if (!el) return { blocked: false, missing: true };
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!top || top === el || el.contains(top)) return { blocked: false };
      const host = top.closest('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], .cdk-overlay-pane') || top;
      const desc = {
        tag: host.tagName.toLowerCase(),
        role: host.getAttribute("role") || "",
        label: label(host).slice(0, 60),
        cls: [...host.classList].slice(0, 3).join(" ").slice(0, 80),
        text: (host.innerText || "").replace(/\s+/g, " ").trim().slice(0, 100)
      };
      const backdrop = top.classList.contains("cdk-overlay-backdrop") ? top : document.querySelector(".cdk-overlay-backdrop.cdk-overlay-backdrop-showing");
      mark("backdrop", backdrop && visible(backdrop) ? backdrop : null);
      const CLOSE = /^(close|dismiss|got it|not now|no thanks|skip|maybe later|关闭|知道了|以后再说)$/i;
      let dismiss = null;
      for (const b of host.querySelectorAll('button, [role="button"]')) {
        if (visible(b) && (CLOSE.test(label(b)) || CLOSE.test((b.innerText || "").trim()))) {
          dismiss = b;
          break;
        }
      }
      mark("dismiss", dismiss);
      return { blocked: true, by: desc, dismiss: !!dismiss, backdrop: !!(backdrop && visible(backdrop)) };
    },
    // 提交之前记一笔：此刻页面上已有的图片、视频（不论大小、加载没加载完）以后都不算结果
    "flow.baseline": () => {
      const keys = /* @__PURE__ */ new Set();
      for (const el of allMedia()) {
        const src = srcOf(el);
        if (src) keys.add(keyOf(src));
        if (el.poster) keys.add(keyOf(el.poster));
      }
      window.__vcorpFlowBase = { t: Date.now(), keys: [...keys] };
      window.__vcorpFlowHit = null;
      window.__vcorpFlowBlob = null;
      return { known: keys.size };
    },
    // 等结果：基线之后新出现的、够大的、加载好的图片（kind=video 时是视频），连着两次看到同一个才算。
    // 最多等 waitMs（≤55 秒），没等到返回 done:false，云端再调。中途出现确认（花 credits？）就先
    // 返回 approval:true，让云端点 [data-vcorp-flow="approve"]。exclude：配料（参考图）的 key。
    "flow.result": async (p) => {
      const kind = p.kind === "video" ? "video" : "image";
      const base = window.__vcorpFlowBase;
      if (!base) throw err("NO_BASELINE", "\u5148\u8C03 flow.baseline\uFF0C\u518D\u63D0\u4EA4\uFF0C\u518D\u8BFB\u7ED3\u679C");
      const skip = new Set(base.keys);
      const exclude = (Array.isArray(p.exclude) ? p.exclude : []).map(String).filter((x) => x.length >= 8);
      const until = Date.now() + Math.min(Math.max(Number(p.waitMs) || 45e3, 1e3), 55e3);
      let last = "", poster = null;
      for (; ; ) {
        const hit = fresh(kind, skip, exclude)[0];
        if (hit && hit.key === last) {
          window.__vcorpFlowHit = { key: hit.key, src: hit.src, kind };
          window.__vcorpFlowBlob = null;
          return { done: true, kind, key: hit.key, url: hit.src, width: hit.w, height: hit.h, fresh: true };
        }
        last = hit?.key || "";
        if (!hit && kind === "video") {
          const cover = fresh("image", skip, exclude)[0];
          if (cover && cover.key !== poster) {
            poster = cover.key;
            hover(cover.el);
          }
        }
        if (!p.approved && mark("approve", approveEl())) return { done: false, approval: true };
        const why = refusal();
        if (why) return { done: false, refusal: why };
        if (Date.now() >= until) return { done: false, ...poster ? { poster: true } : {} };
        await sleep(800);
      }
    },
    // 交出 flow.result 认出的那个媒体的字节：用页面自己的 fetch 取它正在显示的地址（带这个页面的
    // 登录，blob: 地址也行），从 offset 起交一段（≤8MB），云端按 size 接着要下一段。
    "flow.fetch": async (p) => {
      const hit = window.__vcorpFlowHit;
      if (!hit || hit.key !== String(p.key || "")) throw err("NO_RESULT", "\u5148\u7528 flow.result \u8BA4\u51FA\u7ED3\u679C\uFF0C\u518D\u6309\u5B83\u7ED9\u7684 key \u53D6\u5B57\u8282");
      let held = window.__vcorpFlowBlob;
      if (!held || held.key !== hit.key) {
        let res;
        try {
          res = await fetch(hit.src, { credentials: "include", cache: "force-cache" });
        } catch (e) {
          throw err("FETCH_FAILED", `\u9875\u9762\u91CC\u53D6\u4E0D\u5230\u8FD9\u4E2A${hit.kind === "video" ? "\u89C6\u9891" : "\u56FE\u7247"}\uFF1A${e.message || e}`);
        }
        if (!res.ok) throw err("FETCH_FAILED", `\u9875\u9762\u91CC\u53D6${hit.kind === "video" ? "\u89C6\u9891" : "\u56FE\u7247"}\uFF1AHTTP ${res.status}`);
        const blob = await res.blob();
        if (!blob.size) throw err("FETCH_FAILED", "\u53D6\u5230\u7684\u662F\u7A7A\u7684");
        held = window.__vcorpFlowBlob = { key: hit.key, blob };
      }
      const size = held.blob.size;
      const offset = Math.max(0, Math.min(Number(p.offset) || 0, size));
      const buf = new Uint8Array(await held.blob.slice(offset, offset + CHUNK).arrayBuffer());
      let bin = "";
      for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
      const end = offset + buf.length;
      if (end >= size) window.__vcorpFlowBlob = null;
      return {
        key: hit.key,
        size,
        offset,
        bytes: buf.length,
        type: held.blob.type || "",
        done: end >= size,
        __binary: { data: btoa(bin), type: held.blob.type || (hit.kind === "video" ? "video/mp4" : "image/png") }
      };
    }
  };
  (window.__vcorpLoads ||= {}).flow = {
    version: "1.1.0+ea62f5",
    async ready() {
      if (location.hostname !== "flow.google.com") return { ok: false, reason: "\u4E0D\u5728 flow.google.com \u4E0A" };
      return { ok: true };
    },
    call(action, payload) {
      if (!ALLOWED.has(action) || !ACTIONS[action]) throw err("LOAD_DENIED", `flow \u5C0F\u8111\u4E0D\u63A5\u53D7 ${action}`);
      return ACTIONS[action](payload || {});
    }
  };
})();
