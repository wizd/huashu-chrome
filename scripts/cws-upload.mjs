#!/usr/bin/env node
// Chrome Web Store API V2 上传与提审脚本。
//
// 端点参考：
//   POST https://chromewebstore.googleapis.com/upload/v2/publishers/{publisherId}/items/{itemId}:upload
//   GET  https://chromewebstore.googleapis.com/v2/publishers/{publisherId}/items/{itemId}:fetchStatus
//   POST https://chromewebstore.googleapis.com/v2/publishers/{publisherId}/items/{itemId}:cancelSubmission
//   POST https://chromewebstore.googleapis.com/v2/publishers/{publisherId}/items/{itemId}:publish
//
// 用法：
//   # 校验本地商店 zip（不发起网络请求）
//   node scripts/cws-upload.mjs --verify-zip dist/vcorp-chrome-3.8.6.zip --expected-version 3.8.6
//
//   # 仅查询商店当前状态
//   CWS_PUBLISHER_ID=... CWS_ACCESS_TOKEN=... node scripts/cws-upload.mjs --status-only
//
//   # 仅上传草稿（不提审）
//   CWS_PUBLISHER_ID=... CWS_ACCESS_TOKEN=... node scripts/cws-upload.mjs --zip dist/vcorp-chrome-3.8.6.zip --expected-version 3.8.6
//
//   # 上传并自动提审（若旧版在审则先撤回旧审核）
//   CWS_PUBLISHER_ID=... CWS_ACCESS_TOKEN=... node scripts/cws-upload.mjs --zip dist/vcorp-chrome-3.8.7.zip --expected-version 3.8.7 --publish-type DEFAULT_PUBLISH --cancel-pending-review

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { STORE_EXTENSION_ID } from '../src/lib/native-install.js';

export const API_BASE = 'https://chromewebstore.googleapis.com';
export const DEFAULT_ITEM_ID = STORE_EXTENSION_ID;
const IN_PROGRESS_STATES = new Set(['IN_PROGRESS', 'UPLOAD_IN_PROGRESS']);
const PUBLISHED_STATES = new Set(['PUBLISHED', 'PUBLISHED_TO_TESTERS']);
const SUCCESSFUL_PUBLISH_STATES = new Set([
  'PENDING_REVIEW',
  'STAGED',
  'PUBLISHED',
  'PUBLISHED_TO_TESTERS',
]);

export function normalizePublishType(raw) {
  if (raw === undefined || raw === null || raw === false) return null;
  if (typeof raw !== 'string') {
    throw new Error(`无效的 publishType：${String(raw)}（仅支持 default / staged / DEFAULT_PUBLISH / STAGED_PUBLISH）`);
  }
  const normalized = raw.trim().toLowerCase();
  if (!normalized || normalized === 'false' || normalized === 'none' || normalized === 'draft') {
    return null;
  }
  if (normalized === 'default' || normalized === 'default_publish') {
    return 'DEFAULT_PUBLISH';
  }
  if (normalized === 'staged' || normalized === 'staged_publish') {
    return 'STAGED_PUBLISH';
  }
  throw new Error(`无效的 publishType：${raw}（仅支持 default / staged / DEFAULT_PUBLISH / STAGED_PUBLISH）`);
}

function parseChromeVersion(version) {
  if (typeof version !== 'string') return null;
  const trimmed = version.trim();
  if (!/^\d+(?:\.\d+){0,3}$/.test(trimmed)) return null;
  const parts = trimmed.split('.').map((seg) => Number(seg));
  if (parts.some((n) => !Number.isInteger(n) || n < 0 || n > 65535)) return null;
  while (parts.length < 4) parts.push(0);
  return parts;
}

