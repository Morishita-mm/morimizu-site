import '../../journal/journal.css';
import { NotesContent } from '@/app/notes/content';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
export const metadata = {
  title: 'Notes — morimizu works',
  description:
    'Journal entries on observations and experiments, alongside technical articles originally published on Qiita.',
  alternates: {
    canonical: '/en/notes',
    languages: { 'ja-JP': '/notes', 'en-US': '/en/notes' },
  },
};
export default function Page() {
  return (
    <SiteShell path="/notes" initialLocale="en">
      <NotesContent
        initialSection="qiita"
        articles={getAllQiitaArticles().map(articleSummary)}
      />
    </SiteShell>
  );
}
