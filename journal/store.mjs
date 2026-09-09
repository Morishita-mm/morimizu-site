import { parseEntry } from '../scripts/journal/schema.mjs';
import {
  prepareManuscript,
  newArticleId,
  serializeManuscript,
  today,
} from './manuscript.mjs';

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
  const existing = await adminEntry(db, entry.id);
  if (existing?.deleted_at)
    throw new JournalError(409, 'Article is in trash; restore it first');
  if (results[3].results[0]?.draft_revision !== revision)
    throw new JournalError(
      409,
      'This ID already has a different saved manuscript; uploads cannot replace it',
    );
  return { id: entry.id, revision, duplicate: results[2].meta.changes === 0 };
}
export async function adminEntry(db, id) {
  return db
    .prepare(`SELECT e.*, r.document, r.source, r.received_at FROM journal_entries e
    JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.draft_revision WHERE e.id=?`)
    .bind(id)
    .first();
}
export async function adminList(db, after = '', options = {}) {
  const filters = {
    all: 'e.deleted_at IS NULL',
    private:
      "e.deleted_at IS NULL AND e.visibility='private' AND e.published_at IS NULL",
    stopped:
      "e.deleted_at IS NULL AND e.visibility='private' AND e.published_at IS NOT NULL",
    public: "e.deleted_at IS NULL AND e.visibility='public'",
    unlisted: "e.deleted_at IS NULL AND e.visibility='unlisted'",
    trash: 'e.deleted_at IS NOT NULL',
  };
  const filter = Object.hasOwn(filters, options.status ?? '')
    ? filters[options.status]
    : filters.all;
  const direction = options.sort === 'asc' ? 'ASC' : 'DESC';
  const query = String(options.q ?? '').slice(0, 160);
  const tag = String(options.tag ?? '').slice(0, 80);
  const kind = String(options.kind ?? '');
  const offset = Math.max(0, Number.parseInt(after, 10) || 0);
  const { results } = await db
    .prepare(`SELECT e.id,e.visibility,e.version,e.draft_revision,e.live_revision,e.deleted_at,e.published_at,
    json_extract(r.document,'$.title') AS title, json_extract(r.document,'$.kind') AS kind,
    CASE WHEN e.draft_revision=e.live_revision OR e.live_revision IS NULL THEN COALESCE(e.tags_json,json_extract(r.document,'$.tags'),'[]') ELSE COALESCE(json_extract(r.document,'$.tags'),'[]') END AS tags_json, COALESCE(e.saved_at,r.received_at) AS received_at
    FROM journal_entries e JOIN journal_revisions r ON r.entry_id=e.id AND r.revision=e.draft_revision
    WHERE ${filter} AND (?='' OR instr(lower(json_extract(r.document,'$.title')),lower(?))>0)
    AND (?='' OR EXISTS(SELECT 1 FROM json_each(CASE WHEN e.draft_revision=e.live_revision OR e.live_revision IS NULL THEN COALESCE(e.tags_json,json_extract(r.document,'$.tags'),'[]') ELSE COALESCE(json_extract(r.document,'$.tags'),'[]') END) WHERE value=?))
    AND (?='' OR json_extract(r.document,'$.kind')=?)
    ORDER BY COALESCE(e.saved_at,r.received_at) ${direction},e.id ${direction} LIMIT 51 OFFSET ?`)
    .bind(query, query, tag, tag, kind, kind, offset)
    .all();
  const { results: totals } = await db
    .prepare(`SELECT visibility,deleted_at,published_at,COUNT(*) AS count
    FROM journal_entries GROUP BY visibility, deleted_at IS NOT NULL, published_at IS NOT NULL`)
    .all();
  const counts = {
    all: 0,
    private: 0,
    public: 0,
    unlisted: 0,
    stopped: 0,
    trash: 0,
  };
  for (const row of totals) {
    const key = row.deleted_at
      ? 'trash'
      : row.visibility === 'private'
        ? row.published_at
          ? 'stopped'
          : 'private'
        : row.visibility;
    counts[key] += row.count;
    if (!row.deleted_at) counts.all += row.count;
  }
  return {
    entries: results.slice(0, 50),
    next: results.length > 50 ? String(offset + 50) : null,
    counts,
  };
}

