import React, { useState } from 'react';
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
import { CalendarIcon, CheckSquare, User, Flag, Target, Clock, Plus, X, FileText, Database, Code, Palette, Bug, Search } from 'lucide-react';
import { taskTemplates, TaskTemplate, getTemplatesByType } from '../data/taskTemplates';

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
}

interface Task {
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

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  stories?: Story[];
  defaultStatus?: string;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  stories = [],
  defaultStatus = 'todo'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storyId: 'none',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assignee: '',
    estimatedHours: 4,
    dueDate: undefined as Date | undefined,
    subtasks: [''],
    status: defaultStatus as 'todo' | 'inprogress' | 'qa' | 'done',
    templateId: 'none',
    labels: [] as string[]
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Team members list (in real app, this would come from props or context)
  const teamMembers = [
    { name: 'Arjun Patel', avatar: '', role: 'Senior Developer' },
    { name: 'Priya Sharma', avatar: '', role: 'UI/UX Designer' },
    { name: 'Sneha Reddy', avatar: '', role: 'QA Engineer' },
    { name: 'Rahul Kumar', avatar: '', role: 'DevOps Engineer' },
    { name: 'Vikram Singh', avatar: '', role: 'Full Stack Developer' },
    { name: 'Ananya Gupta', avatar: '', role: 'Product Manager' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Please assign someone to this task';
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

  const handleSubmit = () => {
    if (!validateForm()) return;

    const validSubtasks = formData.subtasks.filter(subtask => subtask.trim());
    
    const newTask: Omit<Task, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      storyId: formData.storyId === 'none' ? undefined : formData.storyId || undefined,
      priority: formData.priority,
      assignee: formData.assignee,
      status: formData.status,
      dueDate: formData.dueDate ? format(formData.dueDate, 'dd/MM/yy') : '',
      estimatedHours: formData.estimatedHours,
      subtasks: validSubtasks,
      progress: 0
    };

    onSubmit(newTask);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      storyId: 'none',
      priority: 'medium',
      assignee: '',
      estimatedHours: 4,
      dueDate: undefined,
      subtasks: [''],
      status: defaultStatus as 'todo' | 'inprogress' | 'qa' | 'done',
      templateId: 'none',
      labels: []
    });
    setErrors({});
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

  // Template selection handlers
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') {
      setFormData(prev => ({
        ...prev,
        templateId: 'none',
        labels: []
      }));
      return;
    }

    const template = taskTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId: template.id,
        title: template.title,
        description: template.description,
        estimatedHours: template.estimatedHours,
        priority: template.priority,
        subtasks: template.subtasks,
        labels: template.labels
      }));
    }
  };

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'db': return <Database className="w-4 h-4" />;
      case 'api': return <Code className="w-4 h-4" />;
      case 'ui': return <Palette className="w-4 h-4" />;
      case 'qa': return <Bug className="w-4 h-4" />;
      case 'devops': return <FileText className="w-4 h-4" />;
      case 'research': return <Search className="w-4 h-4" />;
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'db': return 'bg-blue-100 text-blue-800';
      case 'api': return 'bg-green-100 text-green-800';
      case 'ui': return 'bg-purple-100 text-purple-800';
      case 'qa': return 'bg-red-100 text-red-800';
      case 'devops': return 'bg-orange-100 text-orange-800';
      case 'research': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <style>{`
        .add-task-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .add-task-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .add-task-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .add-task-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span>Create New Task</span>
          </DialogTitle>
          <DialogDescription>
            Add a new task to break down story work into manageable pieces. Tasks can be standalone or linked to user stories.
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Scrollable content area with better height management */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2 add-task-scroll" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            maxHeight: 'calc(95vh - 200px)'
          }}>
            <div className="space-y-6 py-2 pb-6">
            {/* Template Selection */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-medium">Task Template</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Choose a template (optional)</Label>
                  <Select 
                    value={formData.templateId} 
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No template (Custom task)</SelectItem>
                      <SelectItem value="db-schema-design">
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-blue-600" />
                          <span>Database Schema Design</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">DB</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="api-endpoint">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-green-600" />
                          <span>REST API Endpoint</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">API</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="ui-component">
                        <div className="flex items-center space-x-2">
                          <Palette className="w-4 h-4 text-purple-600" />
                          <span>React Component Development</span>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">UI</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="qa-test-plan">
                        <div className="flex items-center space-x-2">
                          <Bug className="w-4 h-4 text-red-600" />
                          <span>Test Plan Creation</span>
                          <Badge variant="outline" className="bg-red-100 text-red-800">QA</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="devops-deployment">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-orange-600" />
                          <span>Deployment Pipeline</span>
                          <Badge variant="outline" className="bg-orange-100 text-orange-800">DevOps</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Task Details</h3>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-1">
                    <span>Task Title</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter a descriptive task title..."
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
                    placeholder="Provide detailed description of what needs to be done..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`min-h-[100px] ${errors.description ? 'border-red-300' : ''}`}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Status Selection - Show which column this task will be added to */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Task Status</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Task will be added to</Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <Badge variant="outline" className={`text-sm px-3 py-1 ${getStatusColor(formData.status)}`}>
                      {getStatusLabel(formData.status)} Column
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      This task will be created in the "{getStatusLabel(formData.status)}" column.
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
                    <Label htmlFor="storyId">Link to User Story (Optional)</Label>
                    <Select 
                      value={formData.storyId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, storyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user story..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No story (Standalone task)</SelectItem>
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

            {/* Task Configuration */}
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
                        <SelectValue placeholder="Select team member..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map(member => (
                          <SelectItem key={member.name} value={member.name}>
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
                        ))}
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
                    <Popover>
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
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
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

            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Task Preview</h3>
                </div>
                
                <div className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-blue-600">TSK-NEW</span>
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
                    {formData.title || 'Task title will appear here...'}
                  </h4>
                  
                  {formData.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {formData.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {formData.assignee && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                            {getInitials(formData.assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{formData.assignee.split(' ')[0]}</span>
                      </div>
                    )}
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
            <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90">
              Create Task
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default AddTaskDialog;