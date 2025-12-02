-- Migration: Rename estimated_hours to due_date in stories table
-- Date: 2024-01-XX
-- Description: Replace estimated_hours (DECIMAL) column with due_date (DATE) column

-- Step 1: Add the new due_date column
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Step 2: Copy any existing data (if needed, convert estimated hours to a date)
-- Note: This is a data type change, so we can't directly convert hours to dates
-- If you have existing estimated_hours data that needs to be preserved, 
-- you would need custom logic here. For now, we'll just add the new column.

-- Step 3: Drop the old estimated_hours column
ALTER TABLE stories
DROP COLUMN IF EXISTS estimated_hours;

-- Step 4: Add a comment to document the change
COMMENT ON COLUMN stories.due_date IS 'Due date for the story (replaces estimated_hours)';

