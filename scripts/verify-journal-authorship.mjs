// Built Worker + isolated local D1. Fixtures are display samples, never published remotely.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';
import { adminEntry, publicEntry, ingest, change } from '../journal/store.mjs';
import { readFrontMatter } from '../lib/content/frontmatter.mjs';
import { serializeManuscript } from '../journal/manuscript.mjs';
const { mf, db, adminHeaders } = await createLocalJournalRuntime();
const output = resolve(process.env.OUTPUT_DIR || '/tmp/journal-authorship');
await mkdir(output, { recursive: true });
let browser;
try {
  const base = (await mf.ready).origin;
  browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  });
  const page = await browser.newPage({
    extraHTTPHeaders: await adminHeaders(),
    viewport: { width: 1440, height: 1100 },
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const choice = (value) =>
    page.locator(`.ja-authorship input[value="${value}"]`);
  async function saved() {
    await page
      .locator('.ja-status')
      .filter({ hasText: /^保存済み$/ })
      .waitFor();
  }
  async function capture(name) {
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `${name} overflow`,
    );
  }
  async function publish() {
    await page.getByRole('button', { name: '公開設定へ', exact: true }).click();
    await page
      .getByRole('button', { name: /^(公開する|変更を反映する)$/ })
      .click();
    await page
      .locator('.ja-status')
      .filter({ hasText: '公開設定を反映しました' })
      .waitFor();
  }
  await page.goto(`${base}/journal/admin`);
  await page.getByRole('button', { name: '記事を書く', exact: true }).click();
  await choice('unknown').waitFor();
  assert.equal(await choice('unknown').isChecked(), true);
  const id = new URL(page.url()).pathname.split('/').at(-1);
  await page
    .getByLabel('タイトル', { exact: true })
    .fill('自分の言葉で、記録を残す（表示見本）');
  await page
    .getByLabel('要約', { exact: true })
    .fill(
      '人間が執筆を選んだときの表示サンプルです。バッジの配置を確認します。',
    );
  await page
    .getByLabel('本文', { exact: true })
    .fill(
      '## 小さな気づきを残す\n\nこの原稿はローカルでのデザイン確認用です。実際の記事の執筆区分を示すものではありません。',
    );
  await choice('human').check();
  await saved();
  assert.equal(
    readFrontMatter((await adminEntry(db, id)).source).data.authorship,
    'human',
  );
  await page.reload();
  await choice('human').waitFor();
  assert.equal(await choice('human').isChecked(), true);
  await capture('editor-desktop');
  await publish();
  assert.equal((await publicEntry(db, id)).entry.authorship, 'human');
  await page.getByRole('button', { name: '編集', exact: true }).click();
  await choice('ai').check();
  await saved();
  assert.equal(
    (await publicEntry(db, id)).entry.authorship,
    'human',
    'autosave must not change live badge',
  );
  await publish();
  assert.equal((await publicEntry(db, id)).entry.authorship, 'ai');
  // Return to the human display sample for side-by-side card captures.
  await page.getByRole('button', { name: '編集', exact: true }).click();
  await choice('human').check();
  await saved();
  await publish();
  const source = serializeManuscript(
    {
      id: 'authorship-import-example',
      title: 'AIと整理する、実験の記録（表示見本）',
      createdAt: '2026-09-10',
      kind: 'experiment',
      summary:
        'ローカルから取り込んだ原稿にも、同じ基準で執筆区分を設定できます。',
      tags: ['AI', '実験'],
      language: 'ja',
    },
    '## 取り込みの確認\n\nこの原稿はローカルの表示・操作確認用サンプルです。',
  );
  await page.goto(`${base}/journal/admin/upload`);
  await page.getByLabel('Markdownファイル', { exact: true }).setInputFiles({
    name: 'experiment.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(source),
  });
  await choice('unknown').waitFor();
  assert.equal(await choice('unknown').isChecked(), true);
  await choice('human').check();
  await page.locator('.ja-preview .journal-authorship-human img').waitFor();
  await capture('upload-human-desktop');
  await choice('ai').check();
  assert.equal(
    await page.locator('.ja-preview .journal-authorship-human').count(),
    0,
  );
  await capture('upload-desktop');
  await page.setViewportSize({ width: 390, height: 1100 });
  await capture('upload-mobile');
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page
    .getByRole('button', { name: '非公開で保存して編集へ', exact: true })
    .click();
  await choice('ai').waitFor();
  assert.equal(await choice('ai').isChecked(), true);
  const imported = await adminEntry(db, 'authorship-import-example');
  assert.equal(readFrontMatter(imported.source).data.authorship, 'ai');
  assert.equal(imported.visibility, 'private');
  await publish();
  // Existing-id upload lets the owner override file metadata; still draft-only.
  await page.goto(`${base}/journal/admin/upload`);
  await page.getByLabel('Markdownファイル', { exact: true }).setInputFiles({
    name: 'experiment.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(imported.source),
  });
  await choice('ai').waitFor();
  assert.equal(await choice('ai').isChecked(), true);
  await choice('human').check();
  await page
    .getByRole('button', { name: '下書きを更新して編集へ', exact: true })
    .click();
  await choice('human').waitFor();
  assert.equal(
    readFrontMatter((await adminEntry(db, imported.id)).source).data.authorship,
    'human',
  );
  assert.equal((await publicEntry(db, imported.id)).entry.authorship, 'ai');
  // The editor's Markdown replacement also exposes the same choice.
  await page.locator('.ja-file-button input').setInputFiles({
    name: 'experiment.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(imported.source),
  });
  const modal = page.getByRole('dialog');
  await modal.locator('input[value="ai"]').waitFor();
  await modal.locator('input[value="unknown"]').check();
  await modal
    .getByRole('button', { name: '下書きに取り込む', exact: true })
    .click();
  await saved();
  assert.equal(
    readFrontMatter((await adminEntry(db, imported.id)).source).data.authorship,
    'unknown',
  );
  assert.equal((await publicEntry(db, imported.id)).entry.authorship, 'ai');
  // Legacy records do not receive a badge without the author's choice.
  const legacy = source
    .replace('authorship-import-example', 'authorship-legacy-example')
    .replace(
      'AIと整理する、実験の記録（表示見本）',
      '過去の記録（未設定の表示見本）',
    );
  const receipt = await ingest(db, legacy);
  const legacyEntry = await adminEntry(db, receipt.id);
  await change(db, receipt.id, {
    action: 'apply',
    visibility: 'public',
    version: legacyEntry.version,
    revision: legacyEntry.draft_revision,
  });
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(`${base}/journal`);
    await page.locator('.journal-list').waitFor();
    assert.equal(
      await page.locator('.journal-list .journal-authorship-human').count(),
      1,
    );
    assert.equal(
      await page.locator('.journal-list .journal-authorship-ai').count(),
      1,
    );
    const image = page.locator('.journal-authorship-human img');
    assert.equal(
      await image.evaluate((img) => img.complete && img.naturalWidth > 0),
      true,
    );
    assert.equal((await image.boundingBox()).height, 42);
    await capture(`cards-${width}`);
    await page
      .locator('section[aria-label="Journal記事一覧"]')
      .screenshot({ path: `${output}/card-detail-${width}.png` });
    await page.evaluate(
      () => (document.documentElement.dataset.theme = 'dark'),
    );
    await capture(`cards-dark-${width}`);
    await page.goto(`${base}/journal/${id}`);
    await page.locator('.journal-authorship-human img').waitFor();
    await capture(`article-${width}`);
    await page.goto(`${base}/journal/admin/${id}`);
    await choice('human').waitFor();
    await capture(`editor-${width}`);
  }
  // Badge language follows the site toggle, even for a Japanese manuscript.
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.goto(`${base}/journal?lang=ja`);
    await page
      .getByRole('button', { name: 'EN: Switch to English', exact: true })
      .click();
    const englishBadge = page.locator(
      'img[src="/not-by-ai/written-by-human-en.svg"]',
    );
    await englishBadge.waitFor();
    await englishBadge.evaluate(async (img) => {
      if (!img.complete)
        await new Promise((resolve) =>
          img.addEventListener('load', resolve, { once: true }),
        );
    });
    assert.equal(
      await englishBadge.getAttribute('alt'),
      'Written by Human, Not By AI',
    );
    assert.equal(await englishBadge.evaluate((img) => img.naturalWidth), 131);
    assert.equal(
      await page.locator('.journal-authorship-ai').textContent(),
      'AI-generated',
    );
    await page
      .locator('section[aria-label="Journal記事一覧"]')
      .screenshot({ path: `${output}/card-detail-en-${width}.png` });
    await page.reload();
    await englishBadge.waitFor();
    await page.goto(`${base}/journal/${id}`);
    await englishBadge.waitFor();
    await page.goto(`${base}/journal/admin/${id}?view=preview`);
    await page
      .locator('.ja-preview img[src="/not-by-ai/written-by-human-en.svg"]')
      .waitFor();
    await page
      .getByRole('button', { name: 'JP: 日本語に切り替え', exact: true })
      .click();
    await page
      .locator('.ja-preview img[src="/not-by-ai/written-by-human.svg"]')
      .waitFor();
  }
  assert.deepEqual(errors, []);
  console.log(
    `PASS: create/autosave/reload, import new/existing, replacement, publication isolation, legacy, badges and responsive captures: ${output}`,
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
