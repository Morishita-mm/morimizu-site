// Smoke-test the real built Worker in workerd, using an ephemeral local D1.
// No browser, external service, deployed secret or production database is used.
import assert from 'node:assert/strict';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';

const { mf, adminHeaders } = await createLocalJournalRuntime();
try {
  for (const path of [
    '/',
    '/projects',
    '/notes',
    '/about',
    '/en',
    '/en/notes',
    '/journal',
  ]) {
    const response = await mf.dispatchFetch(`http://localhost${path}`);
    assert.equal(response.status, 200, path);
    assert.match(
      response.headers.get('content-type') ?? '',
      /text\/html/,
      path,
    );
    await response.text();
  }
  const denied = await mf.dispatchFetch(
    'http://localhost/api/journal/admin/entries',
  );
  assert.equal(denied.status, 401);
  assert.match(denied.headers.get('cache-control') ?? '', /no-store/);
  await denied.text();
  const allowed = await mf.dispatchFetch(
    'http://localhost/api/journal/admin/entries',
    {
      headers: await adminHeaders(),
    },
  );
  assert.equal(allowed.status, 200);
  assert.match(allowed.headers.get('cache-control') ?? '', /no-store/);
  await allowed.json();
  console.log(
    'PASS: built Worker public routes and local Access JWT allow/deny boundary',
  );
} finally {
  await mf.dispose();
}
