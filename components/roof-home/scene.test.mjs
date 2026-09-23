import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import vm from 'node:vm';

const source =
  fs
    .readFileSync(path.join(__dirname, 'scene.js'), 'utf8')
    .replace(
      'export function initializeRoofScene()',
      'function initializeRoofScene()',
    ) + '\nwindow.cleanup=initializeRoofScene();';

// Exercise the production event handlers and observable DOM/storage state.
// Raster generation stays unloaded; the browser review covers rendered pixels.
function setup({
  saved = {},
  reduceMotion = false,
  storageUnavailable = false,
  hidden = false,
  raster = null,
  rasterWidth = null,
  innerPage = false,
} = {}) {
  const gradedLayers = [];
  const context = {
    clearRect() {},
    save() {},
    restore() {},
    scale() {},
    beginPath() {},
    arc() {},
    rect() {},
    clip() {},
    fill() {},
    fillRect() {},
    drawImage() {},
    createRadialGradient() {
      return { addColorStop() {} };
    },
    getImageData() {
      return { data: new Uint8ClampedArray(raster) };
    },
    putImageData(image) {
      gradedLayers.push(new Uint8ClampedArray(image.data));
    },
  };
  class Element {
    constructor() {
      this.attrs = new Map();
      this.dataset = {};
      this.style = {
        setProperty(name, value) {
          this[name] = value;
        },
      };
      this.events = new Map();
      this.textContent = '';
    }
    setAttribute(name, value) {
      this.attrs.set(name, String(value));
    }
    getAttribute(name) {
      return this.attrs.get(name) ?? null;
    }
    addEventListener(name, handler) {
      if (!this.events.has(name)) this.events.set(name, []);
      this.events.get(name).push(handler);
    }
    removeEventListener(name, handler) {
      this.events.set(
        name,
        (this.events.get(name) || []).filter((item) => item !== handler),
      );
    }
    dispatchEvent(event) {
      this.dispatch(event.type);
    }
    dispatch(name) {
      for (const handler of this.events.get(name) ?? [])
        handler({ target: this });
    }
    getContext() {
      return context;
    }
    closest() {
      return { classList: { add() {}, remove() {} } };
    }
    matches() {
      return false;
    }
  }
  const nodes = Object.fromEntries(
    [
      '#building-source',
      '#building-scene',
      '#time-status',
      '#sky-toggle',
      '#sky-name',
      '#sky-action',
      'meta[name="theme-color"]',
    ].map((selector) => [selector, new Element()]),
  );
  nodes['#building-source'].complete = Boolean(raster);
  nodes['#building-source'].naturalWidth = raster
    ? (rasterWidth ?? raster.length / 4)
    : 0;
  nodes['#building-source'].naturalHeight = raster
    ? raster.length / 4 / nodes['#building-source'].naturalWidth
    : 0;
  const root = new Element();
  const document = new Element();
  document.hidden = hidden;
  document.documentElement = root;
  document.querySelector = (selector) => {
    if (
      ['#bedroom-source', '#library-source', '#workspace-source'].includes(
        selector,
      )
    )
      return null;
    if (innerPage && ['#building-source', '#building-scene'].includes(selector))
      return null;
    assert.ok(nodes[selector], `Unexpected selector: ${selector}`);
    return nodes[selector];
  };
  document.querySelectorAll = (selector) => {
    assert.equal(selector, '.room');
    return [];
  };
  document.createElement = (tag) => {
    assert.equal(tag, 'canvas');
    return new Element();
  };
  const fakeWindow = new Element();
  const system = new Element();
  system.matches = false;
  const media = new Element();
  media.matches = reduceMotion;
  const stored = new Map(Object.entries(saved));
  const localStorage = {
    getItem(key) {
      if (storageUnavailable) throw new Error('Storage blocked');
      return stored.get(key) ?? null;
    },
    setItem(key, value) {
      if (storageUnavailable) throw new Error('Storage blocked');
      stored.set(key, String(value));
    },
  };
  let now = 0,
    id = 0;
  const callbacks = new Map();
  vm.runInNewContext(
    source,
    {
      document,
      localStorage,
      window: fakeWindow,
      Event,
      MutationObserver: class {
        observe() {}
        disconnect() {}
      },
      matchMedia: (query) => (query.includes('color-scheme') ? system : media),
      ImageData: class {
        constructor(width, height) {
          this.data = new Uint8ClampedArray(width * height * 4);
        }
      },
      performance: { now: () => now },
      requestAnimationFrame(callback) {
        callbacks.set(++id, callback);
        return id;
      },
      cancelAnimationFrame(key) {
        callbacks.delete(key);
      },
    },
    { filename: 'scene.js' },
  );
  function advance(milliseconds) {
    const end = now + milliseconds;
    while (now < end) {
      now = Math.min(end, now + 16);
      const pending = [...callbacks.values()];
      callbacks.clear();
      for (const callback of pending) callback(now);
    }
  }
  return {
    nodes,
    root,
    stored,
    media,
    document,
    advance,
    gradedLayers,
    window: fakeWindow,
    system,
    cleanup: () => fakeWindow.cleanup(),
    click: () => nodes['#sky-toggle'].dispatch('click'),
    hour: () => Number(nodes['#building-scene'].dataset.hour),
    sun: () => Number(nodes['#building-scene'].dataset.sun),
    rgb: (name) => root.style[name].match(/\d+/g).map(Number),
    checked: () => nodes['#sky-toggle'].getAttribute('aria-checked'),
    pending: () => callbacks.size,
    reduce() {
      media.matches = true;
      media.dispatch('change');
    },
    hide() {
      document.hidden = true;
      document.dispatch('visibilitychange');
    },
    show() {
      document.hidden = false;
      document.dispatch('visibilitychange');
    },
  };
}

