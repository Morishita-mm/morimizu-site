import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ProjectsPage } from '@/dev-pages/workshop/site/projects';
import { getProjectCards } from '@/dev-pages/workshop/site/data';
export const metadata = {
  title: 'Projects — morimizu works',
  description:
    'Apps and tools from my personal projects, with their architecture and design decisions.',
  alternates: {
    canonical: '/en/projects',
    languages: { 'ja-JP': '/projects', 'en-US': '/en/projects' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/projects" initialLocale="en">
      <ProjectsPage projects={getProjectCards()} />
    </SiteShell>
  );
}
