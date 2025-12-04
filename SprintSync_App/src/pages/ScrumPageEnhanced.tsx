import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { ScrollArea } from '../components/ui/scroll-area';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddStoryDialog from '../components/AddStoryDialog';
import AddTaskDialog from '../components/AddTaskDialog';
import { 
  Search,
  Plus,
  Calendar, 
  Clock,
  Target,
  AlertTriangle,
  User,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Timer,
  PlayCircle,
  PauseCircle,
  Settings,
  BarChart3,
  Users,
  Shield,
  GripVertical,
  Edit3,
  Trash2,
  History,
  TrendingUp,
  Filter,
  Download,
  FileText,
  CheckSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'stories' | 'todo' | 'inprogress' | 'qa' | 'done';
  assignee?: string;
  avatar?: string;
}

// Drag item types
const ItemTypes = {
  STORY: 'story',
  TASK: 'task',
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
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  avatar?: string;
  dueDate: string;
  status: 'todo' | 'inprogress' | 'qa' | 'done';
  progress?: number;
  efforts: EffortEntry[];
  totalEffort?: number; // calculated from efforts array
  labels?: string[];
  type?: 'db' | 'api' | 'ui' | 'qa' | 'devops' | 'research' | 'bug' | 'issue';
}

const ScrumPageEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState('fintech-mobile');
  const [selectedSprint, setSelectedSprint] = useState('sprint-15');
  const [activeView, setActiveView] = useState('scrum-board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isEffortDialogOpen, setIsEffortDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  // Role-based permissions - developers cannot add sprints or stories
  const canManageSprintsAndStories = user?.role === 'admin' || user?.role === 'manager';
  const canAddTasks = true; // All roles can add tasks
  const canLogEffort = true; // All roles can log effort

  const [newEffort, setNewEffort] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSpent: '',
    hours: '',
    minutes: '',
    resource: '',
    category: '',
    description: '',
    billable: true
  });

  const projects = [
    { id: 'fintech-mobile', name: 'FinTech Mobile App', status: 'active' },
    { id: 'ecommerce', name: 'E-Commerce Platform', status: 'active' },
    { id: 'banking', name: 'Mobile Banking App', status: 'planning' }
  ];

  const sprints = [
    { 
      id: 'sprint-15', 
      name: 'Sprint 15 - UI Integration', 
      status: 'active',
      daysLeft: 3,
      points: '52:05',
      project: 'fintech-mobile'
    },
    { 
      id: 'sprint-16', 
      name: 'Sprint 16 - Payment Gateway', 
      status: 'planning',
      daysLeft: 14,
      points: '68:10',
      project: 'fintech-mobile'
    }
  ];

  const [stories, setStories] = useState<Story[]>([
    {
      id: 'US-001',
      title: 'User Payment Integration',
      priority: 'high',
      points: 8,
      status: 'stories',
      assignee: 'Arjun Patel'
    },
    {
      id: 'US-002', 
      title: 'Dashboard Analytics View',
      priority: 'medium',
      points: 5,
      status: 'stories',
      assignee: 'Priya Sharma'
    },
    {
      id: 'US-003',
      title: 'User Profile Management',
      priority: 'low',
      points: 3,
      status: 'stories',
      assignee: 'Sneha Reddy'
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'TSK-001',
      title: 'Design Payment UI Components',
      storyId: 'US-001',
      priority: 'high',
      assignee: 'Priya Sharma',
      avatar: '',
      dueDate: '10/02/24',
      status: 'todo',
      efforts: [],
      totalEffort: 360,
      type: 'ui'
    },
    {
      id: 'TSK-002',
      title: 'Implement Payment Gateway API',
      storyId: 'US-001',
      priority: 'high',
      assignee: 'Arjun Patel',
      avatar: '',
      dueDate: '12/02/24',
      status: 'todo',
      efforts: [],
      totalEffort: 0,
      type: 'api'
    },
    {
      id: 'TSK-003',
      title: 'Payment Security Validation',
      storyId: 'US-001',
      priority: 'high',
      assignee: 'Sneha Reddy',
      avatar: '',
      dueDate: '08/02/24',
      status: 'inprogress',
      progress: 65,
      efforts: [],
      totalEffort: 390,
      type: 'qa'
    },
    {
      id: 'TSK-004',
      title: 'Payment Flow Testing',
      storyId: 'US-001',
      priority: 'high',
      assignee: 'Rahul Kumar',
      avatar: '',
      dueDate: '15/02/24',
      status: 'qa',
      efforts: [],
      totalEffort: 360,
      type: 'qa'
    },
    {
      id: 'TSK-005',
      title: 'Analytics Dashboard Layout',
      storyId: 'US-002',
      priority: 'medium',
      assignee: 'Priya Sharma',
      avatar: '',
      dueDate: '14/02/24',
      status: 'todo',
      efforts: [],
      totalEffort: 0,
      type: 'ui'
    },
    {
      id: 'TSK-006',
      title: 'Chart Components Implementation',
      storyId: 'US-002',
      priority: 'medium',
      assignee: 'Vikram Singh',
      avatar: '',
      dueDate: '16/02/24',
      status: 'inprogress',
      progress: 30,
      efforts: [],
      totalEffort: 150,
      type: 'ui'
    },
    {
      id: 'TSK-007',
      title: 'Profile Settings UI',
      storyId: 'US-003',
      priority: 'low',
      assignee: 'Vikram Singh',
      avatar: '',
      dueDate: '20/02/24',
      status: 'done',
      efforts: [],
      totalEffort: 480,
      type: 'ui'
    },
    {
      id: 'BUG-001',
      title: 'Payment Gateway Timeout Error',
      storyId: 'US-001',
      priority: 'high',
      assignee: 'Arjun Patel',
      avatar: '',
      dueDate: '09/02/24',
      status: 'todo',
      efforts: [],
      totalEffort: 0,
      type: 'bug'
    },
    {
      id: 'ISSUE-001',
      title: 'User Authentication Fails on Mobile',
      storyId: 'US-003',
      priority: 'high',
      assignee: 'Sneha Reddy',
      avatar: '',
      dueDate: '11/02/24',
      status: 'inprogress',
      progress: 25,
      efforts: [],
      totalEffort: 120,
      type: 'issue'
    },
    {
      id: 'BUG-002',
      title: 'Dashboard Chart Not Loading Data',
      storyId: 'US-002',
      priority: 'medium',
      assignee: 'Rahul Kumar',
      avatar: '',
      dueDate: '13/02/24',
      status: 'qa',
      efforts: [],
      totalEffort: 180,
      labels: ['bug']
    }
  ]);

  // Drag and drop handlers
  const moveItem = useCallback((id: string, newStatus: string, itemType: string) => {
    if (itemType === ItemTypes.STORY) {
      setStories(prev => prev.map(story => 
        story.id === id 
          ? { ...story, status: newStatus as Story['status'] }
          : story
      ));
    } else if (itemType === ItemTypes.TASK) {
      setTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, status: newStatus as Task['status'] }
          : task
      ));
    }
  }, []);

  // Handle opening effort dialog
  const handleOpenEffortDialog = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsEffortDialogOpen(true);
  }, []);

  // Helper functions
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const currentSprint = sprints.find(s => s.id === selectedSprint);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getStoriesByStatus = (status: string) => {
    return stories.filter(story => story.status === status);
  };

  // Add Story Handler - only allowed for admin/manager
  const handleAddStory = (newStoryData: Omit<Story, 'id'>) => {
    if (!canManageSprintsAndStories) return;
    
    const newStory: Story = {
      id: `US-${String(stories.length + 1).padStart(3, '0')}`,
      ...newStoryData
    };
    setStories(prev => [...prev, newStory]);
  };

  // Add Task Handler - all roles can add tasks
  const handleAddTask = (task: Omit<Task, 'id' | 'efforts' | 'totalEffort'>) => {
    const newTask: Task = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      ...task,
      efforts: [],
      totalEffort: 0
    };
    setTasks(prev => [...prev, newTask]);
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const parentStory = stories.find(story => story.id === task.storyId);
    
    // Determine if it's a task or issue based on type or other criteria
    const isIssue = task.type === 'bug' || task.type === 'issue' || task.labels?.includes('bug') || task.labels?.includes('issue');
    
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.TASK,
      item: { id: task.id, type: ItemTypes.TASK },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div 
        ref={drag as any}
        className={`mb-3 transition-all cursor-move ${
          isDragging ? 'opacity-50 rotate-2 scale-105' : ''
        }`}
      >
        <div 
          className={`border rounded-lg hover:shadow-md transition-shadow ${
            isIssue ? 'issue-card' : 'task-card'
          }`}
          style={{
            backgroundColor: isIssue ? '#fee2e2' : '#dcfce7',
            borderColor: isIssue ? '#ef4444' : '#22c55e',
            borderWidth: '2px'
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-blue-600">{task.id}</span>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {canLogEffort && (
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 cursor-pointer"
                      onClick={() => handleOpenEffortDialog(task)}
                    >
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>Add Efforts</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                    <History className="w-4 h-4 text-blue-600" />
                    <span>View History</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                    <Edit3 className="w-4 h-4 text-orange-600" />
                    <span>Edit Task</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Task</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Parent Story Reference */}
            {parentStory && (
              <div className="mb-2 p-2 bg-blue-50 rounded border-l-3 border-blue-200">
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">{parentStory.id}</span>
                  <span className="text-xs text-blue-600">•</span>
                  <span className="text-xs text-blue-600 truncate">{parentStory.title}</span>
                </div>
              </div>
            )}
            
            <h4 className="text-sm font-medium mb-3 line-clamp-2">{task.title}</h4>
            
            {/* Effort Tracking */}
            <div className="mb-3 p-2 bg-gray-50 rounded border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Timer className="w-3 h-3" />
                  <span>Total Effort</span>
                </div>
                <span className="text-xs font-medium text-gray-800">
                  {formatTime(task.totalEffort || 0)}
                </span>
              </div>
            </div>
            
            {task.progress && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full" 
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.avatar} alt={task.assignee} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                    {getInitials(task.assignee)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{task.assignee.split(' ')[0]}</span>
              </div>
              <div className="flex items-center space-x-1">
                {canLogEffort && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 hover:bg-green-100"
                  >
                    <Clock className="w-3 h-3 text-green-600" />
                  </Button>
                )}
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{task.dueDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StoryCard: React.FC<{ story: Story }> = ({ story }) => {
    const storyTasks = tasks.filter(task => task.storyId === story.id);
    const completedTasks = storyTasks.filter(task => task.status === 'done');
    
    const [{ isDragging }, dragRef] = useDrag({
      type: ItemTypes.STORY,
      item: { id: story.id, type: ItemTypes.STORY },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    return (
      <div 
        ref={dragRef as any}
        className={`mb-3 transition-all cursor-move ${
          isDragging ? 'opacity-50 rotate-2 scale-105' : ''
        }`}
      >
        <Card className="border-2 border-green-200 bg-green-50 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-700">{story.id}</span>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(story.priority)}`}>
                  {story.priority}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Story Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>View Story Efforts</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span>Story Insights</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {canManageSprintsAndStories && (
                    <>
                      <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer">
                        <Edit3 className="w-4 h-4 text-orange-600" />
                        <span>Edit Story</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Story</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <h4 className="text-sm font-medium mb-3 text-green-800">{story.title}</h4>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                  {story.points} pts
                </Badge>
                <span className="text-xs text-green-600">
                  {completedTasks.length}/{storyTasks.length} tasks
                </span>
              </div>
              {story.assignee && (
                <div className="flex items-center space-x-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={story.avatar} alt={story.assignee} />
                    <AvatarFallback className="text-xs bg-green-200 text-green-800">
                      {getInitials(story.assignee)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-green-700">{story.assignee.split(' ')[0]}</span>
                </div>
              )}
            </div>
            
            {storyTasks.length > 0 && (
              <div className="w-full bg-green-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full" 
                  style={{ width: `${(completedTasks.length / storyTasks.length) * 100}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const KanbanColumn: React.FC<{ 
    title: string; 
    status: string; 
    tasks: Task[]; 
    stories: Story[]; 
  }> = ({ title, status, tasks, stories }) => {
    const [{ isOver }, dropRef] = useDrop({
      accept: [ItemTypes.TASK, ItemTypes.STORY],
      drop: (item: { id: string; type: string }) => {
        moveItem(item.id, status, item.type);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div
        ref={dropRef as any}
        className={`min-h-[600px] w-80 flex-shrink-0 p-4 rounded-lg transition-colors ${
          isOver ? 'bg-gradient-light border-2 border-dashed border-primary' : 'bg-gray-50'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white">{tasks.length + stories.length}</Badge>
            {status === 'todo' && canAddTasks && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => setIsAddTaskDialogOpen(true)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[550px]" type="always">
          <div className="space-y-3 pr-2">
            {/* Render Stories */}
            {stories.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
            
            {/* Render Tasks */}
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">Scrum Management</h1>
            <p className="text-muted-foreground">Sprint planning, task tracking, and team collaboration</p>
          </div>
          <div className="flex items-center space-x-3">
            {canManageSprintsAndStories && (
              <Button 
                className="bg-gradient-primary border-0 text-white hover:opacity-90"
                onClick={() => setIsAddStoryDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
            )}
          </div>
        </div>

        {/* Project and Sprint Selection */}
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-2">
            <Label>Project:</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label>Sprint:</Label>
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sprints.filter(s => s.project === selectedProject).map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentSprint && (
            <div className="flex items-center space-x-4 ml-auto">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {currentSprint.daysLeft} days left
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {currentSprint.points} points
              </Badge>
            </div>
          )}
        </div>

        {/* Enhanced Kanban Board with Horizontal Scroll */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scrum Board</span>
              <div className="flex items-center space-x-2">
                {canManageSprintsAndStories && (
                  <Badge variant="outline" className="text-xs">
                    Manager View - Full Access
                  </Badge>
                )}
                {user?.role === 'developer' && (
                  <Badge variant="outline" className="text-xs text-blue-600">
                    Developer View - View Only for Sprints/Stories
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Horizontal Scrollable Kanban Container */}
            <ScrollArea className="w-full" type="always">
              <div className="flex space-x-6 pb-4" style={{ minWidth: '1600px' }}>
                <KanbanColumn
                  title="Stories"
                  status="stories"
                  tasks={[]}
                  stories={getStoriesByStatus('stories')}
                />
                <KanbanColumn
                  title="To Do"
                  status="todo"
                  tasks={getTasksByStatus('todo')}
                  stories={getStoriesByStatus('todo')}
                />
                <KanbanColumn
                  title="In Progress"
                  status="inprogress"
                  tasks={getTasksByStatus('inprogress')}
                  stories={getStoriesByStatus('inprogress')}
                />
                <KanbanColumn
                  title="QA/Review"
                  status="qa"
                  tasks={getTasksByStatus('qa')}
                  stories={getStoriesByStatus('qa')}
                />
                <KanbanColumn
                  title="Done"
                  status="done"
                  tasks={getTasksByStatus('done')}
                  stories={getStoriesByStatus('done')}
                />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Role-based Action Restrictions Notice */}
        {!canManageSprintsAndStories && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  As a {user?.role}, you can view all content and add tasks, but cannot create or manage sprints and stories.
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        onSubmit={handleAddTask}
        stories={stories}
      />
    </div>
  </DndProvider>
);
};

export default ScrumPageEnhanced;