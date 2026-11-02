// 原生消息宿主 ai.vcorp.desktop —— 云端通道够到桌面的唯一一段。
//
// Chrome 每次 sendNativeMessage 起一个本进程：stdin 进一条消息（4 字节小端长度 + JSON），
// stdout 回一条，Chrome 随即关管道。本进程只做两件事：
//   hello：报出这台电脑的桌面设备身份（和本机 MCP 用同一个 machineId，所以两条通道里是同一台设备）
//   run：把扩展审过的参数再审一遍，交给 agent-desktop，回它的信封
// 扩展那一侧已经过了 desktop-policy.js；这里再审是因为扩展本身也可能出错，
// 而真实输入（--headed）、截图、剪贴板读取这些不该因为一处疏漏就对云端打开。
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAgentDesktop, findBinary } from '../src/lib/desktop.js';
import { machineId, desktopDeviceId } from '../src/lib/paths.js';
import {
  DESKTOP_CMDS, REF_RE, filterWindows, checkObserved, recordOf, isBrowserMainTitle,
} from '../extension/desktop-policy.js';
import { VERSION } from '../src/lib/version.js';

// Chrome 收宿主回包的上限是 1MB，留出 JSON 外壳的余量
const REPLY_MAX = 1000 * 1000;
const IN_MAX = 1024 * 1024;

const OPTS = new Set([
  '--app', '--window-id', '--timeout-ms', '--role', '--name', '--text', '--nth', '--limit', '--property',
  '--timeout', '--window', '--direction', '--amount', '--session', '--root', '--expected-app',
]);
const FLAGS = new Set(['-i', '--compact', '--skeleton']);
const COMBO_RE = /^[a-z0-9][a-z0-9+_-]{0,39}$/i;
const SESSION_RE = /^--session=cloud-[\w-]{1,64}$/;

function denied(message) {
  return { ok: false, error: { code: 'DESKTOP_DENIED', message, disposition: { delivery: 'not_delivered', retry: 'safe' } } };
}

// 返回 null 表示合规，否则是拒绝原因
export function recheck(argv) {
  if (!Array.isArray(argv) || !argv.length || argv.length > 40) return 'argv 不合法';
  if (!argv.every((a) => typeof a === 'string' && a.length <= 20000 && !a.includes('\0'))) return 'argv 不合法';
  const spec = DESKTOP_CMDS[argv[0]];
  if (!spec || !spec.cloud) return `云端不能用 ${argv[0]}`;
  const cut = argv.indexOf('--');
  const head = cut < 0 ? argv.slice(1) : argv.slice(1, cut);
  let session = false;
  for (const a of head) {
    if (FLAGS.has(a) || REF_RE.test(a) || /^\d{1,6}$/.test(a)) continue;
    if (argv[0] === 'press' && COMBO_RE.test(a)) continue;
    const eq = a.indexOf('=');
    if (a.startsWith('--') && eq > 2 && OPTS.has(a.slice(0, eq))) {
      if (a.startsWith('--session=')) { if (!SESSION_RE.test(a)) return 'session 不合法'; session = true; }
      continue;
    }
    return `参数不在白名单里：${a.slice(0, 40)}`;
  }
  if (!session && !['list-apps', 'clipboard-set'].includes(argv[0])) return '缺少任务的 session';
  return null;
}

function readMessage() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    process.stdin.on('data', (b) => {
      chunks.push(b);
      size += b.length;
      if (size > IN_MAX + 4) reject(new Error('消息太大'));
      const buf = Buffer.concat(chunks);
      if (buf.length >= 4 && buf.length >= 4 + buf.readUInt32LE(0)) resolve(JSON.parse(buf.subarray(4, 4 + buf.readUInt32LE(0)).toString('utf8')));
    });
    process.stdin.on('end', () => reject(new Error('没有收到消息')));
  });
}

function reply(obj) {
  let body = Buffer.from(JSON.stringify(obj), 'utf8');
  if (body.length > REPLY_MAX) {
    body = Buffer.from(JSON.stringify({
      ok: false,
      error: {
        code: 'TOO_LARGE',
        message: `结果有 ${Math.round(body.length / 1024)}KB，超过原生消息 1MB 的上限`,
        suggestion: 'snapshot 加 skeleton:true 先看轮廓，再用 root 往某一块里钻',
        disposition: { delivery: 'unknown', retry: 'unsafe' },
      },
    }), 'utf8');
  }
  const len = Buffer.alloc(4);
  len.writeUInt32LE(body.length, 0);
  return new Promise((resolve) => process.stdout.write(Buffer.concat([len, body]), resolve));
}

async function main() {
  const msg = await readMessage();
  if (msg?.op === 'hello') {
    const machine = machineId();
    const probe = await runAgentDesktop(['list-apps'], { timeoutMs: 15000 });
    return reply({
      ok: true,
      device: { id: desktopDeviceId(machine), kind: 'desktop', machine, caps: { platform: process.platform, version: VERSION } },
      ready: !!probe.ok,
      ...(probe.ok ? {} : { error: probe.error }),
      binary: findBinary(),
    });
  }
  if (msg?.op === 'run') {
    const why = recheck(msg.argv);
    if (why) return reply(denied(why));
    const timeoutMs = Math.min(Math.max(Number(msg.timeoutMs) || 30000, 1000), 90000);
    const env = await runAgentDesktop(msg.argv, { timeoutMs });
    // 浏览器主窗口的标题和树不出这台电脑：扩展那侧也会滤，这里是第二道
    if (env.ok && msg.argv[0] === 'list-windows') env.data = filterWindows(env.data, 'cloud');
    if (env.ok && msg.argv[0] === 'snapshot') {
      const rec = recordOf(env.data);
      if (isBrowserMainTitle(rec?.window?.title)) return reply(denied('浏览器主窗口不出这台电脑'));
      try { checkObserved(rec); } catch (e) { return reply(denied(e.message)); }
    }
    return reply(env);
  }
  return reply(denied(`未知操作 ${String(msg?.op).slice(0, 20)}`));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(() => process.exit(0), async (e) => { await reply(denied(`宿主出错：${e.message}`)); process.exit(0); });
}
