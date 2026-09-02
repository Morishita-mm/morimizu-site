import type { Metadata } from 'next';
import { PosterResumeView } from '@/components/poster-resume';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { RESUME_JA } from '@/lib/resume';

export const metadata: Metadata = {
  title: 'About / Resume | morimizu.dev',
  description:
    '森下 瑞基（Mizuki Morishita）のプロフィール・職務経歴・スキル・実績です。',
};

export default function AboutPage() {
  return (
    <div className="site-canvas">
      <SiteHeader active="about" languageHref="/en/about" locale="ja" />

      <main id="main-content">
        <PosterResumeView data={RESUME_JA} locale="ja" />
      </main>

      <SiteFooter locale="ja" />
    </div>
  );
}
