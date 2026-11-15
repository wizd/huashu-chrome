// @doc 在 Flow 项目里生一张图并存到本地。args: prompt(必填), aspect('16:9'|'4:3'|'1:1'|'3:4'|'9:16', 可选), images(本机图片路径数组, 可选=图生图), model(可选, 如 'Nano Banana Pro', 写进提示词), project(项目ID, 可选, 缺省进最近的项目), outDir(本机调用必填；HTTP 网关自动给), timeoutMs(默认180000)。返回 {mediaId, sessionId, projectId, file, bytes, width, height, secs}。UI 提交（首次点击常被吞，按输入框是否清空重试）+ 读 as29s 响应拿签名 URL，Node 端下载（签名 URL 不需要 cookie；页面内 fetch 被跨域拦）。
// @args {"prompt":"...","aspect":"1:1","outDir":"D:/out"}
// @saved 2026-11-14
// @capability image.generate
// @requires google-account
// @home https://flow.google.com/
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

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
const findDims = (o) => { if (Array.isArray(o)) { if (o.length === 2 && o.every((n) => Number.isInteger(n) && n > 64 && n < 10000)) return o; for (const x of o) { const r = findDims(x); if (r) return r; } } return null; };

// 参考图：本地文件 → 拖进输入框（只是上传进项目的 Uploads）→ 配料面板 Uploads 里按文件名点它（这一下才挂到提示词上）。
// 先复制成唯一文件名，免得面板里同名文件点错。按顺序挂，返回各图在 Flow 里的 mediaId（读结果时要排除它们）。
export async function attachImages(page, files, { log = () => {}, sleep }) {
  if (!files?.length) return [];
  const chips = () => page.evaluate(() => [...document.querySelectorAll('img[alt="Ingredient image"]')].map((i) => i.src.match(/image\/([0-9a-f-]{36})/)?.[1]).filter(Boolean));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-in-'));
  const tag = Math.random().toString(36).slice(2, 8);
  for (let i = 0; i < files.length; i++) {
    const src = files[i];
    if (!fs.existsSync(src)) throw Object.assign(new Error(`参考图不存在：${src}`), { code: 'BAD_ARGS' });
    const name = `ref${i + 1}-${tag}${path.extname(src).toLowerCase() || '.png'}`;
    const f = path.join(tmp, name);
    fs.copyFileSync(src, f);
    const before = (await chips()).length;
    await page.locator('.ProseMirror').dropFiles([f]);
    let done = false;
    for (let k = 0; k < 40 && !done; k++) {   // 上传要几秒，面板里没出现就关了重开
      await sleep(1500);
      if (!(await page.locator('.cdk-overlay-container button[role=option]').count())) {
        await page.getByRole('button', { name: 'Add ingredients to the prompt box' }).click();
        await sleep(700);
        const up = page.locator('.cdk-overlay-container').getByText('Uploads', { exact: true });
        if (await up.count()) { await up.click({ js: true }); await sleep(700); }
      }
      const opt = page.locator('.cdk-overlay-container button[role=option]').filter({ hasText: name });
      if (await opt.count()) {
        await opt.nth(0).click();
        for (let w = 0; w < 10 && !done; w++) { await sleep(500); done = (await chips()).length > before; }
      } else if (k % 3 === 2) await page.keyboard('Escape');
    }
    if (!done) throw Object.assign(new Error(`第 ${i + 1} 张参考图没挂上提示词`), { code: 'ATTACH_FAILED' });
    log(`参考图 ${i + 1}/${files.length} 已挂上`);
  }
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* 临时文件 */ }
  return chips();
}

