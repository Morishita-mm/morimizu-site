import test from 'node:test';
import assert from 'node:assert/strict';
import { POSES, planFrom, sample, seasonForMonth } from './life-plan.js';

// Architectural constraints measured from the artwork: each anchor is the lower
// planted foot of a stair pose, not an interpolated point on a diagonal line.
const stairTreads = {
  'stair-one': { x: 329, y: 1097 },
  'stair-two': { x: 303, y: 920 },
  'stair-three': { x: 313, y: 751 },
  'stair-four': { x: 307, y: 616 },
};
const epsilon = 1e-5;
const near = (a, b, tolerance = 1e-8) => Math.abs(a - b) <= tolerance;
const at = (id, opacity = 1, direction = 'up') => ({
  ...POSES[id],
  opacity,
  stairDirection: POSES[id].pose === 'stair' ? direction : null,
});
const duration = (plan) =>
  plan.reduce(
    (sum, frame) =>
      sum + (Number.isFinite(frame.duration) ? frame.duration : 0),
    0,
  );
const pointEquals = (a, b) => a.x === b.x && a.y === b.y;
const locations = (plan) =>
  plan
    .map((frame) => frame.id)
    .filter((id, index, list) => index === 0 || id !== list[index - 1]);
function visibleStairVisits(plan) {
  const visits = [];
  let elapsed = 0;
  for (const stage of plan) {
    const length = Number.isFinite(stage.duration) ? stage.duration : 10;
    const state = sample(plan, elapsed + length / 2);
    if (state.pose === 'stair' && state.opacity > 0) {
      const visit = `${state.id}:${state.stairDirection}`;
      if (visits.at(-1) !== visit) visits.push(visit);
    }
    elapsed += length;
  }
  return visits;
}
function assertSingleGroundedPose(state) {
  assert.ok(POSES[state.id], `Unknown visible pose: ${state.id}`);
  assert.equal(state.pose, POSES[state.id].pose);
  assert.ok(
    pointEquals(state, POSES[state.id]),
    `Resident must stay at a grounded fixed anchor: ${JSON.stringify(state)}`,
  );
  assert.ok(
    Number.isFinite(state.opacity) && state.opacity >= 0 && state.opacity <= 1,
    'Opacity stays finite and within 0–1',
  );
  if (state.pose === 'stair')
    assert.ok(
      ['up', 'down'].includes(state.stairDirection),
      'Every stair appearance has an explicit direction',
    );
  else
    assert.equal(
      state.stairDirection,
      null,
      'Room activities do not inherit a previous stair direction',
    );
}
function assertSameVisibleState(actual, expected) {
  for (const key of ['id', 'x', 'y', 'pose', 'stairDirection'])
    assert.equal(
      actual[key],
      expected[key],
      `Interrupted ${key} must be preserved`,
    );
  assert.ok(
    near(actual.opacity, expected.opacity),
    'Interrupted opacity must be preserved',
  );
}
function assertBoundaries(plan) {
  let time = 0;
  for (let i = 0; i < plan.length - 1; i++) {
    assert.ok(plan[i].duration > 0, 'Every stage has a positive duration');
    time += plan[i].duration;
    const before = sample(plan, time - epsilon);
    const exact = sample(plan, time);
    const after = sample(plan, time + epsilon);
    for (const state of [before, exact, after]) assertSingleGroundedPose(state);
    assert.ok(
      near(before.opacity, after.opacity),
      'Opacity must remain continuous at every boundary',
    );
    if (
      !pointEquals(before, after) ||
      before.stairDirection !== after.stairDirection
    ) {
      assert.ok(
        before.opacity < 1e-8 && exact.opacity === 0 && after.opacity === 0,
        'Changing floor, position or stair direction is only allowed after the person has completely disappeared',
      );
      const gap = sample(plan, time + Math.min(0.2, plan[i + 1].duration / 2));
      assert.equal(
        gap.opacity,
        0,
        'Leave a perceptible empty interval before showing the next location',
      );
    }
  }
}

