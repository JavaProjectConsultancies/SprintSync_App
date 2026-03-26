import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useRoleSwitcher } from '../contexts/RoleSwitcherContext';
import RoleSwitcherDropdown from './RoleSwitcherDropdown';
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
  Bar,
  Legend
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
  User,
  BookOpen,
  Zap,
  Coffee,
  Eye,
  Filter,
  X,
  UserPlus,
  ListTodo,
  Bug,
  Gauge,
  ShieldCheck
} from 'lucide-react';
// Removed mock data imports - using API data only
import UserTasks from './UserTasks';
import { useProjects, useUsers, useDepartments, useDomains, useEpics, useReleases, useSprints, useStories, useTasks, useAllSprints, useAllStories, useAllTasks, useIssuesByAssignee } from '../hooks/api';
import { apiClient } from '../services/api/client';
import { prefetchProjects } from '../hooks/api/useProjects';
import { prefetchSprints } from '../hooks/api/useSprints';
import { prefetchStories } from '../hooks/api/useStories';
import { prefetchTasks } from '../hooks/api/useTasks';
import LoadingSpinner from './LoadingSpinner';
import projectsGif from '../assets/projects.gif';
import tasksCompletedIconGif from '../assets/tasks_completed_icon.gif';
import userGif from '../assets/user.gif';
import sprintCardGif from '../assets/sprintcard.gif';
import performanceGif from '../assets/performance.gif.gif';
import taskChartGif from '../assets/taskchart.gif.gif';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, canAccessProject } = useAuth();
  const { activeRole, projectRoles } = useRoleSwitcher();

  // Use activeRole for filtering data when role is switched
  // Admin, master_admin and support_and_implementation always stay as their roles (they see everything relevant to their level), others use the activeRole from context
  const effectiveRole: string = (user?.role === 'admin' || user?.role === 'master_admin' || user?.role === 'qa_manager' || user?.role === 'support_and_implementation' || user?.role === 'qa_developer') ? user.role : activeRole;

  // API authentication is now handled by AuthContext
  // No need for demo auth setup

  // Prefetch ALL entities in parallel when Dashboard mounts (for dramatically faster loading)
  useEffect(() => {
    if (user?.id) {
      // Prefetch all entities in parallel - single network waterfall
      Promise.all([
        prefetchProjects(user.id),
        prefetchSprints(user.id),
        prefetchStories(user.id),
        prefetchTasks(user.id),
        // Users, Departments, Domains, Epics, Releases don't have prefetch yet
        // but their hooks will fetch normally - can be added later for further optimization
      ]).catch(() => {
        // Silently fail - individual hooks will fetch if prefetch fails
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
  const { data: apiSprints, loading: sprintsLoading, error: sprintsError, refetch: refetchSprints } = useAllSprints();
  const { data: apiStories, loading: storiesLoading, error: storiesError, refetch: refetchStories } = useAllStories();
  const { data: apiTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useAllTasks();
  const { data: assignedIssuesData } = useIssuesByAssignee(user?.id ?? '', undefined);

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

  // Safety timeout to prevent infinite loading
  const [forceShowDashboard, setForceShowDashboard] = useState(false);

  useEffect(() => {
    // Force show dashboard after 5 seconds even if APIs are still "loading"
    // This handles cases where API calls hang or fail silently
    const timer = setTimeout(() => {
      if (isLoadingAny) {
        console.warn('[Dashboard] Loading timed out, forcing dashboard display');
        setForceShowDashboard(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoadingAny]);

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

  // Log API data availability on initial load and when data changes
  useEffect(() => {
    const sprints = Array.isArray(apiSprints) ? apiSprints.length : ((apiSprints as any)?.content?.length || 0);
    const tasks = Array.isArray(apiTasks) ? apiTasks.length : ((apiTasks as any)?.content?.length || 0);
    const stories = Array.isArray(apiStories) ? apiStories.length : ((apiStories as any)?.content?.length || 0);
    const projects = Array.isArray(apiProjects) ? apiProjects.length : ((apiProjects as any)?.content?.length || 0);

    console.log('[Dashboard] API Data Availability:', {
      sprints: { count: sprints, loading: sprintsLoading, error: sprintsError ? String(sprintsError) : 'NO' },
      tasks: { count: tasks, loading: tasksLoading, error: tasksError ? String(tasksError) : 'NO' },
      stories: { count: stories, loading: storiesLoading, error: storiesError ? String(storiesError) : 'NO' },
      projects: { count: projects, loading: projectsLoading, error: projectsError ? String(projectsError) : 'NO' }
    });
  }, [apiSprints, apiTasks, apiStories, apiProjects, sprintsLoading, tasksLoading, storiesLoading, projectsLoading]);

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

  // Filter projects based on user permissions and effectiveRole - optimized for performance
  const accessibleProjects = useMemo(() => {
    if (!user) return [];
    const projectData = normalizeApiData(apiProjects);

    // Admins and master_admins can access all projects
    if (effectiveRole === 'admin' || effectiveRole === 'master_admin') {
      return projectData;
    }

    // Get project IDs where user is a manager (from projectRoles API)
    const managerProjectIds = new Set(
      projectRoles
        .filter(pr => pr.role?.toLowerCase() === 'manager' || pr.role?.toLowerCase() === 'qa_manager' || pr.role?.toLowerCase() === 'support_and_implementation')
        .map(pr => pr.projectId)
    );

    console.log('[Dashboard] Manager project IDs from projectRoles:', {
      userId: user.id,
      effectiveRole,
      managerProjectIds: Array.from(managerProjectIds),
      allProjectRoles: projectRoles
    });

    // Managers and Support & Implementation can access projects where they have those roles
    if (effectiveRole === 'manager' || effectiveRole === 'qa_manager' || effectiveRole === 'support_and_implementation') {
      return projectData.filter(project => {
        // Check 1: User is project owner (managerId)
        const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
        const managerIdStr = managerId ? String(managerId) : null;
        const userIdStr = user.id ? String(user.id) : null;
        if (managerIdStr === userIdStr) return true;

        // Check 2: User has role='manager' in projectRoles (from API)
        if (managerProjectIds.has(project.id)) return true;

        return false;
      });
    }

    // Developer view - only show projects where they are team members
    return projectData.filter(project => {
      // Check if user has any role in this project from projectRoles
      const hasRoleInProject = projectRoles.some(pr => pr.projectId === project.id);
      if (hasRoleInProject) return true;

      // Fallback to canAccessProject
      return canAccessProject(project.id);
    });
  }, [user, canAccessProject, apiProjects, effectiveRole, projectRoles]);

  // Filter projects for Recent Projects section - show only user's assigned projects
  const userAssignedProjects = useMemo(() => {
    if (!user) return [];
    const projectData = normalizeApiData(apiProjects);

    // Admins and master_admins see all projects
    if (effectiveRole === 'admin' || effectiveRole === 'master_admin') {
      return projectData;
    }

    // Get project IDs where user is a manager (from projectRoles API)
    const managerProjectIds = new Set(
      projectRoles
        .filter(pr => pr.role?.toLowerCase() === 'manager' || pr.role?.toLowerCase() === 'qa_manager' || pr.role?.toLowerCase() === 'support_and_implementation')
        .map(pr => pr.projectId)
    );

    // Managers and Support & Implementation see projects where they have those roles
    if (effectiveRole === 'manager' || effectiveRole === 'qa_manager' || effectiveRole === 'support_and_implementation') {
      return projectData.filter(project => {
        // Check 1: User is project owner (managerId)
        const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
        const managerIdStr = managerId ? String(managerId) : null;
        const userIdStr = user.id ? String(user.id) : null;
        if (managerIdStr === userIdStr) return true;

        // Check 2: User has role='manager' in projectRoles (from API)
        if (managerProjectIds.has(project.id)) return true;

        return false;
      });
    }

    // Developer view - filter projects where they are assigned
    return projectData.filter(project => {
      // Check if user has any role in this project from projectRoles
      const hasRoleInProject = projectRoles.some(pr => pr.projectId === project.id);
      if (hasRoleInProject) return true;

      // Fallback: check if canAccessProject allows access
      return canAccessProject(project.id);
    });
  }, [user, apiProjects, canAccessProject, effectiveRole, projectRoles]);

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

    // Check if current view is manager/admin/master_admin based on effectiveRole
    const isManagerOrAdmin = effectiveRole === 'admin' || effectiveRole === 'master_admin' || effectiveRole === 'manager' || effectiveRole === 'support_and_implementation' || effectiveRole === 'qa_manager';

    // Get project IDs where user is a manager (from projectRoles API - reliable source)
    const projectsWhereUserIsManager = new Set<string>(
      projectRoles
        .filter(pr => pr.role?.toLowerCase() === 'manager' || pr.role?.toLowerCase() === 'qa_manager' || pr.role?.toLowerCase() === 'support_and_implementation')
        .map(pr => pr.projectId)
    );
    const isProjectLevelManager = projectsWhereUserIsManager.size > 0;

    if (isProjectLevelManager) {
      console.log('[Dashboard] User is project-level manager (from projectRoles API):', {
        userId: user.id,
        systemRole: effectiveRole,
        managedProjectIds: Array.from(projectsWhereUserIsManager)
      });
    }

    // Get user's project IDs first (needed for both sprint filtering and fallback)
    // Using projectRoles from API for reliable project assignment data
    const userProjectIdsForFiltering = (effectiveRole === 'admin' || effectiveRole === 'master_admin')
      ? new Set(projects.map(p => p.id))  // Admins and master_admins see all projects
      : (effectiveRole === 'manager' || effectiveRole === 'qa_manager' || effectiveRole === 'support_and_implementation')
        ? new Set(
          projects
            .filter(project => {
              // Check 1: User is the project owner (managerId)
              const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
              const managerIdStr = managerId ? String(managerId) : null;
              const userIdStr = user.id ? String(user.id) : null;
              if (managerIdStr === userIdStr) return true;

              // Check 2: User has role='manager' in projectRoles (from API)
              if (projectsWhereUserIsManager.has(project.id)) return true;

              return false;
            })
            .map(project => project.id)
        )
        : new Set(
          // For developers: use projectRoles API to get all assigned projects
          projectRoles.map(pr => pr.projectId)
        );

    // Debug logging for manager project filtering
    if (effectiveRole === 'manager' || effectiveRole === 'support_and_implementation' || effectiveRole === 'qa_manager') {
      console.log('[Dashboard] Manager project filtering:', {
        userId: user.id,
        effectiveRole: effectiveRole,
        totalProjects: projects.length,
        managerProjects: userProjectIdsForFiltering.size,
        managerProjectIds: Array.from(userProjectIdsForFiltering).slice(0, 5)
      });
    }

    // EARLY RETURN: If manager or developer has no assigned projects, show ZERO metrics but don't return null
    // This allows the dashboard to render with an "Empty State" message instead of crashing
    if ((effectiveRole === 'manager' || effectiveRole === 'support_and_implementation' || effectiveRole === 'developer' || effectiveRole === 'qa_manager' || effectiveRole === 'qa_developer') && userProjectIdsForFiltering.size === 0) {
      console.log('[Dashboard] User has no assigned projects, returning zero metrics');
      return {
        projectCount: 0,
        teamMembers: 0,
        sprintProgress: 0,
        taskCompletion: 0,
        criticalItems: 0,
        upcomingDeadlines: 0
      };
    }

    // Filter sprints based on effectiveRole - get sprints from user's accessible projects
    // For managers: filter sprints from their projects
    // For admins: show all sprints
    // For developers: only show sprints from projects they're assigned to
    let userSprints = allSprints;
    if (effectiveRole === 'manager' || effectiveRole === 'support_and_implementation' || effectiveRole === 'qa_manager') {
      // For managers, only show sprints from projects they manage
      userSprints = allSprints.filter(sprint => {
        const sprintProjectId = (sprint as any).projectId || (sprint as any).project?.id;
        return sprintProjectId && userProjectIdsForFiltering.has(sprintProjectId);
      });
    } else if (!isManagerOrAdmin) {
      // For developers, only show sprints from projects they're assigned to
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

    if (effectiveRole === 'admin' || effectiveRole === 'master_admin' || effectiveRole === 'manager' || effectiveRole === 'support_and_implementation' || effectiveRole === 'qa_manager') {
      // Admins, master_admins, Managers, and QA Managers: Show all tasks
      // Managers should see all tasks/issues regardless of team lead constraint
      sprintTasks = allTasks.filter(task => {
        return task && task.id && typeof task.id === 'string';
      });

      if (effectiveRole === 'manager' || effectiveRole === 'support_and_implementation' || effectiveRole === 'qa_manager') {
        console.log('[Dashboard] Manager full visibility enabled - showing all tasks:', {
          userId: user.id,
          effectiveRole: effectiveRole,
          totalTasks: sprintTasks.length
        });
      }
    } else if (isProjectLevelManager) {
      // Project-level manager (e.g., developer with manager role in some projects)
      // Show all tasks from projects they manage + their own assigned tasks from other projects
      sprintTasks = allTasks.filter(task => {
        if (!task || !task.id) return false;

        // Always allow tasks assigned to user
        const assigneeId = (task as any).assigneeId || (task as any).assignee?.id || (task as any).assignee?.userId;
        if (assigneeId === user.id) return true;

        // Allow ALL tasks from projects where user is manager
        const story = allStories.find(s => s.id === ((task as any).storyId || (task as any).story?.id));
        if (story) {
          const storyProjectId = (story as any).projectId || (story as any).project?.id;
          if (storyProjectId && projectsWhereUserIsManager.has(storyProjectId)) {
            return true;
          }
        }

        return false;
      });

      console.log('[Dashboard] Project-level manager visibility:', {
        userId: user.id,
        systemRole: effectiveRole,
        managedProjects: Array.from(projectsWhereUserIsManager),
        totalTasks: sprintTasks.length
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
      effectiveRole: effectiveRole,
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

    if (effectiveRole === 'admin' || effectiveRole === 'master_admin') {
      // Admin and master_admin sees all users in the system
      totalUsers = users.length;
    } else {
      // For non-admin users, show only users from projects they can filter on (including managed projects)
      const allProjectTeamMemberIds = new Set<string>();

      projects.forEach(project => {
        if (!userProjectIdsForFiltering.has(project.id)) return;

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
        if (managerId) allProjectTeamMemberIds.add(managerId);
        if (createdById) allProjectTeamMemberIds.add(createdById);
      });

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
  }, [user, apiProjects, apiUsers, apiTasks, apiSprints, apiStories, userAssignedProjects, tasksLoading, effectiveRole, projectRoles]);

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
    const normalizedUsers = normalizeApiData(apiUsers);
    const normalizedTasks = normalizeApiData(apiTasks);

    if (normalizedUsers.length === 0) return [];

    // Identify users who are part of the projects we can see
    // For managers, this usually means project team members.
    // For now, let's include all users but focus on those with tasks in our project scope if possible.

    return normalizedUsers
      .filter(u => {
        // Simple heuristic: only show users who have at least one task in the system (to keep dashboard clean)
        // OR if admin, show everyone.
        if (effectiveRole === 'admin') return true;
        return normalizedTasks.some(t => String((t as any).assigneeId || (t as any).assignee?.id) === String(u.id));
      })
      .map(user => {
        const userTasks = normalizedTasks.filter(t => String((t as any).assigneeId || (t as any).assignee?.id) === String(user.id));
        const completedTasks = userTasks.filter(t => {
          const status = ((t as any).status || (t as any).taskStatus)?.toString().toLowerCase().trim();
          return status === 'done' || status === 'completed';
        }).length;

        return {
          id: user.id,
          member: user.name || user.email || 'Unknown',
          tasks: userTasks.length,
          completed: completedTasks,
          performance: userTasks.length > 0 && (completedTasks / userTasks.length < 0.5) ? 'needs_attention' : 'good'
        };
      })
      .sort((a, b) => b.tasks - a.tasks) // Show busiest users first
      .slice(0, 10); // Limit to top 10 for dashboard
  }, [apiUsers, apiTasks, effectiveRole]);

  // Metrics for Tasks, Bugs, Self Performance, Quality (visible to all users)
  // Quality = derived score from completion + bug resolution (no API)
  const personalOverviewMetrics = useMemo(() => {
    const allTasks = normalizeApiData(apiTasks);
    const allIssues = Array.isArray(assignedIssuesData) ? assignedIssuesData : (assignedIssuesData as any)?.content ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userId = user?.id;
    if (!userId) {
      return {
        tasks: { assigned: 0, inProgress: 0, done: 0, overdue: 0, todo: 0 },
        bugs: 0,
        bugsOpen: 0,
        bugsResolved: 0,
        selfPerformance: 0,
        qualityScore: 0,
        insights: [] as string[]
      };
    }

    const userTasks = allTasks.filter((t: any) => String(t.assigneeId || t.assignee?.id) === String(userId));
    const tasksAssigned = userTasks.length;
    const tasksInProgress = userTasks.filter((t: any) => {
      const s = (t.status || t.taskStatus || '').toString().toLowerCase();
      return s === 'in_progress' || s === 'in progress' || s === 'qa_review';
    }).length;
    const tasksDone = userTasks.filter((t: any) => {
      const s = (t.status || t.taskStatus || '').toString().toLowerCase();
      return s === 'done' || s === 'completed';
    }).length;
    const tasksTodo = userTasks.filter((t: any) => {
      const s = (t.status || t.taskStatus || '').toString().toLowerCase();
      return s === 'to_do' || s === 'todo' || s === 'backlog' || s === '';
    }).length;
    const tasksOverdue = userTasks.filter((t: any) => {
      const due = t.dueDate || t.due_date;
      if (!due) return false;
      const d = new Date(due);
      d.setHours(0, 0, 0, 0);
      const status = (t.status || t.taskStatus || '').toString().toLowerCase();
      const isDone = status === 'done' || status === 'completed';
      return d < today && !isDone;
    }).length;

    const isBug = (issue: any) => {
      const labels = issue?.labels ?? [];
      const labelStr = Array.isArray(labels) ? labels.join(' ').toLowerCase() : '';
      return labelStr.includes('bug') || labelStr.includes('defect');
    };
    const userBugs = allIssues.filter((i: any) => isBug(i));
    const bugsOpen = userBugs.filter((i: any) => {
      const s = (i.status || '').toString().toLowerCase();
      return s !== 'done' && s !== 'completed' && s !== 'closed';
    }).length;
    const bugsResolved = userBugs.length - bugsOpen;
    const bugsCount = userBugs.length;

    const selfPerformancePct = tasksAssigned > 0 ? Math.round((tasksDone / tasksAssigned) * 100) : 0;
    const bugResolutionPct = bugsCount > 0 ? Math.round((bugsResolved / bugsCount) * 100) : 100;
    const qualityScore = Math.round((selfPerformancePct * 0.6 + bugResolutionPct * 0.4));

    const insights: string[] = [];
    if (tasksOverdue > 0) insights.push(`${tasksOverdue} overdue task${tasksOverdue > 1 ? 's' : ''} need${tasksOverdue === 1 ? 's' : ''} attention`);
    if (tasksTodo > 0 && tasksInProgress === 0) insights.push('Start a task to build momentum');
    if (tasksInProgress > 2) insights.push('Focus on completing 1–2 tasks before picking up more');
    if (selfPerformancePct >= 80 && tasksAssigned > 0) insights.push('Great progress — keep it up');
    else if (tasksAssigned > 0 && selfPerformancePct < 50) insights.push('Complete 1–2 tasks to improve your completion rate');
    if (bugsOpen > 0) insights.push(`${bugsOpen} bug${bugsOpen > 1 ? 's' : ''} to fix — prioritize by severity`);
    if (tasksAssigned === 0 && bugsCount === 0) insights.push('No tasks or bugs assigned — check with your team lead');

    return {
      tasks: { assigned: tasksAssigned, inProgress: tasksInProgress, done: tasksDone, overdue: tasksOverdue, todo: tasksTodo },
      bugs: bugsCount,
      bugsOpen,
      bugsResolved,
      selfPerformance: selfPerformancePct,
      qualityScore,
      insights
    };
  }, [user?.id, apiTasks, assignedIssuesData]);

  const CircularProgress: React.FC<{
    value: number;
    size?: number;
    strokeWidth?: number;
    gradientFrom: string;
    gradientTo: string;
    label: string;
    icon: React.ReactNode;
    iconBg?: string;
  }> = ({ value, size = 64, strokeWidth = 6, gradientFrom, gradientTo, label, icon, iconBg = 'bg-slate-100' }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const id = `grad-${label.replace(/\s/g, '-')}-${value}-${size}`;
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative group" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="rotate-[-90deg] drop-shadow-sm">
            <defs>
              <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={`url(#${id})`}
              strokeWidth={strokeWidth}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-800 drop-shadow-sm">{value}%</span>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${iconBg} text-xs font-semibold text-slate-700`}>
          {icon}
          {label}
        </div>
      </div>
    );
  };

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

  // Generate project-specific sprint performance data based on actual sprint data
  const getSprintPerformanceData = (projectId: string) => {
    // Normalize all API data first
    const normalizedSprints = normalizeApiData(apiSprints);
    const normalizedTasks = normalizeApiData(apiTasks);
    const normalizedStories = normalizeApiData(apiStories);
    const normalizedProjects = normalizeApiData(apiProjects);

    // Debug logging
    console.log('[Dashboard] getSprintPerformanceData called:', {
      requestedProjectId: projectId,
      normalizedDataCounts: {
        sprints: normalizedSprints?.length || 0,
        tasks: normalizedTasks?.length || 0,
        stories: normalizedStories?.length || 0,
        projects: normalizedProjects?.length || 0
      },
      userAssignedProjects: userAssignedProjects.length,
      apiSprints: Array.isArray(apiSprints) ? apiSprints.length : ((apiSprints as any)?.content?.length || 0),
      apiTasks: Array.isArray(apiTasks) ? apiTasks.length : ((apiTasks as any)?.content?.length || 0),
      apiStories: Array.isArray(apiStories) ? apiStories.length : ((apiStories as any)?.content?.length || 0)
    });

    // Add null/undefined checks for API data
    if (!normalizedSprints || normalizedSprints.length === 0) {
      console.log('[getSprintPerformanceData] No sprints found, returning empty data');
      return [
        { name: 'Sprint 1', planned: 0, done: 0 },
        { name: 'Sprint 2', planned: 0, done: 0 },
        { name: 'Sprint 3', planned: 0, done: 0 },
        { name: 'Sprint 4', planned: 0, done: 0 }
      ];
    }

    let sprints: any[] = [];

    if (projectId === 'all') {
      // Get all sprints from all accessible projects
      sprints = normalizedSprints.filter(sprint => {
        return userAssignedProjects.some(p => p.id === sprint.projectId);
      });
    } else {
      // Get sprints for specific project
      sprints = normalizedSprints.filter(sprint => sprint.projectId === projectId);
    }

    console.log('[getSprintPerformanceData] Filtered sprints:', {
      projectId: projectId,
      filteredCount: sprints.length,
      filteredSprints: sprints.slice(0, 5).map(s => ({
        id: s.id,
        name: s.name,
        projectId: s.projectId,
        status: s.status
      }))
    });

    if (sprints.length === 0) {
      // Return empty data if no sprints found
      return [
        { name: 'Sprint 1', planned: 0, done: 0 },
        { name: 'Sprint 2', planned: 0, done: 0 },
        { name: 'Sprint 3', planned: 0, done: 0 },
        { name: 'Sprint 4', planned: 0, done: 0 }
      ];
    }

    // Sort sprints by name and get last 4
    const sortedSprints = sprints.sort((a, b) => {
      const aNum = parseInt(a.name?.match(/\d+/)?.[0] || '0', 10);
      const bNum = parseInt(b.name?.match(/\d+/)?.[0] || '0', 10);
      return aNum - bNum;
    }).slice(-4);

    // Map sprint data to chart format
    return sortedSprints.map((sprint, index) => {
      // Get stories for this sprint
      const sprintStories = normalizedStories.filter(story => story.sprintId === sprint.id);

      // Calculate planned vs done based on STORY POINTS
      const plannedPoints = sprintStories.reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      const donePoints = sprintStories
        .filter(story => (story.status || '').toString().toUpperCase() === 'DONE')
        .reduce((sum, story) => sum + (story.storyPoints || 0), 0);

      // Default to some visually visible value if 0 (optional, but requested graph "properly" might imply not flatlining if data is missing but planned exists)
      // If planned points is 0, we can fallback to task count logic OR just show 0 to be accurate.
      // Based on user request "graph properly... based on yesterday's logging", likely implies accurate SP data exists.

      const sprintResult = {
        name: sprint.name || `Sprint ${index + 1}`,
        planned: plannedPoints,
        done: donePoints
      };

      console.log('[getSprintPerformanceData] Sprint calculation (Story Points):', {
        sprintId: sprint.id,
        sprintName: sprint.name,
        sprintData: sprintResult,
        storyCount: sprintStories.length,
        doneStoryCount: sprintStories.filter(s => (s.status || '').toString().toUpperCase() === 'DONE').length,
        velocityPoints: sprint.velocityPoints
      });

      return sprintResult;
    });
  };

  // Generate project-specific task distribution data based on actual task data
  const getTaskDistributionData = (projectId: string) => {
    // Normalize all API data first
    const normalizedTasks = normalizeApiData(apiTasks);
    const normalizedStories = normalizeApiData(apiStories);
    const normalizedProjects = normalizeApiData(apiProjects);

    console.log('[getTaskDistributionData] called:', {
      requestedProjectId: projectId,
      normalizedDataCounts: {
        tasks: normalizedTasks?.length || 0,
        stories: normalizedStories?.length || 0,
        projects: normalizedProjects?.length || 0
      },
      userAssignedProjects: userAssignedProjects.length
    });

    // Add null/undefined checks for API data
    if (!normalizedTasks || normalizedTasks.length === 0) {
      console.log('[getTaskDistributionData] No tasks found, returning zero data');
      return [
        { name: 'To Do', value: 0, percentage: 0 },
        { name: 'In Progress', value: 0, percentage: 0 },
        { name: 'QA', value: 0, percentage: 0 },
        { name: 'Done', value: 0, percentage: 0 }
      ];
    }

    let projectTasks: any[] = [];

    if (projectId === 'all') {
      // Get all tasks from accessible projects
      projectTasks = normalizedTasks.filter(task => {
        const story = normalizedStories.find(s => s.id === task.storyId);
        const project = normalizedProjects.find(p => p.id === story?.projectId);
        return userAssignedProjects.some(up => up.id === project?.id);
      });
    } else {
      // Get tasks for specific project
      projectTasks = normalizedTasks.filter(task => {
        const story = normalizedStories.find(s => s.id === task.storyId);
        return story?.projectId === projectId;
      });
    }

    console.log('[getTaskDistributionData] Filtered tasks:', {
      projectId: projectId,
      filteredCount: projectTasks.length,
      sampleTasks: projectTasks.slice(0, 3).map(t => ({
        id: t.id,
        status: t.status,
        storyId: t.storyId
      }))
    });

    // Count tasks by status
    const statusCounts: Record<string, number> = {
      'To Do': 0,
      'In Progress': 0,
      'QA': 0,
      'Done': 0
    };

    for (const task of projectTasks) {
      const status = (task.status || '').toString().toUpperCase().trim();

      if (status === 'TO_DO' || status === 'TODO') {
        statusCounts['To Do']++;
      } else if (status === 'IN_PROGRESS' || status === 'INPROGRESS') {
        statusCounts['In Progress']++;
      } else if (status === 'QA_REVIEW' || status === 'QA' || status === 'QAREVIEW') {
        statusCounts['QA']++;
      } else if (status === 'DONE' || status === 'COMPLETED') {
        statusCounts['Done']++;
      } else {
        // Default unknown statuses to "To Do"
        console.log('[getTaskDistributionData] Unknown status for task:', {
          taskId: task.id,
          rawStatus: task.status,
          normalizedStatus: status
        });
        statusCounts['To Do']++;
      }
    }

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    console.log('[getTaskDistributionData] Status counts:', {
      projectId: projectId,
      statusCounts,
      total
    });

    if (total === 0) {
      // Return default distribution if no tasks
      return [
        { name: 'To Do', value: 0, percentage: 0 },
        { name: 'In Progress', value: 0, percentage: 0 },
        { name: 'QA', value: 0, percentage: 0 },
        { name: 'Done', value: 0, percentage: 0 }
      ];
    }

    return [
      {
        name: 'To Do',
        value: statusCounts['To Do'],
        percentage: Math.round((statusCounts['To Do'] / total) * 100)
      },
      {
        name: 'In Progress',
        value: statusCounts['In Progress'],
        percentage: Math.round((statusCounts['In Progress'] / total) * 100)
      },
      {
        name: 'QA',
        value: statusCounts['QA'],
        percentage: Math.round((statusCounts['QA'] / total) * 100)
      },
      {
        name: 'Done',
        value: statusCounts['Done'],
        percentage: Math.round((statusCounts['Done'] / total) * 100)
      }
    ];
  };

  // Get filtered data based on selected projects
  const sprintPerformanceData = useMemo(() => {
    const data = getSprintPerformanceData(selectedProjectForSprint);

    // Detailed logging for sprint performance data
    console.log('[Dashboard] Sprint Performance Data:', {
      selectedProject: selectedProjectForSprint,
      chartData: data,
      hasData: data.some(d => d.planned > 0),
      sprintCount: data.length,
      totalPlanned: data.reduce((sum, d) => sum + d.planned, 0),
      totalDone: data.reduce((sum, d) => sum + d.done, 0),
      apiDataAvailable: {
        sprints: Array.isArray(apiSprints) ? apiSprints.length : ((apiSprints as any)?.content?.length || 0),
        tasks: Array.isArray(apiTasks) ? apiTasks.length : ((apiTasks as any)?.content?.length || 0),
        stories: Array.isArray(apiStories) ? apiStories.length : ((apiStories as any)?.content?.length || 0),
        projects: Array.isArray(apiProjects) ? apiProjects.length : ((apiProjects as any)?.content?.length || 0)
      }
    });

    // If no data and we have a project selected, show fallback data
    if (data.every(d => d.planned === 0) && selectedProjectForSprint !== 'all') {
      console.log('[Dashboard] Using fallback sprint performance data (no real data available)');
      return [
        { name: 'Sprint 1', planned: 5, done: 3 },
        { name: 'Sprint 2', planned: 7, done: 5 },
        { name: 'Sprint 3', planned: 6, done: 4 },
        { name: 'Sprint 4', planned: 8, done: 6 }
      ];
    }
    return data;
  }, [selectedProjectForSprint, apiSprints, apiTasks, apiStories, apiProjects, userAssignedProjects]);

  const taskDistributionData = useMemo(() => {
    const data = getTaskDistributionData(selectedProjectForTasks);

    // Detailed logging for task distribution data
    console.log('[Dashboard] Task Distribution Data:', {
      selectedProject: selectedProjectForTasks,
      chartData: data,
      hasData: data.some(d => d.value > 0),
      statusBreakdown: {
        todo: data.find(d => d.name === 'To Do')?.value || 0,
        inProgress: data.find(d => d.name === 'In Progress')?.value || 0,
        qa: data.find(d => d.name === 'QA')?.value || 0,
        done: data.find(d => d.name === 'Done')?.value || 0,
        total: data.reduce((sum, d) => sum + d.value, 0)
      },
      apiDataAvailable: {
        tasks: Array.isArray(apiTasks) ? apiTasks.length : ((apiTasks as any)?.content?.length || 0),
        stories: Array.isArray(apiStories) ? apiStories.length : ((apiStories as any)?.content?.length || 0),
        projects: Array.isArray(apiProjects) ? apiProjects.length : ((apiProjects as any)?.content?.length || 0)
      }
    });

    // If no data and we have a project selected, show fallback data
    if (data.every(d => d.value === 0) && selectedProjectForTasks !== 'all') {
      console.log('[Dashboard] Using fallback task distribution data (no real data available)');
      return [
        { name: 'To Do', value: 5, percentage: 20 },
        { name: 'In Progress', value: 8, percentage: 32 },
        { name: 'QA', value: 7, percentage: 28 },
        { name: 'Done', value: 5, percentage: 20 }
      ];
    }
    return data;
  }, [selectedProjectForTasks, apiTasks, apiStories, apiProjects, userAssignedProjects]);

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

  // Derived status based on dates and sprint completion - aligned with ProjectsPage.tsx
  const computeDerivedStatus = (project: any): string => {
    const now = new Date();
    const start = project.startDate ? new Date(project.startDate) : null;
    const end = project.endDate ? new Date(project.endDate) : null;

    if (start && now < start) return 'planning';
    if (start && end && now >= start && now <= end) return 'active';

    // After end date: decide between completed vs overdue using sprint completion
    if (end && now > end) {
      const normalizedSprints = normalizeApiData(apiSprints);
      const projectSprints = normalizedSprints.filter(s => {
        const sprintProjectId = (s as any).projectId || (s as any).project?.id;
        return String(sprintProjectId) === String(project.id);
      });

      if (projectSprints.length === 0) return 'overdue';

      const allCompleted = projectSprints.every((s: any) => {
        const st = (s.status || '').toString().toLowerCase();
        return st === 'completed' || st === 'closed' || st === 'done';
      });
      return allCompleted ? 'completed' : 'overdue';
    }

    // Fallback
    return (project.status || 'planning').toString().toLowerCase();
  };

  // Progress calculation based on sprint completion - aligned with ProjectsPage.tsx
  const calculateProjectProgress = (project: any): number => {
    const normalizedSprints = normalizeApiData(apiSprints);
    const projectSprints = normalizedSprints.filter(s => {
      const sprintProjectId = (s as any).projectId || (s as any).project?.id;
      return String(sprintProjectId) === String(project.id);
    });

    if (projectSprints.length === 0) return project.progress || 0;

    const completed = projectSprints.filter((s: any) => {
      const st = (s.status || '').toString().toLowerCase();
      return st === 'completed' || st === 'closed' || st === 'done';
    }).length;

    return Math.round((completed / projectSprints.length) * 100);
  };

  const getStatusColor = (status: string) => {
    const s = (status || '').toString().toLowerCase().trim();
    switch (s) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'planning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
      case 'onhold':
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
      case 'done':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
      case 'canceled':
      case 'overdue':
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

  const pieColors = ['#EF4444', '#06B6D4', '#F59E0B', '#10B981'];

  if (!user) {
    return null;
  }

  const firstName = user.name.split(' ')[0];

  // Show loading animation until all APIs are fetched, unless forced
  if (isLoadingAny && !forceShowDashboard) {
    return <LoadingSpinner message="Loading Dashboard..." fullScreen />;
  }

  // If metrics is null but APIs are loaded, use default metrics with zeros
  const displayMetrics = metrics || {
    projectCount: 0,
    teamMembers: 0,
    sprintProgress: 0,
    taskCompletion: 0,
    criticalItems: 0,
    upcomingDeadlines: 0
  };

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

        {/* Role Switcher */}
        <RoleSwitcherDropdown />

      </div>

      {/* Empty State for Users with No Projects */}
      {!isLoadingAny && metrics?.projectCount === 0 && (effectiveRole === 'developer' || effectiveRole === 'manager' || effectiveRole === 'qa_developer' || effectiveRole === 'qa_manager') && (
        <div className="mb-8 p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Welcome to SprintSync!</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-6">
            You don't have any projects assigned yet.
            {effectiveRole === 'manager'
              ? ' Create your first project to get started.'
              : ' Please ask a manager to assign you to a project.'}
          </p>
          {effectiveRole === 'manager' && (
            <Button onClick={() => navigate('/projects')} className="bg-green-600 hover:bg-green-700">
              Create Project
            </Button>
          )}
        </div>
      )}

      {/* Metrics Cards - Key Metrics First */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeInUp"
          style={{ animationDelay: '0.1s' }}
          onClick={() => navigate('/projects')}
          title="View all projects"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <img src={projectsGif} alt="Active Projects" className="h-12 w-12 object-contain" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{displayMetrics.projectCount}</div>
            <p className="text-xs text-blue-700">Total projects</p>
            <Progress value={displayMetrics.projectCount > 0 ? 100 : 0} className="mt-2 h-1.5" />
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
            <img src={tasksCompletedIconGif} alt="Tasks Complete" className="h-12 w-12 object-contain" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{displayMetrics.taskCompletion}%</div>
            <p className="text-xs text-green-700">Task completion rate</p>
            <Progress value={displayMetrics.taskCompletion} className="mt-2 h-1.5" />
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
            <img src={userGif} alt="Total Users" className="h-12 w-12 object-contain" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{displayMetrics.teamMembers}</div>
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
            <img src={sprintCardGif} alt="Sprint Progress" className="h-12 w-12 object-contain" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{displayMetrics.sprintProgress}%</div>
            <div className="flex items-center text-xs text-orange-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              Completed sprints
            </div>
            <Progress value={displayMetrics.sprintProgress} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Personal Overview: Tasks, Bugs, Self Performance, Quality — Colorful radial view */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-violet-50/50 to-fuchsia-50 shadow-xl shadow-indigo-200/40 animate-fadeInUp"
        style={{ animationDelay: '0.25s' }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-violet-300/30 via-fuchsia-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/25 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Central composite score */}
            <div className="flex items-center gap-6 shrink-0">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-300/50 flex items-center justify-center ring-4 ring-white/50">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white drop-shadow-md">
                      {personalOverviewMetrics.qualityScore}
                    </span>
                    <div className="text-[10px] font-semibold text-indigo-100 uppercase tracking-wider">Health</div>
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Zap className="w-4 h-4 text-amber-900" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">My Work Overview</h3>
                <p className="text-sm text-slate-600 mt-0.5 max-w-[200px] font-medium">Tasks · Bugs · Performance · Quality</p>
              </div>
            </div>

            {/* 4 radial progress rings with vibrant gradients */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 lg:gap-8">
              <button type="button" onClick={() => navigate('/todo-list')} className="group p-3 rounded-2xl bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/50 transition-all duration-300 hover:scale-105">
                <CircularProgress
                  value={personalOverviewMetrics.tasks.assigned > 0 ? Math.round((personalOverviewMetrics.tasks.done / personalOverviewMetrics.tasks.assigned) * 100) : 0}
                  size={76}
                  strokeWidth={6}
                  gradientFrom="#3b82f6"
                  gradientTo="#06b6d4"
                  label={`${personalOverviewMetrics.tasks.assigned} tasks`}
                  icon={<ListTodo className="w-4 h-4 text-blue-600" />}
                  iconBg="bg-blue-100"
                />
                {personalOverviewMetrics.tasks.overdue > 0 && (
                  <div className="text-[10px] text-rose-600 font-semibold mt-1 text-center">{personalOverviewMetrics.tasks.overdue} overdue</div>
                )}
              </button>

              <button type="button" onClick={() => navigate('/scrum')} className="group p-3 rounded-2xl bg-rose-50/80 hover:bg-rose-100/90 border border-rose-200/50 transition-all duration-300 hover:scale-105">
                <CircularProgress
                  value={personalOverviewMetrics.bugs > 0 ? Math.round((personalOverviewMetrics.bugsResolved / personalOverviewMetrics.bugs) * 100) : 100}
                  size={76}
                  strokeWidth={6}
                  gradientFrom="#f43f5e"
                  gradientTo="#ec4899"
                  label={`${personalOverviewMetrics.bugs} bugs`}
                  icon={<Bug className="w-4 h-4 text-rose-600" />}
                  iconBg="bg-rose-100"
                />
                {personalOverviewMetrics.bugsOpen > 0 && (
                  <div className="text-[10px] text-amber-600 font-semibold mt-1 text-center">{personalOverviewMetrics.bugsOpen} open</div>
                )}
              </button>

              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/50">
                <CircularProgress
                  value={personalOverviewMetrics.selfPerformance}
                  size={76}
                  strokeWidth={6}
                  gradientFrom="#f59e0b"
                  gradientTo="#eab308"
                  label="Performance"
                  icon={<Gauge className="w-4 h-4 text-amber-600" />}
                  iconBg="bg-amber-100"
                />
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/50">
                <CircularProgress
                  value={personalOverviewMetrics.qualityScore}
                  size={76}
                  strokeWidth={6}
                  gradientFrom="#10b981"
                  gradientTo="#14b8a6"
                  label="Quality"
                  icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  iconBg="bg-emerald-100"
                />
              </div>
            </div>
          </div>

          {/* Actionable insights — colorful pills */}
          {personalOverviewMetrics.insights.length > 0 && (
            <div className="mt-5 pt-4 border-t-2 border-indigo-200/40">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Tips:</span>
                {personalOverviewMetrics.insights.map((tip, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${['#c7d2fe', '#fce7f3', '#d1fae5', '#fef3c7'][i % 4]} 0%, ${['#a5b4fc', '#fbcfe8', '#a7f3d0', '#fde68a'][i % 4]} 100%)`,
                      color: '#374151',
                      border: '1px solid rgba(99, 102, 241, 0.2)'
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    {tip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Tasks & Pending Work - Hidden for admin users */}
      {effectiveRole !== 'admin' && (
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <UserTasks
            userId={user.id}
            userRole={effectiveRole}
            userName={user.name}
          />
        </div>
      )}

      {/* Charts and Analytics */}
      {(hasPermission('view_analytics') || effectiveRole === 'manager') && (
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
                    <img src={performanceGif} alt="Performance" className="h-8 w-8 object-contain" />
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
                    <img src={taskChartGif} alt="Task Distribution" className="h-8 w-8 object-contain" />
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
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={taskDistributionData}
                      cx="40%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={30}
                      paddingAngle={6}
                      dataKey="value"
                      label={false}
                    >
                      {taskDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => {
                        const total = taskDistributionData.reduce((sum, item) => sum + item.value, 0);
                        const percentage = total > 0 ? ((Number(value) / total) * 100).toFixed(0) : '0';
                        return `${value} tasks (${percentage}%)`;
                      }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      formatter={(value, entry) => {
                        const data = entry?.payload as any;
                        return data ? `${data.name}: ${data.value} tasks (${data.percentage}%)` : value;
                      }}
                      wrapperStyle={{
                        paddingLeft: '20px'
                      }}
                    />
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
            {user.role === 'admin' || user.role === 'manager'
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
                    try { sessionStorage.setItem('openProjectId', project.id); } catch { }
                    navigate('/projects?open=' + encodeURIComponent(project.id));
                  }}
                  title="Open project"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{project.name}</h4>
                      {(() => {
                        const status = computeDerivedStatus(project);
                        return (
                          <Badge variant="outline" className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        );
                      })()}
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
                    {(() => {
                      const progress = calculateProjectProgress(project);
                      return (
                        <>
                          <div className="text-sm font-medium">{progress}%</div>
                          <Progress value={progress} className="w-20" />
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Allocation Summary - Only for Managers/Admins */}
      {(effectiveRole === 'admin' || effectiveRole === 'manager' || effectiveRole === 'qa_manager') && (
        <Card className="hover:shadow-xl transition-all duration-300 animate-fadeInUp" style={{ animationDelay: '0.75s' }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span>Team Workload & Allocation</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/team-allocation')}
                title="View team management"
              >
                Manage Team
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
            <CardDescription>
              Real-time overview of team member tasks and completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamPerformanceData.length === 0 ? (
                <div className="col-span-2 text-center py-6 text-muted-foreground">
                  <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No team data available for current selection.</p>
                </div>
              ) : (
                teamPerformanceData.map((member, index) => {
                  const completionRate = member.tasks > 0 ? Math.round((member.completed / member.tasks) * 100) : 0;
                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-lg border bg-white hover:bg-purple-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                            {member.member.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{member.member}</div>
                            <div className="text-[10px] text-muted-foreground">{member.tasks} tasks assigned</div>
                          </div>
                        </div>
                        <Badge variant="outline" className={member.performance === 'needs_attention' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}>
                          {completionRate}% Done
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Progress</span>
                          <span>{member.completed} / {member.tasks}</span>
                        </div>
                        <Progress value={completionRate} className="h-1.5" />
                      </div>
                    </div>
                  );
                })
              )}
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
            {epicsError && ` Epics API: ${typeof epicsError === 'string' ? epicsError : (epicsError as any)?.message}`}
            {releasesError && ` Releases API: ${typeof releasesError === 'string' ? releasesError : (releasesError as any)?.message}`}
            {sprintsError && ` Sprints API: ${sprintsError.message}`}
            {storiesError && ` Stories API: ${storiesError.message}`}
            {tasksError && ` Tasks API: ${tasksError.message}`}
            <br />
            <div className="mt-2 text-sm">
              <strong>Possible Solutions:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Ensure your backend API server is running</li>
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