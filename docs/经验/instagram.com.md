# Instagram（www.instagram.com）

以下据 AiToEarn 开源代码整理（2026-11），未在页面实测；与现场不符以现场为准，验证后改写。

## 登录与账号确认

- 以 `@username` 为准，主页 `www.instagram.com/<username>/`。左侧导航「个人主页」进入核对头像和用户名。
- AiToEarn 走「Instagram 登录」那套接口，只支持**专业账号**（商家 Business / 创作者 Creator，account_type 字段）。个人账号没有数据分析，先在「设置 → 账号类型和工具」里确认。
- 多账号：左下「更多 → 切换账号」，或个人主页用户名下拉。切完看左侧头像再操作。
- 个人主页上能读：粉丝数、关注数、帖子数。

## 发布

- 入口：左侧导航「创建/+」→「帖子」（Reel、快拍在同一菜单里，以现场为准）。
- 类型（AiToEarn 自动判定，也可手选）：
  - **单图帖子**：1 张图。
  - **轮播 Carousel**：2–10 张图（AiToEarn 只放图片）。
  - **Reel**：1 个视频，不能带图。AiToEarn 里「有视频就是 Reel」，帖子类型不能放视频。
  - **快拍 Story**：1 个图或视频，前端要求不写描述。
- 文案（caption）≤2200 字；**# 话题 ≤30 个，@ 提及 ≤20 个**，超了发不出。
- 图片：接口只收 **jpg/jpeg**，≤8MB；帖子图片宽高比 **4:5 到 1.91:1** 之间（0.8–1.91），超出要先裁。网页上传会自带裁剪框，留意选「原始比例」还是被裁掉了。
- 视频：mp4/mov。
  - Reel：3 秒–15 分钟，≤300MB，宽高比 9:16 到 4:5。
  - 快拍：3–60 秒，≤100MB。
  - 动态视频：≤15 分钟、≤1GB。
- 可选项：替代文字 alt（≤1000 字，在「高级设置」里）、**协作者 ≤3 人**、位置、标记用户（图上坐标）、商品标签、Reel 封面图。
- 定时：AiToEarn 不用平台定时。网页 composer 有无「排期」以现场为准（Meta Business Suite 里 Instagram 也可排期）。
- 发出后不能改媒体（AiToEarn 不做更新），只能删除。

## 成功判定与链接

- 发布是异步的：先建容器，处理到 FINISHED 才真正发出；ERROR / EXPIRED 要重发。AiToEarn 每 5 秒查一次，最多等 5 分钟。
- 成功标志是拿到 permalink：`www.instagram.com/p/<shortcode>/`，Reel 为 `/reel/<shortcode>/`（也见 `/reels/`、`/tv/`）。
- 判成功：个人主页网格首位出现新帖并能打开 permalink。处理中不要重复点「分享」。
- **shortcode 不是 media ID**：AiToEarn 从链接只能拿 shortcode，数字 media ID 要另外取。记录两者时别混。

## 作品与数据

- 帖子列表：个人主页网格（帖子 / Reels / 被标记 三个页签）。每条有：文案、类型（IMAGE / VIDEO / CAROUSEL_ALBUM / REELS）、发布时间、permalink、赞数、评论数。
- 单帖数据：**覆盖人数 reach、赞 likes、评论 comments、分享 shares、收藏 saved、总互动 total_interactions**。帖子下方「查看数据分析/View insights」。
- 账号数据：**覆盖人数 reach、主页访问 profile_views、网站点击 website_clicks**。个人主页「专业面板/Professional dashboard」→ 数据分析。没开数据权限的账号看不到。
- AiToEarn 单帖数据来源标注是「爬取」，页面读是正路。

## 互动

- 评论列表：每条有用户名、内容、时间、赞数，下挂回复（回复也有用户名、内容、时间）。一页 25 条。
- 能做：在自己帖子下**发评论、回复某条评论、删除评论**。
- AiToEarn **没有点赞接口**（官方接口不支持），赞、关注、分享、私信都要在页面上手动点，位置现场确认。
- 平台推送：新评论、被 @ 提及（mentions）、媒体发布状态。被提及的帖子在通知里看。

## 搜索与采集

- 链接解析：路径里 `p` / `reel` / `reels` / `tv` 后一段就是 shortcode，只认 `instagram.com` 域名。
- 个人主页网格滚动加载，采集时边滚边按 shortcode 去重累加。

## 坑

- **24 小时发布上限**：超了报错子码 2207069（content publishing limit），不可重试，等额度恢复。批量发前先算好条数。
- 帖子类型里放视频会被拒；Reel 里混图片会被拒。
- 图片比例不在 4:5–1.91:1 会被拒或被裁。
- 话题 30、提及 20 是硬上限。
- 个人（非专业）账号没有 insights，数据面板入口不存在不是页面问题。
