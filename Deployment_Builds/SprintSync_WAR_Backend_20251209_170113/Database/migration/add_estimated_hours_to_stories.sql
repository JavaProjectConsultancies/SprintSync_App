-- Add estimated_hours column to stories table if it doesn't exist
-- This fixes the error: column s1_0.estimated_hours does not exist

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
        
        RAISE NOTICE 'Column estimated_hours added to stories table';
    ELSE
        RAISE NOTICE 'Column estimated_hours already exists in stories table';
    END IF;
END $$;

