-- Migration: Add experience_years column to users table
-- Stores total professional experience in years as a numeric value

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS experience_years INTEGER;

COMMENT ON COLUMN users.experience_years IS 'Total years of professional experience for the user';


