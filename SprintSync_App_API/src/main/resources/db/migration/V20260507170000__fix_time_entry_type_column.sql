-- Migration: Change entry_type from enum to VARCHAR(50)
-- Description: Ensures compatibility with JPA AttributeConverter and fixes 400/500 errors during effort logging.

-- 0. Drop the check constraint that might be restricting entry_type values
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS chk_entry_type;

-- 1. Alter the column type to VARCHAR
-- We use USING to convert the enum values to their text representation
ALTER TABLE time_entries 
ALTER COLUMN entry_type TYPE VARCHAR(50) 
USING entry_type::text;

-- 2. Add a comment explaining the change
COMMENT ON COLUMN time_entries.entry_type IS 'Work category for the time entry (e.g., development, testing, onsite). Converted to VARCHAR for JPA compatibility.';
