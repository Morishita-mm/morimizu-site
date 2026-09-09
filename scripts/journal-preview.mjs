// Loopback-only preview with a local Access simulator; never deployed.
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';
import { ingest, adminEntry, change } from '../journal/store.mjs';

const port = Number(process.env.JOURNAL_PREVIEW_PORT || 3003);
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535)
  throw new Error('Use JOURNAL_PREVIEW_PORT between 1024 and 65535');
const origin = `http://127.0.0.1:${port}`;
const runtime = await createLocalJournalRuntime({
  persist: resolve('.wrangler/journal-preview/d1'),
});
const { mf, db, adminHeaders } = runtime;
// Seed only this harmless, requested sample into the local database. Never reset
// existing entries or re-publish a sample the user has made private.
const sampleMarker = resolve('.wrangler/journal-preview/sample-initialized');
const seeded = await access(sampleMarker).then(
  () => true,
  () => false,
);
if (!seeded && !(await adminEntry(db, 'journal-preview-sample'))) {
  const sample = await ingest(
    db,
    await readFile('scripts/journal/preview-sample.md', 'utf8'),
  );
  const state = await adminEntry(db, sample.id);
  await change(db, sample.id, {
    action: 'apply',
    visibility: 'public',
    version: state.version,
    revision: state.draft_revision,
  });
}
await mkdir(resolve('.wrangler/journal-preview'), { recursive: true });
await writeFile(
  sampleMarker,
  'Sample initialized; do not recreate after deletion.\n',
);
const server = createServer(async (incoming, outgoing) => {
  try {
    // Host and browser-origin checks prevent DNS rebinding and cross-site writes.
    if (
      incoming.headers.host !== `127.0.0.1:${port}` ||
      (incoming.headers.origin && incoming.headers.origin !== origin) ||
      incoming.headers['sec-fetch-site'] === 'cross-site'
    ) {
      outgoing.writeHead(403, {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      });
      outgoing.end('Local preview only');
      return;
    }
    const url = new URL(incoming.url, origin);
    if (url.origin !== origin) {
      outgoing.writeHead(400);
      outgoing.end();
      return;
    }
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) {
      if (
        [
          'host',
          'connection',
          'transfer-encoding',
          'cf-access-jwt-assertion',
        ].includes(name)
      )
        continue;
      if (Array.isArray(value)) value.forEach((v) => headers.append(name, v));
      else if (value !== undefined) headers.set(name, value);
    }
    let path;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      path = '';
    }
    if (
      path.startsWith('/journal/admin') ||
      path.startsWith('/api/journal/admin')
    ) {
      for (const [name, value] of Object.entries(await adminHeaders()))
        headers.set(name, value);
    }
    const init = { method: incoming.method, headers, redirect: 'manual' };
    if (!['GET', 'HEAD'].includes(incoming.method)) {
      init.body = Readable.toWeb(incoming);
      init.duplex = 'half';
    }
    const response = await mf.dispatchFetch(url.href, init);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body)
      await pipeline(Readable.fromWeb(response.body), outgoing);
    else outgoing.end();
  } catch {
    if (!outgoing.headersSent)
      outgoing.writeHead(503, { 'Cache-Control': 'no-store' });
    outgoing.end('Local preview unavailable');
  }
});
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  console.log(
    `Journal preview ready (local data only)\nHome: ${origin}/\nUpload: ${origin}/journal/admin/upload\nSample: ${origin}/journal/journal-preview-sample\nLocal data: .wrangler/journal-preview/d1\nStop with Ctrl+C. Restart with npm run journal:preview.`,
  );
} catch (error) {
  await mf.dispose();
  throw error;
}
async function stop() {
  server.close();
  server.closeAllConnections();
  await mf.dispose();
}
process.once('SIGINT', () => {
  void stop();
});
process.once('SIGTERM', () => {
  void stop();
});