void test('day → night moves continuously and saves the completed endpoint', () => {
  const app = setup();
  assert.equal(app.hour(), 12);
  assert.equal(app.checked(), 'false');
  app.click();
  assert.equal(app.checked(), 'true');
  assert.equal(app.hour(), 12);
  app.advance(500);
  assert.ok(app.hour() > 15 && app.hour() < 18);
  app.advance(500);
  assert.equal(app.hour(), 21);
  assert.equal(app.root.dataset.time, 'night');
  assert.equal(app.stored.get('one-roof-sky'), 'night');
  assert.equal(app.stored.get('one-roof-hour'), '21');
  assert.equal(app.pending(), 0);
});

void test('night → day begins sunrise within 50 ms while light changes continuously', () => {
  const app = setup({ saved: { 'one-roof-sky': 'night' } });
  assert.equal(app.hour(), 21);
  assert.ok(app.sun() > 1, 'The sun starts below the horizon at night');
  const initialBackground = app.rgb('--bg');
  app.click();
  app.advance(50);
  assert.ok(
    app.sun() > 0.035 && app.sun() < 0.15,
    `Expected the sun visibly above the eastern horizon, got phase ${app.sun()}`,
  );
  assert.ok(
    app.hour() < 21 && app.hour() > 20,
    'Dawn should start responding without skipping to full daylight',
  );
  assert.notDeepEqual(app.rgb('--bg'), initialBackground);
  app.advance(450);
  assert.ok(app.hour() > 15 && app.hour() < 18);
  assert.ok(app.sun() > 0.25 && app.sun() < 0.45);
  app.advance(500);
  assert.equal(app.hour(), 12);
  assert.equal(app.sun(), 0.5);
  assert.equal(app.checked(), 'false');
  assert.equal(app.stored.get('one-roof-sky'), 'day');
  assert.equal(app.pending(), 0);
});

void test('an interrupted sunset reverses from its current position', () => {
  const app = setup();
  app.click();
  app.advance(250);
  const interrupted = app.hour();
  const interruptedSun = app.sun();
  const interruptedInk = app.rgb('--ink');
  app.click();
  assert.equal(
    app.hour(),
    interrupted,
    'Toggling must not jump the rendered time',
  );
  assert.equal(app.sun(), interruptedSun, 'Toggling must not jump the sun');
  assert.deepEqual(
    app.rgb('--ink'),
    interruptedInk,
    'Toggling must not jump text color',
  );
  assert.equal(app.checked(), 'false');
  app.advance(250);
  assert.ok(app.hour() < interrupted && app.hour() > 12);
  app.advance(750);
  assert.equal(app.hour(), 12);
  assert.equal(app.pending(), 0);
});

