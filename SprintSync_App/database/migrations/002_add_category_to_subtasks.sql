-- Migration: Add category column to subtasks table
-- Run this SQL script on your database to add the category column

ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);

