import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { timeEntryApiService } from '../services/api/entities/timeEntryApi';
import { useUsers, useActiveUsers } from '../hooks/api/useUsers';
import { useProjects } from '../hooks/api/useProjects';
import { useStories } from '../hooks/api/useStories';
import { useTasks } from '../hooks/api/useTasks';
import { useSprints } from '../hooks/api/useSprints';
import { useTeamMembers } from '../hooks/api/useTeamMembers';
import { TimeEntry as ApiTimeEntry, User, Project, Story, Task, Sprint } from '../types/api';
import { useAuth } from '../contexts/AuthContextEnhanced';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Clock, 
  Target,
  Users, 
  TrendingUp,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { Calendar } from '../components/ui/calendar';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DateRange } from 'react-day-picker';
import { format, startOfDay, endOfDay } from 'date-fns';

interface TimeEntry {
  id: string;
  task: string;
  taskId?: string;
  story: string;
  storyId?: string;
  project: string;
  projectId?: string;
  sprintId?: string;
  sprintName?: string;
  user: string;
  userId: string;
  userRole: string;
  duration: string;
  date: string;
  status: 'active' | 'completed';
  taskStatus?: string; // Actual task status (IN_PROGRESS, DONE, QA, etc.)
  billable: boolean;
  category: string;
  description?: string;
  timeSpent: string;
  remaining: string;
  estimation?: string;
  startTime?: string;
  endTime?: string;
  hoursWorked?: number;
  notes?: string;
}

const formatDisplayName = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(chunk => chunk[0].toUpperCase() + chunk.slice(1))
    .join(' ');

const normalizeId = (value?: string | number | null): string | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return String(value);
};

const mergeById = <T extends { id: any }>(existing: T[], incoming: T[]): T[] => {
  if (incoming.length === 0) {
    return existing;
  }

  const combined = new Map<string, T>();

  existing.forEach(item => {
    const id = normalizeId(item.id);
    if (id) {
      combined.set(id, { ...item, id } as T);
    }
  });

  incoming.forEach(item => {
    const id = normalizeId(item.id);
    if (id) {
      combined.set(id, { ...item, id } as T);
    }
  });

  return Array.from(combined.values());
};

