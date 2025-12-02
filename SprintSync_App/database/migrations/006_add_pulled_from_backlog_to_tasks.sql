-- Migration: Add is_pulled_from_backlog field to tasks table
-- This field marks tasks that were pulled from backlog to a sprint

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_pulled_from_backlog BOOLEAN DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_pulled_from_backlog ON tasks(is_pulled_from_backlog);

-- Add comment to document the field
COMMENT ON COLUMN tasks.is_pulled_from_backlog IS 'Marks tasks that were pulled from backlog to sprint board';

