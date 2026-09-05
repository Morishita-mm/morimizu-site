import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? files(full) : [full];
    }),
  );
  return groups.flat();
}

const sample = await files(path.join(root, 'work/workshop-sample'));
const html = await readFile(
  path.join(root, 'work/workshop-sample/index.html'),
  'utf8',
);
assert.match(html, /noindex, nofollow/);
const pictures = sample.filter((file) =>
  /editorial-(cover|ragy)-.*\.webp$/.test(file),
);
assert.equal(
  pictures.length,
  1,
  'Only the hero artwork remains; Ragy uses its original icon',
);
assert.ok(!sample.some((file) => /editorial-ragy-.*\.webp$/.test(file)));
assert.ok(html.includes('morimizu works'));
assert.match(html, /rel="icon"/);
assert.ok(
  !sample.some((file) => /\/(workbench|log-analyzer)-.*\.webp$/.test(file)),
  'Old sample artwork must not be bundled',
);
const sampleJs = (
  await Promise.all(
    sample
      .filter((file) => file.endsWith('.js'))
      .map((file) => readFile(file, 'utf8')),
  )
).join('\n');
for (const picture of pictures) {
  assert.ok(
    sampleJs.includes(path.basename(picture)),
    `Unreferenced image: ${picture}`,
  );
}
for (const route of ['/projects', '/notes', '/about', '/en/about']) {
  assert.ok(sampleJs.includes(route), `Missing route: ${route}`);
}
for (const text of [
  '銀行預り物件管理システム開発（ディレクテック株式会社）',
  'Architecture Diagnostic',
  'Qiitaに書いたものを、',
]) {
  assert.ok(sampleJs.includes(text), `Missing existing content: ${text}`);
}

const production = await files(path.join(root, 'dist'));
const sampleImageNames = new Set(pictures.map((file) => path.basename(file)));
assert.ok(
  !production.some(
    (file) =>
      sampleImageNames.has(path.basename(file)) ||
      file.includes('workshop-sample'),
  ),
  'Sample files must not enter production',
);
for (const file of production.filter((file) =>
  /\.(js|json|html)$/.test(file),
)) {
  const content = await readFile(file, 'utf8');
  assert.ok(
    !content.includes('LOCAL PREVIEW'),
    `Sample-only UI leaked into ${file}`,
  );
  for (const picture of pictures) {
    assert.ok(
      !content.includes(path.basename(picture)),
      `Sample asset leaked into ${file}`,
    );
  }
}
console.log(
  'PASS: hero artwork, original project icons, site identity, noindex, core routes/content, no production leakage.',
);
