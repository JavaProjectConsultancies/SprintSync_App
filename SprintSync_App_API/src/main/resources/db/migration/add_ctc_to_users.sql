-- Migration: Add ctc (Cost To Company) column to users table
-- This column stores the annual CTC (Cost To Company) for each user

-- Add ctc column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ctc DECIMAL(15,2);

-- Add comment to describe the column
COMMENT ON COLUMN users.ctc IS 'Annual Cost To Company (CTC) in the base currency';



