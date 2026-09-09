import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.BASE_URL ?? 'http://localhost:3100';
const browser = await chromium.launch({
  executablePath: process.env.CHROME_EXECUTABLE_PATH,
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  // Observe print requests without opening an OS dialog in automated checks.
  await page.addInitScript(() => {
    window.print = () => {
      window.printRequests = (window.printRequests ?? 0) + 1;
    };
  });
  for (const width of [320, 390, 760, 761, 1118]) {
    await page.setViewportSize({ width, height: 900 });
    const sizes = [];
    for (const lang of ['ja', 'en']) {
      await page.goto(`${origin}${lang === 'en' ? '/en/resume' : '/resume'}`);
      await page.waitForLoadState('networkidle');
      if ((await page.locator('html').getAttribute('lang')) !== lang) {
        await page.locator('.e-language-toggle').click();
      }
      await page.waitForFunction(
        (expected) => document.documentElement.lang === expected,
        lang,
      );
      const mobile = width <= 760;
      const trigger = page.locator('.resume-print-trigger');
      const panel = page.locator('.resume-print-options');
      assert.equal(await trigger.isVisible(), mobile);
      assert.equal(
        await page.locator('.resume-print-desktop').isVisible(),
        !mobile,
      );
      if (mobile) {
        assert.equal(await panel.isVisible(), false);
        sizes.push(await trigger.boundingBox());
        await trigger.focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(
          () =>
            document
              .querySelector('.resume-print-trigger')
              .getAttribute('aria-expanded') === 'true',
        );
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
        const bounds = await panel.boundingBox();
        assert.ok(
          bounds.x >= 0 && bounds.x + bounds.width <= width,
          'orientation choices fit viewport',
        );
        await page.keyboard.press('Tab');
        assert.equal(
          await panel
            .locator('button')
            .first()
            .evaluate((el) => el === document.activeElement),
          true,
        );
        await page.keyboard.press('Escape');
        assert.equal(await panel.isVisible(), false);
        assert.equal(
          await trigger.evaluate((el) => el === document.activeElement),
          true,
        );
        await trigger.click();
        await page.locator('h1').click();
        assert.equal(await panel.isVisible(), false);
        await trigger.click();
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        assert.equal(await panel.isVisible(), false);
      }
      for (const [index, orientation] of ['portrait', 'landscape'].entries()) {
        if (mobile) await trigger.click();
        const choices = page.locator(
          mobile
            ? '.resume-print-options button'
            : '.resume-print-desktop button',
        );
        await choices.nth(index).click();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.dataset.printOrientation,
          ),
          orientation,
        );
        assert.match(
          await page.locator('#print-orientation-style').textContent(),
          new RegExp(`size: A4 ${orientation}`),
        );
        assert.equal(
          await page.evaluate(() => window.printRequests),
          index + 1,
        );
        if (mobile) assert.equal(await panel.isVisible(), false);
      }
      await page.emulateMedia({ media: 'print' });
      assert.equal(await trigger.isVisible(), false);
      assert.equal(
        await page.locator('.resume-print-desktop').isVisible(),
        false,
      );
      await page.emulateMedia({ media: 'screen' });
    }
    if (width <= 760) {
      assert.equal(sizes[0].width, sizes[1].width);
      assert.equal(sizes[0].height, sizes[1].height);
      assert.ok(sizes[0].width < width / 2, 'mobile trigger remains compact');
      assert.ok(sizes[0].height >= 44);
    }
  }
  await page.goto(`${origin}/projects/tech-interviewer`);
  assert.equal(
    await page
      .locator('.project-detail-links .e-solid-link')
      .getAttribute('href'),
    'https://architect.morimizu.dev/',
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS: bilingual mobile disclosure, keyboard/outside dismissal, portrait/landscape requests, desktop controls, print media hiding, app URL. OS print dialog not automated.',
  );
} finally {
  await browser.close();
}
