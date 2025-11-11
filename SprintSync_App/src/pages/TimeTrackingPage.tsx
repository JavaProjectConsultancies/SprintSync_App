import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { timeEntryApiService } from '../services/api/entities/timeEntryApi';
import { useUsers, useActiveUsers } from '../hooks/api/useUsers';
import { useProjects } from '../hooks/api/useProjects';
import { useStories } from '../hooks/api/useStories';
import { useTasks } from '../hooks/api/useTasks';
import { useSprints } from '../hooks/api/useSprints';
import { TimeEntry as ApiTimeEntry, User, Project, Story, Task, Sprint } from '../types/api';
import { useAuth } from '../contexts/AuthContextEnhanced';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Clock, 
  Target,
  Users, 
  TrendingUp,
  Plus,
  Filter,
  Loader2,
  BarChart3,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface TimeEntry {
  id: string;
  task: string;
  taskId?: string;
  story: string;
  storyId?: string;
  project: string;
  projectId?: string;
  sprintId?: string;
  user: string;
  userId: string;
  userRole: string;
  duration: string;
  date: string;
  status: 'active' | 'completed';
  billable: boolean;
  category: string;
  description?: string;
  timeSpent: string;
  remaining: string;
  estimation?: string;
}

interface GroupedTaskBucket {
  taskId?: string;
  entries: TimeEntry[];
}

interface GroupedStoryBucket {
  storyId?: string;
  tasks: Record<string, GroupedTaskBucket>;
}

interface GroupedProjectBucket {
  projectId?: string;
  stories: Record<string, GroupedStoryBucket>;
}

interface GroupedUserProjects {
  projects: Record<string, GroupedProjectBucket>;
}

type GroupedEntriesByUser = Record<string, GroupedUserProjects>;

const formatDisplayName = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map(chunk => chunk[0].toUpperCase() + chunk.slice(1))
    .join(' ');

const projectColorThemes: Array<{
  border: string;
  cardBg: string;
  headerText: string;
  avatarBg: string;
  avatarBorder: string;
  badge: string;
  storyBg: string;
  storyBorder: string;
  storyAccent: string;
}> = [
  {
    border: 'border-l-[6px] border-l-emerald-500',
    cardBg: 'border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-white shadow-[0_12px_24px_-12px_rgba(16,185,129,0.45)]',
    headerText: 'text-slate-900',
    avatarBg: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.3)]',
    avatarBorder: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    storyBg: 'bg-emerald-50',
    storyBorder: 'border-emerald-200',
    storyAccent: 'border-l-4 border-l-emerald-400',
  },
  {
    border: 'border-l-[6px] border-l-sky-500',
    cardBg: 'border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-white shadow-[0_12px_24px_-12px_rgba(14,165,233,0.4)]',
    headerText: 'text-slate-900',
    avatarBg: 'bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,0.3)]',
    avatarBorder: 'border-sky-300',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    storyBg: 'bg-sky-50',
    storyBorder: 'border-sky-200',
    storyAccent: 'border-l-4 border-l-sky-400',
  },
  {
    border: 'border-l-[6px] border-l-violet-500',
    cardBg: 'border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-white shadow-[0_12px_24px_-12px_rgba(139,92,246,0.38)]',
    headerText: 'text-slate-900',
    avatarBg: 'bg-violet-500 shadow-[0_0_0_3px_rgba(139,92,246,0.3)]',
    avatarBorder: 'border-violet-300',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
    storyBg: 'bg-violet-50',
    storyBorder: 'border-violet-200',
    storyAccent: 'border-l-4 border-l-violet-400',
  },
  {
    border: 'border-l-[6px] border-l-amber-500',
    cardBg: 'border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white shadow-[0_12px_24px_-12px_rgba(245,158,11,0.4)]',
    headerText: 'text-slate-900',
    avatarBg: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.3)]',
    avatarBorder: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    storyBg: 'bg-amber-50',
    storyBorder: 'border-amber-200',
    storyAccent: 'border-l-4 border-l-amber-400',
  },
  {
    border: 'border-l-[6px] border-l-rose-500',
    cardBg: 'border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-white shadow-[0_12px_24px_-12px_rgba(244,63,94,0.42)]',
    headerText: 'text-slate-900',
    avatarBg: 'bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.3)]',
    avatarBorder: 'border-rose-300',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    storyBg: 'bg-rose-50',
    storyBorder: 'border-rose-200',
    storyAccent: 'border-l-4 border-l-rose-400',
  },
  {
    border: 'border-l-[6px] border-l-teal-500',
    cardBg: 'border border-teal-200 bg-gradient-to-r from-teal-50 via-white to-white shadow-[0_12px_24px_-12px_rgba(20,184,166,0.4)]',
    headerText: 'text-slate-900',
    avatarBg: 'bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.3)]',
    avatarBorder: 'border-teal-300',
    badge: 'bg-teal-100 text-teal-800 border-teal-200',
    storyBg: 'bg-teal-50',
    storyBorder: 'border-teal-200',
    storyAccent: 'border-l-4 border-l-teal-400',
  },
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};

const getProjectTheme = (key: string) => {
  const index = Math.abs(hashString(key)) % projectColorThemes.length;
  return projectColorThemes[index];
};

const collectEntriesFromStories = (stories: Record<string, GroupedStoryBucket>): TimeEntry[] => {
  const entries: TimeEntry[] = [];
  Object.values(stories).forEach(story => {
    Object.values(story.tasks).forEach(task => {
      entries.push(...task.entries);
    });
  });
  return entries;
};

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

const TimeTrackingPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [userFilter, setUserFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const fetchedTaskIdsRef = useRef<Set<string>>(new Set());
  const fetchedStoryIdsRef = useRef<Set<string>>(new Set());
  const fetchedProjectIdsRef = useRef<Set<string>>(new Set());

  // Fetch related entities
  const usersResult = useUsers({ page: 0, size: 1000 });
  const activeUsersResult = useActiveUsers({ page: 0, size: 1000 });
  const projectsResult = useProjects();
  
  // Extract data - ensure all are arrays (moved before useEffect that uses it)
  // Filter to show only current user if not manager/admin, otherwise show all users
  const users = useMemo(() => {
    const data = usersResult.data;
    const allUsers = Array.isArray(data) ? data : [];
    
    // Check if current user is manager or admin
    const isManagerOrAdmin = currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'manager' || 
      currentUser.role === 'MANAGER' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role?.toLowerCase() === 'manager' ||
      currentUser.role?.toLowerCase() === 'admin'
    );
    
    // If current user is manager/admin, show all users; otherwise show only current user
    if (currentUser && currentUser.id && !isManagerOrAdmin) {
      const currentUserId = normalizeId(currentUser.id);
      return allUsers.filter(user => normalizeId(user.id) === currentUserId);
    }
    
    return allUsers;
  }, [usersResult.data, currentUser]);
  
  // Fetch all stories and tasks using getAll methods
  const [allStories, setAllStories] = useState<Story[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [additionalProjects, setAdditionalProjects] = useState<Project[]>([]);
  const [userTasksMap, setUserTasksMap] = useState<Map<string, Task[]>>(new Map());
  
  useEffect(() => {
    const fetchStoriesAndTasks = async () => {
      try {
        const { storyApiService } = await import('../services/api/entities/storyApi');
        const { taskApiService } = await import('../services/api/entities/taskApi');
        
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
        
        console.log('Fetched all stories:', storiesData.length);
        console.log('Fetched all tasks:', tasksData.length);
        console.log('Tasks by assignee:', tasksData.reduce((acc, task) => {
          const assigneeId = task.assigneeId || 'unassigned';
          acc[assigneeId] = (acc[assigneeId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
      } catch (err) {
        console.error('Error fetching stories/tasks:', err);
      }
    };
    fetchStoriesAndTasks();
  }, []);

  // Fetch tasks - all users' tasks for managers/admins, only current user's tasks for others
  useEffect(() => {
    const fetchUserTasks = async () => {
      if (!currentUser || !currentUser.id) {
        return;
      }

      // Check if current user is manager or admin
      const isManagerOrAdmin = currentUser && (
        currentUser.role === 'admin' || 
        currentUser.role === 'manager' || 
        currentUser.role === 'MANAGER' ||
        currentUser.role === 'ADMIN' ||
        currentUser.role?.toLowerCase() === 'manager' ||
        currentUser.role?.toLowerCase() === 'admin'
      );

      try {
        const { taskApiService } = await import('../services/api/entities/taskApi');
        const newUserTasksMap = new Map<string, Task[]>();

        if (isManagerOrAdmin) {
          // For managers/admins: fetch tasks for all users
          if (users.length === 0) {
            return;
          }

          const userTaskPromises = users.map(async (user) => {
            const userId = normalizeId(user.id);
            if (!userId) return;

            try {
              const response = await taskApiService.getTasksByAssignee(userId, { page: 0, size: 1000 });
              let userTasks: Task[] = [];
              
              if (Array.isArray(response.data)) {
                userTasks = response.data;
              } else if (response.data?.content && Array.isArray(response.data.content)) {
                userTasks = response.data.content;
              } else if (response.data?.data && Array.isArray(response.data.data)) {
                userTasks = response.data.data;
              }

              if (userTasks.length > 0) {
                newUserTasksMap.set(userId, userTasks);
                setAllTasks(prev => mergeById(prev, userTasks));
                
                // Fetch related stories and projects
                const storyIds = new Set<string>();
                userTasks.forEach(task => {
                  const storyId = normalizeId(task.storyId);
                  if (storyId) storyIds.add(storyId);
                });

                const { storyApiService } = await import('../services/api/entities/storyApi');
                const storyPromises = Array.from(storyIds).map(async (storyId) => {
                  try {
                    const storyResponse = await storyApiService.getStoryById(storyId);
                    if (storyResponse.data) {
                      setAllStories(prev => mergeById(prev, [storyResponse.data as Story]));
                      
                      const story = storyResponse.data as Story;
                      const projectId = normalizeId(story.projectId);
                      if (projectId) {
                        const currentProjects = projectsResult.data ? (Array.isArray(projectsResult.data) ? projectsResult.data : []) : [];
                        const projectExists = currentProjects.some((p: Project) => normalizeId(p.id) === projectId) ||
                                            additionalProjects.some(p => normalizeId(p.id) === projectId);
                        if (!projectExists) {
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
                    }
                  } catch (err) {
                    console.warn(`Failed to fetch story ${storyId}:`, err);
                  }
                });
                await Promise.all(storyPromises);
              }
            } catch (err) {
              console.warn(`Failed to fetch tasks for user ${userId}:`, err);
            }
          });

          await Promise.all(userTaskPromises);
        } else {
          // For non-managers: fetch only current user's tasks
          const currentUserId = normalizeId(currentUser.id);
          if (!currentUserId) {
            return;
          }

          try {
            const response = await taskApiService.getTasksByAssignee(currentUserId, { page: 0, size: 1000 });
            let userTasks: Task[] = [];
            
            if (Array.isArray(response.data)) {
              userTasks = response.data;
            } else if (response.data?.content && Array.isArray(response.data.content)) {
              userTasks = response.data.content;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
              userTasks = response.data.data;
            }

            if (userTasks.length > 0) {
              newUserTasksMap.set(currentUserId, userTasks);
              setAllTasks(prev => mergeById(prev, userTasks));
              
              // Fetch related stories and projects
              const storyIds = new Set<string>();
              userTasks.forEach(task => {
                const storyId = normalizeId(task.storyId);
                if (storyId) storyIds.add(storyId);
              });

              const { storyApiService } = await import('../services/api/entities/storyApi');
              const storyPromises = Array.from(storyIds).map(async (storyId) => {
                try {
                  const storyResponse = await storyApiService.getStoryById(storyId);
                  if (storyResponse.data) {
                    setAllStories(prev => mergeById(prev, [storyResponse.data as Story]));
                    
                    const story = storyResponse.data as Story;
                    const projectId = normalizeId(story.projectId);
                    if (projectId) {
                      const currentProjects = projectsResult.data ? (Array.isArray(projectsResult.data) ? projectsResult.data : []) : [];
                      const projectExists = currentProjects.some((p: Project) => normalizeId(p.id) === projectId) ||
                                          additionalProjects.some(p => normalizeId(p.id) === projectId);
                      if (!projectExists) {
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
                  }
                } catch (err) {
                  console.warn(`Failed to fetch story ${storyId}:`, err);
                }
              });
              await Promise.all(storyPromises);
            }
          } catch (err) {
            console.warn(`Failed to fetch tasks for user ${currentUserId}:`, err);
          }
        }

        setUserTasksMap(newUserTasksMap);
        
        console.log('Fetched user tasks:', {
          isManagerOrAdmin,
          usersProcessed: isManagerOrAdmin ? users.length : 1,
          totalTasks: Array.from(newUserTasksMap.values()).reduce((sum, tasks) => sum + tasks.length, 0)
        });
      } catch (err) {
        console.error('Error fetching user tasks:', err);
      }
    };

    fetchUserTasks();
  }, [currentUser, users, projectsResult.data, additionalProjects]);
  
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
    return mergeById(baseProjects, additionalProjects);
  }, [projectsResult.data, additionalProjects]);

  const stories = useMemo(() => {
    const data = storiesResult.data;
    const storiesArray = Array.isArray(data) ? data : [];
    console.log('Stories data:', {
      rawData: data,
      isArray: Array.isArray(data),
      count: storiesArray.length,
      sample: storiesArray[0]
    });
    return storiesArray;
  }, [storiesResult.data]);

  const tasks = useMemo(() => {
    const data = tasksResult.data;
    const tasksArray = Array.isArray(data) ? data : [];
    console.log('Tasks data:', {
      rawData: data,
      isArray: Array.isArray(data),
      count: tasksArray.length,
      sample: tasksArray[0]
    });
    return tasksArray;
  }, [tasksResult.data]);

  const sprints = useMemo(() => {
    const data = sprintsResult.data;
    return Array.isArray(data) ? data : [];
  }, [sprintsResult.data]);

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
    console.log('Stories map:', { size: map.size, stories: Array.from(map.keys()) });
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
    console.log('Tasks map:', { size: map.size, tasks: Array.from(map.keys()) });
    return map;
  }, [tasks, allTasks]);

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

  // Store raw API entries
  const [rawTimeEntries, setRawTimeEntries] = useState<ApiTimeEntry[]>([]);

  // Fetch time entries - all users for managers/admins, only current user for others
  useEffect(() => {
    const fetchTimeEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        let aggregatedEntries: ApiTimeEntry[] = [];

        // Check if current user is manager or admin
        const isManagerOrAdmin = currentUser && (
          currentUser.role === 'admin' || 
          currentUser.role === 'manager' || 
          currentUser.role === 'MANAGER' ||
          currentUser.role === 'ADMIN' ||
          currentUser.role?.toLowerCase() === 'manager' ||
          currentUser.role?.toLowerCase() === 'admin'
        );

        // If manager/admin, fetch all entries; otherwise fetch only current user's entries
        if (isManagerOrAdmin) {
          // Managers/admins see all entries
          try {
            const response = await timeEntryApiService.getAllTimeEntries();
            aggregatedEntries = extractTimeEntries(response.data);
            console.log('Fetched all time entries for manager/admin:', {
              total: aggregatedEntries.length,
              uniqueUsers: [...new Set(aggregatedEntries.map(e => e.userId))],
            });
          } catch (getAllError) {
            console.warn('Failed to fetch all time entries, falling back to per-user requests.', getAllError);
            // Fallback: fetch entries for all users
            if (users.length > 0) {
              const userEntryBatches = await Promise.all(
                users.map(async user => {
                  try {
                    const response = await timeEntryApiService.getTimeEntriesByUser(user.id);
                    return extractTimeEntries(response.data);
                  } catch (err) {
                    console.warn(`Failed to fetch time entries for user ${user.id}:`, err);
                    return [];
                  }
                })
              );
              aggregatedEntries = userEntryBatches.flat();
            }
          }
        } else if (currentUser && currentUser.id) {
          // Non-managers see only their own entries
          try {
            const response = await timeEntryApiService.getTimeEntriesByUser(currentUser.id);
            aggregatedEntries = extractTimeEntries(response.data);
            console.log('Fetched time entries for current user:', {
              userId: currentUser.id,
              total: aggregatedEntries.length,
            });
          } catch (err) {
            console.warn(`Failed to fetch time entries for user ${currentUser.id}:`, err);
          }
        } else {
          // Fallback: fetch all entries if no user logged in
          try {
            const response = await timeEntryApiService.getAllTimeEntries();
            aggregatedEntries = extractTimeEntries(response.data);
            console.log('Fetched all time entries:', {
              total: aggregatedEntries.length,
              uniqueUsers: [...new Set(aggregatedEntries.map(e => e.userId))],
            });
          } catch (getAllError) {
            console.warn('Failed to fetch all time entries.', getAllError);
          }
        }

        setRawTimeEntries(aggregatedEntries);
      } catch (err: any) {
        console.error('Error fetching time entries:', err);
        setRawTimeEntries([]);
        setError(err.message || 'Failed to fetch time entries');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();
  }, [currentUser, users]);

  // Ensure related tasks, stories, and projects referenced by time entries are loaded
  useEffect(() => {
    if (rawTimeEntries.length === 0) {
      setTimeEntries([]);
      return;
    }

    const ensureRelatedEntities = async () => {
      try {
        const requiredTaskIds = new Set<string>();
        const requiredStoryIds = new Set<string>();
        const requiredProjectIds = new Set<string>();

        rawTimeEntries.forEach(entry => {
          const taskId = normalizeId(entry.taskId);
          const storyId = normalizeId(entry.storyId);
          const projectId = normalizeId(entry.projectId);

          if (taskId) requiredTaskIds.add(taskId);
          if (storyId) requiredStoryIds.add(storyId);
          if (projectId) requiredProjectIds.add(projectId);
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
          if (storyId) requiredStoryIds.add(storyId);
          if (projectId) requiredProjectIds.add(projectId);
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
          if (projectId) {
            requiredProjectIds.add(projectId);
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
      } catch (err) {
        console.error('Failed to ensure related time entry entities:', err);
      }
    };

    ensureRelatedEntities();
  }, [rawTimeEntries, allTasks, allStories, additionalProjects, projectsResult.data]);

  // Map API entries to UI format
  useEffect(() => {
    if (rawTimeEntries.length === 0) {
      return;
    }

    console.log('Mapping time entries:', {
      rawEntriesCount: rawTimeEntries.length,
      usersMapSize: usersMap.size,
      projectsMapSize: projectsMap.size,
      storiesMapSize: storiesMap.size,
      tasksMapSize: tasksMap.size
    });

    // Filter entries: managers/admins see all entries, others see only their own
    const isManagerOrAdmin = currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'manager' || 
      currentUser.role === 'MANAGER' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role?.toLowerCase() === 'manager' ||
      currentUser.role?.toLowerCase() === 'admin'
    );
    
    const entriesToMap = (currentUser && currentUser.id && !isManagerOrAdmin)
      ? rawTimeEntries.filter(entry => normalizeId(entry.userId) === normalizeId(currentUser.id))
      : rawTimeEntries;
    
    const mappedEntries: TimeEntry[] = entriesToMap.map((entry) => {
        const normalizedEntryId = normalizeId(entry.id) || String(entry.id);
        const normalizedUserId = normalizeId(entry.userId);
        const user = normalizedUserId ? usersMap.get(normalizedUserId) : undefined;
        const entryTaskId = normalizeId(entry.taskId);
        const task = entryTaskId ? tasksMap.get(entryTaskId) : null;
        // Get story from entry.storyId or from task.storyId
        const explicitStoryId = normalizeId(entry.storyId);
        const derivedStoryId = explicitStoryId || (task?.storyId ? normalizeId(task.storyId) : undefined);
        const story = derivedStoryId ? storiesMap.get(derivedStoryId) : null;
        
        // Get projectId from entry, story, or task's story (in that order)
        // Note: Task doesn't have projectId directly, but Story does
        const entryProjectId = normalizeId(entry.projectId);
        const derivedProjectId = entryProjectId || (story?.projectId ? normalizeId(story.projectId) : undefined);
        const project = derivedProjectId ? projectsMap.get(derivedProjectId) : null;
        
        // Get sprint from story or project
        const sprintId = story?.sprintId ? normalizeId(story.sprintId) : undefined;
        const sprint = sprintId ? sprintsMap.get(sprintId) : 
                      (derivedProjectId ? projectToSprintMap.get(derivedProjectId) : null);

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
        const isActive = taskStatus === 'IN_PROGRESS';
        const isCompleted = taskStatus === 'DONE';

        return {
          id: normalizedEntryId,
          task: task?.title || 'Unassigned Task',
          taskId: entryTaskId,
          story: story?.title || 'Unassigned Story',
          storyId: derivedStoryId,
          project: project?.name || 'Unassigned Project',
          projectId: derivedProjectId,
          sprintId: sprint?.id ? normalizeId(sprint.id) : sprintId,
          user: user?.name || 'Unknown User',
          userId: normalizedUserId || '',
          userRole: user?.role || 'DEVELOPER',
          duration: timeSpent,
          date: entry.workDate || entry.createdAt,
          status: isActive ? 'active' : (isCompleted ? 'completed' : 'completed'),
          billable: entry.isBillable !== false,
          category: entry.entryType || 'development',
          description: entry.description,
          timeSpent,
          remaining,
          estimation
        };
      });
    
    console.log('Mapped entries:', {
      totalMapped: mappedEntries.length,
      uniqueUsers: [...new Set(mappedEntries.map(e => e.userId))],
      uniqueProjects: [...new Set(mappedEntries.map(e => e.project))],
      uniqueProjectIds: [...new Set(mappedEntries.map(e => e.projectId).filter(Boolean))],
      entriesByUser: mappedEntries.reduce((acc, e) => {
        acc[e.userId] = (acc[e.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      entriesByProject: mappedEntries.reduce((acc, e) => {
        const key = e.projectId || 'no-project';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      sampleEntry: mappedEntries[0] ? {
        id: mappedEntries[0].id,
        projectId: mappedEntries[0].projectId,
        project: mappedEntries[0].project,
        userId: mappedEntries[0].userId,
        user: mappedEntries[0].user,
        date: mappedEntries[0].date,
        story: mappedEntries[0].story,
        task: mappedEntries[0].task
      } : null,
      dateRange: mappedEntries.length > 0 ? {
        minDate: Math.min(...mappedEntries.map(e => new Date(e.date).getTime()).filter(d => !isNaN(d))),
        maxDate: Math.max(...mappedEntries.map(e => new Date(e.date).getTime()).filter(d => !isNaN(d))),
        dates: mappedEntries.slice(0, 5).map(e => e.date)
      } : null
    });
    
    setTimeEntries(mappedEntries);
  }, [rawTimeEntries, usersMap, projectsMap, storiesMap, tasksMap]);

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
    console.log('Filtering entries:', {
      totalEntries: timeEntries.length,
      userFilter,
      projectFilter,
      timeFilter
    });
    
    let filtered = [...timeEntries];

    if (userFilter !== 'all') {
      filtered = filtered.filter(entry => entry.userId === userFilter);
      console.log('After user filter:', filtered.length);
    }

    if (projectFilter !== 'all') {
      filtered = filtered.filter(entry => entry.projectId === projectFilter);
      console.log('After project filter:', filtered.length);
    }

    if (timeFilter === 'this-week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const beforeFilter = filtered.length;
      filtered = filtered.filter(entry => {
        try {
          const entryDate = new Date(entry.date);
          const isValid = !isNaN(entryDate.getTime()) && entryDate >= startOfWeek;
          if (!isValid && beforeFilter > 0) {
            console.log('Entry filtered out by this-week:', {
              entryDate: entry.date,
              parsedDate: entryDate,
              startOfWeek: startOfWeek.toISOString(),
              isValid: !isNaN(entryDate.getTime()),
              isAfterStart: entryDate >= startOfWeek
            });
          }
          return isValid;
        } catch (e) {
          console.log('Error parsing date:', entry.date, e);
          return false;
        }
      });
      console.log('After this-week filter:', filtered.length, 'out of', beforeFilter);
    } else if (timeFilter === 'this-month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const beforeFilter = filtered.length;
      filtered = filtered.filter(entry => {
        try {
          const entryDate = new Date(entry.date);
          const isValid = !isNaN(entryDate.getTime()) && entryDate >= startOfMonth;
          if (!isValid && beforeFilter > 0) {
            console.log('Entry filtered out by this-month:', {
              entryDate: entry.date,
              parsedDate: entryDate,
              startOfMonth: startOfMonth.toISOString()
            });
          }
          return isValid;
        } catch (e) {
          console.log('Error parsing date:', entry.date, e);
          return false;
        }
      });
      console.log('After this-month filter:', filtered.length, 'out of', beforeFilter);
    }

    return filtered;
  }, [timeEntries, userFilter, projectFilter, timeFilter]);

  // Calculate summary statistics - show all users' data for managers/admins, only current user for others
  const summaryStats = useMemo(() => {
    // Check if current user is manager or admin
    const isManagerOrAdmin = currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'manager' || 
      currentUser.role === 'MANAGER' ||
      currentUser.role === 'ADMIN' ||
      currentUser.role?.toLowerCase() === 'manager' ||
      currentUser.role?.toLowerCase() === 'admin'
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
    const billablePercentage = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0;

    const resolvedActiveMemberCount = activeUserCount > 0 ? activeUserCount : uniqueUsers;
    
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
      billablePercentage
    };
  }, [filteredTimeEntries, activeUserCount, currentUser, userTasksMap, allTasks]);

  // Group entries by User → Project → Story → Task
  // Also include all users and their assigned tasks even if they have no time entries
  const groupedEntries = useMemo(() => {
    const grouped: GroupedEntriesByUser = {};

    const ensureTaskBucket = (
      userId: string,
      projectName: string,
      projectId: string | undefined,
      storyName: string,
      storyId: string | undefined,
      taskName: string,
      taskId: string | undefined
    ): GroupedTaskBucket => {
      if (!grouped[userId]) {
        grouped[userId] = { projects: {} };
      }

      const userProjects = grouped[userId].projects;

      if (!userProjects[projectName]) {
        userProjects[projectName] = { projectId, stories: {} };
      }

      const projectBucket = userProjects[projectName];

      if (projectId && !projectBucket.projectId) {
        projectBucket.projectId = projectId;
      }

      if (!projectBucket.stories[storyName]) {
        projectBucket.stories[storyName] = { storyId, tasks: {} };
      }

      const storyBucket = projectBucket.stories[storyName];

      if (storyId && !storyBucket.storyId) {
        storyBucket.storyId = storyId;
      }

      if (!storyBucket.tasks[taskName]) {
        storyBucket.tasks[taskName] = { taskId, entries: [] };
      }

      const taskBucket = storyBucket.tasks[taskName];

      if (taskId && !taskBucket.taskId) {
        taskBucket.taskId = taskId;
      }

      return taskBucket;
    };

    filteredTimeEntries.forEach(entry => {
      const normalizedUserId = entry.userId && entry.userId.trim() ? entry.userId : 'unknown';
      const normalizedProjectId = entry.projectId ? normalizeId(entry.projectId) : undefined;
      const normalizedStoryId = entry.storyId ? normalizeId(entry.storyId) : undefined;
      const normalizedTaskId = entry.taskId ? normalizeId(entry.taskId) : undefined;

      const projectName =
        entry.project ||
        (normalizedProjectId ? projectsMap.get(normalizedProjectId)?.name : undefined) ||
        'Unassigned Project';
      const storyName = entry.story || 'Unassigned Stories';
      const taskName = entry.task || 'Unassigned Tasks';

      const taskBucket = ensureTaskBucket(
        normalizedUserId,
        projectName,
        normalizedProjectId,
        storyName,
        normalizedStoryId,
        taskName,
        normalizedTaskId
      );

      taskBucket.entries.push(entry);
    });

    const usersToProcess = userFilter !== 'all'
      ? users.filter(u => normalizeId(u.id) === userFilter)
      : users;

    usersToProcess.forEach(user => {
      const userId = normalizeId(user.id);
      if (!userId) {
        return;
      }

      // Use userTasksMap first (tasks fetched via getTasksByAssignee), then fallback to allTasks
      const fetchedUserTasks = userTasksMap.get(userId) || [];
      const allUserTasks = allTasks.filter(task => normalizeId(task.assigneeId) === userId);
      
      // Combine both sources, prioritizing fetched tasks
      const combinedTasks = new Map<string, Task>();
      fetchedUserTasks.forEach(task => {
        const taskId = normalizeId(task.id);
        if (taskId) combinedTasks.set(taskId, task);
      });
      allUserTasks.forEach(task => {
        const taskId = normalizeId(task.id);
        if (taskId && !combinedTasks.has(taskId)) {
          combinedTasks.set(taskId, task);
        }
      });
      
      let userTasks = Array.from(combinedTasks.values());

      if (projectFilter !== 'all') {
        userTasks = userTasks.filter(task => {
          const storyId = normalizeId(task.storyId);
          const story = storyId ? storiesMap.get(storyId) : undefined;
          const projectId = story?.projectId ? normalizeId(story.projectId) : undefined;
          return projectId === projectFilter;
        });
      }

      userTasks.forEach(task => {
        const storyId = normalizeId(task.storyId);
        const story = storyId ? storiesMap.get(storyId) : undefined;
        const projectId = story?.projectId ? normalizeId(story.projectId) : undefined;
        const project = projectId ? projectsMap.get(projectId) : undefined;
        const projectName = project?.name || 'Unassigned Project';
        const storyName = story?.title || 'Unassigned Stories';
        const taskName = task.title || 'Unassigned Tasks';
        const taskId = normalizeId(task.id);

        ensureTaskBucket(userId, projectName, projectId, storyName, storyId, taskName, taskId);
      });
    });

    users.forEach(user => {
      const userId = normalizeId(user.id);
      if (!userId) {
        return;
      }

      if (!grouped[userId]) {
        grouped[userId] = { projects: {} };
      }

      if (Object.keys(grouped[userId].projects).length === 0) {
        grouped[userId].projects['Unassigned Project'] = { projectId: undefined, stories: {} };
      }
    });
    
    return grouped;
  }, [filteredTimeEntries, users, allTasks, allStories, projectsMap, storiesMap, userFilter, projectFilter, userTasksMap]);

  // Calculate user totals
  const getUserTotalHours = (userId: string) => {
    const userEntries = filteredTimeEntries.filter(e => e.userId === userId);
    const totalMinutes = userEntries.reduce((sum, entry) => {
      return sum + parseTime(entry.timeSpent);
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Calculate project effort
  const getProjectEffort = (project: string, entries: TimeEntry[]) => {
    const totalEstimation = entries.reduce((sum, entry) => {
      if (entry.estimation) {
        return sum + parseTime(entry.estimation);
      }
      return sum + parseTime(entry.timeSpent) + parseTime(entry.remaining);
    }, 0);
    
    const totalSpent = entries.reduce((sum, entry) => {
      return sum + parseTime(entry.timeSpent);
    }, 0);
    
    const totalRemaining = entries.reduce((sum, entry) => {
      return sum + parseTime(entry.remaining);
    }, 0);
    
    const estimationMinutes = totalEstimation || (totalSpent + totalRemaining);
    const spentPercent = estimationMinutes > 0 ? Math.round((totalSpent / estimationMinutes) * 100) : 0;
    const remainingPercent = estimationMinutes > 0 ? Math.round((totalRemaining / estimationMinutes) * 100) : 0;
    
    return {
      estimation: formatTimeHHMM(estimationMinutes),
      timeSpent: formatTimeHHMM(totalSpent),
      remaining: formatTimeHHMM(totalRemaining),
      spentPercent,
      remainingPercent
    };
  };

  const getCategoryColor = (category: string) => {
    const normalized = category.toLowerCase().replace(/_/g, ' ');
    switch (normalized) {
      case 'development':
      case 'code review':
      case 'review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'design':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'testing':
      case 'bug fix':
      case 'bug_fix':
        return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCategoryName = (category: string) => {
    return category
      .split('_')
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

  const getUserName = (userId: string) => {
    const user = usersMap.get(userId);
    return user?.name || 'Unknown User';
  };

  const getUserRole = (userId: string) => {
    const user = usersMap.get(userId);
    return user?.role || 'DEVELOPER';
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

  const userSections = (Object.entries(groupedEntries) as [string, GroupedUserProjects][])
    .filter(([userId]) => userFilter === 'all' || userId === userFilter)
    .map(([userId, userData]) => {
      const user = usersMap.get(userId);
      const projectsForUser = (Object.entries(userData.projects) as [string, GroupedProjectBucket][]) 
        .filter(([, projectData]) => {
          if (projectFilter === 'all') {
              return true;
          }
          return projectData.projectId === projectFilter;
        });

      if (projectsForUser.length === 0) {
        return null;
      }

                  const allUserEntries: TimeEntry[] = [];
      let totalStories = 0;
      let totalTasks = 0;

      projectsForUser.forEach(([, projectData]) => {
        const stories = Object.values(projectData.stories) as GroupedStoryBucket[];
        totalStories += stories.length;
        stories.forEach(story => {
          const tasks = Object.values(story.tasks) as GroupedTaskBucket[];
          totalTasks += tasks.length;
          tasks.forEach(task => {
            allUserEntries.push(...task.entries);
          });
                    });
                  });
                  
      const userRoleValue = user?.role || 'DEVELOPER';
      const userName = user?.name || (userId === 'unknown' ? 'Unknown User' : 'Unnamed User');
      const entryCount = allUserEntries.length;

      // Calculate total assigned hours from all tasks assigned to this user
      const fetchedUserTasks = userTasksMap.get(userId) || [];
      const allUserTasks = allTasks.filter(task => normalizeId(task.assigneeId) === userId);
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
      
      // Calculate total estimated hours from all assigned tasks
      const totalAssignedHours = Array.from(combinedUserTasks.values()).reduce((sum, task) => {
        const estimatedHours = task.estimatedHours || 0;
        return sum + estimatedHours;
      }, 0);
      const assignedHoursDisplay = Math.floor(totalAssignedHours);
      const assignedMinsDisplay = Math.round((totalAssignedHours - assignedHoursDisplay) * 60);

      const totalMinutes = allUserEntries.reduce((sum, entry) => sum + parseTime(entry.timeSpent), 0);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalMins = totalMinutes % 60;

      const isExpanded = expandedUsers[userId] ?? false;
      const handleToggleUser = () => {
        setExpandedUsers(prev => {
          const currentlyExpanded = prev[userId] ?? false;
          return { ...prev, [userId]: !currentlyExpanded };
        });
      };

      const totalEstimated = allUserEntries.reduce((sum, entry) => {
        if (entry.estimation) return sum + parseTime(entry.estimation);
        return sum + parseTime(entry.timeSpent) + parseTime(entry.remaining);
      }, 0);
      const totalActual = allUserEntries.reduce((sum, entry) => sum + parseTime(entry.timeSpent), 0);
      const accuracy = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

      const userEffort = entryCount > 0
        ? getProjectEffort('User Total', allUserEntries)
        : {
                    estimation: '00:00',
                    timeSpent: '00:00',
                    remaining: '00:00',
                    spentPercent: 0,
            remainingPercent: 0,
          };
      
      // Calculate remaining time correctly: Estimated - Actual
      const estimatedMinutes = parseTime(userEffort.estimation);
      const actualMinutes = parseTime(userEffort.timeSpent);
      const remainingMinutes = Math.max(0, estimatedMinutes - actualMinutes);
                  
                  return (
        <div key={userId} className="space-y-4">
          <Card className="border border-purple-200 border-l-[6px] border-l-purple-500 shadow-[0_14px_28px_-12px_rgba(126,34,206,0.35)] bg-gradient-to-r from-purple-50 via-purple-100 to-white">
                        <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={handleToggleUser}
                              aria-expanded={isExpanded}
                              className="flex items-center gap-3 flex-1 text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 transition cursor-pointer"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Avatar className="h-10 w-10 border-0 shadow-[0_8px_18px_-6px_rgba(109,40,217,0.45)]">
                                  <AvatarFallback className="text-white font-semibold bg-[linear-gradient(135deg,#6a0dad,#ff69b4)]">
                        {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate cursor-pointer">{userName}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {userRoleValue} • {entryCount} entr{entryCount === 1 ? 'y' : 'ies'} • {projectsForUser.length} project{projectsForUser.length === 1 ? '' : 's'}
                                  </p>
                                </div>
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-purple-600 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                                aria-hidden="true"
                              />
                            </button>
                <div className="flex items-center gap-3">
                  <div className="text-right space-y-1">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Assigned Hours</p>
                      <p className="text-lg font-bold text-blue-600">
                        {assignedHoursDisplay}h {assignedMinsDisplay}m
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Logged Hours</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {totalHours}h {totalMins}m
                      </p>
                    </div>
                  </div>
                  {user && (
                            <Button 
                              variant="outline" 
                              className="border-purple-200 text-purple-700 hover:bg-purple-100"
                              onClick={() => {
                                setSelectedUserId(userId);
                                setAnalyticsOpen(true);
                              }}
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Analytics
                            </Button>
                  )}
                </div>
                      </div>
                      
                          <div className="mt-4 grid grid-cols-7 gap-3 text-xs text-muted-foreground">
                        <div>
                              <p>Assigned</p>
                              <p className="mt-0.5 text-sm font-semibold text-blue-600">{assignedHoursDisplay}h {assignedMinsDisplay}m</p>
                        </div>
                        <div>
                              <p>Estimated</p>
                              <p className="mt-0.5 text-sm font-semibold text-emerald-600">{formatTimeHHMM(parseTime(userEffort.estimation))}</p>
                        </div>
                        <div>
                              <p>Actual</p>
                              <p className="mt-0.5 text-sm font-semibold text-green-600">{formatTimeHHMM(parseTime(userEffort.timeSpent))}</p>
                        </div>
                            <div>
                              <p>Remaining</p>
                              <p className="mt-0.5 text-sm font-semibold text-orange-600">
                                {formatTimeHHMM(remainingMinutes)}
                              </p>
                      </div>
                            <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Projects</p>
                  <p className="font-semibold text-purple-600">{projectsForUser.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Tasks</p>
                  <p className="font-semibold text-purple-600">{Array.from(combinedUserTasks.values()).length}</p>
                        </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Accuracy</p>
                              <p className="font-semibold text-purple-600">{accuracy}%</p>
                          </div>
              </div>
            </CardContent>
          </Card>

          {isExpanded && projectsForUser.map(([projectName, projectData]) => {
            const theme = getProjectTheme(projectData.projectId || projectName);
            const projectEntries = collectEntriesFromStories(projectData.stories);
            const projectMinutes = projectEntries.reduce((sum, entry) => sum + parseTime(entry.timeSpent), 0);
            const projectHours = Math.floor(projectMinutes / 60);
            const projectMins = projectMinutes % 60;
            const projectStoryCount = Object.keys(projectData.stories).length;
            const projectTaskCount = (Object.values(projectData.stories) as GroupedStoryBucket[]).reduce(
              (sum, story) => sum + Object.keys(story.tasks).length,
              0
            );

            // Calculate total allotted time for this project (sum of estimatedHours from all tasks)
            let projectAllottedHours = 0;
            (Object.values(projectData.stories) as GroupedStoryBucket[]).forEach(story => {
              (Object.values(story.tasks) as GroupedTaskBucket[]).forEach(taskBucket => {
                const task = taskBucket.taskId ? tasksMap.get(taskBucket.taskId) : undefined;
                if (task && task.estimatedHours) {
                  projectAllottedHours += task.estimatedHours;
                }
              });
            });
            const projectAllottedHoursDisplay = Math.floor(projectAllottedHours);
            const projectAllottedMinsDisplay = Math.round((projectAllottedHours - projectAllottedHoursDisplay) * 60);

            // Calculate remaining time (Allotted - Logged)
            const projectAllottedMinutes = Math.round(projectAllottedHours * 60);
            const remainingMinutes = Math.max(0, projectAllottedMinutes - projectMinutes);
            const remainingHours = Math.floor(remainingMinutes / 60);
            const remainingMins = remainingMinutes % 60;

            return (
              <div key={projectName} className="ml-6 space-y-3">
                <Card className={`shadow-sm ${theme.border} ${theme.cardBg}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-0 shadow-[0_8px_18px_-6px_rgba(16,185,129,0.45)]">
                          <AvatarFallback className="text-white font-semibold bg-[linear-gradient(135deg,#10b981,#34d399)]">
                            {getProjectInitials(projectName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="inline-flex items-center gap-2 rounded-md bg-[linear-gradient(135deg,#10b981,#34d399)] px-3 py-1 text-sm font-semibold text-black shadow-[0_6px_18px_-8px_rgba(16,185,129,0.45)]">
                            {formatDisplayName(projectName)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {projectStoryCount} stor{projectStoryCount === 1 ? 'y' : 'ies'} • {projectTaskCount} task{projectTaskCount === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Allotted Time</p>
                          <p className={`text-lg font-bold text-blue-600`}>
                            {projectAllottedHoursDisplay}h {projectAllottedMinsDisplay}m
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Logged Time</p>
                          <p className={`text-sm font-semibold ${theme.headerText}`}>
                            {projectHours}h {projectMins}m
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Remaining Time</p>
                          <p className={`text-sm font-semibold text-orange-600`}>
                            {remainingHours}h {remainingMins}m
                          </p>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

                {(Object.entries(projectData.stories) as [string, GroupedStoryBucket][]).map(([storyName, storyData]) => {
                  const displayStoryName = formatDisplayName(storyName);
                  const storyTaskBuckets = Object.values(storyData.tasks) as GroupedTaskBucket[];
                  const storyEntries = storyTaskBuckets.flatMap(task => task.entries);
                  const storyMinutes = storyEntries.reduce((sum, entry) => sum + parseTime(entry.timeSpent), 0);
                  const storyHours = Math.floor(storyMinutes / 60);
                  const storyMins = storyMinutes % 60;
                  const storyTaskCount = storyTaskBuckets.length;
                  const storyEntity = storyData.storyId ? storiesMap.get(storyData.storyId) : undefined;
                  const projectEntity = projectData.projectId ? projectsMap.get(projectData.projectId) : undefined;

                  return (
                    <div key={storyName} className="ml-6 space-y-2">
                      {/* Story Card with Light Green and White Theme */}
                      <div className="bg-gradient-to-r from-green-50/80 via-white to-green-50/50 border-l-4 border-green-400 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-green-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            {/* Story Icon */}
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-bold">S</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 text-sm mb-1.5">{displayStoryName}</h5>
                              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 border-green-300 font-medium">
                                {storyTaskCount} task{storyTaskCount === 1 ? '' : 's'}
                              </Badge>
                            </div>
                          </div>
                          {/* Story Hours Display */}
                          <div className="text-right bg-white/70 rounded-md px-3 py-2 border border-green-100 min-w-[80px]">
                            <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wide mb-0.5">Hours</p>
                            <p className="text-sm font-bold text-green-600">
                              {storyHours}h {storyMins}m
                            </p>
                          </div>
                        </div>
                      </div>

                      {(Object.entries(storyData.tasks) as [string, GroupedTaskBucket][]).map(([taskName, taskBucket]) => {
                        const taskEntries = taskBucket.entries;
                        const task = taskBucket.taskId ? tasksMap.get(taskBucket.taskId) : undefined;
                        const displayTaskName = formatDisplayName(taskName);

                        const fallbackEntry: TimeEntry | null = taskEntries[0] || (task ? {
                          id: task.id,
                          task: task.title,
                          taskId: taskBucket.taskId,
                          story: storyName,
                          storyId: storyData.storyId,
                          project: projectEntity?.name || projectName,
                          projectId: projectEntity?.id,
                          sprintId: storyEntity?.sprintId,
                          user: userName,
                          userId,
                          userRole: userRoleValue,
                          duration: '0h 0m',
                          date: new Date().toISOString().split('T')[0],
                          status: 'completed' as const,
                          billable: false,
                          category: 'development',
                          description: task.description || '',
                          timeSpent: '0h 0m',
                          remaining: '0h 0m',
                          estimation: task.estimatedHours
                            ? `${Math.floor(task.estimatedHours)}h ${Math.round((task.estimatedHours - Math.floor(task.estimatedHours)) * 60)}m`
                            : undefined,
                        } : null);

                        if (!fallbackEntry) {
                          return null;
                        }

                        const hasActive = taskEntries.some(entry => entry.status === 'active') || task?.status === 'IN_PROGRESS';
                        const allBillable = taskEntries.length > 0 ? taskEntries.every(entry => entry.billable) : false;

                        // Calculate allotted time for this task
                        const taskAllottedHours = task?.estimatedHours || 0;
                        const taskAllottedHoursDisplay = Math.floor(taskAllottedHours);
                        const taskAllottedMinsDisplay = Math.round((taskAllottedHours - taskAllottedHoursDisplay) * 60);

                        const totalTaskMinutes = taskEntries.reduce((sum, entry) => sum + parseTime(entry.timeSpent), 0);
                        const totalTaskHours = Math.floor(totalTaskMinutes / 60);
                        const totalTaskMins = totalTaskMinutes % 60;
                        const totalTaskTimeSpent = taskEntries.length > 0 ? `${totalTaskHours}h ${totalTaskMins}m` : '0h 0m';
                        
                        const taskEffort = taskEntries.length > 0 
                          ? getProjectEffort(taskName, taskEntries)
                          : task?.estimatedHours
                            ? {
                                estimation: formatTimeHHMM(Math.round(task.estimatedHours * 60)),
                                timeSpent: '00:00',
                                remaining: formatTimeHHMM(Math.round(task.estimatedHours * 60)),
                                spentPercent: 0,
                                remainingPercent: 100,
                              }
                            : {
                                estimation: '00:00',
                              timeSpent: '00:00',
                                remaining: '00:00',
                              spentPercent: 0,
                                remainingPercent: 0,
                              };

                        const baseEstimatedMinutes = taskEntries.length === 0 && task?.estimatedHours
                          ? Math.round(task.estimatedHours * 60)
                          : 0;
                        const totalEstimated = taskEntries.reduce((sum, entry) => {
                          if (entry.estimation) return sum + parseTime(entry.estimation);
                          return sum + parseTime(entry.timeSpent) + parseTime(entry.remaining);
                        }, baseEstimatedMinutes);
                        const totalRemaining = taskEntries.length > 0
                          ? taskEntries.reduce((sum, entry) => sum + parseTime(entry.remaining), 0)
                          : baseEstimatedMinutes;
                        const totalSpent = taskEntries.reduce((sum, entry) => sum + parseTime(entry.timeSpent), 0);
                        const spentPercent = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;
                        const remainingPercent = totalEstimated > 0 ? Math.round((totalRemaining / totalEstimated) * 100) : (baseEstimatedMinutes > 0 ? 100 : 0);
                        const taskAccuracy = totalEstimated > 0 ? Math.round((totalSpent / totalEstimated) * 100) : 0;
                        
                        // Calculate remaining time for task (Allotted - Spent)
                        const taskAllottedMinutes = taskAllottedHours > 0 ? Math.round(taskAllottedHours * 60) : 0;
                        const taskRemainingMinutes = Math.max(0, taskAllottedMinutes - totalSpent);
                        const taskRemainingHoursDisplay = Math.floor(taskRemainingMinutes / 60);
                        const taskRemainingMinsDisplay = taskRemainingMinutes % 60;
                        
                        // Calculate estimated hours difference (spent vs estimated)
                        const estimatedMinutes = taskAllottedHours > 0 ? Math.round(taskAllottedHours * 60) : totalEstimated;
                        const hoursDifference = estimatedMinutes > 0 ? totalSpent - estimatedMinutes : 0;
                        const hoursDifferenceDisplay = Math.abs(hoursDifference);
                        const hoursDiffHours = Math.floor(hoursDifferenceDisplay / 60);
                        const hoursDiffMins = hoursDifferenceDisplay % 60;
                        const isOverEstimated = hoursDifference > 0;
                        const isUnderEstimated = hoursDifference < 0;
                        
                        // Calculate due date difference
                        let dueDateDifference: { days: number; isOverdue: boolean; display: string } | null = null;
                        if (task?.dueDate) {
                          try {
                            const dueDate = new Date(task.dueDate);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            dueDate.setHours(0, 0, 0, 0);
                            const diffTime = dueDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            const isOverdue = diffDays < 0;
                            dueDateDifference = {
                              days: Math.abs(diffDays),
                              isOverdue,
                              display: isOverdue 
                                ? `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`
                                : diffDays === 0
                                  ? 'Due today'
                                  : `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`
                            };
                          } catch (e) {
                            console.warn('Error parsing due date:', task.dueDate, e);
                          }
                        }
                        
                        // Format task status
                        const getTaskStatusBadge = (status: string) => {
                          const statusLower = status?.toLowerCase() || '';
                          switch (statusLower) {
                            case 'to_do':
                            case 'todo':
                              return { label: 'To Do', className: 'bg-gray-100 text-gray-800 border-gray-200' };
                            case 'in_progress':
                              return { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' };
                            case 'qa_review':
                              return { label: 'QA Review', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
                            case 'done':
                              return { label: 'Done', className: 'bg-green-100 text-green-800 border-green-200' };
                            case 'blocked':
                              return { label: 'Blocked', className: 'bg-red-100 text-red-800 border-red-200' };
                            case 'cancelled':
                              return { label: 'Cancelled', className: 'bg-gray-100 text-gray-600 border-gray-200' };
                            default:
                              return { label: status || 'Unknown', className: 'bg-gray-100 text-gray-800 border-gray-200' };
                          }
                        };
                        
                        const taskStatus = task?.status || 'TO_DO';
                        const statusBadge = getTaskStatusBadge(taskStatus);
                        
                        return (
                          <div key={taskName} className="ml-6">
                            <Card className="border-l-2 border-l-indigo-500 shadow-sm">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h6 className="font-semibold text-foreground text-sm">{displayTaskName}</h6>
                                      {/* Task Status Badge */}
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusBadge.className}`}>
                                        {statusBadge.label}
                                      </Badge>
                                      {taskAllottedHours > 0 && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-200">
                                          Allotted: {taskAllottedHoursDisplay}h {taskAllottedMinsDisplay}m
                                        </Badge>
                                      )}
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${getCategoryColor(fallbackEntry.category)}`}>
                                        {formatCategoryName(fallbackEntry.category)}
                                      </Badge>
                                      {hasActive && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-100 text-green-800 border-green-200">
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 inline-block" />
                                          Active
                                        </Badge>
                                      )}
                                      {allBillable && (
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-800 border-blue-200">
                                          Billable
                                        </Badge>
                                      )}
                    </div>
                                    
                                    <div className="grid grid-cols-4 gap-3 text-[11px]">
                  <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Estimated</p>
                                        <p className="font-semibold">{taskEffort.estimation}</p>
                  </div>
                                      <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Spent</p>
                                        <p className="font-semibold text-green-600">{taskEffort.timeSpent}</p>
                </div>
                  <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Remaining</p>
                                        <p className="font-semibold text-gray-600">{taskEffort.remaining}</p>
                                      </div>
                                      <div>
                                        <p className="text-[10px] text-muted-foreground mb-1">Accuracy</p>
                                        <p className="font-semibold text-purple-600">{taskAccuracy}%</p>
                                      </div>
                                      </div>
                                      
                                      {/* Estimated Hours Difference */}
                                      {estimatedMinutes > 0 && hoursDifferenceDisplay > 0 && (
                                        <div className="flex items-center gap-2 text-[10px]">
                                          <span className="text-muted-foreground">Est. Difference:</span>
                                          <Badge 
                                            variant="outline" 
                                            className={`px-1.5 py-0 text-[10px] ${
                                              isOverEstimated 
                                                ? 'bg-orange-100 text-orange-800 border-orange-200' 
                                                : isUnderEstimated
                                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }`}
                                          >
                                            {isOverEstimated ? '+' : isUnderEstimated ? '-' : ''}
                                            {hoursDiffHours > 0 ? `${hoursDiffHours}h ` : ''}
                                            {hoursDiffMins > 0 ? `${hoursDiffMins}m` : hoursDiffHours === 0 ? '0m' : ''}
                                            {isOverEstimated ? ' over' : isUnderEstimated ? ' under' : ''}
                                          </Badge>
                                        </div>
                                      )}
                                      
                                      {/* Due Date Difference */}
                                      {dueDateDifference && (
                                        <div className="flex items-center gap-2 text-[10px]">
                                          <span className="text-muted-foreground">Due Date:</span>
                                          <Badge 
                                            variant="outline" 
                                            className={`px-1.5 py-0 text-[10px] ${
                                              dueDateDifference.isOverdue
                                                ? 'bg-red-100 text-red-800 border-red-200'
                                                : dueDateDifference.days === 0
                                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                  : 'bg-green-100 text-green-800 border-green-200'
                                            }`}
                                          >
                                            {dueDateDifference.display}
                                          </Badge>
                                        </div>
                                      )}

                                    <div className="rounded-md bg-muted/40 border border-muted/50 p-2">
                                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>Total Time</span>
                                        <span className="font-semibold text-foreground">{totalTaskTimeSpent}</span>
                                        </div>
                                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                                        <div
                                          className="h-full bg-indigo-500"
                                          style={{ width: `${Math.min(100, spentPercent)}%` }}
                                        />
                                      </div>
                                      <div className="mt-2 flex items-center justify-between text-[10px]">
                                        <span className="text-green-600">Spent {spentPercent}%</span>
                                        <span className="text-gray-600">Remain {remainingPercent}%</span>
                                      </div>
                  </div>
                </div>
                
                                  <div className="min-w-[11rem] space-y-2 text-[11px]">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-muted-foreground">Status</span>
                                      <span className={`font-semibold text-right whitespace-nowrap ${statusBadge.className.split(' ')[1]}`}>
                                        {statusBadge.label}
                                      </span>
                                    </div>
                                    {taskAllottedHours > 0 && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Allotted</span>
                                        <span className="font-semibold text-blue-600 text-right whitespace-nowrap">
                                          {taskAllottedHoursDisplay}h {taskAllottedMinsDisplay}m
                                        </span>
                                      </div>
                                    )}
                                    {taskAllottedHours > 0 && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Remaining</span>
                                        <span className="font-semibold text-orange-600 text-right whitespace-nowrap">
                                          {taskRemainingHoursDisplay}h {taskRemainingMinsDisplay}m
                                        </span>
                                      </div>
                                    )}
                                    {estimatedMinutes > 0 && hoursDifferenceDisplay > 0 && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Est. Diff</span>
                                        <span className={`font-semibold text-right whitespace-nowrap ${
                                          isOverEstimated ? 'text-orange-600' : isUnderEstimated ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                          {isOverEstimated ? '+' : isUnderEstimated ? '-' : ''}
                                          {hoursDiffHours > 0 ? `${hoursDiffHours}h ` : ''}
                                          {hoursDiffMins > 0 ? `${hoursDiffMins}m` : hoursDiffHours === 0 ? '0m' : ''}
                                        </span>
                                      </div>
                                    )}
                                    {dueDateDifference && (
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">Due Date</span>
                                        <span className={`font-semibold text-right whitespace-nowrap ${
                                          dueDateDifference.isOverdue ? 'text-red-600' : dueDateDifference.days === 0 ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                          {dueDateDifference.display}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-muted-foreground">Date</span>
                                      <span className="font-semibold text-foreground text-right whitespace-nowrap">
                                        {taskEntries[0]?.date ? new Date(taskEntries[0].date).toLocaleDateString() : '—'}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-muted-foreground">Category</span>
                                      <span className="font-semibold text-foreground text-right whitespace-nowrap">{formatCategoryName(fallbackEntry.category)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-muted-foreground">Billable</span>
                                      <span className={`font-semibold text-right whitespace-nowrap ${allBillable ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                        {allBillable ? 'Yes' : 'No'}
                                      </span>
                                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
                        );
                      })}
                    </div>
                  );
                })}
                  </div>
                );
              })}
              </div>
            );
    })
    .filter((section): section is React.ReactElement => section !== null);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team Time Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor team performance and work hours across scrums</p>
        </div>
      </div>

      {/* Summary Cards - Show Total Hours (Allotted) and Billable Hours (Logged) */}
      <div className="flex gap-2">
        <Card className="flex-1 border-l-2 border-l-green-500 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate leading-tight">Total Hours</p>
                <p className="text-sm font-semibold text-green-600 truncate leading-tight mt-0.5">{summaryStats.allottedHours || summaryStats.totalHours}</p>
              </div>
              <div className="p-1 bg-green-100 rounded flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-green-600" />
            </div>
              </div>
        </CardContent>
      </Card>

        <Card className="flex-1 border-l-2 border-l-blue-500 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate leading-tight">Billable Hours</p>
                <p className="text-sm font-semibold text-blue-600 truncate leading-tight mt-0.5">{summaryStats.billableHours}</p>
              </div>
              <div className="p-1 bg-blue-100 rounded flex-shrink-0">
                <Target className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

        <Card className="flex-1 border-l-2 border-l-purple-500 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate leading-tight">Active Members</p>
                <p className="text-sm font-semibold text-purple-600 leading-tight mt-0.5">{summaryStats.activeMembers}</p>
              </div>
              <div className="p-1 bg-purple-100 rounded flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 border-l-2 border-l-orange-500 min-w-0">
          <CardContent className="p-2">
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground truncate leading-tight">Billable %</p>
                <p className="text-sm font-semibold text-orange-600 leading-tight mt-0.5">{summaryStats.billablePercentage}%</p>
              </div>
              <div className="p-1 bg-orange-100 rounded flex-shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries by Scrum Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
            <h2 className="text-xl font-semibold text-foreground">Time Entries by Project</h2>
            <p className="text-sm text-muted-foreground mt-0.5">View team performance across projects and users</p>
              </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
      </div>

        {/* Grouped Time Entries - User → Project → Tasks */}
        <div className="space-y-5">
          {userSections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No time entries found. Please check your filters or add time entries.</p>
            </div>
          ) : (
            userSections
          )}
        </div>
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
