'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Accepted raster illustration and full-page routes. */
import { useEffect } from 'react';
import { useLocale } from '../locale';
import { LikesUpdated, QiitaLikes } from '../qiita-likes';
import { formatArticleDate } from '@/lib/article-date';
import { initializeRoofLife } from '@/components/roof-home/life.js';
import { RoofProjectMark } from './roof-project-mark';
import type { HomeData } from './types';
import '@/components/roof-home/home.css';

const lifeAssets = [
  ['tree-spring', 'tree-spring.png'],
  ['tree-summer', 'tree-summer.png'],
  ['tree-autumn', 'tree-autumn.png'],
  ['tree-winter', 'tree-winter.png'],
  ['resident-work', 'resident-work-chair-v5.png'],
  ['chair-empty', 'empty-chair-v5.png'],
  ['workspace', 'workspace-clear-v5.png'],
  ['resident-reading', 'resident-reading-v3.png'],
  ['resident-stair', 'resident-stair-v3.png'],
  ['resident-stair-down', 'resident-stair-down-v4.png'],
  ['resident-sleep', 'resident-sleep-v4.png'],
  ['bedroom', 'bedroom-v3.png'],
  ['library', 'library-v3.png'],
] as const;
const featuredSlugs = ['lissue', 'ragy', 'architecture-sandbox'];

function RoofArrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <i
      className={`icon ${diagonal ? 'arrow-up-icon' : 'arrow-icon'}`}
      aria-hidden="true"
    />
  );
}

