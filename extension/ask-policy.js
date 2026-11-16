// 「交给 maker」的规矩 —— 纯函数，不碰 chrome.*，进 `npm test`
//
// 用户在网页上看到一条帖子、一件商品、一个视频，点一下（右键菜单、快捷键、帖子旁的 maker 图标），
// 写一句话，maker 就按这句话去办。这是配对通道上唯一一个「浏览器让云端开任务」的方向，
// 所以要防的是：**一个恶意网页替用户下命令**。防线只有一条，其余都是它的推论：
//
//   指令只从扩展自己的窗口（ask.html）来，网页碰不到那个窗口。
//
// - 网页（和跑在网页里的内容脚本）能给的只有「上下文」：链接、标题、作者、摘录。
//   上下文不是指令：这里把它裁成固定几个字段，服务器再裁一遍，并且原样标成「页面上的资料」。
// - 输入框不在页面里。它是一个独立的扩展窗口：页面的脚本进不去，盖不住它，也没法往里打字。
//   ask.html 不在 web_accessible_resources 里，网页既不能把它嵌进 iframe，也不能跳转过去。
// - 「发送」只认 ask.html 发来的消息（fromComposer），并且上下文按窗口里那个 id 从扩展自己的
//   存储里取，不从消息里取——内容脚本就算被页面利用，也发不出一条任务。
// - 页面里的图标只认真实的鼠标点击（isTrusted）；合成的 click 连输入窗口都打不开。
// - manifest 里没有 externally_connectable，网页不能直接给扩展发消息。

export const TEXT_MAX = 2000;
const URL_MAX = 1000;
const EXCERPT_MAX = 1500;

export function httpUrl(v) {
  try {
    const u = new URL(String(v || ''));
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    u.username = '';
    u.password = '';
    return u.href.length <= URL_MAX ? u.href : '';
  } catch {
    return '';
  }
}

const line = (v, max) => (typeof v === 'string' ? v : '').replace(/[\x00-\x1f\x7f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const block = (v, max) => (typeof v === 'string' ? v : '').replace(/\r\n?/g, '\n').replace(/[\x00-\x09\x0b-\x1f\x7f]+/g, ' ')
  .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);

export const cleanText = (v) => block(v, TEXT_MAX);

// 不管是谁给的上下文（右键菜单、快捷键、内容脚本），都只留这几个字段
export function cleanContext(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  const url = httpUrl(c.url);
  const page = httpUrl(c.page);
  return {
    url: url || page,
    page: url && page !== url ? page : '',
    media: httpUrl(c.media),
    title: line(c.title, 200),
    author: line(c.author, 80),
    excerpt: block(c.excerpt, EXCERPT_MAX),
  };
}

// 右键菜单：浏览器自己告诉我们点在了什么上（链接、图片、选中的字）。
// frameUrl 不用：iframe 里的广告不是用户在看的那一页。
export function menuContext(info = {}, tab = {}) {
  return cleanContext({
    url: info.linkUrl || '',
    page: tab.url || info.pageUrl || '',
    media: info.srcUrl || '',
    // 点在链接上时，页面的标题说的不是那个链接
    title: info.linkUrl ? '' : tab.title || '',
    excerpt: info.selectionText || '',
  });
}

// 「发送」只认输入窗口。sender.url 是浏览器填的，页面改不了。
export function fromComposer(sender, extId, composerUrl) {
  if (!sender || sender.id !== extId) return false;
  if (typeof sender.url !== 'string' || !composerUrl) return false;
  const bare = sender.url.split(/[?#]/)[0];
  return bare === composerUrl;
}

// 内容脚本发来的「打开输入窗口」：必须来自一个真实的标签页的顶层页面
export const fromPage = (sender, extId) => !!sender && sender.id === extId && !!sender.tab && sender.frameId === 0;

// 服务器回来的任务号只拿来拼自己那台服务器的地址，不当地址用
export function taskUrl(origin, chain) {
  return /^[A-Za-z0-9_-]{1,64}$/.test(String(chain || '')) && origin ? `${origin}/#chain-${chain}` : '';
}

// 能在上面交办的页面：普通网页。扩展页、chrome://、商店页不行。
export const askablePage = (url) => !!httpUrl(url);

// 输入窗口里给用户看的那一行：这句话是针对什么说的
export function describe(ctx) {
  const c = ctx || {};
  let host = '';
  try { host = new URL(c.url || c.page).hostname.replace(/^www\./, ''); } catch { /* 没有地址 */ }
  const what = c.author && c.title ? `${c.author}：${c.title}` : c.title || c.author || '';
  return { host, what, url: c.url || '', excerpt: c.excerpt || '', media: c.media || '' };
}

// ---------- 站点适配：常用网站上每一项旁边的 maker 图标 ----------
//
// 一条配置描述一个网站：哪种元素算「一项」、图标插在谁旁边、链接和文字从哪取。
// 只有选择器，没有代码——以后可以由服务器下发而不必发新版扩展。
// 选择器对不上时这个网站只是没有图标，右键菜单和快捷键照常能用。
//
//   hosts   这些域名（含子域名）上生效
//   item    一项的容器
//   anchor  图标插在这个元素前面（在 item 里找，按顺序取第一个找到的）
//   link    这一项自己的链接（a[href]），按顺序取第一个
//   linkRe  链接的 pathname 要满足的正则（排除头像、话题等别的链接）
//   title / author / text  取文字的选择器（可缺）
export const SITES = [
  {
    name: 'x',
    hosts: ['x.com', 'twitter.com'],
    item: 'article[data-testid="tweet"]',
    anchor: ['button[aria-label="Grok actions"]', '[data-testid="caret"]'],
    up: 1,   // 图标插在 anchor 往上第几层的前面：Grok 和三个点各包着一层 div，并排在同一行里
    link: ['a[href*="/status/"]:has(time)', 'a[href*="/status/"]'],
    linkRe: '^/[^/]+/status/\\d+',
    author: '[data-testid="User-Name"]',
    text: '[data-testid="tweetText"]',
  },
];

const hostMatches = (host, base) => host === base || host.endsWith(`.${base}`);

export function siteFor(url, sites = SITES) {
  let host = '';
  try { host = new URL(url).hostname.toLowerCase(); } catch { return null; }
  return sites.find((s) => s.hosts.some((h) => hostMatches(host, h))) || null;
}

// registerContentScripts 用的 matches
export const siteMatches = (sites = SITES) => [...new Set(sites.flatMap((s) => s.hosts.flatMap((h) => [`*://${h}/*`, `*://*.${h}/*`])))];
