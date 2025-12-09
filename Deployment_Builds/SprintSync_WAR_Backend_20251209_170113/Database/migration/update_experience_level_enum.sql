-- Migration: Update experience_level enum to new values
-- This migration updates the experience_level enum type to use the new experience level values

-- First, we need to alter the enum type to add new values
-- PostgreSQL doesn't support removing enum values directly, so we'll add new ones first
-- Note: Existing data with old enum values needs to be migrated separately if needed

-- Add new enum values
DO $$ BEGIN
    -- Add new enum values one by one
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'E1' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'E1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'E2' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'E2';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'M1' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'M1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'M2' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'M2';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'M3' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'M3';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'L1' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'L1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'L2' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'L2';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'L3' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'L3';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'S1' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'experience_level')) THEN
        ALTER TYPE experience_level ADD VALUE 'S1';
    END IF;
END $$;

-- Update existing data: Map old enum values to new ones
-- junior -> E1 (0-1yr)
UPDATE users SET experience = 'E1'::experience_level WHERE experience::text = 'junior';
-- mid -> M1 (3-7yrs) - closest match
UPDATE users SET experience = 'M1'::experience_level WHERE experience::text = 'mid';
-- senior -> M3 (7-10yrs) - closest match
UPDATE users SET experience = 'M3'::experience_level WHERE experience::text = 'senior';
-- lead -> L2 (12-18yrs) - closest match
UPDATE users SET experience = 'L2'::experience_level WHERE experience::text = 'lead';

-- Update default value for the column
ALTER TABLE users ALTER COLUMN experience SET DEFAULT 'E1'::experience_level;

-- Note: Old enum values (junior, mid, senior, lead) cannot be removed from the enum type
-- in PostgreSQL without recreating the type. They will remain but should not be used.
-- If you need to remove them completely, you would need to:
-- 1. Create a new enum type with only new values
-- 2. Alter the column to use the new type
-- 3. Drop the old enum type
-- This is a more complex migration and should be done carefully.


