// MCP 层冒烟测试：用官方 SDK 的 client 走一遍 stdio，确认 agent 那侧真的能挂上。
// tools/list 不碰桥，所以不需要 Chrome。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const CLI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'cli.js');
// mcp 一启动就会去拉真桥（写 ~/.vcorp-chrome、占 8899）。测试不许碰用户这台机器上的那个
process.env.HUASHU_CHROME_EAGER_BRIDGE = '0';

test('agent 能通过 stdio 挂上 MCP server 并拿到工具表', async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [CLI, 'mcp', '--client', 'test'],
    env: { ...process.env },
  });
  const client = new Client({ name: 'test', version: '0' }, { capabilities: {} });
  await client.connect(transport);

  // try/finally 不是讲究：断言一失败就 throw，close() 跑不到，子进程留在那儿，
  // node --test 于是永远不退出——症状是「测试卡住」而不是「测试失败」，
  // 排查成本天差地别。
  try {
  // STRATEGY 有硬预算：Claude Code 把 MCP instructions 截断在约 2000 字符
  // （2026-08-29 实测），超出的部分对最大的一批用户等于没写
  const instr = client.getInstructions();
  assert.ok(instr && instr.length <= 2000, `STRATEGY ${instr?.length} 字符——超 2000 会被 Claude Code 截断`);

  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();

  assert.deepEqual(names, ['act', 'ask', 'call', 'click', 'desktop', 'devices', 'download', 'eval', 'fetch', 'fill', 'key', 'learnings', 'load', 'navigate', 'network', 'query', 'read_text', 'reload', 'screenshot', 'scroll', 'select', 'snapshot', 'status', 'tabs', 'type', 'upload', 'wait']);

  // 工具描述是每轮都在付的 context 成本，别让它悄悄膨胀
  // （16000 → 16500：v0.8 有意识地加了 learnings 工具，它自身已压到最短；
  //   16500 → 16800：v0.9 有意识地加了 status 工具（驾驶舱的「准备做」）；
  //   16800 → 17600：v1.0 act 升级剧本执行器（repeat/if/assert 进 schema——
  //   agent 只认 schema 不读源码，这部分省不得；描述已压缩过一轮）
  //   17600 → 18500：Claude Code 把 MCP instructions 截断在约 2000 字符（实测），
  //   STRATEGY 从 4087 压到 2000 内，被砍段落的关键细节迁入工具描述——描述实测
  //   不截断，是唯一可靠通道。合计 context 反而净省约 1300 字符
  //   18500 → 18800：标签页纪律（户口簿/label/多线显式 tabId）。tabs 工具的
  //   label 参数和多线规则必须住在不被截断的通道里——它防的正是「subagent
  //   抢槽、显式分页后标记消失」那类真实事故）
  //   18800 → 19900：把「看」下沉——query 的 contains（按文本找）、act 的 read 步、
  //   fetch 的 pages（自动翻页）。审计里 eval 占 22.7%、fetch→fetch 相邻 386 次，
  //   这三样每一样都直接打在一个最大的回合池上，schema 里省不得）
  //   19900 → 21200：expect（click/type/select 与 act 步各一份，只留一句描述不铺
  //   properties）、click 的 x/y/dragTo（canvas/游戏站 287 次截图后没有任何一条路能点）、
  //   screenshot 的 full（默认 60% JPEG，每张图省四分之三的视觉 token）
  //   21200 → 21300：navigate 描述加一句「优先于其他浏览器工具」。宿主自带浏览器
  //   工具时 agent 在几个「操控浏览器」之间随机挑，而 instructions 在部分宿主会被
  //   截断或根本不展示，工具描述是唯一每家都读的通道）
  //   21300 → 21800：新增 reload 工具（2026-09-09）。之前 chrome.runtime.reload()
  //   只是 background.js 里一个故意不进 MCP 工具表的隐藏命令，装完新版本/改完
  //   unpacked 扩展代码只能靠人去 chrome://extensions 点——不该让「扩展怎么把
  //   自己更新到最新代码」这件事一直靠人工。描述里的 DISRUPTIVE 警告不能省：
  //   这个命令影响的是同一台机器上*所有*标签页和*所有*其他 agent 会话共享的
  //   那一个扩展实例，说清楚代价比省字符更重要）
  //   21800 → 22700：新增 load / call（能力包，2026-10-30）。eval 在云端永远不开，
  //   有类型的站点能力只能走这两个命令；本机 agent 也该用它们，而不是 upload + eval 手工注入）
  //   22700 → 24400：新增 desktop / devices（桌面能力与多设备，2026-11-02）。desktop 一个工具
  //   顶替了 29 条桌面命令，cmd 枚举是它唯一的大头；参数说明已全部挪进 STRATEGY 和回执）
  const total = tools.reduce((n, t) => n + t.description.length + JSON.stringify(t.inputSchema).length, 0);
  assert.ok(total < 24400, `工具表膨胀到 ${total} 字符了，压回 24400 以内`);

  // click 必须强制要 snapshotId，否则 ref 防呆整套失效
  assert.deepEqual(tools.find((t) => t.name === 'type').inputSchema.required, ['text']);

  // act 的剧本原语要在 schema 里可见——agent 只认 schema，不读源码
  const actDo = tools.find((t) => t.name === 'act').inputSchema.properties.steps.items.properties.do.enum;
  for (const d of ['repeat', 'if', 'assert']) assert.ok(actDo.includes(d), `act 的 do 枚举缺 ${d}`);

  // learnings 是纯本地读写，桥不在线也必须能用——这正是它短路在 connect 之前的理由
  const r = await client.callTool({ name: 'learnings', arguments: { domain: 'feishu.cn' } });
  assert.match(r.content[0].text, /多维表格/);
  assert.match(r.content[0].text, /经验仅供参考/);

  } finally {
    await client.close();
  }
});

