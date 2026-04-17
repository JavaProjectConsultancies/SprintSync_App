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
    Calendar as CalendarIcon,
    MoreHorizontal,
    Plus,
    Eye,
    Trash2
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import {
    Task,
    Subtask,
    TimeEntry,
    Priority,
    Issue,
} from "../types/api";
import { taskApiService } from "../services/api/entities/taskApi";
import { timeEntryApiService } from "../services/api/entities/timeEntryApi";
import { attachmentApiService } from "../services/api/entities/attachmentApi";
import { subtaskApiService } from "../services/api/entities/subtaskApi";
import { issueApiService } from "../services/api/entities/issueApi";
import { invalidateTasksCache } from "../hooks/api/useTasks";
import { useRecentActivityByEntity } from "../hooks/api/useActivityLogs";
import { toast } from "sonner";
import AttachmentViewer from './AttachmentViewer';

import { useAuth } from "../contexts/AuthContextEnhanced";
import { userApiService } from "../services/api/entities/userApi";
import ChatSection from './ChatSection';
import { getLocalToday, toDateInputFormat } from '../utils/dateUtils';

// Helper component to render description with images and line breaks
const RenderDescription = ({ description }: { description?: string }) => {
    if (!description) return <p className="text-sm text-gray-500 italic">No description provided.</p>;

    // Regex to find ![image](url) OR raw attachment URLs
    const imageRegex = /(!\[.*?\]\((.*?)\))|(https?:\/\/[^\s]+\/attachments\/view\/[a-zA-Z0-9_\-]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imageRegex.exec(description)) !== null) {
        // Add text before the image
        const textBefore = description.substring(lastIndex, match.index);
        if (textBefore) {
            parts.push({ type: 'text', content: textBefore });
        }

        // Determine URL
        let imageUrl = '';
        if (match[1]) {
            // Markdown format ![...](url) -> match[2]
            imageUrl = match[2];
        } else {
            // Raw URL format -> match[0] (or match[3])
            imageUrl = match[0];
        }

        // Add the image
        parts.push({ type: 'image', url: imageUrl });
        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    const remainingText = description.substring(lastIndex);
    if (remainingText) {
        parts.push({ type: 'text', content: remainingText });
    }

    return (
        <div className="space-y-2">
            {parts.map((part, index) => {
                if (part.type === 'image') {
                    return (
                        <div key={index} className="my-2 border rounded-lg overflow-hidden bg-white max-w-full">
                            <img
                                src={part.url}
                                alt="Description image"
                                className="max-w-full h-auto object-contain cursor-pointer hover:opacity-90"
                                onClick={() => window.open(part.url, '_blank')}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Image+Load+Error';
                                }}
                            />
                        </div>
                    );
                }
                return (
                    <p key={index} className="text-sm text-gray-700 whitespace-pre-wrap">
                        {part.content}
                    </p>
                );
            })}
        </div>
    );
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

interface TaskDetailsJiraDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    onTaskUpdated?: () => void;
    allSubtasks?: Subtask[]; // Optional, will fetch if not provided
    canManage?: boolean;
    sprintEndDate?: string; // Used to block time logging after sprint ends
    projectId?: string;
    unreadMentions?: any[];
    allLanes?: any[];
    onLaneChanged?: () => void; // Called after lane is changed so board can refresh
}

