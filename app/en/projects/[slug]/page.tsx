import { notFound } from 'next/navigation';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ProjectPage } from '@/dev-pages/workshop/site/project';
import { getProjectData } from '@/dev-pages/workshop/site/data';
import { getProject } from '@/lib/projects';
export { generateStaticParams } from '@/app/projects/[slug]/page';
export const dynamicParams = false;
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <SiteShell path={`/projects/${slug}`} initialLocale="en">
      <ProjectPage {...getProjectData(slug)!} />
    </SiteShell>
  );
}
