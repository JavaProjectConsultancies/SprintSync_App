-- Database Migration: Standardize Workflow Lane Status Values
-- Schema: sprintsync

SET search_path TO sprintsync;

-- Step 1: Update workflow_lanes
UPDATE sprintsync.workflow_lanes
SET status_value = REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(UPPER(TRIM(title)), '\s+', '_', 'g'), '[^A-Z0-9_]', '', 'g'), '_{2,}', '_', 'g')
WHERE status_value LIKE 'custom_lane_%';

-- Step 2: Update tasks
UPDATE sprintsync.tasks t
SET status = (
  SELECT REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(UPPER(TRIM(wl.title)), '\s+', '_', 'g'), '[^A-Z0-9_]', '', 'g'), '_{2,}', '_', 'g')
  FROM sprintsync.workflow_lanes wl
  WHERE wl.status_value = t.status
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM sprintsync.workflow_lanes wl2
  WHERE wl2.status_value = t.status
  AND wl2.status_value LIKE 'custom_lane_%'
);

-- Step 3: Update issues
UPDATE sprintsync.issues i
SET status = (
  SELECT REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(UPPER(TRIM(wl.title)), '\s+', '_', 'g'), '[^A-Z0-9_]', '', 'g'), '_{2,}', '_', 'g')
  FROM sprintsync.workflow_lanes wl
  WHERE wl.status_value = i.status
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM sprintsync.workflow_lanes wl2
  WHERE wl2.status_value = i.status
  AND wl2.status_value LIKE 'custom_lane_%'
);
