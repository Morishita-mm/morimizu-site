/** @typedef {{points: number[][], color: number[]}} Facet */
const ease = (t) => t * t * (3 - 2 * t);
const mix = (a, b, t) => a + (b - a) * t;

// The SVG's center crease runs from (113,111) toward its nose at (8,24).
// Match that axis to the actual travel vector before translation begins.
export function planeRotation(dx, dy) {
  return ((Math.atan2(dy, dx) - Math.atan2(24 - 111, 8 - 113)) * 180) / Math.PI;
}

// Leave room for the nose at any heading within the square animation canvas.
export const FLIGHT_PLANE_SCALE = 0.78;

/** @param {Facet[]} facets @param {number} degrees @returns {Facet[]} */
export function orientPlane(facets, degrees) {
  const angle = (degrees * Math.PI) / 180;
  return facets.map((facet) => ({
    ...facet,
    points: facet.points.map(([x, y]) => [
      128 +
        ((x - 128) * Math.cos(angle) - (y - 128) * Math.sin(angle)) *
          FLIGHT_PLANE_SCALE,
      128 +
        ((x - 128) * Math.sin(angle) + (y - 128) * Math.cos(angle)) *
          FLIGHT_PLANE_SCALE,
    ]),
  }));
}

/** Fold through a compact paper bundle, then unfold into the next silhouette.
 * @param {Facet[]} from @param {Facet[]} to @param {number} progress
 * @returns {Facet[]}
 */
export function foldFrame(from, to, progress) {
  const count = Math.max(from.length, to.length);
  const t = Math.max(0, Math.min(1, progress));
  const closing = t < 0.46;
  const phase = ease(closing ? t / 0.46 : (t - 0.46) / 0.54);
  return Array.from({ length: count }, (_, index) => {
    const a = from[Math.floor((index * from.length) / count)];
    const b = to[Math.floor((index * to.length) / count)];
    const angle = index * 2.39996;
    const fold = a.points.map((_, vertex) => {
      const corner = Math.floor(vertex / 8);
      const theta = angle + (corner * Math.PI * 2) / 3;
      return [128 + Math.cos(theta) * 34, 142 + Math.sin(theta) * 30];
    });
    return {
      points: a.points.map((point, vertex) =>
        point.map((value, axis) =>
          closing
            ? mix(value, fold[vertex][axis], phase)
            : mix(fold[vertex][axis], b.points[vertex][axis], phase),
        ),
      ),
      color: a.color.map((value, channel) =>
        Math.round(mix(value, b.color[channel], ease(t))),
      ),
    };
  });
}

/** @param {Facet[]} facets @param {string} transform */
export function frameSvg(facets, transform = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256"><g transform="${transform}">${facets
    .map(
      (facet) =>
        `<polygon fill="rgb(${facet.color.join(',')})" points="${facet.points.map((p) => p.map((n) => n.toFixed(2)).join(',')).join(' ')}"/>`,
    )
    .join('')}</g></svg>`;
}
