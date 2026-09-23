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
  async function assertNotesMetadata(path) {
    assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
    assert.equal(
      await page.locator('link[rel="canonical"]').getAttribute('href'),
      `https://morimizu.dev${path}`,
    );
    assert.equal(
      await page
        .locator('link[rel="alternate"][hreflang="ja-JP"]')
        .getAttribute('href'),
      'https://morimizu.dev/notes',
    );
    assert.equal(
      await page
        .locator('link[rel="alternate"][hreflang="en-US"]')
        .getAttribute('href'),
      'https://morimizu.dev/en/notes',
    );
    assert.equal(await page.title(), 'Notes — morimizu works');
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    assert.match(description, /Journal/);
    assert.match(description, /Qiita/);
    if (path === '/en/notes') assert.match(description, /^Journal entries /);
  }
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const base = process.env.NOTES_PREVIEW_URL || 'http://127.0.0.1:3003';
  await page.goto(base + '/');
  await page.locator('header nav a[href="/notes"]').click();
  await assertNotesMetadata('/notes');
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
  await assertNotesMetadata('/en/notes');
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
  // These are synthetic native composition/keyboard events dispatched through
  // the real input and React event path, not an actual OS Japanese IME session.
  await page.locator('.tag-trigger').click();
  await tagSearch.fill('個人');
  await page.getByRole('option', { name: /^個人開発/ }).waitFor();
  assert.ok((await page.getByRole('option').count()) > 1);
  const imeBefore = {
    url: page.url(),
    active: await tagSearch.getAttribute('aria-activedescendant'),
    historyLength: await page.evaluate(() => history.length),
  };
  async function assertCompositionUnchanged() {
    assert.equal(page.url(), imeBefore.url);
    assert.equal(
      await page.locator('.tag-trigger').getAttribute('aria-expanded'),
      'true',
    );
    assert.equal(
      await tagSearch.getAttribute('aria-activedescendant'),
      imeBefore.active,
    );
    assert.equal(
      await tagSearch.evaluate((node) => node === document.activeElement),
      true,
    );
    assert.equal(
      await page.evaluate(() => history.length),
      imeBefore.historyLength,
    );
  }
  await tagSearch.evaluate((node) =>
    node.dispatchEvent(
      new CompositionEvent('compositionstart', { bubbles: true, data: '個人' }),
    ),
  );
  for (const [key, keyCode, isComposing] of [
    ['Enter', 13, true],
    ['ArrowDown', 40, true],
    ['ArrowUp', 38, true],
    ['Escape', 27, true],
    ['Home', 36, true],
    ['End', 35, true],
    // Composition state also covers an event that omits the native flag.
    ['Enter', 13, false],
    ['ArrowDown', 40, false],
  ]) {
    const prevented = await tagSearch.evaluate(
      (node, init) => {
        const event = new KeyboardEvent('keydown', {
          ...init,
          bubbles: true,
          cancelable: true,
        });
        node.dispatchEvent(event);
        return event.defaultPrevented;
      },
      { key, keyCode, isComposing },
    );
    assert.equal(
      prevented,
      false,
      `IME ${key} must remain available to the browser`,
    );
    await assertCompositionUnchanged();
  }
  await tagSearch.evaluate((node) =>
    node.dispatchEvent(
      new CompositionEvent('compositionend', { bubbles: true, data: '個人' }),
    ),
  );
  const commitKey = await tagSearch.evaluate((node) => {
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      // oxlint-disable-next-line typescript/no-deprecated -- Reproduce the legacy IME sentinel, not an ordinary Enter event.
      keyCode: 229,
      isComposing: false,
      bubbles: true,
      cancelable: true,
    });
    node.dispatchEvent(event);
    return {
      // oxlint-disable-next-line typescript/no-deprecated -- Assert that the browser retained the synthetic legacy sentinel.
      keyCode: event.keyCode,
      isComposing: event.isComposing,
      prevented: event.defaultPrevented,
    };
  });
  assert.deepEqual(commitKey, {
    keyCode: 229,
    isComposing: false,
    prevented: false,
  });
  await assertCompositionUnchanged();
  await tagSearch.press('Enter');
  assert.equal(new URL(page.url()).searchParams.get('tag'), '個人開発');
  assert.equal(
    await page.evaluate(() => history.length),
    imeBefore.historyLength + 1,
  );
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
  await page.goBack();
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has('tag'),
  );
  assert.equal(await page.locator('.notes-list > .note-row').count(), allRows);
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
    'PASS: Notes/Qiita/Journal navigation, metadata, search/sort/history, English/mobile, and synthetic composition/229 keyboard guards (OS IME not exercised).',
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
