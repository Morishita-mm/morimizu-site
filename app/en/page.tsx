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
import { LINKEDIN_URL } from '@/lib/social-links';

export default function EnglishHome() {
  const recentArticles = getRecentQiitaArticles(4);
  const featuredArticle = recentArticles[0];
  const remainingArticles = recentArticles.slice(1);

  return (
    <>
      <SiteHeader locale="en" languageHref="/" />

      <main className="journal-home english-site">
        <section
          className="journal-hero page-shell"
          data-section-id="top"
          id="top"
        >
          <p className="journal-dateline">
            <span>Mizuki&apos;s personal development</span>
            <span>Products / Technical notes</span>
            <span>morimizu.dev</span>
          </p>

          <div className="journal-hero-heading">
            <div className="journal-hero-copy">
              <h1>
                <span>I build tools</span>
                <span className="journal-serif">for my own work,</span>
                <span>then learn from using them.</span>
              </h1>

              <div className="journal-hero-note">
                <p>
                  I&apos;m Mizuki. I turn small friction in software development
                  into tools I can use myself, then document what the process
                  teaches me.
                </p>
                <div className="journal-hero-actions">
                  <FullPageLink href="/en/projects">
                    Explore the products
                    <ArrowDownRight
                      aria-hidden="true"
                      size={17}
                      strokeWidth={1.7}
                    />
                  </FullPageLink>
                  <FullPageLink href="/en/notes">
                    Browse technical notes
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
              aria-label="Current project"
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
                <span>AI system design interview</span>
                <strong>Design Review</strong>
                <p>
                  Practice the quality of a decision, not the memorized answer.
                </p>
              </div>
              <a href="#work">
                See what I am building
                <ArrowDownRight
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.7}
                />
              </a>
            </aside>
          </div>

          <div
            aria-label="Mizuki's development loop"
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
                <strong>Notice</strong>
                <small>Friction in daily development</small>
              </li>
              <li>
                <span>02</span>
                <strong>Build</strong>
                <small>Start with a working slice</small>
              </li>
              <li>
                <span>03</span>
                <strong>Use</strong>
                <small>Test it in my own workflow</small>
              </li>
              <li>
                <span>04</span>
                <strong>Refine</strong>
                <small>Keep the lesson for next time</small>
              </li>
            </ol>
          </div>
        </section>

        <section className="journal-projects" data-section-id="work" id="work">
          <div className="page-shell">
            <header className="journal-projects-heading" data-reveal="up">
              <p>Products</p>
              <h2>What I am building now</h2>
              <p>
                Working products and experiments that are still taking shape.
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
                    <span>Prototype</span>
                    <span>AI system design interview</span>
                  </p>
                  <h3>Design Review</h3>
                  <p>
                    Work through an unfamiliar system design prompt for 25
                    minutes without hints, then review the decisions and
                    trade-offs with AI.
                  </p>
                  <div className="journal-project-foot">
                    <span>Preparing for a public release</span>
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
                    Things I build and write.
                  </span>
                </div>
                <div className="journal-project-copy">
                  <p className="journal-project-meta">
                    <span>Public</span>
                    <span>This site</span>
                  </p>
                  <h3>morimizu.dev</h3>
                  <p>
                    A home for the tools I build, the architecture behind them,
                    and the notes that come out of the work.
                  </p>
                  <div className="journal-project-links">
                    <FullPageLink href="/en">
                      Open the site
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

            <FullPageLink className="journal-all-projects" href="/en/projects">
              See all public products
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
            <p>Technical notes</p>
            <h2>
              What I learned
              <span className="journal-serif">while building.</span>
            </h2>
            <p className="journal-section-description">
              The source articles are published on Qiita in Japanese. This index
              keeps the original writing accessible alongside the product work.
            </p>
          </header>

          {featuredArticle ? (
            <FullPageLink
              className="journal-featured-note"
              data-reveal="up"
              href={`/en/notes/${featuredArticle.id}`}
            >
              <span className="journal-note-number">01</span>
              <span className="journal-featured-copy">
                <span>
                  <time dateTime={featuredArticle.updatedAt}>
                    {formatArticleDate(featuredArticle.updatedAt)}
                  </time>
                  <span>
                    {featuredArticle.readingMinutes} min read · Japanese
                  </span>
                </span>
                <strong>{featuredArticle.title}</strong>
                <span className="journal-note-summary">
                  {featuredArticle.summary}
                </span>
              </span>
              <ArrowUpRight aria-hidden="true" size={24} strokeWidth={1.4} />
            </FullPageLink>
          ) : null}

          <ol
            className="journal-note-index"
            aria-label="Recent technical notes in Japanese"
          >
            {remainingArticles.map((article, index) => (
              <li
                key={article.id}
                data-reveal="up"
                data-reveal-delay={String(index * 40)}
              >
                <FullPageLink href={`/en/notes/${article.id}`}>
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

          <FullPageLink className="journal-all-notes" href="/en/notes">
            Browse all notes
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.6} />
          </FullPageLink>
        </section>

        <section className="journal-about" data-section-id="about" id="about">
          <div className="journal-about-inner page-shell">
            <p className="journal-about-label">About this place</p>
            <p className="journal-about-copy" data-reveal="up">
              <span className="journal-about-line">
                I keep the finished work
              </span>
              <span className="journal-serif journal-about-line">
                and the thinking behind it.
              </span>
            </p>
            <div className="journal-about-side">
              <p>
                morimizu.dev is where I document personal software projects,
                architecture decisions, and work still in progress. I am
                building toward a software architecture role with hands-on
                product experience.
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
                <FullPageLink className="text-link" href="/en/about">
                  View full resume / experience
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

      <SiteFooter locale="en" />
    </>
  );
}
