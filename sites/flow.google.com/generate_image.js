// @doc 在 Flow 项目里生一张图并存到本地。args: prompt(必填), aspect('16:9'|'4:3'|'1:1'|'3:4'|'9:16', 可选), images(本机图片路径数组, 可选=图生图), model(可选, 如 'Nano Banana 2.1', 写进提示词), project(项目ID, 可选, 缺省进最近的项目), outDir(本机调用必填；HTTP 网关自动给), timeoutMs(默认300000)。像人一样用页面：提交、看对话（反问会选、停住会催、花 credits 的确认点 Always approve in project、Flow 报错点一次 Try again），认出新出现的图，在页面里取字节。不读 Flow 的 RPC。返回 {mediaId, url, file, bytes, type, width, height, projectId, secs}。
// @args {"prompt":"...","aspect":"1:1","outDir":"D:/out"}
// @saved 2026-11-16
// @capability image.generate
// @requires google-account
// @home https://flow.google.com/
import { runSiteGeneration } from '../../src/lib/flow-driver.js';

export default async function ({ page, args = {}, log }) {
  return runSiteGeneration('image', { page, args, log });
}
