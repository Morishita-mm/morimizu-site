'use client';
/* oxlint-disable next/no-html-link-for-pages */
import type { ReactNode } from 'react';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
export function AdminFrame({ children }: { children: ReactNode }) {
  return (
    <SiteShell path="/journal">
      <div className="shell ja-admin">
        <nav className="ja-breadcrumb" aria-label="管理ナビゲーション">
          <a href="/journal/admin">Journal Studio</a>
          <span>/</span>
          <a href="/journal">公開ページ ↗</a>
        </nav>
        {children}
      </div>
    </SiteShell>
  );
}
