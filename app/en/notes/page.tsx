import type { Metadata } from 'next';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { formatArticleDate, getAllQiitaArticles } from '@/lib/qiita-articles';

export const metadata: Metadata = {
  title: 'Technical Notes | morimizu.dev',
  description:
    'Technical articles by Mizuki. The original articles are published in Japanese on Qiita.',
  alternates: {
    canonical: '/en/notes',
    languages: { 'ja-JP': '/notes', 'en-US': '/en/notes' },
  },
};

export default function EnglishNotesPage() {
  const articles = getAllQiitaArticles();

  return (
    <>
      <SiteHeader active="notes" locale="en" languageHref="/notes" />
      <main className="notes-index english-site">
        <section className="notes-hero page-shell">
          <div data-reveal="up">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Mizuki&apos;s technical field notes
            </p>
            <h1>
              Technical notes,
              <br />
              kept close to the work.
            </h1>
          </div>
          <div
            className="notes-hero-copy"
            data-reveal="up"
            data-reveal-delay="50"
          >
            <p>
              These are implementation notes and lessons I want to return to.
              The original articles are written in Japanese and published on
              Qiita.
            </p>
            <span>{articles.length} articles · Japanese</span>
          </div>
        </section>

        <section
          className="notes-list-section page-shell"
          aria-labelledby="notes-list-title"
        >
          <div className="notes-list-heading" data-reveal="up">
            <span>Newest first</span>
            <h2 id="notes-list-title">Browse the notes</h2>
          </div>
          <ol className="notes-list">
            {articles.map((article, index) => (
              <li key={article.id}>
                <FullPageLink
                  className="note-row"
                  href={`/en/notes/${article.id}`}
                  lang="ja"
                >
                  <span className="note-row-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="note-row-main">
                    <span className="note-row-meta">
                      <time dateTime={article.updatedAt}>
                        {formatArticleDate(article.updatedAt)}
                      </time>
                      <span>{article.readingMinutes} min read · Japanese</span>
                    </span>
                    <strong>{article.title}</strong>
                    <span className="note-row-summary">{article.summary}</span>
                    <span className="note-row-tags" aria-label="Tags">
                      {article.tags.map((tag) => (
                        <i key={tag}>{tag}</i>
                      ))}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.5}
                  />
                </FullPageLink>
              </li>
            ))}
          </ol>
          <a
            className="notes-qiita-link"
            href="https://qiita.com/morimizu"
            rel="noreferrer"
            target="_blank"
          >
            <BookOpen aria-hidden="true" size={17} strokeWidth={1.6} />
            View the Qiita profile
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
          </a>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
