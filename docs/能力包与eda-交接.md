# 能力包（load/call）与嘉立创EDA：交接文档

2026-10-30 完成，跨两个仓库：

- **vcorp-chrome**（本仓库，分支 `my-dev`）：扩展里的能力包机制，以及 `eda` 能力包。
- **opus-video-maker**（分支 `main`）：`opus-eda` 沙箱镜像、`easyeda` skill，以及网页表单里的「专用工具」。

第 4 节写怎么升级上游 easyeda-agent，平时最常用的是这一节。

---

## 1. 现状

| 东西 | 位置 / 版本 | 状态 |
|---|---|---|
| 扩展 | `my-dev` @ `d8d8ba8`（Release 1.8.1） | 已推送 |
| eda 能力包 | `1.15.0+7a73a68.f00c96`（上游 easyeda-agent 1.15.0 @ `7a73a68`） | 随扩展发布 |
| 网页 | opus-video-maker `main` @ `a08d3aa` | Coolify 已部署，任务表单有「专用工具：嘉立创EDA（原理图、PCB）」 |
| 镜像 | `opus-eda`，宿主 192.168.68.2 | 2026-10-30 22:09 上线，1.21 GB，default_model=`openai/gpt-6.1-terra` |

已经实测通过：

- 只读任务：在测试工程上跑原理图检查，用时 3 分 45 秒，花费 $0.15，出了报告。
- 真实工程上的布线任务：1.8.1 修好 `project.find` 之后能跑通。
- 云端调用删除类 action 时的确认弹窗，三种结果都试过：同意、拒绝/超时、全局免确认。

---

## 2. 整体怎么连起来

```
网页任务（kind=browse，load=eda）
  → gen.js selectImage 选 opus-eda 镜像（GBX_EDA_IMAGE，默认 opus-eda）
  → 沙箱里的 agent 读 skills/easyeda，用 browser.mjs 发 load / call
  → extlink.js（云端通道）→ 用户 Chrome 里的扩展 cloud.js
  → cloud-policy.js 查白名单 / 站点 / 标签页归属；confirm 清单里的 action 先弹窗
  → background.js：load 注入 extension/loads/eda/agent.js（MAIN world），call 用结构化克隆调用
  → 页面里的 window.__vcorpLoads.eda.call(action, payload) → 上游 runAction → 编辑器的 _EXTAPI_ROOT_
```

### vcorp-chrome 里的文件

| 文件 | 作用 |
|---|---|
| `loads/eda/load.json` | 清单。包括 hosts、waitFor、limits，`vendor`（上游仓库 + **固定 40 位 commit**），`actions.read` / `actions.write`（白名单，现在 63 / 90），`confirm`（14 个，云端调用前要用户点头），`denied`（15 个，带不开放的理由） |
| `loads/eda/setup.js` | 跑在上游代码之前，补全局变量：`eda = _EXTAPI_ROOT_`，再把 `E*_` / `I*_` 枚举从 `_EXTAPI_SCRIPT_SPACES_` 搬到 window |
| `loads/eda/entry.js` | 页面侧入口，注册 `__vcorpLoads.eda = { version, ready(), call() }`。<br>`ready()`：地址里带工程 id、但工程还没打开时回「没准备好」。<br>`call()`：再查一次白名单。<br>**`project.find` 在这里被覆盖了**，见 6.4 |
| `loads/eda/actions-md.py` | 生成 opus 那边的 `skills/easyeda/references/actions.md` |
| `scripts/build-loads.mjs` | `npm run build:loads [eda]`。按 commit 把上游 clone 到 `.cache/loads/eda@<12位>/`，用 esbuild 打成 `extension/loads/eda/agent.js`（不压缩），再写注册表 `extension/loads/index.js` |
| `extension/loads/**` | **构建产物，入库**。MV3 不允许远程代码，能力包只能是扩展包里的文件。`.gitattributes` 设了 `-text`，保证 sha256 在 Windows 上也一致 |
| `extension/load.js` | 校验：`loadDef`、`checkLoadParams`、`checkCallParams`、`actionKind`、`confirmText`、`loadHostAllowed` |
| `extension/background.js` | `load` / `call` 两个命令处理器，以及 `ensureLoad`：查 host，等 waitFor，版本不对就重新注入，再轮询 `ready()`，最长 30 秒 |
| `extension/cloud-policy.js`、`cloud.js` | 云端可以用 load / call。confirm 标记**只从注册表来**，服务器发来的 `confirm` 字段一律丢掉；`confirmCall()` 负责弹窗 |
| `src/mcp-server.js` | 本地 MCP 的 `load` / `call` 工具 |
| `test/loads.test.js` | 检查注册表和 load.json 是否同步（含版本指纹）、sha256、白名单里的 action 上游是否都有、confirm 是否都在 write 里、hosts 判定 |

