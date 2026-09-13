import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:3005';
const output = 'work/origori-verification';
await mkdir(output, { recursive: true });
const previous = await readFile(`${output}/results.json`, 'utf8')
  .then(JSON.parse)
  .catch(() => ({}));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  colorScheme: 'light',
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
const failedRequests = [];
const checks = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400)
    failedRequests.push(`${response.status()} ${response.url()}`);
});

async function visit(path = '/') {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Scroll to deferred artwork before recording the full-page design.
  for (const image of await page.locator('img[loading="lazy"]:visible').all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}
async function layout(label) {
  assert.equal(
    await page.locator('h1').count(),
    1,
    `${label}: single page heading`,
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `${label}: no horizontal overflow`,
  );
  assert.deepEqual(
    await page
      .locator('img')
      .evaluateAll((images) =>
        images
          .filter(
            (image) =>
              image.getClientRects().length &&
              image.complete &&
              !image.naturalWidth,
          )
          .map((image) => image.src),
      ),
    [],
    `${label}: no broken visible images`,
  );
  checks.push(label);
}

try {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit();
    await page.screenshot({
      path: `${output}/${width}-light.png`,
      fullPage: true,
    });
    await layout(`home ${width}px`);
  }
  const heroHeight = await page
    .locator('.o-hero')
    .evaluate((el) => el.getBoundingClientRect().height);
  await page.getByRole('button', { name: 'オリゴリと、ひと息' }).click();
  assert.equal(
    await page
      .getByRole('button', { name: 'そろそろ、つくろう' })
      .getAttribute('aria-pressed'),
    'true',
  );
  assert.equal(
    await page
      .locator('.o-hero')
      .evaluate((el) => el.getBoundingClientRect().height),
    heroHeight,
    'rest pose does not shift layout',
  );
  await page.getByRole('button', { name: 'そろそろ、つくろう' }).click();
  assert.equal(await page.locator('.o-hero-image').count(), 1);
  checks.push('rest / return interaction without layout shift');

  await page
    .getByRole('button', { name: 'ダークモードに切り替える', exact: true })
    .click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.screenshot({ path: `${output}/1440-dark.png`, fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page
    .getByRole('button', { name: 'ライトモードに切り替える', exact: true })
    .click();
  checks.push('theme switch and persistence');

  await page.getByRole('button', { name: 'EN: Switch to English' }).click();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await layout('English desktop');
  await page.setViewportSize({ width: 320, height: 1000 });
  await layout('English 320px');
  await page.getByRole('button', { name: 'JP: 日本語に切り替え' }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', {
    name: 'メニューを開く',
    exact: true,
  });
  await menu.click();
  assert.equal(await page.locator('#origori-mobile-nav').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#origori-mobile-nav').isVisible(), false);
  assert.ok(await menu.evaluate((el) => document.activeElement === el));
  await menu.click();
  await page.locator('#origori-mobile-nav a[href="/projects"]').click();
  await page.waitForURL(base + '/projects');
  checks.push('mobile menu, Escape focus restoration and navigation');

  for (const route of ['/projects', '/notes', '/about', '/resume']) {
    for (const width of route === '/notes' || route === '/about'
      ? [320, 390, 768, 1440]
      : [390, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await visit(route);
      await layout(`${route} ${width}px`);
      if (route !== '/resume')
        await page.screenshot({
          path: `${output}/${route.slice(1)}-${width}.png`,
          fullPage: true,
        });
    }
  }
  await visit('/projects');
  const projectLinks = await page
    .locator('.e-project > a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  assert.equal(projectLinks.length, 4);
  for (const href of projectLinks) {
    await visit(href);
    await layout(href);
  }
  await visit('/notes');
  const article = await page
    .locator('.e-note-row')
    .first()
    .getAttribute('href');
  await visit(article);
  await layout('article detail');
  assert.ok(await page.locator('.markdown-body').count());
  await visit('/journal');
  await layout('journal destination');
  assert.equal(
    await page
      .getByRole('link', { name: 'Journalを読む（公開サイト）' })
      .getAttribute('href'),
    'https://morimizu.dev/journal',
  );

  await visit('/');
  await page.getByRole('link', { name: '現行デザイン', exact: true }).click();
  await page.waitForURL(base + '/?view=current');
  assert.equal(
    await page
      .locator('html')
      .evaluate((el) => el.classList.contains('origori-design')),
    false,
  );
  assert.equal(await page.locator('.e-home-hero').count(), 1);
  await page.getByRole('link', { name: 'オリゴリ案', exact: true }).click();
  await page.waitForURL(base + '/');
  assert.equal(await page.locator('.o-hero').count(), 1);
  checks.push('current / proposed design comparison');
  assert.ok(
    await page
      .locator('.o-mascot img, .o-hero-image')
      .evaluateAll((images) =>
        images.every(
          (image) =>
            image.src.includes('.svg') ||
            image.src.startsWith('data:image/svg+xml'),
        ),
      ),
    'site uses standalone vector assets',
  );
  assert.ok(
    await page.locator('.o-mascot').evaluateAll((elements) =>
      elements.every((element) => {
        const style = getComputedStyle(element);
        return (
          style.mixBlendMode === 'normal' &&
          style.borderRadius === '0px' &&
          style.overflow === 'visible'
        );
      }),
    ),
    'no crop, badge or blend workaround',
  );
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await visit('/origori-assets');
    await layout(`asset gallery ${width}px`);
  }
  assert.equal(await page.locator('.o-asset-card').count(), 7);
  for (const [label, background] of [
    ['紙色', 'paper'],
    ['濃紺', 'ink'],
    ['緑', 'sage'],
    ['透明チェック', 'checker'],
  ]) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    assert.equal(
      await page
        .locator(`.o-asset-stage[data-background="${background}"]`)
        .count(),
      7,
    );
    await page.screenshot({
      path: `${output}/assets-${background}.png`,
      fullPage: true,
    });
  }
  for (const [format, name] of [
    ['svg', 'SVG'],
    ['png', /^PNG/],
  ]) {
    const pendingDownload = page.waitForEvent('download');
    await page
      .getByRole('link', { name, exact: format === 'svg' })
      .first()
      .click();
    const download = await pendingDownload;
    assert.equal(download.suggestedFilename(), `origori-standing.${format}`);
    await download.saveAs(`${output}/downloaded-standing.${format}`);
    assert.deepEqual(
      await readFile(`${output}/downloaded-standing.${format}`),
      await readFile(
        `dev-pages/origori/assets/mascots/origori-standing.${format}`,
      ),
    );
  }
  checks.push(
    'seven vector assets, four preview backgrounds, original SVG and PNG downloads',
  );
  assert.equal(
    await page
      .locator('html')
      .evaluate((el) => getComputedStyle(el).scrollBehavior),
    'auto',
    'reduced motion',
  );
  assert.deepEqual(errors, [], 'no browser runtime errors');
  assert.deepEqual(failedRequests, [], 'no failed resources');
  await writeFile(
    `${output}/results.json`,
    JSON.stringify(
      { ...previous, passed: true, checks, errors, failedRequests },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({ passed: true, checks, errors, failedRequests }, null, 2),
  );
} finally {
  await browser.close();
}
