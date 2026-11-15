// 「桥到底起没起来、没起来是为什么」——doctor 和 install 共用。
//
// 以前 doctor 拉桥失败只说一句「桥拉不起来，看 bridge.log」，可子进程
// 在写下第一行日志之前就死了的话，bridge.log 里什么都没有，用户拿着一个
// 空线索。这里把 spawn 的结果攥在手里：进程报错、退出码、它这一次往日志里
// 写了什么、端口是不是被别人占着，能说的都说出来。
import fs from 'node:fs';
import net from 'node:net';
import { readBridgeInfo, DEFAULT_PORT, LOCK_FILE, LOG_FILE } from './paths.js';
import { VERSION } from './version.js';
import { bridgeIsStale } from '../../extension/compat.js';
import { tryStartBridge, stopBridge } from './rpc.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'cli.js');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function pidAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function logSize() {
  try { return fs.statSync(LOG_FILE).size; } catch { return 0; }
}

function logSince(offset) {
  try {
    const buf = fs.readFileSync(LOG_FILE);
    return buf.subarray(Math.min(offset, buf.length)).toString('utf8').trim();
  } catch { return ''; }
}

// 端口上有没有东西在听。桥自己没写 bridge.json、端口却通，说明是别的程序
function portOpen(port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1');
    const done = (v) => { s.destroy(); resolve(v); };
    s.setTimeout(timeoutMs, () => done(false));
    s.once('connect', () => done(true));
    s.once('error', () => done(false));
  });
}

export function portHint(port = DEFAULT_PORT) {
  return process.platform === 'win32'
    ? `netstat -ano | findstr :${port}（最后一列是 pid，再用 tasklist /fi "pid eq <pid>" 看是谁）`
    : `lsof -i :${port}`;
}

// 返回 { alive, info, replaced?, failure? }。
// failure = { reason, lines: [...] }：给人读的原因，每行一句，调用方原样打印。
export async function ensureBridgeUp({ waitMs = 6000, onNote = () => {} } = {}) {
  let info = readBridgeInfo();
  let replaced = null;
  if (info && pidAlive(info.pid)) {
    if (!bridgeIsStale(info.version, VERSION)) return { alive: true, info };
    onNote(`在跑的桥是 v${info.version}（pid ${info.pid}），这个客户端是 v${VERSION}。老桥不读新代码，换掉再探…`);
    const pid = info.pid;
    stopBridge(info);
    const until = Date.now() + 4000;
    while (Date.now() < until && pidAlive(pid)) await sleep(100);
    replaced = info.version;
  } else {
    onNote(`桥没在跑${info ? `（bridge.json 记着的 pid ${info.pid} 已经没了）` : ''}，先拉起来再探…`);
  }

  const offset = logSize();
  const sp = tryStartBridge();
  const until = Date.now() + waitMs;
  while (Date.now() < until) {
    await sleep(300);
    info = readBridgeInfo();
    if (info?.pid && pidAlive(info.pid) && !(replaced && info.version === replaced)) {
      return { alive: true, info, replaced };
    }
    if (sp && (sp.exit || sp.error)) break; // 子进程已经死了，不必干等
  }
  return { alive: false, info: null, replaced, failure: await explain(sp, offset) };
}

async function explain(sp, offset) {
  const lines = [];
  let reason;
  const fresh = logSince(offset);
  if (!sp) {
    reason = '另一个进程正拿着启动锁在拉桥，等它超时了';
    lines.push(`锁文件 ${LOCK_FILE}${fs.existsSync(LOCK_FILE) ? ' 还在' : ' 已释放'}。过 30 秒再跑一次；一直这样就删掉它`);
  } else if (sp.error) {
    reason = `启动子进程失败：${sp.error.code || ''} ${sp.error.message}`.trim();
    lines.push(`命令：${process.execPath} ${sp.args.join(' ')}`);
  } else if (sp.exit) {
    const { code, signal } = sp.exit;
    reason = code === 3
      ? `端口 ${DEFAULT_PORT} 被占用，新桥退出了（退出码 3）`
      : `桥进程 pid ${sp.pid} 一启动就退出了（${signal ? `信号 ${signal}` : `退出码 ${code}`}）`;
    if (code === 3 || await portOpen(DEFAULT_PORT)) lines.push(`看是谁占着端口：${portHint()}`);
  } else if (pidAlive(sp.pid)) {
    reason = `桥进程 pid ${sp.pid} 还活着，但 ${Math.round((Date.now() - sp.at) / 1000)} 秒内没写出 bridge.json`;
    if (await portOpen(DEFAULT_PORT)) lines.push(`端口 ${DEFAULT_PORT} 有东西在听，可能是别的程序：${portHint()}`);
  } else {
    // 没收到 exit 事件进程却没了：被外部杀掉（杀软、job object、沙箱）最常见
    reason = `桥进程 pid ${sp.pid} 没留下退出码就消失了，像是被外部结束（杀毒软件、终端关闭时连带结束、沙箱）`;
  }
  if (fresh) {
    lines.push('它这次写进 bridge.log 的内容：');
    for (const l of fresh.split(/\r?\n/).slice(-12)) lines.push('  ' + l);
  } else {
    lines.push(`bridge.log 这次一个字都没写（${LOG_FILE}）`);
  }
  lines.push(`手动前台跑一次能直接看到报错：node "${CLI}" bridge --foreground`);
  return { reason, lines };
}

// 以 agent 身份握一次手，问桥：扩展在不在线、几个实例、什么版本
export function probe(info, client = 'doctor') {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://127.0.0.1:${info.port}`);
    const t = setTimeout(() => { ws.close(); resolve({ ok: false, error: '超时' }); }, 3000);
    ws.onerror = () => { clearTimeout(t); resolve({ ok: false, error: '连接被拒' }); };
    ws.onopen = () => ws.send(JSON.stringify({ type: 'hello', role: 'agent', token: info.token, client, v: 1 }));
    ws.onmessage = (ev) => {
      clearTimeout(t);
      const m = JSON.parse(ev.data);
      ws.close();
      resolve(m.type === 'welcome'
        ? { ok: true, extensionOnline: m.extensionOnline, extensionVersion: m.extensionVersion, extensionProtocol: m.extensionProtocol, versionMismatch: m.versionMismatch, extensions: m.extensions || [] }
        : { ok: false, error: JSON.stringify(m) });
    };
  });
}
