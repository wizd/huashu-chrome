// @doc 在 Flow 项目里生一段视频并存到本地。args: prompt(必填), model(默认 'Omni 1.2 Flash'；Veo 写 'Veo 3.1 Fast' 之类), seconds(默认 4), resolution(默认 '720p'), aspect(默认 '16:9'), images(本机图片路径数组, 可选), mode('frames'=首帧/首尾帧 | 'reference'=参考素材, 缺省按张数：1~2 张当首尾帧), project(可选, 缺省进最近的项目), outDir(本机调用必填；HTTP 网关自动给), timeoutMs(默认 600000)。像人一样用页面：提交、看对话（反问时选最接近要求的——先保模型、再保时长至少够；停住会在对话里催，最多两次；花 credits 的确认点 Always approve in project；Flow 报错点一次 Try again；在生成时绝不回话），出结果后走 Flow 自己的 Download media（720p）取文件。不读 Flow 的 RPC。返回 {mediaId, url, file, bytes, type, width, height, projectId, secs}。
// @args {"prompt":"a paper boat floating on a calm pond","outDir":"D:/out"}
// @saved 2026-11-16
// @capability video.generate
// @requires google-account
// @home https://flow.google.com/
import { runSiteGeneration } from '../../src/lib/flow-driver.js';

export default async function ({ page, args = {}, log }) {
  return runSiteGeneration('video', { page, args, log });
}
