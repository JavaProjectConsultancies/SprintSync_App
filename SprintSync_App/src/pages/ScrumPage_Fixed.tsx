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
import { useAuth } from '../contexts/AuthContextEnhanced';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AddStoryDialog from '../components/AddStoryDialog';
import AddTaskDialog from '../components/AddTaskDialog';
// import EffortLogDialog from '../components/EffortLogDialog';
// import EffortHistoryDialog from '../components/EffortHistoryDialog';
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
  status: 'stories' | 'todo' | 'inprogress' | 'qa' | 'done';
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
      name: 'E-Commerce Platform - ERP & Strategic Technology', 
      status: 'active',
      department: 'ERP & Strategic Technology',
      manager: 'Priya Mehta',
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      progress: 85
    },
    { 
      id: 'proj-2', 
      name: 'Mobile Banking App - ERP & Strategic Technology', 
      status: 'planning',
      department: 'ERP & Strategic Technology',
      manager: 'Rajesh Gupta',
      startDate: '2024-03-01',
      endDate: '2024-08-01',
      progress: 15
    },
    { 
      id: 'proj-3', 
      name: 'AI Chat Support - VNIT', 
      status: 'completed',
      department: 'ERP & Strategic Technology',
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
      status: 'todo',
      assignee: 'Sneha Reddy',
      sprintId: 'sprint-15',
      projectId: 'proj-1',
      createdAt: '2024-03-08',
      description: 'Allow users to manage their profiles and preferences'
    },
    {
      id: 'US-004',
      title: 'Notification System',
      priority: 'medium',
      points: 5,
      status: 'stories',
      assignee: 'Vikram Singh',
      sprintId: 'sprint-16',
      projectId: 'proj-1',
      createdAt: '2024-03-15',
      description: 'Real-time notification system for user activities'
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
    }
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
      status: 'stories',
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full space-y-6">
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
          {currentSprint && (
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
                    {currentSprint.daysLeft && currentSprint.daysLeft > 0 && (
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{currentSprint.daysLeft}</div>
                        <div className="text-xs text-muted-foreground">Days Left</div>
                      </div>
                    )}
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

        {/* Enhanced Horizontal Scrollable Board Container */}
        <div className="relative border rounded-lg overflow-hidden bg-gradient-to-br from-white to-green-50/30">
          {/* Scroll Fade Indicators */}
          <div className="scroll-fade-left"></div>
          <div className="scroll-fade-right"></div>
          
          <div className="w-full h-[calc(100vh-300px)] kanban-scroll border-0">
            <div className="story-grid">
              {/* Column Headers */}
              <div className="story-grid-header bg-green-100/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Stories</span>
                  <Badge variant="secondary" className="bg-green-200 text-green-800">
                    {currentSprintStories.length}
                  </Badge>
                </div>
              </div>
              
              <div className="story-grid-header bg-blue-100/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">To Do</span>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                    {getTasksByStatus('todo').length}
                  </Badge>
                </div>
              </div>
              
              <div className="story-grid-header bg-orange-100/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <PlayCircle className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">In Progress</span>
                  <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                    {getTasksByStatus('inprogress').length}
                  </Badge>
                </div>
              </div>
              
              <div className="story-grid-header bg-purple-100/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">QA</span>
                  <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                    {getTasksByStatus('qa').length}
                  </Badge>
                </div>
              </div>
              
              <div className="story-grid-header bg-emerald-100/80 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Done</span>
                  <Badge variant="secondary" className="bg-emerald-200 text-emerald-800">
                    {getTasksByStatus('done').length}
                  </Badge>
                </div>
              </div>

              {/* Story Rows */}
              {currentSprintStories.map((story, index) => (
                <>
                  {/* Story Column */}
                  <div 
                    key={`story-${story.id}`}
                    className={`task-cell ${index % 2 === 0 ? 'bg-gradient-to-br from-green-50/70 to-emerald-50/50' : 'bg-gradient-to-br from-green-100/40 to-emerald-100/30'}`}
                  >
                    <div className="h-full p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="w-3 h-3 text-green-600" />
                          <span className="text-sm font-bold text-green-800">{story.id}</span>
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 h-5 ${getPriorityColor(story.priority)} border-2`}>
                            {story.priority.charAt(0).toUpperCase()}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-green-200/50">
                              <MoreHorizontal className="w-3 h-3 text-green-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Story Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="flex items-center space-x-2 cursor-pointer hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStoryHistoryDialog(story);
                              }}
                            >
                              <TrendingUp className="w-4 h-4 text-purple-600" />
                              <span>Story Insights</span>
                            </DropdownMenuItem>
                            {canManageSprintsAndStories && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-orange-50">
                                  <Edit3 className="w-4 h-4 text-orange-600" />
                                  <span>Edit Story</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600 hover:bg-red-50">
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete Story</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <h4 className="text-sm font-semibold mb-2 text-green-900 line-clamp-2">{story.title}</h4>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round((tasks.filter(t => t.storyId === story.id && t.status === 'done').length / tasks.filter(t => t.storyId === story.id).length) * 100) || 0}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-green-700 font-medium">
                            {Math.round((tasks.filter(t => t.storyId === story.id && t.status === 'done').length / tasks.filter(t => t.storyId === story.id).length) * 100) || 0}% complete
                          </span>
                          <span className="text-green-600">
                            {tasks.filter(t => t.storyId === story.id && t.status === 'done').length}/{tasks.filter(t => t.storyId === story.id).length} tasks
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs bg-green-200 text-green-800 border border-green-300">
                            {story.points} pts
                          </Badge>
                        </div>
                        {story.assignee && (
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={story.avatar} alt={story.assignee} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-green-200 to-emerald-200 text-green-900 font-semibold">
                                {getInitials(story.assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-green-800">{story.assignee.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Task Columns */}
                  {['todo', 'inprogress', 'qa', 'done'].map((status) => {
                    const storyTasks = tasks.filter(task => task.storyId === story.id && task.status === status);
                    return (
                      <div 
                        key={`${story.id}-${status}`}
                        className={`task-cell ${index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'}`}
                      >
                        <div className="task-cell-content">
                          {storyTasks.map(task => (
                            <div 
                              key={task.id}
                              className="task-card-container mb-0.5 transition-all duration-200 cursor-move"
                            >
                              <Card className={`border-2 hover:shadow-md transition-all w-full h-fit ${
                                status === 'todo' ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50' :
                                status === 'inprogress' ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50' :
                                status === 'qa' ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50' :
                                'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50'
                              }`}>
                                <CardContent className="p-2 w-full">
                                  <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center space-x-1">
                                      <GripVertical className="w-2 h-2 text-muted-foreground" />
                                      <span className="text-[10px] font-semibold text-blue-700">{task.id}</span>
                                      <Badge variant="outline" className={`text-[8px] px-1 py-0 h-3 ${getPriorityColor(task.priority)}`}>
                                        {task.priority.charAt(0).toUpperCase()}
                                      </Badge>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-3 w-3 p-0 hover:bg-white/50">
                                          <MoreHorizontal className="w-2 h-2" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {canLogEffort && (
                                          <DropdownMenuItem 
                                            className="flex items-center space-x-2 cursor-pointer hover:bg-green-50"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenEffortDialog(task);
                                            }}
                                          >
                                            <Clock className="w-4 h-4 text-green-600" />
                                            <span>Add Efforts</span>
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem 
                                          className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenTaskHistoryDialog(task);
                                          }}
                                        >
                                          <History className="w-4 h-4 text-blue-600" />
                                          <span>View History</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer hover:bg-orange-50">
                                          <Edit3 className="w-4 h-4 text-orange-600" />
                                          <span>Edit Task</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600 hover:bg-red-50">
                                          <Trash2 className="w-4 h-4" />
                                          <span>Delete Task</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <h4 className="text-[10px] font-medium mb-1 line-clamp-2 leading-tight overflow-hidden text-gray-800">{task.title}</h4>
                                  
                                  {task.progress && (
                                    <div className="mb-1">
                                      <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div 
                                          className="bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full transition-all duration-300" 
                                          style={{ width: `${task.progress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-[8px] text-gray-600">{task.progress}% complete</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-[9px]">
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="h-3 w-3">
                                        <AvatarImage src={task.avatar} alt={task.assignee} />
                                        <AvatarFallback className="text-[8px] bg-gradient-to-br from-green-100 to-cyan-100 text-green-700">
                                          {getInitials(task.assignee)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-[9px] text-muted-foreground font-medium">{task.assignee.split(' ')[0]}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {canLogEffort && (
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-4 w-4 p-0 hover:bg-green-200/50"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenEffortDialog(task);
                                          }}
                                        >
                                          <Clock className="w-2 h-2 text-green-600" />
                                        </Button>
                                      )}
                                      <span className="text-[8px] font-semibold text-gray-700 bg-white/50 px-1 py-0.5 rounded">
                                        {formatTime(task.totalEffort || 0)}
                                      </span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
          
          {/* Enhanced Manual Scroll Instructions */}
          <div className="absolute right-4 top-4 flex items-center space-x-3 bg-gradient-to-r from-white/95 to-green-50/95 backdrop-blur-md px-4 py-2 rounded-full border-2 border-green-200/50 shadow-lg z-30">
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 text-green-600">
                <ChevronLeft className="w-3 h-3" />
                <span className="font-medium">Drag Scrollbar</span>
                <ChevronRight className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <span>or</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-gray-300 rounded">Shift</kbd>
                <span>+ Wheel</span>
              </div>
            </div>
          </div>
          
          {/* Board Statistics */}
          <div className="absolute left-4 top-4 flex items-center space-x-2 bg-gradient-to-r from-white/95 to-cyan-50/95 backdrop-blur-md px-3 py-2 rounded-full border-2 border-cyan-200/50 shadow-lg z-30">
            <div className="flex items-center space-x-2 text-xs">
              <Layers3 className="w-3 h-3 text-cyan-600" />
              <span className="font-medium text-cyan-700">
                {currentSprintStories.length} Stories • {tasks.length} Tasks
              </span>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AddStoryDialog 
          isOpen={isAddStoryDialogOpen}
          onClose={() => setIsAddStoryDialogOpen(false)}
          onAddStory={handleAddStory}
          sprintId={selectedSprint}
        />

        <AddTaskDialog 
          isOpen={isAddTaskDialogOpen}
          onClose={() => setIsAddTaskDialogOpen(false)}
          onAddTask={handleAddTask}
          stories={currentSprintStories}
          selectedStatus={selectedTaskStatus}
          onStatusChange={setSelectedTaskStatus}
        />

        {/* <EffortLogDialog 
          isOpen={isEffortLogDialogOpen}
          onClose={() => setIsEffortLogDialogOpen(false)}
          onLogEffort={handleLogEffort}
          task={selectedTaskForEffort}
        />

        <EffortHistoryDialog 
          isOpen={isHistoryDialogOpen}
          onClose={() => setIsHistoryDialogOpen(false)}
          task={selectedTaskForHistory}
          story={selectedStoryForHistory}
          historyFilter={historyFilter}
          onFilterChange={setHistoryFilter}
        /> */}
      </div>
    </DndProvider>
  );
};

export default ScrumPage;