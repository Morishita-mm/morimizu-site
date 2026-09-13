import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import sharp from 'sharp';

const base = 'http://127.0.0.1:3005';
const output = 'work/origori-verification';
const checks = [];
const errors = [];
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
const settled = () =>
  page.waitForFunction(
    () =>
      document.querySelector('.o-character-button .o-animated')?.dataset
        .folding === 'false',
  );
const pose = () => page.locator('.o-playful').first().getAttribute('data-pose');
try {
  await visit();
  const mascot = page.getByRole('button', {
    name: 'オリゴリを変形させる',
    exact: true,
  });
  const hero = await page.locator('.o-hero').boundingBox();
  await mascot.click();
  assert.equal(await pose(), 'sitting');
  await page.waitForSelector('.o-character-button svg polygon');
  const before = await page
    .locator('.o-character-button svg polygon')
    .first()
    .getAttribute('points');
  await page.waitForTimeout(100);
  const after = await page
    .locator('.o-character-button svg polygon')
    .first()
    .getAttribute('points');
  assert.notEqual(
    before,
    after,
    'fold changes vector geometry, not only an image opacity',
  );
  await page.screenshot({ path: `${output}/motion-folding.png` });
  await settled();
  assert.equal(
    (await page.locator('.o-hero').boundingBox()).height,
    hero.height,
  );
  checks.push('click transforms vector facets without shifting layout');

  await visit();
  for (let tap = 0; tap < 5; tap++) await mascot.click({ delay: 35 });
  assert.equal(await pose(), 'crumpled');
  await settled();
  assert.ok(
    await page
      .locator('.o-character-button img')
      .evaluate(async (img) =>
        (await (await fetch(img.src)).text()).includes(
          'オリゴリ・くしゃくしゃ',
        ),
      ),
  );
  await page.screenshot({ path: `${output}/motion-crumpled.png` });
  await page.waitForFunction(
    () => document.querySelector('.o-playful').dataset.pose === 'standing',
  );
  await settled();
  checks.push(
    'five rapid taps crumple, interrupt folding safely and recover automatically',
  );

  await mascot.press('Enter');
  assert.equal(await pose(), 'sitting');
  await settled();
  await mascot.press('Space');
  assert.equal(await pose(), 'idea');
  await settled();
  checks.push('keyboard Enter and Space transform the mascot');

  const notesLink = page.locator('.o-doorways a[href="/notes"]');
  await notesLink.click();
  await page.waitForSelector('.o-flight');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.o-flight').count(), 0);
  assert.equal(await notesLink.getAttribute('data-departing'), null);
  assert.ok(await notesLink.evaluate((el) => document.activeElement === el));
  await page.waitForTimeout(750);
  assert.equal(page.url(), base + '/');
  checks.push(
    'Escape cancels flight, restores source and focus, and clears the navigation timer',
  );

  let navigations = 0;
  const onNavigation = (frame) => {
    if (frame === page.mainFrame()) navigations++;
  };
  page.on('framenavigated', onNavigation);
  await notesLink.locator('.o-mascot').click({ clickCount: 2 });
  await page.waitForFunction(
    () =>
      document.querySelector('.o-flight .o-animated')?.dataset.pose === 'plane',
  );
  assert.equal(await notesLink.getAttribute('data-departing'), 'true');
  await page.waitForSelector('.o-flight.is-flying', {
    state: 'attached',
    timeout: 2000,
  });
  await page.waitForSelector('.o-flight .o-animated[data-folding="false"] img');
  const alignment = await page.locator('.o-flight').evaluate((element) => {
    const destination = new DOMMatrix(element.style.transform);
    const movement = new DOMMatrix(getComputedStyle(element).transform);
    const aircraft = new DOMMatrix(
      getComputedStyle(element.querySelector('img')).transform,
    );
    const forward = movement
      .multiply(aircraft)
      .transformPoint(new DOMPoint(8 - 113, 24 - 111, 0, 0));
    return (
      (forward.x * destination.e + forward.y * destination.f) /
      (Math.hypot(forward.x, forward.y) *
        Math.hypot(destination.e, destination.f))
    );
  });
  assert.ok(
    alignment > 0.99999,
    'the rendered plane nose points along its actual travel vector',
  );
  await page.screenshot({ path: `${output}/motion-departure.png` });
  await page.waitForURL(base + '/notes');
  page.off('framenavigated', onNavigation);
  assert.equal(navigations, 1);
  assert.equal(await page.locator('.o-flight').count(), 0);
  checks.push(
    'clicking the navigation mascot folds into a plane, flies, and navigates once',
  );

  await page.waitForLoadState('networkidle');
  const title = await page.locator('h1').boundingBox();
  const companion = await page
    .locator('.o-notes-companion .o-character-button')
    .boundingBox();
  assert.ok(companion.width >= 250 && companion.x >= title.x + title.width);
  assert.ok(
    companion.y < title.y + title.height &&
      companion.y + companion.height > title.y,
  );
  checks.push('Notes has a large interactive mascot beside the heading');
  await visit('/about');
  assert.ok(
    (await page.locator('.o-about-origori .o-character-button').boundingBox())
      .width >= 350,
  );
  assert.equal(await page.locator('.about-flip-card').count(), 0);
  for (const id of ['interests', 'values', 'tools'])
    assert.equal(await page.locator(`#${id}`).count(), 1);
  checks.push(
    'About centers a large interactive mascot and preserves profile sections',
  );

  await visit('/about?view=current');
  assert.equal(await page.locator('.about-flip-card').count(), 1);
  assert.equal(await page.locator('.about-credits').count(), 1);
  assert.equal(await page.locator('.o-about-origori').count(), 0);
  checks.push(
    'the original About still displays its business card and credits',
  );

  await visit();
  await notesLink.click();
  await page.waitForSelector('.o-flight');
  await page.locator('.o-doorways a[href="/about"]').click();
  assert.equal(await notesLink.getAttribute('data-departing'), null);
  await page.waitForURL(base + '/about');
  await page.waitForTimeout(750);
  assert.equal(page.url(), base + '/about');
  checks.push('choosing another mascot link cancels the older destination');

  await visit();
  const popupPromise = context.waitForEvent('page');
  await notesLink.click({ button: 'middle' });
  const popup = await popupPromise;
  await popup.waitForURL(base + '/notes');
  assert.equal(page.url(), base + '/');
  assert.equal(await page.locator('.o-flight').count(), 0);
  await popup.close();
  checks.push('middle click retains native new-tab navigation');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mascot.click();
  assert.equal(await pose(), 'sitting');
  assert.equal(await page.locator('.o-character-button svg').count(), 0);
  await notesLink.click();
  await page.waitForURL(base + '/notes');
  assert.equal(await page.locator('.o-flight').count(), 0);
  checks.push(
    'reduced motion uses immediate poses and native navigation without flight',
  );

  await visit('/origori-assets');
  assert.equal(
    await page.locator('.o-animation-stage img[src*=".gif"]').count(),
    0,
  );
  const cards = page.locator('.o-animation-card');
  await cards.nth(0).getByRole('button', { name: '再生', exact: true }).click();
  await page
    .locator('.o-animation-stage img[src*=".gif"]')
    .evaluate((img) => img.decode());
  await cards.nth(1).getByRole('button', { name: '再生', exact: true }).click();
  assert.equal(
    await page.locator('.o-animation-stage img[src*=".gif"]').count(),
    1,
  );
  await cards.nth(1).getByRole('button', { name: '停止', exact: true }).click();
  assert.equal(
    await page.locator('.o-animation-stage img[src*=".gif"]').count(),
    0,
  );
  checks.push(
    'GIFs are opt-in, one plays at a time, and stop returns to a still',
  );

  for (const name of ['fold-and-fly', 'crumple-and-unfold']) {
    const filename = `origori-${name}.gif`;
    const file = await readFile(`dev-pages/origori/assets/mascots/${filename}`);
    const metadata = await sharp(file, { animated: true }).metadata();
    assert.equal(metadata.width, 512);
    assert.equal(metadata.pageHeight, 512);
    assert.ok(metadata.pages >= 50 && metadata.hasAlpha);
    assert.ok(metadata.delay.every((delay) => delay === 50));
    const { data, info } = await sharp(file, { page: 0, pages: 1 })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    assert.equal(data[3], 0);
    assert.ok(
      data.some((byte, index) => index % info.channels === 3 && byte === 255),
    );
    const downloadPromise = page.waitForEvent('download');
    await page.locator(`a[download="${filename}"]`).click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), filename);
    await download.saveAs(`${output}/${filename}`);
    assert.deepEqual(await readFile(`${output}/${filename}`), file);
  }
  checks.push(
    'two 512px transparent 20fps GIFs with real animation frames download intact',
  );
  assert.deepEqual(errors, []);
  await writeFile(
    `${output}/motion-results.json`,
    JSON.stringify({ passed: true, checks, errors }, null, 2),
  );
  console.log(JSON.stringify({ passed: true, checks, errors }, null, 2));
} finally {
  await browser.close();
}
