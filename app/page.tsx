import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Code2,
  GitFork,
} from 'lucide-react';
import Link from 'next/link';
import { MizuGlyph } from '@/components/mizu-glyph';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import {
  formatArticleDate,
  getAllQiitaArticles,
  getRecentQiitaArticles,
} from '@/lib/qiita-articles';

const projects = [
  {
    index: '01',
    name: 'morimizu.dev',
    label: 'THIS SITE',
    description:
      '個人開発・Qiitaの技術ノート・プロフィールをまとめる、このサイト自身。',
    status: '開発中',
    tags: ['Next.js', 'Cloudflare'],
    kind: 'site',
  },
  {
    index: '02',
    name: '設計診断',
    label: 'AI SYSTEM DESIGN INTERVIEW',
    description:
      '25分・ヒントなしの初見課題で、設計判断とトレードオフを振り返るAI技術面接アプリ。',
    status: '開発中',
    tags: ['React Router', 'Firestore'],
    kind: 'diagnostic',
  },
];

function MizuMark({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="mizu-line mizu-line-jade"
        d="M358 154A144 144 0 0 0 154 358"
        fill="none"
        stroke="var(--jade, #327871)"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path
        className="mizu-line mizu-line-ink"
        d="M154 358A144 144 0 0 0 358 154"
        fill="none"
        stroke="var(--ink, #17241e)"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path
        className="mizu-line mizu-line-ink"
        d="M358 154C374 206 324 238 256 256"
        fill="none"
        stroke="var(--ink, #17241e)"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <path
        className="mizu-line mizu-line-jade"
        d="M256 256C188 274 138 306 154 358"
        fill="none"
        stroke="var(--jade, #327871)"
        strokeLinecap="round"
        strokeWidth="14"
      />
      <circle
        className="mizu-dew"
        cx="414"
        cy="92"
        fill="var(--jade, #327871)"
        r="24"
      />
      <circle
        className="mizu-dew-glint"
        cx="407"
        cy="85"
        fill="var(--paper, #f4f1e8)"
        r="6"
      />
    </svg>
  );
}

function ArchitectureDiagnosticMark({
  className = '',
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 15 31 6l11 7v22l-11 7-13-9"
        stroke="#182b36"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.5"
      />
      <path
        d="m18 15-12 9 12 9 11-9-11-9Z"
        stroke="#1d6b63"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5.5"
      />
    </svg>
  );
}

