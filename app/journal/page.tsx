import { NotesContent } from '@/app/notes/content';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
/* oxlint-disable next/no-html-link-for-pages -- Preserve the site's full-page navigation. */
import type { Metadata } from 'next';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { getJournalEntries } from '@/lib/journal/entries';

export const metadata: Metadata = {
  title: 'Journal | Notes — morimizu works',
  description:
    'AI-native Software Engineeringの問い・仮説・実験・設計判断・失敗と学びを残すEngineering Journal。',
  alternates: { canonical: '/journal', languages: { 'ja-JP': '/journal' } },
  openGraph: {
    type: 'website',
    url: '/journal',
    title: 'Journal | Notes — morimizu works',
    description: '思考から実験へ。判断が変わる過程を残す。',
    locale: 'ja_JP',
  },
};

export const dynamic = 'force-dynamic';
export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ before?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort = params.sort === 'asc' ? 'asc' : 'desc';
  const { entries, next } = await getJournalEntries(params.before, sort);
  return (
    <SiteShell path="/journal">
      <NotesContent
        articles={getAllQiitaArticles().map(articleSummary)}
        initialSection="journal"
        initialJournal={{ entries, next }}
        initialSort={sort}
      />
    </SiteShell>
  );
}
