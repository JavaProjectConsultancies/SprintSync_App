ALTER TABLE sprintsync.time_entries ADD COLUMN issue_id VARCHAR(255);
-- Add index for performance on issue tracking
CREATE INDEX idx_time_entries_issue_id ON sprintsync.time_entries(issue_id);
