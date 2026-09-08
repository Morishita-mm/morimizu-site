// Local tooling only. This module is never imported into the deployed Worker.
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Miniflare } from 'miniflare';
import { unstable_getMiniflareWorkerOptions } from 'wrangler';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

export async function createLocalJournalRuntime({ persist = false } = {}) {
  const config = unstable_getMiniflareWorkerOptions(
    'dist/server/wrangler.json',
  );
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: 'journal-local',
    alg: 'RS256',
    use: 'sig',
  };
  const bindings = {
    JOURNAL_ACCESS_TEAM: 'https://journal-local.cloudflareaccess.com',
    JOURNAL_ACCESS_AUD: 'journal-local',
    JOURNAL_ADMIN_EMAIL: 'local@example.test',
    JOURNAL_UPLOAD_TOKEN: crypto.randomUUID() + crypto.randomUUID(),
  };
  const moduleFiles = await readdir('dist/server', { recursive: true });
  const mf = new Miniflare({
    ...config.workerOptions,
    modules: [
      { type: 'ESModule', path: config.main },
      ...moduleFiles
        .filter((p) => p !== 'index.js' && /\.m?js$/.test(p))
        .map((p) => ({ type: 'ESModule', path: resolve('dist/server', p) })),
    ],
    modulesRoot: resolve('dist/server'),
    bindings,
    host: '127.0.0.1',
    port: 0,
    d1Databases: { JOURNAL_DB: 'journal-local' },
    d1Persist: persist,
    outboundService: (request) =>
      request.url === `${bindings.JOURNAL_ACCESS_TEAM}/cdn-cgi/access/certs`
        ? Response.json({ keys: [jwk] })
        : new Response('External connections are disabled in local preview', {
            status: 502,
          }),
  });
  try {
    await mf.ready;
    const db = await mf.getD1Database('JOURNAL_DB');
    if (
      !(await db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='journal_entries'",
        )
        .first())
    ) {
      const sql = await readFile('journal/migrations/0001_journal.sql', 'utf8');
      await db.batch(
        sql
          .split(';')
          .filter((s) => s.trim())
          .map((s) => db.prepare(s)),
      );
    }
    const columns = await db
      .prepare('PRAGMA table_info(journal_entries)')
      .all();
    if (!columns.results.some((column) => column.name === 'tags_json')) {
      const sql = await readFile(
        'journal/migrations/0002_journal_tags.sql',
        'utf8',
      );
      await db.prepare(sql).run();
    }
    async function adminHeaders() {
      const jwt = await new SignJWT({
        email: bindings.JOURNAL_ADMIN_EMAIL,
        type: 'app',
      })
        .setSubject('local-owner')
        .setIssuer(bindings.JOURNAL_ACCESS_TEAM)
        .setAudience(bindings.JOURNAL_ACCESS_AUD)
        .setIssuedAt()
        .setExpirationTime('5m')
        .setProtectedHeader({ alg: 'RS256', kid: 'journal-local' })
        .sign(privateKey);
      return { 'Cf-Access-Jwt-Assertion': jwt };
    }
    return { mf, db, bindings, adminHeaders };
  } catch (error) {
    await mf.dispose();
    throw error;
  }
}
