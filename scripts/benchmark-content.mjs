import { performance } from 'node:perf_hooks';
import { Fragment } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { generatedQiitaArticles } from '../lib/generated/qiita-articles.ts';
import { compileMarkdown } from '../lib/content/markdown.mjs';
import { prepareQiitaBody } from '../lib/content/qiita.mjs';

// Measures the full warm rendering pipeline, not just the Rust parser. Excludes
// WASM initialization, file I/O, network, and UI component wrappers.
const articles = generatedQiitaArticles.map((article) =>
  prepareQiitaBody(article.content),
);
const samples = [];
for (let run = 0; run < 17; run++) {
  const start = performance.now();
  for (const source of articles) {
    renderToStaticMarkup(
      toJsxRuntime(compileMarkdown(source), { Fragment, jsx, jsxs }),
    );
  }
  if (run >= 2) samples.push(performance.now() - start);
}
samples.sort((a, b) => a - b);
console.log(
  JSON.stringify(
    {
      node: process.version,
      articles: articles.length,
      bytes: articles.reduce(
        (sum, source) => sum + Buffer.byteLength(source),
        0,
      ),
      samples: samples.length,
      medianMs: samples[Math.floor(samples.length / 2)],
      minMs: samples[0],
      maxMs: samples.at(-1),
    },
    null,
    2,
  ),
);
