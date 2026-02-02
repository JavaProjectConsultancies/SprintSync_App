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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar as CalendarComponent } from "./ui/calendar";
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
    Bug,
    AlertCircle,
    Eye
} from "lucide-react";
import {
    Issue,
    Subtask,
    TimeEntry,
    Priority,
    Task,
} from "../types/api";
import { issueApiService } from "../services/api/entities/issueApi";
import { timeEntryApiService } from "../services/api/entities/timeEntryApi";
import { attachmentApiService } from "../services/api/entities/attachmentApi";
import { subtaskApiService } from "../services/api/entities/subtaskApi";
import { taskApiService } from "../services/api/entities/taskApi";
import { useRecentActivityByEntity } from "../hooks/api/useActivityLogs";
import { toast } from "sonner";
import AttachmentViewer from './AttachmentViewer';

import { useAuth } from "../contexts/AuthContextEnhanced";
import { userApiService } from "../services/api/entities/userApi";
import { storyApiService } from "../services/api/entities/storyApi";
import ChatSection from './ChatSection';

interface IssueDetailsJiraDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    issue: Issue | null;
    onIssueUpdated?: () => void;
    allSubtasks?: Subtask[];
    canManage?: boolean;
    sprintEndDate?: string; // Used to block time logging after sprint ends
    projectId?: string;
    unreadMentions?: any[];
}

