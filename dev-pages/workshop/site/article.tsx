'use client';
/* oxlint-disable next/no-html-link-for-pages -- Existing route behavior. */
import type { ReactNode } from 'react';
import { useLocale } from '../locale';
import { ControlLabel } from '@/components/control-label';
import { formatArticleDate } from '@/lib/article-date';
import { RoofArrow, RoofBreadcrumbs } from './roof-page-components';
import { ArticleReading } from './article-reading';
import { QiitaLikes } from '../qiita-likes';
import type { ArticleSummary } from './types';
export function ArticlePage({
  article,
  children,
}: {
  article: ArticleSummary;
  children: ReactNode;
}) {
  const { t, locale, en } = useLocale();
  const notes = en ? '/en/notes' : '/notes';
  return (
    <article className="wrap page-main roof-article">
      <RoofBreadcrumbs
        items={[
          { label: 'HOME', href: en ? '/en' : '/' },
          { label: 'NOTES', href: notes },
          { label: t('記事', 'Article') },
        ]}
      />
      <header className="detail-head article-head">
        <p className="eyebrow">QIITA / {t('技術記事', 'TECHNICAL ARTICLE')}</p>
        <h1 className="article-title" lang="ja">
          {article.title}
        </h1>
        <div className="detail-metadata">
          <span>
            {t('更新 ', 'Updated ')}
            <time dateTime={article.updatedAt}>
              {formatArticleDate(article.updatedAt)}
            </time>
          </span>
          <span>
            {t('読み切るまで：', 'Reading time: ')}
            {article.readingMinutes}
            {t(' 分', ' min · Japanese')}
          </span>
          <QiitaLikes id={article.id} />
        </div>
        <ul
          className="tag-list"
          lang="ja"
          aria-label={t('技術・タグ', 'Technologies and tags')}
        >
          {article.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="detail-actions">
          <a href={article.qiitaUrl} className="button-link">
            <ControlLabel locale={locale} ja="Qiitaで読む" en="Read on Qiita" />
            <RoofArrow diagonal />
          </a>
        </div>
      </header>
      <ArticleReading>{children}</ArticleReading>
      <div className="page-return">
        <a href={notes} className="text-link">
          <ControlLabel
            locale={locale}
            ja="記事一覧に戻る"
            en="Back to articles"
          />
          <RoofArrow />
        </a>
      </div>
    </article>
  );
}
