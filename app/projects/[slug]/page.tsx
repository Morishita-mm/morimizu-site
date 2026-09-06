import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ProjectPage } from '@/dev-pages/workshop/site/project';
import { getProjectData } from '@/dev-pages/workshop/site/data';
import { getProject, projects } from '@/lib/projects';
type ProjectPageProps = { params: Promise<{ slug: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) return {};

  return {
    title: `${project.name} | つくったもの | morimizu.dev`,
    description: project.summary,
    alternates: {
      canonical: `/projects/${project.slug}`,
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

export default async function Page({ params }: ProjectPageProps) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <SiteShell path={`/projects/${slug}`}>
      <ProjectPage {...getProjectData(slug)!} />
    </SiteShell>
  );
}
