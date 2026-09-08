// Verify the user-facing loopback preview without changing its saved articles.
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { chromium } from 'playwright';
import { resolve } from 'node:path';
const base = process.env.JOURNAL_PREVIEW_URL || 'http://127.0.0.1:3003';
const origin = new URL(base);
if (origin.hostname !== '127.0.0.1')
  throw new Error('Only loopback previews can be checked');
const before = await (await fetch(base + '/api/journal/admin/entries')).json();
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/');
  await page.locator('header nav a[href="/notes"]').click();
  await page.locator('.e-notes-tabs a[href="/journal"]').click();
  await page
    .getByRole('link', {
      name: '記録を残すところから、Journalを始める',
      exact: true,
    })
    .click();
  await page
    .getByRole('heading', {
      name: '記録を残すところから、Journalを始める',
      exact: true,
    })
    .waitFor();
  await page.locator('.mermaid-diagram svg').waitFor({ timeout: 20000 });
  await page.screenshot({
    path: 'outputs/journal/local-sample-desktop.png',
    fullPage: true,
  });
  await page.locator('footer a[href="/journal/admin/upload"]').click();
  await page
    .getByLabel('Markdownファイルを選択', { exact: true })
    .setInputFiles(resolve('scripts/journal/preview-sample.md'));
  await page
    .getByRole('checkbox', {
      name: '内容を確定し、アップロード後はローカルの原稿を編集しません',
    })
    .check();
  await page
    .getByRole('button', { name: '非公開で保存する', exact: true })
    .click();
  await page
    .getByRole('heading', { name: 'この原稿はすでに保存されています' })
    .waitFor();
  await page.getByRole('link', { name: '保存した原稿を確認 →' }).click();
  await page.getByText('現在：公開 ／ 本文固定', { exact: true }).waitFor();
  await page.goto(base + '/journal/admin/upload');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: `outputs/journal/local-upload-${width}.png`,
      fullPage: true,
    });
  }
  const after = await (await fetch(base + '/api/journal/admin/entries')).json();
  assert.deepEqual(after, before);
  const status = (path, headers, method = 'GET') =>
    new Promise((resolve, reject) => {
      const outgoing = request(
        new URL(path, base),
        { method, headers },
        (response) => {
          response.resume();
          resolve(response.statusCode);
        },
      );
      outgoing.on('error', reject);
      outgoing.end();
    });
  assert.equal(
    await status('/journal/admin/upload', { host: 'untrusted.example' }),
    403,
  );
  assert.equal(
    await status(
      '/api/journal/admin/drafts',
      { origin: 'https://untrusted.example', 'content-type': 'text/markdown' },
      'PUT',
    ),
    403,
  );
  assert.equal(
    await status('/journal/admin', { 'sec-fetch-site': 'cross-site' }),
    403,
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS: live loopback preview navigation, browser upload with local authentication, unchanged sample, 320/390/1440 layouts, Host/Origin protections.',
  );
} finally {
  await browser.close();
}
