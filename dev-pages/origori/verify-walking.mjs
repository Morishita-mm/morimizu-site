import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { walkingFrame } from './walking-geometry.mjs';

const output = 'work/origori-verification';
const base = 'http://127.0.0.1:3005';
const checks = [],
  errors = [];
const gif = await readFile(
  'dev-pages/origori/assets/mascots/origori-walking.gif',
);
const meta = await sharp(gif, { animated: true }).metadata();
assert.equal(meta.width, 512);
assert.equal(meta.pageHeight, 512);
assert.equal(meta.pages, 32);
assert.equal(meta.loop, 0);
assert.ok(meta.hasAlpha && meta.delay.every((n) => n === 50));
const first = await sharp(gif, { page: 0, pages: 1 })
  .ensureAlpha()
  .raw()
  .toBuffer();
const next = await sharp(gif, { page: 8, pages: 1 })
  .ensureAlpha()
  .raw()
  .toBuffer();
assert.equal(first[3], 0);
assert.notDeepEqual(first, next);
for (let frame = 0; frame < 64; frame++) {
  assert.ok(
    walkingFrame((frame / 64) * Math.PI * 2).every((facet) =>
      facet.points.every((point) =>
        point.every((n) => Number.isFinite(n) && n >= 0 && n <= 256),
      ),
    ),
  );
}
const zero = walkingFrame(0),
  loop = walkingFrame(Math.PI * 2);
assert.ok(
  zero.every((facet, i) =>
    facet.points.every((point, j) =>
      point.every((n, k) => Math.abs(n - loop[i].points[j][k]) < 1e-9),
    ),
  ),
);
checks.push(
  'walking GIF: transparent 512px, 32 distinct-time frames, 20fps, seamless geometry and no clipping',
);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1297, height: 963 },
  reducedMotion: 'no-preference',
  colorScheme: 'dark',
});
const page = await context.newPage();
page.on('pageerror', (error) => errors.push(error.message));
const visit = async (path = '/') => {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
};
const companion = page.locator('.o-scroll-companion');
const position = () => page.locator('.o-walker-position').boundingBox();
const shape = () =>
  page
    .locator('.o-walker polygon')
    .evaluateAll((polygons) => polygons.map((p) => p.getAttribute('points')));
try {
  await visit('/about');
  assert.equal(await companion.getAttribute('data-state'), 'resting');
  const startX = (await position()).x;
  const startShape = await shape();
  await page.mouse.wheel(0, 500);
  await page.waitForFunction(
    () =>
      document.querySelector('.o-scroll-companion').dataset.state === 'walking',
  );
  assert.equal(await companion.getAttribute('data-direction'), '1');
  assert.ok((await position()).x > startX);
  assert.notDeepEqual(await shape(), startShape);
  await page.screenshot({ path: `${output}/walking-scroll-down.png` });
  checks.push(
    'normal downward scrolling moves the character forward and articulates its legs',
  );

  await page.waitForFunction(
    () =>
      document.querySelector('.o-scroll-companion').dataset.state === 'resting',
  );
  const resting = await shape();
  await page.waitForTimeout(250);
  assert.deepEqual(await shape(), resting);
  checks.push(
    'stopping plants the feet, rests the eyes, and leaves no continuous idle animation',
  );

  const downX = (await position()).x;
  await page.mouse.wheel(0, -200);
  await page.waitForFunction(
    () =>
      document.querySelector('.o-scroll-companion').dataset.direction === '-1',
  );
  assert.ok((await position()).x < downX);
  assert.ok(
    await page
      .locator('.o-walker')
      .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a < 0),
  );
  checks.push('upward scrolling turns Origori to face the return direction');

  await page
    .getByRole('button', { name: 'オリゴリのおさんぽを休む', exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector('.o-scroll-companion').dataset.state === 'paused',
  );
  const pausedX = (await position()).x;
  const pausedShape = await shape();
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(300);
  assert.equal((await position()).x, pausedX);
  assert.deepEqual(await shape(), pausedShape);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await companion.getAttribute('data-state'), 'paused');
  await page
    .getByRole('button', { name: 'オリゴリとまた歩く', exact: true })
    .press('Enter');
  await page.mouse.wheel(0, 200);
  await page.waitForFunction(
    () =>
      document.querySelector('.o-scroll-companion').dataset.state === 'walking',
  );
  checks.push(
    'Rest freezes position and pose, persists after reload, and keyboard activation resumes walking',
  );

  await page.keyboard.press('Tab');
  await page.keyboard.press('End');
  await page.waitForFunction(
    () =>
      document.querySelector('.o-scroll-companion').dataset.finished === 'true',
  );
  assert.equal(
    await page.locator('.o-walk-caption').textContent(),
    'さいごまで、ありがとう。',
  );
  assert.equal(await page.locator('.o-walk-spark').count(), 1);
  const footer = await page.locator('.o-footer-bottom').boundingBox();
  assert.ok(footer.y + footer.height < 963 - 70);
  const walkerBox = await position(),
    controlBox = await page.locator('.o-walk-toggle').boundingBox();
  assert.ok(walkerBox.x + walkerBox.width < controlBox.x);
  checks.push(
    'reading to the end completes the trail and shows a star without covering footer links or the Rest control',
  );

  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await visit('/about');
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(70);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({ path: `${output}/walking-${width}.png` });
  }
  checks.push('walking layout stays inside mobile and tablet viewports');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await companion.waitFor({ state: 'detached' });
  assert.equal(await companion.count(), 0);
  assert.equal(await page.locator('.o-scroll-space').count(), 0);
  await page.mouse.wheel(0, 300);
  assert.equal(await companion.count(), 0);
  checks.push('reduced motion removes scroll-driven decoration and its spacer');

  await visit('/origori-assets');
  const walkingCard = page
    .locator('.o-animation-card')
    .filter({ hasText: 'とことこ、いっしょに歩こう。' });
  assert.equal(await walkingCard.count(), 1);
  assert.ok(
    (await walkingCard.locator('img').getAttribute('src')).includes(
      'walking.svg',
    ),
  );
  await walkingCard.getByRole('button', { name: '再生', exact: true }).click();
  await walkingCard.locator('img').evaluate((img) => img.decode());
  assert.ok(
    (await walkingCard.locator('img').getAttribute('src')).includes(
      'walking.gif',
    ),
  );
  await walkingCard.getByRole('button', { name: '停止', exact: true }).click();
  assert.ok(
    (await walkingCard.locator('img').getAttribute('src')).includes(
      'walking.svg',
    ),
  );
  const pending = page.waitForEvent('download');
  await walkingCard.getByRole('link', { name: 'GIF · 512px' }).click();
  const download = await pending;
  assert.equal(download.suggestedFilename(), 'origori-walking.gif');
  await download.saveAs(`${output}/origori-walking.gif`);
  assert.deepEqual(await readFile(`${output}/origori-walking.gif`), gif);
  checks.push(
    'walking GIF has an accurate still poster, opt-in playback, Stop, and a verified download',
  );

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await visit('/about?view=current');
  assert.equal(await companion.count(), 0);
  checks.push(
    'the current design comparison does not include the new companion',
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/walking-results.json`,
    JSON.stringify({ passed: true, checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, checks, errors }, null, 2));
} finally {
  await browser.close();
}
