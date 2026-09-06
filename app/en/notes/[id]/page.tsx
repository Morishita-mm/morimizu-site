import { notFound } from 'next/navigation';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ArticlePage } from '@/dev-pages/workshop/site/article';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import NoteBody from '@/dev-pages/workshop/note-body';
import { getQiitaArticle } from '@/lib/qiita-articles';
export { generateStaticParams } from '@/app/notes/[id]/page';
export const dynamicParams = false;
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getQiitaArticle(id)) notFound();
  return (
    <SiteShell path={`/notes/${id}`} initialLocale="en">
      <ArticlePage article={articleSummary(getQiitaArticle(id)!)}>
        <NoteBody content={getQiitaArticle(id)!.content} />
      </ArticlePage>
    </SiteShell>
  );
}