export function compareChromeVersions(a, b) {
  const pa = parseChromeVersion(a);
  const pb = parseChromeVersion(b);
  if (!pa || !pb) return null;
  for (let i = 0; i < 4; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

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
    else if (a === '--publish') {
      if (!opts.publishType) opts.publishType = 'DEFAULT_PUBLISH';
    }
    else if (a === '--publish-type') opts.publishType = normalizePublishType(next());
    else if (a.startsWith('--publish-type=')) opts.publishType = normalizePublishType(a.slice('--publish-type='.length));
    else if (a === '--cancel-pending-review') opts.cancelPendingReview = true;
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

async function readJsonResponse(res, actionLabel, { allowEmpty = false } = {}) {
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
  if (allowEmpty && !raw.trim()) {
    return {};
  }
  if (!data || typeof data !== 'object') {
    throw new Error(`Chrome Web Store ${actionLabel} 返回了非 JSON 响应：${raw.slice(0, 500)}`);
  }
  return data;
}

function assertAuthParams({ publisherId, itemId, token }) {
  if (!publisherId) throw new Error('缺少 publisherId（请设置 CWS_PUBLISHER_ID 或传 --publisher-id）');
  if (!itemId) throw new Error('缺少 itemId（请设置 CWS_ITEM_ID 或传 --item-id）');
  if (!token) throw new Error('缺少 access token（请设置 CWS_ACCESS_TOKEN）');
}

function formatChannelVersions(channels) {
  if (!Array.isArray(channels) || channels.length === 0) return '未知';
  return channels.map((ch) => ch?.crxVersion || '未知').join(', ');
}

export async function fetchItemStatus({
  publisherId,
  itemId = DEFAULT_ITEM_ID,
  token,
  apiBase = API_BASE,
  fetchImpl = globalThis.fetch,
}) {
  assertAuthParams({ publisherId, itemId, token });

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

export async function cancelItemSubmission({
  publisherId,
  itemId = DEFAULT_ITEM_ID,
  token,
  apiBase = API_BASE,
  fetchImpl = globalThis.fetch,
}) {
  assertAuthParams({ publisherId, itemId, token });

  const url = `${apiBase}/v2/${itemResourcePath(publisherId, itemId)}:cancelSubmission`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return readJsonResponse(res, 'cancelSubmission', { allowEmpty: true });
}

export async function publishItem({
  publisherId,
  itemId = DEFAULT_ITEM_ID,
  token,
  publishType = 'DEFAULT_PUBLISH',
  skipReview = false,
  apiBase = API_BASE,
  fetchImpl = globalThis.fetch,
}) {
  assertAuthParams({ publisherId, itemId, token });
  const normalizedType = normalizePublishType(publishType);
  if (!normalizedType) {
    throw new Error('publishItem 需要指定有效的 publishType（DEFAULT_PUBLISH 或 STAGED_PUBLISH）');
  }

  const url = `${apiBase}/v2/${itemResourcePath(publisherId, itemId)}:publish`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      publishType: normalizedType,
      skipReview: Boolean(skipReview),
    }),
  });
  const data = await readJsonResponse(res, 'publish');
  if (data.itemId && data.itemId !== itemId) {
    throw new Error(`提审响应 itemId (${data.itemId}) 与目标扩展 (${itemId}) 不一致`);
  }
  if (!SUCCESSFUL_PUBLISH_STATES.has(data.state)) {
    throw new Error(`Chrome Web Store publish 未进入审核或发布状态（state=${data.state || 'EMPTY'}）：${JSON.stringify(data)}`);
  }
  return data;
}

