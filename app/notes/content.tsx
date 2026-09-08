'use client';
/* oxlint-disable next/no-html-link-for-pages -- Links work without JavaScript. */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import { NotesHeading } from '@/dev-pages/workshop/site/notes-heading';
import { NotesPage } from '@/dev-pages/workshop/site/notes';
import type { ArticleSummary } from '@/dev-pages/workshop/site/types';
import { useLocale } from '@/dev-pages/workshop/locale';
import { JournalList, type ListData } from '@/app/journal/list';
import { NotesTabs } from './tabs';
export function NotesContent({
  articles,
  initialSection,
  initialJournal,
  initialSort = 'desc',
}: {
  articles: ArticleSummary[];
  initialSection: 'journal' | 'qiita';
  initialJournal?: ListData;
  initialSort?: 'asc' | 'desc';
}) {
  const { t } = useLocale();
  const [section, setSection] = useState(initialSection);
  const [journal, setJournal] = useState(initialJournal);
  const [sort, setSort] = useState(initialSort);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const current = useRef(initialSection);
  const pending = useRef<AbortController | null>(null);
  const load = useCallback(async (url: URL, push: boolean) => {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    const next = url.pathname === '/journal' ? 'journal' : 'qiita';
    setBusy(true);
    setError('');
    try {
      if (next === 'journal') {
        const response = await fetch(`/api/journal/v1/entries${url.search}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Unable to load Journal');
        const data = (await response.json()) as ListData;
        if (controller.signal.aborted) return;
        setJournal(data);
        setSort(url.searchParams.get('sort') === 'asc' ? 'asc' : 'desc');
      }
      if (controller.signal.aborted) return;
      current.current = next;
      setSection(next);
      if (push) history.pushState(history.state, '', url.pathname + url.search);
    } catch {
      if (!controller.signal.aborted)
        setError(
          'Journalを読み込めませんでした。もう一度タブを選んでください。',
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, []);
  useEffect(() => {
    const restore = (event: PopStateEvent) => {
      if (!['/notes', '/en/notes', '/journal'].includes(location.pathname))
        return;
      // These URLs share this mounted view. Avoid a competing framework route fetch.
      event.stopImmediatePropagation();
      const next = location.pathname === '/journal' ? 'journal' : 'qiita';
      if (next !== current.current) void load(new URL(location.href), false);
      else window.dispatchEvent(new Event('notes-location'));
    };
    window.addEventListener('popstate', restore, true);
    return () => {
      window.removeEventListener('popstate', restore, true);
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
    const target =
      new URL(event.currentTarget.href).pathname === '/journal'
        ? 'journal'
        : 'qiita';
    if (target === current.current && !busy && !error) return;
    void load(new URL(event.currentTarget.href), true);
  }
  return (
    <div className="shell journal">
      <NotesHeading
        section={section}
        tabs={<NotesTabs section={section} onNavigate={navigate} />}
      />
      <div aria-busy={busy}>
        <output>{busy ? t('読み込み中…', 'Loading…') : ''}</output>
        {error && <p role="alert">{error}</p>}
        {section === 'journal' && journal ? (
          <>
            <JournalList initialData={journal} initialSort={sort} />
            <p className="journal-admin-link">
              <a href="/journal/admin/upload">
                {t(
                  '原稿をアップロード（管理者） →',
                  'Upload a manuscript (admin) →',
                )}
              </a>
            </p>
          </>
        ) : (
          <NotesPage articles={articles} contentOnly />
        )}
      </div>
    </div>
  );
}
