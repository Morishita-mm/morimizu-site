import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { Home } from '@/dev-pages/workshop/site/home';
import { getHomeData } from '@/dev-pages/workshop/site/data';
export default function Page() {
  return (
    <SiteShell path="/" initialLocale="en">
      <Home data={getHomeData()} />
    </SiteShell>
  );
}
