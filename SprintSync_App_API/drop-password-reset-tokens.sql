-- Standalone SQL script to drop password_reset_tokens table
-- Run this script directly against your database to remove the password_reset_tokens table
-- Usage: psql -U your_username -d your_database -f drop-password-reset-tokens.sql

-- Drop the password_reset_tokens table if it exists
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- Verify the table has been dropped
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'password_reset_tokens'
    ) THEN
        RAISE NOTICE 'ERROR: password_reset_tokens table still exists!';
    ELSE
        RAISE NOTICE 'SUCCESS: password_reset_tokens table has been dropped.';
    END IF;
END $$;

