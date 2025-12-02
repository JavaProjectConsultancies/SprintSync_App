import React, { useEffect } from 'react';
import { useActivityLogsByEntity } from '../hooks/api/useActivityLogs';
import TaskActivityLog from './TaskActivityLog';

interface TaskActivityLogWrapperProps {
  taskId: string;
  resolveUserName?: (userId: string) => string | undefined;
}

const TaskActivityLogWrapper: React.FC<TaskActivityLogWrapperProps> = ({ taskId, resolveUserName }) => {
  const { activityLogs, loading, error } = useActivityLogsByEntity('task', taskId);

  useEffect(() => {
    console.log('TaskActivityLogWrapper - taskId:', taskId, 'activityLogs:', activityLogs?.length, 'loading:', loading, 'error:', error);
  }, [taskId, activityLogs, loading, error]);

  if (!taskId) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>No task selected</p>
      </div>
    );
  }

  return (
    <TaskActivityLog 
      activityLogs={activityLogs} 
      loading={loading} 
      error={error}
      resolveUserName={resolveUserName}
    />
  );
};

export default TaskActivityLogWrapper;

