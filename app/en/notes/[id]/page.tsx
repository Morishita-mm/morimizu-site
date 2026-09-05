import { notFound } from 'next/navigation';
import { Preview } from '@/dev-pages/workshop/editorial';
import { getQiitaArticle } from '@/lib/qiita-articles';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getQiitaArticle(id)) notFound();
  return <Preview path={`/notes/${id}`} initialLocale="en" preview={false} />;
}
