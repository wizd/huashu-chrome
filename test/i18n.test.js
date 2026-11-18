import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickLang } from '../extension/i18n.js';
import { compatNote } from '../extension/compat.js';

test('中文界面（简繁都算）用中文，其余一律英文', () => {
  for (const c of ['zh', 'zh-CN', 'zh_CN', 'zh-TW', 'zh-Hant-HK', 'ZH-cn']) assert.equal(pickLang(c), 'zh', c);
  for (const c of ['en', 'en-US', 'ja', 'fr-FR', 'zu', '', undefined, null]) assert.equal(pickLang(c), 'en', String(c));
});

test('compatNote 默认中文，传 en 给英文', () => {
  assert.match(compatNote('cli-old', { ext: '1.3.0', cli: '1.2.1' }), /旧/);
  const en = compatNote('cli-old', { ext: '1.3.0', cli: '1.2.1' }, 'en');
  assert.match(en, /older than extension/);
  assert.doesNotMatch(en, /[一-鿿]/);
  assert.equal(compatNote('patch', { ext: '1.2.0', cli: '1.2.1' }, 'en'), '');
});
