// Imported by Server Components (and the standalone development preview only).
// Never import this module into a production Client Component.
import { projects } from '@/lib/projects';
import { projectsEn } from '@/lib/projects-en';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
import { getAllQiitaArticles, type QiitaArticle } from '@/lib/qiita-articles';
import type { Project } from '@/lib/projects';
import type { ArticleSummary, ProjectSummary, HomeData } from './types';
const images = import.meta.glob('../../../public/projects/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;
const diagrams = import.meta.glob(
  '../../../public/projects/architecture/*.svg',
  { eager: true, import: 'default', query: '?raw' },
) as Record<string, string>;
function diagramForPreview(svg: string | undefined) {
  if (!svg) return undefined;
  // The factual diagram content stays intact; only its original theme tokens
  // are mapped to this preview's palette. No production SVG is overwritten.
  const palette: Record<string, string> = {
    '#f4f1e8': '#ffffff',
    '#fbfaf5': '#ffffff',
    '#17241e': '#151519',
    '#327871': '#2449ff',
    '#536159': '#67676f',
    '#eaf1ec': '#f0f2ff',
    '#8fc3b9': '#bac6ff',
  };
  const themed = svg.replace(
    /#[0-9a-f]{6}/gi,
    (color) => palette[color.toLowerCase()] ?? color,
  );
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(themed)}`;
}

export function articleSummary(article: QiitaArticle): ArticleSummary {
  const { id, title, tags, updatedAt, readingMinutes, qiitaUrl } = article;
  return { id, title, tags, updatedAt, readingMinutes, qiitaUrl };
}
function projectSummary(project: Project): ProjectSummary {
  const { slug, number, name, shortName, category, status, tagline } = project;
  return { slug, number, name, shortName, category, status, tagline };
}
export function getProjectCards() {
  return projects.map((project) => ({
    ja: projectSummary(project),
    en: projectSummary(
      projectsEn.find((p) => p.slug === project.slug) ?? project,
    ),
  }));
}
export function getHomeData(): HomeData {
  const articles = getAllQiitaArticles();
  return {
    projects: getProjectCards(),
    articles: articles.slice(0, 3).map(articleSummary),
    articleCount: articles.length,
    about: {
      name: RESUME_EN.name,
      role: RESUME_JA.role,
      summary: { ja: RESUME_JA.summary, en: RESUME_EN.summary },
    },
  };
}
export function getProjectData(slug: string) {
  const ja = projects.find((p) => p.slug === slug);
  if (!ja) return undefined;
  const en = projectsEn.find((p) => p.slug === slug) ?? ja;
  const screenshot = (project: Project) =>
    project.image ? images['../../../public' + project.image.src] : undefined;
  const architecture = (project: Project) =>
    diagramForPreview(diagrams['../../../public' + project.architecture.src]);
  return {
    project: { ja, en },
    screenshots: { ja: screenshot(ja), en: screenshot(en) },
    architectures: { ja: architecture(ja), en: architecture(en) },
  };
}
