'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Native diagrams and existing routes. */
import { useLocale } from '../locale';
import { TECH_INTERVIEWER_URL } from '@/lib/project-links';
import { Arrow, Mark, SectionHeading } from './components';
import type { Project } from '@/lib/projects';
import type { Localized } from './types';
export function ProjectPage({
  project: localized,
  screenshots,
  architectures,
}: {
  project: Localized<Project>;
  screenshots: Localized<string | undefined>;
  architectures: Localized<string | undefined>;
}) {
  const { en, t } = useLocale();
  const project = en ? localized.en : localized.ja;
  const screenshot = screenshots[en ? 'en' : 'ja'];
  const architecture = architectures[en ? 'en' : 'ja'];
  const primaryLink =
    project.primaryLink ??
    (project.slug === 'tech-interviewer'
      ? { label: t('アプリを開く', 'Open app'), href: TECH_INTERVIEWER_URL }
      : undefined);
  return (
    <article className="e-project-detail shell">
      <a href="/projects" className="e-back">
        ← Projects
      </a>
      <header className="e-project-detail-heading">
        <div>
          <span className="e-kicker">
            {project.category} / {project.status}
          </span>
          <h1>{project.name}</h1>
          <p>{project.tagline}</p>
        </div>
        <Mark kind={project.slug} />
      </header>
      <p className="project-summary">{project.summary}</p>
      <section
        className="e-architecture-section architecture-primary"
        aria-label={t('アーキテクチャ', 'Architecture')}
      >
        <SectionHeading
          number="01"
          title={t('アーキテクチャ', 'Architecture')}
        />
        {architecture && (
          <figure className="architecture-feature">
            <section
              className="architecture-scroll"
              // Keyboard users need focus here to scroll the full-size diagram.
              // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              aria-label={t(
                '構成図。横にスクロールして全体を確認できます',
                'Architecture diagram. Scroll horizontally to explore.',
              )}
            >
              <img
                src={architecture}
                alt={project.architecture.alt}
                fetchPriority="high"
              />
            </section>
            <figcaption>
              <span>
                {project.name} / {t('システム構成', 'System architecture')}
              </span>
              <span className="diagram-scroll-hint">
                {t(
                  '横にスクロールして全体を確認できます',
                  'Scroll horizontally to explore',
                )}
              </span>
            </figcaption>
          </figure>
        )}
        <div className="architecture-flow">
          {project.flow.map((item, index) => (
            <div key={item.title}>
              <span>
                0{index + 1} / {item.label}
              </span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="project-detail-facts">
        {project.facts.map((fact) => (
          <div key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </div>
        ))}
      </div>
      <div className="project-detail-links">
        {primaryLink && (
          <a href={primaryLink.href} className="e-solid-link">
            {primaryLink.label}
            <Arrow diagonal />
          </a>
        )}
        {project.repositoryVisibility !== 'private' && (
          <a href={project.repositoryUrl} className="e-outline-link">
            GitHub <Arrow diagonal />
          </a>
        )}
      </div>
      {screenshot && (
        <figure className="e-real-screen">
          <img
            src={screenshot}
            alt={project.image!.alt}
            width="1200"
            height="750"
          />
          <figcaption>{project.image!.caption}</figcaption>
        </figure>
      )}
      <section className="project-story">
        <h2>{t('つくったきっかけ', 'Why I built it')}</h2>
        <div>
          <p>{project.challenge}</p>
          <p>{project.answer}</p>
        </div>
      </section>
      <section className="e-design-decisions">
        <h2>{t('設計判断', 'Design decisions')}</h2>
        <div>
          {project.decisions.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="project-now">
        <h2>{t('いまの状態', 'Current status')}</h2>
        <p>{project.now}</p>
      </section>
      <a href="/projects" className="e-outline-link">
        {t('ほかのプロジェクトを見る', 'Explore other projects')} <Arrow />
      </a>
    </article>
  );
}
