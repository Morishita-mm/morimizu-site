import { ArrowUpRight } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { MizuGlyph } from '@/components/mizu-glyph';
import { LINKEDIN_URL } from '@/lib/social-links';

type SiteHeaderProps = {
  active?: 'apps' | 'notes' | 'about';
  locale?: 'ja' | 'en';
  languageHref?: string;
};

export function SiteHeader({
  active,
  locale = 'ja',
  languageHref,
}: SiteHeaderProps) {
  const english = locale === 'en';
  const prefix = english ? '/en' : '';

  return (
    <header className="site-header">
      <div className="site-header-inner page-shell">
        <FullPageLink
          className="brand"
          href={english ? '/en' : '/'}
          aria-label={english ? 'morimizu.dev home' : 'morimizu.dev ホーム'}
        >
          <MizuGlyph className="brand-mark" />
          <span className="brand-copy">
            <strong>morimizu.dev</strong>
            <small>MIZUKI&apos;S PERSONAL SITE</small>
          </span>
        </FullPageLink>

        <nav aria-label={english ? 'Main navigation' : 'メインナビゲーション'}>
          <FullPageLink
            aria-current={active === 'apps' ? 'page' : undefined}
            data-section-link="work"
            href={`${prefix}/projects`}
          >
            Apps
          </FullPageLink>
          <FullPageLink
            aria-current={active === 'notes' ? 'page' : undefined}
            data-section-link="writing"
            href={`${prefix}/notes`}
          >
            Notes
          </FullPageLink>
          <FullPageLink
            aria-current={active === 'about' ? 'page' : undefined}
            data-section-link="about"
            href={`${prefix}/#about`}
          >
            About
          </FullPageLink>
        </nav>

        <div className="header-actions">
          <FullPageLink
            className="language-switch"
            href={languageHref ?? (english ? '/' : '/en')}
            lang={english ? 'ja' : 'en'}
            hrefLang={english ? 'ja' : 'en'}
            aria-label={english ? '日本語版を表示' : 'View the English version'}
          >
            {english ? 'JP' : 'EN'}
          </FullPageLink>
          <a
            className="header-qiita"
            href={LINKEDIN_URL}
            rel="noreferrer"
            target="_blank"
          >
            LinkedIn
            <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.8} />
          </a>
          <a
            className="header-qiita"
            href="https://qiita.com/morimizu"
            rel="noreferrer"
            target="_blank"
          >
            Qiita
            <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.8} />
          </a>
        </div>
      </div>
      <span className="site-progress" aria-hidden="true" />
    </header>
  );
}

export function SiteFooter({ locale = 'ja' }: { locale?: 'ja' | 'en' }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner page-shell">
        <span className="footer-brand">
          <MizuGlyph className="footer-mark" />
          <span>
            <strong>morimizu.dev</strong>
            <small>© 2026 Mizuki</small>
          </span>
        </span>
        <span className="footer-note">
          {locale === 'en'
            ? 'Things I build and write.'
            : 'つくったものと、書いたもの。'}
        </span>
      </div>
    </footer>
  );
}
