-- Migration: Add parent_id column to stories table
-- This column tracks the original/root story when stories are pulled across sprints

ALTER TABLE stories
ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);

-- Optional: you can add an index if you plan to query by parent_id frequently
-- CREATE INDEX IF NOT EXISTS idx_stories_parent_id ON stories(parent_id);


