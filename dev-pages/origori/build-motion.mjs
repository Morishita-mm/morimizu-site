// Compile the editable SVG facets into normalized points for the browser and GIF.
// Run after build-mascots.mjs. Only the local SVG masters are loaded.
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const directory = new URL('./assets/mascots/', import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL('manifest.json', directory)),
);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const motion = {};
  for (const [pose, asset] of Object.entries(manifest)) {
    const svg = await readFile(new URL(asset.svg, directory), 'utf8');
    motion[pose] = await page.evaluate(
      ({ svg, pose }) => {
        document.body.innerHTML = svg;
        const root = document.querySelector('svg');
        root.setAttribute('width', '256');
        root.setAttribute('height', '256');
        // Outline each pen stroke separately so eyes and mouths survive GIF export.
        for (const line of root.querySelectorAll('path[fill="none"]')) {
          for (const segment of line.getAttribute('d').match(/M[^M]+/g) ?? []) {
            const part = line.cloneNode();
            part.setAttribute('d', segment);
            line.parentNode.insertBefore(part, line);
          }
          line.remove();
        }
        return [...root.querySelectorAll('polygon,path,circle')].map((el) => {
          const matrix = el.getCTM();
          const stroke = el.getAttribute('fill') === 'none';
          const vertices = el.tagName === 'polygon' ? [...el.points] : null;
          const length = vertices ? 0 : el.getTotalLength();
          const points = Array.from({ length: 24 }, (_, index) => {
            let point = vertices
              ? vertices[Math.floor((index * vertices.length) / 24)]
              : el.getPointAtLength((length * index) / 24);
            if (stroke) {
              const distance =
                (length * (index < 12 ? index : 23 - index)) / 11;
              const center = el.getPointAtLength(distance);
              const before = el.getPointAtLength(Math.max(0, distance - 0.1));
              const after = el.getPointAtLength(
                Math.min(length, distance + 0.1),
              );
              const angle =
                Math.atan2(after.y - before.y, after.x - before.x) +
                Math.PI / 2;
              const radius =
                (Number(el.getAttribute('stroke-width')) / 2) *
                (index < 12 ? 1 : -1);
              point = {
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius,
              };
            }
            const transformed = new DOMPoint(point.x, point.y).matrixTransform(
              matrix,
            );
            const scale = pose === 'crumpled' ? 0.74 : 1;
            return [transformed.x, transformed.y].map(
              (n) => Math.round((128 + (n - 128) * scale) * 100) / 100,
            );
          });
          const style = getComputedStyle(el);
          const color = (stroke ? style.stroke : style.fill)
            .match(/[\d.]+/g)
            .slice(0, 3)
            .map(Number);
          return { points, color };
        });
      },
      { svg, pose },
    );
  }
  await writeFile(
    new URL('motion-data.json', directory),
    JSON.stringify(motion),
  );
  console.log('Compiled folding geometry:', Object.keys(motion).join(', '));
} finally {
  await browser.close();
}
