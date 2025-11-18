import React, { useEffect } from 'react';
import { useRecentActivityByEntity } from '../hooks/api/useActivityLogs';
import TaskActivityLog from './TaskActivityLog';

interface TaskActivityLogWrapperProps {
  taskId: string;
  resolveUserName?: (userId: string) => string | undefined;
}

const TaskActivityLogWrapper: React.FC<TaskActivityLogWrapperProps> = ({ taskId, resolveUserName }) => {
  const { activityLogs, loading, error } = useRecentActivityByEntity('task', taskId, 30);

  useEffect(() => {
    console.log('=== TaskActivityLogWrapper Debug ===');
    console.log('TaskActivityLogWrapper - taskId:', taskId);
    console.log('TaskActivityLogWrapper - taskId type:', typeof taskId);
    console.log('TaskActivityLogWrapper - taskId length:', taskId?.length);
    console.log('TaskActivityLogWrapper - activityLogs:', activityLogs);
    console.log('TaskActivityLogWrapper - activityLogs.length:', activityLogs?.length);
    console.log('TaskActivityLogWrapper - loading:', loading);
    console.log('TaskActivityLogWrapper - error:', error);
    
    // Log each activity log's entity details
    if (Array.isArray(activityLogs) && activityLogs.length > 0) {
      console.log('Activity logs entity details:');
      activityLogs.forEach((log, index) => {
        console.log(`  Log ${index + 1}: entityType="${log.entityType}", entityId="${log.entityId}", action="${log.action}"`);
      });
    }
    console.log('===================================');
  }, [taskId, activityLogs, loading, error]);

  if (!taskId) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>No task selected</p>
      </div>
    );
  }

  // Ensure activityLogs is always an array and filter to only include logs for this exact task ID
  // Exclude any subtask-related logs (entityType='subtask' or entityId matching subtask pattern)
  const safeActivityLogs = Array.isArray(activityLogs) 
    ? activityLogs.filter(log => {
        // Only include logs where:
        // 1. entityType is exactly 'task' (not 'subtask' or any other type)
        // 2. entityId exactly matches the taskId (not a subtask ID)
        return log.entityType === 'task' && log.entityId === taskId;
      })
    : [];
  
  console.log('TaskActivityLogWrapper rendering - safeActivityLogs.length:', safeActivityLogs.length);
  console.log('TaskActivityLogWrapper - Filtered to task logs only, taskId:', taskId);

  return (
    <TaskActivityLog 
      activityLogs={safeActivityLogs} 
      loading={loading} 
      error={error}
      resolveUserName={resolveUserName}
    />
  );
};

export default TaskActivityLogWrapper;

