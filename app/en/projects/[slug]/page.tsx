import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ProjectPage } from '@/dev-pages/workshop/site/project';
import { getProjectData } from '@/dev-pages/workshop/site/data';
import { getProject } from '@/lib/projects';
import { getProjectEn } from '@/lib/projects-en';
export { generateStaticParams } from '@/app/projects/[slug]/page';
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectEn(slug);
  if (!project) return {};
  return {
    title: `${project.name} | Projects | morimizu.dev`,
    description: project.summary,
    alternates: {
      canonical: `/en/projects/${project.slug}`,
      languages: {
        'ja-JP': `/projects/${project.slug}`,
        'en-US': `/en/projects/${project.slug}`,
      },
    },
    openGraph: {
      title: `${project.name} | morimizu.dev`,
      description: project.summary,
      images: project.image ? [project.image.src] : [],
    },
  };
}
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
