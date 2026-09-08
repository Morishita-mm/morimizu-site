'use client';
/* oxlint-disable next/no-html-link-for-pages -- Links also work without JavaScript. */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { NotesListHeader } from '@/dev-pages/workshop/site/notes-list-header';
import { journalKinds, type JournalEntry } from '@/lib/journal/types';
export type ListData = {
  entries: Omit<JournalEntry, 'content' | 'relatedEntries'>[];
  next: string | null;
};
export function JournalList({
  initialData,
  initialSort,
}: {
  initialData: ListData;
  initialSort: 'asc' | 'desc';
}) {
  const [data, setData] = useState(initialData);
  const [sort, setSort] = useState(initialSort);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef<AbortController | null>(null);
  const load = useCallback(async (url: URL, push: boolean) => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/journal/v1/entries${url.search}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Unable to load entries');
      const result = (await response.json()) as ListData;
      if (controller.signal.aborted) return;
      setData(result);
      setSort(url.searchParams.get('sort') === 'asc' ? 'asc' : 'desc');
      if (push)
        window.history.pushState(
          window.history.state,
          '',
          url.pathname + url.search,
        );
    } catch {
      if (!controller.signal.aborted)
        setError(
          '記事一覧を更新できませんでした。もう一度並び順を選んでください。',
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, []);
  useEffect(() => {
    const restore = () => {
      if (location.pathname === '/journal')
        void load(new URL(location.href), false);
    };
    window.addEventListener('popstate', restore);
    window.addEventListener('notes-location', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('notes-location', restore);
      pending.current?.abort();
    };
  }, [load]);
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
    void load(new URL(event.currentTarget.href), true);
  }
  return (
    <section aria-label="Journal記事一覧" aria-busy={busy}>
      <NotesListHeader
        title="Journal"
        count={data.entries.length}
        sort={sort}
        path="/journal"
        onNavigate={navigate}
        dateLabel="公開日の並び順"
      />
      {data.entries.length === 0 ? (
        <p className="journal-empty">公開された記録はまだありません。</p>
      ) : (
        <ol className="journal-list">
          {data.entries.map((entry) => (
            <li key={entry.id} lang={entry.language}>
              <div className="journal-meta">
                <span>{journalKinds[entry.kind]}</span>
                <time dateTime={entry.publishedAt}>{entry.publishedAt}</time>
              </div>
              <h2>
                <a href={`/journal/${entry.id}`}>{entry.title}</a>
              </h2>
              <p>{entry.summary}</p>
              <div className="e-tags">
                {entry.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
      {data.next && (
        <a
          className="e-outline-link"
          onClick={navigate}
          href={`/journal?sort=${sort}&before=${encodeURIComponent(data.next!)}`}
        >
          次の記録 →
        </a>
      )}
      <output>{busy ? '記事一覧を更新中…' : ''}</output>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
