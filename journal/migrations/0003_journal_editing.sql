ALTER TABLE journal_entries ADD COLUMN deleted_at TEXT;
CREATE INDEX journal_admin_deleted ON journal_entries(deleted_at, id);
