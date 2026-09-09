import assert from 'node:assert/strict';
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
  ]) {
    for (const initialLocale of ['ja', 'en']) {
      const html = renderToString(
        createElement(Preview, { path, initialLocale }),
      );
      assert.ok(
        html.includes(
          initialLocale === 'en'
            ? 'Things I build. Things I write.'
            : 'つくったもの。書いたこと。',
        ),
      );
      if (path !== '/resume') assert.ok(!html.includes('href="/en/about"'));
      assert.equal((html.match(/class="e-language-toggle"/g) ?? []).length, 1);
      assert.ok(html.includes('class="footer-home-icon"'));
      assert.ok(!html.includes('横にスクロールして見る'));
      if (path === '/about') {
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'I’m Mizuki.' : 'Mizukiです。',
          ),
        );
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'href="/en/resume"' : 'href="/resume"',
          ),
        );
        assert.ok(html.includes('about-desk-image-light'));
        assert.ok(html.includes('about-desk-image-dark'));
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
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'Design decisions' : '設計判断',
          ),
        );
    }
  }
  // English-prefixed links emitted by About must resolve in standalone preview.
  for (const path of [
    '/en',
    '/en/about',
    '/en/resume',
    '/en/projects',
    '/en/projects/lissue',
    '/en/notes',
  ]) {
    const html = renderToString(createElement(Preview, { path }));
    assert.ok(!html.includes('e-not-found'), `English preview route: ${path}`);
    assert.ok(
      html.includes('Things I build. Things I write.'),
      `English locale: ${path}`,
    );
  }
  console.log(
    'PASS: 9 routes × 2 languages; About/Résumé content and links; 6 English preview routes',
  );
} finally {
  await server.close();
}
