import { readFile } from 'node:fs/promises';
const config = JSON.parse(await readFile('dist/server/wrangler.json', 'utf8'));
const id = config.d1_databases?.find(
  (d) => d.binding === 'JOURNAL_DB',
)?.database_id;
if (!id || id === '11111111-1111-4111-8111-111111111111') {
  console.error(
    'Deployment blocked: JOURNAL_DATABASE_ID is local-only. Complete the approved initial setup documented in docs/journal-operations.md.',
  );
  process.exitCode = 1;
}
