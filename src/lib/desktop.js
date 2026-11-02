// 本机桌面执行器 —— 把 desktop 工具的一次调用变成一次 agent-desktop 子进程调用。
//
// agent-desktop 是无状态 CLI：每条命令一个进程、输出一个 JSON 信封（见它的 docs/json-output.md）。
// 这一层做四件事：找到二进制；每条命令先过 extension/desktop-policy.js；
// 记住每份快照属于哪个应用、哪个窗口（之后的 ref 命令对着它判）；把信封渲染成给模型看的短文本。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import {
  checkDesktop, checkObserved, recordOf, filterWindows, checkSteps, snapshotIdOf,
} from '../../extension/desktop-policy.js';
import { renderEnvelope } from '../../extension/desktop-render.js';

const require = createRequire(import.meta.url);

// npm 包 agent-desktop 自带各平台的二进制（bin/agent-desktop-<平台>-<架构>[.exe]）。
// 直接调平台二进制，不经它的 JS 启动器：少起一个 node 进程，每条命令省一两百毫秒。
export function findBinary() {
  if (process.env.AGENT_DESKTOP_BIN) return process.env.AGENT_DESKTOP_BIN;
  const name = `agent-desktop-${process.platform === 'win32' ? 'win32' : process.platform}-${process.arch}${process.platform === 'win32' ? '.exe' : ''}`;
  try {
    const dir = path.dirname(require.resolve('agent-desktop/package.json'));
    const p = path.join(dir, 'bin', name);
    if (fs.existsSync(p)) return p;
  } catch { /* 没装这个依赖，退到 PATH */ }
  return process.platform === 'win32' ? 'agent-desktop.exe' : 'agent-desktop';
}

const OUT_MAX = 8 * 1024 * 1024;

