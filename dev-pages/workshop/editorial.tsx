'use client';
/* oxlint-disable next/no-img-element -- Isolated Vite prototype; local image assets are optimized WebP. */
/* oxlint-disable next/no-html-link-for-pages -- These are standalone Vite routes, not Next.js pages. */
import { lazy, Suspense } from 'react';
import panorama from './assets/editorial-cover.webp?url';

import { projects, type Project } from '@/lib/projects';
import { projectsEn } from '@/lib/projects-en';
import {
  LocaleProvider,
  LanguageToggle,
  useLocale,
  type Locale,
} from './locale';
import {
  getAllQiitaArticles,
  getQiitaArticle,
  formatArticleDate,
  type QiitaArticle,
} from '@/lib/qiita-articles';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
import { LINKEDIN_URL } from '@/lib/social-links';
import { TECH_INTERVIEWER_URL } from '@/lib/project-links';
import { PosterResumeView } from '@/components/poster-resume';
import { ProjectCarousel } from './project-carousel';
import { QiitaLikes, LikesUpdated } from './qiita-likes';
import { BrandConcepts, BrandWordmark } from './brand-concepts';
import { SiteIcon } from './site-identity';
import { OriginalProjectMark } from './original-project-mark';
import './editorial.css';
import './legacy-resume.css';

