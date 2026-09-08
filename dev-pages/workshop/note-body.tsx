import { MarkdownArticle } from '@/components/markdown-article';
import { prepareQiitaBody } from '@/lib/content/qiita.mjs';
import 'katex/dist/katex.min.css';

export default function NoteBody({ content }: { content: string }) {
  return <MarkdownArticle content={prepareQiitaBody(content)} />;
}