// 进项目页：给了 project 就直达；否则留在当前项目，或从首页打开最近的项目，一个都没有就新建
export async function openProject(page, project) {
  const cur = await page.url();
  if (/accounts\.google\.com/.test(cur)) throw Object.assign(new Error('Google 没登录'), { code: 'NOT_LOGGED_IN' });
  if (project) { if (!cur.includes(project)) await page.goto(`https://flow.google.com/project/${project}`); return; }
  if (/flow\.google\.com\/project\//.test(cur)) return;
  if (!/flow\.google\.com/.test(cur)) await page.goto('https://flow.google.com/');
  const open = page.getByRole('link', { name: 'Open project' }).nth(0);
  try { await open.waitFor({ timeout: 15000 }); await open.click(); } catch {
    await page.getByRole('button', { name: 'New project' }).click();
  }
  await page.waitForURL(/\/project\//, { timeout: 30000 });
}

export default async function ({ page, args = {}, log, sleep, expect }) {
  expect(args.prompt, '缺 prompt');
  expect(args.outDir, '缺 outDir');
  const t0 = Date.now();
  const timeout = args.timeoutMs || 180000;

  // 1. 项目页（没给 project 就进最近一个项目）
  await openProject(page, args.project);
  const box = page.getByRole('textbox', { name: 'What do you want to create?' });
  await box.waitFor();

  // 2. 新会话，避免旧媒体的响应混进来
  const ns = page.getByRole('button', { name: 'Start new session' });
  if (await ns.count()) { await ns.click(); await sleep(800); }

  // 3. 比例
  if (args.aspect) {
    await page.getByRole('button', { name: 'Settings' }).nth(1).click();
    await sleep(800);
    await page.locator('.cdk-overlay-container').getByText(args.aspect, { exact: true }).click({ js: true });
    await sleep(400);
    await page.keyboard('Escape');
  }

  // 3b. 参考图（图生图）。as29s 里也会带回参考图本身，读结果时排除
  const refIds = await attachImages(page, args.images, { log, sleep });

  // 4. 填提示词并提交。首次点击常只关掉建议浮层：以输入框清空为准，没清空就再点
  // 设置面板里的比例只是默认值，agent 不一定采用（实测 1:1 已选中仍出 1376x768）。写进提示词才稳
  const extras = [
    args.model && `Use ${args.model}.`,
    refIds.length && (refIds.length > 1 ? `Use the ${refIds.length} attached images (in order) as references.` : 'Use the attached image as the reference.'),
    args.aspect && `Aspect ratio ${args.aspect}.`,
    'Only one image.',
  ].filter(Boolean).join(' ');
  await box.fill(`${args.prompt}. ${extras}`);
  const promptLeft = () => page.evaluate(() => (document.querySelector('.ProseMirror')?.textContent || '').trim().length);
  let submitted = false;
  for (let i = 0; i < 3 && !submitted; i++) {
    await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Start generation' || /Start generation/.test(x.innerText)); return b && !b.disabled; });
    await page.getByRole('button', { name: 'Start generation' }).click();
    for (let k = 0; k < 8 && !submitted; k++) { await sleep(500); submitted = (await promptLeft()) === 0; }
    if (!submitted) log(`第 ${i + 1} 次点击未提交，重试`);
  }
  expect(submitted, '点了 3 次 Start generation，提示词仍在输入框里，没提交出去');

  // 5. 读结果：as29s 里的 flow-content 签名 URL
  let media = null;
  while (!media) {
    const left = timeout - (Date.now() - t0);
    expect(left > 0, `等了 ${timeout}ms 没拿到 as29s`);
    let r;
    try { r = await page.waitForResponse('rpcids=as29s', { timeout: Math.min(left, 20000) }); } catch (e) {
      if (e.code !== 'TIMEOUT') throw e;
      const err = await page.evaluate(() => (document.querySelector('main')?.textContent || '').match(/(couldn.t|unable to|violat|policy|try again)[^\n]{0,160}/i)?.[0] || '');
      if (err) throw Object.assign(new Error(`Flow 未出图：${err}`), { code: 'FLOW_REFUSED' });
      continue;
    }
    for (const p of parseRpc(r.text(), 'as29s')) {
      if (refIds.includes(p[0])) continue;
      const url = findStr(p, /^https:\/\/flow-content\.google\/image\//);
      if (url) { media = { mediaId: p[0], projectId: p[1], sessionId: p[2], url, dims: findDims(p) }; break; }
    }
  }

  // 6. 下载（Node 端；签名 URL 约 6 小时有效，不需要 cookie）
  const res = await fetch(media.url);
  if (!res.ok) throw Object.assign(new Error(`下载失败 ${res.status}`), { code: 'DOWNLOAD' });
  const type = res.headers.get('content-type') || '';
  const ext = /png/.test(type) ? 'png' : /webp/.test(type) ? 'webp' : 'jpg';
  fs.mkdirSync(args.outDir, { recursive: true });
  const file = path.join(args.outDir, `${media.mediaId}.${ext}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));

  return { mediaId: media.mediaId, sessionId: media.sessionId, projectId: media.projectId, url: media.url, refs: refIds, file, bytes: fs.statSync(file).size, type, width: media.dims?.[0], height: media.dims?.[1], secs: (Date.now() - t0) / 1000 };
}
