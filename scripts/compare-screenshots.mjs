import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const [before, after] = process.argv.slice(2);
assert.ok(
  before && after,
  'Usage: node scripts/compare-screenshots.mjs before after',
);
let changed = 0;
for (const name of (await readdir(before)).filter((name) =>
  name.endsWith('.png'),
)) {
  const a = await sharp(join(before, name))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const b = await sharp(join(after, name))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  assert.deepEqual(b.info, a.info, `${name}: image dimensions changed`);
  let pixels = 0;
  let sum = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    let different = false;
    for (let c = 0; c < 3; c++) {
      const delta = Math.abs(a.data[i + c] - b.data[i + c]);
      sum += delta;
      if (delta > 8) different = true;
    }
    if (different) pixels++;
  }
  const ratio = pixels / (a.info.width * a.info.height);
  console.log(
    `${name}: ${(ratio * 100).toFixed(4)}% changed pixels, mean channel delta ${(sum / ((a.data.length / 4) * 3)).toFixed(4)}`,
  );
  if (ratio > 0.001) changed++;
}
assert.equal(
  changed,
  0,
  'Screenshots differ: inspect the reported pages before accepting the design',
);
