# Activity Log Issue - Root Cause and Solution

## Problem
The activity logs section in the Backlog "View Tasks" dialog shows no data, even though the frontend is correctly making API calls.

## Root Cause
**The backend is NOT creating activity logs when tasks are created or updated.**

The `TaskService` class has methods like `createTask()`, `updateTask()`, `updateTaskStatus()`, and `assignTask()`, but none of them call `ActivityLogService.logActivity()` to create activity log entries.

## Evidence
1. Database query shows no activity logs exist for task IDs
2. Frontend API calls return empty arrays `[]`
3. `TaskService.java` does not inject or use `ActivityLogService`

## Immediate Solution (Test)
Run the SQL script `create-test-activity-logs-simple.sql` to manually create test activity logs for existing tasks. This will:
- Create activity logs for tasks that don't have any
- Use task assignee/reporter as the user_id
- Create logs with appropriate actions (created, status_changed, updated)
- Allow you to verify the frontend displays them correctly

## Long-term Solution (Backend Fix)
The `TaskService` needs to be updated to create activity logs:

1. **Inject ActivityLogService**:
```java
@Autowired
private ActivityLogService activityLogService;
```

2. **Add activity logging to createTask()**:
```java
// After saving task
activityLogService.logActivity(
    task.getReporterId() != null ? task.getReporterId() : task.getAssigneeId(),
    "task",
    savedTask.getId(),
    "created",
    "Task created: " + savedTask.getTitle(),
    null,
    Map.of("title", savedTask.getTitle(), "status", savedTask.getStatus())
);
```

3. **Add activity logging to updateTask()**:
```java
// Compare old and new values
Map<String, Object> oldValues = new HashMap<>();
Map<String, Object> newValues = new HashMap<>();
// ... populate maps with changed fields
activityLogService.logActivity(
    task.getAssigneeId() != null ? task.getAssigneeId() : task.getReporterId(),
    "task",
    task.getId(),
    "updated",
    "Task updated",
    oldValues,
    newValues
);
```

4. **Add activity logging to updateTaskStatus()**:
```java
TaskStatus oldStatus = existingTask.getStatus();
activityLogService.logActivity(
    existingTask.getAssigneeId() != null ? existingTask.getAssigneeId() : existingTask.getReporterId(),
    "task",
    id,
    "status_changed",
    "Status changed from " + oldStatus + " to " + status,
    Map.of("status", oldStatus),
    Map.of("status", status)
);
```

5. **Add activity logging to assignTask()**:
```java
String oldAssigneeId = existingTask.getAssigneeId();
activityLogService.logActivity(
    oldAssigneeId != null ? oldAssigneeId : "system",
    "task",
    id,
    assigneeId != null ? "assigned" : "unassigned",
    assigneeId != null ? "Task assigned to user" : "Task unassigned",
    Map.of("assigneeId", oldAssigneeId),
    Map.of("assigneeId", assigneeId)
);
```

## Testing
After implementing the backend fix:
1. Create a new task → Should create "created" activity log
2. Update task status → Should create "status_changed" activity log
3. Assign task to user → Should create "assigned" activity log
4. Update task fields → Should create "updated" activity log

## Files to Modify
- `SprintSync_App_API/src/main/java/com/sprintsync/api/service/TaskService.java`

## Note
The frontend code is working correctly. The issue is purely on the backend - activity logs are simply not being created when tasks are modified.

