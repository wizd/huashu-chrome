import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import JSZip from 'jszip';
import {
  DEFAULT_ITEM_ID,
  fetchItemStatus,
  inspectStoreZip,
  parseArgs,
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
