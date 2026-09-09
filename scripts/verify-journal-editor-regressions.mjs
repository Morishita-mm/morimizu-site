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
  const chooseOldRevision = async () => {
    const dialog = page.getByRole('dialog', { name: '変更履歴' });
    await dialog
      .locator('.ja-history-layout > div')
      .first()
      .getByRole('button')
      .last()
      .click();
    await dialog
      .getByRole('button', { name: 'この版を下書きに戻す', exact: true })
      .click();
    return dialog.getByRole('button', { name: '下書きに戻す', exact: true });
  };
  // Pause autosave so the restore is attempted while the newly typed text is dirty.
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  let releaseHistory;
  let historyStarted;
  const historyGate = new Promise((resolve) => {
    releaseHistory = resolve;
  });
  const historyReached = new Promise((resolve) => {
    historyStarted = resolve;
  });
  const historyPattern = `${routePattern}?history=*`;
  await page.route(historyPattern, async (route) => {
    const response = await route.fetch();
    historyStarted();
    await historyGate;
    await route.fulfill({ response });
  });
  await page
    .getByRole('button', { name: '変更履歴・差分', exact: true })
    .click();
  await historyReached;
  const dirtyBody = 'Typed while history was loading';
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill(dirtyBody);
  releaseHistory();
  await (await chooseOldRevision()).click();
  await page
    .getByText(
      '未保存の変更があります。保存が完了してから履歴を復元してください。',
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await page.getByRole('textbox', { name: '本文', exact: true }).inputValue(),
    dirtyBody,
  );
  await page.unroute(historyPattern);
  await page.clock.resume();
  await page.locator('.ja-status').filter({ hasText: '保存済み' }).waitFor();
  assert.equal(
    readFrontMatter((await adminEntry(db, id)).source).content.trim(),
    dirtyBody,
  );

  // Closing the dialog during the committed revert response must also keep input.
  let releaseRevert;
  let revertStarted;
  const revertGate = new Promise((resolve) => {
    releaseRevert = resolve;
  });
  const revertReached = new Promise((resolve) => {
    revertStarted = resolve;
  });
  await page.route(routePattern, async (route) => {
    if (
      route.request().method() === 'POST' &&
      route.request().postDataJSON().action === 'revert'
    ) {
      const response = await route.fetch();
      revertStarted();
      await revertGate;
      await route.fulfill({ response });
    } else await route.continue();
  });
  await page
    .getByRole('button', { name: '変更履歴・差分', exact: true })
    .click();
  await (await chooseOldRevision()).click();
  await revertReached;
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '閉じる', exact: true })
    .click();
  const afterRestore = 'Typed while restoration was in flight';
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill(afterRestore);
  releaseRevert();
  await page.locator('.ja-status').filter({ hasText: '保存済み' }).waitFor();
  assert.equal(
    await page.getByRole('textbox', { name: '本文', exact: true }).inputValue(),
    afterRestore,
  );
  assert.equal(
    readFrontMatter((await adminEntry(db, id)).source).content.trim(),
    afterRestore,
  );
  await page.unroute(routePattern);
  // Explicit reload may discard existing edits, but never input typed after confirmation.
  const conflicting = await adminEntry(db, id);
  await change(db, id, {
    action: 'tags',
    version: conflicting.version,
    tags: ['other-tab'],
  });
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill('Unsaved conflict fixture');
  await page
    .locator('.ja-status')
    .filter({ hasText: '保存できませんでした' })
    .waitFor();
  let releaseReload;
  let reloadStarted;
  const reloadGate = new Promise((resolve) => {
    releaseReload = resolve;
  });
  const reloadReached = new Promise((resolve) => {
    reloadStarted = resolve;
  });
  await page.route(routePattern, async (route) => {
    if (route.request().method() === 'GET') {
      const response = await route.fetch();
      reloadStarted();
      await reloadGate;
      await route.fulfill({ response });
    } else await route.continue();
  });
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: '保存版を読み直す', exact: true })
    .click();
  await reloadReached;
  const afterReload = 'Typed after confirming reload';
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill(afterReload);
  releaseReload();
  await page
    .getByText(
      '読み込み中に入力が変わったため、再読み込みを中止しました。編集中の内容は残っています。',
      { exact: true },
    )
    .waitFor();
  assert.equal(
    await page.getByRole('textbox', { name: '本文', exact: true }).inputValue(),
    afterReload,
  );
  assert.equal((await adminEntry(db, id)).version, conflicting.version + 1);
  await page.unroute(routePattern);
  console.log(
    'PASS: legacy tags; mutation snapshots; input retention during publication, share rotation, history loading, restoration and explicit reload.',
  );
} finally {
  await browser?.close();
  await mf.dispose();
}
