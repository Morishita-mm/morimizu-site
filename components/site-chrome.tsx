import { ArrowUpRight } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { MizuGlyph } from '@/components/mizu-glyph';

type SiteHeaderProps = {
  active?: 'apps' | 'notes' | 'about';
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner page-shell">
        <FullPageLink
          className="brand"
          href="/"
          aria-label="morimizu.dev ホーム"
        >
          <MizuGlyph className="brand-mark" />
          <span className="brand-copy">
            <strong>morimizu.dev</strong>
            <small>MIZUKI&apos;S PERSONAL SITE</small>
          </span>
        </FullPageLink>

        <nav aria-label="メインナビゲーション">
          <FullPageLink
            aria-current={active === 'apps' ? 'page' : undefined}
            data-section-link="work"
            href="/#work"
          >
            Apps
          </FullPageLink>
          <FullPageLink
            aria-current={active === 'notes' ? 'page' : undefined}
            data-section-link="writing"
            href="/notes"
          >
            Notes
          </FullPageLink>
          <FullPageLink
            aria-current={active === 'about' ? 'page' : undefined}
            data-section-link="about"
            href="/#about"
          >
            About
          </FullPageLink>
        </nav>

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
      <span className="site-progress" aria-hidden="true" />
    </header>
  );
}

export function SiteFooter() {
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
        <span className="footer-note">つくったものと、書いたもの。</span>
      </div>
    </footer>
  );
}
