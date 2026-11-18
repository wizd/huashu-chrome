# 快手（cp.kuaishou.com / www.kuaishou.com）

以下据 AiToEarn 开源代码整理（2026-11），未在页面实测；与现场不符以现场为准，验证后改写。
（AiToEarn 发布快手走的是开放平台接口，代码里**没有创作者后台的页面流程**；下面只有规则、链接和字段，页面操作需实测补充。）

## 入口

- 创作者服务平台 `cp.kuaishou.com`，前台 `www.kuaishou.com`；同一账号两边的登录态都要确认。
- 账号资料字段：`name`、`head` / `bigHead`（头像）、`fan`（粉丝）、`follow`（关注）、`city`、`sex`（M/F）。

## 发布

- AiToEarn 只发**视频**（图文张数配置为 0）。网页端有没有图文入口，以页面为准。
- 只提交一段作品描述 `caption`，没有单独的标题字段；按 ≤1000 字估算，代码里的 30 字标题上限对快手实际无用。
- 话题 ≤4 个（代码注明这是**产品兜底值**，没找到官方文档），`#词` 写进描述。
- **封面必传**（接口发布时缺封面直接报错）。
- 视频：≤12GB、≤1 小时（前端提示文案；后端 100MB/30 分钟是开放接口的限制）。
  建议竖屏 9:16、1080×1920、15 秒–3 分钟，不符合时 AiToEarn 只给警告。格式 mp4/avi/mkv/mov/webm。
- 可选：挂载商品（商品 ID）、视频类型 `stereo_type`（含义代码未说明）。
- 发布是**异步处理**：先返回作品 ID，之后一段时间处于 `pending`（处理中），转完才算发布成功。
  作品页链接要等 pending 结束才可靠。

## 作品链接与 ID

- 作品 ID 叫 `photo_id`，标准链接 `www.kuaishou.com/short-video/<photo_id>`。
- 也认 `www.kuaishou.com/video/<id>`、`c.kuaishou.com/.../photo/<id>`；
  `v.kuaishou.com/…` 和 `www.kuaishou.com/f/…` 短链会 302 到这些地址。

## 作品与数据

- 作品字段：`photo_id`、`caption`、`cover`、`play_url`、`create_time`、`view_count`（播放）、
  `like_count`、`comment_count`、`pending`。**代码里没有分享数和收藏数。**
- `create_time` **有时是秒有时是毫秒**，代码用「小于 1e12 就乘 1000」来兼容。
- 作品列表按时间倒序、游标翻页：以本页最早一条为游标取下一页，每页默认 20、最多 200。

## 互动、搜索

- 代码未覆盖（快手不在 AiToEarn 的浏览器互动平台里）：评论、点赞、私信、搜索都要现场摸索。
  参照抖音的做法：打开作品页点按钮，不调接口，节奏放慢。