export function Home({ data }: { data: HomeData; preview?: boolean }) {
  const { t, en } = useLocale();
  const { projects, articles, about } = data;
  useEffect(() => initializeRoofLife(), []);
  return (
    <div className="roof-home wrap">
      <section
        className="hero"
        aria-label={t('morimizuの個人サイト', 'morimizu’s personal website')}
      >
        <div className="intro">
          <h1>
            MORIMIZU’S
            <br />
            HOUSE.
          </h1>
          <p className="lead">
            {t(
              'ソフトウェアエンジニアの個人サイト。',
              'A software engineer’s personal website.',
            )}
          </p>
          <p className="hero-description">
            {t(
              '個人開発のアプリと、技術記事をまとめています。',
              'Apps I build and technical articles I write.',
            )}
          </p>
          <div className="house-controls">
            <label className="season-control">
              <span>SEASON</span>
              <select
                id="season-select"
                aria-label={t('街路樹の季節', 'Season of the street tree')}
                defaultValue="auto"
              >
                <option value="auto">Auto</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn</option>
                <option value="winter">Winter</option>
              </select>
            </label>
            <button type="button" id="life-pause" aria-pressed="false">
              Pause
            </button>
          </div>
        </div>
        <div className="building">
          <div className="life-assets" hidden aria-hidden="true">
            {lifeAssets.map(([key, file]) => (
              <img
                key={key}
                id={
                  ['workspace', 'bedroom', 'library'].includes(key)
                    ? `${key}-source`
                    : undefined
                }
                data-life-asset={key}
                src={`/roof/life/${file}`}
                alt=""
                width="1"
                height="1"
              />
            ))}
          </div>
          <img
            id="building-source"
            data-scene="editorial"
            src="/roof/house-editorial.png"
            width="1145"
            height="1374"
            alt={t(
              '3階建ての家。上から自己紹介、記事、つくったものの部屋。',
              'A three-storey house, with About, Notes and Works from top to bottom.',
            )}
            fetchPriority="high"
          />
          <canvas
            id="building-scene"
            width="1145"
            height="1374"
            aria-hidden="true"
          />
          <nav
            aria-label={t(
              '家の各階からページへ',
              'Explore the rooms of the house',
            )}
          >
            <a
              className="room about"
              data-panel="about"
              href="/about"
              aria-label={t('3階：自己紹介を開く', 'Third floor: open About')}
            >
              <span className="room-label">
                <strong>ABOUT</strong>
                <span>
                  {t('自己紹介', 'About me')}
                  <RoofArrow />
                </span>
              </span>
            </a>
            <a
              className="room notes"
              data-panel="notes"
              href="/notes"
              aria-label={t('2階：記事を開く', 'Second floor: open Notes')}
            >
              <span className="room-label">
                <strong>NOTES</strong>
                <span>
                  {t('記事', 'Articles')}
                  <RoofArrow />
                </span>
              </span>
            </a>
            <a
              className="room software"
              data-panel="software"
              href="/projects"
              aria-label={t(
                '1階：つくったものを開く',
                'First floor: open Works',
              )}
            >
              <span className="room-label">
                <strong>WORKS</strong>
                <span>
                  {t('つくったもの', 'My projects')}
                  <RoofArrow />
                </span>
              </span>
            </a>
          </nav>
        </div>
      </section>
      <section
        className="projects section"
        id="projects"
        aria-labelledby="projects-title"
      >
        <div className="section-heading">
          <h2 id="projects-title">WORKS</h2>
          <a className="text-link" href="/projects">
            {t('すべて見る', 'View all')}
            <RoofArrow />
          </a>
        </div>
        <div className="project-grid">
          {featuredSlugs
            .map((slug) => projects.find((project) => project.ja.slug === slug))
            .filter((project) => project !== undefined)
            .map((localized) => {
              const project = en ? localized.en : localized.ja;
              return (
                <a
                  key={project.slug}
                  className="project"
                  href={`/projects/${project.slug}`}
                  aria-label={t(
                    `${project.name} の紹介を読む`,
                    `Read about ${project.name}`,
                  )}
                >
                  <RoofProjectMark
                    kind={project.slug}
                    className="project-icon"
                  />
                  <h3>{project.name}</h3>
                  <p>{project.tagline}</p>
                  <span
                    className={`project-status${project.slug === 'ragy' ? ' daily' : ''}`}
                  >
                    <span className="status-dot" />
                    {project.status}
                  </span>
                  <i
                    className="icon project-arrow arrow-up-icon"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
        </div>
      </section>
      <section
        className="notes section"
        id="notes"
        aria-labelledby="notes-title"
      >
        <div className="section-heading">
          <h2 id="notes-title">NOTES</h2>
          <a className="text-link" href="/notes">
            {t('記事一覧', 'All articles')}
            <RoofArrow />
          </a>
        </div>
        <div className="article-list">
          {articles.slice(0, 3).map((article) => (
            <a
              key={article.id}
              className="article"
              href={`/notes/${article.id}`}
            >
              <div className="article-meta">
                <time dateTime={article.updatedAt}>
                  {formatArticleDate(article.updatedAt).replaceAll('/', '.')}
                </time>
                <QiitaLikes id={article.id} />
              </div>
              <h3 lang="ja">{article.title}</h3>
              <RoofArrow />
            </a>
          ))}
        </div>
        <LikesUpdated />
      </section>
      <section
        className="about-strip section"
        id="about"
        aria-label={t('自己紹介', 'About me')}
      >
        <img
          className="profile-photo profile-icon"
          src="/roof/profile-morimizu.png"
          width="1254"
          height="1254"
          alt="morimizu"
          loading="lazy"
          decoding="async"
        />
        <div className="about-copy">
          <h2>ABOUT</h2>
          <p className="about-person-name">{about.name}</p>
          <p>
            {t(
              'ソフトウェアエンジニア。個人開発と技術記事の執筆をしています。',
              'Software engineer. I build personal projects and write technical articles.',
            )}
          </p>
        </div>
        <div className="about-actions">
          <a className="text-link" href="/about">
            {t('自己紹介', 'About me')}
            <RoofArrow />
          </a>
          <a
            className="text-link resume-link"
            href={en ? '/en/resume' : '/resume'}
          >
            {t('職務経歴書', 'Résumé')}
            <RoofArrow />
          </a>
        </div>
      </section>
    </div>
  );
}
