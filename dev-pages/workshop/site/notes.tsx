'use client';
import { useEffect, useState, type MouseEvent } from 'react';
import { NotesListHeader } from './notes-list-header';
import { NotesHeading } from './notes-heading';
import { useLocale } from '../locale';
import { ControlLabel } from '@/components/control-label';
import { LikesUpdated } from '../qiita-likes';
import { Arrow, NoteRow } from './components';
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
  useEffect(() => {
    const restore = () =>
      setSort(
        new URL(location.href).searchParams.get('sort') === 'asc'
          ? 'asc'
          : 'desc',
      );
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('notes-location', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('notes-location', restore);
    };
  }, []);
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    const url = new URL(event.currentTarget.href);
    setSort(url.searchParams.get('sort') === 'asc' ? 'asc' : 'desc');
    history.pushState(history.state, '', url.pathname + url.search);
  }
  const sorted = [...articles].sort((a, b) => {
    const order =
      a.updatedAt.localeCompare(b.updatedAt) || a.id.localeCompare(b.id);
    return sort === 'asc' ? order : -order;
  });
  return (
    <div className={contentOnly ? undefined : 'shell'}>
      {!contentOnly && <NotesHeading section="qiita" />}
      <NotesListHeader
        title={t('Qiita記事', 'Qiita articles')}
        count={articles.length}
        sort={sort}
        path={en ? '/en/notes' : '/notes'}
        onNavigate={navigate}
        dateLabel={t('更新日の並び順', 'Order by updated date')}
      />
      <ol className="e-note-list">
        {sorted.map((article, index) => (
          <NoteRow key={article.id} article={article} index={index} />
        ))}
      </ol>
      <LikesUpdated />
      <a className="e-outline-link" href="https://qiita.com/morimizu">
        <ControlLabel locale={en ? 'en' : 'ja'} ja="Qiitaのプロフィールを見る" en="View Qiita profile" />{' '}
        <Arrow diagonal />
      </a>
    </div>
  );
}
