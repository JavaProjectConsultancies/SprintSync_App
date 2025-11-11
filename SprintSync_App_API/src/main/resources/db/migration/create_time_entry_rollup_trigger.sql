-- Migration: Create trigger function to automatically update actual_hours in tasks and stories
-- This ensures that actual_hours are automatically calculated when time entries are inserted, updated, or deleted

-- Drop the function if it exists (to allow re-running the migration)
DROP FUNCTION IF EXISTS update_actual_hours() CASCADE;

-- Create the trigger function
CREATE OR REPLACE FUNCTION update_actual_hours()
RETURNS TRIGGER AS $$
DECLARE
    old_task_id VARCHAR(255);
    old_story_id VARCHAR(255);
    new_task_id VARCHAR(255);
    new_story_id VARCHAR(255);
BEGIN
    -- Handle DELETE operation
    IF TG_OP = 'DELETE' THEN
        old_task_id := OLD.task_id;
        old_story_id := OLD.story_id;
        
        -- Update task actual_hours
        IF old_task_id IS NOT NULL THEN
            UPDATE tasks 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE task_id = old_task_id
            ), 0)
            WHERE id = old_task_id;
        END IF;
        
        -- Update story actual_hours
        IF old_story_id IS NOT NULL THEN
            UPDATE stories 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE story_id = old_story_id
            ), 0)
            WHERE id = old_story_id;
        END IF;
        
        RETURN OLD;
    
    -- Handle UPDATE operation
    ELSIF TG_OP = 'UPDATE' THEN
        old_task_id := OLD.task_id;
        old_story_id := OLD.story_id;
        new_task_id := NEW.task_id;
        new_story_id := NEW.story_id;
        
        -- Handle task_id changes
        IF old_task_id IS DISTINCT FROM new_task_id THEN
            -- Update old task (remove hours from old task)
            IF old_task_id IS NOT NULL THEN
                UPDATE tasks 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE task_id = old_task_id
                ), 0)
                WHERE id = old_task_id;
            END IF;
            
            -- Update new task (add hours to new task)
            IF new_task_id IS NOT NULL THEN
                UPDATE tasks 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE task_id = new_task_id
                ), 0)
                WHERE id = new_task_id;
            END IF;
        ELSE
            -- Task ID didn't change, just recalculate (hours_worked might have changed)
            IF new_task_id IS NOT NULL THEN
                UPDATE tasks 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE task_id = new_task_id
                ), 0)
                WHERE id = new_task_id;
            END IF;
        END IF;
        
        -- Handle story_id changes
        IF old_story_id IS DISTINCT FROM new_story_id THEN
            -- Update old story (remove hours from old story)
            IF old_story_id IS NOT NULL THEN
                UPDATE stories 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE story_id = old_story_id
                ), 0)
                WHERE id = old_story_id;
            END IF;
            
            -- Update new story (add hours to new story)
            IF new_story_id IS NOT NULL THEN
                UPDATE stories 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE story_id = new_story_id
                ), 0)
                WHERE id = new_story_id;
            END IF;
        ELSE
            -- Story ID didn't change, just recalculate (hours_worked might have changed)
            IF new_story_id IS NOT NULL THEN
                UPDATE stories 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE story_id = new_story_id
                ), 0)
                WHERE id = new_story_id;
            END IF;
        END IF;
        
        RETURN NEW;
    
    -- Handle INSERT operation
    ELSE
        new_task_id := NEW.task_id;
        new_story_id := NEW.story_id;
        
        -- Update task actual_hours
        IF new_task_id IS NOT NULL THEN
            UPDATE tasks 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE task_id = new_task_id
            ), 0)
            WHERE id = new_task_id;
        END IF;
        
        -- Update story actual_hours
        IF new_story_id IS NOT NULL THEN
            UPDATE stories 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE story_id = new_story_id
            ), 0)
            WHERE id = new_story_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS time_entry_rollup_trigger ON time_entries;

-- Create the trigger that fires on INSERT, UPDATE, or DELETE
CREATE TRIGGER time_entry_rollup_trigger
    AFTER INSERT OR UPDATE OR DELETE ON time_entries
    FOR EACH ROW 
    EXECUTE FUNCTION update_actual_hours();

-- Create indexes for better trigger performance
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_entries_story_id ON time_entries(story_id) WHERE story_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON FUNCTION update_actual_hours() IS 'Automatically updates actual_hours in tasks and stories tables when time entries are inserted, updated, or deleted';
COMMENT ON TRIGGER time_entry_rollup_trigger ON time_entries IS 'Trigger that calls update_actual_hours() function to maintain actual_hours consistency';

