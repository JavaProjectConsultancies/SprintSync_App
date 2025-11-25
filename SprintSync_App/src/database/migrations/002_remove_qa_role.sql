-- Migration Script: Remove QA Role
-- Description: This script removes the 'qa' role from the system
-- Steps:
-- 1. Update all existing users with 'qa' role to 'developer' role
-- 2. Remove 'qa' from the user_role ENUM type

-- Step 1: Update existing users with 'qa' role to 'developer' role
UPDATE users 
SET role = 'developer'::user_role 
WHERE role = 'qa'::user_role;

-- Step 2: Remove 'qa' from user_role ENUM
-- PostgreSQL doesn't support removing enum values directly, so we need to:
-- 1. Create a new enum without 'qa'
-- 2. Update the column to use the new enum
-- 3. Drop the old enum
-- 4. Rename the new enum

-- Create new enum without 'qa'
CREATE TYPE user_role_new AS ENUM ('admin', 'manager', 'developer');

-- Update the users table to use the new enum
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role_new 
  USING CASE 
    WHEN role::text = 'admin' THEN 'admin'::user_role_new
    WHEN role::text = 'manager' THEN 'manager'::user_role_new
    WHEN role::text = 'developer' THEN 'developer'::user_role_new
    WHEN role::text = 'qa' THEN 'developer'::user_role_new
    ELSE 'developer'::user_role_new
  END;

-- Drop the old enum (only if no other tables use it)
-- Note: Check if other tables reference user_role before dropping
DROP TYPE IF EXISTS user_role;

-- Rename the new enum to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Verify the migration
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM users WHERE role::text = 'qa') THEN
    RAISE EXCEPTION 'Migration failed: Users with qa role still exist';
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND 
             (SELECT COUNT(*) FROM unnest(enum_range(NULL::user_role))::text) = 3) THEN
    RAISE NOTICE 'Migration successful: QA role removed from user_role enum';
  END IF;
END $$;