export async function createDraft(db, id = newArticleId()) {
  const date = today();
  const source = serializeManuscript(
    {
      id,
      title: '',
      summary: '',
      kind: 'article',
      createdAt: date,
      updatedAt: date,
      language: 'ja',
      tags: [],
      projects: [],
      relatedEntries: [],
    },
    '',
  );
  const { document } = prepareManuscript(source, { draft: true });
  const revision = await digest(source);
  await db.batch([
    db.prepare('INSERT INTO journal_entries(id) VALUES (?)').bind(id),
    db
      .prepare(
        'INSERT INTO journal_revisions(entry_id,revision,source,document,received_at) VALUES (?,?,?,?,?)',
      )
      .bind(
        id,
        revision,
        source,
        JSON.stringify(document),
        new Date().toISOString(),
      ),
    db
      .prepare(
        'UPDATE journal_entries SET draft_revision=?,version=1,saved_at=? WHERE id=?',
      )
      .bind(revision, new Date().toISOString(), id),
  ]);
  return adminEntry(db, id);
}

export async function saveDraft(db, id, source, version) {
  if (!Number.isSafeInteger(version))
    throw new JournalError(400, 'version is required');
  const current = await adminEntry(db, id);
  if (!current) throw new JournalError(404, 'Not found');
  if (current.deleted_at) throw new JournalError(409, 'Article is in trash');
  if (current.version !== version)
    throw new JournalError(409, 'State changed; reload and review again');
  let parsed;
  try {
    parsed = prepareManuscript(source, { id, draft: true });
  } catch (error) {
    throw new JournalError(400, error.message);
  }
  if (parsed.document.createdAt !== JSON.parse(current.document).createdAt)
    throw new JournalError(400, 'createdAt cannot be changed');
  const revision = await digest(parsed.source);
  if (revision === current.draft_revision) return current;
  const result = await db.batch([
    db
      .prepare(`INSERT INTO journal_revisions(entry_id,revision,source,document,received_at)
      SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM journal_entries WHERE id=? AND version=? AND deleted_at IS NULL)
      ON CONFLICT(entry_id,revision) DO NOTHING`)
      .bind(
        id,
        revision,
        parsed.source,
        JSON.stringify(parsed.document),
        new Date().toISOString(),
        id,
        version,
      ),
    db
      .prepare(
        'UPDATE journal_entries SET draft_revision=?,version=version+1,saved_at=?,tags_json=CASE WHEN live_revision IS NULL THEN NULL ELSE tags_json END WHERE id=? AND version=? AND deleted_at IS NULL',
      )
      .bind(revision, new Date().toISOString(), id, version),
  ]);
  if (result[1].meta.changes !== 1)
    throw new JournalError(409, 'State changed; reload and review again');
  return adminEntry(db, id);
}

export async function revisionHistory(db, id, before = '') {
  const { results } = await db
    .prepare(`SELECT revision,received_at,json_extract(document,'$.title') AS title
    FROM journal_revisions WHERE entry_id=? AND (?='' OR received_at || '/' || revision < ?)
    ORDER BY received_at DESC,revision DESC LIMIT 51`)
    .bind(id, before, before)
    .all();
  const last = results[49];
  return {
    revisions: results.slice(0, 50),
    next: results.length > 50 ? `${last.received_at}/${last.revision}` : null,
  };
}
export async function revisionSource(db, id, revision) {
  const row = await db
    .prepare(
      'SELECT source FROM journal_revisions WHERE entry_id=? AND revision=?',
    )
    .bind(id, revision)
    .first();
  if (!row) throw new JournalError(404, 'Revision not found');
  return row.source;
}

