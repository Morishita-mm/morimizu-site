ALTER TABLE journal_entries ADD COLUMN saved_at TEXT;
UPDATE journal_entries SET saved_at=(SELECT received_at FROM journal_revisions WHERE entry_id=journal_entries.id AND revision=journal_entries.draft_revision);
