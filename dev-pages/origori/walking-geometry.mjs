// A side-facing, articulated Origori. Both the scroll companion and GIF use
// these paper facets; feet stay on the ground during the stance of each step.
const colors = {
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
const palette = Object.fromEntries(
  Object.entries(colors).map(([name, hex]) => [
    name,
    [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16)),
  ]),
);
/** @typedef {{color: number[], points: number[][]}} WalkingFacet */
/** @param {string} color @param {number[][]} points @returns {WalkingFacet} */
const p = (color, points) => ({ color: palette[color], points });
const shift = (facets, dy) =>
  facets.map((facet) => ({
    ...facet,
    points: facet.points.map(([x, y]) => [x, y + dy]),
  }));

function bone(start, end, topWidth, bottomWidth, colors) {
  const dx = end[0] - start[0],
    dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  const offset = [-dy / length, dx / length];
  const a = start.map((n, i) => n + offset[i] * topWidth);
  const b = start.map((n, i) => n - offset[i] * topWidth);
  const c = end.map((n, i) => n - offset[i] * bottomWidth);
  const d = end.map((n, i) => n + offset[i] * bottomWidth);
  return [
    p(colors[0], [a, b, c, d]),
    p(colors[1], [a, b, end]),
    p(colors[2], [b, c, end]),
  ];
}

function leg(hip, footX, lengths, phase, amount, front, far = false) {
  const cycle = (((phase / (Math.PI * 2)) % 1) + 1) % 1;
  const swing = Math.max(0, (cycle - 0.65) / 0.35);
  const stride =
    cycle < 0.65 ? 1 - (cycle / 0.65) * 2 : -Math.cos(swing * Math.PI);
  const foot = [
    footX + stride * 12 * amount,
    223 - Math.sin(swing * Math.PI) * 12 * amount,
  ];
  const dx = foot[0] - hip[0],
    dy = foot[1] - hip[1];
  const length = Math.hypot(dx, dy);
  const along =
    (lengths[0] ** 2 - lengths[1] ** 2 + length ** 2) / (2 * length);
  const bend = Math.sqrt(Math.max(0, lengths[0] ** 2 - along ** 2));
  const knee = [
    hip[0] + (dx / length) * along - (dy / length) * bend,
    hip[1] + (dy / length) * along + (dx / length) * bend,
  ];
  const width = front ? 19 : 15;
  const [x, y] = foot;
  return [
    ...bone(
      hip,
      knee,
      width,
      width * 0.83,
      far ? ['teal', 'green', 'navy'] : ['blue', 'azure', 'deep'],
    ),
    ...bone(
      knee,
      foot,
      width * 0.83,
      width * 0.64,
      front && !far ? ['cream', 'white', 'shade'] : ['deep', 'blue', 'teal'],
    ),
    p(far ? 'teal' : 'blue', [
      [x - 12, y - 9],
      [x + 9, y - 8],
      [x + 17, y],
      [x + 14, y + 4],
      [x - 13, y + 4],
    ]),
    p(far ? 'green' : 'azure', [
      [x - 12, y - 9],
      [x + 9, y - 8],
      [x + 4, y + 4],
      [x - 13, y + 4],
    ]),
    ...[-3, 5, 12].map((offset) =>
      p('navy', [
        [x + offset, y],
        [x + offset + 1.2, y],
        [x + offset + 2, y + 4],
        [x + offset + 0.8, y + 4],
      ]),
    ),
  ];
}

