# Time Entry Rollup Trigger Setup Guide

This guide explains how to set up the automatic time rollup trigger that updates `actual_hours` in `tasks` and `stories` tables whenever time entries are inserted, updated, or deleted.

## Overview

The trigger function `update_actual_hours()` automatically:
- Updates `actual_hours` in the `tasks` table when time entries are added, modified, or removed
- Updates `actual_hours` in the `stories` table when time entries are added, modified, or removed
- Handles all edge cases including task/story reassignments

## Files Created

1. **`SprintSync_App_API/src/main/resources/db/migration/create_time_entry_rollup_trigger.sql`**
   - Creates the trigger function and trigger
   - Handles INSERT, UPDATE, and DELETE operations

2. **`SprintSync_App_API/src/main/resources/db/migration/backfill_actual_hours.sql`**
   - Backfills `actual_hours` for existing tasks and stories
   - Initializes values based on existing `time_entries` data

3. **`SprintSync_App/create-time-entry-rollup-trigger.ps1`**
   - PowerShell script to apply the trigger migration

4. **`SprintSync_App/backfill-actual-hours.ps1`**
   - PowerShell script to backfill existing data

## Setup Instructions

### Option 1: Using PowerShell Scripts (Recommended)

1. **Create the trigger:**
   ```powershell
   .\create-time-entry-rollup-trigger.ps1
   ```

2. **Backfill existing data:**
   ```powershell
   .\backfill-actual-hours.ps1
   ```

### Option 2: Manual SQL Execution

1. **Connect to your PostgreSQL database** using any client (pgAdmin, DBeaver, psql, etc.)

2. **Run the trigger migration:**
   ```sql
   -- Execute the contents of:
   -- SprintSync_App_API/src/main/resources/db/migration/create_time_entry_rollup_trigger.sql
   ```

3. **Backfill existing data:**
   ```sql
   -- Execute the contents of:
   -- SprintSync_App_API/src/main/resources/db/migration/backfill_actual_hours.sql
   ```

## How It Works

### Trigger Function Logic

The trigger function `update_actual_hours()` handles three scenarios:

1. **INSERT**: When a new time entry is created
   - Updates the `actual_hours` for the associated task (if `task_id` is not null)
   - Updates the `actual_hours` for the associated story (if `story_id` is not null)

2. **UPDATE**: When a time entry is modified
   - If `task_id` or `story_id` changed: Updates both old and new tasks/stories
   - If only `hours_worked` changed: Recalculates the affected task/story

3. **DELETE**: When a time entry is removed
   - Updates the `actual_hours` for the previously associated task and story

### Calculation Formula

For each task/story:
```sql
actual_hours = SUM(hours_worked) FROM time_entries WHERE task_id/story_id = <id>
```

If no time entries exist, `actual_hours` is set to `0`.

## Verification

After setup, verify the trigger is working:

1. **Check trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'time_entry_rollup_trigger';
   ```

2. **Test INSERT:**
   ```sql
   -- Insert a test time entry
   INSERT INTO time_entries (id, user_id, task_id, story_id, hours_worked, work_date, description, entry_type)
   VALUES ('TEST-001', 'USER-001', 'TASK-001', 'STORY-001', 2.5, CURRENT_DATE, 'Test entry', 'development');
   
   -- Check if task actual_hours was updated
   SELECT id, estimated_hours, actual_hours FROM tasks WHERE id = 'TASK-001';
   ```

3. **Test UPDATE:**
   ```sql
   -- Update hours_worked
   UPDATE time_entries SET hours_worked = 3.0 WHERE id = 'TEST-001';
   
   -- Verify task actual_hours was recalculated
   SELECT id, estimated_hours, actual_hours FROM tasks WHERE id = 'TASK-001';
   ```

4. **Test DELETE:**
   ```sql
   -- Delete the test entry
   DELETE FROM time_entries WHERE id = 'TEST-001';
   
   -- Verify task actual_hours was updated (should be 0 or reduced)
   SELECT id, estimated_hours, actual_hours FROM tasks WHERE id = 'TASK-001';
   ```

## Troubleshooting

### Trigger Not Firing

1. Check if trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'time_entry_rollup_trigger';
   ```

2. Check trigger function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'update_actual_hours';
   ```

3. Verify trigger is attached to `time_entries` table:
   ```sql
   SELECT tgname, tgrelid::regclass, tgenabled 
   FROM pg_trigger 
   WHERE tgname = 'time_entry_rollup_trigger';
   ```

### Incorrect actual_hours Values

1. **Backfill the data again:**
   ```powershell
   .\backfill-actual-hours.ps1
   ```

2. **Manually recalculate a specific task:**
   ```sql
   UPDATE tasks 
   SET actual_hours = COALESCE((
       SELECT SUM(hours_worked) 
       FROM time_entries 
       WHERE task_id = 'TASK-001'
   ), 0)
   WHERE id = 'TASK-001';
   ```

### Performance Considerations

- The trigger recalculates `actual_hours` by summing all `time_entries` for each task/story
- For tables with many time entries, consider adding indexes:
  ```sql
  CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
  CREATE INDEX IF NOT EXISTS idx_time_entries_story_id ON time_entries(story_id);
  ```

## Benefits

✅ **Automatic Updates**: No manual intervention needed  
✅ **Data Consistency**: `actual_hours` always reflects current `time_entries`  
✅ **Accurate Remaining Time**: Frontend calculations for "Remaining Time" will be accurate  
✅ **Real-time Updates**: Changes are reflected immediately  

## Notes

- The trigger uses `COALESCE` to handle NULL values, defaulting to `0`
- The trigger handles NULL `task_id` and `story_id` gracefully
- The trigger is idempotent - you can run the migration multiple times safely

