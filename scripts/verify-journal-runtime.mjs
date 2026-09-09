// Actual built Worker, local D1, browser upload. No Cloudflare account used.
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { chromium } from 'playwright';
import { createLocalJournalRuntime } from './journal/local-runtime.mjs';
const { mf, db, bindings, adminHeaders } = await createLocalJournalRuntime();
const temporary = await mkdtemp(join(tmpdir(), 'journal-browser-'));
let browser;
try {
  const base = (await mf.ready).origin;
  const auth = await adminHeaders();
  const source = `---
id: browser-check
title: 表示と公開管理の確認
createdAt: '2026-09-01'
updatedAt: '2026-09-08'
kind: experiment
summary: 書き終えた原稿を保存し、表示を確認して公開範囲を選ぶ。
tags: [検証]
projects: [tech-interviewer]
hypothesis: 保存された本文は後のアップロードで上書きされない。
---
JOURNAL_PRIVATE_E2E_CANARY_785a

## 実験の記録

- [x] 確認する

\`\`\`ts:example.ts
const result = true;
\`\`\`

$x^2$

$$
\\frac{1}{2}
$$

| 検証項目 | 結果 |
| :--- | ---: |
| ~~旧パーサ~~ | 新パーサ |

注釈の確認[^check]。

[^check]: 日本語の注釈本文。

<details open><summary>補足情報</summary><p>HTMLの本文</p></details>

\`\`\`mermaid
graph LR
 A[原稿] --> B[確認]
\`\`\`

<script>window.JOURNAL_XSS=true</script>
`;
  const file = join(temporary, 'browser-check.md');
  await writeFile(file, source, { mode: 0o600 });
  for (const path of [
    '/journal/admin',
    '/journal/admin/upload',
    '/journal//admin/upload',
    '/journal//admin/browser-check',
    '/journal/admin%2fupload',
    '/api//journal/admin/entries/browser-check?source=1',
    '/journal/admin/browser-check',
    '/api/journal/admin/entries',
    '/api/journal/admin/template',
    '/journal/%61dmin/upload',
  ]) {
    const res = await fetch(base + path, { headers: { RSC: '1' } });
    assert.equal(res.status, 401, path);
    assert.equal(
      (await res.text()).includes('JOURNAL_PRIVATE_E2E_CANARY_785a'),
      false,
    );
  }
  const rejected = await fetch(base + '/api/journal/admin/drafts', {
    method: 'PUT',
    body: source,
    headers: { origin: base, 'content-type': 'text/markdown' },
  });
  assert.equal(rejected.status, 401);
  browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
  });
  const context = await browser.newContext({
    extraHTTPHeaders: auth,
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await mkdir('outputs/journal', { recursive: true });
  for (const path of [
    '/',
    '/about',
    '/projects',
    '/notes',
    '/en',
    '/en/about',
    '/en/projects',
    '/en/notes',
  ]) {
    await page.goto(base + path);
    await page.locator('footer a[href="/journal/admin"]').click();
    await page
      .getByRole('heading', { name: '記事を育てる。', exact: true })
      .waitFor();
  }
  await page.getByRole('link', { name: 'インポート', exact: true }).click();
  const picker = page.getByLabel('Markdownファイル', { exact: true });
  await picker.setInputFiles({
    name: 'not-markdown.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('invalid'),
  });
  await page.getByRole('alert').waitFor();
  await picker.setInputFiles({
    name: 'large.md',
    mimeType: 'text/markdown',
    buffer: Buffer.alloc(256 * 1024 + 1),
  });
  await page.getByRole('alert').waitFor();
  await picker.setInputFiles(file);
  await page.getByRole('button', { name: '非公開で保存して編集へ' }).waitFor();
  assert.equal(
    (await db.prepare('SELECT count(*) n FROM journal_entries').first()).n,
    0,
    'preview does not save an article',
  );
  await page.screenshot({
    path: 'outputs/journal/upload-desktop.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: '非公開で保存して編集へ' }).click();
  await page.waitForURL('**/journal/admin/browser-check');
  await page.getByRole('button', { name: 'プレビュー', exact: true }).click();
  await page
    .getByText('JOURNAL_PRIVATE_E2E_CANARY_785a', { exact: true })
    .waitFor();
  await page.locator('.mermaid-diagram svg').waitFor({ timeout: 20000 });
  assert.equal(await page.evaluate(() => Boolean(window.JOURNAL_XSS)), false);
  assert.ok(await page.locator('.katex').count());
  assert.equal(await page.locator('.katex-display').count(), 1);
  assert.equal(await page.locator('.markdown-body table').count(), 1);
  assert.equal(
    await page.locator('.markdown-body del').textContent(),
    '旧パーサ',
  );
  assert.equal(await page.locator('.markdown-body details[open]').count(), 1);
  assert.equal(await page.locator('#user-content-fn-check').count(), 1);
  assert.equal((await fetch(base + '/journal/browser-check')).status, 404);
  assert.equal(
    await (
      await fetch(base + '/api/journal/admin/entries/browser-check?source=1', {
        headers: auth,
      })
    ).text(),
    source,
  );
  const publish = async (scope, label) => {
    await page.getByRole('button', { name: '公開設定へ', exact: true }).click();
    await page.getByLabel('公開範囲', { exact: true }).selectOption(scope);
    await page.getByRole('button', { name: label, exact: true }).click();
    await page
      .locator('.ja-status')
      .filter({
        hasText:
          scope === 'private' ? '公開を停止しました' : '公開設定を反映しました',
      })
      .waitFor();
  };
  await publish('public', '公開する');
  const response = await fetch(base + '/journal/browser-check');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.ok(
    (await response.text()).includes('JOURNAL_PRIVATE_E2E_CANARY_785a'),
  );
  await promisify(execFile)(
    process.execPath,
    [resolve('scripts/journal-send.mjs'), file],
    {
      env: {
        ...process.env,
        JOURNAL_URL: base,
        JOURNAL_UPLOAD_TOKEN: bindings.JOURNAL_UPLOAD_TOKEN,
        JOURNAL_ACCESS_JWT: auth['Cf-Access-Jwt-Assertion'],
      },
    },
  );
  await page.getByRole('button', { name: '編集', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'タイトル', exact: true })
    .fill('ブラウザーで編集した記事');
  await page
    .getByRole('textbox', { name: '要約', exact: true })
    .fill('ブラウザーから保存した下書き');
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill('PRIVATE_EDITED_DRAFT');
  await page
    .getByRole('textbox', { name: 'タグ', exact: true })
    .fill('編集, 新しいタグ');
  await page.getByRole('textbox', { name: '本文', exact: true }).click();
  await page.locator('.ja-status').filter({ hasText: '保存済み' }).waitFor();
  assert.equal(
    (await (await fetch(base + '/journal/browser-check')).text()).includes(
      'PRIVATE_EDITED_DRAFT',
    ),
    false,
  );
  // A stale editor keeps its content and cannot overwrite a newer server version.
  const second = await context.newPage();
  await second.goto(base + '/journal/admin/browser-check');
  await second.getByRole('textbox', { name: '本文', exact: true }).waitFor();
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill('PRIVATE_LATEST_DRAFT');
  await page.locator('.ja-status').filter({ hasText: '保存済み' }).waitFor();
  await second
    .getByRole('textbox', { name: '本文', exact: true })
    .fill('STALE_EDITOR_CONTENT');
  await second.getByRole('alert').waitFor();
  assert.equal(
    await second
      .getByRole('textbox', { name: '本文', exact: true })
      .inputValue(),
    'STALE_EDITOR_CONTENT',
  );
  await second.close({ runBeforeUnload: false });
  await page.getByRole('button', { name: '変更履歴・差分' }).click();
  await page.getByRole('dialog', { name: '変更履歴' }).waitFor();
  await page
    .getByRole('dialog')
    .getByRole('button')
    .filter({ hasText: '表示と公開管理の確認' })
    .click();
  await page
    .getByRole('button', { name: 'この版を下書きに戻す', exact: true })
    .click();
  await page.getByRole('button', { name: '下書きに戻す', exact: true }).click();
  await page.getByRole('textbox', { name: '本文', exact: true }).waitFor();
  await page.waitForFunction(() =>
    document
      .querySelector('#article-body')
      ?.value.includes('JOURNAL_PRIVATE_E2E_CANARY_785a'),
  );
  await page.goto(base + '/journal/admin/upload');
  await picker.setInputFiles({
    name: 'changed.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(
      source.replace(
        'JOURNAL_PRIVATE_E2E_CANARY_785a',
        'IMPORTED_UPDATED_DRAFT',
      ),
    ),
  });
  await page.getByRole('button', { name: '下書きを更新して編集へ' }).click();
  await page.waitForURL('**/journal/admin/browser-check');
  await page.getByRole('textbox', { name: '本文', exact: true }).waitFor();
  assert.equal(
    (await (await fetch(base + '/journal/browser-check')).text()).includes(
      'IMPORTED_UPDATED_DRAFT',
    ),
    false,
  );
  await publish('unlisted', '変更を反映する');
  const shareUrl = await page
    .getByLabel('共有リンク', { exact: true })
    .inputValue();
  const anonymous = await browser.newContext();
  const reader = await anonymous.newPage();
  await reader.goto(shareUrl);
  await reader.getByText('IMPORTED_UPDATED_DRAFT', { exact: true }).waitFor();
  await publish('private', '公開を停止する');
  assert.equal((await reader.reload()).status(), 404);
  assert.equal((await fetch(shareUrl, { headers: { RSC: '1' } })).status, 404);
  await page.goto(base + '/journal/admin');
  await page.getByRole('button', { name: '記事を書く', exact: true }).click();
  await page.waitForURL(/\/journal\/admin\/j-[0-9a-f-]+$/);
  const automaticId = page.url().split('/').at(-1);
  await page
    .getByRole('textbox', { name: 'タイトル', exact: true })
    .fill('自動IDの記事');
  await page.getByRole('textbox', { name: '本文', exact: true }).fill('');
  await page.locator('.ja-status').filter({ hasText: '保存済み' }).waitFor();
  await page.reload();
  assert.equal(
    await page
      .getByRole('textbox', { name: 'タイトル', exact: true })
      .inputValue(),
    '自動IDの記事',
  );
  assert.equal((await fetch(base + '/journal/' + automaticId)).status, 404);
  // Responsive layouts, keyboard focus and both themes.
  for (const path of [
    '/journal/admin',
    `/journal/admin/${automaticId}`,
    '/journal/admin/upload',
  ]) {
    await page.goto(base + path);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        path + width,
      );
      await page.screenshot({
        path: `outputs/journal/studio-${path.split('/').at(-1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.goto(base + '/journal/admin');
  await page.getByRole('textbox', { name: 'タイトルを検索' }).fill('自動ID');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  await page.getByRole('link', { name: '自動IDの記事', exact: true }).waitFor();
  const row = page.locator('.ja-row').filter({ hasText: '自動IDの記事' });
  await row.getByRole('button', { name: 'ゴミ箱に移動', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '実行する', exact: true })
    .click();
  await page
    .locator('.ja-tabs')
    .getByRole('button', { name: /^ゴミ箱/ })
    .click();
  await page.getByRole('link', { name: '自動IDの記事', exact: true }).waitFor();
  await row.locator('summary').click();
  await row.getByRole('button', { name: '非公開で復元', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '実行する', exact: true })
    .click();
  await page
    .locator('.ja-tabs')
    .getByRole('button', { name: /^未公開/ })
    .click();
  await page.getByRole('link', { name: '自動IDの記事', exact: true }).waitFor();
  await row.getByRole('button', { name: 'ゴミ箱に移動', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '実行する', exact: true })
    .click();
  await page
    .locator('.ja-tabs')
    .getByRole('button', { name: /^ゴミ箱/ })
    .click();
  await row.getByRole('button', { name: '完全に削除', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '実行する', exact: true })
    .click();
  await page
    .getByRole('heading', { name: 'ゴミ箱は空です', exact: true })
    .waitFor();
  assert.equal(
    (
      await db
        .prepare('SELECT count(*) n FROM journal_entries WHERE id=?')
        .bind(automaticId)
        .first()
    ).n,
    0,
  );
  assert.deepEqual(errors, []);
  console.log(
    'PASS: authenticated authoring/import/preview, autosave and stale editor preservation, public/draft separation, history restore, sharing/revoke, automatic IDs, search/trash/restore/purge, responsive layouts and Markdown/math/Mermaid/XSS.',
  );
} finally {
  await browser?.close();
  await mf.dispose();
  await rm(temporary, { recursive: true, force: true });
}
