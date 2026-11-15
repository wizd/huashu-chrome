// 桌面完全模式 —— 云端任务在这台电脑上拿到和本机 agent（goose 一类）一样的能力：
// 跑命令、读写任意文件、agent-desktop 的全部命令。
//
// 只有用户在本机运行过 `vcorp-chrome desktop full on` 才开（见 paths.js 的 fullMode），
// 原生宿主每条命令都现读开关。这一层不做「哪个能碰」的判断——那是第二阶段安全方案的事。
//
// 原生消息回包上限 1MB：大结果先落到临时文件，扩展再用 page 一段一段取回（见 pageOut / pageRead）。
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT_MAX = 4 * 1024 * 1024;          // shell 的 stdout / stderr 各留这么多
const SHELL_TIMEOUT_MAX = 7 * 60 * 1000;  // 服务器那边一条命令等 8 分钟
export const FILE_READ_MAX = 16 * 1024 * 1024;
const LIST_MAX = 2000;

const fail = (code, message) => ({ ok: false, error: { code, message, disposition: { delivery: 'not_delivered', retry: 'safe' } } });

// ~ 和相对路径都从用户主目录算起
export function resolvePath(p) {
  const s = String(p ?? '').trim();
  if (!s || s.includes('\0')) return '';
  if (s === '~') return os.homedir();
  if (s.startsWith('~/') || s.startsWith('~\\')) return path.join(os.homedir(), s.slice(2));
  return path.resolve(os.homedir(), s);
}

