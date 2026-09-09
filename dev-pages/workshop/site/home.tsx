'use client';
/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Optimized native images and existing routes. */
import { useLocale } from '../locale';
import { ControlLabel } from '@/components/control-label';
import { MountainIcon } from '@/components/mountain-icon';
import { BrandWordmark } from '../brand-concepts';
import { ProjectCarousel } from '../project-carousel';
import { LikesUpdated } from '../qiita-likes';
import { Arrow, SectionHeading, ProjectCard, NoteRow } from './components';
import type { HomeData } from './types';
import panorama from '../assets/editorial-cover.webp?url';
import panorama480 from '../assets/editorial-cover-480.webp?url';
import panorama768 from '../assets/editorial-cover-768.webp?url';
import panorama1080 from '../assets/editorial-cover-1080.webp?url';
export function Home({
  data,
  preview = false,
}: {
  data: HomeData;
  preview?: boolean;
}) {
  const { t, en } = useLocale();
  const { projects, articles, articleCount, about } = data;
  return (
    <>
      <section className="e-home-hero shell">
        <div className="masthead">
          <h1>
            <span className="adopted-lockup">
              <MountainIcon />
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
              {about.name}
              <br />
              <small>Software Engineer</small>
            </span>
            <Arrow diagonal />
          </a>
        </div>
        <figure className="e-panorama">
          <img
            src={panorama}
            srcSet={`${panorama480} 480w, ${panorama768} 768w, ${panorama1080} 1080w, ${panorama} 1536w`}
            sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), (max-width: 1456px) calc(100vw - 96px), 1360px"
            alt={t(
              '黒い細線の構造を鮮やかなブルーの面が横切る、AI生成の抽象作品',
              'AI-generated abstract artwork with vivid blue planes crossing fine black structures',
            )}
            width="1536"
            height="928"
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
              key={project.ja.slug}
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
          count={articleCount}
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
              {about.name}
              <br />
              <span>{about.role}</span>
            </h2>
            <p>{about.summary[en ? 'en' : 'ja']}</p>
            <a href={en ? '/en/resume' : '/resume'} className="e-solid-link">
              <ControlLabel
                locale={en ? 'en' : 'ja'}
                ja="職務経歴書"
                en="Résumé"
              />{' '}
              <Arrow />
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
