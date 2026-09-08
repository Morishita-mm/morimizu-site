import { parseEntry } from '../scripts/journal/schema.mjs';

export class JournalError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export async function digest(text) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(bytes), (v) =>
    v.toString(16).padStart(2, '0'),
  ).join('');
}
export function database(env) {
  if (!env.JOURNAL_DB)
    throw new JournalError(503, 'Journal storage is not configured');
  // No replica sessions, KV, or response cache: authorization reads the primary.
  return env.JOURNAL_DB;
}
export async function ingest(db, source) {
  let entry;
  try {
    entry = parseEntry(source, 'manuscript', { managed: true });
  } catch {
    throw new JournalError(
      400,
      'Invalid manuscript: check YAML fields, dates and body; publication fields belong to the server',
    );
  }
  if (['admin', 'share', 'upload'].includes(entry.id))
    throw new JournalError(400, 'Reserved id');
  if (!entry.summary)
    throw new JournalError(400, 'A summary is required before upload');
  const revision = await digest(source);
  const {
    status: _status,
    visibility: _visibility,
    publishedAt: _publishedAt,
    ...document
  } = entry;
  // First upload claims the stable ID. All channels treat saved content as immutable.
  // Conditional writes in a transaction also protect against concurrent first uploads.
  const results = await db.batch([
    db
      .prepare(
        'INSERT INTO journal_entries(id) VALUES (?) ON CONFLICT(id) DO NOTHING',
      )
      .bind(entry.id),
    db
      .prepare(
        `INSERT INTO journal_revisions(entry_id,revision,source,document,received_at)
         SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM journal_entries WHERE id=? AND draft_revision IS NULL)
         ON CONFLICT(entry_id,revision) DO NOTHING`,
      )
      .bind(
        entry.id,
        revision,
        source,
        JSON.stringify(document),
        new Date().toISOString(),
        entry.id,
      ),
    db
      .prepare(
        'UPDATE journal_entries SET draft_revision=?, version=version+1 WHERE id=? AND draft_revision IS NULL',
      )
      .bind(revision, entry.id),
    db
      .prepare('SELECT draft_revision FROM journal_entries WHERE id=?')
      .bind(entry.id),
  ]);
  if (results[3].results[0]?.draft_revision !== revision)
    throw new JournalError(
      409,
      'This ID already has a different saved manuscript; uploads cannot replace it',
    );
  return { id: entry.id, revision, duplicate: results[2].meta.changes === 0 };
}
export async function adminEntry(db, id) {
  return db
    .prepare(`SELECT e.*, r.document, r.received_at FROM journal_entries e
    JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.draft_revision WHERE e.id=?`)
    .bind(id)
    .first();
}
export async function adminList(db, after = '') {
  const { results } = await db
    .prepare(`SELECT e.id,e.visibility,e.version,e.draft_revision,e.live_revision,
    json_extract(r.document,'$.title') AS title, r.received_at FROM journal_entries e
    JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.draft_revision
    WHERE e.id>? ORDER BY e.id LIMIT 51`)
    .bind(after)
    .all();
  return {
    entries: results.slice(0, 50),
    next: results.length > 50 ? results[49].id : null,
  };
}
export async function change(db, id, input) {
  if (
    !Number.isSafeInteger(input.version) ||
    !['apply', 'visibility', 'rotate', 'tags'].includes(input.action) ||
    (input.action !== 'tags' &&
      !['private', 'unlisted', 'public'].includes(input.visibility))
  )
    throw new JournalError(400, 'Invalid action');
  const current = await adminEntry(db, id);
  if (!current) throw new JournalError(404, 'Not found');
  if (current.version !== input.version)
    throw new JournalError(409, 'State changed; reload and review again');
  if (input.action === 'tags') {
    if (
      !Array.isArray(input.tags) ||
      input.tags.length > 30 ||
      input.tags.some(
        (tag) =>
          typeof tag !== 'string' || !tag.trim() || tag.trim().length > 80,
      )
    )
      throw new JournalError(
        400,
        'Tags must contain up to 30 nonempty strings of at most 80 characters',
      );
    const tags = [...new Set(input.tags.map((tag) => tag.trim()))];
    const result = await db
      .prepare(
        'UPDATE journal_entries SET tags_json=?, version=version+1 WHERE id=? AND version=?',
      )
      .bind(JSON.stringify(tags), id, input.version)
      .run();
    if (result.meta.changes !== 1)
      throw new JournalError(409, 'State changed; reload and review again');
    return { id, sharePath: null };
  }
  const apply = input.action === 'apply';
  if (apply && input.revision !== current.draft_revision)
    throw new JournalError(409, 'Draft changed; review again');
  if (!apply && !current.live_revision && input.visibility !== 'private')
    throw new JournalError(400, 'Review and apply a draft first');
  if (apply && !JSON.parse(current.document).summary)
    throw new JournalError(
      400,
      'This legacy manuscript has no summary and cannot be published',
    );
  if (
    input.action === 'rotate' &&
    (current.visibility !== 'unlisted' || input.visibility !== 'unlisted')
  )
    throw new JournalError(400, 'Only an unlisted entry has a share link');
  const token =
    input.visibility === 'unlisted' &&
    (current.visibility !== 'unlisted' || input.action === 'rotate')
      ? Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
          v.toString(16).padStart(2, '0'),
        ).join('')
      : null;
  const shareHash =
    input.visibility !== 'unlisted'
      ? null
      : token
        ? await digest(token)
        : current.share_hash;
  const live = apply ? current.draft_revision : current.live_revision;
  const published =
    current.published_at ??
    (input.visibility !== 'private'
      ? new Date().toISOString().slice(0, 10)
      : null);
  const result = await db
    .prepare(`UPDATE journal_entries SET live_revision=?, visibility=?, share_hash=?,
    published_at=?, version=version+1 WHERE id=? AND version=?`)
    .bind(live, input.visibility, shareHash, published, id, input.version)
    .run();
  if (result.meta.changes !== 1)
    throw new JournalError(409, 'State changed; reload and review again');
  return { id, sharePath: token ? `/journal/share/${token}` : null };
}
const liveSelect = `SELECT r.document,e.published_at,e.tags_json FROM journal_entries e
 JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.live_revision`;
