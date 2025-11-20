import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import TaskActivityLogWrapper from "./TaskActivityLogWrapper";
import {
  Clock,
  User,
  Calendar,
  Flag,
  CheckCircle2,
  Paperclip,
  Download,
  Loader2,
  Plus,
  Edit3,
  CheckSquare,
  ChevronDown,
  BookOpen,
  AlertCircle,
  Target,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { timeEntryApiService } from "../services/api/entities/timeEntryApi";
import { attachmentApiService } from "../services/api/entities/attachmentApi";
import { subtaskApiService } from "../services/api/entities/subtaskApi";
import { TimeEntry, Subtask } from "../types/api";
import { toast } from "sonner";

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
  acceptanceCriteria?: string[];
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
  const [taskDetailsTab, setTaskDetailsTab] = useState<
    "details" | "activities" | "subtasks" | "due-dates" | "linked-issues"
  >("details");
  const [taskLogs, setTaskLogs] = useState<TimeEntry[]>([]);
  const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);
  const [parentStoryAttachments, setParentStoryAttachments] = useState<any[]>([]);
  const [loadingParentStoryAttachments, setLoadingParentStoryAttachments] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);

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

  const getUserName = (userId: string) => {
    return resolveUserName?.(userId) || userId;
  };


  // Fetch task logs when dialog opens
  useEffect(() => {
    const fetchTaskLogs = async () => {
      if (task?.id && open) {
        setLoadingTaskLogs(true);
        try {
          const response = await timeEntryApiService.getTimeEntriesByTask(task.id);
          const logs = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];
          setTaskLogs(logs);
        } catch (error) {
          console.error("Error fetching task logs:", error);
          setTaskLogs([]);
        } finally {
          setLoadingTaskLogs(false);
        }
      } else {
        setTaskLogs([]);
      }
    };
    fetchTaskLogs();
  }, [task?.id, open]);

  // Fetch parent story attachments
  useEffect(() => {
    const fetchParentStoryAttachments = async () => {
      if (task?.storyId && open) {
        setLoadingParentStoryAttachments(true);
        try {
          const response = await attachmentApiService.getAttachmentsByEntity(
            "story",
            task.storyId
          );
          setParentStoryAttachments(response.data || []);
        } catch (error) {
          console.error("Error fetching parent story attachments:", error);
          setParentStoryAttachments([]);
        } finally {
          setLoadingParentStoryAttachments(false);
        }
      } else {
        setParentStoryAttachments([]);
      }
    };
    fetchParentStoryAttachments();
  }, [task?.storyId, open]);

  // Fetch subtasks
  useEffect(() => {
    const fetchSubtasks = async () => {
      if (task?.id && open) {
        setLoadingSubtasks(true);
        try {
          const response = await subtaskApiService.getSubtasksByTask(task.id);
          const subs = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [];
          setSubtasks(subs);
        } catch (error) {
          console.error("Error fetching subtasks:", error);
          setSubtasks([]);
        } finally {
          setLoadingSubtasks(false);
        }
      } else {
        setSubtasks([]);
      }
    };
    fetchSubtasks();
  }, [task?.id, open]);

  const handleToggleSubtask = async (subtaskId: string, currentStatus: boolean) => {
    try {
      await subtaskApiService.updateSubtaskCompletion(subtaskId, !currentStatus);
      toast.success(`Subtask ${!currentStatus ? "completed" : "reopened"}`);
      setSubtasks((prev) =>
        prev.map((st) =>
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        )
      );
    } catch (error) {
      console.error("Failed to update subtask:", error);
      toast.error("Failed to update subtask");
    }
  };

  const completedSubtasks = subtasks.filter((st) => st.isCompleted).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogTitle className="sr-only">
          Task Details: {task?.title || "Task"}
        </DialogTitle>

        {task && (
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 font-semibold"
                    >
                      TSK-{task.id.slice(-4).toUpperCase()}
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 px-3">
                      {task.status?.replace("_", " ") || "TO_DO"}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Task Title */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {task.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Flag className="w-4 h-4" />
                    <span>{task.priority || "MEDIUM"}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{task.estimatedHours || 0}h estimated</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>
                      {task.assigneeId ? getUserName(task.assigneeId) : "Unassigned"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                <Tabs
                  value={taskDetailsTab}
                  onValueChange={(value) => setTaskDetailsTab(value as any)}
                  className="h-full flex flex-col min-h-0"
                >
                  <TabsList className="mx-6 mt-4 flex-shrink-0">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                    <TabsTrigger value="due-dates">Due Dates</TabsTrigger>
                    <TabsTrigger value="linked-issues">Linked Issues</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="details"
                    className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
                    style={{ maxHeight: "calc(90vh - 200px)" }}
                  >
                    {/* Time Logs Section */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Time Logs
                      </h3>
                      {loadingTaskLogs ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-gray-600">
                            Loading logs...
                          </span>
                        </div>
                      ) : taskLogs.length > 0 ? (
                        <div className="space-y-2">
                          {taskLogs.map((log) => (
                            <div
                              key={log.id}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                      {log.hoursWorked}h logged
                                    </span>
                                    {log.workDate && (
                                      <span className="text-xs text-gray-500">
                                        on{" "}
                                        {new Date(log.workDate).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  {log.description && (
                                    <p className="text-sm text-gray-700 mt-1">
                                      {log.description}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    {log.userId && (
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span>{getUserName(log.userId)}</span>
                                      </div>
                                    )}
                                    {log.startTime && log.endTime && (
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                          {log.startTime} - {log.endTime}
                                        </span>
                                      </div>
                                    )}
                                    {log.entryType && (
                                      <Badge variant="outline" className="text-xs">
                                        {log.entryType}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No time logs recorded yet</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Log time spent on this task to track your work
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Description
                      </h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        {task.description ? (
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {task.description}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            Add a description...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Acceptance Criteria */}
                    {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Acceptance Criteria
                        </h3>
                        <div className="space-y-2">
                          {task.acceptanceCriteria.map((criteria, index) => (
                            <div key={index} className="flex items-start space-x-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{criteria}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Labels */}
                    {task.labels && task.labels.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Labels
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {task.labels.map((label, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments from Parent Story */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Attachments
                        </h3>
                        {parentStoryAttachments.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            From Story
                          </Badge>
                        )}
                      </div>
                      {loadingParentStoryAttachments ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-gray-600">
                            Loading attachments...
                          </span>
                        </div>
                      ) : parentStoryAttachments.length > 0 ? (
                        <div className="space-y-2">
                          {parentStoryAttachments.map((attachment) => (
                            <div
                              key={attachment.id}
                              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-blue-50/30"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                  <Paperclip className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {attachment.fileName}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0"
                                    >
                                      Inherited
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    {attachment.fileSize && (
                                      <>
                                        <span>
                                          {(attachment.fileSize / 1024).toFixed(2)} KB
                                        </span>
                                        <span>•</span>
                                      </>
                                    )}
                                    {attachment.uploadedBy && (
                                      <>
                                        <span>by {getUserName(attachment.uploadedBy)}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>
                                      {new Date(attachment.createdAt).toLocaleDateString(
                                        "en-GB",
                                        {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 px-3 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (attachment.fileUrl) {
                                      const link = document.createElement("a");
                                      link.href = attachment.fileUrl;
                                      link.download = attachment.fileName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      toast.success("File downloaded");
                                    } else {
                                      toast.error("File URL not available");
                                    }
                                  }}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                          <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No attachments from parent story</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Attachments added to the story will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="activities"
                    className="flex-1 overflow-auto p-6"
                  >
                    {task?.id ? (
                      <TaskActivityLogWrapper 
                        taskId={task.id} 
                        resolveUserName={resolveUserName}
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No task selected.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="subtasks"
                    className="flex-1 overflow-hidden flex flex-col"
                  >
                    <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Subtasks
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={subtaskProgress} className="w-20 h-2" />
                        <span className="text-xs text-gray-600">
                          {completedSubtasks}/{totalSubtasks} Done
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex-1 overflow-y-auto p-6 pt-4 space-y-2"
                      style={{ maxHeight: "400px" }}
                    >
                      {loadingSubtasks ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          <span className="ml-2 text-sm text-gray-600">
                            Loading subtasks...
                          </span>
                        </div>
                      ) : subtasks.length > 0 ? (
                        subtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <CheckSquare
                                  className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform flex-shrink-0 ${
                                    subtask.isCompleted
                                      ? "text-green-500"
                                      : "text-gray-400 hover:text-green-400"
                                  }`}
                                  onClick={() =>
                                    handleToggleSubtask(subtask.id, subtask.isCompleted)
                                  }
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4
                                      className={`text-sm font-medium truncate ${
                                        subtask.isCompleted
                                          ? "line-through text-gray-400"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {subtask.title}
                                    </h4>
                                    {subtask.category && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                      >
                                        {subtask.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <User className="w-3 h-3" />
                                      <span className="truncate max-w-20">
                                        {subtask.assigneeId
                                          ? getUserName(subtask.assigneeId).split(" ")[0]
                                          : "Unassigned"}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span className="font-medium">
                                        {subtask.estimatedHours || 0}h
                                        {(subtask.actualHours || 0) > 0 && (
                                          <span className="text-blue-600 ml-1">
                                            /{(subtask.actualHours || 0).toFixed(1)}h
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    {subtask.dueDate && (
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                          {new Date(subtask.dueDate).toLocaleDateString(
                                            "en-GB"
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                          <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No subtasks yet</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Add subtasks to break down this task into smaller pieces
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="due-dates"
                    className="flex-1 overflow-auto p-6"
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Task Due Date
                        </h3>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          {task.dueDate ? (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">
                                {fmtDate(task.dueDate)}
                              </span>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No due date set
                            </p>
                          )}
                        </div>
                      </div>
                      {subtasks.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            Subtask Due Dates
                          </h3>
                          <div className="space-y-2">
                            {subtasks
                              .filter((st) => st.dueDate)
                              .map((subtask) => (
                                <div
                                  key={subtask.id}
                                  className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                      {subtask.title}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm text-gray-700">
                                        {new Date(subtask.dueDate!).toLocaleDateString(
                                          "en-GB"
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            {subtasks.filter((st) => st.dueDate).length === 0 && (
                              <p className="text-sm text-gray-400 italic text-center py-4">
                                No subtasks with due dates
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="linked-issues"
                    className="flex-1 overflow-auto p-6"
                  >
                    <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No linked issues</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Link related issues to track dependencies
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Sidebar (Right Panel) */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
              <div className="p-6 space-y-6">
                {/* Task Details Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Task Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Estimation */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Estimation
                        </span>
                        <span className="text-xs font-semibold text-blue-600">
                          {task.estimatedHours || 0}h
                        </span>
                      </div>
                      <Progress value={100} className="h-2 bg-blue-100" />
                    </div>

                    {/* Time Spent */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Time Spent
                        </span>
                        <span className="text-xs font-semibold text-green-600">
                          {task.actualHours || 0}h
                        </span>
                      </div>
                      <Progress
                        value={
                          task.estimatedHours && task.estimatedHours > 0
                            ? Math.min(
                                100,
                                ((task.actualHours || 0) / task.estimatedHours) * 100
                              )
                            : 0
                        }
                        className="h-2 bg-green-100"
                      />
                    </div>

                    {/* Remaining */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Remaining
                        </span>
                        <span className="text-xs font-semibold text-gray-600">
                          {Math.max(
                            0,
                            (task.estimatedHours || 0) - (task.actualHours || 0)
                          )}h
                        </span>
                      </div>
                      <Progress
                        value={
                          task.estimatedHours && task.estimatedHours > 0
                            ? Math.min(
                                100,
                                (Math.max(
                                  0,
                                  (task.estimatedHours || 0) -
                                    (task.actualHours || 0)
                                ) /
                                  task.estimatedHours) *
                                  100
                              )
                            : 0
                        }
                        className="h-2 bg-gray-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Details
                    </h3>
                    <Settings className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="space-y-4">
                    {/* Assignee */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Assignee
                      </label>
                      <div className="flex items-center space-x-2">
                        {task.assigneeId ? (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                              {getUserName(task.assigneeId)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-700">
                          {task.assigneeId
                            ? getUserName(task.assigneeId)
                            : "Unassigned"}
                        </span>
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Priority
                      </label>
                      <Badge
                        variant="outline"
                        className={getPriorityBadge(task.priority)}
                      >
                        {task.priority || "MEDIUM"}
                      </Badge>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Due Date
                      </label>
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </span>
                      </div>
                    </div>

                    {/* Labels */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Labels
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {task.labels && task.labels.length > 0 ? (
                          task.labels.map((label, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {label}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">
                            Add labels
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Parent Story */}
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">
                        Parent
                      </label>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                          {storyTitle}
                        </span>
                      </div>
                    </div>

                    {/* Sprint - Note: Sprint info would need to be passed as prop or fetched */}
                    {task.storyId && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Sprint
                        </label>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                            {storyTitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsFullDialog;
