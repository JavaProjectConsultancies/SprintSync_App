import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Flag, 
  Target, 
  User, 
  Calendar, 
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  BarChart3,
  List,
  Grid3x3,
  SortAsc,
  SortDesc,
  Eye,
  GitBranch
} from 'lucide-react';
import EffortManager from '../components/EffortManager';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface EffortEntry {
  id: string;
  date: string;
  timeSpent: number;
  resource: string;
  category: string;
  description: string;
  billable: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'sprint-ready' | 'in-progress' | 'done';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee?: string;
  reporter: string;
  storyPoints: number;
  labels: string[];
  dueDate?: string;
  createdDate: string;
  sprint?: string;
  subtasks: number;
  completedSubtasks: number;
  attachments: number;
  comments: number;
  efforts?: EffortEntry[];
  totalEffort?: number;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  status: 'planned' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  capacity: number;
  tasks: string[]; // task IDs
}

const BacklogPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewSprintOpen, setIsNewSprintOpen] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isEffortManagerOpen, setIsEffortManagerOpen] = useState(false);
  
  const [selectedTaskForEffort, setSelectedTaskForEffort] = useState<Task | null>(null);

  // Mock data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'TASK-101',
      title: 'Implement User Authentication System',
      description: 'Design and develop a comprehensive user authentication system with JWT tokens, password reset functionality, and social login integration.',
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Priya Mehta',
      reporter: 'Arjun Sharma',
      storyPoints: 8,
      labels: ['authentication', 'backend', 'security'],
      dueDate: '2024-02-15',
      createdDate: '2024-02-01',
      sprint: 'Sprint 3',
      subtasks: 5,
      completedSubtasks: 2,
      attachments: 2,
      comments: 3,
      efforts: [],
      totalEffort: 0
    },
    {
      id: 'TASK-102',
      title: 'Design Product Catalog Interface',
      description: 'Create responsive product listing pages with filtering, search, and sorting capabilities.',
      status: 'sprint-ready',
      priority: 'high',
      assignee: 'Sneha Patel',
      reporter: 'Vikram Singh',
      storyPoints: 5,
      labels: ['frontend', 'ui', 'catalog'],
      dueDate: '2024-02-20',
      createdDate: '2024-02-03',
      subtasks: 3,
      completedSubtasks: 0,
      attachments: 1,
      comments: 2,
      efforts: [],
      totalEffort: 0
    },
    {
      id: 'TASK-103',
      title: 'Set up CI/CD Pipeline',
      description: 'Configure automated testing and deployment pipeline using GitHub Actions.',
      status: 'backlog',
      priority: 'medium',
      assignee: 'Ritu Sharma',
      reporter: 'Arjun Sharma',
      storyPoints: 3,
      labels: ['devops', 'automation', 'deployment'],
      createdDate: '2024-02-05',
      subtasks: 4,
      completedSubtasks: 0,
      attachments: 0,
      comments: 1,
      efforts: [],
      totalEffort: 0
    },
    {
      id: 'TASK-104',
      title: 'API Integration for Payment Gateway',
      description: 'Integrate Razorpay payment gateway with proper error handling and webhook support.',
      status: 'backlog',
      priority: 'high',
      reporter: 'Kavya Nair',
      storyPoints: 8,
      labels: ['backend', 'payment', 'api'],
      dueDate: '2024-02-25',
      createdDate: '2024-02-06',
      subtasks: 6,
      completedSubtasks: 0,
      attachments: 0,
      comments: 0,
      efforts: [],
      totalEffort: 0
    },
    {
      id: 'TASK-105',
      title: 'Mobile App Testing Framework',
      description: 'Set up automated testing framework for mobile applications with device coverage.',
      status: 'done',
      priority: 'medium',
      assignee: 'Aman Singh',
      reporter: 'Ananya Iyer',
      storyPoints: 5,
      labels: ['testing', 'mobile', 'automation'],
      createdDate: '2024-01-28',
      subtasks: 3,
      completedSubtasks: 3,
      attachments: 2,
      comments: 5,
      efforts: [],
      totalEffort: 0
    }
  ]);

  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 'sprint-3',
      name: 'Sprint 3',
      goal: 'Complete authentication system and setup payment integration',
      status: 'active',
      startDate: '2024-02-05',
      endDate: '2024-02-19',
      capacity: 40,
      tasks: ['TASK-101']
    },
    {
      id: 'sprint-4',
      name: 'Sprint 4',
      goal: 'Finish product catalog and mobile testing framework',
      status: 'planned',
      startDate: '2024-02-19',
      endDate: '2024-03-05',
      capacity: 35,
      tasks: []
    }
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    storyPoints: 1,
    labels: '',
    dueDate: ''
  });

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'storyPoints':
          aValue = a.storyPoints;
          bValue = b.storyPoints;
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case 'created':
          aValue = new Date(a.createdDate).getTime();
          bValue = new Date(b.createdDate).getTime();
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder]);

  const createTask = () => {
    const task: Task = {
      id: `TASK-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: 'backlog',
      priority: newTask.priority as any,
      assignee: newTask.assignee || undefined,
      reporter: 'Current User',
      storyPoints: newTask.storyPoints,
      labels: newTask.labels.split(',').map(l => l.trim()).filter(l => l),
      dueDate: newTask.dueDate || undefined,
      createdDate: new Date().toISOString(),
      subtasks: 0,
      completedSubtasks: 0,
      attachments: 0,
      comments: 0
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      storyPoints: 1,
      labels: '',
      dueDate: ''
    });
    setIsNewTaskOpen(false);
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const moveTasksToSprint = (sprintId: string) => {
    setSprints(sprints.map(sprint => 
      sprint.id === sprintId 
        ? { ...sprint, tasks: [...sprint.tasks, ...selectedTasks] }
        : sprint
    ));
    setTasks(tasks.map(task => 
      selectedTasks.includes(task.id) 
        ? { ...task, status: 'sprint-ready' as any, sprint: sprints.find(s => s.id === sprintId)?.name }
        : task
    ));
    setSelectedTasks([]);
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
              efforts: [...(task.efforts || []), newEffort],
              totalEffort: (task.totalEffort || 0) + effortData.timeSpent
            }
          : task
      ));
    }

    setSelectedTaskForEffort(null);
  };

  const handleOpenEffortManager = (task: Task) => {
    setSelectedTaskForEffort(task);
    setIsEffortManagerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800';
      case 'sprint-ready': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'done': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
      selectedTasks.includes(task.id) ? 'ring-2 ring-primary bg-gradient-light' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedTasks.includes(task.id)}
              onCheckedChange={() => toggleTaskSelection(task.id)}
            />
            <div className="space-y-1">
              <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {task.id}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenEffortManager(task)}>
                <Clock className="w-4 h-4 mr-2" />
                Manage Efforts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
              <Flag className="w-2 h-2 mr-1" />
              {task.priority}
            </Badge>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Target className="w-3 h-3" />
              <span>{task.storyPoints}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {task.assignee && (
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                  {task.assignee.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
            {task.dueDate && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

        {task.subtasks > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Subtasks</span>
              <span>{task.completedSubtasks}/{task.subtasks}</span>
            </div>
            <Progress value={(task.completedSubtasks / task.subtasks) * 100} className="h-1" />
          </div>
        )}

        {(task.comments > 0 || task.attachments > 0) && (
          <div className="flex items-center space-x-3 mt-3 text-xs text-muted-foreground">
            {task.comments > 0 && (
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{task.comments}</span>
              </div>
            )}
            {task.attachments > 0 && (
              <div className="flex items-center space-x-1">
                <GitBranch className="w-3 h-3" />
                <span>{task.attachments}</span>
              </div>
            )}
          </div>
        )}

        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {task.labels.slice(0, 3).map(label => (
              <Badge key={label} variant="secondary" className="text-xs px-1 py-0">
                {label}
              </Badge>
            ))}
            {task.labels.length > 3 && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                +{task.labels.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Backlog</h1>
          <p className="text-muted-foreground">Manage and prioritize your project tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="h-8 px-3"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="h-8 px-3"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-white border-0 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Story</DialogTitle>
                <DialogDescription>
                  Add a new story to your product backlog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title *</Label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Describe the task requirements and acceptance criteria"
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Story Points</Label>
                    <Select value={newTask.storyPoints.toString()} onValueChange={(value) => setNewTask(prev => ({ ...prev, storyPoints: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="13">13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assignee</Label>
                    <Select value={newTask.assignee} onValueChange={(value) => setNewTask(prev => ({ ...prev, assignee: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Priya Mehta">Priya Mehta</SelectItem>
                        <SelectItem value="Rohit Kumar">Rohit Kumar</SelectItem>
                        <SelectItem value="Sneha Patel">Sneha Patel</SelectItem>
                        <SelectItem value="Aman Singh">Aman Singh</SelectItem>
                        <SelectItem value="Ritu Sharma">Ritu Sharma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Labels</Label>
                  <Input
                    placeholder="Enter labels separated by commas"
                    value={newTask.labels}
                    onChange={(e) => setNewTask(prev => ({ ...prev, labels: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createTask} className="bg-gradient-primary text-white">
                  Create Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="sprint-ready">Sprint Ready</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="Priya Mehta">Priya Mehta</SelectItem>
                <SelectItem value="Rohit Kumar">Rohit Kumar</SelectItem>
                <SelectItem value="Sneha Patel">Sneha Patel</SelectItem>
                <SelectItem value="Aman Singh">Aman Singh</SelectItem>
                <SelectItem value="Ritu Sharma">Ritu Sharma</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="storyPoints">Story Points</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-600">{tasks.filter(t => t.status === 'backlog').length}</div>
            <div className="text-sm text-muted-foreground">Backlog</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-yellow-600">{tasks.filter(t => t.status === 'sprint-ready').length}</div>
            <div className="text-sm text-muted-foreground">Sprint Ready</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">{tasks.filter(t => t.status === 'in-progress').length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">{tasks.filter(t => t.status === 'done').length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Planning */}
      {selectedTasks.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-medium">{selectedTasks.length} tasks selected</span>
              </div>
              <div className="flex items-center space-x-2">
                {sprints.map(sprint => (
                  <Button
                    key={sprint.id}
                    variant="outline"
                    size="sm"
                    onClick={() => moveTasksToSprint(sprint.id)}
                    className="flex items-center space-x-2"
                  >
                    <Play className="w-3 h-3" />
                    <span>Add to {sprint.name}</span>
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={() => setSelectedTasks([])}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Stories ({filteredTasks.length})</h3>
          <div className="flex items-center space-x-2">
            {filteredTasks.reduce((sum, task) => sum + task.storyPoints, 0) > 0 && (
              <Badge variant="secondary">
                Total: {filteredTasks.reduce((sum, task) => sum + task.storyPoints, 0)} points
              </Badge>
            )}
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}

        {filteredTasks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground space-y-2">
                <Target className="w-12 h-12 mx-auto opacity-50" />
                <p>No tasks found</p>
                <p className="text-sm">Try adjusting your filters or create a new task</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Sprints Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Active Sprints</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Sprint
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sprints.filter(sprint => sprint.status === 'active' || sprint.status === 'planned').map(sprint => (
            <div key={sprint.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'}>
                    {sprint.status === 'active' ? (
                      <Play className="w-3 h-3 mr-1" />
                    ) : (
                      <Pause className="w-3 h-3 mr-1" />
                    )}
                    {sprint.name}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{sprint.goal}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Tasks: </span>
                  <span className="font-medium">{sprint.tasks.length}</span>
                  <span className="text-muted-foreground"> • Capacity: </span>
                  <span className="font-medium">{sprint.capacity} points</span>
                </div>
                <Button variant="ghost" size="sm">
                  View Sprint
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Effort Manager */}
      <EffortManager 
        open={isEffortManagerOpen}
        onOpenChange={setIsEffortManagerOpen}
        onLogEffort={handleLogEffort}
        task={selectedTaskForEffort}
        allTasks={tasks}
        allStories={[]}
      />
    </div>
  );
};

export default BacklogPage;