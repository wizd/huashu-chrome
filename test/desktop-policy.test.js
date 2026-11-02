// 桌面能力的规矩与设备路由 —— 不需要桌面，进 `npm test`
//
// desktop-policy.js 是「agent 能碰桌面上哪些东西」的全部答案，device.js 是「命令落到哪台设备」。
// 每一条对应一种真实的风险：从 Chrome 的 UIA 树里点钱包和 vcorp 侧栏、替用户点浏览器的
// 任务批准通知、一段文字被当成命令行开关、云端操作终端、拿别的会话的 ref 来点。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkDesktop, checkObserved, recordOf, filterWindows, checkSteps, cleanApps, appsToAsk, sensitivity, STEPS_MAX,
} from '../extension/desktop-policy.js';
import { resolveTarget, routeHere, stampFrom, cleanDevice, capOf } from '../extension/device.js';
import { DesktopSession } from '../src/lib/desktop.js';
import { recheck } from '../native-host/host.js';
import { CLOUD_CMDS, checkCommand } from '../extension/cloud-policy.js';
import { extensionId } from '../src/lib/native-install.js';

const denied = (fn, code = 'DESKTOP_DENIED') => assert.throws(fn, (e) => e.code === code);

const node = (role, name, ref, extra = {}) => ({ role, name, ...(ref ? { ref_id: ref } : {}), ...extra });

// Chrome 主窗口：地址栏旁的钱包按钮、vcorp 侧栏的「断开并忘记这个服务器」都在树里
const chromeMain = recordOf({
  snapshot_id: 'schrome01', app: 'chrome.exe', window: { id: 'w-1', title: 'VCorp - Google Chrome' },
  tree: node('window', 'VCorp - Google Chrome', null, { children: [
    node('button', 'MetaMask', '@schrome01:e1'),
    node('button', '断开并忘记这个服务器', '@schrome01:e2'),
  ] }),
});

// 浏览器弹出的系统打开对话框：文件名框 1148、打开按钮 1
const fileDialog = recordOf({
  snapshot_id: 'sdialog01', app: 'chrome.exe', window: { id: 'w-2', title: '打开' },
  tree: node('dialog', '打开', null, { children: [
    node('textfield', '文件名(N):', '@sdialog01:e1', { native_id: { value: '1148' } }),
    node('button', '打开(O)', '@sdialog01:e2', { native_id: { value: '1' } }),
  ] }),
});

const notepad = recordOf({
  snapshot_id: 'snote01', app: 'notepad.exe', window: { id: 'w-3', title: '无标题 - 记事本' },
  tree: node('window', '记事本', null, { children: [
    node('textfield', '文本编辑器', '@snote01:e1'),
    node('button', '删除', '@snote01:e2'),
    node('button', '立即支付', '@snote01:e3'),
  ] }),
});

const recs = { schrome01: chromeMain, sdialog01: fileDialog, snote01: notepad };
const windows = {
  'w-1': { app: 'chrome.exe', title: 'VCorp - Google Chrome' },
  'w-2': { app: 'chrome.exe', title: '打开' },
  'w-3': { app: 'notepad.exe', title: '无标题 - 记事本' },
};
const ctx = (o = {}) => ({ channel: 'local', session: 'vc-test', lookup: (id) => recs[id] || null, windows: (id) => windows[id] || null, ...o });

test('浏览器主窗口整个不碰：快照、点它树里的按钮、按键都拒绝', () => {
  denied(() => checkDesktop({ cmd: 'snapshot', app: 'chrome.exe' }, ctx()));
  denied(() => checkDesktop({ cmd: 'snapshot', window: 'w-1' }, ctx()));
  denied(() => checkDesktop({ cmd: 'click', ref: '@schrome01:e1' }, ctx()));
  denied(() => checkDesktop({ cmd: 'press', keys: 'ctrl+w', app: 'msedge' }, ctx()));
  // 拍回来的树不是文件对话框，整份作废
  denied(() => checkObserved(chromeMain));
});

