'use client';
/* oxlint-disable next/no-html-link-for-pages -- Section links retain existing public URLs. */
import '@/app/journal/roof-journal.css';
import type { ReactNode } from 'react';
import { useLocale } from '../locale';
import { RoofBreadcrumbs } from './roof-page-components';
import './roof-notes.css';
export function NotesHeading({
  section,
  tabs,
  count,
}: {
  section: 'journal' | 'qiita';
  tabs?: ReactNode;
  count?: number;
}) {
  const { t, en } = useLocale();
  return (
    <>
      <RoofBreadcrumbs
        items={[{ label: 'HOME', href: en ? '/en' : '/' }, { label: 'NOTES' }]}
      />
      <header className="page-head">
        <div>
          <p className="eyebrow">02 / NOTES</p>
          <h1 className="page-title">NOTES</h1>
        </div>
        {count !== undefined && (
          <span className="page-count">
            {count}
            <span>ITEMS</span>
          </span>
        )}
      </header>
      {tabs ?? (
        <nav
          className="e-notes-tabs"
          aria-label={t('Notesのセクション', 'Notes sections')}
        >
          <a
            href="/journal"
            aria-current={section === 'journal' ? 'page' : undefined}
          >
            Journal
          </a>
          <a
            href={en ? '/en/notes' : '/notes'}
            aria-current={section === 'qiita' ? 'page' : undefined}
          >
            {t('Qiita記事', 'Qiita articles')}
          </a>
        </nav>
      )}
    </>
  );
}
