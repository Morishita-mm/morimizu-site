import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { MizuGlyph } from '@/components/mizu-glyph';

type SiteHeaderProps = {
  active?: 'apps' | 'notes' | 'about';
};

export function SiteHeader({ active }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header-inner page-shell">
        <Link className="brand" href="/" aria-label="morimizu.dev ホーム">
          <MizuGlyph className="brand-mark" />
          <span className="brand-copy">
            <strong>morimizu.dev</strong>
            <small>PERSONAL DEV LAB</small>
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <Link aria-current={active === 'apps' ? 'page' : undefined} href="/#work">
            Apps
          </Link>
          <Link aria-current={active === 'notes' ? 'page' : undefined} href="/notes">
            Notes
          </Link>
          <Link aria-current={active === 'about' ? 'page' : undefined} href="/#about">
            About
          </Link>
        </nav>

        <a
          className="header-qiita"
          href="https://qiita.com/mzk_tech"
          rel="noreferrer"
          target="_blank"
        >
          Qiita
          <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.8} />
        </a>
      </div>
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
        <span className="footer-note">A SMALL, GROWING SOFTWARE LAB.</span>
      </div>
    </footer>
  );
}
