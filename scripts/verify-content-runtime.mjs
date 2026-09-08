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
      await page.locator('.e-article > header > h1').textContent(),
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
  await mkdir('outputs/content', { recursive: true });
  await page.screenshot({
    path: 'outputs/content/qiita-desktop.png',
    fullPage: false,
  });
  await page.setViewportSize({ width: 390, height: 844 });
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
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${generatedQiitaArticles.length} Qiita pages, client hydration, Mermaid, mobile layout, and sanitized content.`,
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
