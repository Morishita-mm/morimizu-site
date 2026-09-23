/* oxlint-disable next/no-html-link-for-pages */
import '@/app/journal/roof-journal.css';
import type { ReactNode } from 'react';
import { SiteShell } from '@/dev-pages/workshop/site/shell';
import { MarkdownArticle } from '@/components/markdown-article';
import { journalKinds, type JournalEntry } from '@/lib/journal/types';
import { getProject } from '@/lib/projects';
import { ArticleReading } from '@/dev-pages/workshop/site/article-reading';
import {
  RoofArrow,
  RoofBreadcrumbs,
} from '@/dev-pages/workshop/site/roof-page-components';
import { JournalAuthorshipBadge } from './journal-authorship';
export function JournalEntryView({
  entry,
  related = [],
  before,
}: {
  before?: ReactNode;
  entry: JournalEntry;
  related?: Pick<JournalEntry, 'id' | 'title' | 'kind' | 'publishedAt'>[];
}) {
  return (
    <SiteShell path="/journal">
      {before}
      <article
        className="wrap page-main roof-article journal"
        lang={entry.language}
      >
        <RoofBreadcrumbs
          items={[
            { label: 'HOME', href: '/' },
            { label: 'NOTES', href: '/notes' },
            { label: 'Journal', href: '/journal' },
            { label: '記事' },
          ]}
        />
        <header className="detail-head article-head">
          <p className="eyebrow">
            {journalKinds[entry.kind]} /{' '}
            {entry.language === 'ja' ? '日本語' : 'English'}
          </p>
          <h1 className="article-title">{entry.title}</h1>
          <p className="journal-summary">{entry.summary}</p>
          <div className="detail-metadata">
            <span>
              {entry.publishedAt ? (
                <>
                  公開{' '}
                  <time dateTime={entry.publishedAt}>{entry.publishedAt}</time>
                </>
              ) : (
                '未公開'
              )}
            </span>
            <span>
              更新 <time dateTime={entry.updatedAt}>{entry.updatedAt}</time>
            </span>
          </div>
          <div className="tag-list">
            {entry.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <JournalAuthorshipBadge authorship={entry.authorship} />
          {entry.projects.length > 0 && (
            <p className="journal-projects">
              Project:{' '}
              {entry.projects.map((id) => {
                const project = getProject(id);
                return project ? (
                  <a key={id} href={`/projects/${id}`}>
                    {project.name}
                  </a>
                ) : (
                  <span key={id}>{id}</span>
                );
              })}
            </p>
          )}
        </header>
        {(entry.hypothesis || entry.result || entry.confidence) && (
          <aside className="journal-findings" aria-label="仮説と結果">
            <dl>
              {entry.hypothesis && (
                <>
                  <dt>仮説</dt>
                  <dd>{entry.hypothesis}</dd>
                </>
              )}
              {entry.result && (
                <>
                  <dt>結果</dt>
                  <dd>{entry.result}</dd>
                </>
              )}
              {entry.confidence && (
                <>
                  <dt>確信度（著者の自己評価）</dt>
                  <dd>
                    {
                      { low: '低い', medium: '中程度', high: '高い' }[
                        entry.confidence
                      ]
                    }
                  </dd>
                </>
              )}
            </dl>
          </aside>
        )}
        <ArticleReading>
          <MarkdownArticle content={entry.content} />
        </ArticleReading>
        {related.length > 0 && (
          <nav className="journal-related" aria-label="関連する記録">
            <h2>関連する記録</h2>
            <ul>
              {related.map((item) => (
                <li key={item.id}>
                  <span>
                    {journalKinds[item.kind]} · {item.publishedAt}
                  </span>
                  <a href={`/journal/${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <div className="page-return">
          <a className="text-link" href="/journal">
            Notes / Journal一覧に戻る <RoofArrow />
          </a>
        </div>
      </article>
    </SiteShell>
  );
}
