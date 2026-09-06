'use client';
/* oxlint-disable next/no-html-link-for-pages -- Preserve full-page route navigation. */
import { useLocale } from '../locale';
import { OriginalProjectMark } from '../original-project-mark';
import { QiitaLikes } from '../qiita-likes';
import { formatArticleDate } from '@/lib/article-date';
import type { Localized, ProjectSummary, ArticleSummary } from './types';
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      className={diagonal ? 'e-arrow diagonal' : 'e-arrow'}
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Mark({ kind }: { kind: string }) {
  if (kind !== 'tech-interviewer') return <OriginalProjectMark kind={kind} />;
  return (
    <svg
      className="e-mark"
      viewBox="0 0 48 48"
      data-original-icon="tech-interviewer"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 15L31 6L42 13V35L31 42L18 33"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 15L6 24L18 33L29 24L18 15Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SectionHeading({
  number,
  title,
  count,
  href,
}: {
  number: string;
  title: string;
  count?: number;
  href?: string;
}) {
  const { t } = useLocale();
  return (
    <header className="e-section-heading">
      <div>
        <span className="e-index">{number}</span>
        <h2>{title}</h2>
        {count !== undefined && (
          <span className="e-count">{String(count).padStart(2, '0')}</span>
        )}
      </div>
      {href && (
        <a href={href}>
          {t('すべて見る', 'View all')} <Arrow />
        </a>
      )}
    </header>
  );
}

export function ProjectCard({
  project: localized,
}: {
  project: Localized<ProjectSummary>;
}) {
  const { en } = useLocale();
  const project = en ? localized.en : localized.ja;
  return (
    <article className={`e-project ${project.slug}`}>
      <a href={`/projects/${project.slug}`}>
        <div className="project-poster">
          <span className="poster-number">
            {project.number} / {project.shortName.toUpperCase()}
          </span>
          <Mark kind={project.slug} />
          <span className="poster-cta" aria-hidden="true">
            <Arrow diagonal />
          </span>
        </div>
        <div className="project-meta">
          <span>{project.category}</span>
          <span>{project.status}</span>
        </div>
        <h3>{project.name}</h3>
        <p>{project.tagline}</p>
      </a>
    </article>
  );
}

export function NoteRow({
  article,
  index,
}: {
  article: ArticleSummary;
  index: number;
}) {
  const { t } = useLocale();
  return (
    <li>
      <a className="e-note-row" href={`/notes/${article.id}`}>
        <span className="e-note-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div>
          <span className="e-note-meta">
            <time dateTime={article.updatedAt}>
              {formatArticleDate(article.updatedAt)}
            </time>
            <span>
              {article.readingMinutes}
              {t('分で読めます', ' min read · Japanese')}
            </span>
            <QiitaLikes id={article.id} />
          </span>
          <h3>{article.title}</h3>
          <div className="e-tags">
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <Arrow diagonal />
      </a>
    </li>
  );
}
