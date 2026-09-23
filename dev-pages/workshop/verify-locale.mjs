import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const server = await createServer({
  configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});
try {
  const { Preview } = await server.ssrLoadModule('/editorial.tsx');
  const { chooseLocale } = await server.ssrLoadModule('/locale-choice.ts');
  const { formatArticleDate } = await server.ssrLoadModule(
    '../../lib/qiita-articles.ts',
  );
  // SSR runs in UTC on Workers; readers can be anywhere. Article dates stay JST.
  for (const tz of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
    const previousTZ = process.env.TZ;
    try {
      process.env.TZ = tz;
      assert.equal(
        formatArticleDate('2026-09-03T02:26:58+09:00'),
        '2026/09/03',
      );
      assert.equal(formatArticleDate('2026-09-02T17:26:58Z'), '2026/09/03');
      assert.equal(formatArticleDate('invalid'), 'invalid');
    } finally {
      if (previousTZ === undefined) delete process.env.TZ;
      else process.env.TZ = previousTZ;
    }
  }
  assert.equal(chooseLocale('ja', 'en', 'en-US'), 'ja');
  assert.equal(chooseLocale(null, 'en', 'ja-JP'), 'en');
  assert.equal(chooseLocale(null, null, 'ja-JP'), 'ja');
  assert.equal(chooseLocale(null, null, 'fr-FR'), 'en');
  assert.equal(chooseLocale(null, 'invalid', 'en-US'), 'en');
  assert.equal(chooseLocale(null, null, 'ja-JP', true), 'en');
  for (const path of [
    '/',
    '/projects',
    '/notes',
    '/about',
    '/resume',
    '/projects/lissue',
    '/projects/ragy',
    '/projects/rust-log-analyzer',
    '/projects/tech-interviewer',
    '/projects/architecture-sandbox',
  ]) {
    for (const initialLocale of ['ja', 'en']) {
      const html = renderToString(
        createElement(Preview, { path, initialLocale }),
      );
      assert.ok(
        html.includes(`class="roof-site" lang="${initialLocale}"`),
        `Rendered locale: ${path} (${initialLocale})`,
      );
      assert.ok(html.includes('class="site-header wrap"'));
      assert.ok(html.includes('class="site-footer wrap"'));
      assert.ok(html.includes('href="https://github.com/Morishita-mm"'));
      assert.equal((html.match(/class="language-toggle"/g) ?? []).length, 1);
      assert.equal((html.match(/id="sky-toggle"/g) ?? []).length, 1);
      assert.ok(html.includes('role="switch"'));
      assert.ok(
        html.includes(
          initialLocale === 'en'
            ? 'aria-label="JP: 日本語に切り替え"'
            : 'aria-label="EN: Switch to English"',
        ),
      );
      assert.ok(!html.includes('e-not-found'), `Route: ${path}`);
      if (path !== '/resume') assert.ok(!html.includes('href="/en/about"'));
      if (path === '/') {
        assert.ok(html.includes('MORIMIZU’S'));
        assert.ok(html.includes('src="/roof/house-editorial.png"'));
        assert.ok(html.includes('id="building-scene"'));
        assert.ok(html.includes('id="season-select"'));
        assert.ok(html.includes('id="life-pause"'));
        assert.ok(
          html.includes(
            initialLocale === 'en'
              ? 'A software engineer’s personal website.'
              : 'ソフトウェアエンジニアの個人サイト。',
          ),
        );
      }
      if (path === '/about') {
        assert.ok(
          html.includes(
            initialLocale === 'en'
              ? 'I’m a software engineer who builds personal projects.'
              : '個人開発してるエンジニアです。',
          ),
        );
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'href="/en/resume"' : 'href="/resume"',
          ),
        );
        assert.ok(html.includes('src="/roof/profile-morimizu.png"'));
        for (const interest of ['projects', 'movies', 'games', 'training']) {
          assert.ok(
            html.includes(`src="/roof/about/interest-${interest}.svg"`),
          );
        }
        for (const tool of [
          'editor',
          'mac-mini',
          'keyboard',
          'mouse',
          'earbuds',
        ]) {
          assert.ok(html.includes(`src="/roof/about/setup/${tool}-v1.png"`));
        }
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'Personal projects' : '個人開発',
          ),
        );
        assert.ok(
          html.includes(initialLocale === 'en' ? 'Development' : '開発環境'),
        );
        assert.ok(!html.includes('id="story"'));
        assert.ok(!html.includes('id="roots"'));
      }
      if (path === '/resume') {
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'href="/en/about"' : 'href="/about"',
          ),
        );
        assert.ok(
          html.includes(
            initialLocale === 'en'
              ? 'Business Application Developer'
              : '業務アプリケーション開発',
          ),
        );
      }
      if (path.startsWith('/projects/'))
        assert.ok(html.includes('DESIGN DECISIONS'));
      if (path === '/projects') {
        assert.ok(
          html.includes(
            `href="${initialLocale === 'en' ? '/en' : ''}/projects/architecture-sandbox"`,
          ),
        );
        assert.ok(html.includes('Architecture Sandbox'));
      }
      if (path === '/projects/architecture-sandbox') {
        assert.ok(html.includes('href="https://sandbox.morimizu.dev/"'));
        assert.ok(
          html.includes(
            'href="https://github.com/Morishita-mm/architecture-sandbox"',
          ),
        );
        assert.ok(
          html.includes(
            'href="https://qiita.com/gorilla_tech/items/af5cb63424ddd54ee585"',
          ),
        );
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'Share results on X' : '結果をXで共有',
          ),
        );
        const diagram = `/roof/projects/architecture/architecture-sandbox${initialLocale === 'en' ? '-en' : ''}.svg`;
        assert.ok(
          html.includes(`src="${diagram}"`),
          'Use the actual localized diagram asset',
        );
        assert.ok(html.includes('class="roof-diagram-scroll" tabindex="0"'));
        assert.ok(
          html.includes(
            initialLocale === 'en'
              ? 'Architecture diagram. Scroll horizontally to explore.'
              : '構成図。横にスクロールして全体を確認できます',
          ),
        );
        const svg = readFileSync(
          new URL(`../../public${diagram}`, import.meta.url),
          'utf8',
        );
        assert.ok(svg.includes('viewBox="0 0 1600 900"'));
        assert.ok(svg.includes('Architecture Sandbox'));
        assert.ok(
          svg.includes('Gemini'),
          'The source-grounded diagram retains its system content',
        );
        assert.ok(
          svg.includes(
            initialLocale === 'en' ? 'design workspace' : 'アーキテクチャ設計',
          ),
        );
        assert.ok(
          html.includes(
            initialLocale === 'en'
              ? 'Local JSON files'
              : 'JSONファイルで保存・復元',
          ),
        );
        assert.ok(!html.includes('e-not-found'));
      }
    }
  }
  // English-prefixed links emitted by About must resolve in standalone preview.
  for (const path of [
    '/en',
    '/en/about',
    '/en/resume',
    '/en/projects',
    '/en/projects/lissue',
    '/en/projects/architecture-sandbox',
    '/en/notes',
  ]) {
    const html = renderToString(createElement(Preview, { path }));
    assert.ok(!html.includes('e-not-found'), `English preview route: ${path}`);
    assert.ok(
      html.includes('class="roof-site" lang="en"') &&
        html.includes('aria-label="JP: 日本語に切り替え"'),
      `English locale: ${path}`,
    );
  }
  console.log(
    'PASS: 10 routes × 2 languages; accepted house/theme controls; About/Résumé links and artwork; Sandbox content, localized diagram and production links; 7 English preview routes',
  );
} finally {
  await server.close();
}