// 用哪个壳。Windows 默认 PowerShell，并把输出编码钉成 UTF-8，中文不乱码。
export function shellArgv(command, which = '') {
  const win = process.platform === 'win32';
  const sh = String(which || (win ? 'powershell' : 'sh')).toLowerCase();
  if (sh === 'powershell' || sh === 'pwsh') {
    const exe = sh === 'pwsh' ? 'pwsh' : win ? 'powershell.exe' : 'pwsh';
    const pre = '[Console]::OutputEncoding=[Text.Encoding]::UTF8;$OutputEncoding=[Text.Encoding]::UTF8;$ProgressPreference="SilentlyContinue";';
    return [exe, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', pre + command]];
  }
  if (sh === 'cmd') return ['cmd.exe', ['/d', '/s', '/c', `chcp 65001 >nul & ${command}`]];
  if (sh === 'bash') return ['bash', ['-lc', command]];
  if (sh === 'sh') return ['/bin/sh', ['-c', command]];
  return null;
}

export function runShell(p = {}) {
  const command = String(p.command ?? '');
  if (!command.trim()) return Promise.resolve(fail('BAD_PARAMS', 'shell 要给 command'));
  const argv = shellArgv(command, p.shell);
  if (!argv) return Promise.resolve(fail('BAD_PARAMS', 'shell 只认 powershell / pwsh / cmd / bash / sh'));
  const cwd = p.cwd ? resolvePath(p.cwd) : os.homedir();
  if (!cwd || !fs.existsSync(cwd)) return Promise.resolve(fail('NOT_FOUND', `没有这个目录：${String(p.cwd).slice(0, 200)}`));
  const timeoutMs = Math.min(Math.max(Number(p.timeout) || 60000, 1000), SHELL_TIMEOUT_MAX);
  const env = { ...process.env, ...(p.env && typeof p.env === 'object' ? Object.fromEntries(Object.entries(p.env).map(([k, v]) => [k, String(v)])) : {}) };

  return new Promise((resolve) => {
    const started = Date.now();
    const out = { stdout: [], stderr: [], n: { stdout: 0, stderr: 0 }, cut: false };
    let timedOut = false;
    let child;
    try {
      child = spawn(argv[0], argv[1], { cwd, env, windowsHide: true, stdio: [p.stdin !== undefined ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
    } catch (e) {
      resolve(fail('SPAWN_FAILED', e.message));
      return;
    }
    const keep = (which) => (b) => {
      if (out.n[which] >= OUT_MAX) { out.cut = true; return; }
      const room = OUT_MAX - out.n[which];
      const part = b.length > room ? b.subarray(0, room) : b;
      if (part.length < b.length) out.cut = true;
      out[which].push(part);
      out.n[which] += part.length;
    };
    child.stdout.on('data', keep('stdout'));
    child.stderr.on('data', keep('stderr'));
    if (p.stdin !== undefined) { child.stdin.on('error', () => {}); child.stdin.end(String(p.stdin)); }
    const timer = setTimeout(() => {
      timedOut = true;
      // Windows 上 kill 只杀壳本身，它起的子进程还在；taskkill /t 连树一起收
      if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' }).on('error', () => {});
      else child.kill('SIGKILL');
    }, timeoutMs);
    child.on('error', (e) => { clearTimeout(timer); resolve(fail(e.code === 'ENOENT' ? 'NOT_FOUND' : 'SPAWN_FAILED', `${argv[0]}：${e.message}`)); });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({
        ok: true,
        data: {
          exitCode: code, signal: signal || null, timedOut, truncated: out.cut, ms: Date.now() - started, cwd,
          stdout: Buffer.concat(out.stdout).toString('utf8'),
          stderr: Buffer.concat(out.stderr).toString('utf8'),
        },
      });
    });
  });
}

function statOf(abs, st) {
  return {
    path: abs,
    type: st.isDirectory() ? 'dir' : st.isSymbolicLink() ? 'link' : st.isFile() ? 'file' : 'other',
    size: st.size,
    mtime: st.mtime.toISOString(),
  };
}

export async function fileOp(p = {}) {
  const action = String(p.action || '');
  const abs = resolvePath(p.path);
  if (!abs) return fail('BAD_PARAMS', 'file 要给 path');
  const fsp = fs.promises;
  try {
    switch (action) {
      case 'stat':
        return { ok: true, data: statOf(abs, await fsp.lstat(abs)) };
      case 'list': {
        const depth = Math.min(Math.max(Math.floor(Number(p.depth) || 1), 1), 6);
        const items = [];
        let more = false;
        const walk = async (dir, d) => {
          let ents;
          try { ents = await fsp.readdir(dir, { withFileTypes: true }); } catch (e) { if (dir === abs) throw e; return; }
          for (const e of ents) {
            if (items.length >= LIST_MAX) { more = true; return; }
            const full = path.join(dir, e.name);
            let st = null;
            try { st = await fsp.lstat(full); } catch { /* 刚被删、没权限 */ }
            items.push(st ? statOf(full, st) : { path: full, type: 'unknown' });
            if (e.isDirectory() && d < depth) await walk(full, d + 1);
          }
        };
        await walk(abs, 1);
        return { ok: true, data: { path: abs, items, more } };
      }
      case 'read': {
        const st = await fsp.stat(abs);
        if (st.isDirectory()) return fail('IS_DIR', `${abs} 是目录：用 action:"list"`);
        const offset = Math.max(Math.floor(Number(p.offset) || 0), 0);
        const length = Math.min(Math.max(Math.floor(Number(p.length) || FILE_READ_MAX), 0), FILE_READ_MAX);
        const fh = await fsp.open(abs, 'r');
        try {
          const buf = Buffer.alloc(Math.min(length, Math.max(st.size - offset, 0)));
          const { bytesRead } = await fh.read(buf, 0, buf.length, offset);
          const body = buf.subarray(0, bytesRead);
          const enc = p.encoding === 'base64' ? 'base64' : 'utf8';
          return { ok: true, data: { path: abs, size: st.size, offset, bytes: bytesRead, more: offset + bytesRead < st.size, encoding: enc, content: body.toString(enc) } };
        } finally { await fh.close(); }
      }
      case 'write': {
        if (p.content === undefined) return fail('BAD_PARAMS', 'write 要给 content');
        const buf = Buffer.from(String(p.content), p.encoding === 'base64' ? 'base64' : 'utf8');
        await fsp.mkdir(path.dirname(abs), { recursive: true });
        if (p.append) await fsp.appendFile(abs, buf); else await fsp.writeFile(abs, buf);
        return { ok: true, data: { path: abs, bytes: buf.length, appended: !!p.append } };
      }
      case 'mkdir':
        await fsp.mkdir(abs, { recursive: true });
        return { ok: true, data: { path: abs } };
      case 'delete':
        await fsp.rm(abs, { recursive: !!p.recursive, force: false });
        return { ok: true, data: { path: abs, deleted: true } };
      case 'move':
      case 'copy': {
        const to = resolvePath(p.to);
        if (!to) return fail('BAD_PARAMS', `${action} 要给 to`);
        await fsp.mkdir(path.dirname(to), { recursive: true });
        if (action === 'move') await fsp.rename(abs, to);
        else await fsp.cp(abs, to, { recursive: true, force: !!p.overwrite, errorOnExist: !p.overwrite });
        return { ok: true, data: { from: abs, to } };
      }
      default:
        return fail('BAD_PARAMS', 'file 的 action 只认 stat / list / read / write / mkdir / delete / move / copy');
    }
  } catch (e) {
    const code = { ENOENT: 'NOT_FOUND', EACCES: 'PERM_DENIED', EPERM: 'PERM_DENIED', EEXIST: 'EXISTS', ENOTEMPTY: 'NOT_EMPTY', EISDIR: 'IS_DIR' }[e.code] || 'FS_ERROR';
    return fail(code, `${e.code || ''} ${e.message}`.trim());
  }
}

// ---------- 分页 ----------
//
// 宿主 → Chrome 一条最多 1MB。超出的回包整份写进临时目录，先回 { paged }，
// 扩展再一段一段 page 取回、拼好再解析。最后一段取走时删文件；没取完的十分钟后清掉。

const PAGE_DIR = path.join(os.tmpdir(), 'vcorp-desktop-pages');
const PAGE_RAW = 600 * 1024;   // 每段原始字节，base64 后约 800KB
const PAGE_TTL_MS = 10 * 60 * 1000;
const PAGE_ID_RE = /^[a-f0-9]{24}$/;

export function pageOut(body) {
  fs.mkdirSync(PAGE_DIR, { recursive: true });
  const now = Date.now();
  for (const f of fs.readdirSync(PAGE_DIR)) {
    try { if (now - fs.statSync(path.join(PAGE_DIR, f)).mtimeMs > PAGE_TTL_MS) fs.rmSync(path.join(PAGE_DIR, f), { force: true }); } catch { /* 别的进程在删 */ }
  }
  const id = crypto.randomBytes(12).toString('hex');
  fs.writeFileSync(path.join(PAGE_DIR, `${id}.json`), body, { mode: 0o600 });
  return { ok: true, paged: { id, size: body.length, chunk: PAGE_RAW } };
}

export function pageRead(id, offset) {
  if (!PAGE_ID_RE.test(String(id))) return fail('BAD_PARAMS', 'page id 不合法');
  const file = path.join(PAGE_DIR, `${id}.json`);
  let fd;
  try { fd = fs.openSync(file, 'r'); } catch { return fail('NOT_FOUND', '这一页已经过期或取完了'); }
  try {
    const size = fs.fstatSync(fd).size;
    const at = Math.max(Math.floor(Number(offset) || 0), 0);
    const buf = Buffer.alloc(Math.max(Math.min(PAGE_RAW, size - at), 0));
    const n = fs.readSync(fd, buf, 0, buf.length, at);
    const done = at + n >= size;
    fs.closeSync(fd);
    fd = null;
    if (done) fs.rmSync(file, { force: true });
    return { ok: true, page: { offset: at, data: buf.subarray(0, n).toString('base64'), done } };
  } finally { if (fd !== null && fd !== undefined) fs.closeSync(fd); }
}
