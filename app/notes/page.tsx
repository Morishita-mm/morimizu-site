import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import {
  formatArticleDate,
  getAllQiitaArticles,
} from '@/lib/qiita-articles';

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
          <div>
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              MIZUKI&apos;S TECHNICAL FIELD NOTES
            </p>
            <h1>
              Qiitaの記事を、
              <br />
              ここでも読む。
            </h1>
          </div>
          <div className="notes-hero-copy">
            <p>
              実装で得た知見や、個人開発の設計判断をまとめています。記事の正本はQiitaで管理し、この場所には公開済みの記事だけを同期しています。
            </p>
            <span>{String(articles.length).padStart(2, '0')} PUBLIC NOTES</span>
          </div>
        </section>

        <section className="notes-list-section page-shell" aria-labelledby="notes-list-title">
          <div className="notes-list-heading">
            <span>UPDATED / DESCENDING</span>
            <h2 id="notes-list-title">記事一覧</h2>
          </div>

          <ol className="notes-list">
            {articles.map((article, index) => (
              <li key={article.id}>
                <Link className="note-row" href={`/notes/${article.id}`}>
                  <span className="note-row-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="note-row-main">
                    <span className="note-row-meta">
                      <time dateTime={article.updatedAt}>
                        {formatArticleDate(article.updatedAt)}
                      </time>
                      <span>{article.readingMinutes} MIN READ</span>
                    </span>
                    <strong>{article.title}</strong>
                    <span className="note-row-summary">{article.summary}</span>
                    <span className="note-row-tags" aria-label="Tags">
                      {article.tags.map((tag) => (
                        <i key={tag}>{tag}</i>
                      ))}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.5} />
                </Link>
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
