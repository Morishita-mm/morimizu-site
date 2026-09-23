'use client';
/* oxlint-disable next/no-html-link-for-pages -- Journal fallback links use its server-rendered GET routes. */
import { useId, type ReactNode } from 'react';
import { useLocale } from '../locale';
export function NotesListHeader({
  title,
  count,
  sort,
  onSort,
  dateLabel,
  children,
  fallbackLinks,
}: {
  title: string;
  count: number;
  sort: 'asc' | 'desc';
  onSort: (sort: 'asc' | 'desc') => void;
  dateLabel: string;
  children?: ReactNode;
  fallbackLinks?: { asc: string; desc: string };
}) {
  const { t, locale } = useLocale();
  const id = useId();
  return (
    <div className="e-notes-list-header notes-controls">
      {children ?? (
        <h2 className="notes-collection">
          {title}
          <span>{count}</span>
        </h2>
      )}
      <label
        className={`sort-field${fallbackLinks ? ' journal-sort-enhanced' : ''}`}
        htmlFor={id}
      >
        <span>{t('並び順', 'Sort by')}</span>
        <span className="select-wrap">
          <select
            id={id}
            name="sort"
            aria-label={dateLabel}
            value={sort}
            onChange={(event) => onSort(event.target.value as 'asc' | 'desc')}
          >
            <option value="desc">{t('新しい順', 'Newest first')}</option>
            <option value="asc">{t('古い順', 'Oldest first')}</option>
          </select>
          <i className="icon arrow-icon select-caret" aria-hidden="true" />
        </span>
      </label>
      {fallbackLinks && (
        <noscript>
          <nav
            className="journal-sort-fallback"
            aria-label={dateLabel}
            lang={locale}
          >
            <a
              href={fallbackLinks.desc}
              aria-current={sort === 'desc' ? 'page' : undefined}
            >
              {t('新しい順', 'Newest first')}
            </a>
            <a
              href={fallbackLinks.asc}
              aria-current={sort === 'asc' ? 'page' : undefined}
            >
              {t('古い順', 'Oldest first')}
            </a>
          </nav>
        </noscript>
      )}
    </div>
  );
}
