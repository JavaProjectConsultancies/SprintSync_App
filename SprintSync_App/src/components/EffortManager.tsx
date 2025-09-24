import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  Clock, 
  History, 
  Target, 
  User, 
  DollarSign, 
  Timer, 
  Plus,
  CalendarIcon,
  Filter,
  Download,
  BarChart3,
  CheckSquare,
  TrendingUp,
  Search
} from 'lucide-react';

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

interface EffortEntry {
  id: string;
  date: string;
  timeSpent: number; // in minutes
  resource: string;
  category: string;
  description?: string;
  billable: boolean;
}

interface Task {
  id: string;
  title: string;
  storyId?: string;
  assignee: string;
  efforts: EffortEntry[];
  totalEffort?: number;
}

interface Story {
  id: string;
  title: string;
  assignee?: string;
}

interface EffortManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogEffort: (effort: Omit<EffortEntry, 'id'>) => void;
  task?: Task | null;
  story?: Story | null;
  allTasks?: Task[];
  allStories?: Story[];
}

const EffortManager: React.FC<EffortManagerProps> = ({ 
  open, 
  onOpenChange, 
  onLogEffort,
  task = null,
  story = null,
  allTasks = [],
  allStories = []
}) => {
  const [activeTab, setActiveTab] = useState('log');
  
  // Log Effort State
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // History View State
  const [historyTab, setHistoryTab] = useState('task');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Auto-select team member based on the incoming task's assignee
  useEffect(() => {
    if (task?.assignee) {
      setFormData(prev => ({ ...prev, resource: task.assignee }));
    }
  }, [task]);

  // Helper function to format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

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

  // Get category color and icon
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { icon: string; color: string } } = {
      development: { icon: '💻', color: 'text-blue-600 bg-blue-50' },
      design: { icon: '🎨', color: 'text-purple-600 bg-purple-50' },
      testing: { icon: '🧪', color: 'text-green-600 bg-green-50' },
      documentation: { icon: '📝', color: 'text-yellow-600 bg-yellow-50' },
      meeting: { icon: '👥', color: 'text-orange-600 bg-orange-50' },
      research: { icon: '🔍', color: 'text-cyan-600 bg-cyan-50' },
      review: { icon: '👁️', color: 'text-indigo-600 bg-indigo-50' },
      deployment: { icon: '🚀', color: 'text-red-600 bg-red-50' }
    };
    return categories[category] || { icon: '⚡', color: 'text-gray-600 bg-gray-50' };
  };

  // Form validation
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
    // Switch to history tab to show the newly logged effort
    setActiveTab('history');
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

  // Filter efforts based on current filters
  const filterEfforts = (efforts: EffortEntry[]) => {
    return efforts.filter(effort => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!effort.description?.toLowerCase().includes(searchLower) &&
            !effort.resource.toLowerCase().includes(searchLower) &&
            !effort.category.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filterBy !== 'all' && effort.category !== filterBy) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const effortDate = new Date(effort.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - effortDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'week' && diffDays > 7) return false;
        if (dateFilter === 'month' && diffDays > 30) return false;
      }

      return true;
    });
  };

  // Get all efforts for different views
  const getTaskEfforts = () => {
    if (!task) return [];
    return filterEfforts(task.efforts || []);
  };

  const getStoryEfforts = () => {
    if (!story) return [];
    const storyTasks = allTasks.filter(t => t.storyId === story.id);
    const allEfforts = storyTasks.flatMap(t => (t.efforts || []).map(e => ({ ...e, taskId: t.id, taskTitle: t.title })));
    return filterEfforts(allEfforts);
  };

  const getAllProjectEfforts = () => {
    const allEfforts = allTasks.flatMap(t => 
      (t.efforts || []).map(e => ({ 
        ...e, 
        taskId: t.id, 
        taskTitle: t.title,
        storyId: t.storyId || 'No Story'
      }))
    );
    return filterEfforts(allEfforts);
  };

  // Calculate summary statistics
  const calculateSummary = (efforts: EffortEntry[]) => {
    const totalTime = efforts.reduce((sum, effort) => sum + effort.timeSpent, 0);
    const billableTime = efforts.filter(e => e.billable).reduce((sum, effort) => sum + effort.timeSpent, 0);
    const categories = [...new Set(efforts.map(e => e.category))];
    const resources = [...new Set(efforts.map(e => e.resource))];
    
    return {
      totalTime,
      billableTime,
      nonBillableTime: totalTime - billableTime,
      entriesCount: efforts.length,
      categoriesCount: categories.length,
      resourcesCount: resources.length,
      categories,
      resources
    };
  };

  const currentEfforts = historyTab === 'task' ? getTaskEfforts() : 
                       historyTab === 'story' ? getStoryEfforts() : 
                       getAllProjectEfforts();

  const summary = calculateSummary(currentEfforts);
  const selectedCategory = workCategories.find(cat => cat.value === formData.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span>Effort Management</span>
          </DialogTitle>
          <DialogDescription>
            Log work effort and view detailed time tracking history with analytics.
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-6 py-2 pb-6">
              
              {/* Context Information */}
              {(task || story) && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-4 h-4 text-green-600" />
                      <h3 className="font-medium">Context</h3>
                    </div>
                    
                    {task && (
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200 mb-2">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-blue-600" />
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
                          <Target className="w-4 h-4 text-green-600" />
                          <Badge variant="outline" className="text-xs bg-green-100">
                            {story.id}
                          </Badge>
                          <span className="text-sm font-medium text-green-900">{story.title}</span>
                        </div>
                        {story.assignee && (
                          <div className="flex items-center space-x-2 mt-1">
                            <User className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-700">{story.assignee}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Main Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="log" className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Log Effort</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center space-x-2">
                    <History className="w-4 h-4" />
                    <span>View History</span>
                  </TabsTrigger>
                </TabsList>

                {/* Log Effort Tab */}
                <TabsContent value="log" className="mt-6 space-y-4">
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
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="mt-6 space-y-4">
                  {/* Filters */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center space-x-2">
                        <Filter className="w-4 h-4" />
                        <span>Filters & Search</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="space-y-1">
                          <Label className="text-xs">Search</Label>
                          <div className="relative">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search descriptions..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-7 h-8 text-xs"
                            />
                          </div>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-1">
                          <Label className="text-xs">Category</Label>
                          <Select value={filterBy} onValueChange={setFilterBy}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Categories</SelectItem>
                              <SelectItem value="development">Development</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                              <SelectItem value="testing">Testing</SelectItem>
                              <SelectItem value="documentation">Documentation</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="research">Research</SelectItem>
                              <SelectItem value="review">Code Review</SelectItem>
                              <SelectItem value="deployment">Deployment</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-1">
                          <Label className="text-xs">Time Period</Label>
                          <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="week">Last Week</SelectItem>
                              <SelectItem value="month">Last Month</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Export */}
                        <div className="space-y-1">
                          <Label className="text-xs">Export</Label>
                          <Button variant="outline" size="sm" className="h-8 w-full text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            CSV
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* History View Tabs */}
                  <Tabs value={historyTab} onValueChange={setHistoryTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="task" disabled={!task} className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4" />
                        <span>Task History</span>
                      </TabsTrigger>
                      <TabsTrigger value="story" disabled={!story} className="flex items-center space-x-2">
                        <Target className="w-4 h-4" />
                        <span>Story History</span>
                      </TabsTrigger>
                      <TabsTrigger value="project" className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Project Overview</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Summary Statistics */}
                    <Card className="mt-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Summary Statistics</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-6 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Total Time</div>
                            <div className="text-lg font-semibold text-green-600">{formatTime(summary.totalTime)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Billable</div>
                            <div className="text-lg font-semibold text-blue-600">{formatTime(summary.billableTime)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Non-Billable</div>
                            <div className="text-lg font-semibold text-orange-600">{formatTime(summary.nonBillableTime)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Entries</div>
                            <div className="text-lg font-semibold text-purple-600">{summary.entriesCount}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Categories</div>
                            <div className="text-lg font-semibold text-cyan-600">{summary.categoriesCount}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Resources</div>
                            <div className="text-lg font-semibold text-indigo-600">{summary.resourcesCount}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Effort History List */}
                    <TabsContent value={historyTab} className="mt-4 space-y-2">
                      {currentEfforts.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">No Effort History</h3>
                            <p className="text-sm text-muted-foreground">
                              No time entries found for the selected filters. Start logging effort to see history here.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {currentEfforts
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((effort: any) => {
                              const categoryInfo = getCategoryInfo(effort.category);
                              return (
                                <Card key={effort.id} className="hover:shadow-sm transition-shadow">
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${categoryInfo.color}`}>
                                            {categoryInfo.icon}
                                          </div>
                                          <span className="text-sm font-medium capitalize">{effort.category}</span>
                                          <Badge variant={effort.billable ? "default" : "secondary"} className="text-xs">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            {effort.billable ? 'Billable' : 'Non-billable'}
                                          </Badge>
                                          {effort.taskTitle && (
                                            <Badge variant="outline" className="text-xs">
                                              {effort.taskId}
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {effort.description || 'No description provided'}
                                        </p>
                                        
                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                          <div className="flex items-center space-x-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            <span>{effort.date}</span>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <User className="w-3 h-3" />
                                            <span>{effort.resource}</span>
                                          </div>
                                          {effort.taskTitle && (
                                            <div className="flex items-center space-x-1">
                                              <CheckSquare className="w-3 h-3" />
                                              <span className="truncate max-w-32">{effort.taskTitle}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="text-right ml-4">
                                        <div className="flex items-center space-x-1 text-lg font-semibold text-green-600">
                                          <Timer className="w-4 h-4" />
                                          <span>{formatTime(effort.timeSpent)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Separator />
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {activeTab === 'log' && (
              <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Log Effort
              </Button>
            )}
            {activeTab === 'history' && (
              <Button className="bg-gradient-primary hover:opacity-90">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EffortManager;
