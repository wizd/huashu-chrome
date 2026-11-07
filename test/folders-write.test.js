// folders.writeFile 对着一个假的 File System Access 目录跑：不需要浏览器，进 `npm test`
//
// 要守住的：只读挂载不写；同名文件不悄悄覆盖；字节数不对时不留半截文件、原文件不变。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFile } from '../extension/folders.js';

const domErr = (name) => Object.assign(new Error(name), { name });

function fakeDir(perm = 'granted') {
  const dir = {
    kind: 'directory', files: new Map(), dirs: new Map(),
    async queryPermission() { return perm; },
    async getDirectoryHandle(name, { create } = {}) {
      if (!dir.dirs.has(name)) {
        if (!create) throw domErr('NotFoundError');
        dir.dirs.set(name, fakeDir(perm));
      }
      return dir.dirs.get(name);
    },
    async getFileHandle(name, { create } = {}) {
      if (dir.dirs.has(name)) throw domErr('TypeMismatchError');
      if (!dir.files.has(name)) {
        if (!create) throw domErr('NotFoundError');
        dir.files.set(name, new Uint8Array(0));
      }
      return {
        async createWritable() {
          const parts = [];
          return new WritableStream({
            write(c) { parts.push(c); },
            close() { dir.files.set(name, Buffer.concat(parts)); },
            abort() {},
          });
        },
      };
    },
    async removeEntry(name) { dir.files.delete(name); },
  };
  return dir;
}

const body = (bytes) => new Blob([bytes]).stream();

test('writeFile：建子目录、写入、不悄悄覆盖', async () => {
  const handle = fakeDir();
  const row = { name: 'share', handle, write: true };
  const out = await writeFile(row, 'videos/a.mp4', body('hello'), { size: 5 });
  assert.deepEqual(out, { bytes: 5, replaced: false });
  const videos = handle.dirs.get('videos');
  assert.equal(Buffer.from(videos.files.get('a.mp4')).toString(), 'hello');

  await assert.rejects(writeFile(row, 'videos/a.mp4', body('x'), { size: 1 }), (e) => e.code === 'EXISTS');
  assert.equal(Buffer.from(videos.files.get('a.mp4')).toString(), 'hello');

  const again = await writeFile(row, 'videos/a.mp4', body('bye'), { size: 3, overwrite: true });
  assert.deepEqual(again, { bytes: 3, replaced: true });
  assert.equal(Buffer.from(videos.files.get('a.mp4')).toString(), 'bye');
});

test('writeFile：只读挂载、权限失效、文件类型不对都不写', async () => {
  const handle = fakeDir();
  await assert.rejects(writeFile({ name: 's', handle, write: false }, 'a.mp4', body('x'), { size: 1 }), (e) => e.code === 'FOLDER_READONLY');
  await assert.rejects(writeFile({ name: 's', handle: fakeDir('prompt'), write: true }, 'a.mp4', body('x'), { size: 1 }), (e) => e.code === 'FOLDER_LOCKED');
  await assert.rejects(writeFile({ name: 's', handle, write: true }, 'a.exe', body('x'), { size: 1 }), (e) => e.code === 'CLOUD_DENIED');
  assert.equal(handle.files.size, 0);
});

test('writeFile：字节数对不上就放弃，不留新文件', async () => {
  const handle = fakeDir();
  const row = { name: 's', handle, write: true };
  await assert.rejects(writeFile(row, 'a.mp4', body('hello'), { size: 9 }));
  await assert.rejects(writeFile(row, 'b.mp4', body('hello'), { size: 2 }));
  assert.equal(handle.files.size, 0);
});
