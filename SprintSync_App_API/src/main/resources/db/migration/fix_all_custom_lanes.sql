SET search_path TO sprintsync;

-- Step 1: Update workflow_lanes - set status_value = title for all custom_lane_ entries
UPDATE workflow_lanes SET status_value = title WHERE status_value LIKE 'custom_lane_%';

-- Step 2: Update tasks - for each task with custom_lane_ status, find the lane title and update
UPDATE tasks t SET status = wl.title
FROM workflow_lanes wl
WHERE t.status LIKE 'custom_lane_%' 
  AND wl.title = (SELECT title FROM workflow_lanes WHERE id = SUBSTRING(t.status FROM 'custom_lane_(.+)') LIMIT 1);

-- Step 3: For any remaining tasks with custom_lane_ that couldn't be mapped, set to TO_DO
UPDATE tasks SET status = 'TO_DO' WHERE status LIKE 'custom_lane_%';

-- Step 4: Update issues similarly
UPDATE issues i SET status = wl.title
FROM workflow_lanes wl
WHERE i.status LIKE 'custom_lane_%'
  AND wl.title = (SELECT title FROM workflow_lanes WHERE id = SUBSTRING(i.status FROM 'custom_lane_(.+)') LIMIT 1);

-- Step 5: For any remaining issues with custom_lane_ that couldn't be mapped, set to TO_DO
UPDATE issues SET status = 'TO_DO' WHERE status LIKE 'custom_lane_%';

-- Verification
SELECT 'workflow_lanes' as table_name, COUNT(*) as custom_lane_count FROM workflow_lanes WHERE status_value LIKE 'custom_lane_%'
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks WHERE status LIKE 'custom_lane_%'
UNION ALL
SELECT 'issues', COUNT(*) FROM issues WHERE status LIKE 'custom_lane_%';
