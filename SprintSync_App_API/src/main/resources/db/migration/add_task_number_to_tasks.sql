-- Migration: Add task_number column to tasks table
-- This column stores the serialized task number within each story

-- Add task_number column to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_number INTEGER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_story_task_number ON tasks(story_id, task_number);

-- Update existing tasks with sequential numbers based on their creation order within each story
-- This assigns task numbers to existing tasks
WITH numbered_tasks AS (
    SELECT 
        id,
        story_id,
        ROW_NUMBER() OVER (PARTITION BY story_id ORDER BY created_at, id) as rn
    FROM tasks
    WHERE task_number IS NULL
)
UPDATE tasks t
SET task_number = nt.rn
FROM numbered_tasks nt
WHERE t.id = nt.id;

-- Set default value to 1 for any remaining null values
UPDATE tasks SET task_number = 1 WHERE task_number IS NULL;

-- Add NOT NULL constraint after backfilling data
ALTER TABLE tasks ALTER COLUMN task_number SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN task_number SET DEFAULT 1;
