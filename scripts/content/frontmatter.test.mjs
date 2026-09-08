/* oxlint-disable typescript/no-floating-promises -- node:test owns registered tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFrontMatter } from '../../lib/content/frontmatter.mjs';

test('metadata supports YAML arrays, block scalars, booleans and literal dates', () => {
  const source =
    '---\ntitle: "原稿"\ntags:\n  - Rust\n  - Markdown\nsummary: |\n  一行目\n  二行目\nprivate: false\nignorePublish: false\ncreatedAt: 2026-09-09\n---\n\n## 本文\n';
  const { data, content, hasFrontmatter } = readFrontMatter(source);
  assert.equal(hasFrontmatter, true);
  assert.deepEqual(data.tags, ['Rust', 'Markdown']);
  assert.equal(data.private, false);
  assert.equal(data.ignorePublish, false);
  assert.equal(data.createdAt, '2026-09-09');
  assert.equal(data.summary, '一行目\n二行目\n');
  assert.equal(content, '\n## 本文\n');
});

test('CRLF and Markdown without metadata preserve the body byte-for-byte', () => {
  assert.equal(
    readFrontMatter('---\r\ntitle: x\r\n---\r\nbody\r\n').content,
    'body\r\n',
  );
  assert.deepEqual(readFrontMatter('# body\n---\ntext'), {
    data: {},
    content: '# body\n---\ntext',
    hasFrontmatter: false,
  });
});

test('malformed, duplicate, non-object or executable YAML fails without echoing content', () => {
  for (const yaml of [
    'title: [',
    'private: true\nprivate: false',
    '- list',
    'title: !!js/function function(){return 1}',
    'title: PRIVATE_CANARY\nmissing',
  ]) {
    assert.throws(
      () => readFrontMatter(`---\n${yaml}\n---\nbody`),
      (error) => {
        assert.doesNotMatch(error.message, /PRIVATE_CANARY/);
        return /Invalid/.test(error.message);
      },
    );
  }
  assert.throws(() => readFrontMatter('---\ntitle: unclosed'), /Invalid YAML/);
});
