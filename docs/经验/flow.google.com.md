# Google Flow (flow.google.com)

2026-11-14 实测（前端 boq_labs-ai-sandbox-frontend_20261111.08_p0）。站点函数：flow.google.com/generate_image、flow.google.com/generate_video（均已跑通，含参考图）。网关的 flow2api 兼容层（OpenAI/Gemini 格式）就是调这两个函数。

2026-11-16 起两个站点函数改用共享的 Flow 驱动 src/lib/flow-driver.js（和 opus-video-maker 云端用的是同一套做法）：只靠 flow 能力包读页面，不再读 as29s 等 RPC；每一眼都读对话（反问选最接近要求的、停住在对话里催、确认点 Always approve、报错点一次 Try again）；视频走 Flow 自己的 Download media。返回的 url 是 https://flow-content.google/{image|video}/{mediaId} 形状，直接下载要登录，用网关的 /v1/media?url= 取。下面关于 RPC 的记录是旧做法，留作参考。

## 界面
- 项目页 /project/{projectId} 是对话式 agent：输入框 textbox "What do you want to create?"（ProseMirror），按钮 "Start generation"。
- 首次点击 Start generation 常只关掉建议浮层、没提交。以"输入框清空"为准（依赖全局设置 Clear prompt on submit 开着），没清空就再点；扩展会升级为真实事件。
- 第二个 "Settings"（图标 tune）里的比例只是默认值，agent 不一定采用（选 1:1 仍出 1376x768）。比例、模型、时长、分辨率都写进提示词才稳（写 "Aspect ratio 1:1." 出 1024x1024）。
- 账户弹窗 Escape 关不掉，点 "Close account panel"，否则后面的点击全落空。余额在 Account details：1000 credits/周期。
- 后台标签页能正常生图生视频。

## 参考图（图生图 / 首尾帧 / 参考素材）
- 把文件拖进 .ProseMirror（dropFiles）只是上传进项目的 Uploads，不会挂到提示词上。
- 挂上：点 "Add ingredients to the prompt box" → 浮层 .cdk-overlay-container 里点文字 "Uploads"（js 点）→ 点 button[role=option] 里文件名对应的那项。上传要几秒，期间点 option 没反应，等一下再点；点中后面板自己关、提示词区出现 img[alt="Ingredient image"]（src 是 flow-content.google/image/{mediaId}）。
- 先把文件复制成唯一名字再拖，免得 Uploads 里同名旧文件点错。多张按挂的顺序排，提示词里说 "attached image 1 / 2"。
- as29s 里会带回参考图本身的媒体，读结果要排除参考图的 mediaId。
- 首帧：提示词写 "Use the attached image as the first frame." 实测 Omni 1.2 Flash 3s 360p 第一帧就是原图，3 credits。首尾帧/参考素材（r2v）同法写在提示词里，尚未逐一实测。

## 计费 / 确认
- 生图 Nano Banana 2.1：0 credits，约 35-60 秒；带参考图 55-95 秒。
- 视频（agent 自报，3 credits 已实扣核实）：Omni 1.2 Flash 3s 360p=3（720p=9）；Omni 1.1 Flash 4s 360p=4；Veo 3.1 Lite/Fast/Quality 8s=10/20/100。Omni 3s 360p 约 60-80 秒出片。
- 视频前 agent 会问"costing N credits?"，选项 Approve / Always approve in project / Reject 不是 <button>，按文字节点点。不点约 5 分钟后超时、不扣费。项目里点过 Always approve 后不再询问。

## 网络（batchexecute，rpcids 区分）
- WuwhI 提交确认；vrrFtb 会话信息；bOKtO 会话媒体列表；DA4VGb/Kcr7Ub agent 过程。
- jwpduf：生成中轮询，p[1] = 剩余 credits。
- as29s：媒体详情，含签名 URL https://flow-content.google/image/{mediaId}?... 和视频的 https://flow-content.google/video/{mediaId}?...。同一条里封面 image URL 排在前面，找视频要专门匹配 /video/。
- 签名 URL 约 6 小时有效，不需要 cookie，Node 端直接 fetch。页面内 fetch 被跨域/CSP 拦。
- 生成请求和上传本身不在 page.requests() 里（可能走流式通道），不影响"UI 提交、网络读结果"。
- 响应格式：)]}' 前缀，分块，["wrb.fr", rpcid, "<JSON 字符串>"]。
- 扩展重载后页面上的网络记录钩子会丢；网关的 ensureNet 会自动重装（刷新一次页面），否则函数读不到结果却已经提交了生成。