### opus-video-maker 里的文件

| 文件 | 作用 |
|---|---|
| `gooseboxd-image-eda/` | 镜像定义：image.json、Dockerfile（带自检）、CLAUDE.md、managed-settings.json |
| `skills/easyeda/SKILL.md` | 工作流程：读现状 → 出计划 → ask 确认 → 小批写入并读回 → 保存 → 写报告 |
| `skills/easyeda/references/actions.md` | **生成的**，不要手改 |
| `skills/easyeda/references/pitfalls.md` | 手写的踩坑记录 |
| `server.js` / `gen.js` / `images.js` / `public/index.html` | `load` 字段，以及按它选镜像 |
| `extlink.js`、`skills/user-browser/.../browser.mjs` | 云端命令清单里加了 load、call |

---

## 3. 安全设计（改动前先看）

- **云端只能按名字点能力包、按白名单调 action，不能下发任何 JS。** 云端拿不到 `eval`。
- **白名单查三遍**：cloud-policy.js（云端），background.js（扩展），entry.js（页面）。
- **会删东西或整片重做的 action 由扩展自己弹确认**，不靠 agent 记得先 ask。全局免确认和「本任务内都同意」可以盖过它。拒绝或 5 分钟没人点，都回 `CONFIRM_DECLINED`。
- **能力包运行在用户已登录的编辑器页面里**，权限和用户一样，能读写他所有工程。所以每次升级上游都要审代码，见 4.2。
- 用户的真实设计上不做试验。测试工程：
  - 名称：`API-Test-20261030`
  - uuid：`da5c2483a06745698a2acd1085e5aebe`
  - 原理图页：`34f3d48784a1ed0b`
- `HS-Toy-4G-Lierda`（`507f709b…`）是用户的真实设计。

---

## 4. 上游 easyeda-agent 怎么更新

上游是 https://github.com/zhoushoujianwork/easyeda-agent （MIT AND Apache-2.0）。我们只用它的 `extension/src/actions.ts` 这一层（`runAction` 和 HANDLERS），**不用** `transport.ts`：那是它连自己本地服务的通道。

选它而不选 easyeda-api-skill，是因为后者的提交历史是假的：commit 时间全挤在半年前。

### 4.1 什么时候升级

- 上游修了我们碰到的问题，或者加了我们要的 action。
- 嘉立创EDA 编辑器大版本更新后，有 action 坏了。
- **不需要追着上游升级**。commit 是钉死的，不升级就不会变。

### 4.2 步骤

以下命令都在 vcorp-chrome 仓库根目录、Git Bash 里跑。`OLD` 是 `load.json` 里现在的 commit，`NEW` 是要升到的 commit。

**1. 拿到新 commit，看上游改了什么。** 缓存目录本身是完整的 clone，可以直接 fetch：

```bash
C=.cache/loads/eda@7a73a6834d8d        # 现在的缓存目录；没有就先 npm run build:loads eda
git -C $C fetch -q origin
git -C $C log --oneline origin/HEAD -5          # 选一个 NEW，记下完整 40 位
OLD=7a73a6834d8d76fd9765dd06f9d4e4bdd6b0556a; NEW=<40位>
git -C $C log --oneline $OLD..$NEW
git -C $C diff --stat $OLD $NEW -- extension/src extension/package.json internal/protocol/actions.go
```

