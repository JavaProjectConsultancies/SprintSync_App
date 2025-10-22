-- ================================================================================
-- ALTER TASK STATUS COLUMN TYPE
-- ================================================================================
-- Purpose: Change task status column from PostgreSQL enum to VARCHAR
-- This allows the TaskStatusConverter to work properly with JPA
--
-- BACKUP EXISTING TRIGGER AND FUNCTION BEFORE RUNNING THIS SCRIPT!
-- ================================================================================

-- Step 1: Get trigger definition for backup
-- Run this first to save the trigger definition:
-- SELECT pg_get_triggerdef(oid) FROM pg_trigger WHERE tgname = 'task_status_notification_trigger';

-- Step 2: Get function definition for backup
-- Run this first to save the function definition:
-- SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'notify_task_status_change';

-- ================================================================================
-- MIGRATION STEPS
-- ================================================================================

-- Step 3: Drop the trigger that depends on the status column
DROP TRIGGER IF EXISTS task_status_notification_trigger ON tasks;

-- Step 4: Drop the trigger function
DROP FUNCTION IF EXISTS notify_task_status_change() CASCADE;

-- Step 5: Alter the column type to VARCHAR
ALTER TABLE tasks 
ALTER COLUMN status TYPE VARCHAR(50) 
USING status::text;

-- ================================================================================
-- RECREATE TRIGGER AND FUNCTION (Standard implementation)
-- ================================================================================

-- Step 6: Recreate the trigger function for task status notifications
-- (Updated function with correct data types)
CREATE OR REPLACE FUNCTION notify_task_status_change()
RETURNS trigger AS $$
DECLARE
    story_title TEXT;
    project_id VARCHAR(255);  -- Changed from UUID to VARCHAR
BEGIN
    -- Get context information
    SELECT s.title, s.project_id INTO story_title, project_id
    FROM stories s WHERE s.id = NEW.story_id;
    
    -- Notify when moved to QA review
    IF OLD.status != 'qa_review' AND NEW.status = 'qa_review' THEN
        -- Notify QA team members
        INSERT INTO notifications (user_id, type, priority, title, message, related_entity_type, related_entity_id)
        SELECT 
            u.id,
            'task',
            'normal',
            'Task Ready for QA Review',
            'Task "' || NEW.title || '" in story "' || story_title || '" is ready for QA review',
            'task',
            NEW.id
        FROM users u 
        JOIN project_team_members ptm ON u.id = ptm.user_id
        WHERE ptm.project_id = notify_task_status_change.project_id 
            AND ptm.left_at IS NULL
            AND u.domain_id = (SELECT id FROM domains WHERE name = 'Testing')
            AND u.is_active = true;
    END IF;
    
    -- Notify when QA completes review
    IF OLD.status = 'qa_review' AND NEW.status = 'done' THEN
        -- Notify assignee (developer)
        IF NEW.assignee_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, priority, title, message, related_entity_type, related_entity_id)
            VALUES (
                NEW.assignee_id,
                'task', 
                'normal',
                'Task Approved by QA',
                'Your task "' || NEW.title || '" has been approved by QA and marked as complete',
                'task',
                NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Recreate the trigger
CREATE TRIGGER task_status_notification_trigger
    AFTER UPDATE ON tasks
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_task_status_change();

-- ================================================================================
-- VERIFICATION
-- ================================================================================

-- Verify the column type was changed
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'tasks' AND column_name = 'status';

-- Expected result: data_type = 'character varying', character_maximum_length = 50

-- Verify the trigger was recreated
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgname = 'task_status_notification_trigger';

-- Verify existing data is intact
SELECT status, COUNT(*) 
FROM tasks 
GROUP BY status;

-- ================================================================================
-- NOTES
-- ================================================================================
-- 1. All existing task status values are preserved
-- 2. The trigger functionality is maintained
-- 3. JPA can now use VARCHAR type with TaskStatusConverter
-- 4. No data loss occurs during migration
-- ================================================================================

