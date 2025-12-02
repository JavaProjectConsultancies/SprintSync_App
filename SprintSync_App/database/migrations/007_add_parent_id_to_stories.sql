
-- NOTE: We intentionally use VARCHAR here (and no explicit foreign key)
-- to be compatible with environments where story IDs are stored as
-- UUID or as VARCHAR (e.g., Aiven databases created via JPA).
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS parent_id VARCHAR(255);

-- Index for faster lookup by parent story
CREATE INDEX IF NOT EXISTS idx_stories_parent_id ON stories(parent_id);


