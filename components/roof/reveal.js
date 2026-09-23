export function initializeScrollReveal() {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // Content is visible by default: an unavailable API or script never hides it.
  if (
    motion.matches ||
    !('IntersectionObserver' in window) ||
    !Element.prototype.animate
  )
    return;

  const selectors = [
    '.page-main > .page-head',
    '.page-main > .detail-head',
    '.section-heading',
    '.project-grid > .project',
    '.article-list > .article',
    '.about-strip',
    '.work-row',
    '.project-figure',
    '.project-chapter',
    '.note-row',
    '.article-body > *',
    '.article-end',
    '.page-return',
    '.about-intro',
    '.about-section > h2',
    '.interest-grid > div',
    '.tool-item',
    '.about-section > div > p',
    '.about-section > div > .text-link',
    '.social-list',
    '.resume-intro',
    '.resume-section > h2',
    '.resume-experience',
    '.resume-skills',
    '.resume-education > article',
    '.resume-languages',
    '.resume-contacts',
    '.site-footer',
    '.journal-entry',
    '.journal-entries > article',
    '.journal-findings',
    '.journal-related',
  ];
  const cleanups = [];
  const listen = (target, name, handler) => {
    target.addEventListener(name, handler);
    cleanups.push(() => target.removeEventListener(name, handler));
  };
  const pending = new Set();
  const seen = new WeakSet();
  const active = new Map();
  let stopped = false,
    notesFrame = 0;
  const onScreen = (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < innerHeight
    );
  };
  function finish(element) {
    pending.delete(element);
    observer.unobserve(element);
    active.get(element)?.cancel();
    active.delete(element);
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (
          !isIntersecting ||
          !pending.has(target) ||
          target.closest('[hidden]')
        )
          continue;
        pending.delete(target);
        observer.unobserve(target);
        if (
          stopped ||
          motion.matches ||
          target.contains(document.activeElement)
        )
          continue;
        const animation = target.animate(
          [
            { opacity: 0, translate: '0 14px' },
            { opacity: 1, translate: '0 0' },
          ],
          { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
        active.set(target, animation);
        animation.onfinish = () => active.delete(target);
      }
    },
    { threshold: 0 },
  );

  function register() {
    if (stopped) return;
    const targets = [...document.querySelectorAll(selectors.join(','))];
    for (const target of targets) {
      if (seen.has(target)) continue;
      seen.add(target);
      if (
        targets.some((parent) => parent !== target && parent.contains(target))
      )
        continue;
      const rect = target.getBoundingClientRect();
      if (rect.height && rect.top < innerHeight) continue;
      pending.add(target);
      observer.observe(target);
    }
    for (const target of pending) if (!target.isConnected) finish(target);
  }
  register();
  const mutations = new MutationObserver(register);
  mutations.observe(document.querySelector('#content') || document.body, {
    childList: true,
    subtree: true,
  });

  function showDestination() {
    let destination;
    try {
      destination = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      );
    } catch {}
    for (const target of new Set([...pending, ...active.keys()])) {
      if (onScreen(target) || (destination && target.contains(destination)))
        finish(target);
    }
  }
  function stop() {
    stopped = true;
    cancelAnimationFrame(notesFrame);
    notesFrame = 0;
    mutations.disconnect();
    observer.disconnect();
    for (const animation of active.values()) animation.cancel();
    active.clear();
    pending.clear();
  }
  function showNotesResults() {
    for (const target of new Set([...pending, ...active.keys()])) {
      if (
        target.matches('.note-row') &&
        (onScreen(target) || active.has(target))
      )
        finish(target);
    }
  }
  function showCommittedNotesResults() {
    if (stopped) return;
    showNotesResults();
    // React may commit a filter/history/locale update after the native event.
    cancelAnimationFrame(notesFrame);
    notesFrame = requestAnimationFrame(() => {
      notesFrame = 0;
      if (!stopped) showNotesResults();
    });
  }
  // Filtering is immediate feedback, separate from entering while scrolling.
  for (const type of ['input', 'change', 'click', 'keydown']) {
    listen(document, type, (event) => {
      if (type === 'keydown' && event.key !== 'Enter') return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          '.notes-controls, #notes-reset, .notes-section-tabs',
        )
      ) {
        showCommittedNotesResults();
      }
    });
  }
  listen(document, 'focusin', (event) => {
    for (const target of new Set([...pending, ...active.keys()])) {
      if (target.contains(event.target)) finish(target);
    }
  });
  listen(window, 'hashchange', showDestination);
  listen(window, 'pageshow', showDestination);
  listen(window, 'popstate', showCommittedNotesResults);
  listen(window, 'morimizu-language', showCommittedNotesResults);
  listen(window, 'beforeprint', stop);
  listen(motion, 'change', (event) => {
    if (event.matches) stop();
  });
  return () => {
    stop();
    cleanups.forEach((cleanup) => cleanup());
  };
}
