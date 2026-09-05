import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Preview } from '@/dev-pages/workshop/editorial';
import { getQiitaArticle, getAllQiitaArticles } from '@/lib/qiita-articles';
type NotePageProps = { params: Promise<{ id: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllQiitaArticles().map((article) => ({ id: article.id }));
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getQiitaArticle(id);

  if (!article) {
    return {};
  }

  return {
    title: `${article.title} | morimizu.dev`,
    description: article.summary,
    alternates: {
      canonical: article.qiitaUrl,
      languages: {
        'ja-JP': `/notes/${article.id}`,
        'en-US': `/en/notes/${article.id}`,
      },
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary,
      publishedTime: article.updatedAt,
      images: article.firstImage ? [article.firstImage] : [],
    },
  };
}

export default async function Page({ params }: NotePageProps) {
  const { id } = await params;
  if (!getQiitaArticle(id)) notFound();
  return <Preview path={`/notes/${id}`} preview={false} />;
}