void test('rapid repeated toggles cancel old frames and settle at the last choice', () => {
  const app = setup();
  for (let i = 0; i < 9; i++) {
    const before = app.hour();
    const beforeSun = app.sun();
    app.click();
    assert.equal(app.hour(), before);
    assert.equal(app.sun(), beforeSun);
    assert.equal(
      app.pending(),
      1,
      'Only one sky animation may remain scheduled',
    );
    app.advance(130);
  }
  app.advance(1000);
  assert.equal(app.hour(), 21);
  assert.equal(app.checked(), 'true');
  assert.equal(app.pending(), 0);
});

void test('text, background, borders, and light intensity change continuously in both directions', () => {
  const app = setup();
  const colors = ['--ink', '--bg', '--line', '--muted'];
  for (const direction of ['night', 'day']) {
    app.click();
    let previousColors = colors.map((name) => app.rgb(name));
    let previousLight = Number(app.root.style['--night-strength']);
    const inks = new Set();
    // Sample the shorter curve densely to detect threshold-based color flips.
    for (let elapsed = 0; elapsed < 1000; elapsed += 1) {
      app.advance(1);
      const currentColors = colors.map((name) => app.rgb(name));
      currentColors.forEach((channels, colorIndex) => {
        channels.forEach((channel, channelIndex) => {
          assert.ok(
            Math.abs(channel - previousColors[colorIndex][channelIndex]) <= 2,
            `${direction} ${colors[colorIndex]} must not jump at ${elapsed} ms`,
          );
        });
      });
      const light = Number(app.root.style['--night-strength']);
      assert.ok(
        Math.abs(light - previousLight) < 0.01,
        `${direction} lighting must not switch abruptly at ${elapsed} ms`,
      );
      inks.add(app.root.style['--ink']);
      previousColors = currentColors;
      previousLight = light;
    }
    assert.ok(
      inks.size > 100,
      'Text must interpolate through intermediate colors rather than flip',
    );
    assert.equal(app.hour(), direction === 'night' ? 21 : 12);
  }
});

void test('reversing an early sunrise keeps the current sun and lighting until the next frame', () => {
  const app = setup({ saved: { 'one-roof-sky': 'night' } });
  app.click();
  app.advance(50);
  const sun = app.sun(),
    hour = app.hour(),
    background = app.rgb('--bg');
  app.click();
  assert.equal(app.sun(), sun);
  assert.equal(app.hour(), hour);
  assert.deepEqual(app.rgb('--bg'), background);
  app.advance(150);
  assert.ok(
    app.sun() < sun,
    'An interrupted sunrise should return toward its horizon',
  );
  app.advance(850);
  assert.equal(app.hour(), 21);
  assert.ok(
    app.sun() < 0 || app.sun() > 1,
    'The sun must finish below a horizon at night',
  );
  assert.equal(app.pending(), 0);
});

void test('reduced motion selects endpoints immediately in either direction', () => {
  const app = setup({ reduceMotion: true });
  app.click();
  assert.equal(app.hour(), 21);
  assert.equal(app.pending(), 0);
  app.click();
  assert.equal(app.hour(), 12);
  assert.equal(app.pending(), 0);
});

void test('enabling reduced motion during a transition completes its chosen endpoint', () => {
  const app = setup();
  app.click();
  app.advance(900);
  app.reduce();
  assert.equal(app.hour(), 21);
  assert.equal(app.checked(), 'true');
  assert.equal(app.pending(), 0);
  assert.equal(app.stored.get('one-roof-sky'), 'night');
});

void test('hiding the tab completes sunset and sunrise without stale callbacks', () => {
  const app = setup();
  app.click();
  app.advance(300);
  app.hide();
  assert.equal(app.hour(), 21);
  assert.equal(app.pending(), 0);
  app.document.hidden = false;
  app.click();
  app.advance(900);
  app.hide();
  assert.equal(app.hour(), 12);
  assert.equal(app.checked(), 'false');
  assert.equal(app.pending(), 0);
  app.advance(6000);
  assert.equal(app.hour(), 12);
});

