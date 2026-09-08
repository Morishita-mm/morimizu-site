'use client';
/* oxlint-disable next/no-html-link-for-pages */
import type { MouseEvent } from 'react';
import { useLocale } from '@/dev-pages/workshop/locale';
export function NotesTabs({
  section,
  onNavigate,
}: {
  section: 'journal' | 'qiita';
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const { t, en } = useLocale();
  return (
    <nav
      className="e-notes-tabs"
      aria-label={t('Notesのセクション', 'Notes sections')}
    >
      <a
        href="/journal"
        onClick={onNavigate}

        aria-current={section === 'journal' ? 'page' : undefined}
      >
        Journal
      </a>
      <a
        href={en ? '/en/notes' : '/notes'}
        onClick={onNavigate}

        aria-current={section === 'qiita' ? 'page' : undefined}
      >
        {t('Qiita記事', 'Qiita articles')}
      </a>
    </nav>
  );
}
