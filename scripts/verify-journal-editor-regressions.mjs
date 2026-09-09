// Regression checks for legacy tags and edits typed while publishing.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';
import { ingest, adminEntry, change, publicEntry } from '../journal/store.mjs';
import { readFrontMatter } from '../lib/content/frontmatter.mjs';
const { mf, db, adminHeaders } = await createLocalJournalRuntime();
let browser;
try {
  const base = (await mf.ready).origin;
  const id = 'legacy-editor-regression';
  await ingest(
    db,
    `---\nid: ${id}\ntitle: Legacy tags\ncreatedAt: '2026-09-01'\nkind: log\nsummary: Regression fixture\ntags: [original]\n---\nOriginal body\n`,
  );
  const original = await adminEntry(db, id);
  await change(db, id, {
    action: 'tags',
    version: original.version,
    tags: ['migrated'],
  });
  browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  });
  const page = await browser.newPage({
    extraHTTPHeaders: await adminHeaders(),
  });
  await page.goto(`${base}/journal/admin/${id}`);
  await page.getByLabel('タグ', { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel('タグ', { exact: true }).inputValue(),
    'migrated',
  );
  // Publish immediately, without any user edit to trigger a save.
  await page.getByRole('button', { name: '公開設定へ', exact: true }).click();
  await page.getByRole('button', { name: '公開する', exact: true }).click();
  await page
    .locator('.ja-status')
    .filter({ hasText: '公開設定を反映しました' })
    .waitFor();
  assert.deepEqual((await publicEntry(db, id)).entry.tags, ['migrated']);
  assert.deepEqual(
    readFrontMatter((await adminEntry(db, id)).source).data.tags,
    ['migrated'],
  );

  // Hold each half of the publish round trip while the user continues typing.
  for (const phase of ['POST', 'GET']) {
    let release;
    let started;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const reached = new Promise((resolve) => {
      started = resolve;
    });
    let posting = false;
    let held = false;
    const routePattern = `${base}/api/journal/admin/entries/${id}`;
    await page.route(routePattern, async (route) => {
      const req = route.request();
      const apply =
        req.method() === 'POST' && req.postDataJSON().action === 'apply';
      if (apply) posting = true;
      if (
        !held &&
        ((phase === 'POST' && apply) ||
          (phase === 'GET' && posting && req.method() === 'GET'))
      ) {
        held = true;
        started();
        await gate;
      }
      await route.continue();
    });
    try {
      await page
        .getByRole('button', { name: '公開設定へ', exact: true })
        .click();
      await page
        .getByRole('button', { name: '変更を反映する', exact: true })
        .click();
      await reached;
      await page.getByRole('button', { name: '編集', exact: true }).click();
      const next = `Typing during ${phase}`;
      await page.getByRole('textbox', { name: '本文', exact: true }).fill(next);
      release();
      await page
        .locator('.ja-status')
        .filter({ hasText: '保存済み' })
        .waitFor();
      assert.equal(
        await page
          .getByRole('textbox', { name: '本文', exact: true })
          .inputValue(),
        next,
      );
      assert.equal(
        readFrontMatter((await adminEntry(db, id)).source).content.trim(),
        next,
      );
      assert.notEqual((await publicEntry(db, id)).entry.content.trim(), next);
    } finally {
      release();
      await page.unroute(routePattern);
    }
  }
  console.log(
    'PASS: migrated tags survive first publish; edits during publish POST and refresh GET remain in the draft only.',
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
