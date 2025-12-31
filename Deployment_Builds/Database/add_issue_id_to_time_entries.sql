-- Add issue_id column to time_entries table for logging effort on issues
-- This allows QA developers/managers to log time on issues

ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS issue_id VARCHAR(255) REFERENCES issues(id);

-- Create index for faster lookup by issue_id
CREATE INDEX IF NOT EXISTS idx_time_entries_issue_id ON time_entries(issue_id);
