import { createHash } from 'node:crypto';
import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import subsetFont from 'subset-font';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'lib/generated/fonts');
const sourcePath = join(root, 'assets/fonts/noto-sans-jp-full.woff2');
const files = new Map();
async function collect(dir) {
  for (const entry of await readdir(join(root, dir), { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (path !== 'lib/generated/fonts') await collect(path);
    } else if (/\.(ts|tsx|json|md|css)$/.test(entry.name)) {
      files.set(path, await readFile(join(root, path), 'utf8'));
    }
  }
}

// Reading syntax (not evaluating modules) also catches escaped Unicode text.
function strings(source) {
  let result = source;
  const tree = ts.createSourceFile(
    'source.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function visit(node) {
    if (ts.isStringLiteralLike(node) || ts.isJsxText(node)) result += node.text;
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return result;
}
function selectedProperties(path, declaration, keys) {
  const tree = ts.createSourceFile(
    path,
    files.get(path),
    ts.ScriptTarget.Latest,
    true,
  );
  let text = '';
  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.name.getText(tree) === declaration &&
      node.initializer
    ) {
      const objects = ts.isArrayLiteralExpression(node.initializer)
        ? node.initializer.elements
        : [node.initializer];
      for (const object of objects)
        if (ts.isObjectLiteralExpression(object)) {
          for (const property of object.properties) {
            if (
              ts.isPropertyAssignment(property) &&
              keys.includes(property.name.getText(tree))
            ) {
              text += strings(property.initializer.getText(tree));
            }
          }
        }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return text;
}

for (const dir of ['app', 'components', 'lib', 'dev-pages']) await collect(dir);
const source = await readFile(sourcePath);
const fingerprint = createHash('sha256')
  .update(source)
  .update(await readFile(fileURLToPath(import.meta.url)));
for (const [path, text] of [...files].sort(([a], [b]) =>
  a < b ? -1 : a > b ? 1 : 0,
))
  fingerprint.update(path).update(text);
const hash = fingerprint.digest('hex');
try {
  const previous = JSON.parse(
    await readFile(join(output, 'manifest.json'), 'utf8'),
  );
  if (previous.hash === hash) {
    await Promise.all(
      ['noto.css', ...previous.subsets.map((s) => s.file)].map((file) =>
        access(join(output, file)),
      ),
    );
    console.log('Japanese font subsets are current.');
    process.exit(0);
  }
} catch {
  /* First build, changed content, or incomplete generated output. */
}

const generated = files.get('lib/generated/qiita-articles.ts');
const articles = JSON.parse(
  generated.slice(generated.indexOf('['), generated.lastIndexOf(']') + 1),
);
let home = [
  'dev-pages/workshop/site/home.tsx',
  'dev-pages/workshop/site/shell.tsx',
  'dev-pages/workshop/site/components.tsx',
  'dev-pages/workshop/locale.tsx',
  'dev-pages/workshop/qiita-likes.tsx',
]
  .map((path) => strings(files.get(path)))
  .join('');
home += selectedProperties('lib/projects.ts', 'projects', [
  'name',
  'shortName',
  'category',
  'status',
  'tagline',
]);
home += selectedProperties('lib/projects-en.ts', 'projectsEn', [
  'name',
  'shortName',
  'category',
  'status',
  'tagline',
]);
home += selectedProperties('lib/resume.ts', 'RESUME_JA', [
  'name',
  'role',
  'summary',
]);
home += selectedProperties('lib/resume.ts', 'RESUME_EN', [
  'name',
  'role',
  'summary',
]);
home += articles
  .slice(0, 3)
  .map(({ title, tags }) => title + tags.join(''))
  .join('');
// Keep the whole ASCII set together for résumé text and future dates/counts.
home += String.fromCodePoint(...Array.from({ length: 95 }, (_, i) => i + 32));
const other = [...files]
  .filter(([path]) => path !== 'lib/generated/qiita-articles.ts')
  .map(([, text]) => strings(text))
  .join('');
// Markdown footnote backlinks and nonbreaking spaces are generated at render time.
const all = strings(generated) + '\u21a9\u00a0\ufe0e\ufe0f';
const used = new Set();
const subsets = [];
await mkdir(output, { recursive: true });
// The complete original font is retained as a lazy safety net for any character
// not in the build-time corpus. Later, disjoint subset faces take precedence.
const face = (url, range = '') =>
  `@font-face{font-family:'Noto Sans JP';font-style:normal;font-weight:100 900;font-display:swap;src:url('${url}') format('woff2');${range ? `unicode-range:${range};` : ''}}`;
let css = '';
for (const [name, text] of [
  ['home', home],
  ['site', other],
  ['articles', all],
]) {
  // Unicode ranges require individual code points, including emoji components.
  const points = [...new Set(Array.from(text, (c) => c.codePointAt(0)))]
    .filter((p) => p >= 32 && !used.has(p))
    .sort((a, b) => a - b);
  if (!points.length) continue;
  for (const p of points) used.add(p);
  const bytes = await subsetFont(source, String.fromCodePoint(...points), {
    targetFormat: 'woff2',
  });
  const file = `noto-${name}.woff2`;
  await writeFile(join(output, file), bytes);
  css += face('./' + file, points.map((p) => 'U+' + p.toString(16)).join(','));
  subsets.push({ file, characters: points.length, bytes: bytes.length });
}
// Exclude known characters even when Noto does not contain their glyph (emoji,
// for example). Those should use the system fallback without downloading Noto.
const remaining = [];
let start = 0;
for (const point of [...used].sort((a, b) => a - b)) {
  if (start < point)
    remaining.push(`U+${start.toString(16)}-${(point - 1).toString(16)}`);
  start = point + 1;
}
if (start <= 0x10ffff) remaining.push(`U+${start.toString(16)}-10ffff`);
css =
  face('../../../assets/fonts/noto-sans-jp-full.woff2', remaining.join(',')) +
  css;
// Preserve the exact existing fallback metrics and family stack.
css +=
  "@font-face{font-family:'Noto Sans JP Fallback';src:local('Arial');ascent-override:110.73%;descent-override:27.49%;line-gap-override:0%;size-adjust:104.76%;}body{--font-noto-jp:'Noto Sans JP','Noto Sans JP Fallback';}";
await writeFile(join(output, 'noto.css'), css);
await writeFile(
  join(output, 'manifest.json'),
  JSON.stringify({ hash, subsets }, null, 2),
);
console.log('Prepared Japanese fonts:', subsets);
