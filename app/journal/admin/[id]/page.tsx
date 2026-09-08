import { notFound } from 'next/navigation';
import { getDraft } from '@/lib/journal/entries';
import { JournalEntryView } from '@/components/journal-entry';
import { JournalControls } from '../controls';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: '原稿確認 | Journal',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default async function DraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getDraft(id);
  if (!result) notFound();
  return (
    <JournalEntryView
      entry={result.entry}
      before={<JournalControls id={id} reviewedRevision={result.revision} />}
    />
  );
}
