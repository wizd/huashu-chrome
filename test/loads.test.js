// 能力包（load）的产物和清单要对得上 —— 不需要浏览器，进 `npm test`
//
// extension/loads/ 是构建产物、入库发布。这里防的是「改了 load.json 忘了重新构建」
// 和「白名单里写了一个上游根本没有的 action」这两种静默失效。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { LOADS } from '../extension/loads/index.js';
import { loadHostAllowed, actionKind } from '../extension/load.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = fs.readdirSync(path.join(ROOT, 'loads')).filter((n) => fs.existsSync(path.join(ROOT, 'loads', n, 'load.json')));

test('每个 loads/<name>/load.json 都构建进了注册表，而且没过期', () => {
  assert.deepEqual(Object.keys(LOADS).sort(), names.sort());
  for (const n of names) {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'loads', n, 'load.json'), 'utf8'));
    const def = LOADS[n];
    assert.equal(m.name, n);
    assert.ok(Array.isArray(m.hosts) && m.hosts.length, `${n}: hosts 不能空`);
    assert.ok(m.limits.payloadMax > 0 && m.limits.timeoutMs > 0 && m.limits.timeoutMaxMs >= m.limits.timeoutMs);
    assert.match(m.vendor.commit, /^[0-9a-f]{40}$/);
    assert.equal(def.version, `${m.vendor.version}+${m.vendor.commit.slice(0, 7)}`, `${n}: 注册表过期，重新跑 npm run build:loads`);
    assert.deepEqual(def.actions, m.actions, `${n}: 注册表过期，重新跑 npm run build:loads`);
    assert.deepEqual(def.hosts, m.hosts);

    const read = new Set(m.actions.read);
    assert.equal(read.size, m.actions.read.length, `${n}: read 有重复`);
    for (const a of m.actions.write) assert.ok(!read.has(a), `${n}: ${a} 同时在 read 和 write 里`);
    for (const a of Object.keys(m.denied || {})) {
      assert.equal(actionKind(def, a), null, `${n}: ${a} 写在 denied 里，却也在白名单里`);
    }
  }
});

test('产物文件都在，sha256 和注册表一致，白名单里的 action 上游都有', () => {
  for (const [n, def] of Object.entries(LOADS)) {
    let src = '';
    for (const f of def.files) {
      const buf = fs.readFileSync(path.join(ROOT, 'extension', f));
      src += buf.toString('utf8');
      if (def.files.length === 1) {
        assert.equal(crypto.createHash('sha256').update(buf).digest('hex'), def.sha256, `${n}: 产物被手改过或没重新构建`);
      }
    }
    assert.ok(src.includes('__vcorpLoads'), `${n}: 产物里没有注册 __vcorpLoads`);
    for (const a of [...def.actions.read, ...def.actions.write]) {
      assert.ok(src.includes(`"${a}"`) || src.includes(`'${a}'`), `${n}: 上游没有 action ${a}`);
    }
  }
});

test('hosts 判定：含子域，不含相似域名', () => {
  const def = LOADS.eda;
  assert.ok(loadHostAllowed(def, 'https://pro.lceda.cn/editor#id=1'));
  assert.ok(loadHostAllowed(def, 'https://pro.easyeda.com/editor'));
  assert.ok(!loadHostAllowed(def, 'https://pro.lceda.cn.evil.com/'));
  assert.ok(!loadHostAllowed(def, 'https://lceda.cn/'));
  assert.ok(!loadHostAllowed(def, 'chrome://extensions'));
});
