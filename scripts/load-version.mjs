// 能力包的版本号怎么算：build-loads.mjs 生成、test/loads.test.js 核对，两边用同一份。
//
// 版本里带上源码指纹：只改了适配层（entry.js、setup.js、白名单）时，页面上那份旧的也要被换掉
// （background.js 的 ensureLoad 按版本号判断要不要重新注入）。CRLF 统一成 LF，Windows 和 Linux 上算出来一样。
//   有 vendor（上游代码）：<上游版本>+<commit 前 7 位>.<load.json、setup.js、entry.js 的指纹>
//   自研包：<load.json 的 version>+<load.json 和全部 .js 源码的指纹>
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// 自研包的全部源码：load.json 和所有 .js（含子目录），按路径排序
export function sourceFiles(dir) {
  const out = [];
  const go = (rel) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) go(r);
      else if (r === 'load.json' || r.endsWith('.js')) out.push(r);
    }
  };
  go('');
  return out.sort();
}

export function loadVersion(dir, manifest) {
  const { vendor } = manifest;
  const h = crypto.createHash('sha256');
  if (vendor) {
    for (const f of ['load.json', 'setup.js', 'entry.js']) h.update(fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n'));
    return `${vendor.version}+${vendor.commit.slice(0, 7)}.${h.digest('hex').slice(0, 6)}`;
  }
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version || '')) throw new Error(`${manifest.name}: 自研能力包的 load.json 要写 version（x.y.z）`);
  for (const f of sourceFiles(dir)) {
    h.update(`${f}\0`);
    h.update(fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n'));
  }
  return `${manifest.version}+${h.digest('hex').slice(0, 6)}`;
}
