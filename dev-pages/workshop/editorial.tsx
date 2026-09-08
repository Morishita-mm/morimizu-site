// Standalone development preview. Production imports individual page views.
/* oxlint-disable next/no-html-link-for-pages -- Standalone Vite preview routes. */
import { lazy, Suspense } from 'react';
import './editorial.css';
import '@/app/theme.css';
import { getAllQiitaArticles, getQiitaArticle } from '@/lib/qiita-articles';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
import { useLocale, type Locale } from './locale';
import { BrandConcepts } from './brand-concepts';
import { SiteShell } from './site/shell';
import { Home } from './site/home';
import { ProjectsPage } from './site/projects';
import { NotesPage } from './site/notes';
import { AboutPage } from './site/about';
import { ProjectPage } from './site/project';
import { ArticlePage } from './site/article';
import { Arrow } from './site/components';
import {
  getHomeData,
  getProjectCards,
  getProjectData,
  articleSummary,
} from './site/data';
const NoteBody = lazy(() => import('./note-body'));
function Page({ path, preview }: { path: string; preview: boolean }) {
  const { t } = useLocale();
  if (path === '/') return <Home data={getHomeData()} preview={preview} />;
  if (preview && path === '/brand-lab') return <BrandConcepts />;
  if (path === '/projects')
    return <ProjectsPage projects={getProjectCards()} />;
  if (path === '/notes')
    return <NotesPage articles={getAllQiitaArticles().map(articleSummary)} />;
  if (path === '/about' || path === '/en/about')
    return <AboutPage resume={{ ja: RESUME_JA, en: RESUME_EN }} />;
  const project =
    path.startsWith('/projects/') || path.startsWith('/blueprint/')
      ? getProjectData(path.split('/')[2])
      : undefined;
  if (project) return <ProjectPage {...project} />;
  const article = path.startsWith('/notes/')
    ? getQiitaArticle(path.slice('/notes/'.length))
    : undefined;
  if (article)
    return (
      <ArticlePage article={articleSummary(article)}>
        <Suspense
          fallback={
            <p className="article-loading">
              {t('記事を読み込んでいます…', 'Loading article…')}
            </p>
          }
        >
          <NoteBody content={article.content} />
        </Suspense>
      </ArticlePage>
    );
  return (
    <div className="shell e-not-found">
      <h1>404</h1>
      <a className="e-solid-link" href="/">
        {t('ホームへ戻る', 'Back to home')} <Arrow />
      </a>
    </div>
  );
}
export function Preview({
  path,
  initialLocale,
  preview = true,
}: {
  path: string;
  initialLocale?: Locale;
  preview?: boolean;
}) {
  return (
    <SiteShell
      path={path}
      initialLocale={initialLocale ?? (path === '/en/about' ? 'en' : 'ja')}
      preview={preview}
    >
      <Page path={path} preview={preview} />
    </SiteShell>
  );
}
