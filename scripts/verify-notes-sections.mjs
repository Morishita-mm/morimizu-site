// Read-only checks against the local preview.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let debugPage;
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    locale: 'ja-JP',
  });
  debugPage = page;
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const base = process.env.NOTES_PREVIEW_URL || 'http://127.0.0.1:3003';
  await page.goto(base + '/');
  await page.locator('header nav a[href="/notes"]').click();
  assert.equal(await page.locator('header nav a[href="/journal"]').count(), 0);
  assert.equal(
    await page.locator('.e-notes-tabs a[aria-current]').textContent(),
    'Qiita記事',
  );
  assert.ok(await page.locator('.e-note-list li').count());
  const newest = await page
    .locator('.e-note-row')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  await page.evaluate(() => {
    window.qiitaMarker = 'retained';
  });
  await page
    .locator('.e-notes-list-header select[name=sort]')
    .selectOption('asc');
  const oldest = await page
    .locator('.e-note-row')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  assert.deepEqual(oldest, [...newest].reverse());
  assert.equal(await page.evaluate(() => window.qiitaMarker), 'retained');
  await page.goBack();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-list-header select[name=sort]')
        ?.value === 'desc',
  );
  await page.goForward();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-list-header select[name=sort]')
        ?.value === 'asc',
  );
  await page.reload();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-list-header select[name=sort]')
        ?.value === 'asc',
  );
  assert.deepEqual(
    await page
      .locator('.e-note-row')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))),
    oldest,
  );
  await page
    .locator('.e-notes-list-header select[name=sort]')
    .selectOption('desc');
  const qiitaHeader = await page.locator('.e-notes-list-header').boundingBox();

  await mkdir('outputs/journal', { recursive: true });
  await page.screenshot({
    path: 'outputs/journal/notes-qiita-desktop.png',
    fullPage: true,
  });
  let documentRequests = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.resourceType() === 'document')
      documentRequests++;
  });
  await page.evaluate(() => {
    window.notesDocumentMarker = 'preserved';
  });
  await page.route('**/api/journal/v1/entries*', (route) =>
    route.fulfill({ status: 503, body: '{}' }),
  );
  await page.locator('.e-notes-tabs a[href="/journal"]').click();
  await page.getByRole('alert').waitFor();
  assert.equal(new URL(page.url()).pathname, '/notes');
  assert.equal(
    await page.locator('.e-notes-tabs a[aria-current]').textContent(),
    'Qiita記事',
  );
  await page.unroute('**/api/journal/v1/entries*');
  await page.locator('.e-notes-tabs a[href="/journal"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-tabs a[aria-current]')?.textContent ===
      'Journal',
  );
  assert.equal(
    await page.evaluate(() => window.notesDocumentMarker),
    'preserved',
  );
  assert.equal(
    await page.locator('header nav a[aria-current]').getAttribute('href'),
    '/notes',
  );
  assert.equal(
    await page.locator('.e-notes-tabs a[aria-current]').textContent(),
    'Journal',
  );
  const journalHeader = await page
    .locator('.e-notes-list-header')
    .boundingBox();
  assert.equal(journalHeader.y, qiitaHeader.y);
  assert.equal(journalHeader.height, qiitaHeader.height);
  await page.evaluate(() => {
    window.notesDocumentMarker = 'preserved';
  });
  await page
    .locator('.e-notes-list-header select[name=sort]')
    .selectOption('asc');
  await page.waitForFunction(
    () => new URL(location.href).searchParams.get('sort') === 'asc',
  );
  assert.equal(
    await page.evaluate(() => window.notesDocumentMarker),
    'preserved',
  );
  await page.screenshot({
    path: 'outputs/journal/notes-journal-desktop.png',
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  }
  await page.screenshot({
    path: 'outputs/journal/notes-journal-mobile.png',
    fullPage: true,
  });
  await page.locator('.e-notes-tabs a[href="/notes"]').click();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-tabs a[aria-current]')?.textContent ===
      'Qiita記事',
  );
  assert.equal(
    await page.evaluate(() => window.notesDocumentMarker),
    'preserved',
  );
  await page.goBack();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-list-header select[name=sort]')
        ?.value === 'asc',
  );
  await page.goBack();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-list-header select[name=sort]')
        ?.value === 'desc',
  );
  await page.goForward();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-list-header select[name=sort]')
        ?.value === 'asc',
  );
  await page.goForward();
  await page.waitForFunction(
    () =>
      document.querySelector('.e-notes-tabs a[aria-current]')?.textContent ===
      'Qiita記事',
  );
  assert.equal(
    await page.evaluate(() => window.notesDocumentMarker),
    'preserved',
  );
  assert.equal(documentRequests, 0);
  assert.equal(
    await page.locator('.e-notes-tabs a[aria-current]').textContent(),
    'Qiita記事',
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.locator('.e-note-list a').first().focus();
  await page.locator('.e-note-list a').first().press('Enter');
  await page.waitForURL('**/notes/*');
  assert.equal(
    await page.locator('header nav a[aria-current]').getAttribute('href'),
    '/notes',
  );
  await page.goto(base + '/en/notes');
  await page
    .getByRole('navigation', { name: 'Notes sections', exact: true })
    .waitFor();
  assert.equal(
    await page.locator('.e-notes-tabs a[aria-current]').textContent(),
    'Qiita articles',
  );
  await page.goto(base + '/notes');
  await page.setViewportSize({ width: 1440, height: 1000 });
  const allRows = await page.locator('.notes-list > .note-row').count();
  const articleSearch = page.locator('input[name=q]');
  await articleSearch.fill('Rust');
  await articleSearch.blur();
  assert.ok((await page.locator('.notes-list > .note-row').count()) < allRows);
  assert.equal(new URL(page.url()).searchParams.get('q'), 'Rust');
  await page.locator('.tag-trigger').click();
  const tagSearch = page.getByRole('combobox', {
    name: /タグを検索|Search tags/,
  });
  await tagSearch.fill('Ｐｙ');
  await page.getByRole('option', { name: /^Python/ }).waitFor();
  assert.equal(await articleSearch.inputValue(), 'Rust');
  await tagSearch.press('Enter');
  assert.equal(new URL(page.url()).searchParams.get('tag'), 'Python');
  await page.goBack();
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has('tag'),
  );
  assert.equal(await articleSearch.inputValue(), 'Rust');
  await page.goBack();
  await page.waitForFunction(
    () => document.querySelector('input[name=q]')?.value === '',
  );
  assert.equal(await page.locator('.notes-list > .note-row').count(), allRows);
  await page.locator('.tag-trigger').click();
  await tagSearch.fill('not-a-real-tag');
  await page.locator('.tag-empty').waitFor();
  await tagSearch.press('Escape');
  assert.equal(
    await page.locator('.tag-trigger').getAttribute('aria-expanded'),
    'false',
  );
  assert.equal(
    await page
      .locator('.tag-trigger')
      .evaluate((node) => node === document.activeElement),
    true,
  );
  await articleSearch.fill('not-a-real-article');
  await page.locator('.notes-empty').waitFor();
  await page.locator('.notes-empty button').click();
  assert.equal(await page.locator('.notes-list > .note-row').count(), allRows);
  assert.equal(await articleSearch.inputValue(), '');
  assert.equal(new URL(page.url()).search, '');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS: Notes/Qiita/Journal navigation, existing article links, partial sorting, English and mobile layouts.',
  );
} catch (error) {
  console.error(
    'Failed at',
    debugPage?.url(),
    await debugPage?.locator('main').innerText(),
  );
  throw error;
} finally {
  await browser.close();
}