async function removeOrRestore(db, id, input, current) {
  if (input.action === 'purge') {
    if (!current.deleted_at)
      throw new JournalError(400, 'Move to trash before deleting permanently');
    const result = await db.batch([
      db
        .prepare(
          'UPDATE journal_entries SET draft_revision=NULL,live_revision=NULL,version=version+1 WHERE id=? AND version=? AND deleted_at IS NOT NULL',
        )
        .bind(id, input.version),
      db
        .prepare(
          'DELETE FROM journal_revisions WHERE entry_id=? AND EXISTS(SELECT 1 FROM journal_entries WHERE id=? AND version=? AND draft_revision IS NULL AND deleted_at IS NOT NULL)',
        )
        .bind(id, id, input.version + 1),
      db
        .prepare(
          'DELETE FROM journal_entries WHERE id=? AND version=? AND draft_revision IS NULL AND deleted_at IS NOT NULL',
        )
        .bind(id, input.version + 1),
    ]);
    if (result[0].meta.changes !== 1)
      throw new JournalError(409, 'State changed');
  } else {
    if ((input.action === 'restore') !== Boolean(current.deleted_at))
      throw new JournalError(409, 'State changed');
    const result = await db
      .prepare(
        `UPDATE journal_entries SET deleted_at=?,visibility='private',share_hash=NULL,version=version+1 WHERE id=? AND version=?`,
      )
      .bind(
        input.action === 'trash' ? new Date().toISOString() : null,
        id,
        input.version,
      )
      .run();
    if (result.meta.changes !== 1) throw new JournalError(409, 'State changed');
  }
  return { id, sharePath: null };
}
export async function change(db, id, input) {
  if (
    !Number.isSafeInteger(input.version) ||
    ![
      'apply',
      'visibility',
      'rotate',
      'tags',
      'trash',
      'restore',
      'purge',
    ].includes(input.action) ||
    (!['tags', 'trash', 'restore', 'purge'].includes(input.action) &&
      !['private', 'unlisted', 'public'].includes(input.visibility))
  )
    throw new JournalError(400, 'Invalid action');
  const current = await adminEntry(db, id);
  if (!current) throw new JournalError(404, 'Not found');
  if (current.version !== input.version)
    throw new JournalError(409, 'State changed; reload and review again');
  if (['trash', 'restore', 'purge'].includes(input.action))
    return removeOrRestore(db, id, input, current);
  if (current.deleted_at) throw new JournalError(409, 'Article is in trash');
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
  if (
    apply &&
    input.visibility !== 'private' &&
    (!JSON.parse(current.document).summary ||
      !JSON.parse(current.document).title ||
      !JSON.parse(current.document).content)
  )
    throw new JournalError(
      400,
      'タイトル・要約・本文を入力してから公開してください',
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
  const tags =
    apply && current.draft_revision !== current.live_revision
      ? JSON.stringify(JSON.parse(current.document).tags)
      : current.tags_json;
  const result = await db
    .prepare(`UPDATE journal_entries SET live_revision=?, visibility=?, share_hash=?,
    published_at=?, tags_json=?, version=version+1 WHERE id=? AND version=?`)
    .bind(live, input.visibility, shareHash, published, tags, id, input.version)
    .run();
  if (result.meta.changes !== 1)
    throw new JournalError(409, 'State changed; reload and review again');
  // Return the snapshot committed by this CAS, without another fallible read.
  return {
    id,
    sharePath: token ? `/journal/share/${token}` : null,
    entry: {
      ...current,
      live_revision: live,
      visibility: input.visibility,
      share_hash: shareHash,
      published_at: published,
      tags_json: tags,
      version: input.version + 1,
    },
  };
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
    WHERE e.deleted_at IS NULL AND e.visibility='public'
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
      `${liveSelect} WHERE e.deleted_at IS NULL AND ${share ? "e.visibility='unlisted' AND e.share_hash=?" : "e.visibility='public' AND e.id=?"}`,
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
    WHERE e.deleted_at IS NULL AND e.visibility='public' ORDER BY wanted.key`)
    .bind(JSON.stringify(entry.relatedEntries))
    .all();
  entry.relatedEntries = related.map((e) => e.id);
  return { entry, related };
}
