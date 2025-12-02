-- Migration: Drop password_reset_tokens table
-- Description: Reverts the password reset token functionality by dropping the table
-- Created: 2024-12-19

-- Drop the password_reset_tokens table if it exists
DROP TABLE IF EXISTS password_reset_tokens CASCADE;

-- Note: This migration removes the password_reset_tokens table that was created
-- for password reset functionality. If you need to re-implement this feature,
-- you'll need to recreate the table with the appropriate schema.