**2. 审代码。不能跳过。** 新代码会以用户身份在他的编辑器里运行。

```bash
git -C $C diff $OLD $NEW -- extension/src | grep -nE '^\+.*(fetch\(|XMLHttpRequest|WebSocket|sendBeacon|new Function|eval\(|importScripts|https?://)'
```

逐条看命中的地方，确认没有把数据发到编辑器以外的地方，也没有执行字符串代码。可疑就不升级。同时看一眼提交作者和时间是否正常。

**3. 对比 action 目录，决定白名单。**

```bash
for c in $OLD $NEW; do git -C $C show $c:internal/protocol/actions.go | sed -nE 's/.*Name:[[:space:]]*"([^"]+)".*/\1/p' | sort > /tmp/act-${c:0:7}.txt; done
comm -3 /tmp/act-${OLD:0:7}.txt /tmp/act-${NEW:0:7}.txt     # 左列：上游删了的；右列：新加的
```

- **上游删掉或改名的 action**：如果在我们的白名单里，就从 `load.json` 去掉或改名。不处理的话，`test/loads.test.js` 会报「上游没有 action X」。
- **新加的 action 默认不开放。** 白名单之外的 action 一律拒绝，所以新 action 不加进 `load.json` 就什么都不会发生。要开放时，按上游的 `Mutates` 决定放进 `read` 还是 `write`：
  - 会删东西、整片重做或清空的，同时加进 `confirm`，值是给用户看的中文说明，格式是「要……」后面接的那半句。上游的 `NeedsConfirm` 可以参考，但 confirm 清单是我们自己定的。
  - 会删整页、删板子、删库、导入导出工程文件、碰账号的，放进 `denied`，写明理由。
- 上游改了某个 action 的参数或语义，就去 opus 的 `pitfalls.md` 里查有没有相关条目，过时的删掉。

**4. 看依赖和全局变量有没有变。**

```bash
git -C $C diff $OLD $NEW -- extension/package.json
git -C $C diff $OLD $NEW -- extension/src | grep -nE "^\+import .* from '[^.]"   # 新的第三方依赖
```

- 上游的第三方依赖要装在**本仓库**的 devDependencies 里，现在只有 `jszip`。esbuild 通过 `nodePaths` 从本仓库的 `node_modules` 找依赖。没装的话构建会报 Could not resolve。
- 上游开始用新的全局变量（不在 `E*_` / `I*_` 枚举里）时，在 `setup.js` 里补上。
- `entry.js` 用的是 `import { runAction } from '@upstream/extension/src/actions'`。上游改了文件路径或导出名，这里跟着改，同时改 `load.json` 的 `vendor.entry`。

**5. 改 `load.json`，重新构建，跑测试。**

```bash
# load.json: vendor.commit = NEW（完整 40 位）；vendor.version = 上游 extension/package.json 的 version
git -C $C show $NEW:extension/package.json | grep '"version"'
npm run build:loads eda      # 会新 clone 一份到 .cache/loads/eda@<NEW前12位>/
npm test
git status --short           # 应该是 load.json、extension/loads/eda/agent.js、extension/loads/index.js，可能还有 LICENSE/NOTICE
```

能力包的版本号由构建脚本自动生成，格式是 `上游版本+commit前7位.适配层指纹`，不用手改。

**6. 检查 `project.find` 的覆盖还要不要（见 6.4）。** 如果上游修好了不带 `teamUuid` 时清单为空的问题，就删掉 `entry.js` 里的 `findAcrossTeams`，改回直接走 `runAction`。

**7. 在真实浏览器里验证。** 先在 `chrome://extensions` 重新加载 unpacked 扩展，然后在**测试工程**上跑：

- `load eda`：回执里的版本号应该是新的。
- 只读 action：`project.current`、`schematic.components.list`、`schematic.check`；有 PCB 时再跑 `pcb.drc.check`。
- 本次改动涉及的 action。
- 放一个元件再删掉，然后 `schematic.save`。

放元件可以用的器件：

