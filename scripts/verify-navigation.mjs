import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.BASE_URL ?? 'http://localhost:3011';
for (const [path, target] of [
  ['/apps', '/projects'],
  ['/apps/lissue?lang=en', '/projects/lissue?lang=en'],
  ['/en/apps', '/en/projects'],
  ['/en/apps/ragy', '/en/projects/ragy'],
]) {
  const response = await fetch(new URL(path, origin), { redirect: 'manual' });
  assert.equal(response.status, 308, path);
  assert.equal(
    new URL(response.headers.get('location'), origin).pathname +
      new URL(response.headers.get('location'), origin).search,
    target,
  );
}
for (const path of [
  '/missing-page',
  '/notes/missing-article',
  '/projects/missing-project',
]) {
  assert.equal((await fetch(new URL(path, origin))).status, 404, path);
}
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE_PATH,
});
try {
  const context = await browser.newContext({ locale: 'ja-JP' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  for (const path of [
    '/en',
    '/en/notes',
    '/en/projects',
    '/en/projects/lissue',
    '/en/notes/ec44e9b3d6d16682089e',
    '/en/about',
  ]) {
    assert.equal((await page.goto(new URL(path, origin).href)).status(), 200);
    await page.waitForFunction(() => document.documentElement.lang === 'en');
  }
  await page.goto(new URL('/?lang=en', origin).href);
  await page.waitForFunction(
    () => document.documentElement.lang === 'en' && !location.search,
  );
  await page.locator('.e-header nav[data-desktop-nav] a[href="/projects"]').click();
  await page.waitForURL('**/projects');
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await page.locator('.e-header nav[data-desktop-nav] a[href="/notes"]').click();
  await page.waitForURL('**/notes');
  await page.goBack();
  await page.waitForURL('**/projects');
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  await page.locator('.e-language-toggle').click();
  await page.waitForFunction(() => document.documentElement.lang === 'ja');
  await page.reload();
  await page.waitForFunction(() => document.documentElement.lang === 'ja');
  assert.deepEqual(errors, []);
  console.log(
    'PASS: legacy redirects, query preservation, 404s, English routes, navigation/back, and persisted language.',
  );
} finally {
  await browser.close();
}
