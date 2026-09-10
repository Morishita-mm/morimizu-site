import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseEntry } from './schema.mjs';
const exec = promisify(execFile);
await test('CLI creates unique private Markdown from the template without replacing files', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'journal-new-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const script = new URL('../journal-new.mjs', import.meta.url).pathname;
  for (let i = 0; i < 2; i++)
    await exec(process.execPath, [
      script,
      '--dir',
      dir,
      '--title',
      '日本語タイトル',
    ]);
  const files = await readdir(dir);
  assert.equal(files.length, 2);
  assert.notEqual(files[0], files[1]);
  for (const file of files) {
    const path = join(dir, file);
    const e = parseEntry(await readFile(path, 'utf8'), file, { managed: true });
    assert.equal(file, `${e.id}.md`);
    assert.equal(e.title, '日本語タイトル');
    assert.equal(e.authorship, 'unknown');
    assert.equal((await stat(path)).mode & 0o777, 0o600);
  }
  await assert.rejects(exec(process.execPath, [script, '--bad']));
  await exec(process.execPath, [script, '--dir', dir, '--authorship', 'ai']);
  const created = (await readdir(dir)).find((file) => !files.includes(file));
  assert.equal(
    parseEntry(await readFile(join(dir, created), 'utf8'), created).authorship,
    'ai',
  );
  await assert.rejects(
    exec(process.execPath, [script, '--dir', dir, '--authorship', 'guessed']),
  );
  assert.equal((await readdir(dir)).length, 3);
});
