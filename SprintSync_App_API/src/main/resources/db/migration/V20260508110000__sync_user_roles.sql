-- Consolidated Migration: Sync User Roles
-- Description: Ensures the 'user_role' enum contains all roles defined in the application
-- Roles: admin, manager, developer, qa_manager, qa_developer, master_admin, support_and_implementation, client

-- Add values if they don't exist
-- Note: PostgreSQL 10+ supports ADD VALUE IF NOT EXISTS
-- These must run outside of a multi-statement transaction in some environments,
-- but Flyway handles them correctly in versioned migrations.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'qa_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'qa_developer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'master_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'support_and_implementation';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'qa';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'tester';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'analyst';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'designer';
