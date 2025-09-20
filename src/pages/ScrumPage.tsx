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
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddStoryDialog from '../components/AddStoryDialog';
import AddTaskDialog from '../components/AddTaskDialog';
import EffortLogDialog from '../components/EffortLogDialog';
import EffortHistoryDialog from '../components/EffortHistoryDialog';
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
  ChevronRight,
  Layers3,
  BookOpen,
  CalendarDays,
  GitBranch,
  Zap,
  MapPin,
  Building2
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'backlog' | 'stories' | 'todo' | 'inprogress' | 'qa' | 'done';
  assignee?: string;
  avatar?: string;
  sprintId?: string;
  projectId?: string;
  createdAt: string;
  description?: string;
}

interface Sprint {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  goal?: string;
  projectId: string;
  capacity?: number;
  points: string;
  daysLeft?: number;
}

interface Project {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'completed' | 'paused';
  department: string;
  manager: string;
  startDate: string;
  endDate: string;
  progress: number;
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
  totalEffort?: number;
}

const ScrumPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState('proj-1');
  const [selectedSprint, setSelectedSprint] = useState('sprint-15');
  const [activeView, setActiveView] = useState('scrum-board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isEffortDialogOpen, setIsEffortDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEffortLogDialogOpen, setIsEffortLogDialogOpen] = useState(false);
  const [selectedTaskForEffort, setSelectedTaskForEffort] = useState<Task | null>(null);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<Task | null>(null);
  const [selectedStoryForHistory, setSelectedStoryForHistory] = useState<Story | null>(null);
  const [timelineView, setTimelineView] = useState('current');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<string>('');
  const [backlogFilter, setBacklogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Role-based permissions
  const canManageSprintsAndStories = user?.role === 'admin' || user?.role === 'manager';
  const canAddTasks = true;
  const canLogEffort = true;

  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    capacity: ''
  });

  // Enhanced project data
  const projects: Project[] = [
    { 
      id: 'proj-1', 
      name: 'E-Commerce Platform - VNIT', 
      status: 'active',
      department: 'VNIT',
      manager: 'Priya Mehta',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      progress: 85
    },
    { 
      id: 'proj-2', 
      name: 'Mobile Banking App - Dinshaw', 
      status: 'planning',
      department: 'Dinshaw',
      manager: 'Rajesh Gupta',
      startDate: '2024-03-01',
      endDate: '2024-08-01',
      progress: 15
    },
    { 
      id: 'proj-3', 
      name: 'AI Chat Support - VNIT', 
      status: 'completed',
      department: 'VNIT',
      manager: 'Priya Mehta',
      startDate: '2023-10-01',
      endDate: '2024-01-15',
      progress: 100
    }
  ];

  // Enhanced sprint data
  const sprints: Sprint[] = [
    { 
      id: 'sprint-15', 
      name: 'Sprint 15 - UI Integration', 
      status: 'active',
      startDate: '2024-03-18',
      endDate: '2024-04-01',
      goal: 'Complete user interface integration and payment gateway setup',
      daysLeft: 3,
      points: '52:05',
      projectId: 'proj-1',
      capacity: 160
    },
    { 
      id: 'sprint-16', 
      name: 'Sprint 16 - Payment Gateway', 
      status: 'planning',
      startDate: '2024-04-02',
      endDate: '2024-04-16',
      goal: 'Implement secure payment processing and transaction handling',
      daysLeft: 14,
      points: '68:10',
      projectId: 'proj-1',
      capacity: 180
    },
    { 
      id: 'sprint-17', 
      name: 'Sprint 17 - Testing & QA', 
      status: 'planning',
      startDate: '2024-04-17',
      endDate: '2024-05-01',
      goal: 'Comprehensive testing and quality assurance',
      daysLeft: 28,
      points: '45:00',
      projectId: 'proj-1',
      capacity: 140
    },
    { 
      id: 'sprint-b1', 
      name: 'Sprint B1 - Architecture Setup', 
      status: 'planning',
      startDate: '2024-04-01',
      endDate: '2024-04-15',
      goal: 'Set up mobile banking architecture and security framework',
      daysLeft: 7,
      points: '72:00',
      projectId: 'proj-2',
      capacity: 200
    }
  ];

  const [stories, setStories] = useState<Story[]>([
    {
      id: 'US-001',
      title: 'User Payment Integration',
      priority: 'high',
      points: 8,
      status: 'stories',
      assignee: 'Arjun Patel',
      sprintId: 'sprint-15',
      projectId: 'proj-1',
      createdAt: '2024-03-10',
      description: 'Implement secure payment processing with multiple gateway options'
    },
    {
      id: 'US-002', 
      title: 'Dashboard Analytics View',
      priority: 'medium',
      points: 5,
      status: 'stories',
      assignee: 'Priya Sharma',
      sprintId: 'sprint-15',
      projectId: 'proj-1',
      createdAt: '2024-03-12',
      description: 'Create comprehensive analytics dashboard with real-time data'
    },
    {
      id: 'US-003',
      title: 'User Profile Management',
      priority: 'low',
      points: 3,
      status: 'backlog',
      assignee: 'Sneha Reddy',
      sprintId: undefined,
      projectId: 'proj-1',
      createdAt: '2024-03-08',
      description: 'Allow users to manage their profiles and preferences'
    },
    {
      id: 'US-004',
      title: 'Notification System',
      priority: 'medium',
      points: 5,
      status: 'backlog',
      assignee: 'Vikram Singh',
      sprintId: undefined,
      projectId: 'proj-1',
      createdAt: '2024-03-15',
      description: 'Real-time notification system for user activities'
    },
    {
      id: 'US-005',
      title: 'Advanced Search Features',
      priority: 'low',
      points: 8,
      status: 'backlog',
      assignee: 'Rahul Kumar',
      sprintId: undefined,
      projectId: 'proj-1',
      createdAt: '2024-03-20',
      description: 'Implement advanced search with filters and sorting'
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
      totalEffort: 360
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
      totalEffort: 0
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
      totalEffort: 390
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
      totalEffort: 360
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
      totalEffort: 0
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
      totalEffort: 150
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
      totalEffort: 480
    }
  ]);

  // Drag and drop handlers for story-row layout
  const moveItem = useCallback((id: string, newStatus: string, itemType: string) => {
    if (itemType === ItemTypes.TASK) {
      const validStatuses = ['todo', 'inprogress', 'qa', 'done'];
      if (validStatuses.includes(newStatus)) {
        setTasks(prev => prev.map(task => 
          task.id === id 
            ? { ...task, status: newStatus as Task['status'] }
            : task
        ));
      }
    } else if (itemType === ItemTypes.STORY) {
      const validStatuses = ['backlog', 'stories', 'todo', 'inprogress', 'qa', 'done'];
      if (validStatuses.includes(newStatus)) {
        setStories(prev => prev.map(story => {
          if (story.id === id) {
            // If moving to/from backlog, update sprintId
            const updatedStory = { 
              ...story, 
              status: newStatus as Story['status']
            };
            
            if (newStatus === 'backlog') {
              updatedStory.sprintId = undefined;
            } else if (newStatus === 'stories' && !story.sprintId) {
              updatedStory.sprintId = selectedSprint;
            }
            
            return updatedStory;
          }
          return story;
        }));
      }
    }
  }, [selectedSprint]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentProject = projects.find(p => p.id === selectedProject);
  const currentSprint = sprints.find(s => s.id === selectedSprint);
  const projectSprints = sprints.filter(s => s.projectId === selectedProject);

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      const story = stories.find(s => s.id === task.storyId);
      return task.status === status && story?.sprintId === selectedSprint;
    });
  };

  const getStoriesByStatus = (status: string) => {
    if (status === 'backlog') {
      return stories.filter(story => 
        story.status === 'backlog' && 
        story.projectId === selectedProject
      );
    }
    return stories.filter(story => 
      story.status === status && 
      story.sprintId === selectedSprint
    );
  };

  const getSprintStories = (sprintId: string) => {
    return stories.filter(story => story.sprintId === sprintId);
  };

  // Get filtered stories for current sprint  
  const currentSprintStories = getSprintStories(selectedSprint);

  // Add Story Handler
  const handleAddStory = (newStoryData: any) => {
    if (!canManageSprintsAndStories) return;
    
    const newStory: Story = {
      id: `US-${String(stories.length + 1).padStart(3, '0')}`,
      projectId: selectedProject,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'backlog',
      sprintId: undefined,
      ...newStoryData
    };
    setStories(prev => [...prev, newStory]);
  };

  // Add Task Handler
  const handleAddTask = (newTaskData: any) => {
    const newTask: Task = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      efforts: [],
      totalEffort: 0,
      status: selectedTaskStatus ? selectedTaskStatus as Task['status'] : 'todo',
      ...newTaskData
    };
    setTasks(prev => [...prev, newTask]);
    setSelectedTaskStatus(''); // Reset status after adding
  };

  // Handle effort logging
  const handleLogEffort = (effortData: Omit<EffortEntry, 'id'>) => {
    const newEffort: EffortEntry = {
      id: `effort-${Date.now()}`,
      ...effortData
    };

    if (selectedTaskForEffort) {
      setTasks(prev => prev.map(task => 
        task.id === selectedTaskForEffort.id
          ? {
              ...task,
              efforts: [...task.efforts, newEffort],
              totalEffort: (task.totalEffort || 0) + effortData.timeSpent
            }
          : task
      ));
    }

    setSelectedTaskForEffort(null);
  };

  const handleOpenEffortDialog = (task: Task) => {
    setSelectedTaskForEffort(task);
    setIsEffortLogDialogOpen(true);
  };

  const handleOpenTaskHistoryDialog = (task: Task) => {
    setSelectedTaskForHistory(task);
    setSelectedStoryForHistory(null);
    setIsHistoryDialogOpen(true);
  };

  const handleOpenStoryHistoryDialog = (story: Story) => {
    setSelectedStoryForHistory(story);
    setSelectedTaskForHistory(null);
    setIsHistoryDialogOpen(true);
  };

  // Create Sprint Handler
  const handleCreateSprint = () => {
    if (!canManageSprintsAndStories) return;
    
    const sprintData = {
      id: `sprint-${Date.now()}`,
      projectId: selectedProject,
      status: 'planning' as const,
      daysLeft: Math.ceil((new Date(newSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      points: '0:00',
      ...newSprint,
      capacity: parseInt(newSprint.capacity) || 0
    };
    
    // Add sprint logic here
    setNewSprint({
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
      capacity: ''
    });
    setIsSprintDialogOpen(false);
  };

  // Backlog filtering
  const getFilteredBacklogStories = () => {
    let filtered = getStoriesByStatus('backlog');
    
    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (backlogFilter !== 'all') {
      filtered = filtered.filter(story => story.priority === backlogFilter);
    }
    
    return filtered;
  };

  // Draggable Story Component
  const DraggableStory: React.FC<{ story: Story; index: number }> = ({ story, index }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.STORY,
      item: { id: story.id, type: ItemTypes.STORY },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-move ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-sm">{story.id}</span>
            <Badge variant="outline" className={`text-xs px-2 py-0.5 ${getPriorityColor(story.priority)}`}>
              {story.priority.charAt(0).toUpperCase()}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenStoryHistoryDialog(story)}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Story Insights
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h4 className="font-semibold text-sm mb-2 line-clamp-2">{story.title}</h4>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {story.points} pts
          </Badge>
          {story.assignee && (
            <div className="flex items-center space-x-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={story.avatar} alt={story.assignee} />
                <AvatarFallback className="text-xs">{getInitials(story.assignee)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{story.assignee.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Draggable Task Component
  const DraggableTask: React.FC<{ task: Task }> = ({ task }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.TASK,
      item: { id: task.id, type: ItemTypes.TASK },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <div
        ref={drag}
        className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-move mb-2 ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-1">
            <GripVertical className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-xs">{task.id}</span>
            <Badge variant="outline" className={`text-xs px-1 py-0.5 ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase()}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canLogEffort && (
                <DropdownMenuItem onClick={() => handleOpenEffortDialog(task)}>
                  <Clock className="w-4 h-4 mr-2" />
                  Log Time
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleOpenTaskHistoryDialog(task)}>
                <History className="w-4 h-4 mr-2" />
                View History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h5 className="font-semibold text-xs mb-2 line-clamp-2">{task.title}</h5>
        
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <Avatar className="h-4 w-4">
              <AvatarImage src={task.avatar} alt={task.assignee} />
              <AvatarFallback className="text-xs">{getInitials(task.assignee)}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{task.assignee.split(' ')[0]}</span>
          </div>
          <Badge variant="secondary" className="text-xs px-1 py-0.5">
            {task.dueDate}
          </Badge>
        </div>
        
        {task.progress !== undefined && (
          <div className="mb-2">
            <Progress value={task.progress} className="h-1.5" />
            <span className="text-xs text-muted-foreground">{task.progress}%</span>
          </div>
        )}
        
        {task.totalEffort && task.totalEffort > 0 && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(task.totalEffort)}</span>
          </div>
        )}
      </div>
    );
  };

  // Drop Zone Component
  const DropZone: React.FC<{ 
    status: string; 
    children: React.ReactNode; 
    title: string;
    icon: React.ReactNode;
    count: number;
    colorClass: string;
  }> = ({ status, children, title, icon, count, colorClass }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: [ItemTypes.STORY, ItemTypes.TASK],
      drop: (item: { id: string; type: string }) => {
        moveItem(item.id, status, item.type);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div 
        ref={drop}
        className={`min-h-[600px] ${isOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'} 
        border-2 border-dashed rounded-lg transition-colors flex flex-col`}
      >
        <div className={`${colorClass} p-3 rounded-t-lg border-b flex items-center justify-between`}>
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-semibold">{title}</span>
            <Badge variant="secondary">
              {count}
            </Badge>
          </div>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {children}
          {/* Add Task/Story Button */}
          {canAddTasks && status !== 'backlog' && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed opacity-60 hover:opacity-100"
              onClick={() => {
                setSelectedTaskStatus(status);
                setIsAddTaskDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs value={activeView} onValueChange={setActiveView} className="flex flex-col h-full space-y-6">
        {/* Header with project and sprint selectors */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSprint} onValueChange={setSelectedSprint}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select Sprint" />
                </SelectTrigger>
                <SelectContent>
                  {projectSprints.map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <TabsList>
                <TabsTrigger value="backlog">Backlog</TabsTrigger>
                <TabsTrigger value="scrum-board">Scrum Board</TabsTrigger>
                <TabsTrigger value="sprint-management">Sprint Management</TabsTrigger>
              </TabsList>

              {canManageSprintsAndStories && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddStoryDialogOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Story</span>
                </Button>
              )}
              
              {canAddTasks && (
                <Button 
                  size="sm" 
                  onClick={() => setIsAddTaskDialogOpen(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </Button>
              )}
            </div>
          </div>

          {/* Sprint info */}
          {currentSprint && activeView !== 'backlog' && (
            <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(currentSprint.status)}>
                        {currentSprint.status}
                      </Badge>
                      <span className="font-medium">{currentSprint.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentSprint.goal}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{currentSprint.daysLeft}</div>
                      <div className="text-xs text-muted-foreground">Days Left</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{currentSprint.points}</div>
                      <div className="text-xs text-muted-foreground">Story Points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <TabsContent value="backlog" className="mt-0 flex-1">
          {/* Backlog Management */}
          <div className="space-y-4">
            {/* Backlog Filters */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={backlogFilter} onValueChange={setBacklogFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getFilteredBacklogStories().length} stories
                </Badge>
              </div>
            </div>

            {/* Backlog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getFilteredBacklogStories().map((story, index) => (
                <DraggableStory key={story.id} story={story} index={index} />
              ))}
            </div>

            {getFilteredBacklogStories().length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No stories in backlog</h3>
                <p className="text-sm">Start by adding some user stories to your project backlog.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scrum-board" className="mt-0 flex-1">
          {/* Enhanced Horizontal Scrollable Board Container */}
          <div className="relative border rounded-lg overflow-hidden bg-gradient-to-br from-white to-green-50/30">
            <div className="w-full h-[calc(100vh-300px)] overflow-x-auto overflow-y-hidden kanban-scroll border-0">
              <div className="story-grid">
                {/* Column Headers */}
                <DropZone
                  status="stories"
                  title="Stories"
                  icon={<BookOpen className="w-5 h-5 text-green-600" />}
                  count={getStoriesByStatus('stories').length}
                  colorClass="bg-green-100/80"
                >
                  {getStoriesByStatus('stories').map((story, index) => (
                    <DraggableStory key={story.id} story={story} index={index} />
                  ))}
                </DropZone>

                <DropZone
                  status="todo"
                  title="To Do"
                  icon={<Timer className="w-5 h-5 text-blue-600" />}
                  count={getTasksByStatus('todo').length}
                  colorClass="bg-blue-100/80"
                >
                  {getTasksByStatus('todo').map(task => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </DropZone>

                <DropZone
                  status="inprogress"
                  title="In Progress"
                  icon={<PlayCircle className="w-5 h-5 text-orange-600" />}
                  count={getTasksByStatus('inprogress').length}
                  colorClass="bg-orange-100/80"
                >
                  {getTasksByStatus('inprogress').map(task => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </DropZone>

                <DropZone
                  status="qa"
                  title="QA"
                  icon={<Shield className="w-5 h-5 text-purple-600" />}
                  count={getTasksByStatus('qa').length}
                  colorClass="bg-purple-100/80"
                >
                  {getTasksByStatus('qa').map(task => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </DropZone>

                <DropZone
                  status="done"
                  title="Done"
                  icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  count={getTasksByStatus('done').length}
                  colorClass="bg-emerald-100/80"
                >
                  {getTasksByStatus('done').map(task => (
                    <DraggableTask key={task.id} task={task} />
                  ))}
                </DropZone>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sprint-management" className="mt-0 flex-1">
          {/* Sprint Management */}
          <div className="space-y-6">
            {/* Sprint Planning Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3>Sprint Management</h3>
                <p className="text-muted-foreground">Plan and manage your sprints</p>
              </div>
              {canManageSprintsAndStories && (
                <Button onClick={() => setIsSprintDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sprint
                </Button>
              )}
            </div>

            {/* Sprint Timeline */}
            <div className="grid gap-4">
              {projectSprints.map(sprint => (
                <Card key={sprint.id} className={`border-2 ${sprint.id === selectedSprint ? 'border-green-200 bg-green-50/30' : 'border-border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(sprint.status)}>
                          {sprint.status}
                        </Badge>
                        <h4 className="font-semibold">{sprint.name}</h4>
                        <Badge variant="outline">
                          {getSprintStories(sprint.id).length} stories
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSprint(sprint.id)}
                        >
                          Select
                        </Button>
                        {canManageSprintsAndStories && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Edit Sprint</DropdownMenuItem>
                              <DropdownMenuItem>View Reports</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete Sprint</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{sprint.goal}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">{sprint.daysLeft}</div>
                        <div className="text-xs text-muted-foreground">Days Left</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{sprint.points}</div>
                        <div className="text-xs text-muted-foreground">Story Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">{sprint.capacity}h</div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Add Story Dialog */}
        <AddStoryDialog
          isOpen={isAddStoryDialogOpen}
          onClose={() => setIsAddStoryDialogOpen(false)}
          onAddStory={handleAddStory}
          projectId={selectedProject}
        />

        {/* Add Task Dialog */}
        <AddTaskDialog
          isOpen={isAddTaskDialogOpen}
          onClose={() => setIsAddTaskDialogOpen(false)}
          onAddTask={handleAddTask}
          stories={currentSprintStories}
        />

        {/* Effort Log Dialog */}
        <EffortLogDialog
          isOpen={isEffortLogDialogOpen}
          onClose={() => setIsEffortLogDialogOpen(false)}
          onLogEffort={handleLogEffort}
          task={selectedTaskForEffort}
        />

        {/* Effort History Dialog */}
        <EffortHistoryDialog
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          task={selectedTaskForHistory}
          story={selectedStoryForHistory}
        />

        {/* Create Sprint Dialog */}
        <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
              <DialogDescription>
                Set up a new sprint for your project with goals and timeline.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sprint-name">Sprint Name</Label>
                <Input
                  id="sprint-name"
                  value={newSprint.name}
                  onChange={(e) => setNewSprint(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sprint 18 - Feature Complete"
                />
              </div>
              <div>
                <Label htmlFor="sprint-goal">Sprint Goal</Label>
                <Textarea
                  id="sprint-goal"
                  value={newSprint.goal}
                  onChange={(e) => setNewSprint(prev => ({ ...prev, goal: e.target.value }))}
                  placeholder="What do you want to achieve in this sprint?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newSprint.startDate}
                    onChange={(e) => setNewSprint(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newSprint.endDate}
                    onChange={(e) => setNewSprint(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Team Capacity (hours)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newSprint.capacity}
                  onChange={(e) => setNewSprint(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="160"
                />
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsSprintDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSprint}>
                Create Sprint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </DndProvider>
  );
};

export default ScrumPage;