async function prepareForUpload({
  targetVersion,
  publisherId,
  itemId,
  token,
  cancelPendingReview,
  pollIntervalMs,
  maxPolls,
  apiBase,
  fetchImpl,
  sleep,
  log,
}) {
  const currentStatus = await fetchItemStatus({ publisherId, itemId, token, apiBase, fetchImpl });

  const published = currentStatus.publishedItemRevisionStatus;
  const publishedState = published?.state || '';
  const publishedChannels = Array.isArray(published?.distributionChannels) ? published.distributionChannels : [];
  if (publishedChannels.length > 0) {
    const publishedCmps = publishedChannels
      .map((ch) => ({ version: ch?.crxVersion, cmp: compareChromeVersions(ch?.crxVersion, targetVersion) }))
      .filter((entry) => entry.cmp !== null);
    const newerPublished = publishedCmps.filter((entry) => entry.cmp > 0).map((entry) => entry.version);
    if (newerPublished.length > 0) {
      throw new Error(`商店已存在更高已发布版本（${newerPublished.join(', ')} > ${targetVersion}），已保留现状，未执行撤回、上传或提审。`);
    }
    const samePublished = publishedCmps.some((entry) => entry.cmp === 0);
    if (samePublished && PUBLISHED_STATES.has(publishedState)) {
      log(`版本 ${targetVersion} 已在 Chrome Web Store 处于发布状态（${publishedState}），幂等跳过上传与提审。`);
      return {
        shortCircuit: {
          status: 'ALREADY_PUBLISHED',
          itemId: currentStatus.itemId || itemId,
          crxVersion: targetVersion,
          state: publishedState,
          cancelledPreviousReview: false,
          polls: 0,
          statusResponse: currentStatus,
        },
      };
    }
  }

  const submitted = currentStatus.submittedItemRevisionStatus;
  const submittedState = submitted?.state || '';

  if (submittedState === 'STAGED') {
    throw new Error(
      `商店存在已过审待发布的暂存版本（state=STAGED，版本=${formatChannelVersions(submitted?.distributionChannels)}），已保留现状，未执行撤回、上传或提审；请先在 Chrome Web Store 开发者后台处理。`,
    );
  }

  if (submittedState === 'PENDING_REVIEW') {
    const channels = submitted?.distributionChannels;
    if (!Array.isArray(channels) || channels.length === 0) {
      throw new Error('商店存在审核中提交（state=PENDING_REVIEW），但响应缺少 distributionChannels/crxVersion，无法确认所有待审版本均低于目标版本，已保留现有审核。');
    }

    const comparisons = [];
    for (const ch of channels) {
      const ver = ch?.crxVersion;
      const cmp = compareChromeVersions(ver, targetVersion);
      if (cmp === null) {
        throw new Error(
          `商店存在审核中提交（state=PENDING_REVIEW），但待审版本（${ver ?? '缺失'}）或目标版本（${targetVersion}）无法按 Chrome 版本格式比较，已保留现有审核。`,
        );
      }
      comparisons.push({ version: ver, cmp });
    }

    const versionsText = comparisons.map((c) => c.version).join(', ');
    if (comparisons.some((c) => c.cmp > 0)) {
      throw new Error(`商店已有更高版本正在审核中（${versionsText} > ${targetVersion}），已保留现有审核，未执行撤回、上传或提审。`);
    }

    if (comparisons.some((c) => c.cmp === 0)) {
      log(`版本 ${targetVersion} 已在 Chrome Web Store 审核中（PENDING_REVIEW），幂等跳过重复上传与提审。`);
      return {
        shortCircuit: {
          status: 'ALREADY_PENDING_REVIEW',
          itemId: currentStatus.itemId || itemId,
          crxVersion: targetVersion,
          state: 'PENDING_REVIEW',
          cancelledPreviousReview: false,
          polls: 0,
          statusResponse: currentStatus,
        },
      };
    }

    // 所有待审版本均严格低于 targetVersion
    if (!cancelPendingReview) {
      throw new Error(`商店存在旧版审核中提交（${versionsText} < ${targetVersion}），未开启自动撤回（--cancel-pending-review），已中止。`);
    }

    log(`检测到旧版审核中提交（${versionsText} < ${targetVersion}），正在调用 :cancelSubmission 撤回旧审核...`);
    await cancelItemSubmission({ publisherId, itemId, token, apiBase, fetchImpl });

    const cancelMaxChecks = Math.max(1, maxPolls);
    for (let attempt = 1; attempt <= cancelMaxChecks; attempt++) {
      if (attempt > 1) await sleep(pollIntervalMs);
      const afterStatus = await fetchItemStatus({ publisherId, itemId, token, apiBase, fetchImpl });
      const nextState = afterStatus.submittedItemRevisionStatus?.state || '';
      if (nextState === 'STAGED') {
        throw new Error(
          `撤回旧审核后检测到商店提交已变为 STAGED（版本=${formatChannelVersions(afterStatus.submittedItemRevisionStatus?.distributionChannels)}），已保留现状，未继续上传或提审。`,
        );
      }
      if (nextState !== 'PENDING_REVIEW') {
        log(`旧审核已退出（当前 submittedState=${nextState || 'NONE'}，确认检查 ${attempt} 次）。`);
        return { cancelledPreviousReview: true };
      }
      log(`第 ${attempt}/${cancelMaxChecks} 次确认撤回状态：仍为 PENDING_REVIEW...`);
    }

    throw new Error(`已调用 :cancelSubmission，但确认检查 ${cancelMaxChecks} 次后商店状态仍为 PENDING_REVIEW，未继续上传或提审。`);
  }

  return { cancelledPreviousReview: false };
}

