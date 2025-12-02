-- Migration: Add is_pulled_from_backlog field to tasks table
-- This field marks tasks that were pulled from backlog stories when creating new stories in sprints

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_pulled_from_backlog BOOLEAN DEFAULT false;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_is_pulled_from_backlog ON tasks(is_pulled_from_backlog);

COMMENT ON COLUMN tasks.is_pulled_from_backlog IS 'Indicates if this task was pulled from a backlog story when creating a new story in a sprint';

