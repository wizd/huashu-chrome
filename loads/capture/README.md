# capture 小脑：播放录制

浏览器能播的视频就能拿到：页面播放器交给 `<video>` 的字节（MSE 的 `SourceBuffer.appendBuffer`），
复制一份分段交给沙箱，沙箱合成文件。不碰站点接口和签名，不冒充客户端，不读 Cookie。
有 DRM 的不录。设计见 `docs/小脑.md`。

- 网站：`hosts: "task"`，任何网页都能装；云端只在本任务批准的网站上。
- 宿主能力：`early`（页面加载前装钩子，`load` 时扩展会重载一次标签页）、`binaryOut`（字节经 pull 槽出门，过 `mediaBody` 嗅探，和 `media_pull` 共用每任务 8GB 额度）。
- 最低扩展版本：2.6.0。老扩展回 `LOAD_DENIED`（没有能力包 capture），云端翻成 `EXT_OUTDATED`。

## action

| action | payload | 返回 |
|---|---|---|
| `capture.status` | — | `started` `stopped` `drm` `overflow` `hidden`；`site`（id、title、duration、quality、ad）；`video`（currentTime、duration、paused、ended、rate、muted）；`duration`；`played`、`gaps`（[起, 止] 秒）；`main`、`pinned`、`repins`；`sources[]`（`tracks[]`：id、mime、appends、bytes、queued、run）；`held` `recorded` `pulled` |
| `capture.start` | `maxHeight`（默认 1080）、`rate`（1–16，默认 16）、`from`（秒，默认 0） | 静音、锁画质、等播放源稳定、跳到 from、加速播放；返回 `quality` 和 status。定下正片的播放源（`pinned`） |
| `capture.seek` | `t`（秒） | 跳过去接着播（补空档用）；返回 status |
| `capture.pull` | `track`、`max`（字节，64KB–16MB，默认 8MB） | 这条轨排在最前、同一段（run）里的若干次 append 拼起来：`{ track, source, mime, run, bytes, more }`，字节经 pull 槽（云端 `call` 带 `"pull":true`）。没有排队的字节时 `bytes: 0` |
| `capture.stop` | — | 停录、暂停、恢复倍速和静音、丢掉没取走的字节。停过的页面要 `load` 带 `reload:true` 才能再 `start`（`NEED_RELOAD`） |

错误码：`EARLY_MISSING`（没装钩子：先 `load capture`）、`DRM`、`OVERFLOW`（开始前页面缓冲超过 192MB，钩子停了）、`NEED_RELOAD`、`BAD_PARAMS`。

## 字节怎么接

一条轨的字节是 MSE 字节流：初始化段（fMP4 的 ftyp+moov，或 WebM 的 EBML 头 + Segment + Info/Tracks），再是媒体段（moof+mdat，或 Cluster）。
seek、`abort()`、`changeType()` 之后 `run` 加一：新一段不能和上一段直接接，段首段尾可能断在媒体段中间。
沙箱（opus-video-maker `capture-merge.mjs`）逐段切分、丢掉不完整的边角，按解码时间（tfdt / Cluster Timecode）去重排序，再用 ffmpeg 把音视频合成 mp4。

## 站点适配

`lib/sites.js`：只管播放器怎么控制（静音、锁画质、跳转、播放）和读视频信息。YouTube 用播放器自己的接口
（换画质会重建播放源，静音要经播放器设，否则会被改回去）。没有适配器的站只用 `<video>` 的标准属性。
