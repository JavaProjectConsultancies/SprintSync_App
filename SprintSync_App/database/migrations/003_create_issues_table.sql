-- Create issues table (similar to tasks table)
CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(36) PRIMARY KEY,
    story_id VARCHAR(36) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'TO_DO',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    assignee_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    reporter_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    issue_number INTEGER,
    due_date DATE,
    labels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for issues table
CREATE INDEX IF NOT EXISTS idx_issues_story_id ON issues(story_id);
CREATE INDEX IF NOT EXISTS idx_issues_assignee_id ON issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_due_date ON issues(due_date);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);

-- Add comments
COMMENT ON TABLE issues IS 'Issues table - similar to tasks but without template functionality';
COMMENT ON COLUMN issues.id IS 'Primary key - 36 character ID with ISSU prefix';
COMMENT ON COLUMN issues.story_id IS 'Foreign key to stories table';
COMMENT ON COLUMN issues.status IS 'Issue status (TO_DO, IN_PROGRESS, QA_REVIEW, DONE, BLOCKED, CANCELLED)';
COMMENT ON COLUMN issues.priority IS 'Issue priority (LOW, MEDIUM, HIGH, CRITICAL)';
COMMENT ON COLUMN issues.issue_number IS 'Sequential issue number within a story';

