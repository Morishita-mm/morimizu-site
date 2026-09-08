import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJournalEntry } from '@/lib/journal/entries';
import { JournalEntryView } from '@/components/journal-entry';
type Props = { params: Promise<{ slug: string }> };
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getJournalEntry((await params).slug);
  if (!result)
    return {
      title: 'Journal — Not found',
      robots: { index: false, follow: false },
    };
  const { entry } = result;
  return {
    title: `${entry.title} | Engineering Journal | morimizu.dev`,
    description: entry.summary,
    alternates: { canonical: `/journal/${entry.id}` },
    openGraph: {
      type: 'article',
      url: `/journal/${entry.id}`,
      title: entry.title,
      description: entry.summary,
      publishedTime: entry.publishedAt,
      modifiedTime: entry.updatedAt,
    },
  };
}
export default async function JournalEntryPage({ params }: Props) {
  const result = await getJournalEntry((await params).slug);
  if (!result) notFound();
  return <JournalEntryView {...result} />;
}