test('浏览器弹出的文件对话框放行：先按窗口拍，认出控件组之后能填能点', () => {
  const pre = checkDesktop({ cmd: 'snapshot', window: 'w-2' }, ctx());
  assert.deepEqual(pre.argv.slice(0, 2), ['snapshot', '--window-id=w-2']);
  checkObserved(fileDialog);
  const t = checkDesktop({ cmd: 'set-value', ref: '@sdialog01:e1', value: 'C:\\a.png' }, ctx());
  assert.deepEqual(t.argv, ['set-value', '@sdialog01:e1', '--session=vc-test', '--', 'C:\\a.png']);
  assert.equal(checkDesktop({ cmd: 'click', ref: '@sdialog01:e2' }, ctx()).sensitive, null);
});

test('用户给的文字不会变成命令行开关', () => {
  const t = checkDesktop({ cmd: 'type', ref: '@snote01:e1', text: '--headed' }, ctx({ channel: 'cloud', apps: ['notepad'] }));
  assert.ok(!t.argv.slice(0, t.argv.indexOf('--')).includes('--headed'));
  assert.equal(t.argv.at(-1), '--headed');
  const f = checkDesktop({ cmd: 'find', app: 'notepad.exe', name: '--session=other' }, ctx());
  assert.ok(f.argv.includes('--name=--session=other'));
  assert.ok(f.argv.includes('--session=vc-test'));
  denied(() => checkDesktop({ cmd: 'press', app: 'notepad.exe', keys: '-h' }, ctx()));
  denied(() => checkDesktop({ cmd: 'press', app: 'notepad.exe', keys: 'ctrl+s --force' }, ctx()));
  denied(() => checkDesktop({ cmd: 'snapshot', window: 'w-1 --headed' }, ctx()));
});

test('ref 必须来自本会话拍过的快照，且是完整形式', () => {
  denied(() => checkDesktop({ cmd: 'click', ref: 'e2' }, ctx()));
  denied(() => checkDesktop({ cmd: 'click', ref: '@sother99:e1' }, ctx()));
  denied(() => checkDesktop({ cmd: 'snapshot', window: 'w-999' }, ctx()));
});

test('付款类目标识别为 pay，发送/删除识别为 sensitive', () => {
  assert.equal(checkDesktop({ cmd: 'click', ref: '@snote01:e3' }, ctx()).sensitive, 'pay');
  assert.equal(checkDesktop({ cmd: 'click', ref: '@snote01:e2' }, ctx()).sensitive, 'sensitive');
  assert.equal(checkDesktop({ cmd: 'get', ref: '@snote01:e3' }, ctx()).sensitive, null);
  assert.equal(sensitivity('Send'), 'sensitive');
  assert.equal(sensitivity('打开'), null);
});

test('浏览器发出的通知不能替用户点：任务批准和付款确认都在那里', () => {
  denied(() => checkDesktop({ cmd: 'notification-action', app: 'Google Chrome', index: 1, action: '允许' }, ctx()));
  denied(() => checkDesktop({ cmd: 'notification-action', app: 'vcorp-chrome', index: 1, action: '允许' }, ctx()));
  const ok = checkDesktop({ cmd: 'notification-action', app: 'Slack', index: 2, action: 'Reply' }, ctx());
  assert.deepEqual(ok.argv.slice(-2), ['--', 'Reply']);
});

test('密码管理器两条通道都不碰；终端、注册表只有云端不碰', () => {
  denied(() => checkDesktop({ cmd: 'snapshot', app: '1Password.exe' }, ctx()));
  denied(() => checkDesktop({ cmd: 'snapshot', app: 'Bitwarden' }, ctx({ channel: 'cloud', apps: ['bitwarden'] })));
  denied(() => checkDesktop({ cmd: 'snapshot', app: 'powershell.exe' }, ctx({ channel: 'cloud', apps: ['powershell'] })));
  denied(() => checkDesktop({ cmd: 'launch', app: 'regedit' }, ctx({ channel: 'cloud', apps: ['regedit'] })));
  assert.equal(checkDesktop({ cmd: 'snapshot', app: 'powershell.exe' }, ctx()).cmd, 'snapshot');
});

