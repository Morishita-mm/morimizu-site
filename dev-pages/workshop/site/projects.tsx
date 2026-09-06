'use client';
import { useLocale } from '../locale';
import { ProjectCard } from './components';
import type { Localized, ProjectSummary } from './types';
export function ProjectsPage({
  projects,
}: {
  projects: Localized<ProjectSummary>[];
}) {
  const { t } = useLocale();
  return (
    <div className="shell">
      <header className="e-page-heading">
        <p className="e-kicker">01 / PROJECTS</p>
        <h1>
          {t('ほしかったもの', 'Things I wanted.')}
          <br />
          {t('つくってみたもの', 'Things I built.')}
        </h1>
        <p>
          {t(
            '配布中、日常利用中、技術プロトタイプ。状態を分けて、実物と設計判断を載せています。',
            'Released tools, daily drivers, and technical prototypes—with their current status, working examples, and design decisions.',
          )}
        </p>
      </header>
      <div className="e-project-grid all-projects">
        {projects.map((project) => (
          <ProjectCard key={project.ja.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
