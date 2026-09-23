const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
// Fixed moments along the real stair treads, joined only while invisible.
const POSES = Object.freeze({
  work: Object.freeze({ id: 'work', x: 551, y: 1164, pose: 'work' }),
  'stair-one': Object.freeze({
    id: 'stair-one',
    x: 329,
    y: 1097,
    pose: 'stair',
    flip: true,
  }),
  'stair-two': Object.freeze({
    id: 'stair-two',
    x: 303,
    y: 920,
    pose: 'stair',
    flip: false,
  }),
  read: Object.freeze({ id: 'read', x: 582, y: 824, pose: 'read' }),
  'stair-three': Object.freeze({
    id: 'stair-three',
    x: 313,
    y: 751,
    pose: 'stair',
    flip: true,
  }),
  'stair-four': Object.freeze({
    id: 'stair-four',
    x: 307,
    y: 616,
    pose: 'stair',
    flip: false,
  }),
  sleep: Object.freeze({ id: 'sleep', x: 509, y: 539, pose: 'sleep' }),
});
const ORDER = [
  'work',
  'stair-one',
  'stair-two',
  'read',
  'stair-three',
  'stair-four',
  'sleep',
];
function seasonForMonth(month) {
  return month >= 2 && month <= 4
    ? 'spring'
    : month >= 5 && month <= 7
      ? 'summer'
      : month >= 8 && month <= 10
        ? 'autumn'
        : 'winter';
}
function planFrom(from, night) {
  const frames = [];
  const add = (pose, duration, fromAlpha, toAlpha) =>
    frames.push({ ...pose, duration, fromAlpha, toAlpha });
  const fadeOut = (pose) =>
    add(pose, pose.pose === 'stair' ? 0.8 : 1.1, pose.opacity ?? 1, 0);
  const reveal = (id, hold, direction = 0) => {
    const pose = {
      ...POSES[id],
      stairDirection:
        POSES[id].pose === 'stair' ? (direction < 0 ? 'down' : 'up') : null,
    };
    add(pose, 0.35, 0, 0);
    add(pose, pose.pose === 'stair' ? 0.8 : 1.4, 0, 1);
    add(pose, hold, 1, 1);
    return pose;
  };
  const travel = (origin, destination, hold) => {
    fadeOut(origin);
    const a = ORDER.indexOf(origin.id),
      b = ORDER.indexOf(destination),
      direction = Math.sign(b - a);
    for (let i = a + direction; direction && i !== b; i += direction) {
      const id = ORDER[i];
      if (POSES[id].pose !== 'stair') continue;
      const stair = reveal(id, 1.2, direction);
      fadeOut(stair);
    }
    reveal(destination, hold);
  };
  if (night) {
    if (from.id === 'sleep') {
      add(from, 1.4, from.opacity ?? 1, 1);
      add(POSES.sleep, Infinity, 1, 1);
    } else travel(from, 'sleep', Infinity);
  } else {
    if (from.id === 'work') {
      add(from, 1.4, from.opacity ?? 1, 1);
      add(POSES.work, 14, 1, 1);
      travel(POSES.work, 'read', 20);
    } else if (from.id === 'read') {
      add(from, 1.4, from.opacity ?? 1, 1);
      add(POSES.read, 18, 1, 1);
    } else travel(from, 'read', 18);
    travel(POSES.read, 'work', 22);
  }
  return frames;
}
function sample(frames, elapsed) {
  for (const f of frames) {
    if (elapsed <= f.duration) {
      const t =
        f.duration === Infinity ? 0 : smooth(clamp(elapsed / f.duration, 0, 1));
      return {
        ...POSES[f.id],
        stairDirection: f.stairDirection ?? (f.pose === 'stair' ? 'up' : null),
        opacity: lerp(f.fromAlpha, f.toAlpha, t),
      };
    }
    elapsed -= f.duration;
  }
  const f = frames.at(-1);
  return {
    ...POSES[f.id],
    stairDirection: f.stairDirection ?? (f.pose === 'stair' ? 'up' : null),
    opacity: f.toAlpha,
    done: true,
  };
}

export { POSES, planFrom, sample, seasonForMonth };
