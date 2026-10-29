// 选文件夹和恢复权限只发生在这个窗口里：这两件事都要用户点一下。
// 句柄写进 IndexedDB 之后，service worker 才能在没有这个窗口的情况下读文件。
// 浏览器重启后权限可能回到 prompt，那时「恢复访问」再调一次 requestPermission。

import { listFolders, addFolder, removeFolder, requestAccess } from './folders.js';

const $ = (id) => document.getElementById(id);
const focusId = new URLSearchParams(location.search).get('id');
let pending = null;

const showErr = (text) => {
  $('err').hidden = !text;
  $('err').textContent = text || '';
};

const permWord = {
  granted: ['ok', '可读'],
  prompt: ['warn', '需要恢复访问'],
  denied: ['bad', '已拒绝'],
  unknown: ['bad', '打不开'],
};

async function tell() {
  await chrome.runtime.sendMessage({ __hcCloud: 'foldersChanged' }).catch(() => {});
}

async function render() {
  const rows = await listFolders();
  const box = $('list');
  box.textContent = '';
  if (!rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '还没有挂载的文件夹。';
    box.appendChild(empty);
    return;
  }
  for (const row of rows) {
    const [cls, word] = permWord[row.permission] || permWord.unknown;
    const item = document.createElement('div');
    item.className = 'item';
    if (row.id === focusId) item.style.outline = '1px solid var(--warn)';
    const dot = document.createElement('span');
    dot.className = `dot ${cls}`;
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = row.name;
    const sub = document.createElement('div');
    sub.className = 'sub';
    sub.textContent = word;
    const text = document.createElement('div');
    text.append(name, sub);
    text.style.flex = '1';
    item.append(dot, text);
    if (row.permission !== 'granted') {
      const restore = document.createElement('button');
      restore.className = 'btn';
      restore.type = 'button';
      restore.textContent = '恢复访问';
      restore.onclick = async () => {
        restore.disabled = true;
        showErr('');
        try {
          const state = await requestAccess(row.id);
          if (state !== 'granted') showErr(state === 'denied' ? '没有允许，这个文件夹读不了。' : '还没有允许。');
        } catch (e) {
          showErr(e.message || String(e));
        }
        restore.disabled = false;
        await render();
      };
      item.appendChild(restore);
    }
    const del = document.createElement('button');
    del.className = 'btn ghost';
    del.type = 'button';
    del.textContent = '移除';
    del.onclick = async () => {
      if (!confirm(`移除「${row.name}」？已经批准的任务也不能再读它。文件夹本身不会被删除。`)) return;
      await removeFolder(row.id);
      await tell();
      await render();
    };
    item.appendChild(del);
    box.appendChild(item);
  }
}

function showNaming(on) {
  $('naming').hidden = !on;
  $('pick').disabled = on;
  if (!on) pending = null;
}

$('pick').onclick = async () => {
  showErr('');
  try {
    pending = await showDirectoryPicker({ mode: 'read', id: 'vcorp-local-folder' });
  } catch (e) {
    if (e?.name === 'AbortError') return;
    // 系统目录（桌面、文档、下载）在有的系统上会直接拒绝，换一个普通文件夹。
    showErr(e?.name === 'SecurityError' || e?.name === 'AbortError'
      ? '这个文件夹选不了。换一个普通文件夹，不要选桌面、文档或下载目录本身。'
      : (e.message || String(e)));
    return;
  }
  $('name').value = pending.name.slice(0, 40);
  showNaming(true);
  $('name').focus();
  $('name').select();
};

$('cancel').onclick = () => showNaming(false);

$('save').onclick = async () => {
  if (!pending) return;
  $('save').disabled = true;
  showErr('');
  try {
    await addFolder(pending, $('name').value);
    showNaming(false);
    await tell();
    await render();
  } catch (e) {
    showErr(e.message || String(e));
  }
  $('save').disabled = false;
};

$('name').onkeydown = (e) => { if (e.key === 'Enter') $('save').click(); };

render().catch((e) => showErr(e.message || String(e)));
