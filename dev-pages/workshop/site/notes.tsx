'use client';
/* oxlint-disable next/no-html-link-for-pages -- Links retain original article routes. */
import { useEffect, useRef, useState } from 'react';
import { NotesListHeader } from './notes-list-header';
import { NotesHeading } from './notes-heading';
import { NotesTagPicker } from './notes-tag-picker';
import { useLocale } from '../locale';
import { ControlLabel } from '@/components/control-label';
import { LikesUpdated, QiitaLikes } from '../qiita-likes';
import { formatArticleDate } from '@/lib/article-date';
import { RoofArrow } from './roof-page-components';
import type { ArticleSummary } from './types';
export function NotesPage({
  articles,
  contentOnly = false,
}: {
  articles: ArticleSummary[];
  contentOnly?: boolean;
}) {
  const { t, en } = useLocale();
  const [sort, setSort] = useState<'asc' | 'desc'>('desc');
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const editingSearch = useRef(false);
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const restore = () => {
      const params = new URL(location.href).searchParams;
      setSort(
        ['asc', 'oldest'].includes(params.get('sort') ?? '') ? 'asc' : 'desc',
      );
      setQuery(params.get('q') ?? '');
      setTag(params.get('tag') ?? '');
      editingSearch.current = false;
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('notes-location', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('notes-location', restore);
    };
  }, []);
  function update(key: 'q' | 'tag' | 'sort', value: string) {
    const url = new URL(location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    const replace = key === 'q' && editingSearch.current;
    history[replace ? 'replaceState' : 'pushState'](
      history.state,
      '',
      url.pathname + url.search + url.hash,
    );
    editingSearch.current = key === 'q';
    if (key === 'q') setQuery(value);
    else if (key === 'tag') setTag(value);
    else setSort(value === 'asc' ? 'asc' : 'desc');
  }
  const normalize = (value: string) =>
    value.normalize('NFKC').toLocaleLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const sorted = articles
    .filter(
      (article) =>
        (!tag || article.tags.includes(tag)) &&
        words.every((word) =>
          normalize(
            `${article.title} ${article.summary ?? ''} ${article.tags.join(' ')}`,
          ).includes(word),
        ),
    )
    .sort((a, b) => {
      const order =
        a.updatedAt.localeCompare(b.updatedAt) || a.id.localeCompare(b.id);
      return sort === 'asc' ? order : -order;
    });
  const counts = new Map<string, number>();
  for (const article of articles)
    for (const value of article.tags)
      counts.set(value, (counts.get(value) ?? 0) + 1);
  const tags = [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'ja'));
  function reset() {
    const url = new URL(location.href);
    for (const key of ['q', 'tag', 'sort']) url.searchParams.delete(key);
    history.pushState(history.state, '', url.pathname + url.search + url.hash);
    setQuery('');
    setTag('');
    setSort('desc');
    editingSearch.current = false;
    search.current?.focus();
  }
  return (
    <div
      className={
        contentOnly ? 'notes-collection-content' : 'wrap page-main notes-page'
      }
    >
      {!contentOnly && <NotesHeading section="qiita" count={articles.length} />}
      <search aria-label={t('記事を探す', 'Find articles')}>
        <form
          aria-label={t('記事を探す', 'Find articles')}
          onSubmit={(event) => event.preventDefault()}
        >
          <NotesListHeader
            title={t('Qiita記事', 'Qiita articles')}
            count={articles.length}
            sort={sort}
            onSort={(value) => update('sort', value)}
            dateLabel={t('更新日の並び順', 'Order by updated date')}
          >
            <label className="search-field">
              <span>{t('記事を検索', 'Search articles')}</span>
              <span className="search-input">
                <i className="icon search-icon" aria-hidden="true" />
                <input
                  ref={search}
                  type="search"
                  name="q"
                  placeholder={t('キーワードを入力', 'Enter keywords')}
                  autoComplete="off"
                  value={query}
                  onChange={(event) => update('q', event.target.value)}
                  onBlur={() => {
                    editingSearch.current = false;
                  }}
                />
              </span>
            </label>
            <NotesTagPicker
              tags={tags}
              value={tag}
              onChange={(value) => update('tag', value)}
            />
          </NotesListHeader>
        </form>
      </search>
      <output className="result-count" aria-live="polite">
        {t(
          `${sorted.length} / ${articles.length} 件の記事`,
          `${sorted.length} of ${articles.length} articles`,
        )}
      </output>
      <ol className="notes-list e-note-list">
        {sorted.map((article) => (
          <li className="note-row" key={article.id}>
            <div className="note-meta">
              <span>
                {t('更新 ', 'Updated ')}
                <time dateTime={article.updatedAt}>
                  {formatArticleDate(article.updatedAt)}
                </time>
              </span>
              <span>
                {t('読み切るまで：', 'Reading time: ')}
                {article.readingMinutes}
                {t(' 分', ' min')}
              </span>
              <QiitaLikes id={article.id} />
            </div>
            <div className="note-info" lang="ja">
              <h2>
                <a className="e-note-row" href={`/notes/${article.id}`}>
                  {article.title}
                </a>
              </h2>
              {article.summary && <p>{article.summary}</p>}
              <ul
                className="tag-list"
                aria-label={t('技術・タグ', 'Technologies and tags')}
              >
                {article.tags.map((value) => (
                  <li key={value}>{value}</li>
                ))}
              </ul>
            </div>
            <a
              className="note-open"
              href={`/notes/${article.id}`}
              aria-label={t(`${article.title}を読む`, `Read ${article.title}`)}
            >
              <RoofArrow />
            </a>
          </li>
        ))}
      </ol>
      {!sorted.length && (
        <div className="notes-empty">
          <h2>{t('記事が見つかりませんでした', 'No articles found')}</h2>
          <p>
            {t(
              'キーワードやタグを変えてお試しください。',
              'Try another keyword or tag.',
            )}
          </p>
          <button type="button" className="button-link" onClick={reset}>
            {t('絞り込みを解除', 'Clear filters')}
          </button>
        </div>
      )}
      <LikesUpdated />
      <a className="button-link" href="https://qiita.com/morimizu">
        <ControlLabel
          locale={en ? 'en' : 'ja'}
          ja="Qiitaのプロフィールを見る"
          en="View Qiita profile"
        />
        <RoofArrow diagonal />
      </a>
    </div>
  );
}
