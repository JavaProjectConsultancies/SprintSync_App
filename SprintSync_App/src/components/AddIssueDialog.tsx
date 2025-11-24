import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, CheckSquare, User, Flag, Target, Clock, Plus, X, Paperclip, Trash2, Loader2, AlertCircle, Link, Eye, FileText } from 'lucide-react';

// Simple date formatter to replace date-fns
const format = (date: Date, formatStr: string) => {
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

interface Story {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'stories' | 'todo' | 'inprogress' | 'qa' | 'done';
  assignee?: string;
  projectId?: string; // For deriving projectId from story
}

interface Issue {
  id: string;
  title: string;
  storyId?: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  avatar?: string;
  dueDate: string;
  status: 'todo' | 'inprogress' | 'qa' | 'done';
  progress?: number;
  description?: string;
  estimatedHours?: number;
  subtasks?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

interface AddIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: Omit<Issue, 'id'>) => void | Promise<void>;
  stories?: Story[];
  defaultStatus?: string;
  defaultStoryId?: string;
  requiredStoryId?: string;
  users?: User[];
  projectId?: string; // REQUIRED for filtering assignees by project
  sprintStartDate?: string; // Sprint start date for date restrictions
  sprintEndDate?: string; // Sprint end date for date restrictions
}

const AddIssueDialog: React.FC<AddIssueDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  stories = [],
  defaultStatus = 'todo',
  defaultStoryId,
  requiredStoryId,
  users = [],
  projectId,
  sprintStartDate,
  sprintEndDate
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storyId: requiredStoryId || defaultStoryId || 'none',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assignee: '',
    estimatedHours: 4,
    dueDate: undefined as Date | undefined,
    subtasks: [''],
    status: defaultStatus as 'todo' | 'inprogress' | 'qa' | 'done',
    labels: [] as string[]
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<Array<{ url: string; name: string }>>([]);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentUrlName, setAttachmentUrlName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // State to control due date popover
  const [isDueDatePopoverOpen, setIsDueDatePopoverOpen] = useState(false);
  
  // State for project team members
  const [projectTeamMembers, setProjectTeamMembers] = useState<any[]>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);
  
  // Calculate effectiveProjectId - derive from selected story if not provided directly
  const effectiveProjectId = useMemo(() => {
    // First, try the projectId prop
    if (projectId) {
      return projectId;
    }
    // Then, try to get it from the currently selected story
    const selectedStoryId = formData.storyId && formData.storyId !== 'none' ? formData.storyId : defaultStoryId;
    if (selectedStoryId) {
      const story = stories.find(s => s.id === selectedStoryId);
      return story?.projectId;
    }
    return undefined;
  }, [projectId, formData.storyId, defaultStoryId, stories]);
  
  // Fetch team members by project when projectId is provided
  useEffect(() => {
    const fetchProjectTeamMembers = async () => {
      if (!effectiveProjectId) {
        setProjectTeamMembers([]);
        return;
      }

      setLoadingTeamMembers(true);
      try {
        const { teamMemberApi } = await import('../services/api/entities/teamMemberApi');
        const members = await teamMemberApi.getTeamMembersByProject(effectiveProjectId);
        console.log(`[AddIssueDialog] Fetched ${members?.length || 0} team members for project ${effectiveProjectId}`, members);
        setProjectTeamMembers(members || []);
      } catch (error) {
        console.error('Error fetching project team members:', error);
        setProjectTeamMembers([]);
      } finally {
        setLoadingTeamMembers(false);
      }
    };

    fetchProjectTeamMembers();
  }, [effectiveProjectId]);

  // Use project team members if projectId is provided, otherwise use provided users or fall back to mock data
  const teamMembers = useMemo(() => {
    // If effectiveProjectId is provided, ALWAYS use project team members (ignore users prop)
    if (effectiveProjectId) {
      console.log(`[AddIssueDialog] effectiveProjectId provided: ${effectiveProjectId}, loadingTeamMembers: ${loadingTeamMembers}, projectTeamMembers.length: ${projectTeamMembers.length}`);
      
      // If still loading, return empty array to prevent showing all users
      if (loadingTeamMembers) {
        console.log('[AddIssueDialog] Still loading team members, returning empty array');
        return [];
      }
      
      // Return project team members (even if empty array - this is correct behavior for filtering)
      // This ensures we NEVER show all users when a project is available
      const mappedMembers = projectTeamMembers.map(member => {
        const displayName = member.name ||
                           (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : '') ||
                           member.email?.split('@')[0].replace(/\./g, ' ') ||
                           'Unknown User';
        
        return {
          id: member.userId || member.id,
          name: displayName,
          avatar: '',
          role: member.role || 'Team Member'
        };
      });
      
      console.log(`[AddIssueDialog] Returning ${mappedMembers.length} filtered team members for project ${effectiveProjectId}`);
      return mappedMembers;
    }
    
    // Only use provided users if NO projectId is available (no project context)
    console.log(`[AddIssueDialog] No effectiveProjectId, using ${users.length} users from props or fallback`);
    
    if (users.length > 0) {
      const mappedUsers = users.map(user => {
        const displayName = user.name ||
                           (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '') ||
                           user.email?.split('@')[0].replace(/\./g, ' ') ||
                           'Unknown User';
        
        return {
          id: user.id,
          name: displayName,
          avatar: '',
          role: user.role || 'Team Member'
        };
      });
      
      console.log(`[AddIssueDialog] Returning ${mappedUsers.length} users from props`);
      return mappedUsers;
    }
    
    // Fall back to mock data only if no users provided
    console.log('[AddIssueDialog] No users provided, using mock data');
    return [
      { id: '1', name: 'Arjun Patel', avatar: '', role: 'Senior Developer' },
      { id: '2', name: 'Priya Sharma', avatar: '', role: 'UI/UX Designer' },
      { id: '3', name: 'Sneha Reddy', avatar: '', role: 'QA Engineer' },
      { id: '4', name: 'Rahul Kumar', avatar: '', role: 'DevOps Engineer' },
      { id: '5', name: 'Vikram Singh', avatar: '', role: 'Full Stack Developer' },
      { id: '6', name: 'Ananya Gupta', avatar: '', role: 'Product Manager' }
    ];
  }, [effectiveProjectId, projectTeamMembers, users, loadingTeamMembers]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Issue description is required';
    }

    // Validate storyId is required
    if (!formData.storyId || formData.storyId === 'none') {
      newErrors.storyId = 'Issue must be linked to a story. Please select a story.';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Please assign someone to this issue';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.estimatedHours < 0.5 || formData.estimatedHours > 40) {
      newErrors.estimatedHours = 'Estimated hours must be between 0.5 and 40';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const validSubtasks = formData.subtasks.filter(subtask => subtask.trim());
    
    const newIssue: Omit<Issue, 'id'> & { attachments?: File[]; attachmentUrls?: Array<{ url: string; name: string }> } = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      storyId: formData.storyId === 'none' ? undefined : formData.storyId || undefined,
      priority: formData.priority,
      assignee: formData.assignee,
      status: formData.status,
      dueDate: formData.dueDate ? format(formData.dueDate, 'dd/MM/yy') : '',
      estimatedHours: formData.estimatedHours,
      subtasks: validSubtasks,
      progress: 0,
      attachments: attachments.length > 0 ? attachments : undefined,
      attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined
    };

    await onSubmit(newIssue);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      storyId: requiredStoryId || defaultStoryId || 'none',
      priority: 'medium',
      assignee: '',
      estimatedHours: 4,
      dueDate: undefined,
      subtasks: [''],
      status: defaultStatus as 'todo' | 'inprogress' | 'qa' | 'done',
      labels: []
    });
    setErrors({});
    setAttachments([]);
    setAttachmentUrls([]);
    setAttachmentUrl('');
    setAttachmentUrlName('');
    setIsDueDatePopoverOpen(false);
  };

  // File upload handler
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setAttachments(prev => [...prev, ...fileArray]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // URL handlers
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    if (!attachmentUrl.trim()) {
      return;
    }

    if (!isValidUrl(attachmentUrl.trim())) {
      setErrors(prev => ({ ...prev, attachmentUrl: 'Please enter a valid URL (must start with http:// or https://)' }));
      return;
    }

    setAttachmentUrls(prev => [...prev, { url: attachmentUrl.trim(), name: attachmentUrlName.trim() || attachmentUrl.trim() }]);
    setAttachmentUrl('');
    setAttachmentUrlName('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.attachmentUrl;
      return newErrors;
    });
  };

  const handleRemoveUrl = (index: number) => {
    setAttachmentUrls(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const addSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, '']
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const updateSubtask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) => 
        i === index ? value : subtask
      )
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHoursColor = (hours: number) => {
    if (hours <= 4) return 'text-green-600';
    if (hours <= 16) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Safe story lookup with null check
  const selectedStory = formData.storyId !== 'none' && stories 
    ? stories.find(story => story.id === formData.storyId) 
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inprogress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'qa': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'done': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'To Do';
      case 'inprogress': return 'In Progress';
      case 'qa': return 'QA/Review';
      case 'done': return 'Done';
      default: return status;
    }
  };

  // Update formData when requiredStoryId or defaultStoryId changes
  useEffect(() => {
    const storyIdToUse = requiredStoryId || defaultStoryId;
    if (storyIdToUse && (formData.storyId === 'none' || !formData.storyId)) {
      setFormData(prev => ({ ...prev, storyId: storyIdToUse }));
    }
  }, [requiredStoryId, defaultStoryId, isOpen]);

  return (
    <>
      <style>{`
        .add-issue-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .add-issue-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .add-issue-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .add-issue-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDueDatePopoverOpen(false);
          onClose();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <span>Create New Issue</span>
          </DialogTitle>
          <DialogDescription>
            Add a new issue to track problems or concerns. Issues can be standalone or linked to user stories.
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Scrollable content area with better height management */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2 add-issue-scroll" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            maxHeight: 'calc(95vh - 200px)'
          }}>
            <div className="space-y-6 py-2 pb-6">
            {/* Basic Information */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Issue Details</h3>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-1">
                    <span>Issue Title</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive issue title..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={errors.title ? 'border-red-300' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center space-x-1">
                    <span>Description</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the issue..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`min-h-[100px] ${errors.description ? 'border-red-300' : ''}`}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Status Selection - Show which column this issue will be added to */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Issue Status</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Issue will be added to</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <Badge variant="outline" className={`text-sm px-3 py-1 ${getStatusColor(formData.status)}`}>
                      {getStatusLabel(formData.status)} Column
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      This issue will be created in the "{getStatusLabel(formData.status)}" column.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Story Association - Only show if stories are available */}
            {stories && stories.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium">Story Association</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storyId" className="flex items-center space-x-1">
                      <span>Link to User Story</span>
                      <span className="text-red-500">*</span>
                      {requiredStoryId && <span className="text-xs text-gray-500">(Required)</span>}
                    </Label>
                    <Select 
                      value={formData.storyId} 
                      onValueChange={(value) => {
                        if (requiredStoryId && value === 'none') {
                          return; // Prevent deselecting required story
                        }
                        setFormData(prev => ({ ...prev, storyId: value }));
                      }}
                      disabled={!!requiredStoryId}
                    >
                      <SelectTrigger className={errors.storyId ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select a user story...">
                          {formData.storyId && formData.storyId !== 'none' && (() => {
                            const selected = stories.find(s => s.id === formData.storyId);
                            return selected ? selected.title : 'Select a user story...';
                          })()}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {!requiredStoryId && <SelectItem value="none">No story (Standalone issue)</SelectItem>}
                        {stories.map(story => (
                          <SelectItem key={story.id} value={story.id}>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs bg-green-50">
                                {story.id}
                              </Badge>
                              <span className="truncate max-w-[200px]">{story.title}</span>
                              <Badge variant="outline" className={`text-xs ${getPriorityColor(story.priority)}`}>
                                {story.priority}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.storyId && <p className="text-sm text-red-600">{errors.storyId}</p>}
                    {requiredStoryId && (
                      <p className="text-xs text-gray-500">
                        This issue must be linked to the selected story. The story cannot be changed.
                      </p>
                    )}
                    
                    {selectedStory && (
                      <div className="mt-2 p-2 bg-green-50 rounded border-l-3 border-green-200">
                        <div className="flex items-center space-x-2">
                          <Target className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700 font-medium">{selectedStory.id}</span>
                          <span className="text-xs text-green-600">•</span>
                          <span className="text-xs text-green-600">{selectedStory.title}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Issue Configuration */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Flag className="w-4 h-4 text-purple-600" />
                  <h3 className="font-medium">Configuration</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: 'high' | 'medium' | 'low') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4 text-red-600" />
                            <span>High Priority</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4 text-yellow-600" />
                            <span>Medium Priority</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4 text-green-600" />
                            <span>Low Priority</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estimated Hours */}
                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Select 
                      value={formData.estimatedHours.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0.5, 1, 2, 4, 8, 16, 24, 40].map(hours => (
                          <SelectItem key={hours} value={hours.toString()}>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className={`font-medium ${getHoursColor(hours)}`}>{hours}h</span>
                              <span className="text-muted-foreground">
                                {hours <= 4 && '(Quick)'}
                                {hours > 4 && hours <= 16 && '(Standard)'}
                                {hours > 16 && '(Complex)'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.estimatedHours && <p className="text-sm text-red-600">{errors.estimatedHours}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment and Due Date */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Assignment & Timeline</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Assignee */}
                  <div className="space-y-2">
                    <Label htmlFor="assignee" className="flex items-center space-x-1">
                      <span>Assign to</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.assignee} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                    >
                      <SelectTrigger className={errors.assignee ? 'border-red-300' : ''}>
                        <SelectValue placeholder="Select team member...">
                          {formData.assignee && teamMembers.find(m => m.id === formData.assignee)?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTeamMembers && effectiveProjectId ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">Loading team members...</span>
                          </div>
                        ) : teamMembers.length === 0 && effectiveProjectId ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No team members found for this project
                          </div>
                        ) : (
                          teamMembers.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-xs text-muted-foreground">{member.role}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.assignee && <p className="text-sm text-red-600">{errors.assignee}</p>}
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <span>Due Date</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={isDueDatePopoverOpen} onOpenChange={setIsDueDatePopoverOpen} modal={false}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !formData.dueDate && "text-muted-foreground"
                          } ${errors.dueDate ? 'border-red-300' : ''}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 !z-[9999]" align="start" side="bottom" sideOffset={5} style={{ zIndex: 9999 }}>
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) => {
                            setFormData(prev => ({ ...prev, dueDate: date }));
                            setIsDueDatePopoverOpen(false);
                            // Clear error when date is selected
                            if (date) {
                              setErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.dueDate;
                                return newErrors;
                              });
                            }
                          }}
                          disabled={(date) => {
                            const dateOnly = new Date(date);
                            dateOnly.setHours(0, 0, 0, 0);
                            
                            // Check sprint date restrictions
                            if (sprintStartDate && sprintEndDate) {
                              const startDate = new Date(sprintStartDate);
                              startDate.setHours(0, 0, 0, 0);
                              const endDate = new Date(sprintEndDate);
                              endDate.setHours(0, 0, 0, 0);
                              
                              // Disable dates outside sprint range
                              if (dateOnly < startDate || dateOnly > endDate) {
                                return true;
                              }
                            }
                            return false;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.dueDate && <p className="text-sm text-red-600">{errors.dueDate}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium">Subtasks (Optional)</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubtask}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Subtask</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          placeholder={`Subtask ${index + 1}...`}
                          value={subtask}
                          onChange={(e) => updateSubtask(index, e.target.value)}
                        />
                      </div>
                      {formData.subtasks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubtask(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Labels */}
            {formData.labels.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Flag className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium">Labels</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.labels.map((label, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Attachments (Optional)</h3>
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload-issue">Upload File</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        handleFileSelect(files);
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files.length > 0) {
                          handleFileSelect(target.files);
                        }
                      };
                      input.click();
                    }}
                  >
                    <div className="text-center">
                      <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Drop files here or click to browse</p>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                {/* URL Input Section */}
                <div className="space-y-2">
                  <Label htmlFor="url-input-issue">Add URL/Link</Label>
                  <div className="space-y-2">
                    <Input
                      id="url-input-issue"
                      type="url"
                      placeholder="https://example.com/document.pdf"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Input
                      id="url-name-input-issue"
                      type="text"
                      placeholder="Link name (optional)"
                      value={attachmentUrlName}
                      onChange={(e) => setAttachmentUrlName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddUrl}
                      disabled={!attachmentUrl.trim()}
                      className="w-full"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                  {errors.attachmentUrl && <p className="text-sm text-red-600">{errors.attachmentUrl}</p>}
                </div>

                {/* Files List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Files</Label>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAttachment(index);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URLs List */}
                {attachmentUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label>Links</Label>
                    {attachmentUrls.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-green-200 rounded-lg hover:bg-green-50 bg-green-50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                            <Link className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 break-all line-clamp-1">{item.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(item.url, '_blank')}
                            title="Open link"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveUrl(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Issue Preview</h3>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-600">ISS-NEW</span>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(formData.priority)}`}>
                        {formData.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  {selectedStory && (
                    <div className="mb-2 p-2 bg-green-50 rounded border-l-3 border-green-200">
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-700 font-medium">{selectedStory.id}</span>
                        <span className="text-xs text-green-600">•</span>
                        <span className="text-xs text-green-600 truncate">{selectedStory.title}</span>
                      </div>
                    </div>
                  )}
                  
                  <h4 className="font-medium mb-2">
                    {formData.title || 'Issue title will appear here...'}
                  </h4>
                  
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {formData.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {formData.assignee && (() => {
                      const selectedMember = teamMembers.find(m => m.id === formData.assignee);
                      const displayName = selectedMember ? selectedMember.name : formData.assignee;
                      return (
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{displayName.split(' ')[0]}</span>
                        </div>
                      );
                    })()}
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formData.estimatedHours}h</span>
                      {formData.dueDate && (
                        <>
                          <span>•</span>
                          <CalendarIcon className="w-3 h-3" />
                          <span>{format(formData.dueDate, 'dd/MM/yy')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Separator />
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90 text-white">
              Create Issue
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AddIssueDialog;

