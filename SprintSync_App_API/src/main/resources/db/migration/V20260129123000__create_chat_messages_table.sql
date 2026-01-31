-- Set schema
SET search_path TO sprintsync;

-- Create chat_messages table to store communication for tasks and issues
CREATE TABLE chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'task' or 'issue'
    message TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for faster retrieval of messages for a specific entity
CREATE INDEX idx_chat_messages_entity ON chat_messages(entity_id, entity_type);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