const TaskDetailsJiraDialog: React.FC<TaskDetailsJiraDialogProps> = ({
    open,
    onOpenChange,
    task,
    onTaskUpdated,
    allSubtasks: initialSubtasks = [],
    canManage = true,
    sprintEndDate,
    projectId,
    unreadMentions = [],
    allLanes = [],
    onLaneChanged,
}) => {
    const { user } = useAuth();
    console.log('[TaskDetailsJiraDialog] User:', user);
    console.log('[TaskDetailsJiraDialog] Role:', user?.role);
    console.log('[TaskDetailsJiraDialog] canManage:', canManage);
    const [activeTab, setActiveTab] = useState<string>("details");
    const [taskLogs, setTaskLogs] = useState<TimeEntry[]>([]);
    const [loadingTaskLogs, setLoadingTaskLogs] = useState(false);
    const [parentStoryAttachments, setParentStoryAttachments] = useState<any[]>([]);
    const [taskAttachments, setTaskAttachments] = useState<any[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    // Linked issues state
    const [linkedIssues, setLinkedIssues] = useState<Issue[]>([]);
    const [loadingLinkedIssues, setLoadingLinkedIssues] = useState(false);

    // Effort logging state
    const [isLogEffortOpen, setIsLogEffortOpen] = useState(false);
    const [isLoggingEffort, setIsLoggingEffort] = useState(false);

    useEffect(() => {
        if (open) {
            setActiveTab('details');
        }
    }, [open]);

    const [effortLog, setEffortLog] = useState({
        hours: 0,
        description: "",
        workDate: getLocalToday(),
        startTime: "",
        endTime: "",
    });
    const [effortLogAttachments, setEffortLogAttachments] = useState<File[]>([]);

    // Attachment viewer state
    const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
    const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false);

    const [currentTask, setCurrentTask] = useState<Task | null>(task);

    // Description editing state
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState("");
    const [isDueDatePopoverOpen, setIsDueDatePopoverOpen] = useState(false);
    const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isEditingAttachments, setIsEditingAttachments] = useState(false);
    const userRole = user?.role?.toUpperCase() || '';
    const isAdmin = userRole === 'ADMIN';
    const isMasterAdmin = userRole === 'MASTER_ADMIN';
    const isViewOnly = isAdmin || isMasterAdmin;

    // Title editing state
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState("");

    // Lane changing state
    const [isUpdatingLane, setIsUpdatingLane] = useState(false);

    const canEditContent = ['MANAGER', 'QA_MANAGER', 'QA_DEVELOPER', 'SUPPORT_AND_IMPLEMENTATION'].includes(userRole);
    const canEditAttachments = canEditContent;
    // Only Manager and QA Manager can change the lane
    const canChangeLane = canManage && ['MANAGER', 'QA_MANAGER'].includes(userRole);

    // Handle lane change from dropdown
    const handleLaneChange = async (newStatusValue: string) => {
        if (!currentTask || !canChangeLane) return;

        const isMovingFromTodo = currentTask.status === "TO_DO" && newStatusValue !== "TO_DO";
        const isMovingToDone = newStatusValue === "DONE" && currentTask.status !== "DONE";

        if (isMovingFromTodo || isMovingToDone) {
            setIsUpdatingLane(true);
            try {
                const response = await timeEntryApiService.getTimeEntriesByTask(currentTask.id);
                const entries = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
                if (entries.length === 0) {
                    const actionDesc = isMovingToDone ? "to the Done lane" : "from the To Do lane";
                    toast.error(`Please add at least one effort log before moving ${actionDesc}`);
                    setIsUpdatingLane(false);
                    return;
                }
            } catch (error) {
                toast.error("Unable to verify effort logs.");
                setIsUpdatingLane(false);
                return;
            }
        }

        setIsUpdatingLane(true);
        try {
            await taskApiService.updateTaskStatus(currentTask.id, newStatusValue);
            setCurrentTask(prev => prev ? { ...prev, status: newStatusValue as any } : prev);
            toast.success('Lane updated successfully');
            invalidateTasksCache();
            if (onTaskUpdated) onTaskUpdated();
            if (onLaneChanged) onLaneChanged();
        } catch (error) {
            console.error('Error updating task lane:', error);
            toast.error('Failed to update lane');
        } finally {
            setIsUpdatingLane(false);
        }
    };

    const handleSaveDescription = async () => {
        if (!currentTask) return;
        try {
            await taskApiService.updateTaskDescription(currentTask.id, tempDescription);
            setCurrentTask(prev => prev ? { ...prev, description: tempDescription } : prev);
            setIsEditingDescription(false);
            toast.success("Description updated successfully");
            if (onTaskUpdated) onTaskUpdated();
        } catch (error) {
            console.error("Error updating description:", error);
            toast.error("Failed to update description");
        }
    };

    const handleSaveTitle = async () => {
        if (!currentTask || !tempTitle.trim()) return;
        try {
            await taskApiService.updateTaskTitle(currentTask.id, tempTitle);
            setCurrentTask(prev => prev ? { ...prev, title: tempTitle } : prev);
            setIsEditingTitle(false);
            toast.success("Title updated successfully");
            if (onTaskUpdated) onTaskUpdated();
        } catch (error) {
            console.error("Error updating title:", error);
            toast.error("Failed to update title");
        }
    };

    const handleDescriptionPaste = async (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file && currentTask) {
                    try {
                        const fileDataUrl = await fileToBase64(file);
                        const response = await attachmentApiService.createAttachment({
                            uploadedBy: user?.id,
                            entityType: 'task',
                            entityId: currentTask.id.split(':')[0],
                            fileName: file.name || `pasted-image-${Date.now()}.png`,
                            fileSize: file.size,
                            fileType: file.type || 'image/png',
                            fileUrl: fileDataUrl,
                            attachmentType: 'file' as const,
                            isPublic: true,
                        });

                        if (response.success && response.data) {
                            const attachmentId = response.data.id;
                            const imageUrl = attachmentApiService.getAttachmentViewUrl(attachmentId);
                            const imageMarkdown = `\n${imageUrl}\n`;
                            setTempDescription(prev => prev + imageMarkdown);
                            toast.success("Image pasted and uploaded");

                            // Also refresh attachments list
                            const refreshRes = await attachmentApiService.getAttachmentsByEntity("task", currentTask.id);
                            setTaskAttachments(refreshRes.data || []);
                        }
                    } catch (error) {
                        console.error("Error handling pasted image:", error);
                        toast.error("Failed to upload pasted image");
                    }
                }
            }
        }
    };

    // Check if sprint has ended - block time logging after sprint end
    const isSprintEnded = sprintEndDate ? new Date().setHours(0,0,0,0) > new Date(sprintEndDate).setHours(0,0,0,0) : false;
    const isDueDateExceeded = currentTask?.dueDate ? new Date().setHours(0,0,0,0) > new Date(currentTask.dueDate).setHours(0,0,0,0) : false;
    const canLogTime = !isViewOnly && !isDueDateExceeded;

    useEffect(() => {
        setCurrentTask(task);
        if (task) {
            const taskAny = task as any;
            console.log('[TaskDetailsJiraDialog] Task loaded:', {
                id: task.id,
                storyId: task.storyId,
                linkedIssueIds: taskAny.linkedIssueIds || taskAny.linked_issue_ids,
                allKeys: Object.keys(taskAny)
            });
            fetchTaskData(task.id, task.storyId);
            if (users.length === 0) {
                fetchUsers();
            }
        } else {
            // Reset linked issues when task is closed
            setLinkedIssues([]);
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
        const cleanTaskId = taskId.split(':')[0];
        setLoadingTaskLogs(true);
        setLoadingAttachments(true);
        setLoadingSubtasks(true);

        try {
            // Fetch the task itself to get the latest data including linkedIssueIds
            const taskRes = await taskApiService.getTaskById(taskId);
            if (taskRes.data) {
                const taskData = taskRes.data;
                setCurrentTask(taskData);
                // Use the storyId from the fetched task if not provided
                if (!storyId && taskData.storyId) {
                    storyId = taskData.storyId;
                }

                // Ensure we use clean IDs
                const cleanStoryId = storyId ? storyId.split(':')[0] : undefined;

                // Fetch linked issues if linkedIssueIds exist
                const taskDataAny = taskData as any;
                let linkedIssueIds: string[] = [];

                console.log('[TaskDetailsJiraDialog] Raw task data for links:', {
                    id: taskDataAny?.id,
                    linkedIssueIds: taskDataAny?.linkedIssueIds,
                    linked_issue_ids: taskDataAny?.linked_issue_ids,
                    allKeys: taskDataAny ? Object.keys(taskDataAny) : []
                });

                // Try camelCase first
                if (taskDataAny.linkedIssueIds) {
                    if (Array.isArray(taskDataAny.linkedIssueIds)) {
                        linkedIssueIds = taskDataAny.linkedIssueIds;
                    } else if (typeof taskDataAny.linkedIssueIds === 'string') {
                        try {
                            const parsed = JSON.parse(taskDataAny.linkedIssueIds);
                            if (Array.isArray(parsed)) linkedIssueIds = parsed;
                        } catch (e) {
                            console.warn('[TaskDetailsJiraDialog] Failed to parse linkedIssueIds string:', e);
                        }
                    }
                }
                // Then try snake_case if empty
                if (linkedIssueIds.length === 0 && taskDataAny.linked_issue_ids) {
                    if (Array.isArray(taskDataAny.linked_issue_ids)) {
                        linkedIssueIds = taskDataAny.linked_issue_ids;
                    } else if (typeof taskDataAny.linked_issue_ids === 'string') {
                        try {
                            const parsed = JSON.parse(taskDataAny.linked_issue_ids);
                            if (Array.isArray(parsed)) linkedIssueIds = parsed;
                        } catch (e) {
                            console.warn('[TaskDetailsJiraDialog] Failed to parse linked_issue_ids string:', e);
                        }
                    }
                }

                // Filter out any null/empty strings
                linkedIssueIds = linkedIssueIds.filter(id => id && typeof id === 'string' && id.trim() !== '');

                console.log('[TaskDetailsJiraDialog] Final parsed linkedIssueIds:', linkedIssueIds);

                console.log('[TaskDetailsJiraDialog] Task linkedIssueIds from API:', linkedIssueIds);

                if (linkedIssueIds && linkedIssueIds.length > 0) {
                    try {
                        setLoadingLinkedIssues(true);
                        console.log('[TaskDetailsJiraDialog] Fetching linked issues directly by IDs:', linkedIssueIds);

                        const issuePromises = linkedIssueIds.map(async (issueId: string) => {
                            try {
                                const issueRes = await issueApiService.getIssueById(issueId);
                                if (issueRes.data) {
                                    return issueRes.data;
                                }
                                return null;
                            } catch (err) {
                                console.error(`[TaskDetailsJiraDialog] Failed to fetch issue ${issueId}:`, err);
                                return null;
                            }
                        });

                        const fetchedIssues = await Promise.all(issuePromises);
                        const validIssues = fetchedIssues.filter((i): i is Issue => i !== null && i !== undefined);

                        setLinkedIssues(validIssues);
                        console.log('[TaskDetailsJiraDialog] Found linked issues:', validIssues.length, 'Issue IDs:', validIssues.map(i => i.id));
                    } catch (err) {
                        console.error("Error fetching linked issues:", err);
                        setLinkedIssues([]);
                    } finally {
                        setLoadingLinkedIssues(false);
                    }
                } else {
                    setLinkedIssues([]);
                    console.log('[TaskDetailsJiraDialog] No linkedIssueIds found or empty array. Task data:', {
                        linkedIssueIds: taskDataAny.linkedIssueIds,
                        linked_issue_ids: taskDataAny.linked_issue_ids,
                        allKeys: Object.keys(taskDataAny)
                    });
                }
            }

            // Fetch Logs
            const logsRes = await timeEntryApiService.getTimeEntriesByTask(taskId);
            setTaskLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

            // Fetch Story Attachments
            if (storyId) {
                const attachRes = await attachmentApiService.getAttachmentsByEntity("story", storyId);
                setParentStoryAttachments(attachRes.data || []);
            }

            // Fetch Task Attachments
            console.log('[TaskDetailsJiraDialog] Fetching attachments for cleanTaskId:', cleanTaskId);
            try {
                const taskAttachRes = await attachmentApiService.getAttachmentsByEntity("task", cleanTaskId);
                console.log('[TaskDetailsJiraDialog] Attachments response:', taskAttachRes);
                setTaskAttachments(taskAttachRes.data || []);
                console.log('[TaskDetailsJiraDialog] Fetched task attachments:', taskAttachRes.data?.length || 0);
            } catch (err) {
                console.error('[TaskDetailsJiraDialog] Failed to fetch attachments:', err);
                setTaskAttachments([]);
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



    const uploadFileAndCreateAttachment = async (
        file: File,
        entityType: string,
        entityId: string,
    ): Promise<void> => {
        try {
            const fileDataUrl = await fileToBase64(file);
            const fileType = file.type || "application/octet-stream";
            console.log(`[TaskDetailsJiraDialog] Creating attachment for ${entityType} ${entityId}:`, {
                fileName: file.name,
                fileSize: file.size,
                fileType,
                entityType,
                entityId,
                uploadedBy: user?.id
            });

            const response = await attachmentApiService.createAttachment({
                uploadedBy: user?.id,
                entityType,
                entityId: entityId.split(':')[0],
                fileName: file.name,
                fileSize: file.size,
                fileType,
                fileUrl: fileDataUrl,
                attachmentType: 'file' as const,
                isPublic: true,
            });

            if (!response.success) {
                console.error("[TaskDetailsJiraDialog] Attachment creation failed:", response);
                throw new Error(response.message || "Failed to create attachment");
            }

            console.log(`[TaskDetailsJiraDialog] Attachment created successfully:`, response.data);

            // Refresh attachments if this is for the current task
            if (entityType === "task" && entityId === currentTask?.id) {
                const refreshRes = await attachmentApiService.getAttachmentsByEntity("task", entityId);
                setTaskAttachments(refreshRes.data || []);
            }
        } catch (error) {
            console.error("Error creating attachment:", error);
            throw error;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !currentTask) return;

        setIsUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                await uploadFileAndCreateAttachment(files[i], 'task', currentTask.id);
            }
            toast.success("Attachment(s) uploaded successfully");
        } catch (error) {
            console.error("Error uploading attachments:", error);
            toast.error("Failed to upload attachment(s)");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveAttachment = async (attachmentId: string) => {
        if (!confirm("Are you sure you want to remove this attachment?")) return;

        try {
            await attachmentApiService.deleteAttachment(attachmentId);
            setTaskAttachments(prev => prev.filter(a => a.id !== attachmentId));
            toast.success("Attachment removed successfully");
        } catch (error) {
            console.error("Error removing attachment:", error);
            toast.error("Failed to remove attachment");
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
                workDate: getLocalToday(),
                startTime: "",
                endTime: "",
            });
            setEffortLogAttachments([]);

            // Refresh data
            await fetchTaskData(currentTask.id, currentTask.storyId);
            invalidateTasksCache();
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
                                        {/* Lane / Status Dropdown */}
                                        {(() => {
                                            const BOARD_LANES = [
                                                { id: 'std_todo', title: 'To Do', color: '#6b7280', statusValue: 'TO_DO' },
                                                { id: 'std_inprogress', title: 'In Progress', color: '#3b82f6', statusValue: 'IN_PROGRESS' },
                                                { id: 'std_qa', title: 'QA Review', color: '#f59e0b', statusValue: 'QA_REVIEW' },
                                                { id: 'std_done', title: 'Done', color: '#10b981', statusValue: 'DONE' },
                                            ];
                                            const boardStatusValues = new Set(BOARD_LANES.map(l => l.statusValue));
                                            const customOnly = allLanes.filter((l: any) => !boardStatusValues.has(l.statusValue));
                                            const laneOptions = [...BOARD_LANES, ...customOnly];
                                            return (
                                                <div className="relative">
                                                    <Select
                                                        value={currentTask.status}
                                                        onValueChange={handleLaneChange}
                                                        disabled={!canChangeLane || isUpdatingLane}
                                                    >
                                                        <SelectTrigger className={`h-7 px-3 text-xs border rounded-md ${canChangeLane
                                                            ? 'border-blue-300 bg-white hover:bg-blue-50 text-blue-800 cursor-pointer'
                                                            : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed opacity-70'
                                                            }`}>
                                                            {isUpdatingLane
                                                                ? <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Updating...</span>
                                                                : <SelectValue placeholder="Select lane" />
                                                            }
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {laneOptions.map((lane: any) => (
                                                                <SelectItem key={lane.id || lane.statusValue} value={lane.statusValue}>
                                                                    <span className="flex items-center gap-2">
                                                                        <span
                                                                            className="inline-block w-2 h-2 rounded-full"
                                                                            style={{ backgroundColor: lane.color || '#6b7280' }}
                                                                        />
                                                                        {lane.title}
                                                                    </span>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {!canChangeLane && (
                                                        <span className="absolute -bottom-5 left-0 text-[10px] text-gray-400 whitespace-nowrap">
                                                            Manager/QA Manager only
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 px-2 ${!canLogTime ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100'}`}
                                        onClick={() => canLogTime && setIsLogEffortOpen(true)}
                                        disabled={!canLogTime}
                                        title={!canLogTime ? (isDueDateExceeded ? 'Due date exceeded' : 'View-only access') : 'Log time for this task'}
                                    >
                                        <Clock className="w-4 h-4 mr-1 text-blue-600" />
                                        Add Log
                                    </Button>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                                <div className="flex items-center justify-between mb-2">
                                    {isEditingTitle ? (
                                        <div className="flex-1 flex items-center space-x-2">
                                            <Input
                                                value={tempTitle}
                                                onChange={(e) => setTempTitle(e.target.value)}
                                                className="text-xl font-semibold h-10"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveTitle();
                                                    if (e.key === 'Escape') setIsEditingTitle(false);
                                                }}
                                            />
                                            <Button size="sm" onClick={handleSaveTitle}>Save</Button>
                                            <Button size="sm" variant="outline" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between w-full">
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {currentTask.title}
                                            </h2>
                                            {canEditContent && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setTempTitle(currentTask.title);
                                                        setIsEditingTitle(true);
                                                    }}
                                                    className="h-8 px-2"
                                                >
                                                    <Edit3 className="w-3 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Flag className="w-4 h-4" />
                                        <span>{currentTask.priority}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{Number(currentTask.estimatedHours || 0).toFixed(2)}h estimated</span>
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
                                        <TabsTrigger value="chats" className="relative">
                                            Chats
                                            {currentTask && unreadMentions.some(n =>
                                                (n.relatedEntityId === currentTask.id || n.relatedEntityId === currentTask.taskNumber) &&
                                                (n.relatedEntityType || '').toLowerCase() === 'task' &&
                                                (n.type || '').toLowerCase() === 'mention'
                                            ) && (
                                                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                )}
                                        </TabsTrigger>
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
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center justify-between">
                                                <span>Description</span>
                                                {canEditContent && !isEditingDescription && (
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setTempDescription(currentTask.description || "");
                                                        setIsEditingDescription(true);
                                                    }} className="h-6 px-2">
                                                        <Edit3 className="w-3 h-3 mr-1" /> Edit
                                                    </Button>
                                                )}
                                            </h3>
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                {isEditingDescription ? (
                                                    <div className="space-y-2">
                                                        <Textarea
                                                            value={tempDescription}
                                                            onChange={(e) => setTempDescription(e.target.value)}
                                                            onPaste={handleDescriptionPaste}
                                                            className="min-h-[120px] bg-white whitespace-pre-wrap"
                                                            placeholder="Enter task description... (You can paste images here)"
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                                                            <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <RenderDescription description={currentTask.description} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Attachments */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-semibold text-gray-900">Attachments</h3>
                                                    {canEditAttachments && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setIsEditingAttachments(!isEditingAttachments)}
                                                            className={`h-7 px-2 ${isEditingAttachments ? 'bg-blue-100 text-blue-700' : ''}`}
                                                        >
                                                            <Edit3 className="w-3 h-3 mr-1" />
                                                            {isEditingAttachments ? "Done" : "Edit"}
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {canEditAttachments && isEditingAttachments && (
                                                        <>
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                ref={fileInputRef}
                                                                onChange={handleFileUpload}
                                                                multiple
                                                            />
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-3 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                                                onClick={() => fileInputRef.current?.click()}
                                                                disabled={isUploading}
                                                            >
                                                                {isUploading ? (
                                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                ) : (
                                                                    <Plus className="w-3 h-3 mr-1" />
                                                                )}
                                                                Add
                                                            </Button>
                                                        </>
                                                    )}
                                                    {(parentStoryAttachments.length > 0 || taskAttachments.length > 0) && (
                                                        <div className="flex items-center space-x-2">
                                                            {taskAttachments.length > 0 && (
                                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                                    Task ({taskAttachments.length})
                                                                </Badge>
                                                            )}
                                                            {parentStoryAttachments.length > 0 && (
                                                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                                                    Story ({parentStoryAttachments.length})
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {loadingAttachments ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                </div>
                                            ) : (parentStoryAttachments.length > 0 || taskAttachments.length > 0) ? (
                                                <div className="space-y-2">
                                                    {/* Task Attachments */}
                                                    {taskAttachments.map((attachment) => (
                                                        <div key={attachment.id} className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50/30">
                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                <Paperclip className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <span className="text-sm font-medium truncate">{attachment.fileName}</span>
                                                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0">
                                                                            Task
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500">
                                                                        {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : ''}
                                                                        {attachment.fileType && ` • ${attachment.fileType}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setViewingAttachment(attachment);
                                                                        setIsAttachmentViewerOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (attachment.fileUrl) {
                                                                            const link = document.createElement('a');
                                                                            link.href = attachment.fileUrl;
                                                                            link.download = attachment.fileName || "download";
                                                                            link.target = "_blank";
                                                                            link.rel = "noopener noreferrer";
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }
                                                                    }}
                                                                >
                                                                    Download
                                                                </Button>
                                                                {canEditAttachments && isEditingAttachments && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleRemoveAttachment(attachment.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {/* Story Attachments */}
                                                    {parentStoryAttachments.map((attachment) => (
                                                        <div key={attachment.id} className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-green-50/30">
                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                <Paperclip className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <span className="text-sm font-medium truncate">{attachment.fileName}</span>
                                                                        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 flex-shrink-0">
                                                                            Story
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-xs text-gray-500">
                                                                        {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : ''}
                                                                        {attachment.fileType && ` • ${attachment.fileType}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setViewingAttachment(attachment);
                                                                        setIsAttachmentViewerOpen(true);
                                                                    }}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        if (attachment.fileUrl) {
                                                                            const link = document.createElement('a');
                                                                            link.href = attachment.fileUrl;
                                                                            link.download = attachment.fileName || "download";
                                                                            link.target = "_blank";
                                                                            link.rel = "noopener noreferrer";
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }
                                                                    }}
                                                                >
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                                                    <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                                    <p className="text-xs">No attachments</p>
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
                                                                <Badge variant="secondary" className="text-xs">{Number(st.actualHours).toFixed(2)}/{Number(st.estimatedHours).toFixed(2)}h</Badge>
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

                                    <TabsContent value="linked-issues" className="flex-1 overflow-auto p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900">Linked Issues</h3>
                                            <p className="text-xs text-gray-500">
                                                Issues linked to this task
                                            </p>
                                        </div>

                                        {/* DEBUG SECTION */}
                                        <div className="p-2 bg-gray-100 border border-gray-300 rounded text-xs font-mono mb-2">
                                            <p>DEBUG: Linked Issues Detection</p>
                                            <p>Loading: {loadingLinkedIssues ? 'Yes' : 'No'}</p>
                                            <p>Count: {linkedIssues.length}</p>
                                            <p>Raw IDs found: {JSON.stringify((currentTask as any).linkedIssueIds || (currentTask as any).linked_issue_ids || [])}</p>
                                        </div>

                                        {loadingLinkedIssues ? (
                                            <div className="flex items-center justify-center py-8 text-gray-500">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                <span className="text-sm">Loading linked issues...</span>
                                            </div>
                                        ) : linkedIssues.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <Paperclip className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                                <p className="text-sm">No linked issues for this task</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Link issues when creating or editing this task.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {linkedIssues.map(issue => (
                                                    <div
                                                        key={issue.id}
                                                        className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                                {issue.title}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {issue.status} · {issue.priority}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px]">
                                                            Linked Issue
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="chats" className="flex-1 overflow-hidden p-6 min-h-0">
                                        <ChatSection entityId={currentTask.id} entityType="task" projectId={projectId} />
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
                                                    {getUserName(currentTask.assigneeId || "").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
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
                                            {canManage && (user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'qa_manager') ? (
                                                <Popover open={isDueDatePopoverOpen} onOpenChange={setIsDueDatePopoverOpen} modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full justify-start text-left font-normal h-8 text-xs ${!currentTask.dueDate ? "text-muted-foreground" : ""
                                                                }`}
                                                            disabled={isUpdatingDueDate}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3 w-3" />
                                                            {currentTask.dueDate ? (
                                                                new Date(currentTask.dueDate).toLocaleDateString()
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            {isUpdatingDueDate && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[50]" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={currentTask.dueDate ? new Date(currentTask.dueDate) : undefined}
                                                            onSelect={async (date) => {
                                                                if (date) {
                                                                    // Use local date string YYYY-MM-DD instead of toISOString() to avoid timezone offsets
                                                                    const year = date.getFullYear();
                                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const day = String(date.getDate()).padStart(2, '0');
                                                                    const formattedDate = `${year}-${month}-${day}`;

                                                                    setIsUpdatingDueDate(true);
                                                                    try {
                                                                        await taskApiService.updateTaskDueDate(currentTask.id, formattedDate);
                                                                        setCurrentTask(prev => prev ? { ...prev, dueDate: formattedDate } : null);
                                                                        setIsDueDatePopoverOpen(false);
                                                                        toast.success("Due date updated");
                                                                    } catch (error) {
                                                                        console.error("Failed to update due date:", error);
                                                                        toast.error("Failed to update due date");
                                                                    } finally {
                                                                        setIsUpdatingDueDate(false);
                                                                    }
                                                                }
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-sm text-gray-700 h-8">
                                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                                    <span>{currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : "No due date"}</span>
                                                </div>
                                            )}
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
                                className="whitespace-pre-wrap"
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
                                onKeyDown={(e) => e.preventDefault()}
                                min={(() => { const d = new Date(); d.setDate(d.getDate() - 2); return toDateInputFormat(d); })()}
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
                                <p className="text-lg font-bold text-orange-700">{((currentTask?.actualHours || 0) + effortLog.hours).toFixed(2)}h</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogEffortOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleLogEffort}
                            disabled={isLoggingEffort || !effortLog.hours || effortLog.hours <= 0}
                            loading={isLoggingEffort}
                        >
                            Log {effortLog.hours > 0 ? `${effortLog.hours.toFixed(2)}h` : "Work"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Attachment Viewer Modal */}
            <AttachmentViewer
                isOpen={isAttachmentViewerOpen}
                onClose={() => {
                    setIsAttachmentViewerOpen(false);
                    setViewingAttachment(null);
                }}
                attachment={viewingAttachment}
            />
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
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{log.description || "Time logged"}</p>
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
