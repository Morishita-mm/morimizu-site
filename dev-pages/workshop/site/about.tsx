'use client';
import { useLocale } from '../locale';
import { SiteIcon } from '../site-identity';
import { PosterResumeView } from '@/components/poster-resume';
import type { PosterResumeData } from '@/lib/resume';
import type { Localized } from './types';
import '../legacy-resume.css';
export function AboutPage({ resume }: { resume: Localized<PosterResumeData> }) {
  const { en } = useLocale();
  return (
    <div className="e-legacy-resume">
      <PosterResumeView
        siteIcon={<SiteIcon variant="shoulder-raised" />}
        data={en ? resume.en : resume.ja}
        locale={en ? 'en' : 'ja'}
      />
    </div>
  );
}
