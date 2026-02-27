-- Add linked_task_ids column to issues for linking tasks to issues
ALTER TABLE issues
    ADD COLUMN IF NOT EXISTS linked_task_ids JSONB;

COMMENT ON COLUMN issues.linked_task_ids IS 'JSON array of task IDs linked to this issue';



