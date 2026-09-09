import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL ?? 'http://localhost:3011';
const output = resolve(process.env.OUTPUT_DIR ?? 'work/browser-current');
const baseline = process.env.BASELINE_DIR && resolve(process.env.BASELINE_DIR);
const routes = process.env.ROUTES?.split(',') ?? [
  '/',
  '/projects',
  '/projects/lissue',
  '/projects/ragy',
  '/projects/rust-log-analyzer',
  '/projects/tech-interviewer',
  '/notes',
  '/about',
  '/en/about',
  '/resume',
  '/en/resume',
  '/notes/90dbd51a30be86d5a4cb',
  '/notes/ec44e9b3d6d16682089e',
];
if (process.env.ALL_ARTICLES === '1') {
  const source = await readFile(
    new URL('../lib/generated/qiita-articles.ts', import.meta.url),
    'utf8',
  );
  const articles = JSON.parse(
    source.slice(source.indexOf('['), source.lastIndexOf(']') + 1),
  );
  for (const { id } of articles) {
    const route = '/notes/' + id;
    if (!routes.includes(route)) routes.push(route);
  }
}
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE_PATH,
  headless: true,
});
const results = [];
try {
  for (const width of [390, 1440]) {
    for (const locale of ['ja', 'en']) {
      const context = await browser.newContext({
        viewport: { width, height: width === 390 ? 844 : 900 },
        locale: locale === 'ja' ? 'ja-JP' : 'en-US',
        timezoneId: 'Asia/Tokyo',
        reducedMotion: 'reduce',
      });
      await context.addInitScript((value) => {
        localStorage.setItem('morimizu-locale', value);
        window.__printCalls = 0;
        window.print = () => window.__printCalls++;
      }, locale);
      const page = await context.newPage();
      for (const route of routes) {
        const errors = [];
        const onError = (error) => errors.push(String(error));
        page.on('pageerror', onError);
        const response = await page.goto(new URL(route, baseURL).href);
        assert.equal(response.status(), 200, route);
        await page.waitForFunction(
          (value) => document.documentElement.lang === value,
          locale,
        );
        if (route.startsWith('/projects/')) {
          await page.waitForFunction(() => {
            const image = document.querySelector('.architecture-scroll img');
            return image?.complete && image.naturalWidth > 0;
          });
        }
        if (route.startsWith('/notes/')) {
          await page.locator('.markdown-body').waitFor();
          await page.waitForFunction(
            () => !document.querySelector('.mermaid-loading'),
          );
        }
        await page.evaluate(async () => {
          // Load lazy images for visual comparison, not for speed measurements.
          for (const img of document.images) img.loading = 'eager';
          await Promise.all(
            [...document.images].map((img) => img.decode().catch(() => {})),
          );
          await document.fonts.ready;
        });
        assert.equal(
          await page.evaluate(() =>
            performance
              .getEntriesByType('resource')
              .some((r) => r.name.includes('noto-sans-jp-full')),
          ),
          false,
          `${route}: unexpected full-font fallback request`,
        );
        const name = `${width}-${locale}-${route.replaceAll('/', '_') || 'home'}`;
        const state = await page.evaluate(() => ({
          text: document.querySelector('main').innerText,
          title: document.title,
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          headings: [
            ...document.querySelectorAll('main h1,main h2,main h3'),
          ].map((el) => ({
            text: el.textContent,
            family: getComputedStyle(el).fontFamily,
            size: getComputedStyle(el).fontSize,
            weight: getComputedStyle(el).fontWeight,
          })),
          math: document.querySelectorAll('.katex').length,
          diagrams: document.querySelectorAll('.mermaid-diagram svg').length,
          diagramFallbacks:
            document.querySelectorAll('.mermaid-fallback').length,
          architecture: document
            .querySelector('.architecture-scroll img')
            ?.getAttribute('src'),
        }));
        assert.equal(state.width, width, `${name}: horizontal overflow`);
        assert.deepEqual(errors, [], `${name}: browser errors`);
        await page.screenshot({
          path: join(output, name + '.png'),
          fullPage: true,
          animations: 'disabled',
        });
        await writeFile(
          join(output, name + '.json'),
          JSON.stringify(state, null, 2),
        );
        if (baseline) {
          const before = JSON.parse(
            await readFile(join(baseline, name + '.json'), 'utf8'),
          );
          assert.equal(state.text, before.text, `${name}: content changed`);
          assert.equal(
            state.title,
            before.title,
            `${name}: page title changed`,
          );
          assert.deepEqual(
            state.headings,
            before.headings,
            `${name}: typography changed`,
          );
          assert.equal(state.math, before.math, `${name}: math missing`);
          assert.equal(
            state.diagrams,
            before.diagrams,
            `${name}: diagram missing`,
          );
          assert.equal(
            state.diagramFallbacks,
            before.diagramFallbacks,
            `${name}: diagram failure`,
          );
          if (before.architecture)
            assert.equal(
              state.architecture,
              before.architecture,
              `${name}: architecture image changed`,
            );
          assert.ok(
            Math.abs(state.height - before.height) <= 2,
            `${name}: page height changed ${before.height} -> ${state.height}`,
          );
        }
        if (route === '/') {
          const initialURL = page.url();
          await page.locator('.e-language-toggle').click();
          await page.waitForFunction(
            (value) => document.documentElement.lang !== value,
            locale,
          );
          assert.equal(
            page.url(),
            initialURL,
            'language toggle must preserve URL',
          );
          await page.locator('.e-language-toggle').click();
          await page.waitForFunction(
            (value) => document.documentElement.lang === value,
            locale,
          );
          if (width === 390) {
            const track = page.locator('.project-carousel-track');
            const before = await track.evaluate((el) => el.scrollLeft);
            await page.locator('.carousel-controls button').nth(1).click();
            await page.waitForFunction(
              (left) =>
                document.querySelector('.project-carousel-track').scrollLeft >
                left,
              before,
            );
            await page.locator('.carousel-controls button').nth(0).click();
            await page.waitForFunction(
              () =>
                document.querySelector('.project-carousel-track').scrollLeft <=
                2,
            );
          }
        }
        if ((route === '/resume' || route === '/en/resume') && width === 1440) {
          const details = page.locator('.poster-timeline details');
          if ((await details.count()) > 1) {
            const entry = details.nth(1);
            await entry.locator('summary').click();
            assert.equal(await entry.getAttribute('open'), '');
            await entry.locator('summary').click();
          }
          for (const [index, orientation] of [
            'portrait',
            'landscape',
          ].entries()) {
            await page.locator('.resume-print-button').nth(index).click();
            assert.equal(
              await page.evaluate(
                () => document.documentElement.dataset.printOrientation,
              ),
              orientation,
            );
            assert.equal(
              await page.evaluate(() => window.__printCalls),
              index + 1,
            );
            await page.emulateMedia({ media: 'print' });
            assert.equal(await page.locator('.e-header').isVisible(), false);
            const pdf = await page.pdf({
              path: join(output, `${locale}-${orientation}.pdf`),
              printBackground: true,
              preferCSSPageSize: true,
            });
            const boxes = [
              ...pdf
                .toString('latin1')
                .matchAll(
                  /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/g,
                ),
            ].map((m) => [Number(m[1]), Number(m[2])]);
            assert.ok(boxes.length > 0, 'PDF has pages');
            assert.ok(
              boxes.every(([w, h]) =>
                orientation === 'portrait' ? h > w : w > h,
              ),
              'PDF orientation',
            );
            await writeFile(
              join(output, `${locale}-${orientation}.json`),
              JSON.stringify({ boxes }),
            );
            if (baseline) {
              const before = JSON.parse(
                await readFile(
                  join(baseline, `${locale}-${orientation}.json`),
                  'utf8',
                ),
              );
              assert.deepEqual(
                boxes,
                before.boxes,
                'print page count and size unchanged',
              );
            }
            await page.emulateMedia({ media: 'screen' });
          }
        }
        page.off('pageerror', onError);
        results.push({
          name,
          pass: true,
          math: state.math,
          diagrams: state.diagrams,
        });
        console.log(`PASS ${name}`);
      }
      await context.close();
    }
  }
  await writeFile(
    join(output, 'results.json'),
    JSON.stringify(results, null, 2),
  );
} finally {
  await browser.close();
}