/** @param {number} phase @param {number} amount @param {boolean} resting @returns {WalkingFacet[]} */
export function walkingFrame(phase, amount = 1, resting = false) {
  const bob = -Math.cos(phase * 4) * 1.5 * amount + (resting ? 3 : 0);
  const body = [
    p('navy', [
      [43, 112],
      [65, 68],
      [116, 44],
      [159, 60],
      [178, 96],
      [171, 157],
      [137, 187],
      [85, 188],
      [49, 164],
      [32, 137],
    ]),
    p('teal', [
      [65, 68],
      [116, 44],
      [159, 60],
      [124, 98],
    ]),
    p('mint', [
      [116, 44],
      [159, 60],
      [140, 80],
    ]),
    p('green', [
      [65, 68],
      [116, 44],
      [99, 81],
      [72, 114],
    ]),
    p('blue', [
      [43, 112],
      [65, 68],
      [99, 81],
      [72, 147],
      [32, 137],
    ]),
    p('sky', [
      [65, 68],
      [99, 81],
      [72, 114],
    ]),
    p('azure', [
      [32, 137],
      [72, 114],
      [72, 147],
      [49, 164],
    ]),
    p('deep', [
      [99, 81],
      [124, 98],
      [139, 137],
      [104, 180],
      [72, 147],
    ]),
    p('blue', [
      [72, 147],
      [104, 180],
      [85, 188],
      [49, 164],
    ]),
    p('green', [
      [124, 98],
      [159, 60],
      [178, 96],
      [153, 140],
    ]),
    p('mint', [
      [159, 60],
      [178, 96],
      [153, 140],
    ]),
    p('teal', [
      [139, 137],
      [153, 140],
      [171, 157],
      [137, 187],
      [104, 180],
    ]),
    p('cream', [
      [153, 140],
      [180, 132],
      [185, 158],
      [157, 180],
      [137, 169],
    ]),
    p('white', [
      [153, 140],
      [180, 132],
      [157, 180],
    ]),
  ];
  const head = [
    p('navy', [
      [149, 78],
      [160, 54],
      [186, 56],
      [205, 77],
      [211, 105],
      [199, 142],
      [170, 145],
      [148, 122],
      [138, 98],
    ]),
    p('azure', [
      [149, 78],
      [160, 54],
      [186, 56],
      [174, 84],
    ]),
    p('sky', [
      [160, 54],
      [186, 56],
      [174, 84],
    ]),
    p('blue', [
      [138, 98],
      [149, 78],
      [174, 84],
      [158, 117],
      [148, 122],
    ]),
    p('deep', [
      [174, 84],
      [186, 56],
      [205, 77],
      [211, 105],
    ]),
    p('cream', [
      [162, 90],
      [195, 86],
      [210, 97],
      [211, 117],
      [190, 132],
      [165, 121],
    ]),
    p('shade', [
      [195, 86],
      [210, 97],
      [211, 117],
      [190, 132],
    ]),
    p('white', [
      [153, 81],
      [186, 78],
      [208, 85],
      [201, 96],
      [171, 96],
      [151, 89],
    ]),
    p('cream', [
      [186, 78],
      [208, 85],
      [201, 96],
      [184, 91],
    ]),
    ...(resting
      ? [
          p('ink', [
            [177, 103],
            [185, 106],
            [191, 101],
            [192, 104],
            [185, 110],
            [177, 106],
          ]),
        ]
      : [
          p('ink', [
            [177, 97],
            [193, 96],
            [190, 105],
            [184, 109],
            [178, 104],
          ]),
        ]),
    p('cream', [
      [190, 108],
      [211, 107],
      [229, 120],
      [225, 137],
      [205, 149],
      [181, 143],
      [177, 125],
    ]),
    p('white', [
      [190, 108],
      [211, 107],
      [229, 120],
      [204, 123],
      [181, 143],
      [177, 125],
    ]),
    p('shade', [
      [204, 123],
      [229, 120],
      [225, 137],
      [205, 149],
      [181, 143],
    ]),
    p('cream', [
      [204, 123],
      [225, 137],
      [205, 143],
      [181, 143],
    ]),
    p('ink', [
      [210, 112],
      [217, 115],
      [217, 120],
      [210, 119],
    ]),
    p('shade', [
      [193, 136],
      [204, 133],
      [218, 137],
      [217, 140],
      [204, 136],
      [193, 139],
    ]),
  ];
  return [
    ...leg([88, 162 + bob], 93, [38, 37], phase + Math.PI, amount, false, true),
    ...leg(
      [170, 124 + bob],
      202,
      [46, 66],
      phase + Math.PI * 1.5,
      amount,
      true,
      true,
    ),
    ...shift(body, bob),
    ...leg([73, 162 + bob], 63, [35, 39], phase, amount, false),
    ...shift(head, bob),
    ...leg(
      [151, 119 + bob],
      173,
      [48, 64],
      phase + Math.PI * 0.5,
      amount,
      true,
    ),
  ];
}
