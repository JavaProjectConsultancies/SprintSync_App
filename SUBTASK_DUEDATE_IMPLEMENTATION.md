# Subtask Due Date Implementation

## Overview
This document describes the implementation of the due date calendar field in the "Add Subtask" form on the Scrum Management page.

## Changes Made

### Frontend Changes

#### 1. State Management (`ScrumPage.tsx`)

**Added `dueDate` field to subtask state** (Line 244):
```typescript
const [newSubtask, setNewSubtask] = useState({
  title: '',
  description: '',
  taskId: '',
  assigneeId: '',
  estimatedHours: 0,
  category: '',
  dueDate: ''  // NEW: Added due date field
});
```

#### 2. Form Reset Handler

**Updated dialog close handler** (Line 1228):
```typescript
const handleSubtaskDialogClose = (open: boolean) => {
  setIsAddSubtaskDialogOpen(open);
  if (!open) {
    setNewSubtask({
      title: '',
      description: '',
      taskId: '',
      assigneeId: '',
      estimatedHours: 0,
      category: '',
      dueDate: ''  // NEW: Reset due date on close
    });
    setSelectedTaskForSubtask(null);
  }
};
```

#### 3. Date Formatting Logic

**Added date formatting in subtask creation** (Lines 1243-1254):
```typescript
// Format due date if provided
let formattedDueDate: string | undefined = undefined;
if (newSubtask.dueDate) {
  try {
    const date = new Date(newSubtask.dueDate);
    if (!isNaN(date.getTime())) {
      formattedDueDate = date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error formatting due date:', e);
  }
}

const subtaskData = {
  // ... other fields
  dueDate: formattedDueDate,  // NEW: Include formatted due date
  // ... rest of fields
};
```

#### 4. UI Form Field

**Added date input to Add Subtask Dialog** (Lines 3589-3597):
```typescript
<div>
  <Label htmlFor="subtask-due-date">Due Date</Label>
  <Input
    id="subtask-due-date"
    type="date"
    value={newSubtask.dueDate}
    onChange={(e) => setNewSubtask(prev => ({ ...prev, dueDate: e.target.value }))}
  />
</div>
```

### Backend Support

The backend already has full support for subtask due dates:

#### Entity Definition (`Subtask.java`)
- **Field**: `dueDate` with type `LocalDate`
- **Database Column**: `due_date` of type `DATE`
- **Nullable**: Yes (optional field)

#### API Endpoints (`SubtaskController.java`)
- **Create**: POST `/api/subtasks` - accepts `dueDate` in request body
- **Update**: PUT `/api/subtasks/{id}` - accepts `dueDate` in request body
- **Read**: All GET endpoints return `dueDate` in response

## Data Flow

1. **User selects date** → Browser date picker sets `value` in YYYY-MM-DD format
2. **Form state updates** → `newSubtask.dueDate` is set
3. **On submit** → Date is validated and converted to ISO format
4. **API call** → Formatted date sent to backend
5. **Database** → Stored in PostgreSQL as DATE type

## Format Handling

- **Input Format**: ISO date string (YYYY-MM-DD) from browser date picker
- **API Format**: ISO date string (YYYY-MM-DD)
- **Database Format**: LocalDate (DATE column in PostgreSQL)
- **Display Format**: Converted appropriately for UI display

## Validation

- Date picker provides built-in validation
- Invalid dates are caught in try-catch block
- Empty dates are allowed (optional field)
- Invalid dates are logged and ignored

## UI/UX Features

- **Native Date Picker**: Uses browser's native date picker for consistency
- **Positioning**: Placed after Category field, before dialog footer
- **Optional Field**: Users can leave it empty
- **Auto-clear**: Clears when dialog is closed or cancelled

## Testing Checklist

1. ✅ Open "Add Subtask" dialog
2. ✅ Select a due date from calendar
3. ✅ Verify date appears in input field
4. ✅ Submit subtask with due date
5. ✅ Verify subtask is created successfully
6. ✅ Check database for due date value
7. ✅ Verify subtask displays due date when viewed
8. ✅ Test with empty due date (optional)
9. ✅ Test date formatting edge cases

## Files Modified

1. `SprintSync_App/src/pages/ScrumPage.tsx`
   - Added `dueDate` to state management
   - Added date formatting logic
   - Added date input field to dialog
   - Updated form reset handlers

## Database Schema

The `subtasks` table already has the `due_date` column:
```sql
CREATE TABLE subtasks (
  -- other columns
  due_date DATE,
  -- other columns
);
```

No database migrations were needed as the column already exists.

## Summary

The implementation successfully adds a due date calendar field to the Add Subtask form. The feature:
- ✅ Works with existing backend API
- ✅ Stores dates in database
- ✅ Provides good user experience
- ✅ Handles edge cases gracefully
- ✅ No breaking changes to existing functionality

The due date is now fully integrated into the subtask creation workflow!

