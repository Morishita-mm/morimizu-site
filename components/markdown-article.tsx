import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactNode,
} from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { MermaidDiagram } from '@/components/mermaid-diagram';

const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'details',
    'summary',
    'dl',
    'dt',
    'dd',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel'],
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    details: ['open'],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      'width',
      'height',
      'loading',
      'decoding',
    ],
  },
};

type CodeChildProps = {
  className?: string;
  children?: ReactNode;
};

function MarkdownPre({ children }: ComponentPropsWithoutRef<'pre'>) {
  const child = Children.only(children);

  if (!isValidElement<CodeChildProps>(child)) {
    return <pre>{children}</pre>;
  }

  const code = Children.toArray(child.props.children)
    .map((part) =>
      typeof part === 'string' || typeof part === 'number' ? String(part) : '',
    )
    .join('')
    .replace(/\n$/, '');
  const languageInfo = child.props.className?.match(/language-([^\s]+)/)?.[1] ?? '';
  const colonIndex = languageInfo.indexOf(':');
  const language = colonIndex >= 0 ? languageInfo.slice(0, colonIndex) : languageInfo;
  const fileName = colonIndex >= 0 ? languageInfo.slice(colonIndex + 1) : '';

  if (language.toLowerCase() === 'mermaid') {
    return <MermaidDiagram chart={code} />;
  }

  return (
    <div className="markdown-code-block">
      {fileName ? <span className="markdown-code-name">{fileName}</span> : null}
      <pre>
        <code className={language ? `language-${language}` : undefined}>
          {code}
        </code>
      </pre>
    </div>
  );
}

function MarkdownLink({ href, children, ...props }: ComponentPropsWithoutRef<'a'>) {
  const external = href?.startsWith('http://') || href?.startsWith('https://');

  return (
    <a
      {...props}
      href={href}
      rel={external ? 'noreferrer' : undefined}
      target={external ? '_blank' : undefined}
    >
      {children}
    </a>
  );
}

function MarkdownImage({ alt, ...props }: ComponentPropsWithoutRef<'img'>) {
  // Article images have arbitrary external dimensions, so the native element is intentional.
  // oxlint-disable-next-line next/no-img-element
  return <img {...props} alt={alt ?? ''} decoding="async" loading="lazy" />;
}

export function MarkdownArticle({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        components={{
          a: MarkdownLink,
          img: MarkdownImage,
          pre: MarkdownPre,
        }}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, markdownSanitizeSchema],
          rehypeKatex,
        ]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
