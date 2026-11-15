// 由 scripts/build-loads.mjs 生成，不要手改。源码：loads/flow/
// flow 能力包没有上游代码，不需要补全局变量。build-loads.mjs 要求每个包都有这个文件。

(() => {
  // <define:__LOAD_ACTIONS__>
  var define_LOAD_ACTIONS_default = ["flow.state", "flow.option", "flow.blocker", "flow.baseline", "flow.result"];

  // loads/flow/entry.js
  var ALLOWED = new Set(define_LOAD_ACTIONS_default);
  var err = (code, message) => Object.assign(new Error(message), { code });
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  var ATTR = "data-vcorp-flow";
  var UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  var MEDIA = { image: /^https:\/\/flow-content\.google\/image\//, video: /^https:\/\/flow-content\.google\/video\// };
  var REFUSAL = /(couldn.t generate|could not generate|unable to (generate|create)|violat\w*|against (our|the) polic\w*|not enough credits|out of credits|timed out waiting for confirmation)[^\n]{0,160}/i;
  function parseRpc(text, rpc) {
    const out = [];
    for (const line of String(text || "").split("\n")) {
      if (!line.startsWith("[[")) continue;
      let arr;
      try {
        arr = JSON.parse(line);
      } catch {
        continue;
      }
      for (const e of arr) {
        if (e?.[0] === "wrb.fr" && e[1] === rpc && e[2]) {
          try {
            out.push(JSON.parse(e[2]));
          } catch {
          }
        }
      }
    }
    return out;
  }
  var findStr = (o, re) => {
    if (typeof o === "string") return re.test(o) ? o : null;
    if (Array.isArray(o)) for (const x of o) {
      const r = findStr(x, re);
      if (r) return r;
    }
    return null;
  };
  var findDims = (o) => {
    if (!Array.isArray(o)) return null;
    if (o.length === 2 && o.every((n) => Number.isInteger(n) && n > 64 && n < 1e4)) return o;
    for (const x of o) {
      const r = findDims(x);
      if (r) return r;
    }
    return null;
  };
  var net = () => Array.isArray(window.__hcNet) ? window.__hcNet : [];
  var rpcOf = (url) => /[?&]rpcids=([A-Za-z0-9]+)/.exec(String(url || ""))?.[1] || "";
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
  var disabled = (el) => !!el && (el.disabled || el.getAttribute("aria-disabled") === "true");
  var ingredients = () => [...document.querySelectorAll('img[alt="Ingredient image"]')].map((i) => /flow-content\.google\/image\/([0-9a-f-]{36})/.exec(i.src)?.[1]).filter(Boolean);
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
        approve: mark("approve", byText("Always approve in project"))
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
        netHook: Array.isArray(window.__hcNet),
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
    // 提交之前记一笔：之后读结果只看这一刻以后的响应，也不认这一刻已经有的媒体
    "flow.baseline": () => {
      const ids = new Set(ingredients());
      for (const r of net()) {
        if (rpcOf(r.url) !== "as29s") continue;
        for (const m of String(r.body || "").matchAll(new RegExp(UUID, "g"))) ids.add(m[0]);
      }
      for (const el of document.querySelectorAll('img[src*="flow-content.google"], video[src*="flow-content.google"]')) {
        const id = UUID.exec(el.src)?.[0];
        if (id) ids.add(id);
      }
      window.__vcorpFlowBase = { t: Date.now(), ids: [...ids] };
      return { known: ids.size, netHook: Array.isArray(window.__hcNet) };
    },
    // 等新媒体。最多等 waitMs（≤55 秒），没等到返回 done:false，云端再调。
    // 中途出现确认（花 credits？）就先返回 approval:true，让云端点 [data-vcorp-flow="approve"]
    "flow.result": async (p) => {
      const kind = p.kind === "video" ? "video" : "image";
      const base = window.__vcorpFlowBase;
      if (!base) throw err("NO_BASELINE", "\u5148\u8C03 flow.baseline\uFF0C\u518D\u63D0\u4EA4\uFF0C\u518D\u8BFB\u7ED3\u679C");
      const skip = /* @__PURE__ */ new Set([...base.ids, ...Array.isArray(p.exclude) ? p.exclude.map(String) : []]);
      const until = Date.now() + Math.min(Math.max(Number(p.waitMs) || 45e3, 1e3), 55e3);
      let creditsLeft = null;
      for (; ; ) {
        for (const r of net()) {
          if (r.t < base.t) continue;
          const rpc = rpcOf(r.url);
          if (rpc === "jwpduf") {
            const j = parseRpc(r.body, "jwpduf")[0];
            if (j && Number.isInteger(j[1])) creditsLeft = j[1];
          } else if (rpc === "as29s") {
            for (const it of parseRpc(r.body, "as29s")) {
              if (!it || skip.has(String(it[0]))) continue;
              const url = findStr(it, MEDIA[kind]);
              if (!url) continue;
              const dims = kind === "image" ? findDims(it) : null;
              return {
                done: true,
                kind,
                mediaId: String(it[0]),
                projectId: it[1] ?? null,
                sessionId: it[2] ?? null,
                url,
                width: dims?.[0] ?? null,
                height: dims?.[1] ?? null,
                creditsLeft
              };
            }
          }
        }
        if (!Array.isArray(window.__hcNet)) {
          for (const el of document.querySelectorAll(kind === "video" ? 'video[src*="flow-content.google/video/"]' : 'img[src*="flow-content.google/image/"]')) {
            const id = UUID.exec(el.src)?.[0];
            if (id && !skip.has(id) && el.getAttribute("alt") !== "Ingredient image") return { done: true, kind, mediaId: id, url: el.src, creditsLeft };
          }
        }
        if (mark("approve", byText("Always approve in project"))) return { done: false, approval: true, creditsLeft };
        const why = refusal();
        if (why) return { done: false, refusal: why, creditsLeft };
        if (Date.now() >= until) return { done: false, creditsLeft };
        await sleep(800);
      }
    }
  };
  (window.__vcorpLoads ||= {}).flow = {
    version: "1.0.0+a68e8a",
    async ready() {
      if (location.hostname !== "flow.google.com") return { ok: false, reason: "\u4E0D\u5728 flow.google.com \u4E0A" };
      return { ok: true, netHook: Array.isArray(window.__hcNet) };
    },
    call(action, payload) {
      if (!ALLOWED.has(action) || !ACTIONS[action]) throw err("LOAD_DENIED", `flow \u5C0F\u8111\u4E0D\u63A5\u53D7 ${action}`);
      return ACTIONS[action](payload || {});
    }
  };
})();