const NoteBody = lazy(() => import('./note-body'));
const articles = getAllQiitaArticles();
const images = import.meta.glob('../../public/projects/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;
const diagrams = import.meta.glob('../../public/projects/architecture/*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

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

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
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

function Mark({ kind }: { kind: string }) {
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

function Header({ path, preview }: { path: string; preview: boolean }) {
  const { t } = useLocale();
  return (
    <>
      <a href="#content" className="e-skip">
        {t('本文へスキップ', 'Skip to content')}
      </a>
      <header className="e-header shell">
        <a
          href="/"
          className="e-brand"
          aria-label={t('morimizu works ホーム', 'morimizu works Home')}
        >
          <SiteIcon variant="shoulder-raised" />
        </a>
        <nav aria-label={t('メインナビゲーション', 'Main navigation')}>
          <a
            href="/projects"
            aria-current={path.startsWith('/projects') ? 'page' : undefined}
          >
            <span>01</span>Projects
          </a>
          <a
            href="/notes"
            aria-current={path.startsWith('/notes') ? 'page' : undefined}
          >
            <span>02</span>Notes
          </a>
          <a
            href="/about"
            aria-current={path.endsWith('/about') ? 'page' : undefined}
          >
            <span>03</span>About
          </a>
        </nav>
        <a className="header-contact" href={LINKEDIN_URL}>
          LinkedIn <Arrow diagonal />
        </a>
        <LanguageToggle />
        {preview && <span className="e-local">LOCAL PREVIEW</span>}
      </header>
    </>
  );
}

function Footer() {
  const { t } = useLocale();
  return (
    <footer className="e-footer shell">
      <a className="footer-wordmark" href="/">
        <span className="adopted-lockup">
          <SiteIcon variant="shoulder-raised" />
          <BrandWordmark variant="shoulder-raised" />
        </span>
        <svg
          className="footer-home-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <div>
        <p>
          {t('つくったもの。書いたこと。', 'Things I build. Things I write.')}
        </p>
        <nav aria-label={t('フッターナビゲーション', 'Footer navigation')}>
          <a href="/projects">Projects</a>
          <a href="/notes">Notes</a>
          <a href="/about">About</a>
          <a href="https://github.com/Morishita-mm">GitHub ↗</a>
        </nav>
        <small>© 2026 Mizuki</small>
      </div>
    </footer>
  );
}

function SectionHeading({
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

function ProjectCard({ project: original }: { project: Project }) {
  const { en } = useLocale();
  const project =
    (en ? projectsEn.find((item) => item.slug === original.slug) : original) ??
    original;
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

function NoteRow({ article, index }: { article: QiitaArticle; index: number }) {
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

function Home({ preview }: { preview: boolean }) {
  const { t, en } = useLocale();
  return (
    <>
      <section className="e-home-hero shell">
        <div className="masthead">
          <h1>
            <span className="adopted-lockup">
              <SiteIcon variant="shoulder-raised" />
              <BrandWordmark variant="shoulder-raised" />
            </span>
          </h1>
        </div>
        {preview && (
          <a className="brand-review-link" href="/brand-lab">
            {t('Mアイコン・ロゴを見る ↗', 'Review icon and logo ↗')}
          </a>
        )}
        <div className="hero-editorial">
          <h2>
            {t('自分で使うものを、', 'Tools for my own work,')}
            <br />
            {t('まず小さく', 'starting small,')}
            <br />
            {t('つくっています。', 'built by me.')}
          </h2>
          <p>
            {t(
              'Mizukiです。開発中に感じる「もう少し楽にできそう」を、自分で使う小さな道具にしています。使って気づいたことも、ここに残しています。',
              'I’m Mizuki. I turn everyday development friction into small tools I use myself, and share what I learn along the way.',
            )}
          </p>
          <a href="/about" className="hero-resume">
            <span>
              {RESUME_EN.name}
              <br />
              <small>Software Engineer</small>
            </span>
            <Arrow diagonal />
          </a>
        </div>
        <figure className="e-panorama">
          <img
            src={panorama}
            alt={t(
              '黒い細線の構造を鮮やかなブルーの面が横切る、AI生成の抽象作品',
              'AI-generated abstract artwork with vivid blue planes crossing fine black structures',
            )}
            width="1536"
            height="1024"
            fetchPriority="high"
          />
          <figcaption>
            <span>{t('MIZUKIの個人開発', 'MIZUKI’S PERSONAL PROJECTS')}</span>
            <span>
              {t('つくったもの / 技術ノート', 'PROJECTS / TECHNICAL NOTES')}
            </span>
          </figcaption>
        </figure>
      </section>
      <section className="e-home-projects shell">
        <SectionHeading
          number="01"
          title={t('つくったもの', 'Projects')}
          count={projects.length}
          href="/projects"
        />
        <ProjectCarousel>
          {projects.map((project, index) => (
            <li
              key={project.slug}
              aria-label={`${index + 1} / ${projects.length}`}
            >
              <ProjectCard project={project} />
            </li>
          ))}
        </ProjectCarousel>
      </section>
      <section className="e-home-notes shell">
        <SectionHeading
          number="02"
          title={t('技術ノート', 'Technical notes')}
          count={articles.length}
          href="/notes"
        />
        <ol className="e-note-list">
          {articles.slice(0, 3).map((article, index) => (
            <NoteRow key={article.id} article={article} index={index} />
          ))}
        </ol>
        <LikesUpdated />
      </section>
      <section className="e-home-about">
        <div className="shell home-about-inner">
          <span className="e-index">03 / ABOUT</span>
          <div>
            <h2>
              {RESUME_EN.name}
              <br />
              <span>{RESUME_JA.role}</span>
            </h2>
            <p>{(en ? RESUME_EN : RESUME_JA).summary}</p>
            <a href="/about" className="e-solid-link">
              {t('職務経歴書', 'Résumé')} <Arrow />
            </a>
          </div>
          <div className="about-skills">
            {['Rust', 'Python', 'C / C++', 'Docker', 'Java', 'Spring Boot'].map(
              (skill) => (
                <span key={skill}>{skill}</span>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectsPage() {
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
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}

function NotesPage() {
  const { t } = useLocale();
  return (
    <div className="shell">
      <header className="e-page-heading">
        <p className="e-kicker">02 / NOTES</p>
        <h1>
          {t('Qiitaに書いたものを、', 'From Qiita,')}
          <br />
          {t('ここでも。', 'collected here.')}
        </h1>
        <p>
          {t(
            '実装で詰まったところや、あとで見返したいことを書いています。Qiitaで公開した記事を、このサイトにもそのまま載せています。',
            'Implementation challenges and notes worth revisiting. These articles are reproduced from Qiita in their original Japanese.',
          )}
        </p>
      </header>
      <div className="e-list-caption">
        <h2>
          {t('記事を読む', 'Articles')} <span>{articles.length}</span>
        </h2>
        <span>{t('新しい順', 'Newest first')}</span>
      </div>
      <ol className="e-note-list">
        {articles.map((article, index) => (
          <NoteRow key={article.id} article={article} index={index} />
        ))}
      </ol>
      <LikesUpdated />
      <a className="e-outline-link" href="https://qiita.com/morimizu">
        {t('Qiitaのプロフィールを見る', 'View Qiita profile')}{' '}
        <Arrow diagonal />
      </a>
    </div>
  );
}

function AboutPage() {
  const { en } = useLocale();
  return (
    <div className="e-legacy-resume">
      <PosterResumeView
        siteIcon={<SiteIcon variant="shoulder-raised" />}
        data={en ? RESUME_EN : RESUME_JA}
        locale={en ? 'en' : 'ja'}
      />
    </div>
  );
}

function ProjectPage({ project: original }: { project: Project }) {
  const { en, t } = useLocale();
  const project =
    (en ? projectsEn.find((item) => item.slug === original.slug) : original) ??
    original;
  const primaryLink =
    project.primaryLink ??
    (project.slug === 'tech-interviewer'
      ? { label: t('アプリを開く', 'Open app'), href: TECH_INTERVIEWER_URL }
      : undefined);
  const screenshot = project.image
    ? images[`../../public${project.image.src}`]
    : undefined;
  const architecture = diagramForPreview(
    diagrams[`../../public${project.architecture.src}`],
  );
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

function ArticlePage({ article }: { article: QiitaArticle }) {
  const { t } = useLocale();
  return (
    <article className="e-article shell">
      <a href="/notes" className="e-back">
        {t('← 技術ノート', '← Technical notes')}
      </a>
      <header>
        <p className="e-kicker">
          <time dateTime={article.updatedAt}>
            {formatArticleDate(article.updatedAt)}
          </time>{' '}
          / {article.readingMinutes}
          {t('分で読めます', ' min read · Japanese')}
        </p>
        <h1>{article.title}</h1>
        <div className="e-tags">
          {article.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a href={article.qiitaUrl} className="e-outline-link">
          {t('Qiitaで読む', 'Read on Qiita')} <Arrow diagonal />
        </a>
      </header>
      <Suspense
        fallback={
          <p className="article-loading">
            {t('記事を読み込んでいます…', 'Loading article…')}
          </p>
        }
      >
        <NoteBody content={article.content} />
      </Suspense>
      <a href="/notes" className="e-outline-link">
        {t('記事一覧に戻る', 'Back to articles')} <Arrow />
      </a>
    </article>
  );
}

function Page({ path, preview }: { path: string; preview: boolean }) {
  const { t } = useLocale();
  if (path === '/') return <Home preview={preview} />;
  if (preview && path === '/brand-lab') return <BrandConcepts />;
  if (path === '/projects') return <ProjectsPage />;
  if (path === '/notes') return <NotesPage />;
  if (path === '/about' || path === '/en/about') return <AboutPage />;
  const project = projects.find(
    (item) =>
      path === `/projects/${item.slug}` || path === `/blueprint/${item.slug}`,
  );
  if (project) return <ProjectPage project={project} />;
  const article = path.startsWith('/notes/')
    ? getQiitaArticle(path.slice('/notes/'.length))
    : undefined;
  if (article) return <ArticlePage article={article} />;
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
    <LocaleProvider
      initialLocale={initialLocale ?? (path === '/en/about' ? 'en' : 'ja')}
    >
      <Header path={path} preview={preview} />
      <main id="content">
        <Page path={path} preview={preview} />
      </main>
      <Footer />
    </LocaleProvider>
  );
}
