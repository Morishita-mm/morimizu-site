import type { Metadata } from 'next';
import { PosterResumeView } from '@/components/poster-resume';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { RESUME_EN } from '@/lib/resume';

export const metadata: Metadata = {
  title: 'About / Resume | morimizu.dev',
  description:
    'Resume, experience, skills, and background of Mizuki Morishita (Software Engineer).',
};

export default function EnAboutPage() {
  return (
    <div className="site-canvas">
      <SiteHeader active="about" languageHref="/about" locale="en" />

      <main id="main-content">
        <PosterResumeView data={RESUME_EN} locale="en" />
      </main>

      <SiteFooter locale="en" />
    </div>
  );
}
