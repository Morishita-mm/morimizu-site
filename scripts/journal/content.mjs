import {
  lstat,
  readdir,
  readFile,
  mkdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { parseEntry, publishedProjection } from './schema.mjs';

export async function readJournal(directory) {
  if ((await lstat(directory)).isSymbolicLink())
    throw new Error('Journal directory must not be a symlink');
  const entries = [];
  for (const file of (await readdir(directory)).sort((a, b) =>
    a.localeCompare(b),
  )) {
    const stat = await lstat(join(directory, file));
    if (stat.isSymbolicLink() || !stat.isFile() || !file.endsWith('.md')) {
      throw new Error(
        'content/journal accepts only regular Markdown files, without subdirectories or symlinks',
      );
    }
    const entry = parseEntry(
      await readFile(join(directory, file), 'utf8'),
      file,
    );
    if (file !== `${entry.id}.md`)
      throw new Error(`${file}: filename must match stable id`);
    entries.push(entry);
  }
  return { entries, published: publishedProjection(entries) };
}

export async function generateJournal(directory, output) {
  // A failed validation must not leave a previously public projection reusable.
  await rm(output, { force: true });
  const { published } = await readJournal(directory);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    output,
    `// Generated public projection only. Edit content/journal/*.md.\nimport type { JournalEntry } from '../journal/types';\nexport const generatedJournalEntries: readonly JournalEntry[] = ${JSON.stringify(published, null, 2)};\n`,
  );
  return published.length;
}
