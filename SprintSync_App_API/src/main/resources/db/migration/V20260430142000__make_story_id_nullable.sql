-- Make story_id nullable in tasks and issues tables to support standalone tasks and issues
ALTER TABLE tasks ALTER COLUMN story_id DROP NOT NULL;
ALTER TABLE issues ALTER COLUMN story_id DROP NOT NULL;
