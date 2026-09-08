// Exercise tag edits and sorting in the built Worker using isolated local data.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';
import { ingest, adminEntry, change } from '../journal/store.mjs';
const { mf, db, adminHeaders } = await createLocalJournalRuntime();
let browser;
try {
  for (const [id, date] of [
    ['older', '2026-08-01'],
    ['newer', '2026-09-01'],
  ]) {
    const saved = await ingest(
      db,
      `---\nid: ${id}\ntitle: ${id}\ncreatedAt: '2026-08-01'\nkind: log\nsummary: Test sorting and tags\ntags: [original]\n---\nFixed manuscript\n`,
    );
    const row = await adminEntry(db, id);
    await change(db, id, {
      action: 'apply',
      visibility: 'public',
      version: row.version,
      revision: saved.revision,
    });
    await db
      .prepare('UPDATE journal_entries SET published_at=? WHERE id=?')
      .bind(date, id)
      .run();
  }
  const base = (await mf.ready).origin;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    extraHTTPHeaders: await adminHeaders(),
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/journal');
  assert.deepEqual(await page.locator('.journal-list h2').allTextContents(), [
    'newer',
    'older',
  ]);
  await page.evaluate(() => {
    window.journalDocumentMarker = 'retained';
    window.journalHeading = document.querySelector('.e-page-heading');
  });
  await page.getByRole('link', { name: '古い順', exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('.journal-list h2')?.textContent === 'older',
  );
  assert.deepEqual(await page.locator('.journal-list h2').allTextContents(), [
    'older',
    'newer',
  ]);
  assert.equal(
    await page
      .getByRole('link', { name: '古い順', exact: true })
      .getAttribute('aria-current'),
    'page',
  );
  await page.getByRole('link', { name: '新しい順', exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('.journal-list h2')?.textContent === 'newer',
  );
  assert.deepEqual(await page.locator('.journal-list h2').allTextContents(), [
    'newer',
    'older',
  ]);
  assert.equal(
    await page.evaluate(() => window.journalDocumentMarker),
    'retained',
  );
  assert.equal(
    await page.evaluate(
      () => window.journalHeading === document.querySelector('.e-page-heading'),
    ),
    true,
  );
  await page.goBack();
  await page.waitForFunction(
    () => document.querySelector('.journal-list h2')?.textContent === 'older',
  );
  assert.equal(new URL(page.url()).searchParams.get('sort'), 'asc');
  await page.goForward();
  await page.waitForFunction(
    () => document.querySelector('.journal-list h2')?.textContent === 'newer',
  );
  assert.equal(
    await page.evaluate(() => window.journalDocumentMarker),
    'retained',
  );
  await page.route('**/api/journal/v1/entries*', (route) =>
    route.fulfill({ status: 503, body: '{}' }),
  );
  await page.getByRole('link', { name: '古い順', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(new URL(page.url()).searchParams.get('sort'), 'desc');
  assert.equal(
    await page.locator('.journal-list h2').first().textContent(),
    'newer',
  );
  await page.unroute('**/api/journal/v1/entries*');
  await page.goto(base + '/journal/admin/newer');
  await page.getByLabel('記事のタグ', { exact: true }).fill('AI, 設計, AI');
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'タグを保存', exact: true }).click(),
  ]);
  await page.waitForFunction(
    () => document.querySelector('#journal-tags')?.value === 'AI, 設計',
  );
  assert.deepEqual(await page.locator('.e-tags span').allTextContents(), [
    'AI',
    '設計',
  ]);
  const saved = await adminEntry(db, 'newer');
  assert.equal(saved.visibility, 'public');
  assert.equal(saved.published_at, '2026-09-01');
  assert.deepEqual(JSON.parse(saved.document).tags, ['original']);
  await mkdir('outputs/journal', { recursive: true });
  await page.screenshot({
    path: 'outputs/journal/tags-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 900 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: 'outputs/journal/tags-mobile.png',
    fullPage: true,
  });
  await page.goto(base + '/journal/newer');
  assert.deepEqual(await page.locator('.e-tags span').allTextContents(), [
    'AI',
    '設計',
  ]);
  await page.goto(base + '/journal');
  assert.deepEqual(
    await page
      .locator('.journal-list li')
      .first()
      .locator('.e-tags span')
      .allTextContents(),
    ['AI', '設計'],
  );
  await page.setViewportSize({ width: 320, height: 900 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: 'outputs/journal/sort-mobile.png',
    fullPage: true,
  });
  await page.goto(base + '/journal/admin/newer');
  await page.getByLabel('記事のタグ', { exact: true }).fill('');
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'タグを保存', exact: true }).click(),
  ]);
  assert.equal(await page.locator('.e-tags span').count(), 0);
  await page.getByLabel('記事のタグ', { exact: true }).fill('a'.repeat(80));
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'タグを保存', exact: true }).click(),
  ]);
  await page.goto(base + '/journal/newer');
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.goto(base + '/journal');
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  for (let i = 0; i < 51; i++) {
    const id = `page-${String(i).padStart(2, '0')}`;
    const saved = await ingest(
      db,
      `---\nid: ${id}\ntitle: ${id}\ncreatedAt: '2026-07-01'\nkind: log\nsummary: Pagination test\n---\nTest\n`,
    );
    const row = await adminEntry(db, id);
    await change(db, id, {
      action: 'apply',
      visibility: 'public',
      version: row.version,
      revision: saved.revision,
    });
    await db
      .prepare('UPDATE journal_entries SET published_at=? WHERE id=?')
      .bind('2026-07-01', id)
      .run();
  }
  await page.goto(base + '/journal?sort=desc');
  await page.evaluate(() => {
    window.journalDocumentMarker = 'pagination';
  });
  await page.getByRole('link', { name: '次の記録 →', exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll('.journal-list li').length === 3,
  );
  assert.ok(new URL(page.url()).searchParams.get('before'));
  assert.equal(
    await page.evaluate(() => window.journalDocumentMarker),
    'pagination',
  );
  await page.getByRole('link', { name: '古い順', exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector('.journal-list h2')?.textContent === 'page-00',
  );
  assert.equal(new URL(page.url()).searchParams.has('before'), false);
  assert.equal(
    await page.evaluate(() => window.journalDocumentMarker),
    'pagination',
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS: ascending/descending UI, tag save/delete, unchanged manuscript/publication and mobile layouts.',
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
