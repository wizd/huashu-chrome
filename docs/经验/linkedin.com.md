# LinkedIn（www.linkedin.com）

以下据 AiToEarn 开源代码整理（2026-11），未在页面实测；与现场不符以现场为准，验证后改写。

## 登录与账号确认

- AiToEarn **只支持个人身份**发帖（作者固定是 `urn:li:person:<id>`），没有公司主页（Company Page）的代码。公司主页的操作全部以现场为准。
- 确认身份：顶栏「我/Me」→ 查看个人资料，看姓名和头像；个人主页 `www.linkedin.com/in/<public-id>/`。
- 公司主页：管理员在「我/Me → 管理 → 公司主页」进入，地址 `www.linkedin.com/company/<slug>/admin/`。在公司主页后台发帖时，composer 顶部会显示以公司身份发；在信息流里评论时，评论框旁可切换「以个人/以公司身份」，发前看清。

## 发布

- 入口：信息流顶部「发帖/Start a post」（`www.linkedin.com/feed/`）。
- 形态：纯文字、文字+图片、文字+单视频。
- 正文 ≤3000 字符。没有话题字段，# 直接写在正文里。
- 图片：jpg/jpeg/png/gif，最多 9 张（多图贴）。单张后端按 10MB，前端提示 5MB，保守按 5MB。
- 视频：**只收 mp4**（mov/webm/avi/mkv 一律被拒），1 个。后端按 ≤200MB、≤10 分钟；前端写 ≤500MB、3 秒–30 分钟。保守按 mp4、≤200MB、≤10 分钟准备。
- 图片和视频同时给时，AiToEarn 只发视频、丢掉图片。网页上别混放。
- 可见范围：默认「所有人 Anyone/PUBLIC」，可选「仅联系人 Connections」。在 composer 顶部姓名下的下拉里改。
- 分发：默认进主信息流（MAIN_FEED），AiToEarn 不做定向。
- 转发带评论（Repost with your thoughts）：代码里有，作者同样是个人。
- 定时：AiToEarn 不用平台定时；composer 底部时钟图标可排期，以现场为准。
- 发出后 AiToEarn 不做编辑，只能删除（页面上帖子右上「…」里有编辑/删除）。

## 成功判定与链接

- 同步发出，ID 是 URN，形如 `urn:li:share:<数字>` 或 `urn:li:ugcPost:<数字>`。
- 链接：`https://www.linkedin.com/feed/update/<URN>/`（URN 原样放在路径里，如 `/feed/update/urn:li:share:123.../`）。页面「复制帖子链接」得到的也是这种，或 `/posts/<slug>-activity-<数字>-xxxx/`。
- 判成功：发完 composer 关闭并出现「帖子已发布/View post」提示；到个人主页「动态/Activity → 帖子」看到新帖并能打开链接。

## 作品与数据

- 自己的帖子：`www.linkedin.com/in/<public-id>/recent-activity/all/`（或 `/shares/`）。
- AiToEarn **没有 LinkedIn 数据分析代码**（无 analytics/work provider）。帖子下方的展示次数（impressions）、心情、评论、转发数要在页面读，名称以现场为准。

## 互动

- 评论：按页取，默认一页 10 条，有总数。每条有作者 URN、内容、创建时间。**接口只给作者 URN 不给名字**，页面上能直接看到名字。
- 能做：以个人身份**评论、回复评论、删除评论**。
- AiToEarn 没有点赞（心情）、关注、私信代码，页面上手动做，位置现场确认。

## 搜索与采集

- 帖子 ID 统一记 URN；从链接 `/feed/update/<URN>` 直接截取。`/posts/...-activity-<数字>-...` 里的数字即 `urn:li:activity:<数字>`，与 share URN 不一定相同。
- 动态页滚动加载，采集时边滚边按 URN 去重。

## 坑

- 视频不是 mp4 必失败，先转码。
- 图片+视频混放时视频优先，图丢失。
- 要发公司主页时，务必确认 composer 顶部是公司名，代码里没有这条路径，全靠现场核对。
- 后端与前端的媒体上限不一致（见上），以 composer 实际报错为准。
