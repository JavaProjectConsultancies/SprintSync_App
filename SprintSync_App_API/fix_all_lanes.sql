SET search_path TO sprintsync;

-- Update ALL workflow_lanes to use title as status_value
UPDATE workflow_lanes
SET status_value = UPPER(TRIM(title))
WHERE status_value LIKE 'custom_lane_%' OR id IN (
  SELECT id FROM workflow_lanes WHERE title != status_value AND status_value NOT IN ('TO_DO', 'IN_PROGRESS', 'QA', 'DONE', 'BLOCKED', 'CANCELLED')
);

-- Show results
SELECT 'Updated workflow lanes' AS info, COUNT(*) FROM workflow_lanes WHERE status_value = UPPER(TRIM(title));