export default function Home() {
  const recentArticles = getRecentQiitaArticles(3);
  const articleCount = getAllQiitaArticles().length;

  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero page-shell" id="top">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              MIZUKI&apos;S PERSONAL DEVELOPMENT LAB
            </p>
            <h1>
              <span className="hero-title-line">小さなアプリをつくる。</span>
              <span className="hero-title-line hero-title-accent">
                学びを記録する。
              </span>
            </h1>
            <p className="hero-description">
              morimizu.devは、Mizukiの個人開発ラボです。つくっているアプリと
              制作の過程を公開し、技術的な学びはQiitaに記録しています。
            </p>

            <div className="hero-actions">
              <a className="primary-link" href="#work">
                個人開発を見る
                <ArrowDownRight
                  aria-hidden="true"
                  size={17}
                  strokeWidth={1.8}
                />
              </a>
              <Link className="text-link" href="/notes">
                技術ノートを読む
                <ArrowDownRight aria-hidden="true" size={15} strokeWidth={1.8} />
              </Link>
            </div>

            <div className="hero-proof" aria-label="Site overview">
              <span>
                <strong>02</strong>
                PROJECTS IN PROGRESS
              </span>
              <span>
                <strong>{String(articleCount).padStart(2, '0')}</strong>
                PUBLIC NOTES
              </span>
            </div>
          </div>

          <div className="cycle-panel" aria-label="Build and write cycle">
            <a className="activity-card activity-build" href="#work">
              <span className="activity-head">
                <span>01 / BUILD</span>
                <Code2 aria-hidden="true" size={20} strokeWidth={1.6} />
              </span>
              <span className="activity-copy">
                <small>PERSONAL PROJECTS</small>
                <strong>個人開発</strong>
                <span>小さな課題を、使える道具へ。</span>
              </span>
              <span className="activity-foot">
                2 projects
                <ArrowDownRight
                  aria-hidden="true"
                  size={15}
                  strokeWidth={1.7}
                />
              </span>
            </a>

            <span className="activity-mark-wrap" aria-hidden="true">
              <MizuGlyph className="activity-mark" />
            </span>

            <Link className="activity-card activity-write" href="/notes">
              <span className="activity-head">
                <span>02 / WRITE</span>
                <BookOpen aria-hidden="true" size={20} strokeWidth={1.6} />
              </span>
              <span className="activity-copy">
                <small>TECHNICAL NOTES</small>
                <strong>技術ノート</strong>
                <span>実装で得た学びを、次のために。</span>
              </span>
              <span className="activity-foot">
                {articleCount} notes
                <ArrowDownRight aria-hidden="true" size={15} strokeWidth={1.7} />
              </span>
            </Link>

            <p className="cycle-caption">IDEA → BUILD → NOTE → NEXT IDEA</p>
          </div>
        </section>

        <section className="work-section section-block page-shell" id="work">
          <div className="section-heading">
            <p className="section-index">01 / Personal projects</p>
            <div className="section-title-group">
              <span>APPS BY MIZUKI</span>
              <h2>個人開発</h2>
            </div>
            <p className="section-description">
              日々の小さな課題から生まれたアプリと、いま育てているプロジェクト。
            </p>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article
                className={`project-card project-card-${project.kind}`}
                key={project.index}
              >
                <span className="project-accent" aria-hidden="true" />
                <div className="project-visual">
                  <div className="project-topline">
                    <span>{project.label}</span>
                    <span className="project-status">
                      <i aria-hidden="true" />
                      {project.status}
                    </span>
                  </div>

                  <div className="project-emblem" aria-hidden="true">
                    {project.kind === 'site' ? (
                      <MizuMark className="project-site-mark" />
                    ) : (
                      <ArchitectureDiagnosticMark className="diagnostic-mark" />
                    )}
                  </div>

                  <span className="project-surface-caption">
                    {project.kind === 'site'
                      ? 'BUILD / WRITE / GROW'
                      : 'DESIGN / DECIDE / REVIEW'}
                  </span>
                </div>

                <div className="project-body">
                  <span className="project-index">{project.index}</span>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <ul className="project-tags" aria-label="Technologies">
                      {project.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="writing-section" id="writing">
          <div className="writing-layout page-shell">
            <div className="writing-intro">
              <p className="section-index section-index-light">
                02 / Qiita notes
              </p>
              <span className="writing-label">WRITE</span>
              <h2>
                公開済みの
                <br />
                技術ノート
              </h2>
              <p>
                Qiitaへ投稿したMarkdownを同期し、このサイトでも同じ記事を読めるようにしています。
              </p>
            </div>

            <div className="qiita-card">
              <span className="qiita-card-top">
                <span className="qiita-icon" aria-hidden="true">
                  <BookOpen size={22} strokeWidth={1.55} />
                </span>
                <span>
                  <small>RECENTLY UPDATED</small>
                  <strong>{articleCount} public notes</strong>
                </span>
              </span>

              <ol className="home-note-list" aria-label="Recent notes">
                {recentArticles.map((article, index) => (
                  <li key={article.id}>
                    <Link href={`/notes/${article.id}`}>
                      <span className="home-note-index">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="home-note-copy">
                        <time dateTime={article.updatedAt}>
                          {formatArticleDate(article.updatedAt)}
                        </time>
                        <strong>{article.title}</strong>
                      </span>
                      <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.6} />
                    </Link>
                  </li>
                ))}
              </ol>

              <Link className="qiita-link" href="/notes">
                すべての技術ノートを見る
                <ArrowDownRight aria-hidden="true" size={18} strokeWidth={1.7} />
              </Link>
            </div>
          </div>
        </section>

        <section className="about-section page-shell" id="about">
          <MizuMark className="about-mark" />
          <div className="about-grid">
            <div className="about-heading">
              <p className="section-index">03 / About this lab</p>
              <span>ABOUT</span>
              <h2>
                <span className="about-title-line">
                  つくりながら、考えながら、
                </span>
                <span className="about-title-line">少しずつ育てる。</span>
              </h2>
            </div>

            <div className="about-copy">
              <p>
                morimizu.devは、Mizukiが個人でつくるソフトウェアと、
                その過程を置いておく場所です。暮らしの中の小さな違和感を起点に、
                試作と改善を重ねています。
              </p>

              <dl className="about-facts">
                <div>
                  <dt>NAME</dt>
                  <dd>Mizuki</dd>
                </div>
                <div>
                  <dt>FOCUS</dt>
                  <dd>Small tools &amp; web apps</dd>
                </div>
              </dl>

              <a
                className="github-link"
                href="https://github.com/Morishita-mm"
                rel="noreferrer"
                target="_blank"
              >
                <GitFork aria-hidden="true" size={17} strokeWidth={1.7} />
                GitHubでコードを見る
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
