// 能力包（load）的参数规矩：background.js（本机和云端都走它）和 cloud-policy.js 共用。
// 纯函数、不碰 chrome.*，能在 Node 里测（test/loads.test.js、test/cloud-policy.test.js）。
//
// 能力包是扩展包里的文件（extension/loads/<name>/），注册表 LOADS 由
// scripts/build-loads.mjs 从 loads/<name>/load.json 生成。调用方只能按名字点一个包、
// 按白名单调它的 action，传的是一份 JSON 数据——任何一层都不接受代码。
import { LOADS } from './loads/index.js';
import { hostMatches } from './risk.js';

const err = (code, message) => Object.assign(new Error(message), { code });

export function loadDef(name) {
  const def = typeof name === 'string' && Object.hasOwn(LOADS, name) ? LOADS[name] : null;
  if (!def) throw err('LOAD_DENIED', `没有能力包 ${JSON.stringify(name)}，现有：${Object.keys(LOADS).join('、') || '无'}`);
  return def;
}

// 'read' | 'write' | null
export function actionKind(def, action) {
  if (typeof action !== 'string') return null;
  if (def.actions.read.includes(action)) return 'read';
  if (def.actions.write.includes(action)) return 'write';
  return null;
}

export function loadHostAllowed(def, url) {
  let host = '';
  try { host = new URL(url).hostname; } catch { /* 非网页地址 */ }
  return hostMatches(host, def.hosts);
}

// load {name} → { name }
export function checkLoadParams(p = {}) {
  const def = loadDef(p.name);
  return { name: def.name };
}

// 要用户点头的 action 返回给用户看的说明，否则 ''。只看注册表，调用方传什么都不算数。
export function confirmText(def, action) {
  return def.confirm && Object.hasOwn(def.confirm, action) ? String(def.confirm[action]) : '';
}

// call {name, action, payload?, timeout?} → 清洗过的参数 + kind + confirm（说明文字或 ''）。
// payload 只收普通 JSON 对象：走一遍 JSON 往返，函数、原型、循环引用都留不下来。
export function checkCallParams(p = {}) {
  const def = loadDef(p.name);
  const kind = actionKind(def, p.action);
  if (!kind) throw err('LOAD_DENIED', `能力包 ${def.name} 不接受 ${JSON.stringify(p.action)}（不在 read/write 白名单里）`);
  const raw = p.payload ?? {};
  if (Object.prototype.toString.call(raw) !== '[object Object]') throw err('BAD_PARAMS', 'payload 要是一个 JSON 对象');
  let json;
  try { json = JSON.stringify(raw); } catch { throw err('BAD_PARAMS', 'payload 不是合法的 JSON'); }
  const size = new TextEncoder().encode(json).length;
  if (size > def.limits.payloadMax) throw err('BAD_PARAMS', `payload 太大：${size} 字节，上限 ${def.limits.payloadMax}`);
  const t = Number(p.timeout);
  const timeout = Number.isFinite(t) && t > 0 ? Math.min(Math.max(t, 1000), def.limits.timeoutMaxMs) : def.limits.timeoutMs;
  return { name: def.name, action: p.action, payload: JSON.parse(json), timeout, kind, confirm: confirmText(def, p.action) };
}
