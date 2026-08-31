import { generatedQiitaArticles } from '@/lib/generated/qiita-articles';

const qiitaUser = 'mzk_tech';

type GeneratedQiitaArticle = (typeof generatedQiitaArticles)[number];

export type QiitaArticle = {
  id: string;
  title: string;
  tags: string[];
  updatedAt: string;
  content: string;
  summary: string;
  qiitaUrl: string;
  firstImage?: string;
  readingMinutes: number;
};

function normalizeQiitaNotes(markdown: string) {
  return markdown.replace(
    /^:::note(?:\s+([^\n]+))?\r?\n([\s\S]*?)^:::\s*$/gm,
    (_match, rawKind: string | undefined, body: string) => {
      const kind = rawKind?.trim().toLowerCase();
      const label = kind === 'warn' || kind === 'warning' ? '注意' : 'メモ';
      const quotedBody = body
        .trim()
        .split(/\r?\n/)
        .map((line) => (line ? `> ${line}` : '>'))
        .join('\n');

      return `> **${label}**\n>\n${quotedBody}`;
    },
  );
}

function extractSummary(markdown: string) {
  const withoutCode = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ');
  const paragraph = withoutCode
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(
      (block) =>
        block &&
        !/^#{1,6}\s/.test(block) &&
        !block.startsWith('![') &&
        !/^<img\b/i.test(block),
    )
    .map((block) =>
      block
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/<img\b[^>]*>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/^\s{0,3}(?:>|[-*+] |\d+[.)] )/gm, ' ')
        .replace(/[*_~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .find((block) => block.length >= 36);
  const plainText = paragraph ?? 'Qiitaで公開している技術ノートです。';

  if (plainText.length <= 148) {
    return plainText;
  }

  return `${plainText.slice(0, 148).trimEnd()}…`;
}

function extractFirstImage(markdown: string) {
  const markdownImage = markdown.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)[^)]*\)/i);
  if (markdownImage?.[1]) {
    return markdownImage[1];
  }

  const htmlImage = markdown.match(/<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/i);
  return htmlImage?.[1];
}

function toArticle(article: GeneratedQiitaArticle): QiitaArticle {
  const content = normalizeQiitaNotes(article.content);

  return {
    id: article.id,
    title: article.title,
    tags: [...article.tags],
    updatedAt: article.updatedAt,
    content,
    summary: extractSummary(content),
    qiitaUrl: `https://qiita.com/${qiitaUser}/items/${article.id}`,
    firstImage: extractFirstImage(content),
    readingMinutes: Math.max(1, Math.ceil(content.length / 700)),
  };
}

const articles = generatedQiitaArticles
  .map(toArticle)
  .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

export function getAllQiitaArticles() {
  return articles;
}

export function getQiitaArticle(id: string) {
  return articles.find((article) => article.id === id);
}

export function getRecentQiitaArticles(limit = 3) {
  return articles.slice(0, limit);
}

export function formatArticleDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
