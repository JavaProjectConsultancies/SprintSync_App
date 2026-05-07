-- Migration: Drop the check constraint if it still exists
-- Description: Ensures the 'entry_type' column is not restricted by old values.

ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS chk_entry_type;
