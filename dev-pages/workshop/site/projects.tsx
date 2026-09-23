'use client';
/* oxlint-disable next/no-html-link-for-pages -- Shared with the standalone preview. */
import { useLocale } from '../locale';
import { RoofProjectMark } from './roof-project-mark';
import { RoofArrow, RoofBreadcrumbs } from './roof-page-components';
import type { Localized, ProjectSummary } from './types';

export function ProjectsPage({
  projects,
}: {
  projects: Localized<ProjectSummary>[];
}) {
  const { en, t } = useLocale();
  const prefix = en ? '/en' : '';
  return (
    <div className="works-page page-main wrap">
      <RoofBreadcrumbs
        items={[{ label: 'HOME', href: prefix || '/' }, { label: 'WORKS' }]}
      />
      <header className="page-head">
        <div>
          <p className="eyebrow">01 / WORKS</p>
          <h1 className="page-title">WORKS</h1>
          <p className="page-description">
            {t(
              '個人開発でつくったアプリとツール。実装や設計の背景をまとめています。',
              'Apps and tools from my personal projects, with the thinking behind their design and implementation.',
            )}
          </p>
        </div>
        <span className="page-count">
          {String(projects.length).padStart(2, '0')}
          <span>ITEMS</span>
        </span>
      </header>
      <div className="work-list">
        {projects.map((localized) => {
          const project = localized[en ? 'en' : 'ja'];
          return (
            <a
              className="work-row"
              href={`${prefix}/projects/${project.slug}`}
              key={project.slug}
            >
              <span className="work-number">{project.number}</span>
              <RoofProjectMark kind={project.slug} className="work-icon" />
              <div className="work-info">
                <p className="eyebrow">{project.category}</p>
                <h2 className="work-title">{project.name}</h2>
                <p className="work-summary">{project.summary}</p>
                <ul
                  className="tag-list"
                  aria-label={t('使用言語', 'Languages')}
                >
                  {project.languages.map((language) => (
                    <li key={language}>{language}</li>
                  ))}
                </ul>
              </div>
              <div className="work-meta">
                <span className="project-status">
                  <span className="status-dot" />
                  {project.status}
                </span>
                <RoofArrow />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
