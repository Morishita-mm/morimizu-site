import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const directory = new URL('./assets/mascots/', import.meta.url);
const manifest = JSON.parse(
  await readFile(new URL('manifest.json', directory), 'utf8'),
);
for (const [name, asset] of Object.entries(manifest)) {
  const svg = await readFile(new URL(asset.svg, directory), 'utf8');
  assert.ok(
    svg.includes(`viewBox="${asset.viewBox}"`),
    `${name}: standalone viewBox`,
  );
  assert.doesNotMatch(
    svg,
    /<(?:image|foreignObject|script|rect)\b|data:image|(?:xlink:)?href=/i,
    `${name}: genuine geometry, no bitmap or backdrop`,
  );
  const { data, info } = await sharp(new URL(asset.png, directory).pathname)
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.equal(info.channels, 4, `${name}: actual alpha channel`);
  assert.equal(
    Math.max(info.width, info.height),
    1024,
    `${name}: high-resolution PNG`,
  );
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0,
    transparent = 0,
    antialiased = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * 4 + 3];
      if (alpha === 0) transparent++;
      if (alpha > 0 && alpha < 255) antialiased++;
      if (alpha > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  assert.ok(
    transparent > info.width * info.height * 0.05,
    `${name}: transparent background pixels`,
  );
  assert.ok(antialiased > 0, `${name}: antialiased outline`);
  for (const [margin, dimension] of [
    [left, info.width],
    [top, info.height],
    [info.width - right - 1, info.width],
    [info.height - bottom - 1, info.height],
  ]) {
    assert.ok(
      margin > 0 && margin / dimension < 0.025,
      `${name}: padding under 2.5% without clipping (${margin}px)`,
    );
  }
  console.log(
    `PASS ${name}: pure SVG, RGBA ${info.width}×${info.height}, padding ${left}/${top}/${info.width - right - 1}/${info.height - bottom - 1}px`,
  );
}
