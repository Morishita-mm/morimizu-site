import type { Project } from '@/lib/projects';
import type { QiitaArticle } from '@/lib/qiita-articles';
export type Localized<T> = { ja: T; en: T };
export type ProjectSummary = Pick<
  Project,
  'slug' | 'number' | 'name' | 'shortName' | 'category' | 'status' | 'tagline'
>;
export type ArticleSummary = Pick<
  QiitaArticle,
  'id' | 'title' | 'tags' | 'updatedAt' | 'readingMinutes' | 'qiitaUrl'
>;
export type HomeData = {
  projects: Localized<ProjectSummary>[];
  articles: ArticleSummary[];
  articleCount: number;
  about: { name: string; role: string; summary: Localized<string | undefined> };
};
