import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
// No manuscript directory is read. Journal data must never be prerendered.
const manifest = JSON.parse(
  await readFile('dist/server/vinext-prerender.json', 'utf8'),
);
assert.ok(
  !manifest.routes.some(
    (r) =>
      r.status === 'rendered' && /^\/journal(?:\/|$)/.test(r.path ?? r.route),
  ),
  'Journal must use runtime authorization, never static artifacts',
);
async function inspect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else {
      assert.ok(
        !/\/journal\/.*\.(html|rsc)$/.test(path),
        'Static Journal artifact',
      );
      const data = await readFile(path);
      for (const canary of [
        'JOURNAL_RAW_INBOX_CANARY_490d1',
        'JOURNAL_PRIVATE_E2E_CANARY_785a',
        'generatedJournalEntries',
      ])
        assert.ok(
          !data.includes(Buffer.from(canary)),
          'Journal content detected in build',
        );
    }
  }
}
await inspect('dist');
console.log(
  'PASS: Journal has no prerendered content or generated article bundle.',
);