const IssueDetailsJiraDialog: React.FC<IssueDetailsJiraDialogProps> = ({
    open,
    onOpenChange,
    issue,
    onIssueUpdated,
    allSubtasks: initialSubtasks = [],
    canManage = true,
    sprintEndDate,
    projectId,
    unreadMentions = [],
}) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("details");
    const [issueLogs, setIssueLogs] = useState<TimeEntry[]>([]);
    const [loadingIssueLogs, setLoadingIssueLogs] = useState(false);
    const [parentStoryAttachments, setParentStoryAttachments] = useState<any[]>([]);
    const [issueAttachments, setIssueAttachments] = useState<any[]>([]);
    const [loadingAttachments, setLoadingAttachments] = useState(false);
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [parentStoryName, setParentStoryName] = useState<string>("");
    const [loadingStoryName, setLoadingStoryName] = useState(false);

    // Linked tasks state
    const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);
    const [loadingLinkedTasks, setLoadingLinkedTasks] = useState(false);

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
        workDate: new Date().toISOString().split('T')[0],
        startTime: "",
        endTime: "",
    });
    const [effortLogAttachments, setEffortLogAttachments] = useState<File[]>([]);

    // Subtask effort logging state
    const [isSubtaskLogEffortOpen, setIsSubtaskLogEffortOpen] = useState(false);
    const [selectedSubtaskForLog, setSelectedSubtaskForLog] = useState<Subtask | null>(null);
    const [isLoggingSubtaskEffort, setIsLoggingSubtaskEffort] = useState(false);
    const [subtaskEffortLog, setSubtaskEffortLog] = useState({
        hours: 0,
        description: "",
        workDate: new Date().toISOString().split('T')[0],
        startTime: "",
        endTime: "",
    });

    // Attachment viewer state
    const [viewingAttachment, setViewingAttachment] = useState<any | null>(null);
    const [isAttachmentViewerOpen, setIsAttachmentViewerOpen] = useState(false);

    const [currentIssue, setCurrentIssue] = useState<Issue | null>(issue);

    // Description editing state
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState("");
    const [isDueDatePopoverOpen, setIsDueDatePopoverOpen] = useState(false);
    const [isUpdatingDueDate, setIsUpdatingDueDate] = useState(false);

    const handleSaveDescription = async () => {
        if (!currentIssue) return;
        try {
            await issueApiService.updateIssue(currentIssue.id, { description: tempDescription });
            setCurrentIssue(prev => prev ? { ...prev, description: tempDescription } : prev);
            setIsEditingDescription(false);
            toast.success("Description updated successfully");
            if (onIssueUpdated) onIssueUpdated();
        } catch (error) {
            console.error("Error updating description:", error);
            toast.error("Failed to update description");
        }
    };

    // Check if sprint has ended - block time logging after sprint end
    const isSprintEnded = sprintEndDate ? new Date() > new Date(sprintEndDate) : false;

    useEffect(() => {
        setCurrentIssue(issue);
        if (issue) {
            const issueAny = issue as any;
            console.log('[IssueDetailsJiraDialog] Issue loaded:', {
                id: issue.id,
                storyId: issue.storyId,
                linkedTaskIds: issueAny.linkedTaskIds || issueAny.linked_task_ids,
                allKeys: Object.keys(issueAny)
            });
            fetchIssueData(issue.id, issue.storyId);
            if (users.length === 0) {
                fetchUsers();
            }
        } else {
            // Reset linked tasks when issue is closed
            setLinkedTasks([]);
        }
    }, [issue]);

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

    const fetchIssueData = async (issueId: string, storyId?: string) => {
        setLoadingIssueLogs(true);
        setLoadingAttachments(true);
        setLoadingSubtasks(true);

        try {
            // Fetch the issue itself to get the latest data
            const issueRes = await issueApiService.getIssueById(issueId);
            console.log('[IssueDetailsJiraDialog] Raw API response:', issueRes);
            if (issueRes.data) {
                const issueData = issueRes.data;
                const issueDataAny = issueData as any;
                console.log('[IssueDetailsJiraDialog] Fetched issue data:', {
                    id: issueData.id,
                    linkedTaskIds: issueDataAny.linkedTaskIds || issueDataAny.linked_task_ids,
                    linkedTaskIds_type: typeof issueDataAny.linkedTaskIds,
                    linkedTaskIds_isArray: Array.isArray(issueDataAny.linkedTaskIds),
                    linked_task_ids: issueDataAny.linked_task_ids,
                    linked_task_ids_type: typeof issueDataAny.linked_task_ids,
                    linked_task_ids_isArray: Array.isArray(issueDataAny.linked_task_ids),
                    storyId: issueData.storyId,
                    allKeys: Object.keys(issueDataAny),
                    fullIssueData: JSON.stringify(issueDataAny, null, 2)
                });
                setCurrentIssue(issueData);
                // Use the storyId from the fetched issue if not provided
                if (!storyId && issueData.storyId) {
                    storyId = issueData.storyId;
                }

                // Fetch Story Name if available
                if (storyId) {
                    setLoadingStoryName(true);
                    try {
                        const storyRes = await storyApiService.getStoryById(storyId);
                        if (storyRes.data) {
                            setParentStoryName(storyRes.data.title);
                        }
                    } catch (err) {
                        console.error("Error fetching story name:", err);
                    } finally {
                        setLoadingStoryName(false);
                    }
                }
            }

            // Fetch Logs
            const logsRes = await timeEntryApiService.getTimeEntriesByIssue(issueId);
            setIssueLogs(Array.isArray(logsRes.data) ? logsRes.data : []);

            // Fetch Story Attachments
            if (storyId) {
                const attachRes = await attachmentApiService.getAttachmentsByEntity("story", storyId);
                setParentStoryAttachments(attachRes.data || []);
            }

            // Fetch Issue Attachments
            const issueAttachRes = await attachmentApiService.getAttachmentsByEntity("issue", issueId);
            setIssueAttachments(issueAttachRes.data || []);
            console.log('[IssueDetailsJiraDialog] Fetched issue attachments:', issueAttachRes.data?.length || 0);

            // Fetch Subtasks
            const subRes = await subtaskApiService.getSubtasksByIssue(issueId);
            setSubtasks(subRes.data || []);

            // Fetch linked tasks directly by their IDs
            // VERSION 2 - Updated to fetch tasks directly by ID
            console.log('[IssueDetailsJiraDialog] VERSION 2 - Fetching linked tasks');
            if (issueRes.data) {
                try {
                    setLoadingLinkedTasks(true);

                    // Get linkedTaskIds from the issue - handle both camelCase and snake_case
                    const issueDataForLinks = issueRes.data as any;
                    let linkedTaskIds: string[] = [];

                    // Debug: Log the entire issue data to see all keys
                    console.log('[IssueDetailsJiraDialog] VERSION 2 - Full issue data keys:', Object.keys(issueDataForLinks));
                    console.log('[IssueDetailsJiraDialog] VERSION 2 - Raw linkedTaskIds value:', issueDataForLinks.linkedTaskIds);

                    // Try camelCase first, then snake_case, handle null/undefined/empty arrays
                    if (issueDataForLinks.linkedTaskIds !== undefined && issueDataForLinks.linkedTaskIds !== null) {
                        if (Array.isArray(issueDataForLinks.linkedTaskIds)) {
                            linkedTaskIds = issueDataForLinks.linkedTaskIds.filter((id: any) => id != null && id !== '');
                        } else if (typeof issueDataForLinks.linkedTaskIds === 'string') {
                            // Handle case where it might be a JSON string
                            try {
                                const parsed = JSON.parse(issueDataForLinks.linkedTaskIds);
                                if (Array.isArray(parsed)) {
                                    linkedTaskIds = parsed.filter((id: any) => id != null && id !== '');
                                }
                            } catch (e) {
                                console.warn('[IssueDetailsJiraDialog] Failed to parse linkedTaskIds as JSON string');
                            }
                        }
                    } else if (issueDataForLinks.linked_task_ids !== undefined && issueDataForLinks.linked_task_ids !== null) {
                        if (Array.isArray(issueDataForLinks.linked_task_ids)) {
                            linkedTaskIds = issueDataForLinks.linked_task_ids.filter((id: any) => id != null && id !== '');
                        } else if (typeof issueDataForLinks.linked_task_ids === 'string') {
                            try {
                                const parsed = JSON.parse(issueDataForLinks.linked_task_ids);
                                if (Array.isArray(parsed)) {
                                    linkedTaskIds = parsed.filter((id: any) => id != null && id !== '');
                                }
                            } catch (e) {
                                console.warn('[IssueDetailsJiraDialog] Failed to parse linked_task_ids as JSON string');
                            }
                        }
                    }

                    console.log('[IssueDetailsJiraDialog] Issue linkedTaskIds from API:', linkedTaskIds, 'Raw value:', {
                        linkedTaskIds: issueDataForLinks.linkedTaskIds,
                        linked_task_ids: issueDataForLinks.linked_task_ids,
                        type_linkedTaskIds: typeof issueDataForLinks.linkedTaskIds,
                        type_linked_task_ids: typeof issueDataForLinks.linked_task_ids,
                        isArray_linkedTaskIds: Array.isArray(issueDataForLinks.linkedTaskIds),
                        isArray_linked_task_ids: Array.isArray(issueDataForLinks.linked_task_ids),
                        allKeys: Object.keys(issueDataForLinks)
                    });

                    // Directly fetch each linked task by ID to get full task details including title
                    if (linkedTaskIds && linkedTaskIds.length > 0) {
                        console.log('[IssueDetailsJiraDialog] Fetching linked tasks directly by IDs:', linkedTaskIds);
                        const taskPromises = linkedTaskIds.map(async (taskId: string) => {
                            try {
                                const taskRes = await taskApiService.getTaskById(taskId);
                                if (taskRes.data && taskRes.data.title) {
                                    console.log(`[IssueDetailsJiraDialog] ✅ Fetched task ${taskId}: ${taskRes.data.title}`);
                                    return taskRes.data;
                                } else {
                                    console.warn(`[IssueDetailsJiraDialog] ⚠️ Task ${taskId} fetched but missing title:`, taskRes.data);
                                    return taskRes.data; // Still return it, we'll handle missing title in display
                                }
                            } catch (err) {
                                console.error(`[IssueDetailsJiraDialog] ❌ Failed to fetch task ${taskId}:`, err);
                                return null;
                            }
                        });

                        const fetchedTasks = await Promise.all(taskPromises);
                        const validTasks = fetchedTasks.filter((t): t is Task => t !== null && t !== undefined);
                        setLinkedTasks(validTasks);
                        console.log('[IssueDetailsJiraDialog] ✅ Found linked tasks:', validTasks.length, 'Task names:', validTasks.map(t => t.title || t.id));
                    } else {
                        setLinkedTasks([]);
                        console.log('[IssueDetailsJiraDialog] ⚠️ No linkedTaskIds found or empty array. Issue data:', {
                            linkedTaskIds: issueDataForLinks.linkedTaskIds,
                            linked_task_ids: issueDataForLinks.linked_task_ids,
                            allKeys: Object.keys(issueDataForLinks)
                        });
                    }
                } catch (err) {
                    console.error("❌ Error fetching linked tasks:", err);
                    setLinkedTasks([]);
                } finally {
                    setLoadingLinkedTasks(false);
                }
            } else {
                console.log('[IssueDetailsJiraDialog] ⚠️ No issue data available, cannot fetch linked tasks.');
                setLinkedTasks([]);
            }

        } catch (error) {
            console.error("Error fetching issue details data:", error);
        } finally {
            setLoadingIssueLogs(false);
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
        const matchedUser = users.find(u => u.id === userId || u.userId === userId || u.employeeId === userId);
        return matchedUser ? (matchedUser.name || matchedUser.fullName || matchedUser.username) : userId;
    };

    const handleLogEffort = async () => {
        if (!currentIssue || !effortLog.hours || effortLog.hours <= 0) {
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
                issueId: currentIssue.id,
                storyId: currentIssue.storyId?.trim() || undefined,
                description: effortLog.description,
                entryType: "bug_fix" as const,
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
                        await uploadFileAndCreateAttachment(file, 'issue', currentIssue.id);
                    }
                } catch (attachError) {
                    console.error("Error uploading attachments:", attachError);
                    toast.error("Effort logged, but some attachments failed to upload");
                }
            }

            // Automatically move issue to IN_PROGRESS if it's currently in TO_DO status
            const currentStatus = currentIssue.status?.toUpperCase() || "";
            if (currentStatus === "TO_DO" || currentStatus === "TODO") {
                try {
                    await issueApiService.updateIssueStatus(currentIssue.id, "IN_PROGRESS");
                    setCurrentIssue(prev => prev ? { ...prev, status: "IN_PROGRESS" as any } : prev);
                    toast.success("Issue moved to In Progress automatically");
                } catch (error) {
                    console.error("Failed to update issue status to IN_PROGRESS:", error);
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
            fetchIssueData(currentIssue.id, currentIssue.storyId);
            if (onIssueUpdated) onIssueUpdated();
        } catch (error) {
            console.error("Error logging effort:", error);
            toast.error("Failed to log effort");
        } finally {
            setIsLoggingEffort(false);
        }
    };

    // Handle subtask effort logging
    const handleLogSubtaskEffort = async () => {
        if (!selectedSubtaskForLog || !subtaskEffortLog.hours || subtaskEffortLog.hours <= 0) {
            toast.error("Please enter valid hours");
            return;
        }
        if (!subtaskEffortLog.description.trim()) {
            toast.error("Please enter a description");
            return;
        }

        try {
            setIsLoggingSubtaskEffort(true);
            const timeEntryData = {
                userId: user?.id || "",
                subtaskId: selectedSubtaskForLog.id,
                issueId: currentIssue?.id,
                storyId: currentIssue?.storyId?.trim() || undefined,
                description: subtaskEffortLog.description,
                entryType: "development" as const,
                hoursWorked: subtaskEffortLog.hours,
                workDate: subtaskEffortLog.workDate,
                startTime: subtaskEffortLog.startTime && subtaskEffortLog.startTime.trim() ? subtaskEffortLog.startTime : undefined,
                endTime: subtaskEffortLog.endTime && subtaskEffortLog.endTime.trim() ? subtaskEffortLog.endTime : undefined,
                isBillable: true,
            };

            await timeEntryApiService.createTimeEntry(timeEntryData);

            // Update subtask actual hours
            if (selectedSubtaskForLog) {
                const updatedActualHours = (selectedSubtaskForLog.actualHours || 0) + subtaskEffortLog.hours;
                await subtaskApiService.updateSubtaskActualHours(selectedSubtaskForLog.id, updatedActualHours);
            }

            // Automatically move parent issue to IN_PROGRESS if it's currently in TO_DO status
            if (currentIssue) {
                const issueStatus = currentIssue.status?.toUpperCase() || "";
                if (issueStatus === "TO_DO" || issueStatus === "TODO") {
                    try {
                        await issueApiService.updateIssueStatus(currentIssue.id, "IN_PROGRESS");
                        setCurrentIssue(prev => prev ? { ...prev, status: "IN_PROGRESS" as any } : prev);
                        toast.success("Issue moved to In Progress automatically");
                    } catch (error) {
                        console.error("Failed to update issue status to IN_PROGRESS:", error);
                    }
                }
            }

            toast.success("Subtask effort logged successfully");
            setIsSubtaskLogEffortOpen(false);
            setSelectedSubtaskForLog(null);
            setSubtaskEffortLog({
                hours: 0,
                description: "",
                workDate: new Date().toISOString().split('T')[0],
                startTime: "",
                endTime: "",
            });

            // Refresh data
            if (currentIssue) {
                fetchIssueData(currentIssue.id, currentIssue.storyId);
            }
            if (onIssueUpdated) onIssueUpdated();
        } catch (error) {
            console.error("Error logging subtask effort:", error);
            toast.error("Failed to log subtask effort");
        } finally {
            setIsLoggingSubtaskEffort(false);
        }
    };

    if (!currentIssue) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
                    <DialogTitle className="sr-only">
                        Issue Details: {currentIssue.title}
                    </DialogTitle>

                    <div className="flex flex-1 min-h-0 overflow-hidden">
                        {/* Left Panel */}
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50 flex-shrink-0">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="secondary" className="bg-red-100 text-red-800 font-semibold">
                                            ISS-{currentIssue.id.slice(-4).toUpperCase()}
                                        </Badge>
                                        <Button variant="outline" size="sm" className="h-7 px-3 border-red-200 text-red-700">
                                            {currentIssue.status.replace("_", " ")}
                                            <ChevronDown className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-8 px-2 ${isSprintEnded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'} text-red-700`}
                                        onClick={() => !isSprintEnded && setIsLogEffortOpen(true)}
                                        disabled={isSprintEnded}
                                        title={isSprintEnded ? 'Cannot log time after sprint has ended' : 'Log time for this issue'}
                                    >
                                        <Clock className="w-4 h-4 mr-1 text-red-600" />
                                        Add Log
                                    </Button>
                                </div>
                            </div>

                            {/* Title Section */}
                            <div className="p-6 border-b border-gray-200 flex-shrink-0">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {currentIssue.title}
                                </h2>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Flag className="w-4 h-4 text-red-500" />
                                        <span>{currentIssue.priority}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{currentIssue.estimatedHours || 0}h estimated</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <User className="w-4 h-4" />
                                        <span>{getUserName(currentIssue.assigneeId || "")}</span>
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
                                        <TabsTrigger value="linked-tasks">Linked Tasks</TabsTrigger>
                                        <TabsTrigger value="chats" className="relative">
                                            Chats
                                            {currentIssue && unreadMentions.some(n =>
                                                (n.relatedEntityId === currentIssue.id || n.relatedEntityId === (currentIssue as any).issueNumber) &&
                                                (n.relatedEntityType || '').toLowerCase() === 'issue' &&
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
                                            {loadingIssueLogs ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                                                </div>
                                            ) : issueLogs.length > 0 ? (
                                                <div className="space-y-2">
                                                    {issueLogs.map((log) => (
                                                        <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors group">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <Clock className="w-4 h-4 text-red-600" />
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

                                        {/* Effort Logs from My Tasks */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Effort Logs (from My Tasks)</h3>
                                            <IssueEffortLogs issueId={currentIssue.id} users={users} />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center justify-between">
                                                <span>Description</span>
                                                {canManage && (user?.role === 'manager' || user?.role === 'qa_manager') && !isEditingDescription && (
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setTempDescription(currentIssue.description || "");
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
                                                            className="min-h-[120px] bg-white"
                                                            placeholder="Enter issue description..."
                                                        />
                                                        <div className="flex justify-end space-x-2">
                                                            <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                                                            <Button size="sm" onClick={handleSaveDescription}>Save</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                        {currentIssue.description || "No description provided."}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Attachments */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-sm font-semibold text-gray-900">Attachments</h3>
                                                {(parentStoryAttachments.length > 0 || issueAttachments.length > 0) && (
                                                    <div className="flex items-center space-x-2">
                                                        {issueAttachments.length > 0 && (
                                                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                                                Issue ({issueAttachments.length})
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
                                            {loadingAttachments ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                                                </div>
                                            ) : (parentStoryAttachments.length > 0 || issueAttachments.length > 0) ? (
                                                <div className="space-y-2">
                                                    {/* Issue Attachments */}
                                                    {issueAttachments.map((attachment) => (
                                                        <div key={attachment.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50/30">
                                                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                                <Paperclip className="w-4 h-4 text-red-500 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <span className="text-sm font-medium truncate">{attachment.fileName}</span>
                                                                        <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300 flex-shrink-0">
                                                                            Issue
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
                                        <IssueActivityLog issueId={currentIssue.id} users={users} />
                                    </TabsContent>

                                    <TabsContent value="subtasks" className="flex-1 overflow-auto p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-900">Issue Subtasks</h3>
                                                <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700">
                                                    <Plus className="w-3 h-3 mr-1" /> Add Subtask
                                                </Button>
                                            </div>
                                            {loadingSubtasks ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                                                </div>
                                            ) : subtasks.length > 0 ? (
                                                <div className="space-y-2">
                                                    {subtasks.map((st) => (
                                                        <div key={st.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 text-red-900 group">
                                                            <div className="flex items-center space-x-3">
                                                                <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">ISTK</Badge>
                                                                <span className="text-sm font-medium">{st.title}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-xs text-gray-500">{st.status}</span>
                                                                <Badge variant="secondary" className="text-xs bg-red-50 text-red-800 border-red-100">{st.actualHours || 0}/{st.estimatedHours || 0}h</Badge>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className={`h-7 px-2 text-red-700 border-red-200 ${isSprintEnded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'}`}
                                                                    disabled={isSprintEnded}
                                                                    title={isSprintEnded ? 'Cannot log time after sprint has ended' : 'Log time for this subtask'}
                                                                    onClick={() => {
                                                                        if (isSprintEnded) return;
                                                                        setSelectedSubtaskForLog(st);
                                                                        setSubtaskEffortLog({
                                                                            hours: 0,
                                                                            description: "",
                                                                            workDate: new Date().toISOString().split('T')[0],
                                                                            startTime: "",
                                                                            endTime: "",
                                                                        });
                                                                        setIsSubtaskLogEffortOpen(true);
                                                                    }}
                                                                >
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    Add Log
                                                                </Button>
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
                                                    <p className="text-sm font-medium">{new Date(currentIssue.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                                                    <p className="text-sm font-medium">{new Date(currentIssue.updatedAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="p-3 border border-gray-100 rounded-lg bg-gray-50">
                                                    <p className="text-xs text-gray-500 mb-1">Due Date</p>
                                                    <p className="text-sm font-medium">{currentIssue.dueDate ? new Date(currentIssue.dueDate).toLocaleDateString() : "No due date"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="linked-tasks" className="flex-1 overflow-auto p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-gray-900">Linked Tasks</h3>
                                            <p className="text-xs text-gray-500">
                                                Tasks from the same story linked to this issue
                                            </p>
                                        </div>

                                        {loadingLinkedTasks ? (
                                            <div className="flex items-center justify-center py-8 text-gray-500">
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                <span className="text-sm">Loading linked tasks...</span>
                                            </div>
                                        ) : linkedTasks.length === 0 ? (
                                            <div className="text-center py-12 text-gray-500">
                                                <Paperclip className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                                <p className="text-sm">No linked tasks for this issue</p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Link tasks when creating or editing this issue.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {linkedTasks.map(task => (
                                                    <div
                                                        key={task.id}
                                                        className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex flex-col flex-1 min-w-0">
                                                            <span className="text-sm font-medium text-gray-900 truncate" title={task.title || task.id}>
                                                                {task.title || `Task ${task.id.slice(-4).toUpperCase()}`}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {task.status} · {task.priority}
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                                                            Linked Task
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="chats" className="flex-1 overflow-hidden p-6 min-h-0">
                                        <ChatSection entityId={currentIssue.id} entityType="issue" projectId={projectId} />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
                            <div className="p-6 space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Issue Details</h3>
                                    <div className="space-y-4">
                                        {/* Progress Bars */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">Estimation</span>
                                                <span className="text-xs font-semibold text-red-600">{currentIssue.estimatedHours || 0}h</span>
                                            </div>
                                            <Progress value={100} className="h-2 bg-red-100" />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">Time Spent</span>
                                                <span className="text-xs font-semibold text-green-600">{currentIssue.actualHours || 0}h</span>
                                            </div>
                                            <Progress
                                                value={currentIssue.estimatedHours && currentIssue.estimatedHours > 0 ? Math.min(100, (currentIssue.actualHours || 0) / currentIssue.estimatedHours * 100) : 0}
                                                className="h-2 bg-green-100"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-600">Remaining</span>
                                                <span className="text-xs font-semibold text-gray-600">
                                                    {Math.max(0, (currentIssue.estimatedHours || 0) - (currentIssue.actualHours || 0))}h
                                                </span>
                                            </div>
                                            <Progress
                                                value={currentIssue.estimatedHours && currentIssue.estimatedHours > 0 ? Math.min(100, (Math.max(0, (currentIssue.estimatedHours || 0) - (currentIssue.actualHours || 0)) / currentIssue.estimatedHours) * 100) : 0}
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
                                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] text-red-800 font-bold">
                                                    {getUserName(currentIssue.assigneeId || "").split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700">{getUserName(currentIssue.assigneeId || "")}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
                                            <Badge className="bg-red-100 text-red-800 border-red-200">{currentIssue.priority}</Badge>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
                                            {canManage && (user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'qa_manager') ? (
                                                <Popover open={isDueDatePopoverOpen} onOpenChange={setIsDueDatePopoverOpen} modal={true}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={`w-full justify-start text-left font-normal h-8 text-xs ${!currentIssue.dueDate ? "text-muted-foreground" : ""
                                                                }`}
                                                            disabled={isUpdatingDueDate}
                                                        >
                                                            <CalendarIcon className="mr-2 h-3 w-3" />
                                                            {currentIssue.dueDate ? (
                                                                new Date(currentIssue.dueDate).toLocaleDateString()
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            {isUpdatingDueDate && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[50]" align="start">
                                                        <CalendarComponent
                                                            mode="single"
                                                            selected={currentIssue.dueDate ? new Date(currentIssue.dueDate) : undefined}
                                                            onSelect={async (date) => {
                                                                if (date) {
                                                                    // Use local date string YYYY-MM-DD instead of toISOString() to avoid timezone offsets
                                                                    const year = date.getFullYear();
                                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                    const day = String(date.getDate()).padStart(2, '0');
                                                                    const formattedDate = `${year}-${month}-${day}`;

                                                                    setIsUpdatingDueDate(true);
                                                                    try {
                                                                        await issueApiService.updateIssueDueDate(currentIssue.id, formattedDate);
                                                                        setCurrentIssue(prev => prev ? { ...prev, dueDate: formattedDate } : null);
                                                                        setIsDueDatePopoverOpen(false);
                                                                        toast.success("Due date updated");
                                                                        if (onIssueUpdated) onIssueUpdated();
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
                                                    <span>{currentIssue.dueDate ? new Date(currentIssue.dueDate).toLocaleDateString() : "No due date"}</span>
                                                </div>
                                            )}
                                        </div>
                                        {currentIssue.storyId && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600 block mb-1">Parent Story</label>
                                                <div className="flex items-center space-x-2 text-red-600 hover:underline cursor-pointer group/story">
                                                    <BookOpen className="w-3 h-3 group-hover/story:scale-110 transition-transform" />
                                                    <span className="text-sm font-medium">
                                                        {loadingStoryName ? (
                                                            <span className="text-gray-400 animate-pulse italic">Loading story...</span>
                                                        ) : (parentStoryName || currentIssue.storyId)}
                                                    </span>
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
                        <DialogTitle className="text-red-700">Log Work</DialogTitle>
                        <DialogDescription>
                            Log time spent on issue: {currentIssue.title}
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
                        <div className="border rounded-lg p-3 bg-red-50/30">
                            <Label className="flex items-center gap-2 mb-2 text-red-700">
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

                        {/* Issue Time Stats */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-red-600 uppercase font-bold mb-1">Estimated</p>
                                <p className="text-lg font-bold text-red-700">{(currentIssue?.estimatedHours || 0)}h</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Logged</p>
                                <p className="text-lg font-bold text-green-700">{(currentIssue?.actualHours || 0)}h</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-orange-600 uppercase font-bold mb-1">After Log</p>
                                <p className="text-lg font-bold text-orange-700">{((currentIssue?.actualHours || 0) + effortLog.hours).toFixed(1)}h</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-6 gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsLogEffortOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleLogEffort}
                            className="mt-0 gap-1 pt-1 border-t"

                            disabled={isLoggingEffort || effortLog.hours <= 0}
                        >
                            {isLoggingEffort && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Log {effortLog.hours > 0 ? `${effortLog.hours}h` : 'Work'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subtask Log Effort Dialog */}
            <Dialog open={isSubtaskLogEffortOpen} onOpenChange={setIsSubtaskLogEffortOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-700">Log Subtask Work</DialogTitle>
                        <DialogDescription>
                            Log time spent on subtask: {selectedSubtaskForLog?.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="subtask-hours">Hours Worked *</Label>
                            <Input
                                id="subtask-hours"
                                type="number"
                                step="0.5"
                                value={subtaskEffortLog.hours}
                                onChange={(e) => setSubtaskEffortLog(p => ({ ...p, hours: parseFloat(e.target.value) || 0 }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="subtask-description">Work Description *</Label>
                            <Textarea
                                id="subtask-description"
                                value={subtaskEffortLog.description}
                                onChange={(e) => setSubtaskEffortLog(p => ({ ...p, description: e.target.value }))}
                                placeholder="What did you work on?"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="subtask-startTime">Start Time (Optional)</Label>
                                <Input
                                    id="subtask-startTime"
                                    type="time"
                                    value={subtaskEffortLog.startTime}
                                    onChange={(e) => setSubtaskEffortLog(p => ({ ...p, startTime: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="subtask-endTime">End Time (Optional)</Label>
                                <Input
                                    id="subtask-endTime"
                                    type="time"
                                    value={subtaskEffortLog.endTime}
                                    onChange={(e) => setSubtaskEffortLog(p => ({ ...p, endTime: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="subtask-date">Work Date</Label>
                            <Input
                                id="subtask-date"
                                type="date"
                                value={subtaskEffortLog.workDate}
                                onChange={(e) => setSubtaskEffortLog(p => ({ ...p, workDate: e.target.value }))}
                            />
                        </div>

                        {/* Subtask Time Stats */}
                        {selectedSubtaskForLog && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-red-600 uppercase font-bold mb-1">Estimated</p>
                                    <p className="text-lg font-bold text-red-700">{(selectedSubtaskForLog.estimatedHours || 0)}h</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Logged</p>
                                    <p className="text-lg font-bold text-green-700">{(selectedSubtaskForLog.actualHours || 0)}h</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-orange-600 uppercase font-bold mb-1">After Log</p>
                                    <p className="text-lg font-bold text-orange-700">{((selectedSubtaskForLog.actualHours || 0) + subtaskEffortLog.hours).toFixed(1)}h</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="mt-6 gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsSubtaskLogEffortOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleLogSubtaskEffort}
                            disabled={isLoggingSubtaskEffort || subtaskEffortLog.hours <= 0}
                        >
                            {isLoggingSubtaskEffort && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Log {subtaskEffortLog.hours > 0 ? `${subtaskEffortLog.hours}h` : 'Work'}
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

// Sub-component for Issue Effort Logs
const IssueEffortLogs: React.FC<{ issueId: string, users: any[] }> = ({ issueId, users }) => {
    const { activityLogs, loading } = useRecentActivityByEntity("issues", issueId, 30);
    const effortLogs = activityLogs.filter(log => log.action === 'TIME_LOGGED');

    const getUserName = (userId: string) => {
        const user = users.find(u => u.id === userId || u.userId === userId);
        return user ? (user.name || user.fullName || user.username) : "Unknown";
    };

    if (loading) return <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-red-400" /></div>;
    if (effortLogs.length === 0) return (
        <div className="text-center py-4 border border-gray-200 rounded-lg bg-gray-50">
            <Clock className="w-6 h-6 mx-auto mb-2 text-gray-300" />
            <p className="text-xs text-gray-500">No effort logged yet</p>
        </div>
    );

    return (
        <div className="space-y-2">
            {effortLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2 bg-white rounded border border-gray-200 hover:border-red-300 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1">
                            <Timer className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-gray-700">{getUserName(log.userId || "")}</span>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{log.description || "Time logged"}</p>
                </div>
            ))}
        </div>
    );
};

// Sub-component for Issue Activity Logs
const IssueActivityLog: React.FC<{ issueId: string, users: any[] }> = ({ issueId, users }) => {
    const { activityLogs, loading } = useRecentActivityByEntity("issues", issueId, 30);

    if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>;
    if (activityLogs.length === 0) return <div className="text-center py-8 text-gray-500">No activities found.</div>;

    return (
        <div className="space-y-4">
            {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-xs flex-shrink-0 text-red-600 border border-red-100">
                        {log.action.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{log.userId}</span>
                            <span className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium text-red-700">{log.action}</span>: {log.description || log.action}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IssueDetailsJiraDialog;
