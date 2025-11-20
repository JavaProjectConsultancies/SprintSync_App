-- SQL script to check if task IDs from backlog exist in activity_logs table
-- Run this in your PostgreSQL database

-- First, let's see what task IDs are in the backlog (from tasks table)
SELECT 
  id as task_id,
  title,
  story_id,
  status,
  created_at,
  updated_at
FROM tasks
WHERE story_id IN (
  SELECT id FROM stories WHERE project_id = 'PROJ0000000000001'
)
ORDER BY created_at DESC
LIMIT 50;

-- Check activity logs for these specific task IDs
-- Task IDs from console logs:
-- TASK30cfcb33fef64bada9e667ed17d6bc40
-- TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8
-- TASKd91c7822181c41bdbc3c9d964d996408
-- TASK98f841d5c95d466a8ee498b1a97374cc
-- TASK433c557a92fe4854940de584db504ec3
-- TASK40a3ab4bc87c4755a7fdae098f424121
-- TASKbb6991fff604439393ff04f175629f16
-- TASK990e8400e29b41d4a716446655440002

-- Check if these task IDs exist in activity_logs
SELECT 
  al.id,
  al.entity_type,
  al.entity_id,
  al.action,
  al.description,
  al.user_id,
  al.created_at,
  t.id as task_id,
  t.title as task_title
FROM activity_logs al
LEFT JOIN tasks t ON al.entity_id = t.id
WHERE al.entity_type = 'task'
  AND al.entity_id IN (
    'TASK30cfcb33fef64bada9e667ed17d6bc40',
    'TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8',
    'TASKd91c7822181c41bdbc3c9d964d996408',
    'TASK98f841d5c95d466a8ee498b1a97374cc',
    'TASK433c557a92fe4854940de584db504ec3',
    'TASK40a3ab4bc87c4755a7fdae098f424121',
    'TASKbb6991fff604439393ff04f175629f16',
    'TASK990e8400e29b41d4a716446655440002'
  )
ORDER BY al.created_at DESC;

-- Check what entity_types exist in activity_logs
SELECT 
  entity_type,
  COUNT(*) as count,
  COUNT(DISTINCT entity_id) as unique_entities
FROM activity_logs
GROUP BY entity_type
ORDER BY count DESC;

-- Check all activity logs for 'task' entity type
SELECT 
  entity_id,
  COUNT(*) as log_count,
  MIN(created_at) as first_log,
  MAX(created_at) as last_log,
  STRING_AGG(DISTINCT action, ', ') as actions
FROM activity_logs
WHERE entity_type = 'task'
GROUP BY entity_id
ORDER BY last_log DESC
LIMIT 50;

-- Check if any of the backlog task IDs match activity log entity_ids (exact match)
SELECT 
  t.id as task_id,
  t.title,
  COUNT(al.id) as activity_log_count,
  MAX(al.created_at) as last_activity
FROM tasks t
LEFT JOIN activity_logs al ON al.entity_type = 'task' AND al.entity_id = t.id
WHERE t.id IN (
  'TASK30cfcb33fef64bada9e667ed17d6bc40',
  'TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8',
  'TASKd91c7822181c41bdbc3c9d964d996408',
  'TASK98f841d5c95d466a8ee498b1a97374cc',
  'TASK433c557a92fe4854940de584db504ec3',
  'TASK40a3ab4bc87c4755a7fdae098f424121',
  'TASKbb6991fff604439393ff04f175629f16',
  'TASK990e8400e29b41d4a716446655440002'
)
GROUP BY t.id, t.title
ORDER BY activity_log_count DESC;

-- Check for any activity logs with similar IDs (in case of ID format mismatch)
SELECT 
  al.id,
  al.entity_type,
  al.entity_id,
  al.action,
  al.created_at,
  CASE 
    WHEN al.entity_id LIKE '%990e8400e29b41d4a716446655440002%' THEN 'MATCHES TASK990e8400e29b41d4a716446655440002'
    WHEN al.entity_id LIKE '%30cfcb33fef64bada9e667ed17d6bc40%' THEN 'MATCHES TASK30cfcb33fef64bada9e667ed17d6bc40'
    ELSE 'NO MATCH'
  END as match_status
FROM activity_logs al
WHERE al.entity_type = 'task'
  AND (
    al.entity_id LIKE '%990e8400e29b41d4a716446655440002%'
    OR al.entity_id LIKE '%30cfcb33fef64bada9e667ed17d6bc40%'
    OR al.entity_id LIKE '%c034ab0f6a2a4fedb32d5e9c7e1dc8a8%'
  )
ORDER BY al.created_at DESC;

