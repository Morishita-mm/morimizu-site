import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Miniflare } from 'miniflare';
import {
  createDraft,
  saveDraft,
  adminEntry,
  adminList,
  change,
  revisionHistory,
  revisionSource,
  publicEntry,
  publicList,
  ingest,
} from './store.mjs';
import {
  serializeManuscript,
  prepareManuscript,
  newArticleId,
} from './manuscript.mjs';
import { readFrontMatter } from '../lib/content/frontmatter.mjs';

await test('editable drafts, concurrent saves, publication snapshots, history and deletion', async (t) => {
  const mf = new Miniflare({
    modules: true,
    script: 'export default {fetch(){return new Response("ok")}}',
    compatibilityDate: '2026-05-15',
    d1Databases: { JOURNAL_DB: 'editing-test' },
  });
  t.after(() => mf.dispose());
  const db = await mf.getD1Database('JOURNAL_DB');
  for (const file of [
    '0001_journal.sql',
    '0002_journal_tags.sql',
    '0003_journal_editing.sql',
    '0004_journal_saved_at.sql',
  ]) {
    const sql = await readFile(
      new URL(`./migrations/${file}`, import.meta.url),
      'utf8',
    );
    await db.batch(
      sql
        .split(';')
        .filter((s) => s.trim())
        .map((s) => db.prepare(s)),
    );
  }
  let entry = await createDraft(db);
  assert.match(entry.id, /^j-[0-9a-f-]{36}$/);
  assert.notEqual(entry.id, newArticleId());
  assert.equal(entry.visibility, 'private');
  assert.equal(await publicEntry(db, entry.id), null);
  await assert.rejects(
    change(db, entry.id, {
      action: 'apply',
      version: entry.version,
      revision: entry.draft_revision,
      visibility: 'public',
    }),
    { status: 400 },
  );
  const data = readFrontMatter(entry.source).data;
  const source = serializeManuscript(
    { ...data, title: '最初の記事', summary: '要約', tags: ['最初'] },
    '公開する本文',
  );
  const empty = entry.draft_revision;
  entry = await saveDraft(db, entry.id, source, entry.version);
  const first = entry.draft_revision;
  await change(db, entry.id, {
    action: 'apply',
    version: entry.version,
    revision: first,
    visibility: 'public',
  });
  entry = await adminEntry(db, entry.id);
  const v = entry.version;
  const results = await Promise.allSettled(
    ['変更A', '変更B'].map((title) =>
      saveDraft(
        db,
        entry.id,
        serializeManuscript(
          { ...data, title, summary: '変更', tags: ['未反映'] },
          'PRIVATE NEW DRAFT',
        ),
        v,
      ),
    ),
  );
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.find((r) => r.status === 'rejected').reason.status, 409);
  entry = await adminEntry(db, entry.id);
  const live = (await publicEntry(db, entry.id)).entry;
  assert.equal(live.title, '最初の記事');
  assert.equal(live.content, '公開する本文');
  assert.deepEqual(live.tags, ['最初']);
  assert.equal((await revisionHistory(db, entry.id)).revisions.length, 3);
  assert.equal(await revisionSource(db, entry.id, first), source);
  await assert.rejects(
    saveDraft(
      db,
      entry.id,
      source.replace(entry.id, 'other-id'),
      entry.version,
    ),
    { status: 400 },
  );
  await assert.rejects(saveDraft(db, entry.id, source, v), { status: 409 });
  const listed = await adminList(db, '', {
    q: '変更',
    status: 'public',
    tag: '未反映',
  });
  assert.equal(listed.entries.length, 1);
  assert.equal(listed.counts.public, 1);
  assert.equal((await adminList(db, '', { q: '最初' })).entries.length, 0);
  // Explicit apply publishes the reviewed draft and its metadata, not later edits.
  await change(db, entry.id, {
    action: 'apply',
    version: entry.version,
    revision: entry.draft_revision,
    visibility: 'public',
  });
  entry = await adminEntry(db, entry.id);
  assert.equal(
    (await publicEntry(db, entry.id)).entry.content,
    'PRIVATE NEW DRAFT',
  );
  assert.deepEqual((await publicEntry(db, entry.id)).entry.tags, ['未反映']);
  // Restoring an older version is only a draft change.
  entry = await saveDraft(
    db,
    entry.id,
    await revisionSource(db, entry.id, first),
    entry.version,
  );
  assert.equal(
    (await publicEntry(db, entry.id)).entry.content,
    'PRIVATE NEW DRAFT',
  );
  await change(db, entry.id, {
    action: 'apply',
    version: entry.version,
    revision: entry.draft_revision,
    visibility: 'unlisted',
  });
  entry = await adminEntry(db, entry.id);
  const shared = await change(db, entry.id, {
    action: 'rotate',
    version: entry.version,
    visibility: 'unlisted',
  });
  const token = shared.sharePath.split('/').at(-1);
  assert.ok(await publicEntry(db, token, true));
  entry = await adminEntry(db, entry.id);
  await assert.rejects(
    change(db, entry.id, { action: 'purge', version: entry.version }),
    { status: 400 },
  );
  await change(db, entry.id, { action: 'trash', version: entry.version });
  assert.equal(await publicEntry(db, token, true), null);
  assert.equal((await publicList(db)).entries.length, 0);
  assert.equal((await adminList(db)).entries.length, 0);
  assert.equal((await adminList(db, '', { status: 'trash' })).counts.trash, 1);
  entry = await adminEntry(db, entry.id);
  await assert.rejects(saveDraft(db, entry.id, source, entry.version), {
    status: 409,
  });
  await assert.rejects(ingest(db, source), { status: 409 });
  await change(db, entry.id, { action: 'restore', version: entry.version });
  entry = await adminEntry(db, entry.id);
  assert.equal(entry.visibility, 'private');
  assert.equal(await publicEntry(db, token, true), null);
  await change(db, entry.id, { action: 'trash', version: entry.version });
  const trashed = await adminEntry(db, entry.id);
  await assert.rejects(
    change(db, entry.id, { action: 'purge', version: entry.version }),
    { status: 409 },
  );
  await change(db, entry.id, { action: 'purge', version: trashed.version });
  assert.equal(await adminEntry(db, entry.id), null);
  assert.equal((await revisionHistory(db, entry.id)).revisions.length, 0);
  assert.equal(
    (
      await db
        .prepare('SELECT COUNT(*) AS n FROM journal_revisions WHERE revision=?')
        .bind(empty)
        .first()
    ).n,
    0,
  );
  const noId = source.replace(/^id:.*\n/m, '');
  assert.match(prepareManuscript(noId).document.id, /^j-/);
});
