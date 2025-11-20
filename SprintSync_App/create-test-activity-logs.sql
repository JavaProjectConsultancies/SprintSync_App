-- SQL script to create test activity logs for existing tasks
-- This will help verify that the frontend can display activity logs

-- First, get a list of task IDs that exist
-- Then create activity logs for them

-- Insert test activity logs for tasks
-- Replace 'USER000000000009' with your actual user ID

-- Example: Create activity logs for tasks that exist
INSERT INTO activity_logs (id, user_id, entity_type, entity_id, action, description, old_values, new_values, created_at)
SELECT 
  'ACTLOG' || LPAD(ROW_NUMBER() OVER (ORDER BY t.id)::text, 32, '0') as id,
  COALESCE(t.assignee_id, t.reporter_id, 'USER000000000009') as user_id,
  'task' as entity_type,
  t.id as entity_id,
  CASE 
    WHEN t.status::text = 'TO_DO' THEN 'created'
    WHEN t.status::text = 'IN_PROGRESS' THEN 'status_changed'
    ELSE 'updated'
  END as action,
  CASE 
    WHEN t.status::text = 'TO_DO' THEN 'Task created: ' || t.title
    WHEN t.status::text = 'IN_PROGRESS' THEN 'Status changed to IN_PROGRESS'
    ELSE 'Task updated: ' || t.title
  END as description,
  CASE 
    WHEN t.status::text = 'IN_PROGRESS' THEN '{"status": "TO_DO"}'::text
    ELSE NULL
  END as old_values,
  CASE 
    WHEN t.status::text = 'TO_DO' THEN '{"status": "TO_DO", "title": "' || t.title || '"}'::text
    WHEN t.status::text = 'IN_PROGRESS' THEN '{"status": "IN_PROGRESS"}'::text
    ELSE '{"updatedAt": "' || t.updated_at::text || '"}'::text
  END as new_values,
  COALESCE(t.created_at, NOW()) as created_at
FROM tasks t
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
AND NOT EXISTS (
  SELECT 1 FROM activity_logs al 
  WHERE al.entity_type = 'task' 
  AND al.entity_id = t.id
)
LIMIT 50;

-- Verify the logs were created
SELECT 
  al.id,
  al.entity_type,
  al.entity_id,
  al.action,
  al.description,
  al.created_at,
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

