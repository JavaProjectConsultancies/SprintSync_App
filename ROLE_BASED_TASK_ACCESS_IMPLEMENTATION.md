# Role-Based Task Access Implementation

## Overview
This document describes the implementation of role-based task access control in the SprintSync application. Users now have different levels of access to tasks based on their roles.

## Implementation Details

### Access Control Rules

#### Managers and Admins
- **Full Access**: Can view ALL tasks and subtasks across all projects
- **Can Create**: Can create sprints, stories, and tasks
- **Can Manage**: Can assign tasks to any user
- **Can View**: All tasks regardless of assignee

#### Developers, Designers, and Other Users
- **Limited Access**: Can only view tasks assigned to them
- **Cannot Create**: Cannot create sprints, stories, or tasks
- **Can Add Subtasks**: Can add subtasks to their own assigned tasks
- **Cannot View**: Tasks assigned to other users

### Technical Changes

#### 1. Task Filtering Logic (`ScrumPage.tsx`)

**Location**: `SprintSync_App/src/pages/ScrumPage.tsx`

The main filtering logic was added to the `fetchAllTasks` function:

```typescript
const fetchAllTasks = useCallback(async (stories: Story[]) => {
  // ... existing fetch logic ...
  
  const taskArrays = await Promise.all(taskPromises);
  let allTasksFlat = taskArrays.flat();
  
  // Role-based filtering: Non-managers/admins see only their assigned tasks
  if (!canManageSprintsAndStories && user) {
    allTasksFlat = allTasksFlat.filter(task => task.assigneeId === user.id);
    console.log(`Filtered tasks for user ${user.name}: showing ${allTasksFlat.length} assigned tasks`);
  }
  
  setAllTasks(allTasksFlat);
}, [selectedSprint, canManageSprintsAndStories, user]);
```

#### 2. Task Creation Permissions

**Location**: `SprintSync_App/src/pages/ScrumPage.tsx` (Line 164)

Changed the `canAddTasks` permission:

```typescript
// Before
const canAddTasks = true;

// After  
const canAddTasks = canManageSprintsAndStories; // Only managers/admins can add tasks
```

#### 3. Centralized Task Refetching

**Location**: Multiple locations in `ScrumPage.tsx`

Replaced direct `setAllTasks` calls with `fetchAllTasks` to ensure filtering is always applied:

- In `handleAddSubtask` (Line 1298)
- In `handleLogEffort` (Line 1691)  
- In subtask completion toggle (Line 3887)

### Key Components

#### Permission Checks

```typescript
const canManageSprintsAndStories = user?.role?.toUpperCase() === 'ADMIN' || 
                                   user?.role?.toUpperCase() === 'MANAGER';
```

This boolean determines if a user has manager-level permissions.

#### User Identification

The filtering uses the `user.id` from the authentication context to match against task `assigneeId`.

### Behavior by Role

#### Manager Login
1. Manager logs in with manager credentials
2. `canManageSprintsAndStories = true`
3. All tasks are displayed without filtering
4. Manager can create new sprints, stories, and tasks
5. Manager can assign tasks to any user

#### Developer Login  
1. Developer logs in with developer credentials
2. `canManageSprintsAndStories = false`
3. Tasks are filtered to show only `task.assigneeId === user.id`
4. Developer cannot create sprints, stories, or tasks
5. Developer can add subtasks to their assigned tasks
6. Developer only sees tasks assigned to them

### UI Changes

#### "Add Task" Button
- **Managers/Admins**: Button is visible and functional
- **Other Users**: Button is hidden via `canAddTasks` check

#### Scrum Board Display
- **Managers/Admins**: Shows all tasks in the sprint
- **Other Users**: Shows only their assigned tasks, grouped by status

### Testing Checklist

To verify the implementation:

1. **Manager Test**
   - Login as a manager
   - Navigate to Scrum Management page
   - Verify all tasks are visible
   - Verify "Add Task" button is visible
   - Create a new task and assign it to a developer
   - Logout

2. **Developer Test**
   - Login as a developer
   - Navigate to Scrum Management page  
   - Verify only tasks assigned to this developer are visible
   - Verify "Add Task" button is hidden
   - Verify subtask creation works on assigned tasks
   - Verify tasks assigned to other users are not visible
   - Logout

3. **Edge Cases**
   - Developer with no assigned tasks: should see empty board
   - Manager viewing tasks across multiple sprints
   - Task assignment changes: verify real-time filtering

### Files Modified

1. `SprintSync_App/src/pages/ScrumPage.tsx`
   - Added role-based filtering in `fetchAllTasks`
   - Changed `canAddTasks` permission logic
   - Updated task refetch calls to use centralized function

### Dependencies

- `AuthContext`: Provides current user information
- `useAuth`: Hook to access authenticated user
- User roles: ADMIN, MANAGER, DEVELOPER, DESIGNER

### Future Enhancements

Potential improvements:
1. Backend filtering for better performance with large datasets
2. Project-level task visibility permissions
3. Team-level visibility (see tasks for your team)
4. Custom permission roles
5. Audit logging for task access

### Notes

- The filtering is performed client-side after fetching all tasks
- For large datasets, consider implementing backend filtering
- The console logs can help debug task visibility issues
- All task operations (create, update, delete) respect these permissions

## Summary

This implementation successfully restricts task visibility based on user roles while maintaining a seamless experience for managers and developers. The code is modular, maintainable, and follows React best practices.

