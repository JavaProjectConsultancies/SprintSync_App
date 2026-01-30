-- Add linked_issue_ids column to tasks table
ALTER TABLE sprintsync.tasks
    ADD COLUMN IF NOT EXISTS linked_issue_ids JSONB;

COMMENT ON COLUMN sprintsync.tasks.linked_issue_ids IS 'JSON array of issue IDs linked to this task';

