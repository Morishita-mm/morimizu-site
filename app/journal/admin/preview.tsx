'use client';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { MermaidDiagram } from '@/components/mermaid-diagram';
import { jsx, jsxs } from 'react/jsx-runtime';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import type { Root } from 'hast';
import type { JournalAuthorship } from '@/lib/journal/types';
import { JournalAuthorshipBadge } from '@/components/journal-authorship';

export type Preview = {
  source: string;
  document: {
    title: string;
    summary?: string;
    content: string;
    tags: string[];
    authorship?: JournalAuthorship;
  };
  tree: Root;
};
function PreviewCode({ children }: { children?: ReactNode }) {
  const child = Children.toArray(children)[0];
  if (!isValidElement<{ className?: string; children?: ReactNode }>(child))
    return <pre>{children}</pre>;
  const info = child.props.className?.match(/language-([^\s]+)/)?.[1] ?? '';
  const [language, fileName] = info.split(':', 2);
  const code = Children.toArray(child.props.children)
    .filter((v) => typeof v === 'string' || typeof v === 'number')
    .join('');
  if (language === 'mermaid') return <MermaidDiagram chart={code.trimEnd()} />;
  return (
    <div className="markdown-code-block">
      {fileName && <span className="markdown-code-name">{fileName}</span>}
      <pre>{children}</pre>
    </div>
  );
}
export function ArticlePreview({ preview }: { preview: Preview }) {
  return (
    <article className="ja-preview">
      <h1>{preview.document.title || '無題の記事'}</h1>
      {preview.document.summary && (
        <p className="ja-muted">{preview.document.summary}</p>
      )}
      <div className="e-tags">
        {preview.document.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <JournalAuthorshipBadge authorship={preview.document.authorship} />
      <div className="markdown-body">
        {toJsxRuntime(preview.tree, {
          Fragment,
          jsx,
          jsxs,
          components: {
            pre: PreviewCode,
            // Private drafts never contact external images. The same CSP also protects saved previews.
            img: ({ alt }: { alt?: string }) => (
              <span className="ja-image-placeholder">
                画像：{alt || 'プレビューでは外部画像を読み込みません'}
              </span>
            ),
            a: ({ children }: { children?: React.ReactNode }) => (
              <span className="ja-preview-link">{children}</span>
            ),
          },
        })}
      </div>
    </article>
  );
}
