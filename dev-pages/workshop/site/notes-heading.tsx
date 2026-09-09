'use client';
/* oxlint-disable next/no-html-link-for-pages -- Section links retain existing public URLs. */
import type { ReactNode } from 'react';
import { useLocale } from '../locale';
export function NotesHeading({
  section,
  tabs,
}: {
  section: 'journal' | 'qiita';
  tabs?: ReactNode;
}) {
  const { t, en } = useLocale();
  return (
    <>
      <header className="e-page-heading">
        <p className="e-kicker">02 / NOTES</p>
        <h1>
          {t('書いたこと、', 'Things I wrote,')}
          <br />
          {t('のこしたもの。', 'things I kept.')}
        </h1>
        <p>
          {t(
            '気づきや実験、判断を残すJournalと、Qiitaで公開した技術記事をまとめています。',
            'Journal captures observations, experiments, and decisions. Qiita collects published technical articles. Entries are in their original language.',
          )}
        </p>
      </header>
      {tabs ?? (
        <nav
          className="e-notes-tabs"
          aria-label={t('Notesのセクション', 'Notes sections')}
        >
          <a
            href="/journal"
            aria-current={section === 'journal' ? 'page' : undefined}
          >
            Journal
          </a>
          <a
            href={en ? '/en/notes' : '/notes'}
            aria-current={section === 'qiita' ? 'page' : undefined}
          >
            {t('Qiita記事', 'Qiita articles')}
          </a>
        </nav>
      )}
      <p className="e-notes-intro">
        {section === 'journal'
          ? t(
              '日々の気づき、実験、判断の記録。',
              'Day-to-day observations, experiments, and decisions.',
            )
          : t(
              'Qiitaで公開した技術記事を、このサイトにもそのまま載せています。',
              'Technical articles reproduced from Qiita in their original Japanese.',
            )}
      </p>
    </>
  );
}
