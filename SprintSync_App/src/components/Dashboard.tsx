import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  FolderKanban,
  Users,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Brain,
  Sparkles,
  MessageSquare,
  User,
  BookOpen,
  Zap,
  Coffee,
  Eye,
  Filter,
  X
} from 'lucide-react';
// Removed mock data imports - using API data only
import UserTasks from './UserTasks';
import { useProjects, useUsers, useDepartments, useDomains, useEpics, useReleases, useSprints, useStories, useTasks } from '../hooks/api';
import { apiClient } from '../services/api/client';
import { prefetchProjects } from '../hooks/api/useProjects';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, canAccessProject } = useAuth();
  
  // API authentication is now handled by AuthContext
  // No need for demo auth setup

  // Prefetch projects immediately when Dashboard mounts (for faster loading)
  useEffect(() => {
    if (user?.id) {
      // Prefetch projects in background for dashboard
      prefetchProjects(user.id).catch(() => {
        // Silently fail - projects will be fetched by hook
      });
    }
  }, [user?.id]);

  // API hooks for real data from all master tables
  // Projects hook will use cached/prefetched data immediately
  const { data: apiProjects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: apiUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers({ page: 0, size: 1000 });
  const { data: apiDepartments, loading: departmentsLoading, error: departmentsError, refetch: refetchDepartments } = useDepartments();
  const { data: apiDomains, loading: domainsLoading, error: domainsError, refetch: refetchDomains } = useDomains();
  const { data: apiEpics, loading: epicsLoading, error: epicsError, refetch: refetchEpics } = useEpics();
  const { data: apiReleases, loading: releasesLoading, error: releasesError, refetch: refetchReleases } = useReleases();
  const { data: apiSprints, loading: sprintsLoading, error: sprintsError, refetch: refetchSprints } = useSprints();
  const { data: apiStories, loading: storiesLoading, error: storiesError, refetch: refetchStories } = useStories();
  const { data: apiTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks();
  
  // Check if any API is still loading (but consider cached data as loaded)
  const isLoadingAny = (projectsLoading && !apiProjects) || 
                       (usersLoading && !apiUsers) || 
                       (departmentsLoading && !apiDepartments) || 
                       (domainsLoading && !apiDomains) || 
                       (epicsLoading && !apiEpics) || 
                       (releasesLoading && !apiReleases) || 
                       (sprintsLoading && !apiSprints) || 
                       (storiesLoading && !apiStories) || 
                       (tasksLoading && !apiTasks);
  
  // Calculate loading progress with better logic
  const loadingProgress = useMemo(() => {
    const totalApis = 9;
    const apiStatuses = [
      { loading: projectsLoading, data: apiProjects, error: projectsError, name: 'Projects' },
      { loading: usersLoading, data: apiUsers, error: usersError, name: 'Users' },
      { loading: departmentsLoading, data: apiDepartments, error: departmentsError, name: 'Departments' },
      { loading: domainsLoading, data: apiDomains, error: domainsError, name: 'Domains' },
      { loading: epicsLoading, data: apiEpics, error: epicsError, name: 'Epics' },
      { loading: releasesLoading, data: apiReleases, error: releasesError, name: 'Releases' },
      { loading: sprintsLoading, data: apiSprints, error: sprintsError, name: 'Sprints' },
      { loading: storiesLoading, data: apiStories, error: storiesError, name: 'Stories' },
      { loading: tasksLoading, data: apiTasks, error: tasksError, name: 'Tasks' },
    ];
    
    const loadedApis = apiStatuses.filter(api => 
      (!api.loading && (api.data !== null || api.error))
    ).length;
    
    return Math.round((loadedApis / totalApis) * 100);
  }, [
    projectsLoading, usersLoading, departmentsLoading, domainsLoading,
    epicsLoading, releasesLoading, sprintsLoading, storiesLoading, tasksLoading,
    apiProjects, apiUsers, apiDepartments, apiDomains, apiEpics, apiReleases, apiSprints, apiStories, apiTasks,
    projectsError, usersError, departmentsError, domainsError, epicsError, releasesError, sprintsError, storiesError, tasksError
  ]);
  
  // Filter states
  const [selectedProjectForSprint, setSelectedProjectForSprint] = useState<string>('all');
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<string>('all');

  // Helper function to normalize paginated API responses
  const normalizeApiData = (data: any): any[] => {
    if (Array.isArray(data)) {
      return data;
    }
    // Handle Spring Boot paginated response format
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    // Handle nested data property
    if (data?.data) {
      return normalizeApiData(data.data);
    }
    return [];
  };

  // Filter projects based on user permissions - optimized for performance
  const accessibleProjects = useMemo(() => {
    if (!user) return [];
    const projectData = normalizeApiData(apiProjects);
    
    // Admins can access all projects
    if (user.role === 'admin') {
      return projectData;
    }
    
    // Managers can only access projects they manage
    if (user.role === 'manager') {
      return projectData.filter(project => {
        // Try multiple possible field names for managerId
        const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
        // Compare as strings to handle any type mismatches
        const managerIdStr = managerId ? String(managerId) : null;
        const userIdStr = user.id ? String(user.id) : null;
        return managerIdStr === userIdStr;
      });
    }
    
    // QA and regular users filter by canAccessProject
    return projectData.filter(project => canAccessProject(project.id));
  }, [user, canAccessProject, apiProjects]);

  // Filter projects for Recent Projects section - show only user's assigned projects
  const userAssignedProjects = useMemo(() => {
    if (!user) return [];
    const projectData = normalizeApiData(apiProjects);
    
    // Admins see all projects
    if (user.role === 'admin') {
      return projectData;
    }
    
    // Managers see only projects they manage
    if (user.role === 'manager') {
      return projectData.filter(project => {
        // Try multiple possible field names for managerId
        const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
        // Compare as strings to handle any type mismatches
        const managerIdStr = managerId ? String(managerId) : null;
        const userIdStr = user.id ? String(user.id) : null;
        return managerIdStr === userIdStr;
      });
    }
    
    // For regular users, filter projects where they are team members
    return projectData.filter(project => {
      // Check if user is in teamMembers array (handle both string[] and object[] formats)
      const teamMembers = (project as any).teamMembers;
      if (Array.isArray(teamMembers)) {
        return teamMembers.some((member: any) => 
          (typeof member === 'string' && member === user.id) ||
          (typeof member === 'object' && (member.id === user.id || member.userId === user.id))
        );
      }
      
      // Fallback: check if canAccessProject allows access
      return canAccessProject(project.id);
    });
  }, [user, apiProjects, canAccessProject]);

  // Get role-based metrics from API data - optimized with early returns
  const metrics = useMemo(() => {
    if (!user) return null;
    
    // Use cached projects immediately - don't wait for loading
    const projects = normalizeApiData(apiProjects);
    const users = normalizeApiData(apiUsers);
    const allTasks = normalizeApiData(apiTasks);
    const allSprints = normalizeApiData(apiSprints);
    const allStories = normalizeApiData(apiStories);
    
    // Early validation - ensure we have tasks data
    if (allTasks.length === 0 && !tasksLoading) {
      console.warn('[Dashboard] No tasks found in API data. Tasks loading:', tasksLoading, 'Tasks data:', apiTasks);
    }
    
    // Check if user is manager/admin/qa
    const isManagerOrAdmin = user.role === 'admin' || user.role === 'manager' || user.role === 'qa';
    
    // Get user's project IDs first (needed for both sprint filtering and fallback)
    // For managers: only projects where they are the manager
    // For admins: all projects
    // For regular users: projects where they are team members
    const userProjectIdsForFiltering = user.role === 'admin'
      ? new Set(projects.map(p => p.id))  // Admins see all projects
      : user.role === 'manager'
      ? new Set(
          projects
            .filter(project => {
              // Managers only see projects where they are the manager
              // Try multiple possible field names for managerId
              const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id || (project as any).managerId;
              // Compare with user.id as string
              const managerIdStr = managerId ? String(managerId) : null;
              const userIdStr = user.id ? String(user.id) : null;
              const matches = managerIdStr === userIdStr;
              
              if (!matches && user.role === 'manager') {
                // Debug logging for manager project filtering
                console.log('[Dashboard] Project manager mismatch:', {
                  projectId: project.id,
                  projectName: (project as any).name,
                  managerId: managerId,
                  managerIdStr,
                  userIdStr,
                  userId: user.id
                });
              }
              
              return matches;
            })
            .map(project => project.id)
        )
      : new Set(
          projects
            .filter(project => {
              const teamMembers = (project as any).teamMembers;
              if (Array.isArray(teamMembers)) {
                return teamMembers.some((member: any) => 
                  (typeof member === 'string' && member === user.id) ||
                  (typeof member === 'object' && (member.id === user.id || member.userId === user.id))
                );
              }
              return false;
            })
            .map(project => project.id)
        );
    
    // Debug logging for manager project filtering
    if (user.role === 'manager') {
      console.log('[Dashboard] Manager project filtering:', {
        userId: user.id,
        userRole: user.role,
        totalProjects: projects.length,
        managerProjects: userProjectIdsForFiltering.size,
        managerProjectIds: Array.from(userProjectIdsForFiltering).slice(0, 5)
      });
    }
    
    // Filter sprints based on user role - get sprints from user's accessible projects
    // For managers: filter sprints from their projects
    // For admins: show all sprints
    // For regular users: only show sprints from projects they're assigned to
    let userSprints = allSprints;
    if (user.role === 'manager') {
      // For managers, only show sprints from projects they manage
      userSprints = allSprints.filter(sprint => {
        const sprintProjectId = (sprint as any).projectId || (sprint as any).project?.id;
        return sprintProjectId && userProjectIdsForFiltering.has(sprintProjectId);
      });
    } else if (!isManagerOrAdmin) {
      // For regular users, only show sprints from projects they're assigned to
      userSprints = allSprints.filter(sprint => {
        const sprintProjectId = (sprint as any).projectId || (sprint as any).project?.id;
        return sprintProjectId && userProjectIdsForFiltering.has(sprintProjectId);
      });
    }
    // For admins, keep all sprints (userSprints = allSprints)
    
    // Get sprint IDs from user's accessible sprints
    const userSprintIds = new Set(userSprints.map(sprint => sprint.id));
    
    // Filter stories that belong to user's sprints
    const userStories = allStories.filter(story => {
      const storySprintId = (story as any).sprintId || (story as any).sprint?.id || (story as any).sprintId;
      return storySprintId && userSprintIds.has(storySprintId);
    });
    
    // Get story IDs from user's stories
    const userStoryIds = new Set(userStories.map(story => story.id));
    
    // Also get all stories from user's projects (for fallback)
    const projectStories = allStories.filter(story => {
      const storyProjectId = (story as any).projectId || (story as any).project?.id || (story as any).projectId;
      return storyProjectId && userProjectIdsForFiltering.has(storyProjectId);
    });
    const projectStoryIds = new Set(projectStories.map(story => story.id));
    
    // SIMPLIFIED APPROACH: Use direct user assignment as primary method
    // This is more reliable than filtering through sprints/stories
    let sprintTasks: any[] = [];
    
    if (user.role === 'admin') {
      // Admins: Show all tasks
      sprintTasks = allTasks.filter(task => {
        return task && task.id && typeof task.id === 'string';
      });
    } else if (user.role === 'manager') {
      // Managers: Filter tasks by projects they manage
      // Get tasks through stories from manager's projects
      const beforeCount = allTasks.length;
      sprintTasks = allTasks.filter(task => {
        if (!task || !task.id) return false;
        const taskStoryId = (task as any).storyId || (task as any).story?.id;
        if (!taskStoryId) {
          // If task doesn't have a storyId, we can't filter it - skip it for managers
          return false;
        }
        // Check if the task's story belongs to a project the manager manages
        const belongsToManagerProject = projectStoryIds.has(taskStoryId);
        return belongsToManagerProject;
      });
      
      console.log('[Dashboard] Manager task filtering result:', {
        userId: user.id,
        userRole: user.role,
        beforeCount,
        afterCount: sprintTasks.length,
        projectStoryIdsCount: projectStoryIds.size,
        filteredOut: beforeCount - sprintTasks.length,
        managerProjectIds: Array.from(userProjectIdsForFiltering).slice(0, 5)
      });
    } else {
      // Regular users: Get tasks directly assigned to them
      sprintTasks = allTasks.filter(task => {
        if (!task || !task.id) return false;
        const assigneeId = (task as any).assigneeId || (task as any).assignee?.id || (task as any).assignee?.userId;
        return assigneeId === user.id;
      });
      
      // Fallback: If no direct assignments, try through projects/stories
      if (sprintTasks.length === 0 && projectStoryIds.size > 0) {
        sprintTasks = allTasks.filter(task => {
          if (!task || !task.id) return false;
          const taskStoryId = (task as any).storyId || (task as any).story?.id;
          return taskStoryId && projectStoryIds.has(taskStoryId);
        });
      }
      
      // Final fallback: Try through sprints
      if (sprintTasks.length === 0 && userStoryIds.size > 0) {
        sprintTasks = allTasks.filter(task => {
          if (!task || !task.id) return false;
          const taskStoryId = (task as any).storyId || (task as any).story?.id;
          return taskStoryId && userStoryIds.has(taskStoryId);
        });
      }
    }
    
    // Debug logging (temporary - check browser console to diagnose 0% issue)
    console.log('[Dashboard Metrics Debug]', {
      userRole: user.role,
      userId: user.id,
      totalSprints: allSprints.length,
      userSprints: userSprints.length,
      userSprintIds: Array.from(userSprintIds).slice(0, 3),
      totalStories: allStories.length,
      userStories: userStories.length,
      userStoryIds: Array.from(userStoryIds).slice(0, 3),
      projectStories: projectStories.length,
      projectStoryIds: Array.from(projectStoryIds).slice(0, 3),
      totalTasks: allTasks.length,
      sprintTasks: sprintTasks.length,
      taskStatuses: sprintTasks.slice(0, 10).map(t => {
        const status = (t as any).status || (t as any).taskStatus;
        return {
          id: t.id,
          status: status,
          normalized: status?.toString().toLowerCase().trim(),
          assigneeId: (t as any).assigneeId || (t as any).assignee?.id
        };
      }),
      sampleTask: sprintTasks[0] ? {
        id: sprintTasks[0].id,
        storyId: (sprintTasks[0] as any).storyId,
        status: (sprintTasks[0] as any).status,
        assigneeId: (sprintTasks[0] as any).assigneeId
      } : null
    });
    
    // Fast calculations with early optimizations
    const totalProjects = isManagerOrAdmin ? projects.length : userAssignedProjects.length;
    
    // Calculate total users
    // For admin: show all users from the system
    // For others: show users from projects where the user is listed
    const normalizeId = (value?: string | number | null): string | undefined => {
      if (value === null || value === undefined) {
        return undefined;
      }
      return String(value);
    };
    
    let totalUsers: number;
    
    if (user.role === 'admin') {
      // Admin sees all users in the system
      totalUsers = users.length;
    } else {
      // For non-admin users, show only users from projects where they are listed
      const normalizedCurrentUserId = user?.id ? normalizeId(user.id) : undefined;
      
      // Get all projects where the user is listed (manager, creator, or team member)
      const userAccessibleProjects = projects.filter(project => {
        if (!project || !normalizedCurrentUserId) return false;
        
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
              member?.user?.id ??
              member?.user?.userId
            );
            return memberId ? memberId === normalizedCurrentUserId : false;
          });
        }
        
        return false;
      });
      
      // Collect all unique team member IDs from accessible projects
      const allProjectTeamMemberIds = new Set<string>();
      userAccessibleProjects.forEach(project => {
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
        
        // Also include manager and creator if they exist
        const managerId = normalizeId((project as any).managerId);
        const createdById = normalizeId((project as any).createdBy);
        if (managerId) {
          allProjectTeamMemberIds.add(managerId);
        }
        if (createdById) {
          allProjectTeamMemberIds.add(createdById);
        }
      });
      
      // Count unique users from projects where the user is listed
      totalUsers = allProjectTeamMemberIds.size;
    }
    const totalTasks = sprintTasks.length;
    
    // Use single pass for task filtering (more efficient)
    let completedTasks = 0;
    let criticalItems = 0;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    let upcomingDeadlines = 0;
    
    // Track status counts for debugging
    const statusCounts: Record<string, number> = {};
    
    for (const task of sprintTasks) {
      // Validate task structure
      if (!task || !task.id) continue;
      
      // Get and normalize status - check multiple possible field names
      const taskStatus = (task as any).status || 
                        (task as any).taskStatus || 
                        (task as any).state ||
                        '';
      const normalizedStatus = taskStatus?.toString().toLowerCase().trim() || '';
      
      // Track status counts
      statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;
      
      // Handle various status formats - be very permissive
      // Database enum values: 'to_do', 'in_progress', 'qa_review', 'done'
      // API might return: 'DONE', 'Done', 'done', 'completed', 'COMPLETED', 'Completed'
      const isCompleted = normalizedStatus === 'done' || 
                          normalizedStatus === 'completed' ||
                          normalizedStatus === 'd' ||
                          normalizedStatus === 'finished' ||
                          normalizedStatus === 'closed' ||
                          normalizedStatus.includes('done') ||
                          normalizedStatus.includes('complete') ||
                          normalizedStatus.includes('finish');
      
      if (isCompleted) {
        completedTasks++;
      }
      
      // Get and normalize priority
      const taskPriority = (task as any).priority || (task as any).taskPriority;
      const normalizedPriority = taskPriority?.toString().toLowerCase() || '';
      if (normalizedPriority === 'critical' || normalizedPriority === 'high') {
        criticalItems++;
      }
      
      // Check due dates
      const dueDate = (task as any).dueDate || (task as any).due_date;
      if (dueDate) {
        try {
          const due = new Date(dueDate);
          if (!isNaN(due.getTime()) && due >= today && due <= nextWeek) {
            upcomingDeadlines++;
          }
        } catch (dateError) {
          // Invalid date, skip
        }
      }
    }
    
    // Calculate task completion percentage
    const taskCompletionPercentage = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Log status breakdown for debugging
    console.log('[Dashboard Task Status Breakdown]', {
      totalTasks: sprintTasks.length,
      completedTasks,
      statusCounts,
      taskCompletionPercentage,
      allTaskStatuses: sprintTasks.slice(0, 20).map(t => ({
        id: t.id,
        status: (t as any).status || (t as any).taskStatus,
        normalized: ((t as any).status || (t as any).taskStatus)?.toString().toLowerCase().trim(),
        assigneeId: (t as any).assigneeId || (t as any).assignee?.id
      }))
    });
    
    // Calculate sprint progress based on user's sprints
    let completedSprints = 0;
    for (const sprint of userSprints) {
      const sprintStatus = (sprint as any).status || (sprint as any).sprintStatus;
      const normalizedSprintStatus = sprintStatus?.toString().toLowerCase().trim() || '';
      if (normalizedSprintStatus === 'completed' || normalizedSprintStatus === 'done') {
        completedSprints++;
      }
    }
    const sprintProgressValue = userSprints.length > 0 ? Math.round((completedSprints / userSprints.length) * 100) : 0;
    
    // Ensure we return valid numbers
    return {
      projectCount: totalProjects || 0,
      teamMembers: totalUsers || 0,
      sprintProgress: sprintProgressValue || 0,
      taskCompletion: taskCompletionPercentage || 0,
      criticalItems: criticalItems || 0,
      upcomingDeadlines: upcomingDeadlines || 0
    };
  }, [user, apiProjects, apiUsers, apiTasks, apiSprints, apiStories, userAssignedProjects, tasksLoading]);

  // Helpers to normalize API Project fields for charts/UI
  const getProjectProgress = (project: any): number => {
    return typeof project?.progressPercentage === 'number' ? project.progressPercentage : (project?.progress ?? 0);
  };

  const getProjectPriorityLower = (project: any): string => {
    return (project?.priority || '').toString().toLowerCase();
  };

  const getProjectStatusLower = (project: any): string => {
    return (project?.status || '').toString().toLowerCase();
  };

  const getProjectTeamSize = (project: any): number => {
    if (Array.isArray(project?.teamMembers)) return project.teamMembers.length;
    if (typeof project?.teamSize === 'number') return project.teamSize;
    return 5;
  };

  // Generate chart data from API data
  const burndownData = useMemo(() => {
    // TODO: Generate burndown data from sprint and task data
    return [
      { day: 'Day 1', planned: 100, actual: 100 },
      { day: 'Day 2', planned: 90, actual: 88 },
      { day: 'Day 3', planned: 80, actual: 75 },
      { day: 'Day 4', planned: 70, actual: 65 },
      { day: 'Day 5', planned: 60, actual: 55 }
    ];
  }, [apiSprints, apiTasks]);

  const projectStatusData = useMemo(() => {
    const projects = normalizeApiData(apiProjects);
    if (projects.length === 0) return [];
    return projects.map(project => ({
      name: project.name,
      value: getProjectProgress(project)
    }));
  }, [apiProjects]);

  const monthlyTrendData = useMemo(() => {
    // TODO: Generate trend data from historical data
    return [
      { month: 'Jan', projects: 2, tasks: 45 },
      { month: 'Feb', projects: 3, tasks: 62 },
      { month: 'Mar', projects: 4, tasks: 78 },
      { month: 'Apr', projects: 5, tasks: 95 }
    ];
  }, [apiProjects, apiTasks]);

  const teamPerformanceData = useMemo(() => {
    // TODO: Generate team performance data from user and task data
    return [
      { id: 'member-1', member: 'Team Member 1', tasks: 12, completed: 10 },
      { id: 'member-2', member: 'Team Member 2', tasks: 8, completed: 7 },
      { id: 'member-3', member: 'Team Member 3', tasks: 15, completed: 12 }
    ];
  }, [apiUsers, apiTasks]);

  const aiInsights = useMemo(() => {
    // TODO: Generate AI insights from data patterns
    return [
      {
        id: 'insight-1',
        type: 'warning',
        title: 'Project Progress Alert',
        message: 'Some projects are behind schedule',
        action: 'Review project timelines'
      }
    ];
  }, [apiProjects]);

  // Generate project-specific sprint performance data based on actual project characteristics
  const getSprintPerformanceData = (projectId: string) => {
    const project = accessibleProjects.find(p => p.id === projectId);
    
    if (projectId === 'all') {
      // Aggregate data from all accessible projects
      return [
        { name: 'Sprint 12', planned: 45, done: 42 },
        { name: 'Sprint 13', planned: 50, done: 48 },
        { name: 'Sprint 14', planned: 40, done: 35 },
        { name: 'Sprint 15', planned: 35, done: 28 }
      ];
    }

    if (!project) return [];

    // Generate data based on project characteristics
    const baseVelocity = project.teamMembers.length * 8; // Base velocity per team member
    const progressFactor = project.progress / 100;
    const priorityMultiplier = project.priority === 'critical' ? 1.2 : project.priority === 'high' ? 1.1 : 1.0;
    
    // Use project ID to create consistent "random" values
    const projectSeed = project.id.charCodeAt(project.id.length - 1);
    
    const sprints: { name: string; planned: number; done: number }[] = [];
    for (let i = 1; i <= 4; i++) {
      // Create consistent values based on project ID and sprint number
      const variation = ((projectSeed + i) % 10) / 10; // 0-0.9 variation
      const planned = Math.round(baseVelocity * priorityMultiplier * (0.8 + variation * 0.4));
      const done = Math.round(planned * (0.7 + progressFactor * 0.3) * (0.8 + variation * 0.4));
      sprints.push({
        name: `Sprint ${i}`,
        planned,
        done: Math.min(done, planned)
      });
    }
    
    return sprints;
  };

  // Generate project-specific task distribution data based on project status and progress
  const getTaskDistributionData = (projectId: string) => {
    const project = accessibleProjects.find(p => p.id === projectId);
    
    if (projectId === 'all') {
      // Aggregate data from all accessible projects
      return [
        { name: 'To Do', value: 28, percentage: 19 },
        { name: 'In Progress', value: 35, percentage: 24 },
        { name: 'QA', value: 15, percentage: 10 },
        { name: 'Done', value: 67, percentage: 46 }
      ];
    }

    if (!project) return [];

    // Generate data based on project characteristics
    const totalTasks = 100;
    const progress = project.progress;
    const status = project.status;
    
    let todo, inProgress, qa, done;
    
    if (status === 'completed') {
      // Completed projects have most tasks done
      done = Math.round(totalTasks * 0.9);
      qa = Math.round(totalTasks * 0.05);
      inProgress = Math.round(totalTasks * 0.03);
      todo = totalTasks - done - qa - inProgress;
    } else if (status === 'planning') {
      // Planning projects have most tasks in todo
      todo = Math.round(totalTasks * 0.6);
      inProgress = Math.round(totalTasks * 0.2);
      qa = Math.round(totalTasks * 0.1);
      done = totalTasks - todo - inProgress - qa;
    } else if (status === 'active') {
      // Active projects have balanced distribution based on progress
      done = Math.round(totalTasks * (progress / 100) * 0.8);
      qa = Math.round(totalTasks * 0.15);
      inProgress = Math.round(totalTasks * 0.25);
      todo = totalTasks - done - qa - inProgress;
    } else {
      // Default distribution
      done = Math.round(totalTasks * 0.3);
      qa = Math.round(totalTasks * 0.15);
      inProgress = Math.round(totalTasks * 0.3);
      todo = totalTasks - done - qa - inProgress;
    }

    const total = todo + inProgress + qa + done;
    
    return [
      { 
        name: 'To Do', 
        value: todo, 
        percentage: Math.round((todo / total) * 100) 
      },
      { 
        name: 'In Progress', 
        value: inProgress, 
        percentage: Math.round((inProgress / total) * 100) 
      },
      { 
        name: 'QA', 
        value: qa, 
        percentage: Math.round((qa / total) * 100) 
      },
      { 
        name: 'Done', 
        value: done, 
        percentage: Math.round((done / total) * 100) 
      }
    ];
  };

  // Get filtered data based on selected projects
  const sprintPerformanceData = useMemo(() => 
    getSprintPerformanceData(selectedProjectForSprint), 
    [selectedProjectForSprint]
  );
  
  const taskDistributionData = useMemo(() => 
    getTaskDistributionData(selectedProjectForTasks), 
    [selectedProjectForTasks]
  );

  // Reset filters
  const resetFilters = () => {
    setSelectedProjectForSprint('all');
    setSelectedProjectForTasks('all');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedProjectForSprint !== 'all' || selectedProjectForTasks !== 'all';

  // Get project-specific chart information
  const getSprintChartInfo = () => {
    if (selectedProjectForSprint === 'all') {
      return {
        title: 'Sprint Performance',
        description: 'Planned vs Done comparison across all projects',
        subtitle: 'Aggregated view of all accessible projects'
      };
    }
    
    const project = accessibleProjects.find(p => p.id === selectedProjectForSprint);
    if (!project) return { title: 'Sprint Performance', description: 'Planned vs Done comparison', subtitle: '' };
    
    return {
      title: `Sprint Performance - ${project.name}`,
      description: `Planned vs Done comparison for ${project.name}`,
      subtitle: `${project.status} • ${project.progress}% complete • ${project.teamMembers.length} team members`
    };
  };

  const getTaskChartInfo = () => {
    if (selectedProjectForTasks === 'all') {
      return {
        title: 'Task Distribution',
        description: 'Current sprint task breakdown across all projects',
        subtitle: 'Aggregated view of all accessible projects'
      };
    }
    
    const project = accessibleProjects.find(p => p.id === selectedProjectForTasks);
    if (!project) return { title: 'Task Distribution', description: 'Current sprint task breakdown', subtitle: '' };
    
    return {
      title: `Task Distribution - ${project.name}`,
      description: `Current sprint task breakdown for ${project.name}`,
      subtitle: `${project.status} • ${project.progress}% complete • ${project.priority} priority`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pieColors = ['#10B981', '#06B6D4', '#F59E0B', '#EF4444'];

  if (!user) {
    return null;
  }

  const firstName = user.name.split(' ')[0];
  const underperformingMembers = teamPerformanceData.filter(member => member.performance === 'needs_attention');

  // Show loading animation until all APIs are fetched
  if (isLoadingAny) {
    return <LoadingSpinner message="Loading Dashboard..." fullScreen />;
  }

  // If metrics is null but APIs are loaded, show a fallback
  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-semibold">Unable to load metrics</h2>
          <p className="text-muted-foreground">Please refresh the page or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fadeIn">
      {/* Header with AI Status */}
      <div className="flex items-center justify-between animate-slideDown">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {firstName}!
            </h1>
            <div className="flex items-center space-x-1 text-green-600 animate-pulse">
              <Brain className="w-5 h-5" />
              <span className="text-sm font-medium">AI Active</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-muted-foreground">
            Here's your project overview for today.
          </p>
        </div>
        
      </div>

      {/* Metrics Cards - Key Metrics First */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
          onClick={() => navigate('/projects')}
          title="View all projects"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.projectCount}</div>
            <p className="text-xs text-blue-700">Total projects</p>
            <Progress value={metrics.projectCount > 0 ? 100 : 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
          onClick={() => navigate('/todo-list')}
          title="View my tasks"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{metrics.taskCompletion}%</div>
            <p className="text-xs text-green-700">Task completion rate</p>
            <Progress value={metrics.taskCompletion} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
          style={{ animationDelay: '0.3s' }}
          onClick={() => hasPermission('view_team') && navigate('/team-allocation')}
          title={hasPermission('view_team') ? "View team allocation" : "Team members"}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.teamMembers}</div>
            <p className="text-xs text-purple-700">Total users</p>
            <Progress value={100} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
          style={{ animationDelay: '0.4s' }}
          onClick={() => navigate('/scrum')}
          title="View sprint management"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Progress</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.sprintProgress}%</div>
            <div className="flex items-center text-xs text-orange-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Completed sprints
            </div>
            <Progress value={metrics.sprintProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* User Tasks & Pending Work - Hidden for admin users */}
      {user.role !== 'admin' && (
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <UserTasks 
            userId={user.id} 
            userRole={user.role} 
            userName={user.name} 
          />
        </div>
      )}

      {/* AI Insights Panel */}
      <Card className="bg-gradient-to-br from-green-50 to-cyan-50 border-green-200 hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span>AI Insights</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {aiInsights.length} new
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/ai-insights')}
              title="View all AI insights"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            AI-powered recommendations for your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={insight.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fadeInUp" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                <div className="flex-shrink-0">
                  {insight.priority === 'positive' ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  ) : (
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => navigate('/ai-insights')}
                    title="View detailed AI insights"
                  >
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analytics */}
      {hasPermission('view_analytics') && (
        <>
          {/* Filter Status Bar */}
          {hasActiveFilters && (
            <Card className="bg-blue-50 border-blue-200 animate-slideDown">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Active Filters:</span>
                    {selectedProjectForSprint !== 'all' && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        Sprint: {accessibleProjects.find(p => p.id === selectedProjectForSprint)?.name}
                      </Badge>
                    )}
                    {selectedProjectForTasks !== 'all' && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                        Tasks: {accessibleProjects.find(p => p.id === selectedProjectForTasks)?.name}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sprint Performance Chart */}
          <Card className="bg-pastel-yellow hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span>{getSprintChartInfo().title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedProjectForSprint} onValueChange={setSelectedProjectForSprint}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {accessibleProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                {getSprintChartInfo().description}
              </CardDescription>
              {getSprintChartInfo().subtitle && (
                <div className="mt-1 text-xs text-yellow-700 font-medium">
                  {getSprintChartInfo().subtitle}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sprintPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px' 
                    }} 
                  />
                  <Bar dataKey="planned" fill="#06B6D4" name="Planned" />
                  <Bar dataKey="done" fill="#10B981" name="Done" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card className="bg-pastel-cyan hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-cyan-600" />
                  <span>{getTaskChartInfo().title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedProjectForTasks} onValueChange={setSelectedProjectForTasks}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {accessibleProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                {getTaskChartInfo().description}
              </CardDescription>
              {getTaskChartInfo().subtitle && (
                <div className="mt-1 text-xs text-cyan-700 font-medium">
                  {getTaskChartInfo().subtitle}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </div>
        </>
      )}

      {/* Recent Projects */}
      <Card className="hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Projects</span>
            {hasPermission('view_projects') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/projects')}
                title="View all projects"
              >
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            {user.role === 'admin' || user.role === 'manager' || user.role === 'qa'
              ? 'All active projects' 
              : 'Your assigned projects'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userAssignedProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No projects assigned to you yet.</p>
              </div>
            ) : (
              userAssignedProjects.slice(0, 3).map((project, index) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50/50 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fadeInUp"
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                  onClick={() => {
                    try { sessionStorage.setItem('openProjectId', project.id); } catch {}
                    navigate('/projects?open=' + encodeURIComponent(project.id));
                  }}
                  title="Open project"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{Array.isArray((project as any).teamMembers) ? (project as any).teamMembers.length : 0} members</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {new Date(project.endDate).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-sm font-medium">{project.progress}%</div>
                    <Progress value={project.progress} className="w-20" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Alerts - Only for Managers/Admins */}
      {(user.role === 'admin' || user.role === 'manager' || user.role === 'qa') && underperformingMembers.length > 0 && (
        <Card className="border-orange-200 hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Team Performance Alerts</span>
                <Badge variant="destructive">{underperformingMembers.length} need attention</Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Team members requiring performance improvement support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {underperformingMembers.map((member, index) => (
                <Card key={member.id} className="p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-fadeInUp" style={{ animationDelay: `${0.9 + index * 0.1}s` }}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{member.name}</h4>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                        <Badge variant="destructive">{member.taskCompletion}/100</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>Task completion: {member.taskCompletion}% (target: 70%)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span>Missed 8/12 deadlines (target: &lt;20%)</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Tasks: ✓2 →5 !3</span>
                        <span>Last: 3 days ago</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate('/team-allocation')}
                          title="Go to team management"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Schedule 1-on-1
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => navigate('/reports')}
                          title="View team reports"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Brain className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-700">Recommended: Schedule 1-on-1 meeting</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
              <Button 
                variant="outline"
                onClick={() => navigate('/team-allocation')}
                title="Go to team management"
              >
                <Users className="w-4 h-4 mr-1" />
                Schedule Team Review
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/reports')}
                title="Generate team reports"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Generate Report
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/team-allocation')}
                title="Access training resources"
              >
                <Coffee className="w-4 h-4 mr-1" />
                Training
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200 hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.9s' }}>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hasPermission('manage_projects') && (
              <Button
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: '1s' }}
                onClick={() => navigate('/projects?create=true')}
                title="Create New Project"
              >
                <FolderKanban className="w-6 h-6" />
                <span>Create Project</span>
              </Button>
            )}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '1.1s' }}
              onClick={() => navigate('/scrum?sprint-management=true')}
              title="View sprints"
            >
              <Target className="w-6 h-6" />
              <span>View Sprints</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: '1.2s' }}
              onClick={() => navigate('/todo-list')}
              title="My assigned tasks"
            >
              <CheckCircle className="w-6 h-6" />
              <span>My Tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Error Alert */}
      {(projectsError || usersError || departmentsError || domainsError || epicsError || releasesError || sprintsError || storiesError || tasksError) && (
        <Alert className="border-red-200 bg-red-50 animate-slideInLeft">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>API Connection Issue:</strong> Unable to connect to some backend APIs. 
            {projectsError && ` Projects API: ${projectsError.message}`}
            {usersError && ` Users API: ${usersError.message}`}
            {departmentsError && ` Departments API: ${departmentsError.message}`}
            {domainsError && ` Domains API: ${domainsError.message}`}
            {epicsError && ` Epics API: ${epicsError.message}`}
            {releasesError && ` Releases API: ${releasesError.message}`}
            {sprintsError && ` Sprints API: ${sprintsError.message}`}
            {storiesError && ` Stories API: ${storiesError.message}`}
            {tasksError && ` Tasks API: ${tasksError.message}`}
            <br />
            <div className="mt-2 text-sm">
              <strong>Possible Solutions:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Ensure your backend API server is running on http://localhost:8080</li>
                <li>Check if the API requires authentication (401 error indicates auth required)</li>
                <li>Verify the API endpoints are accessible without authentication</li>
                <li>Check browser console for detailed error information</li>
              </ul>
              <span className="text-xs text-gray-600 mt-2 block">
                The application is currently using mock data as a fallback.
              </span>
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Retrying API connection...');
                    refetchProjects();
                    refetchUsers();
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Retry Connection
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;