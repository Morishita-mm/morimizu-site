import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { NotesPage } from '@/dev-pages/workshop/site/notes';
import { articleSummary } from '@/dev-pages/workshop/site/data';
import { getAllQiitaArticles } from '@/lib/qiita-articles';
export default function Page() {
  return (
    <SiteShell path="/notes" initialLocale="en">
      <NotesPage articles={getAllQiitaArticles().map(articleSummary)} />
    </SiteShell>
  );
}
