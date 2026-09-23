export function initializeRoofScene() {
  let disposed = false,
    prepared = false,
    persistSelection = false;
  const cleanups = [];
  const listen = (target, type, listener, options) => {
    target.addEventListener(type, listener, options);
    cleanups.push(() => target.removeEventListener(type, listener, options));
  };
  const t = (ja, en) => (document.documentElement.lang === 'en' ? en : ja);
  // A single source illustration. Only its color and light intensity change.
  const source = document.querySelector('#building-source');
  const canvas =
    document.querySelector('#building-scene') ||
    document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  const status = document.querySelector('#time-status');
  const toggle = document.querySelector('#sky-toggle');
  if (!ctx || !toggle || !status) return () => {};
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const states = [
    { hour: 0, ambient: [0.24, 0.32, 0.39], light: 1, bg: [20, 37, 47] },
    { hour: 5, ambient: [0.24, 0.32, 0.39], light: 1, bg: [20, 37, 47] },
    { hour: 7.5, ambient: [1, 0.94, 0.85], light: 0.1, bg: [238, 228, 207] },
    { hour: 12, ambient: [1, 1, 1], light: 0, bg: [245, 243, 235] },
    {
      hour: 17.5,
      ambient: [0.88, 0.73, 0.62],
      light: 0.5,
      bg: [219, 197, 174],
    },
    { hour: 21, ambient: [0.24, 0.32, 0.39], light: 1, bg: [20, 37, 47] },
    { hour: 24, ambient: [0.24, 0.32, 0.39], light: 1, bg: [20, 37, 47] },
  ];
  const blend = document.createElement('canvas');
  const bc = blend.getContext('2d');
  let currentTime = 12,
    targetTime = 12,
    fromEndpoint = 12,
    frame = 0,
    nightSelected = false,
    layers = [];
  const sunrisePhase = -0.008,
    noonPhase = 0.5,
    sunsetPhase = 1.008;
  let sunPhase = noonPhase,
    fromSun = sunPhase,
    toSun = sunPhase;
  let pointerRoom = null,
    focusRoom = null,
    litRoom = null,
    hoverAmount = 0,
    hoverFrame = 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hourOf = (time) => ((time % 24) + 24) % 24;
  const smooth = (a, b, value) => {
    const t = clamp((value - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const color = (rgb) => `rgb(${rgb.map(Math.round).join(' ')})`;
  const darkness = (hour) =>
    hour < 12 ? 1 - smooth(5.3, 7.6, hour) : smooth(17.8, 20.5, hour);
  function caption(hour) {
    return hour >= 19 ? t('夜モード', 'Night mode') : t('昼モード', 'Day mode');
  }
  function save() {
    try {
      localStorage.setItem('morimizu-theme', nightSelected ? 'dark' : 'light');
      localStorage.setItem('one-roof-sky', nightSelected ? 'night' : 'day');
      localStorage.setItem('one-roof-hour', String(hourOf(currentTime)));
    } catch {}
  }
  function syncToggle() {
    toggle.setAttribute('aria-checked', String(nightSelected));
    document.querySelector('#sky-name').textContent = nightSelected
      ? 'NIGHT'
      : 'DAY';
    document.querySelector('#sky-action').textContent = nightSelected
      ? t('太陽を昇らせる', 'Bring up the sun')
      : t('太陽を沈める', 'Set the sun');
    toggle.setAttribute('aria-label', t('夜の空', 'Night sky'));
    root.dataset.theme = nightSelected ? 'dark' : 'light';
    window.dispatchEvent(new Event('morimizu-theme'));
  }
  // Deterministic stars: positions never jump when the sky changes.
  const stars = Array.from({ length: 96 }, (_, i) => {
    const hash = (n) => {
      const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
      return v - Math.floor(v);
    };
    return {
      x: 38 + hash(i + 1) * 1114,
      y: 18 + hash(i + 131) * 1060,
      r: 0.8 + hash(i + 21) * 1.3,
      alpha: 0.38 + hash(i + 40) * 0.5,
    };
  });
  function drawSky(hour) {
    const dark = darkness(hour);
    ctx.save();
    ctx.scale(canvas.width / 1190, canvas.height / 1322);
    if (dark > 0) {
      for (const star of stars) {
        ctx.fillStyle = `rgba(255,245,216,${dark * star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const progress = sunPhase;
    if (progress >= 0 && progress <= 1) {
      const x = 50 + 1090 * progress,
        y = 1110 - Math.sin(Math.PI * progress) * 1054;
      const opacity =
        smooth(0, 0.035, progress) * (1 - smooth(0.965, 1, progress));
      const low = 1 - Math.sin(Math.PI * progress);
      const glow = ctx.createRadialGradient(x, y, 25, x, y, 92);
      glow.addColorStop(0, `rgba(255,192,85,${opacity * 0.28})`);
      glow.addColorStop(1, 'rgba(255,185,75,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 92, y - 92, 184, 184);
      ctx.fillStyle = `rgba(255,${Math.round(lerp(220, 136, low))},${Math.round(lerp(122, 85, low))},${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, 34, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  function drawSpotlight(hour) {
    const strength = darkness(hour) * hoverAmount;
    if (!litRoom || strength < 0.002) return;
    const y = { about: 415, notes: 712, software: 907 }[litRoom];
    bc.save();
    bc.beginPath();
    bc.rect(775, 262, 277, 903);
    bc.clip();
    bc.globalCompositeOperation = 'screen';
    const pool = bc.createRadialGradient(914, y, 8, 914, y, 160);
    pool.addColorStop(0, `rgba(255,214,130,${strength * 0.45})`);
    pool.addColorStop(0.45, `rgba(255,197,102,${strength * 0.19})`);
    pool.addColorStop(1, 'rgba(255,187,92,0)');
    bc.fillStyle = pool;
    bc.fillRect(754, y - 160, 320, 320);
    bc.restore();
  }
  function draw(time) {
    currentTime = time;
    const hour = hourOf(time);
    let i = states.findIndex(
      (s, index) => index < states.length - 1 && hour <= states[index + 1].hour,
    );
    if (i < 0) i = states.length - 2;
    const a = states[i],
      b = states[i + 1],
      t = (hour - a.hour) / (b.hour - a.hour);
    const bg = a.bg.map((v, j) => lerp(v, b.bg[j], t));
    // Color is continuous; no threshold swaps between black and white.
    // Keep dark lettering through the warm daylight; brighten it as the sky dims.
    const inkMix = smooth(17.2, 20.8, hour);
    const ink = [20, 44, 53].map((v, j) => lerp(v, [245, 243, 235][j], inkMix));
    root.style.setProperty(
      '--transition-edge',
      Math.sin(Math.PI * inkMix) ** 3 * 0.9,
    );
    root.style.setProperty('--bg', color(bg));
    root.style.setProperty('--ink', color(ink));
    root.style.setProperty(
      '--line',
      color(ink.map((v, j) => lerp(v, bg[j], 0.76))),
    );
    root.style.setProperty(
      '--muted',
      color(ink.map((v, j) => lerp(v, bg[j], 0.25))),
    );
    root.style.setProperty('--night-strength', darkness(hour));
    root.style.colorScheme = darkness(hour) > 0.6 ? 'dark' : 'light';
    root.dataset.time =
      hour < 5.5 || hour >= 20
        ? 'night'
        : hour < 10
          ? 'morning'
          : hour < 16
            ? 'day'
            : 'evening';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = color(bg);
    canvas.dataset.hour = hour.toFixed(2);
    canvas.dataset.sun = sunPhase.toFixed(4);
    if (layers.length) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSky(hour);
      bc.clearRect(0, 0, blend.width, blend.height);
      bc.globalAlpha = 1 - t;
      bc.drawImage(layers[i], 0, 0);
      bc.globalCompositeOperation = 'lighter';
      bc.globalAlpha = t;
      bc.drawImage(layers[i + 1], 0, 0);
      bc.globalCompositeOperation = 'source-over';
      bc.globalAlpha = 1;
      drawSpotlight(hour);
      ctx.drawImage(blend, 0, 0);
    }
  }
  function finish() {
    cancelAnimationFrame(frame);
    frame = 0;
    currentTime = targetTime;
    sunPhase = toSun;
    draw(currentTime);
    status.textContent = caption(currentTime);
    if (persistSelection) save();
  }
  function changeSky(requested) {
    if (disposed) return;
    persistSelection = typeof requested !== 'boolean';
    nightSelected = typeof requested === 'boolean' ? requested : !nightSelected;
    syncToggle();
    if (frame) {
      [targetTime, fromEndpoint] = [fromEndpoint, targetTime];
      [toSun, fromSun] = [fromSun, toSun];
      cancelAnimationFrame(frame);
    } else {
      fromEndpoint = currentTime;
      targetTime = nightSelected ? 21 : 12;
      // The sun begins at the eastern horizon immediately, with no wait through midnight.
      if (!nightSelected) sunPhase = sunrisePhase;
      fromSun = sunPhase;
      toSun = nightSelected ? sunsetPhase : noonPhase;
    }
    status.textContent = nightSelected
      ? t('夜モードへ切り替え中', 'Switching to night mode')
      : t('昼モードへ切り替え中', 'Switching to day mode');
    if (reducedMotion.matches) {
      finish();
      return;
    }
    const startValue = currentTime,
      startSun = sunPhase,
      start = performance.now(),
      duration = 1000;
    function tick(now) {
      const p = clamp((now - start) / duration, 0, 1);
      const lightEase = p * p * (3 - 2 * p),
        sunEase = 1 - (1 - p) ** 2;
      sunPhase = lerp(startSun, toSun, sunEase);
      draw(lerp(startValue, targetTime, lightEase));
      if (p < 1) frame = requestAnimationFrame(tick);
      else finish();
    }
    frame = requestAnimationFrame(tick);
  }
  listen(toggle, 'click', changeSky);
  function updateHover() {
    cancelAnimationFrame(hoverFrame);
    const requested = pointerRoom || focusRoom;
    if (requested && requested !== litRoom) {
      litRoom = requested;
      hoverAmount = 0;
    }
    const from = hoverAmount,
      to = requested ? 1 : 0,
      start = performance.now();
    function tick(now) {
      const p = reducedMotion.matches ? 1 : clamp((now - start) / 260, 0, 1);
      hoverAmount = lerp(from, to, p);
      draw(currentTime);
      if (p < 1) hoverFrame = requestAnimationFrame(tick);
      else {
        hoverFrame = 0;
        if (!requested) litRoom = null;
      }
    }
    hoverFrame = requestAnimationFrame(tick);
  }
  document.querySelectorAll('.room').forEach((room) => {
    listen(room, 'pointerenter', () => {
      pointerRoom = room.dataset.panel;
      updateHover();
    });
    listen(room, 'pointerleave', () => {
      pointerRoom = null;
      updateHover();
    });
    listen(room, 'focus', () => {
      if (room.matches(':focus-visible')) {
        focusRoom = room.dataset.panel;
        pointerRoom = null;
        updateHover();
      }
    });
    listen(room, 'blur', () => {
      focusRoom = null;
      updateHover();
    });
  });
  listen(reducedMotion, 'change', () => {
    if (reducedMotion.matches && frame) finish();
  });
  listen(document, 'visibilitychange', () => {
    if (document.hidden && frame) finish();
  });
  // Measured on the single 1145 × 1374 editorial house. The PNG already has
  // transparent surroundings and aligned stairs; no raster geometry is replaced.
  const rooms = [
    [
      [433, 319],
      [773, 261],
      [758, 538],
      [433, 538],
    ],
    [
      [433, 577],
      [772, 577],
      [758, 824],
      [433, 824],
    ],
    [
      [433, 863],
      [772, 863],
      [757, 1164],
      [433, 1164],
    ],
  ];
  const lamps = [
    [697, 310, 35],
    [710, 484, 48],
    [573, 653, 77],
    [612, 1029, 62],
    [166, 802, 61],
    [334, 355, 27],
  ];
  // Only the glass openings see the outdoor sky. Keep frames and the foreground
  // foliage from the same illustration, but do not apply indoor light to them.
  const panes = [
    [
      [489, 345],
      [629, 314],
      [630, 335],
      [494, 365],
    ],
    [
      [528, 921],
      [628, 921],
      [628, 965],
      [528, 965],
    ],
    [
      [636, 921],
      [717, 921],
      [717, 965],
      [636, 965],
    ],
  ];
  function inside(x, y, poly) {
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
  }
  function prepare() {
    if (disposed || prepared) return;
    prepared = true;
    const w = source.naturalWidth,
      h = source.naturalHeight;
    canvas.width = w;
    canvas.height = h;
    blend.width = w;
    blend.height = h;
    const original = document.createElement('canvas');
    original.width = w;
    original.height = h;
    const oc = original.getContext('2d', { willReadFrequently: true });
    oc.drawImage(source, 0, 0, w, h);
    // Replace the bedroom's back wall only, keeping every original structural
    // edge, the skylight and the two lower rooms pixel-for-pixel intact.
    const bedroom = document.querySelector('#bedroom-source');
    if (bedroom?.naturalWidth) {
      oc.save();
      oc.beginPath();
      oc.moveTo(463, 407);
      oc.lineTo(753, 343);
      oc.lineTo(753, 539);
      oc.lineTo(463, 539);
      oc.closePath();
      oc.clip();
      oc.drawImage(bedroom, 0, 0, w, h);
      oc.restore();
    }
    const library = document.querySelector('#library-source');
    if (library?.naturalWidth) {
      oc.save();
      oc.beginPath();
      oc.rect(600, 730, 65, 44);
      oc.clip();
      oc.drawImage(library, 0, 0, w, h);
      oc.restore();
    }
    const workspace = document.querySelector('#workspace-source');
    if (workspace?.naturalWidth) {
      // Replace only the old slate chair, never the surrounding warm wall.
      // A rectangular patch changed that wall's color even with nobody seated.
      const patch = document.createElement('canvas');
      patch.width = 76;
      patch.height = 95;
      const pc = patch.getContext('2d');
      pc.drawImage(workspace, 515, 1073, 76, 95, 0, 0, 76, 95);
      const clear = pc.getImageData(0, 0, 76, 95).data,
        original = oc.getImageData(516, 1074, 76, 95);
      const outline = [
        [536, 1075],
        [570, 1075],
        [575, 1079],
        [576, 1102],
        [584, 1102],
        [587, 1105],
        [586, 1110],
        [582, 1112],
        [581, 1120],
        [583, 1123],
        [582, 1128],
        [573, 1133],
        [564, 1137],
        [562, 1146],
        [573, 1150],
        [584, 1156],
        [588, 1163],
        [575, 1163],
        [573, 1160],
        [562, 1155],
        [558, 1153],
        [559, 1163],
        [550, 1163],
        [550, 1153],
        [541, 1156],
        [537, 1163],
        [524, 1163],
        [526, 1157],
        [540, 1150],
        [551, 1145],
        [551, 1137],
        [541, 1134],
        [530, 1129],
        [526, 1126],
        [525, 1111],
        [521, 1109],
        [520, 1104],
        [524, 1102],
        [531, 1102],
        [531, 1081],
      ];
      for (let y = 0; y < 95; y++)
        for (let x = 0; x < 76; x++) {
          if (!inside(x + 516, y + 1074, outline)) continue;
          const q = (y * 76 + x) * 4,
            d = original.data;
          const coverage =
            smooth(-8, 2, d[q + 2] - d[q]) *
            (1 - smooth(125, 185, Math.max(d[q], d[q + 1], d[q + 2])));
          for (let c = 0; c < 3; c++)
            d[q + c] = lerp(d[q + c], clear[q + c], coverage);
        }
      oc.putImageData(original, 516, 1074);
    }
    const pixels = oc.getImageData(0, 0, w, h),
      data = pixels.data,
      count = w * h;
    const lightMap = new Float32Array(count),
      skyMap = new Float32Array(count);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (!data[p * 4 + 3]) continue;
        if (panes.some((pane) => inside(x, y, pane))) {
          const q = p * 4;
          // Soft blue chroma coverage leaves anti-aliased leaves and dark mullions
          // intact. Cleared pixels reveal drawSky and the live page background.
          skyMap[p] =
            smooth(0, 14, data[q + 2] - data[q + 1]) *
            smooth(5, 35, data[q + 2] - data[q]);
          continue;
        }
        let lit = 0;
        for (let r = 0; r < rooms.length; r++)
          if (inside(x, y, rooms[r])) {
            const cy = [425, 700, 1013][r];
            lit =
              0.7 + 0.2 * Math.exp(-((x - 600) ** 2 + (y - cy) ** 2) / 40000);
            break;
          }
        // Small, warm spill into the common stairwell.
        if (x > 245 && x < 393 && y > 330 && y < 1165)
          lit = Math.max(lit, 0.27);
        lightMap[p] = lit;
      }
    layers = states.map((state) => {
      const layer = document.createElement('canvas');
      layer.width = w;
      layer.height = h;
      const lc = layer.getContext('2d');
      const graded = new ImageData(w, h);
      const out = graded.data;
      for (let p = 0; p < count; p++) {
        const q = p * 4;
        if (!data[q + 3]) continue;
        const warmth = lightMap[p] * state.light;
        for (let c = 0; c < 3; c++)
          out[q + c] =
            data[q + c] * lerp(state.ambient[c], [1, 0.88, 0.63][c], warmth);
        out[q + 3] = data[q + 3] * (1 - skyMap[p]);
      }
      lc.putImageData(graded, 0, 0);
      if (state.light) {
        lc.globalCompositeOperation = 'screen';
        for (const [x, y, r] of lamps) {
          const g = lc.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(255,222,147,${state.light * 0.75})`);
          g.addColorStop(0.12, `rgba(255,198,99,${state.light * 0.35})`);
          g.addColorStop(1, 'rgba(255,175,70,0)');
          lc.fillStyle = g;
          lc.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
      return layer;
    });
    source.closest('.building').classList.add('ready');
    draw(currentTime);
  }
  function preferredNight() {
    try {
      const saved = localStorage.getItem('morimizu-theme');
      if (saved === 'dark' || saved === 'light') return saved === 'dark';
      const legacy = localStorage.getItem('one-roof-sky');
      if (legacy === 'day' || legacy === 'night') return legacy === 'night';
      const hour = Number(localStorage.getItem('one-roof-hour'));
      if (hour > 0) return hour >= 19 || hour < 6;
    } catch {}
    return systemTheme.matches;
  }
  nightSelected = preferredNight();
  const syncPreference = () => {
    const next = preferredNight();
    if (next !== nightSelected) changeSky(next);
  };
  listen(systemTheme, 'change', syncPreference);
  listen(window, 'storage', syncPreference);
  listen(window, 'morimizu-language', () => {
    syncToggle();
    status.textContent = caption(currentTime);
  });
  const localeObserver = new MutationObserver(() => {
    syncToggle();
    status.textContent = caption(currentTime);
  });
  localeObserver.observe(root, { attributes: true, attributeFilter: ['lang'] });
  cleanups.push(() => localeObserver.disconnect());
  currentTime = targetTime = nightSelected ? 21 : 12;
  sunPhase = fromSun = toSun = nightSelected ? sunsetPhase : noonPhase;
  syncToggle();
  draw(currentTime);
  status.textContent = caption(currentTime);
  if (source) {
    const inserts = [
      document.querySelector('#bedroom-source'),
      document.querySelector('#library-source'),
      document.querySelector('#workspace-source'),
    ].filter(Boolean);
    const ready = () => {
      if (
        source.complete &&
        source.naturalWidth &&
        inserts.every((image) => image.complete)
      )
        prepare();
    };
    listen(source, 'load', ready, { once: true });
    for (const image of inserts) {
      listen(image, 'load', ready, { once: true });
      listen(image, 'error', ready, { once: true });
    }
    ready();
  }
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(hoverFrame);
    for (const cleanup of cleanups) cleanup();
    source?.closest('.building')?.classList.remove('ready');
  };
}
