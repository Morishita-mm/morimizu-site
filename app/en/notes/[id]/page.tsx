import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { FullPageLink } from '@/components/full-page-link';
import { MarkdownArticle } from '@/components/markdown-article';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import {
  formatArticleDate,
  getAllQiitaArticles,
  getQiitaArticle,
} from '@/lib/qiita-articles';

type NotePageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllQiitaArticles().map((article) => ({ id: article.id }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getQiitaArticle(id);
  if (!article) return {};

  return {
    title: `${article.title} | Technical Notes | morimizu.dev`,
    description: article.summary,
    alternates: {
      canonical: article.qiitaUrl,
      languages: {
        'ja-JP': `/notes/${article.id}`,
        'en-US': `/en/notes/${article.id}`,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'ja_JP',
      title: article.title,
      description: article.summary,
      publishedTime: article.updatedAt,
      images: article.firstImage ? [article.firstImage] : [],
    },
  };
}

export default async function EnglishNotePage({ params }: NotePageProps) {
  const { id } = await params;
  const article = getQiitaArticle(id);
  if (!article) notFound();

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    dateModified: article.updatedAt,
    inLanguage: 'ja',
    author: {
      '@type': 'Person',
      name: 'Mizuki',
      url: 'https://morimizu.dev/en',
    },
    mainEntityOfPage: article.qiitaUrl,
  }).replace(/</g, '\\u003c');

  return (
    <>
      <SiteHeader
        active="notes"
        locale="en"
        languageHref={`/notes/${article.id}`}
      />
      <main className="note-detail english-site">
        <article lang="ja">
          <header
            className="note-article-header page-shell-narrow"
            data-reveal="up"
          >
            <FullPageLink className="note-back" href="/en/notes" lang="en">
              <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.7} />
              Back to technical notes
            </FullPageLink>
            <div className="note-article-kicker">
              <span>Japanese technical note</span>
              <time dateTime={article.updatedAt}>
                {formatArticleDate(article.updatedAt)}
              </time>
              <span>{article.readingMinutes} min read</span>
            </div>
            <h1>{article.title}</h1>
            <ul className="note-article-tags" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <p className="note-source-notice" lang="en">
              This article is available in Japanese. The same Markdown is
              published here and on Qiita.
              <a href={article.qiitaUrl} rel="noreferrer" target="_blank">
                Read on Qiita{' '}
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.7} />
              </a>
            </p>
          </header>
          <div className="note-article-rule" aria-hidden="true" />
          <div className="page-shell-narrow note-article-content">
            <MarkdownArticle content={article.content} />
            <footer className="note-article-footer" lang="en">
              <span>End of article</span>
              <a href={article.qiitaUrl} rel="noreferrer" target="_blank">
                View the original on Qiita
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
              </a>
            </footer>
          </div>
        </article>
      </main>
      <SiteFooter locale="en" />
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </>
  );
}
