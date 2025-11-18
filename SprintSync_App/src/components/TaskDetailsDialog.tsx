import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Label } from './ui/label';

interface TaskLite {
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
}

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskLite | null;
  resolveUserName?: (userId: string) => string | undefined;
  formatDate?: (dateString: string) => string;
}

const getStatusBadge = (status?: string) => {
  const s = (status || '').toUpperCase().replace(/-/g, '_');
  switch (s) {
    case 'TO_DO':
    case 'TODO':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'REVIEW':
    case 'QA_REVIEW':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DONE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'BLOCKED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityBadge = (priority?: string) => {
  const p = (priority || '').toUpperCase();
  switch (p) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const TaskDetailsDialog: React.FC<TaskDetailsDialogProps> = ({ open, onOpenChange, task, resolveUserName, formatDate }) => {
  const fmtDate = (date: string) =>
    formatDate ? formatDate(date) : new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task?.title || 'Task'}</DialogTitle>
          <DialogDescription>
            {task?.description || 'No description provided.'}
          </DialogDescription>
        </DialogHeader>
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div>
                <Badge variant="outline" className={getStatusBadge(task.status)}>
                  {(task.status || 'TO_DO').replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <div>
                <Badge variant="outline" className={getPriorityBadge(task.priority)}>
                  {(task.priority || 'MEDIUM').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              <div className="font-medium">
                {task.assigneeId ? (resolveUserName?.(task.assigneeId) || task.assigneeId) : 'Unassigned'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Due Date</Label>
              <div className="font-medium">
                {task.dueDate ? fmtDate(task.dueDate) : '—'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Estimated Hours</Label>
              <div className="font-medium">{task.estimatedHours ?? 0}h</div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Actual Hours</Label>
              <div className="font-medium">{task.actualHours ?? 0}h</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsDialog;



