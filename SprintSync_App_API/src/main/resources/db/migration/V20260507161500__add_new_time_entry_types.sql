-- Add new values to time_entry_type enum
-- PostgreSQL 12+ supports ADD VALUE IF NOT EXISTS
-- This must run outside of a transaction if it's a version that requires it.

ALTER TYPE time_entry_type ADD VALUE IF NOT EXISTS 'onsite';
ALTER TYPE time_entry_type ADD VALUE IF NOT EXISTS 'implementation';
ALTER TYPE time_entry_type ADD VALUE IF NOT EXISTS 'support';
