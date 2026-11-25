#!/usr/bin/env node
// Chrome Web Store API V2 上传脚本（仅上传更新草稿，不自动提审）。
//
// 端点参考：
//   POST https://chromewebstore.googleapis.com/upload/v2/publishers/{publisherId}/items/{itemId}:upload
//   GET  https://chromewebstore.googleapis.com/v2/publishers/{publisherId}/items/{itemId}:fetchStatus
//
// 用法：
//   # 校验本地商店 zip（不发起网络请求）
//   node scripts/cws-upload.mjs --verify-zip dist/vcorp-chrome-3.8.5.zip --expected-version 3.8.5
//
//   # 仅查询商店当前状态
//   CWS_PUBLISHER_ID=... CWS_ACCESS_TOKEN=... node scripts/cws-upload.mjs --status-only
//
//   # 上传草稿并等待异步处理完成（若有 IN_PROGRESS）
//   CWS_PUBLISHER_ID=... CWS_ACCESS_TOKEN=... node scripts/cws-upload.mjs --zip dist/vcorp-chrome-3.8.5.zip --expected-version 3.8.5

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { STORE_EXTENSION_ID } from '../src/lib/native-install.js';

export const API_BASE = 'https://chromewebstore.googleapis.com';
export const DEFAULT_ITEM_ID = STORE_EXTENSION_ID;
const IN_PROGRESS_STATES = new Set(['IN_PROGRESS', 'UPLOAD_IN_PROGRESS']);

export function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`参数 ${a} 缺少值`);
      return argv[++i];
    };
    if (a === '--zip') opts.zip = next();
    else if (a.startsWith('--zip=')) opts.zip = a.slice('--zip='.length);
    else if (a === '--verify-zip') opts.verifyZip = next();
    else if (a.startsWith('--verify-zip=')) opts.verifyZip = a.slice('--verify-zip='.length);
    else if (a === '--publisher-id') opts.publisherId = next();
    else if (a.startsWith('--publisher-id=')) opts.publisherId = a.slice('--publisher-id='.length);
    else if (a === '--item-id') opts.itemId = next();
    else if (a.startsWith('--item-id=')) opts.itemId = a.slice('--item-id='.length);
    else if (a === '--expected-version') opts.expectedVersion = next();
    else if (a.startsWith('--expected-version=')) opts.expectedVersion = a.slice('--expected-version='.length);
    else if (a === '--poll-interval-ms') opts.pollIntervalMs = Number(next());
    else if (a.startsWith('--poll-interval-ms=')) opts.pollIntervalMs = Number(a.slice('--poll-interval-ms='.length));
    else if (a === '--max-polls') opts.maxPolls = Number(next());
    else if (a.startsWith('--max-polls=')) opts.maxPolls = Number(a.slice('--max-polls='.length));
    else if (a === '--status-only') opts.statusOnly = true;
    else if (a === '-h' || a === '--help') opts.help = true;
    else throw new Error(`未知参数：${a}`);
  }
  return opts;
}

export async function inspectStoreZip(zipPath, { expectedVersion } = {}) {
  if (!zipPath) throw new Error('缺少 --zip 路径');
  if (!fs.existsSync(zipPath)) throw new Error(`ZIP 文件不存在：${zipPath}`);
  const bytes = fs.readFileSync(zipPath);
  if (bytes.length === 0) throw new Error(`ZIP 文件为空：${zipPath}`);

  const zip = await JSZip.loadAsync(bytes);
  const manifestEntry = zip.file('manifest.json');
  if (!manifestEntry) {
    throw new Error(`商店 ZIP 根目录缺少 manifest.json（请确认传入的是商店包而非 -manual.zip）：${zipPath}`);
  }
  const manifest = JSON.parse(await manifestEntry.async('string'));
  if (!manifest.version || typeof manifest.version !== 'string') {
    throw new Error(`manifest.json 缺少有效的 version 字段：${zipPath}`);
  }
  if ('key' in manifest) {
    throw new Error(`商店 ZIP 的 manifest.json 不能包含开发用 key 字段：${zipPath}`);
  }
  if (expectedVersion && manifest.version !== expectedVersion) {
    throw new Error(`商店 ZIP manifest.version (${manifest.version}) 与期望版本 (${expectedVersion}) 不一致`);
  }

  const fileCount = Object.values(zip.files).filter((entry) => !entry.dir).length;
  return {
    bytes,
    size: bytes.length,
    fileCount,
    name: manifest.name || '',
    version: manifest.version,
  };
}

