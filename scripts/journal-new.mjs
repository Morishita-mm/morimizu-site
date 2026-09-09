#!/usr/bin/env node
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import {
  newArticleId,
  today,
  serializeManuscript,
  prepareManuscript,
} from '../journal/manuscript.mjs';
import { readFrontMatter } from '../lib/content/frontmatter.mjs';

try {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log(
      'npm run journal:new -- [--title "タイトル"] [--dir /path/to/articles] [--template /path/to/template.md]',
    );
  } else {
    const options = {};
    while (args.length) {
      const key = args.shift();
      if (
        !['--title', '--dir', '--template'].includes(key) ||
        !args.length ||
        args[0].startsWith('--')
      )
        throw new Error('Unknown or missing option; use --help');
      options[key.slice(2)] = args.shift();
    }
    const id = newArticleId();
    const template = await readFile(
      options.template
        ? resolve(options.template)
        : new URL('../templates/journal.md', import.meta.url),
      'utf8',
    );
    const { data, content } = readFrontMatter(template);
    const date = today();
    const source = serializeManuscript(
      {
        ...data,
        id,
        title: options.title ?? data.title,
        createdAt: date,
        updatedAt: date,
      },
      content,
    );
    prepareManuscript(source);
    const directory = resolve(
      options.dir ?? process.env.JOURNAL_DIRECTORY ?? '.journal-private',
    );
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const file = join(directory, `${id}.md`);
    await writeFile(file, source, { flag: 'wx', mode: 0o600 });
    console.log(
      `Created: ${file}\nID: ${id}\nEdit this Markdown, then import it in Journal. Existing files are never overwritten.`,
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
