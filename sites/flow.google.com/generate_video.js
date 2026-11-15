// @doc 在 Flow 项目里生一段视频并存到本地。args: prompt(必填), model(默认 'Omni 1.2 Flash'), seconds(默认 3), resolution(默认 '360p'), aspect(默认 '16:9'), images(本机图片路径数组, 可选), mode('frames'=首帧/首尾帧 | 'reference'=参考素材, 缺省按张数), project(可选, 缺省进最近的项目), outDir(本机调用必填；HTTP 网关自动给), timeoutMs(默认 600000)。Flow 的 agent 会弹「花 N credits？」确认，本函数点 Always approve in project。读 as29s 里的 flow-content.google/video 签名 URL，Node 端下载。返回 {mediaId, sessionId, projectId, file, bytes, creditsLeft, secs}。
// @args {"prompt":"a paper boat floating on a calm pond","outDir":"D:/out"}
// @saved 2026-11-14
// @capability video.generate
// @requires google-account
// @home https://flow.google.com/
import fs from 'node:fs';
import path from 'node:path';
import { openProject, attachImages } from './generate_image.js';

const parseRpc = (text, rpc) => {
  const out = [];
  for (const line of String(text).split('\n')) {
    if (!line.startsWith('[[')) continue;
    let arr; try { arr = JSON.parse(line); } catch { continue; }
    for (const e of arr) if (e[0] === 'wrb.fr' && e[1] === rpc && e[2]) { try { out.push(JSON.parse(e[2])); } catch { /* skip */ } }
  }
  return out;
};
const findStr = (o, re) => { if (typeof o === 'string') return re.test(o) ? o : null; if (Array.isArray(o)) for (const x of o) { const r = findStr(x, re); if (r) return r; } return null; };

export default async function ({ page, args = {}, log, sleep, expect }) {
  expect(args.prompt, '缺 prompt');
  expect(args.outDir, '缺 outDir');
  const t0 = Date.now();
  const timeout = args.timeoutMs || 600000;
  const model = args.model || 'Omni 1.2 Flash';
  const spec = `${args.seconds || 3} seconds, ${args.resolution || (/omni/i.test(model) ? '360p' : '720p')}, ${args.aspect || '16:9'}`;

  // 1. 项目页 + 新会话
  await openProject(page, args.project);
  const box = page.getByRole('textbox', { name: 'What do you want to create?' });
  await box.waitFor();
  const ns = page.getByRole('button', { name: 'Start new session' });
  if (await ns.count()) { await ns.click(); await sleep(800); }

  // 1b. 参考图。mode: 'frames'＝首帧(+尾帧)，'reference'＝参考素材（人物/风格），缺省按张数猜：1~2 张当首尾帧
  const refIds = await attachImages(page, args.images, { log, sleep });
  const mode = args.mode || (refIds.length ? (refIds.length <= 2 ? 'frames' : 'reference') : null);
  const use = !refIds.length ? ''
    : mode === 'frames' ? (refIds.length === 1 ? ' Use the attached image as the first frame.' : ' Use attached image 1 as the first frame and attached image 2 as the last frame.')
    : ` Use the ${refIds.length} attached images as reference ingredients (keep their subjects and style), not as frames.`;

  // 2. 提交（agent 按提示词选模型/时长；首次点击常被吞，以输入框清空为准）
  await box.fill(`Generate one video with ${model}, ${spec}: ${args.prompt}.${use} Only this one video, nothing else.`);
  const promptLeft = () => page.evaluate(() => (document.querySelector('.ProseMirror')?.textContent || '').trim().length);
  let submitted = false;
  for (let i = 0; i < 3 && !submitted; i++) {
    await page.getByRole('button', { name: 'Start generation' }).click();
    for (let k = 0; k < 8 && !submitted; k++) { await sleep(500); submitted = (await promptLeft()) === 0; }
  }
  expect(submitted, '点了 3 次 Start generation，提示词仍在输入框里');

  // 3. 循环：点确认 → 等 as29s 里的 video URL
  let approved = false; let media = null; let creditsLeft = null;
  while (!media) {
    const left = timeout - (Date.now() - t0);
    expect(left > 0, `等了 ${timeout}ms 没拿到视频`);
    if (!approved) {
      // 确认项不是 <button>，按文字找。项目里点过一次 Always approve 后就不会再出现
      const found = await page.evaluate(() => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
        while ((n = w.nextNode())) if (n.nodeValue.trim() === 'Always approve in project' && !n.parentElement.closest('[data-flow-done]')) { n.parentElement.setAttribute('data-flow-always', '1'); return true; }
        return false;
      });
      if (found) { await page.locator('[data-flow-always="1"]').click(); approved = true; log('已点 Always approve in project'); }
    }
    const tail = await page.evaluate(() => (document.querySelector('main')?.textContent || '').slice(-1500));
    if (/timed out waiting for confirmation/i.test(tail)) throw Object.assign(new Error('Flow 等确认超时，没生成'), { code: 'APPROVAL_TIMEOUT' });
    const err = tail.match(/(couldn.t|unable to|violat|policy|not enough credits)[^\n]{0,160}/i)?.[0];
    if (err) throw Object.assign(new Error(`Flow 未出视频：${err}`), { code: 'FLOW_REFUSED' });

    let r;
    try { r = await page.waitForResponse(/rpcids=(as29s|jwpduf)/, { timeout: Math.min(left, 10000) }); } catch (e) { if (e.code !== 'TIMEOUT') throw e; continue; }
    if (/jwpduf/.test(r.url)) { const p = parseRpc(r.text(), 'jwpduf')[0]; if (p && Number.isInteger(p[1])) creditsLeft = p[1]; continue; }
    for (const p of parseRpc(r.text(), 'as29s')) {
      // 同一条里先出现封面 image URL，必须专门找 /video/
      const url = findStr(p, /^https:\/\/flow-content\.google\/video\//);
      if (url) { media = { mediaId: p[0], projectId: p[1], sessionId: p[2], url }; break; }
    }
  }

  // 4. 下载（签名 URL 不需要 cookie，约 6 小时有效）
  const res = await fetch(media.url);
  if (!res.ok) throw Object.assign(new Error(`下载失败 ${res.status}`), { code: 'DOWNLOAD' });
  fs.mkdirSync(args.outDir, { recursive: true });
  const file = path.join(args.outDir, `${media.mediaId}.mp4`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return { mediaId: media.mediaId, sessionId: media.sessionId, projectId: media.projectId, url: media.url, refs: refIds, mode, file, bytes: fs.statSync(file).size, creditsLeft, secs: (Date.now() - t0) / 1000 };
}
