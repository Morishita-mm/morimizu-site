import { notFound } from 'next/navigation';
import { Preview } from '@/dev-pages/workshop/editorial';
import { getProject } from '@/lib/projects';
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <Preview path={`/projects/${slug}`} initialLocale="en" preview={false} />
  );
}
