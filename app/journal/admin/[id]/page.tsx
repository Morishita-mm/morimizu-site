import { JournalEditor } from '../editor';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: '記事を編集 | Journal Studio',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export default async function DraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JournalEditor id={id} />;
}
