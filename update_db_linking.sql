-- Migration script for Linked Tasks and Issues
-- Run in sprintsync schema

-- 1. Add linked_task_ids to issues table
ALTER TABLE sprintsync.issues 
ADD COLUMN IF NOT EXISTS linked_task_ids JSONB;

COMMENT ON COLUMN sprintsync.issues.linked_task_ids IS 'JSON array of task IDs linked to this issue';

-- 2. Add linked_issue_ids to tasks table
ALTER TABLE sprintsync.tasks 
ADD COLUMN IF NOT EXISTS linked_issue_ids JSONB;

COMMENT ON COLUMN sprintsync.tasks.linked_issue_ids IS 'JSON array of issue IDs linked to this task';
