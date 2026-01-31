-- Migration script for missing components from old database
SET search_path TO sprintsync;

-- 1. Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'task' or 'issue'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_entity ON chat_messages(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 2. Add reporting_manager and date_of_joining to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS reporting_manager VARCHAR(100);
COMMENT ON COLUMN users.reporting_manager IS 'Plain text name of the user''s reporting manager';

ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_joining DATE;
COMMENT ON COLUMN users.date_of_joining IS 'Calendar date the user joined the organisation';

-- Backfill joining date with existing created_at timestamp when possible
UPDATE users
SET date_of_joining = DATE(created_at)
WHERE date_of_joining IS NULL AND created_at IS NOT NULL;
