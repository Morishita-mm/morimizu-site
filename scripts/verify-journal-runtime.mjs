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
  // Follow the real navigation from home and other pages, including English pages.
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
    const footer = page.locator('footer');
    await footer.locator('a[href="/journal/admin/upload"]').click();
    await page
      .getByRole('heading', { name: '原稿をアップロード', exact: true })
      .waitFor();
  }
  const picker = page.getByLabel('Markdownファイルを選択', { exact: true });
  const confirm = page.getByRole('checkbox', {
    name: '内容を確定し、アップロード後はローカルの原稿を編集しません',
  });
  const save = page.getByRole('button', {
    name: '非公開で保存する',
    exact: true,
  });
  assert.equal(await save.isDisabled(), true);
  await picker.setInputFiles({
    name: 'not-markdown.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('invalid'),
  });
  await page
    .getByRole('alert')
    .getByText('拡張子が .md のファイルを選んでください。')
    .waitFor();
  await picker.setInputFiles({
    name: 'large.md',
    mimeType: 'text/markdown',
    buffer: Buffer.alloc(256 * 1024 + 1),
  });
  await page
    .getByRole('alert')
    .getByText('空でない256 KiB以下のMarkdownを選んでください。')
    .waitFor();
  await picker.setInputFiles(file);
  assert.equal(
    (await db.prepare('SELECT count(*) n FROM journal_entries').first()).n,
    0,
    'choosing a file must not send it',
  );
  assert.equal(await save.isDisabled(), true);
  await confirm.check();
  await mkdir('outputs/journal', { recursive: true });
  await page.screenshot({
    path: 'outputs/journal/upload-desktop.png',
    fullPage: true,
  });
  await save.click();
  await page
    .getByRole('heading', { name: '原稿を非公開で保存しました' })
    .waitFor();
  assert.equal((await fetch(base + '/journal/browser-check')).status, 404);
  await page.getByRole('link', { name: '保存した原稿を確認 →' }).click();
  await page
    .getByText('JOURNAL_PRIVATE_E2E_CANARY_785a', { exact: true })
    .waitFor();
  await page.locator('.mermaid-diagram svg').waitFor({ timeout: 20000 });
  assert.equal(await page.evaluate(() => Boolean(window.JOURNAL_XSS)), false);
  assert.ok(await page.locator('.katex').count());
  const original = await fetch(
    base + '/api/journal/admin/entries/browser-check?source=1',
    { headers: auth },
  );
  assert.equal(await original.text(), source);
  await page.screenshot({
    path: 'outputs/journal/admin-desktop.png',
    fullPage: true,
  });
  await page.getByLabel('公開範囲', { exact: true }).selectOption('public');
  await page
    .getByRole('checkbox', { name: '下の原稿と公開範囲を確認しました' })
    .check();
  await page
    .getByRole('button', { name: '公開範囲を保存', exact: true })
    .click();
  await page.getByText('保存しました。', { exact: true }).waitFor();
  const publicResponse = await fetch(base + '/journal/browser-check');
  assert.equal(publicResponse.status, 200);
  assert.match(publicResponse.headers.get('cache-control'), /no-store/);
  assert.ok(
    (await publicResponse.text()).includes('JOURNAL_PRIVATE_E2E_CANARY_785a'),
  );
  // Duplicate via browser and legacy CLI is harmless, with no publication reset.
  await page.goto(base + '/journal/admin/upload');
  await picker.setInputFiles(file);
  await confirm.check();
  await save.click();
  await page
    .getByRole('heading', { name: 'この原稿はすでに保存されています' })
    .waitFor();
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
  assert.equal(
    (
      await db
        .prepare(
          "SELECT count(*) n FROM journal_revisions WHERE entry_id='browser-check'",
        )
        .first()
    ).n,
    1,
  );
  assert.equal((await fetch(base + '/journal/browser-check')).status, 200);
  // A changed copy is deliberately rejected, not saved as another version.
  await picker.setInputFiles({
    name: 'changed-copy.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(
      source.replace(
        'JOURNAL_PRIVATE_E2E_CANARY_785a',
        'UNWANTED_CHANGED_COPY',
      ),
    ),
  });
  await confirm.check();
  await save.click();
  await page
    .getByRole('alert')
    .filter({ hasText: '保存版は上書きされません' })
    .waitFor();
  assert.equal(
    (await (await fetch(base + '/journal/browser-check')).text()).includes(
      'UNWANTED_CHANGED_COPY',
    ),
    false,
  );
  assert.equal(
    (
      await db
        .prepare(
          "SELECT count(*) n FROM journal_revisions WHERE entry_id='browser-check'",
        )
        .first()
    ).n,
    1,
  );
  // Drop a distinct completed record; both paths use the same confirmed upload.
  const dropped = await page.evaluateHandle(
    (text) => {
      const data = new DataTransfer();
      data.items.add(new File([text], 'dropped.md', { type: 'text/markdown' }));
      return data;
    },
    source.replace('id: browser-check', 'id: browser-drop'),
  );
  await page
    .locator('.journal-dropzone')
    .dispatchEvent('drop', { dataTransfer: dropped });
  await confirm.check();
  await save.click();
  await page
    .getByRole('heading', { name: '原稿を非公開で保存しました' })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: 'outputs/journal/upload-mobile.png',
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  // Public-list navigation is present as well as the footer.
  await page.goto(base + '/journal');
  await page
    .getByRole('link', { name: '原稿をアップロード（管理者） →' })
    .click();
  await page
    .getByRole('heading', { name: '原稿をアップロード', exact: true })
    .waitFor();
  await page.goto(base + '/journal/admin/browser-check');
  await page.getByLabel('公開範囲', { exact: true }).selectOption('unlisted');
  await page
    .getByRole('checkbox', { name: '下の原稿と公開範囲を確認しました' })
    .check();
  await page.getByRole('button', { name: '公開範囲を保存' }).click();
  const share = page.locator('a[href*="/journal/share/"]');
  await share.waitFor();
  const shareUrl = await share.getAttribute('href');
  const anonymous = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const reader = await anonymous.newPage();
  await reader.goto(shareUrl);
  await reader
    .getByText('JOURNAL_PRIVATE_E2E_CANARY_785a', { exact: true })
    .waitFor();
  await reader.screenshot({
    path: 'outputs/journal/shared-mobile.png',
    fullPage: true,
  });
  await page.screenshot({
    path: 'outputs/journal/admin-mobile.png',
    fullPage: true,
  });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.getByLabel('公開範囲', { exact: true }).selectOption('private');
  await page
    .getByRole('checkbox', { name: '下の原稿と公開範囲を確認しました' })
    .check();
  await page.getByRole('button', { name: '公開範囲を保存' }).click();
  await page.getByText('保存しました。', { exact: true }).waitFor();
  assert.equal((await reader.reload()).status(), 404);
  assert.equal((await fetch(shareUrl, { headers: { RSC: '1' } })).status, 404);
  assert.deepEqual(errors, []);
  console.log(
    'PASS: browser file selection/drop, confirmation, private save, duplicate and changed-ID conflict, source download, public/share/revoke, home + 7 routes navigation, mobile, Markdown/math/Mermaid/XSS.',
  );
} finally {
  await browser?.close();
  await mf.dispose();
  await rm(temporary, { recursive: true, force: true });
}
