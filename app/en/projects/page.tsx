import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ProjectsPage } from '@/dev-pages/workshop/site/projects';
import { getProjectCards } from '@/dev-pages/workshop/site/data';
export default function Page() {
  return (
    <SiteShell path="/projects" initialLocale="en">
      <ProjectsPage projects={getProjectCards()} />
    </SiteShell>
  );
}
