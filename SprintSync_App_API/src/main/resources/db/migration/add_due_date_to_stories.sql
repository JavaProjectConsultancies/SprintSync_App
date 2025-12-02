-- Add due_date column to stories table if it doesn't exist
-- This allows stories to have a due date instead of just estimated hours

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stories' 
        AND column_name = 'due_date'
    ) THEN
        ALTER TABLE stories 
        ADD COLUMN due_date DATE;
        
        RAISE NOTICE 'Column due_date added to stories table';
    ELSE
        RAISE NOTICE 'Column due_date already exists in stories table';
    END IF;
END $$;

