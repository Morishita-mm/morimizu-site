import {
  database,
  publicEntry,
  publicList,
  adminEntry,
} from '@/journal/store.mjs';
import type { JournalEntry } from './types';
// Delay the platform import: Vinext inspects route modules in Node at build time.
async function journalDatabase() {
  const { env } = await import('cloudflare:workers');
  return database(env);
}
export async function getJournalEntries(before = '', sort = 'desc') {
  return (await publicList(await journalDatabase(), before, sort)) as {
    entries: Omit<JournalEntry, 'content' | 'relatedEntries'>[];
    next: string | null;
  };
}
export async function getJournalEntry(id: string, share = false) {
  return (await publicEntry(await journalDatabase(), id, share)) as {
    entry: JournalEntry;
    related: Pick<JournalEntry, 'id' | 'title' | 'kind' | 'publishedAt'>[];
  } | null;
}
export async function getDraft(id: string) {
  const row = await adminEntry(await journalDatabase(), id);
  if (!row) return null;
  return {
    entry: {
      ...JSON.parse(row.document),
      ...(row.tags_json !== null ? { tags: JSON.parse(row.tags_json) } : {}),
      publishedAt: row.published_at ?? '',
    } as JournalEntry,
    revision: row.draft_revision as string,
  };
}
