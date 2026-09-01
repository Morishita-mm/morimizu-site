import type { Metadata } from 'next';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { formatArticleDate, getAllQiitaArticles } from '@/lib/qiita-articles';

export const metadata: Metadata = {
  title: '技術ノート | morimizu.dev',
  description: 'MizukiがQiitaに投稿した技術記事を、morimizu.devでも読めます。',
  alternates: {
    canonical: '/notes',
  },
};

export default function NotesPage() {
  const articles = getAllQiitaArticles();

  return (
    <>
      <SiteHeader active="notes" />
      <main className="notes-index">
        <section className="notes-hero page-shell">
          <div data-reveal="up">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              Mizukiの技術ノート
            </p>
            <h1>
              Qiitaに書いたものを、
              <br />
              ここでも。
            </h1>
          </div>
          <div
            className="notes-hero-copy"
            data-reveal="up"
            data-reveal-delay="50"
          >
            <p>
              実装で詰まったところや、あとで見返したいことを書いています。Qiitaで公開した記事を、このサイトにもそのまま載せています。
            </p>
            <span>{articles.length}本の記事</span>
          </div>
        </section>

        <section
          className="notes-list-section page-shell"
          aria-labelledby="notes-list-title"
        >
          <div className="notes-list-heading" data-reveal="up">
            <span>新しい順</span>
            <h2 id="notes-list-title">記事を読む</h2>
          </div>

          <ol className="notes-list">
            {articles.map((article, index) => (
              <li key={article.id}>
                <FullPageLink
                  className="note-row"
                  href={`/notes/${article.id}`}
                >
                  <span className="note-row-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="note-row-main">
                    <span className="note-row-meta">
                      <time dateTime={article.updatedAt}>
                        {formatArticleDate(article.updatedAt)}
                      </time>
                      <span>{article.readingMinutes}分で読めます</span>
                    </span>
                    <strong>{article.title}</strong>
                    <span className="note-row-summary">{article.summary}</span>
                    <span className="note-row-tags" aria-label="タグ">
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
            href="https://qiita.com/mzk_tech"
            rel="noreferrer"
            target="_blank"
          >
            <BookOpen aria-hidden="true" size={17} strokeWidth={1.6} />
            Qiitaのプロフィールを見る
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
          </a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
