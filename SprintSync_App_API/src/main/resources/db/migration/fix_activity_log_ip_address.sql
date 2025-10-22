-- Fix activity_logs ip_address column type
-- Change from INET to VARCHAR to avoid type casting issues

-- Check if the column exists and alter it
DO $$ 
BEGIN
    -- Alter the ip_address column type from INET to VARCHAR
    ALTER TABLE activity_logs 
    ALTER COLUMN ip_address TYPE VARCHAR(45) 
    USING ip_address::text;
    
    RAISE NOTICE 'Successfully changed ip_address column type to VARCHAR(45)';
EXCEPTION
    WHEN undefined_column THEN
        RAISE NOTICE 'Column ip_address does not exist, skipping';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;