function document(row) {
  if (!row) return null;
  return {
    ...JSON.parse(row.document),
    ...(row.tags_json !== null ? { tags: JSON.parse(row.tags_json) } : {}),
    publishedAt: row.published_at ?? '',
  };
}
export async function publicList(db, before = '', sort = 'desc') {
  const ascending = sort === 'asc';
  const direction = ascending ? 'ASC' : 'DESC';
  const comparison = ascending ? '>' : '<';
  // Metadata only; drafts and raw originals never leave through the public API.
  const { results } = await db
    .prepare(`SELECT json_remove(r.document,'$.content','$.relatedEntries') AS document,e.published_at,e.tags_json
    FROM journal_entries e JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.live_revision
    WHERE e.visibility='public'
    AND (?='' OR e.published_at || '/' || e.id ${comparison} ?) ORDER BY e.published_at ${direction},e.id ${direction} LIMIT 51`)
    .bind(before, before)
    .all();
  const entries = results
    .slice(0, 50)
    .map(document)
    .map(({ content: _body, relatedEntries: _related, ...entry }) => entry);
  const last = entries.at(-1);
  return {
    entries,
    next: results.length > 50 ? `${last.publishedAt}/${last.id}` : null,
  };
}
export async function publicEntry(db, id, share = false) {
  const row = await db
    .prepare(
      `${liveSelect} WHERE ${share ? "e.visibility='unlisted' AND e.share_hash=?" : "e.visibility='public' AND e.id=?"}`,
    )
    .bind(share ? await digest(id) : id)
    .first();
  const entry = document(row);
  if (!entry) return null;
  // Fetch related metadata in one query, even with the maximum 30 relations.
  // Metadata generation + page rendering stay below the Free per-request SQL limit.
  const { results: related } = await db
    .prepare(`SELECT e.id,
    json_extract(r.document,'$.title') AS title,
    json_extract(r.document,'$.kind') AS kind, e.published_at AS publishedAt
    FROM journal_entries e JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.live_revision
    JOIN json_each(?) wanted ON wanted.value=e.id
    WHERE e.visibility='public' ORDER BY wanted.key`)
    .bind(JSON.stringify(entry.relatedEntries))
    .all();
  entry.relatedEntries = related.map((e) => e.id);
  return { entry, related };
}
