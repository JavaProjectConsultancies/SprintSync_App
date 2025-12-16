-- Migration: Backfill actual_hours for existing tasks and stories
-- This script initializes actual_hours based on existing time_entries data
-- Run this after creating the trigger to ensure all existing data is up-to-date

-- Update actual_hours for all tasks based on existing time_entries
UPDATE tasks 
SET actual_hours = COALESCE((
    SELECT SUM(hours_worked) 
    FROM time_entries 
    WHERE task_id = tasks.id
), 0)
WHERE EXISTS (
    SELECT 1 
    FROM time_entries 
    WHERE task_id = tasks.id
) OR actual_hours IS NULL;

-- Update actual_hours for all stories based on existing time_entries
UPDATE stories 
SET actual_hours = COALESCE((
    SELECT SUM(hours_worked) 
    FROM time_entries 
    WHERE story_id = stories.id
), 0)
WHERE EXISTS (
    SELECT 1 
    FROM time_entries 
    WHERE story_id = stories.id
) OR actual_hours IS NULL;

-- Set actual_hours to 0 for tasks/stories with no time entries (if NULL)
UPDATE tasks 
SET actual_hours = 0 
WHERE actual_hours IS NULL;

UPDATE stories 
SET actual_hours = 0 
WHERE actual_hours IS NULL;

