import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TaskActivityLogWrapper from "./TaskActivityLogWrapper";

interface StoryLite {
  id: string;
  title?: string;
}

interface TaskLite {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  storyId?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  labels?: string[];
}

interface TaskDetailsFullDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskLite | null;
  stories?: StoryLite[];
  resolveUserName?: (userId: string) => string | undefined;
  formatDate?: (dateString: string) => string;
}

const getStatusBadge = (status?: string) => {
  const s = (status || "").toUpperCase().replace(/-/g, "_");
  switch (s) {
    case "TO_DO":
    case "TODO":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "IN_PROGRESS":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "REVIEW":
    case "QA_REVIEW":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "DONE":
      return "bg-green-100 text-green-800 border-green-200";
    case "BLOCKED":
      return "bg-red-100 text-red-800 border-red-200";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityBadge = (priority?: string) => {
  const p = (priority || "").toUpperCase();
  switch (p) {
    case "CRITICAL":
      return "bg-red-100 text-red-800 border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "LOW":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const TaskDetailsFullDialog: React.FC<TaskDetailsFullDialogProps> = ({
  open,
  onOpenChange,
  task,
  stories = [],
  resolveUserName,
  formatDate,
}) => {
  const fmtDate = (date: string) =>
    formatDate
      ? formatDate(date)
      : new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });

  const storyTitle =
    (task?.storyId && stories.find((s) => s.id === task.storyId)?.title) ||
    "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Task Details{task?.title ? `: ${task.title}` : ""}</DialogTitle>
          <DialogDescription>
            View detailed information about the task
          </DialogDescription>
        </DialogHeader>

        {task && (
          <Tabs defaultValue="details">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{task.title || "Task"}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={getPriorityBadge(task.priority)}>
                      {(task.priority || "MEDIUM").toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getStatusBadge(task.status)}>
                      {(task.status || "TO_DO").replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary">
                      {(task.estimatedHours ?? 0)}h estimated
                    </Badge>
                    {typeof task.actualHours === "number" && (
                      <Badge variant="secondary">
                        {(task.actualHours ?? 0)}h actual
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {task.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Story</Label>
                  <div className="font-medium bg-gray-50 p-2 rounded">
                    {storyTitle}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Assignee</Label>
                  <div className="font-medium bg-gray-50 p-2 rounded">
                    {task.assigneeId
                      ? resolveUserName?.(task.assigneeId) || task.assigneeId
                      : "Unassigned"}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Reporter</Label>
                  <div className="font-medium bg-gray-50 p-2 rounded">
                    {task.reporterId
                      ? resolveUserName?.(task.reporterId) || task.reporterId
                      : "No Reporter"}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <div className="font-medium bg-gray-50 p-2 rounded">
                    {task.dueDate ? fmtDate(task.dueDate) : "—"}
                  </div>
                </div>
              </div>

              {task.labels && task.labels.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {task.labels.map((label, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs bg-purple-50 text-purple-700"
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activities" className="flex-1 overflow-auto p-6">
              {task?.id ? (
                <>
                  {console.log('=== TaskDetailsFullDialog - Task ID Comparison ===')}
                  {console.log('Task object:', task)}
                  {console.log('Task ID:', task.id)}
                  {console.log('Task ID type:', typeof task.id)}
                  {console.log('Task ID length:', task.id?.length)}
                  {console.log('Task ID format check - starts with TASK?:', task.id?.startsWith('TASK'))}
                  {console.log('================================================')}
                  <TaskActivityLogWrapper 
                    taskId={task.id} 
                    resolveUserName={resolveUserName}
                  />
                </>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No task selected.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsFullDialog;

