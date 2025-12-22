-- Migration Script: Add QA Manager and QA Developer Roles
-- Description: This script adds 'qa_manager' and 'qa_developer' roles to the user_role enum
-- PostgreSQL allows adding values to an enum type

-- Add qa_manager to user_role enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'qa_manager' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'qa_manager';
    END IF;
END $$;

-- Add qa_developer to user_role enum (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'qa_developer' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'qa_developer';
    END IF;
END $$;

-- Verify the changes
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;
