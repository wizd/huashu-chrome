// 用户挂载的本地文件夹。句柄存在扩展自己的 IndexedDB，和配对密钥不是同一个库。
//
// 读文件放在 service worker 里，选文件夹和重新授权放在 mount.html 里。依据：
//   - File System Access 规范把 queryPermission、getFile、目录 entries 暴露给 Worker
//     （Exposed=Window,Worker）。扩展的 service worker 和扩展页面是同一个源，
//     页面里 showDirectoryPicker 拿到的句柄写进 IndexedDB 之后，SW 读得出来。
//     woxxom 在 StackOverflow 上给的做法也是这条：句柄进 IndexedDB，SW 复用。
//   - showDirectoryPicker 和 requestPermission 都要用户激活，而且 SW 没有 window。
//     这两件事只能在扩展页面里、由用户点一下来做。
//   - 权限不保证跨过浏览器重启。Chrome 122 起用户可以选「每次访问都允许」，
//     但 chrome-extension 源不是已安装的 PWA，重启后 queryPermission 经常回到 prompt。
//     所以每次读之前都问一次；不是 granted 就返回 FOLDER_LOCKED，让用户在窗口里点「恢复访问」。
//     不把「重启后仍然 granted」当成前提。
//
// 这里不认识云端命令。谁能读、读哪种文件、字节往哪送，由 cloud-policy.js 决定。

import { cleanFolderName, fileAllowed, skipEntry, matchGlob, FS_FILE_MAX, FS_LIST_MAX, FS_FOLDERS_MAX } from './cloud-policy.js';

const DB = 'hc-folders';

const fail = (code, message) => Object.assign(new Error(message), { code });

function idb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('folders', { keyPath: 'id' });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

async function idbOp(mode, fn) {
  const db = await idb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('folders', mode);
      const req = fn(tx.objectStore('folders'));
      tx.oncomplete = () => resolve(req?.result);
      tx.onerror = () => reject(tx.error);
    });
  } finally { db.close(); }
}

const all = () => idbOp('readonly', (s) => s.getAll());
const get = (id) => idbOp('readonly', (s) => s.get(id));

function newId() {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  return `fld_${[...bytes].map((b) => alphabet[b % alphabet.length]).join('')}`;
}

function mapFsError(e, rel) {
  if (e?.code) return e;
  if (e?.name === 'NotAllowedError' || e?.name === 'SecurityError') {
    return fail('FOLDER_LOCKED', '读取权限失效了，需要你重新点一次允许');
  }
  if (e?.name === 'NotFoundError' || e?.name === 'TypeMismatchError') {
    return fail('NOT_FOUND', rel ? `没有 ${rel}` : '没有这个路径');
  }
  return e;
}

// 给服务器的名单：只有显示名。权限状态是给侧栏的，不上报。
export async function names() {
  const rows = await all();
  return rows.map((r) => ({ id: r.id, name: r.name }));
}

export async function listFolders() {
  const rows = await all();
  const out = [];
  for (const row of rows.sort((a, b) => a.addedAt - b.addedAt)) {
    let permission = 'unknown';
    try { permission = await row.handle.queryPermission({ mode: 'read' }); } catch { /* 句柄坏了，下面照样列出来让用户移除 */ }
    out.push({ id: row.id, name: row.name, addedAt: row.addedAt, permission });
  }
  return out;
}

export async function getByName(name) {
  const rows = await all();
  return rows.find((r) => r.name === name) || null;
}

export async function addFolder(handle, name) {
  const clean = cleanFolderName(name) || cleanFolderName(handle?.name);
  if (!clean) throw fail('BAD_NAME', '文件夹名字不合法');
  const rows = await all();
  if (rows.length >= FS_FOLDERS_MAX) throw fail('FULL', `最多挂载 ${FS_FOLDERS_MAX} 个文件夹，先移除不用的`);
  if (rows.some((r) => r.name === clean)) throw fail('DUP', '已经有同名文件夹，换一个显示名');
  for (const row of rows) {
    try {
      if (await row.handle.isSameEntry(handle)) throw fail('DUP', `这个文件夹已经挂过了，名字是「${row.name}」`);
    } catch (e) {
      if (e.code === 'DUP') throw e;
    }
  }
  const row = { id: newId(), name: clean, handle, addedAt: Date.now() };
  await idbOp('readwrite', (s) => s.put(row));
  return { id: row.id, name: row.name };
}

export async function removeFolder(id) {
  await idbOp('readwrite', (s) => s.delete(id));
}

// 必须在扩展页面里、由用户点击调用。SW 里调会因为没有用户激活而失败。
export async function requestAccess(id) {
  const row = await get(id);
  if (!row?.handle) throw fail('NOT_FOUND', '没有这个文件夹');
  return row.handle.requestPermission({ mode: 'read' });
}