void test('work, reading, sleep and the four glimpses sit on the intended floors and actual treads', () => {
  for (const [id, anchor] of Object.entries(stairTreads)) {
    assert.equal(POSES[id].pose, 'stair');
    assert.deepEqual({ x: POSES[id].x, y: POSES[id].y }, anchor);
  }
  assert.equal(POSES.work.y, 1164, 'The work desk is on the first floor');
  assert.equal(POSES.read.y, 824, 'Reading happens on the second floor');
  assert.equal(POSES.sleep.y, 539, 'The bedroom is on the third floor');
  assert.notEqual(
    POSES.work.pose,
    POSES.read.pose,
    'Working and reading need distinct poses',
  );
  for (const [left, right] of [
    ['stair-one', 'stair-two'],
    ['stair-three', 'stair-four'],
  ]) {
    assert.equal(
      POSES[left].flip,
      true,
      'The rising leftward flight uses the mirrored pose',
    );
    assert.equal(
      POSES[right].flip,
      false,
      'The rising rightward flight uses the original pose',
    );
  }
});

void test('every sampled state uses one fixed pose with no visible interpolation between locations', () => {
  for (const id of Object.keys(POSES))
    for (const night of [false, true]) {
      const plan = planFrom(at(id), night);
      for (let elapsed = 0; elapsed <= duration(plan) + 5; elapsed += 0.07) {
        assertSingleGroundedPose(sample(plan, elapsed));
      }
    }
});

void test('all floor changes happen inside fully transparent gaps and fades have continuous boundaries', () => {
  for (const id of Object.keys(POSES))
    for (const night of [false, true]) {
      for (const opacity of [0, 0.15, 0.5, 1])
        assertBoundaries(planFrom(at(id, opacity), night));
    }
});

void test('night climbs all four marked flights from the first-floor workspace to the bedroom', () => {
  const plan = planFrom(at('work'), true);
  assert.deepEqual(locations(plan), [
    'work',
    'stair-one',
    'stair-two',
    'stair-three',
    'stair-four',
    'sleep',
  ]);
  assert.deepEqual(locations(planFrom(at('read'), true)), [
    'read',
    'stair-three',
    'stair-four',
    'sleep',
  ]);
  for (const id of Object.keys(POSES)) {
    const route = locations(planFrom(at(id), true));
    for (let i = 1; i < route.length; i++) {
      assert.ok(
        POSES[route[i]].y < POSES[route[i - 1]].y,
        'Going to bed must ascend, without revisiting a lower floor',
      );
    }
  }
});

void test('morning leaves the bedroom via the upper stairs before resuming reading and first-floor work', () => {
  const plan = planFrom(at('sleep'), false);
  assert.deepEqual(locations(plan), [
    'sleep',
    'stair-four',
    'stair-three',
    'read',
    'stair-two',
    'stair-one',
    'work',
  ]);
});

void test('the daytime journey visibly climbs toward reading and descends toward work', () => {
  assert.deepEqual(visibleStairVisits(planFrom(at('work'), false)), [
    'stair-one:up',
    'stair-two:up',
    'stair-two:down',
    'stair-one:down',
  ]);
  assert.deepEqual(visibleStairVisits(planFrom(at('read'), false)), [
    'stair-two:down',
    'stair-one:down',
  ]);
});

void test('morning visibly descends from the bedroom and evening visibly climbs toward it', () => {
  assert.deepEqual(visibleStairVisits(planFrom(at('sleep'), false)), [
    'stair-four:down',
    'stair-three:down',
    'stair-two:down',
    'stair-one:down',
  ]);
  assert.deepEqual(visibleStairVisits(planFrom(at('read'), true)), [
    'stair-three:up',
    'stair-four:up',
  ]);
  assert.deepEqual(visibleStairVisits(planFrom(at('work'), true)), [
    'stair-one:up',
    'stair-two:up',
    'stair-three:up',
    'stair-four:up',
  ]);
});

void test('each stair visit keeps its direction through fade-in, hold and fade-out', () => {
  for (const [origin, night] of [
    ['work', false],
    ['sleep', false],
    ['read', true],
  ]) {
    const plan = planFrom(at(origin), night);
    let elapsed = 0,
      lastVisible = null,
      disappeared = true;
    for (const stage of plan) {
      const length = Number.isFinite(stage.duration) ? stage.duration : 10;
      for (const fraction of [0, 0.05, 0.25, 0.5, 0.75, 0.95, 1]) {
        const state = sample(plan, elapsed + length * fraction);
        if (state.opacity === 0) disappeared = true;
        else {
          if (!disappeared && lastVisible?.pose === 'stair') {
            assert.equal(
              state.stairDirection,
              lastVisible.stairDirection,
              'A visible stair figure must not turn around mid-fade',
            );
            assert.equal(
              state.id,
              lastVisible.id,
              'A visible stair figure stays on the same tread',
            );
          }
          lastVisible = state;
          disappeared = false;
        }
      }
      elapsed += length;
    }
  }
});

