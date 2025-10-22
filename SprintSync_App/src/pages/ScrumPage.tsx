import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import BurndownChart from '../components/BurndownChart';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';
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
  Filter,
  Download,
  FileText,
  CheckSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers3,
  BookOpen,
  CalendarDays,
  GitBranch,
  Zap,
  MapPin,
  Building2,
  Loader2,
  TrendingUp,
  Eye,
  X
} from 'lucide-react';

// Import API hooks
import {
  useSprintsByProject,
  useCurrentSprint,
  useCreateSprint,
  useUpdateSprint,
  useUpdateSprintStatus,
  useSprintBurndown
} from '../hooks/api/useSprints';

import {
  useStoriesBySprint,
  useStoriesByProject,
  useCreateStory,
  useUpdateStory,
  useUpdateStoryStatus,
  useMoveStoryToSprint
} from '../hooks/api/useStories';

import {
  useTasksByStory,
  useCreateTask,
  useUpdateTask,
  useUpdateTaskStatus
} from '../hooks/api/useTasks';

import { subtaskApiService } from '../services/api/entities/subtaskApi';
import { taskApiService } from '../services/api/entities/taskApi';
import { timeEntryApiService } from '../services/api/entities/timeEntryApi';
import { activityLogApiService } from '../services/api/entities/activityLogApi';
import { useRecentActivityByEntity } from '../hooks/api/useActivityLogs';

import { useProjectById } from '../hooks/api/useProjectById';
import { useProjects } from '../hooks/api/useProjects';
import { useEpics } from '../hooks/api/useEpics';
import { useReleases } from '../hooks/api/useReleases';
import { Sprint, Story, Task, Subtask, TimeEntry, ActivityLog, Priority, SprintStatus, StoryStatus, TaskStatus } from '../types/api';

// Drag item types
const ItemTypes = {
  STORY: 'story',
  TASK: 'task',
};

const ScrumPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [activeView, setActiveView] = useState('scrum-board');
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const [isStoryDetailsOpen, setIsStoryDetailsOpen] = useState(false);
  const [selectedStoryForDetails, setSelectedStoryForDetails] = useState<Story | null>(null);
  const [isSprintDetailsOpen, setIsSprintDetailsOpen] = useState(false);
  const [selectedSprintForDetails, setSelectedSprintForDetails] = useState<Sprint | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  
  // Effort logging state (JIRA-style: log on subtasks)
  const [isLogEffortDialogOpen, setIsLogEffortDialogOpen] = useState(false);
  const [selectedSubtaskForEffort, setSelectedSubtaskForEffort] = useState<Subtask | null>(null);
  const [effortLog, setEffortLog] = useState({
    hours: 0,
    description: '',
    workDate: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: ''
  });

  // Task details modal state (JIRA-style)
  const [taskDetailsTab, setTaskDetailsTab] = useState<'details' | 'subtasks' | 'activity'>('details');
  const [taskComment, setTaskComment] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [backlogFilter, setBacklogFilter] = useState('all');
  
  // Role-based permissions
  const canManageSprintsAndStories = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'MANAGER';
  const canAddTasks = true;
  const canLogEffort = true;

  // New sprint form state
  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
    capacityHours: ''
  });

  // New story form state
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    acceptanceCriteria: '',
    storyPoints: 0,
    priority: 'MEDIUM' as Priority,
    epicId: '',
    releaseId: '',
    sprintId: selectedSprint || '', // Default to current sprint
    assigneeId: '',
    reporterId: '',
    estimatedHours: undefined as number | undefined,
    labels: [] as string[]
  });

  // Update sprint in newStory when selectedSprint changes
  useEffect(() => {
    if (selectedSprint && !newStory.sprintId) {
      setNewStory(prev => ({ ...prev, sprintId: selectedSprint }));
    }
  }, [selectedSprint]);

  // New task form state
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    storyId: '',
    priority: 'MEDIUM' as Priority,
    assigneeId: '',
    estimatedHours: 0,
    dueDate: ''
  });

  // New subtask form state
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    taskId: '',
    priority: 'MEDIUM' as Priority,
    assigneeId: '',
    estimatedHours: 0
  });

  // API Hooks - Projects
  const { data: projectsData, loading: projectsLoading } = useProjects();
  const { project: currentProject, loading: projectLoading, refetch: refetchProject } = useProjectById(selectedProject || 'SKIP');
  
  // Extract projects list
  const projects = projectsData || [];

  // API Hooks - Epics and Releases
  const { data: epicsData, loading: epicsLoading } = useEpics();
  const { data: releasesData, loading: releasesLoading } = useReleases();
  
  // Extract epics and releases for the selected project
  // Handle both array and object responses
  const epicsArray = Array.isArray(epicsData) ? epicsData : (epicsData?.data || epicsData?.content || []);
  const releasesArray = Array.isArray(releasesData) ? releasesData : (releasesData?.data || releasesData?.content || []);
  
  const epics = epicsArray.filter((epic: any) => epic.projectId === selectedProject);
  const releases = releasesArray.filter((release: any) => release.projectId === selectedProject);
  
  // API Hooks - Sprints (only fetch if project is selected)
  const { data: sprintsData, loading: sprintsLoading, refetch: refetchSprints } = useSprintsByProject(selectedProject || 'SKIP');
  const { data: burndownData, loading: burndownLoading } = useSprintBurndown(selectedSprint || 'SKIP');
  const { mutate: createSprintMutate, loading: createSprintLoading } = useCreateSprint();
  const { mutate: updateSprintMutate, loading: updateSprintLoading } = useUpdateSprint();
  const { mutate: updateSprintStatusMutate } = useUpdateSprintStatus();

  // API Hooks - Stories (only fetch if project/sprint is selected)
  const { data: sprintStoriesData, loading: sprintStoriesLoading, refetch: refetchSprintStories } = useStoriesBySprint(selectedSprint || 'SKIP');
  const { data: backlogStoriesData, loading: backlogStoriesLoading, refetch: refetchBacklogStories } = useStoriesByProject(selectedProject || 'SKIP');
  const { mutate: createStoryMutate, loading: createStoryLoading } = useCreateStory();
  const { mutate: updateStoryMutate } = useUpdateStory();
  const { mutate: updateStoryStatusMutate } = useUpdateStoryStatus();
  const { mutate: moveStoryToSprintMutate } = useMoveStoryToSprint();

  // API Hooks - Tasks
  const { mutate: createTaskMutate, loading: createTaskLoading } = useCreateTask();
  const { mutate: updateTaskMutate } = useUpdateTask();
  const { mutate: updateTaskStatusMutate } = useUpdateTaskStatus();
  
  // Fetch all tasks for all stories in the current sprint
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  // State for all subtasks
  const [allSubtasks, setAllSubtasks] = useState<Subtask[]>([]);

  // Fetch subtasks when tasks change
  useEffect(() => {
    const fetchSubtasks = async () => {
      if (allTasks.length === 0) {
        setAllSubtasks([]);
        return;
      }

      try {
        const subtasksPromises = allTasks.map(task => 
          subtaskApiService.getSubtasksByTask(task.id)
            .then(response => response.data)
            .catch(error => {
              console.error(`Error fetching subtasks for task ${task.id}:`, error);
              return [];
            })
        );

        const subtasksArrays = await Promise.all(subtasksPromises);
        const subtasks = subtasksArrays.flat();
        setAllSubtasks(subtasks);
      } catch (error) {
        console.error('Error fetching subtasks:', error);
        setAllSubtasks([]);
      }
    };

    fetchSubtasks();
  }, [allTasks]);
  
  // User data for displaying names instead of IDs
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Function to fetch all tasks for all stories in the sprint
  const fetchAllTasks = useCallback(async (stories: Story[]) => {
    if (!selectedSprint || stories.length === 0) {
      setAllTasks([]);
      return;
    }

    setTasksLoading(true);
    try {
      const token = localStorage.getItem('authToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg';
      
      const taskPromises = stories.map(async (story: Story) => {
        const response = await fetch(`http://localhost:8080/api/tasks/story/${story.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : (data?.data || []);
        }
        return [];
      });

      const taskArrays = await Promise.all(taskPromises);
      const allTasksFlat = taskArrays.flat();
      setAllTasks(allTasksFlat);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setAllTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [selectedSprint]);

  // Function to fetch users for displaying names
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('authToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg';
      
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const usersArray = Array.isArray(data) ? data : (data?.content || data?.data || []);
        setUsers(usersArray);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Extract data from API responses (only use data if valid project/sprint selected)
  // Note: useApi hook returns data directly (not wrapped in .data property)
  const sprints = selectedProject ? (Array.isArray(sprintsData) ? sprintsData : sprintsData?.data || []) : [];
  const currentSprint = sprints.find((s: Sprint) => s.id === selectedSprint);
  const sprintStories = selectedSprint ? (Array.isArray(sprintStoriesData) ? sprintStoriesData : sprintStoriesData?.data || []) : [];
  const backlogStories = selectedProject ? ((Array.isArray(backlogStoriesData) ? backlogStoriesData : backlogStoriesData?.data || []).filter((s: Story) => s.status === 'BACKLOG')) : [];

  // Debug logging
  useEffect(() => {
    console.log('=== SCRUM PAGE DEBUG ===');
    console.log('Selected Project:', selectedProject);
    console.log('Sprints Data Raw:', sprintsData);
    console.log('Is Sprints Data Array?:', Array.isArray(sprintsData));
    console.log('Sprints Extracted:', sprints);
    console.log('Sprints Count:', sprints.length);
    console.log('Selected Sprint:', selectedSprint);
    
    console.log('=== SPRINT STORIES DEBUG ===');
    console.log('Sprint Stories Data Raw:', sprintStoriesData);
    console.log('Sprint Stories Extracted:', sprintStories);
    console.log('Sprint Stories Count:', sprintStories.length);
    console.log('Sprint Stories IDs:', sprintStories.map(s => s.id));
    console.log('Sprint Stories Names:', sprintStories.map(s => s.title));
    
    console.log('=== TASKS DEBUG ===');
    console.log('All Tasks Count:', allTasks.length);
    console.log('All Tasks:', allTasks.map(t => ({ id: t.id, title: t.title, storyId: t.storyId })));
    
    if (sprints.length > 0) {
      console.log('✅ Sprints loaded successfully!');
      console.log('Sprint names:', sprints.map(s => s.name));
    } else if (selectedProject && !sprintsLoading) {
      console.log('⚠️ No sprints found for project:', selectedProject);
    }
  }, [selectedProject, sprintsData, sprints, selectedSprint, sprintsLoading, sprintStoriesData, sprintStories, allTasks]);

  // Fetch tasks when sprint stories change
  useEffect(() => {
    fetchAllTasks(sprintStories);
  }, [fetchAllTasks, sprintStories]);

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Set initial project selection - Auto-select first ACTIVE project
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      // Find all ACTIVE projects first (case-insensitive)
      const activeProjects = projects.filter(p => 
        p.status?.toUpperCase() === 'ACTIVE' || p.status?.toLowerCase() === 'active'
      );
      
      console.log('📊 Available projects:', projects.map(p => `${p.name} (${p.status})`));
      console.log('✅ Active projects found:', activeProjects.length);
      
      // Select the first ACTIVE project, or fall back to first project
      const projectToSelect = activeProjects.length > 0 ? activeProjects[0] : projects[0];
      
      if (projectToSelect) {
        console.log('🎯 Auto-selecting project:', projectToSelect.name, `(${projectToSelect.status})`);
        setSelectedProject(projectToSelect.id);
      }
    }
  }, [projects, selectedProject]);

  // Reset sprint when project changes
  useEffect(() => {
    if (selectedProject) {
      // Clear sprint selection when project changes
      setSelectedSprint('');
    }
  }, [selectedProject]);

  // Set initial sprint selection - Auto-select first ACTIVE sprint
  useEffect(() => {
    if (sprints.length > 0 && !selectedSprint && selectedProject) {
      // Find all ACTIVE sprints first (case-insensitive)
      const activeSprints = sprints.filter(s => 
        s.status?.toUpperCase() === 'ACTIVE' || s.status?.toLowerCase() === 'active'
      );
      
      console.log('📊 Available sprints:', sprints.map(s => `${s.name} (${s.status})`));
      console.log('✅ Active sprints found:', activeSprints.length);
      
      // Prioritize ACTIVE sprints, then fall back to first sprint
      const sprintToSelect = activeSprints.length > 0 ? activeSprints[0] : sprints[0];
      
      if (sprintToSelect) {
        console.log('🎯 Auto-selecting sprint:', sprintToSelect.name, `(${sprintToSelect.status})`);
        setSelectedSprint(sprintToSelect.id);
      }
    }
  }, [sprints, selectedSprint, selectedProject]);

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
    switch (priority.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Story status mapping from API to kanban columns
  const mapStoryStatusToColumn = (status: StoryStatus): string => {
    switch (status) {
      case 'BACKLOG': return 'backlog';
      case 'TODO': return 'stories';
      case 'IN_PROGRESS': return 'inprogress';
      case 'REVIEW': return 'qa';
      case 'DONE': return 'done';
      default: return 'stories';
    }
  };

  const mapColumnToStoryStatus = (column: string): StoryStatus => {
    switch (column) {
      case 'backlog': return 'BACKLOG';
      case 'stories': return 'TODO';
      case 'inprogress': return 'IN_PROGRESS';
      case 'qa': return 'REVIEW';
      case 'done': return 'DONE';
      default: return 'TODO';
    }
  };

  // Task status mapping
  const mapTaskStatusToColumn = (status: TaskStatus): string => {
    switch (status) {
      case 'TO_DO': return 'todo';
      case 'IN_PROGRESS': return 'inprogress';
      case 'QA_REVIEW': return 'qa';
      case 'DONE': return 'done';
      case 'BLOCKED': return 'todo'; // Blocked tasks appear in TODO
      case 'CANCELLED': return 'done'; // Cancelled tasks appear in DONE
      default: return 'todo';
    }
  };

  const mapColumnToTaskStatus = (column: string): TaskStatus => {
    switch (column) {
      case 'todo': return 'TO_DO';
      case 'inprogress': return 'IN_PROGRESS';
      case 'qa': return 'QA_REVIEW';
      case 'done': return 'DONE';
      default: return 'TO_DO';
    }
  };

  // Get stories by column status
  const getStoriesByStatus = (status: string) => {
    if (status === 'backlog') {
      return backlogStories.filter(story => 
        story.projectId === selectedProject
      );
    }
    // Stories should only appear in the "Stories" column, not in workflow columns
    if (status === 'stories') {
      return sprintStories; // All stories in the sprint go to the Stories column
    }
    return []; // No stories in workflow columns (To Do, In Progress, QA, Done)
  };

  // Get tasks for a specific story
  const getTasksForStory = (storyId: string) => {
    return allTasks.filter(task => 
      task.storyId === storyId && 
      sprintStories.some(story => story.id === storyId) // Ensure story is in current sprint
    );
  };

  // Get subtasks for a specific task
  const getSubtasksForTask = (taskId: string): Subtask[] => {
    return allSubtasks.filter(subtask => subtask.taskId === taskId);
  };

  // Get tasks by column status (only tasks from stories in the current sprint)
  const getTasksByStatus = (status: string) => {
    if (status === 'stories') {
      return []; // No tasks in the Stories column
    }
    
    // Filter tasks to only include those whose parent stories are in the current sprint
    const filteredTasks = allTasks.filter(task => {
      // Check if the task's parent story is in the current sprint
      const parentStoryInSprint = sprintStories.some(story => story.id === task.storyId);
      
      // Only show tasks whose parent story is in the sprint AND status matches the column
      return parentStoryInSprint && mapTaskStatusToColumn(task.status) === status;
    });
    
    // Debug logging for task filtering
    console.log(`=== TASK FILTERING DEBUG (${status}) ===`);
    console.log('All tasks count:', allTasks.length);
    console.log('Sprint stories count:', sprintStories.length);
    console.log('Sprint story IDs:', sprintStories.map(s => s.id));
    console.log('Filtered tasks count:', filteredTasks.length);
    console.log('Filtered tasks:', filteredTasks.map(t => ({ id: t.id, title: t.title, storyId: t.storyId, status: t.status })));
    
    return filteredTasks;
  };

  // Group tasks by their parent story (only from stories in current sprint)
  const getTasksGroupedByStory = (status: string) => {
    const tasks = getTasksByStatus(status);
    const grouped = tasks.reduce((acc, task) => {
      // Only process tasks whose parent story is in the current sprint
      const parentStory = sprintStories.find(story => story.id === task.storyId);
      
      if (parentStory) { // Only include if parent story is in sprint
        const storyTitle = parentStory.title;
        
        if (!acc[storyTitle]) {
          acc[storyTitle] = {
            story: parentStory,
            tasks: []
          };
        }
        acc[storyTitle].tasks.push(task);
      }
      return acc;
    }, {} as Record<string, { story?: Story; tasks: Task[] }>);

    return grouped;
  };

  // Helper functions for displaying names instead of IDs
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || userId;
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  const getSprintName = (sprintId: string) => {
    const sprint = sprints.find(s => s.id === sprintId);
    return sprint?.name || sprintId;
  };

  // Helper to sanitize story data for API (convert empty strings to null/arrays)
  const sanitizeStoryData = (storyData: any) => {
    return {
      ...storyData,
      // Convert empty string to empty array for acceptanceCriteria
      acceptanceCriteria: storyData.acceptanceCriteria 
        ? (typeof storyData.acceptanceCriteria === 'string' 
            ? storyData.acceptanceCriteria.split('\n').filter((line: string) => line.trim())
            : storyData.acceptanceCriteria)
        : [],
      // Convert empty strings to null for optional string fields
      epicId: storyData.epicId || null,
      releaseId: storyData.releaseId || null,
      sprintId: storyData.sprintId || null,
      assigneeId: storyData.assigneeId || null,
      reporterId: storyData.reporterId || null,
      // Convert empty array or undefined to null for labels
      labels: (storyData.labels && storyData.labels.length > 0) ? storyData.labels : null,
    };
  };

  // Get filtered backlog stories
  const getFilteredBacklogStories = () => {
    let filtered = backlogStories;
    
    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (backlogFilter !== 'all') {
      filtered = filtered.filter(story => story.priority.toLowerCase() === backlogFilter.toLowerCase());
    }
    
    return filtered;
  };

  // Story creation handler
  const handleCreateStory = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    if (!newStory.title.trim()) {
      alert('Please enter a story title');
      return;
    }

    // Sprint is now mandatory - check if it's set
    if (!newStory.sprintId) {
      alert('Please select a sprint for this story');
      return;
    }

    const storyData = {
      projectId: selectedProject,
      title: newStory.title,
      description: newStory.description,
      acceptanceCriteria: newStory.acceptanceCriteria,
      storyPoints: newStory.storyPoints,
      priority: newStory.priority,
      epicId: newStory.epicId || null,
      releaseId: newStory.releaseId || null,
      sprintId: newStory.sprintId || null,
      assigneeId: newStory.assigneeId || null,
      reporterId: newStory.reporterId || null,
      estimatedHours: newStory.estimatedHours || null,
      labels: newStory.labels.length > 0 ? newStory.labels : null,
      status: newStory.sprintId ? 'TODO' : 'BACKLOG',
      isActive: true
    };

    await createStoryMutate(storyData as any);
    
    // Reset form with default sprint
    setNewStory({
      title: '',
      description: '',
      acceptanceCriteria: '',
      storyPoints: 0,
      priority: 'MEDIUM' as Priority,
      epicId: '',
      releaseId: '',
      sprintId: selectedSprint || '', // Reset to current sprint
      assigneeId: '',
      reporterId: '',
      estimatedHours: undefined,
      labels: []
    });
    
    // Close dialog
    setIsAddStoryDialogOpen(false);
    
    // Refetch stories
    if (newStory.sprintId) {
      refetchSprintStories();
    } else {
      refetchBacklogStories();
    }
  };

  // Drag and drop handlers
  const moveItem = useCallback(async (id: string, newStatus: string, itemType: string) => {
    if (itemType === ItemTypes.TASK) {
      const validStatuses = ['todo', 'inprogress', 'qa', 'done'];
      if (validStatuses.includes(newStatus)) {
        const task = allTasks.find(t => t.id === id);
        const oldStatus = task?.status;
        
        await updateTaskStatusMutate({
            id,
            status: mapColumnToTaskStatus(newStatus)
          });
          
        // Log activity
        try {
          await activityLogApiService.createActivityLog({
            userId: user?.id || '',
            entityType: 'tasks',
            entityId: id,
            action: 'status_changed',
            description: `Changed status from ${oldStatus} to ${mapColumnToTaskStatus(newStatus)}`,
            oldValues: JSON.stringify({ status: oldStatus }),
            newValues: JSON.stringify({ status: mapColumnToTaskStatus(newStatus) }),
            ipAddress: undefined, // Not tracking IP from frontend
            userAgent: undefined  // Not tracking user agent from frontend
          });
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
        
        toast.success('Task status updated');
        // Refetch tasks to update the UI
        await fetchAllTasks(sprintStories);
      }
    } else if (itemType === ItemTypes.STORY) {
      const validStatuses = ['backlog', 'stories', 'todo', 'inprogress', 'qa', 'done'];
      if (validStatuses.includes(newStatus)) {
          const newApiStatus = mapColumnToStoryStatus(newStatus);
          
          // If moving to/from backlog, also update sprintId
          if (newStatus === 'backlog') {
          updateStoryMutate({
              id,
              story: { 
                status: newApiStatus,
                sprintId: ''
              }
            });
          } else if (newStatus === 'stories') {
            // Find the story to check if it needs sprint assignment
            const story = [...sprintStories, ...backlogStories].find(s => s.id === id);
            if (story && !story.sprintId) {
            moveStoryToSprintMutate({
                id,
                sprintId: selectedSprint
              });
            }
          updateStoryStatusMutate({
              id,
              status: newApiStatus
            });
          } else {
          updateStoryStatusMutate({
              id,
              status: newApiStatus
            });
          }
          
          toast.success('Story status updated');
          refetchSprintStories();
          refetchBacklogStories();
        }
      }
  }, [selectedSprint, updateTaskStatusMutate, updateStoryMutate, updateStoryStatusMutate, moveStoryToSprintMutate, refetchSprintStories, refetchBacklogStories, fetchAllTasks, sprintStories]);

  // Create Sprint Handler
  const handleCreateSprint = () => {
    if (!canManageSprintsAndStories) return;
    
    createSprintMutate({
        projectId: selectedProject,
        name: newSprint.name,
        goal: newSprint.goal,
        status: 'PLANNING' as SprintStatus,
        startDate: newSprint.startDate,
        endDate: newSprint.endDate,
        capacityHours: parseInt(newSprint.capacityHours) || 0,
        velocityPoints: 0,
        isActive: true
      });
      
      toast.success('Sprint created successfully');
      refetchSprints();
      
      setNewSprint({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
        capacityHours: ''
      });
      setIsSprintDialogOpen(false);
  };

  // Add Story Handler
  const handleAddStory = () => {
    if (!canManageSprintsAndStories) return;
    
    createStoryMutate({
        projectId: selectedProject,
        title: newStory.title,
        description: newStory.description,
        acceptanceCriteria: newStory.acceptanceCriteria,
        storyPoints: newStory.storyPoints,
        priority: newStory.priority,
        epicId: newStory.epicId || '',
        releaseId: newStory.releaseId || '',
        sprintId: activeView === 'backlog' ? '' : selectedSprint,
        assigneeId: '',
        status: activeView === 'backlog' ? 'BACKLOG' as StoryStatus : 'TODO' as StoryStatus,
        isActive: true
      });
      
      toast.success('Story created successfully');
      refetchSprintStories();
      refetchBacklogStories();
      
      setNewStory({
        title: '',
        description: '',
        acceptanceCriteria: '',
        storyPoints: 0,
        priority: 'MEDIUM',
        epicId: '',
        releaseId: ''
      });
      setIsAddStoryDialogOpen(false);
  };

  // Add Task Handler
  const handleAddTask = async () => {
    const taskData = {
        storyId: newTask.storyId,
        title: newTask.title,
        description: newTask.description,
        status: 'TODO' as TaskStatus,
        priority: newTask.priority,
        assigneeId: newTask.assigneeId,
        reporterId: user?.id || '',
        estimatedHours: newTask.estimatedHours,
        actualHours: 0,
        orderIndex: 0,
        dueDate: newTask.dueDate,
        labels: []
    };
    
    createTaskMutate(taskData);
    
    // Log activity (use timeout to ensure task is created first)
    setTimeout(async () => {
      try {
        const createdTask = allTasks.find(t => t.title === newTask.title);
        if (createdTask) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || '',
            entityType: 'tasks',
            entityId: createdTask.id,
            action: 'created',
            description: `Created task "${newTask.title}"`,
            newValues: JSON.stringify(taskData),
            ipAddress: undefined,
            userAgent: undefined
          });
        }
      } catch (error) {
        console.error('Failed to log activity:', error);
      }
    }, 1000);
      
      toast.success('Task created successfully');
      refetchSprintStories();
      
      setNewTask({
        title: '',
        description: '',
        storyId: '',
        priority: 'MEDIUM',
        assigneeId: '',
        estimatedHours: 0,
        dueDate: ''
      });
      setIsAddTaskDialogOpen(false);
  };

  // View Task Details Handler (JIRA-style) - will be defined in component scope

  // Add Subtask Handler
  const handleAddSubtask = async () => {
    try {
      const subtaskData = {
        taskId: selectedTaskForSubtask?.id || '',
        title: newSubtask.title,
        description: newSubtask.description,
        isCompleted: false,
        assigneeId: newSubtask.assigneeId || '',
        estimatedHours: newSubtask.estimatedHours,
        actualHours: 0,
        orderIndex: 0,
        dueDate: newSubtask.dueDate || '',
        priority: newSubtask.priority || 'MEDIUM',
        status: 'TO_DO',
        labels: []
      };
      
      await subtaskApiService.createSubtask(subtaskData);
      
      // Log activity for subtask creation
      try {
        if (selectedTaskForSubtask) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || '',
            entityType: 'tasks',
            entityId: selectedTaskForSubtask.id,
            action: 'subtask_created',
            description: `Created subtask "${newSubtask.title}"`,
            newValues: JSON.stringify(subtaskData),
            ipAddress: undefined,
            userAgent: undefined
          });
        }
    } catch (error) {
        console.error('Failed to log activity:', error);
      }
      
      toast.success('Subtask created successfully');
      
      // Refetch tasks to update allTasks, which will trigger subtasks refetch
      if (sprintStories.length > 0) {
        const tasksPromises = sprintStories.map(story => 
          taskApiService.getTasksByStory(story.id)
            .then(response => response.data)
            .catch(() => [])
        );
        const tasksArrays = await Promise.all(tasksPromises);
        const tasks = tasksArrays.flat();
        setAllTasks(tasks);
      }
      
      setNewSubtask({
        title: '',
        description: '',
        taskId: '',
        priority: 'MEDIUM',
        assigneeId: '',
        estimatedHours: 0
      });
      setIsAddSubtaskDialogOpen(false);
      setSelectedTaskForSubtask(null);
    } catch (error) {
      toast.error('Failed to create subtask');
      console.error('Error creating subtask:', error);
    }
  };

  // Task Activity Log Component
  const TaskActivityLog: React.FC<{ taskId: string }> = ({ taskId }) => {
    const { activityLogs, loading, error } = useRecentActivityByEntity('tasks', taskId, 30);

    const getActionIcon = (action: string) => {
      switch (action.toLowerCase()) {
        case 'created':
          return <Plus className="w-4 h-4 text-green-600" />;
        case 'updated':
          return <Edit3 className="w-4 h-4 text-blue-600" />;
        case 'deleted':
          return <Trash2 className="w-4 h-4 text-red-600" />;
        case 'status_changed':
          return <TrendingUp className="w-4 h-4 text-purple-600" />;
        case 'assigned':
          return <User className="w-4 h-4 text-orange-600" />;
        default:
          return <History className="w-4 h-4 text-gray-600" />;
      }
    };

    const formatActivityTime = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-600">Loading activity...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8 text-red-600">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Failed to load activity logs</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Activity Timeline */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
          
          {activityLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Activity will appear here as you work on this task</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                            {log.userId ? getUserName(log.userId).split(' ').map(n => n[0]).join('').toUpperCase() : 'SYS'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-gray-900">
                          {log.userId ? getUserName(log.userId) : 'System'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatActivityTime(log.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {log.description || `${log.action} ${log.entityType}`}
                    </p>
                    {log.newValues && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap">
                          {typeof log.newValues === 'string' ? log.newValues.substring(0, 200) : JSON.stringify(log.newValues, null, 2).substring(0, 200)}
                          {(typeof log.newValues === 'string' ? log.newValues.length : JSON.stringify(log.newValues).length) > 200 && '...'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Comments</h3>
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={taskComment}
                onChange={(e) => setTaskComment(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">Pro tip: @ mention team members</p>
                <Button size="sm" disabled={!taskComment.trim()}>
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Work Log Summary */}
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Work Log Summary</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {selectedTaskForDetails?.estimatedHours || 0}h
                </div>
                <div className="text-xs text-gray-600">Estimated</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {selectedTaskForDetails?.actualHours || 0}h
                </div>
                <div className="text-xs text-gray-600">Logged</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">
                  {Math.max(0, (selectedTaskForDetails?.estimatedHours || 0) - (selectedTaskForDetails?.actualHours || 0)).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Work is logged on subtasks. See "Child Work Items" tab to log work.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Log Effort Handler (JIRA-style: log on subtasks)
  const handleLogEffort = async () => {
    if (!selectedSubtaskForEffort || !effortLog.hours || effortLog.hours <= 0) {
      toast.error('Please enter valid hours');
      return;
    }

    if (!effortLog.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      // Find the parent task
      const parentTask = allTasks.find(t => t.id === selectedSubtaskForEffort.taskId);
      
      // Create time entry for the subtask
      const timeEntryData = {
        userId: user?.id || '',
        projectId: selectedProject || undefined,
        storyId: parentTask?.storyId || undefined,
        taskId: selectedSubtaskForEffort.taskId,
        subtaskId: selectedSubtaskForEffort.id,
        description: effortLog.description,
        entryType: 'development' as const,
        hoursWorked: effortLog.hours,
        workDate: effortLog.workDate,
        startTime: effortLog.startTime && effortLog.startTime.trim() ? effortLog.startTime : undefined,
        endTime: effortLog.endTime && effortLog.endTime.trim() ? effortLog.endTime : undefined,
        isBillable: true
      };
      
      console.log('Creating time entry with data:', timeEntryData);
      await timeEntryApiService.createTimeEntry(timeEntryData);

      // Update subtask actual hours using new PATCH endpoint
      const newSubtaskActualHours = (selectedSubtaskForEffort.actualHours || 0) + effortLog.hours;
      await subtaskApiService.updateSubtaskActualHours(selectedSubtaskForEffort.id, newSubtaskActualHours);

      // Calculate and update parent task's actual hours (roll-up from all subtasks) using new PATCH endpoint
      if (parentTask) {
        const allTaskSubtasks = getSubtasksForTask(parentTask.id);
        const totalSubtaskHours = allTaskSubtasks.reduce((sum, st) => {
          if (st.id === selectedSubtaskForEffort.id) {
            return sum + newSubtaskActualHours;
          }
          return sum + (st.actualHours || 0);
        }, 0);

        await taskApiService.updateTaskActualHours(parentTask.id, totalSubtaskHours);
      }

      // Log activity for effort logging
      try {
        if (parentTask) {
          await activityLogApiService.createActivityLog({
            userId: user?.id || '',
            entityType: 'tasks',
            entityId: parentTask.id,
            action: 'effort_logged',
            description: `Logged ${effortLog.hours}h on subtask "${selectedSubtaskForEffort.title}"`,
            newValues: JSON.stringify({
              subtaskId: selectedSubtaskForEffort.id,
              hours: effortLog.hours,
              description: effortLog.description,
              workDate: effortLog.workDate
            }),
            ipAddress: undefined,
            userAgent: undefined
          });
        }
      } catch (error) {
        console.error('Failed to log activity:', error);
      }

      toast.success(`Logged ${effortLog.hours}h effort on subtask successfully`);
      
      // Refresh tasks and subtasks
      if (sprintStories.length > 0) {
        const tasksPromises = sprintStories.map(story => 
          taskApiService.getTasksByStory(story.id)
            .then(response => response.data)
            .catch(() => [])
        );
        const tasksArrays = await Promise.all(tasksPromises);
        const tasks = tasksArrays.flat();
        setAllTasks(tasks); // This will trigger subtasks refetch via useEffect
      }

      setEffortLog({
        hours: 0,
        description: '',
        workDate: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: ''
      });
      setIsLogEffortDialogOpen(false);
      setSelectedSubtaskForEffort(null);
    } catch (error) {
      toast.error('Failed to log effort');
      console.error('Error logging effort:', error);
    }
  };

  // Draggable Story Component with Tasks
  const DraggableStory: React.FC<{ story: Story; index: number }> = ({ story, index }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.STORY,
      item: { id: story.id, type: ItemTypes.STORY },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const handleViewDetails = () => {
      setSelectedStoryForDetails(story);
      setIsStoryDetailsOpen(true);
    };

    // Get tasks for this story
    const storyTasks = getTasksForStory(story.id);

    return (
      <div className="mb-4">
        {/* Story Card - Each story in its own separate row */}
      <div
        ref={drag}
          className={`transition-all cursor-move ${
            isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:scale-[1.01]'
          }`}
        >
          <Card className={`border-l-4 ${
            story.priority === 'CRITICAL' ? 'border-l-red-500 bg-red-50/30' :
            story.priority === 'HIGH' ? 'border-l-orange-500 bg-orange-50/30' :
            story.priority === 'MEDIUM' ? 'border-l-blue-500 bg-blue-50/30' :
            'border-l-green-500 bg-green-50/30'
          } hover:shadow-md transition-shadow rounded-lg overflow-hidden`}>
            <CardContent className="p-4">
              {/* Story Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <Badge variant="outline" className={`text-xs px-2 py-1 ${getPriorityColor(story.priority)} font-medium`}>
                    {story.priority}
                  </Badge>
                  <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 font-medium">
                    ST#{index + 1}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails();
                    }}
                    title="View story details"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Story Insights
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
        
              {/* Story Title */}
              <h4 className="font-semibold text-base mb-3 line-clamp-2 leading-tight text-gray-800">
                {story.title}
              </h4>
              
              {/* Story Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700">
                    {story.storyPoints} pts
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(story.status)} font-medium`}>
                    {story.status.replace('_', ' ')}
                  </Badge>
                  {storyTasks.length > 0 && (
                    <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700">
                      {storyTasks.length} task{storyTasks.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Add Task Button */}
                  {canAddTasks && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewTask(prev => ({ ...prev, storyId: story.id }));
                        setIsAddTaskDialogOpen(true);
                      }}
                      title={`Add task to ${story.title}`}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Task
                    </Button>
                  )}
                  {storyTasks.length > 0 && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      <span className="flex items-center">
                        <div className="w-1 h-1 bg-blue-400 rounded-full mr-1"></div>
                        {storyTasks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Draggable Task Component
  const DraggableTask: React.FC<{ task: Task; index: number; isNested?: boolean }> = ({ task, index, isNested = false }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.TASK,
      item: { id: task.id, type: ItemTypes.TASK },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    // Find the parent story for this task
    const parentStory = sprintStories.find(story => story.id === task.storyId);

    const handleViewTaskDetails = () => {
      setSelectedTaskForDetails(task);
      setIsTaskDetailsOpen(true);
    };

    // JIRA-like calculations
    const taskSubtasks = getSubtasksForTask(task.id);
    const completedSubtasks = taskSubtasks.filter(st => st.isCompleted).length;
    const totalSubtasks = taskSubtasks.length;
    const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    
    // Calculate remaining hours (Estimated - Actual)
    const estimatedHours = task.estimatedHours || 0;
    const actualHours = task.actualHours || 0;
    const remainingHours = Math.max(0, estimatedHours - actualHours);
    
    // Calculate time progress percentage
    const timeProgress = estimatedHours > 0 ? Math.min(100, (actualHours / estimatedHours) * 100) : 0;

    return (
      <div
        ref={drag}
        className={`transition-all cursor-move ${
          isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:scale-[1.01]'
        }`}
      >
        <Card className={`border-l-4 ${
          parentStory?.priority === 'CRITICAL' ? 'border-l-red-500' :
          parentStory?.priority === 'HIGH' ? 'border-l-orange-500' :
          parentStory?.priority === 'MEDIUM' ? 'border-l-blue-500' :
          'border-l-green-500'
        } bg-white hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden`}>
          
          {/* Main Task Section */}
          <CardContent className="p-3 bg-gradient-to-r from-gray-50 to-white">
            {/* Task Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-700 text-white font-bold">
                  TSK-{String(index + 1).padStart(3, '0')}
                </Badge>
                <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0)}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-purple-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTaskForSubtask(task);
                    setNewSubtask(prev => ({ ...prev, taskId: task.id }));
                    setIsAddSubtaskDialogOpen(true);
                  }}
                  title="Add subtask"
                >
                  <Layers3 className="w-3.5 h-3.5 text-purple-600" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-blue-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTaskDetails();
                  }}
                  title="View task details"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                </Button>
              </div>
            </div>
            
            {/* Task Title */}
            <h4 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight text-gray-900">
              {task.title}
            </h4>

            {/* Task Stats Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                {/* Time Tracking - JIRA style (Roll-up from subtasks) */}
                <div className="flex items-center space-x-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                  <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{estimatedHours}h</span>
                  {actualHours > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-600 font-semibold">{actualHours.toFixed(1)}h</span>
                      <span className="text-gray-400">•</span>
                      <span className={`font-semibold ${remainingHours > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {remainingHours.toFixed(1)}h left
                      </span>
                    </>
                  )}
                </div>
                
                {/* Subtask Counter */}
                {totalSubtasks > 0 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-300 font-medium whitespace-nowrap">
                    <Layers3 className="w-3 h-3 mr-1 flex-shrink-0" />
                    {completedSubtasks}/{totalSubtasks}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Assignee */}
                {task.assigneeId && (
                  <Avatar className="h-6 w-6 border-2 border-white shadow-sm">
                    <AvatarFallback className="text-xs bg-gradient-to-br from-blue-200 to-cyan-200 text-blue-900 font-semibold">
                      {getUserName(task.assigneeId).split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            {/* Task Progress Bar (like JIRA) */}
            {totalSubtasks > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500 font-medium">Completion</span>
                  <span className="text-xs font-semibold text-gray-700">{Math.round(subtaskProgress)}%</span>
                </div>
                <Progress value={subtaskProgress} className="h-2" />
              </div>
            )}
          </CardContent>

        </Card>
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
        <div className="flex-1 p-3 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  };

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading projects...</span>
      </div>
    );
  }

  if (!selectedProject && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Projects Found</CardTitle>
            <CardDescription>Create a project first to use the Scrum board</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs value={activeView} onValueChange={setActiveView} className="flex flex-col h-full space-y-6">
        {/* Header with project and sprint selectors */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Project Selector */}
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-80">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <span>{project.name}</span>
              </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Sprint Selector */}
              <Select value={selectedSprint} onValueChange={setSelectedSprint} disabled={!selectedProject || sprintsLoading}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={
                    sprintsLoading ? "Loading sprints..." : 
                    sprints.length === 0 ? "No sprints available" :
                    "Select Sprint"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {sprints.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <p>No sprints found for this project</p>
                      {canManageSprintsAndStories && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            setActiveView('sprint-management');
                            setIsSprintDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Create Sprint
                        </Button>
                      )}
                    </div>
                  ) : (
                    sprints.map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(sprint.status)}>
                            {sprint.status}
                          </Badge>
                          <span>{sprint.name}</span>
                        </div>
                    </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              {/* Sprint Count Badge */}
              {selectedProject && (
                <Badge variant="secondary" className="mr-2">
                  {sprintsLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>{sprints.length} sprint{sprints.length !== 1 ? 's' : ''}</>
                  )}
                </Badge>
              )}
              
              {/* Refresh Button */}
              {selectedProject && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => refetchSprints()}
                  disabled={sprintsLoading}
                  title="Refresh sprints"
                >
                  {sprintsLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    '🔄'
                  )}
                </Button>
              )}
              
              <TabsList>
                <TabsTrigger value="backlog">Backlog</TabsTrigger>
                <TabsTrigger value="scrum-board">Scrum Board</TabsTrigger>
                <TabsTrigger value="sprint-management">Sprint Management</TabsTrigger>
                <TabsTrigger value="burndown">Burndown</TabsTrigger>
              </TabsList>
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
                      <div className="font-semibold text-green-600">
                        {currentSprint.endDate ? 
                          Math.ceil((new Date(currentSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          : 0
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Days Left</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">{currentSprint.velocityPoints || 0}</div>
                      <div className="text-xs text-muted-foreground">Velocity Points</div>
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
                {canManageSprintsAndStories && (
                  <Button onClick={() => setIsAddStoryDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Story
                  </Button>
                )}
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {getFilteredBacklogStories().length} stories
                </Badge>
              </div>
            </div>

            {/* Backlog Grid */}
            {backlogStoriesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getFilteredBacklogStories().map((story, index) => (
                  <DraggableStory key={story.id} story={story} index={index} />
                ))}
              </div>
            )}

            {getFilteredBacklogStories().length === 0 && !backlogStoriesLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No stories in backlog</h3>
                <p className="text-sm">Start by adding some user stories to your project backlog.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scrum-board" className="mt-0 flex-1">
          {/* Story-Row Aligned Grid Scrum Board */}
          {sprintStoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative border rounded-lg overflow-hidden bg-gradient-to-br from-white to-green-50/30">
              {/* Fixed Column Headers */}
              <div className="sticky top-0 z-10 grid grid-cols-6 gap-0 bg-gray-100 border-b shadow-sm">
                <div className="p-3 bg-green-100/80 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm">Stories</span>
                    <Badge variant="secondary" className="text-xs">{sprintStories.length}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-blue-100/80 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-sm">To Do</span>
                    <Badge variant="secondary" className="text-xs">{getTasksByStatus('todo').length}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-orange-100/80 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-sm">In Progress</span>
                    <Badge variant="secondary" className="text-xs">{getTasksByStatus('inprogress').length}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-purple-100/80 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm">QA</span>
                    <Badge variant="secondary" className="text-xs">{getTasksByStatus('qa').length}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-emerald-100/80 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-sm">Done</span>
                    <Badge variant="secondary" className="text-xs">{getTasksByStatus('done').length}</Badge>
                  </div>
                </div>
                <div className="p-3 bg-gray-100/80 flex items-center justify-center">
                    {canManageSprintsAndStories && (
                        <Button
                          variant="outline"
                          size="sm"
                      className="h-7 text-xs border-dashed"
                          onClick={() => setIsAddStoryDialogOpen(true)}
                        >
                      <Plus className="w-3 h-3 mr-1" />
                          Add Story
                        </Button>
                  )}
                </div>
              </div>

              {/* Story Rows Content */}
              <div className="w-full h-[calc(100vh-350px)] overflow-y-auto">
                {sprintStories.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="font-medium text-gray-600 mb-2">No stories in sprint</h3>
                      <p className="text-sm text-gray-500">Add stories to see the grid layout</p>
                    </div>
                  </div>
                ) : (
                  sprintStories.map((story, storyIndex) => {
                    // Get tasks for this story by status
                    // Backend returns: to_do, in_progress, qa_review, done, blocked, cancelled
                    const todoTasks = allTasks.filter(task => 
                      task.storyId === story.id && 
                      (task.status === 'to_do' || task.status === 'TO_DO' || task.status === 'todo' || task.status === 'TODO')
                    );
                    const inProgressTasks = allTasks.filter(task => 
                      task.storyId === story.id && 
                      (task.status === 'in_progress' || task.status === 'IN_PROGRESS' || task.status === 'inprogress' || task.status === 'INPROGRESS')
                    );
                    const qaTasks = allTasks.filter(task => 
                      task.storyId === story.id && 
                      (task.status === 'qa_review' || task.status === 'QA_REVIEW' || task.status === 'qa' || task.status === 'QA')
                    );
                    const doneTasks = allTasks.filter(task => 
                      task.storyId === story.id && 
                      (task.status === 'done' || task.status === 'DONE')
                    );
                    const maxTaskCount = Math.max(todoTasks.length, inProgressTasks.length, qaTasks.length, doneTasks.length, 1);

                    // Debug logging
                    console.log(`Story ${story.id} (${story.title}):`, {
                      allTasksCount: allTasks.length,
                      storyTasks: allTasks.filter(t => t.storyId === story.id),
                      todoTasks: todoTasks.length,
                      inProgressTasks: inProgressTasks.length,
                      qaTasks: qaTasks.length,
                      doneTasks: doneTasks.length,
                      allTaskStatuses: allTasks.map(t => ({ id: t.id, storyId: t.storyId, status: t.status, statusType: typeof t.status }))
                    });

                    // Drop zone component for each cell
                    const TaskDropZone: React.FC<{ status: string; tasks: Task[]; bgClass: string }> = ({ status, tasks, bgClass }) => {
                      const [{ isOver }, drop] = useDrop(() => ({
                        accept: ItemTypes.TASK,
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
                          className={`p-3 border-r border-gray-200 ${bgClass} ${isOver ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset' : ''} transition-all`}
                        >
                          <div className="space-y-2 min-h-[80px]">
                            {tasks.map((task, taskIndex) => (
                              <DraggableTask key={task.id} task={task} index={taskIndex} />
                            ))}
                            {tasks.length === 0 && !isOver && (
                              <div className="text-center py-6 text-gray-300 text-xs">
                                Drop here
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div key={story.id} className={`grid grid-cols-6 gap-0 border-b border-gray-200 ${storyIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        {/* Story Column */}
                        <div className="p-4 border-r border-gray-200 bg-green-50/20" style={{ minHeight: `${maxTaskCount * 120}px` }}>
                          <DraggableStory story={story} index={storyIndex} />
                        </div>

                        {/* To Do Column */}
                        <TaskDropZone status="todo" tasks={todoTasks} bgClass="bg-blue-50/10" />

                        {/* In Progress Column */}
                        <TaskDropZone status="inprogress" tasks={inProgressTasks} bgClass="bg-orange-50/10" />

                        {/* QA Column */}
                        <TaskDropZone status="qa" tasks={qaTasks} bgClass="bg-purple-50/10" />

                        {/* Done Column */}
                        <TaskDropZone status="done" tasks={doneTasks} bgClass="bg-emerald-50/10" />

                        {/* Actions Column */}
                        <div className="p-3 bg-gray-50/30 border-r-0">
                          <div className="sticky top-16 space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full text-xs justify-start"
                              onClick={() => {
                                setSelectedStoryForDetails(story);
                                setIsStoryDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {canAddTasks && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                                onClick={() => {
                                  setNewTask(prev => ({ ...prev, storyId: story.id }));
                                  setIsAddTaskDialogOpen(true);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Task
                              </Button>
                            )}
                </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sprint-management" className="mt-0 flex-1">
          {/* Sprint Management */}
          <div className="space-y-6">
            {/* Sprint Planning Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Sprint Management</h3>
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
            {sprintsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading sprints...</span>
              </div>
            ) : sprints.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No Sprints Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedProject 
                      ? 'This project has no sprints yet. Create your first sprint to get started!' 
                      : 'Select a project to view its sprints'}
                  </p>
                  {canManageSprintsAndStories && selectedProject && (
                    <Button onClick={() => setIsSprintDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Sprint
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
            <div className="grid gap-4">
              {sprints.map(sprint => (
                <Card key={sprint.id} className={`border-2 ${sprint.id === selectedSprint ? 'border-green-200 bg-green-50/30' : 'border-border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(sprint.status)}>
                          {sprint.status}
                        </Badge>
                        <h4 className="font-semibold">{sprint.name}</h4>
                        <Badge variant="outline">
                          {sprintStories.filter(s => s.sprintId === sprint.id).length} stories
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSprintForDetails(sprint);
                            setIsSprintDetailsOpen(true);
                          }}
                          title="View sprint details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSprint(sprint.id)}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">{sprint.goal}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {sprint.endDate ? 
                            Math.ceil((new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                            : 0
                          }
                        </div>
                        <div className="text-xs text-muted-foreground">Days Left</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">{sprint.velocityPoints || 0}</div>
                        <div className="text-xs text-muted-foreground">Velocity Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">{sprint.capacityHours || 0}h</div>
                        <div className="text-xs text-muted-foreground">Capacity</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          {sprint.startDate && new Date(sprint.startDate).toLocaleDateString()} - {sprint.endDate && new Date(sprint.endDate).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="burndown" className="mt-0 flex-1">
          {/* Burndown Chart */}
          {burndownLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : burndownData?.data ? (
            <BurndownChart
              sprintName={currentSprint?.name}
              sprintGoal={currentSprint?.goal}
              startDate={burndownData.data.startDate}
              endDate={burndownData.data.endDate}
              totalStoryPoints={sprintStories.reduce((sum, s) => sum + (s.storyPoints || 0), 0)}
              completedStoryPoints={sprintStories.filter(s => s.status === 'DONE').reduce((sum, s) => sum + (s.storyPoints || 0), 0)}
              data={burndownData.data.dataPoints?.map((point: any) => ({
                date: point.date,
                ideal: point.remainingWork || 0,
                actual: point.remainingWork || 0,
                remaining: point.remainingWork || 0,
                completed: 0
              })) || []}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <h3 className="font-medium mb-2">No Burndown Data</h3>
                <p className="text-sm text-muted-foreground">
                  Burndown data will be available once stories are added to the sprint.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Create Sprint Dialog */}
        <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
          <DialogContent className="max-w-lg">
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
                  value={newSprint.capacityHours}
                  onChange={(e) => setNewSprint(prev => ({ ...prev, capacityHours: e.target.value }))}
                  placeholder="160"
                />
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsSprintDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSprint} disabled={createSprintLoading}>
                {createSprintLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sprint'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Story Dialog */}
        <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add User Story</DialogTitle>
              <DialogDescription>
                Create a new user story for your project
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="story-title">Title</Label>
                <Input
                  id="story-title"
                  value={newStory.title}
                  onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="As a user, I want to..."
                />
              </div>
              <div>
                <Label htmlFor="story-description">Description</Label>
                <Textarea
                  id="story-description"
                  value={newStory.description}
                  onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="story-acceptance">Acceptance Criteria</Label>
                <Textarea
                  id="story-acceptance"
                  value={newStory.acceptanceCriteria}
                  onChange={(e) => setNewStory(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
                  placeholder="Given... When... Then..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="story-points">Story Points</Label>
                  <Input
                    id="story-points"
                    type="number"
                    value={newStory.storyPoints}
                    onChange={(e) => setNewStory(prev => ({ ...prev, storyPoints: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>
                <div>
                  <Label htmlFor="story-priority">Priority</Label>
                  <Select value={newStory.priority} onValueChange={(value) => setNewStory(prev => ({ ...prev, priority: value as Priority }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsAddStoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStory} disabled={createStoryLoading}>
                {createStoryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Story'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Story Details Dialog */}
        <Dialog open={isStoryDetailsOpen} onOpenChange={setIsStoryDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Story Details</DialogTitle>
              <DialogDescription>
                View detailed information about the story
              </DialogDescription>
            </DialogHeader>
            {selectedStoryForDetails && (
              <div className="space-y-6">
                {/* Story Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{selectedStoryForDetails.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`${getPriorityColor(selectedStoryForDetails.priority)}`}>
                        {selectedStoryForDetails.priority}
                      </Badge>
                      <Badge variant="secondary">
                        {selectedStoryForDetails.storyPoints} points
                      </Badge>
                      <Badge variant="outline" className={`${getStatusColor(selectedStoryForDetails.status)}`}>
                        {selectedStoryForDetails.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="space-y-4">
                  {selectedStoryForDetails.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedStoryForDetails.description}
                      </p>
                    </div>
                  )}

                  {selectedStoryForDetails.acceptanceCriteria && (
                    <div>
                      <h4 className="font-medium mb-2">Acceptance Criteria</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedStoryForDetails.acceptanceCriteria}
                      </p>
                    </div>
                  )}

                  {/* Story Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Project</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {getProjectName(selectedStoryForDetails.projectId)}
                      </p>
                    </div>
                    {selectedStoryForDetails.sprintId && (
                      <div>
                        <h4 className="font-medium mb-2">Sprint</h4>
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {getSprintName(selectedStoryForDetails.sprintId)}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Assignee</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedStoryForDetails.assigneeId ? getUserName(selectedStoryForDetails.assigneeId) : 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStoryDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Story Dialog */}
        <Dialog open={isAddStoryDialogOpen} onOpenChange={setIsAddStoryDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Story</DialogTitle>
              <DialogDescription>
                Add a new user story to your project backlog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="story-title">Title *</Label>
                <Input
                  id="story-title"
                  value={newStory.title}
                  onChange={(e) => setNewStory(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="As a user, I want to..."
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="story-description">Description</Label>
                <Textarea
                  id="story-description"
                  value={newStory.description}
                  onChange={(e) => setNewStory(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the user story"
                  rows={3}
                />
              </div>

              {/* Acceptance Criteria */}
              <div>
                <Label htmlFor="acceptance-criteria">Acceptance Criteria</Label>
                <Textarea
                  id="acceptance-criteria"
                  value={newStory.acceptanceCriteria}
                  onChange={(e) => setNewStory(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
                  placeholder="Enter acceptance criteria (one per line)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter each criterion on a new line
                </p>
              </div>

              {/* Row 1: Priority, Story Points, Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="story-priority">Priority *</Label>
                  <Select 
                    value={newStory.priority} 
                    onValueChange={(value: Priority) => setNewStory(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger id="story-priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="story-points">Story Points</Label>
                  <Input
                    id="story-points"
                    type="number"
                    value={newStory.storyPoints}
                    onChange={(e) => setNewStory(prev => ({ ...prev, storyPoints: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="estimated-hours">Estimated Hours</Label>
                  <Input
                    id="estimated-hours"
                    type="number"
                    value={newStory.estimatedHours || ''}
                    onChange={(e) => setNewStory(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || undefined }))}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Row 2: Sprint, Epic, Release */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="story-sprint">Sprint *</Label>
                  <Select 
                    value={newStory.sprintId || (selectedSprint || 'BACKLOG')} 
                    onValueChange={(value) => setNewStory(prev => ({ ...prev, sprintId: value === 'BACKLOG' ? '' : value }))}
                  >
                    <SelectTrigger id="story-sprint">
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACKLOG">No Sprint (Backlog)</SelectItem>
                      {sprints.map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="story-epic">Epic</Label>
                  <Select 
                    value={newStory.epicId || 'NO_EPIC'} 
                    onValueChange={(value) => setNewStory(prev => ({ ...prev, epicId: value === 'NO_EPIC' ? '' : value }))}
                  >
                    <SelectTrigger id="story-epic">
                      <SelectValue placeholder="Select epic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_EPIC">No Epic</SelectItem>
                      {epics.map(epic => (
                        <SelectItem key={epic.id} value={epic.id}>
                          {epic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="story-release">Release</Label>
                  <Select 
                    value={newStory.releaseId || 'NO_RELEASE'} 
                    onValueChange={(value) => setNewStory(prev => ({ ...prev, releaseId: value === 'NO_RELEASE' ? '' : value }))}
                  >
                    <SelectTrigger id="story-release">
                      <SelectValue placeholder="Select release" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_RELEASE">No Release</SelectItem>
                      {releases.map(release => (
                        <SelectItem key={release.id} value={release.id}>
                          {release.name} (v{release.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 3: Assignee, Reporter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="story-assignee">Assignee</Label>
                  <Select 
                    value={newStory.assigneeId || 'UNASSIGNED'} 
                    onValueChange={(value) => setNewStory(prev => ({ ...prev, assigneeId: value === 'UNASSIGNED' ? '' : value }))}
                  >
                    <SelectTrigger id="story-assignee">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="story-reporter">Reporter</Label>
                  <Select 
                    value={newStory.reporterId || 'NO_REPORTER'} 
                    onValueChange={(value) => setNewStory(prev => ({ ...prev, reporterId: value === 'NO_REPORTER' ? '' : value }))}
                  >
                    <SelectTrigger id="story-reporter">
                      <SelectValue placeholder="Select reporter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NO_REPORTER">No Reporter</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Labels */}
              <div>
                <Label htmlFor="story-labels">Labels</Label>
                <Input
                  id="story-labels"
                  value={newStory.labels?.join(', ') || ''}
                  onChange={(e) => setNewStory(prev => ({ 
                    ...prev, 
                    labels: e.target.value.split(',').map(l => l.trim()).filter(l => l) 
                  }))}
                  placeholder="bug, feature, enhancement (comma-separated)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter labels separated by commas
                </p>
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsAddStoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStory} disabled={createStoryLoading}>
                {createStoryLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : 'Create Story'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sprint Details Dialog */}
        <Dialog open={isSprintDetailsOpen} onOpenChange={setIsSprintDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Sprint Details</DialogTitle>
              <DialogDescription>
                View detailed information about the sprint
              </DialogDescription>
            </DialogHeader>
            {selectedSprintForDetails && (
              <div className="space-y-6">
                {/* Sprint Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{selectedSprintForDetails.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(selectedSprintForDetails.status)}>
                        {selectedSprintForDetails.status}
                      </Badge>
                      <Badge variant="secondary">
                        {selectedSprintForDetails.velocityPoints || 0} velocity points
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        {selectedSprintForDetails.capacityHours || 0} hours capacity
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Sprint Content */}
                <div className="space-y-4">
                  {selectedSprintForDetails.goal && (
                    <div>
                      <h4 className="font-medium mb-2">Sprint Goal</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedSprintForDetails.goal}
                      </p>
                    </div>
                  )}

                  {/* Sprint Timeline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Start Date</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedSprintForDetails.startDate ? 
                          new Date(selectedSprintForDetails.startDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not set'
                        }
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">End Date</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedSprintForDetails.endDate ? 
                          new Date(selectedSprintForDetails.endDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not set'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Sprint Duration */}
                  {selectedSprintForDetails.startDate && selectedSprintForDetails.endDate && (
                    <div>
                      <h4 className="font-medium mb-2">Duration</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {Math.ceil((new Date(selectedSprintForDetails.endDate).getTime() - new Date(selectedSprintForDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  )}

                  {/* Sprint Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Stories in Sprint</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        {sprintStories.filter(s => s.sprintId === selectedSprintForDetails.id).length}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Total Story Points</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {sprintStories.filter(s => s.sprintId === selectedSprintForDetails.id)
                          .reduce((sum, s) => sum + (s.storyPoints || 0), 0)} points
                      </p>
                    </div>
                  </div>

                  {/* Sprint Progress */}
                  {selectedSprintForDetails.startDate && selectedSprintForDetails.endDate && (
                    <div>
                      <h4 className="font-medium mb-2">Sprint Progress</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Days remaining</span>
                          <span className={
                            Math.ceil((new Date(selectedSprintForDetails.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 0 
                              ? 'text-red-600 font-semibold' 
                              : 'text-green-600 font-semibold'
                          }>
                            {Math.ceil((new Date(selectedSprintForDetails.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                        <Progress 
                          value={
                            Math.max(0, Math.min(100, 
                              ((new Date().getTime() - new Date(selectedSprintForDetails.startDate).getTime()) / 
                               (new Date(selectedSprintForDetails.endDate).getTime() - new Date(selectedSprintForDetails.startDate).getTime())) * 100
                            ))
                          } 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSprintDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Details Dialog */}
        <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Task Details</DialogTitle>
              <DialogDescription>
                View detailed information about the task
              </DialogDescription>
            </DialogHeader>
            {selectedTaskForDetails && (
              <div className="space-y-6">
                {/* Task Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{selectedTaskForDetails.title}</h3>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(selectedTaskForDetails.priority)}>
                        {selectedTaskForDetails.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(selectedTaskForDetails.status)}>
                        {selectedTaskForDetails.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary">
                        {selectedTaskForDetails.estimatedHours || 0}h estimated
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Task Content */}
                <div className="space-y-4">
                  {selectedTaskForDetails.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                        {selectedTaskForDetails.description}
                      </p>
                    </div>
                  )}

                  {/* Task Metadata Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Story</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {sprintStories.find(s => s.id === selectedTaskForDetails.storyId)?.title || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Assignee</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedTaskForDetails.assigneeId ? getUserName(selectedTaskForDetails.assigneeId) : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Reporter</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedTaskForDetails.reporterId ? getUserName(selectedTaskForDetails.reporterId) : 'No Reporter'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Due Date</h4>
                      <p className="text-sm bg-gray-50 p-2 rounded">
                        {selectedTaskForDetails.dueDate ? 
                          new Date(selectedTaskForDetails.dueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'No due date'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Time Tracking */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Estimated Hours</h4>
                      <p className="text-lg font-semibold text-blue-600">
                        {selectedTaskForDetails.estimatedHours || 0}h
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Actual Hours</h4>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedTaskForDetails.actualHours || 0}h
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Remaining</h4>
                      <p className={`text-lg font-semibold ${
                        (selectedTaskForDetails.estimatedHours || 0) - (selectedTaskForDetails.actualHours || 0) < 0
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`}>
                        {(selectedTaskForDetails.estimatedHours || 0) - (selectedTaskForDetails.actualHours || 0)}h
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {selectedTaskForDetails.estimatedHours && selectedTaskForDetails.estimatedHours > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Progress</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Time spent</span>
                          <span className={
                            ((selectedTaskForDetails.actualHours || 0) / selectedTaskForDetails.estimatedHours) * 100 > 100
                              ? 'text-red-600 font-semibold'
                              : 'text-green-600 font-semibold'
                          }>
                            {Math.round(((selectedTaskForDetails.actualHours || 0) / selectedTaskForDetails.estimatedHours) * 100)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(100, ((selectedTaskForDetails.actualHours || 0) / selectedTaskForDetails.estimatedHours) * 100)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  )}

                  {/* Labels */}
                  {selectedTaskForDetails.labels && selectedTaskForDetails.labels.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Labels</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTaskForDetails.labels.map((label, index) => (
                          <Badge key={index} variant="secondary">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTaskDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subtask Dialog */}
        <Dialog open={isAddSubtaskDialogOpen} onOpenChange={setIsAddSubtaskDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Subtask</DialogTitle>
              <DialogDescription>
                Create a new subtask for: {selectedTaskForSubtask?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subtask-title">Subtask Title</Label>
                <Input
                  id="subtask-title"
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Implement validation logic"
                />
              </div>
              <div>
                <Label htmlFor="subtask-description">Description</Label>
                <Textarea
                  id="subtask-description"
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the subtask..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subtask-priority">Priority</Label>
                  <Select value={newSubtask.priority} onValueChange={(value) => setNewSubtask(prev => ({ ...prev, priority: value as Priority }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subtask-hours">Estimated Hours</Label>
                  <Input
                    id="subtask-hours"
                    type="number"
                    value={newSubtask.estimatedHours}
                    onChange={(e) => setNewSubtask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    placeholder="2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subtask-assignee">Assignee</Label>
                <Select value={newSubtask.assigneeId} onValueChange={(value) => setNewSubtask(prev => ({ ...prev, assigneeId: value === 'UNASSIGNED' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="w-4 h-4">
                            <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAddSubtaskDialogOpen(false);
                setSelectedTaskForSubtask(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddSubtask} disabled={createTaskLoading}>
                {createTaskLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Subtask'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Log Effort Dialog (JIRA-style: on subtasks) */}
        <Dialog open={isLogEffortDialogOpen} onOpenChange={setIsLogEffortDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Log Work</DialogTitle>
              <DialogDescription>
                Log time spent on subtask: {selectedSubtaskForEffort?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Hours */}
              <div>
                <Label htmlFor="effort-hours">Hours Worked *</Label>
                <Input
                  id="effort-hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={effortLog.hours}
                  onChange={(e) => setEffortLog(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 2.5"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="effort-description">Work Description *</Label>
                <Textarea
                  id="effort-description"
                  value={effortLog.description}
                  onChange={(e) => setEffortLog(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                  rows={3}
                />
              </div>

              {/* Work Date */}
              <div>
                <Label htmlFor="effort-date">Work Date</Label>
                <Input
                  id="effort-date"
                  type="date"
                  value={effortLog.workDate}
                  onChange={(e) => setEffortLog(prev => ({ ...prev, workDate: e.target.value }))}
                />
              </div>

              {/* Optional: Start and End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effort-start-time">Start Time (Optional)</Label>
                  <Input
                    id="effort-start-time"
                    type="time"
                    value={effortLog.startTime}
                    onChange={(e) => setEffortLog(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="effort-end-time">End Time (Optional)</Label>
                  <Input
                    id="effort-end-time"
                    type="time"
                    value={effortLog.endTime}
                    onChange={(e) => setEffortLog(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* Current Time Stats (Subtask) */}
              {selectedSubtaskForEffort && (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-sm mb-2 text-purple-900">Subtask Time Stats</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600">Estimated</div>
                      <div className="font-semibold text-blue-700">{selectedSubtaskForEffort.estimatedHours || 0}h</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Logged</div>
                      <div className="font-semibold text-green-700">{selectedSubtaskForEffort.actualHours || 0}h</div>
                    </div>
                    <div>
                      <div className="text-gray-600">After Log</div>
                      <div className="font-semibold text-orange-700">
                        {((selectedSubtaskForEffort.actualHours || 0) + effortLog.hours).toFixed(1)}h
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-200 text-xs text-purple-700">
                    <span className="font-medium">Note:</span> Parent task time will be updated automatically
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => {
                setIsLogEffortDialogOpen(false);
                setSelectedSubtaskForEffort(null);
                setEffortLog({
                  hours: 0,
                  description: '',
                  workDate: new Date().toISOString().split('T')[0],
                  startTime: '',
                  endTime: ''
                });
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleLogEffort}
                disabled={!effortLog.hours || effortLog.hours <= 0 || !effortLog.description.trim()}
              >
                <Clock className="w-4 h-4 mr-2" />
                Log {effortLog.hours}h
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* JIRA-Style Task Details Modal */}
        <Dialog open={isTaskDetailsOpen} onOpenChange={setIsTaskDetailsOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
            {selectedTaskForDetails && (
              <div className="flex h-full">
                {/* Main Content Area (Left Panel) */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-semibold">
                          TSK-{selectedTaskForDetails.id.slice(-4).toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-3"
                        >
                          {selectedTaskForDetails.status.replace('_', ' ')}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => setIsTaskDetailsOpen(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Task Title */}
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedTaskForDetails.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Flag className="w-4 h-4" />
                        <span>{selectedTaskForDetails.priority}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedTaskForDetails.estimatedHours}h estimated</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{selectedTaskForDetails.assigneeId ? getUserName(selectedTaskForDetails.assigneeId) : 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Tabs */}
                  <div className="flex-1 overflow-hidden">
                    <Tabs value={taskDetailsTab} onValueChange={(value) => setTaskDetailsTab(value as any)} className="h-full flex flex-col">
                      <TabsList className="mx-6 mt-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="subtasks">Child Work Items</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="flex-1 overflow-auto p-6 space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            {selectedTaskForDetails.description ? (
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {selectedTaskForDetails.description}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400 italic">Add a description...</p>
                            )}
                          </div>
                        </div>

                        {/* Acceptance Criteria */}
                        {selectedTaskForDetails.acceptanceCriteria && selectedTaskForDetails.acceptanceCriteria.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Acceptance Criteria</h3>
                            <div className="space-y-2">
                              {selectedTaskForDetails.acceptanceCriteria.map((criteria, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{criteria}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Labels */}
                        {selectedTaskForDetails.labels && selectedTaskForDetails.labels.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Labels</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedTaskForDetails.labels.map((label, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="subtasks" className="flex-1 overflow-hidden flex flex-col">
                        {/* Header with Add Subtask Button */}
                        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-semibold text-gray-900">Child Work Items</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={() => {
                                setSelectedTaskForSubtask(selectedTaskForDetails);
                                setNewSubtask(prev => ({ ...prev, taskId: selectedTaskForDetails.id }));
                                setIsAddSubtaskDialogOpen(true);
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Subtask
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress 
                              value={getSubtasksForTask(selectedTaskForDetails.id).length > 0 ? 
                                (getSubtasksForTask(selectedTaskForDetails.id).filter(st => st.isCompleted).length / getSubtasksForTask(selectedTaskForDetails.id).length) * 100 : 0
                              } 
                              className="w-20 h-2" 
                            />
                            <span className="text-xs text-gray-600">
                              {getSubtasksForTask(selectedTaskForDetails.id).filter(st => st.isCompleted).length}/{getSubtasksForTask(selectedTaskForDetails.id).length} Done
                            </span>
                          </div>
                        </div>

                        {/* Scrollable Subtasks List */}
                        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-2" style={{ maxHeight: '400px' }}>
                          {getSubtasksForTask(selectedTaskForDetails.id).map((subtask) => (
                            <div key={subtask.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 group">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  {/* Checkbox */}
                                  <CheckSquare 
                                    className={`w-4 h-4 cursor-pointer hover:scale-110 transition-transform flex-shrink-0 ${
                                      subtask.isCompleted ? 'text-green-500' : 'text-gray-400 hover:text-green-400'
                                    }`}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await subtaskApiService.updateSubtaskCompletion(subtask.id, !subtask.isCompleted);
                                        toast.success(`Subtask ${!subtask.isCompleted ? 'completed' : 'reopened'}`);
                                        // Refresh tasks to update allTasks
                                        const tasksPromises = sprintStories.map(story => 
                                          taskApiService.getTasksByStory(story.id)
                                            .then(response => response.data)
                                            .catch(() => [])
                                        );
                                        const tasksArrays = await Promise.all(tasksPromises);
                                        const tasks = tasksArrays.flat();
                                        setAllTasks(tasks);
                                      } catch (error) {
                                        toast.error('Failed to update subtask');
                                      }
                                    }}
                                  />
                                  
                                  {/* Subtask Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <h4 className={`text-sm font-medium truncate ${subtask.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        {subtask.title}
                                      </h4>
                                      <Badge variant="outline" className={`text-xs px-1.5 py-0 ${getPriorityColor(subtask.priority || 'MEDIUM')}`}>
                                        {subtask.priority || 'MEDIUM'}
                                      </Badge>
                                    </div>
                                    
                                    {/* Compact Meta Info */}
                                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span className="truncate max-w-20">
                                          {subtask.assigneeId ? getUserName(subtask.assigneeId).split(' ')[0] : 'Unassigned'}
                                        </span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-3 h-3" />
                                        <span className="font-medium">
                                          {subtask.estimatedHours || 0}h
                                          {(subtask.actualHours || 0) > 0 && (
                                            <span className="text-blue-600 ml-1">
                                              /{(subtask.actualHours || 0).toFixed(1)}h
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      {subtask.dueDate && (
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="w-3 h-3" />
                                          <span>{new Date(subtask.dueDate).toLocaleDateString('en-GB')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  {/* Log Work Button */}
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-7 px-2 text-xs hover:bg-green-100 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setSelectedSubtaskForEffort(subtask);
                                      setIsLogEffortDialogOpen(true);
                                    }}
                                    title="Log work on this subtask"
                                  >
                                    <Clock className="w-3 h-3 mr-1 text-green-600" />
                                    Log
                                  </Button>
                                  
                                  {/* Status Badge */}
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs px-2 py-0.5"
                                  >
                                    {subtask.status || 'TO DO'}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Progress Bar for Time Tracking */}
                              {(subtask.estimatedHours || 0) > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-gray-500">Time Progress</span>
                                    <span className="text-xs font-medium text-gray-700">
                                      {Math.min(100, ((subtask.actualHours || 0) / (subtask.estimatedHours || 1)) * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={Math.min(100, ((subtask.actualHours || 0) / (subtask.estimatedHours || 1)) * 100)} 
                                    className="h-1.5" 
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {getSubtasksForTask(selectedTaskForDetails.id).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <Layers3 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No subtasks yet</p>
                              <p className="text-xs text-gray-400 mt-1">Use the "Add Subtask" button above to create one</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="activity" className="flex-1 overflow-auto p-6">
                        <TaskActivityLog taskId={selectedTaskForDetails.id} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>

                {/* Sidebar (Right Panel) */}
                <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-auto">
                  <div className="p-6 space-y-6">
                    {/* Improve Work Item */}
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
                      <Zap className="w-4 h-4 mr-2" />
                      Improve Work Item
                    </Button>

                    {/* Details Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Details</h3>
                        <Settings className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="space-y-4">
                        {/* Assignee */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Assignee</label>
                          <div className="flex items-center space-x-2">
                            {selectedTaskForDetails.assigneeId ? (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                  {getUserName(selectedTaskForDetails.assigneeId).split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-400" />
                              </div>
                            )}
                            <span className="text-sm text-gray-700">
                              {selectedTaskForDetails.assigneeId ? getUserName(selectedTaskForDetails.assigneeId) : 'Unassigned'}
                            </span>
                          </div>
                        </div>

                        {/* Priority */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Priority</label>
                          <Badge variant="outline" className={getPriorityColor(selectedTaskForDetails.priority)}>
                            {selectedTaskForDetails.priority}
                          </Badge>
                        </div>

                        {/* Due Date */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Due Date</label>
                          <div className="flex items-center space-x-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span>{selectedTaskForDetails.dueDate ? new Date(selectedTaskForDetails.dueDate).toLocaleDateString() : 'No due date'}</span>
                          </div>
                        </div>

                        {/* Labels */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Labels</label>
                          <div className="flex flex-wrap gap-1">
                            {selectedTaskForDetails.labels && selectedTaskForDetails.labels.length > 0 ? (
                              selectedTaskForDetails.labels.map((label, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">Add labels</span>
                            )}
                          </div>
                        </div>

                        {/* Parent Story */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Parent</label>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                              {sprintStories.find(s => s.id === selectedTaskForDetails.storyId)?.title || 'Unknown Story'}
                            </span>
                          </div>
                        </div>

                        {/* Sprint */}
                        <div>
                          <label className="text-xs font-medium text-gray-600 block mb-1">Sprint</label>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                              {selectedSprint && sprints.find(s => s.id === selectedSprint)?.name || 'No Sprint'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </Tabs>
    </DndProvider>
  );
};

export default ScrumPage;

