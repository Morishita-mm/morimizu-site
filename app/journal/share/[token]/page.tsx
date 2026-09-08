import { notFound } from 'next/navigation';
import { getJournalEntry } from '@/lib/journal/entries';
import { JournalEntryView } from '@/components/journal-entry';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: '共有された記録 | Journal',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const result = await getJournalEntry(token, true);
  if (!result) notFound();
  return <JournalEntryView {...result} />;
}