// 跑一次，返回信封。不经 shell：参数数组原样交给进程，没有拼接、没有转义问题。
export function runAgentDesktop(argv, { bin = findBinary(), timeoutMs = 30000 } = {}) {
  return new Promise((resolve) => {
    let out = '';
    let errText = '';
    let done = false;
    const finish = (env) => { if (!done) { done = true; clearTimeout(timer); resolve(env); } };
    let child;
    try {
      child = spawn(bin, argv, { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      finish(fail('DESKTOP_UNAVAILABLE', `起不来 agent-desktop（${bin}）：${e.message}`));
      return;
    }
    const timer = setTimeout(() => {
      child.kill();
      finish(fail('TIMEOUT', `agent-desktop ${Math.round(timeoutMs / 1000)}s 没有回音，结果不明。先 snapshot 看现状，别直接重做。`, 'unknown'));
    }, timeoutMs);
    child.stdout.on('data', (b) => { if (out.length < OUT_MAX) out += b; });
    child.stderr.on('data', (b) => { if (errText.length < 4000) errText += b; });
    child.on('error', (e) => finish(fail('DESKTOP_UNAVAILABLE',
      e.code === 'ENOENT' ? '这台电脑上没有 agent-desktop。运行 npx vcorp-chrome doctor 看怎么装。' : e.message)));
    child.on('close', () => {
      const line = out.trim().split('\n').filter(Boolean).at(-1) || '';
      try { finish(JSON.parse(line)); } catch {
        finish(fail('INTERNAL', `agent-desktop 的输出不是 JSON：${(line || errText).slice(0, 300)}`, 'unknown'));
      }
    });
  });
}

function fail(code, message, delivery = 'not_delivered') {
  return { ok: false, error: { code, message, disposition: { delivery, retry: delivery === 'not_delivered' ? 'safe' : 'unknown' } } };
}

// ---------- 会话 ----------

const SNAPS_MAX = 64;

// 一个 vcorp 会话（一个 MCP server 进程）一个实例。快照户口只活在内存里：
// 进程没了户口也没了，那时 ref 命令会被要求重新 snapshot——宁可多拍一次，也不认来路不明的 ref。
export class DesktopSession {
  constructor({ session, channel = 'local', bin = findBinary(), run = runAgentDesktop } = {}) {
    this.session = String(session || 'vcorp').replace(/[^\w-]/g, '-').slice(0, 64);
    this.channel = channel;
    this.bin = bin;
    this.runner = run;
    this.snaps = new Map();
    this.windows = new Map();
  }

  remember(rec) {
    this.snaps.delete(rec.id);
    this.snaps.set(rec.id, rec);
    while (this.snaps.size > SNAPS_MAX) this.snaps.delete(this.snaps.keys().next().value);
  }

  async refreshWindows() {
    const env = await this.runner(['list-windows'], { bin: this.bin, timeoutMs: 15000 });
    if (env?.ok && Array.isArray(env.data)) {
      for (const w of env.data) this.windows.set(w.id, { app: w.app_name, title: w.title || '' });
    }
    return env;
  }

  ctx() {
    return {
      channel: this.channel,
      session: this.session,
      lookup: (id) => this.snaps.get(id) || null,
      windows: (id) => this.windows.get(id) || null,
    };
  }

  // 一条命令。返回 { text, image?, env, sensitive }。策略不过直接抛（code 在 e.code 上）。
  async run(params, { timeoutMs = 30000, allowSensitive = true } = {}) {
    if (params?.steps !== undefined) return this.steps(params.steps, { timeoutMs });
    if (params?.window && !this.windows.has(String(params.window))) await this.refreshWindows();
    const chk = checkDesktop(params, this.ctx());
    if (chk.sensitive === 'pay') {
      throw Object.assign(new Error(`「${chk.target?.name}」像是要花钱的按钮。桌面能力不代做付款，请用户亲手点。`), { code: 'PAY_REFUSED' });
    }
    if (chk.sensitive && !allowSensitive) {
      throw Object.assign(new Error(`「${chk.target?.name}」是发送/删除一类的动作，批处理不代做。单独调用一次 desktop ${chk.cmd}。`), { code: 'NEEDS_SINGLE_CALL' });
    }
    let shot = null;
    if (chk.cmd === 'screenshot') {
      shot = path.join(os.tmpdir(), `vcorp-desktop-${process.pid}-${Date.now()}.png`);
      chk.argv.push(shot);
    }
    const env = await this.runner(chk.argv, { bin: this.bin, timeoutMs });

    if (env?.ok && (chk.cmd === 'snapshot' || chk.cmd === 'find')) {
      const rec = recordOf(env.data);
      if (rec && !rec.app) rec.app = chk.app;
      if (rec && !rec.window && env.data.window) rec.window = env.data.window;
      if (chk.cmd === 'snapshot') checkObserved(rec);
      if (rec) {
        const prev = chk.cmd === 'find' ? this.snaps.get(rec.id) : null;
        this.remember(prev ? { ...prev, refs: { ...prev.refs, ...rec.refs } } : rec);
      }
    }
    if (env?.ok && chk.cmd === 'list-windows') {
      for (const w of env.data || []) this.windows.set(w.id, { app: w.app_name, title: w.title || '' });
      env.data = filterWindows(env.data, this.channel);
    }
    let image = null;
    if (shot) {
      try { image = fs.readFileSync(shot).toString('base64'); } catch { /* 截图失败时信封里有原因 */ }
      fs.rmSync(shot, { force: true });
    }
    return { text: renderEnvelope(chk.cmd, env, { target: chk.target }), image, env, cmd: chk.cmd, app: chk.app, sensitive: chk.sensitive };
  }

  // 一串步骤：每步过同一套检查，任何一步失败或碰到敏感动作就停，讲清做到哪、为什么停
  async steps(list, { timeoutMs = 30000 } = {}) {
    checkSteps(list);
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const st = list[i];
      let r;
      try {
        r = await this.run(st, { timeoutMs, allowSensitive: false });
      } catch (e) {
        out.push(`⏸ 第 ${i + 1}/${list.length} 步 ${st.cmd}：${e.message}`);
        out.push(`剩下 ${list.length - i - 1} 步没做。`);
        return { text: out.join('\n'), stopped: true };
      }
      out.push(`— ${i + 1}/${list.length} ${st.cmd}\n${r.text}`);
      if (!r.env?.ok) {
        out.push(`⏸ 停在第 ${i + 1} 步，剩下 ${list.length - i - 1} 步没做。`);
        return { text: out.join('\n'), stopped: true };
      }
    }
    return { text: out.join('\n\n') };
  }
}

export { snapshotIdOf };
