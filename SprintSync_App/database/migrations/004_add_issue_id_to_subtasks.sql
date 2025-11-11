-- Migration: Add issue_id column to subtasks table
-- This allows subtasks to be linked to either tasks or issues

-- Add issue_id column (nullable, since subtasks can belong to either tasks or issues)
ALTER TABLE subtasks 
ADD COLUMN IF NOT EXISTS issue_id UUID REFERENCES issues(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_subtasks_issue_id ON subtasks(issue_id);

-- Add a check constraint to ensure a subtask has either task_id or issue_id (but not both)
ALTER TABLE subtasks
ADD CONSTRAINT check_subtask_parent CHECK (
    (task_id IS NOT NULL AND issue_id IS NULL) OR 
    (task_id IS NULL AND issue_id IS NOT NULL)
);

