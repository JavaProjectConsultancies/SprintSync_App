import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
    Clock,
    Flag,
    User,
    ChevronDown,
    Timer,
    Edit3,
    Paperclip,
    BookOpen,
    Target,
    Settings,
    Shield,
    Loader2,
    Calendar,
    MoreHorizontal,
    Plus
} from "lucide-react";
import {
    Task,
    Subtask,
    TimeEntry,
    Priority,
} from "../types/api";
import { taskApiService } from "../services/api/entities/taskApi";
import { timeEntryApiService } from "../services/api/entities/timeEntryApi";
import { attachmentApiService } from "../services/api/entities/attachmentApi";
import { subtaskApiService } from "../services/api/entities/subtaskApi";
import { useRecentActivityByEntity } from "../hooks/api/useActivityLogs";
import { toast } from "sonner";

import { useAuth } from "../contexts/AuthContextEnhanced";
import { userApiService } from "../services/api/entities/userApi";

interface TaskDetailsJiraDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    onTaskUpdated?: () => void;
    allSubtasks?: Subtask[]; // Optional, will fetch if not provided
    canManage?: boolean;
}

const TaskDetailsJiraDialog: React.FC<TaskDetailsJiraDialogProps> = ({
    open,
    onOpenChange,
    task,
    onTaskUpdated,
    allSubtasks: initialSubtasks = [],
    canManage = true,
}) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("details");
    const [taskLogs, setTaskLogs] = useState<TimeEntry[]>([]);
    const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);
    const [parentStoryAttachments, setParentStoryAttachments] = useState<any[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Effort logging state
    const [isLogEffortOpen, setIsLogEffortOpen] = useState(false);
    const [isLoggingEffort, setIsLoggingEffort] = useState(false);
    const [effortLog, setEffortLog] = useState({
        hours: 0,
        description: "",
        workDate: new Date().toISOString().split('T')[0],
        startTime: "",
        endTime: "",
    });
    const [effortLogAttachments, setEffortLogAttachments] = useState<File[]>([]);

    const [currentTask, setCurrentTask] = useState<Task | null>(task);

    useEffect(() => {
        setCurrentTask(task);
        if (task) {
            fetchTaskData(task.id, task.storyId);
            if (users.length === 0) {
                fetchUsers();
            }
        }
    }, [task]);

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await userApiService.getUsers();
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchTaskData = async (taskId: string, storyId?: string) => {
        setLoadingTaskLogs(true);
        setLoadingAttachments(true);
        setLoadingSubtasks(true);

        try {
            // Fetch Logs
            const logsRes = await timeEntryApiService.getTimeEntriesByTask(taskId);
            setTaskLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

            // Fetch Story Attachments
            if (storyId) {
                const attachRes = await attachmentApiService.getAttachmentsByEntity("story", storyId);
                setParentStoryAttachments(attachRes.data || []);
            }

            // Fetch Subtasks
            const subRes = await subtaskApiService.getSubtasksByTask(taskId);
            setSubtasks(subRes.data || []);

        } catch (error) {
            console.error("Error fetching task details data:", error);
        } finally {
            setLoadingTaskLogs(false);
            setLoadingAttachments(false);
            setLoadingSubtasks(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const uploadFileAndCreateAttachment = async (
        file: File,
        entityType: string,
        entityId: string,
    ): Promise<void> => {
        try {
            const fileDataUrl = await fileToBase64(file);
            const fileType = file.type || "application/octet-stream";
            await attachmentApiService.createAttachment({
                uploadedBy: user?.id,
                entityType,
                entityId,
                fileName: file.name,
                fileSize: file.size,
                fileType,
                fileUrl: fileDataUrl,
                attachmentType: 'file' as const,
                isPublic: true,
            });
        } catch (error) {
            console.error("Error creating attachment:", error);
            throw error;
        }
    };

    const getUserName = (userId: string) => {
        if (!userId) return "Unassigned";
        if (usersLoading) return "Loading...";
        const user = users.find(u => u.id === userId || u.userId === userId || u.employeeId === userId);
        return user ? (user.name || user.fullName || user.username) : userId;
    };

    const handleLogEffort = async () => {
        if (!currentTask || !effortLog.hours || effortLog.hours <= 0) {
            toast.error("Please enter valid hours");
            return;
        }
        if (!effortLog.description.trim()) {
            toast.error("Please enter a description");
            return;
        }

        try {
            setIsLoggingEffort(true);
            const timeEntryData = {
                userId: user?.id || "",
                taskId: currentTask.id,
                storyId: currentTask.storyId?.trim() || undefined,
                description: effortLog.description,
                entryType: "development" as const,
                hoursWorked: effortLog.hours,
                workDate: effortLog.workDate,
                startTime: effortLog.startTime && effortLog.startTime.trim() ? effortLog.startTime : undefined,
                endTime: effortLog.endTime && effortLog.endTime.trim() ? effortLog.endTime : undefined,
                isBillable: true,
            };

            await timeEntryApiService.createTimeEntry(timeEntryData);

            // Upload any attachments if present
            if (effortLogAttachments.length > 0) {
                try {
                    for (const file of effortLogAttachments) {
                        await uploadFileAndCreateAttachment(file, 'task', currentTask.id);
                    }
                } catch (attachError) {
                    console.error("Error uploading attachments:", attachError);
                    toast.error("Effort logged, but some attachments failed to upload");
                }
            }

            toast.success("Effort logged successfully");
            setIsLogEffortOpen(false);
            setEffortLog({
                hours: 0,
                description: "",
                workDate: new Date().toISOString().split('T')[0],
                startTime: "",
                endTime: "",
            });
            setEffortLogAttachments([]);

            // Refresh data
            fetchTaskData(currentTask.id, currentTask.storyId);
            if (onTaskUpdated) onTaskUpdated();
        } catch (error) {
            console.error("Error logging effort:", error);
            toast.error("Failed to log effort");
        } finally {
            setIsLoggingEffort(false);
        }
    };

    if (!currentTask) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                    <DialogTitle className="sr-only">
                        Task Details: {currentTask.title}
                    </DialogTitle>

                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {/* Left Panel */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                                            TSK-{currentTask.id.slice(-4).toUpperCase()}
                                        </Badge>
                                        <Button variant="outline" size="sm" className="h-7 px-3">
                                            {currentTask.status.replace("_", " ")}
                                            <ChevronDown className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 hover:bg-blue-100"
                                        onClick={() => setIsLogEffortOpen(true)}
                                    >
                                        <Clock className="w-4 h-4 mr-1 text-blue-600" />
                                        Log
                                    </Button>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {currentTask.title}
                                </h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Flag className="w-4 h-4" />
                                        <span>{currentTask.priority}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{currentTask.estimatedHours}h estimated</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <User className="w-4 h-4" />
                                        <span>{getUserName(currentTask.assigneeId || "")}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Section */}
                            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col min-h-0">
                                    <TabsList className="mx-6 mt-4 flex-shrink-0">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="activities">Activities</TabsTrigger>
                                        <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                                        <TabsTrigger value="due-dates">Due Dates</TabsTrigger>
                                        <TabsTrigger value="linked-issues">Linked Issues</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="details" className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 scrollbar-thin">
                                        {/* Time Logs */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Time Logs</h3>
                                            {loadingTaskLogs ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                </div>
                                            ) : taskLogs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {taskLogs.map((log) => (
                                                        <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors group">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <Clock className="w-4 h-4 text-blue-600" />
                                                                        <span className="text-sm font-medium text-gray-900">{log.hoursWorked}h logged</span>
                                                                        {log.workDate && (
                                                                            <span className="text-xs text-gray-500">
                                                                                on {new Date(log.workDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {log.description && <p className="text-sm text-gray-700 mt-1">{log.description}</p>}
                                                                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                        <div className="flex items-center space-x-1">
                                                                            <User className="w-3 h-3" />
                                                                            <span>{getUserName(log.userId)}</span>
                                                                        </div>
                                                                        <Badge variant="outline" className="text-xs">{log.entryType}</Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                                                    <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                                    <p className="text-xs">No time logs recorded yet</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Effort Logs from My Tasks (Simplified version of TaskEffortLogs) */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Effort Logs (from My Tasks)</h3>
                                            <TaskEffortLogs taskId={currentTask.id} users={users} />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                    {currentTask.description || "No description provided."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Attachments */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h3>
                                            {loadingAttachments ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                </div>
                                            ) : parentStoryAttachments.length > 0 ? (
                                                <div className="space-y-2">
                                                    {parentStoryAttachments.map((attachment) => (
                                                        <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
                                                            <div className="flex items-center space-x-3">
                                                                <Paperclip className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium">{attachment.fileName}</span>
                                                            </div>
                                                            <Button variant="ghost" size="sm">Download</Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                                                    <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                                    <p className="text-xs">No attachments from parent story</p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="activities" className="flex-1 overflow-auto p-6">
                                        <TaskActivityLog taskId={currentTask.id} users={users} />
                                    </TabsContent>

                                    <TabsContent value="subtasks" className="flex-1 overflow-auto p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-900">Subtasks</h3>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Subtask
                                                </Button>
                                            </div>
                                            {loadingSubtasks ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                </div>
                                            ) : subtasks.length > 0 ? (
                                                <div className="space-y-2">
                                                    {subtasks.map((st) => (
                                                        <div key={st.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50">
                                                            <div className="flex items-center space-x-3">
                                                                <Badge variant="outline" className="text-[10px] bg-blue-50">STK</Badge>
                                                                <span className="text-sm font-medium">{st.title}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-4">
                                                                <span className="text-xs text-gray-500">{st.status}</span>
                                                                <Badge variant="secondary" className="text-xs">{st.actualHours}/{st.estimatedHours}h</Badge>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-center py-8 text-gray-500">No subtasks found.</p>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="due-dates" className="flex-1 overflow-auto p-6">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900">Important Dates</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Created At</p>
                                                    <p className="text-sm font-medium">{new Date(currentTask.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                                    <p className="text-sm font-medium">{new Date(currentTask.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                                                    <p className="text-sm font-medium">{currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : "No due date"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="linked-issues" className="flex-1 overflow-auto p-6">
                                        <div className="text-center py-12 text-gray-500">
                                            <Paperclip className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                            <p className="text-sm">No linked issues for this task</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Task Details</h3>
                                    <div className="space-y-4">
                                        {/* Progress Bars */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">Estimation</span>
                                                <span className="text-xs font-semibold text-blue-600">{currentTask.estimatedHours || 0}h</span>
                                            </div>
                                            <Progress value={100} className="h-2 bg-blue-100" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">Time Spent</span>
                                                <span className="text-xs font-semibold text-green-600">{currentTask.actualHours || 0}h</span>
                                            </div>
                                            <Progress
                                                value={currentTask.estimatedHours > 0 ? Math.min(100, (currentTask.actualHours || 0) / currentTask.estimatedHours * 100) : 0}
                                                className="h-2 bg-green-100"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">Remaining</span>
                                                <span className="text-xs font-semibold text-gray-600">
                                                    {Math.max(0, (currentTask.estimatedHours || 0) - (currentTask.actualHours || 0))}h
                                                </span>
                                            </div>
                                            <Progress
                                                value={currentTask.estimatedHours > 0 ? Math.min(100, (Math.max(0, (currentTask.estimatedHours || 0) - (currentTask.actualHours || 0)) / currentTask.estimatedHours) * 100) : 0}
                                                className="h-2 bg-gray-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Details</h3>
                                        <Settings className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Assigned To</label>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-800 font-bold">
                                                    {getUserName(currentTask.assigneeId || "").substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700">{getUserName(currentTask.assigneeId || "")}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
                                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{currentTask.priority}</Badge>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
                                            <span className="text-sm text-gray-700">{currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : "No due date"}</span>
                                        </div>
                                        {currentTask.storyId && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">Parent Story</label>
                                                <div className="flex items-center space-x-2 text-blue-600 hover:underline cursor-pointer">
                                                    <BookOpen className="w-3 h-3" />
                                                    <span className="text-sm">{currentTask.storyId}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Log Effort Dialog */}
            <Dialog open={isLogEffortOpen} onOpenChange={setIsLogEffortOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Log Work</DialogTitle>
                        <DialogDescription>
                            Log time spent on task: {currentTask.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="hours">Hours Worked *</Label>
                            <Input
                                id="hours"
                                type="number"
                                step="0.5"
                                value={effortLog.hours}
                                onChange={(e) => setEffortLog(p => ({ ...p, hours: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Work Description *</Label>
                            <Textarea
                                id="description"
                                value={effortLog.description}
                                onChange={(e) => setEffortLog(p => ({ ...p, description: e.target.value }))}
                                placeholder="What did you work on?"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startTime">Start Time (Optional)</Label>
                                <Input
                                    id="startTime"
                                    type="time"
                                    value={effortLog.startTime}
                                    onChange={(e) => setEffortLog(p => ({ ...p, startTime: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="endTime">End Time (Optional)</Label>
                                <Input
                                    id="endTime"
                                    type="time"
                                    value={effortLog.endTime}
                                    onChange={(e) => setEffortLog(p => ({ ...p, endTime: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="date">Work Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={effortLog.workDate}
                                onChange={(e) => setEffortLog(p => ({ ...p, workDate: e.target.value }))}
                            />
                        </div>

                        {/* Attachments Section */}
                        <div className="border rounded-lg p-3 bg-gray-50/50">
                            <Label className="flex items-center gap-2 mb-2">
                                <Paperclip className="w-4 h-4" />
                                Attachments (Optional)
                            </Label>
                            <div className="space-y-2">
                                <Input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setEffortLogAttachments((prev) => [...prev, ...files]);
                                        e.target.value = '';
                                    }}
                                    className="cursor-pointer bg-white"
                                />
                                {effortLogAttachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {effortLogAttachments.map((file, index) => (
                                            <div key={index} className="flex items-center gap-1 bg-white border rounded px-2 py-1 text-xs">
                                                <Paperclip className="w-3 h-3 text-gray-500" />
                                                <span className="max-w-[120px] truncate">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setEffortLogAttachments(prev => prev.filter((_, i) => i !== index))}
                                                    className="ml-1 text-red-500 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Task Time Stats */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">Estimated</p>
                                <p className="text-lg font-bold text-blue-700">{(currentTask?.estimatedHours || 0)}h</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Logged</p>
                                <p className="text-lg font-bold text-green-700">{(currentTask?.actualHours || 0)}h</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-orange-600 uppercase font-bold mb-1">After Log</p>
                                <p className="text-lg font-bold text-orange-700">{((currentTask?.actualHours || 0) + effortLog.hours).toFixed(1)}h</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogEffortOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleLogEffort}
                            disabled={isLoggingEffort || !effortLog.hours || effortLog.hours <= 0}
                        >
                            {isLoggingEffort ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Log {effortLog.hours}h
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

// Sub-component for Effort Logs
const TaskEffortLogs: React.FC<{ taskId: string, users: any[] }> = ({ taskId, users }) => {
    const { activityLogs, loading } = useRecentActivityByEntity("tasks", taskId, 30);
    const effortLogs = activityLogs.filter(log => log.action === 'TIME_LOGGED');

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId || u.userId === userId);
        return user ? (user.name || user.fullName || user.username) : "Unknown";
    };

    if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>;
    if (effortLogs.length === 0) return (
        <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
            <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500">No effort logged yet</p>
        </div>
    );

    return (
        <div className="space-y-2">
            {effortLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2 bg-white rounded border border-gray-200 hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                            <Timer className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-gray-700">{getUserName(log.userId)}</span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{log.description || "Time logged"}</p>
                </div>
            ))}
        </div>
    );
};

// Sub-component for Activity Logs
const TaskActivityLog: React.FC<{ taskId: string, users: any[] }> = ({ taskId, users }) => {
    const { activityLogs, loading } = useRecentActivityByEntity("tasks", taskId, 30);

    if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
    if (activityLogs.length === 0) return <div className="text-center py-8 text-gray-500">No activities found.</div>;

    return (
        <div className="space-y-4">
            {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs flex-shrink-0">
                        {log.action.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{log.userId}</span>
                            <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">{log.action}</span>: {log.description || log.action}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskDetailsJiraDialog;
