// flow 能力包的页面侧入口：Google Flow（flow.google.com）项目页。
//
// 为什么只读：Flow 的「Start generation」和 Uploads 里的选项，页面内合成的点击常常不生效，
// 要扩展用真实事件（CDP）才点得动。小脑在页面里只能发合成事件，所以点击、填写、上传都交给
// 云端的 click / fill / upload 命令；这里只做三件事：
//   1. 读状态，并给要点的东西打上 data-vcorp-flow="<名字>"，云端按 selector 点它；
//   2. 记一条基线（此刻已经有哪些媒体）；
//   3. 从 net-hook.js 记下的 as29s 响应里读新生成的媒体：flow-content.google 的签名链接，
//      约 6 小时有效，不需要 cookie，服务器自己去下，字节不经过这个浏览器往外传。
// 生成扣的是这个浏览器里登录的 Google 账号自己的 Flow 额度。
//
// 白名单在扩展侧（cloud-policy.js、background.js）查过一遍，这里再查一遍。
const ALLOWED = new Set(__LOAD_ACTIONS__);
const err = (code, message) => Object.assign(new Error(message), { code });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ATTR = 'data-vcorp-flow';
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
const MEDIA = { image: /^https:\/\/flow-content\.google\/image\//, video: /^https:\/\/flow-content\.google\/video\// };
const REFUSAL = /(couldn.t generate|could not generate|unable to (generate|create)|violat\w*|against (our|the) polic\w*|not enough credits|out of credits|timed out waiting for confirmation)[^\n]{0,160}/i;

// ---------- batchexecute ----------

// )]}' 前缀、分块，每块一行 JSON：[["wrb.fr", rpcid, "<JSON 字符串>"], …]
function parseRpc(text, rpc) {
  const out = [];
  for (const line of String(text || '').split('\n')) {
    if (!line.startsWith('[[')) continue;
    let arr;
    try { arr = JSON.parse(line); } catch { continue; }
    for (const e of arr) {
      if (e?.[0] === 'wrb.fr' && e[1] === rpc && e[2]) {
        try { out.push(JSON.parse(e[2])); } catch { /* 不是 JSON */ }
      }
    }
  }
  return out;
}
const findStr = (o, re) => {
  if (typeof o === 'string') return re.test(o) ? o : null;
  if (Array.isArray(o)) for (const x of o) { const r = findStr(x, re); if (r) return r; }
  return null;
};
const findDims = (o) => {
  if (!Array.isArray(o)) return null;
  if (o.length === 2 && o.every((n) => Number.isInteger(n) && n > 64 && n < 10000)) return o;
  for (const x of o) { const r = findDims(x); if (r) return r; }
  return null;
};
const net = () => (Array.isArray(window.__hcNet) ? window.__hcNet : []);
const rpcOf = (url) => /[?&]rpcids=([A-Za-z0-9]+)/.exec(String(url || ''))?.[1] || '';

// ---------- 页面元素 ----------

const visible = (el) => !!el && el.getClientRects().length > 0;
const label = (el) => (el.getAttribute('aria-label') || '').trim();
const lines = (el) => (el.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);

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
  while ((n = w.nextNode())) {
    if (n.nodeValue.trim() === text && visible(n.parentElement)) return n.parentElement;
  }
  return null;
}

function mark(name, el) {
  for (const old of document.querySelectorAll(`[${ATTR}="${name}"]`)) if (old !== el) old.removeAttribute(ATTR);
  if (el) el.setAttribute(ATTR, name);
  return !!el;
}

const disabled = (el) => !!el && (el.disabled || el.getAttribute('aria-disabled') === 'true');
const ingredients = () => [...document.querySelectorAll('img[alt="Ingredient image"]')]
  .map((i) => /flow-content\.google\/image\/([0-9a-f-]{36})/.exec(i.src)?.[1]).filter(Boolean);
const overlay = () => document.querySelector('.cdk-overlay-container');
const refusal = () => {
  const tail = (document.querySelector('main')?.innerText || '').slice(-2000);
  return tail.match(REFUSAL)?.[0] || null;
};

// ---------- actions ----------

