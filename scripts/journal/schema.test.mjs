/* oxlint-disable typescript/no-floating-promises -- node:test owns registered test execution. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  symlink,
  rm,
  access,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { KINDS, parseEntry, publishedProjection } from './schema.mjs';
import { readJournal, generateJournal } from './content.mjs';

const base = {
  id: 'sample',
  title: '検証用',
  createdAt: '2026-01-01',
  kind: 'log',
};
function source(data = {}, body = '検証用本文') {
  return `---\n${Object.entries({ ...base, ...data })
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n')}\n---\n${body}`;
}
const parse = (data = {}, body) => parseEntry(source(data, body), 'sample.md');
const publicEntry = (data = {}) =>
  parse({
    status: 'published',
    visibility: 'public',
    publishedAt: '2026-01-01',
    summary: '公開用要約',
    ...data,
  });

test('privacy defaults and all supported kinds', () => {
  for (const kind of Object.keys(KINDS)) {
    const e = parse({ kind });
    assert.equal(e.status, 'draft');
    assert.equal(e.visibility, 'private');
    assert.deepEqual(publishedProjection([e]), []);
  }
});
test('public projection contains only publishable entries and safe relations', () => {
  const a = publicEntry({
    relatedEntries: ['draft', 'hidden', 'archived', 'other'],
  });
  const entries = [
    a,
    parse({ id: 'draft' }),
    publicEntry({ id: 'hidden', visibility: 'private' }),
    parse({ id: 'archived', status: 'archived' }),
    publicEntry({ id: 'other', relatedEntries: ['sample'] }),
  ];
  const result = publishedProjection(entries);
  assert.equal(result.length, 2);
  assert.deepEqual(result.find((e) => e.id === 'sample').relatedEntries, [
    'other',
  ]);
  assert.ok(!JSON.stringify(result).includes('hidden'));
  assert.ok(!('status' in result[0]));
});
for (const [field, value] of Object.entries({
  kind: 'unknown',
  status: 'publised',
  visibility: 'unlisted',
  language: 'xx',
  confidence: 0.9,
  sourceType: 'raw',
  createdAt: '2026-02-30',
  updatedAt: '2025-01-01',
  title: '',
  id: '../private',
  tags: ['x', 'x'],
  relatedEntries: ['sample'],
  projects: ['../x'],
  sourceReference: 'private-inbox',
})) {
  test(`reject invalid ${field}`, () =>
    assert.throws(() => parse({ [field]: value })));
}
test('require publication summary/date; reject future scheduling', () => {
  assert.throws(() => parse({ status: 'published', visibility: 'public' }));
  assert.throws(() =>
    publicEntry({ publishedAt: '2999-01-01', updatedAt: '2999-01-01' }),
  );
});
test('reject executable front matter and malformed YAML without executing or logging values', () => {
  assert.throws(() =>
    parseEntry(
      '---javascript\n(globalThis.journalExecuted = true)\n---\nbody',
      'bad.md',
    ),
  );
  assert.equal(globalThis.journalExecuted, undefined);
  assert.throws(
    () => parseEntry('---\ntitle: [\n---\nbody', 'bad.md'),
    /invalid YAML/,
  );
  assert.throws(() =>
    parseEntry('---\ncreatedAt: 2026-01-01\n---\nbody', 'bad.md'),
  );
});
test('credential detector covers public and draft content without echoing credentials', () => {
  const secret = 'ghp_' + 'x'.repeat(36);
  for (const status of ['draft', 'published']) {
    assert.throws(
      () => parse({ status }, secret),
      (e) => !e.message.includes(secret),
    );
  }
  assert.throws(() =>
    parse({}, 'https://example.com/?access_token=private-value'),
  );
});
test('duplicate ids and missing related entries fail closed', () => {
  assert.throws(() => publishedProjection([publicEntry(), publicEntry()]));
  assert.throws(() =>
    publishedProjection([publicEntry({ relatedEntries: ['missing'] })]),
  );
});
test('date sorting is deterministic, relations survive chronology changes', () => {
  const a = publicEntry();
  const b = publicEntry({
    id: 'newer',
    createdAt: '2026-01-02',
    publishedAt: '2026-01-02',
    relatedEntries: ['sample'],
  });
  assert.deepEqual(
    publishedProjection([a, b]).map((e) => e.id),
    ['newer', 'sample'],
  );
});
test('directory recognizes Markdown additions and rejects symlink escapes', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'journal-test-'));
  try {
    await writeFile(join(dir, 'sample.md'), source());
    assert.equal((await readJournal(dir)).entries.length, 1);
    await symlink(join(dir, 'sample.md'), join(dir, 'link.md'));
    await assert.rejects(readJournal(dir), /regular Markdown/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('generation retracts published entries and fails closed without stale output', async () => {
  const root = await mkdtemp(join(tmpdir(), 'journal-generation-'));
  const dir = join(root, 'content');
  const output = join(root, 'generated/journal-entries.ts');
  try {
    await mkdir(dir);
    await writeFile(
      join(root, 'private-conversation.txt'),
      'RAW_CONVERSATION_TEST_ONLY',
    );
    const path = join(dir, 'sample.md');
    await writeFile(
      path,
      source(
        {
          status: 'published',
          visibility: 'public',
          publishedAt: '2026-01-01',
          summary: 'public summary',
        },
        'PUBLIC_BODY_MARKER',
      ),
    );
    assert.equal(await generateJournal(dir, output), 1);
    assert.ok(
      !(await readFile(output, 'utf8')).includes('RAW_CONVERSATION_TEST_ONLY'),
    );
    await writeFile(path, source({}, 'PRIVATE_BODY_MARKER'));
    assert.equal(await generateJournal(dir, output), 0);
    assert.ok(
      !(await readFile(output, 'utf8')).includes('PRIVATE_BODY_MARKER'),
    );
    await writeFile(path, source({ kind: 'typo' }));
    await assert.rejects(generateJournal(dir, output));
    await assert.rejects(access(output));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