export async function uploadToChromeWebStore({
  zipPath,
  publisherId,
  itemId = DEFAULT_ITEM_ID,
  token,
  expectedVersion,
  publishType = null,
  cancelPendingReview = false,
  pollIntervalMs = 5000,
  maxPolls = 24,
  apiBase = API_BASE,
  fetchImpl = globalThis.fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log = (msg) => console.log(msg),
}) {
  assertAuthParams({ publisherId, itemId, token });
  const normalizedPublishType = normalizePublishType(publishType);

  // 先校验本地 ZIP，确认包有效后再发起任何网络请求（避免误撤旧审核）
  const zipInfo = await inspectStoreZip(zipPath, { expectedVersion });

  // 仅当本次确实要自动提审时才允许撤回旧审核，避免关闭自动提审后把在审版本误撤成草稿
  const effectiveCancelPendingReview = Boolean(cancelPendingReview && normalizedPublishType);
  let cancelledPreviousReview = false;
  if (normalizedPublishType) {
    const prep = await prepareForUpload({
      targetVersion: zipInfo.version,
      publisherId,
      itemId,
      token,
      cancelPendingReview: effectiveCancelPendingReview,
      pollIntervalMs,
      maxPolls,
      apiBase,
      fetchImpl,
      sleep,
      log,
    });
    if (prep.shortCircuit) return prep.shortCircuit;
    cancelledPreviousReview = Boolean(prep.cancelledPreviousReview);
  }

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
  let uploadResult = null;
  if (initialState === 'SUCCEEDED') {
    uploadResult = {
      status: 'SUCCEEDED',
      itemId: uploadData.itemId || itemId,
      crxVersion: uploadData.crxVersion || zipInfo.version,
      uploadState: initialState,
      polls: 0,
      cancelledPreviousReview,
      response: uploadData,
    };
  } else if (IN_PROGRESS_STATES.has(initialState)) {
    log(`上传已接收（uploadState=${initialState}），开始轮询 fetchStatus（最多 ${maxPolls} 次）...`);
    let lastStatus = null;
    for (let attempt = 1; attempt <= maxPolls; attempt++) {
      await sleep(pollIntervalMs);
      lastStatus = await fetchItemStatus({ publisherId, itemId, token, apiBase, fetchImpl });
      const asyncState = lastStatus.lastAsyncUploadState;
      log(`第 ${attempt}/${maxPolls} 次轮询：lastAsyncUploadState=${asyncState}`);
      if (asyncState === 'SUCCEEDED') {
        uploadResult = {
          status: 'SUCCEEDED',
          itemId: lastStatus.itemId || itemId,
          crxVersion: zipInfo.version,
          uploadState: asyncState,
          polls: attempt,
          cancelledPreviousReview,
          response: uploadData,
          statusResponse: lastStatus,
        };
        break;
      }
      if (asyncState === 'FAILED') {
        throw new Error(`Chrome Web Store 异步处理上传失败：${JSON.stringify(lastStatus)}`);
      }
      if (!IN_PROGRESS_STATES.has(asyncState)) {
        throw new Error(`Chrome Web Store 异步上传返回非预期状态 ${asyncState}：${JSON.stringify(lastStatus)}`);
      }
    }
    if (!uploadResult) {
      return {
        status: 'PENDING',
        itemId: uploadData.itemId || itemId,
        crxVersion: zipInfo.version,
        uploadState: 'IN_PROGRESS',
        polls: maxPolls,
        cancelledPreviousReview,
        response: uploadData,
        statusResponse: lastStatus,
      };
    }
  } else {
    throw new Error(`Chrome Web Store 上传未成功（uploadState=${initialState}）：${JSON.stringify(uploadData)}`);
  }

  if (normalizedPublishType) {
    log(`上传完成，正在提交 Chrome Web Store 审核（publishType=${normalizedPublishType}, skipReview=false）...`);
    const publishData = await publishItem({
      publisherId,
      itemId: uploadResult.itemId,
      token,
      publishType: normalizedPublishType,
      skipReview: false,
      apiBase,
      fetchImpl,
    });
    const warnings = Array.isArray(publishData.warningInfo?.warnings) ? publishData.warningInfo.warnings : [];
    uploadResult.publish = {
      publishType: normalizedPublishType,
      state: publishData.state || '',
      warnings,
      response: publishData,
    };
  }

  return uploadResult;
}

