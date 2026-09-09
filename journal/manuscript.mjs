import { readFrontMatter } from '../lib/content/frontmatter.mjs';
import { parseEntry } from '../scripts/journal/schema.mjs';

export const newArticleId = () => `j-${crypto.randomUUID()}`;
export const today = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(
    new Date(),
  );
export function serializeManuscript(data, content) {
  return `---\n${Object.entries(data)
    .filter(([, v]) => v !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')}\n---\n${content}`;
}
export function prepareManuscript(source, { id, draft = false } = {}) {
  const parsed = readFrontMatter(source);
  if (!parsed.hasFrontmatter) throw new Error('YAML front matter is required');
  if (id && parsed.data.id && parsed.data.id !== id)
    throw new Error('id cannot be changed');
  if (!parsed.data.id)
    source = serializeManuscript(
      { ...parsed.data, id: id ?? newArticleId() },
      parsed.content,
    );
  const entry = parseEntry(source, 'manuscript', { managed: true, draft });
  if (['admin', 'share', 'upload', 'new'].includes(entry.id))
    throw new Error('Reserved id');
  const {
    status: _status,
    visibility: _visibility,
    publishedAt: _publishedAt,
    ...document
  } = entry;
  return { source, document };
}
