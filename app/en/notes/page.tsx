import '../../journal/journal.css';
import { NotesContent } from '@/app/notes/content';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
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
