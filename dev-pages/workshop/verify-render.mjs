import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Writable } from 'node:stream';
import { createElement } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';

const server = await createServer({
  configFile: fileURLToPath(new URL('./vite.config.ts', import.meta.url)),
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
});

try {
  const { Preview } = await server.ssrLoadModule('/editorial.tsx');
  const { projects } = await server.ssrLoadModule(
    '/@fs' + fileURLToPath(new URL('../../lib/projects.ts', import.meta.url)),
  );
  const { getAllQiitaArticles } = await server.ssrLoadModule(
    '/@fs' +
      fileURLToPath(new URL('../../lib/qiita-articles.ts', import.meta.url)),
  );
  const articles = getAllQiitaArticles();
  const { ABSTRACT_M_PATHS } = await server.ssrLoadModule('/site-identity.tsx');
  const originalPlate = ABSTRACT_M_PATHS['shoulder-planes'];
  const raisedPlate = ABSTRACT_M_PATHS['shoulder-raised'];
  const favicon = readFileSync(
    new URL('./assets/m-mark.svg', import.meta.url),
    'utf8',
  );
  assert.deepEqual(
    [...favicon.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
    raisedPlate,
  );
  assert.deepEqual(raisedPlate.slice(0, 2), originalPlate.slice(0, 2));
  const originalPoints = originalPlate[2].match(/\d+/g).map(Number);
  assert.deepEqual(
    raisedPlate[2].match(/\d+/g).map(Number),
    originalPoints.map((n, i) => n - (i % 2 ? 4 : 0)),
  );
  const raisedAsset = readFileSync(
    new URL('./assets/m-08a-shoulder-raised.svg', import.meta.url),
    'utf8',
  );
  assert.deepEqual(
    [...raisedAsset.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]),
    raisedPlate,
  );
  const newMarks = ['shoulder-planes', 'shoulder-chamfer', 'shoulder-rebate'];
  for (const [index, variant] of newMarks.entries()) {
    const paths = ABSTRACT_M_PATHS[variant];
    assert.equal(paths.length, 3);
    const asset = readFileSync(
      new URL(
        './assets/m-' +
          String(index + 8).padStart(2, '0') +
          '-' +
          variant +
          '.svg',
        import.meta.url,
      ),
      'utf8',
    );
    assert.deepEqual(
      [...asset.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]),
      paths,
    );
    assert.ok(
      asset.includes('viewBox="0 6 96 96"') &&
        asset.includes('#151519') &&
        asset.includes('#2449ff'),
    );
    paths.forEach((path, i) => {
      assert.ok(path.endsWith('Z'));
      const xs = path
        .match(/\d+/g)
        .map(Number)
        .filter((_, p) => p % 2 === 0);
      assert.deepEqual(
        [Math.min(...xs), Math.max(...xs)],
        [
          [10, 34],
          [62, 86],
          [42, 54],
        ][i],
      );
    });
  }
  // Polygon studies use absolute point pairs; compare actual ink bounds.
  for (const paths of Object.values(ABSTRACT_M_PATHS)) {
    const coordinates = paths.map((path) => path.match(/\d+/g).map(Number));
    const xs = coordinates.flatMap((points) =>
      points.filter((_, index) => index % 2 === 0),
    );
    const ys = coordinates.flatMap((points) =>
      points.filter((_, index) => index % 2 === 1),
    );
    assert.equal(Math.max(...xs) - Math.min(...xs), 76);
    assert.equal(Math.max(...ys) - Math.min(...ys), 76);
    assert.equal((Math.max(...xs) + Math.min(...xs)) / 2, 48);
    assert.equal((Math.max(...ys) + Math.min(...ys)) / 2, 54);
  }
  const { carouselPosition } = await server.ssrLoadModule(
    '/project-carousel.tsx',
  );
  assert.deepEqual(carouselPosition(0, 600, 1200), {
    atStart: true,
    atEnd: false,
  });
  assert.deepEqual(carouselPosition(300, 600, 1200), {
    atStart: false,
    atEnd: false,
  });
  assert.deepEqual(carouselPosition(599, 600, 1200), {
    atStart: false,
    atEnd: true,
  });
  assert.deepEqual(carouselPosition(0, 600, 600), {
    atStart: true,
    atEnd: true,
  });
  const routes = [
    '/',
    '/projects',
    '/notes',
    '/about',
    '/en/about',
    '/brand-lab',
    ...projects.map((p) => '/projects/' + p.slug),
    ...articles.map((a) => '/notes/' + a.id),
  ];
  for (const path of routes) {
    const html = await new Promise((resolve, reject) => {
      let result = '';
      const sink = new Writable({
        write(chunk, _encoding, callback) {
          result += chunk.toString();
          callback();
        },
        final(callback) {
          resolve(result);
          callback();
        },
      });
      const stream = renderToPipeableStream(createElement(Preview, { path }), {
        onAllReady() {
          stream.pipe(sink);
        },
        onError(error) {
          reject(error);
        },
      });
    });
    assert.ok(html.includes('id="content"'), path);
    assert.equal(
      (html.match(/data-m-variant="shoulder-raised"/g) ?? []).length,
      path === '/brand-lab'
        ? 16
        : path === '/'
          ? 3
          : path.endsWith('/about')
            ? 4
            : 2,
      'Adopted mark on ' + path,
    );
    assert.ok(!html.includes('e-not-found'), path);
    assert.ok(!/src="(?:undefined|)"/.test(html), `Broken image in ${path}`);
    if (path === '/') {
      assert.ok(html.includes('data-original-icon="tech-interviewer"'));
      assert.ok(html.includes('M18 15L31 6L42 13V35L31 42L18 33'));
      for (const variant of newMarks)
        assert.ok(!html.includes('data-m-variant="' + variant + '"'));
      assert.equal(
        (html.match(/class="e-project /g) ?? []).length,
        projects.length,
      );
      assert.ok(!html.includes('e-compact-projects'));
      assert.ok(html.includes('aria-controls="home-project-track"'));
      assert.ok(!html.includes('森下 瑞基'));
      assert.equal((html.match(/Mizuki Morishita/g) ?? []).length, 2);
      const skills = html.slice(html.indexOf('class="about-skills"'));
      assert.ok(skills.indexOf('Rust') < skills.indexOf('Java'));
      assert.ok(skills.indexOf('Docker') < skills.indexOf('Spring Boot'));
      assert.equal((html.match(/class="qiita-likes"/g) ?? []).length, 3);
      assert.ok(html.includes('class="likes-updated"'));
      assert.ok(html.includes('aria-label="morimizu works ホーム"'));
      assert.equal(
        (html.match(/aria-label="morimizu works"/g) ?? []).length,
        2,
      );
      for (const kind of ['lissue', 'ragy', 'rust-log-analyzer'])
        assert.ok(html.includes(`data-original-icon="${kind}"`));
      assert.ok(!html.includes('editorial-ragy'));
    }
    if (path === '/brand-lab') {
      assert.equal(
        (html.match(/data-m-variant="shoulder-raised"/g) ?? []).length,
        16,
      );
      assert.ok(html.includes('id="m-08a"') && html.includes('href="#m-08a"'));
      for (const variant of newMarks) {
        assert.equal(
          (
            html.match(new RegExp('data-m-variant="' + variant + '"', 'g')) ??
            []
          ).length,
          14,
        );
      }
      assert.equal((html.match(/class="brand-concept"/g) ?? []).length, 3);
      assert.ok(html.includes('MIZUKI WORKS') && html.includes('re:make'));
      assert.ok(html.includes('class="brand-identity-review"'));
      for (const variant of ['arch', 'cutout', 'flow']) {
        assert.equal(
          (html.match(new RegExp(`data-m-variant="${variant}"`, 'g')) ?? [])
            .length,
          9,
          `${variant}: standalone, two wordmark letters and six size/background samples`,
        );
      }
      for (const variant of ['planes', 'paired', 'stagger', 'inset']) {
        assert.equal(
          (html.match(new RegExp(`data-m-variant="${variant}"`, 'g')) ?? [])
            .length,
          10,
        );
      }
      const planeLockup = html.slice(
        html.indexOf('id="m-04"'),
        html.indexOf('id="m-01"'),
      );
      assert.ok(planeLockup.includes('aria-label="morimizu works"'));
      const planeWordmark = planeLockup.slice(
        planeLockup.indexOf('class="site-wordmark"'),
        planeLockup.indexOf('class="brand-icon-samples'),
      );
      assert.ok(
        !planeWordmark.includes('data-m-variant='),
        'The M-04 symbol must remain separate from the lettering',
      );
      assert.ok(html.includes('class="m-monochrome"'));
      for (const id of ['m-01', 'm-02', 'm-03', 'm-04', 'm-05', 'm-06', 'm-07'])
        assert.ok(
          html.includes(`id="${id}"`) && html.includes(`href="#${id}"`),
        );
      assert.ok(html.includes('比較用：前回のV字のM'));
      for (const id of ['m-04', 'm-05', 'm-06', 'm-07']) {
        const section = html
          .slice(html.indexOf(`id="${id}"`))
          .split('</section>')[0];
        const wordmark = section.slice(
          section.indexOf('class="site-wordmark"'),
          section.indexOf('class="brand-icon-samples'),
        );
        assert.ok(
          !wordmark.includes('data-m-variant='),
          `${id}: symbol separate from lettering`,
        );
      }
    }
    if (path === '/notes')
      assert.equal(
        (html.match(/class="qiita-likes"/g) ?? []).length,
        articles.length,
      );
    if (path === '/notes')
      assert.equal(
        (html.match(/class="e-note-row"/g) ?? []).length,
        articles.length,
      );
    if (path === '/about')
      assert.ok(
        html.includes('銀行預り物件管理システム開発（ディレクテック株式会社）'),
      );
    if (path === '/en/about') assert.ok(html.includes('U-VEC'));
    if (path === '/about' || path === '/en/about') {
      assert.ok(
        html.includes('class="poster-resume"'),
        `Original resume layout: ${path}`,
      );
      assert.ok(html.includes('poster-timeline-node'));
      assert.equal((html.match(/class="resume-print-button/g) ?? []).length, 2);
    }
    if (path.startsWith('/projects/')) {
      const diagramIndex = html.indexOf('class="architecture-feature"');
      assert.ok(diagramIndex > 0, `Visible diagram: ${path}`);
      assert.ok(!html.includes('class="architecture-existing"'));
      const screenIndex = html.indexOf('class="e-real-screen"');
      assert.ok(screenIndex < 0 || diagramIndex < screenIndex);
      assert.ok(diagramIndex < html.indexOf('class="project-story"'));
    }
    if (path.startsWith('/notes/'))
      assert.ok(
        html.includes('class="markdown-body"'),
        `Article body not rendered: ${path}`,
      );
  }
  console.log(
    `PASS: ${routes.length} routes render; ${articles.length} article bodies; 4 projects; Japanese/English resume; no missing image sources.`,
  );
} finally {
  await server.close();
}
