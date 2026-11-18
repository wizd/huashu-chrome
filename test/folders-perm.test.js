// queryPermission on a mounted folder can hang forever in the service worker. When it did, the side
// panel's whole state request hung with it: no pairing box, no connection status, only
// "扩展没有响应". A stuck query now counts as prompt after a short wait.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { queryPermissionWithin } from '../extension/folders.js';

test('a permission query that never answers counts as prompt', async () => {
  const stuck = { queryPermission: () => new Promise(() => {}) };
  const t = Date.now();
  assert.equal(await queryPermissionWithin(stuck, 'read', 50), 'prompt');
  assert.ok(Date.now() - t < 1000);
});

test('an answer that comes in time is passed through, and a broken handle still throws', async () => {
  assert.equal(await queryPermissionWithin({ queryPermission: async () => 'granted' }, 'read', 50), 'granted');
  assert.equal(await queryPermissionWithin({ queryPermission: async ({ mode }) => (mode === 'readwrite' ? 'denied' : 'granted') }, 'readwrite', 50), 'denied');
  await assert.rejects(queryPermissionWithin({ queryPermission: () => { throw new Error('broken'); } }, 'read', 50), /broken/);
});
