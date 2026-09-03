import { ArrowDownRight, ArrowUpRight, GitFork } from 'lucide-react';
import { DiagnosticMark } from '@/components/diagnostic-mark';
import { DiagnosticProjectPreview } from '@/components/diagnostic-project-preview';
import { FullPageLink } from '@/components/full-page-link';
import { MizuGlyph } from '@/components/mizu-glyph';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import {
  formatArticleDate,
  getRecentQiitaArticles,
} from '@/lib/qiita-articles';
import { TECH_INTERVIEWER_URL } from '@/lib/project-links';
import { LINKEDIN_URL } from '@/lib/social-links';

export default function Home() {
  const recentArticles = getRecentQiitaArticles(4);
  const featuredArticle = recentArticles[0];
  const remainingArticles = recentArticles.slice(1);

  return (
    <>
      <SiteHeader />

      <main className="journal-home">
        <section
          className="journal-hero page-shell"
          data-section-id="top"
          id="top"
        >
          <p className="journal-dateline">
            <span>Mizukiの個人開発</span>
            <span>つくったもの / 技術ノート</span>
            <span>morimizu.dev</span>
          </p>

          <div className="journal-hero-heading">
            <div className="journal-hero-copy">
              <h1>
                <span>自分で使うものを、</span>
                <span className="journal-serif">まず小さく</span>
                <span>つくっています。</span>
              </h1>

              <div className="journal-hero-note">
                <p>
                  Mizukiです。開発中に感じる「もう少し楽にできそう」を、
                  自分で使う小さな道具にしています。使って気づいたことも、ここに残しています。
                </p>
                <div className="journal-hero-actions">
                  <FullPageLink href="/projects">
                    つくったものを見る
                    <ArrowDownRight
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.7}
                    />
                  </FullPageLink>
                  <FullPageLink href="/notes">
                    書いたものを読む
                    <ArrowDownRight
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.7}
                    />
                  </FullPageLink>
                </div>
              </div>
            </div>

            <aside
              aria-label="現在制作中のプロジェクト"
              className="journal-hero-current"
              data-reveal="up"
            >
              <div className="journal-hero-current-head">
                <span>Now making</span>
                <span>01</span>
              </div>

              <div className="journal-hero-current-mark" aria-hidden="true">
                <DiagnosticMark />
              </div>

              <div className="journal-hero-current-copy">
                <span>AI技術面接アプリ</span>
                <strong>設計診断</strong>
                <p>正解を当てるより、自分の設計判断を確かめる。</p>
              </div>

              <a href="#work">
                制作中の内容を見る
                <ArrowDownRight
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.7}
                />
              </a>
            </aside>
          </div>

          <div
            aria-label="Mizukiの個人開発の流れ"
            className="journal-hero-cycle"
            data-reveal="up"
            data-reveal-delay="100"
          >
            <div className="journal-hero-cycle-label">
              <MizuGlyph />
              <span>My own development loop</span>
            </div>
            <ol>
              <li>
                <span>01</span>
                <strong>気づく</strong>
                <small>開発中の小さな不便</small>
              </li>
              <li>
                <span>02</span>
                <strong>つくる</strong>
                <small>まず動く形にする</small>
              </li>
              <li>
                <span>03</span>
                <strong>使う</strong>
                <small>自分で確かめる</small>
              </li>
              <li>
                <span>04</span>
                <strong>直す・残す</strong>
                <small>次の自分につなげる</small>
              </li>
            </ol>
          </div>
        </section>

        <section className="journal-projects" data-section-id="work" id="work">
          <div className="page-shell">
            <header className="journal-projects-heading" data-reveal="up">
              <p>つくったもの</p>
              <h2>いま作っているもの</h2>
              <p>
                まだ途中のものも含めて、いま手を動かしているものを載せています。
              </p>
            </header>

            <div className="journal-project-grid">
              <article
                className="journal-project-card journal-project-card-featured"
                data-reveal="up"
              >
                <DiagnosticProjectPreview />

                <div className="journal-project-copy">
                  <p className="journal-project-meta">
                    <span>試作中</span>
                    <span>AI技術面接アプリ</span>
                  </p>
                  <h3>設計診断</h3>
                  <p>
                    初めて見る設計課題に25分、ヒントなしで取り組みます。答えたあとに、
                    自分の判断やトレードオフをAIと振り返るためのアプリです。
                  </p>
                  <div className="journal-project-links">
                    <a
                      href={TECH_INTERVIEWER_URL}
                      rel="noreferrer"
                      target="_blank"
                    >
                      実際のアプリを開く
                      <ArrowUpRight
                        aria-hidden="true"
                        size={15}
                        strokeWidth={1.6}
                      />
                    </a>
                  </div>
                  <div className="journal-project-foot">
                    <span>いまは公開に向けて調整中です</span>
                    <span>React Router / Firestore</span>
                  </div>
                </div>
              </article>

              <article
                className="journal-project-card journal-project-card-site"
                data-reveal="up"
                data-reveal-delay="80"
              >
                <div className="journal-site-visual">
                  <span className="journal-site-domain">morimizu.dev</span>
                  <MizuGlyph className="journal-site-mark" />
                  <span className="journal-site-caption">
                    つくったものと、書いたもの。
                  </span>
                </div>

                <div className="journal-project-copy">
                  <p className="journal-project-meta">
                    <span>公開中</span>
                    <span>このサイト</span>
                  </p>
                  <h3>morimizu.dev</h3>
                  <p>
                    作ったアプリと、作りながら考えたことをまとめるために作ったサイトです。
                    気になるところを見つけるたびに、少しずつ直しています。
                  </p>
                  <div className="journal-project-links">
                    <FullPageLink href="/">
                      サイトを開く
                      <ArrowUpRight
                        aria-hidden="true"
                        size={15}
                        strokeWidth={1.6}
                      />
                    </FullPageLink>
                    <a
                      href="https://github.com/Morishita-mm/morimizu-site"
                      rel="noreferrer"
                      target="_blank"
                    >
                      <GitFork aria-hidden="true" size={14} strokeWidth={1.6} />
                      GitHub
                      <ArrowUpRight
                        aria-hidden="true"
                        size={14}
                        strokeWidth={1.6}
                      />
                    </a>
                  </div>
                </div>
              </article>
            </div>

            <FullPageLink className="journal-all-projects" href="/projects">
              公開中のプロダクトをすべて見る
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.6} />
            </FullPageLink>
          </div>
        </section>

        <section
          className="journal-notes page-shell"
          data-section-id="writing"
          id="writing"
        >
          <header className="journal-section-heading" data-reveal="up">
            <p>技術ノート</p>
            <h2>
              作りながら
              <span className="journal-serif">考えたこと。</span>
            </h2>
            <p className="journal-section-description">
              実装で詰まったところや、あとから残しておきたいことをQiitaに書いています。
              公開した記事は、ここでも読めます。
            </p>
          </header>

          {featuredArticle ? (
            <FullPageLink
              className="journal-featured-note"
              data-reveal="up"
              href={`/notes/${featuredArticle.id}`}
            >
              <span className="journal-note-number">01</span>
              <span className="journal-featured-copy">
                <span>
                  <time dateTime={featuredArticle.updatedAt}>
                    {formatArticleDate(featuredArticle.updatedAt)}
                  </time>
                  <span>{featuredArticle.readingMinutes}分で読めます</span>
                </span>
                <strong>{featuredArticle.title}</strong>
                <span className="journal-note-summary">
                  {featuredArticle.summary}
                </span>
              </span>
              <ArrowUpRight aria-hidden="true" size={24} strokeWidth={1.4} />
            </FullPageLink>
          ) : null}

          <ol className="journal-note-index" aria-label="最近の技術ノート">
            {remainingArticles.map((article, index) => (
              <li
                key={article.id}
                data-reveal="up"
                data-reveal-delay={String(index * 40)}
              >
                <FullPageLink href={`/notes/${article.id}`}>
                  <span>{String(index + 2).padStart(2, '0')}</span>
                  <time dateTime={article.updatedAt}>
                    {formatArticleDate(article.updatedAt)}
                  </time>
                  <strong>{article.title}</strong>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={17}
                    strokeWidth={1.5}
                  />
                </FullPageLink>
              </li>
            ))}
          </ol>

          <FullPageLink className="journal-all-notes" href="/notes">
            書いたものをすべて見る
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </FullPageLink>
        </section>

        <section className="journal-about" data-section-id="about" id="about">
          <div className="journal-about-inner page-shell">
            <p className="journal-about-copy" data-reveal="up">
              <span className="journal-about-line">
                できたものと、その経過を
              </span>
              <span className="journal-serif journal-about-line">
                残していきます。
              </span>
            </p>
            <div className="journal-about-side">
              <p>
                morimizu.devは、Mizukiが個人で作っているものと、
                その途中で考えたことを置いておく場所です。試している途中の記録も、
                少しずつ増やしていきます。
              </p>
              <div className="journal-about-links">
                <a
                  href="https://github.com/Morishita-mm"
                  rel="noreferrer"
                  target="_blank"
                >
                  GitHub{' '}
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.6}
                  />
                </a>
                <a
                  href="https://qiita.com/morimizu"
                  rel="noreferrer"
                  target="_blank"
                >
                  Qiita{' '}
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.6}
                  />
                </a>
                <a href={LINKEDIN_URL} rel="noreferrer" target="_blank">
                  LinkedIn{' '}
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.6}
                  />
                </a>
              </div>
              <div style={{ marginTop: '16px' }}>
                <FullPageLink className="text-link" href="/about">
                  詳しい経歴・職務情報を見る
                  <ArrowUpRight
                    aria-hidden="true"
                    size={14}
                    strokeWidth={1.8}
                  />
                </FullPageLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