async function child(dir, name, kind) {
  try {
    return kind === 'file' ? await dir.getFileHandle(name) : await dir.getDirectoryHandle(name);
  } catch (e) {
    throw mapFsError(e, name);
  }
}

async function resolve(root, rel, kind) {
  const parts = rel ? rel.split('/') : [];
  let cur = root;
  for (let i = 0; i < parts.length; i++) {
    const last = i === parts.length - 1;
    cur = await child(cur, parts[i], last && kind === 'file' ? 'file' : 'dir');
  }
  return cur;
}

async function permissionOf(handle) {
  try { return await handle.queryPermission({ mode: 'read' }); }
  catch (e) { throw mapFsError(e); }
}

export async function assertGranted(handle) {
  if (await permissionOf(handle) !== 'granted') {
    throw fail('FOLDER_LOCKED', '读取权限失效了，需要你重新点一次允许');
  }
}

function sizeText(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

// 列出一个已授权的文件夹。glob 有值时只留匹配的文件，目录用来往下走，不出现在结果里。
export async function listTree(handle, { path = '', depth = 3, glob = '', folder }) {
  await assertGranted(handle);
  let root;
  try { root = await resolve(handle, path, 'dir'); }
  catch (e) {
    if (e.code === 'NOT_FOUND') throw fail('NOT_FOUND', path ? `没有文件夹 ${path}` : '没有这个文件夹');
    throw e;
  }
  const entries = [];
  let truncated = false;

  async function walk(dir, rel, levelsLeft) {
    if (truncated) return;
    let handles;
    try { handles = dir.entries(); }
    catch (e) { throw mapFsError(e, rel); }
    const batch = [];
    try {
      for await (const [name, h] of handles) batch.push([name, h]);
    } catch (e) { throw mapFsError(e, rel); }
    batch.sort((a, b) => a[0].localeCompare(b[0], 'zh'));
    for (const [name, h] of batch) {
      if (entries.length >= FS_LIST_MAX) { truncated = true; return; }
      if (skipEntry(name)) continue;
      const childRel = rel ? `${rel}/${name}` : name;
      if (h.kind === 'directory') {
        if (!glob) entries.push({ path: childRel, dir: true });
        if (levelsLeft > 1) await walk(h, childRel, levelsLeft - 1);
        continue;
      }
      if (!fileAllowed(name)) continue;
      if (glob && !matchGlob(childRel, glob)) continue;
      let size = null;
      try {
        const file = await h.getFile();
        size = file.size;
      } catch (e) {
        if (e?.name === 'NotFoundError') continue;
        throw mapFsError(e, childRel);
      }
      entries.push({ path: childRel, size });
    }
  }

  await walk(root, '', depth);

  const where = `${folder}${path ? `/${path}` : ''}`;
  const lines = [`${where}${glob ? `（${glob}）` : ''}`];
  if (!entries.length) lines.push('（没有符合的文件）');
  for (const ent of entries) lines.push(ent.dir ? `${ent.path}/` : `${ent.path}\t${sizeText(ent.size)}`);
  if (truncated) lines.push(`（已到 ${FS_LIST_MAX} 条上限，后面的没列。缩小 path 或 glob 再列。）`);
  return {
    text: lines.join('\n'),
    truncated,
    audit: `list ${where}${truncated ? ' truncated' : ''} ${entries.length}`,
  };
}

export async function readFile(handle, rel) {
  await assertGranted(handle);
  let file;
  try {
    const h = await resolve(handle, rel, 'file');
    file = await h.getFile();
  } catch (e) {
    throw mapFsError(e, rel);
  }
  const base = rel.split('/').pop();
  if (skipEntry(base) || !fileAllowed(base) || !fileAllowed(file.name)) {
    throw fail('CLOUD_DENIED', `不读取这种文件：${base}`);
  }
  if (file.size > FS_FILE_MAX) throw fail('CLOUD_DENIED', `「${base}」有 ${sizeText(file.size)}，超过单文件 32MB 上限`);
  return file;
}

// 把文件字节流到配对服务器的一次性地址。不经过 WebSocket：一条命令的回执上限是 3MB。
export async function uploadFile(file, url) {
  let res;
  try {
    res = await fetch(url, {
      method: 'PUT',
      credentials: 'omit',
      cache: 'no-store',
      headers: {
        // 不用 file.type。application/json 会被服务器上的 JSON 解析器先吃掉，字节就对不上了。
        'content-type': 'application/octet-stream',
        'content-length': String(file.size),
        'x-file-name': encodeURIComponent(file.name),
      },
      body: file,
    });
  } catch (e) {
    throw fail('INTERNAL', `文件没有传到服务器：${e.message || e}`);
  }
  if (!res.ok) throw fail('INTERNAL', `文件没有传到服务器：${res.status}`);
  return { bytes: file.size, name: file.name };
}
