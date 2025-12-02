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

  SortAsc,

  SortDesc,

  Eye,

  GitBranch,

  X,

  Loader2,

  ChevronDown

} from 'lucide-react';

import EffortManager from '../components/EffortManager';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

import { DndProvider, useDrag, useDrop } from 'react-dnd';

import { HTML5Backend } from 'react-dnd-html5-backend';

import { useProjects } from '../hooks/api/useProjects';

import { useStoriesByProject } from '../hooks/api/useStories';

import { useSprintsByProject } from '../hooks/api/useSprints';

import { useUsers } from '../hooks/api/useUsers';

import { Story, Task } from '../types/api';

import LoadingSpinner from '../components/LoadingSpinner';

import { useAuth } from '../contexts/AuthContextEnhanced';

import TaskDetailsFullDialog from '../components/TaskDetailsFullDialog';



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

  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [priorityFilter, setPriorityFilter] = useState('all');

  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const [sortBy, setSortBy] = useState('priority');

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const [isEffortManagerOpen, setIsEffortManagerOpen] = useState(false);

  const [selectedProject, setSelectedProject] = useState<string>('');

  const [selectedSprint, setSelectedSprint] = useState<string>('');

  const [storiesWithTasks, setStoriesWithTasks] = useState<StoryWithTasks[]>([]);

  const [tasksLoading, setTasksLoading] = useState(false);

  

  const [selectedTaskForEffort, setSelectedTaskForEffort] = useState<Task | null>(null);

  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const [taskToView, setTaskToView] = useState<Task | null>(null);



  // Role-based permissions - Only managers can see all stories and tasks

  const isManager = user?.role?.toUpperCase() === "MANAGER";



  // Fetch projects

  const { data: projects, loading: projectsLoading } = useProjects();

  const { data: usersData, loading: usersLoading } = useUsers({ page: 0, size: 1000 });

  // Fetch sprints by project

  const { data: sprintsData, loading: sprintsLoading } = useSprintsByProject(

    selectedProject || 'SKIP'

  );

  const sprints = useMemo(() => {

    if (!sprintsData) return [];

    return Array.isArray(sprintsData) ? sprintsData : (sprintsData as any).data || [];

  }, [sprintsData]);



  // Reset sprint when project changes

  useEffect(() => {

    setSelectedSprint('');

  }, [selectedProject]);



  // Clear all filters

  const clearAllFilters = useCallback(() => {

    setSearchTerm('');

    setStatusFilter('all');

    setPriorityFilter('all');

    setAssigneeFilter('all');

    setSortBy('priority');

    setSortOrder('desc');

  }, []);



  const filtersActive = useMemo(() => {

    return (

      (searchTerm ?? '').trim().length > 0 ||

      statusFilter !== 'all' ||

      priorityFilter !== 'all' ||

      assigneeFilter !== 'all' ||

      sortBy !== 'priority' ||

      sortOrder !== 'desc'

    );

  }, [searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder]);



  // Task-level filter predicate (assignee, status, priority)

  const taskPassesFilters = useCallback((task: Task) => {

    if (!task) return false;

    const normalizeStatus = (s: any) =>

      (s || '')

        .toString()

        .toUpperCase()

        .replace(/[^A-Z]/g, ''); // remove underscores, dashes, spaces



    // Assignee filter

    if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) {

      return false;

    }



    // Status filter (compare uppercase)

    if (statusFilter !== 'all') {

      const taskStatusNorm = normalizeStatus(task.status);

      const desiredStatusNorm = normalizeStatus(statusFilter);

      if (taskStatusNorm !== desiredStatusNorm) {

        return false;

      }

    }



    // Priority filter (map UI value to uppercase API value and compare)

    if (priorityFilter !== 'all') {

      const priorityMap: { [key: string]: string } = {

        'critical': 'CRITICAL',

        'high': 'HIGH',

        'medium': 'MEDIUM',

        'low': 'LOW'

      };

      const desiredPriority = priorityMap[priorityFilter];

      const taskPriority = (task.priority || '').toString().toUpperCase();

      if (taskPriority !== desiredPriority) {

        return false;

      }

    }



    return true;

  }, [assigneeFilter, statusFilter, priorityFilter]);



  // Build users visible in Assignee picker filtered by selected project

  const assigneeOptions = useMemo(() => {

    const allUsers = Array.isArray(usersData) ? usersData : [];

    if (!selectedProject) {

      return allUsers;

    }

    const project = Array.isArray(projects) ? projects.find(p => p.id === selectedProject) : undefined;

    if (!project) {

      return [];

    }

    const memberIds = new Set<string>();

    const teamMembers = (project as any).teamMembers;

    if (Array.isArray(teamMembers)) {

      teamMembers.forEach((m: any) => {

        const id = typeof m === 'string' ? m : (m?.id || m?.userId);

        if (id) memberIds.add(id);

      });

    }

    return allUsers.filter(u => u && u.id && memberIds.has(u.id));

  }, [usersData, selectedProject, projects]);



  // If current assignee selection is not part of filtered options, reset to 'all'

  useEffect(() => {

    if (assigneeFilter !== 'all') {

      const stillPresent = assigneeOptions.some(u => u && u.id === assigneeFilter);

      if (!stillPresent) {

        setAssigneeFilter('all');

      }

    }

  }, [assigneeOptions, assigneeFilter]);



  const userMap = useMemo(() => {

    const map: Record<string, string> = {};

    if (Array.isArray(usersData)) {

      usersData.forEach((user) => {

        if (user?.id) {

          map[user.id] = user.name || user.email || user.id;

        }

      });

    }

    return map;

  }, [usersData]);



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

      let storiesWithTasksData = results.map(({ story, tasks }) => ({

        ...story,

        tasks: tasks || []

      }));



      // Log story task counts (similar to Scrum Management)
      storiesWithTasksData.forEach((story) => {
        const storyTasks = story.tasks || [];
        const todoTasks = storyTasks.filter(t => t.status === 'TO_DO' || t.status === 'TODO').length;
        const inProgressTasks = storyTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const qaTasks = storyTasks.filter(t => t.status === 'QA_REVIEW' || t.status === 'REVIEW').length;
        const doneTasks = storyTasks.filter(t => t.status === 'DONE').length;
        
        console.log(`Story ${story.id} (${story.title}):`, {
          allTasksCount: storyTasks.length,
          storyTasks: storyTasks,
          todoTasks,
          inProgressTasks,
          qaTasks,
          doneTasks
        });
      });

      // Calculate totals
      const allTasks = storiesWithTasksData.flatMap(s => s.tasks || []);
      const totalTasks = allTasks.length;
      const totalIssues = 0; // Backlog page doesn't fetch issues separately
      
      console.log(`Fetched ${totalTasks} tasks and ${totalIssues} issues from ${storiesWithTasksData.length} stories`);



      // Role-based filtering: Only managers see all tasks

      // Non-managers see only their assigned tasks

      if (!isManager && user) {

        storiesWithTasksData = storiesWithTasksData.map((story) => ({

          ...story,

          tasks: story.tasks.filter((task) => task.assigneeId === user.id),

        })).filter((story) => story.tasks.length > 0); // Only keep stories that have at least one user-assigned task



        console.log(

          `Filtered backlog stories with tasks for user ${user.name}: showing ${storiesWithTasksData.length} stories with assigned tasks`,

        );

      }

      

      setStoriesWithTasks(storiesWithTasksData);

    } catch (error) {

      console.error('Error fetching tasks:', error);

      setStoriesWithTasks([]);

    } finally {

      setTasksLoading(false);

    }

  }, [isManager, user]);



  // Fetch tasks when stories change

  useEffect(() => {

    if (storiesData && storiesData.length > 0) {

      console.log('BacklogPage: Fetching tasks for stories, count:', storiesData.length);
      fetchTasksForStories(storiesData);

    } else {

      setStoriesWithTasks([]);

    }

  }, [storiesData, fetchTasksForStories]);

  // Add window focus listener to refresh tasks when user returns to the page (similar to Scrum Management)

  useEffect(() => {

    const handleFocus = () => {

      if (selectedProject && storiesData && storiesData.length > 0) {

        console.log('Window focused - refreshing tasks');

        fetchTasksForStories(storiesData);

      }

    };

    window.addEventListener('focus', handleFocus);

    return () => {

      window.removeEventListener('focus', handleFocus);

    };

  }, [selectedProject, storiesData, fetchTasksForStories]);



  // Filter stories: apply task-level filters and visibility rules

  const filteredStories = useMemo(() => {

    if (!storiesWithTasks || storiesWithTasks.length === 0) {

      return [];

    }



    const today = new Date();

    today.setHours(0, 0, 0, 0);



    // Keep stories that belong to a sprint and contain at least one task that passes filters

    let filtered = storiesWithTasks.filter(story => {

      // Only show stories that belong to a sprint

      if (!story.sprintId || story.sprintId.trim() === '') {

        return false;

      }



      // Filter by selected sprint if one is selected

      if (selectedSprint && story.sprintId !== selectedSprint) {

        return false;

      }



      const tasksForStory = Array.isArray(story.tasks) ? story.tasks : [];



      // If not manager, respect earlier rule of user assignment visibility

      if (!isManager && user?.id) {

        const hasAssigned = tasksForStory.some(t => t.assigneeId === user.id);

        if (!hasAssigned) return false;

      }



      // Apply task-level filters; keep story only if any task matches

      const anyVisibleTask = tasksForStory.some(taskPassesFilters);

      return anyVisibleTask;

    });



    // Apply additional filters

    filtered = filtered.filter(story => {

      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||

                           (story.description && story.description.toLowerCase().includes(searchTerm.toLowerCase()));



      // Story-level status/priority no longer gate; task-level filters applied above

      return matchesSearch;

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

  }, [storiesWithTasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder, user?.id, isManager, taskPassesFilters, selectedSprint]);



  // Convert filtered stories to tasks for display (flattening tasks from stories)

  const tasks = useMemo(() => {

    const allTasks: Task[] = [];

    filteredStories.forEach(story => {

      if (story.tasks && story.tasks.length > 0) {

        const visibleTasks = story.tasks.filter(taskPassesFilters);

        allTasks.push(...visibleTasks);

      }

    });

    return allTasks;

  }, [filteredStories, taskPassesFilters]);



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



  const handleOpenTaskDialog = (task: Task) => {
    console.log('=== BacklogPage - Opening Task Dialog ===');
    console.log('Task ID:', task.id);
    console.log('Task Title:', task.title);
    console.log('Task object:', task);
    console.log('========================================');
    
    setTaskToView(task);

    setIsTaskDialogOpen(true);

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



  const toggleStoryExpansion = (storyId: string) => {

    setExpandedStories(prev => {

      const newSet = new Set(prev);

      if (newSet.has(storyId)) {

        newSet.delete(storyId);

      } else {

        newSet.add(storyId);

      }

      return newSet;

    });

  };



  // Helper to get sprint name from sprintId

  const getSprintName = (sprintId: string | undefined): string => {

    if (!sprintId) return '';

    const sprint = sprints.find(s => s.id === sprintId);

    return sprint?.name || '';

  };



  // Story Card Component

  const StoryCard: React.FC<{ story: StoryWithTasks }> = ({ story }) => {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    

    const visibleTasks = (story.tasks || []).filter(taskPassesFilters);

    const overdueTasks = visibleTasks.filter(task => {

      if (!task.dueDate) return false;

      const taskDueDate = new Date(task.dueDate);

      taskDueDate.setHours(0, 0, 0, 0);

      return taskDueDate < today && task.status !== 'DONE' && task.status !== 'CANCELLED';

    });



    const isExpanded = expandedStories.has(story.id);



    return (

      <Card className="mb-4">

        <CardHeader 

          className="cursor-pointer hover:bg-muted/50 transition-colors"

          onClick={() => toggleStoryExpansion(story.id)}

        >

          <div className="flex items-center justify-between">

            <div className="flex items-center space-x-2">

              <ChevronDown 

                className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}

              />

              <h3 className="font-semibold text-lg">{story.title}</h3>

              <Badge variant="outline" className={`text-xs ${getStoryStatusColor(story.status)}`}>

                {story.status}

              </Badge>

              {story.sprintId && getSprintName(story.sprintId) && (

                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">

                  <GitBranch className="w-3 h-3 mr-1" />

                  {getSprintName(story.sprintId)}

                </Badge>

              )}

            </div>

          </div>

        </CardHeader>

        {isExpanded && (

          <CardContent>

            <div className="space-y-4">

              {/* Story Info */}

              {story.description && (

                <p className="text-sm text-muted-foreground">{story.description}</p>

              )}

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

              {visibleTasks.length > 0 && (

                <div className="space-y-2">

                  <div className="flex items-center justify-between">

                    <h4 className="text-sm font-medium">Tasks ({visibleTasks.length})</h4>

                    <div className="text-xs text-muted-foreground">

                      {visibleTasks.filter(t => t.status === 'DONE').length} completed

                    </div>

                  </div>

                  <div className="space-y-2">

                    {visibleTasks.map(task => {

                      const isOverdue = task.dueDate && new Date(task.dueDate) < today;

                      const taskStatusUpper = task.status?.toUpperCase() || '';

                      const isTaskDoneStatus = taskStatusUpper === 'DONE';

                      const isTaskCancelled = taskStatusUpper === 'CANCELLED';

                      const isIncomplete = !isTaskDoneStatus && !isTaskCancelled;

                      const isOverdueAndIncomplete = isOverdue && isIncomplete;

                      const isDoneAfterDue = isTaskDoneStatus && isOverdue; // Task completed after due date

                      const isUserAssigned = user?.id && task.assigneeId === user.id;

                      const isDoneBeforeDue = isTaskDoneStatus && task.dueDate && new Date(task.dueDate) >= today;

                      const enrichedTask = task as Task & { assigneeName?: string };

                      const resolvedAssigneeName =

                        enrichedTask.assigneeName ||

                        (task.assigneeId ? userMap[task.assigneeId] : null);

                      const assigneeLabel =

                        resolvedAssigneeName ||

                        (!task.assigneeId

                          ? 'Unassigned'

                          : usersLoading

                            ? 'Loading...'

                            : 'Unknown user');



                      return (

                        <Card 

                          key={task.id} 

                          className={`border-l-4 ${

                            isOverdueAndIncomplete ? 'border-l-red-500 bg-red-50' : 

                            isDoneBeforeDue ? 'border-l-green-300 bg-green-50' :

                            isTaskDoneStatus ? 'border-l-green-500 bg-green-50' :

                            isUserAssigned ? 'border-l-purple-500 bg-purple-50' :

                            'border-l-blue-500'

                          }`}

                        >

                          <CardContent className="p-3">

                            <div className="flex items-start justify-between">

                              <div className="flex-1">

                                <div className="flex items-center space-x-2 mb-1">

                                  <h5 className="text-sm font-medium">

                                    {task.title}

                                  </h5>

                                  <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>

                                    {task.status?.replace('_', ' ') || 'TO_DO'}

                                  </Badge>

                                  {isOverdueAndIncomplete && (

                                    <Badge variant="destructive" className="text-xs">

                                      Overdue

                                    </Badge>

                                  )}

                                  {isDoneAfterDue && (

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

                                      <Calendar className={`w-3 h-3 ${isDoneBeforeDue ? 'text-green-400' : isOverdue ? 'text-red-600' : ''}`} />

                                      <span className={

                                        isDoneBeforeDue ? 'text-green-600 font-medium' :

                                        isOverdue ? 'text-red-600 font-medium' : ''

                                      }>

                                        {formatDate(task.dueDate)}

                                        {isDoneBeforeDue && ' (Completed Early)'}

                                      </span>

                                    </div>

                                  )}

                                  {task.estimatedHours && (

                                    <div className="flex items-center space-x-1">

                                      <Clock className="w-3 h-3" />

                                      <span>{task.estimatedHours}h</span>

                                    </div>

                                  )}

                              {assigneeLabel && (

                                <div className="flex items-center space-x-1">

                                  <User className="w-3 h-3" />

                                  <span className="font-bold text-black">

                                    {assigneeLabel}

                                  </span>

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

                                  <DropdownMenuItem onClick={() => handleOpenTaskDialog(task)}>

                                    <Eye className="w-4 h-4 mr-2" />

                                    View Tasks

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

        )}

      </Card>

    );

  };



  return (

    <div className="p-6 space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-2xl font-semibold">Product Backlog</h1>

          <p className="text-muted-foreground">{isManager ? 'All stories and tasks in sprints' : 'Stories where you are assigned to tasks'}</p>

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



          {/* Sprint Selector */}

          <Select 

            value={selectedSprint || "all"} 

            onValueChange={(value) => setSelectedSprint(value === "all" ? "" : value)}

            disabled={!selectedProject || sprintsLoading}

          >

            <SelectTrigger className="w-[200px]">

              <SelectValue placeholder={sprintsLoading ? "Loading sprints..." : (!selectedProject ? "Select project first" : "Select Sprint")} />

            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Sprints</SelectItem>

              {sprints?.map(sprint => (

                <SelectItem key={sprint.id} value={sprint.id}>

                  {sprint.name}

                </SelectItem>

              ))}

            </SelectContent>

          </Select>



          {/* View toggle removed as requested */}

        </div>

      </div>



      {/* Filters and Search */}

      <Card>

        <CardContent className="p-4">

          <div className="flex items-center gap-x-8 lg:gap-x-10 flex-nowrap">

            {/* Search */}

            <div className="relative flex-1 min-w-[260px] mr-6">

              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

              <Input

                placeholder="Search stories..."

                value={searchTerm}

                onChange={(e) => setSearchTerm(e.target.value)}

                className="pl-9"

              />

            </div>



            {/* Filters */}

            <div className="shrink-0 ml-6">

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

            </div>



            <div className="shrink-0 ml-6">

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

            </div>



            <div className="shrink-0 ml-6">

              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>

                <SelectTrigger className="w-[200px]">

                  <SelectValue placeholder={usersLoading ? 'Loading assignees...' : (selectedProject ? 'Assignee (project)' : 'Assignee')} />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">All Assignees</SelectItem>

                  {assigneeOptions.length > 0 ? (

                    assigneeOptions.map(u => (

                      <SelectItem key={u.id} value={u.id}>

                        {u.name || u.email || u.id}

                      </SelectItem>

                    ))

                  ) : (

                    !usersLoading && <SelectItem value="none" disabled>No users found</SelectItem>

                  )}

                </SelectContent>

              </Select>

            </div>



            {/* Sort */}

            <div className="flex items-center space-x-2 ml-6">

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

              <Button

                variant="outline"

                size="sm"

                onClick={clearAllFilters}

                disabled={!filtersActive}

                className="px-3 border-red-300 text-red-600 hover:text-red-700 hover:border-red-400 hover:bg-red-50 disabled:text-red-300 disabled:border-red-200"

                title="Clear all filters"

              >

                <X className="w-4 h-4 mr-1" />

                Clear

              </Button>

            </div>

          </div>

        </CardContent>

      </Card>



      {/* Stats */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">

        <Card>

          <CardContent className="p-4 text-center">

            <div className="text-2xl font-semibold text-blue-600">{filteredStories.length}</div>

            <div className="text-sm text-muted-foreground">{isManager ? 'All Stories' : 'My Assigned Stories'}</div>

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

      {(projectsLoading && projects === null) || (storiesLoading && storiesData === null) || tasksLoading ? (

        <LoadingSpinner message="Loading Backlog..." fullScreen />

      ) : (

        <>

        <div className="space-y-4">

          <div className="flex items-center justify-between">

            <h3 className="font-medium">

              {isManager ? 'All Stories' : 'Stories with My Assigned Tasks'} ({filteredStories.length})

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

                  <p>{isManager ? 'No stories found' : 'No stories with your assigned tasks found'}</p>

                  <p className="text-sm">

                    {selectedProject

                      ? (isManager 

                          ? "No stories found for this project." 

                          : "You are not assigned to any tasks in stories for this project.")

                      : "Please select a project to view stories."}

                  </p>

                </div>

              </CardContent>

            </Card>

          )}

        </div>

        </>

      )}



      {/* Task View Dialog (View Details) - aligned with Scrum board task dialog */}

      <TaskDetailsFullDialog

        open={isTaskDialogOpen}

        onOpenChange={setIsTaskDialogOpen}

        task={taskToView as any}

        stories={filteredStories as any}

        resolveUserName={(id) => userMap[id]}

        formatDate={formatDate}

      />



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