void test('saved state wins over legacy time and legacy night values still restore', () => {
  assert.equal(
    setup({ saved: { 'one-roof-sky': 'day', 'one-roof-hour': '21' } }).hour(),
    12,
  );
  assert.equal(
    setup({ saved: { 'one-roof-sky': 'night', 'one-roof-hour': '12' } }).hour(),
    21,
  );
  assert.equal(setup({ saved: { 'one-roof-hour': '22.5' } }).hour(), 21);
  assert.equal(setup({ saved: { 'one-roof-hour': '4' } }).hour(), 21);
  assert.equal(setup({ saved: { 'one-roof-hour': '13' } }).hour(), 12);
});

void test('unavailable local storage does not prevent switching', () => {
  const app = setup({ storageUnavailable: true, reduceMotion: true });
  assert.equal(app.hour(), 12);
  app.click();
  assert.equal(app.hour(), 21);
});

void test('sunrise and sunset cover equal distances at equal elapsed times', () => {
  const sunset = setup();
  const sunrise = setup({ saved: { 'one-roof-sky': 'night' } });
  sunset.click();
  sunrise.click();
  // Observe the first painted positions after both controls respond.
  sunset.advance(16);
  sunrise.advance(16);
  const startDown = sunset.sun(),
    startUp = sunrise.sun();
  for (let elapsed = 16; elapsed < 1000; elapsed += 16) {
    sunset.advance(16);
    sunrise.advance(16);
    const downTravel = sunset.sun() - startDown;
    const upTravel = sunrise.sun() - startUp;
    assert.ok(
      Math.abs(downTravel - upTravel) < 0.0003,
      `Sun motion differs at ${elapsed + 16} ms: ${downTravel} vs ${upTravel}`,
    );
  }
  assert.equal(sunset.sun(), 1.008);
  assert.equal(sunrise.sun(), 0.5);
  assert.equal(sunset.pending(), 0);
  assert.equal(sunrise.pending(), 0);
});

void test('the editorial palette uses warm paper and slate, and restores after a complete cycle', () => {
  const app = setup({ reduceMotion: true });
  assert.deepEqual(app.rgb('--bg'), [245, 243, 235]);
  assert.deepEqual(app.rgb('--ink'), [20, 44, 53]);
  const paperBorder = app.rgb('--line');
  assert.ok(
    paperBorder[0] > 175,
    'Dividers should remain lighter than body text',
  );
  app.click();
  assert.deepEqual(app.rgb('--bg'), [20, 37, 47]);
  assert.deepEqual(app.rgb('--ink'), [245, 243, 235]);
  app.click();
  assert.deepEqual(app.rgb('--bg'), [245, 243, 235]);
  assert.deepEqual(app.rgb('--ink'), [20, 44, 53]);
  assert.deepEqual(app.rgb('--line'), paperBorder);
});

void test('relighting preserves transparent surroundings and partial alpha in every light state', () => {
  const app = setup({
    raster: [
      255, 255, 255, 0, 240, 235, 220, 32, 210, 207, 191, 254, 36, 48, 51, 255,
    ],
  });
  assert.equal(app.gradedLayers.length, 7);
  for (const layer of app.gradedLayers) {
    assert.deepEqual(
      [layer[3], layer[7], layer[11], layer[15]],
      [0, 32, 254, 255],
    );
  }
  assert.equal(app.nodes['#building-scene'].width, 4);
  assert.equal(app.nodes['#building-scene'].height, 1);
});

