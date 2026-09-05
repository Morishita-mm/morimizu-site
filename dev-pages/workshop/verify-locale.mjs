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
      assert.ok(!html.includes('href="/en/about"'));
      assert.equal((html.match(/class="e-language-toggle"/g) ?? []).length, 1);
      assert.ok(html.includes('class="footer-home-icon"'));
      assert.ok(!html.includes('横にスクロールして見る'));
      if (path === '/about')
        assert.ok(
          html.includes(
            initialLocale === 'en'
              ? 'Business Application Developer'
              : '業務アプリケーション開発',
          ),
        );
      if (path.startsWith('/projects/'))
        assert.ok(
          html.includes(
            initialLocale === 'en' ? 'Design decisions' : '設計判断',
          ),
        );
    }
  }
  console.log('PASS: 8 routes × 2 languages; unchanged internal URLs');
} finally {
  await server.close();
}
