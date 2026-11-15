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
import { loadHostAllowed, actionKind, HOST_API, NEEDS, takeBinary } from '../extension/load.js';
import { loadVersion } from '../scripts/load-version.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = fs.readdirSync(path.join(ROOT, 'loads')).filter((n) => fs.existsSync(path.join(ROOT, 'loads', n, 'load.json')));

test('每个 loads/<name>/load.json 都构建进了注册表，而且没过期', () => {
  assert.deepEqual(Object.keys(LOADS).sort(), names.sort());
  for (const n of names) {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'loads', n, 'load.json'), 'utf8'));
    const def = LOADS[n];
    assert.equal(m.name, n);
    assert.ok(m.hosts === 'task' || (Array.isArray(m.hosts) && m.hosts.length), `${n}: hosts 要是非空列表或 "task"`);
    assert.ok(m.limits.payloadMax > 0 && m.limits.timeoutMs > 0 && m.limits.timeoutMaxMs >= m.limits.timeoutMs);
    // 没有 vendor 的是自研包（源码全在 loads/<name>/），有 vendor 的要钉死上游 commit
    if (m.vendor) assert.match(m.vendor.commit, /^[0-9a-f]{40}$/);
    else for (const f of ['setup.js', 'entry.js']) assert.ok(fs.existsSync(path.join(ROOT, 'loads', n, f)), `${n}: 缺 ${f}`);
    assert.equal(def.version, loadVersion(path.join(ROOT, 'loads', n), m), `${n}: 注册表过期，重新跑 npm run build:loads`);
    assert.equal(!!def.netHook, !!m.netHook, `${n}: 注册表过期，重新跑 npm run build:loads`);
    assert.deepEqual(def.actions, m.actions, `${n}: 注册表过期，重新跑 npm run build:loads`);
    assert.deepEqual(def.hosts, m.hosts);
    // 小脑的声明：needs 只能是宿主认的；early 文件构建进了产物；binaryOut 和 outputs 成对
    assert.ok(def.api <= HOST_API, `${n}: 要的宿主接口比扩展新`);
    for (const x of def.needs) assert.ok(NEEDS.has(x), `${n}: 不认识的 needs ${x}`);
    assert.equal(def.needs.includes('early'), !!(m.early || []).length, `${n}: needs 的 early 和 early 文件不一致`);
    for (const f of def.early || []) assert.ok(fs.existsSync(path.join(ROOT, 'extension', f)), `${n}: 缺产物 ${f}`);
    assert.equal(def.needs.includes('binaryOut'), !!Object.keys(m.outputs || {}).length, `${n}: binaryOut 和 outputs 要一起写`);

    const read = new Set(m.actions.read);
    assert.equal(read.size, m.actions.read.length, `${n}: read 有重复`);
    for (const a of m.actions.write) assert.ok(!read.has(a), `${n}: ${a} 同时在 read 和 write 里`);
    assert.deepEqual(def.confirm, m.confirm || {}, `${n}: 注册表过期，重新跑 npm run build:loads`);
    for (const [a, text] of Object.entries(m.confirm || {})) {
      assert.equal(actionKind(def, a), 'write', `${n}: confirm 里的 ${a} 不在 write 白名单里`);
      assert.ok(typeof text === 'string' && text.length && text.length <= 40, `${n}: ${a} 的确认说明要是一句短话`);
    }
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

test('media 能力包：只读、开网络记录、只在四个站上', () => {
  const def = LOADS.media;
  assert.ok(def, '注册表里没有 media');
  assert.deepEqual(def.actions.write, [], 'media 不该有写操作');
  assert.ok(def.netHook);
  for (const u of ['https://www.douyin.com/video/1', 'https://www.xiaohongshu.com/explore/x', 'https://www.bilibili.com/video/BV1', 'https://www.youtube.com/watch?v=x', 'https://m.youtube.com/watch?v=x']) {
    assert.ok(loadHostAllowed(def, u), u);
  }
  assert.ok(!loadHostAllowed(def, 'https://douyin.com.evil.com/'));
  assert.ok(!loadHostAllowed(def, 'https://www.tiktok.com/'));
});

test('hosts:"task" 的小脑能装在任何网页上，不能装在非网页地址上', () => {
  const def = { name: 't', hosts: 'task' };
  assert.equal(loadHostAllowed(def, 'https://www.youtube.com/watch?v=x'), true);
  assert.equal(loadHostAllowed(def, 'http://example.org/'), true);
  assert.equal(loadHostAllowed(def, 'chrome://settings'), false);
  assert.equal(loadHostAllowed(def, 'about:blank'), false);
  assert.equal(loadHostAllowed(def, 'not a url'), false);
});

test('小脑交出的字节：只有声明了 binaryOut 的才收，拆出字节、其余照旧', () => {
  const yes = { name: 'a', needs: ['binaryOut'] };
  const no = { name: 'b', needs: [] };
  const v = { track: 1, __binary: { data: Buffer.from([0, 0, 0, 24, 102, 116, 121, 112]).toString('base64'), type: 'video/mp4' } };
  const r = takeBinary(yes, v);
  assert.deepEqual(r.value, { track: 1 });
  assert.deepEqual([...r.bytes], [0, 0, 0, 24, 102, 116, 121, 112]);
  assert.equal(r.type, 'video/mp4');
  assert.throws(() => takeBinary(no, v), /binaryOut/);
  assert.deepEqual(takeBinary(no, { a: 1 }), { value: { a: 1 }, bytes: null });
  assert.throws(() => takeBinary(yes, { __binary: { data: 5 } }), /格式不对/);
});

test('build-loads.mjs 和 load.js 的宿主接口版本、needs 是同一份', () => {
  const src = fs.readFileSync(path.join(ROOT, 'scripts', 'build-loads.mjs'), 'utf8');
  assert.match(src, new RegExp(`const HOST_API = ${HOST_API};`));
  const m = /const NEEDS = new Set\((\[[^\]]*\])\)/.exec(src);
  assert.deepEqual(JSON.parse(m[1].replace(/'/g, '"')).sort(), [...NEEDS].sort());
});
