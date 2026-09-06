import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { create } from 'fontkit';
import fontverter from 'fontverter';

async function font(path) {
  return create(
    await fontverter.convert(
      await readFile(new URL(path, import.meta.url)),
      'sfnt',
    ),
  );
}
const original = await font('../assets/fonts/noto-sans-jp-full.woff2');
const manifest = JSON.parse(
  await readFile(
    new URL('../lib/generated/fonts/manifest.json', import.meta.url),
    'utf8',
  ),
);
let checked = 0;
for (const { file } of manifest.subsets) {
  const subset = await font('../lib/generated/fonts/' + file);
  for (const weight of [100, 400, 500, 600, 700, 900]) {
    const a = original.getVariation({ wght: weight });
    const b = subset.getVariation({ wght: weight });
    assert.equal(a.unitsPerEm, b.unitsPerEm);
    for (const point of subset.characterSet) {
      // cmap format 4's U+FFFF sentinel is not a printable character.
      if (point === 0xffff) continue;
      const x = a.glyphForCodePoint(point);
      const y = b.glyphForCodePoint(point);
      assert.equal(
        x.advanceWidth,
        y.advanceWidth,
        `${file}: width U+${point.toString(16)}`,
      );
      assert.equal(
        x.path.toSVG(),
        y.path.toSVG(),
        `${file}: shape U+${point.toString(16)} weight ${weight}`,
      );
      checked++;
    }
  }
}
console.log(
  `PASS: ${checked} glyph/weight comparisons, unchanged outlines and advance widths.`,
);
