import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { POSES, planFrom, sample, seasonForMonth } from './life-plan.js';

const lifeSource = readFileSync(new URL('./life.js', import.meta.url), 'utf8')
  .replace(/^import .*life-plan.js';\n/m, '')
  .replace(
    'export function initializeRoofLife()',
    'function initializeRoofLife()',
  );
const sceneSource = readFileSync(
  new URL('./scene.js', import.meta.url),
  'utf8',
).replace(
  'export function initializeRoofScene()',
  'function initializeRoofScene()',
);

// Exercise both actual controllers against a deterministic browser clock.
// Raster decoding is omitted; canvas clears record every complete life repaint.
async function fixture({
  paused = false,
  reduced = false,
  night = false,
} = {}) {
  let now = 0,
    frameId = 0;
  const frames = new Map();
  const paints = [];
  const observers = [];
  class Element {
    constructor() {
      this.events = new Map();
      this.dataset = {};
      this.attrs = new Map();
      this.style = {
        setProperty(name, value) {
          this[name] = value;
        },
      };
      this.classList = { add() {}, remove() {} };
      this.children = [];
      this.complete = true;
      this.naturalWidth = 0;
    }
    addEventListener(name, handler) {
      if (!this.events.has(name)) this.events.set(name, new Set());
      this.events.get(name).add(handler);
    }
    removeEventListener(name, handler) {
      this.events.get(name)?.delete(handler);
    }
    dispatchEvent(event) {
      for (const handler of this.events.get(event.type) ?? []) handler(event);
    }
    emit(type) {
      this.dispatchEvent(new Event(type));
    }
    setAttribute(name, value) {
      this.attrs.set(name, String(value));
    }
    getAttribute(name) {
      return this.attrs.get(name) ?? null;
    }
    append(child) {
      this.children.push(child);
      child.parent = this;
    }
    remove() {
      this.parent.children = this.parent.children.filter(
        (child) => child !== this,
      );
    }
    closest() {
      return building;
    }
    matches() {
      return false;
    }
    querySelector() {
      return option;
    }
    getContext() {
      const node = this;
      return {
        clearRect() {
          if (node.className === 'life-resident')
            paints.push({ time: now, hour: Number(house.dataset.hour) });
        },
        save() {},
        restore() {},
        scale() {},
        translate() {},
        rotate() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        closePath() {},
        clip() {},
        rect() {},
        arc() {},
        fill() {},
        fillRect() {},
        drawImage() {},
        createRadialGradient() {
          return { addColorStop() {} };
        },
      };
    }
  }
  const building = new Element(),
    house = new Element(),
    option = new Element();
  house.dataset.hour = night ? '21' : '12';
  const root = new Element();
  root.dataset.theme = night ? 'dark' : 'light';
  root.lang = 'ja';
  const nodes = {
    '.building': building,
    '#building-scene': house,
    '#building-source': new Element(),
    '#season-select': new Element(),
    '#life-pause': new Element(),
    '#sky-toggle': new Element(),
    '#sky-name': new Element(),
    '#sky-action': new Element(),
    '#time-status': new Element(),
    'meta[name="theme-color"]': new Element(),
  };
  const document = new Element();
  document.documentElement = root;
  document.hidden = false;
  document.querySelector = (selector) => nodes[selector] ?? null;
  document.querySelectorAll = () => [];
  document.createElement = () => new Element();
  const window = new Element();
  window.IntersectionObserver = true;
  const motion = new Element();
  motion.matches = reduced;
  const system = new Element();
  system.matches = false;
  const saved = new Map([
    ['one-roof-life-paused', String(paused)],
    ['morimizu-theme', night ? 'dark' : 'light'],
  ]);
  const context = vm.createContext({
    POSES,
    planFrom,
    sample,
    seasonForMonth,
    document,
    window,
    Event,
    matchMedia: (query) => (query.includes('color-scheme') ? system : motion),
    localStorage: {
      getItem: (key) => saved.get(key) ?? null,
      setItem: (key, value) => saved.set(key, String(value)),
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    IntersectionObserver: class {
      constructor(callback) {
        this.callback = callback;
        this.disconnected = false;
        observers.push(this);
      }
      observe() {}
      disconnect() {
        this.disconnected = true;
      }
      deliver(isIntersecting) {
        this.callback([{ isIntersecting }]);
      }
    },
    performance: { now: () => now },
    requestAnimationFrame(callback) {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
  });
  vm.runInContext(
    sceneSource +
      '\n' +
      lifeSource +
      '\nwindow.stopScene=initializeRoofScene();window.stopLife=initializeRoofLife();',
    context,
  );
  // Allow the image-readiness promise to complete without advancing the fake clock.
  await new Promise((resolve) => setImmediate(resolve));
  function advance(milliseconds) {
    const end = now + milliseconds;
    while (now < end) {
      now = Math.min(end, now + 16);
      const ready = [...frames.values()];
      frames.clear();
      for (const callback of ready) callback(now);
    }
  }
  return {
    paints,
    building,
    house,
    motion,
    document,
    window,
    frames,
    observers,
    advance,
    clickPause() {
      nodes['#life-pause'].emit('click');
    },
    clickSky() {
      nodes['#sky-toggle'].emit('click');
    },
    season(value) {
      nodes['#season-select'].value = value;
      nodes['#season-select'].emit('change');
    },
    setReduced(value, emit = true) {
      motion.matches = value;
      if (emit) motion.emit('change');
    },
    hide() {
      document.hidden = true;
      document.emit('visibilitychange');
    },
    show() {
      document.hidden = false;
      document.emit('visibilitychange');
    },
    cleanup() {
      window.stopLife();
      window.stopScene();
    },
    pose() {
      return [
        building.dataset.life,
        building.dataset.residentOpacity,
        building.dataset.residentX,
        building.dataset.residentY,
      ];
    },
  };
}

void test('a saved pause paints once and schedules no idle frame or repaint', async () => {
  const app = await fixture({ paused: true });
  assert.equal(app.paints.length, 1);
  assert.equal(app.frames.size, 0);
  app.advance(60_000);
  assert.equal(app.paints.length, 1);
  assert.equal(app.frames.size, 0);
  app.cleanup();
});

void test('reduced motion has no idle frames for either static day or static night', async () => {
  for (const night of [false, true]) {
    const app = await fixture({ reduced: true, night });
    assert.equal(app.building.dataset.life, night ? 'sleep' : 'work');
    assert.equal(app.frames.size, 0);
    const count = app.paints.length;
    app.advance(60_000);
    assert.equal(app.paints.length, count);
    app.season('winter');
    app.advance(16);
    assert.equal(app.building.dataset.season, 'winter');
    assert.equal(app.paints.length, count + 1);
    assert.equal(app.frames.size, 0);
    app.cleanup();
  }
});

void test('pause freezes the current pose, idles after its final paint, and Play resumes one loop', async () => {
  const app = await fixture();
  app.advance(16_000);
  const before = app.pose();
  app.clickPause();
  app.advance(16);
  const pose = app.pose();
  assert.equal(pose[0], before[0]);
  assert.equal(app.frames.size, 0);
  const count = app.paints.length;
  app.advance(60_000);
  assert.equal(app.paints.length, count);
  assert.deepEqual(app.pose(), pose);
  app.clickPause();
  assert.equal(app.frames.size, 1);
  app.advance(1000);
  assert.equal(app.frames.size, 1);
  assert.ok(app.paints.length > count);
  app.cleanup();
  assert.equal(app.frames.size, 0);
});

void test('a paused resident follows the entire one-second sky lighting transition then idles', async () => {
  const app = await fixture({ paused: true });
  const pose = app.pose();
  app.clickSky();
  app.advance(500);
  assert.ok(app.paints.some(({ hour }) => hour > 12 && hour < 21));
  assert.deepEqual(
    app.pose(),
    pose,
    'Lighting must not restart the paused choreography',
  );
  app.advance(516);
  assert.equal(
    app.paints.at(-1).hour,
    21,
    'The final life layer must receive the finished night lighting',
  );
  assert.equal(app.frames.size, 0);
  const count = app.paints.length;
  app.advance(60_000);
  assert.equal(app.paints.length, count);
  app.clickSky();
  app.advance(1016);
  assert.equal(app.paints.at(-1).hour, 12);
  assert.equal(app.frames.size, 0);
  app.cleanup();
});

void test('reduced-motion sky changes repaint the requested sleep/work endpoint and stop', async () => {
  const app = await fixture({ reduced: true });
  app.clickSky();
  app.advance(16);
  assert.equal(app.building.dataset.life, 'sleep');
  assert.equal(app.paints.at(-1).hour, 21);
  assert.equal(app.frames.size, 0);
  app.clickSky();
  app.advance(16);
  assert.equal(app.building.dataset.life, 'work');
  assert.equal(app.paints.at(-1).hour, 12);
  assert.equal(app.frames.size, 0);
  app.cleanup();
});

void test('a paused season change keeps its short crossfade, paints the endpoint, and stops', async () => {
  const app = await fixture({ paused: true });
  const pose = app.pose();
  app.season('winter');
  app.advance(600);
  assert.equal(app.frames.size, 1);
  assert.deepEqual(app.pose(), pose);
  app.advance(800);
  assert.equal(app.frames.size, 0);
  assert.equal(app.building.dataset.season, 'winter');
  const count = app.paints.length;
  app.advance(60_000);
  assert.equal(app.paints.length, count);
  app.cleanup();
});

void test('live reduced motion stops an active loop and changing the preference back wakes it', async () => {
  const app = await fixture();
  app.advance(100);
  // Embedded browsers may update matches before delivering the event.
  app.setReduced(true, false);
  app.advance(16);
  assert.equal(app.frames.size, 0);
  const count = app.paints.length;
  app.advance(60_000);
  assert.equal(app.paints.length, count);
  app.setReduced(false);
  assert.equal(app.frames.size, 1);
  app.advance(100);
  assert.equal(app.frames.size, 1);
  assert.ok(app.paints.length > count);
  app.cleanup();
});

void test('scene redraws and visibility wake one static paint, and cleanup removes every wake path', async () => {
  const app = await fixture({ paused: true });
  let count = app.paints.length;
  app.house.emit('morimizu-scene');
  app.house.emit('morimizu-scene');
  assert.equal(app.frames.size, 1);
  app.advance(16);
  assert.equal(app.paints.length, count + 1);
  assert.equal(app.frames.size, 0);
  app.hide();
  app.house.emit('morimizu-scene');
  assert.equal(app.frames.size, 0);
  app.show();
  app.advance(16);
  assert.equal(app.frames.size, 0);
  app.observers[0].deliver(false);
  app.house.emit('morimizu-scene');
  assert.equal(app.frames.size, 0);
  app.observers[0].deliver(true);
  app.advance(16);
  assert.equal(app.frames.size, 0);
  app.season('winter');
  assert.equal(app.frames.size, 1);
  app.cleanup();
  assert.equal(app.frames.size, 0);
  assert.equal(app.observers[0].disconnected, true);
  count = app.paints.length;
  app.house.emit('morimizu-scene');
  app.show();
  app.clickPause();
  app.clickSky();
  app.advance(60_000);
  assert.equal(app.frames.size, 0);
  assert.equal(app.paints.length, count);
});
