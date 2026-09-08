-- Editable tags are metadata. Uploaded source and revisions remain immutable.
ALTER TABLE journal_entries ADD COLUMN tags_json TEXT CHECK (tags_json IS NULL OR json_valid(tags_json));
