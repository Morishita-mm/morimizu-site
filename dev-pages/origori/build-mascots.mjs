// Editable vector masters. Every visible shape is geometry, never a bitmap.
// Rebuild standalone SVGs and transparent 1024px PNG exports with:
// node dev-pages/origori/build-mascots.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const out = new URL('./assets/mascots/', import.meta.url);
await mkdir(out, { recursive: true });
const c = {
  ink: '#102d3c',
  navy: '#123e58',
  deep: '#164b6b',
  blue: '#1d648a',
  azure: '#2a7d9e',
  sky: '#4095ae',
  teal: '#216a62',
  green: '#398674',
  mint: '#93c9af',
  pale: '#c6dfbd',
  white: '#f5f0e6',
  cream: '#e3dacb',
  shade: '#bfb8ac',
  gold: '#d99b3a',
};
const p = (fill, points) =>
  `<polygon fill="${c[fill] ?? fill}" points="${points}"/>`;
const path = (fill, d) => `<path fill="${c[fill] ?? fill}" d="${d}"/>`;
const line = (stroke, d, width = 1.2) =>
  `<path d="${d}" fill="none" stroke="${c[stroke] ?? stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle = (fill, cx, cy, r) =>
  `<circle fill="${c[fill] ?? fill}" cx="${cx}" cy="${cy}" r="${r}"/>`;

// Face proportions are shared between poses: heavy paper brow, small dark eyes,
// broad cream muzzle, restrained downturned mouth. No emoji-style expressions.
function face() {
  return [
    p('navy', '73,59 93,21 146,16 176,70 179,118 157,146 90,145 67,115'),
    p('blue', '73,59 93,21 114,55'),
    p('azure', '93,21 146,16 114,55'),
    p('deep', '146,16 176,70 114,55'),
    p('sky', '114,55 176,70 163,83'),
    p('blue', '73,59 114,55 82,85 67,115'),
    p('azure', '163,83 176,70 179,118 156,111'),
    p('deep', '67,115 88,101 101,141 90,145'),
    p('ink', '156,111 179,118 157,146 139,137'),
    p('cream', '84,80 165,78 157,109 145,121 101,119 87,105'),
    p('white', '84,80 122,86 101,119 87,105'),
    p('shade', '122,86 165,78 157,109 144,121'),
    // Eyes are deliberately tucked under the angular brow.
    path('ink', 'M91 85Q99 81 106 85L105 94Q99 104 92 94Z'),
    path('ink', 'M137 84Q146 80 154 83L152 93Q145 102 139 94Z'),
    circle('white', 97, 88, 1.5),
    circle('white', 143, 86, 1.5),
    p('shade', '75,79 86,94 123,88 162,90 174,79 125,83'),
    p('white', '75,72 115,68 124,84 87,88 73,81'),
    p('cream', '115,68 163,64 174,79 124,84'),
    p('white', '115,68 163,64 145,78 124,84'),
    // Muzzle is a folded volume, with a center plane and two cheek planes.
    p('cream', '106,103 129,99 148,108 159,127 155,143 100,144 92,127'),
    p('white', '106,103 129,99 125,126 100,144 92,127'),
    p('white', '129,99 148,108 159,127 125,126'),
    p('cream', '125,126 159,127 155,143 100,144'),
    p('shade', '159,127 155,143 145,135'),
    path('ink', 'M111 107Q115 104 120 108L118 113L109 111Z'),
    path('ink', 'M132 106Q138 101 141 107L137 111L131 111Z'),
    line('shade', 'M100 137L115 131L130 129L145 132L153 137', 1.5),
  ].join('');
}

function standing() {
  return [
    // Back ridge and rear legs.
    p(
      'teal',
      '97,12 148,5 172,49 190,70 222,109 228,158 249,215 248,241 201,243 188,200 170,233 120,242 98,199',
    ),
    p('green', '97,12 148,5 126,48'),
    p('mint', '148,5 172,49 126,48'),
    p('pale', '148,5 169,27 181,59 172,49'),
    p('green', '172,49 190,70 170,102 154,76'),
    p('mint', '190,70 222,109 210,164 170,102'),
    p('pale', '222,109 228,158 210,164'),
    p('green', '210,164 231,183 249,215 219,207'),
    p('mint', '231,183 249,215 219,207'),
    p('teal', '219,207 248,241 209,236 201,243 188,200'),
    p('green', '219,207 248,241 209,236'),
    p('navy', '132,187 171,187 170,233 145,239 108,238 108,229'),
    p('teal', '132,187 153,215 170,233 145,239 108,238'),
    p('green', '132,187 113,220 108,229 153,215'),
    // Torso and the warm paper chest.
    p('navy', '64,89 112,65 174,91 185,158 151,208 101,183 77,142'),
    p('deep', '64,89 105,111 121,160 77,142'),
    p('ink', '105,111 153,111 121,160'),
    p('teal', '153,111 174,91 185,158 121,160'),
    p('cream', '80,142 121,160 162,170 151,208 105,177'),
    p('shade', '80,142 121,160 105,177'),
    p('cream', '121,160 162,170 151,208'),
    // Near left arm.
    p('deep', '65,91 89,143 75,186 77,224 63,243 16,245 5,238 14,175 25,135'),
    p('azure', '65,91 89,143 25,157 25,135'),
    p('blue', '25,157 89,143 55,176 14,175'),
    p('navy', '89,143 75,186 55,176'),
    p('blue', '55,176 75,186 77,224 55,216'),
    p('white', '14,175 42,190 35,222 5,238'),
    p('cream', '42,190 55,176 55,216 35,222'),
    p('blue', '35,222 55,216 63,243 16,245 5,238'),
    p('azure', '35,222 44,241 16,245'),
    p('navy', '55,216 77,224 63,243'),
    line('navy', 'M18 236L20 244M32 235L36 244M47 234L51 244', 1.7),
    // Front arm: large shoulder plane and cream forearm.
    p(
      'deep',
      '167,78 209,89 228,146 214,219 194,248 142,249 127,239 130,224 153,197 143,141',
    ),
    p('azure', '167,78 209,89 203,133 143,124'),
    p('sky', '167,78 209,89 203,133'),
    p('blue', '143,124 203,133 228,146 165,180'),
    p('deep', '143,124 165,180 153,197 143,141'),
    p('white', '165,180 228,146 214,219 194,248 151,220'),
    p('cream', '165,180 214,219 194,248 151,220'),
    p('white', '165,180 228,146 214,219'),
    p('cream', '228,146 218,191 214,219'),
    p('blue', '151,220 194,248 142,249 127,239 130,224'),
    p('azure', '151,220 160,246 142,249 127,239'),
    line('navy', 'M142 240L145 249M159 242L163 249M176 242L180 249', 1.8),
    `<g transform="translate(6 -1) rotate(-8 122 89) scale(.93)">${face()}</g>`,
  ].join('');
}

function sitting(idea = false) {
  return [
    // Compact folded shoulders and belly.
    p(
      'teal',
      '81,51 96,13 146,9 175,52 193,98 220,126 239,192 215,225 176,236 125,229 82,236 34,225 13,196 30,143 59,102',
    ),
    p('green', '81,51 96,13 121,44'),
    p('mint', '96,13 146,9 121,44'),
    p('pale', '146,9 175,52 121,44'),
    p('green', '175,52 193,98 166,120 155,77'),
    p('mint', '193,98 220,126 205,169 166,120'),
    p('navy', '54,110 102,90 168,108 199,160 173,215 83,218 43,171'),
    p('blue', '54,110 110,146 83,218 43,171'),
    p('deep', '110,146 168,108 173,215 83,218'),
    p('cream', '90,153 123,164 153,151 163,181 128,207 92,190'),
    p('white', '90,153 123,164 128,207 92,190'),
    p('shade', '123,164 153,151 163,181 128,207'),
    p('navy', '70,203 98,218 86,237 44,238 24,229 33,213'),
    p('blue', '70,203 86,237 44,238 33,213'),
    p('azure', '33,213 54,217 44,238 24,229'),
    p('teal', '161,208 201,201 224,217 217,233 177,239 150,226'),
    p('green', '161,208 201,201 196,232 177,239'),
    p('mint', '201,201 224,217 217,233 196,232'),
    // Broad, low hands make the resting pose feel sturdy.
    ...(idea
      ? [
          p('blue', '53,112 29,113 11,136 10,158 42,168 70,149'),
          p('azure', '53,112 29,113 33,141 70,149'),
          p('white', '11,136 33,141 29,158 10,158'),
          p('cream', '33,141 42,168 29,158'),
          p('navy', '42,168 70,149 69,176 56,181'),
        ]
      : [
          p('blue', '53,112 30,139 16,183 25,214 60,216 74,194 74,155'),
          p('azure', '53,112 74,155 37,165 30,139'),
          p('white', '16,183 37,165 48,185 32,210 25,214'),
          p('cream', '37,165 63,177 60,207 48,185'),
          p('deep', '48,185 60,207 60,216 32,210'),
          p('navy', '63,177 74,155 74,194 60,207'),
        ]),
    p('blue', '174,112 211,129 230,173 220,210 186,216 169,193 158,154'),
    p('azure', '174,112 211,129 210,167 158,154'),
    p('sky', '211,129 230,173 210,167'),
    p('white', '210,167 230,173 220,210 199,199'),
    p('cream', '183,171 210,167 199,199 186,216 175,202'),
    p('navy', '158,154 183,171 175,202 169,193'),
    p('deep', '199,199 220,210 211,220 186,216'),
    `<g transform="translate(8 18) scale(.93)">${face()}</g>`,
    line(
      'deep',
      'M40 229L44 238M59 230L62 238M182 231L183 238M202 226L205 236',
      1.8,
    ),
    ...(idea
      ? [
          // A folded-paper spark, kept close to the head to avoid a loose canvas.
          p('gold', '196,50 202,33 210,47 226,50 212,57 207,72 201,59 188,56'),
          p('pale', '202,33 210,47 207,54 201,59 196,50'),
          line('gold', 'M220 31L224 24M231 43L240 41M188 29L184 23', 2.8),
        ]
      : []),
  ].join('');
}

function resting() {
  return [
    // Low, folded mound. A sleeping face is still readable at small sizes.
    p(
      'navy',
      '11,144 37,103 71,92 102,48 146,39 176,84 210,100 241,148 229,169 185,179 139,170 98,181 47,173 20,165',
    ),
    p('teal', '102,48 146,39 176,84 129,96'),
    p('mint', '146,39 176,84 161,109 129,96'),
    p('pale', '146,39 159,67 176,84'),
    p('blue', '71,92 102,48 129,96 91,124'),
    p('azure', '37,103 71,92 91,124 50,147'),
    p('deep', '11,144 37,103 50,147 20,165'),
    p('blue', '50,147 91,124 98,181 47,173 20,165'),
    p('sky', '71,92 102,48 98,91 91,124'),
    p('navy', '91,124 129,96 161,109 162,157 139,170 98,181'),
    p('green', '161,109 176,84 210,100 202,139'),
    p('mint', '176,84 210,100 202,139'),
    p('teal', '202,139 241,148 229,169 185,179 162,157'),
    p('green', '210,100 241,148 202,139'),
    p('cream', '103,131 133,122 159,130 169,149 157,164 115,164 99,153'),
    p('white', '103,131 133,122 132,143 115,164 99,153'),
    p('cream', '133,122 159,130 169,149 132,143'),
    p('shade', '115,164 132,143 157,164'),
    line('ink', 'M109 139L117 143L124 139M139 137L147 140L154 136', 2.2),
    p('white', '121,149 134,144 148,147 155,158 120,161'),
    line('shade', 'M126 157L137 154L149 157', 1.5),
    p('blue', '20,158 48,153 62,162 47,173 20,169 9,163'),
    p('azure', '20,158 48,153 41,166 9,163'),
    p('teal', '178,157 206,153 231,163 229,169 185,179 163,172'),
    p('green', '178,157 206,153 195,172 163,172'),
  ].join('');
}

function plane() {
  return [
    p('navy', '8,24 248,99 113,127 92,214 63,159'),
    p('teal', '8,24 248,99 113,111'),
    p('green', '8,24 192,93 113,111'),
    p('mint', '119,59 248,99 192,93'),
    p('pale', '113,111 248,99 153,143'),
    p('cream', '113,111 153,143 92,214'),
    p('navy', '8,24 113,111 92,214 63,159'),
    p('blue', '8,24 86,123 92,214 63,159'),
    p('deep', '8,24 63,159 41,114'),
    p('white', '86,123 113,111 92,214'),
    line('white', 'M8 24L113 111L248 99', 0.7),
  ].join('');
}

function crumpled() {
  return [
    p(
      'navy',
      '79,35 130,21 178,40 213,78 232,130 217,185 174,225 116,234 60,211 27,166 23,108 46,65',
    ),
    p('blue', '79,35 109,75 46,65 23,108 77,113'),
    p('mint', '79,35 130,21 109,75'),
    p('teal', '130,21 178,40 151,84 109,75'),
    p('pale', '178,40 213,78 151,84'),
    p('green', '213,78 232,130 189,151 151,84'),
    p('azure', '23,108 77,113 57,151 27,166'),
    p('sky', '46,65 109,75 77,113'),
    p('deep', '77,113 109,75 151,84 135,141 89,161'),
    p('blue', '27,166 57,151 89,161 60,211'),
    p('teal', '189,151 232,130 217,185 174,225 159,183'),
    p('mint', '217,185 174,225 187,184'),
    p('green', '135,141 189,151 159,183'),
    p('azure', '60,211 89,161 116,234'),
    p('blue', '89,161 159,183 174,225 116,234'),
    p('deep', '89,161 135,141 159,183 111,196'),
    p('cream', '79,120 105,107 139,109 160,128 143,162 108,173 79,150'),
    p('white', '79,120 105,107 111,140 79,150'),
    p('shade', '139,109 160,128 143,162 132,139'),
    p('cream', '111,140 132,139 143,162 108,173'),
    p('white', '87,114 107,112 116,122 90,132'),
    p('white', '127,116 142,112 156,127 128,129'),
    line('ink', 'M94 131L104 135L97 140M140 130L130 135L137 139', 2.8),
    line('shade', 'M108 159L116 153L126 158', 2),
    p('navy', '151,84 166,107 160,128 139,109'),
    p('sky', '57,151 79,150 89,161 60,181'),
    p('green', '174,225 159,183 187,184'),
  ].join('');
}

const masters = {
  standing: standing(),
  sitting: sitting(),
  idea: sitting(true),
  resting: resting(),
  plane: plane(),
  face: face(),
  crumpled: crumpled(),
};
const labels = {
  standing: 'オリゴリ・たつ',
  sitting: 'オリゴリ・すわる',
  idea: 'オリゴリ・ひらめき',
  resting: 'オリゴリ・ひとやすみ',
  plane: 'オリゴリ・かみひこうき',
  face: 'オリゴリ・かお',
  crumpled: 'オリゴリ・くしゃくしゃ',
};
const manifest = {};
for (const [name, shapes] of Object.entries(masters)) {
  const svg = (viewBox, width, height) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" role="img" aria-label="${labels[name]}"><title>${labels[name]}</title>${shapes}</svg>`;
  const { data, info } = await sharp(
    Buffer.from(svg('0 0 256 256', 1024, 1024)),
  )
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = info.width,
    top = info.height,
    right = 0,
    bottom = 0;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  // Tight, consistent ~1% transparent breathing room; no clipping or badge.
  const padding = 2;
  const x = Math.max(0, Math.floor(left / 4) - padding);
  const y = Math.max(0, Math.floor(top / 4) - padding);
  const w = Math.ceil((right + 1) / 4) + padding - x;
  const h = Math.ceil((bottom + 1) / 4) + padding - y;
  const width = Math.round((1024 * w) / Math.max(w, h));
  const height = Math.round((1024 * h) / Math.max(w, h));
  const final = svg(`${x} ${y} ${w} ${h}`, width, height);
  const stem = `origori-${name}`;
  await writeFile(new URL(`${stem}.svg`, out), final + '\n');
  await sharp(Buffer.from(final))
    .png()
    .toFile(new URL(`${stem}.png`, out).pathname);
  manifest[name] = {
    svg: `${stem}.svg`,
    png: `${stem}.png`,
    width,
    height,
    viewBox: `${x} ${y} ${w} ${h}`,
  };
}
await writeFile(
  new URL('manifest.json', out),
  JSON.stringify(manifest, null, 2) + '\n',
);
console.log(JSON.stringify(manifest, null, 2));
