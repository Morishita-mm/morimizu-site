import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import buildGlob from '../../tools/build-glob/index.cjs';

async function fixture(run) {
  const cwd = await mkdtemp(join(tmpdir(), 'morimizu-build-glob-'));
  try {
    await mkdir(join(cwd, 'modules/nested'), { recursive: true });
    for (const file of [
      'first.js',
      'second.ts',
      '.hidden.js',
      'nested/third.js',
    ])
      await writeFile(join(cwd, 'modules', file), 'export default 1;\n');
    await run(cwd);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

await test('build glob preserves file-only, brace extension and dotfile defaults', async () => {
  await fixture(async (cwd) => {
    assert.deepEqual(buildGlob.sync('modules/*.{js,ts}', { cwd }).sort(), [
      'modules/first.js',
      'modules/second.ts',
    ]);
    assert.deepEqual(buildGlob.sync('modules/*', { cwd }).sort(), [
      'modules/first.js',
      'modules/second.ts',
    ]);
  });
});

await test('build glob handles multiple patterns, exclusions, recursion and deduplication', async () => {
  await fixture(async (cwd) => {
    assert.deepEqual(
      buildGlob.sync(
        ['modules/**/*.js', 'modules/first.js', '!modules/nested/**'],
        { cwd },
      ),
      ['modules/first.js'],
    );
    assert.deepEqual(buildGlob.sync('modules/**/*.js', { cwd }).sort(), [
      'modules/first.js',
      'modules/nested/third.js',
    ]);
    assert.deepEqual(buildGlob.sync('missing/*', { cwd }), []);
  });
});

await test('build glob rejects unbounded patterns and unsupported API options', () => {
  assert.throws(
    () => buildGlob.sync('{'.repeat(33) + 'x' + '}'.repeat(33)),
    RangeError,
  );
  assert.throws(() => buildGlob.sync('x'.repeat(4097)), TypeError);
  assert.throws(() => buildGlob.sync(Array(257).fill('*')), TypeError);
  assert.throws(() => buildGlob.sync([null]), TypeError);
  assert.throws(() => buildGlob.sync('*', { dot: true }), TypeError);
  assert.throws(() => buildGlob.sync('*', { cwd: 1 }), TypeError);
});

await test('installed CJS and ESM fast-glob imports use the audited local adapter', async () => {
  const require = createRequire(import.meta.url);
  assert.equal(require('fast-glob').sync, buildGlob.sync);
  assert.equal((await import('fast-glob')).default.sync, buildGlob.sync);
});

await test('vinext dynamic-import plugin resolves extensionless imports through the adapter', async () => {
  const requireVinext = createRequire(import.meta.resolve('vinext'));
  const requireCommonjs = createRequire(
    requireVinext.resolve('vite-plugin-commonjs'),
  );
  const requireDynamic = createRequire(
    requireCommonjs.resolve('vite-plugin-dynamic-import'),
  );
  const { globFiles } = requireDynamic('vite-plugin-dynamic-import');
  const { parse } = requireDynamic('acorn');
  const source = 'import(`./modules/${name}`)';
  const node = parse(source, { ecmaVersion: 'latest', sourceType: 'module' })
    .body[0].expression.source;
  await fixture(async (cwd) => {
    const result = await globFiles({
      importeeNode: node,
      importExpression: source,
      importer: join(cwd, 'entry.js'),
      resolve: {
        async tryResolve() {
          return undefined;
        },
      },
      extensions: ['.js', '.ts'],
    });
    assert.deepEqual(result.files.sort(), [
      './modules/first.js',
      './modules/nested/third.js',
      './modules/second.ts',
    ]);
  });
});
