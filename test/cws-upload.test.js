import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import {
  DEFAULT_ITEM_ID,
  cancelItemSubmission,
  compareChromeVersions,
  fetchItemStatus,
  inspectStoreZip,
  normalizePublishType,
  parseArgs,
  publishItem,
  uploadToChromeWebStore,
} from '../scripts/cws-upload.mjs';

async function writeZip(filePath, entries) {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(entries)) {
    zip.file(name, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
  }
  const buf = await zip.generateAsync({ type: 'nodebuffer' });
  fs.writeFileSync(filePath, buf);
}

function mockResponse(status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    async text() {
      return text;
    },
  };
}

test('parseArgs 解析常用 CLI 参数', () => {
  assert.deepEqual(
    parseArgs(['--zip', 'dist/a.zip', '--expected-version=3.8.5', '--publisher-id', 'pub-1', '--status-only']),
    {
      zip: 'dist/a.zip',
      expectedVersion: '3.8.5',
      publisherId: 'pub-1',
      statusOnly: true,
    },
  );
  assert.throws(() => parseArgs(['--unknown']), /未知参数/);
});

test('inspectStoreZip 校验根目录 manifest.json、版本及无 key', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const okZip = path.join(tmp, 'store.zip');
    await writeZip(okZip, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.5' },
      'background.js': 'console.log(1);',
    });
    const info = await inspectStoreZip(okZip, { expectedVersion: '3.8.5' });
    assert.equal(info.version, '3.8.5');
    assert.equal(info.name, 'vcorp-chrome');
    assert.equal(info.fileCount, 2);

    await assert.rejects(
      () => inspectStoreZip(okZip, { expectedVersion: '3.8.6' }),
      /与期望版本/,
    );

    const keyZip = path.join(tmp, 'with-key.zip');
    await writeZip(keyZip, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.5', key: 'ABC' },
    });
    await assert.rejects(() => inspectStoreZip(keyZip), /不能包含开发用 key/);

    const manualZip = path.join(tmp, 'manual.zip');
    await writeZip(manualZip, {
      'vcorp-chrome/manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.5' },
    });
    await assert.rejects(() => inspectStoreZip(manualZip), /根目录缺少 manifest\.json/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('uploadToChromeWebStore 立即 SUCCEEDED 时核对 itemId 与 crxVersion', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.5.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.5' },
    });

    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, method: init.method, auth: init.headers.Authorization, bodyLen: init.body.length });
      return mockResponse(200, {
        name: `publishers/pub-123/items/${DEFAULT_ITEM_ID}`,
        itemId: DEFAULT_ITEM_ID,
        crxVersion: '3.8.5',
        uploadState: 'SUCCEEDED',
      });
    };

    const res = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'secret-token',
      expectedVersion: '3.8.5',
      fetchImpl,
      log: () => {},
    });

    assert.equal(res.status, 'SUCCEEDED');
    assert.equal(res.itemId, DEFAULT_ITEM_ID);
    assert.equal(res.crxVersion, '3.8.5');
    assert.equal(res.polls, 0);
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      `https://chromewebstore.googleapis.com/upload/v2/publishers/pub-123/items/${DEFAULT_ITEM_ID}:upload`,
    );
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].auth, 'Bearer secret-token');
    assert.ok(calls[0].bodyLen > 0);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('uploadToChromeWebStore 遇到 IN_PROGRESS 时轮询 fetchStatus 直到 SUCCEEDED', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.5.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.5' },
    });

    let step = 0;
    const fetchImpl = async (url, init) => {
      step += 1;
      if (step === 1) {
        assert.equal(init.method, 'POST');
        return mockResponse(200, { itemId: DEFAULT_ITEM_ID, uploadState: 'IN_PROGRESS' });
      }
      assert.equal(init.method, 'GET');
      assert.match(url, /:fetchStatus$/);
      if (step === 2) {
        return mockResponse(200, { itemId: DEFAULT_ITEM_ID, lastAsyncUploadState: 'IN_PROGRESS' });
      }
      return mockResponse(200, { itemId: DEFAULT_ITEM_ID, lastAsyncUploadState: 'SUCCEEDED' });
    };

    const res = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok',
      pollIntervalMs: 1,
      maxPolls: 5,
      sleep: async () => {},
      fetchImpl,
      log: () => {},
    });

    assert.equal(res.status, 'SUCCEEDED');
    assert.equal(res.polls, 2);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('uploadToChromeWebStore 轮询超时返回 PENDING、异步失败抛错、HTTP 错误不泄露 token', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.5.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.5' },
    });

    // 超时返回 PENDING
    const pendingRes = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok-secret-xyz',
      pollIntervalMs: 1,
      maxPolls: 2,
      sleep: async () => {},
      log: () => {},
      fetchImpl: async (_url, init) =>
        init.method === 'POST'
          ? mockResponse(200, { itemId: DEFAULT_ITEM_ID, uploadState: 'IN_PROGRESS' })
          : mockResponse(200, { itemId: DEFAULT_ITEM_ID, lastAsyncUploadState: 'IN_PROGRESS' }),
    });
    assert.equal(pendingRes.status, 'PENDING');
    assert.equal(pendingRes.polls, 2);

    // 异步 FAILED 抛错
    await assert.rejects(
      () =>
        uploadToChromeWebStore({
          zipPath,
          publisherId: 'pub-123',
          token: 'tok-secret-xyz',
          pollIntervalMs: 1,
          maxPolls: 2,
          sleep: async () => {},
          log: () => {},
          fetchImpl: async (_url, init) =>
            init.method === 'POST'
              ? mockResponse(200, { itemId: DEFAULT_ITEM_ID, uploadState: 'IN_PROGRESS' })
              : mockResponse(200, { itemId: DEFAULT_ITEM_ID, lastAsyncUploadState: 'FAILED' }),
        }),
      /异步处理上传失败/,
    );

    // HTTP 403 错误不泄露 token
    await assert.rejects(
      () =>
        fetchItemStatus({
          publisherId: 'pub-123',
          token: 'tok-secret-xyz',
          fetchImpl: async () => mockResponse(403, { error: { code: 403, message: 'Permission denied' } }),
        }),
      (err) => {
        assert.match(err.message, /HTTP 403/);
        assert.equal(err.message.includes('tok-secret-xyz'), false);
        return true;
      },
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('compareChromeVersions、normalizePublishType 与新 CLI 参数解析', () => {
  assert.equal(compareChromeVersions('3.8.10', '3.8.9'), 1);
  assert.equal(compareChromeVersions('3.8.9', '3.8.10'), -1);
  assert.equal(compareChromeVersions('3.8', '3.8.0.0'), 0);
  assert.equal(compareChromeVersions('3.8.6', '3.8.6'), 0);
  assert.equal(compareChromeVersions('3.8.x', '3.8.6'), null);
  assert.equal(compareChromeVersions('', '3.8.6'), null);
  assert.equal(compareChromeVersions('1.2.3.4.5', '1.2.3.4'), null);
  assert.equal(compareChromeVersions('65536.0.0', '1.0.0'), null);

  assert.equal(normalizePublishType(undefined), null);
  assert.equal(normalizePublishType(''), null);
  assert.equal(normalizePublishType('false'), null);
  assert.equal(normalizePublishType('default'), 'DEFAULT_PUBLISH');
  assert.equal(normalizePublishType('DEFAULT_PUBLISH'), 'DEFAULT_PUBLISH');
  assert.equal(normalizePublishType('staged'), 'STAGED_PUBLISH');
  assert.equal(normalizePublishType('STAGED_PUBLISH'), 'STAGED_PUBLISH');
  assert.throws(() => normalizePublishType('auto'), /无效的 publishType/);

  assert.deepEqual(
    parseArgs(['--zip', 'dist/a.zip', '--publish', '--cancel-pending-review']),
    {
      zip: 'dist/a.zip',
      publishType: 'DEFAULT_PUBLISH',
      cancelPendingReview: true,
    },
  );
  assert.deepEqual(
    parseArgs(['--zip', 'dist/a.zip', '--publish-type=staged', '--cancel-pending-review']),
    {
      zip: 'dist/a.zip',
      publishType: 'STAGED_PUBLISH',
      cancelPendingReview: true,
    },
  );
});

test('cancelItemSubmission 允许空响应且发送空请求体，publishItem 发送 DEFAULT_PUBLISH 与 skipReview=false', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init.method, body: init.body, headers: init.headers });
    if (url.endsWith(':cancelSubmission')) {
      return mockResponse(200, '');
    }
    return mockResponse(200, {
      name: `publishers/pub-123/items/${DEFAULT_ITEM_ID}`,
      itemId: DEFAULT_ITEM_ID,
      state: 'PENDING_REVIEW',
    });
  };

  const cancelRes = await cancelItemSubmission({
    publisherId: 'pub-123',
    token: 'tok-1',
    fetchImpl,
  });
  assert.deepEqual(cancelRes, {});
  assert.equal(calls[0].method, 'POST');
  assert.equal(
    calls[0].url,
    `https://chromewebstore.googleapis.com/v2/publishers/pub-123/items/${DEFAULT_ITEM_ID}:cancelSubmission`,
  );
  assert.equal(calls[0].body, undefined);

  const pubRes = await publishItem({
    publisherId: 'pub-123',
    token: 'tok-1',
    publishType: 'DEFAULT_PUBLISH',
    fetchImpl,
  });
  assert.equal(pubRes.state, 'PENDING_REVIEW');
  assert.equal(calls[1].method, 'POST');
  assert.equal(
    calls[1].url,
    `https://chromewebstore.googleapis.com/v2/publishers/pub-123/items/${DEFAULT_ITEM_ID}:publish`,
  );
  assert.deepEqual(JSON.parse(calls[1].body), {
    publishType: 'DEFAULT_PUBLISH',
    skipReview: false,
  });
});

