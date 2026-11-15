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

// 宿主接口版本和能认的 needs（build-loads.mjs 里有同样的两份，test/loads.test.js 核对）。
// 小脑要的宿主能力都在 load.json 里声明，这里和 background.js 只认声明，不认小脑的名字。
export const HOST_API = 1;
export const NEEDS = new Set(['netHook', 'early', 'binaryOut']);
export const needs = (def, what) => Array.isArray(def.needs) ? def.needs.includes(what) : (what === 'netHook' && !!def.netHook);

// hosts: "task" 的通用小脑不限死网站：任何网页都能装，云端由 cloud.js 按任务批准的网站把关
export function loadHostAllowed(def, url) {
  let host = '', web = false;
  try { const u = new URL(url); host = u.hostname; web = /^https?:$/.test(u.protocol); } catch { /* 非网页地址 */ }
  if (def.hosts === 'task') return web && !!host;
  return hostMatches(host, def.hosts);
}

export const hostsText = (def) => (def.hosts === 'task' ? '本任务允许的网站' : def.hosts.join('、'));

// 声明了 binaryOut 的小脑，action 的返回值里可以带一段字节：{ ..., __binary: { data: <base64>, type } }。
// 拆成 { value（不含字节）, bytes（Uint8Array）}。没声明的小脑带了也不认。字节出门前还要过 mediaBody 和额度（cloud.js）。
export const BINARY_MAX = 16 * 1024 * 1024;
export function takeBinary(def, value) {
  if (!value || typeof value !== 'object' || !Object.hasOwn(value, '__binary')) return { value, bytes: null };
  const { __binary: b, ...rest } = value;
  if (!needs(def, 'binaryOut')) throw err('LOAD_ERROR', `能力包 ${def.name} 没有声明 binaryOut，不能交出字节`);
  if (!b || typeof b.data !== 'string') throw err('LOAD_ERROR', `${def.name} 交出的字节格式不对`);
  if (b.data.length > Math.ceil(BINARY_MAX / 3) * 4 + 4) throw err('LOAD_ERROR', `${def.name} 一次交出的字节超过 ${BINARY_MAX}`);
  let bin;
  try { bin = atob(b.data); } catch { throw err('LOAD_ERROR', `${def.name} 交出的字节不是 base64`); }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { value: rest, bytes, type: String(b.type || '').slice(0, 100) };
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

// netHook: true 的能力包要读页面自己的接口响应（net-hook.js 记在 window.__hcNet 里）。
// 云端拿不到 network 命令，所以由扩展在这些包的 hosts 上开记录：只记在页面里，读取只经包的白名单 action。
// 返回 registerContentScripts 的 matches，没有这种包时是 []。
export function netHookMatches(loads = LOADS) {
  const hosts = [...new Set(Object.values(loads).filter((d) => needs(d, 'netHook') && Array.isArray(d.hosts)).flatMap((d) => d.hosts))].sort();
  return hosts.flatMap((h) => [`*://${h}/*`, `*://*.${h}/*`]);
}
