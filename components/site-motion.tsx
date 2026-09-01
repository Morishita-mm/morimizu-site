'use client';

import { useEffect } from 'react';

export function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reveal]'),
    );
    const sectionElements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-section-id]'),
    );
    const sectionLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('[data-section-link]'),
    );

    revealElements.forEach((element) => {
      const delay = Number(element.dataset.revealDelay ?? 0);
      element.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    let revealObserver: IntersectionObserver | null = null;
    let sectionObserver: IntersectionObserver | null = null;
    let animationFrame = 0;
    let scrollListening = false;

    const revealAll = () => {
      revealElements.forEach((element) => element.classList.add('is-visible'));
    };

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealAll();
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );

      revealElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top < window.innerHeight * 0.94 && bounds.bottom > 0) {
          element.classList.add('is-visible');
        } else {
          revealObserver?.observe(element);
        }
      });
    }

    const setCurrentSection = (sectionId: string) => {
      sectionLinks.forEach((link) => {
        const isCurrent = link.dataset.sectionLink === sectionId;
        const linksToSection = link.hash.slice(1) === sectionId;
        link.toggleAttribute('data-current', isCurrent);

        if (isCurrent && linksToSection) {
          link.setAttribute('aria-current', 'location');
        } else if (link.getAttribute('aria-current') === 'location') {
          link.removeAttribute('aria-current');
        }
      });
    };

    if (sectionElements.length > 0 && 'IntersectionObserver' in window) {
      sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const section = entry.target as HTMLElement;
            setCurrentSection(section.dataset.sectionId ?? '');
          });
        },
        { rootMargin: '-30% 0px -58% 0px', threshold: 0 },
      );

      sectionElements.forEach((section) => sectionObserver?.observe(section));
    }

    const updatePageProgress = () => {
      animationFrame = 0;
      const scrollY = Math.max(window.scrollY, 0);
      const scrollRange = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      root.style.setProperty(
        '--page-progress',
        String(Math.min(scrollY / scrollRange, 1)),
      );
    };

    const handleScroll = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updatePageProgress);
    };

    const startProgress = () => {
      if (reduceMotion.matches || scrollListening) return;
      updatePageProgress();
      window.addEventListener('scroll', handleScroll, { passive: true });
      scrollListening = true;
    };

    const stopProgress = () => {
      if (scrollListening) {
        window.removeEventListener('scroll', handleScroll);
        scrollListening = false;
      }
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      root.style.removeProperty('--page-progress');
    };

    root.classList.add('motion-ready');
    startProgress();

    const handleMotionPreference = () => {
      if (reduceMotion.matches) {
        revealObserver?.disconnect();
        revealObserver = null;
        revealAll();
        stopProgress();
      } else {
        startProgress();
      }
    };

    reduceMotion.addEventListener('change', handleMotionPreference);

    return () => {
      revealObserver?.disconnect();
      sectionObserver?.disconnect();
      reduceMotion.removeEventListener('change', handleMotionPreference);
      stopProgress();
      root.classList.remove('motion-ready');
      sectionLinks.forEach((link) => {
        link.removeAttribute('data-current');
        if (link.getAttribute('aria-current') === 'location') {
          link.removeAttribute('aria-current');
        }
      });
    };
  }, []);

  return null;
}
