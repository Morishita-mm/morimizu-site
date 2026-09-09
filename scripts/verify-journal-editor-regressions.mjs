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

  // Fail any attempted refresh GET after a committed mutation.
  const routePattern = `${base}/api/journal/admin/entries/${id}`;
  let refreshes = 0;
  let hold = null;
  await page.route(routePattern, async (route) => {
    const req = route.request();
    if (req.method() === 'GET') {
      refreshes++;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{"error":"refresh unavailable"}',
      });
      return;
    }
    const pending = hold;
    if (pending && req.postDataJSON().action === pending.action) {
      hold = null;
      const response =
        pending.phase === 'response' ? await route.fetch() : null;
      pending.started();
      await pending.gate;
      if (response) {
        await route.fulfill({ response });
        return;
      }
    }
    await route.continue();
  });
  // With no edits, publication still refreshes its status without a GET.
  await page.getByRole('button', { name: '公開設定へ', exact: true }).click();
  await page.getByLabel('公開範囲', { exact: true }).selectOption('unlisted');
  await page
    .getByRole('button', { name: '変更を反映する', exact: true })
    .click();
  await page
    .locator('.ja-status')
    .filter({ hasText: '公開設定を反映しました' })
    .waitFor();
  await page
    .getByRole('button', { name: '旧リンクを停止して再発行', exact: true })
    .waitFor();
  assert.equal(refreshes, 0);

  // Hold request dispatch and committed response delivery for both operations.
  for (const action of ['apply', 'rotate']) {
    for (const phase of ['request', 'response']) {
      let release;
      let started;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      const reached = new Promise((resolve) => {
        started = resolve;
      });
      hold = { action, phase, gate, started };
      try {
        if (action === 'apply') {
          await page
            .getByRole('button', { name: '公開設定へ', exact: true })
            .click();
          await page
            .getByRole('button', { name: '変更を反映する', exact: true })
            .click();
        } else {
          await page
            .getByRole('button', {
              name: '旧リンクを停止して再発行',
              exact: true,
            })
            .click();
        }
        await Promise.race([
          reached,
          new Promise((_, reject) => {
            setTimeout(
              () => reject(new Error('Mutation was not reached')),
              10000,
            ).unref();
          }),
        ]);
        await page.getByRole('button', { name: '編集', exact: true }).click();
        const next = `Typing during ${action} ${phase}`;
        await page
          .getByRole('textbox', { name: '本文', exact: true })
          .fill(next);
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
        const stored = await adminEntry(db, id);
        assert.equal(readFrontMatter(stored.source).content.trim(), next);
        const live = await db
          .prepare(
            'SELECT document FROM journal_revisions WHERE entry_id=? AND revision=?',
          )
          .bind(id, stored.live_revision)
          .first();
        assert.notEqual(JSON.parse(live.document).content.trim(), next);
        assert.equal(refreshes, 0);
      } finally {
        release();
        hold = null;
      }
    }
  }
  await page.unroute(routePattern);
  console.log(
    'PASS: legacy tags; committed mutation snapshots without refresh GET; inputs during publish/share rotation dispatch and response stay in draft only.',
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
