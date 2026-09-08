'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve full-page route navigation. */
import type { ReactNode } from 'react';
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
function Header({ path, preview }: { path: string; preview: boolean }) {
  const { t, locale } = useLocale();
  return (
    <>
      <a href="#content" className="e-skip">
        {t('本文へスキップ', 'Skip to content')}
      </a>
      <header className="e-header shell">
        <a
          href="/"
          className="e-brand"
          aria-label={t('morimizu works ホーム', 'morimizu works Home')}
        >
          <SiteIcon variant="shoulder-raised" />
        </a>
        <nav aria-label={t('メインナビゲーション', 'Main navigation')}>
          <a
            href="/projects"
            aria-current={path.startsWith('/projects') ? 'page' : undefined}
          >
            <span>01</span>Projects
          </a>
          <a
            href="/notes"
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
            aria-current={path.endsWith('/about') ? 'page' : undefined}
          >
            <span>03</span>About
          </a>
        </nav>
        <a className="header-contact" href={LINKEDIN_URL}>
          LinkedIn <Arrow diagonal />
        </a>
        <div className="e-header-tools">
          <ThemeToggle locale={locale} />
          <LanguageToggle />
        </div>
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
          <a href="/journal/admin/upload">
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
