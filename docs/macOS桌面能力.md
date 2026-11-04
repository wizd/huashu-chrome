# 在 macOS 上开启桌面能力

开启后，maker.vcorp.ai 的任务可以操作你 Mac 上的应用，比如替你在某个桌面软件里点按钮、填内容。每个任务要用哪些应用，都会先问你。

只想让 AI 操作网页的话，不需要做这些，桌面能力默认是关着的。

全程大约 10 分钟，要用到一次终端。照着复制命令就行，不需要懂命令行。

## 开始之前

- 已经装好 vcorp-chrome 扩展，并和 maker.vcorp.ai 配对。步骤见[云端发布](云端发布.md)。
- 这台 Mac 上打开过 Chrome。支持 Apple 芯片和 Intel 芯片的 Mac。

## 第 1 步：安装 Node.js

已经装过的话，确认版本在 20 以上，然后跳到第 2 步。

1. 打开 <https://nodejs.org>，下载 **LTS** 版本的 macOS 安装包（`.pkg`）。
2. 双击安装包，一路点“继续”。
3. 打开“终端”：按 `Command + 空格`，输入 `终端` 或 `Terminal`，按回车。
4. 输入下面这条命令，按回车：

   ```bash
   node -v
   ```

   显示 `v20` 或更大的数字就对了。

## 第 2 步：安装桌面组件

在终端运行：

```bash
npx vcorp-chrome@latest desktop install
```

如果问 `Ok to proceed?`，输入 `y` 再按回车。

看到 `已登记原生消息宿主` 和带 `✅` 的 Chrome 目录，就是装好了。输出里显示的扩展 ID 可能和 `chrome://extensions` 里的不一样，这是正常的，商店版也已经放行。

输出末尾的检查可能显示 `agent-desktop 用不了`。这里测的是从终端启动的情况，先继续往下做，**最终以第 4 步里侧栏的显示为准**。

## 第 3 步：在扩展里启用

1. 点 Chrome 工具栏上的 vcorp-chrome 图标，打开侧栏。
2. 找到 **桌面应用**，点 **启用桌面能力**。
3. Chrome 询问权限时点 **允许**。
4. 第一次启用时扩展会重载，侧栏可能会关掉，重新点图标打开即可。

## 第 4 步：给 Chrome 授权“辅助功能”

macOS 要求你亲自授权，别的程序替代不了这一步。

1. 打开 **系统设置 → 隐私与安全性 → 辅助功能**。
2. 点列表下方的 **+**，在“应用程序”里选 **Google Chrome**，确认后打开它旁边的开关。需要时输入密码或按 Touch ID。
3. 如果列表里单独出现了 `agent-desktop`，也把它打开。

为什么是 Chrome：桌面组件由 Chrome 启动，macOS 把权限算在启动它的应用头上。

然后回到侧栏刷新状态：点 **停用**，再点一次 **启用桌面能力**。启用时才会重新检查权限，所以这一步不能省。

**怎么算成功：** 侧栏显示 `已启用 · desktop-…`，后面没有 `agent-desktop 用不了`。

## 使用时会发生什么

- 任务想用某个应用时，Chrome 会弹通知，侧栏的任务卡片上也有 **允许 / 拒绝**。“自动允许新任务”管不到这里，每个任务都要逐个点头。
- 涉及发送、删除这类操作时，可能还会再问你一次。
- 云端任务不能操作终端、系统设置和代码编辑器。任何情况下都不碰密码管理器和“钥匙串访问”。
- 任务运行时 Chrome 要开着，Mac 不能睡眠。

## 常见问题

| 你看到的 | 原因 | 怎么办 |
|---|---|---|
| 终端提示 `command not found: npx` | Node.js 没装好，或终端是安装前打开的 | 关掉终端重开；还不行就重做第 1 步 |
| `没找到已安装的 Chrome / Edge / Chromium 配置目录` | 这台 Mac 上还没打开过浏览器 | 打开一次 Chrome，再运行第 2 步的命令 |
| 侧栏显示 `Specified native messaging host not found` | 第 2 步没做，或没做成功 | 运行第 2 步的命令 |
| 侧栏显示 `Access to the specified native messaging host is forbidden` | 桌面组件是旧版本 | 运行第 2 步的命令，一定要带 `@latest` |
| 侧栏显示 `Failed to start native messaging host` 或 `Native host has exited`，或者原来好好的突然不行了 | 升级过 Node.js，或 npx 的缓存被清理了 | 运行第 2 步的命令，再回侧栏启用 |
| `没有拿到权限，桌面能力保持关闭` | 第 3 步的权限询问点了拒绝 | 再点一次 **启用桌面能力**，选允许 |
| `已启用 · … agent-desktop 用不了` | 还没授权，或授权后没刷新状态 | 重做第 4 步，别漏了最后的“停用再启用” |
| 任务提示 `云端不能用…` 或 `云端任务不能操作…` | 这个命令或应用不开放给云端任务 | 这是安全限制，不是故障 |
| 安装扩展时提示 `not trusted by Enhanced Safe Browsing` | Chrome 对较新开发者的常规提示，和桌面能力无关 | 确认是官方商店页面后，继续安装即可 |

还没解决的话，把下面两条命令的输出和侧栏显示的文字一起发给我们：

```bash
npx vcorp-chrome@latest desktop status
npx vcorp-chrome@latest doctor
```

## 关闭和卸载

- **暂时不用：** 在侧栏点 **停用**。
- **彻底移除：** 先点 **停用**，再运行下面的命令，最后在“辅助功能”列表里关掉 Google Chrome。

  ```bash
  npx vcorp-chrome@latest desktop uninstall
  ```

## 关于“完全模式”

`npx vcorp-chrome desktop full on` 会打开完全模式。打开后，配对服务器上的任务可以在这台 Mac 上运行任意命令、读写任意文件、操作任何应用，也不再逐个问你，上面说的这些限制都不再生效。

**普通使用不需要打开，也不建议打开。** 如果开过，用这条命令关掉：

```bash
npx vcorp-chrome desktop full off
```
