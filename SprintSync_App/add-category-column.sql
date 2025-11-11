-- Add category column to subtasks table
-- Run this SQL command on your PostgreSQL database

ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);

