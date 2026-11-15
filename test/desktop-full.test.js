// 桌面完全模式：shell / file / 分页（native-host/full.js），以及完全模式下 checkDesktop 不设闸
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runShell, fileOp, pageOut, pageRead, resolvePath, shellArgv } from '../native-host/full.js';
import { fullArgvOk } from '../native-host/host.js';
import { checkDesktop } from '../extension/desktop-policy.js';
import { CLOUD_CMDS, checkCommand } from '../extension/cloud-policy.js';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vcorp-full-'));

test('shell：跑得起来，退出码、stdout、中文都对', async () => {
  const cmd = process.platform === 'win32' ? 'Write-Output "你好"; exit 3' : 'echo 你好; exit 3';
  const r = await runShell({ command: cmd, cwd: tmp });
  assert.equal(r.ok, true);
  assert.equal(r.data.exitCode, 3);
  assert.match(r.data.stdout, /你好/);
  assert.equal(r.data.cwd, tmp);
});

test('shell：超时连进程树一起杀，空命令、未知壳、不存在的目录直接拒', async () => {
  const cmd = process.platform === 'win32' ? 'Start-Sleep -Seconds 20' : 'sleep 20';
  const r = await runShell({ command: cmd, timeout: 1000 });
  assert.equal(r.data.timedOut, true);
  assert.equal((await runShell({ command: '  ' })).error.code, 'BAD_PARAMS');
  assert.equal((await runShell({ command: 'x', shell: 'fish' })).error.code, 'BAD_PARAMS');
  assert.equal((await runShell({ command: 'x', cwd: path.join(tmp, 'nope') })).error.code, 'NOT_FOUND');
  assert.equal(shellArgv('x', 'cmd')[0], 'cmd.exe');
});

test('file：写、读、追加、列、移动、删一圈', async () => {
  const f = path.join(tmp, 'a', 'b.txt');
  assert.equal((await fileOp({ action: 'write', path: f, content: '第一行\n' })).ok, true);
  await fileOp({ action: 'write', path: f, content: '第二行\n', append: true });
  const rd = await fileOp({ action: 'read', path: f });
  assert.equal(rd.data.content, '第一行\n第二行\n');
  const part = await fileOp({ action: 'read', path: f, offset: 0, length: 3 });
  assert.equal(part.data.more, true);
  const ls = await fileOp({ action: 'list', path: tmp, depth: 3 });
  assert.ok(ls.data.items.some((x) => x.path === f && x.type === 'file'));
  const g = path.join(tmp, 'c.txt');
  assert.equal((await fileOp({ action: 'move', path: f, to: g })).ok, true);
  assert.equal((await fileOp({ action: 'stat', path: f })).error.code, 'NOT_FOUND');
  assert.equal((await fileOp({ action: 'delete', path: g })).data.deleted, true);
  assert.equal((await fileOp({ action: 'read', path: tmp })).error.code, 'IS_DIR');
  assert.equal((await fileOp({ action: 'zap', path: tmp })).error.code, 'BAD_PARAMS');
  assert.equal(resolvePath('~'), os.homedir());
});

test('分页：大回包落盘，一段段取回拼得回原样，取完即删', () => {
  const body = Buffer.from(JSON.stringify({ ok: true, data: 'x'.repeat(2_500_000) }));
  const { paged } = pageOut(body);
  const parts = [];
  let offset = 0;
  for (;;) {
    const { page } = pageRead(paged.id, offset);
    const b = Buffer.from(page.data, 'base64');
    parts.push(b);
    offset += b.length;
    if (page.done) break;
  }
  assert.ok(parts.length > 1);
  assert.deepEqual(Buffer.concat(parts), body);
  assert.equal(pageRead(paged.id, 0).error.code, 'NOT_FOUND');
  assert.equal(pageRead('../../etc', 0).error.code, 'BAD_PARAMS');
});

test('完全模式：checkDesktop 不认应用名单、浏览器窗口、headed，argv 只查形状', () => {
  const ctx = { channel: 'cloud', session: 'cloud-j1', full: true, lookup: () => null, windows: () => null };
  assert.ok(checkDesktop({ cmd: 'snapshot', app: 'powershell' }, ctx).argv.includes('--app=powershell'));
  assert.ok(checkDesktop({ cmd: 'screenshot', app: 'chrome' }, ctx));
  assert.ok(checkDesktop({ cmd: 'click', ref: '@sabcd1:e3', headed: true }, ctx).argv.includes('--headed'));
  // 不开完全模式，同样的命令照旧被挡
  assert.throws(() => checkDesktop({ cmd: 'snapshot', app: 'powershell' }, { ...ctx, full: false }), (e) => e.code === 'DESKTOP_DENIED');
  assert.equal(fullArgvOk(['drag', '--from=1,2']), true);
  assert.equal(fullArgvOk(['a\0b']), false);
  assert.equal(fullArgvOk([]), false);
});

test('云端命令表有 shell / file，缺参数在扩展这侧就拒', () => {
  for (const c of ['shell', 'file']) assert.ok(CLOUD_CMDS.has(c));
  const o = { hosts: [], origin: 'https://maker.vcorp.ai' };
  assert.throws(() => checkCommand('shell', {}, o), (e) => e.code === 'CLOUD_DENIED');
  assert.throws(() => checkCommand('file', { action: 'read' }, o), (e) => e.code === 'CLOUD_DENIED');
  assert.equal(checkCommand('shell', { command: 'dir' }, o).command, 'dir');
});

test.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
