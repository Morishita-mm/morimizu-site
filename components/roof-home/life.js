/* Canvas-only rendering from the accepted illustrated-house prototype. */
import { POSES, planFrom, sample, seasonForMonth } from './life-plan.js';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const smooth = (t) => t * t * (3 - 2 * t);

export function initializeRoofLife() {
  let disposed = false,
    observer = null;
  const cleanups = [];
  const listen = (target, type, listener, options) => {
    target.addEventListener(type, listener, options);
    cleanups.push(() => target.removeEventListener(type, listener, options));
  };
  const building = document.querySelector('.building'),
    house = document.querySelector('#building-scene');
  if (!building || !house) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let motionReduced = reduced.matches;
  const seasonSelect = document.querySelector('#season-select'),
    pause = document.querySelector('#life-pause');
  const assetNodes = [...document.querySelectorAll('[data-life-asset]')];
  const images = Object.fromEntries(
    assetNodes.map((img) => [img.dataset.lifeAsset, img]),
  );
  const canvas = (name, z, scale = 1) => {
    const c = document.createElement('canvas');
    c.width = 1145 * scale;
    c.height = 1374 * scale;
    c.className = name;
    c.setAttribute('aria-hidden', 'true');
    c.style.zIndex = z;
    building.append(c);
    return c;
  };
  const treeCanvas = canvas('life-tree', 0),
    residentCanvas = canvas('life-resident', 2, 2);
  const tc = treeCanvas.getContext('2d'),
    rc = residentCanvas.getContext('2d');
  rc.scale(2, 2);
  rc.imageSmoothingEnabled = true;
  rc.imageSmoothingQuality = 'high';
  const railCanvas = document.createElement('canvas');
  railCanvas.width = 1145;
  railCanvas.height = 1374;
  const railCtx = railCanvas.getContext('2d');
  const crops = {
    spring: [158, 58, 745, 1417],
    summer: [107, 77, 830, 1354],
    autumn: [237, 70, 565, 1416],
    winter: [226, 64, 570, 1416],
    stair: [425, 49, 330, 1206],
    stairDown: [389, 48, 461, 1238],
    work: [190, 114, 644, 1343],
    read: [303, 118, 699, 1126],
    sleep: [69, 204, 1846, 425],
  };
  const sprites = new Map();
  function prepareSprites() {
    for (const [key, crop] of Object.entries({
      'resident-work': crops.work,
      'chair-empty': crops.work,
      'resident-reading': crops.read,
      'resident-stair': crops.stair,
      'resident-stair-down': crops.stairDown,
      'resident-sleep': crops.sleep,
    })) {
      const image = images[key];
      if (!image?.naturalWidth) continue;
      let surface = document.createElement('canvas');
      surface.width = crop[2];
      surface.height = crop[3];
      surface
        .getContext('2d')
        .drawImage(image, ...crop, 0, 0, surface.width, surface.height);
      // Progressive, alpha-preserving reduction avoids sampling gaps in fine
      // hair and clothing outlines when the large sprites appear at house scale.
      while (surface.height > 384) {
        const smaller = document.createElement('canvas');
        smaller.width = Math.ceil(surface.width / 2);
        smaller.height = Math.ceil(surface.height / 2);
        const context = smaller.getContext('2d');
        context.imageSmoothingQuality = 'high';
        context.drawImage(surface, 0, 0, smaller.width, smaller.height);
        surface = smaller;
      }
      sprites.set(key, surface);
    }
  }
  let loaded = false,
    paused = false,
    visible = true,
    last = 0,
    lastPaint = 0,
    elapsed = 0,
    breeze = 0,
    frame = 0;
  let night = document.documentElement.dataset.theme === 'dark';
  let person = { ...POSES[night ? 'sleep' : 'work'], opacity: 1 };
  let routine = planFrom(person, night);
  let seasonChoice = 'auto';
  try {
    seasonChoice = localStorage.getItem('one-roof-season') || 'auto';
    paused = localStorage.getItem('one-roof-life-paused') === 'true';
  } catch {}
  if (!['auto', 'spring', 'summer', 'autumn', 'winter'].includes(seasonChoice))
    seasonChoice = 'auto';
  seasonSelect.value = seasonChoice;
  let season =
      seasonChoice === 'auto'
        ? seasonForMonth(new Date().getMonth())
        : seasonChoice,
    oldSeason = season,
    seasonFade = 1;
  const tr = (ja, en) => (document.documentElement.lang === 'en' ? en : ja);
  function label() {
    pause.textContent = reduced.matches
      ? 'Motion off'
      : paused
        ? 'Play'
        : 'Pause';
    pause.disabled = reduced.matches;
    pause.setAttribute('aria-pressed', String(paused || reduced.matches));
    pause.setAttribute(
      'aria-label',
      reduced.matches
        ? tr(
            '動きを減らす設定に従っています',
            'Following your reduced-motion preference',
          )
        : paused
          ? tr('家のアニメーションを再生', 'Play the house animation')
          : tr('家のアニメーションを一時停止', 'Pause the house animation'),
    );
    seasonSelect.setAttribute(
      'aria-label',
      tr('街路樹の季節', 'Season of the street tree'),
    );
    const option = seasonSelect.querySelector('[value=auto]');
    option.textContent =
      'Auto · ' +
      seasonForMonth(new Date().getMonth()).replace(/^./, (x) =>
        x.toUpperCase(),
      );
  }
  function sourceMask() {
    const image = document.querySelector('#building-source');
    if (!image.complete || !image.naturalWidth) return;
    railCtx.drawImage(image, 0, 0);
    const data = railCtx.getImageData(0, 0, 1145, 1374),
      a = data.data;
    // Extract the original flight rails so the resident stays behind the structure.
    const rails = [
      [
        [263, 942],
        [365, 1088],
        [365, 1145],
        [263, 1004],
      ],
      [
        [263, 933],
        [365, 771],
        [365, 850],
        [263, 1004],
      ],
      [
        [266, 624],
        [365, 758],
        [365, 825],
        [266, 694],
      ],
      [
        [264, 617],
        [365, 474],
        [365, 542],
        [264, 689],
      ],
    ];
    const inside = (x, y, poly) => {
      let yes = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i],
          b = poly[j];
        if (
          a[1] > y != b[1] > y &&
          x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
        )
          yes = !yes;
      }
      return yes;
    };
    for (let y = 0; y < 1374; y++)
      for (let x = 0; x < 1145; x++) {
        const q = (y * 1145 + x) * 4;
        const onRail =
          x >= 260 &&
          x <= 391 &&
          y >= 470 &&
          y <= 1146 &&
          rails.some((poly) => inside(x, y, poly));
        const ink =
          1 - clamp((Math.max(a[q], a[q + 1], a[q + 2]) - 85) / 50, 0, 1);
        a[q + 3] *= onRail ? ink : 0;
      }
    railCtx.putImageData(data, 0, 0);
  }
  function drawAsset(ctx, key, crop, x, y, w, h, opacity = 1) {
    const img = images[key];
    if (!img?.complete || !img.naturalWidth || opacity <= 0) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    const sprite = sprites.get(key);
    if (sprite) ctx.drawImage(sprite, x, y, w, h);
    else ctx.drawImage(img, ...crop, x, y, w, h);
    ctx.restore();
  }
  function drawTree(which, opacity, dark) {
    const c = crops[which],
      h = which === 'summer' ? 452 : 410,
      w = (h * c[2]) / c[3];
    tc.save();
    tc.translate(106, 1182);
    tc.rotate(reduced.matches || paused ? 0 : Math.sin(breeze * 0.53) * 0.007);
    tc.filter = `brightness(${1 - dark * 0.66}) saturate(${1 - dark * 0.25})`;
    drawAsset(tc, 'tree-' + which, c, -w / 2, -h, w, h, opacity);
    tc.restore();
    if (which === 'winter' && dark > 0) {
      // Steady pin lights, never flashing. Coordinates follow the generated tree.
      tc.save();
      tc.globalAlpha = opacity * dark * 0.75;
      tc.fillStyle = '#f5d99a';
      for (const [x, y] of [
        [89, 835],
        [122, 871],
        [76, 918],
        [129, 964],
        [78, 998],
        [125, 1042],
        [91, 1081],
      ]) {
        tc.beginPath();
        tc.arc(x, y, 1.6, 0, Math.PI * 2);
        tc.fill();
      }
      tc.restore();
    }
  }
  function polygon(ctx, points) {
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  }
  function restoreForeground(points) {
    rc.save();
    polygon(rc, points);
    rc.clip();
    rc.drawImage(house, 0, 0);
    rc.restore();
  }
  function drawStair(dark) {
    const high = {
      'stair-one': [318, 1081],
      'stair-two': [314, 902],
      'stair-three': [302, 735],
      'stair-four': [320, 597],
    }[person.id];
    const down = person.stairDirection === 'down';
    const crop = down ? crops.stairDown : crops.stair;
    // Downhill has its own lowered leading leg and weight-bearing rear leg.
    // Map both soles onto the same treads; travel direction never changes the stairs.
    const lower = down ? [321, 1206] : [125, 1193],
      higher = down ? [206, 1042] : [240, 1033];
    const sx = (high[0] - person.x) / (higher[0] - lower[0]),
      sy = (high[1] - person.y) / (higher[1] - lower[1]);
    const mid = (high[0] + person.x) / 2,
      left = person.x - 50,
      right = person.x + 50,
      top = person.y - 170;
    const leftY = person.flip ? high[1] : person.y,
      rightY = person.flip ? person.y : high[1];
    rc.save();
    // The two visible shoe supports sit on measured adjacent treads. Nothing
    // below those treads is drawn, including during a partially transparent fade.
    polygon(rc, [
      [left, top],
      [right, top],
      [right, rightY],
      [mid, rightY],
      [mid, leftY],
      [left, leftY],
    ]);
    rc.clip();
    rc.filter = `brightness(${1 - dark * 0.43})`;
    rc.translate(person.x, person.y);
    rc.scale(sx, sy);
    drawAsset(
      rc,
      down ? 'resident-stair-down' : 'resident-stair',
      crop,
      -lower[0],
      -lower[1],
      crop[2],
      crop[3],
      person.opacity,
    );
    rc.restore();
  }
  function drawWork(dark) {
    const seated = person.pose === 'work';
    const c = crops.work,
      h = 135,
      w = (h * c[2]) / c[3],
      x = 551 - w / 2,
      y = 1030;
    rc.save();
    rc.filter = `brightness(${1 - dark * 0.2})`;
    // The matching empty chair remains solid through the resident's fade.
    // Chair, arms and torso in the occupied sprite are already correctly layered.
    drawAsset(rc, 'chair-empty', c, x, y, w, h);
    if (seated) drawAsset(rc, 'resident-work', c, x, y, w, h, person.opacity);
    rc.restore();
  }
  function drawReading(dark) {
    const c = crops.read,
      h = 111,
      w = (h * c[2]) / c[3];
    rc.save();
    rc.filter = `brightness(${1 - dark * 0.2})`;
    drawAsset(rc, 'resident-reading', c, 549, 713, w, h, person.opacity);
    // A page gently tilts across the open book every few seconds.
    const cycle = (breeze % 9) / 9,
      turn = cycle > 0.79 ? Math.sin(((cycle - 0.79) / 0.21) * Math.PI) : 0;
    if (!reduced.matches && turn > 0) {
      rc.globalAlpha = person.opacity * 0.65;
      rc.fillStyle = '#f1ecdc';
      polygon(rc, [
        [586, 768],
        [598, 761],
        [598 - turn * 9, 755],
        [586, 767],
      ]);
      rc.fill();
    }
    rc.restore();
    restoreForeground([
      [537, 774],
      [671, 774],
      [671, 783],
      [537, 783],
    ]);
  }
  function drawSleep(dark) {
    const breath = reduced.matches ? 0 : Math.sin(breeze * 1.1) * 0.25;
    rc.save();
    rc.filter = `brightness(${1 - dark * 0.16}) sepia(${dark * 0.18})`;
    // Head, torso, resting arm and occupied duvet are one continuous silhouette.
    // Breathing expands upward from the mattress; the body never moves separately.
    drawAsset(
      rc,
      'resident-sleep',
      crops.sleep,
      487,
      470 - breath,
      197,
      45.4 + breath,
      person.opacity,
    );
    rc.restore();
    // Only the wooden bed front occludes the person. Restoring the empty duvet
    // here would erase their torso and return the old floating-head appearance.
    restoreForeground([
      [464, 522],
      [693, 522],
      [693, 540],
      [464, 540],
    ]);
  }
  function paint() {
    const hour = Number(house.dataset.hour || 12),
      dark =
        hour >= 12
          ? smooth(clamp((hour - 17.8) / 2.7, 0, 1))
          : 1 - smooth(clamp((hour - 5.3) / 2.3, 0, 1));
    tc.clearRect(0, 0, 1145, 1374);
    drawTree(oldSeason, 1 - seasonFade, dark);
    drawTree(season, seasonFade, dark);
    rc.clearRect(0, 0, 1145, 1374);
    drawWork(dark);
    if (person.pose === 'sleep') drawSleep(dark);
    else if (person.pose === 'read') drawReading(dark);
    else if (person.pose === 'stair') drawStair(dark);
    rc.save();
    rc.filter = `brightness(${1 - dark * 0.43})`;
    rc.drawImage(railCanvas, 0, 0);
    rc.restore();
    building.dataset.season = season;
    building.dataset.life = person.id;
    building.dataset.residentOpacity = person.opacity.toFixed(3);
    building.dataset.residentX = person.x.toFixed(1);
    building.dataset.residentY = person.y.toFixed(1);
    building.dataset.stairDirection =
      person.pose === 'stair' ? person.stairDirection || 'up' : 'none';
  }
  function staticPose() {
    person = { ...POSES[night ? 'sleep' : 'work'], opacity: 1 };
  }
  function desiredNight(wakeAnimation = true) {
    const next = document.documentElement.dataset.theme === 'dark';
    if (next === night) return;
    night = next;
    routine = planFrom(person, night);
    elapsed = 0;
    if (reduced.matches) staticPose();
    if (wakeAnimation) wake();
  }
  function syncMotion(wakeAnimation = true) {
    if (motionReduced === reduced.matches) return;
    motionReduced = reduced.matches;
    if (reduced.matches) staticPose();
    routine = planFrom(person, night);
    elapsed = 0;
    label();
    if (wakeAnimation) wake();
  }
  function needsAnimation() {
    return !reduced.matches && (!paused || seasonFade < 1);
  }
  function tick(now) {
    frame = 0;
    if (disposed || !loaded || document.hidden || !visible) {
      last = 0;
      return;
    }
    const delta = last ? Math.min((now - last) / 1000, 0.1) : 0;
    last = now;
    desiredNight(false);
    // Some embedded browsers update the media query before its change event.
    syncMotion(false);
    if (!paused && !reduced.matches) {
      elapsed += delta;
      breeze += delta;
      person = sample(routine, elapsed);
      if (person.done) {
        routine = planFrom(person, night);
        elapsed = 0;
      }
    } else if (reduced.matches) staticPose();
    seasonFade = Math.min(1, seasonFade + (reduced.matches ? 1 : delta / 1.2));
    const animate = needsAnimation();
    // Always paint the static endpoint, even inside the normal paint throttle.
    if (!animate || now - lastPaint > 40) {
      paint();
      lastPaint = now;
    }
    if (animate) frame = requestAnimationFrame(tick);
    else last = 0;
  }
  function wake() {
    if (!disposed && loaded && !frame && !document.hidden && visible) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  }
  listen(seasonSelect, 'change', () => {
    oldSeason = season;
    seasonChoice = seasonSelect.value;
    season =
      seasonChoice === 'auto'
        ? seasonForMonth(new Date().getMonth())
        : seasonChoice;
    seasonFade = reduced.matches ? 1 : 0;
    try {
      localStorage.setItem('one-roof-season', seasonChoice);
    } catch {}
    wake();
  });
  listen(pause, 'click', () => {
    paused = !paused;
    try {
      localStorage.setItem('one-roof-life-paused', String(paused));
    } catch {}
    label();
    wake();
  });
  listen(window, 'morimizu-theme', () => desiredNight());
  // A static resident still follows scene lighting and foreground changes.
  listen(house, 'morimizu-scene', wake);
  listen(reduced, 'change', () => syncMotion());
  listen(document, 'visibilitychange', () => {
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else wake();
  });
  listen(window, 'morimizu-language', label);
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) wake();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(building);
  }
  label();
  const localeObserver = new MutationObserver(label);
  localeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });
  void Promise.all(
    [...assetNodes, document.querySelector('#building-source')].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            listen(img, 'load', resolve, { once: true });
            listen(img, 'error', resolve, { once: true });
          }),
    ),
  ).then(() => {
    if (disposed) return;
    loaded = true;
    prepareSprites();
    sourceMask();
    if (reduced.matches) staticPose();
    paint();
    if (needsAnimation()) wake();
  });
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    localeObserver.disconnect();
    for (const cleanup of cleanups) cleanup();
    treeCanvas.remove();
    residentCanvas.remove();
  };
}
