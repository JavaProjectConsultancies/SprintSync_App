-- Step 1: Add 'qa' to the enum if it doesn't exist
-- This must be committed before Step 2 can use the new enum value
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'qa' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'qa';
    END IF;
END $$;

