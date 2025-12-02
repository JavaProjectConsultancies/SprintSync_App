-- SQL script to check activity logs for specific task IDs
-- Run this in your PostgreSQL database

-- Task IDs from the console logs
-- TASK30cfcb33fef64bada9e667ed17d6bc40
-- TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8
-- TASKd91c7822181c41bdbc3c9d964d996408
-- TASK98f841d5c95d466a8ee498b1a97374cc
-- TASK433c557a92fe4854940de584db504ec3
-- TASK40a3ab4bc87c4755a7fdae098f424121
-- TASKbb6991fff604439393ff04f175629f16
-- TASK990e8400e29b41d4a716446655440002

-- Check activity logs for specific task IDs
SELECT 
  id,
  user_id,
  entity_type,
  entity_id,
  action,
  description,
  created_at
FROM activity_logs
WHERE entity_type = 'task' 
  AND entity_id IN (
    'TASK30cfcb33fef64bada9e667ed17d6bc40',
    'TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8',
    'TASKd91c7822181c41bdbc3c9d964d996408',
    'TASK98f841d5c95d466a8ee498b1a97374cc',
    'TASK433c557a92fe4854940de584db504ec3',
    'TASK40a3ab4bc87c4755a7fdae098f424121',
    'TASKbb6991fff604439393ff04f175629f16',
    'TASK990e8400e29b41d4a716446655440002'
  )
ORDER BY created_at DESC;

-- Check total count of activity logs by entity type
SELECT 
  entity_type,
  COUNT(*) as total_logs,
  COUNT(DISTINCT entity_id) as unique_entities
FROM activity_logs
GROUP BY entity_type
ORDER BY total_logs DESC;

-- Check recent activity logs (last 30 days)
SELECT 
  entity_type,
  entity_id,
  action,
  description,
  created_at
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 50;

-- Check if there are ANY activity logs for tasks
SELECT 
  COUNT(*) as total_task_logs,
  COUNT(DISTINCT entity_id) as unique_tasks_with_logs,
  MIN(created_at) as oldest_log,
  MAX(created_at) as newest_log
FROM activity_logs
WHERE entity_type = 'task';

-- Check activity logs for a specific task (replace with actual task ID)
SELECT 
  id,
  user_id,
  entity_type,
  entity_id,
  action,
  description,
  old_values,
  new_values,
  created_at
FROM activity_logs
WHERE entity_type = 'task' 
  AND entity_id = 'TASK990e8400e29b41d4a716446655440002'
ORDER BY created_at DESC;

