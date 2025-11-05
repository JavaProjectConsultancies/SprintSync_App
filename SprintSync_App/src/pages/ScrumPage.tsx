import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  X,
  Paperclip,
  Link
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
import { attachmentApiService } from '../services/api/entities/attachmentApi';
import { useRecentActivityByEntity } from '../hooks/api/useActivityLogs';

import { useProjectById } from '../hooks/api/useProjectById';
import { useProjects } from '../hooks/api/useProjects';
import { useEpics } from '../hooks/api/useEpics';
import { useReleases } from '../hooks/api/useReleases';
import { Sprint, Story, Task, Subtask, TimeEntry, ActivityLog, Priority, SprintStatus, StoryStatus, TaskStatus } from '../types/api';
import AddTaskDialog from '../components/AddTaskDialog';
import LaneConfigurationModal from '../components/LaneConfigurationModal';
import { useWorkflowLanesByProject, useCreateWorkflowLane, useUpdateWorkflowLane, useDeleteWorkflowLane } from '../hooks/api/useWorkflowLanes';
import { WorkflowLane } from '../services/api/entities/workflowLaneApi';

// Drag item types
const ItemTypes = {
  STORY: 'story',
  TASK: 'task',
};

const ScrumPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedProject, setSelectedProject] = useState('');
  const projectInitializedRef = useRef(false);
  const [selectedSprint, setSelectedSprint] = useState('');
  const [activeView, setActiveView] = useState('scrum-board');
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false);
  const [isAddStoryDialogOpen, setIsAddStoryDialogOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isAddSubtaskDialogOpen, setIsAddSubtaskDialogOpen] = useState(false);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] = useState<Task | null>(null);
  const [isStoryDetailsOpen, setIsStoryDetailsOpen] = useState(false);
  const [selectedStoryForDetails, setSelectedStoryForDetails] = useState<Story | null>(null);
  const [storyAttachmentsList, setStoryAttachmentsList] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [isSprintDetailsOpen, setIsSprintDetailsOpen] = useState(false);
  const [selectedSprintForDetails, setSelectedSprintForDetails] = useState<Sprint | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | null>(null);
  const [parentStoryAttachments, setParentStoryAttachments] = useState<any[]>([]);
  const [loadingParentStoryAttachments, setLoadingParentStoryAttachments] = useState(false);
  
  // Workflow lanes state
  const [isLaneConfigModalOpen, setIsLaneConfigModalOpen] = useState(false);
  const [selectedLaneForEdit, setSelectedLaneForEdit] = useState<WorkflowLane | null>(null);
  const [laneCreationSource, setLaneCreationSource] = useState<'inprogress' | 'qa' | null>(null);
  
  // Epics state and dialogs (local epics list for bottom section)
  const [projectEpics, setProjectEpics] = useState<any[]>([]);
  const [isEpicTemplateDialogOpen, setIsEpicTemplateDialogOpen] = useState(false);
  const [isAddEpicDialogOpen, setIsAddEpicDialogOpen] = useState(false);
  const [newEpic, setNewEpic] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Priority,
    status: 'PLANNING' as any,
    startDate: '',
    endDate: ''
  });
  
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
  const [taskDetailsTab, setTaskDetailsTab] = useState<'details' | 'activities' | 'subtasks' | 'due-dates' | 'linked-issues'>('details');
  const [taskComment, setTaskComment] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [backlogFilter, setBacklogFilter] = useState('all');
  
  // Role-based permissions
  const canManageSprintsAndStories = user?.role?.toUpperCase() === 'ADMIN' || user?.role?.toUpperCase() === 'MANAGER';
  const canAddTasks = canManageSprintsAndStories; // Only managers/admins can add tasks
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

  // Attachment state for new story
  const [storyAttachments, setStoryAttachments] = useState<File[]>([]);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);

  // Update sprint in newStory when selectedSprint changes
  useEffect(() => {
    if (selectedSprint && !newStory.sprintId) {
      setNewStory(prev => ({ ...prev, sprintId: selectedSprint }));
    }
  }, [selectedSprint]);

  // Fetch attachments when story details dialog opens
  useEffect(() => {
    const fetchStoryAttachments = async () => {
      if (selectedStoryForDetails?.id && isStoryDetailsOpen) {
        setLoadingAttachments(true);
        try {
          const response = await attachmentApiService.getAttachmentsByEntity('story', selectedStoryForDetails.id);
          setStoryAttachmentsList(response.data || []);
        } catch (error) {
          console.error('Error fetching story attachments:', error);
          setStoryAttachmentsList([]);
        } finally {
          setLoadingAttachments(false);
        }
      } else {
        setStoryAttachmentsList([]);
      }
    };

    fetchStoryAttachments();
  }, [selectedStoryForDetails?.id, isStoryDetailsOpen]);

  // Fetch parent story attachments when task details dialog opens
  useEffect(() => {
    const fetchParentStoryAttachments = async () => {
      if (selectedTaskForDetails?.storyId && isTaskDetailsOpen) {
        setLoadingParentStoryAttachments(true);
        try {
          const response = await attachmentApiService.getAttachmentsByEntity('story', selectedTaskForDetails.storyId);
          setParentStoryAttachments(response.data || []);
        } catch (error) {
          console.error('Error fetching parent story attachments:', error);
          setParentStoryAttachments([]);
        } finally {
          setLoadingParentStoryAttachments(false);
        }
      } else {
        setParentStoryAttachments([]);
      }
    };

    fetchParentStoryAttachments();
  }, [selectedTaskForDetails?.storyId, isTaskDetailsOpen]);

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
    assigneeId: '',
    estimatedHours: 0,
    category: '',
    dueDate: ''
  });
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  
  // Fetch epics for selected project
  useEffect(() => {
    const fetchEpicsForProject = async () => {
      try {
        if (!selectedProject) {
          setProjectEpics([]);
          return;
        }
        const { epicApiService } = await import('../services/api/entities/epicApi');
        const res = await epicApiService.getEpicsByProject(selectedProject);
        // apiClient returns {data}, handle both shapes
        setProjectEpics((res as any).data ?? (Array.isArray(res) ? res : []));
      } catch (e) {
        console.error('Failed to fetch epics by project', e);
        setProjectEpics([]);
      }
    };
    fetchEpicsForProject();
  }, [selectedProject]);

  // API Hooks - Projects
  const { data: projectsData, loading: projectsLoading } = useProjects();
  const { project: currentProject, loading: projectLoading, refetch: refetchProject } = useProjectById(selectedProject || 'SKIP');
  
  // API Hooks - Workflow Lanes
  const { data: workflowLanesData, loading: workflowLanesLoading, refetch: refetchWorkflowLanes } = useWorkflowLanesByProject(selectedProject || 'SKIP');
  const createWorkflowLaneMutation = useCreateWorkflowLane();
  const updateWorkflowLaneMutation = useUpdateWorkflowLane();
  const deleteWorkflowLaneMutation = useDeleteWorkflowLane();
  
  // Extract projects list
  const projects = projectsData || [];

  // Check for project in URL query params or sessionStorage, then ensure a project is selected
  // Extract project ID from query params (as string) for stable dependency
  const projectFromQuery = searchParams.get('project');
  
  useEffect(() => {
    // Only run if we have projects loaded and haven't initialized yet
    if (!projects || projects.length === 0 || projectInitializedRef.current) {
      return;
    }
    
    // First check URL query parameter
    if (projectFromQuery) {
      setSelectedProject(projectFromQuery);
      projectInitializedRef.current = true;
      // Clean up sessionStorage after using it
      try {
        sessionStorage.removeItem('openProjectId');
      } catch {}
      return;
    }
    
    // Fallback to sessionStorage
    try {
      const projectFromStorage = sessionStorage.getItem('openProjectId');
      if (projectFromStorage) {
        setSelectedProject(projectFromStorage);
        projectInitializedRef.current = true;
        sessionStorage.removeItem('openProjectId');
        return;
      }
    } catch {}
    
    // If no project specified anywhere, select first available project
    if (projects && projects.length > 0) {
      const firstProjectId = (projects[0] as any).id || '';
      if (firstProjectId) {
        setSelectedProject(firstProjectId);
        projectInitializedRef.current = true;
      }
    }
  }, [projects, projectFromQuery]);
  
  // Handle URL query parameter changes (when user navigates with ?project=)
  useEffect(() => {
    if (projectFromQuery && projectFromQuery !== selectedProject) {
      setSelectedProject(projectFromQuery);
      try {
        sessionStorage.removeItem('openProjectId');
      } catch {}
    }
  }, [projectFromQuery, selectedProject]);

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
  // Use ref to track previous task IDs to prevent infinite loops
  const previousTaskIdsRef = useRef<string>('');

  // Fetch subtasks when tasks change
  useEffect(() => {
    // Create a stable string representation of task IDs for comparison
    const currentTaskIds = allTasks.map(task => task.id).sort().join(',');
    
    // Only fetch if task IDs actually changed
    if (currentTaskIds === previousTaskIdsRef.current) {
      return;
    }
    
    // Update ref before async operation
    previousTaskIdsRef.current = currentTaskIds;
    
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
  // Use ref to track if we're currently fetching to prevent duplicate calls
  const isFetchingTasksRef = useRef(false);
  
  const fetchAllTasks = useCallback(async (stories: Story[], includeBacklog: boolean = false) => {
    // Prevent concurrent fetches
    if (isFetchingTasksRef.current) {
      return;
    }
    
    if (!selectedProject || (!selectedSprint && !includeBacklog)) {
      setAllTasks([]);
      return;
    }

    isFetchingTasksRef.current = true;
    setTasksLoading(true);
    try {
      const token = localStorage.getItem('authToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg';
      
      // Get backlog stories for the current project
      const currentBacklogStories = selectedProject 
        ? ((Array.isArray(backlogStoriesData) ? backlogStoriesData : backlogStoriesData?.data || []).filter((s: Story) => s.status === 'BACKLOG'))
        : [];
      
      // Get all stories to fetch tasks from (sprint stories + backlog stories)
      const allStoriesToFetch = includeBacklog 
        ? [...stories, ...currentBacklogStories]
        : stories;
      
      if (allStoriesToFetch.length === 0) {
        setAllTasks([]);
        return;
      }
      
      const taskPromises = allStoriesToFetch.map(async (story: Story) => {
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
            return tasks;
          }
          return [];
        } catch (error) {
          console.error(`Error fetching tasks for story ${story.id}:`, error);
          return [];
        }
      });

      const taskArrays = await Promise.all(taskPromises);
      let allTasksFlat = taskArrays.flat();
      
      // Role-based filtering: Non-managers/admins see only their assigned tasks
      if (!canManageSprintsAndStories && user) {
        allTasksFlat = allTasksFlat.filter(task => task.assigneeId === user.id);
        console.log(`Filtered tasks for user ${user.name}: showing ${allTasksFlat.length} assigned tasks`);
      }
      
      console.log(`Fetched ${allTasksFlat.length} tasks from ${allStoriesToFetch.length} stories`);
      setAllTasks(allTasksFlat);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setAllTasks([]);
    } finally {
      setTasksLoading(false);
      isFetchingTasksRef.current = false;
    }
  }, [selectedSprint, selectedProject, canManageSprintsAndStories, user, backlogStoriesData]);

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
  // Memoize arrays to prevent infinite loops from new references on every render
  const sprints = useMemo(() => {
    return selectedProject ? (Array.isArray(sprintsData) ? sprintsData : sprintsData?.data || []) : [];
  }, [selectedProject, sprintsData]);
  
  const currentSprint = useMemo(() => {
    return sprints.find((s: Sprint) => s.id === selectedSprint);
  }, [sprints, selectedSprint]);
  
  const sprintStories = useMemo(() => {
    return selectedSprint ? (Array.isArray(sprintStoriesData) ? sprintStoriesData : sprintStoriesData?.data || []) : [];
  }, [selectedSprint, sprintStoriesData]);
  
  const backlogStories = useMemo(() => {
    return selectedProject ? ((Array.isArray(backlogStoriesData) ? backlogStoriesData : backlogStoriesData?.data || []).filter((s: Story) => s.status === 'BACKLOG')) : [];
  }, [selectedProject, backlogStoriesData]);

  // Workflow lanes - separate into lanes after In Progress and lanes after QA
  const workflowLanes = useMemo(() => {
    const lanes = selectedProject ? (Array.isArray(workflowLanesData) ? workflowLanesData : workflowLanesData?.data || []) : [];
    const sortedLanes = [...lanes].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return sortedLanes;
  }, [selectedProject, workflowLanesData]);
  
  // Calculate custom lanes count separately
  const customLanesCount = useMemo(() => {
    const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];
    const customLanes = workflowLanes.filter(lane => {
      const order = lane.displayOrder || 0;
      return !defaultOrders.includes(order);
    });
    return customLanes.length;
  }, [workflowLanes]);
  
  // Separate lanes into those after In Progress and those after QA
  const lanesAfterInProgress = useMemo(() => {
    const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];
    const allCustomLanes = workflowLanes.filter(lane => {
      const order = lane.displayOrder || 0;
      return !defaultOrders.includes(order);
    });
    const filtered = allCustomLanes.filter(lane => {
      const order = lane.displayOrder || 0;
      return (order > 20 && order < 30) || (order > 2 && order < 3);
    });
    filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return filtered;
  }, [workflowLanes]);
  
  const lanesAfterQA = useMemo(() => {
    const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];
    const allCustomLanes = workflowLanes.filter(lane => {
      const order = lane.displayOrder || 0;
      return !defaultOrders.includes(order);
    });
    const filtered = allCustomLanes.filter(lane => {
      const order = lane.displayOrder || 0;
      return (order > 30 && order < 40) || (order > 3 && order < 4);
    });
    filtered.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return filtered;
  }, [workflowLanes]);
  
  // Log lane count information
  useEffect(() => {
    console.log('=== WORKFLOW LANES COUNT ===');
    console.log('Total lanes fetched:', workflowLanes.length);
    console.log('Custom lanes created:', customLanesCount);
    console.log('Lanes after In Progress:', lanesAfterInProgress.length);
    console.log('Lanes after QA:', lanesAfterQA.length);
    console.log('=== DETAILED LANE INFORMATION ===');
    console.log('Selected Project:', selectedProject);
    console.log('All Lanes:', workflowLanes.map(l => ({
      id: l.id,
      title: l.title,
      color: l.color,
      displayOrder: l.displayOrder,
      statusValue: l.statusValue
    })));
    console.log(`✓ Lanes After In Progress: ${lanesAfterInProgress.length} lane(s)`);
    lanesAfterInProgress.forEach((lane, idx) => {
      console.log(`  ${idx + 1}. ${lane.title} (Order: ${lane.displayOrder})`);
    });
    console.log(`✓ Lanes After QA: ${lanesAfterQA.length} lane(s)`);
    lanesAfterQA.forEach((lane, idx) => {
      console.log(`  ${idx + 1}. ${lane.title} (Order: ${lane.displayOrder})`);
    });
  }, [workflowLanes.length, customLanesCount, lanesAfterInProgress.length, lanesAfterQA.length, selectedProject]);

  // Debug logging (removed excessive dependencies that cause re-renders)
  // Only log when key data actually changes, not on every render
  useEffect(() => {
    console.log('=== SCRUM PAGE DEBUG ===');
    console.log('Selected Project:', selectedProject);
    console.log('Sprints Count:', sprints.length);
    console.log('Selected Sprint:', selectedSprint);
    console.log('Sprint Stories Count:', sprintStories.length);
    console.log('All Tasks Count:', allTasks.length);
    
    if (sprints.length > 0) {
      console.log('✅ Sprints loaded successfully!');
    } else if (selectedProject && !sprintsLoading) {
      console.log('⚠️ No sprints found for project:', selectedProject);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, selectedSprint]); // Reduced dependencies to prevent excessive re-renders

  // Fetch tasks when sprint stories change
  // Use a ref to track previous story IDs to prevent infinite loops
  const previousStoryIdsRef = useRef<string>('');
  
  useEffect(() => {
    // Create a stable string representation of story IDs for comparison
    const currentStoryIds = sprintStories.map((story: Story) => story.id).sort().join(',');
    
    // Only fetch if story IDs actually changed
    if (currentStoryIds === previousStoryIdsRef.current) {
      return;
    }
    
    // Update ref before async operation
    previousStoryIdsRef.current = currentStoryIds;
    
    // Only fetch if we have stories (sprint or backlog)
    if (sprintStories.length > 0 || backlogStories.length > 0) {
      fetchAllTasks(sprintStories, true); // Include backlog stories
    } else {
      // Clear tasks if no stories
      setAllTasks([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintStories, backlogStories]); // Depend on both sprint and backlog stories

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Add window focus listener to refresh tasks when user returns to the page
  // This ensures tasks created from admin panel are visible
  useEffect(() => {
    const handleFocus = () => {
      // Refresh tasks when window gains focus (user returns from admin panel)
      if (selectedProject && (sprintStories.length > 0 || backlogStories.length > 0)) {
        console.log('Window focused - refreshing tasks');
        fetchAllTasks(sprintStories, true);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedProject, sprintStories, backlogStories, fetchAllTasks]);

  // Also refresh tasks periodically (every 30 seconds) to catch external changes
  useEffect(() => {
    if (!selectedProject || (sprintStories.length === 0 && backlogStories.length === 0)) {
      return;
    }

    const interval = setInterval(() => {
      console.log('Periodic task refresh');
      fetchAllTasks(sprintStories, true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedProject, sprintStories, backlogStories, fetchAllTasks]);

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
  const mapTaskStatusToColumn = (status: TaskStatus | string): string => {
    // Check if status matches a custom lane statusValue
    const customLane = workflowLanes.find(lane => 
      lane.statusValue && status === lane.statusValue
    );
    if (customLane) {
      return customLane.statusValue;
    }
    
    // Check if status is a custom lane statusValue (starts with custom_lane_)
    if (typeof status === 'string' && status.startsWith('custom_lane_')) {
      return status;
    }
    
    // Handle TaskStatus enum values
    switch (status as TaskStatus) {
      case 'TO_DO': return 'todo';
      case 'IN_PROGRESS': return 'inprogress';
      case 'QA_REVIEW': return 'qa';
      case 'DONE': return 'done';
      case 'BLOCKED': return 'todo'; // Blocked tasks appear in TODO
      case 'CANCELLED': return 'done'; // Cancelled tasks appear in DONE
      default: 
        return 'todo';
    }
  };

  const mapColumnToTaskStatus = (column: string): TaskStatus | string => {
    // Check if column is a custom lane statusValue
    const customLane = workflowLanes.find(lane => 
      lane.statusValue && lane.statusValue === column
    );
    if (customLane) {
      return customLane.statusValue; // Return custom statusValue as string
    }
    
    switch (column) {
      case 'todo': return 'TO_DO';
      case 'inprogress': return 'IN_PROGRESS';
      case 'qa': return 'QA_REVIEW';
      case 'done': return 'DONE';
      default: 
        // If it's a custom lane statusValue, return it as-is
        if (column && column.startsWith('custom_lane_')) {
          return column;
        }
        return 'TO_DO';
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
    return allTasks
      .filter(task => 
        task.storyId === storyId && 
        sprintStories.some(story => story.id === storyId) // Ensure story is in current sprint
      )
      .sort((a, b) => {
        // Sort by task number, then by creation date if task numbers are the same
        const aNum = a.taskNumber || 0;
        const bNum = b.taskNumber || 0;
        if (aNum !== bNum) {
          return aNum - bNum;
        }
        // Fallback to creation date if task numbers are the same
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  };

  // Get subtasks for a specific task
  const getSubtasksForTask = (taskId: string): Subtask[] => {
    return allSubtasks.filter(subtask => subtask.taskId === taskId);
  };

  // Get tasks by column status (tasks from stories in the current sprint or backlog)
  const getTasksByStatus = useCallback((status: string) => {
    if (status === 'stories') {
      return []; // No tasks in the Stories column
    }
    
    // Filter tasks to include those whose parent stories are in the current sprint OR backlog
    const filteredTasks = allTasks.filter(task => {
      // Check if the task's parent story is in the current sprint or backlog
      const parentStoryInSprint = sprintStories.some(story => story.id === task.storyId);
      const parentStoryInBacklog = backlogStories.some(story => story.id === task.storyId);
      
      if (!parentStoryInSprint && !parentStoryInBacklog) return false;
      
      // Check if task status directly matches the status (for custom lanes)
      if (task.status === status) return true;
      
      // Only show tasks whose parent story is in sprint/backlog AND status matches the column
      const mappedStatus = mapTaskStatusToColumn(task.status);
      return mappedStatus === status;
    });
    
    return filteredTasks;
  }, [allTasks, sprintStories, backlogStories, workflowLanes, mapTaskStatusToColumn]);

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

    // Sort tasks by task number within each story group
    Object.keys(grouped).forEach(storyTitle => {
      grouped[storyTitle].tasks.sort((a, b) => {
        const aNum = a.taskNumber || 0;
        const bNum = b.taskNumber || 0;
        if (aNum !== bNum) {
          return aNum - bNum;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    });

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

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Helper function to create attachment with file
  const uploadFileAndCreateAttachment = async (file: File, entityType: string, entityId: string): Promise<void> => {
    try {
      // Convert file to base64 data URL
      const fileDataUrl = await fileToBase64(file);
      const fileType = file.type || 'application/octet-stream';
      
      // Create attachment record directly with base64 data URL
      await attachmentApiService.createAttachment({
        uploadedBy: user?.id,
        entityType,
        entityId,
        fileName: file.name,
        fileSize: file.size,
        fileType,
        fileUrl: fileDataUrl, // Store as base64 data URL
        thumbnailUrl: undefined,
        isPublic: true
      });
    } catch (error) {
      console.error('Error creating attachment:', error);
      throw error;
    }
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

    const createdStory = await createStoryMutate(storyData as any);
    
    // Upload attachments if any
    if (storyAttachments.length > 0 && createdStory?.data?.id) {
      setUploadingAttachments(true);
      try {
        const uploadPromises = storyAttachments.map(file => 
          uploadFileAndCreateAttachment(file, 'story', createdStory.data.id)
        );
        await Promise.all(uploadPromises);
        toast.success(`Story created with ${storyAttachments.length} attachment(s)`);
      } catch (error) {
        console.error('Error uploading attachments:', error);
        toast.error('Story created but some attachments failed to upload');
      } finally {
        setUploadingAttachments(false);
      }
    } else {
      toast.success('Story created successfully');
    }
    
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
    setStoryAttachments([]);
    
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
      // Check if newStatus is a valid default status or a custom lane statusValue
      const validStatuses = ['todo', 'inprogress', 'qa', 'done'];
      const isCustomLane = workflowLanes.some(lane => lane.statusValue === newStatus);
      
      if (validStatuses.includes(newStatus) || isCustomLane) {
        const task = allTasks.find(t => t.id === id);
        const oldStatus = task?.status;
        const mappedStatus = mapColumnToTaskStatus(newStatus);
        
        await updateTaskStatusMutate({
            id,
            status: mappedStatus as any // Allow custom status strings
          });
          
        // Log activity
        try {
          await activityLogApiService.createActivityLog({
            userId: user?.id || '',
            entityType: 'tasks',
            entityId: id,
            action: 'status_changed',
            description: `Changed status from ${oldStatus} to ${mappedStatus}`,
            oldValues: JSON.stringify({ status: oldStatus }),
            newValues: JSON.stringify({ status: mappedStatus }),
            ipAddress: undefined, // Not tracking IP from frontend
            userAgent: undefined  // Not tracking user agent from frontend
          });
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
        
        toast.success('Task status updated');
        // Refetch tasks to update the UI (include backlog stories)
        await fetchAllTasks(sprintStories, true);
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
  const handleAddStory = async () => {
    if (!canManageSprintsAndStories) return;
    
    const createdStory = await createStoryMutate({
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
      } as any);
    
    // Upload attachments if any
    if (storyAttachments.length > 0 && createdStory?.data?.id) {
      setUploadingAttachments(true);
      try {
        const uploadPromises = storyAttachments.map(file => 
          uploadFileAndCreateAttachment(file, 'story', createdStory.data.id)
        );
        await Promise.all(uploadPromises);
        toast.success(`Story created with ${storyAttachments.length} attachment(s)`);
      } catch (error) {
        console.error('Error uploading attachments:', error);
        toast.error('Story created but some attachments failed to upload');
      } finally {
        setUploadingAttachments(false);
      }
    } else {
      toast.success('Story created successfully');
    }
      
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
    setStoryAttachments([]);
    setIsAddStoryDialogOpen(false);
  };

  // Add Task Handler - Updated to accept AddTaskDialog format
  // AddTaskDialog now returns assignee as user ID
  // Handler for creating/updating workflow lane
  const handleCreateWorkflowLane = async (laneData: Partial<WorkflowLane>) => {
    try {
      if (selectedLaneForEdit?.id) {
        await updateWorkflowLaneMutation.mutate({ id: selectedLaneForEdit.id, lane: laneData });
        toast.success('Workflow lane updated successfully');
      } else {
        if (!laneData.projectId) {
          toast.error('Project ID is required');
          return;
        }
        if (!laneData.title || !laneData.title.trim()) {
          toast.error('Lane title is required');
          return;
        }
        
        if (!laneData.displayOrder || laneData.displayOrder === 0) {
          const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];
          const customLanes = workflowLanes.filter(l => {
            const order = l.displayOrder || 0;
            return !defaultOrders.includes(order);
          });
          
          if (laneCreationSource === 'inprogress') {
            const lanesAfterInProgress = customLanes.filter(l => {
              const order = l.displayOrder || 0;
              return order > 20 && order < 30;
            });
            const maxOrder = lanesAfterInProgress.length > 0 
              ? Math.max(...lanesAfterInProgress.map(l => l.displayOrder || 0))
              : 20;
            laneData.displayOrder = Math.min(maxOrder + 1, 29);
          } else if (laneCreationSource === 'qa') {
            const lanesAfterQA = customLanes.filter(l => {
              const order = l.displayOrder || 0;
              return order > 30 && order < 40;
            });
            const maxOrder = lanesAfterQA.length > 0 
              ? Math.max(...lanesAfterQA.map(l => l.displayOrder || 0))
              : 30;
            laneData.displayOrder = Math.min(maxOrder + 1, 39);
          } else {
            const lanesAfterQA = customLanes.filter(l => {
              const order = l.displayOrder || 0;
              return order > 30 && order < 40;
            });
            const maxOrder = lanesAfterQA.length > 0 
              ? Math.max(...lanesAfterQA.map(l => l.displayOrder || 0))
              : 30;
            laneData.displayOrder = Math.min(maxOrder + 1, 39);
          }
        }
        
        // Fetch lanes from database and check if lane already exists
        const defaultOrders = [1, 2, 3, 4, 10, 20, 30, 40];
        const existingLane = workflowLanes.find(l => 
          l.title.toLowerCase() === laneData.title?.toLowerCase().trim() && 
          l.projectId === laneData.projectId &&
          !defaultOrders.includes(l.displayOrder || 0)
        );
        
        if (existingLane) {
          toast.error('A lane with this name already exists for this project. Please use a different name.');
          return;
        }
        
        // Check if lane exists in other sections (to prevent duplicate creation)
        const allExistingLanes = workflowLanes.filter(l => 
          l.projectId === laneData.projectId &&
          !defaultOrders.includes(l.displayOrder || 0)
        );
        
        // If lane with same title exists in any section, don't create
        const duplicateLane = allExistingLanes.find(l => 
          l.title.toLowerCase() === laneData.title?.toLowerCase().trim()
        );
        
        if (duplicateLane) {
          toast.error(`A lane named "${laneData.title}" already exists in this project. Please use a different name.`);
          return;
        }
        
        await createWorkflowLaneMutation.mutate(laneData);
        toast.success('Workflow lane created successfully');
      }
      await refetchWorkflowLanes();
      setIsLaneConfigModalOpen(false);
      setSelectedLaneForEdit(null);
      setLaneCreationSource(null);
    } catch (error: any) {
      console.error('Error saving workflow lane:', error);
      const errorMessage = error?.message || error?.details?.error || 'Unknown error occurred';
      toast.error(selectedLaneForEdit?.id 
        ? `Failed to update workflow lane: ${errorMessage}` 
        : `Failed to create workflow lane: ${errorMessage}`);
    }
  };

  // Handler for deleting workflow lane
  const handleDeleteWorkflowLane = async (laneId: string) => {
    if (!window.confirm('Are you sure you want to delete this workflow lane? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteWorkflowLaneMutation.mutate(laneId);
      toast.success('Workflow lane deleted successfully');
      refetchWorkflowLanes();
    } catch (error) {
      console.error('Error deleting workflow lane:', error);
      toast.error('Failed to delete workflow lane');
    }
  };

  // Handler for opening lane configuration modal (for editing)
  const handleOpenLaneConfig = (lane?: WorkflowLane) => {
    setSelectedLaneForEdit(lane || null);
    setIsLaneConfigModalOpen(true);
  };

  // Handler for opening lane configuration modal for a specific status
  const handleOpenLaneConfigForStatus = (status: string) => {
    console.log('handleOpenLaneConfigForStatus called with status:', status);
    if (status === 'inprogress') {
      setLaneCreationSource('inprogress');
    } else if (status === 'qa') {
      setLaneCreationSource('qa');
    } else {
      setLaneCreationSource(null);
    }
    setSelectedLaneForEdit(null);
    console.log('Setting isLaneConfigModalOpen to true');
    setIsLaneConfigModalOpen(true);
    console.log('Modal should now be open');
  };

  const handleAddTask = async (taskDataFromDialog: any) => {
    try {
      // The dialog now sends assignee as user ID directly
      let assigneeId: string | undefined = undefined;
      const assigneeValue = taskDataFromDialog.assignee;
      if (assigneeValue) {
        // If it's already an ID (starts with 'USER' or is a valid ID format), use it directly
        // Otherwise, try to map name to ID for backward compatibility
        if (assigneeValue.startsWith('USER') || assigneeValue.length > 10) {
          assigneeId = assigneeValue;
        } else {
          // Fallback: find user by name (for backward compatibility)
          const foundUser = users.find((u: any) => {
            const userName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
            const emailUser = u.email?.split('@')[0].replace(/\./g, ' ');
            return userName === assigneeValue || 
                   emailUser?.toLowerCase() === assigneeValue.toLowerCase() ||
                   u.name === assigneeValue ||
                   `${u.name || ''} Manager`.toLowerCase() === assigneeValue.toLowerCase();
          });
          assigneeId = foundUser?.id || foundUser?.userId;
        }
      }

      // Map priority from dialog format (high/medium/low) to API format (HIGH/MEDIUM/LOW)
      const priorityMap: Record<string, Priority> = {
        'high': 'HIGH',
        'medium': 'MEDIUM',
        'low': 'LOW'
      };
      const apiPriority = priorityMap[taskDataFromDialog.priority?.toLowerCase() || 'medium'] || 'MEDIUM';

      // Map status from dialog format (todo/inprogress/qa/done) to API format
      const statusMap: Record<string, TaskStatus> = {
        'todo': 'TO_DO',
        'inprogress': 'IN_PROGRESS',
        'qa': 'QA_REVIEW',
        'review': 'QA_REVIEW',
        'done': 'DONE'
      };
      const apiStatus = statusMap[taskDataFromDialog.status?.toLowerCase() || 'todo'] || 'TO_DO';

      // Map due date format (dd/MM/yy) to ISO string
      let dueDate: string | undefined = undefined;
      if (taskDataFromDialog.dueDate) {
        try {
          // Try parsing dd/MM/yy format
          const [day, month, year] = taskDataFromDialog.dueDate.split('/');
          if (day && month && year) {
            const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
            const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime())) {
              dueDate = date.toISOString().split('T')[0];
            }
          }
        } catch (e) {
          // If parsing fails, try using as-is if it's already ISO format
          dueDate = taskDataFromDialog.dueDate;
        }
      }

      // Create task data in API format
      const taskData = {
        storyId: taskDataFromDialog.storyId || '',
        title: taskDataFromDialog.title,
        description: taskDataFromDialog.description || '',
        status: apiStatus,
        priority: apiPriority,
        assigneeId: assigneeId,
        reporterId: user?.id || '',
        estimatedHours: taskDataFromDialog.estimatedHours || 0,
        actualHours: 0,
        orderIndex: 0,
        dueDate: dueDate,
        labels: []
      };
      
      // Create task via API
      const response = await createTaskMutate(taskData);
      
      if (response && response.data) {
        // Upload attachments if any
        if (taskDataFromDialog.attachments && taskDataFromDialog.attachments.length > 0) {
          try {
            const uploadPromises = taskDataFromDialog.attachments.map((file: File) => 
              uploadFileAndCreateAttachment(file, 'task', response.data.id)
            );
            await Promise.all(uploadPromises);
            toast.success(`Task created with ${taskDataFromDialog.attachments.length} attachment(s)`);
          } catch (error) {
            console.error('Error uploading attachments:', error);
            toast.error('Task created but some attachments failed to upload');
          }
        } else {
          toast.success('Task created successfully');
        }

        // Log activity
        try {
          await activityLogApiService.createActivityLog({
            userId: user?.id || '',
            entityType: 'tasks',
            entityId: response.data.id,
            action: 'created',
            description: `Created task "${taskDataFromDialog.title}"${taskDataFromDialog.attachments && taskDataFromDialog.attachments.length > 0 ? ` with ${taskDataFromDialog.attachments.length} attachment(s)` : ''}`,
            newValues: JSON.stringify(taskData),
            ipAddress: undefined,
            userAgent: undefined
          });
        } catch (error) {
          console.error('Failed to log activity:', error);
        }
        
        // Refresh tasks and stories (both sprint and backlog)
        refetchSprintStories();
        refetchBacklogStories();
        // Refetch tasks after a short delay to ensure stories are updated
        setTimeout(() => {
          fetchAllTasks(sprintStories, true);
        }, 500);
      } else {
        throw new Error('Failed to create task');
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error(error?.message || 'Failed to create task. Please try again.');
    }
  };

  // View Task Details Handler (JIRA-style) - will be defined in component scope

  // Handle subtask dialog close
  const handleSubtaskDialogClose = (open: boolean) => {
    setIsAddSubtaskDialogOpen(open);
    if (!open) {
      setNewSubtask({
        title: '',
        description: '',
        taskId: '',
        assigneeId: '',
        estimatedHours: 0,
        category: '',
        dueDate: ''
      });
      setSelectedTaskForSubtask(null);
    }
  };

  // Add Subtask Handler
  const handleAddSubtask = async () => {
    if (!newSubtask.title.trim()) {
      toast.error('Please enter a subtask title');
      return;
    }
    
    setIsCreatingSubtask(true);
    try {
      // Format due date if provided
      let formattedDueDate: string | undefined = undefined;
      if (newSubtask.dueDate) {
        try {
          const date = new Date(newSubtask.dueDate);
          if (!isNaN(date.getTime())) {
            formattedDueDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting due date:', e);
        }
      }

      const subtaskData = {
        taskId: selectedTaskForSubtask?.id || '',
        title: newSubtask.title,
        description: newSubtask.description,
        isCompleted: false,
        assigneeId: newSubtask.assigneeId || undefined,
        estimatedHours: newSubtask.estimatedHours,
        actualHours: 0,
        orderIndex: 0,
        dueDate: formattedDueDate,
        category: newSubtask.category || undefined,
        labels: []
      };
      
      const result = await subtaskApiService.createSubtask(subtaskData);
      console.log('Subtask created result:', result);
      
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
      
      // Manually refetch subtasks for the specific task to update the display immediately
      if (selectedTaskForSubtask) {
        try {
          const response = await subtaskApiService.getSubtasksByTask(selectedTaskForSubtask.id);
          // Update allSubtasks with the new data
          setAllSubtasks(prev => {
            // Remove existing subtasks for this task and add new ones
            const otherSubtasks = prev.filter(st => st.taskId !== selectedTaskForSubtask.id);
            return [...otherSubtasks, ...response.data];
          });
          
          // Also reset the previousTaskIdsRef to force refetch on next change
          previousTaskIdsRef.current = '';
        } catch (error) {
          console.error('Failed to refetch subtasks:', error);
        }
      }
      
      // Also refetch all tasks to ensure everything is in sync
      if (sprintStories.length > 0) {
        fetchAllTasks(sprintStories, true);
      }
      
      setIsAddSubtaskDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create subtask');
      console.error('Error creating subtask:', error);
    } finally {
      setIsCreatingSubtask(false);
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
          
          {/* Epic Template Dialog */}
          <Dialog open={isEpicTemplateDialogOpen} onOpenChange={setIsEpicTemplateDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Epic Template</DialogTitle>
                <DialogDescription>Choose a template to create an epic for this project.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {[
                  { id: 'tpl-auth', title: 'User Authentication', summary: 'Implement secure login/registration', priority: 'HIGH', status: 'PLANNING' },
                  { id: 'tpl-payments', title: 'Payment Gateway Integration', summary: 'Integrate multiple payment providers', priority: 'CRITICAL', status: 'PLANNING' },
                  { id: 'tpl-dashboard', title: 'Analytics Dashboard', summary: 'Interactive charts and KPIs', priority: 'MEDIUM', status: 'PLANNING' },
                ].map(tpl => (
                  <Card key={tpl.id} className="cursor-pointer hover:shadow" onClick={async () => {
                    if (!selectedProject) { toast.error('Select a project first'); return; }
                    try {
                      const payload: any = {
                        title: tpl.title,
                        description: tpl.summary,
                        summary: tpl.summary,
                        projectId: selectedProject,
                        status: tpl.status,
                        priority: tpl.priority,
                        owner: user?.id || '',
                        isActive: true
                      };
                      const { epicApiService } = await import('../services/api/entities/epicApi');
                      await epicApiService.createEpic(payload);
                      const list = await epicApiService.getEpicsByProject(selectedProject);
                      setProjectEpics((list as any).data ?? (Array.isArray(list) ? list : []));
                      setIsEpicTemplateDialogOpen(false);
                      toast.success('Epic created from template');
                    } catch (e: any) {
                      console.error(e);
                      toast.error(e?.message || 'Failed to create epic');
                    }
                  }}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{tpl.title}</h4>
                          <p className="text-sm text-muted-foreground">{tpl.summary}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{tpl.priority.toString().toLowerCase()}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Epic Dialog */}
          <Dialog open={isAddEpicDialogOpen} onOpenChange={setIsAddEpicDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Epic</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input value={newEpic.title} onChange={(e) => setNewEpic(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={newEpic.description} onChange={(e) => setNewEpic(prev => ({ ...prev, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Priority</Label>
                    <Select value={newEpic.priority} onValueChange={(v) => setNewEpic(prev => ({ ...prev, priority: v as any }))}>
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
                    <Label>Status</Label>
                    <Select value={newEpic.status} onValueChange={(v) => setNewEpic(prev => ({ ...prev, status: v as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNING">Planning</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddEpicDialogOpen(false)}>Cancel</Button>
                <Button onClick={async () => {
                  if (!selectedProject) { toast.error('Select a project first'); return; }
                  if (!newEpic.title.trim()) { toast.error('Title is required'); return; }
                  try {
                    const payload: any = {
                      title: newEpic.title,
                      description: newEpic.description,
                      projectId: selectedProject,
                      status: newEpic.status,
                      priority: newEpic.priority,
                      owner: user?.id || '',
                      isActive: true
                    };
                    const { epicApiService } = await import('../services/api/entities/epicApi');
                    await epicApiService.createEpic(payload);
              const list = await epicApiService.getEpicsByProject(selectedProject);
              setProjectEpics((list as any).data ?? (Array.isArray(list) ? list : []));
                    setIsAddEpicDialogOpen(false);
                    setNewEpic({ title: '', description: '', priority: 'MEDIUM', status: 'PLANNING', startDate: '', endDate: '' });
                    toast.success('Epic created');
                  } catch (e: any) {
                    console.error(e);
                    toast.error(e?.message || 'Failed to create epic');
                  }
                }}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
        fetchAllTasks(sprintStories, true);
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

    // Get task number (default to index + 1 if not set)
    const taskNumber = task.taskNumber || (index + 1);
    
    // Get assignee name
    const assigneeName = task.assigneeId ? getUserName(task.assigneeId) : null;

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
          
          {/* Main Task Section - Simplified to show only name */}
          <CardContent className="p-3 bg-gradient-to-r from-gray-50 to-white">
            {/* Task Header with Number and Assignee */}
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-medium">
                T{taskNumber}
              </Badge>
              {assigneeName && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600 truncate max-w-[100px]" title={assigneeName}>
                    {assigneeName}
                  </span>
                </div>
              )}
            </div>
            
            {/* Task Name - Clickable */}
            <h4 
              className="font-semibold text-sm leading-tight text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleViewTaskDetails();
              }}
              title="Click to view task details"
            >
              {task.title}
            </h4>
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
                    {(() => {
                      const daysLeft = currentSprint.endDate 
                        ? Math.ceil((new Date(currentSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        : 0;
                      return daysLeft > 0 ? (
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{daysLeft}</div>
                          <div className="text-xs text-muted-foreground">Days Left</div>
                        </div>
                      ) : null;
                    })()}
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
              <div 
                className="sticky top-0 z-10 grid gap-0 bg-gray-100 border-b shadow-sm"
                style={{ 
                  gridTemplateColumns: `minmax(200px, 1fr) repeat(${3 + lanesAfterInProgress.length + lanesAfterQA.length}, minmax(180px, 1fr)) minmax(180px, 1fr) minmax(150px, 1fr)`
                }}
              >
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
                {/* Default In Progress Column */}
                <div className="p-3 bg-orange-100/80 border-r border-gray-200 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <PlayCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <span className="font-semibold text-sm whitespace-nowrap">In Progress</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{getTasksByStatus('inprogress').length}</Badge>
                    </div>
                    {canManageSprintsAndStories && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-orange-200 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4 text-orange-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Add Lane clicked from In Progress');
                              handleOpenLaneConfigForStatus('inprogress');
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Add Lane
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              const lane = workflowLanes.find(l => 
                                l.statusValue?.toLowerCase().includes('in_progress') || 
                                l.statusValue?.toLowerCase().includes('inprogress')
                              );
                              if (lane?.id) {
                                handleDeleteWorkflowLane(lane.id);
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Lane
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                
                {/* Render Custom Lanes After In Progress (before QA) */}
                {lanesAfterInProgress.map((lane) => {
                    const tasksInLane = getTasksByStatus(lane.statusValue);
                    const laneColor = lane.color || '#3B82F6';
                    // Convert hex color to RGB for background opacity
                    const hexToRgb = (hex: string) => {
                      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                      return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                      } : { r: 59, g: 130, b: 246 };
                    };
                    const rgb = hexToRgb(laneColor);
                    const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
                    const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                    
                    return (
                      <div 
                        key={lane.id} 
                        className="p-3 border-r border-gray-200 min-w-[180px]"
                        style={{ 
                          backgroundColor: bgColor,
                          borderRightColor: borderColor
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: laneColor }}
                            />
                            <span className="font-semibold text-sm whitespace-nowrap" style={{ color: laneColor }}>
                              {lane.title}
                            </span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{tasksInLane.length}</Badge>
                            {lane.wipLimitEnabled && lane.wipLimit && (
                              <Badge 
                                variant={tasksInLane.length > lane.wipLimit ? "destructive" : "secondary"}
                                className="text-xs flex-shrink-0"
                              >
                                WIP: {tasksInLane.length}/{lane.wipLimit}
                              </Badge>
                            )}
                          </div>
                          {canManageSprintsAndStories && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  style={{ color: laneColor }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleOpenLaneConfig(lane)}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure Lane
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteWorkflowLane(lane.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Lane
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {lane.objective && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1 truncate">{lane.objective}</p>
                        )}
                      </div>
                    );
                  })}
                
                {/* Default QA Column */}
                <div className="p-3 bg-purple-100/80 border-r border-gray-200 min-w-[180px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="font-semibold text-sm whitespace-nowrap">QA</span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{getTasksByStatus('qa').length}</Badge>
                    </div>
                    {canManageSprintsAndStories && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-purple-200 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <MoreHorizontal className="w-4 h-4 text-purple-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Add Lane clicked from QA');
                              handleOpenLaneConfigForStatus('qa');
                            }}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Add Lane
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              const lane = workflowLanes.find(l => 
                                l.statusValue?.toLowerCase().includes('qa') || 
                                l.statusValue?.toLowerCase().includes('review')
                              );
                              if (lane?.id) {
                                handleDeleteWorkflowLane(lane.id);
                              }
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Lane
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                
                {/* Render Custom Lanes After QA (before Done) */}
                {lanesAfterQA.map((lane) => {
                    const tasksInLane = getTasksByStatus(lane.statusValue);
                    const laneColor = lane.color || '#3B82F6';
                    // Convert hex color to RGB for background opacity
                    const hexToRgb = (hex: string) => {
                      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                      return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                      } : { r: 59, g: 130, b: 246 };
                    };
                    const rgb = hexToRgb(laneColor);
                    const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
                    const borderColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
                    
                    return (
                      <div 
                        key={lane.id} 
                        className="p-3 border-r border-gray-200 min-w-[180px]"
                        style={{ 
                          backgroundColor: bgColor,
                          borderRightColor: borderColor
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                              style={{ backgroundColor: laneColor }}
                            />
                            <span className="font-semibold text-sm whitespace-nowrap" style={{ color: laneColor }}>
                              {lane.title}
                            </span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">{tasksInLane.length}</Badge>
                            {lane.wipLimitEnabled && lane.wipLimit && (
                              <Badge 
                                variant={tasksInLane.length > lane.wipLimit ? "destructive" : "secondary"}
                                className="text-xs flex-shrink-0"
                              >
                                WIP: {tasksInLane.length}/{lane.wipLimit}
                              </Badge>
                            )}
                          </div>
                          {canManageSprintsAndStories && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  style={{ color: laneColor }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleOpenLaneConfig(lane)}
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Configure Lane
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteWorkflowLane(lane.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Lane
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {lane.objective && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1 truncate">{lane.objective}</p>
                        )}
                      </div>
                    );
                  })}
                
                <div className="p-3 bg-emerald-100/80 border-r border-gray-200 min-w-[180px]">
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
                    const TaskDropZone: React.FC<{ status: string; tasks: Task[]; bgClass: string; style?: React.CSSProperties }> = ({ status, tasks, bgClass, style }) => {
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
                          style={style}
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

                    // Helper to get tasks for a custom lane
                    const getTasksForLane = (statusValue: string) => {
                      return allTasks.filter(task => {
                        if (task.storyId !== story.id) return false;
                        // Check if task status directly matches the lane's statusValue
                        if (task.status === statusValue) return true;
                        // Also check mapped status
                        const mappedColumn = mapTaskStatusToColumn(task.status);
                        return mappedColumn === statusValue;
                      });
                    };

                    return (
                      <div 
                        key={story.id} 
                        className={`grid gap-0 border-b border-gray-200 ${storyIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                        style={{ 
                          gridTemplateColumns: `minmax(200px, 1fr) repeat(${3 + lanesAfterInProgress.length + lanesAfterQA.length}, minmax(180px, 1fr)) minmax(180px, 1fr) minmax(150px, 1fr)`
                        }}
                      >
                        {/* Story Column */}
                        <div className="p-4 border-r border-gray-200 bg-green-50/20" style={{ minHeight: `${maxTaskCount * 120}px` }}>
                          <DraggableStory story={story} index={storyIndex} />
                        </div>

                        {/* To Do Column */}
                        <TaskDropZone status="todo" tasks={todoTasks} bgClass="bg-blue-50/10" style={{ minWidth: '180px' }} />

                        {/* In Progress Column */}
                        <TaskDropZone status="inprogress" tasks={inProgressTasks} bgClass="bg-orange-50/10" style={{ minWidth: '180px' }} />

                        {/* Render custom lanes after In Progress */}
                        {lanesAfterInProgress.map((lane) => {
                          const laneTasks = getTasksForLane(lane.statusValue);
                          const laneColor = lane.color || '#3B82F6';
                          const hexToRgb = (hex: string) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result ? {
                              r: parseInt(result[1], 16),
                              g: parseInt(result[2], 16),
                              b: parseInt(result[3], 16)
                            } : { r: 59, g: 130, b: 246 };
                          };
                          const rgb = hexToRgb(laneColor);
                          const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
                          
                          return (
                            <TaskDropZone 
                              key={lane.id}
                              status={lane.statusValue} 
                              tasks={laneTasks} 
                              bgClass=""
                              style={{ backgroundColor: bgColor, minWidth: '180px' }}
                            />
                          );
                        })}

                        {/* Default QA Column */}
                        <TaskDropZone status="qa" tasks={qaTasks} bgClass="bg-purple-50/10" style={{ minWidth: '180px' }} />

                        {/* Render custom lanes after QA */}
                        {lanesAfterQA.map((lane) => {
                          const laneTasks = getTasksForLane(lane.statusValue);
                          const laneColor = lane.color || '#3B82F6';
                          const hexToRgb = (hex: string) => {
                            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                            return result ? {
                              r: parseInt(result[1], 16),
                              g: parseInt(result[2], 16),
                              b: parseInt(result[3], 16)
                            } : { r: 59, g: 130, b: 246 };
                          };
                          const rgb = hexToRgb(laneColor);
                          const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`;
                          
                          return (
                            <TaskDropZone 
                              key={lane.id}
                              status={lane.statusValue} 
                              tasks={laneTasks} 
                              bgClass=""
                              style={{ backgroundColor: bgColor, minWidth: '180px' }}
                            />
                          );
                        })}

                        {/* Done Column */}
                        <TaskDropZone status="done" tasks={doneTasks} bgClass="bg-emerald-50/10" style={{ minWidth: '180px' }} />

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

                  {/* Attachments Section */}
                  <div>
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Paperclip className="w-4 h-4" />
                      <span>Attachments</span>
                    </h4>
                    {loadingAttachments ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        <span className="ml-2 text-sm text-gray-500">Loading attachments...</span>
                      </div>
                    ) : storyAttachmentsList.length > 0 ? (
                      <div className="space-y-2">
                        {storyAttachmentsList.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {attachment.fileSize ? `${(attachment.fileSize / 1024).toFixed(1)} KB` : ''}
                                  {attachment.fileType && ` • ${attachment.fileType}`}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (attachment.fileUrl) {
                                  // Handle base64 data URLs
                                  if (attachment.fileUrl.startsWith('data:')) {
                                    const link = document.createElement('a');
                                    link.href = attachment.fileUrl;
                                    link.download = attachment.fileName;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  } else {
                                    window.open(attachment.fileUrl, '_blank');
                                  }
                                }
                              }}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                        No attachments for this story
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsStoryDetailsOpen(false);
                setStoryAttachmentsList([]);
              }}>
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

              {/* Attachments Section */}
              <div className="space-y-2">
                <Label htmlFor="story-attachments">Attachments</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="story-attachments"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setStoryAttachments(prev => [...prev, ...files]);
                    }}
                  />
                  <label htmlFor="story-attachments" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Paperclip className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Click to upload files or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        Any file type supported
                      </p>
                    </div>
                  </label>
                </div>
                
                {/* Display selected files */}
                {storyAttachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Selected Files ({storyAttachments.length}):
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {storyAttachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => {
                              setStoryAttachments(prev => prev.filter((_, i) => i !== index));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAddStoryDialogOpen(false);
                setStoryAttachments([]);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateStory} 
                disabled={createStoryLoading || uploadingAttachments}
              >
                {createStoryLoading || uploadingAttachments ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadingAttachments ? 'Uploading...' : 'Creating...'}
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
        <Dialog open={isAddSubtaskDialogOpen} onOpenChange={handleSubtaskDialogClose}>
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
              <div>
                <Label htmlFor="subtask-category">Category</Label>
                <Select value={newSubtask.category} onValueChange={(value) => setNewSubtask(prev => ({ ...prev, category: value === 'NONE' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Idle">Idle</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subtask-due-date">Due Date</Label>
                <Input
                  id="subtask-due-date"
                  type="date"
                  value={newSubtask.dueDate}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsAddSubtaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSubtask} disabled={isCreatingSubtask || !newSubtask.title.trim()}>
                {isCreatingSubtask ? (
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
            <DialogTitle className="sr-only">Task Details: {selectedTaskForDetails?.title || 'Task'}</DialogTitle>
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-purple-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTaskForSubtask(selectedTaskForDetails);
                          setNewSubtask(prev => ({ ...prev, taskId: selectedTaskForDetails.id, assigneeId: selectedTaskForDetails.assigneeId || '' }));
                          setIsAddSubtaskDialogOpen(true);
                        }}
                        title="Add subtask"
                      >
                        <Layers3 className="w-4 h-4 text-purple-600" />
                      </Button>
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
                        <TabsTrigger value="activities">Activities</TabsTrigger>
                        <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
                        <TabsTrigger value="due-dates">Due Dates</TabsTrigger>
                        <TabsTrigger value="linked-issues">Linked Issues</TabsTrigger>
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

                        {/* Attachments from Parent Story */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900">Attachments</h3>
                            {parentStoryAttachments.length > 0 && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <BookOpen className="w-3 h-3 mr-1" />
                                From Story
                              </Badge>
                            )}
                          </div>
                          
                          {loadingParentStoryAttachments ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              <span className="ml-2 text-sm text-gray-600">Loading attachments...</span>
                            </div>
                          ) : parentStoryAttachments.length > 0 ? (
                            <div className="space-y-2">
                              {parentStoryAttachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-blue-50/30"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                      <Paperclip className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {attachment.fileName}
                                        </p>
                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0">
                                          Inherited
                                        </Badge>
                                      </div>
                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        {attachment.fileSize && (
                                          <>
                                            <span>{(attachment.fileSize / 1024).toFixed(2)} KB</span>
                                            <span>•</span>
                                          </>
                                        )}
                                        {attachment.uploadedBy && (
                                          <>
                                            <span>by {getUserName(attachment.uploadedBy)}</span>
                                            <span>•</span>
                                          </>
                                        )}
                                        <span>
                                          {new Date(attachment.createdAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 px-3 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (attachment.fileUrl) {
                                          const link = document.createElement('a');
                                          link.href = attachment.fileUrl;
                                          link.download = attachment.fileName;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          toast.success('File downloaded');
                                        } else {
                                          toast.error('File URL not available');
                                        }
                                      }}
                                    >
                                      <Download className="w-3 h-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                              <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No attachments from parent story</p>
                              <p className="text-xs text-gray-400 mt-1">Attachments added to the story will appear here</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="activities" className="flex-1 overflow-auto p-6">
                        <TaskActivityLog taskId={selectedTaskForDetails.id} />
                      </TabsContent>

                      <TabsContent value="subtasks" className="flex-1 overflow-hidden flex flex-col">
                        {/* Header with Add Subtask Button */}
                        <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-sm font-semibold text-gray-900">Subtasks</h3>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 px-3 text-xs"
                              onClick={() => {
                                setSelectedTaskForSubtask(selectedTaskForDetails);
                                setNewSubtask(prev => ({ ...prev, taskId: selectedTaskForDetails.id, assigneeId: selectedTaskForDetails.assigneeId || '' }));
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
                                        
                                        // Update local subtasks state immediately
                                        setAllSubtasks(prev => 
                                          prev.map(st => st.id === subtask.id ? { ...st, isCompleted: !st.isCompleted } : st)
                                        );
                                        
                                        // Also refresh all tasks to ensure everything stays in sync
                                        if (sprintStories.length > 0) {
                                          fetchAllTasks(sprintStories, true);
                                        }
                                      } catch (error) {
                                        console.error('Failed to update subtask:', error);
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
                                      {subtask.category && (
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                          {subtask.category}
                                        </Badge>
                                      )}
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

                      <TabsContent value="due-dates" className="flex-1 overflow-auto p-6 space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Due Dates</h3>
                          <div className="space-y-4">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">Task Due Date</span>
                              </div>
                              <div className="text-sm text-gray-700">
                                {selectedTaskForDetails.dueDate ? 
                                  new Date(selectedTaskForDetails.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 
                                  'No due date set'
                                }
                              </div>
                            </div>
                            {getSubtasksForTask(selectedTaskForDetails.id).filter(st => st.dueDate).length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 mb-2">Subtask Due Dates</h4>
                                <div className="space-y-2">
                                  {getSubtasksForTask(selectedTaskForDetails.id).filter(st => st.dueDate).map((subtask) => (
                                    <div key={subtask.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-900">{subtask.title}</span>
                                        <span className="text-xs text-gray-600">
                                          {subtask.dueDate ? new Date(subtask.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="linked-issues" className="flex-1 overflow-auto p-6 space-y-6">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Linked Issues</h3>
                          <div className="text-center py-8 text-gray-500">
                            <Link className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No linked issues</p>
                            <p className="text-xs text-gray-400 mt-1">Links to related tasks and stories will appear here</p>
                          </div>
                        </div>
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

                    {/* Subtask Details Section (Replacing Effort Details) */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Subtask Details</h3>
                      </div>
                      <div className="space-y-4">
                        {/* Estimation */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Estimation</span>
                            <span className="text-xs font-semibold text-blue-600">
                              {selectedTaskForDetails.estimatedHours || 0}h
                            </span>
                          </div>
                          <Progress 
                            value={100} 
                            className="h-2 bg-blue-100" 
                          />
                        </div>
                        
                        {/* Time Spent */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Time Spent</span>
                            <span className="text-xs font-semibold text-green-600">
                              {selectedTaskForDetails.actualHours || 0}h
                            </span>
                          </div>
                          <Progress 
                            value={selectedTaskForDetails.estimatedHours > 0 ? 
                              Math.min(100, ((selectedTaskForDetails.actualHours || 0) / selectedTaskForDetails.estimatedHours) * 100) : 0
                            } 
                            className="h-2 bg-green-100" 
                          />
                        </div>
                        
                        {/* Remaining */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">Remaining</span>
                            <span className="text-xs font-semibold text-gray-600">
                              {Math.max(0, (selectedTaskForDetails.estimatedHours || 0) - (selectedTaskForDetails.actualHours || 0))}h
                            </span>
                          </div>
                          <Progress 
                            value={selectedTaskForDetails.estimatedHours > 0 ? 
                              Math.min(100, (Math.max(0, (selectedTaskForDetails.estimatedHours || 0) - (selectedTaskForDetails.actualHours || 0)) / selectedTaskForDetails.estimatedHours) * 100) : 0
                            } 
                            className="h-2 bg-gray-100" 
                          />
                        </div>
                      </div>
                    </div>

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

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => {
          setIsAddTaskDialogOpen(false);
          setNewTask({
            title: '',
            description: '',
            storyId: newTask.storyId, // Keep storyId if set from button click
            priority: 'MEDIUM',
            assigneeId: '',
            estimatedHours: 0,
            dueDate: ''
          });
        }}
        onSubmit={handleAddTask}
        stories={sprintStories.map(story => ({
          id: story.id,
          title: story.title,
          priority: (story.priority?.toLowerCase() || 'medium') as 'high' | 'medium' | 'low',
          points: story.storyPoints || 0,
          status: story.status?.toLowerCase()?.includes('backlog') ? 'stories' : 
                 story.status?.toLowerCase()?.includes('todo') ? 'todo' :
                 story.status?.toLowerCase()?.includes('progress') ? 'inprogress' :
                 story.status?.toLowerCase()?.includes('review') ? 'qa' :
                 story.status?.toLowerCase()?.includes('done') ? 'done' : 'stories' as 'stories' | 'todo' | 'inprogress' | 'qa' | 'done',
          assignee: undefined
        }))}
        defaultStatus={newTask.storyId ? 'todo' : 'todo'}
        defaultStoryId={newTask.storyId || undefined}
        users={users}
      />

      {/* Lane Configuration Modal */}
      <LaneConfigurationModal
        open={isLaneConfigModalOpen}
        onClose={() => {
          setIsLaneConfigModalOpen(false);
          setSelectedLaneForEdit(null);
          setLaneCreationSource(null);
        }}
        onSubmit={handleCreateWorkflowLane}
        projectId={selectedProject}
        existingLane={selectedLaneForEdit}
        allLanes={workflowLanes}
      />
    </DndProvider>
  );
};

export default ScrumPage;

