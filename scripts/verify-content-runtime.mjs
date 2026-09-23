// Read-only browser regression over real Qiita articles in the built local Worker.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { generatedQiitaArticles } from '../lib/generated/qiita-articles.ts';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';

const { mf } = await createLocalJournalRuntime();
let browser;
try {
  const base = (await mf.ready).origin;
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  // Third-party article images are not needed to validate Markdown rendering.
  await context.route('**/*', (route) =>
    new URL(route.request().url()).origin === base
      ? route.continue()
      : route.abort(),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const sample = generatedQiitaArticles.find((article) =>
    article.content.includes('```mermaid'),
  );
  assert.ok(sample, 'The corpus should include a Mermaid example');
  for (const article of generatedQiitaArticles) {
    const response = await page.goto(`${base}/notes/${article.id}`);
    assert.equal(response.status(), 200, article.id);
    assert.equal(
      await page.locator('.roof-article > header > h1').textContent(),
      article.title,
      article.id,
    );
    await page.locator('.markdown-body').waitFor();
    assert.ok(
      (await page.locator('.markdown-body').innerText()).length > 100,
      article.id,
    );
    assert.equal(
      await page
        .locator('.markdown-body script, .markdown-body iframe')
        .count(),
      0,
    );
    assert.equal(await page.locator('.markdown-body [data-ox-tex]').count(), 0);
  }
  await page.goto(`${base}/notes/${sample.id}`);
  await page
    .locator('.mermaid-diagram svg')
    .first()
    .waitFor({ timeout: 20000 });
  const headings = page.locator(
    '.article-body .markdown-body h2, .article-body .markdown-body h3, .article-body .markdown-body h4',
  );
  await page.locator('.toc-list a').first().waitFor();
  assert.equal(
    await page.locator('.toc-list a').count(),
    await headings.count(),
  );
  assert.equal(await page.locator('.toc').evaluate((node) => node.open), true);
  const tocTarget = await page
    .locator('.toc-list a')
    .first()
    .getAttribute('href');
  assert.ok(
    await page
      .locator('.article-body [id]')
      .evaluateAll(
        (nodes, id) =>
          nodes.some((node) => '#' + encodeURIComponent(node.id) === id),
        tocTarget,
      ),
  );
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: base,
  });
  const codeBlock = page.locator('.markdown-code-block').first();
  const code = await codeBlock.locator('pre code').textContent();
  await codeBlock.getByRole('button', { name: 'コードをコピー' }).click();
  await page.waitForFunction(
    async (expected) => (await navigator.clipboard.readText()) === expected,
    code,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await mkdir('outputs/content', { recursive: true });
  await page.screenshot({
    path: 'outputs/content/qiita-desktop.png',
    fullPage: false,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !document.querySelector('.toc')?.open);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    'Mobile article must not overflow the viewport',
  );
  await page.screenshot({
    path: 'outputs/content/qiita-mobile.png',
    fullPage: false,
  });
  // Raw HTML headings can share a sanitized ID. Locale rerender must keep
  // existing anchors and code controls intact while giving each TOC entry a target.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => document.querySelector('.toc')?.open);
  const originalIds = await headings.evaluateAll((nodes) =>
    nodes.map((node) => node.id),
  );
  await page.evaluate(() => {
    const article = document.querySelector('.article-body .markdown-body');
    for (const text of ['Duplicate first', 'Duplicate second']) {
      const heading = document.createElement('h2');
      heading.id = 'user-content-raw % # heading';
      heading.textContent = text;
      article.appendChild(heading);
    }
  });
  await page.locator('.language-toggle').click();
  await page.getByRole('navigation', { name: 'Article contents' }).waitFor();
  await page
    .locator('.toc-list a')
    .filter({ hasText: 'Duplicate second' })
    .waitFor();
  const duplicateIds = await page
    .locator('.article-body h2')
    .filter({ hasText: /^Duplicate / })
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  assert.equal(new Set(duplicateIds).size, 2);
  assert.equal(duplicateIds[0], 'user-content-raw % # heading');
  const duplicateTargets = await page
    .locator('.toc-list a')
    .filter({ hasText: /^Duplicate / })
    .evaluateAll((nodes) =>
      nodes.map((node) =>
        decodeURIComponent(node.getAttribute('href').slice(1)),
      ),
    );
  assert.deepEqual(duplicateTargets, duplicateIds);
  assert.deepEqual(
    (await headings.evaluateAll((nodes) => nodes.map((node) => node.id))).slice(
      0,
      originalIds.length,
    ),
    originalIds,
  );
  assert.equal(
    await page.locator('.article-copy-code').count(),
    await page.locator('.markdown-code-block').count(),
  );
  await codeBlock.getByRole('button', { name: 'Copy code' }).click();
  await page.waitForFunction(
    async (expected) => (await navigator.clipboard.readText()) === expected,
    code,
  );
  await page.locator('.language-toggle').click();
  await page.getByRole('navigation', { name: '記事の目次' }).waitFor();
  assert.equal(
    await page.locator('.article-copy-code').count(),
    await page.locator('.markdown-code-block').count(),
  );
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${generatedQiitaArticles.length} Qiita pages, client hydration, Mermaid, mobile layout, and sanitized content.`,
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
