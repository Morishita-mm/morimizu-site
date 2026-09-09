'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve full-page route navigation. */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import {
  LocaleProvider,
  LanguageToggle,
  useLocale,
  type Locale,
} from '../locale';
import { LINKEDIN_URL } from '@/lib/social-links';
import { SiteIcon } from '../site-identity';
import { BrandWordmark } from '../brand-concepts';
import { Arrow } from './components';
import { ThemeToggle } from '@/components/theme-toggle';

function HeaderLinks({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <a
        href="/projects"
        onClick={onNavigate}
        aria-current={path.startsWith('/projects') ? 'page' : undefined}
      >
        <span>01</span>Projects
      </a>
      <a
        href="/notes"
        onClick={onNavigate}
        aria-current={
          path.startsWith('/notes') || path.startsWith('/journal')
            ? 'page'
            : undefined
        }
      >
        <span>02</span>Notes
      </a>
      <a
        href="/about"
        onClick={onNavigate}
        aria-current={path.endsWith('/about') ? 'page' : undefined}
      >
        <span>03</span>About
      </a>
    </>
  );
}

function Header({ path, preview }: { path: string; preview: boolean }) {
  const { t, locale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 760px)');
    // Clamp rubber-band overscroll so the page edges cannot reverse direction.
    const scrollPosition = () =>
      Math.max(
        0,
        Math.min(
          window.scrollY,
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      );
    let previous = scrollPosition();
    let direction = 0;
    let distance = 0;
    const onScroll = () => {
      const current = scrollPosition();
      const delta = current - previous;
      previous = current;
      if (!mobile.matches) return;
      if (menuOpen || current <= 72) {
        setHidden(false);
        distance = 0;
        return;
      }
      if (!delta) return;
      const nextDirection = Math.sign(delta);
      if (nextDirection !== direction) distance = 0;
      direction = nextDirection;
      distance += Math.abs(delta);
      // A small deliberate movement reveals the header without scroll jitter.
      if (distance >= 10) {
        setHidden(delta > 0);
        distance = 0;
      }
    };
    const onResize = () => {
      setHidden(false);
      setMenuOpen(false);
      previous = scrollPosition();
      distance = 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    mobile.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      mobile.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#content" className="e-skip">
        {t('本文へスキップ', 'Skip to content')}
      </a>
      <header
        ref={headerRef}
        className="e-header shell"
        data-scroll-hidden={hidden && !menuOpen ? 'true' : undefined}
        data-menu-open={menuOpen ? 'true' : undefined}
        onFocusCapture={() => setHidden(false)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setMenuOpen(false);
        }}
      >
        <a
          href="/"
          className="e-brand"
          aria-label={t('morimizu works ホーム', 'morimizu works Home')}
        >
          <SiteIcon variant="shoulder-raised" />
        </a>
        <nav
          data-desktop-nav
          aria-label={t('メインナビゲーション', 'Main navigation')}
        >
          <HeaderLinks path={path} />
        </nav>
        <a className="header-contact" href={LINKEDIN_URL}>
          LinkedIn <Arrow diagonal />
        </a>
        <div className="e-header-tools">
          <ThemeToggle locale={locale} />
          <LanguageToggle />
          <button
            ref={menuButtonRef}
            className="e-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={
              menuOpen
                ? t('メニューを閉じる', 'Close menu')
                : t('メニューを開く', 'Open menu')
            }
            onClick={() => {
              setHidden(false);
              setMenuOpen(!menuOpen);
            }}
          >
            {menuOpen ? (
              <X size={22} strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={1.6} aria-hidden="true" />
            )}
          </button>
        </div>
        <nav
          id={menuId}
          className="e-mobile-nav"
          aria-label={t('メインナビゲーション', 'Main navigation')}
          hidden={!menuOpen}
        >
          <HeaderLinks path={path} onNavigate={() => setMenuOpen(false)} />
        </nav>
        {preview && <span className="e-local">LOCAL PREVIEW</span>}
      </header>
    </>
  );
}

function Footer() {
  const { t } = useLocale();
  return (
    <footer className="e-footer shell">
      <a className="footer-wordmark" href="/">
        <span className="adopted-lockup">
          <SiteIcon variant="shoulder-raised" />
          <BrandWordmark variant="shoulder-raised" />
        </span>
        <svg
          className="footer-home-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <div>
        <p>
          {t('つくったもの。書いたこと。', 'Things I build. Things I write.')}
        </p>
        <nav aria-label={t('フッターナビゲーション', 'Footer navigation')}>
          <a href="/projects">Projects</a>
          <a href="/notes">Notes</a>
          <a href="/about">About</a>
          <a href="/journal/admin">
            {t('Journal管理', 'Journal admin')}
          </a>
          <a href="https://github.com/Morishita-mm">GitHub ↗</a>
        </nav>
        <small>© 2026 Mizuki</small>
      </div>
    </footer>
  );
}

export function SiteShell({
  path,
  initialLocale = 'ja',
  preview = false,
  children,
}: {
  path: string;
  initialLocale?: Locale;
  preview?: boolean;
  children: ReactNode;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale}>
      <Header path={path} preview={preview} />
      <main id="content">{children}</main>
      <Footer />
    </LocaleProvider>
  );
}
