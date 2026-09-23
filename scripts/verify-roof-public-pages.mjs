// Browser checks against the real locally built Worker, never a deployed site.
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.ROOF_QA_URL || 'http://127.0.0.1:4188';
const output = process.env.ROOF_QA_OUTPUT || '/tmp/morimizu-public-pages';
const slugs = [
  'tech-interviewer',
  'lissue',
  'ragy',
  'rust-log-analyzer',
  'architecture-sandbox',
];
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
});
await mkdir(output, { recursive: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: 'ja-JP',
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const prefix of ['', '/en']) {
    for (const path of [
      '/projects',
      ...slugs.map((slug) => `/projects/${slug}`),
      '/about',
      '/resume',
    ]) {
      await page.goto(`${base}${prefix}${path}`, { waitUntil: 'networkidle' });
      await page.locator('.language-toggle').waitFor();
      assert.equal(
        new URL(
          await page.locator('link[rel="canonical"]').getAttribute('href'),
        ).pathname,
        `${prefix}${path}`,
        `${prefix}${path}: canonical URL`,
      );
      assert.equal(
        await page.locator('link[rel="alternate"][hreflang="ja-JP"]').count(),
        1,
      );
      assert.equal(
        await page.locator('link[rel="alternate"][hreflang="en-US"]').count(),
        1,
      );
      assert.equal(
        await page.locator('.wrap.page-main h1').count(),
        1,
        `${prefix}${path}: one heading`,
      );
      assert.equal(
        await page.locator('main').count(),
        1,
        `${prefix}${path}: one main landmark`,
      );
      if (path === '/projects') {
        assert.equal(await page.locator('.work-row').count(), 5);
        assert.equal(
          await page.locator('.work-row').first().getAttribute('href'),
          `${prefix}/projects/tech-interviewer`,
        );
      } else if (path.startsWith('/projects/')) {
        assert.equal(await page.locator('.project-chapter').count(), 7);
        assert.equal(await page.locator('.project-toc a').count(), 7);
        const diagram = page.locator('.roof-diagram-scroll img');
        await diagram.scrollIntoViewIfNeeded();
        await diagram.evaluate((img) => img.decode());
        assert.equal(
          await diagram.evaluate((img) => img.complete && img.naturalWidth > 0),
          true,
        );
        assert.match(
          await diagram.getAttribute('src'),
          prefix ? /-en\.svg$/ : /(?<!-en)\.svg$/,
        );
        if (path.endsWith('tech-interviewer')) {
          assert.equal(
            await page
              .locator(
                '.detail-actions a[href="https://architect.morimizu.dev/"]',
              )
              .count(),
            1,
          );
          assert.equal(
            await page.locator('.detail-actions a[href*="github.com"]').count(),
            0,
          );
        }
        if (path.endsWith('architecture-sandbox')) {
          assert.equal(
            await page
              .locator(
                '.detail-actions a[href="https://sandbox.morimizu.dev/"]',
              )
              .count(),
            1,
          );
          assert.equal(
            await page.locator('.detail-actions a[href*="qiita.com"]').count(),
            1,
          );
        }
      } else if (path === '/about') {
        assert.equal(await page.locator('.interest-grid h3').count(), 4);
        assert.equal(await page.locator('.tool-visual img').count(), 5);
        assert.equal(await page.locator('#values').count(), 0);
        assert.equal(await page.locator('.tool-copy > span').count(), 1);
        for (const image of await page.locator('.tool-visual img').all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((img) => img.decode());
        }
      } else if (path === '/resume') {
        assert.equal(await page.locator('.resume-experience').count(), 4);
        assert.equal(await page.locator('.resume-section').count(), 5);
        const buttons = await page
          .locator('.resume-print-button')
          .evaluateAll((items) =>
            items.map((item) => item.getBoundingClientRect().top),
          );
        assert.equal(
          buttons[0],
          buttons[1],
          'Print buttons form one horizontal row',
        );
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${prefix}${path}: desktop overflow`,
      );
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        `${prefix}${path}: mobile overflow`,
      );
      if (
        path === '/about' ||
        path === '/resume' ||
        path.endsWith('tech-interviewer')
      ) {
        await page.evaluate(() => {
          document.activeElement?.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: `${output}/${prefix ? 'en' : 'ja'}-${path.split('/').at(-1)}-mobile.png`,
          fullPage: true,
        });
      }
      if (path.startsWith('/projects/')) {
        const region = page.locator('.roof-diagram-scroll');
        await region.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(150);
        assert.ok(
          (await region.evaluate((element) => element.scrollLeft)) > 0,
          `${path}: keyboard scroll`,
        );
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
  }
  await page.goto(`${base}/resume`, { waitUntil: 'networkidle' });
  const printResult = await page.evaluate(async () => {
    const entries = [...document.querySelectorAll('.resume-experience')];
    const initial = [false, true, false, true];
    entries.forEach((entry, index) => {
      entry.open = initial[index];
    });
    const snapshots = [];
    window.print = () => {
      window.dispatchEvent(new Event('beforeprint'));
      window.dispatchEvent(new Event('beforeprint'));
      snapshots.push({
        states: entries.map((entry) => entry.open),
        orientation: document.querySelector('#resume-print-orientation')
          .textContent,
      });
      window.dispatchEvent(new Event('afterprint'));
    };
    for (const button of document.querySelectorAll('.resume-print-button'))
      button.click();
    const afterButtons = entries.map((entry) => entry.open);
    window.dispatchEvent(new Event('beforeprint'));
    const menuPrint = entries.map((entry) => entry.open);
    window.dispatchEvent(new Event('afterprint'));
    const afterMenu = entries.map((entry) => entry.open);
    window.print = () => {};
    document.querySelector('.resume-print-button').click();
    return {
      initial,
      snapshots,
      afterButtons,
      menuPrint,
      afterMenu,
      afterNoop: entries.map((entry) => entry.open),
    };
  });
  assert.equal(printResult.snapshots.length, 2);
  for (const snapshot of printResult.snapshots)
    assert.deepEqual(snapshot.states, [true, true, true, true]);
  assert.match(printResult.snapshots[0].orientation, /A4 portrait/);
  assert.match(printResult.snapshots[1].orientation, /A4 landscape/);
  assert.deepEqual(printResult.menuPrint, [true, true, true, true]);
  for (const result of [
    printResult.afterButtons,
    printResult.afterMenu,
    printResult.afterNoop,
  ])
    assert.deepEqual(result, printResult.initial);
  // Chromium's real PDF lifecycle must also expand and restore the entries.
  await page.evaluate(() => {
    window.__resumePrintSnapshots = [];
    window.addEventListener('beforeprint', () => {
      window.__resumePrintSnapshots.push(
        [...document.querySelectorAll('.resume-experience')].map(
          (entry) => entry.open,
        ),
      );
    });
  });
  for (const orientation of ['portrait', 'landscape']) {
    await page.locator(`[data-print-orientation="${orientation}"]`).click();
    const pdf = await page.pdf({
      path: `${output}/resume-${orientation}.pdf`,
      preferCSSPageSize: true,
      printBackground: true,
    });
    const bounds = pdf
      .toString('latin1')
      .match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/);
    assert.ok(bounds, `${orientation}: PDF has page dimensions`);
    assert.equal(
      Number(bounds[1]) > Number(bounds[2]),
      orientation === 'landscape',
    );
    assert.deepEqual(
      await page
        .locator('.resume-experience')
        .evaluateAll((entries) => entries.map((entry) => entry.open)),
      printResult.initial,
    );
  }
  const pdfSnapshots = await page.evaluate(() => window.__resumePrintSnapshots);
  assert.equal(pdfSnapshots.length, 2);
  for (const snapshot of pdfSnapshots)
    assert.deepEqual(snapshot, [true, true, true, true]);
  await page.locator('.language-toggle').click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.equal(
    await page.locator('.resume-intro h2').textContent(),
    'Mizuki Morishita',
  );
  await page.locator('.language-toggle').click();
  await page.waitForFunction(() => document.documentElement.lang === 'ja');
  assert.equal(
    await page.locator('.resume-intro h2').textContent(),
    '森下 瑞基',
  );
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(
    JSON.stringify({
      routes: 16,
      desktopAndMobile: true,
      diagramKeyboardScroll: true,
      printOrientationsAndRestoration: true,
      localeToggle: true,
      screenshots: output,
    }),
  );
} finally {
  await browser.close();
}
