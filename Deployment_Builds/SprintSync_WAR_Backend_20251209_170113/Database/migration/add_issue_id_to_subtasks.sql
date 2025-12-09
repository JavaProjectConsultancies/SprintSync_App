-- Migration: Add issue_id column to subtasks table
-- This column allows subtasks to be associated with issues (similar to tasks)

-- Drop the column if it exists with wrong type (UUID) and recreate it as VARCHAR
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subtasks' AND column_name = 'issue_id') THEN
        ALTER TABLE subtasks DROP COLUMN issue_id;
    END IF;
END $$;

-- Add issue_id column to subtasks table (nullable, as subtasks can belong to either tasks or issues)
-- Using VARCHAR to match the type of issues.id and task_id columns
ALTER TABLE subtasks ADD COLUMN issue_id VARCHAR(255);

-- Add foreign key constraint to issues table (if issues table exists)
-- Note: This will only work if the issues table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issues') THEN
        -- Add foreign key constraint
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_subtasks_issue_id' 
            AND table_name = 'subtasks'
        ) THEN
            ALTER TABLE subtasks 
            ADD CONSTRAINT fk_subtasks_issue_id 
            FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_subtasks_issue_id ON subtasks(issue_id);

