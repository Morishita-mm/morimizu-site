import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ResumePage } from '@/dev-pages/workshop/site/resume-page';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
export const metadata = {
  title: 'Résumé — morimizu works',
  description:
    'Mizuki Morishita’s professional experience, technical skills, and education. Available to print or save as PDF.',
  alternates: {
    canonical: '/en/resume',
    languages: { 'ja-JP': '/resume', 'en-US': '/en/resume' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/resume" initialLocale="en">
      <ResumePage resume={{ ja: RESUME_JA, en: RESUME_EN }} />
    </SiteShell>
  );
}