test('旧版在审时先撤回并确认退出，再上传并自动提审（3.8.10 > 3.8.9 数字段比较）', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.10.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.10' },
    });

    const seq = [];
    let fetchCount = 0;
    const fetchImpl = async (url, init) => {
      if (url.endsWith(':fetchStatus')) {
        fetchCount += 1;
        seq.push(`fetchStatus#${fetchCount}`);
        if (fetchCount === 1) {
          return mockResponse(200, {
            itemId: DEFAULT_ITEM_ID,
            publishedItemRevisionStatus: {
              state: 'PUBLISHED',
              distributionChannels: [{ crxVersion: '3.8.8', deployPercentage: 100 }],
            },
            submittedItemRevisionStatus: {
              state: 'PENDING_REVIEW',
              distributionChannels: [{ crxVersion: '3.8.9', deployPercentage: 100 }],
            },
          });
        }
        if (fetchCount === 2) {
          return mockResponse(200, {
            itemId: DEFAULT_ITEM_ID,
            submittedItemRevisionStatus: {
              state: 'PENDING_REVIEW',
              distributionChannels: [{ crxVersion: '3.8.9', deployPercentage: 100 }],
            },
          });
        }
        return mockResponse(200, {
          itemId: DEFAULT_ITEM_ID,
          submittedItemRevisionStatus: {
            state: 'CANCELLED',
            distributionChannels: [{ crxVersion: '3.8.9', deployPercentage: 100 }],
          },
        });
      }
      if (url.endsWith(':cancelSubmission')) {
        seq.push('cancelSubmission');
        assert.equal(init.method, 'POST');
        assert.equal(init.body, undefined);
        return mockResponse(200, '');
      }
      if (url.endsWith(':upload')) {
        seq.push('upload');
        return mockResponse(200, {
          itemId: DEFAULT_ITEM_ID,
          crxVersion: '3.8.10',
          uploadState: 'SUCCEEDED',
        });
      }
      if (url.endsWith(':publish')) {
        seq.push('publish');
        assert.deepEqual(JSON.parse(init.body), {
          publishType: 'DEFAULT_PUBLISH',
          skipReview: false,
        });
        return mockResponse(200, {
          itemId: DEFAULT_ITEM_ID,
          state: 'PENDING_REVIEW',
          warningInfo: { warnings: [{ reason: 'INFO', description: 'notice' }] },
        });
      }
      throw new Error(`unexpected url: ${url}`);
    };

    const res = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok',
      expectedVersion: '3.8.10',
      publishType: 'DEFAULT_PUBLISH',
      cancelPendingReview: true,
      pollIntervalMs: 1,
      maxPolls: 5,
      sleep: async () => {},
      fetchImpl,
      log: () => {},
    });

    assert.deepEqual(seq, ['fetchStatus#1', 'cancelSubmission', 'fetchStatus#2', 'fetchStatus#3', 'upload', 'publish']);
    assert.equal(res.status, 'SUCCEEDED');
    assert.equal(res.cancelledPreviousReview, true);
    assert.equal(res.publish.publishType, 'DEFAULT_PUBLISH');
    assert.equal(res.publish.state, 'PENDING_REVIEW');
    assert.equal(res.publish.warnings.length, 1);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('同版已在审或已发布时幂等结束，不撤回、不上传、不提审', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.6.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.6' },
    });

    // 同版已在审
    const callsPending = [];
    const pendingRes = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok',
      expectedVersion: '3.8.6',
      publishType: 'DEFAULT_PUBLISH',
      cancelPendingReview: true,
      log: () => {},
      fetchImpl: async (url) => {
        callsPending.push(url);
        return mockResponse(200, {
          itemId: DEFAULT_ITEM_ID,
          submittedItemRevisionStatus: {
            state: 'PENDING_REVIEW',
            distributionChannels: [{ crxVersion: '3.8.6', deployPercentage: 100 }],
          },
        });
      },
    });
    assert.equal(pendingRes.status, 'ALREADY_PENDING_REVIEW');
    assert.equal(callsPending.length, 1);
    assert.match(callsPending[0], /:fetchStatus$/);

    // 同版已发布
    const callsPub = [];
    const pubRes = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok',
      expectedVersion: '3.8.6',
      publishType: 'DEFAULT_PUBLISH',
      cancelPendingReview: true,
      log: () => {},
      fetchImpl: async (url) => {
        callsPub.push(url);
        return mockResponse(200, {
          itemId: DEFAULT_ITEM_ID,
          publishedItemRevisionStatus: {
            state: 'PUBLISHED',
            distributionChannels: [{ crxVersion: '3.8.6', deployPercentage: 100 }],
          },
        });
      },
    });
    assert.equal(pubRes.status, 'ALREADY_PUBLISHED');
    assert.equal(callsPub.length, 1);
    assert.match(callsPub[0], /:fetchStatus$/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('新版保护、版本缺失、STAGED 及本地 ZIP 校验失败均保留现状不撤回不上传', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.9.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.9' },
    });

    // 1. 本地 ZIP 版本不匹配时，必须 0 次网络请求（绝不先撤审）
    let netCalls = 0;
    await assert.rejects(
      () =>
        uploadToChromeWebStore({
          zipPath,
          publisherId: 'pub-123',
          token: 'tok',
          expectedVersion: '3.8.10',
          publishType: 'DEFAULT_PUBLISH',
          cancelPendingReview: true,
          log: () => {},
          fetchImpl: async () => {
            netCalls += 1;
            return mockResponse(200, {});
          },
        }),
      /与期望版本/,
    );
    assert.equal(netCalls, 0);

    // 2. 商店有更高版本（3.8.10）正在审核
    const runProtectedCase = async (statusBody, expectedErr) => {
      const seen = [];
      await assert.rejects(
        () =>
          uploadToChromeWebStore({
            zipPath,
            publisherId: 'pub-123',
            token: 'tok',
            expectedVersion: '3.8.9',
            publishType: 'DEFAULT_PUBLISH',
            cancelPendingReview: true,
            log: () => {},
            fetchImpl: async (url) => {
              seen.push(url);
              return mockResponse(200, statusBody);
            },
          }),
        expectedErr,
      );
      assert.equal(seen.length, 1);
      assert.match(seen[0], /:fetchStatus$/);
    };

    await runProtectedCase(
      {
        itemId: DEFAULT_ITEM_ID,
        submittedItemRevisionStatus: {
          state: 'PENDING_REVIEW',
          distributionChannels: [{ crxVersion: '3.8.10', deployPercentage: 100 }],
        },
      },
      /更高版本正在审核中/,
    );

    // 3. PENDING_REVIEW 缺少 distributionChannels
    await runProtectedCase(
      {
        itemId: DEFAULT_ITEM_ID,
        submittedItemRevisionStatus: { state: 'PENDING_REVIEW' },
      },
      /缺少 distributionChannels/,
    );

    // 4. PENDING_REVIEW 某渠道缺少 crxVersion
    await runProtectedCase(
      {
        itemId: DEFAULT_ITEM_ID,
        submittedItemRevisionStatus: {
          state: 'PENDING_REVIEW',
          distributionChannels: [{ deployPercentage: 100 }],
        },
      },
      /无法按 Chrome 版本格式比较/,
    );

    // 5. STAGED 状态保留现状
    await runProtectedCase(
      {
        itemId: DEFAULT_ITEM_ID,
        submittedItemRevisionStatus: {
          state: 'STAGED',
          distributionChannels: [{ crxVersion: '3.8.8', deployPercentage: 100 }],
        },
      },
      /state=STAGED/,
    );

    // 6. 已发布更高版本保留现状
    await runProtectedCase(
      {
        itemId: DEFAULT_ITEM_ID,
        publishedItemRevisionStatus: {
          state: 'PUBLISHED',
          distributionChannels: [{ crxVersion: '3.9.0', deployPercentage: 100 }],
        },
      },
      /更高已发布版本/,
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('上传失败、异步 FAILED、上传轮询超时或撤回轮询超时时绝不调用 :publish', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.7.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.7' },
    });

    // 1. 上传 HTTP 400 失败 -> 绝不调用 :publish
    const callsUploadErr = [];
    await assert.rejects(
      () =>
        uploadToChromeWebStore({
          zipPath,
          publisherId: 'pub-123',
          token: 'tok',
          publishType: 'DEFAULT_PUBLISH',
          cancelPendingReview: true,
          log: () => {},
          fetchImpl: async (url) => {
            callsUploadErr.push(url);
            if (url.endsWith(':fetchStatus')) return mockResponse(200, { itemId: DEFAULT_ITEM_ID });
            if (url.endsWith(':upload')) return mockResponse(400, { error: { message: 'bad package' } });
            throw new Error(`不应调用 ${url}`);
          },
        }),
      /upload 失败/,
    );
    assert.equal(callsUploadErr.some((u) => u.endsWith(':publish')), false);

    // 2. 上传异步 FAILED -> 绝不调用 :publish
    const callsAsyncFail = [];
    let asyncPoll = 0;
    await assert.rejects(
      () =>
        uploadToChromeWebStore({
          zipPath,
          publisherId: 'pub-123',
          token: 'tok',
          publishType: 'DEFAULT_PUBLISH',
          pollIntervalMs: 1,
          maxPolls: 2,
          sleep: async () => {},
          log: () => {},
          fetchImpl: async (url) => {
            callsAsyncFail.push(url);
            if (url.endsWith(':fetchStatus')) {
              asyncPoll += 1;
              if (asyncPoll === 1) return mockResponse(200, { itemId: DEFAULT_ITEM_ID });
              return mockResponse(200, { itemId: DEFAULT_ITEM_ID, lastAsyncUploadState: 'FAILED' });
            }
            if (url.endsWith(':upload')) {
              return mockResponse(200, { itemId: DEFAULT_ITEM_ID, uploadState: 'IN_PROGRESS' });
            }
            throw new Error(`不应调用 ${url}`);
          },
        }),
      /异步处理上传失败/,
    );
    assert.equal(callsAsyncFail.some((u) => u.endsWith(':publish')), false);

    // 3. 上传轮询超时返回 PENDING -> 绝不调用 :publish
    const callsTimeout = [];
    let timeoutPoll = 0;
    const pendingRes = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok',
      publishType: 'DEFAULT_PUBLISH',
      pollIntervalMs: 1,
      maxPolls: 2,
      sleep: async () => {},
      log: () => {},
      fetchImpl: async (url) => {
        callsTimeout.push(url);
        if (url.endsWith(':fetchStatus')) {
          timeoutPoll += 1;
          if (timeoutPoll === 1) return mockResponse(200, { itemId: DEFAULT_ITEM_ID });
          return mockResponse(200, { itemId: DEFAULT_ITEM_ID, lastAsyncUploadState: 'IN_PROGRESS' });
        }
        if (url.endsWith(':upload')) {
          return mockResponse(200, { itemId: DEFAULT_ITEM_ID, uploadState: 'IN_PROGRESS' });
        }
        throw new Error(`不应调用 ${url}`);
      },
    });
    assert.equal(pendingRes.status, 'PENDING');
    assert.equal(pendingRes.publish, undefined);
    assert.equal(callsTimeout.some((u) => u.endsWith(':publish')), false);

    // 4. 撤回后持续 PENDING_REVIEW 超时 -> 绝不调用 :upload 和 :publish
    const callsCancelStuck = [];
    await assert.rejects(
      () =>
        uploadToChromeWebStore({
          zipPath,
          publisherId: 'pub-123',
          token: 'tok',
          publishType: 'DEFAULT_PUBLISH',
          cancelPendingReview: true,
          pollIntervalMs: 1,
          maxPolls: 2,
          sleep: async () => {},
          log: () => {},
          fetchImpl: async (url) => {
            callsCancelStuck.push(url);
            if (url.endsWith(':fetchStatus')) {
              return mockResponse(200, {
                itemId: DEFAULT_ITEM_ID,
                submittedItemRevisionStatus: {
                  state: 'PENDING_REVIEW',
                  distributionChannels: [{ crxVersion: '3.8.6', deployPercentage: 100 }],
                },
              });
            }
            if (url.endsWith(':cancelSubmission')) return mockResponse(200, '');
            throw new Error(`不应调用 ${url}`);
          },
        }),
      /仍为 PENDING_REVIEW/,
    );
    assert.equal(callsCancelStuck.some((u) => u.endsWith(':upload') || u.endsWith(':publish')), false);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('关闭自动提审时即使保留 cancelPendingReview 开关也绝不调用 :cancelSubmission 或 :publish', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-cws-test-'));
  try {
    const zipPath = path.join(tmp, 'vcorp-chrome-3.8.7.zip');
    await writeZip(zipPath, {
      'manifest.json': { manifest_version: 3, name: 'vcorp-chrome', version: '3.8.7' },
    });

    const calls = [];
    const res = await uploadToChromeWebStore({
      zipPath,
      publisherId: 'pub-123',
      token: 'tok',
      expectedVersion: '3.8.7',
      publishType: null,
      cancelPendingReview: true,
      log: () => {},
      fetchImpl: async (url) => {
        calls.push(url);
        if (url.endsWith(':upload')) {
          return mockResponse(200, {
            itemId: DEFAULT_ITEM_ID,
            crxVersion: '3.8.7',
            uploadState: 'SUCCEEDED',
          });
        }
        throw new Error(`不应调用 ${url}`);
      },
    });

    assert.equal(res.status, 'SUCCEEDED');
    assert.equal(res.cancelledPreviousReview, false);
    assert.equal(res.publish, undefined);
    assert.equal(calls.filter((u) => u.endsWith(':cancelSubmission')).length, 0);
    assert.equal(calls.filter((u) => u.endsWith(':publish')).length, 0);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('publishItem 返回空状态、REJECTED 或 CANCELLED 时报错，不误判提审成功', async () => {
  for (const badState of ['', undefined, 'ITEM_STATE_UNSPECIFIED', 'REJECTED', 'CANCELLED']) {
    await assert.rejects(
      () =>
        publishItem({
          publisherId: 'pub-123',
          token: 'tok',
          publishType: 'DEFAULT_PUBLISH',
          fetchImpl: async () =>
            mockResponse(200, {
              itemId: DEFAULT_ITEM_ID,
              ...(badState === undefined ? {} : { state: badState }),
            }),
        }),
      /未进入审核或发布状态/,
    );
  }
});
