-- Migration: Create boards table and add board_id to workflow_lanes
-- Created: 2025-01-XX
-- Description: Table for storing multiple Scrum boards per project and linking workflow lanes to boards

-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_project_board_name UNIQUE (project_id, name)
);

-- Add board_id column to workflow_lanes table
ALTER TABLE workflow_lanes 
ADD COLUMN IF NOT EXISTS board_id VARCHAR(255) REFERENCES boards(id) ON DELETE CASCADE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON boards(project_id);
CREATE INDEX IF NOT EXISTS idx_boards_is_default ON boards(project_id, is_default);
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_board_id ON workflow_lanes(board_id);
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_project_board ON workflow_lanes(project_id, board_id);

-- Add comments
COMMENT ON TABLE boards IS 'Scrum boards for projects - allows multiple boards per project';
COMMENT ON COLUMN boards.is_default IS 'Indicates if this is the default board for the project';
COMMENT ON COLUMN workflow_lanes.board_id IS 'Links workflow lane to a specific board (NULL means default board)';

-- Update unique constraint to include board_id
-- First, drop the old constraint if it exists
ALTER TABLE workflow_lanes 
DROP CONSTRAINT IF EXISTS unique_project_lane_order;

-- Add new constraint that includes board_id
ALTER TABLE workflow_lanes 
ADD CONSTRAINT unique_project_board_lane_order 
UNIQUE (project_id, COALESCE(board_id, ''), display_order);