test('云端：没批准的应用不碰，不能用真实输入、截图、剪贴板读取、通知', () => {
  const cloud = ctx({ channel: 'cloud', apps: ['notepad'] });
  denied(() => checkDesktop({ cmd: 'snapshot', app: 'Weixin.exe' }, cloud), 'APP_NOT_APPROVED');
  assert.equal(checkDesktop({ cmd: 'snapshot', app: 'Notepad.exe' }, cloud).app, 'Notepad.exe');
  denied(() => checkDesktop({ cmd: 'click', ref: '@snote01:e1', headed: true }, cloud));
  for (const cmd of ['screenshot', 'clipboard-get', 'list-notifications', 'focus-window']) {
    denied(() => checkDesktop({ cmd, app: 'notepad.exe' }, cloud));
  }
  denied(() => checkDesktop({ cmd: 'list-windows' }, cloud));
});

test('list-windows：云端看不到浏览器主窗口的标题，本机看得到但标成不可操作', () => {
  const list = [
    { id: 'w-1', app_name: 'chrome.exe', title: '网银 - Google Chrome' },
    { id: 'w-2', app_name: 'chrome.exe', title: '打开' },
    { id: 'w-3', app_name: 'notepad.exe', title: '记事本' },
    { id: 'w-4', app_name: 'powershell.exe', title: 'PS' },
  ];
  assert.deepEqual(filterWindows(list, 'cloud').map((w) => w.id), ['w-2', 'w-3']);
  const local = filterWindows(list, 'local');
  assert.equal(local.length, 4);
  assert.ok(local[0].blocked);
  assert.ok(!local[1].blocked && !local[3].blocked);
});

test('steps：非空、有上限、不嵌套、只认表里的命令', () => {
  denied(() => checkSteps([]));
  denied(() => checkSteps(Array.from({ length: STEPS_MAX + 1 }, () => ({ cmd: 'list-apps' }))));
  denied(() => checkSteps([{ cmd: 'list-apps', steps: [] }]));
  denied(() => checkSteps([{ cmd: 'rm' }]));
});

test('云端申请应用：浏览器和黑名单应用申请不了，重复的合并', () => {
  const { apps, bad } = cleanApps(['Weixin.exe', 'weixin', 'chrome', 'cmd.exe', 'Notepad']);
  assert.deepEqual(apps, ['weixin', 'notepad']);
  assert.deepEqual(bad, ['chrome', 'cmd.exe']);
  assert.deepEqual(appsToAsk(['weixin', 'notepad', 'excel'], { apps: ['weixin'], refused: ['excel'] }), { ask: ['notepad'], covered: ['weixin'] });
});

test('执行器：付款按钮拒绝；批处理里碰到发送/删除就停，后面的步骤不做', async () => {
  const calls = [];
  const fake = async (argv) => {
    calls.push(argv);
    if (argv[0] === 'list-windows') return { ok: true, data: [] };
    return { ok: true, data: { disposition: { delivery: 'delivered_verified', retry: 'unsafe' } } };
  };
  const s = new DesktopSession({ session: 'vc-test', bin: 'x', run: fake });
  s.remember(notepad);
  await assert.rejects(s.run({ cmd: 'click', ref: '@snote01:e3' }), (e) => e.code === 'PAY_REFUSED');
  const r = await s.run({ steps: [
    { cmd: 'type', ref: '@snote01:e1', text: 'hi' },
    { cmd: 'click', ref: '@snote01:e2' },
    { cmd: 'press', app: 'notepad.exe', keys: 'ctrl+s' },
  ] });
  assert.equal(r.stopped, true);
  assert.deepEqual(calls.map((a) => a[0]), ['type']);
});

test('原生宿主二审：扩展那侧漏了，真实输入、截图、陌生开关、别的会话照样过不去', () => {
  assert.equal(recheck(['list-windows', '--app=notepad', '--session=cloud-j1']), null);
  assert.equal(recheck(['type', '@snote01:e1', '--session=cloud-j1', '--', '--headed']), null);
  assert.equal(recheck(['press', 'ctrl+s', '--app=notepad', '--session=cloud-j1']), null);
  assert.match(recheck(['click', '@snote01:e1', '--headed', '--session=cloud-j1']), /白名单/);
  assert.match(recheck(['press', 'ctrl+s', '--force', '--app=x', '--session=cloud-j1']), /白名单/);
  assert.match(recheck(['screenshot', '--app=notepad', '--session=cloud-j1']), /云端不能用/);
  assert.match(recheck(['clipboard-get']), /云端不能用/);
  assert.match(recheck(['find', '--app=x', '--name=y', '--session=vc-local']), /session/);
  assert.match(recheck(['find', '--app=x', '--name=y']), /session/);
  assert.match(recheck(['find', '--app', 'x', '--session=cloud-j1']), /白名单/);
});