void test('window sky reveals the background while frames and outdoor foliage remain intact', () => {
  const width = 730,
    height = 1100,
    raster = new Uint8ClampedArray(width * height * 4);
  const offset = (x, y) => (y * width + x) * 4;
  const put = (x, y, rgba) => raster.set(rgba, offset(x, y));
  const skies = [
    [550, 340],
    [560, 930],
    [650, 930],
  ];
  for (const [x, y] of skies) put(x, y, [185, 223, 250, 255]);
  put(540, 951, [139, 168, 118, 255]); // Outdoor leaves in the left pane.
  put(540, 1000, [139, 168, 118, 255]); // Same color under the room's light.
  put(523, 930, [36, 48, 51, 255]); // Window frame outside the opening.
  put(600, 700, [185, 223, 250, 255]); // Blue interior furniture must not be keyed out.
  put(570, 952, [130, 154, 160, 255]); // Mixed leaf/sky edge retains partial coverage.
  const app = setup({ raster, rasterWidth: width });
  for (const layer of app.gradedLayers) {
    for (const [x, y] of skies)
      assert.equal(
        layer[offset(x, y) + 3],
        0,
        'The sky must be transparent at every time',
      );
    for (const [x, y] of [
      [540, 951],
      [523, 930],
      [600, 700],
    ])
      assert.equal(layer[offset(x, y) + 3], 255);
    assert.ok(
      layer[offset(570, 952) + 3] > 0 && layer[offset(570, 952) + 3] < 255,
      'Leaf edges retain soft coverage',
    );
  }
  const night = app.gradedLayers[5],
    day = app.gradedLayers[3];
  assert.ok(
    night[offset(540, 951) + 1] < night[offset(540, 1000) + 1] * 0.5,
    'Outdoor foliage must not receive room lighting',
  );
  assert.equal(
    day[offset(540, 951) + 1],
    168,
    'Daytime foliage keeps its original color',
  );
});

void test('inner pages preserve and switch the shared theme without loading a house canvas', () => {
  const app = setup({
    innerPage: true,
    saved: { 'one-roof-sky': 'night' },
    reduceMotion: true,
  });
  assert.deepEqual(app.rgb('--bg'), [20, 37, 47]);
  assert.equal(app.checked(), 'true');
  app.click();
  assert.deepEqual(app.rgb('--bg'), [245, 243, 235]);
  assert.equal(app.stored.get('one-roof-sky'), 'day');
  assert.equal(app.gradedLayers.length, 0);
});

for (const innerPage of [false, true]) {
  void test(`${innerPage ? 'inner pages' : 'home'} complete both theme directions at 1000 ms, not before`, () => {
    const app = setup({ innerPage });
    for (const [state, expectedBackground] of [
      ['night', [20, 37, 47]],
      ['day', [245, 243, 235]],
    ]) {
      const before = app.rgb('--bg');
      const previousSavedState = app.stored.get('one-roof-sky');
      app.click();
      app.advance(500);
      assert.notDeepEqual(
        app.rgb('--bg'),
        before,
        'The transition responds before completion',
      );
      assert.notDeepEqual(
        app.rgb('--bg'),
        expectedBackground,
        'The midpoint remains an intermediate color',
      );
      app.advance(499);
      assert.equal(app.pending(), 1, 'The animation is still active at 999 ms');
      assert.equal(
        app.stored.get('one-roof-sky'),
        previousSavedState,
        'No completed endpoint is saved early',
      );
      app.advance(1);
      assert.equal(app.pending(), 0, 'The animation completes at 1000 ms');
      assert.deepEqual(app.rgb('--bg'), expectedBackground);
      assert.equal(app.stored.get('one-roof-sky'), state);
    }
  });
}

void test('the existing production theme preference wins over prototype preferences', () => {
  const app = setup({
    saved: { 'morimizu-theme': 'light', 'one-roof-sky': 'night' },
  });
  assert.equal(app.hour(), 12);
  app.click();
  app.advance(1000);
  assert.equal(app.root.dataset.theme, 'dark');
  assert.equal(app.stored.get('morimizu-theme'), 'dark');
});

void test('storage and operating system changes update the same sky controller', () => {
  const app = setup();
  app.system.matches = true;
  app.system.dispatch('change');
  app.advance(1000);
  assert.equal(app.hour(), 21);
  assert.equal(app.stored.has('morimizu-theme'), false);
  app.system.matches = false;
  app.system.dispatch('change');
  app.advance(1000);
  assert.equal(app.hour(), 12);
  app.stored.set('morimizu-theme', 'dark');
  app.window.dispatch('storage');
  app.advance(1000);
  assert.equal(app.hour(), 21);
  app.stored.set('morimizu-theme', 'light');
  app.window.dispatch('storage');
  app.advance(1000);
  assert.equal(app.hour(), 12);
});

void test('unmount cancels frames and removes the header handlers before remount', () => {
  const app = setup();
  app.click();
  app.advance(200);
  app.cleanup();
  const hour = app.hour();
  assert.equal(app.pending(), 0);
  app.click();
  app.advance(2000);
  assert.equal(app.hour(), hour);
});
