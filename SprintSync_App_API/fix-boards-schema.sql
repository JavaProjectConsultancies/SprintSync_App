-- Fix Database Schema for Boards and Workflow Lanes
-- This script fixes the missing boards table and board_id column issues
-- Run this script directly on your PostgreSQL database

-- Step 1: Create boards table if it doesn't exist
CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_project_board_name UNIQUE (project_id, name)
);

-- Step 2: Add foreign key constraint to boards table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'boards_project_id_fkey'
    ) THEN
        ALTER TABLE boards 
        ADD CONSTRAINT boards_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Add board_id column to workflow_lanes table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'workflow_lanes' AND column_name = 'board_id'
    ) THEN
        ALTER TABLE workflow_lanes 
        ADD COLUMN board_id VARCHAR(255);
    END IF;
END $$;

-- Step 4: Add foreign key constraint for board_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'workflow_lanes_board_id_fkey'
    ) THEN
        ALTER TABLE workflow_lanes 
        ADD CONSTRAINT workflow_lanes_board_id_fkey 
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_project_id ON boards(project_id);
CREATE INDEX IF NOT EXISTS idx_boards_is_default ON boards(project_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_board_id ON workflow_lanes(board_id);
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_project_board ON workflow_lanes(project_id, board_id);

-- Step 6: Update unique constraint on workflow_lanes to handle board_id
-- First, drop the old constraint if it exists and doesn't match our needs
DO $$
BEGIN
    -- Drop the old unique constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_project_lane_order'
    ) THEN
        ALTER TABLE workflow_lanes 
        DROP CONSTRAINT unique_project_lane_order;
    END IF;
    
    -- Drop the old unique index if it exists
    DROP INDEX IF EXISTS unique_project_board_lane_order_idx;
    
    -- Add new unique index that allows same display_order for different boards
    -- This constraint allows NULL board_id (for default lanes) and different boards
    -- NULL values are treated as distinct in unique indexes, so we need to handle them properly
    CREATE UNIQUE INDEX IF NOT EXISTS unique_project_board_lane_order_idx 
    ON workflow_lanes(project_id, COALESCE(board_id, 'GLOBAL'), display_order);
END $$;

-- Step 7: Add comments for documentation
COMMENT ON TABLE boards IS 'Scrum boards for projects - allows multiple boards per project';
COMMENT ON COLUMN boards.is_default IS 'Indicates if this is the default board for the project';
COMMENT ON COLUMN workflow_lanes.board_id IS 'Links workflow lane to a specific board (NULL means default/global lanes)';

-- Verification queries (uncomment to check)
-- SELECT table_name FROM information_schema.tables WHERE table_name = 'boards';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'workflow_lanes' AND column_name = 'board_id';

