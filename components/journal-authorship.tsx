'use client';
/* oxlint-disable next/no-img-element -- Official badge must be displayed without modification. */
import type { JournalAuthorship } from '@/lib/journal/types';
import { useLocale } from '@/dev-pages/workshop/locale';

export function JournalAuthorshipBadge({
  authorship,
}: {
  authorship?: JournalAuthorship;
}) {
  const { en, t } = useLocale();
  if (authorship === 'human')
    return (
      <a
        className="journal-authorship journal-authorship-human"
        href={en ? 'https://notbyai.fyi/' : 'https://notbyai.fyi/jp/'}
        target="_blank"
        rel="noreferrer"
        aria-label={t(
          '人間が執筆 · Not By AIの説明（新しいタブ）',
          'Written by Human · About Not By AI (opens in a new tab)',
        )}
        lang={en ? 'en' : 'ja'}
      >
        <img
          src={
            en
              ? '/not-by-ai/written-by-human-en.svg'
              : '/not-by-ai/written-by-human.svg'
          }
          alt={t(
            '人間が書いた文章です · Not By AI',
            'Written by Human, Not By AI',
          )}
          height={42}
          width={131}
        />
      </a>
    );
  if (authorship === 'ai')
    return (
      <span
        className="journal-authorship journal-authorship-ai"
        lang={en ? 'en' : 'ja'}
      >
        {t('AI生成', 'AI-generated')}
      </span>
    );
  return null;
}
