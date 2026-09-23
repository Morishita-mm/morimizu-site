import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source =
  readFileSync(
    fileURLToPath(new URL('./reveal.js', import.meta.url)),
    'utf8',
  ).replace(
    'export function initializeScrollReveal()',
    'function initializeScrollReveal()',
  ) +
  '\nwindow.mount = initializeScrollReveal; window.cleanup = window.mount();';

function fixture(
  specs,
  { reduced = false, intersection = true, animation = true } = {},
) {
  class Events {
    constructor() {
      this.listeners = new Map();
    }
    addEventListener(type, listener) {
      if (!this.listeners.has(type)) this.listeners.set(type, []);
      this.listeners.get(type).push(listener);
    }
    removeEventListener(type, listener) {
      this.listeners.set(
        type,
        (this.listeners.get(type) || []).filter((value) => value !== listener),
      );
    }
    emit(type, detail = {}) {
      const event = { type, target: this, ...detail };
      for (const listener of this.listeners.get(type) || []) listener(event);
    }
  }
  class Element extends Events {
    constructor({
      id,
      top = 900,
      height = 150,
      hidden = false,
      classes = [],
    } = {}) {
      super();
      Object.assign(this, {
        id,
        top,
        height,
        hidden,
        classes,
        parentElement: null,
        style: {},
        animations: [],
        isConnected: true,
      });
    }
    contains(node) {
      for (; node; node = node.parentElement) if (node === this) return true;
      return false;
    }
    matches(selector) {
      return selector.split(',').some((value) => {
        value = value.trim();
        if (value === '[hidden]') return this.hidden;
        if (value.startsWith('.')) return this.classes.includes(value.slice(1));
        if (value.startsWith('#')) return this.id === value.slice(1);
        return false;
      });
    }
    closest(selector) {
      for (let node = this; node; node = node.parentElement)
        if (node.matches(selector)) return node;
      return null;
    }
    getBoundingClientRect() {
      if (this.closest('[hidden]'))
        return { top: 0, bottom: 0, width: 0, height: 0 };
      return {
        top: this.top,
        bottom: this.top + this.height,
        width: 500,
        height: this.height,
      };
    }
    animate(frames, options) {
      const effect = {
        frames: JSON.parse(JSON.stringify(frames)),
        options: { ...options },
        cancelled: false,
        cancel() {
          this.cancelled = true;
        },
        finish() {
          this.onfinish?.();
        },
      };
      this.animations.push(effect);
      return effect;
    }
  }
  if (!animation) delete Element.prototype.animate;
  const nodes = Object.fromEntries(
    specs.map((spec) => [spec.id, new Element(spec)]),
  );
  for (const spec of specs)
    if (spec.parent) nodes[spec.id].parentElement = nodes[spec.parent];
  const document = new Events();
  document.activeElement = null;
  document.querySelectorAll = () =>
    Object.values(nodes).filter((node) => node.isConnected);
  document.body = new Element({ id: 'body', top: 0 });
  document.querySelector = () => document.body;
  document.getElementById = (id) => nodes[id] || null;
  const window = new Events();
  const motion = new Events();
  motion.matches = reduced;
  const observers = [];
  class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.observed = new Set();
      this.disconnected = false;
      observers.push(this);
    }
    observe(node) {
      this.observed.add(node);
    }
    unobserve(node) {
      this.observed.delete(node);
    }
    disconnect() {
      this.disconnected = true;
      this.observed.clear();
    }
    deliver(node, isIntersecting = true) {
      // An already queued callback can arrive after unobserve/disconnect.
      this.callback([
        {
          target: node,
          isIntersecting,
          boundingClientRect: node.getBoundingClientRect(),
        },
      ]);
    }
  }
  if (intersection) window.IntersectionObserver = IntersectionObserver;
  const mutations = [];
  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      mutations.push(this);
    }
    observe(target, options) {
      this.target = target;
      this.options = options;
    }
    disconnect() {
      this.disconnected = true;
    }
    deliver() {
      this.callback([]);
    }
  }
  const frames = new Map();
  let frameId = 0;
  const location = { hash: '' };
  vm.runInNewContext(source, {
    Element,
    document,
    window,
    location,
    IntersectionObserver,
    MutationObserver,
    innerHeight: 800,
    matchMedia: () => motion,
    requestAnimationFrame: (callback) => {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  return {
    nodes,
    document,
    window,
    motion,
    location,
    observers,
    mutations,
    Element,
    frames,
    cleanup() {
      window.cleanup?.();
    },
    remount() {
      window.cleanup = window.mount();
    },
    mutate() {
      mutations.at(-1)?.deliver();
    },
    flush() {
      const callbacks = [...frames.values()];
      frames.clear();
      for (const callback of callbacks) callback();
    },
    add(spec) {
      const node = new Element(spec);
      nodes[spec.id] = node;
      if (spec.parent) node.parentElement = nodes[spec.parent];
      return node;
    },
    enter(id) {
      observers.at(-1)?.deliver(nodes[id]);
    },
    changeMotion(matches) {
      motion.matches = matches;
      motion.emit('change', { matches });
    },
  };
}

void test('only initially below-viewport content enters, once, with a 380ms opacity and translation effect', () => {
  const app = fixture([
    { id: 'above', top: -300 },
    { id: 'visible', top: 40 },
    { id: 'partial', top: 790 },
    { id: 'below', top: 800 },
  ]);
  const observer = app.observers[0];
  assert.deepEqual(
    [...observer.observed].map((node) => node.id),
    ['below'],
  );
  for (const node of Object.values(app.nodes)) {
    assert.equal(node.animations.length, 0);
    assert.deepEqual(
      node.style,
      {},
      'waiting content retains its default visible styling',
    );
    assert.equal(node.hidden, false);
  }
  observer.deliver(app.nodes.below, false);
  assert.equal(app.nodes.below.animations.length, 0);
  app.nodes.below.top = 700;
  app.enter('below');
  const effect = app.nodes.below.animations[0];
  assert.equal(effect.options.duration, 380);
  assert.equal(effect.frames[0].opacity, 0);
  assert.equal(effect.frames.at(-1).opacity, 1);
  assert.notEqual(effect.frames[0].translate, effect.frames.at(-1).translate);
  assert.equal(effect.frames.at(-1).translate, '0 0');
  assert.equal(observer.observed.has(app.nodes.below), false);
  effect.finish();
  app.enter('below');
  assert.equal(
    app.nodes.below.animations.length,
    1,
    'returning to a section does not replay its entrance',
  );
});

void test('a selected wrapper and its selected child never animate together', () => {
  const app = fixture([
    { id: 'chapter' },
    { id: 'child', top: 950, parent: 'chapter' },
  ]);
  assert.deepEqual(
    [...app.observers[0].observed].map((node) => node.id),
    ['chapter'],
  );
  app.enter('chapter');
  app.enter('child');
  assert.equal(app.nodes.chapter.animations.length, 1);
  assert.equal(app.nodes.child.animations.length, 0);
});

for (const [label, options] of Object.entries({
  'reduced motion': { reduced: true },
  'missing IntersectionObserver': { intersection: false },
  'missing native animation': { animation: false },
})) {
  void test(`${label} leaves all content visible without observing or animating it`, () => {
    const app = fixture([{ id: 'chapter' }], options);
    assert.equal(app.observers.length, 0);
    assert.deepEqual(app.nodes.chapter.style, {});
    assert.equal(app.nodes.chapter.hidden, false);
    assert.equal(app.nodes.chapter.animations.length, 0);
  });
}

void test('enabling reduced motion live cancels running effects and prevents queued entrances', () => {
  const app = fixture([{ id: 'active' }, { id: 'pending', top: 1200 }]);
  app.enter('active');
  app.changeMotion(true);
  assert.equal(app.nodes.active.animations[0].cancelled, true);
  app.enter('pending');
  assert.equal(app.nodes.pending.animations.length, 0);
  assert.equal(app.observers[0].disconnected, true);
});

void test('focusing a child exposes its active or pending ancestor without affecting another section', () => {
  const app = fixture([
    { id: 'active' },
    { id: 'other' },
    { id: 'pending', top: 1200 },
  ]);
  app.enter('active');
  app.enter('other');
  const focused = new app.Element();
  focused.parentElement = app.nodes.active;
  app.document.activeElement = focused;
  app.document.emit('focusin', { target: focused });
  assert.equal(app.nodes.active.animations[0].cancelled, true);
  assert.equal(app.nodes.other.animations[0].cancelled, false);
  focused.parentElement = app.nodes.pending;
  app.document.emit('focusin', { target: focused });
  app.enter('pending');
  assert.equal(app.nodes.pending.animations.length, 0);
});

void test('a focused descendant cannot be faded by a queued intersection callback', () => {
  const app = fixture([{ id: 'chapter' }]);
  const focused = new app.Element();
  focused.parentElement = app.nodes.chapter;
  app.document.activeElement = focused;
  app.enter('chapter');
  assert.equal(app.nodes.chapter.animations.length, 0);
});

void test('hash navigation immediately exposes the current viewport and the destination ancestor', () => {
  const app = fixture([
    { id: 'active' },
    { id: 'visible', top: 1100 },
    { id: 'destination', top: 1400 },
    { id: 'offscreen', top: 1800 },
  ]);
  app.enter('active');
  app.nodes.active.top = 100;
  app.nodes.visible.top = 500;
  app.nodes.anchor = new app.Element({ id: 'anchor' });
  app.nodes.anchor.parentElement = app.nodes.destination;
  app.location.hash = '#anchor';
  app.window.emit('hashchange');
  assert.equal(app.nodes.active.animations[0].cancelled, true);
  app.enter('visible');
  app.enter('destination');
  assert.equal(app.nodes.visible.animations.length, 0);
  assert.equal(app.nodes.destination.animations.length, 0);
  app.enter('offscreen');
  assert.equal(app.nodes.offscreen.animations.length, 1);
});

void test('printing cancels every active effect and permanently disables pending entrances', () => {
  const app = fixture([
    { id: 'one' },
    { id: 'two' },
    { id: 'pending', top: 1500 },
  ]);
  app.enter('one');
  app.enter('two');
  app.window.emit('beforeprint');
  for (const id of ['one', 'two'])
    assert.equal(app.nodes[id].animations[0].cancelled, true);
  assert.equal(app.observers[0].disconnected, true);
  app.window.emit('afterprint');
  app.enter('pending');
  assert.equal(app.nodes.pending.animations.length, 0);
  for (const node of Object.values(app.nodes)) {
    assert.deepEqual(node.style, {});
    assert.equal(node.hidden, false);
  }
});

void test('initially hidden notes keep their unused entrance until they become visible', () => {
  const app = fixture([{ id: 'note', top: 1000, hidden: true }]);
  assert.equal(app.nodes.note.getBoundingClientRect().height, 0);
  app.enter('note');
  assert.equal(app.nodes.note.animations.length, 0);
  assert.equal(app.observers[0].observed.has(app.nodes.note), true);
  app.nodes.note.hidden = false;
  app.nodes.note.top = 600;
  app.enter('note');
  assert.equal(app.nodes.note.animations.length, 1);
  app.enter('note');
  assert.equal(app.nodes.note.animations.length, 1);
});

void test('filtering, reset, history, and locale changes show note results immediately without replaying entrances', () => {
  for (const event of [
    'input',
    'change',
    'click',
    'popstate',
    'morimizu-language',
  ]) {
    const app = fixture([
      { id: 'active', classes: ['note-row'] },
      { id: 'newResult', top: 1200, hidden: true, classes: ['note-row'] },
      { id: 'hiddenResult', top: 1400, hidden: true, classes: ['note-row'] },
      { id: 'laterResult', top: 1600, classes: ['note-row'] },
      { id: 'otherSection', top: 1900 },
    ]);
    app.enter('active');
    app.enter('otherSection');
    // Filtering has updated row visibility before its event reaches document.
    app.nodes.active.hidden = true;
    app.nodes.newResult.hidden = false;
    app.nodes.newResult.top = 400;
    if (event === 'popstate' || event === 'morimizu-language') {
      app.window.emit(event);
    } else {
      const control = new app.Element({
        id: event === 'click' ? 'notes-reset' : 'search',
      });
      if (event !== 'click')
        control.parentElement = new app.Element({
          classes: ['notes-controls'],
        });
      app.document.emit(event, { target: control });
    }
    assert.equal(app.nodes.active.animations[0].cancelled, true, event);
    app.enter('newResult');
    assert.equal(app.nodes.newResult.animations.length, 0, event);
    assert.equal(app.nodes.otherSection.animations[0].cancelled, false, event);
    assert.equal(app.nodes.hiddenResult.hidden, true, event);
    app.enter('hiddenResult');
    assert.equal(app.nodes.hiddenResult.animations.length, 0, event);
    app.enter('laterResult');
    assert.equal(app.nodes.laterResult.animations.length, 1, event);
  }
});

void test('Enter commits tag results immediately, while navigation keys leave pending entrances intact', () => {
  const app = fixture([
    { id: 'active', classes: ['note-row'] },
    { id: 'pending', top: 1100, classes: ['note-row'] },
    { id: 'newResult', top: 1400, hidden: true, classes: ['note-row'] },
  ]);
  const input = new app.Element({ id: 'note-tag-search' });
  input.parentElement = new app.Element({ classes: ['notes-controls'] });
  app.enter('active');
  app.nodes.pending.top = 600;
  for (const key of ['ArrowDown', 'ArrowUp', 'Escape']) {
    app.document.emit('keydown', { target: input, key });
    assert.equal(app.nodes.active.animations[0].cancelled, false, key);
    assert.equal(app.observers[0].observed.has(app.nodes.pending), true, key);
    assert.equal(app.observers[0].observed.has(app.nodes.newResult), true, key);
  }
  // The tag input commits its selection synchronously before the keydown bubbles.
  app.nodes.newResult.hidden = false;
  app.nodes.newResult.top = 400;
  app.document.emit('keydown', { target: input, key: 'Enter' });
  assert.equal(app.nodes.active.animations[0].cancelled, true);
  for (const id of ['pending', 'newResult']) {
    assert.equal(app.observers[0].observed.has(app.nodes[id]), false, id);
    app.enter(id);
    assert.equal(app.nodes[id].animations.length, 0, id);
  }
});

void test('new React note nodes are registered after DOM commits, without animating visible results', () => {
  const app = fixture([{ id: 'existing', top: 100, classes: ['note-row'] }]);
  const observer = app.observers[0];
  const visible = app.add({
    id: 'visible-result',
    top: 350,
    classes: ['note-row'],
  });
  const later = app.add({
    id: 'later-result',
    top: 1300,
    classes: ['note-row'],
  });
  app.mutate();
  assert.equal(
    observer.observed.has(visible),
    false,
    'New visible results remain immediately readable',
  );
  assert.equal(
    observer.observed.has(later),
    true,
    'New below-screen results retain their entrance',
  );
  app.enter('visible-result');
  assert.equal(visible.animations.length, 0);
  app.enter('later-result');
  assert.equal(later.animations.length, 1);
  app.mutate();
  app.enter('later-result');
  assert.equal(
    later.animations.length,
    1,
    'Mutations never replay an existing node',
  );
});

void test('removed pending React nodes are released and their late observer callbacks stay inert', () => {
  const app = fixture([{ id: 'removed', top: 1200, classes: ['note-row'] }]);
  app.nodes.removed.isConnected = false;
  app.mutate();
  assert.equal(app.observers[0].observed.has(app.nodes.removed), false);
  app.enter('removed');
  assert.equal(app.nodes.removed.animations.length, 0);
});

void test('keyboard tag commits show reused rows after the React commit on the next frame', () => {
  const app = fixture([{ id: 'result', top: 1200, classes: ['note-row'] }]);
  const input = new app.Element();
  input.parentElement = new app.Element({ classes: ['notes-controls'] });
  app.document.emit('keydown', { target: input, key: 'Enter' });
  assert.equal(
    app.observers[0].observed.has(app.nodes.result),
    true,
    'The old location is below the viewport',
  );
  // React commits after the native listener, before its next animation frame.
  app.nodes.result.top = 250;
  app.mutate();
  app.flush();
  app.enter('result');
  assert.equal(
    app.nodes.result.animations.length,
    0,
    'Filtering feedback is immediate rather than an entrance',
  );
});

void test('switching note collection tabs shows committed visible results immediately', () => {
  const app = fixture([{ id: 'result', top: 1200, classes: ['note-row'] }]);
  const tab = new app.Element();
  tab.parentElement = new app.Element({ classes: ['notes-section-tabs'] });
  app.document.emit('click', { target: tab });
  app.nodes.result.top = 200;
  app.flush();
  app.enter('result');
  assert.equal(app.nodes.result.animations.length, 0);
});

void test('React cleanup removes listeners, observers and animations before a fresh remount', () => {
  const app = fixture([{ id: 'active' }, { id: 'pending', top: 1500 }]);
  app.enter('active');
  const old = app.observers[0];
  app.cleanup();
  assert.equal(old.disconnected, true);
  assert.equal(app.mutations[0].disconnected, true);
  assert.equal(app.nodes.active.animations[0].cancelled, true);
  for (const target of [app.document, app.window, app.motion])
    for (const listeners of target.listeners.values())
      assert.equal(listeners.length, 0);
  old.deliver(app.nodes.pending);
  assert.equal(app.nodes.pending.animations.length, 0);
  app.nodes.active.top = 100;
  app.remount();
  assert.equal(app.observers.length, 2);
  assert.equal(app.mutations.length, 2);
  assert.equal(app.motion.listeners.get('change').length, 1);
  assert.equal(app.document.listeners.get('keydown').length, 1);
  app.enter('pending');
  assert.equal(app.nodes.pending.animations.length, 1);
  old.deliver(app.nodes.pending);
  assert.equal(app.nodes.pending.animations.length, 1);
  app.cleanup();
});

void test('queued filter callbacks and queued mutations cannot revive effects after React cleanup', () => {
  const app = fixture([{ id: 'pending', top: 1300, classes: ['note-row'] }]);
  const input = new app.Element();
  input.parentElement = new app.Element({ classes: ['notes-controls'] });
  app.document.emit('input', { target: input });
  assert.equal(app.frames.size, 1);
  app.cleanup();
  assert.equal(app.frames.size, 0);
  const added = app.add({ id: 'after-cleanup', top: 1300 });
  app.mutate();
  app.flush();
  app.enter('after-cleanup');
  app.enter('pending');
  assert.equal(added.animations.length, 0);
  assert.equal(app.nodes.pending.animations.length, 0);
  assert.equal(app.observers[0].observed.size, 0);
});

void test('print and live reduced motion disconnect dynamic registration as well as entrances', () => {
  for (const mode of ['print', 'motion']) {
    const app = fixture([{ id: 'original', top: 1200 }]);
    if (mode === 'print') app.window.emit('beforeprint');
    else app.changeMotion(true);
    assert.equal(app.mutations[0].disconnected, true);
    app.add({ id: 'late', top: 1600 });
    app.mutate();
    app.enter('late');
    assert.equal(app.nodes.late.animations.length, 0);
    assert.equal(app.observers[0].observed.size, 0);
  }
});

void test('history and locale changes show reused note rows after their asynchronous React commit', () => {
  for (const type of ['popstate', 'morimizu-language']) {
    const app = fixture([{ id: 'result', top: 1300, classes: ['note-row'] }]);
    app.window.emit(type);
    app.nodes.result.top = 240;
    app.mutate();
    app.flush();
    app.enter('result');
    assert.equal(
      app.nodes.result.animations.length,
      0,
      type + ' must not fade an already requested result',
    );
  }
});
