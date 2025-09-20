import React, { useState, useEffect } from 'react';
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
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Clock, Target, User, DollarSign, Timer, Plus } from 'lucide-react';

// Simple date formatter
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

interface Task {
  id: string;
  title: string;
  storyId?: string;
  assignee: string;
}

interface Story {
  id: string;
  title: string;
}

interface EffortEntry {
  id: string;
  date: string;
  timeSpent: number; // in minutes
  resource: string;
  category: string;
  description?: string;
  billable: boolean;
}

interface EffortLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogEffort: (effort: Omit<EffortEntry, 'id'>) => void;
  task?: Task | null;
  story?: Story | null;
  availableTasks?: Task[];
  availableStories?: Story[];
}

const EffortLogDialog: React.FC<EffortLogDialogProps> = ({ 
  open, 
  onOpenChange, 
  onLogEffort,
  task = null,
  story = null,
  availableTasks = [],
  availableStories = []
}) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    hours: 0,
    minutes: 30,
    resource: task?.assignee || '',
    category: 'development',
    description: '',
    billable: true,
    selectedTaskId: task?.id || '',
    selectedStoryId: story?.id || ''
  });

  // Auto-select team member based on the incoming task's assignee
  useEffect(() => {
    if (task?.assignee) {
      setFormData(prev => ({ ...prev, resource: task.assignee }));
    }
  }, [task]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Work categories
  const workCategories = [
    { value: 'development', label: 'Development', icon: '💻', color: 'text-blue-600' },
    { value: 'design', label: 'Design', icon: '🎨', color: 'text-purple-600' },
    { value: 'testing', label: 'Testing', icon: '🧪', color: 'text-green-600' },
    { value: 'documentation', label: 'Documentation', icon: '📝', color: 'text-yellow-600' },
    { value: 'meeting', label: 'Meeting', icon: '👥', color: 'text-orange-600' },
    { value: 'research', label: 'Research', icon: '🔍', color: 'text-cyan-600' },
    { value: 'review', label: 'Code Review', icon: '👁️', color: 'text-indigo-600' },
    { value: 'deployment', label: 'Deployment', icon: '🚀', color: 'text-red-600' }
  ];

  // Team members list
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
    
    if (!formData.resource) {
      newErrors.resource = 'Please select a team member';
    }

    const totalMinutes = formData.hours * 60 + formData.minutes;
    if (totalMinutes <= 0) {
      newErrors.time = 'Time must be greater than 0 minutes';
    }

    if (totalMinutes > 24 * 60) {
      newErrors.time = 'Time cannot exceed 24 hours';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description of the work done';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const totalMinutes = formData.hours * 60 + formData.minutes;
    
    const newEffort: Omit<EffortEntry, 'id'> = {
      date: format(formData.date, 'dd/MM/yy'),
      timeSpent: totalMinutes,
      resource: formData.resource,
      category: formData.category,
      description: formData.description.trim(),
      billable: formData.billable
    };

    onLogEffort(newEffort);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setFormData({
      date: new Date(),
      hours: 0,
      minutes: 30,
      resource: task?.assignee || '',
      category: 'development',
      description: '',
      billable: true,
      selectedTaskId: task?.id || '',
      selectedStoryId: story?.id || ''
    });
    setErrors({});
  };

  const formatTimePreview = () => {
    const totalMinutes = formData.hours * 60 + formData.minutes;
    if (totalMinutes === 0) return '0 minutes';
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${minutes}m`;
  };

  const selectedCategory = workCategories.find(cat => cat.value === formData.category);
  const selectedTask = availableTasks.find(t => t.id === formData.selectedTaskId);
  const selectedStory = availableStories.find(s => s.id === formData.selectedStoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span>Log Work Effort</span>
          </DialogTitle>
          <DialogDescription>
            Record time spent on work activities for accurate project tracking and billing.
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-hidden px-6 relative">
          {/* Scroll indicator gradients */}
          <div className="absolute top-0 left-6 right-6 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-6 right-6 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
          
          <div 
            className="h-full overflow-y-auto overflow-x-hidden pr-2 scroll-smooth custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6',
              WebkitOverflowScrolling: 'touch',
              maxHeight: 'calc(90vh - 200px)' // Ensure it doesn't exceed viewport
            }}
          >
            <div className="space-y-6 py-6 pb-6">
              
              {/* Context Information */}
              {(task || story) && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-4 h-4 text-green-600" />
                      <h3 className="font-medium">Work Context</h3>
                    </div>
                    
                    {task && (
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200 mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-blue-100">
                            {task.id}
                          </Badge>
                          <span className="text-sm font-medium text-blue-900">{task.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-700">{task.assignee}</span>
                        </div>
                      </div>
                    )}
                    
                    {story && (
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-200">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs bg-green-100">
                            {story.id}
                          </Badge>
                          <span className="text-sm font-medium text-green-900">{story.title}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
                      <Label className="flex items-center justify-between">
                        <span>Work Date</span>
                        <span className="text-xs text-muted-foreground">No future dates</span>
                      </Label>

                      {/* Combined: Quick actions + calendar + native input */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                                title="Pick a date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(formData.date, "PPP")}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData.date}
                                onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>

                          {/* Quick set: Today / Yesterday */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50"
                              onClick={() => setFormData(prev => ({ ...prev, date: new Date() }))}
                              title="Set to today"
                            >
                              Today
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50"
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() - 1);
                                setFormData(prev => ({ ...prev, date: d }));
                              }}
                              title="Set to yesterday"
                            >
                              Yesterday
                            </Button>
                          </div>
                        </div>

                        {/* Native date for fast typing / accessibility */}
                        <Input
                          type="date"
                          max={new Date().toISOString().split('T')[0]}
                          value={new Date(formData.date.getTime() - (formData.date.getTimezoneOffset() * 60000)).toISOString().split('T')[0]}
                          onChange={(e) => {
                            const parts = e.target.value.split('-');
                            if (parts.length === 3) {
                              const year = parseInt(parts[0]);
                              const month = parseInt(parts[1]) - 1;
                              const day = parseInt(parts[2]);
                              const d = new Date(year, month, day);
                              if (!isNaN(d.getTime())) {
                                setFormData(prev => ({ ...prev, date: d }));
                              }
                            }
                          }}
                        />
                        <p className="text-xs text-muted-foreground">Selected: {format(formData.date, 'PPP')}</p>
                      </div>
                    </div>

                    {/* Time Spent */}
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-1">
                        <span>Time Spent</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex space-x-2">
                        <Select 
                          value={formData.hours.toString()} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, hours: parseInt(value) }))}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({length: 25}, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i}h
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={formData.minutes.toString()} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, minutes: parseInt(value) }))}
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

              {/* Resource and Category */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium">Resource & Category</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Resource */}
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-1">
                        <span>Team Member</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Select 
                        value={formData.resource} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, resource: value }))}
                      >
                        <SelectTrigger className={errors.resource ? 'border-red-300' : ''}>
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
                      {errors.resource && <p className="text-sm text-red-600">{errors.resource}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>Work Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {workCategories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span className={category.color}>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Timer className="w-4 h-4 text-orange-600" />
                    <h3 className="font-medium">Work Description</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-1">
                      <span>What was accomplished?</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="Describe the work completed, issues resolved, or progress made..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`min-h-[100px] ${errors.description ? 'border-red-300' : ''}`}
                    />
                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Billing */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium">Billing Information</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Billable Hours</Label>
                      <p className="text-sm text-muted-foreground">
                        Mark this work as billable to client
                      </p>
                    </div>
                    <Switch
                      checked={formData.billable}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium">Effort Summary</h3>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-medium">{format(formData.date, 'PPP')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Time Spent</p>
                        <p className="font-medium">{formatTimePreview()}</p>
                      </div>
                    </div>
                    
                    {formData.resource && (
                      <div className="mb-3">
                        <p className="text-xs text-muted-foreground">Team Member</p>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                              {getInitials(formData.resource)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{formData.resource}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {selectedCategory && (
                        <div className="flex items-center space-x-2">
                          <span>{selectedCategory.icon}</span>
                          <span className={`text-sm ${selectedCategory.color}`}>{selectedCategory.label}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className={`w-4 h-4 ${formData.billable ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm ${formData.billable ? 'text-green-600' : 'text-gray-500'}`}>
                          {formData.billable ? 'Billable' : 'Non-billable'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 pb-6">
          <Separator />
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" />
              Log Effort
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EffortLogDialog;