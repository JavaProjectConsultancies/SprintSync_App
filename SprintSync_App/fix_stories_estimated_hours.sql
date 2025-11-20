-- Quick fix: Add estimated_hours column to stories table
-- Run this SQL directly on your PostgreSQL database to fix the error immediately

-- Check if column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'stories' 
        AND column_name = 'estimated_hours'
    ) THEN
        ALTER TABLE stories 
        ADD COLUMN estimated_hours DECIMAL(5,2);
        
        RAISE NOTICE 'Column estimated_hours successfully added to stories table';
    ELSE
        RAISE NOTICE 'Column estimated_hours already exists in stories table';
    END IF;
END $$;

