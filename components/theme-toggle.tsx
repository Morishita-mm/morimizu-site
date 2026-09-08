'use client';

import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const storageKey = 'morimizu-theme';

export function ThemeToggle({ locale = 'ja' }: { locale?: 'ja' | 'en' }) {
  const [dark, setDark] = useState(false);
  const changing = useRef(false);

  useEffect(() => {
    const system = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(storageKey);
      } catch {
        /* Storage is optional. */
      }
      const next = saved === 'dark' || (saved !== 'light' && system.matches);
      document.documentElement.dataset.theme = next ? 'dark' : 'light';
      setDark(next);
    };
    sync();
    system.addEventListener('change', sync);
    window.addEventListener('storage', sync);
    return () => {
      system.removeEventListener('change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  async function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (changing.current) return;
    const root = document.documentElement;
    const next = root.dataset.theme !== 'dark';
    const apply = () => {
      root.dataset.theme = next ? 'dark' : 'light';
      setDark(next);
      try {
        localStorage.setItem(storageKey, next ? 'dark' : 'light');
      } catch {
        /* Keep the toggle working without persistence. */
      }
    };
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      apply();
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );
    changing.current = true;
    root.classList.add('theme-transition');
    try {
      const transition = document.startViewTransition(apply);
      await transition.ready;
      await root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 580,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      ).finished;
      await transition.finished;
    } catch {
      apply();
    } finally {
      root.classList.remove('theme-transition');
      changing.current = false;
    }
  }

  const label =
    locale === 'en'
      ? dark
        ? 'Switch to light mode'
        : 'Switch to dark mode'
      : dark
        ? 'ライトモードに切り替える'
        : 'ダークモードに切り替える';
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <Sun
        className="theme-sun"
        size={19}
        strokeWidth={1.7}
        aria-hidden="true"
      />
      <Moon
        className="theme-moon"
        size={19}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    </button>
  );
}
