import React from 'react';
import { ActivityLog } from '../types/api';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface TaskActivityLogProps {
  activityLogs: ActivityLog[];
  loading?: boolean;
  error?: any;
  resolveUserName?: (userId: string) => string | undefined;
}

const TaskActivityLog: React.FC<TaskActivityLogProps> = ({ 
  activityLogs, 
  loading = false, 
  error = null,
  resolveUserName
}) => {
  const formatActivityTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatActivityDetails = (activityLog: ActivityLog) => {
    // Parse the newValues JSON if it exists
    let parsedNewValues = null;
    let parsedOldValues = null;
    try {
      if (activityLog.newValues) {
        parsedNewValues = JSON.parse(activityLog.newValues);
      }
      if (activityLog.oldValues) {
        parsedOldValues = JSON.parse(activityLog.oldValues);
      }
    } catch (e) {
      // If parsing fails, use the raw string
    }

    // Format different types of activities
    switch (activityLog.action) {
      case 'effort_logged':
        if (parsedNewValues && parsedNewValues.subtaskId && parsedNewValues.hours) {
          return `Logged ${parsedNewValues.hours}h on subtask "${parsedNewValues.subtaskId}"`;
        }
        return activityLog.description || 'Logged effort';
      
      case 'status_changed':
        if (parsedOldValues && parsedNewValues && parsedOldValues.status && parsedNewValues.status) {
          return `Changed status from ${parsedOldValues.status.toLowerCase()} to ${parsedNewValues.status}`;
        } else if (parsedNewValues && parsedNewValues.status) {
          return `Changed status to ${parsedNewValues.status}`;
        }
        return activityLog.description || 'Changed status';
      
      case 'created':
        return activityLog.description || 'Created task';
      
      case 'subtask_created':
        if (parsedNewValues && parsedNewValues.title) {
          return `Created subtask "${parsedNewValues.title}"`;
        }
        return activityLog.description || 'Created subtask';
      
      default:
        return activityLog.description || activityLog.action;
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'effort_logged':
        return '⏱️';
      case 'status_changed':
        return '🔄';
      case 'created':
        return '➕';
      case 'subtask_created':
        return '📝';
      default:
        return '📋';
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'effort_logged':
        return 'bg-blue-100 text-blue-800';
      case 'status_changed':
        return 'bg-green-100 text-green-800';
      case 'created':
        return 'bg-purple-100 text-purple-800';
      case 'subtask_created':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <p>Failed to load activity logs</p>
      </div>
    );
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <p>No activity logs yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-4">
        {activityLogs.map((activityLog) => (
          <div key={activityLog.id} className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-cyan-100">
                {activityLog.userId ? activityLog.userId.slice(-2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium">
                  {resolveUserName ? (resolveUserName(activityLog.userId) || activityLog.userId || 'Unknown User') : (activityLog.userId || 'Unknown User')}
                </span>
                <Badge variant="secondary" className={`text-xs ${getActivityColor(activityLog.action)}`}>
                  {getActivityIcon(activityLog.action)} {activityLog.action.replace('_', ' ')}
                </Badge>
              </div>
              <div className="text-sm text-gray-700">
                {formatActivityDetails(activityLog)}
              </div>
              {activityLog.newValues && (
                <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-1 rounded">
                  {activityLog.newValues}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                <span>{formatActivityTime(activityLog.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TaskActivityLog;

