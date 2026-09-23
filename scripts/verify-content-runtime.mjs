// Browser regression over real Qiita articles and isolated local Journal fixtures.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { generatedQiitaArticles } from '../lib/generated/qiita-articles.ts';
import { adminEntry, change, ingest } from '../journal/store.mjs';
import { serializeManuscript } from '../journal/manuscript.mjs';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';

const codeFixtures = [
  {
    language: 'ts',
    fileName:
      'packages/markdown-renderer/src/features/code-blocks/fixtures/deeply-nested-reproducible-long-filename-without-a-natural-short-label.test.ts',
    code: 'const asset = "fixture-ascii";\n  console.log(asset);\n\n// preserve trailing spaces  ',
  },
  {
    language: 'js',
    fileName:
      '記事表示の検証用ディレクトリ/モバイル画面でもコード本文とコピーボタンが重ならず最後まで読める長い日本語ファイル名の回帰確認サンプル.js',
    code: 'const message = "長いファイル名の確認";\nconsole.log(message);',
  },
  {
    language: '',
    fileName: '',
    code: "printf 'unnamed fence\\n'\n  printf 'spacing\\tkept\\n'",
  },
];
const fixtureId = 'code-filename-layout-regression';
const fixtureMarkdown = [
  '## コードファイル名の表示',
  ...codeFixtures.map(
    ({ language, fileName, code }) =>
      `\`\`\`${language}${fileName ? `:${fileName}` : ''}\n${code}\n\`\`\``,
  ),
].join('\n\n');

async function verifyCodeLayout(page, scope, label) {
  const blocks = scope.locator('.markdown-code-block');
  assert.equal(await blocks.count(), codeFixtures.length, label);
  async function checkGeometry(block, description) {
    const geometry = await block.evaluate((node) => {
      const rect = (selector) => {
        const element = node.querySelector(selector);
        if (!element) return null;
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      };
      const name = node.querySelector('.markdown-code-name');
      return {
        name: rect('.markdown-code-name'),
        button: rect('.article-copy-code'),
        pre: rect('pre'),
        viewportWidth: innerWidth,
        nameOverflow:
          name &&
          (name.scrollWidth > name.clientWidth + 1 ||
            name.scrollHeight > name.clientHeight + 1),
      };
    });
    const { name, button, pre } = geometry;
    assert.ok(button && pre, `${description}: code and copy control exist`);
    for (const rect of [name, button, pre].filter(Boolean)) {
      assert.ok(
        rect.x >= -1 && rect.x + rect.width <= geometry.viewportWidth + 1,
        `${description}: code block content must stay within the viewport`,
      );
    }
    assert.ok(
      button.y + button.height <= pre.y + 1,
      `${description}: copy control must stay above code`,
    );
    if (name) {
      assert.ok(
        name.y + name.height <= pre.y + 1,
        `${description}: filename must stay above code`,
      );
      assert.ok(
        name.x + name.width <= button.x + 1 ||
          button.x + button.width <= name.x + 1 ||
          name.y + name.height <= button.y + 1 ||
          button.y + button.height <= name.y + 1,
        `${description}: filename and copy control must not overlap`,
      );
      assert.equal(
        geometry.nameOverflow,
        false,
        `${description}: the complete filename must remain visible`,
      );
    }
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `${description}: article must not overflow the viewport`,
    );
  }
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const theme of ['light', 'dark']) {
      const toggle = page.locator('#sky-toggle');
      if (
        (await toggle.getAttribute('aria-checked')) !== String(theme === 'dark')
      )
        await toggle.click();
      await page.waitForFunction((expected) => {
        const root = document.documentElement;
        return (
          root.dataset.theme === expected &&
          root.style.getPropertyValue('--night-strength') ===
            (expected === 'dark' ? '1' : '0')
        );
      }, theme);
      await page.evaluate(() => document.fonts.ready);
      for (const [index, fixture] of codeFixtures.entries()) {
        const block = blocks.nth(index);
        const description = `${label}, ${width}px, ${theme}, fence ${index + 1}`;
        const name = block.locator('.markdown-code-name');
        assert.equal(await name.count(), fixture.fileName ? 1 : 0, description);
        if (fixture.fileName)
          assert.equal(await name.textContent(), fixture.fileName, description);
        assert.equal(
          await block.locator('pre code').textContent(),
          fixture.code,
          description,
        );
        await block.locator('.article-copy-code').waitFor();
        assert.equal(await block.locator('.article-copy-code').count(), 1);
        await checkGeometry(block, description);
        await page.evaluate(() => navigator.clipboard.writeText('not copied'));
        await block.locator('.article-copy-code').click();
        await page.waitForFunction(
          async (expected) =>
            (await navigator.clipboard.readText()) === expected,
          fixture.code,
        );
        // The success label is wider; it must also leave filename and code clear.
        await checkGeometry(block, `${description}, copied`);
      }
      await scope.screenshot({
        path: `outputs/content/${label}-code-filenames-${width}-${theme}.png`,
      });
    }
  }
}

const { mf, db } = await createLocalJournalRuntime();
let browser;
try {
  const saved = await ingest(
    db,
    serializeManuscript(
      {
        id: fixtureId,
        title: 'コードファイル名の表示確認',
        createdAt: '2026-09-23',
        kind: 'log',
        summary: 'ローカル専用の長いファイル名とコピー動作の検証記事です。',
        language: 'ja',
      },
      fixtureMarkdown,
    ),
  );
  const entry = await adminEntry(db, saved.id);
  await change(db, saved.id, {
    action: 'apply',
    visibility: 'public',
    version: entry.version,
    revision: saved.revision,
  });
  const base = (await mf.ready).origin;
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'ja-JP',
    reducedMotion: 'reduce',
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
  // Use HTML from the real shared MarkdownArticle renderer. The bundled Qiita
  // corpus is immutable, so mount the rendered fixture inside its actual article
  // shell and let the normal locale effect attach its copy controls.
  const noScript = await browser.newPage({ javaScriptEnabled: false });
  const fixtureResponse = await noScript.goto(`${base}/journal/${fixtureId}`);
  assert.equal(fixtureResponse.status(), 200);
  const renderedFixture = await noScript.locator('.markdown-body').innerHTML();
  await noScript.close();
  await page.locator('.article-body .markdown-body').evaluate((body, html) => {
    const section = document.createElement('section');
    section.dataset.codeLayoutFixture = '';
    section.innerHTML = html;
    body.appendChild(section);
  }, renderedFixture);
  await page.locator('.language-toggle').click();
  await page.getByRole('navigation', { name: 'Article contents' }).waitFor();
  await page.locator('.language-toggle').click();
  await page.getByRole('navigation', { name: '記事の目次' }).waitFor();
  await verifyCodeLayout(
    page,
    page.locator('[data-code-layout-fixture]'),
    'qiita',
  );
  const journalResponse = await page.goto(`${base}/journal/${fixtureId}`);
  assert.equal(journalResponse.status(), 200);
  await verifyCodeLayout(page, page.locator('.markdown-body'), 'journal');
  assert.deepEqual(errors, []);
  console.log(
    `PASS: ${generatedQiitaArticles.length} Qiita pages, client hydration, Mermaid, sanitized content, and Journal/Qiita long code filenames and exact copy at 320/390px in light/dark.`,
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
