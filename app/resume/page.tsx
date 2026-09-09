import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { ResumePage } from '@/dev-pages/workshop/site/resume-page';
import { RESUME_JA, RESUME_EN } from '@/lib/resume';
export const metadata = {
  title: 'Résumé — morimizu works',
  description: '森下瑞基の職務経歴、技術スキル、学歴。印刷・PDF保存にも対応。',
  alternates: {
    canonical: '/resume',
    languages: { 'ja-JP': '/resume', 'en-US': '/en/resume' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/resume">
      <ResumePage resume={{ ja: RESUME_JA, en: RESUME_EN }} />
    </SiteShell>
  );
}
