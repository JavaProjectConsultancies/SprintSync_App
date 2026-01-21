-- Add master_admin to user_role enum
-- This migration adds the master_admin role to the PostgreSQL user_role enum type

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'master_admin';
