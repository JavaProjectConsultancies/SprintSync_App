-- SQL script to run the due_date migration
-- This script updates the stories and backlog_stories tables to replace estimated_hours with due_date
-- Run this script in your PostgreSQL database client (pgAdmin, DBeaver, psql, etc.)

-- ============================================
-- Migration 1: Update stories table
-- ============================================

-- Step 1: Add the new due_date column
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Step 2: Drop the old estimated_hours column
ALTER TABLE stories
DROP COLUMN IF EXISTS estimated_hours;

-- Step 3: Add a comment to document the change
COMMENT ON COLUMN stories.due_date IS 'Due date for the story (replaces estimated_hours)';

-- ============================================
-- Migration 2: Update backlog_stories table
-- ============================================

-- Step 1: Add the new due_date column
ALTER TABLE backlog_stories
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Step 2: Drop the old estimated_hours column
ALTER TABLE backlog_stories
DROP COLUMN IF EXISTS estimated_hours;

-- Step 3: Add a comment to document the change
COMMENT ON COLUMN backlog_stories.due_date IS 'Due date for the backlog story (replaces estimated_hours)';

-- ============================================
-- Verification
-- ============================================
-- Run these queries to verify the migration:

-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'stories' AND column_name IN ('due_date', 'estimated_hours');

-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'backlog_stories' AND column_name IN ('due_date', 'estimated_hours');

