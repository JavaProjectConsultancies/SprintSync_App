-- Complete Lane Status Migration Script
-- This script will update ALL custom_lane_ references to use lane title

SET search_path TO sprintsync;

-- Step 1: Create temporary mapping table
CREATE TEMP TABLE lane_status_map AS
SELECT 
    id,
    title,
    status_value AS old_status,
    UPPER(TRIM(title)) AS new_status
FROM workflow_lanes;

-- Step 2: Update workflow_lanes (use title directly as status)
UPDATE workflow_lanes
SET status_value = UPPER(TRIM(title))
WHERE status_value LIKE 'custom_lane_%';

-- Step 3: Update tasks using the mapping
UPDATE tasks t
SET status = m.new_status
FROM lane_status_map m
WHERE t.status = m.old_status
AND m.old_status LIKE 'custom_lane_%';

-- Step 4: Update issues using the mapping
UPDATE issues i
SET status = m.new_status
FROM lane_status_map m
WHERE i.status = m.old_status
AND m.old_status LIKE 'custom_lane_%';

-- Step 5: Show verification results
SELECT 'Workflow Lanes Check' AS check_type,
       COUNT(*) AS remaining_count
FROM workflow_lanes
WHERE status_value LIKE 'custom_lane_%'
UNION ALL
SELECT 'Tasks Check' AS check_type,
       COUNT(*) AS remaining_count
FROM tasks
WHERE status LIKE 'custom_lane_%'
UNION ALL
SELECT 'Issues Check' AS check_type,
       COUNT(*) AS remaining_count
FROM issues
WHERE status LIKE 'custom_lane_%';

-- Cleanup
DROP TABLE IF EXISTS lane_status_map;
