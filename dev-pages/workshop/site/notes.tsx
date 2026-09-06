'use client';
import { useLocale } from '../locale';
import { LikesUpdated } from '../qiita-likes';
import { Arrow, NoteRow } from './components';
import type { ArticleSummary } from './types';
export function NotesPage({ articles }: { articles: ArticleSummary[] }) {
  const { t } = useLocale();
  return (
    <div className="shell">
      <header className="e-page-heading">
        <p className="e-kicker">02 / NOTES</p>
        <h1>
          {t('Qiitaに書いたものを、', 'From Qiita,')}
          <br />
          {t('ここでも。', 'collected here.')}
        </h1>
        <p>
          {t(
            '実装で詰まったところや、あとで見返したいことを書いています。Qiitaで公開した記事を、このサイトにもそのまま載せています。',
            'Implementation challenges and notes worth revisiting. These articles are reproduced from Qiita in their original Japanese.',
          )}
        </p>
      </header>
      <div className="e-list-caption">
        <h2>
          {t('記事を読む', 'Articles')} <span>{articles.length}</span>
        </h2>
        <span>{t('新しい順', 'Newest first')}</span>
      </div>
      <ol className="e-note-list">
        {articles.map((article, index) => (
          <NoteRow key={article.id} article={article} index={index} />
        ))}
      </ol>
      <LikesUpdated />
      <a className="e-outline-link" href="https://qiita.com/morimizu">
        {t('Qiitaのプロフィールを見る', 'View Qiita profile')}{' '}
        <Arrow diagonal />
      </a>
    </div>
  );
}
