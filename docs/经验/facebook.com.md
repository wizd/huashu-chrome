# Facebook 公共主页（www.facebook.com / business.facebook.com）

以下据 AiToEarn 开源代码整理（2026-11），未在页面实测；与现场不符以现场为准，验证后改写。

## 登录与账号确认

- AiToEarn 只代**公共主页（Page）**发，不发个人时间线。一个个人账号可管多个主页，发之前先确认「以哪个主页身份」在操作。
- 主页身份由个人账号对该主页的权限（tasks）决定；没有主页时提示去 `www.facebook.com/pages/create` 创建。
- 切换身份：www.facebook.com 右上头像 →「查看所有主页/切换到 <主页名>」；Meta Business Suite（`business.facebook.com`）左上角的主页/资产下拉。切完看头像和名称再动手。
- 主页资料能看到：名称、头像、分类（category）、粉丝数（followers）、赞数（fan/likes，旧口径）。两个数不一样，记录时写清是哪个。

## 发布

- 入口：主页身份下的主页首页「有什么新鲜事？/Create post」；或 Business Suite →「创建帖子 / 创建 Reel / 创建快拍」。
- 三种类型（AiToEarn 叫 content_category）：
  - **帖子 Post**（默认）：纯文字、文字+图片、文字+单视频、文字+链接。
  - **Reel**：只能 1 个视频，不能带图片。
  - **快拍 Story**：只能 1 个媒体（图或视频二选一），**不能有正文、标题、链接**。
- 正文上限 63206 字符。不支持话题字段（# 写在正文里即可）。
- 图片：jpg/jpeg/png/gif/bmp/tiff，最多 10 张；帖子单图 ≤10MB（前端提示 4MB），快拍图 ≤4MB。
- 视频：帖子 mp4/mov/avi ≤1GB（前端文案 4GB）；Reel 只收 mp4，≥3 秒（后端上限 60 分钟，前端仍写 3–90 秒）；快拍视频 mp4/mov，3–60 秒，≤1000MB。
- 视频最好是 **H.264 + faststart(moov 前置)**，否则 Meta 报 1363045 拒收；AiToEarn 发前会转码。本地准备素材时同样处理。
- 帖子可附一个链接（生成链接卡片）；多图时代码不带链接。
- 定时：AiToEarn 不用平台定时（自己排队）。需要定时就用 Business Suite composer 里的「排期/Schedule」，以现场为准。
- 发出后不支持编辑（AiToEarn 不做更新），只能删除。

## 成功判定与链接

- 帖子/图片：同步完成，拿到帖子 ID 形如 `<pageId>_<postId>`，链接 `https://www.facebook.com/<pageId>_<postId>`（也常见 `/<page>/posts/<id>`、`/permalink.php?story_fbid=..&id=..`）。
- Reel / 视频：异步处理，状态 processing → ready/published，error 就重发；链接 `https://www.facebook.com/reel/<videoId>`，旧视频页 `/watch?v=<id>`、`/<page>/videos/<id>`；短链 `fb.watch/...` 会跳转到上述地址。
- 判成功：到主页时间线/Business Suite「内容」列表里出现新条目，并且能打开 permalink。视频在「处理中」时不要重复点发布。

## 作品与数据

- 帖子列表：主页时间线，或 Business Suite →「内容/Content」→ 帖子与 Reels。每条有：正文、发布时间、封面图、permalink、类型（文字/图片/视频）。
- 单帖数据（Insights）：**展示次数 impressions、互动用户 engaged users、点击 clicks、各类心情数 reactions by type**。在帖子下方「查看数据分析/See insights」或 Business Suite「洞察/Insights」。
- 主页层：展示次数、帖子互动、粉丝数（page_impressions / page_post_engagements / page_fans 对应的界面指标）。
- AiToEarn 的单帖数据来源标注是「爬取」（PostInsightCrawler），说明官方接口取数不全，页面上读是正路。

## 互动

- 评论：每条有作者名、内容、时间、赞数、回复数、父评论。一页 25 条，可前后翻。
- 能做：以主页身份**评论、回复评论**（对评论再评论就是回复）、**删除评论**、对帖子**赞/取消赞**。
- 回复前确认评论框左侧头像是主页而不是个人号（评论身份切换在评论框旁的头像下拉）。
- 平台还会推送：新帖、评论（增/改/删/隐藏/取消隐藏）、心情、分享、**主页评价（ratings/推荐）**。评价在主页「评价/Reviews」页签，AiToEarn 只接收没回复。
- 分享、关注、转发 AiToEarn 没做，页面位置现场确认。

## 搜索与采集

- 用户给的链接里取 ID：`/watch?v=<id>`、路径中的 `<数字>_<数字>`、`/reel/<id>`、`/videos/<id>`、`/posts/<id>`；`fb.watch` 先打开让它跳转再取。
- 主页帖子列表按时间倒序，滚动加载；采集时边滚边累加去重（按 ID），别指望一次读全。

## 坑

- 发之前没切到主页身份，会发到个人时间线或以个人身份评论，这是最常见的错。
- 快拍填了正文/链接会被拒；Reel 混入图片会被拒。
- Reel 时长：后端已按 2025-06 后「所有视频都是 Reel、最长 60 分钟」处理，前端旧文案仍写 90 秒，以现场 composer 提示为准。
- 两个粉丝数（followers vs likes）口径不同，别混。