function itemResourcePath(publisherId, itemId) {
  return `publishers/${encodeURIComponent(publisherId)}/items/${encodeURIComponent(itemId)}`;
}

async function readJsonResponse(res, actionLabel) {
  const raw = await res.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const detail = data ? JSON.stringify(data) : raw.slice(0, 500);
    throw new Error(`Chrome Web Store ${actionLabel} 失败（HTTP ${res.status}）：${detail || res.statusText}`);
  }
  if (!data || typeof data !== 'object') {
    throw new Error(`Chrome Web Store ${actionLabel} 返回了非 JSON 响应：${raw.slice(0, 500)}`);
  }
  return data;
}

export async function fetchItemStatus({
  publisherId,
  itemId = DEFAULT_ITEM_ID,
  token,
  apiBase = API_BASE,
  fetchImpl = globalThis.fetch,
}) {
  if (!publisherId) throw new Error('缺少 publisherId（请设置 CWS_PUBLISHER_ID 或传 --publisher-id）');
  if (!itemId) throw new Error('缺少 itemId（请设置 CWS_ITEM_ID 或传 --item-id）');
  if (!token) throw new Error('缺少 access token（请设置 CWS_ACCESS_TOKEN）');

  const url = `${apiBase}/v2/${itemResourcePath(publisherId, itemId)}:fetchStatus`;
  const res = await fetchImpl(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return readJsonResponse(res, 'fetchStatus');
}

export async function uploadToChromeWebStore({
  zipPath,
  publisherId,
  itemId = DEFAULT_ITEM_ID,
  token,
  expectedVersion,
  pollIntervalMs = 5000,
  maxPolls = 24,
  apiBase = API_BASE,
  fetchImpl = globalThis.fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log = (msg) => console.log(msg),
}) {
  if (!publisherId) throw new Error('缺少 publisherId（请设置 CWS_PUBLISHER_ID 或传 --publisher-id）');
  if (!itemId) throw new Error('缺少 itemId（请设置 CWS_ITEM_ID 或传 --item-id）');
  if (!token) throw new Error('缺少 access token（请设置 CWS_ACCESS_TOKEN）');

  const zipInfo = await inspectStoreZip(zipPath, { expectedVersion });
  const uploadUrl = `${apiBase}/upload/v2/${itemResourcePath(publisherId, itemId)}:upload`;

  log(`正在上传 ${path.basename(zipPath)}（${Math.round(zipInfo.size / 1024)}KB，版本 ${zipInfo.version}）到 Chrome Web Store 草稿...`);
  const uploadRes = await fetchImpl(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/zip',
      Accept: 'application/json',
    },
    body: zipInfo.bytes,
  });
  const uploadData = await readJsonResponse(uploadRes, 'upload');

  if (uploadData.itemId && uploadData.itemId !== itemId) {
    throw new Error(`上传响应 itemId (${uploadData.itemId}) 与目标扩展 (${itemId}) 不一致`);
  }
  if (uploadData.crxVersion && uploadData.crxVersion !== zipInfo.version) {
    throw new Error(`上传响应 crxVersion (${uploadData.crxVersion}) 与 ZIP 版本 (${zipInfo.version}) 不一致`);
  }

  const initialState = uploadData.uploadState;
  if (initialState === 'SUCCEEDED') {
    return {
      status: 'SUCCEEDED',
      itemId: uploadData.itemId || itemId,
      crxVersion: uploadData.crxVersion || zipInfo.version,
      uploadState: initialState,
      polls: 0,
      response: uploadData,
    };
  }

  if (IN_PROGRESS_STATES.has(initialState)) {
    log(`上传已接收（uploadState=${initialState}），开始轮询 fetchStatus（最多 ${maxPolls} 次）...`);
    let lastStatus = null;
    for (let attempt = 1; attempt <= maxPolls; attempt++) {
      await sleep(pollIntervalMs);
      lastStatus = await fetchItemStatus({ publisherId, itemId, token, apiBase, fetchImpl });
      const asyncState = lastStatus.lastAsyncUploadState;
      log(`第 ${attempt}/${maxPolls} 次轮询：lastAsyncUploadState=${asyncState}`);
      if (asyncState === 'SUCCEEDED') {
        return {
          status: 'SUCCEEDED',
          itemId: lastStatus.itemId || itemId,
          crxVersion: zipInfo.version,
          uploadState: asyncState,
          polls: attempt,
          response: uploadData,
          statusResponse: lastStatus,
        };
      }
      if (asyncState === 'FAILED') {
        throw new Error(`Chrome Web Store 异步处理上传失败：${JSON.stringify(lastStatus)}`);
      }
      if (!IN_PROGRESS_STATES.has(asyncState)) {
        throw new Error(`Chrome Web Store 异步上传返回非预期状态 ${asyncState}：${JSON.stringify(lastStatus)}`);
      }
    }
    return {
      status: 'PENDING',
      itemId: uploadData.itemId || itemId,
      crxVersion: zipInfo.version,
      uploadState: 'IN_PROGRESS',
      polls: maxPolls,
      response: uploadData,
      statusResponse: lastStatus,
    };
  }

  throw new Error(`Chrome Web Store 上传未成功（uploadState=${initialState}）：${JSON.stringify(uploadData)}`);
}

