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
  await page.goto('http://127.0.0.1:3003/');
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
  await page.getByRole('link', { name: '古い順', exact: true }).click();
  const oldest = await page
    .locator('.e-note-row')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
  assert.deepEqual(oldest, [...newest].reverse());
  assert.equal(await page.evaluate(() => window.qiitaMarker), 'retained');
  await page.goBack();
  await page.waitForFunction(
    () =>
      document.querySelector('.journal-sort a[aria-current]')?.textContent ===
      '新しい順',
  );
  await page.goForward();
  await page.waitForFunction(
    () =>
      document.querySelector('.journal-sort a[aria-current]')?.textContent ===
      '古い順',
  );
  await page.reload();
  await page.waitForFunction(
    () =>
      document.querySelector('.journal-sort a[aria-current]')?.textContent ===
      '古い順',
  );
  assert.deepEqual(
    await page
      .locator('.e-note-row')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))),
    oldest,
  );
  await page.getByRole('link', { name: '新しい順', exact: true }).click();
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
  await page.getByRole('link', { name: '古い順', exact: true }).click();
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
      document.querySelector('.journal-sort a[aria-current]')?.textContent ===
      '古い順',
  );
  await page.goBack();
  await page.waitForFunction(
    () =>
      document.querySelector('.journal-sort a[aria-current]')?.textContent ===
      '新しい順',
  );
  await page.goForward();
  await page.waitForFunction(
    () =>
      document.querySelector('.journal-sort a[aria-current]')?.textContent ===
      '古い順',
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
  await page.goto('http://127.0.0.1:3003/en/notes');
  await page
    .getByRole('navigation', { name: 'Notes sections', exact: true })
    .waitFor();
  assert.equal(
    await page.locator('.e-notes-tabs a[aria-current]').textContent(),
    'Qiita articles',
  );
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
