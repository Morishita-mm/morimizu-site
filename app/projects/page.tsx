import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ProjectsPage } from '@/dev-pages/workshop/site/projects';
import { getProjectCards } from '@/dev-pages/workshop/site/data';
export const metadata = {
  title: 'Projects — morimizu works',
  description: 'つくったもの。アプリの構成図と設計判断。',
  alternates: {
    canonical: '/projects',
    languages: { 'ja-JP': '/projects', 'en-US': '/en/projects' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/projects">
      <ProjectsPage projects={getProjectCards()} />
    </SiteShell>
  );
}