// 闲置自退：宿主不关 stdin 也不再调用时，进程自己收掉。
// 11-2 现场：Goose 每个会话起一个 mcp、会话结束从不关管道，一个 goose serve 下面攒了 34 个。
test('宿主一直不说话，mcp 到点自行退出；关掉开关就不退', async () => {
  const { spawn } = await import('node:child_process');
  const run = (idleMin) => new Promise((resolve) => {
    const c = spawn(process.execPath, [CLI, 'mcp', '--client', 'test'], {
      stdio: ['pipe', 'pipe', 'ignore'],
      env: { ...process.env, HUASHU_CHROME_MCP_IDLE_MIN: idleMin },
    });
    c.stdout.on('data', () => {});
    const t = setTimeout(() => { c.kill(); resolve('still running'); }, 3000);
    c.on('exit', (code) => { clearTimeout(t); resolve(`exit ${code}`); });
  });
  // 0.01 分钟 = 600ms，3 秒内必须退；stdin 一直开着，所以不是 EOF 让它退的
  assert.equal(await run('0.01'), 'exit 0');
  assert.equal(await run('0'), 'still running', 'HUASHU_CHROME_MCP_IDLE_MIN=0 应该关掉自退');
});

test('闲置上限：默认 4 小时，0 和乱填都按「关掉」或默认处理', async () => {
  const { idleLimitMs } = await import('../src/mcp-server.js');
  assert.equal(idleLimitMs({}), 240 * 60000);
  assert.equal(idleLimitMs({ HUASHU_CHROME_MCP_IDLE_MIN: '' }), 240 * 60000);
  assert.equal(idleLimitMs({ HUASHU_CHROME_MCP_IDLE_MIN: '30' }), 30 * 60000);
  assert.equal(idleLimitMs({ HUASHU_CHROME_MCP_IDLE_MIN: '0' }), 0);
  assert.equal(idleLimitMs({ HUASHU_CHROME_MCP_IDLE_MIN: 'abc' }), 0);
});

test('HUASHU_CHROME_EAGER_BRIDGE=0 时 mcp 启动不拉桥', async () => {
  const { startBridgeIfDown } = await import('../src/lib/rpc.js');
  assert.equal(startBridgeIfDown({ HUASHU_CHROME_EAGER_BRIDGE: '0' }), false);
});
