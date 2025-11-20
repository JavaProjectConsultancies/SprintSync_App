-- Fix: Add estimated_hours column to stories table
-- This fixes the 500 error on /api/stories endpoint

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(5,2);

-- Verify the column was added
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'stories' 
AND column_name = 'estimated_hours';

