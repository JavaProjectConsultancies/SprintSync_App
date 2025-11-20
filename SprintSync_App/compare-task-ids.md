# Task ID Comparison - Scrum Board vs Backlog

## Purpose
Compare the task IDs used in Scrum Board and Backlog page to verify they are the same format.

## How to Check

1. **Open Browser Console** (F12)

2. **In Scrum Board:**
   - Click on any task to open the task details dialog
   - Check console logs for:
     - `TaskDetailsFullDialog - Task ID Comparison`
     - Task ID value and format

3. **In Backlog Page:**
   - Click "View Tasks" on any task
   - Check console logs for:
     - `BacklogPage - Opening Task Dialog`
     - `TaskDetailsFullDialog - Task ID Comparison`
     - Task ID value and format

4. **Compare:**
   - Are the task IDs the same format? (e.g., both start with "TASK")
   - Are they the same length?
   - Do they match exactly?

## Expected Output

Both pages should show task IDs in the format:
- `TASK` followed by 32 hexadecimal characters
- Example: `TASK30cfcb33fef64bada9e667ed17d6bc40`

## If IDs Are Different

If the IDs are different formats:
1. Check how tasks are fetched in each page
2. Check if there's any ID transformation happening
3. Verify the API returns the same ID format for both pages

## If IDs Are Same But Still No Logs

If IDs match but activity logs still don't show:
1. Verify the task IDs exist in the `activity_logs` table
2. Check if `entity_type` is 'task' (not 'subtask' or other)
3. Verify the backend is creating activity logs (see ACTIVITY_LOG_FIX_SUMMARY.md)