async function runCli() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log([
      '用法：node scripts/cws-upload.mjs [选项]',
      '  --zip <path>                上传的商店 ZIP 路径',
      '  --verify-zip <path>         仅校验本地商店 ZIP，不发起网络请求',
      '  --expected-version <ver>    校验 ZIP manifest.version 与此版本一致',
      '  --status-only               仅调用 :fetchStatus 查询扩展当前状态',
      '  --publisher-id <id>         覆盖环境变量 CWS_PUBLISHER_ID',
      `  --item-id <id>              覆盖环境变量 CWS_ITEM_ID（默认 ${DEFAULT_ITEM_ID}）`,
      '  --poll-interval-ms <ms>     IN_PROGRESS 轮询间隔（默认 5000）',
      '  --max-polls <n>             IN_PROGRESS 最大轮询次数（默认 24）',
    ].join('\n'));
    return;
  }

  if (opts.verifyZip) {
    const info = await inspectStoreZip(opts.verifyZip, { expectedVersion: opts.expectedVersion });
    console.log(JSON.stringify({
      verified: true,
      zip: opts.verifyZip,
      name: info.name,
      version: info.version,
      size: info.size,
      fileCount: info.fileCount,
      hasKey: false,
    }, null, 2));
    return;
  }

  const publisherId = opts.publisherId || process.env.CWS_PUBLISHER_ID || '';
  const itemId = opts.itemId || process.env.CWS_ITEM_ID || DEFAULT_ITEM_ID;
  const token = process.env.CWS_ACCESS_TOKEN || '';

  if (opts.statusOnly) {
    const status = await fetchItemStatus({ publisherId, itemId, token });
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  const result = await uploadToChromeWebStore({
    zipPath: opts.zip,
    publisherId,
    itemId,
    token,
    expectedVersion: opts.expectedVersion,
    pollIntervalMs: Number.isFinite(opts.pollIntervalMs) ? opts.pollIntervalMs : 5000,
    maxPolls: Number.isFinite(opts.maxPolls) ? opts.maxPolls : 24,
  });

  if (result.status === 'PENDING') {
    console.error(`上传仍在处理中（IN_PROGRESS），已轮询 ${result.polls} 次仍未完成。请前往 Chrome Web Store Developer Dashboard 核对 ${result.itemId} 的 ${result.crxVersion} 草稿状态。`);
    process.exitCode = 2;
    return;
  }

  console.log(`Chrome Web Store 草稿上传成功：itemId=${result.itemId} · crxVersion=${result.crxVersion} · uploadState=${result.uploadState}（轮询 ${result.polls} 次）。`);
  console.log('未自动提审；如需发布，请前往 https://chrome.google.com/webstore/devconsole 确认草稿后手动提交审核。');
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
