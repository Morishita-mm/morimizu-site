/* oxlint-disable next/no-html-link-for-pages -- Standalone local preview. */
import { ArrowUpRight } from 'lucide-react';
import { useLocale } from '../workshop/locale';
import { NotesHeading } from '../workshop/site/notes-heading';
import { NotesPage } from '../workshop/site/notes';
import { AboutPage } from '../workshop/site/about';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
import { articleSummary } from '../workshop/site/data';
import { Origori, PlayfulOrigori } from './origori-motion';

export function OrigoriNotes() {
  return (
    <div className="shell o-notes-page">
      <div className="o-notes-heading">
        <NotesHeading section="qiita" />
        <PlayfulOrigori initialPose="idea" className="o-notes-companion" />
      </div>
      <NotesPage
        contentOnly
        articles={getAllQiitaArticles().map(articleSummary)}
      />
    </div>
  );
}

export function OrigoriAbout() {
  const { t } = useLocale();
  return (
    <>
      <AboutPage
        companion={
          <div className="o-about-origori">
            <div className="o-about-orbit" aria-hidden="true" />
            <span className="o-about-stamp">
              ORIGORI
              <br />
              <small>MAKE / THINK / PLAY</small>
            </span>
            <PlayfulOrigori initialPose="sitting" />
            <div className="o-about-companion-label">
              <span>
                {t('つくる人の、となりに。', 'A maker’s little companion.')}
              </span>
              <p>
                {t(
                  '考えたり、つくったり、ときどき休んだり。',
                  'Thinking, making, and taking a little break.',
                )}
              </p>
            </div>
          </div>
        }
      />
      <section
        className="shell o-origori-story"
        aria-labelledby="origori-story-title"
      >
        <div>
          <p className="o-eyebrow">MEET ORIGORI</p>
          <h2 id="origori-story-title">
            {t(
              'どんなかたちでも、いっしょに。',
              'Every shape, same companion.',
            )}
          </h2>
          <p>
            {t(
              'ゴリラと折り紙のあいのこ、オリゴリ。考えがまとまらない日も、ひらめいた日も、このサイトのとなりにいます。',
              'Part gorilla, part origami. Origori keeps this site company, through tangled thoughts and new ideas.',
            )}
          </p>
        </div>
        <a
          href="/projects"
          data-origori-flight="standing"
          className="o-story-flight"
        >
          <Origori pose="standing" />
          <span>
            {t('いっしょに、つくったものへ', 'Fly to the projects')}
            <ArrowUpRight size={18} />
          </span>
          <small>
            {t(
              'オリゴリを押すと、ひとっとび。',
              'Click Origori to take flight.',
            )}
          </small>
        </a>
      </section>
    </>
  );
}
