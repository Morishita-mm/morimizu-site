/* oxlint-disable typescript/no-floating-promises -- node:test owns registered tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { compileMarkdown } from '../../lib/content/markdown.mjs';
import { prepareQiitaBody } from '../../lib/content/qiita.mjs';

function html(source) {
  return renderToStaticMarkup(
    toJsxRuntime(compileMarkdown(source), { Fragment, jsx, jsxs }),
  );
}

test('GFM tables, strikethrough, tasks, URL/email autolinks and nested lists', () => {
  const output = html(
    '| left | right |\n| :--- | ---: |\n| ~~old~~ | new |\n\n- [x] done\n- [ ] todo\n  - nested\n\nhttps://example.com and hi@example.com',
  );
  assert.match(output, /<table>/);
  assert.match(output, /text-align:right/);
  assert.match(output, /<del>old<\/del>/);
  assert.match(
    output,
    /type="checkbox"[^>]*disabled=""[^>]*checked=""|type="checkbox"[^>]*checked=""[^>]*disabled=""/,
  );
  assert.match(output, /<ul>[\s\S]*<ul>[\s\S]*nested/);
  assert.match(output, /href="https:\/\/example.com"/);
  assert.match(output, /href="mailto:hi@example.com"/);
});

test('Japanese headings, references and footnotes retain working protected IDs', () => {
  const output = html(
    '## 日本語\n\n[見出し](#日本語) and [reference][r]. note[^n].\n\n[r]: https://example.com "title"\n\n[^n]: 注釈の本文',
  );
  assert.match(output, /id="user-content-日本語"/);
  assert.match(output, /href="#user-content-日本語"/);
  assert.match(output, /href="https:\/\/example.com" title="title"/);
  assert.match(output, /id="user-content-fn-n"/);
  assert.match(output, /href="#user-content-fn-n"/);
  assert.match(output, /href="#user-content-fnref-n"/);
});

test('code languages, filenames and Mermaid source survive exactly as text', () => {
  const source =
    '```ts:sample.ts\nconst a = "<script>";\n```\n\n```mermaid\ngraph LR\n A[原稿] --> B[確認]\n```';
  const output = html(source);
  assert.match(output, /class="language-ts:sample.ts"/);
  assert.match(output, /const a = &quot;&lt;script&gt;&quot;;/);
  assert.match(output, /class="language-mermaid"/);
  assert.match(output, /A\[原稿\] --&gt; B\[確認\]/);
  assert.doesNotMatch(output, /<script>/);
});

test('inline/block math and math fences render through bounded untrusted KaTeX', () => {
  const output = html('$x^2$\n\n$$\n\\frac{1}{2}\n$$\n\n```math\ny^2\n```');
  assert.equal((output.match(/class="katex"/g) ?? []).length, 3);
  assert.equal((output.match(/class="katex-display"/g) ?? []).length, 2);
  assert.doesNotMatch(output, /ox-math|data-ox-tex/);
  assert.doesNotMatch(
    html('$\\href{javascript:alert(1)}{click}$'),
    /href="javascript:/,
  );
  assert.doesNotMatch(html('$\\htmlClass{injected}{x}$'), /class="injected"/);
});

test('invalid math stays readable and does not abort article rendering', () => {
  const output = html('before $\\unknownCommand{x}$ after');
  assert.match(output, /before/);
  assert.match(output, /after/);
  assert.match(output, /unknownCommand/);
});

test('raw HTML keeps details, images and definition lists but cannot execute', () => {
  const output = html(
    '<details open><summary>説明</summary><p>本文</p></details>\n\n<dl><dt>用語</dt><dd>定義</dd></dl>\n\n<img src="https://example.com/a.png" width="100" onerror="alert(1)">\n\n<script>window.PWNED=true</script>\n<iframe src="https://example.com"></iframe>',
  );
  assert.match(output, /<details open=""><summary>説明/);
  assert.match(output, /<dl><dt>用語<\/dt><dd>定義/);
  assert.match(output, /width="100"/);
  assert.doesNotMatch(output, /onerror|script|iframe|PWNED/);
});

test('dangerous URLs, DOM clobbering, SVG and MDX expressions remain inert', () => {
  const output = html(
    '[bad](javascript:alert(1))\n\n<a href="jav&#x61;script:alert(1)" onclick="alert(1)">bad</a>\n\n<img src="data:text/html,evil">\n\n<svg><script>alert(1)</script><a href="javascript:alert(1)">bad</a></svg>\n\n<form id="location"><input name="cookie"></form>\n\n{globalThis.PWNED = true}',
  );
  assert.doesNotMatch(
    output,
    /href="javascript:|src="data:|onclick=|<svg|<script|<form|id="location"|name="cookie"/,
  );
  assert.match(output, /\{globalThis.PWNED = true\}/);
  assert.equal(globalThis.PWNED, undefined);
});

test('Qiita currency normalization preserves actual math and code samples', () => {
  const source =
    'Input $2.00 / output $8.00 and $O(N)$.\n\n`$2.00`\n\n```sh\necho "$2.00"\n```';
  const output = html(prepareQiitaBody(source));
  assert.match(output, /Input \$2\.00 \/ output \$8\.00/);
  assert.equal((output.match(/class="katex"/g) ?? []).length, 1);
  assert.match(output, /echo &quot;\$2\.00&quot;/);
});

test('repeated compilations do not reuse article content or math macros', () => {
  html('$\\gdef\\secret{PRIVATE_ARTICLE_CANARY}\\secret$');
  const output = html('$\\secret$\n\npublic article');
  assert.doesNotMatch(output, /PRIVATE_ARTICLE_CANARY/);
  assert.match(output, /public article/);
  for (let index = 0; index < 100; index++)
    assert.match(html(`entry ${index}`), new RegExp(`entry ${index}`));
});
