-- Schema only: deployments never seed, replace, or reset saved content.
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  draft_revision TEXT,
  live_revision TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','unlisted','public')),
  share_hash TEXT UNIQUE,
  published_at TEXT,
  version INTEGER NOT NULL DEFAULT 0,
  CHECK (visibility = 'private' OR live_revision IS NOT NULL),
  CHECK (share_hash IS NULL OR visibility = 'unlisted'),
  FOREIGN KEY (id, draft_revision) REFERENCES journal_revisions(entry_id, revision),
  FOREIGN KEY (id, live_revision) REFERENCES journal_revisions(entry_id, revision)
);
CREATE TABLE journal_revisions (
  entry_id TEXT NOT NULL REFERENCES journal_entries(id),
  revision TEXT NOT NULL,
  source TEXT NOT NULL,
  document TEXT NOT NULL,
  received_at TEXT NOT NULL,
  PRIMARY KEY (entry_id, revision)
);
CREATE INDEX journal_public ON journal_entries(visibility, published_at DESC, id);
