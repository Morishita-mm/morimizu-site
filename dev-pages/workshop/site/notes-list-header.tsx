'use client';
/* oxlint-disable next/no-html-link-for-pages */
import type { MouseEvent } from 'react';
import { useLocale } from '../locale';
export function NotesListHeader({
  title,
  count,
  sort,
  path,
  onNavigate,
  dateLabel,
}: {
  title: string;
  count: number;
  sort: 'asc' | 'desc';
  path: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>) => void;
  dateLabel: string;
}) {
  const { t } = useLocale();
  return (
    <div className="e-list-caption e-notes-list-header">
      <h2>
        {title}
        <span>{count}</span>
      </h2>
      <nav className="journal-sort" aria-label={dateLabel}>
        <a
          href={`${path}?sort=desc`}
          onClick={onNavigate}
          aria-current={sort === 'desc' ? 'page' : undefined}
        >
          {t('新しい順', 'Newest first')}
        </a>
        <a
          href={`${path}?sort=asc`}
          onClick={onNavigate}
          aria-current={sort === 'asc' ? 'page' : undefined}
        >
          {t('古い順', 'Oldest first')}
        </a>
      </nav>
    </div>
  );
}