const ACTIONS = {
  // 状态 + 标记。云端点 [data-vcorp-flow="<名字>"]，标记每次调用都重打一遍
  'flow.state': () => {
    const project = /\/project\/([0-9a-f-]{36})/.exec(location.pathname)?.[1] || null;
    const ov = overlay();
    const start = byName('Start generation');
    const marks = {
      prompt: mark('prompt', document.querySelector('.ProseMirror')),
      start: mark('start', start),
      'new-session': mark('new-session', byName('Start new session')),
      add: mark('add', byName('Add ingredients to the prompt box')),
      'open-project': mark('open-project', byName('Open project')),
      'new-project': mark('new-project', byName('New project')),
      'close-account': mark('close-account', byName('Close account panel')),
      'uploads-tab': mark('uploads-tab', ov ? byText('Uploads', ov) : null),
      approve: mark('approve', byText('Always approve in project')),
    };
    return {
      url: location.origin + location.pathname,
      // 只说登没登录，不把账号邮箱交出去
      loggedIn: !!document.querySelector('[aria-label^="Google Account:"]'),
      project,
      promptChars: (document.querySelector('.ProseMirror')?.textContent || '').trim().length,
      canStart: !!start && !disabled(start),
      ingredients: ingredients(),
      options: ov ? ov.querySelectorAll('button[role="option"]').length : 0,
      refusal: refusal(),
      netHook: Array.isArray(window.__hcNet),
      marks,
    };
  },

  // 配料面板 Uploads 里按文件名找那一项，标成 option。上传要几秒，期间它是灰的
  'flow.option': (p) => {
    const name = String(p.name || '');
    if (!name) throw err('BAD_PARAMS', 'flow.option 要 name（上传时的文件名）');
    const ov = overlay();
    const el = ov ? [...ov.querySelectorAll('button[role="option"]')].find((b) => (b.innerText || '').includes(name)) : null;
    mark('option', el || null);
    return { found: !!el, disabled: disabled(el) };
  },

  // 提交之前记一笔：之后读结果只看这一刻以后的响应，也不认这一刻已经有的媒体
  'flow.baseline': () => {
    const ids = new Set(ingredients());
    for (const r of net()) {
      if (rpcOf(r.url) !== 'as29s') continue;
      for (const m of String(r.body || '').matchAll(new RegExp(UUID, 'g'))) ids.add(m[0]);
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
  'flow.result': async (p) => {
    const kind = p.kind === 'video' ? 'video' : 'image';
    const base = window.__vcorpFlowBase;
    if (!base) throw err('NO_BASELINE', '先调 flow.baseline，再提交，再读结果');
    const skip = new Set([...base.ids, ...(Array.isArray(p.exclude) ? p.exclude.map(String) : [])]);
    const until = Date.now() + Math.min(Math.max(Number(p.waitMs) || 45000, 1000), 55000);
    let creditsLeft = null;
    for (;;) {
      for (const r of net()) {
        if (r.t < base.t) continue;
        const rpc = rpcOf(r.url);
        if (rpc === 'jwpduf') {
          const j = parseRpc(r.body, 'jwpduf')[0];
          if (j && Number.isInteger(j[1])) creditsLeft = j[1];
        } else if (rpc === 'as29s') {
          for (const it of parseRpc(r.body, 'as29s')) {
            if (!it || skip.has(String(it[0]))) continue;
            // 同一条里视频的封面 image 链接排在前面，视频要专门找 /video/
            const url = findStr(it, MEDIA[kind]);
            if (!url) continue;
            const dims = kind === 'image' ? findDims(it) : null;
            return { done: true, kind, mediaId: String(it[0]), projectId: it[1] ?? null, sessionId: it[2] ?? null, url,
              width: dims?.[0] ?? null, height: dims?.[1] ?? null, creditsLeft };
          }
        }
      }
      // 没有网络记录时退一步：页面上新出现的媒体元素
      if (!Array.isArray(window.__hcNet)) {
        for (const el of document.querySelectorAll(kind === 'video' ? 'video[src*="flow-content.google/video/"]' : 'img[src*="flow-content.google/image/"]')) {
          const id = UUID.exec(el.src)?.[0];
          if (id && !skip.has(id) && el.getAttribute('alt') !== 'Ingredient image') return { done: true, kind, mediaId: id, url: el.src, creditsLeft };
        }
      }
      if (mark('approve', byText('Always approve in project'))) return { done: false, approval: true, creditsLeft };
      const why = refusal();
      if (why) return { done: false, refusal: why, creditsLeft };
      if (Date.now() >= until) return { done: false, creditsLeft };
      await sleep(800);
    }
  },
};

(window.__vcorpLoads ||= {}).flow = {
  version: __LOAD_VERSION__,
  async ready() {
    if (location.hostname !== 'flow.google.com') return { ok: false, reason: '不在 flow.google.com 上' };
    return { ok: true, netHook: Array.isArray(window.__hcNet) };
  },
  call(action, payload) {
    if (!ALLOWED.has(action) || !ACTIONS[action]) throw err('LOAD_DENIED', `flow 小脑不接受 ${action}`);
    return ACTIONS[action](payload || {});
  },
};
