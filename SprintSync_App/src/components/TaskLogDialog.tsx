import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
    Clock,
    Target,
    User,
    Timer,
    CalendarIcon,
    CheckSquare,
    Flag,
    ArrowRight,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { taskApiService, activityLogApiService } from '../services/api';
import { toast } from 'sonner';

// Simple date formatter
const formatDate = (date: Date, formatStr: string) => {
    if (formatStr === 'PPP') {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    if (formatStr === 'dd/MM/yy') {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}/${month}/${year}`;
    }
    return date.toLocaleDateString();
};

interface TaskLogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: {
        id: string;
        text: string;
        priority: 'low' | 'medium' | 'high';
        category: string;
        status?: string;
        dueDate?: Date;
        createdAt: Date;
    };
    onTaskUpdated?: () => void;
}

// Status/Column options - matching backend TaskStatus enum values
const statusColumns = [
    { value: 'TO_DO', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'QA_REVIEW', label: 'QA/Review', color: 'bg-purple-100 text-purple-800' },
    { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-800' },
    { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' }
];

// Work categories
const workCategories = [
    { value: 'development', label: 'Development', icon: '💻' },
    { value: 'design', label: 'Design', icon: '🎨' },
    { value: 'testing', label: 'Testing', icon: '🧪' },
    { value: 'documentation', label: 'Documentation', icon: '📝' },
    { value: 'meeting', label: 'Meeting', icon: '👥' },
    { value: 'research', label: 'Research', icon: '🔍' },
    { value: 'review', label: 'Code Review', icon: '👁️' },
    { value: 'deployment', label: 'Deployment', icon: '🚀' }
];

const TaskLogDialog: React.FC<TaskLogDialogProps> = ({
    open,
    onOpenChange,
    task,
    onTaskUpdated
}) => {
    const { user, hasPermission } = useAuth();

    // Check if user is a manager (can move to Done)
    const isManager = user?.role === 'manager' || user?.role === 'admin' || hasPermission('manage_sprints');

    // Determine current status
    const getCurrentStatus = () => {
        if (!task.status) return 'TO_DO';
        const normalized = task.status.toUpperCase().replace(/[\s-]/g, '_');
        if (normalized.includes('PROGRESS')) return 'IN_PROGRESS';
        if (normalized.includes('QA') || normalized.includes('REVIEW')) return 'QA_REVIEW';
        if (normalized.includes('DONE') || normalized.includes('COMPLETE')) return 'DONE';
        if (normalized.includes('BLOCKED')) return 'BLOCKED';
        return 'TO_DO';
    };

    const [activeTab, setActiveTab] = useState('details');
    const [selectedStatus, setSelectedStatus] = useState(getCurrentStatus());
    const [logFormData, setLogFormData] = useState({
        date: new Date(),
        hours: 0,
        minutes: 30,
        category: 'development',
        description: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const originalStatus = getCurrentStatus();

    // Get available status options based on role
    const getAvailableStatuses = () => {
        if (isManager) {
            return statusColumns;
        }
        // Non-managers can't select Done
        return statusColumns.filter(s => s.value !== 'DONE');
    };

    // Validate form
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // If moving from TO_DO to IN_PROGRESS, require log entry
        if (originalStatus === 'TO_DO' && selectedStatus === 'IN_PROGRESS') {
            if (!logFormData.description.trim()) {
                newErrors.description = 'A log entry is required when starting work on a task';
            }
            const totalMinutes = logFormData.hours * 60 + logFormData.minutes;
            if (totalMinutes <= 0) {
                newErrors.time = 'Please log some time spent';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            console.log('[TaskLogDialog] Submitting update:', {
                taskId: task.id,
                originalStatus,
                selectedStatus,
                statusChanged: selectedStatus !== originalStatus,
                hasLogEntry: logFormData.description.trim().length > 0
            });

            // Update task status if changed
            if (selectedStatus !== originalStatus) {
                console.log('[TaskLogDialog] Updating status to:', selectedStatus);
                const statusResult = await taskApiService.updateTaskStatus(task.id, selectedStatus);
                console.log('[TaskLogDialog] Status update result:', statusResult);

                // Create activity log for status change
                try {
                    await activityLogApiService.createActivityLog({
                        userId: user?.id,
                        entityType: 'tasks',
                        entityId: task.id,
                        action: 'STATUS_CHANGE',
                        description: `Status changed from ${statusColumns.find(s => s.value === originalStatus)?.label || originalStatus} to ${statusColumns.find(s => s.value === selectedStatus)?.label || selectedStatus}`,
                        oldValues: JSON.stringify({ status: originalStatus }),
                        newValues: JSON.stringify({ status: selectedStatus })
                    });
                    console.log('[TaskLogDialog] Activity log created for status change');
                } catch (activityError) {
                    console.warn('[TaskLogDialog] Failed to create activity log:', activityError);
                }
            }

            // Log the time/effort if provided - ADD to existing hours (not replace)
            const newHours = logFormData.hours + (logFormData.minutes / 60);
            if (newHours > 0) {
                // First, get the current task to read existing actual hours
                console.log('[TaskLogDialog] Fetching current task data...');
                const currentTaskResponse = await taskApiService.getTaskById(task.id);
                const currentTask = currentTaskResponse.data;
                const existingHours = currentTask?.actualHours || 0;
                const totalHours = existingHours + newHours;

                console.log('[TaskLogDialog] Merging hours:', {
                    taskId: task.id,
                    existingHours,
                    newHours,
                    totalHours,
                    description: logFormData.description
                });

                // Call the actual hours update API with merged total
                const logResult = await taskApiService.updateTaskActualHours(task.id, totalHours);
                console.log('[TaskLogDialog] Actual hours update result:', logResult);

                // Create activity log for effort logging
                try {
                    const categoryLabel = workCategories.find(c => c.value === logFormData.category)?.label || logFormData.category;
                    await activityLogApiService.createActivityLog({
                        userId: user?.id,
                        entityType: 'tasks',
                        entityId: task.id,
                        action: 'TIME_LOGGED',
                        description: `Logged ${newHours.toFixed(2)} hours (${categoryLabel}): ${logFormData.description || 'Work progress'}`,
                        oldValues: JSON.stringify({ actualHours: existingHours }),
                        newValues: JSON.stringify({ actualHours: totalHours, newHoursAdded: newHours })
                    });
                    console.log('[TaskLogDialog] Activity log created for effort');
                } catch (activityError) {
                    console.warn('[TaskLogDialog] Failed to create activity log:', activityError);
                }
            }

            toast.success('Task updated successfully');
            onTaskUpdated?.();
            onOpenChange(false);
        } catch (error) {
            console.error('[TaskLogDialog] Failed to update task:', error);
            toast.error('Failed to update task. Check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatTimePreview = () => {
        const totalMinutes = logFormData.hours * 60 + logFormData.minutes;
        if (totalMinutes === 0) return '0 minutes';

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        if (hours === 0) return `${minutes} minutes`;
        if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours}h ${minutes}m`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span>Log Work & Update Status</span>
                    </DialogTitle>
                    <DialogDescription>
                        Log your work progress and update task status on the scrum board.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                    {/* Task Summary Card */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <CheckSquare className="w-4 h-4 text-blue-600" />
                                        <Badge variant="outline" className="text-xs">{task.id.slice(0, 8)}</Badge>
                                    </div>
                                    <h3 className="font-medium text-lg">{task.text}</h3>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                            <Flag className="w-3 h-3 mr-1" />
                                            {task.priority}
                                        </Badge>
                                        <Badge variant="secondary">{task.category}</Badge>
                                    </div>
                                </div>
                                {task.dueDate && (
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Due Date</p>
                                        <p className="text-sm font-medium text-orange-600">
                                            {formatDate(task.dueDate, 'PPP')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="details">Update Status</TabsTrigger>
                            <TabsTrigger value="log">Log Effort</TabsTrigger>
                        </TabsList>

                        {/* Status Update Tab */}
                        <TabsContent value="details" className="space-y-4 mt-4">
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Target className="w-4 h-4 text-purple-600" />
                                        <h3 className="font-medium">Move Task to Column</h3>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        {/* Current Status */}
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Current Status</Label>
                                            <div className="mt-1">
                                                <Badge className={statusColumns.find(s => s.value === originalStatus)?.color}>
                                                    {statusColumns.find(s => s.value === originalStatus)?.label}
                                                </Badge>
                                            </div>
                                        </div>

                                        <ArrowRight className="w-5 h-5 text-muted-foreground" />

                                        {/* New Status */}
                                        <div className="flex-1">
                                            <Label className="text-xs text-muted-foreground">Move To</Label>
                                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getAvailableStatuses().map(status => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center space-x-2">
                                                                <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-').split(' ')[0]}`} />
                                                                <span>{status.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Warning for To Do -> In Progress */}
                                    {originalStatus === 'TO_DO' && selectedStatus === 'IN_PROGRESS' && (
                                        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">Log Entry Required</p>
                                                <p className="text-xs text-amber-700">
                                                    Please go to the "Log Effort" tab and add a work description before starting this task.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Non-manager notice */}
                                    {!isManager && (
                                        <p className="text-xs text-muted-foreground">
                                            <em>Note: Only managers can move tasks to the "Done" column.</em>
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Log Effort Tab */}
                        <TabsContent value="log" className="space-y-4 mt-4">
                            {/* Date and Time */}
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                        <h3 className="font-medium">Date & Time</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Date */}
                                        <div className="space-y-2">
                                            <Label>Work Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {formatDate(logFormData.date, "PPP")}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 z-[100]">
                                                    <Calendar
                                                        mode="single"
                                                        selected={logFormData.date}
                                                        onSelect={(date) => date && setLogFormData(prev => ({ ...prev, date }))}
                                                        disabled={(date) => date > new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Time Spent */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center space-x-1">
                                                <span>Time Spent</span>
                                                {originalStatus === 'TO_DO' && selectedStatus === 'IN_PROGRESS' && (
                                                    <span className="text-red-500">*</span>
                                                )}
                                            </Label>
                                            <div className="flex space-x-2">
                                                <Select
                                                    value={logFormData.hours.toString()}
                                                    onValueChange={(value) => setLogFormData(prev => ({ ...prev, hours: parseInt(value) }))}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Array.from({ length: 25 }, (_, i) => (
                                                            <SelectItem key={i} value={i.toString()}>
                                                                {i}h
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>

                                                <Select
                                                    value={logFormData.minutes.toString()}
                                                    onValueChange={(value) => setLogFormData(prev => ({ ...prev, minutes: parseInt(value) }))}
                                                >
                                                    <SelectTrigger className="flex-1">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[0, 15, 30, 45].map(minutes => (
                                                            <SelectItem key={minutes} value={minutes.toString()}>
                                                                {minutes}m
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {errors.time && <p className="text-sm text-red-600">{errors.time}</p>}
                                            <p className="text-xs text-muted-foreground">
                                                Total: {formatTimePreview()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Category and Description */}
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <Timer className="w-4 h-4 text-orange-600" />
                                        <h3 className="font-medium">Work Details</h3>
                                    </div>

                                    {/* Category */}
                                    <div className="space-y-2">
                                        <Label>Work Category</Label>
                                        <Select
                                            value={logFormData.category}
                                            onValueChange={(value) => setLogFormData(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {workCategories.map(category => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        <div className="flex items-center space-x-2">
                                                            <span>{category.icon}</span>
                                                            <span>{category.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center space-x-1">
                                            <span>Work Description</span>
                                            {originalStatus === 'TO_DO' && selectedStatus === 'IN_PROGRESS' && (
                                                <span className="text-red-500">*</span>
                                            )}
                                        </Label>
                                        <Textarea
                                            placeholder="Describe the work completed, issues resolved, or progress made..."
                                            value={logFormData.description}
                                            onChange={(e) => setLogFormData(prev => ({ ...prev, description: e.target.value }))}
                                            className={`min-h-[100px] ${errors.description ? 'border-red-300' : ''}`}
                                        />
                                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <Separator />

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TaskLogDialog;
