import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { AboutPage } from '@/dev-pages/workshop/site/about';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
export default function Page() {
  return (
    <SiteShell path="/about" initialLocale="en">
      <AboutPage resume={{ ja: RESUME_JA, en: RESUME_EN }} />
    </SiteShell>
  );
}