const parseEntryDateValue = (value?: string | Date | number): Date | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  const dateFromDefault = new Date(value);
  if (!Number.isNaN(dateFromDefault.getTime())) {
    return dateFromDefault;
  }

  const dateOnlyMatch = value.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnlyMatch) {
    const parsed = new Date(`${dateOnlyMatch[1]}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  console.log('Unable to parse entry date:', value);
  return null;
};

const extractTimeEntries = (payload: any): ApiTimeEntry[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.content && Array.isArray(payload.content)) {
    return payload.content;
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
};

const CATEGORY_OPTIONS = [
  'development',
  'documentation',
  'idle',
  'learning',
  'meeting',
  'support',
  'testing',
  'training',
] as const;

const CATEGORY_OPTIONS_SET = new Set<string>(CATEGORY_OPTIONS);
const DEFAULT_CATEGORY = CATEGORY_OPTIONS[0];

const CATEGORY_SYNONYMS: Record<string, (typeof CATEGORY_OPTIONS)[number]> = {
  dev: 'development',
  development: 'development',
  'code review': 'development',
  codereview: 'development',
  review: 'development',
  docs: 'documentation',
  doc: 'documentation',
  documentation: 'documentation',
  analysis: 'documentation',
  report: 'documentation',
  idle: 'idle',
  bench: 'idle',
  buffer: 'idle',
  waiting: 'idle',
  learning: 'learning',
  research: 'learning',
  study: 'learning',
  meeting: 'meeting',
  meetings: 'meeting',
  sync: 'meeting',
  support: 'support',
  'customer support': 'support',
  maintenance: 'support',
  testing: 'testing',
  qa: 'testing',
  'quality assurance': 'testing',
  test: 'testing',
  verification: 'testing',
  training: 'training',
  onboarding: 'training',
  'knowledge transfer': 'training',
};

const normalizeCategory = (value?: string | null): (typeof CATEGORY_OPTIONS)[number] => {
  if (!value) {
    return DEFAULT_CATEGORY;
  }

  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ' ');

  if (CATEGORY_SYNONYMS[normalized]) {
    return CATEGORY_SYNONYMS[normalized];
  }

  if (CATEGORY_OPTIONS_SET.has(normalized)) {
    return normalized as (typeof CATEGORY_OPTIONS)[number];
  }

  return DEFAULT_CATEGORY;
};

const resolveProjectInfoFromEntry = (entry: any) => {
  const projectObj =
    entry?.project ??
    entry?.projectDetails ??
    entry?.projectDto ??
    entry?.projectInfo ??
    entry?.projectResponse ??
    entry?.projectData;

  const candidateIds = [
    entry?.projectId,
    entry?.projectID,
    entry?.project_id,
    projectObj?.id,
    projectObj?.projectId,
    projectObj?.projectID,
    projectObj?.project_id,
  ];

  const resolvedId = candidateIds
    .map((value) => normalizeId(value))
    .find((value): value is string => Boolean(value));

  const candidateNames = [
    entry?.projectName,
    typeof entry?.project === 'string' ? entry?.project : undefined,
    projectObj?.name,
    projectObj?.projectName,
    projectObj?.title,
    projectObj?.code,
    projectObj?.identifier,
  ];

  const resolvedName = candidateNames.find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );

  return { id: resolvedId, name: resolvedName };
};

const resolveSprintInfoFromEntry = (entry: any) => {
  const sprintObj =
    entry?.sprint ??
    entry?.sprintDetails ??
    entry?.sprintDto ??
    entry?.sprintInfo ??
    entry?.sprintResponse ??
    entry?.sprintData;

  const candidateIds = [
    entry?.sprintId,
    entry?.sprintID,
    entry?.sprint_id,
    sprintObj?.id,
    sprintObj?.sprintId,
    sprintObj?.sprintID,
    sprintObj?.sprint_id,
  ];

  const resolvedId = candidateIds
    .map((value) => normalizeId(value))
    .find((value): value is string => Boolean(value));

  const candidateNames = [
    entry?.sprintName,
    typeof entry?.sprint === 'string' ? entry?.sprint : undefined,
    sprintObj?.name,
    sprintObj?.sprintName,
    sprintObj?.title,
    sprintObj?.code,
    sprintObj?.identifier,
  ];

  const resolvedName = candidateNames.find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );

  return { id: resolvedId, name: resolvedName };
};

const buildTimeEntryKey = (entry: ApiTimeEntry, index: number): string => {
  const normalizedId = normalizeId(entry.id);
  if (normalizedId) {
    return normalizedId;
  }

  const userId = normalizeId(entry.userId) || 'unknown-user';
  const taskId = normalizeId(entry.taskId) || 'unknown-task';
  const projectId =
    normalizeId((entry as any).projectId ?? (entry as any).projectID) || 'unknown-project';
  const storyId = normalizeId(entry.storyId) || 'unknown-story';
  const workDate =
    (entry as any).workDate ||
    (entry as any).date ||
    `no-date-${index}`;
  const startTime = entry.startTime || '';
  const endTime = entry.endTime || '';
  const hoursWorked = entry.hoursWorked !== undefined ? String(entry.hoursWorked) : '';
  const category = (entry as any).entryType || (entry as any).category || '';
  const description = entry.description ? entry.description.trim().slice(0, 50) : '';

  return [
    userId,
    taskId,
    projectId,
    storyId,
    workDate,
    startTime,
    endTime,
    hoursWorked,
    category,
    description,
  ].join('|');
};

const TimeTrackingPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [userFilter, setUserFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [sprintFilter, setSprintFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [billableFilter, setBillableFilter] = useState<'all' | 'billable' | 'non-billable'>('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [additionalSprints, setAdditionalSprints] = useState<Sprint[]>([]);
  const [projectSprints, setProjectSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch team members for selected project (will be defined after projects)
  const projectTeamMembersResult = useTeamMembers(projectFilter !== 'all' ? projectFilter : undefined);
  
  // Fetch sprints for selected project
  useEffect(() => {
    const fetchProjectSprints = async () => {
      if (projectFilter === 'all') {
        setProjectSprints([]);
        return;
      }
      
      try {
        const { sprintApiService } = await import('../services/api/entities/sprintApi');
        const response = await sprintApiService.getSprintsByProject(projectFilter);
        if (response.success && Array.isArray(response.data)) {
          setProjectSprints(response.data);
        } else {
          setProjectSprints([]);
        }
      } catch (err) {
        console.error('Error fetching sprints for project:', err);
        setProjectSprints([]);
      }
    };
    
    fetchProjectSprints();
  }, [projectFilter]);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const fetchedTaskIdsRef = useRef<Set<string>>(new Set());
  const fetchedStoryIdsRef = useRef<Set<string>>(new Set());
  const fetchedProjectIdsRef = useRef<Set<string>>(new Set());
  const fetchedSprintIdsRef = useRef<Set<string>>(new Set());
  const baselineFetchUserRef = useRef<string | null>(null);
  const userTasksFetchKeyRef = useRef<string | null>(null);
  const timeEntriesFetchKeyRef = useRef<string | null>(null);
  const ensuredEntitiesKeyRef = useRef<string | null>(null);
  const [pageSize, setPageSize] = useState<15 | 30>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ENABLE_TASK_PREFETCH = false;

  useEffect(() => {
    if (!currentUser) {
      baselineFetchUserRef.current = null;
      userTasksFetchKeyRef.current = null;
      timeEntriesFetchKeyRef.current = null;
    }
  }, [currentUser?.id]);

  useEffect(() => {
    const userId = normalizeId(currentUser?.id);
    if (!userId) {
      return;
    }

    if (baselineFetchUserRef.current === userId) {
      return;
    }
    baselineFetchUserRef.current = userId;

    let isMounted = true;

    const fetchBaselineData = async () => {
      try {
        const { projectApiService } = await import('../services/api/entities/projectApi');
        const { sprintApiService } = await import('../services/api/entities/sprintApi');

        // Fetch comprehensive project list so time entries have complete context
        try {
          let projectData: Project[] = [];
          try {
            const response = await projectApiService.getAllProjects();
            if (Array.isArray(response.data)) {
              projectData = response.data;
            }
          } catch (allProjectsError) {
            console.warn('Failed to fetch /projects/all, falling back to paginated projects.', allProjectsError);
            try {
              const response = await projectApiService.getProjects({ page: 0, size: 1000 });
              if (Array.isArray(response.data)) {
                projectData = response.data;
              }
            } catch (paginatedError) {
              console.warn('Failed to fetch paginated projects.', paginatedError);
            }
          }

          const isManagerOrAdmin = currentUser && (
            (currentUser.role as string) === 'admin' || 
            (currentUser.role as string) === 'manager' || 
            (currentUser.role as string) === 'MANAGER' ||
            (currentUser.role as string) === 'ADMIN' ||
            (currentUser.role as string)?.toLowerCase() === 'manager' ||
            (currentUser.role as string)?.toLowerCase() === 'admin'
          );

          if (!isManagerOrAdmin) {
            try {
              const accessibleResponse = await projectApiService.getAccessibleProjects();
              if (Array.isArray(accessibleResponse.data) && accessibleResponse.data.length > 0) {
                projectData = mergeById(projectData, accessibleResponse.data);
              }
            } catch (accessibleError) {
              console.warn('Failed to fetch accessible projects.', accessibleError);
            }
          }

          if (isMounted && projectData.length > 0) {
            setAdditionalProjects(prev => mergeById(prev, projectData));
          }
        } catch (projectErr) {
          console.warn('Error fetching baseline projects:', projectErr);
        }

        // Fetch comprehensive sprint list for time entry context
        try {
          let sprintData: Sprint[] = [];
          try {
            const response = await sprintApiService.getSprints({ page: 0, size: 1000 });
            if (Array.isArray(response.data)) {
              sprintData = response.data;
            } else if (response.data && Array.isArray((response as any).content)) {
              sprintData = (response as any).content as Sprint[];
            }
          } catch (paginatedError) {
            console.warn('Failed to fetch paginated sprints.', paginatedError);
          }

          if (sprintData.length === 0) {
            try {
              const response = await sprintApiService.getActiveSprints({ page: 0, size: 1000 });
              if (Array.isArray(response.data)) {
                sprintData = response.data;
              }
            } catch (activeError) {
              console.warn('Failed to fetch active sprints.', activeError);
            }
          }

          if (isMounted && sprintData.length > 0) {
            setAdditionalSprints(prev => mergeById(prev, sprintData));
          }
        } catch (sprintErr) {
          console.warn('Error fetching baseline sprints:', sprintErr);
        }
      } catch (err) {
        console.warn('Unexpected error fetching baseline time-tracking data:', err);
      }
    };

    fetchBaselineData();

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const resetFilters = useCallback(() => {
    setTimeFilter('all-time');
    setUserFilter('all');
    setProjectFilter('all');
    setSprintFilter('all');
    setWorkTypeFilter('all');
    setBillableFilter('all');
    setCustomDateRange(undefined);
    setCustomRangeOpen(false);
  }, []);

  const customRangeLabel = useMemo(() => {
    if (customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'MMM d, yyyy')} – ${format(customDateRange.to, 'MMM d, yyyy')}`;
    }
    if (customDateRange?.from) {
      return `${format(customDateRange.from, 'MMM d, yyyy')} – …`;
    }
    return 'Select dates';
  }, [customDateRange]);

  const handleTimeFilterChange = useCallback((value: string) => {
    setTimeFilter(value);
    if (value === 'custom') {
      setCustomRangeOpen(true);
    } else {
      setCustomRangeOpen(false);
    }
  }, []);

  const handleCustomRangeSelect = useCallback((range: DateRange | undefined) => {
    setCustomDateRange(range);
    if (range?.from && range?.to) {
      setTimeFilter('custom');
    }
  }, []);

  // Fetch related entities
  const usersResult = useUsers({ page: 0, size: 1000 });
  const activeUsersResult = useActiveUsers({ page: 0, size: 1000 });
  const projectsResult = useProjects();
  
  // Extract data - ensure all are arrays (moved before useEffect that uses it)
  // Filter to show only current user if not manager/admin, otherwise show all users
  const usersData = Array.isArray(usersResult.data) ? usersResult.data : [];
  const users = useMemo(() => {
    // Check if current user is manager or admin
    const isManagerOrAdmin = currentUser && (
      (currentUser.role as string) === 'admin' || 
      (currentUser.role as string) === 'manager' || 
      (currentUser.role as string) === 'MANAGER' ||
      (currentUser.role as string) === 'ADMIN' ||
      (currentUser.role as string)?.toLowerCase() === 'manager' ||
      (currentUser.role as string)?.toLowerCase() === 'admin'
    );
    
    // If current user is manager/admin, show all users; otherwise show only current user
    if (currentUser && currentUser.id && !isManagerOrAdmin) {
      const currentUserId = normalizeId(currentUser.id);
      return usersData.filter(user => normalizeId(user.id) === currentUserId);
    }
    
    return usersData;
  }, [usersData, currentUser]);
  
  // Fetch all stories and tasks using getAll methods
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allSubtasks, setAllSubtasks] = useState<any[]>([]);
  const [additionalProjects, setAdditionalProjects] = useState<Project[]>([]);
  const [userTasksMap, setUserTasksMap] = useState<Map<string, Task[]>>(new Map());
  
  useEffect(() => {
    const fetchStoriesAndTasks = async () => {
      try {
        const { storyApiService } = await import('../services/api/entities/storyApi');
        const { taskApiService } = await import('../services/api/entities/taskApi');
        const { subtaskApiService } = await import('../services/api/entities/subtaskApi');
        
        // Fetch all stories
        const storiesResponse = await storyApiService.getAllStories();
        const storiesData = Array.isArray(storiesResponse.data) ? storiesResponse.data : [];
        setAllStories(prev => mergeById(prev, storiesData));
        
        // Fetch all tasks - try /all endpoint first, fallback to regular endpoint
        let tasksData: Task[] = [];
        try {
          const tasksResponse = await taskApiService.getAllTasks();
          tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];
        } catch (err: any) {
          // If /all fails (404), try regular endpoint with large page size
          if (err?.status === 404 || err?.code === 'HTTP_404') {
            console.log('Tasks /all endpoint not available, using regular endpoint');
            try {
              const tasksResponse = await taskApiService.getTasks({ page: 0, size: 1000 });
              const data = tasksResponse.data as any;
              if (Array.isArray(data)) {
                tasksData = data;
              } else if (data?.content && Array.isArray(data.content)) {
                tasksData = data.content;
              } else if (data?.data && Array.isArray(data.data)) {
                tasksData = data.data;
              }
            } catch (err2) {
              console.error('Error fetching tasks from regular endpoint:', err2);
            }
          } else {
            throw err;
          }
        }
        
        setAllTasks(prev => mergeById(prev, tasksData));
        
        // Fetch all subtasks to create subtaskId -> taskId mapping
        let subtasksData: any[] = [];
        try {
          const subtasksResponse = await subtaskApiService.getAllSubtasks();
          subtasksData = Array.isArray(subtasksResponse.data) ? subtasksResponse.data : [];
        } catch (err: any) {
          // If /all fails, try regular endpoint
          if (err?.status === 404 || err?.code === 'HTTP_404') {
            try {
              const subtasksResponse = await subtaskApiService.getSubtasks({ page: 0, size: 1000 });
              const data = subtasksResponse.data as any;
              if (Array.isArray(data)) {
                subtasksData = data;
              } else if (data?.content && Array.isArray(data.content)) {
                subtasksData = data.content;
              } else if (data?.data && Array.isArray(data.data)) {
                subtasksData = data.data;
              }
            } catch (err2) {
              console.error('Error fetching subtasks from regular endpoint:', err2);
            }
          }
        }
        
        setAllSubtasks(prev => mergeById(prev, subtasksData));
        
        console.log('Fetched all stories:', storiesData.length);
        console.log('Fetched all tasks:', tasksData.length);
        console.log('Fetched all subtasks:', subtasksData.length);
        console.log('Tasks by assignee:', tasksData.reduce((acc, task) => {
          const assigneeId = task.assigneeId || 'unassigned';
          acc[assigneeId] = (acc[assigneeId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
      } catch (err) {
        console.error('Error fetching stories/tasks/subtasks:', err);
      }
    };
    fetchStoriesAndTasks();
  }, []);

  // Fetch tasks - disabled prefetch (ensureRelatedEntities will load needed tasks by id)
  useEffect(() => {
    if (!ENABLE_TASK_PREFETCH) {
      return;
    }
    const userId = normalizeId(currentUser?.id);
    if (!userId) {
      return;
    }

    const isManagerOrAdmin = currentUser && (
      (currentUser.role as string) === 'admin' || 
      (currentUser.role as string) === 'manager' || 
      (currentUser.role as string) === 'MANAGER' ||
      (currentUser.role as string) === 'ADMIN' ||
      (currentUser.role as string)?.toLowerCase() === 'manager' ||
      (currentUser.role as string)?.toLowerCase() === 'admin'
    );

    if (isManagerOrAdmin && usersData.length === 0) {
      return;
    }

    const fetchKey = isManagerOrAdmin ? `${userId}-manager` : userId;
    if (userTasksFetchKeyRef.current === fetchKey) {
      return;
    }

    let cancelled = false;

    const fetchUserTasks = async () => {
      try {
        const { taskApiService } = await import('../services/api/entities/taskApi');
        const newUserTasksMap = new Map<string, Task[]>();

        if (isManagerOrAdmin) {
          const userTaskPromises = usersData.map(async (user) => {
            const assigneeId = normalizeId(user.id);
            if (!assigneeId) {
              return;
            }

            try {
              const response = await taskApiService.getTasksByAssignee(assigneeId, { page: 0, size: 1000 });
              let userTasks: Task[] = [];
              
              if (Array.isArray(response.data)) {
                userTasks = response.data;
              } else if (response.data && typeof response.data === 'object' && 'content' in response.data && Array.isArray((response.data as any).content)) {
                userTasks = (response.data as any).content;
              } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
                userTasks = (response.data as any).data;
              }

              if (userTasks.length > 0) {
                newUserTasksMap.set(assigneeId, userTasks);
                setAllTasks(prev => mergeById(prev, userTasks));
                
                const storyIds = new Set<string>();
                userTasks.forEach(task => {
                  const storyId = normalizeId(task.storyId);
                  if (storyId) storyIds.add(storyId);
                });

                const { storyApiService } = await import('../services/api/entities/storyApi');
                await Promise.all(
                  Array.from(storyIds).map(async (storyId) => {
                    try {
                      const storyResponse = await storyApiService.getStoryById(storyId);
                      if (storyResponse.data) {
                        setAllStories(prev => mergeById(prev, [storyResponse.data as Story]));
                        
                        const story = storyResponse.data as Story;
                        const projectId = normalizeId(story.projectId);
                        if (projectId) {
                          try {
                            const { projectApiService } = await import('../services/api/entities/projectApi');
                            const projectResponse = await projectApiService.getProjectById(projectId);
                            if (projectResponse.data) {
                              setAdditionalProjects(prev => mergeById(prev, [projectResponse.data as Project]));
                            }
                          } catch (err) {
                            console.warn(`Failed to fetch project ${projectId}:`, err);
                          }
                        }
                      }
                    } catch (err) {
                      console.warn(`Failed to fetch story ${storyId}:`, err);
                    }
                  })
                );
              }
            } catch (err) {
              console.warn(`Failed to fetch tasks for user ${assigneeId}:`, err);
            }
          });

          await Promise.all(userTaskPromises);
        } else {
          try {
            const response = await taskApiService.getTasksByAssignee(userId, { page: 0, size: 1000 });
            let userTasks: Task[] = [];
            
            if (Array.isArray(response.data)) {
              userTasks = response.data;
            } else if (response.data && typeof response.data === 'object' && 'content' in response.data && Array.isArray((response.data as any).content)) {
              userTasks = (response.data as any).content;
            } else if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray((response.data as any).data)) {
              userTasks = (response.data as any).data;
            }

            if (userTasks.length > 0) {
              newUserTasksMap.set(userId, userTasks);
              setAllTasks(prev => mergeById(prev, userTasks));
              
              const storyIds = new Set<string>();
              userTasks.forEach(task => {
                const storyId = normalizeId(task.storyId);
                if (storyId) storyIds.add(storyId);
              });

              const { storyApiService } = await import('../services/api/entities/storyApi');
              await Promise.all(
                Array.from(storyIds).map(async (storyId) => {
                  try {
                    const storyResponse = await storyApiService.getStoryById(storyId);
                    if (storyResponse.data) {
                      setAllStories(prev => mergeById(prev, [storyResponse.data as Story]));
                      
                      const story = storyResponse.data as Story;
                      const projectId = normalizeId(story.projectId);
                      if (projectId) {
                        try {
                          const { projectApiService } = await import('../services/api/entities/projectApi');
                          const projectResponse = await projectApiService.getProjectById(projectId);
                          if (projectResponse.data) {
                            setAdditionalProjects(prev => mergeById(prev, [projectResponse.data as Project]));
                          }
                        } catch (err) {
                          console.warn(`Failed to fetch project ${projectId}:`, err);
                        }
                      }
                    }
                  } catch (err) {
                    console.warn(`Failed to fetch story ${storyId}:`, err);
                  }
                })
              );
            }
          } catch (err) {
            console.warn(`Failed to fetch tasks for user ${userId}:`, err);
          }
        }

        setUserTasksMap(newUserTasksMap);

      } catch (err) {
        console.error('Error fetching user tasks:', err);
        throw err;
      }
    };

    userTasksFetchKeyRef.current = fetchKey;

        fetchUserTasks()
      .then(() => {
        if (!cancelled) {
          userTasksFetchKeyRef.current = fetchKey;
        }
      })
      .catch(() => {
        if (!cancelled) {
          userTasksFetchKeyRef.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);
  
  const storiesResult = { data: allStories, loading: false, error: null };
  const tasksResult = { data: allTasks, loading: false, error: null };
  
  const sprintsResult = useSprints();
  
  // Extract data - ensure all are arrays
  const activeUsers = useMemo(() => {
    const data = activeUsersResult.data;
    return Array.isArray(data) ? data : [];
  }, [activeUsersResult.data]);

  const activeUserCount = activeUsers.length;

  const projects = useMemo(() => {
    const data = projectsResult.data;
    const baseProjects = Array.isArray(data) ? data : [];
    const merged = mergeById(baseProjects, additionalProjects);

    const normalizedCurrentUserId = currentUser?.id ? normalizeId(currentUser.id) : undefined;

    // Filter to only show projects where the user is listed (manager, creator, or team member)
    // This applies to ALL users, including managers/admins
    if (!normalizedCurrentUserId) {
      return [];
    }

    return merged.filter(project => {
      if (!project) return false;

      const projectIdNormalized = normalizeId(project.id);

      const teamList: any[] =
        Array.isArray((project as any).teamMembers) ? (project as any).teamMembers :
        Array.isArray((project as any).members) ? (project as any).members :
        Array.isArray((project as any).team) ? (project as any).team :
        [];

      const managerId = normalizeId((project as any).managerId);
      const createdById = normalizeId((project as any).createdBy);

      // Check if user is the manager
      if (managerId && managerId === normalizedCurrentUserId) {
        return true;
      }

      // Check if user is the creator
      if (createdById && createdById === normalizedCurrentUserId) {
        return true;
      }

      // Check if user is a team member
      if (teamList.length > 0) {
        return teamList.some(member => {
          const memberId = normalizeId(
            member?.userId ??
            member?.id ??
            member?.memberId ??
            member?.assigneeId ??
            member?.user?.id
          );
          return memberId ? memberId === normalizedCurrentUserId : false;
        });
      }

      // User is not listed in this project
      return false;
    });
  }, [projectsResult.data, additionalProjects, currentUser]);

  // Define projectTeamMembers after projects is defined
  const projectTeamMembers = useMemo(() => {
    if (projectFilter === 'all') {
      return []; // No project selected, return empty array
    }
    
    const members = Array.isArray(projectTeamMembersResult.teamMembers) ? projectTeamMembersResult.teamMembers : [];
    
    // Filter to only show team members from projects where the user is listed
    // The projects array already contains only projects where the user is listed
    const accessibleProjectIds = new Set(
      projects.map(p => normalizeId(p.id)).filter((id): id is string => Boolean(id))
    );

    // Filter members to only show those from accessible projects
    return members.filter(member => {
      const memberProjectId = normalizeId((member as any).projectId);
      return memberProjectId ? accessibleProjectIds.has(memberProjectId) : false; // Exclude if no projectId
    });
  }, [projectFilter, projectTeamMembersResult.teamMembers, projects, currentUser]);

  const stories = useMemo(() => {
    const data = storiesResult.data;
    return Array.isArray(data) ? data : [];
  }, [storiesResult.data]);

  const tasks = useMemo(() => {
    const data = tasksResult.data;
    return Array.isArray(data) ? data : [];
  }, [tasksResult.data]);

  const sprints = useMemo(() => {
    const data = sprintsResult.data;
    const baseSprints = Array.isArray(data) ? data : [];
    // Merge all sprints: base sprints, additional sprints, and project-specific sprints
    const merged = mergeById(mergeById(baseSprints, additionalSprints), projectSprints);

    // Filter to only show sprints from projects where the user is listed
    // The projects array already contains only projects where the user is listed
    const accessibleProjectIds = new Set(
      projects.map(p => normalizeId(p.id)).filter((id): id is string => Boolean(id))
    );

    return merged.filter(sprint => {
      const sprintProjectId = normalizeId(sprint.projectId);
      return sprintProjectId ? accessibleProjectIds.has(sprintProjectId) : false;
    });
  }, [sprintsResult.data, additionalSprints, projectSprints, projects, currentUser]);

  // Reset sprint and user filters when project changes (must be after sprints and projectTeamMembers are defined)
  useEffect(() => {
    if (projectFilter === 'all') {
      // If project is reset to 'all', keep current filters
      return;
    }
    
    // Check if current sprint filter is valid for the selected project
    if (sprintFilter !== 'all') {
      const selectedSprint = sprints.find(s => normalizeId(s.id) === sprintFilter);
      const sprintProjectId = selectedSprint ? normalizeId(selectedSprint.projectId) : null;
      if (sprintProjectId !== projectFilter) {
        // Sprint doesn't belong to selected project, reset it
        setSprintFilter('all');
      }
    }
    
    // Check if current user filter is valid for the selected project
    if (userFilter !== 'all' && projectFilter !== 'all') {
      const projectTeamMemberIds = new Set(
        projectTeamMembers
          .map(member => {
            const memberId = normalizeId(
              (member as any).userId ||
              (member as any).id ||
              (member as any).memberId ||
              (member as any).user?.id
            );
            return memberId;
          })
          .filter((id): id is string => Boolean(id))
      );
      
      if (!projectTeamMemberIds.has(userFilter)) {
        // User is not a team member of the selected project, reset it
        setUserFilter('all');
      }
    }
  }, [projectFilter, sprintFilter, userFilter, sprints, projectTeamMembers]);

  const workTypeOptions = useMemo(() => [...CATEGORY_OPTIONS], []);

  // Create lookup maps
  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    if (Array.isArray(users)) {
      users.forEach(user => {
        const id = normalizeId(user.id);
        if (id) {
          map.set(id, { ...user, id } as User);
        }
      });
    }
    return map;
  }, [users]);

  const projectsMap = useMemo(() => {
    const map = new Map<string, Project>();
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        const id = normalizeId(project.id);
        if (id) {
          map.set(id, { ...project, id } as Project);
        }
      });
    }
    return map;
  }, [projects]);

  const storiesMap = useMemo(() => {
    const map = new Map<string, Story>();
    // Use allStories from state (fetched via getAllStories) as primary source
    if (Array.isArray(allStories) && allStories.length > 0) {
      allStories.forEach(story => {
        const id = normalizeId(story.id);
        if (id) {
          map.set(id, { ...story, id, projectId: normalizeId(story.projectId), sprintId: normalizeId(story.sprintId) } as Story);
        }
      });
    } else if (Array.isArray(stories)) {
      stories.forEach(story => {
        const id = normalizeId(story.id);
        if (id) {
          map.set(id, { ...story, id, projectId: normalizeId(story.projectId), sprintId: normalizeId(story.sprintId) } as Story);
        }
      });
    }
    return map;
  }, [stories, allStories]);

  const tasksMap = useMemo(() => {
    const map = new Map<string, Task>();
    // Use allTasks from state (fetched via getAllTasks) as primary source
    if (Array.isArray(allTasks) && allTasks.length > 0) {
      allTasks.forEach(task => {
        const id = normalizeId(task.id);
        if (id) {
          map.set(id, { ...task, id, storyId: normalizeId(task.storyId), assigneeId: normalizeId(task.assigneeId) } as Task);
        }
      });
    } else if (Array.isArray(tasks)) {
      tasks.forEach(task => {
        const id = normalizeId(task.id);
        if (id) {
          map.set(id, { ...task, id, storyId: normalizeId(task.storyId), assigneeId: normalizeId(task.assigneeId) } as Task);
        }
      });
    }
    return map;
  }, [tasks, allTasks]);

  // Create subtaskId -> taskId mapping
  const subtaskToTaskMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(allSubtasks)) {
      allSubtasks.forEach(subtask => {
        const subtaskId = normalizeId(subtask.id);
        const taskId = normalizeId(subtask.taskId);
        if (subtaskId && taskId) {
          map.set(subtaskId, taskId);
        }
      });
    }
    return map;
  }, [allSubtasks]);

  const sprintsMap = useMemo(() => {
    const map = new Map<string, Sprint>();
    if (Array.isArray(sprints)) {
      sprints.forEach(sprint => {
        const id = normalizeId(sprint.id);
        if (id) {
          map.set(id, { ...sprint, id, projectId: normalizeId(sprint.projectId) } as Sprint);
        }
      });
    }
    return map;
  }, [sprints]);

  // Map project to sprint (for scrum grouping)
  const projectToSprintMap = useMemo(() => {
    const map = new Map<string, Sprint>();
    if (Array.isArray(sprints)) {
      sprints.forEach(sprint => {
        const projectId = normalizeId(sprint.projectId);
        if (projectId) {
          // Use the first/active sprint for each project
          const sprintWithIds = { ...sprint, id: normalizeId(sprint.id) || sprint.id, projectId } as Sprint;
          if (!map.has(projectId) || sprint.status === 'ACTIVE') {
            map.set(projectId, sprintWithIds);
          }
        }
      });
    }
    return map;
  }, [sprints]);

  const getUserName = useCallback((userId: string) => {
    const user = usersMap.get(userId);
    return user?.name || 'Unknown User';
  }, [usersMap]);

  const getUserRole = useCallback((userId: string) => {
    const user = usersMap.get(userId);
    return user?.role || 'DEVELOPER';
  }, [usersMap]);

  // Store raw API entries
  const [rawTimeEntries, setRawTimeEntries] = useState<ApiTimeEntry[]>([]);

  // Fetch time entries - all users for managers/admins, only current user for others
  useEffect(() => {
    const userId = normalizeId(currentUser?.id);
    if (!userId) {
      return;
    }

    const isManagerOrAdmin = currentUser && (
      (currentUser.role as string) === 'admin' || 
      (currentUser.role as string) === 'manager' || 
      (currentUser.role as string) === 'MANAGER' ||
      (currentUser.role as string) === 'ADMIN' ||
      (currentUser.role as string)?.toLowerCase() === 'manager' ||
      (currentUser.role as string)?.toLowerCase() === 'admin'
    );

    const fetchKey = isManagerOrAdmin ? `${userId}-all` : userId;

    if (timeEntriesFetchKeyRef.current === fetchKey) {
      return;
    }

    let cancelled = false;

    const fetchAllEntriesWithPagination = async (): Promise<ApiTimeEntry[]> => {
      const pageSize = 500;
      let page = 0;
      let hasMore = true;
      const pagedEntries: ApiTimeEntry[] = [];

      while (hasMore) {
        try {
          const response = await timeEntryApiService.getTimeEntries({ page, size: pageSize });
          const payload: any = response.data;
          const pageEntries = extractTimeEntries(payload);
          pagedEntries.push(...pageEntries);

          if (payload?.last !== undefined) {
            hasMore = !payload.last;
          } else if (payload?.totalPages !== undefined) {
            hasMore = page + 1 < payload.totalPages;
          } else if (payload?.totalElements !== undefined) {
            hasMore = pagedEntries.length < payload.totalElements;
          } else {
            hasMore = pageEntries.length === pageSize;
          }
        } catch (err) {
          console.warn(`Failed to fetch time entries page ${page}:`, err);
          break;
        }

        page += 1;

        if (!hasMore) {
          break;
        }
      }

      return pagedEntries;
    };

    const fetchTimeEntries = async () => {

      setLoading(true);
      setError(null);

      try {
        let aggregatedEntries: ApiTimeEntry[] = [];

        // Check if current user is manager or admin
        const isManagerOrAdmin = currentUser && (
          (currentUser.role as string) === 'admin' || 
          (currentUser.role as string) === 'manager' || 
          (currentUser.role as string) === 'MANAGER' ||
          (currentUser.role as string) === 'ADMIN' ||
          (currentUser.role as string)?.toLowerCase() === 'manager' ||
          (currentUser.role as string)?.toLowerCase() === 'admin'
        );

        // Always try getAllTimeEntries; fallback to pagination
        try {
          const response = await timeEntryApiService.getAllTimeEntries();
          aggregatedEntries = extractTimeEntries(response.data);
          if (aggregatedEntries.length === 0) {
            aggregatedEntries = await fetchAllEntriesWithPagination();
          }
        } catch (getAllError) {
          console.warn('Failed to fetch all time entries, using paginated fallback.', getAllError);
          aggregatedEntries = await fetchAllEntriesWithPagination();
        }

        const seenKeys = new Set<string>();
        const uniqueEntries: ApiTimeEntry[] = [];

        aggregatedEntries.forEach((entry, index) => {
          const key = buildTimeEntryKey(entry, index);

          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniqueEntries.push(entry);
          }
        });

        setRawTimeEntries(uniqueEntries);
      } catch (err: any) {
        console.error('Error fetching time entries:', err);
        setRawTimeEntries([]);
        setError(err.message || 'Failed to fetch time entries');
      } finally {
        setLoading(false);
      }
    };

    timeEntriesFetchKeyRef.current = fetchKey;

    fetchTimeEntries()
      .then(() => {
        if (!cancelled) {
          timeEntriesFetchKeyRef.current = fetchKey;
        }
      })
      .catch(() => {
        if (!cancelled) {
          timeEntriesFetchKeyRef.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, usersData.length]);

  // Ensure related tasks, stories, and projects referenced by time entries are loaded
  useEffect(() => {
    if (rawTimeEntries.length === 0) {
      setTimeEntries([]);
      ensuredEntitiesKeyRef.current = null;
      return;
    }

    const entriesKey = rawTimeEntries
      .map((entry, index) => buildTimeEntryKey(entry, index))
      .sort()
      .join('||');

    if (ensuredEntitiesKeyRef.current === entriesKey) {
      return;
    }

    ensuredEntitiesKeyRef.current = entriesKey;

    const ensureRelatedEntities = async () => {
      try {
        const requiredTaskIds = new Set<string>();
        const requiredStoryIds = new Set<string>();
        const requiredProjectIds = new Set<string>();
        const requiredSprintIds = new Set<string>();

        rawTimeEntries.forEach(entry => {
          const taskId = normalizeId(entry.taskId);
          const storyId = normalizeId(entry.storyId);
          const { id: projectId } = resolveProjectInfoFromEntry(entry);
          const { id: sprintId } = resolveSprintInfoFromEntry(entry);

          if (taskId) requiredTaskIds.add(taskId);
          if (storyId) requiredStoryIds.add(storyId);
          if (projectId) requiredProjectIds.add(projectId);
          if (sprintId) requiredSprintIds.add(sprintId);
        });

        allTasks.forEach(task => {
          const taskId = normalizeId(task.id);
          const storyId = normalizeId(task.storyId);
          if (taskId) requiredTaskIds.add(taskId);
          if (storyId) requiredStoryIds.add(storyId);
        });

        allStories.forEach(story => {
          const storyId = normalizeId(story.id);
          const projectId = normalizeId(story.projectId);
          const sprintId = normalizeId(story.sprintId);
          if (storyId) requiredStoryIds.add(storyId);
          if (projectId) requiredProjectIds.add(projectId);
          if (sprintId) requiredSprintIds.add(sprintId);
        });

        const knownTaskIds = new Set(
          allTasks
            .map(task => normalizeId(task.id))
            .filter((id): id is string => Boolean(id))
        );

        const missingTaskIds = [...requiredTaskIds].filter(
          id => !knownTaskIds.has(id) && !fetchedTaskIdsRef.current.has(id)
        );

        let fetchedTasks: Task[] = [];

        if (missingTaskIds.length > 0) {
          const { taskApiService } = await import('../services/api/entities/taskApi');
          const taskResults = await Promise.all(
            missingTaskIds.map(async id => {
              fetchedTaskIdsRef.current.add(id);
              try {
                const response = await taskApiService.getTaskById(id);
                return response.data as Task;
              } catch (err) {
                console.warn(`Failed to fetch task ${id}:`, err);
                return null;
              }
            })
          );

          fetchedTasks = taskResults.filter((task): task is Task => Boolean(task));

          if (fetchedTasks.length > 0) {
            setAllTasks(prev => mergeById(prev, fetchedTasks));
          }
        }

        fetchedTasks.forEach(task => {
          const storyId = normalizeId(task.storyId);
          if (storyId) {
            requiredStoryIds.add(storyId);
          }
        });

        const knownStoryIds = new Set(
          allStories
            .map(story => normalizeId(story.id))
            .filter((id): id is string => Boolean(id))
        );

        const missingStoryIds = [...requiredStoryIds].filter(
          id => !knownStoryIds.has(id) && !fetchedStoryIdsRef.current.has(id)
        );

        let fetchedStories: Story[] = [];

        if (missingStoryIds.length > 0) {
          const { storyApiService } = await import('../services/api/entities/storyApi');
          const storyResults = await Promise.all(
            missingStoryIds.map(async id => {
              fetchedStoryIdsRef.current.add(id);
              try {
                const response = await storyApiService.getStoryById(id);
                return response.data as Story;
              } catch (err) {
                console.warn(`Failed to fetch story ${id}:`, err);
                return null;
              }
            })
          );

          fetchedStories = storyResults.filter((story): story is Story => Boolean(story));

          if (fetchedStories.length > 0) {
            setAllStories(prev => mergeById(prev, fetchedStories));
          }
        }

        fetchedStories.forEach(story => {
          const projectId = normalizeId(story.projectId);
          const sprintId = normalizeId(story.sprintId);
          if (projectId) {
            requiredProjectIds.add(projectId);
          }
          if (sprintId) {
            requiredSprintIds.add(sprintId);
          }
        });

        const baseProjectData = Array.isArray(projectsResult.data) ? projectsResult.data : [];
        const knownProjects = mergeById(baseProjectData, additionalProjects);
        const knownProjectIds = new Set(
          knownProjects
            .map(project => normalizeId(project.id))
            .filter((id): id is string => Boolean(id))
        );

        const missingProjectIds = [...requiredProjectIds].filter(
          id => !knownProjectIds.has(id) && !fetchedProjectIdsRef.current.has(id)
        );

        if (missingProjectIds.length > 0) {
          const { projectApiService } = await import('../services/api/entities/projectApi');
          const projectResults = await Promise.all(
            missingProjectIds.map(async id => {
              fetchedProjectIdsRef.current.add(id);
              try {
                const response = await projectApiService.getProjectById(id);
                return response.data as Project;
              } catch (err) {
                console.warn(`Failed to fetch project ${id}:`, err);
                return null;
              }
            })
          );

          const fetchedProjects = projectResults.filter((project): project is Project => Boolean(project));

          if (fetchedProjects.length > 0) {
            setAdditionalProjects(prev => mergeById(prev, fetchedProjects));
          }
        }

        const baseSprintData = Array.isArray(sprintsResult.data) ? sprintsResult.data : [];
        const knownSprints = mergeById(baseSprintData, additionalSprints);
        const knownSprintIds = new Set(
          knownSprints
            .map(sprint => normalizeId(sprint.id))
            .filter((id): id is string => Boolean(id))
        );

        const missingSprintIds = [...requiredSprintIds].filter(
          id => !knownSprintIds.has(id) && !fetchedSprintIdsRef.current.has(id)
        );

        if (missingSprintIds.length > 0) {
          const { sprintApiService } = await import('../services/api/entities/sprintApi');
          const sprintResults = await Promise.all(
            missingSprintIds.map(async id => {
              fetchedSprintIdsRef.current.add(id);
              try {
                const response = await sprintApiService.getSprintById(id);
                return response.data as Sprint;
              } catch (err) {
                console.warn(`Failed to fetch sprint ${id}:`, err);
                return null;
              }
            })
          );

          const fetchedSprints = sprintResults.filter((sprint): sprint is Sprint => Boolean(sprint));

          if (fetchedSprints.length > 0) {
            setAdditionalSprints(prev => mergeById(prev, fetchedSprints));
          }
        }
      } catch (err) {
        console.error('Failed to ensure related time entry entities:', err);
      }
    };

    ensureRelatedEntities();
  }, [rawTimeEntries, allTasks, allStories, additionalProjects, projectsResult.data, additionalSprints, sprintsResult.data]);

  // Map API entries to UI format and aggregate subtask time into parent tasks
  useEffect(() => {
    if (rawTimeEntries.length === 0) {
      setTimeEntries([]);
      return;
    }

    // Filter entries: managers/admins see entries from their accessible projects, others see only their own
    const isManagerOrAdmin = currentUser && (
      (currentUser.role as string) === 'admin' || 
      (currentUser.role as string) === 'manager' || 
      (currentUser.role as string) === 'MANAGER' ||
      (currentUser.role as string) === 'ADMIN' ||
      (currentUser.role as string)?.toLowerCase() === 'manager' ||
      (currentUser.role as string)?.toLowerCase() === 'admin'
    );
    
    let entriesToMap = rawTimeEntries;
    
    if (!isManagerOrAdmin && currentUser && currentUser.id) {
      // Non-managers/admins: only see their own entries
      entriesToMap = rawTimeEntries.filter(entry => normalizeId(entry.userId) === normalizeId(currentUser.id));
    } else if (isManagerOrAdmin) {
      // Managers/admins: filter by accessible projects
      const accessibleProjectIds = new Set(
        projects.map(p => normalizeId(p.id)).filter((id): id is string => Boolean(id))
      );
      
      entriesToMap = rawTimeEntries.filter(entry => {
        // Get projectId from entry
        const entryProjectId = normalizeId((entry as any).projectId);
        if (entryProjectId && accessibleProjectIds.has(entryProjectId)) {
          return true;
        }
        
        // Also check via story -> project mapping
        const entryStoryId = normalizeId(entry.storyId);
        if (entryStoryId) {
          const story = storiesMap.get(entryStoryId);
          if (story) {
            const storyProjectId = normalizeId(story.projectId);
            return storyProjectId ? accessibleProjectIds.has(storyProjectId) : false;
          }
        }
        
        // Also check via task -> story -> project mapping
        const entryTaskId = normalizeId(entry.taskId);
        if (entryTaskId) {
          const task = tasksMap.get(entryTaskId);
          if (task) {
            const taskStoryId = normalizeId(task.storyId);
            if (taskStoryId) {
              const story = storiesMap.get(taskStoryId);
              if (story) {
                const storyProjectId = normalizeId(story.projectId);
                return storyProjectId ? accessibleProjectIds.has(storyProjectId) : false;
              }
            }
          }
        }
        
        return false;
      });
    }
    
    // First, map all entries and resolve subtask entries to their parent tasks
    const processedEntries = entriesToMap.map((entry) => {
        const normalizedEntryId = normalizeId(entry.id) || String(entry.id);
        const normalizedUserId = normalizeId(entry.userId);
        const user = normalizedUserId ? usersMap.get(normalizedUserId) : undefined;
        
        // Check if entry is for a subtask and resolve to parent task
        const entrySubtaskId = normalizeId((entry as any).subtaskId);
        let resolvedTaskId = normalizeId(entry.taskId);
        
        // If entry has subtaskId, find the parent taskId
        if (entrySubtaskId && !resolvedTaskId) {
          resolvedTaskId = subtaskToTaskMap.get(entrySubtaskId);
        }
        
        const entryTaskId = resolvedTaskId;
        const task = entryTaskId ? tasksMap.get(entryTaskId) : null;
        const assigneeId = task?.assigneeId ? normalizeId(task.assigneeId) : undefined;
        const assigneeUser = assigneeId ? usersMap.get(assigneeId) : undefined;
        // Get story from entry.storyId or from task.storyId
        const explicitStoryId = normalizeId(entry.storyId);
        const derivedStoryId = explicitStoryId || (task?.storyId ? normalizeId(task.storyId) : undefined);
        const story = derivedStoryId ? storiesMap.get(derivedStoryId) : null;
        
        // Get projectId from entry, story, or task's story (in that order)
        // Note: Task doesn't have projectId directly, but Story does
        const { id: entryResolvedProjectId, name: entryResolvedProjectName } = resolveProjectInfoFromEntry(entry);
        const derivedProjectId =
          entryResolvedProjectId ||
          (story?.projectId ? normalizeId(story.projectId) : undefined);
        const resolvedProjectId = derivedProjectId;
        const project = resolvedProjectId ? projectsMap.get(resolvedProjectId) : null;
        const rawProjectName =
          (typeof (entry as any).projectName === 'string' && (entry as any).projectName) ||
          (typeof (entry as any).project === 'string' && (entry as any).project) ||
          entryResolvedProjectName ||
          (story?.projectId && projectsMap.get(normalizeId(story.projectId)!)?.name);
        const resolvedProjectName = project?.name || rawProjectName || 'Unassigned Project';
        
        // Get sprint from entry, story or project
        const { id: entrySprintId, name: entrySprintName } = resolveSprintInfoFromEntry(entry);
        const sprintId = entrySprintId || (story?.sprintId ? normalizeId(story.sprintId) : undefined);
        const sprint = sprintId ? sprintsMap.get(sprintId) : 
                      (derivedProjectId ? projectToSprintMap.get(derivedProjectId) : null);
        const rawSprintName =
          (typeof (entry as any).sprintName === 'string' && (entry as any).sprintName) ||
          entrySprintName ||
          (story && story.sprintId ? sprintsMap.get(normalizeId(story.sprintId) || '')?.name : undefined);
        const resolvedSprintName = sprint?.name || rawSprintName;
        const fallbackSprintLabel = resolvedSprintName || (sprintId ? formatDisplayName(String(sprintId)) : undefined);

        const rawCategory =
          (entry as any).category ??
          (entry as any).entryType ??
          (entry as any).workType ??
          (entry as any).type ??
          (task as any)?.category ??
          (task as any)?.workType ??
          (story as any)?.category ??
          (story as any)?.workType ??
          undefined;
        const normalizedCategory = normalizeCategory(rawCategory);

        const hoursWorked = entry.hoursWorked || 0;
        const hours = Math.floor(hoursWorked);
        const minutes = Math.round((hoursWorked - hours) * 60);
        const timeSpent = `${hours}h ${minutes}m`;

        const estimatedHours = task?.estimatedHours || story?.estimatedHours || 0;
        const actualHours = task?.actualHours || story?.actualHours || 0;
        const remainingHours = Math.max(0, estimatedHours - actualHours);
        const remHours = Math.floor(remainingHours);
        const remMinutes = Math.round((remainingHours - remHours) * 60);
        const remaining = estimatedHours > 0 ? `${remHours}h ${remMinutes}m` : '0h 0m';

        const estHours = Math.floor(estimatedHours);
        const estMinutes = Math.round((estimatedHours - estHours) * 60);
        const estimation = estimatedHours > 0 ? `${estHours}h ${estMinutes}m` : undefined;

        const taskStatus = task?.status || 'TO_DO';
        // Keep the original task status for display purposes
        const normalizedTaskStatus = (taskStatus || '').toString().toUpperCase().trim();
        // Map task status to entry status for filtering/grouping (legacy support)
        let entryStatus: 'active' | 'completed' = 'active';
        if (normalizedTaskStatus === 'DONE' || normalizedTaskStatus === 'COMPLETED') {
          entryStatus = 'completed';
        } else {
          entryStatus = 'active';
        }

        const displayUserName = assigneeUser?.name || (assigneeId || user?.name || 'Unknown User');
        const displayUserRole = assigneeUser?.role || user?.role || 'DEVELOPER';

        return {
          id: normalizedEntryId,
          task: task?.title || 'Unassigned Task',
          taskId: entryTaskId,
          story: story?.title || 'Unassigned Story',
          storyId: derivedStoryId,
          project: resolvedProjectName,
          projectId: resolvedProjectId || derivedProjectId,
          sprintId: sprint?.id ? normalizeId(sprint.id) : sprintId,
          sprintName: fallbackSprintLabel,
          user: displayUserName,
          userId: assigneeId || normalizedUserId || '',
          userRole: displayUserRole,
          duration: timeSpent,
          date: entry.workDate || entry.createdAt,
          status: entryStatus,
          taskStatus: normalizedTaskStatus, // Store the actual task status for display
          billable: entry.isBillable !== false,
          category: normalizedCategory,
          description: entry.description,
          timeSpent,
          remaining,
          estimation,
          startTime: entry.startTime || undefined,
          endTime: entry.endTime || undefined,
          hoursWorked: entry.hoursWorked,
          notes: entry.description
        };
      });

    // Filter out entries without valid taskId (orphaned subtask entries that couldn't be resolved)
    const validEntries = processedEntries.filter(entry => entry.taskId);
    
    // Group entries by taskId and aggregate hours
    const taskEntryMap = new Map<string, TimeEntry[]>();
    validEntries.forEach(entry => {
      const taskId = entry.taskId!;
      if (!taskEntryMap.has(taskId)) {
        taskEntryMap.set(taskId, []);
      }
      taskEntryMap.get(taskId)!.push(entry);
    });

    // Aggregate entries by task
    const aggregatedEntries: TimeEntry[] = Array.from(taskEntryMap.entries()).map(([taskId, entries]) => {
      // Use the first entry as the base
      const baseEntry = entries[0];
      
      // Aggregate hours from all entries (task + subtasks)
      const totalHours = entries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
      const totalHoursRounded = Math.round(totalHours * 100) / 100;
      const hours = Math.floor(totalHoursRounded);
      const minutes = Math.round((totalHoursRounded - hours) * 60);
      const aggregatedTimeSpent = `${hours}h ${minutes}m`;
      
      // Combine descriptions (if multiple entries)
      const descriptions = entries
        .map(e => e.description || e.notes)
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
      const combinedDescription = descriptions.length > 0 
        ? (descriptions.length === 1 ? descriptions[0] : descriptions.join('; '))
        : baseEntry.description;

      return {
        ...baseEntry,
        id: `${taskId}-aggregated`,
        hoursWorked: totalHoursRounded,
        timeSpent: aggregatedTimeSpent,
        duration: aggregatedTimeSpent,
        description: combinedDescription,
        notes: combinedDescription
      };
    });

    setTimeEntries(aggregatedEntries);
  }, [rawTimeEntries, usersMap, projectsMap, storiesMap, tasksMap, sprintsMap, projectToSprintMap, subtaskToTaskMap, currentUser, projects]);

  // Parse time string to minutes
  const parseTime = (timeStr: string): number => {
    if (timeStr.includes('h')) {
      const parts = timeStr.replace('m', '').split('h');
      const hours = parseInt(parts[0]?.trim() || '0', 10);
      const minutes = parseInt(parts[1]?.trim() || '0', 10);
      return hours * 60 + minutes;
    }
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      const hours = parseInt(parts[0] || '0', 10);
      const minutes = parseInt(parts[1] || '0', 10);
      return hours * 60 + minutes;
    }
    return 0;
  };

  // Format time for display (HH:MM)
  const formatTimeHHMM = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate task progress
  const getTaskProgress = (entry: TimeEntry) => {
    const spent = parseTime(entry.timeSpent);
    const actual = entry.estimation ? parseTime(entry.estimation) : (spent + parseTime(entry.remaining));
    const remaining = parseTime(entry.remaining);
    
    if (actual === 0) return { spentPercent: 0, remainingPercent: 0, actual, spent, remaining, variance: 0 };
    
    const spentPercent = Math.round((spent / actual) * 100);
    const remainingPercent = Math.round((remaining / actual) * 100);
    const variance = actual > 0 ? Math.round(((spent - actual) / actual) * 100) : 0;
    
    return { spentPercent, remainingPercent, actual, spent, remaining, variance };
  };

  // Filter time entries
  const filteredTimeEntries = useMemo(() => {
    let filtered = [...timeEntries];

    if (userFilter !== 'all') {
      filtered = filtered.filter(entry => entry.userId === userFilter);
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(entry => entry.projectId === projectFilter);
    }

    if (sprintFilter !== 'all') {
      filtered = filtered.filter(entry => entry.sprintId === sprintFilter);
    }

    if (workTypeFilter !== 'all') {
      const normalizedWorkType = normalizeCategory(workTypeFilter);
      filtered = filtered.filter(entry => entry.category === normalizedWorkType);
    }

    if (billableFilter === 'billable') {
      filtered = filtered.filter(entry => entry.billable);
    } else if (billableFilter === 'non-billable') {
      filtered = filtered.filter(entry => !entry.billable);
    }

    const isWithinRange = (entry: TimeEntry, start: Date, end?: Date) => {
      const parsedDate = parseEntryDateValue(entry.date);
      if (!parsedDate) {
        return false;
      }

      const rangeStart = startOfDay(start);
      const rangeEnd = end ? endOfDay(end) : endOfDay(new Date());

      return (
        parsedDate.getTime() >= rangeStart.getTime() &&
        parsedDate.getTime() <= rangeEnd.getTime()
      );
    };

    const now = new Date();

    if (timeFilter === 'this-week') {
      const start = startOfDay(now);
      start.setDate(now.getDate() - now.getDay());
      filtered = filtered.filter(entry => isWithinRange(entry, start));
    } else if (timeFilter === 'last-week') {
      const startOfThisWeek = startOfDay(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay());
      const start = new Date(startOfThisWeek);
      start.setDate(start.getDate() - 7);
      const end = new Date(startOfThisWeek.getTime() - 1);
      filtered = filtered.filter(entry => isWithinRange(entry, start, end));
    } else if (timeFilter === 'this-month') {
      const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      filtered = filtered.filter(entry => isWithinRange(entry, start));
    } else if (timeFilter === 'last-month') {
      const startOfThisMonth = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      const start = new Date(startOfThisMonth);
      start.setMonth(start.getMonth() - 1);
      const end = new Date(startOfThisMonth.getTime() - 1);
      filtered = filtered.filter(entry => isWithinRange(entry, start, end));
    } else if (timeFilter === 'custom') {
      if (customDateRange?.from && customDateRange?.to) {
        filtered = filtered.filter(entry =>
          isWithinRange(entry, customDateRange.from, customDateRange.to)
        );
      } else {
        filtered = [];
      }
    }

    return filtered;
  }, [timeEntries, userFilter, projectFilter, sprintFilter, workTypeFilter, billableFilter, timeFilter, customDateRange]);

  // Calculate summary statistics - show all users' data for managers/admins, only current user for others
  const summaryStats = useMemo(() => {
    // Check if current user is manager or admin
    const isManagerOrAdmin = currentUser && (
      (currentUser.role as string) === 'admin' || 
      (currentUser.role as string) === 'manager' || 
      (currentUser.role as string) === 'MANAGER' ||
      (currentUser.role as string) === 'ADMIN' ||
      (currentUser.role as string)?.toLowerCase() === 'manager' ||
      (currentUser.role as string)?.toLowerCase() === 'admin'
    );
    
    // Calculate allotted time
    let totalAllottedMinutes = 0;
    if (isManagerOrAdmin) {
      // For managers/admins: sum allotted time from all users' assigned tasks
      // Use a Set to avoid double-counting tasks that might be in both userTasksMap and allTasks
      const countedTaskIds = new Set<string>();
      
      // First, count tasks from userTasksMap
      userTasksMap.forEach((tasks) => {
        tasks.forEach(task => {
          const taskId = normalizeId(task.id);
          if (taskId && !countedTaskIds.has(taskId)) {
            countedTaskIds.add(taskId);
            const estimatedHours = task.estimatedHours || 0;
            totalAllottedMinutes += (estimatedHours * 60);
          }
        });
      });
      
      // Then, count tasks from allTasks that weren't already counted
      allTasks.forEach(task => {
        const taskId = normalizeId(task.id);
        if (taskId && !countedTaskIds.has(taskId)) {
          countedTaskIds.add(taskId);
          const estimatedHours = task.estimatedHours || 0;
          totalAllottedMinutes += (estimatedHours * 60);
        }
      });
    } else if (currentUser && currentUser.id) {
      // For non-managers: calculate only from current user's assigned tasks
      const currentUserId = normalizeId(currentUser.id);
      if (currentUserId) {
        const fetchedUserTasks = userTasksMap.get(currentUserId) || [];
        const allUserTasks = allTasks.filter(task => normalizeId(task.assigneeId) === currentUserId);
        const combinedUserTasks = new Map<string, Task>();
        fetchedUserTasks.forEach(task => {
          const taskId = normalizeId(task.id);
          if (taskId) combinedUserTasks.set(taskId, task);
        });
        allUserTasks.forEach(task => {
          const taskId = normalizeId(task.id);
          if (taskId && !combinedUserTasks.has(taskId)) {
            combinedUserTasks.set(taskId, task);
          }
        });
        
        // Sum estimated hours from all assigned tasks
        totalAllottedMinutes = Array.from(combinedUserTasks.values()).reduce((sum, task) => {
          const estimatedHours = task.estimatedHours || 0;
          return sum + (estimatedHours * 60);
        }, 0);
      }
    }
    
    const totalMinutes = filteredTimeEntries.reduce((sum, entry) => {
      return sum + parseTime(entry.timeSpent);
    }, 0);
    
    const billableMinutes = filteredTimeEntries
      .filter(e => e.billable)
      .reduce((sum, entry) => {
        return sum + parseTime(entry.timeSpent);
      }, 0);
    
    const uniqueUsers = new Set(filteredTimeEntries.map(e => e.userId)).size;
    const uniqueProjectsFiltered = new Set(
      filteredTimeEntries
        .map(e => e.projectId || e.project)
        .filter(Boolean)
    ).size;
    const totalUniqueProjects = new Set(
      timeEntries
        .map(e => e.projectId || e.project)
        .filter(Boolean)
    ).size;
    const uniqueDates = new Set(
      filteredTimeEntries
        .map(e => {
          const parsed = new Date(e.date);
          return Number.isNaN(parsed.getTime())
            ? null
            : parsed.toISOString().split('T')[0];
        })
        .filter((value): value is string => Boolean(value))
    ).size;
    const averageDailyMinutes = uniqueDates > 0 ? Math.round(totalMinutes / uniqueDates) : 0;
    const billablePercentage = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;

    // Calculate team members count based on project filter
    // If a project is selected, use project team members count; otherwise use active users or unique users
    let resolvedActiveMemberCount: number;
    if (projectFilter !== 'all' && projectTeamMembers.length > 0) {
      // Use project-specific team members count
      resolvedActiveMemberCount = projectTeamMembers.length;
    } else if (projectFilter !== 'all') {
      // Project selected but team members not loaded yet, use unique users from filtered entries
      resolvedActiveMemberCount = uniqueUsers;
    } else {
      // No project filter, use active users count or unique users
      resolvedActiveMemberCount = activeUserCount > 0 ? activeUserCount : uniqueUsers;
    }
    
    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    };
    
    return {
      totalHours: formatTime(totalMinutes),
      billableHours: formatTime(billableMinutes),
      allottedHours: formatTime(totalAllottedMinutes),
      activeMembers: resolvedActiveMemberCount,
      timeEntries: filteredTimeEntries.length,
      billablePercentage,
      totalMinutes,
      billableMinutes,
      uniqueProjects: uniqueProjectsFiltered,
      totalUniqueProjects,
      uniqueUsers,
      uniqueDates,
      averageDailyMinutes
    };
  }, [filteredTimeEntries, activeUserCount, currentUser, userTasksMap, allTasks, timeEntries, projectFilter, projectTeamMembers]);

  const dailyTrendData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTimeEntries.forEach(entry => {
      const parsedDate = new Date(entry.date);
      if (Number.isNaN(parsedDate.getTime())) {
        return;
      }
      const key = parsedDate.toISOString().split('T')[0];
      const minutes = parseTime(entry.timeSpent);
      map.set(key, (map.get(key) || 0) + minutes);
    });

    return Array.from(map.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([dateKey, minutes]) => {
        const label = new Date(dateKey).toLocaleDateString(undefined, { weekday: 'short' });
        return {
          dateKey,
          label,
          hours: Math.round((minutes / 60) * 10) / 10,
          minutes,
        };
      });
  }, [filteredTimeEntries]);

  const sprintBreakdownData = useMemo(() => {
    const map = new Map<
      string,
      {
        sprintId: string;
        sprintName: string;
        minutes: number;
      }
    >();

    filteredTimeEntries.forEach(entry => {
      const sprintId = entry.sprintId ?? entry.sprintName ?? 'unassigned';
      const sprintName =
        entry.sprintName ||
        (entry.sprintId ? sprintsMap.get(entry.sprintId)?.name : undefined) ||
        (typeof sprintId === 'string' && sprintId !== 'unassigned' ? sprintId : 'Unassigned');
      const minutes = parseTime(entry.timeSpent);

      const existing = map.get(sprintId);
      if (existing) {
        existing.minutes += minutes;
        existing.sprintName = sprintName;
      } else {
        map.set(sprintId, {
          sprintId: entry.sprintId ?? 'unassigned',
          sprintName,
          minutes,
        });
      }
    });

    return Array.from(map.values())
      .map(item => ({
        sprintId: item.sprintId,
        sprintName: item.sprintName,
        hours: Math.round((item.minutes / 60) * 10) / 10,
        minutes: item.minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [filteredTimeEntries, sprintsMap]);

  const workTypeBreakdownData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTimeEntries.forEach(entry => {
      const category = (entry.category || 'other').toLowerCase();
      const minutes = parseTime(entry.timeSpent);
      map.set(category, (map.get(category) || 0) + minutes);
    });

    return Array.from(map.entries())
      .map(([category, minutes]) => ({
        category,
        hours: Math.round((minutes / 60) * 10) / 10,
        minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [filteredTimeEntries]);

  const teamBreakdownData = useMemo(() => {
    const map = new Map<string, { name: string; billableMinutes: number; nonBillableMinutes: number }>();

    filteredTimeEntries.forEach(entry => {
      const userId = entry.userId || 'unknown';
      const userName = entry.user || getUserName(userId);
      const current = map.get(userId) || { name: userName, billableMinutes: 0, nonBillableMinutes: 0 };
      const minutes = parseTime(entry.timeSpent);
      if (entry.billable) {
        current.billableMinutes += minutes;
      } else {
        current.nonBillableMinutes += minutes;
      }
      map.set(userId, current);
    });

    return Array.from(map.entries())
      .map(([userId, { name, billableMinutes, nonBillableMinutes }]) => {
        const totalMinutes = billableMinutes + nonBillableMinutes;
        return {
          userId,
          userName: name,
          billableHours: Math.round((billableMinutes / 60) * 10) / 10,
          nonBillableHours: Math.round((nonBillableMinutes / 60) * 10) / 10,
          totalHours: Math.round((totalMinutes / 60) * 10) / 10,
          billableMinutes,
          nonBillableMinutes,
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [filteredTimeEntries, getUserName]);

  const sortedTimeEntries = useMemo(() => {
    return [...filteredTimeEntries].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) {
        return dateDiff;
      }
      const startA = a.startTime ? a.startTime.localeCompare(b.startTime || '') : 0;
      return startA;
    });
  }, [filteredTimeEntries]);

  useEffect(() => {
    // Reset to first page when filters or data change
    setCurrentPage(1);
  }, [filteredTimeEntries.length, pageSize, userFilter, projectFilter, sprintFilter, workTypeFilter, billableFilter, timeFilter, customDateRange]);

  useEffect(() => {
    // Clamp current page if total pages decreased
    const total = sortedTimeEntries.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [sortedTimeEntries, pageSize, currentPage]);

  const paginated = useMemo(() => {
    const total = sortedTimeEntries.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (safePage - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const rows = sortedTimeEntries.slice(start, end);
    return { rows, start, end, total, totalPages, page: safePage };
  }, [sortedTimeEntries, pageSize, currentPage]);

  const workTypeColorPalette = useMemo(
    () => [
      '#4f46e5',
      '#6366f1',
      '#8b5cf6',
      '#a855f7',
      '#c084fc',
      '#f472b6',
      '#22d3ee',
      '#34d399',
    ],
    []
  );

  const stackedBarColors = useMemo(
    () => ({
      billable: '#22c55e',
      nonBillable: '#818cf8',
    }),
    []
  );

  // Helper function to get status style based on task status
  const getTaskStatusStyle = useCallback((taskStatus: string | undefined) => {
    const normalizedStatus = (taskStatus || '').toString().toUpperCase().trim();
    
    switch (normalizedStatus) {
      case 'DONE':
      case 'COMPLETED':
        return {
          label: 'Done',
          className: 'bg-green-100 text-green-700 border-green-200',
        };
      case 'IN_PROGRESS':
      case 'INPROGRESS':
      case 'ACTIVE':
        return {
          label: 'In Progress',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
        };
      case 'QA':
      case 'QA_REVIEW':
      case 'REVIEW':
        return {
          label: 'QA Review',
          className: 'bg-purple-100 text-purple-700 border-purple-200',
        };
      case 'TO_DO':
      case 'TODO':
      case 'BACKLOG':
        return {
          label: 'To Do',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
      case 'BLOCKED':
        return {
          label: 'Blocked',
          className: 'bg-red-100 text-red-700 border-red-200',
        };
      case 'CANCELLED':
      case 'CANCELED':
        return {
          label: 'Cancelled',
          className: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      default:
        return {
          label: normalizedStatus || 'Unknown',
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        };
    }
  }, []);

  const entryStatusStyles = useMemo(
    () => ({
      active: {
        label: 'Active',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
      completed: {
        label: 'Completed',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      },
    }),
    []
  );

  const totalHoursDecimal = summaryStats.totalMinutes
    ? Math.round((summaryStats.totalMinutes / 60) * 10) / 10
    : 0;
  const billableHoursDecimal = summaryStats.billableMinutes
    ? Math.round((summaryStats.billableMinutes / 60) * 10) / 10
    : 0;
  const averageDailyHoursDecimal = summaryStats.averageDailyMinutes
    ? Math.round((summaryStats.averageDailyMinutes / 60) * 10) / 10
    : 0;
  const activeProjectsTotal = useMemo(() => {
    // Only count projects where the user is listed (already filtered by projects useMemo)
    // The projects array is already filtered to only include projects where:
    // - User is manager/admin (sees all accessible projects)
    // - User is manager, creator, or team member of the project
    if (!Array.isArray(projects) || projects.length === 0) {
      return summaryStats.totalUniqueProjects || summaryStats.uniqueProjects || 0;
    }

    const normalizeStatus = (status?: string | null) =>
      status ? status.toString().trim().toUpperCase() : undefined;

    const normalizedCurrentUserId = currentUser?.id ? normalizeId(currentUser.id) : undefined;

    return projects.filter(project => {
      // Check if user is listed in this project
      if (normalizedCurrentUserId) {
        const managerId = normalizeId((project as any).managerId);
        const createdById = normalizeId((project as any).createdBy);
        
        // Check if user is manager or creator
        if (managerId === normalizedCurrentUserId || createdById === normalizedCurrentUserId) {
          // User is manager or creator, check status
          const status = normalizeStatus((project as any).status);
          const isActiveFlag =
            typeof (project as any).isActive === 'boolean' ? (project as any).isActive : true;

          if (!isActiveFlag) {
            return false;
          }

          if (!status) {
            return true;
          }

          return !['COMPLETED', 'CANCELLED', 'ON_HOLD'].includes(status);
        }

        // Check if user is a team member
        const teamList: any[] =
          Array.isArray((project as any).teamMembers) ? (project as any).teamMembers :
          Array.isArray((project as any).members) ? (project as any).members :
          Array.isArray((project as any).team) ? (project as any).team :
          [];

        const isTeamMember = teamList.some(member => {
          const memberId = normalizeId(
            member?.userId ??
            member?.id ??
            member?.memberId ??
            member?.assigneeId ??
            member?.user?.id
          );
          return memberId === normalizedCurrentUserId;
        });

        if (!isTeamMember) {
          return false; // User is not listed in this project
        }
      }

      // User is listed, check status
      const status = normalizeStatus((project as any).status);
      const isActiveFlag =
        typeof (project as any).isActive === 'boolean' ? (project as any).isActive : true;

      if (!isActiveFlag) {
        return false;
      }

      if (!status) {
        return true;
      }

      return !['COMPLETED', 'CANCELLED', 'ON_HOLD'].includes(status);
    }).length;
  }, [projects, summaryStats.totalUniqueProjects, summaryStats.uniqueProjects, currentUser]);

  const activeProjectsWithinRange = summaryStats.uniqueProjects || 0;
  
  // Calculate team members count based on the same filtering logic as the picker
  const activeMemberCount = useMemo(() => {
    // Get all team members from projects where the user is listed
    const allProjectTeamMemberIds = new Set<string>();
    
    // Collect team members from all accessible projects
    projects.forEach(project => {
      const teamList: any[] =
        Array.isArray((project as any).teamMembers) ? (project as any).teamMembers :
        Array.isArray((project as any).members) ? (project as any).members :
        Array.isArray((project as any).team) ? (project as any).team :
        [];
      
      teamList.forEach(member => {
        const memberId = normalizeId(
          member?.userId ??
          member?.id ??
          member?.memberId ??
          member?.assigneeId ??
          member?.user?.id ??
          member?.user?.userId
        );
        if (memberId) {
          allProjectTeamMemberIds.add(memberId);
        }
      });
    });
    
    // If a specific project is selected, filter to only that project's team members
    if (projectFilter !== 'all') {
      const normalizedProjectFilter = normalizeId(projectFilter);
      
      // Get team members from the selected project (from API)
      const projectTeamMemberIds = new Set(
        projectTeamMembers
          .map(member => {
            const memberId = normalizeId(
              (member as any).userId ||
              (member as any).id ||
              (member as any).memberId ||
              (member as any).user?.id ||
              (member as any).user?.userId
            );
            return memberId;
          })
          .filter((id): id is string => Boolean(id))
      );
      
      // Fallback: If no team members from API, try to get from project data
      if (projectTeamMemberIds.size === 0) {
        const selectedProject = projects.find(p => normalizeId(p.id) === normalizedProjectFilter);
        if (selectedProject) {
          const projectTeamList: any[] =
            Array.isArray((selectedProject as any).teamMembers) ? (selectedProject as any).teamMembers :
            Array.isArray((selectedProject as any).members) ? (selectedProject as any).members :
            Array.isArray((selectedProject as any).team) ? (selectedProject as any).team :
            [];
          
          projectTeamList.forEach(member => {
            const memberId = normalizeId(
              member?.userId ??
              member?.id ??
              member?.memberId ??
              member?.assigneeId ??
              member?.user?.id ??
              member?.user?.userId
            );
            if (memberId) {
              projectTeamMemberIds.add(memberId);
            }
          });
        }
      }
      
      return projectTeamMemberIds.size;
    } else {
      // No project selected, return count of all team members from projects where user is listed
      return allProjectTeamMemberIds.size;
    }
  }, [projects, projectFilter, projectTeamMembers]);
  
  const timeEntryCount = summaryStats.timeEntries || 0;
  const billablePercentage = summaryStats.billablePercentage || 0;

  const getCategoryColor = (category: string) => {
    switch (normalizeCategory(category)) {
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'documentation':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'idle':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'learning':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'meeting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'support':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'testing':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'training':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCategoryName = (category: string) => {
    return normalizeCategory(category)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProjectInitials = (project: string) => {
    const tokens = formatDisplayName(project)
      .split(' ')
      .map(token => token.trim())
      .filter(Boolean);

    if (tokens.length === 0) {
      return 'PR';
    }

    return tokens
      .map(segment => segment[0]?.toUpperCase() || '')
      .join('');
  };

const formatEntryDateDisplay = (value?: string | Date | number) => {
  const parsed = parseEntryDateValue(value);
  if (!parsed) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
  };

  // Determine if we're still loading initial data
  const isLoadingData = loading || 
    usersResult.loading || 
    projectsResult.loading || 
    sprintsResult.loading ||
    (users.length === 0 && usersResult.data === null);

  if (isLoadingData) {
    return <LoadingSpinner message="Loading Time Tracking..." fullScreen />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading time entries</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

                  
                  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
          <h1 className="text-2xl font-semibold text-foreground">Time Tracking Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor logged effort, billability, and sprint focus in real time.
                      </p>
                    </div>
                    </div>

      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-nowrap items-start gap-6 overflow-x-auto pb-1">
              <div className="space-y-1 flex min-w-[140px] flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date Range</p>
                <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="last-week">Last Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {timeFilter === 'custom' && (
                  <Popover open={customRangeOpen} onOpenChange={setCustomRangeOpen}>
                    <PopoverTrigger asChild>
                            <Button 
                        type="button"
                              variant="outline" 
                        className={`h-10 w-full justify-start text-left font-normal ${customDateRange?.from ? '' : 'text-muted-foreground'}`}
                      >
                        {customRangeLabel}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={customDateRange}
                        onSelect={handleCustomRangeSelect}
                        numberOfMonths={2}
                        defaultMonth={customDateRange?.from}
                      />
                      <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/40 p-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                              onClick={() => {
                            setCustomDateRange(undefined);
                              }}
                            >
                          Clear
                            </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setCustomRangeOpen(false)}
                          disabled={!(customDateRange?.from && customDateRange?.to)}
                        >
                          Apply
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  )}
                </div>

              <div className="space-y-1 flex min-w-[140px] flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Project</p>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map(project => {
                      const projectId = normalizeId(project.id);
                      if (!projectId) {
                        return null;
                      }
                      return (
                        <SelectItem key={projectId} value={projectId}>
                          {project.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                      </div>
                      
              <div className="space-y-1 flex min-w-[140px] flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sprint</p>
                <Select value={sprintFilter} onValueChange={setSprintFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="All Sprints" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sprints</SelectItem>
                    {(() => {
                      // Filter sprints by selected project if a project is selected
                      let filteredSprints = sprints;
                      if (projectFilter !== 'all') {
                        const normalizedProjectFilter = normalizeId(projectFilter);
                        filteredSprints = sprints.filter(sprint => {
                          const sprintProjectId = normalizeId(sprint.projectId);
                          return sprintProjectId === normalizedProjectFilter;
                        });
                        
                        // Fallback: If no sprints found, try to get sprints from the project data itself
                        if (filteredSprints.length === 0) {
                          const selectedProject = projects.find(p => normalizeId(p.id) === normalizedProjectFilter);
                          if (selectedProject && (selectedProject as any).sprints) {
                            const projectSprints = Array.isArray((selectedProject as any).sprints) 
                              ? (selectedProject as any).sprints 
                              : [];
                            filteredSprints = projectSprints.map((s: any) => ({
                              id: s.id || s.sprintId,
                              name: s.name || s.sprintName,
                              projectId: normalizedProjectFilter,
                              ...s
                            }));
                          }
                        }
                      }
                      return filteredSprints.map(sprint => {
                        const sprintId = normalizeId(sprint.id);
                        if (!sprintId) {
                          return null;
                        }
                        return (
                          <SelectItem key={sprintId} value={sprintId}>
                            {sprint.name}
                          </SelectItem>
                        );
                      });
                    })()}
                  </SelectContent>
                </Select>
                        </div>

              <div className="space-y-1 flex min-w-[140px] flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Team Member</p>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="All Members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {(() => {
                      // Get all team members from projects where the user is listed
                      const allProjectTeamMemberIds = new Set<string>();
                      
                      // Collect team members from all accessible projects
                      projects.forEach(project => {
                        const teamList: any[] =
                          Array.isArray((project as any).teamMembers) ? (project as any).teamMembers :
                          Array.isArray((project as any).members) ? (project as any).members :
                          Array.isArray((project as any).team) ? (project as any).team :
                          [];
                        
                        teamList.forEach(member => {
                          const memberId = normalizeId(
                            member?.userId ??
                            member?.id ??
                            member?.memberId ??
                            member?.assigneeId ??
                            member?.user?.id
                          );
                          if (memberId) {
                            allProjectTeamMemberIds.add(memberId);
                          }
                        });
                      });
                      
                      // If a specific project is selected, filter to only that project's team members
                      let filteredUsers = users;
                      if (projectFilter !== 'all') {
                        const normalizedProjectFilter = normalizeId(projectFilter);
                        
                        // Get team members from the selected project (from API)
                        const projectTeamMemberIds = new Set(
                          projectTeamMembers
                            .map(member => {
                              const memberId = normalizeId(
                                (member as any).userId ||
                                (member as any).id ||
                                (member as any).memberId ||
                                (member as any).user?.id ||
                                (member as any).user?.userId
                              );
                              return memberId;
                            })
                            .filter((id): id is string => Boolean(id))
                        );
                        
                        // Fallback: If no team members from API, try to get from project data
                        if (projectTeamMemberIds.size === 0) {
                          const selectedProject = projects.find(p => normalizeId(p.id) === normalizedProjectFilter);
                          if (selectedProject) {
                            const projectTeamList: any[] =
                              Array.isArray((selectedProject as any).teamMembers) ? (selectedProject as any).teamMembers :
                              Array.isArray((selectedProject as any).members) ? (selectedProject as any).members :
                              Array.isArray((selectedProject as any).team) ? (selectedProject as any).team :
                              [];
                            
                            projectTeamList.forEach(member => {
                              const memberId = normalizeId(
                                member?.userId ??
                                member?.id ??
                                member?.memberId ??
                                member?.assigneeId ??
                                member?.user?.id ??
                                member?.user?.userId
                              );
                              if (memberId) {
                                projectTeamMemberIds.add(memberId);
                              }
                            });
                          }
                        }
                        
                        // Filter users to only show team members from the selected project
                        filteredUsers = users.filter(user => {
                          const userId = normalizeId(user.id);
                          return userId ? projectTeamMemberIds.has(userId) : false;
                        });
                      } else {
                        // No project selected, show all team members from projects where user is listed
                        filteredUsers = users.filter(user => {
                          const userId = normalizeId(user.id);
                          return userId ? allProjectTeamMemberIds.has(userId) : false;
                        });
                      }
                      
                      return filteredUsers.map(user => {
                        const userId = normalizeId(user.id);
                        if (!userId) {
                          return null;
                        }
                        return (
                          <SelectItem key={userId} value={userId}>
                            {user.name}
                          </SelectItem>
                        );
                      });
                    })()}
                  </SelectContent>
                </Select>
                        </div>

              <div className="space-y-1 flex min-w-[140px] flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Work Type</p>
                <Select value={workTypeFilter} onValueChange={setWorkTypeFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {workTypeOptions.map(type => (
                      <SelectItem key={type} value={type}>
                        {formatCategoryName(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                        </div>

              <div className="space-y-1 flex min-w-[140px] flex-1 flex-col">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billable Status</p>
                <Select value={billableFilter} onValueChange={setBillableFilter}>
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="billable">Billable</SelectItem>
                    <SelectItem value="non-billable">Non-billable</SelectItem>
                  </SelectContent>
                </Select>
                      </div>

              <div className="flex min-w-[100px] basis-[120px] flex-none flex-col justify-end">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-0">
                  Reset
                </span>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="h-10 w-full"
                >
                  Reset
                </Button>
                </div>
                          </div>
              </div>
            </CardContent>
          </Card>

      <div className="grid gap-6 md:grid-cols-6">
        <Card className="shadow-sm">
                  <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
                        <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Hours Logged
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{totalHoursDecimal.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hours this period</p>
                        </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <Clock className="h-5 w-5" />
              </span>
                      </div>
            </CardContent>
          </Card>

        <Card className="shadow-sm">
                  <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
                        <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Billable Hours
                          </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{billableHoursDecimal.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{billablePercentage}% of total</p>
                        </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Target className="h-5 w-5" />
              </span>
                        </div>
        </CardContent>
      </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
                        <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Team Members
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{activeMemberCount}</p>
                <p className="text-xs text-muted-foreground">
                  {activeMemberCount === 1 ? 'member' : 'members'} actively logging time
                          </p>
                        </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <Users className="h-5 w-5" />
              </span>
                  </div>
                </CardContent>
              </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
                        <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Active Projects
                          </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{activeProjectsTotal}</p>
                <p className="text-xs text-muted-foreground">
                  {activeProjectsWithinRange > 0
                    ? `with logged time${timeFilter !== 'all-time' ? ` (${activeProjectsWithinRange} in current range)` : ''}`
                    : 'No time logged in selected range'}
                            </p>
                          </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                <BarChart3 className="h-5 w-5" />
              </span>
                        </div>
                </CardContent>
              </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                  <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Daily Average
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{averageDailyHoursDecimal.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">hours per day</p>
                  </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <TrendingUp className="h-5 w-5" />
              </span>
                </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                  <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Time Entries
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{timeEntryCount}</p>
                <p className="text-xs text-muted-foreground">total entries</p>
                                      </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <CheckCircle2 className="h-5 w-5" />
                                      </span>
                </div>
              </CardContent>
            </Card>
          </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Time Entries</h2>
            <p className="text-sm text-muted-foreground">
              Showing {paginated.total === 0 ? 0 : paginated.start + 1}–{paginated.end} of {filteredTimeEntries.length} entries
            </p>
                    </div>
          {paginated.rows.length > 0 ? (
            <Table className="[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_td]:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Sprint</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Estimated Hours</TableHead>
                  <TableHead>Actual Hours</TableHead>
                  <TableHead>Work Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.rows.map(entry => {
                  const sprintName = entry.sprintName
                    || (entry.sprintId ? sprintsMap.get(entry.sprintId)?.name : undefined)
                    || '—';
                  const entryHours =
                    entry.hoursWorked !== undefined && entry.hoursWorked !== null
                      ? entry.hoursWorked
                      : Math.round((parseTime(entry.timeSpent) / 60) * 10) / 10;
                  const estimatedMinutesRaw = entry.estimation
                    ? parseTime(entry.estimation)
                    : entry.remaining
                        ? parseTime(entry.timeSpent) + parseTime(entry.remaining)
                        : undefined;
                  const estimatedHours =
                    estimatedMinutesRaw !== undefined
                      ? Math.round((estimatedMinutesRaw / 60) * 10) / 10
                      : undefined;
                  // Get the actual task status style for display
                  const taskStatusStyle = getTaskStatusStyle(entry.taskStatus);
                  const billableBadgeClass = entry.billable
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                              {getInitials(entry.user)}
                            </AvatarFallback>
                          </Avatar>
        <div>
                            <p className="text-sm font-medium text-foreground">{entry.user}</p>
                            <p className="text-xs text-muted-foreground">{formatDisplayName(entry.userRole)}</p>
        </div>
      </div>
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        <p 
                          className="truncate font-medium text-foreground" 
                          title={entry.task}
                          style={{ maxWidth: '220px' }}
                        >
                          {entry.task.length > 50 ? `${entry.task.substring(0, 50)}...` : entry.task}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{entry.story}</p>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate">{entry.project}</TableCell>
                      <TableCell>{sprintName}</TableCell>
                      <TableCell>{formatEntryDateDisplay(entry.date)}</TableCell>
                      <TableCell>{estimatedHours !== undefined ? estimatedHours.toFixed(1) : '—'}</TableCell>
                      <TableCell>{entryHours.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getCategoryColor(entry.category)}`}>
                          {formatCategoryName(entry.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${taskStatusStyle.className}`}>
                          {taskStatusStyle.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${billableBadgeClass}`}>
                          {entry.billable ? 'Billable' : 'Non-billable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px]">
                        {entry.notes ? (
                          <p 
                            className="truncate" 
                            title={entry.notes}
                            style={{ maxWidth: '220px' }}
                          >
                            {entry.notes.length > 50 ? `${entry.notes.substring(0, 50)}...` : entry.notes}
                          </p>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No time entries match the selected filters.
              </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page</span>
              <Select value={String(pageSize)} onValueChange={(v) => setPageSize((Number(v) as 15 | 30))}>
                <SelectTrigger className="h-8 w-[88px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {paginated.total === 0 ? 0 : paginated.start + 1}–{paginated.end} of {paginated.total}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={paginated.page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(paginated.totalPages, p + 1))}
                disabled={paginated.page >= paginated.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
                                      <div>
                <h2 className="text-lg font-semibold text-foreground">Daily Time Trend</h2>
                <p className="text-sm text-muted-foreground">Hours logged each day</p>
              </div>
            </div>
            <div className="mt-6 h-72">
              {dailyTrendData.length > 0 ? (
                <ChartContainer
                  config={{
                    hours: {
                      label: 'Hours',
                      color: '#6366f1',
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No daily activity for the selected filters.
          </div>
                                      )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Time by Sprint</h2>
                <p className="text-sm text-muted-foreground">Compare logged hours across sprints</p>
              </div>
              </div>
            <div className="mt-6 h-72">
              {sprintBreakdownData.length > 0 ? (
                <ChartContainer
                  config={sprintBreakdownData.reduce(
                    (acc, sprint, index) => ({
                      ...acc,
                      [sprint.sprintId || `sprint-${index}`]: {
                        label: sprint.sprintName,
                        color: '#a855f7',
                      },
                    }),
                    {}
                  )}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sprintBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="sprintName"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" radius={6} fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No sprint data available.
                                      </div>
                                    )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Time by Work Type</h2>
                <p className="text-sm text-muted-foreground">Distribution of logged hours</p>
              </div>
      </div>
            <div className="mt-6 h-72">
              {workTypeBreakdownData.length > 0 ? (
                <ChartContainer
                  config={workTypeBreakdownData.reduce(
                    (acc, item, index) => ({
                      ...acc,
                      [item.category]: {
                        label: formatDisplayName(item.category),
                        color: workTypeColorPalette[index % workTypeColorPalette.length],
                      },
                    }),
                    {}
                  )}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: any, name: any) => [
                          `${value} hours`,
                          formatDisplayName(name)
                        ]}
                      />
                      <Pie
                        data={workTypeBreakdownData}
                        dataKey="hours"
                        nameKey="category"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        label={(entry: any) => `${formatDisplayName(entry.category)}: ${entry.hours}h`}
                      >
                        {workTypeBreakdownData.map((item, index) => (
                          <Cell
                            key={item.category}
                            fill={workTypeColorPalette[index % workTypeColorPalette.length]}
                          />
                        ))}
                      </Pie>
                      <Legend 
                        formatter={(value: string) => formatDisplayName(value)}
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No work type data available.
            </div>
              )}
      </div>
        </CardContent>
      </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Time by Team Member</h2>
                <p className="text-sm text-muted-foreground">Billable vs non-billable split</p>
            </div>
            </div>
            <div className="mt-6 h-72">
              {teamBreakdownData.length > 0 ? (
                <ChartContainer
                  config={{
                    billableHours: {
                      label: 'Billable',
                      color: stackedBarColors.billable,
                    },
                    nonBillableHours: {
                      label: 'Non-billable',
                      color: stackedBarColors.nonBillable,
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="userName"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="billableHours" stackId="hours" radius={[6, 6, 0, 0]} fill={stackedBarColors.billable} />
                      <Bar dataKey="nonBillableHours" stackId="hours" radius={0} fill={stackedBarColors.nonBillable} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No team activity for the selected filters.
          </div>
          )}
        </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Performance Analytics</DialogTitle>
            <DialogDescription>
              {selectedUserId && usersMap.get(selectedUserId) 
                ? `Performance metrics and charts for ${usersMap.get(selectedUserId)?.name}`
                : 'Performance metrics and charts for all users'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUserId && (
            <UserAnalytics 
              userId={selectedUserId} 
              timeEntries={timeEntries} 
              usersMap={usersMap} 
              projectsMap={projectsMap} 
              storiesMap={storiesMap} 
              tasksMap={tasksMap}
              parseTime={parseTime}
              formatTimeHHMM={formatTimeHHMM}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// User Analytics Component
interface UserAnalyticsProps {
  userId: string;
  timeEntries: TimeEntry[];
  usersMap: Map<string, User>;
  projectsMap: Map<string, Project>;
  storiesMap: Map<string, Story>;
  tasksMap: Map<string, Task>;
  parseTime: (time: string) => number;
  formatTimeHHMM: (minutes: number) => string;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({ 
  userId, 
  timeEntries, 
  usersMap, 
  projectsMap, 
  storiesMap, 
  tasksMap,
  parseTime,
  formatTimeHHMM
}) => {
  const user = usersMap.get(userId);
  const userEntries = timeEntries.filter(e => e.userId === userId);
  
  // Calculate daily time spent
  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    userEntries.forEach(entry => {
      const date = entry.date.split('T')[0];
      const minutes = parseTime(entry.timeSpent);
      dailyMap.set(date, (dailyMap.get(date) || 0) + minutes);
    });
    
    return Array.from(dailyMap.entries())
      .map(([date, minutes]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: Math.round((minutes / 60) * 10) / 10,
        minutes
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days
  }, [userEntries, parseTime]);
  
  // Calculate project breakdown
  const projectData = useMemo(() => {
    const projectMap = new Map<string, number>();
    userEntries.forEach(entry => {
      const projectName = entry.project || 'Unassigned';
      const minutes = parseTime(entry.timeSpent);
      projectMap.set(projectName, (projectMap.get(projectName) || 0) + minutes);
    });
    
    return Array.from(projectMap.entries())
      .map(([project, minutes]) => ({
        project,
        hours: Math.round((minutes / 60) * 10) / 10,
        minutes
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [userEntries, parseTime]);
  
  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    userEntries.forEach(entry => {
      const category = entry.category || 'development';
      const minutes = parseTime(entry.timeSpent);
      categoryMap.set(category, (categoryMap.get(category) || 0) + minutes);
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, minutes]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        hours: Math.round((minutes / 60) * 10) / 10,
        minutes
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [userEntries, parseTime]);
  
  // Calculate task completion stats
  const taskStats = useMemo(() => {
    const totalTasks = userEntries.length;
    const completedTasks = userEntries.filter(e => e.status === 'completed').length;
    const activeTasks = userEntries.filter(e => e.status === 'active').length;

    let totalEstimatedMinutes = 0;
    let totalActualMinutes = 0;

    userEntries.forEach(entry => {
      const actualMinutes = parseTime(entry.timeSpent);
      const estimatedMinutes = entry.estimation
        ? parseTime(entry.estimation)
        : actualMinutes + parseTime(entry.remaining);

      totalActualMinutes += actualMinutes;
      totalEstimatedMinutes += estimatedMinutes;
    });

    const accuracy = totalEstimatedMinutes > 0
      ? Math.round((totalActualMinutes / totalEstimatedMinutes) * 100)
      : 0;

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      totalEstimatedMinutes,
      totalActualMinutes,
      varianceMinutes: totalActualMinutes - totalEstimatedMinutes,
      accuracy
    };
  }, [userEntries, parseTime]);

  // Accuracy trend (last 14 days)
  const accuracyData = useMemo(() => {
    const trendMap = new Map<string, { actual: number; estimated: number }>();

    userEntries.forEach(entry => {
      const dateKey = entry.date.split('T')[0];
      const actualMinutes = parseTime(entry.timeSpent);
      const estimatedMinutes = entry.estimation
        ? parseTime(entry.estimation)
        : actualMinutes + parseTime(entry.remaining);

      const existing = trendMap.get(dateKey) || { actual: 0, estimated: 0 };
      existing.actual += actualMinutes;
      existing.estimated += estimatedMinutes;
      trendMap.set(dateKey, existing);
    });

    return Array.from(trendMap.entries())
      .map(([dateKey, { actual, estimated }]) => {
        const accuracyValue = estimated > 0 ? Math.round((actual / estimated) * 1000) / 10 : 0;
        const varianceHours = Math.round(((actual - estimated) / 60) * 100) / 100;
        return {
          dateKey,
          label: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          accuracy: accuracyValue,
          variance: varianceHours,
        };
      })
      .sort((a, b) => new Date(a.dateKey).getTime() - new Date(b.dateKey).getTime())
      .slice(-14);
  }, [userEntries, parseTime]);

  const ANALYTICS_COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#f0fdf4'];
  const PIE_GRADIENT_ID_PREFIX = 'user-analytics-pie-gradient';
  const CATEGORY_GRADIENT_ID_PREFIX = 'user-analytics-category-gradient';
  const BAR_GRADIENT_ID = 'user-analytics-bar-gradient';

  const chartConfig = useMemo(() => {
    const base: Record<string, { label: string; color: string }> = {
      hours: { label: 'Hours', color: '#6366f1' },
      accuracy: { label: 'Accuracy %', color: '#6366f1' },
      variance: { label: 'Variance (hrs)', color: '#f97316' },
    };

    projectData.forEach((item, idx) => {
      const projectColor = ANALYTICS_COLORS[idx % ANALYTICS_COLORS.length];
      base[item.project] = {
        label: item.project,
        color: projectColor
      };
    });

    categoryData.forEach((item, idx) => {
      base[item.category] = {
        label: item.category,
        color: ANALYTICS_COLORS[(idx + projectData.length) % ANALYTICS_COLORS.length]
      };
    });

    return base;
  }, [projectData, categoryData]);

  const formatMinutes = (minutes: number) => formatTimeHHMM(Math.max(minutes, 0));
  const formatVariance = (minutes: number) => {
    if (minutes === 0) return formatTimeHHMM(0);
    const sign = minutes > 0 ? '+' : '-';
    return `${sign}${formatTimeHHMM(Math.abs(minutes))}`;
  };
  const varianceTone =
    taskStats.varianceMinutes === 0
      ? 'text-emerald-600'
      : taskStats.varianceMinutes > 0
        ? 'text-orange-500'
        : 'text-blue-600';

  const renderNoData = (message: string) => (
    <div className="flex items-center justify-center h-[260px] text-sm text-muted-foreground">{message}</div>
  );

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Estimated</p>
            <p className="text-2xl font-bold text-emerald-600">{formatMinutes(taskStats.totalEstimatedMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Actual</p>
            <p className="text-2xl font-bold text-sky-600">{formatMinutes(taskStats.totalActualMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Variance</p>
            <p className={`text-2xl font-bold ${varianceTone}`}>{formatVariance(taskStats.varianceMinutes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-bold text-purple-600">{taskStats.accuracy}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/40 p-1 rounded-lg">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily-trends">Daily Trends</TabsTrigger>
          <TabsTrigger value="work-types">Work Types</TabsTrigger>
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Time by Project</h3>
                {projectData.length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <defs>
                          {projectData.map((_, index) => {
                            const gradientId = `${PIE_GRADIENT_ID_PREFIX}-project-${index}`;
                            const sliceColor = ANALYTICS_COLORS[index % ANALYTICS_COLORS.length];

                            return (
                              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={sliceColor} />
                                <stop offset="100%" stopColor="#ffffff" />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <Pie
                          data={projectData}
                          dataKey="hours"
                          nameKey="project"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label
                        >
                          {projectData.map((_, index) => {
                            const gradientId = `${PIE_GRADIENT_ID_PREFIX}-project-${index}`;

                            return (
                              <Cell
                                key={`project-cell-${index}`}
                                fill={`url(#${gradientId})`}
                                stroke="#bbf7d0"
                                strokeWidth={1}
                              />
                            );
                          })}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  renderNoData('No project time logged yet.')
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Task Overview</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Tasks</p>
                    <p className="text-xl font-semibold">{taskStats.totalTasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="text-xl font-semibold text-emerald-600">{taskStats.completedTasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active</p>
                    <p className="text-xl font-semibold text-orange-500">{taskStats.activeTasks}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground font-medium">Top Projects</p>
                  {projectData.length > 0 ? (
                    projectData.slice(0, 5).map(item => (
                      <div key={item.project} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                        <span className="font-medium text-foreground">{item.project}</span>
                        <span className="text-muted-foreground">{formatMinutes(Math.round(item.minutes))}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No project data available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Time Spent by Project</h3>
              {projectData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={projectData}>
                      <defs>
                        <linearGradient id={BAR_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#16a34a" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="project" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" fill={`url(#${BAR_GRADIENT_ID})`} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                renderNoData('No project data to visualise.')
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-trends">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Time Spent (Last 14 Days)</h3>
              {dailyData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                renderNoData('No daily time entries available yet.')
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-types" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Time by Work Type</h3>
                {categoryData.length > 0 ? (
                  <ChartContainer config={chartConfig}>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <defs>
                          {categoryData.map((_, index) => {
                            const gradientId = `${CATEGORY_GRADIENT_ID_PREFIX}-${index}`;
                            const sliceColor = ANALYTICS_COLORS[(index + projectData.length) % ANALYTICS_COLORS.length];

                            return (
                              <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={sliceColor} />
                                <stop offset="100%" stopColor="#ffffff" />
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <Pie
                          data={categoryData}
                          dataKey="hours"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label
                        >
                          {categoryData.map((_, index) => {
                            const gradientId = `${CATEGORY_GRADIENT_ID_PREFIX}-${index}`;

                            return (
                              <Cell
                                key={`category-cell-${index}`}
                                fill={`url(#${gradientId})`}
                                stroke="#bbf7d0"
                                strokeWidth={1}
                              />
                            );
                          })}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  renderNoData('No work type data available yet.')
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-semibold">Category Breakdown</h3>
                {categoryData.length > 0 ? (
                  categoryData.map(item => (
                    <div key={item.category} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                      <div>
                        <p className="font-medium text-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.hours} hours</p>
                      </div>
                      <span className="text-muted-foreground">{formatMinutes(Math.round(item.minutes))}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No category data available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accuracy">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Estimation Accuracy Trend</h3>
              {accuracyData.length > 0 ? (
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={accuracyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis yAxisId="left" domain={[0, 120]} tickFormatter={(value) => `${value}%`} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}h`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="variance"
                        stroke="#f97316"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                renderNoData('Not enough estimation data to calculate accuracy.')
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTrackingPage;
