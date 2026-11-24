import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import JSZip from 'jszip';
import { packExtension, normalizeManifestKey, parseArgs } from '../scripts/pack-extension.mjs';
import { extensionId } from '../src/lib/native-install.js';

async function readZipText(zipFile, entryPath) {
  const zip = await JSZip.loadAsync(fs.readFileSync(zipFile));
  const entry = zip.file(entryPath);
  assert.ok(entry, `zip 缺少条目：${entryPath}`);
  return entry.async('string');
}

test('packExtension 校验自定义构建必须提供独立公钥', () => {
  assert.throws(() => packExtension({ name: 'acme-chrome' }), /必须通过 --key 或 --key-file 提供独立公钥/);
  assert.throws(() => packExtension({ origin: 'https://maker.acme.example' }), /必须通过 --key 或 --key-file 提供独立公钥/);
  assert.throws(() => packExtension({ origin: 'http://maker.acme.example', key: 'bad' }), /https/);
  assert.throws(() => normalizeManifestKey('not-a-real-key'), /SPKI/);
});

test('parseArgs 解析打包参数', () => {
  assert.deepEqual(parseArgs(['--name', 'acme-chrome', '--origin=https://maker.acme.example', '--key-file', 'k.pem']), {
    name: 'acme-chrome',
    origin: 'https://maker.acme.example',
    keyFile: 'k.pem',
  });
});

test('packExtension 生成独立品牌扩展包且不污染源码目录', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hc-pack-test-'));
  try {
    const { publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    const pem = publicKey.export({ type: 'spki', format: 'pem' });
    const keyFile = path.join(tmp, 'acme.pub.pem');
    fs.writeFileSync(keyFile, pem);

    const outDir = path.join(tmp, 'dist');
    const r = packExtension({
      name: 'acme-chrome',
      origin: 'https://maker.acme.example/',
      keyFile,
      outDir,
    });

    assert.equal(r.name, 'acme-chrome');
    assert.equal(r.origin, 'https://maker.acme.example');
    assert.ok(fs.existsSync(r.storeZip));
    assert.ok(fs.existsSync(r.manualZip));

    const expectedKey = normalizeManifestKey(pem);
    assert.equal(r.manualExtId, extensionId(expectedKey));
    assert.notEqual(r.manualExtId, 'jmhgdchbmnppmgnkjbphomihijnjbiaj');

    // 商店包：剥离 key，name 已改
    const storeMf = JSON.parse(await readZipText(r.storeZip, 'manifest.json'));
    assert.equal(storeMf.name, 'acme-chrome');
    assert.equal(storeMf.action.default_title, 'acme-chrome');
    assert.equal('key' in storeMf, false);

    // 手动包：顶层目录为 acme-chrome/，带独立 key
    const manualMf = JSON.parse(await readZipText(r.manualZip, 'acme-chrome/manifest.json'));
    assert.equal(manualMf.name, 'acme-chrome');
    assert.equal(manualMf.key, expectedKey);

    // DEFAULT_ORIGIN 与文案已替换，CLI 命令保留 vcorp-chrome
    const policy = await readZipText(r.manualZip, 'acme-chrome/cloud-policy.js');
    assert.match(policy, /export const DEFAULT_ORIGIN = 'https:\/\/maker\.acme\.example';/);

    const panelHtml = await readZipText(r.manualZip, 'acme-chrome/panel.html');
    assert.match(panelHtml, /<title>acme-chrome<\/title>/);
    assert.match(panelHtml, /maker\.acme\.example/);
    assert.doesNotMatch(panelHtml, /maker\.vcorp\.ai/);
    assert.match(panelHtml, /npx vcorp-chrome doctor/);

    const desktopSetup = await readZipText(r.manualZip, 'acme-chrome/desktop-setup.html');
    assert.match(desktopSetup, /npx -y vcorp-chrome@latest desktop install/);
    assert.match(desktopSetup, /打开 acme-chrome 侧栏/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
