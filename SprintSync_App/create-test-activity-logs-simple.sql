-- Simple SQL script to create test activity logs for existing tasks
-- Run this to verify the frontend can display activity logs

-- First, let's see what tasks exist and get their details
-- Then create activity logs for them

-- Insert activity logs for tasks (using assignee_id or reporter_id as user_id)
INSERT INTO activity_logs (id, user_id, entity_type, entity_id, action, description, old_values, new_values, created_at)
SELECT 
  'ACTLOG' || LPAD((ROW_NUMBER() OVER (ORDER BY t.id))::text, 32, '0') as id,
  COALESCE(t.assignee_id, t.reporter_id, 'USER000000000009') as user_id,
  'task' as entity_type,
  t.id as entity_id,
  CASE 
    WHEN t.status::text LIKE '%TODO%' OR t.status::text LIKE '%TO_DO%' THEN 'created'
    WHEN t.status::text LIKE '%PROGRESS%' THEN 'status_changed'
    WHEN t.status::text LIKE '%DONE%' THEN 'status_changed'
    ELSE 'updated'
  END as action,
  CASE 
    WHEN t.status::text LIKE '%TODO%' OR t.status::text LIKE '%TO_DO%' THEN 'Task created: ' || COALESCE(t.title, 'Untitled Task')
    WHEN t.status::text LIKE '%PROGRESS%' THEN 'Status changed to IN_PROGRESS'
    WHEN t.status::text LIKE '%DONE%' THEN 'Status changed to DONE'
    ELSE 'Task updated: ' || COALESCE(t.title, 'Untitled Task')
  END as description,
  CASE 
    WHEN t.status::text LIKE '%PROGRESS%' THEN '{"status": "TO_DO"}'::text
    WHEN t.status::text LIKE '%DONE%' THEN '{"status": "IN_PROGRESS"}'::text
    ELSE NULL
  END as old_values,
  CASE 
    WHEN t.status::text LIKE '%TODO%' OR t.status::text LIKE '%TO_DO%' THEN '{"status": "TO_DO", "title": "' || COALESCE(t.title, 'Untitled Task') || '"}'::text
    WHEN t.status::text LIKE '%PROGRESS%' THEN '{"status": "IN_PROGRESS"}'::text
    WHEN t.status::text LIKE '%DONE%' THEN '{"status": "DONE"}'::text
    ELSE '{"updatedAt": "' || COALESCE(t.updated_at::text, NOW()::text) || '"}'::text
  END as new_values,
  COALESCE(t.created_at, NOW()) as created_at
FROM tasks t
WHERE t.id IN (
  SELECT id FROM tasks 
  WHERE id LIKE 'TASK%'
  ORDER BY created_at DESC
  LIMIT 20
)
AND NOT EXISTS (
  SELECT 1 FROM activity_logs al 
  WHERE al.entity_type = 'task' 
  AND al.entity_id = t.id
)
LIMIT 50;

-- Verify the logs were created
SELECT 
  COUNT(*) as total_logs_created,
  COUNT(DISTINCT entity_id) as unique_tasks_with_logs
FROM activity_logs
WHERE entity_type = 'task'
  AND created_at >= NOW() - INTERVAL '1 minute';

-- Show sample logs
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
ORDER BY al.created_at DESC
LIMIT 20;

