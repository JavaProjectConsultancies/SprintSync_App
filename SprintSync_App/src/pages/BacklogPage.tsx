import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
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
  GitBranch,
  X,
  Loader2
} from 'lucide-react';
import EffortManager from '../components/EffortManager';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useProjects } from '../hooks/api/useProjects';
import { useStoriesByProject } from '../hooks/api/useStories';
import { Story, Task } from '../types/api';

interface EffortEntry {
  id: string;
  date: string;
  timeSpent: number;
  resource: string;
  category: string;
  description: string;
  billable: boolean;
}

interface StoryWithTasks extends Story {
  tasks: Task[];
}

const BacklogPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isEffortManagerOpen, setIsEffortManagerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [storiesWithTasks, setStoriesWithTasks] = useState<StoryWithTasks[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  const [selectedTaskForEffort, setSelectedTaskForEffort] = useState<Task | null>(null);

  // Fetch projects
  const { data: projects, loading: projectsLoading } = useProjects();

  // Fetch stories by project
  const { data: storiesData, loading: storiesLoading, refetch: refetchStories } = useStoriesByProject(
    selectedProject || 'SKIP'
  );

  // Fetch tasks for all stories
  const fetchTasksForStories = useCallback(async (stories: Story[]) => {
    if (!stories || stories.length === 0) {
      setStoriesWithTasks([]);
      return;
    }

    setTasksLoading(true);
    try {
      const token = localStorage.getItem('authToken') || '';
      
      const storyTasksPromises = stories.map(async (story: Story) => {
        try {
          const response = await fetch(`http://localhost:8080/api/tasks/story/${story.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const tasks = Array.isArray(data) ? data : (data?.data || []);
            return { story, tasks };
          }
          return { story, tasks: [] };
        } catch (error) {
          console.error(`Error fetching tasks for story ${story.id}:`, error);
          return { story, tasks: [] };
        }
      });

      const results = await Promise.all(storyTasksPromises);
      const storiesWithTasksData = results.map(({ story, tasks }) => ({
        ...story,
        tasks: tasks || []
      }));
      
      setStoriesWithTasks(storiesWithTasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setStoriesWithTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Fetch tasks when stories change
  useEffect(() => {
    if (storiesData && storiesData.length > 0) {
      fetchTasksForStories(storiesData);
    } else {
      setStoriesWithTasks([]);
    }
  }, [storiesData, fetchTasksForStories]);

  // Filter stories: only show stories with overdue incomplete tasks
  const filteredStories = useMemo(() => {
    if (!storiesWithTasks || storiesWithTasks.length === 0) {
      return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter stories that have at least one overdue incomplete task
    let filtered = storiesWithTasks.filter(story => {
      if (!story.tasks || story.tasks.length === 0) {
        return false; // No tasks, don't show
      }

      // Check if story has at least one overdue incomplete task
      const hasOverdueIncompleteTask = story.tasks.some(task => {
        if (!task.dueDate) {
          return false; // No due date, skip
        }

        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);
        const isOverdue = taskDueDate < today;
        const isIncomplete = task.status !== 'DONE' && task.status !== 'CANCELLED';
        
        return isOverdue && isIncomplete;
      });

      return hasOverdueIncompleteTask;
    });

    // Apply additional filters
    filtered = filtered.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || story.status === statusFilter;
      
      const priorityMap: { [key: string]: string } = {
        'critical': 'CRITICAL',
        'high': 'HIGH',
        'medium': 'MEDIUM',
        'low': 'LOW'
      };
      const matchesPriority = priorityFilter === 'all' || story.priority === priorityMap[priorityFilter];
      
      const matchesAssignee = assigneeFilter === 'all' || story.assigneeId === assigneeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });

    // Sort stories
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'storyPoints':
          aValue = a.storyPoints || 0;
          bValue = b.storyPoints || 0;
          break;
        case 'dueDate':
          // Use the earliest overdue task due date
          const aTasks = a.tasks.filter(t => t.dueDate && new Date(t.dueDate) < today);
          const bTasks = b.tasks.filter(t => t.dueDate && new Date(t.dueDate) < today);
          aValue = aTasks.length > 0 ? Math.min(...aTasks.map(t => new Date(t.dueDate!).getTime())) : Infinity;
          bValue = bTasks.length > 0 ? Math.min(...bTasks.map(t => new Date(t.dueDate!).getTime())) : Infinity;
          break;
        case 'created':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
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
  }, [storiesWithTasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder]);

  // Convert filtered stories to tasks for display (flattening tasks from stories)
  const tasks = useMemo(() => {
    const allTasks: Task[] = [];
    filteredStories.forEach(story => {
      if (story.tasks && story.tasks.length > 0) {
        allTasks.push(...story.tasks);
      }
    });
    return allTasks;
  }, [filteredStories]);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // Handle effort logging
  const handleLogEffort = (effortData: Omit<EffortEntry, 'id'>) => {
    // Handle effort logging if needed
    setSelectedTaskForEffort(null);
  };

  const handleOpenEffortManager = (task: Task) => {
    setSelectedTaskForEffort(task);
    setIsEffortManagerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'BACKLOG':
      case 'TO_DO':
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'SPRINT_READY':
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'QA_REVIEW':
      case 'REVIEW': return 'bg-blue-100 text-blue-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toUpperCase();
    switch (p) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStoryStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'BACKLOG': return 'bg-gray-100 text-gray-800';
      case 'TODO': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEW': return 'bg-purple-100 text-purple-800';
      case 'DONE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Story Card Component
  const StoryCard: React.FC<{ story: StoryWithTasks }> = ({ story }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = story.tasks?.filter(task => {
      if (!task.dueDate) return false;
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      return taskDueDate < today && task.status !== 'DONE' && task.status !== 'CANCELLED';
    }) || [];

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">{story.title}</h3>
                <Badge variant="outline" className={`text-xs ${getStoryStatusColor(story.status)}`}>
                  {story.status}
                </Badge>
              </div>
              {story.description && (
                <p className="text-sm text-muted-foreground">{story.description}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Story Info */}
            <div className="flex items-center space-x-4 text-sm">
              <Badge variant="outline" className={`${getPriorityColor(story.priority)}`}>
                <Flag className="w-3 h-3 mr-1" />
                {story.priority}
              </Badge>
              {story.storyPoints && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{story.storyPoints} points</span>
                </div>
              )}
              {overdueTasks.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Tasks */}
            {story.tasks && story.tasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Tasks ({story.tasks.length})</h4>
                  <div className="text-xs text-muted-foreground">
                    {story.tasks.filter(t => t.status === 'DONE').length} completed
                  </div>
                </div>
                <div className="space-y-2">
                  {story.tasks.map(task => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < today;
                    const isIncomplete = task.status !== 'DONE' && task.status !== 'CANCELLED';
                    const isOverdueAndIncomplete = isOverdue && isIncomplete;

                    return (
                      <Card 
                        key={task.id} 
                        className={`border-l-4 ${
                          isOverdueAndIncomplete ? 'border-l-red-500 bg-red-50' : 
                          task.status === 'DONE' ? 'border-l-green-500 bg-green-50' :
                          'border-l-blue-500'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-sm font-medium">{task.title}</h5>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                                  {task.status?.replace('_', ' ') || 'TO_DO'}
                                </Badge>
                                {isOverdueAndIncomplete && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <Badge variant="outline" className={`${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </Badge>
                                {task.dueDate && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                      {formatDate(task.dueDate)}
                                    </span>
                                  </div>
                                )}
                                {task.estimatedHours && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.estimatedHours}h</span>
                                  </div>
                                )}
                                {task.actualHours > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <Target className="w-3 h-3" />
                                    <span>{task.actualHours}h actual</span>
                                  </div>
                                )}
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
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Backlog</h1>
          <p className="text-muted-foreground">Stories with overdue incomplete tasks</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Project Selector */}
          <Select value={selectedProject || "all"} onValueChange={(value) => setSelectedProject(value === "all" ? "" : value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select Project"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
                <SelectItem value="BACKLOG">Backlog</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
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
            <div className="text-2xl font-semibold text-blue-600">{filteredStories.length}</div>
            <div className="text-sm text-muted-foreground">Stories with Overdue Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-red-600">
              {tasks.filter(t => {
                if (!t.dueDate) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const taskDueDate = new Date(t.dueDate);
                taskDueDate.setHours(0, 0, 0, 0);
                return taskDueDate < today && t.status !== 'DONE' && t.status !== 'CANCELLED';
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Overdue Incomplete Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-yellow-600">
              {tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'TO_DO').length}
            </div>
            <div className="text-sm text-muted-foreground">Incomplete Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">
              {tasks.filter(t => t.status === 'DONE').length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {(storiesLoading || tasksLoading) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-4">Loading stories and tasks...</p>
          </CardContent>
        </Card>
      )}

      {/* Stories List */}
      {!storiesLoading && !tasksLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              Stories with Overdue Incomplete Tasks ({filteredStories.length})
            </h3>
            <div className="flex items-center space-x-2">
              {filteredStories.reduce((sum, story) => sum + (story.storyPoints || 0), 0) > 0 && (
                <Badge variant="secondary">
                  Total: {filteredStories.reduce((sum, story) => sum + (story.storyPoints || 0), 0)} points
                </Badge>
              )}
            </div>
          </div>

          {filteredStories.length > 0 ? (
            <div className="space-y-4">
              {filteredStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground space-y-2">
                  <Target className="w-12 h-12 mx-auto opacity-50" />
                  <p>No stories with overdue incomplete tasks found</p>
                  <p className="text-sm">
                    {selectedProject 
                      ? 'Stories are filtered to show only those with tasks that are past their due date and still incomplete.'
                      : 'Please select a project to view stories.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

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