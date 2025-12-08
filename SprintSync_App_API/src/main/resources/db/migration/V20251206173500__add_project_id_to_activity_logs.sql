-- Add project_id column to activity_logs table
-- Using IF NOT EXISTS to make it idempotent
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS project_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_id ON activity_logs(project_id);
