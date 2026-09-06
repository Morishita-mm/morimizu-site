import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { NotesPage } from '@/dev-pages/workshop/site/notes';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
export const metadata = {
  title: 'Notes — morimizu works',
  description: 'Qiitaで公開した技術ノート。',
  alternates: {
    canonical: '/notes',
    languages: { 'ja-JP': '/notes', 'en-US': '/en/notes' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/notes">
      <NotesPage articles={getAllQiitaArticles().map(articleSummary)} />
    </SiteShell>
  );
}
