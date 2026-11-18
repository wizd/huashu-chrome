# 微信公众号（mp.weixin.qq.com）

实测 2026-08-25，本机会话实抓。

正文在 `mp.weixin.qq.com`，图在 `mmbiz.qpic.cn`——**跨域**。
`fetch` 下图必须走扩展（默认），加 `via:"page"` 会被 CORS 挡死。

懒加载的图真地址在 `data-src`，`src` 是 1px 占位符。

## 贴图（图片消息 / 小绿书）编辑器（2026-09-05 实测打通）

- 入口：首页「新的创作」里的「贴图」**不是 link 也不是 button**，`snapshot` 看不到。
  用 `query contains:"贴图"` 拿 selector 路径再 `act click selector`，会**开新标签页**，
  URL 形如 `appmsg_edit_v2&type=77&createType=8`。
  ⚠️ 直接拼 `type=8` 会进「商品消息」，不是它。
- **标题上限 20 字**（页面右侧有 `15/20` 这类计数，英文字母按半个算）。
- **图片上传**：页面有两个 `input[type=file]`。第一个（accept 含 `image/svg`）是正文编辑器的，
  投进去**没反应**；贴图要投给隐藏的第二个：
  `upload` 带 `selector:"input[type=file][accept^=\"image/bmp\"]"`。
  每次一张，按顺序投，顺序即轮播顺序，最多 9 张。投完约 2–3 秒才出现在缩略图条里。
- **描述栏是 ProseMirror**（`#guide_words_main .ProseMirror`）：`fill` / `type` 里的 `\n`
  全被吞掉，段落会连成一块；`act key Enter` 其实有效（插入 `<br>`），
  但工具判「无变化」会中途停。
  **可靠做法**：`eval` 直接写 DOM——清空后按段 append 文本节点，段间放两个 `<br>`，
  再 dispatch `InputEvent('input')`，ProseMirror 会接收。
  写完用 `snapshot` 看 textbox value 里有空行即成。
- `eval` 在这个站**能跑**（CSP 没挡）。
- 填了标题 + 首图后会**自动保存**成草稿，URL 变成 `appmsg_edit&appmsgid=xxx`，
  左下角显示「已保存」。「保存为草稿」按钮是 `button "保存为草稿"`。**别碰「发表」。**

## 视频号助手（channels.weixin.qq.com）

以下据 AiToEarn 开源代码整理（2026-11），未在页面实测；与现场不符以现场为准，验证后改写。

- 入口 `channels.weixin.qq.com/platform`，**微信扫码登录**。登录容易失效：AiToEarn 提示失效后要「重新登录并保持浏览器开启」。
- AiToEarn 只发视频。短标题 ≤16 字；描述 ≤1000 字；话题 `#词` 写进描述。
- 视频 ≤20GB、≤8 小时（前端提示文案），mp4/avi/mkv/mov/flv/rmvb/wmv/webm；图片 jpg/png/bmp，≤20MB。
- 选填项：
  - **地理位置**：搜索框至少输 2 个字才出结果，选中后带地点名和地址提交。
  - **活动**：同样至少 2 个字，结果显示活动名、发起人、参与人数，选中即参加该活动。
  - **链接**：扩展阅读链接。
  - **声明原创**：作品带原创标记，有机会获得广告收入。
  - 定时发表。
- **发表成功 ≠ 拿到链接**：发表后先进审核，审核通过才有作品链接。
  AiToEarn 发完记下媒体 MD5 和剪辑任务 ID，之后轮询作品管理页，直到作品出现。
  拿不到公开链接时，链接留空，作品 ID 用作品管理页里的作品 ID，或者「描述+发布时间」。
- 公开链接形如 `channels.weixin.qq.com/…` 或 `weixin.qq.com/sph/…`；作品 ID 由视频号 ID 和视频 ID 拼成，写作 `finder_id:video_id`。
- 作品数据字段：`read_count`（播放）、`like_count`、`comment_count`、`share_count`、`publish_time` / `create_time`（秒）、
  `title`、`description`、`cover_url`。

## 公众号图文发表（据代码补充）

以下据 AiToEarn 开源代码整理（2026-11），未在页面实测；与现场不符以现场为准，验证后改写。

- 管理员微信扫码登录。流程：**先存草稿，再发表**。
- 文章：标题 ≤64 字；作者 ≤8 字；摘要 ≤120 字（不填就取正文开头）；正文 ≤2 万字。
  图片 jpg/png/gif/bmp，≤10MB/张。
- **封面必填**；没单独给封面时，AiToEarn 用正文第一张图。
- 选项：原文链接、是否显示封面、留言开关、仅粉丝可留言。
- 发表后状态：发表中 → 成功（拿到文章链接）/ 失败。AiToEarn 认为文章**发出后不能撤回，也不能通过接口修改**，
  要改只能在后台手工编辑，所以发表前核对清楚。
- AiToEarn 用的是「发表」，不是「群发」。要推送给粉丝时，在页面上确认选的是哪一个。