async function runCli() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log([
      '用法：node scripts/cws-upload.mjs [选项]',
      '  --zip <path>                上传的商店 ZIP 路径',
      '  --verify-zip <path>         仅校验本地商店 ZIP，不发起网络请求',
      '  --expected-version <ver>    校验 ZIP manifest.version 与此版本一致',
      '  --publish                   上传成功后自动提审（等价于 --publish-type DEFAULT_PUBLISH）',
      '  --publish-type <type>       提审策略：default / staged / DEFAULT_PUBLISH / STAGED_PUBLISH',
      '  --cancel-pending-review     若旧版本正在审核中，先调用 :cancelSubmission 撤回并确认退出后再上传',
      '  --status-only               仅调用 :fetchStatus 查询扩展当前状态',
      '  --publisher-id <id>         覆盖环境变量 CWS_PUBLISHER_ID',
      `  --item-id <id>              覆盖环境变量 CWS_ITEM_ID（默认 ${DEFAULT_ITEM_ID}）`,
      '  --poll-interval-ms <ms>     IN_PROGRESS 与撤回确认轮询间隔（默认 5000）',
      '  --max-polls <n>             IN_PROGRESS 与撤回确认最大轮询次数（默认 24）',
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
    publishType: opts.publishType || null,
    cancelPendingReview: Boolean(opts.cancelPendingReview),
    pollIntervalMs: Number.isFinite(opts.pollIntervalMs) ? opts.pollIntervalMs : 5000,
    maxPolls: Number.isFinite(opts.maxPolls) ? opts.maxPolls : 24,
  });

  if (result.status === 'ALREADY_PUBLISHED') {
    console.log(`Chrome Web Store 幂等完成：itemId=${result.itemId} · crxVersion=${result.crxVersion} · state=${result.state}（已发布）。`);
    return;
  }

  if (result.status === 'ALREADY_PENDING_REVIEW') {
    console.log(`Chrome Web Store 幂等完成：itemId=${result.itemId} · crxVersion=${result.crxVersion} · state=${result.state}（已在审核中）。`);
    return;
  }

  if (result.status === 'PENDING') {
    console.error(`上传仍在处理中（IN_PROGRESS），已轮询 ${result.polls} 次仍未完成，未执行提审。请前往 Chrome Web Store Developer Dashboard 核对 ${result.itemId} 的 ${result.crxVersion} 草稿状态。`);
    process.exitCode = 2;
    return;
  }

  console.log(`Chrome Web Store 草稿上传成功：itemId=${result.itemId} · crxVersion=${result.crxVersion} · uploadState=${result.uploadState}（轮询 ${result.polls} 次${result.cancelledPreviousReview ? '，已先撤回旧版审核' : ''}）。`);
  if (result.publish) {
    console.log(`Chrome Web Store 提审成功：itemId=${result.itemId} · publishType=${result.publish.publishType} · state=${result.publish.state || 'UNKNOWN'}。`);
    if (result.publish.warnings.length > 0) {
      for (const w of result.publish.warnings) {
        console.warn(`Chrome Web Store 提审警告 [${w.reason || 'WARNING'}]: ${w.description || JSON.stringify(w)}`);
      }
    }
    if (result.publish.publishType === 'DEFAULT_PUBLISH') {
      console.log('审核通过后将沿用商店现有放量设置自动上线。');
    } else if (result.publish.publishType === 'STAGED_PUBLISH') {
      console.log('审核通过后将停留在暂存状态（STAGED），需在 https://chrome.google.com/webstore/devconsole 手动发布。');
    }
  } else {
    console.log('未自动提审；如需发布，请前往 https://chrome.google.com/webstore/devconsole 确认草稿后手动提交审核。');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runCli().catch((err) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
}
