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

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllQiitaArticles().map((article) => ({ id: article.id }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getQiitaArticle(id);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | morimizu.dev`,
    description: article.summary,
    alternates: {
      canonical: article.qiitaUrl,
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      publishedTime: article.updatedAt,
      images: article.firstImage ? [article.firstImage] : ['/og.png'],
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const article = getQiitaArticle(id);

  if (!article) {
    notFound();
  }

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: 'Mizuki',
      url: 'https://morimizu.dev',
    },
    mainEntityOfPage: article.qiitaUrl,
  }).replace(/</g, '\\u003c');

  return (
    <>
      <SiteHeader active="notes" />
      <main className="note-detail">
        <article>
          <header
            className="note-article-header page-shell-narrow"
            data-reveal="up"
          >
            <FullPageLink className="note-back" href="/notes">
              <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.7} />
              記事一覧に戻る
            </FullPageLink>

            <div className="note-article-kicker">
              <span>技術ノート</span>
              <time dateTime={article.updatedAt}>
                {formatArticleDate(article.updatedAt)}
              </time>
              <span>{article.readingMinutes}分で読めます</span>
            </div>

            <h1>{article.title}</h1>

            <ul className="note-article-tags" aria-label="タグ">
              {article.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>

            <p className="note-source-notice">
              Qiitaに投稿したMarkdownを、このサイトにも同じ内容で載せています。
              <a href={article.qiitaUrl} rel="noreferrer" target="_blank">
                Qiitaで読む
                <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.7} />
              </a>
            </p>
          </header>

          <div className="note-article-rule" aria-hidden="true" />

          <div className="page-shell-narrow note-article-content">
            <MarkdownArticle content={article.content} />

            <footer className="note-article-footer">
              <span>この記事はここまで</span>
              <a href={article.qiitaUrl} rel="noreferrer" target="_blank">
                Qiitaで原文を見る
                <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
              </a>
            </footer>
          </div>
        </article>
      </main>
      <SiteFooter />
      <script
        dangerouslySetInnerHTML={{ __html: jsonLd }}
        type="application/ld+json"
      />
    </>
  );
}