```json
{"libraryUuid":"0819f05c4eef4c71ace90d822a990e87","uuid":"b948db94476e4027ac8953235755ec96","x":900,"y":500}
```

注意：编辑器加载后的前 20 秒左右，调用可能卡到超时，先等一会儿再验证（6.2）。

**8. 重新生成 opus 那边的 actions.md。**

```bash
python loads/eda/actions-md.py .cache/loads/eda@<NEW前12位>/internal/protocol/actions.go loads/eda/load.json ../opus-video-maker/skills/easyeda/references/actions.md
```

脚本最后会打印 `missing from catalog: [...]`，应该是空列表。不空说明白名单里有 action 不在上游目录里，回到第 3 步检查。

**9. 发布。顺序不能反。**

1. **先发扩展。**
   - 三处版本号一起改（`package.json`、`package-lock.json`、`extension/manifest.json`），提交、打 tag、推 `my-dev`。
   - 打商店包并提交审核，`npm publish`。
   - 详细步骤见 opus-video-maker 的 `docs/DEPLOY.md` 第 3 节。
2. **再更新镜像。** 只有 actions.md 或 skill 变了才需要：opus-video-maker 提交、推 `main`，然后在宿主上 build、push（见第 5 节）。

原因：新开放的 action 在旧扩展里会被白名单拒绝（`LOAD_DENIED`）。商店审核要几小时到几天，这期间旧扩展的用户还会存在，所以 skill 里不要写「必须用某个新 action 才能完成」这类说法。

### 4.3 回滚

把 `load.json` 的 `vendor.commit` 和 `version` 改回去，重新构建，发一个新版本的扩展。`extension/loads/` 是入库的，直接 revert 那个提交也可以。

---

## 5. opus-eda 镜像怎么重建

宿主是 `wizard@192.168.68.2`，目录在 `~/ovm-images/`。

**宿主上的 `opus-video-maker` 不是 git 仓库**，是导出的副本，所以 `remote.sh update` 用不了。按下面的办法送代码过去，旧副本改名留作回滚：

```bash
# 本机，D:\working\opus-video-maker，main 已经推送
git -c core.autocrlf=false archive --format=tar main | ssh wizard@192.168.68.2 'set -e; cd ~/ovm-images; rm -rf opus-video-maker.new; mkdir opus-video-maker.new; tar -x -C opus-video-maker.new; mv opus-video-maker opus-video-maker.prev-$(date +%m%d%H%M); mv opus-video-maker.new opus-video-maker'

# 构建 + 推送（约 1–2 分钟，基础层走缓存）
ssh wizard@192.168.68.2 'cd ~/ovm-images && bash opus-video-maker/gooseboxd-host/remote.sh build opus-eda && bash opus-video-maker/gooseboxd-host/remote.sh push opus-eda --model openai/gpt-6.1-terra'
ssh wizard@192.168.68.2 'cd ~/ovm-images && bash opus-video-maker/gooseboxd-host/remote.sh status' | grep -A2 opus-eda
```

- `core.autocrlf=false` 一定要带，否则脚本会变成 CRLF。
- 2026-10-30 的旧副本还留在 `opus-video-maker.prev-01ca40e`。
- `skills/user-browser` 或 `huashu-chrome-notes` 改了的话，五张浏览器类镜像都要重建（见 DEPLOY.md 2.5）。

---

## 6. 实测踩过的坑（都已处理）

### 6.1 嘉立创EDA 加载时会整页重写，扩展的浮层被挂丢

编辑器的 `loader.js` 用 `document.open(); document.writeln(…); document.close()` 换掉整个 `<html>`。window 和扩展 isolated world 里的状态都还在，但 `mark.js` 挂上去的浮层节点脱离了文档。

结果是：EDA 页面上从来没有出现过边框和光标，确认弹窗画进了一个看不见的节点，后台一直等到超时。

修复在 `8784cc4`：`ensureHost` 发现节点脱离了文档就重新挂回去。以后别的站点如果出现「弹窗看不见、ask 超时」，先查这一点。

### 6.2 编辑器刚打开的头 20 秒左右不稳定

