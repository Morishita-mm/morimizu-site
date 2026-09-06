'use client';
/* oxlint-disable next/no-html-link-for-pages -- Existing route behavior. */
import type { ReactNode } from 'react';
import { useLocale } from '../locale';
import { formatArticleDate } from '@/lib/article-date';
import { Arrow } from './components';
import type { ArticleSummary } from './types';
export function ArticlePage({
  article,
  children,
}: {
  article: ArticleSummary;
  children: ReactNode;
}) {
  const { t } = useLocale();
  return (
    <article className="e-article shell">
      <a href="/notes" className="e-back">
        {t('← 技術ノート', '← Technical notes')}
      </a>
      <header>
        <p className="e-kicker">
          <time dateTime={article.updatedAt}>
            {formatArticleDate(article.updatedAt)}
          </time>{' '}
          / {article.readingMinutes}
          {t('分で読めます', ' min read · Japanese')}
        </p>
        <h1>{article.title}</h1>
        <div className="e-tags">
          {article.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a href={article.qiitaUrl} className="e-outline-link">
          {t('Qiitaで読む', 'Read on Qiita')} <Arrow diagonal />
        </a>
      </header>
      {children}
      <a href="/notes" className="e-outline-link">
        {t('記事一覧に戻る', 'Back to articles')} <Arrow />
      </a>
    </article>
  );
}
