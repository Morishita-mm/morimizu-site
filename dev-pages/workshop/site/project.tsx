'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Native diagrams and existing routes. */
import { useEffect, useState } from 'react';
import { useLocale } from '../locale';
import { TECH_INTERVIEWER_URL } from '@/lib/project-links';
import {
  ProjectChapter,
  RoofArrow,
  RoofBreadcrumbs,
} from './roof-page-components';
import type { Project } from '@/lib/projects';
import type { Localized } from './types';
import './roof-project-detail.css';

const chapters = [
  ['background', 'BACKGROUND'],
  ['approach', 'APPROACH'],
  ['flow', 'HOW IT WORKS'],
  ['architecture', 'ARCHITECTURE'],
  ['decisions', 'DESIGN DECISIONS'],
  ['verification', 'VERIFICATION'],
  ['status', 'STATUS & NEXT'],
] as const;

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
  const prefix = en ? '/en' : '';
  const project = localized[en ? 'en' : 'ja'];
  const screenshot = screenshots[en ? 'en' : 'ja'];
  const architecture =
    architectures[en ? 'en' : 'ja'] ?? `/roof${project.architecture.src}`;
  const [activeChapter, setActiveChapter] = useState('background');
  useEffect(() => {
    const sections = chapters
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    function trackChapter() {
      const latest = sections
        .filter(
          (section) =>
            section.getBoundingClientRect().top <= window.innerHeight * 0.3,
        )
        .at(-1);
      setActiveChapter(latest?.id ?? 'background');
    }
    trackChapter();
    window.addEventListener('scroll', trackChapter, { passive: true });
    return () => window.removeEventListener('scroll', trackChapter);
  }, [project.slug]);
  const primaryLink =
    project.primaryLink ??
    (project.slug === 'tech-interviewer'
      ? { label: t('アプリを開く', 'Open app'), href: TECH_INTERVIEWER_URL }
      : undefined);
  return (
    <div className="work-detail-page page-main wrap">
      <RoofBreadcrumbs
        items={[
          { label: 'HOME', href: prefix || '/' },
          { label: 'WORKS', href: `${prefix}/projects` },
          { label: project.name },
        ]}
      />
      <header className="detail-head">
        <p className="eyebrow">{project.category}</p>
        <h1 className="detail-title">{project.name}</h1>
        <p className="detail-summary">{project.summary}</p>
        <div className="detail-metadata">
          <span className="project-status">
            <span className="status-dot" />
            {project.status}
          </span>
          <span>{project.statusDetail}</span>
        </div>
        <ul className="tag-list" aria-label={t('使用技術', 'Technology stack')}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="detail-actions">
          {primaryLink && (
            <a href={primaryLink.href} className="button-link">
              {primaryLink.label}
              <RoofArrow diagonal />
            </a>
          )}
          {project.repositoryVisibility !== 'private' &&
            project.repositoryUrl && (
              <a href={project.repositoryUrl} className="button-link">
                GitHub
                <RoofArrow diagonal />
              </a>
            )}
          {project.relatedArticle && (
            <a href={project.relatedArticle.href} className="button-link">
              {project.relatedArticle.label}
              <RoofArrow diagonal />
            </a>
          )}
        </div>
      </header>
      {screenshot && project.image && (
        <figure className="project-figure">
          <img
            src={screenshot}
            alt={project.image.alt}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{project.image.caption}</figcaption>
        </figure>
      )}
      <div className="detail-grid">
        <article className="prose project-story">
          <ProjectChapter id="background" number="01" title="BACKGROUND">
            <p>{project.challenge}</p>
          </ProjectChapter>
          <ProjectChapter id="approach" number="02" title="APPROACH">
            <p>{project.answer}</p>
          </ProjectChapter>
          <ProjectChapter id="flow" number="03" title="HOW IT WORKS">
            <ol className="flow-list">
              {project.flow.map((item, index) => (
                <li key={item.title}>
                  <span className="eyebrow">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </li>
              ))}
            </ol>
          </ProjectChapter>
          <ProjectChapter id="architecture" number="04" title="ARCHITECTURE">
            <figure className="architecture-figure">
              {/* Keyboard focus allows arrow keys to explore wide diagrams. */}
              <section
                className="roof-diagram-scroll"
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
                  loading="lazy"
                  decoding="async"
                />
              </section>
              <figcaption className="roof-diagram-hint">
                {t(
                  '横にスクロールして全体を確認できます',
                  'Scroll horizontally to explore',
                )}
              </figcaption>
            </figure>
          </ProjectChapter>
          <ProjectChapter id="decisions" number="05" title="DESIGN DECISIONS">
            <div className="decision-list">
              {project.decisions.map((decision) => (
                <section key={decision.title}>
                  <h3>{decision.title}</h3>
                  <p>{decision.detail}</p>
                </section>
              ))}
            </div>
          </ProjectChapter>
          <ProjectChapter id="verification" number="06" title="VERIFICATION">
            <ul className="evidence-list">
              {project.evidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </ProjectChapter>
          <ProjectChapter id="status" number="07" title="STATUS & NEXT">
            <p>{project.now}</p>
            {project.next.length > 0 && (
              <div className="project-next">
                <h3>{t('今後の予定', 'NEXT STEPS')}</h3>
                <ul>
                  {project.next.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </ProjectChapter>
        </article>
        <aside className="detail-aside">
          <nav
            className="toc project-toc"
            aria-label={t('ページ内の目次', 'On this page')}
          >
            <details open>
              <summary>{t('このページの内容', 'ON THIS PAGE')}</summary>
              <ol className="toc-list">
                {chapters.map(([id, title], index) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={activeChapter === id ? 'true' : undefined}
                    >
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {title}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          </nav>
          <div className="project-facts">
            <h2>{t('基本情報', 'FACTS')}</h2>
            <dl className="facts-list">
              {project.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
      <div className="page-return">
        <a className="text-link" href={`${prefix}/projects`}>
          {t('つくったもの一覧に戻る', 'Back to all projects')}
          <RoofArrow />
        </a>
      </div>
    </div>
  );
}