这段时间 `schematic.page.open`、`schematic.component.place` 可能卡到超时，不返回也不报错。等一会儿再调就正常。

这一条已写进 `pitfalls.md`：`load` 之后先等 20 秒，前几次调用的 timeout 给 30000。

### 6.3 后台标签页里 `document.current` 会误报

后台标签页里它可能报 `No active document`，其实页面是开着的。判断页面开没开，用 `schematic.components.list` 这类读操作。已写进 `pitfalls.md`。

### 6.4 `project.find` 不给 teamUuid 时永远找不到（1.8.1 修）

上游在没有 `teamUuid` 时调 `getAllProjectsUuid()`，V4 上这个不带团队的清单是空的。能力包里也没有哪个 action 能拿到 teamUuid。

第一次真实布线任务就卡在这里：agent 正确地没去猜工程，停下来向用户要链接。

`entry.js` 里的 `findAcrossTeams` 改成遍历用户所在的每个团队，查团队根目录和每个文件夹，返回结构和判定规则照上游。

**文件夹那条路还没有用真实数据验证过**：用户的工程都不在文件夹里。

### 6.5 其他

- **刷新页面后的时序**：页面刷新后 `_EXTAPI_ROOT_` 先出现，工程过几秒才打开。由 `ready()` 回「没准备好」、`ensureLoad` 轮询来兜住。
- **适配层改动要能被页面感知**：只改了 entry.js 或 setup.js 时，页面上那份旧代码也要被换掉，所以版本号里带了适配层的指纹。
- **从没切到前台过的后台 EDA 标签页**：有一次 `load` 回了 `LOAD_NOT_READY`（工程一直没打开），之后没能复现，后台标签页 `load` 一般 8–11 秒就成功。如果再出现，先把标签页切到前台看一眼。

---

## 7. 开发时的验证工具

- **单元测试**：vcorp-chrome 跑 `npm test`，应该 146 个全过。opus-video-maker 跑 `npm test`，有 3 个 sandbox 归档用例在干净代码上也失败，是旧问题。
- **本机直连 bridge**：写一个最小 WebSocket 客户端，读 `~/.vcorp-chrome/bridge.json` 拿端口和 token，发 `hello` 再发 `cmd`。不要用 `BridgeClient.connect()`，它会杀掉版本不一致的桥。
- **审计日志**：`~/.vcorp-chrome/audit.jsonl` 记了每条命令和结果，时间是 UTC。排查「卡住了」时先看这里，能分清是扩展慢，还是客户端没收到回包。
- **在 Node 里跑真实的 cloud.js**：mock 掉 `chrome.storage`，假装一个服务器 socket，`deps.run` 转发到 bridge。这样可以不经过线上服务器测云端确认。
  - **假服务器必须回 `ping`**，否则 cloud.js 过了 `DEAD_MS` 会主动断开，长时间等确认之后的回包会丢掉。
  - 这套脚本是临时写的，没有入库。

---

## 8. 还没做的

- `project.find` 的文件夹分支，等有在文件夹里的工程时验证一次。
- `pro.easyeda.com`（国际版，V3）只做过早期探索，没有用能力包完整跑过。
- 能力包机制是通用的，加新站点照 `loads/eda/` 的结构来：
  1. 写 `load.json`、`setup.js`、`entry.js`。
  2. 跑 `npm run build:loads <name>`。
  3. opus 那边在 `BROWSE_LOADS` 加名字，加镜像目录和环境变量，表单里加选项。

## 9. 相关提交

- vcorp-chrome `my-dev`：
  - `dc87780` load/call 和 eda 能力包
  - `e552e12` 刷新后等工程打开、版本带适配层指纹
  - `4f57bd2` 云端确认
  - `8784cc4` mark.js 被整页重写后的修复
  - `07f111f` project.find 跨团队查找
  - `d8d8ba8` Release 1.8.1
- opus-video-maker `main`：
  - `f75885b` opus-eda 镜像
  - `20e2e3e` skill：⚠ action 由扩展确认
  - `6db8cdf` pitfalls：启动时序
  - `a08d3aa` 合并
