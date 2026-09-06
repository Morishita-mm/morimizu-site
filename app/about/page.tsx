import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { AboutPage } from '@/dev-pages/workshop/site/about';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
export const metadata = {
  title: 'About / Résumé — morimizu works',
  description: 'Mizuki Morishitaの職務経歴とスキル。',
  alternates: {
    canonical: '/about',
    languages: { 'ja-JP': '/about', 'en-US': '/en/about' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/about">
      <AboutPage resume={{ ja: RESUME_JA, en: RESUME_EN }} />
    </SiteShell>
  );
}
