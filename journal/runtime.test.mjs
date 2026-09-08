import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Miniflare } from 'miniflare';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { handleJournal } from './http.mjs';
import {
  adminEntry,
  publicEntry,
  ingest,
  change,
  publicList,
} from './store.mjs';

const source = (body = 'JOURNAL_PRIVATE_E2E_CANARY_785a', id = 'sample') =>
  `---\nid: ${id}\ntitle: Test Journal\ncreatedAt: '2026-09-01'\nupdatedAt: '2026-09-08'\nkind: experiment\nsummary: A test\nrelatedEntries: []\n---\n${body}\n`;
const origin = 'https://journal.test';
await test('D1 lifecycle, HTTP authorization, concurrency, persistence and portable backup', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'journal-test-'));
  const options = {
    modules: true,
    script: 'export default { fetch(){ return new Response("ok"); } }',
    compatibilityDate: '2026-05-15',
    d1Databases: { JOURNAL_DB: 'journal-test' },
    d1Persist: directory,
  };
  let mf = new Miniflare(options);
  t.after(async () => {
    await mf.dispose();
    await rm(directory, { recursive: true, force: true });
  });
  let db = await mf.getD1Database('JOURNAL_DB');
  const sql =
    (await readFile(
      new URL('./migrations/0001_journal.sql', import.meta.url),
      'utf8',
    )) +
    (await readFile(
      new URL('./migrations/0002_journal_tags.sql', import.meta.url),
      'utf8',
    ));
  for (const statement of sql.split(';').filter((s) => s.trim()))
    await db.prepare(statement).run();
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: 'test',
    alg: 'RS256',
    use: 'sig',
  };
  const originalFetch = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (url, ...args) =>
    String(url) === 'https://test.cloudflareaccess.com/cdn-cgi/access/certs'
      ? Response.json({ keys: [jwk] })
      : originalFetch(url, ...args),
  );
  const env = {
    JOURNAL_DB: db,
    JOURNAL_UPLOAD_TOKEN: 'test-upload-secret-32-bytes-minimum-length',
    JOURNAL_ACCESS_TEAM: 'https://test.cloudflareaccess.com',
    JOURNAL_ACCESS_AUD: 'journal-aud',
    JOURNAL_ADMIN_EMAIL: 'owner@example.test',
  };
  const sign = (claims = {}, aud = 'journal-aud', exp = '1h') =>
    new SignJWT({ email: env.JOURNAL_ADMIN_EMAIL, type: 'app', ...claims })
      .setProtectedHeader({ alg: 'RS256', kid: 'test' })
      .setIssuer(env.JOURNAL_ACCESS_TEAM)
      .setAudience(aud)
      .setSubject('owner')
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(privateKey);
  const jwt = await sign();
  const call = (
    path,
    { auth = false, method = 'GET', body, headers = {} } = {},
  ) =>
    handleJournal(
      new Request(origin + path, {
        method,
        headers: {
          ...(auth ? { 'Cf-Access-Jwt-Assertion': jwt } : {}),
          ...headers,
        },
        ...(body === undefined ? {} : { body }),
      }),
      env,
      () => new Response('protected page'),
    );
  const upload = (body) =>
    call('/api/journal/v1/drafts', {
      auth: true,
      method: 'PUT',
      body,
      headers: {
        authorization: `Bearer ${env.JOURNAL_UPLOAD_TOKEN}`,
        'content-type': 'text/markdown',
      },
    });
  const post = async (action, visibility, extra = {}) => {
    const entry = await adminEntry(db, 'sample');
    return call('/api/journal/admin/entries/sample', {
      auth: true,
      method: 'POST',
      body: JSON.stringify({
        action,
        visibility,
        version: entry.version,
        revision: entry.draft_revision,
        ...extra,
      }),
      headers: { origin, 'content-type': 'application/json' },
    });
  };
  const state = async () => adminEntry(db, 'sample');
  await t.test(
    'unauthenticated and forged access blocked on page, RSC and data',
    async () => {
      for (const path of [
        '/journal/admin',
        '/journal/admin/upload',
        '/journal//admin/upload',
        '//journal/admin/upload',
        '/journal/admin%2fupload',
        '/journal//admin/sample',
        '/api//journal/admin/entries/sample?source=1',
        '/journal/%61dmin/sample',
        '/journal/admin/sample',
        '/api/journal/admin/entries',
        '/api/journal/admin/entries/sample?source=1',
      ]) {
        const response = await call(path, {
          headers: {
            RSC: '1',
            'Cf-Access-Authenticated-User-Email': env.JOURNAL_ADMIN_EMAIL,
          },
        });
        assert.equal(response.status, 401);
        assert.match(response.headers.get('cache-control'), /no-store/);
      }
      for (const token of [
        'forged',
        await sign({}, 'wrong-aud'),
        await sign({ email: 'other@example.test' }),
        await sign({}, 'journal-aud', '-1h'),
      ])
        assert.equal(
          (
            await call('/journal/admin', {
              headers: { 'Cf-Access-Jwt-Assertion': token },
            })
          ).status,
          401,
        );
      assert.equal((await call('/journal/admin', { auth: true })).status, 200);
      assert.equal(
        (
          await call('/api/journal/v1/drafts', {
            method: 'PUT',
            body: source(),
          })
        ).status,
        401,
      );
    },
  );
  await t.test(
    'every upload route requires the exact owner JWT, including legacy bearer uploads',
    async () => {
      const wrongOwner = await sign({ email: 'not-owner@example.test' });
      const invalidTokens = [
        undefined,
        'forged',
        wrongOwner,
        await sign({}, 'wrong-aud'),
        await sign({}, 'journal-aud', '-1h'),
      ];
      for (const path of [
        '/api/journal/admin/drafts',
        '/api/journal/v1/drafts',
      ]) {
        for (const token of invalidTokens) {
          const response = await call(path, {
            method: 'PUT',
            body: source(),
            headers: {
              authorization: `Bearer ${env.JOURNAL_UPLOAD_TOKEN}`,
              'content-type': 'text/markdown',
              origin,
              'Cf-Access-Authenticated-User-Email': env.JOURNAL_ADMIN_EMAIL,
              ...(token ? { 'Cf-Access-Jwt-Assertion': token } : {}),
            },
          });
          assert.equal(response.status, 401, path);
        }
      }
      assert.equal(
        (await db.prepare('SELECT count(*) n FROM journal_entries').first()).n,
        0,
      );
    },
  );
  await t.test(
    'first send private; exact duplicate idempotent; server fields rejected',
    async () => {
      assert.equal((await upload(source())).status, 200);
      const first = await state();
      assert.equal(first.visibility, 'private');
      assert.equal(first.live_revision, null);
      assert.equal((await upload(source())).status, 200);
      assert.equal((await state()).version, first.version);
      assert.equal(
        (await db.prepare('SELECT count(*) n FROM journal_entries').first()).n,
        1,
      );
      assert.equal(
        (await db.prepare('SELECT count(*) n FROM journal_revisions').first())
          .n,
        1,
      );
      assert.equal((await call('/api/journal/v1/entries/sample')).status, 404);
      assert.deepEqual(
        (await (await call('/api/journal/v1/entries')).json()).entries,
        [],
      );
      assert.equal(
        (
          await upload(
            source().replace(
              'kind: experiment',
              'kind: experiment\nvisibility: public',
            ),
          )
        ).status,
        400,
      );
      assert.equal((await upload('a'.repeat(256 * 1024 + 1))).status, 413);
      assert.equal(
        (
          await call('/api/journal/admin/entries', {
            headers: { authorization: `Bearer ${env.JOURNAL_UPLOAD_TOKEN}` },
          })
        ).status,
        401,
      );
      assert.equal(
        await (
          await call('/api/journal/admin/entries/sample?source=1', {
            auth: true,
          })
        ).text(),
        source(),
      );
    },
  );
  await t.test(
    'admin browser uploads require JWT and same origin; originals are immutable',
    async () => {
      const browserUpload = (body, auth = true, site = origin) =>
        call('/api/journal/admin/drafts', {
          auth,
          method: 'PUT',
          body,
          headers: { origin: site, 'content-type': 'text/markdown' },
        });
      assert.equal(
        (await browserUpload(source('browser draft', 'browser-upload'), false))
          .status,
        401,
      );
      assert.equal(
        (
          await browserUpload(
            source('browser draft', 'browser-upload'),
            true,
            'https://other.test',
          )
        ).status,
        403,
      );
      const first = await browserUpload(
        source('browser draft', 'browser-upload'),
      );
      assert.equal(first.status, 200);
      assert.equal((await first.json()).duplicate, false);
      const repeat = await browserUpload(
        source('browser draft', 'browser-upload'),
      );
      assert.equal((await repeat.json()).duplicate, true);
      const before = await adminEntry(db, 'browser-upload');
      assert.equal(
        (await browserUpload(source('different text', 'browser-upload')))
          .status,
        409,
      );
      assert.deepEqual(await adminEntry(db, 'browser-upload'), before);
      assert.equal(
        (
          await browserUpload(
            source('new', 'missing-summary').replace('summary: A test\n', ''),
          )
        ).status,
        400,
      );
      const template = await call('/api/journal/admin/template', {
        auth: true,
      });
      assert.equal(template.status, 200);
      assert.match(template.headers.get('content-disposition'), /attachment/);
      assert.equal((await browserUpload(await template.text())).status, 200);
    },
  );
  await t.test(
    'published content is fixed and same-file reupload preserves visibility',
    async () => {
      assert.equal((await post('apply', 'public')).status, 200);
      const before = await state();
      assert.equal((await upload(source('Changed draft only'))).status, 409);
      assert.deepEqual(await state(), before);
      assert.equal(
        (await publicEntry(db, 'sample')).entry.content,
        'JOURNAL_PRIVATE_E2E_CANARY_785a',
      );
      assert.equal((await upload(source())).status, 200);
      assert.deepEqual(await state(), before);
      await post('visibility', 'private');
      assert.equal(
        (
          await post('apply', 'public', {
            version: before.version,
            revision: before.draft_revision,
          })
        ).status,
        409,
      );
      assert.equal((await post('visibility', 'public')).status, 200);
    },
  );
  await t.test(
    'concurrent initial uploads cannot replace one another',
    async () => {
      const results = await Promise.allSettled(
        ['first', 'second'].map((body) =>
          ingest(db, source(body, 'concurrent')),
        ),
      );
      assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
      assert.equal(
        results.find((r) => r.status === 'rejected').reason.status,
        409,
      );
      assert.equal(
        (
          await db
            .prepare(
              "SELECT count(*) n FROM journal_revisions WHERE entry_id='concurrent'",
            )
            .first()
        ).n,
        1,
      );
      assert.equal((await adminEntry(db, 'concurrent')).visibility, 'private');
    },
  );
  let firstLink;
  await t.test(
    'unlisted excluded, private revokes, re-sharing never revives old link',
    async () => {
      const result = await (await post('visibility', 'unlisted')).json();
      firstLink = result.sharePath.split('/').at(-1);
      assert.equal((await call('/api/journal/v1/entries/sample')).status, 404);
      assert.deepEqual(
        (await (await call('/api/journal/v1/entries')).json()).entries,
        [],
      );
      assert.equal(
        (await publicEntry(db, firstLink, true)).entry.content,
        'JOURNAL_PRIVATE_E2E_CANARY_785a',
      );
      await upload(source('Another private draft'));
      assert.equal(
        (await publicEntry(db, firstLink, true)).entry.content,
        'JOURNAL_PRIVATE_E2E_CANARY_785a',
      );
      const rotated = await (await post('rotate', 'unlisted')).json();
      assert.equal(await publicEntry(db, firstLink, true), null);
      firstLink = rotated.sharePath.split('/').at(-1);
      await post('visibility', 'private');
      assert.equal(await publicEntry(db, firstLink, true), null);
      await post('visibility', 'unlisted');
      assert.equal(await publicEntry(db, firstLink, true), null);
      await post('visibility', 'public');
      await post('visibility', 'private');
      const response = await call('/api/journal/v1/entries/sample', {
        headers: { 'If-None-Match': 'anything' },
      });
      assert.equal(response.status, 404);
      assert.match(response.headers.get('cache-control'), /no-store/);
    },
  );
  await t.test('CSRF, methods, failure paths and race protection', async () => {
    const body = JSON.stringify({
      action: 'apply',
      visibility: 'public',
      version: (await state()).version,
    });
    assert.equal(
      (
        await call('/api/journal/admin/entries/sample', {
          auth: true,
          method: 'POST',
          body,
          headers: {
            origin: 'https://evil.test',
            'content-type': 'application/json',
          },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await call('/api/journal/admin/entries/sample', {
          auth: true,
          method: 'DELETE',
        })
      ).status,
      405,
    );
    const current = await state();
    const outcomes = await Promise.allSettled(
      ['public', 'private'].map((visibility) =>
        change(db, 'sample', {
          action: 'apply',
          visibility,
          version: current.version,
          revision: current.draft_revision,
        }),
      ),
    );
    assert.equal(outcomes.filter((o) => o.status === 'fulfilled').length, 1);
    assert.equal(
      outcomes.find((o) => o.status === 'rejected').reason.status,
      409,
    );
    const badEnv = {
      ...env,
      JOURNAL_DB: {
        prepare() {
          throw new Error('secret database failure');
        },
      },
    };
    const failed = await handleJournal(
      new Request(origin + '/api/journal/v1/entries'),
      badEnv,
      () => new Response('unsafe'),
    );
    assert.equal(failed.status, 503);
    assert.equal((await failed.text()).includes('secret'), false);
  });
  await t.test(
    'related entries never expose private or unlisted metadata',
    async () => {
      await ingest(db, source('Private linked entry', 'private-related'));
      await ingest(
        db,
        source('Public with relation', 'related-parent').replace(
          'relatedEntries: []',
          'relatedEntries: [private-related]',
        ),
      );
      const state = await adminEntry(db, 'related-parent');
      await change(db, 'related-parent', {
        action: 'apply',
        visibility: 'public',
        version: state.version,
        revision: state.draft_revision,
      });
      const entry = await publicEntry(db, 'related-parent');
      assert.deepEqual(entry.related, []);
      assert.deepEqual(entry.entry.relatedEntries, []);
    },
  );
  await t.test(
    'editable tags preserve source, publication and concurrency guards',
    async () => {
      const before = await adminEntry(db, 'related-parent');
      await change(db, 'related-parent', {
        action: 'tags',
        version: before.version,
        tags: [' AI ', '設計', 'AI'],
      });
      const after = await adminEntry(db, 'related-parent');
      assert.equal(after.document, before.document);
      assert.equal(after.draft_revision, before.draft_revision);
      assert.equal(after.live_revision, before.live_revision);
      assert.equal(after.visibility, before.visibility);
      assert.equal(after.published_at, before.published_at);
      assert.deepEqual((await publicEntry(db, 'related-parent')).entry.tags, [
        'AI',
        '設計',
      ]);
      assert.deepEqual(
        (await publicList(db)).entries.find((e) => e.id === 'related-parent')
          .tags,
        ['AI', '設計'],
      );
      await assert.rejects(
        change(db, 'related-parent', {
          action: 'tags',
          version: before.version,
          tags: [],
        }),
        { status: 409 },
      );
      for (const tags of [
        null,
        [''],
        [7],
        ['a'.repeat(81)],
        Array(31).fill('a'),
      ]) {
        await assert.rejects(
          change(db, 'related-parent', {
            action: 'tags',
            version: after.version,
            tags,
          }),
          { status: 400 },
        );
      }
      await change(db, 'related-parent', {
        action: 'tags',
        version: after.version,
        tags: [],
      });
      assert.deepEqual(
        (await publicEntry(db, 'related-parent')).entry.tags,
        [],
      );
    },
  );
  await t.test(
    'date ordering and cursor pagination cover all entries in both directions',
    async () => {
      for (let i = 0; i < 53; i++) {
        const id = `sort-${String(i).padStart(2, '0')}`;
        const saved = await ingest(db, source('sort body', id));
        const row = await adminEntry(db, id);
        await change(db, id, {
          action: 'apply',
          visibility: 'public',
          version: row.version,
          revision: saved.revision,
        });
        await db
          .prepare('UPDATE journal_entries SET published_at=? WHERE id=?')
          .bind(`2026-08-${String(1 + (i % 3)).padStart(2, '0')}`, id)
          .run();
      }
      const orders = {};
      for (const sort of ['asc', 'desc']) {
        const first = await publicList(db, '', sort);
        assert.equal(first.entries.length, 50);
        assert.ok(first.next);
        const second = await publicList(db, first.next, sort);
        assert.equal(second.next, null);
        const keys = [...first.entries, ...second.entries].map(
          (e) => `${e.publishedAt}/${e.id}`,
        );
        assert.equal(new Set(keys).size, keys.length);
        assert.deepEqual(
          keys,
          sort === 'asc' ? [...keys].sort() : [...keys].sort().reverse(),
        );
        orders[sort] = keys;
      }
      assert.deepEqual(orders.asc, orders.desc.reverse());
      const response = await call('/api/journal/v1/entries?sort=asc');
      assert.deepEqual(
        (await response.json()).entries,
        (await publicList(db, '', 'asc')).entries,
      );
    },
  );
  await t.test(
    'Worker replacement retains all revisions and publication state',
    async () => {
      const before = await state();
      const revisions = (
        await db
          .prepare('SELECT * FROM journal_revisions ORDER BY entry_id,revision')
          .all()
      ).results;
      await mf.dispose();
      mf = new Miniflare({
        ...options,
        script:
          'export default {fetch(){return new Response("new site design");}}',
      });
      db = await mf.getD1Database('JOURNAL_DB');
      env.JOURNAL_DB = db;
      assert.deepEqual(await state(), before);
      assert.deepEqual(
        (
          await db
            .prepare(
              'SELECT * FROM journal_revisions ORDER BY entry_id,revision',
            )
            .all()
        ).results,
        revisions,
      );
      // Portable backup round trip in a fresh D1 database, keeping raw bytes and pointers.
      const backupEntries = (
        await db.prepare('SELECT * FROM journal_entries').all()
      ).results;
      const restored = new Miniflare({ ...options, d1Persist: false });
      try {
        const target = await restored.getD1Database('JOURNAL_DB');
        for (const statement of sql.split(';').filter((s) => s.trim()))
          await target.prepare(statement).run();
        await target.batch([
          ...backupEntries.map((e) =>
            target
              .prepare('INSERT INTO journal_entries(id) VALUES (?)')
              .bind(e.id),
          ),
          ...revisions.map((r) =>
            target
              .prepare('INSERT INTO journal_revisions VALUES (?,?,?,?,?)')
              .bind(
                r.entry_id,
                r.revision,
                r.source,
                r.document,
                r.received_at,
              ),
          ),
          ...backupEntries.map((e) =>
            target
              .prepare(
                'UPDATE journal_entries SET draft_revision=?,live_revision=?,visibility=?,share_hash=?,published_at=?,version=?,tags_json=? WHERE id=?',
              )
              .bind(
                e.draft_revision,
                e.live_revision,
                e.visibility,
                e.share_hash,
                e.published_at,
                e.version,
                e.tags_json,
                e.id,
              ),
          ),
        ]);
        assert.deepEqual(await adminEntry(target, 'sample'), before);
        assert.deepEqual(
          (
            await target
              .prepare(
                'SELECT * FROM journal_revisions ORDER BY entry_id,revision',
              )
              .all()
          ).results,
          revisions,
        );
      } finally {
        await restored.dispose();
      }
    },
  );
});
