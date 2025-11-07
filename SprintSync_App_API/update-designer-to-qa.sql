-- Migration Script: Update Designer Role to QA
-- Date: 2025-11-05
-- Description: This script updates all Designer users to QA role and updates the enum type

-- IMPORTANT: Backup your database before running this script!
-- pg_dump -U postgres sprintsync > backup_before_migration.sql

-- Step 1: Add 'qa' to the enum if it doesn't exist (must be in separate transaction)
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

-- Step 2: Update existing users with 'designer' role to 'qa'
-- Note: This requires the enum to already have 'qa' value (committed above)
UPDATE users 
SET role = 'qa'::user_role 
WHERE role = 'designer'::user_role;

-- Step 3: Create a new enum without 'designer' (PostgreSQL doesn't allow removing enum values directly)
CREATE TYPE user_role_new AS ENUM ('admin', 'manager', 'developer', 'qa');

-- Step 4: Update the users table column to use the new enum
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role_new 
  USING CASE 
    WHEN role::text = 'designer' THEN 'qa'::user_role_new
    WHEN role::text = 'qa' THEN 'qa'::user_role_new
    WHEN role::text = 'admin' THEN 'admin'::user_role_new
    WHEN role::text = 'manager' THEN 'manager'::user_role_new
    WHEN role::text = 'developer' THEN 'developer'::user_role_new
    ELSE 'developer'::user_role_new  -- Default fallback
  END;

-- Step 5: Drop the old enum (only after all dependencies are updated)
DROP TYPE user_role;

-- Step 6: Rename the new enum to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Step 7: Verify the changes
SELECT 
  role, 
  COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY role;

-- Verification queries
-- Check if any users still have 'designer' role (should return 0 rows)
SELECT * FROM users WHERE role::text = 'designer';

-- Check all roles and their counts
SELECT role, COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY role;

