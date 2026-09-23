'use client';
/* oxlint-disable next/no-html-link-for-pages -- Shared with the standalone preview. */
import { Fragment, type ReactNode } from 'react';
import { useLocale } from '../locale';

export function RoofArrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <i
      className={`icon ${diagonal ? 'arrow-up-icon' : 'arrow-icon'}`}
      aria-hidden="true"
    />
  );
}

export function RoofBreadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  const { t } = useLocale();
  return (
    <nav className="breadcrumbs" aria-label={t('パンくず', 'Breadcrumb')}>
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span aria-current="page">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export function ProjectChapter({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="project-chapter"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <header className="chapter-heading">
        <span className="chapter-number" aria-hidden="true">
          {number}
        </span>
        <h2 id={`${id}-title`}>{title}</h2>
      </header>
      <div className="chapter-content">{children}</div>
    </section>
  );
}
