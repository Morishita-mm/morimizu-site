/* oxlint-disable next/no-img-element, next/no-html-link-for-pages -- Standalone local design preview. */
import { Suspense, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { Preview, PreviewPage } from '../workshop/editorial';
import { LocaleProvider, LanguageToggle, useLocale } from '../workshop/locale';
import { ThemeToggle } from '@/components/theme-toggle';
import { MountainIcon } from '@/components/mountain-icon';
import { getHomeData } from '../workshop/site/data';
import { NoteRow, ProjectCard } from '../workshop/site/components';
import { LikesUpdated } from '../workshop/qiita-likes';
import { Origori, PlayfulOrigori, FlightNavigation } from './origori-motion';
import { OrigoriNotes, OrigoriAbout } from './companion-pages';
import { MascotGallery } from './mascot-gallery';
import { ScrollCompanion } from './scroll-companion';
import '@/lib/generated/fonts/noto.css';
import './style.css';

const homeData = getHomeData();
const path = window.location.pathname.replace(/\/$/, '') || '/';
const pagePath = path.replace(/^\/en(?=\/|$)/, '') || '/';
const current = new URLSearchParams(location.search).get('view') === 'current';

function PreviewBar() {
  const comparisonPath = pagePath === '/origori-assets' ? '/' : pagePath;
  return (
    <aside className="o-preview-bar" aria-label="デザイン案の比較">
      <span>
        <i /> LOCAL DESIGN{' '}
        <span className="o-preview-caption">/ オリゴリと、つくる。</span>
      </span>
      <nav aria-label="デザイン切り替え">
        <a
          href={comparisonPath}
          aria-current={
            !current && pagePath !== '/origori-assets' ? 'page' : undefined
          }
        >
          オリゴリ案
        </a>
        <a
          href={`${comparisonPath}?view=current`}
          aria-current={current ? 'page' : undefined}
        >
          現行デザイン
        </a>
        <a
          href="/origori-assets"
          aria-current={pagePath === '/origori-assets' ? 'page' : undefined}
        >
          素材一覧
        </a>
      </nav>
    </aside>
  );
}

function Brand() {
  return (
    <a className="o-brand" href="/" aria-label="morimizu works ホーム">
      <MountainIcon />
      <span>
        morimizu <em>works</em>
        <i>.</i>
      </span>
    </a>
  );
}

function Header() {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  const links = (
    <>
      {[
        ['/projects', 'Projects', 'つくったもの'],
        ['/notes', 'Notes', '書いたこと'],
        ['/about', 'About', 'わたしのこと'],
      ].map(([href, label, ja]) => (
        <a
          href={href}
          key={href}
          aria-current={pagePath.startsWith(href) ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          {label}
          <small>{t(ja, '')}</small>
        </a>
      ))}
    </>
  );
  return (
    <>
      <a href="#content" className="e-skip">
        {t('本文へスキップ', 'Skip to content')}
      </a>
      <header
        className="o-header shell"
        ref={header}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        <Brand />
        <nav
          className="o-desktop-nav"
          aria-label={t('メインナビゲーション', 'Main navigation')}
        >
          {links}
        </nav>
        <div className="o-tools">
          <ThemeToggle locale={locale} />
          <LanguageToggle />
          <button
            type="button"
            className="o-menu"
            ref={trigger}
            aria-label={t(
              open ? 'メニューを閉じる' : 'メニューを開く',
              open ? 'Close menu' : 'Open menu',
            )}
            aria-expanded={open}
            aria-controls="origori-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav
          id="origori-mobile-nav"
          className="o-mobile-nav"
          aria-label={t('モバイルナビゲーション', 'Mobile navigation')}
          hidden={!open}
        >
          {links}
        </nav>
      </header>
    </>
  );
}

function Home() {
  const { t } = useLocale();
  return (
    <>
      <section className="o-hero shell" aria-labelledby="home-title">
        <div className="o-hero-copy">
          <p className="o-eyebrow">
            <span /> MIZUKI’S PERSONAL WORKS
          </p>
          <h1 id="home-title">
            {t('つくって、ためして。', 'Make a little.')}
            <br />
            <span>{t('少しずつ、かたちに。', 'See what unfolds.')}</span>
          </h1>
          <p className="o-intro">
            {t(
              'Mizukiです。開発中に感じる「もう少し楽にできそう」を、自分で使う小さな道具にしています。',
              'I’m Mizuki. I turn everyday development friction into small tools I use myself.',
            )}
            <br />
            {t(
              'つくったものと、途中で見つけたことを、ここに。',
              'Here are the things I build and what I learn along the way.',
            )}
          </p>
          <div className="o-hero-links">
            <a className="o-button" href="#projects">
              {t('つくったものを見る', 'Explore my projects')}
              <ArrowDown size={18} />
            </a>
            <a className="o-text-link" href="/about">
              {t('わたしのこと', 'A little about me')}
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="o-hero-footnote">
            <span>CODE, NOTES & A LITTLE CURIOSITY</span>
            <span>↓ SCROLL AT YOUR OWN PACE</span>
          </div>
        </div>
        <div className="o-hero-art">
          <div className="o-paper-orbit" aria-hidden="true" />
          <PlayfulOrigori />
          <div className="o-character-sign">
            <span>ORIGORI</span>
            <p>{t('つくる、のとなりに。', 'A little making companion.')}</p>
          </div>
          <span className="o-art-cross" aria-hidden="true">
            ＋
          </span>
        </div>
      </section>

      <nav
        className="o-doorways shell"
        aria-label={t('このサイトの入り口', 'Explore this site')}
      >
        {[
          {
            n: '01',
            title: 'Projects',
            label: t(
              '小さな「ほしい」を、つくる。',
              'Small tools for everyday needs.',
            ),
            href: '/projects',
            pose: 'standing' as const,
          },
          {
            n: '02',
            title: 'Notes',
            label: t('やってみて、わかったこと。', 'Things learned by trying.'),
            href: '/notes',
            pose: 'idea' as const,
          },
          {
            n: '03',
            title: 'About',
            label: t(
              'つくっている人のこと。',
              'The person behind the projects.',
            ),
            href: '/about',
            pose: 'sitting' as const,
          },
        ].map((item) => (
          <a key={item.href} href={item.href} data-origori-flight={item.pose}>
            <span className="o-doorway-number">{item.n}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.label}</p>
            </div>
            <Origori pose={item.pose} />
            <ArrowUpRight className="o-doorway-arrow" size={19} />
          </a>
        ))}
      </nav>

      <section
        className="o-projects shell o-section"
        id="projects"
        aria-labelledby="projects-title"
      >
        <header className="o-section-heading">
          <div>
            <p className="o-eyebrow">01 / PROJECTS</p>
            <h2 id="projects-title">
              {t(
                '小さくつくって、育てていく。',
                'Small beginnings, growing ideas.',
              )}
            </h2>
            <p>
              {t(
                '自分の「これがほしい」から始まった、個人開発の道具たち。',
                'Personal projects that started with “I wish I had a tool for this.”',
              )}
            </p>
          </div>
          <a className="o-text-link" href="/projects">
            {t(
              `すべて見る（${homeData.projects.length}）`,
              `All projects (${homeData.projects.length})`,
            )}
            <ArrowRight size={19} />
          </a>
        </header>
        <div className="o-project-grid">
          {homeData.projects.slice(0, 3).map((project) => (
            <ProjectCard key={project.ja.slug} project={project} />
          ))}
        </div>
        <p className="o-side-note">
          <Origori pose="plane" />
          {t(
            'まだまだ、いろんなかたちへ。',
            'There’s always another shape to try.',
          )}
        </p>
      </section>

      <section className="o-notes-band">
        <div className="shell o-notes-layout">
          <div className="o-notes-intro">
            <p className="o-eyebrow">02 / NOTES</p>
            <h2>
              {t('途中の気づきも、', 'Notes from')}
              <br />
              {t('のこしておこう。', 'along the way.')}
            </h2>
            <p>
              {t(
                '試したこと、つまずいたこと。',
                'Experiments, discoveries, and detours.',
              )}
              <br />
              {t(
                'つくりながら書いた、技術のノート。',
                'Technical notes written while building.',
              )}
            </p>
            <a className="o-text-link" href="/notes">
              {t('ノートを読む', 'Read the notes')}
              <ArrowRight size={18} />
            </a>
            <div className="o-notes-mascot">
              <Origori pose="idea" />
              <span>{t('なるほど、をメモ。', 'A note to remember.')}</span>
            </div>
          </div>
          <div className="o-notes-entries">
            <ol className="e-note-list">
              {homeData.articles.map((article, index) => (
                <NoteRow article={article} index={index} key={article.id} />
              ))}
            </ol>
            <LikesUpdated />
          </div>
        </div>
      </section>

      <section className="o-about shell o-section">
        <div className="o-about-portrait">
          <Origori pose="sitting" />
          <span>{t('つくる人と、その相棒。', 'A maker and a companion.')}</span>
        </div>
        <div>
          <p className="o-eyebrow">03 / ABOUT ME</p>
          <h2>{t('こんにちは、Mizukiです。', 'Hello, I’m Mizuki.')}</h2>
          <p>
            {t(
              '自分で使うものを、まず小さくつくっています。使って気づいたことも、この場所に残しています。',
              'I start small, building things I use myself, and share what I learn here.',
            )}
          </p>
          <div className="o-about-links">
            <a className="o-text-link" href="/about">
              {t('もう少し、わたしのこと', 'A little more about me')}
              <ArrowUpRight size={18} />
            </a>
            <a href="/resume">
              {t('職務経歴書', 'Résumé')}
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <span className="o-about-name">
          Mizuki Morishita
          <br />
          <small>Software Engineer</small>
        </span>
      </section>
    </>
  );
}

function Footer() {
  const { t } = useLocale();
  return (
    <footer className="o-footer">
      <div className="shell">
        <div className="o-footer-top">
          <div>
            <p className="o-handwritten">
              {t('また、ふらっとどうぞ。', 'Come by again, anytime.')}
            </p>
            <Brand />
          </div>
          <div className="o-footer-rest">
            <Origori pose="resting" />
            <span>{t('きょうは、ここまで。', 'That’s enough for today.')}</span>
          </div>
          <a className="o-back-top" href="#top">
            {t('ページの上へ', 'Back to top')}
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="o-footer-bottom">
          <span>© 2026 Mizuki Morishita</span>
          <span>
            {t('つくったもの。書いたこと。', 'Things I build. Things I write.')}
          </span>
          <nav aria-label="Social links">
            <a href="https://github.com/Morishita-mm">GitHub ↗</a>
            <a href="https://qiita.com/morimizu">Qiita ↗</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function JournalDestination() {
  const { t } = useLocale();
  // The existing preview does not include the authenticated Journal runtime.
  // Keep this route readable and honest, with a real destination for the entries.
  return (
    <section className="shell o-local-journal">
      <Origori pose="sitting" />
      <p className="o-eyebrow">JOURNAL</p>
      <h1>{t('日々のことは、こちらに。', 'Notes from day to day.')}</h1>
      <p>
        {t(
          'Journalは公開サイトで読めます。',
          'The journal is available on the live site.',
        )}
      </p>
      <a className="o-button" href="https://morimizu.dev/journal">
        {t('Journalを読む（公開サイト）', 'Read the journal (live site)')}
        <ArrowUpRight size={18} />
      </a>
    </section>
  );
}
function DesignPage() {
  const { t } = useLocale();
  return (
    <>
      <Header />
      <main id="content">
        {pagePath === '/' ? (
          <Home />
        ) : pagePath === '/notes' ? (
          <OrigoriNotes />
        ) : pagePath === '/about' ? (
          <OrigoriAbout />
        ) : pagePath === '/origori-assets' ? (
          <MascotGallery />
        ) : pagePath.startsWith('/journal') ? (
          <JournalDestination />
        ) : (
          <>
            <div className="o-route-companion shell">
              <Origori
                pose={pagePath.startsWith('/notes') ? 'idea' : 'sitting'}
              />
              <span>
                {t('あせらず、ひとつずつ。', 'One small step at a time.')}
              </span>
            </div>
            <PreviewPage path={pagePath} preview={false} />
          </>
        )}
      </main>
      <Footer />
      <FlightNavigation />
      <ScrollCompanion />
    </>
  );
}

// Reuse the existing factual pages and article renderer. Only this local entry
// loads the mascot theme; ?view=current shows the original design for comparison.
createRoot(document.getElementById('root')!).render(
  <div id="top">
    <PreviewBar />
    {current ? (
      <Preview path={path} preview={false} />
    ) : (
      <LocaleProvider initialLocale={path.startsWith('/en') ? 'en' : 'ja'}>
        <Suspense fallback={<p className="shell">読み込み中…</p>}>
          <DesignPage />
        </Suspense>
      </LocaleProvider>
    )}
  </div>,
);