test('宿主清单只放行本扩展：扩展 id 由 manifest 的 key 算出', () => {
  // Chrome 文档里的算法：公钥 sha256 的前 32 个十六进制位映射到 a-p
  const id = extensionId(Buffer.from('test-key').toString('base64'));
  assert.match(id, /^[a-p]{32}$/);
  assert.equal(id, extensionId(Buffer.from('test-key').toString('base64')));
});

test('云端命令表：desktop / apps 可用，apps 申请过滤掉浏览器和终端', () => {
  for (const cmd of ['desktop', 'apps', 'devices']) assert.ok(CLOUD_CMDS.has(cmd), cmd);
  const p = checkCommand('apps', { add: ['Weixin.exe', 'powershell', 'msedge'], reason: '  回 消息 ' }, { hosts: [], origin: 'https://maker.vcorp.ai' });
  assert.deepEqual(p.add, ['weixin']);
  assert.deepEqual(p.bad, ['powershell', 'msedge']);
  assert.equal(p.reason, '回 消息');
});

// ---------- 设备 ----------

const devs = [
  { id: 'browser-a', kind: 'browser', name: '家里 Chrome', online: true },
  { id: 'browser-b', kind: 'browser', name: '公司 Chrome', online: false },
  { id: 'desktop-m_1', kind: 'desktop', name: '家里电脑', machine: 'm_1', parent: 'browser-a', online: true },
];

test('设备路由：指定的必须在名单里、类型对、在线；不指定时同类唯一才落', () => {
  assert.equal(resolveTarget(devs, { cap: 'browser' }).id, 'browser-a');
  assert.equal(resolveTarget(devs, { cap: 'desktop' }).id, 'desktop-m_1');
  denied(() => resolveTarget(devs, { cap: 'browser', want: 'browser-b' }), 'DEVICE_OFFLINE');
  denied(() => resolveTarget(devs, { cap: 'browser', want: 'desktop-m_1' }), 'NO_DEVICE');
  denied(() => resolveTarget(devs, { cap: 'browser', want: 'phone-x' }), 'DEVICE_NOT_IN_JOB');
  const two = devs.map((d) => ({ ...d, online: true }));
  assert.throws(() => resolveTarget(two, { cap: 'browser' }), (e) => e.code === 'AMBIGUOUS_DEVICE' && e.details.candidates.length === 2);
});

test('中继只替自己名下的设备转发；老消息归自己', () => {
  const self = devs[0];
  const children = [devs[2]];
  assert.equal(routeHere({ cmd: 'click' }, { self, children }).device.id, 'browser-a');
  assert.equal(routeHere({ cmd: 'desktop', cap: 'desktop' }, { self, children }).relay, true);
  denied(() => routeHere({ cmd: 'click', to: { device: 'browser-b' } }, { self, children }), 'DEVICE_NOT_HERE');
  denied(() => routeHere({ cmd: 'click', to: { device: 'desktop-m_1' } }, { self, children }), 'NO_DEVICE');
  assert.equal(capOf({ cap: 'weird' }), 'browser');
});

test('来源由执行方盖章，payload 里自带的 from 被覆盖；坏设备记录被丢弃', () => {
  const out = stampFrom({ ok: true, from: { device: 'browser-b' } }, devs[2]);
  assert.deepEqual(out.from, { device: 'desktop-m_1', kind: 'desktop', machine: 'm_1' });
  assert.equal(cleanDevice({ id: 'a b', kind: 'browser' }), null);
  assert.equal(cleanDevice({ id: 'x', kind: 'toaster' }), null);
});