void test('night holds sleep indefinitely without waking or restarting the route', () => {
  for (const id of Object.keys(POSES)) {
    const plan = planFrom(at(id), true);
    for (const elapsed of [duration(plan) + 1, 3600, 86400]) {
      const state = sample(plan, elapsed);
      assertSameVisibleState(state, at('sleep'));
      assert.notEqual(
        state.done,
        true,
        'An occupied bed should remain still through the night',
      );
    }
  }
});

void test('the repeating daytime routine visits only the workspace, library and two connecting flights', () => {
  let current = at('work');
  for (let cycle = 0; cycle < 3; cycle++) {
    const plan = planFrom(current, false);
    assert.deepEqual(locations(plan), [
      'work',
      'stair-one',
      'stair-two',
      'read',
      'stair-two',
      'stair-one',
      'work',
    ]);
    current = sample(plan, duration(plan) + 1);
    assertSameVisibleState(current, at('work'));
    assert.equal(current.done, true);
  }
});

void test('daytime gives work and reading sustained scenes while stair appearances remain brief', () => {
  for (const id of Object.keys(POSES)) {
    const plan = planFrom(at(id), false);
    let visibleTime = 0,
      workTime = 0,
      readingTime = 0;
    for (let elapsed = 0; elapsed < duration(plan); elapsed += 0.05) {
      const state = sample(plan, elapsed);
      visibleTime += state.opacity * 0.05;
      if (state.id === 'work') workTime += state.opacity * 0.05;
      if (state.id === 'read') readingTime += state.opacity * 0.05;
    }
    assert.ok(
      workTime >= 15 && readingTime >= 15,
      'Both activities remain visible long enough to read as daily life',
    );
    assert.ok(
      (workTime + readingTime) / visibleTime >= 0.8,
      'At least 80% of visible time belongs to room activities',
    );
    const end = sample(plan, duration(plan) + 1);
    assertSameVisibleState(end, at('work'));
    assert.equal(end.done, true);
    assertSameVisibleState(sample(planFrom(end, false), 0), end);
  }
});

void test('reversing day or night during every fade, hold and transparent gap preserves the visible frame', () => {
  for (const id of Object.keys(POSES))
    for (const night of [false, true]) {
      const original = planFrom(at(id), night);
      let elapsed = 0;
      for (const stage of original) {
        const length = Number.isFinite(stage.duration) ? stage.duration : 10;
        for (const fraction of [0, 0.05, 0.25, 0.5, 0.75, 0.95, 1]) {
          const current = sample(original, elapsed + length * fraction);
          const replacement = planFrom(current, !night);
          assertSameVisibleState(sample(replacement, 0), current);
          assertBoundaries(replacement);
        }
        elapsed += length;
      }
    }
});

void test('rapid repeated reversals keep pose and opacity continuous rather than flashing or teleporting', () => {
  for (const id of Object.keys(POSES))
    for (const direction of ['up', 'down']) {
      let current = at(id, 0.43, direction),
        night = false;
      for (let turn = 0; turn < 30; turn++) {
        night = !night;
        const plan = planFrom(current, night);
        assertSameVisibleState(sample(plan, 0), current);
        assertBoundaries(plan);
        current = sample(plan, 0.19 + (turn % 5) * 0.11);
        assertSingleGroundedPose(current);
      }
    }
});

void test('the four seasons follow every local calendar month, including year boundaries', () => {
  const expected = [
    'winter',
    'winter',
    'spring',
    'spring',
    'spring',
    'summer',
    'summer',
    'summer',
    'autumn',
    'autumn',
    'autumn',
    'winter',
  ];
  for (let month = 0; month < 12; month++) {
    assert.equal(
      seasonForMonth(month),
      expected[month],
      `Calendar month ${month + 1}`,
    );
    const before = new Date(2026, month, 0, 23, 59);
    const after = new Date(2026, month, 1, 0, 0);
    assert.equal(
      seasonForMonth(before.getMonth()),
      expected[(month + 11) % 12],
    );
    assert.equal(seasonForMonth(after.getMonth()), expected[month]);
  }
});
