'use client';
/* oxlint-disable next/no-html-link-for-pages -- Shared with the standalone preview. */
import { useLocale } from '../locale';
import { MountainIcon } from '@/components/mountain-icon';
import { PosterResumeView } from '@/components/poster-resume';
import type { PosterResumeData } from '@/lib/resume';
import type { Localized } from './types';
import '../legacy-resume.css';
export function ResumePage({
  resume,
}: {
  resume: Localized<PosterResumeData>;
}) {
  const { en, t } = useLocale();
  return (
    <div className="e-legacy-resume">
      <a className="resume-back-link" href={en ? '/en/about' : '/about'}>
        ← {t('自己紹介へ戻る', 'Back to About')}
      </a>
      <PosterResumeView
        siteIcon={<MountainIcon />}
        data={en ? resume.en : resume.ja}
        locale={en ? 'en' : 'ja'}
      />
    </div>
  );
}
