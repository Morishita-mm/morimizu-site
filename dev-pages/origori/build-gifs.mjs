// The downloadable loops use the same vector folds as the interactive mascot.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { walkingFrame } from './walking-geometry.mjs';
import {
  foldFrame,
  frameSvg,
  orientPlane,
  planeRotation,
} from './motion-geometry.mjs';
const directory = new URL('./assets/mascots/', import.meta.url);
const poses = JSON.parse(
  await readFile(new URL('motion-data.json', directory)),
);
const size = 512;
const delay = 50;
const flight = { dx: 420, dy: -340 };
const departingPlane = orientPlane(
  poses.plane,
  planeRotation(flight.dx, flight.dy),
);

async function gif(name, duration, frameAt) {
  const frames = [];
  for (let time = 0; time < duration; time += delay) {
    const { facets, transform = '' } = frameAt(time);
    frames.push(
      await sharp(Buffer.from(frameSvg(facets, transform)))
        .ensureAlpha()
        .raw()
        .toBuffer(),
    );
  }
  const output = await sharp(Buffer.concat(frames), {
    raw: {
      width: size,
      height: size * frames.length,
      channels: 4,
      pageHeight: size,
    },
  })
    .gif({
      loop: 0,
      delay: frames.map(() => delay),
      keepDuplicateFrames: true,
      effort: 7,
      dither: 0.25,
    })
    .toBuffer();
  await writeFile(new URL(name, directory), output);
  console.log(
    `${name}: ${frames.length} frames, ${output.length} bytes, transparent ${size}px`,
  );
}

await gif('origori-fold-and-fly.gif', 2600, (time) => {
  if (time < 400) return { facets: poses.standing };
  if (time < 900)
    return {
      facets: foldFrame(poses.standing, departingPlane, (time - 400) / 500),
    };
  if (time < 1550) {
    const t = (time - 900) / 650;
    const distance = t * t;
    return {
      facets: departingPlane,
      transform: `translate(${distance * flight.dx} ${distance * flight.dy})`,
    };
  }
  if (time < 1800) return { facets: [] };
  return {
    facets: poses.standing,
    transform: `translate(128 128) scale(${Math.min(1, (time - 1800) / 500)}) translate(-128 -128)`,
  };
});
await gif('origori-crumple-and-unfold.gif', 2800, (time) => {
  if (time < 400) return { facets: poses.standing };
  if (time < 900)
    return {
      facets: foldFrame(poses.standing, poses.crumpled, (time - 400) / 500),
    };
  if (time < 1750) return { facets: poses.crumpled };
  if (time < 2250)
    return {
      facets: foldFrame(poses.crumpled, poses.standing, (time - 1750) / 500),
    };
  return { facets: poses.standing };
});

await writeFile(
  new URL('origori-walking.svg', directory),
  frameSvg(walkingFrame(0, 0)) + '\n',
);
await gif('origori-walking.gif', 1600, (time) => ({
  facets: walkingFrame((time / 1600) * Math.PI * 2),
}));
