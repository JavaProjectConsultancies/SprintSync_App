-- Standalone SQL script to create workflow_lanes table
-- Run this script directly on your PostgreSQL database
-- This can be executed via psql, pgAdmin, or any PostgreSQL client

-- Create workflow_lanes table
CREATE TABLE IF NOT EXISTS workflow_lanes (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL DEFAULT '#3B82F6',
    objective TEXT,
    wip_limit_enabled BOOLEAN DEFAULT false,
    wip_limit INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    status_value VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_project_lane_order UNIQUE (project_id, display_order)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_project_id ON workflow_lanes(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_display_order ON workflow_lanes(project_id, display_order);

-- Add comments
COMMENT ON TABLE workflow_lanes IS 'Custom workflow lanes/columns for Scrum boards';
COMMENT ON COLUMN workflow_lanes.status_value IS 'Maps to task/story status value for filtering and drag-drop operations';

