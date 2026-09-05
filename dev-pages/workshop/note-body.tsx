import { MarkdownArticle } from '@/components/markdown-article';
import 'katex/dist/katex.min.css';

export default function NoteBody({ content }: { content: string }) {
  // Preserve code and real $O(N)$ math. Decimal dollar prices in the existing
  // articles are literal currency, not the start of an inline math formula.
  const readableContent = content
    .split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(/(?<!\\)\$(?=\d+\.\d{2}(?:\s|[*/),]))/g, '\\$'),
    )
    .join('');
  return <MarkdownArticle content={readableContent} />;
}
