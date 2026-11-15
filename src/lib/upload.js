// 本机文件 → 页面里的 file input。upload 工具和 script 里的 setInputFiles 共用这一条路。
//
// 先把**路径**交给扩展，让它用 CDP 的 DOM.setFileInputFiles 让浏览器自己读盘——
// 桥一个字节都不搬，300MB 的视频和 30KB 的图走同一条路。
// 只有拖放（页面没有 file input）真的需要字节，那时才在这一侧读文件；
// base64 始终不经过 agent 的 context。
import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.pdf': 'application/pdf',
};

// 拖放要把文件搬进浏览器；超过这个数就明确报错，不要拿桥去撞——
// 桥一断，当前 agent 会话就再也连不回来了，比报错难查得多。
export const DROP_MAX = 48 * 1024 * 1024;

export async function uploadFile(bridge, { path: file, selector, dropSelector, tabId }, device) {
  const st = fs.statSync(file);
  const mime = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const base = { path: file, name: path.basename(file), type: mime, bytes: st.size, selector, dropSelector };
  // 上传本身可能很慢（本机→浏览器只是投喂，但页面自己的上传要时间），给足预算
  const timeoutMs = Math.max(60000, Math.round(st.size / (1024 * 1024)) * 1000);
  let out = dropSelector ? null : await bridge.call('upload', base, { tabId, timeoutMs, device });
  if (!out || out.needBytes) {
    if (st.size > DROP_MAX) {
      const why = out?.reason ? `（${out.reason}）` : '';
      throw new Error(`这个页面只能拖放上传${why}，而拖放要把文件搬进浏览器，` +
        `${(st.size / 1024 / 1024).toFixed(0)}MB 超过 ${DROP_MAX / 1024 / 1024}MB 上限。` +
        `先压小，或改用页面上真实存在的 file input（给 selector）。`);
    }
    out = await bridge.call('upload', { ...base, base64: fs.readFileSync(file).toString('base64') },
      { tabId, timeoutMs, device });
  }
  return out;
}
