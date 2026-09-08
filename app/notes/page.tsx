import '../journal/journal.css';
import { NotesContent } from '@/app/notes/content';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
export const metadata = {
  title: 'Notes — morimizu works',
  description: '日々の気づきや実験を残すJournalと、Qiitaで公開した技術記事。',
  alternates: {
    canonical: '/notes',
    languages: { 'ja-JP': '/notes', 'en-US': '/en/notes' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/notes">
      <NotesContent
        initialSection="qiita"
        articles={getAllQiitaArticles().map(articleSummary)}
      />
    </SiteShell>
  );
}
