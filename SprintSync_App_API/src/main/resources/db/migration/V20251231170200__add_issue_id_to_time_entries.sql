ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS issue_id VARCHAR(255);
-- Add index for performance on issue tracking
CREATE INDEX IF NOT EXISTS idx_time_entries_issue_id ON time_entries(issue_id);
