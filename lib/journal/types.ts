export const journalKinds = {
  log: 'Log',
  hypothesis: 'Hypothesis',
  experiment: 'Experiment',
  decision: 'Decision',
  failure: 'Failure / Incident',
  article: 'Article',
} as const;
export type JournalAuthorship = 'unknown' | 'human' | 'ai';
export type JournalEntry = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  kind: keyof typeof journalKinds;
  language: 'ja' | 'en';
  tags: string[];
  projects: string[];
  relatedEntries: string[];
  summary: string;
  hypothesis?: string;
  result?: string;
  confidence?: 'low' | 'medium' | 'high';
  sourceType: 'manual' | 'conversation-derived' | 'evaluation';
  authorship?: JournalAuthorship;
  content: string;
};
