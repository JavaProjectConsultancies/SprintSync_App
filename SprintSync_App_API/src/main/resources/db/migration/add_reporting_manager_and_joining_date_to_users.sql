-- Migration: Add reporting_manager and date_of_joining columns to users table
-- Ensures admin panel fields for reporting manager and date of joining persist in the database

-- Add reporting_manager column to store the name of the manager the user reports to
ALTER TABLE users ADD COLUMN IF NOT EXISTS reporting_manager VARCHAR(100);
COMMENT ON COLUMN users.reporting_manager IS 'Plain text name of the user''s reporting manager';

-- Add date_of_joining column to track onboarding date
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_joining DATE;
COMMENT ON COLUMN users.date_of_joining IS 'Calendar date the user joined the organisation';

-- Backfill joining date with existing created_at timestamp when possible
UPDATE users
SET date_of_joining = DATE(created_at)
WHERE date_of_joining IS NULL AND created_at IS NOT NULL;


