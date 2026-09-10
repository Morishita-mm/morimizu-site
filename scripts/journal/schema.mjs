import { readFrontMatter } from '../../lib/content/frontmatter.mjs';

export const KINDS = {
  log: 'Log',
  hypothesis: 'Hypothesis',
  experiment: 'Experiment',
  decision: 'Decision',
  failure: 'Failure / Incident',
  article: 'Article',
};
const fields = new Set([
  'id',
  'title',
  'createdAt',
  'updatedAt',
  'kind',
  'status',
  'visibility',
  'language',
  'tags',
  'projects',
  'relatedEntries',
  'summary',
  'hypothesis',
  'result',
  'confidence',
  'sourceType',
  'authorship',
  'publishedAt',
]);
const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Defense in depth only: human review is still required for every publication.
export function assertNoCredentials(source, file) {
  if (
    /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{20,})\b|[?&](?:access_token|api_key|token|signature)=[^\s&#)]+/i.test(
      source,
    )
  ) {
    throw new Error(
      `${file}: possible credential; remove it before authoring here`,
    );
  }
}

export function parseEntry(
  source,
  file,
  { managed = false, draft = false } = {},
) {
  const fail = (field) => {
    throw new Error(`${file}: invalid ${field}`);
  };
  if (Buffer.byteLength(source) > 256 * 1024)
    fail('entry size (maximum 256 KiB)');
  // Only data-only YAML is accepted; publication fields are validated below.
  if (!/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(source))
    fail('YAML front matter');
  assertNoCredentials(source, file);
  let parsed;
  try {
    parsed = readFrontMatter(source);
  } catch {
    fail('YAML front matter');
  }
  const { data, content } = parsed;
  if (!data || Object.getPrototypeOf(data) !== Object.prototype)
    fail('front matter object');
  for (const key of Object.keys(data))
    if (!fields.has(key)) fail(`unknown field ${key}`);
  if (
    managed &&
    ['status', 'visibility', 'publishedAt'].some((key) => key in data)
  )
    fail(
      'publication fields are server-managed; remove status, visibility, publishedAt',
    );
  const string = (key, required = false, max = 300) => {
    const value = data[key];
    if (value === undefined && !required) return undefined;
    if (
      draft &&
      ['title', 'summary'].includes(key) &&
      typeof value === 'string' &&
      value.length <= max
    )
      return value.trim();
    if (typeof value !== 'string' || !value.trim() || value.length > max)
      fail(key);
    return value.trim();
  };
  const choice = (key, allowed, fallback) => {
    const value = data[key] ?? fallback;
    if (!allowed.includes(value)) fail(key);
    return value;
  };
  const date = (key, required = false) => {
    const value = string(key, required);
    if (value === undefined) return undefined;
    // Quoted ISO dates: deterministic day-based chronology, no locale parsing.
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value
    )
      fail(key);
    return value;
  };
  const list = (key, ids = false) => {
    const value = data[key] ?? [];
    if (
      !Array.isArray(value) ||
      value.length > 30 ||
      value.some(
        (v) =>
          typeof v !== 'string' ||
          !v.trim() ||
          v.length > 80 ||
          (ids && !identifier.test(v)),
      )
    )
      fail(key);
    if (new Set(value.map((v) => v.trim())).size !== value.length)
      fail(`${key} duplicates`);
    return value.map((v) => v.trim());
  };
  const id = string('id', true, 100);
  if (!identifier.test(id)) fail('id');
  const createdAt = date('createdAt', true);
  const updatedAt = date('updatedAt') ?? createdAt;
  const status = choice('status', ['draft', 'published', 'archived'], 'draft');
  const visibility = choice('visibility', ['private', 'public'], 'private');
  const publishedAt = date('publishedAt', status === 'published');
  if (
    updatedAt < createdAt ||
    (publishedAt && (publishedAt < createdAt || publishedAt > updatedAt))
  )
    fail('date order');
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
  }).format(new Date());
  if (status === 'published' && publishedAt > today)
    fail('future publishedAt (scheduled publishing is unsupported)');
  const entry = {
    id,
    title: string('title', true, 160),
    createdAt,
    updatedAt,
    kind: choice('kind', Object.keys(KINDS)),
    status,
    visibility,
    language: choice('language', ['ja', 'en'], 'ja'),
    tags: list('tags'),
    projects: list('projects', true),
    relatedEntries: list('relatedEntries', true),
    summary: string('summary', status === 'published', 400),
    hypothesis: string('hypothesis', false, 2000),
    result: string('result', false, 2000),
    confidence:
      data.confidence === undefined
        ? undefined
        : choice('confidence', ['low', 'medium', 'high']),
    sourceType: choice(
      'sourceType',
      ['manual', 'conversation-derived', 'evaluation'],
      'manual',
    ),
    authorship: choice('authorship', ['unknown', 'human', 'ai'], 'unknown'),
    publishedAt,
    content: content.trim(),
  };
  if (!draft && !entry.content) fail('body');
  if (entry.relatedEntries.includes(id)) fail('self relation');
  return entry;
}

export function publishedProjection(entries) {
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.id)) throw new Error('Journal: duplicate id');
    ids.add(entry.id);
  }
  for (const entry of entries)
    for (const id of entry.relatedEntries) {
      if (!ids.has(id))
        throw new Error(`Journal ${entry.id}: unknown related entry`);
    }
  const visible = entries.filter(
    (e) => e.status === 'published' && e.visibility === 'public',
  );
  const publicIds = new Set(visible.map((e) => e.id));
  return visible
    .map((e) => ({
      id: e.id,
      title: e.title,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      publishedAt: e.publishedAt,
      kind: e.kind,
      language: e.language,
      tags: e.tags,
      projects: e.projects,
      relatedEntries: e.relatedEntries.filter((id) => publicIds.has(id)),
      summary: e.summary,
      hypothesis: e.hypothesis,
      result: e.result,
      confidence: e.confidence,
      sourceType: e.sourceType,
      authorship: e.authorship,
      content: e.content,
    }))
    .sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) ||
        b.createdAt.localeCompare(a.createdAt) ||
        a.id.localeCompare(b.id),
    );
}
