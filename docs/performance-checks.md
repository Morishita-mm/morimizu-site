# Rendering and regression checks

Production uses Vinext static export: each published route gets HTML/RSC assets
at build time. Cloudflare serves matching assets directly; the Worker retains
legacy `/apps` redirects and unknown-route 404 responses. Article publishing
still synchronizes content before the build. No request-time user data is baked
into exported pages.

Production routes import only their own view and data. Markdown and math are
rendered on the server/build, while Mermaid remains a client island. Language
selection, carousels, résumé expansion, and print controls remain interactive.
The shared CSS is inlined without changing its rules. Japanese font subsets are
regenerated from current source/content; see `assets/fonts/README.md`.

```sh
npm ci
npm run build
npm run lint
npx tsc --noEmit --incremental false
node scripts/verify-fonts.mjs
node dev-pages/workshop/verify-locale.mjs
npm start -- --local --port 3011
```

In a second terminal (install Playwright Chromium, or set
`CHROME_EXECUTABLE_PATH` to an existing Chrome executable):

```sh
BASE_URL=http://localhost:3011 node scripts/verify-navigation.mjs
BASE_URL=http://localhost:3011 ALL_ARTICLES=1 node scripts/verify-browser.mjs
```

Browser checks cover 390/1440 px, Japanese/English, article rendering, unwanted
full-font downloads, language switching, the mobile carousel, and actual A4
portrait/landscape PDF output. `OUTPUT_DIR` selects the artifact directory.
`BASELINE_DIR` enables comparisons of text, titles, heading typography, page
height, diagram data, and PDF page sizes/counts. `ROUTES` accepts comma-separated
paths for a focused run.

`node scripts/compare-screenshots.mjs BEFORE AFTER` flags pixel differences for
review; embedded SVG/system-font rasterization can vary even between repeated
captures of unchanged production. Do not accept a flagged screenshot without
inspection and the structural/font checks above.

Measure speed separately from regression runs/builds, with one isolated browser
tab per sample. Compare the same deployed URL, viewport, CPU/network throttling,
and cold browser cache. Report multiple runs and distinguish laboratory LCP from
real-user metrics. Resource byte totals use encoded body sizes, not uncompressed
bundle sizes.
