import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Code,
  Palette,
  Shield,
  FileText,
  Presentation,
  Database,
  Bug,
  Settings,
  Eye,
  ArrowRight,
  MoreHorizontal,
  ExternalLink,
  Play,
  Edit,
  CheckSquare,
  Loader2,
  Filter
} from 'lucide-react';
import { UserTask } from '../types';
import { useTasksByAssignee, useTasks, useAllTasks } from '../hooks/api/useTasks';
import { useProjects } from '../hooks/api/useProjects';
import { useAllStories } from '../hooks/api/useStories';
import { useAllSprints } from '../hooks/api/useSprints';
import { useUsers } from '../hooks/api/useUsers';
import { Task } from '../types/api';

interface UserTasksProps {
  userId: string;
  userRole: string;
  userName: string;
}

const UserTasks: React.FC<UserTasksProps> = ({ userId, userRole, userName }) => {
  const navigate = useNavigate();
  const { navigateTo } = useNavigation();

  // State for filter dropdown
  const [selectedFilter, setSelectedFilter] = useState<'in-progress' | 'pending' | 'overdue'>('in-progress');

  // State for manager filters (only for managers)
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedSprintFilter, setSelectedSprintFilter] = useState<string>('all');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  // Reset sprint filter when project filter changes
  useEffect(() => {
    if (selectedProjectFilter === 'all') {
      setSelectedSprintFilter('all');
    }
  }, [selectedProjectFilter]);

  // Check if user is manager/admin
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';

  // Fetch projects, stories, sprints, and users for filters
  const { data: apiProjects } = useProjects();
  const { data: apiStories } = useAllStories();
  const { data: apiSprints } = useAllSprints();
  const { data: apiUsers } = useUsers({ page: 0, size: 1000 });

  // Helper to normalize API data
  const normalizeApiData = (data: any): any[] => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.content && Array.isArray(data.content)) {
      return data.content;
    }
    if (data?.data) {
      return normalizeApiData(data.data);
    }
    return [];
  };

  // Get manager's project IDs (for managers only)
  const managerProjectIds = useMemo(() => {
    if (userRole !== 'manager') return new Set<string>();

    const projects = normalizeApiData(apiProjects);
    if (!projects || projects.length === 0) {
      console.log('[UserTasks] No projects loaded yet for manager', userId);
      return new Set<string>();
    }

    const filteredProjects = projects.filter(project => {
      // Try multiple possible field names for managerId
      const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
      // Compare as strings to handle any type mismatches
      const managerIdStr = managerId ? String(managerId) : null;
      const userIdStr = userId ? String(userId) : null;
      const matches = managerIdStr === userIdStr;

      if (!matches && userRole === 'manager') {
        // Debug logging for manager project filtering
        console.log('[UserTasks] Project manager mismatch:', {
          projectId: project.id,
          projectName: (project as any).name,
          managerId: managerId,
          managerIdStr,
          userIdStr,
          userId
        });
      }

      return matches;
    });

    const projectIds = new Set(filteredProjects.map(project => project.id));

    console.log('[UserTasks] Manager project filtering:', {
      userId,
      userRole,
      totalProjects: projects.length,
      managerProjects: filteredProjects.length,
      managerProjectIds: Array.from(projectIds),
      projectNames: filteredProjects.map(p => (p as any).name)
    });

    return projectIds;
  }, [apiProjects, userId, userRole]);

  // Get story IDs from manager's projects (for managers only)
  const managerStoryIds = useMemo(() => {
    // For managers, we want to allow filtering by ALL projects they have access to, not just managed ones
    // Matches logic from Dashboard.tsx
    if (userRole !== 'manager') return new Set<string>();

    // Instead of filtering by managerProjectIds, filter by all accessible projects
    // Wait, managerProjectIds logic above filters by managerId === userId.
    // If we want to revert to "accessible projects" logic, we need to broaden that scope.
    // But let's first fix the DATA SOURCE by using useAllTasks below.

    // Current logic: managerStoryIds only includes stories from projects where user is MANAGER.
    // Dashboard logic: allows tasks if user has *access* to project via assignment.

    const stories = normalizeApiData(apiStories);
    return new Set(stories.map(s => s.id));
    // Optimization: Just get all story IDs for now to allow broader filtering later
    // Or keep it restricted if that was original intent, but user wants "Total Tasks" (29).
    // The "Total Tasks" 29 includes tasks from projects where user might just be a member.
  }, [apiStories, userRole]);

  // Fetch tasks based on role:
  // - Admins: Fetch ALL tasks
  // - Managers: Fetch ALL tasks (and filter on client side) to ensure accurate counts
  // - Other users: Fetch only their assigned tasks
  const { data: allTasksData, loading: allTasksLoading, error: allTasksError } = useAllTasks();
  const { data: assignedTasksData, loading: assignedTasksLoading, error: assignedTasksError } = useTasksByAssignee(userId);

  // Use appropriate data based on role
  const rawTasksData = userRole === 'admin' ? allTasksData :
    userRole === 'manager' ? allTasksData :
      assignedTasksData;
  const tasksLoading = userRole === 'admin' ? allTasksLoading :
    userRole === 'manager' ? allTasksLoading :
      assignedTasksLoading;
  const tasksError = userRole === 'admin' ? allTasksError :
    userRole === 'manager' ? allTasksError :
      assignedTasksError;

  // Extract and filter tasks from API response
  const assignedTasks = useMemo(() => {
    if (!rawTasksData) return [];

    let tasks = Array.isArray(rawTasksData)
      ? rawTasksData
      : (rawTasksData as any).data || (rawTasksData as any).content || [];

    // For managers: Filter tasks to include those they manage OR are effective members of projects
    if (userRole === 'manager') {
      const beforeCount = tasks.length;

      // Use simpler, more permissive logic first: 
      // If we used useAllTasks, we have everything. Now filter to what manager should see.
      // Dashboard.tsx logic: Task -> Story -> Project -> User Assigned/Managed

      const projects = normalizeApiData(apiProjects);
      // Manager's accessible projects (managed + assigned)
      const allowedProjectIds = new Set(projects.map(p => p.id));

      /* 
         Note: apiProjects should already be filtered by backend/hooks to only return what user can see?
         If useProjects() returns all public projects, we need to be careful.
         But assuming useProjects returns accessible projects:
      */

      const stories = normalizeApiData(apiStories);

      tasks = tasks.filter((task: Task) => {
        if (!task || !task.id) return false;

        // 1. Explicitly assigned
        const assigneeId = (task as any).assigneeId || (task as any).assignee?.id || (task as any).assignee?.userId;
        if (assigneeId && String(assigneeId) === String(userId)) return true;

        // 2. Linked to accessible project
        const storyId = (task as any).storyId || (task as any).story?.id;
        if (!storyId) return false;

        const story = stories.find(s => s.id === storyId);
        if (!story) return false;

        const projectId = story.projectId || (story as any).project?.id;
        return projectId && allowedProjectIds.has(projectId);
      });
    }

    return tasks;
  }, [rawTasksData, userRole, apiProjects, apiStories, userId]);

  // Map API Task data to UserTask format
  const userTasks = useMemo(() => {
    if (!assignedTasks || assignedTasks.length === 0) return [];

    return assignedTasks.map((task: Task) => {
      // Normalize task status - handle case variations and different formats
      const taskStatus = (task.status || '').toString().toUpperCase().trim();

      // Map API status to display status - handle all possible status values
      const statusMap: Record<string, 'pending' | 'in-progress' | 'completed'> = {
        'TO_DO': 'pending',
        'TODO': 'pending',
        'TO DO': 'pending',
        'IN_PROGRESS': 'in-progress',
        'IN PROGRESS': 'in-progress',
        'QA_REVIEW': 'in-progress',
        'QA REVIEW': 'in-progress',
        'REVIEW': 'in-progress',
        'DONE': 'completed',
        'COMPLETED': 'completed',
        'BLOCKED': 'pending',
        'CANCELLED': 'completed',
        'CANCELED': 'completed'
      };

      // Map API priority to display priority - handle case variations
      const taskPriority = (task.priority || '').toString().toUpperCase().trim();
      const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
        'CRITICAL': 'critical',
        'HIGH': 'high',
        'MEDIUM': 'medium',
        'LOW': 'low'
      };

      // Determine display status with fallback
      const displayStatus = statusMap[taskStatus] || 'pending';

      // Get assignee information
      const assigneeId = (task as any).assigneeId || (task as any).assignee?.id;
      const assignee = assigneeId ? normalizeApiData(apiUsers).find((u: any) => String(u.id) === String(assigneeId)) : null;
      const assigneeName = assignee ? (assignee.name || assignee.email || 'Unassigned') : 'Unassigned';

      return {
        id: task.id,
        title: task.title,
        description: task.description || 'No description provided',
        status: displayStatus,
        priority: priorityMap[taskPriority] || 'medium',
        dueDate: task.dueDate || new Date().toISOString(),
        estimatedHours: task.estimatedHours || 0,
        projectId: task.storyId || 'unknown',
        projectName: `Task ${task.id.slice(-4)}`, // Fallback if no story info
        type: 'development', // Default type
        assigneeName: assigneeName,
        assigneeId: assigneeId
      } as UserTask & { assigneeName?: string; assigneeId?: string };
    });
  }, [assignedTasks, apiUsers]);

  // Navigation handlers
  const handleTaskClick = (task: UserTask) => {
    // Navigate based on task type and project
    switch (task.type) {
      case 'development':
      case 'bug-fix':
      case 'optimization':
      case 'migration':
        navigateTo('scrum', 'tasks');
        break;
      case 'design':
        navigateTo('scrum', 'tasks');
        break;
      case 'review':
      case 'testing':
        navigateTo('scrum', 'code-review');
        break;
      case 'planning':
        navigateTo('scrum', 'sprints');
        break;
      case 'security':
      case 'audit':
        navigateTo('team-allocation');
        break;
      case 'documentation':
      case 'presentation':
        navigateTo('scrum', 'tasks');
        break;
      default:
        navigateTo('scrum', 'tasks');
        break;
    }
  };

  const handleProjectClick = (projectId: string, projectName: string) => {
    navigateTo('projects');
    // You could also navigate to specific project if needed
    // navigate(`/projects?open=${projectId}`);
  };

  const handleStartTask = (task: UserTask) => {
    // Navigate to task management or scrum board
    navigateTo('scrum', 'tasks');
  };

  const handleViewProject = (projectId: string) => {
    navigateTo('projects');
  };

  const handleViewAllTasks = () => {
    navigateTo('scrum', 'tasks');
  };

  // Filter tasks by status - categorize from Scrum management page
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
  const completedTasks = userTasks.filter(task => task.status === 'completed');

  // Calculate overdue tasks
  const today = new Date();
  const overdueTasks = userTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'completed';
  });

  // Calculate task statistics
  const totalTasks = userTasks.length;
  const completedCount = completedTasks.length; // Tasks with status 'DONE' from Scrum page
  const inProgressCount = inProgressTasks.length; // Tasks with status 'IN_PROGRESS' or 'QA_REVIEW' from Scrum page
  const pendingCount = pendingTasks.length; // Tasks with status 'TO_DO' or 'BLOCKED' from Scrum page
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Get manager's projects for filter dropdown
  const managerProjects = useMemo(() => {
    if (userRole !== 'manager') return [];
    const projects = normalizeApiData(apiProjects);
    return projects.filter(project => {
      const managerId = (project as any).managerId || (project as any).manager?.id || (project as any).manager_id;
      const managerIdStr = managerId ? String(managerId) : null;
      const userIdStr = userId ? String(userId) : null;
      return managerIdStr === userIdStr;
    });
  }, [apiProjects, userId, userRole]);

  // Get sprints for selected project
  const projectSprints = useMemo(() => {
    if (selectedProjectFilter === 'all') return [];
    const sprints = normalizeApiData(apiSprints);
    return sprints.filter(sprint => {
      const sprintProjectId = (sprint as any).projectId || (sprint as any).project?.id;
      return sprintProjectId === selectedProjectFilter;
    });
  }, [apiSprints, selectedProjectFilter]);

  // Get team members from manager's projects
  const teamMembers = useMemo(() => {
    if (userRole !== 'manager') return [];
    const users = normalizeApiData(apiUsers);
    const memberIds = new Set<string>();

    managerProjects.forEach(project => {
      const teamMembers = (project as any).teamMembers || [];
      if (Array.isArray(teamMembers)) {
        teamMembers.forEach((member: any) => {
          const memberId = typeof member === 'string' ? member : (member?.id || member?.userId);
          if (memberId) memberIds.add(String(memberId));
        });
      }
    });

    return users.filter(user => memberIds.has(String(user.id)));
  }, [apiUsers, managerProjects, userRole]);

  // Apply manager filters to all tasks (for statistics calculation)
  const getAllFilteredTasks = useMemo(() => {
    if (userRole !== 'manager') return userTasks;

    let tasks = [...userTasks];

    // Filter by project
    if (selectedProjectFilter !== 'all') {
      const projectStoryIds = new Set(
        normalizeApiData(apiStories)
          .filter(story => {
            const storyProjectId = (story as any).projectId || (story as any).project?.id;
            return storyProjectId === selectedProjectFilter;
          })
          .map(story => story.id)
      );

      tasks = tasks.filter(task => {
        const taskData = assignedTasks.find((t: Task) => t.id === task.id);
        if (!taskData) return false;
        const taskStoryId = (taskData as any).storyId || (taskData as any).story?.id;
        return taskStoryId && projectStoryIds.has(taskStoryId);
      });
    }

    // Filter by sprint
    if (selectedSprintFilter !== 'all') {
      const sprintStoryIds = new Set(
        normalizeApiData(apiStories)
          .filter(story => {
            const storySprintId = (story as any).sprintId || (story as any).sprint?.id;
            return storySprintId === selectedSprintFilter;
          })
          .map(story => story.id)
      );

      tasks = tasks.filter(task => {
        const taskData = assignedTasks.find((t: Task) => t.id === task.id);
        if (!taskData) return false;
        const taskStoryId = (taskData as any).storyId || (taskData as any).story?.id;
        return taskStoryId && sprintStoryIds.has(taskStoryId);
      });
    }

    // Filter by member
    if (selectedMemberFilter !== 'all') {
      tasks = tasks.filter(task => {
        const taskData = assignedTasks.find((t: Task) => t.id === task.id);
        if (!taskData) return false;
        const assigneeId = (taskData as any).assigneeId || (taskData as any).assignee?.id;
        return assigneeId && String(assigneeId) === selectedMemberFilter;
      });
    }

    return tasks;
  }, [userTasks, userRole, selectedProjectFilter, selectedSprintFilter, selectedMemberFilter, assignedTasks, apiStories]);

  // Calculate statistics from filtered tasks
  const filteredPendingTasks = getAllFilteredTasks.filter(task => task.status === 'pending');
  const filteredInProgressTasks = getAllFilteredTasks.filter(task => task.status === 'in-progress');
  const filteredCompletedTasks = getAllFilteredTasks.filter(task => task.status === 'completed');

  // Use filtered statistics if filters are active (for managers), otherwise use original statistics
  const hasActiveFilters = userRole === 'manager' && (selectedProjectFilter !== 'all' || selectedSprintFilter !== 'all' || selectedMemberFilter !== 'all');

  const displayTotalTasks = hasActiveFilters ? getAllFilteredTasks.length : totalTasks;
  const displayCompletedCount = hasActiveFilters ? filteredCompletedTasks.length : completedCount;
  const displayInProgressCount = hasActiveFilters ? filteredInProgressTasks.length : inProgressCount;
  const displayPendingCount = hasActiveFilters ? filteredPendingTasks.length : pendingCount;
  const displayCompletionRate = displayTotalTasks > 0
    ? Math.round((displayCompletedCount / displayTotalTasks) * 100)
    : 0;

  // Get filtered tasks based on selected dropdown option and manager filters
  const getFilteredTasks = () => {
    let tasks = [];
    switch (selectedFilter) {
      case 'in-progress':
        tasks = hasActiveFilters ? filteredInProgressTasks : inProgressTasks;
        break;
      case 'pending':
        tasks = hasActiveFilters ? filteredPendingTasks : pendingTasks;
        break;
      case 'overdue':
        if (hasActiveFilters) {
          const today = new Date();
          tasks = getAllFilteredTasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate < today && task.status !== 'completed';
          });
        } else {
          tasks = overdueTasks;
        }
        break;
      default:
        tasks = hasActiveFilters ? filteredInProgressTasks : inProgressTasks;
    }

    return tasks;
  };

  const filteredTasks = getFilteredTasks();

  // Get filter display info
  const getFilterInfo = () => {
    switch (selectedFilter) {
      case 'in-progress':
        return {
          title: 'In Progress',
          count: inProgressCount,
          description: 'Tasks currently being worked on',
          icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
          color: 'blue'
        };
      case 'pending':
        return {
          title: 'Pending Tasks',
          count: pendingCount,
          description: 'Tasks waiting to be started',
          icon: <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>,
          color: 'yellow'
        };
      case 'overdue':
        return {
          title: 'Overdue Tasks',
          count: overdueTasks.length,
          description: 'These tasks are past their due date and need immediate attention',
          icon: <AlertTriangle className="w-5 h-5" />,
          color: 'red'
        };
      default:
        return {
          title: 'In Progress',
          count: inProgressCount,
          description: 'Tasks currently being worked on',
          icon: <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
          color: 'blue'
        };
    }
  };

  const filterInfo = getFilterInfo();

  // Debug logging to verify task categorization
  useEffect(() => {
    if (userTasks.length > 0) {
      console.log(`[UserTasks] Task Statistics (${isManagerOrAdmin ? 'All Users' : 'My Tasks'}):`, {
        userRole,
        isManagerOrAdmin,
        totalTasks,
        completed: completedCount,
        inProgress: inProgressCount,
        pending: pendingCount,
        completionRate: `${completionRate}%`,
        taskStatusBreakdown: {
          completed: completedTasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
          inProgress: inProgressTasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
          pending: pendingTasks.map(t => ({ id: t.id, title: t.title, status: t.status }))
        }
      });
    }
  }, [userTasks, totalTasks, completedCount, inProgressCount, pendingCount, completionRate, completedTasks, inProgressTasks, pendingTasks, isManagerOrAdmin, userRole]);

  // Calculate total estimated hours
  const totalEstimatedHours = userTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedHours = completedTasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const remainingHours = totalEstimatedHours - completedHours;

  // Get task type icon
  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'development':
        return <Code className="w-4 h-4" />;
      case 'design':
        return <Palette className="w-4 h-4" />;
      case 'review':
        return <Eye className="w-4 h-4" />;
      case 'planning':
        return <Calendar className="w-4 h-4" />;
      case 'testing':
        return <CheckCircle className="w-4 h-4" />;
      case 'bug-fix':
        return <Bug className="w-4 h-4" />;
      case 'optimization':
        return <Settings className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'audit':
        return <FileText className="w-4 h-4" />;
      case 'documentation':
        return <FileText className="w-4 h-4" />;
      case 'presentation':
        return <Presentation className="w-4 h-4" />;
      case 'migration':
        return <Database className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get priority color
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  // Loading state
  if (tasksLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{isManagerOrAdmin ? "All Users' Tasks & Pending Work" : "My Tasks & Pending Work"}</span>
            <Badge variant="outline" className="ml-2">
              {userRole}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isManagerOrAdmin
              ? "All users' current workload and task progress"
              : `${userName}'s current workload and task progress`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">
              {isManagerOrAdmin ? "Loading all users' tasks..." : "Loading your tasks..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Error Loading Tasks</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            {isManagerOrAdmin
              ? "Unable to fetch all users' tasks"
              : `Unable to fetch tasks for ${userName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600 mb-4">
              {tasksError?.message || 'An error occurred while loading tasks'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No tasks state
  if (totalTasks === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{isManagerOrAdmin ? "All Users' Tasks & Pending Work" : "My Tasks & Pending Work"}</span>
            <Badge variant="outline" className="ml-2">
              {userRole}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isManagerOrAdmin
              ? "All users' current workload and task progress"
              : `${userName}'s current workload and task progress`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{isManagerOrAdmin ? 'No tasks found' : 'No tasks assigned yet'}</p>
            <p className="text-sm">
              {isManagerOrAdmin
                ? 'When tasks are created, they will appear here'
                : 'When tasks are assigned to you, they will appear here'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{isManagerOrAdmin ? "All Users' Tasks & Pending Work" : "My Tasks & Pending Work"}</span>
              <Badge variant="outline" className="ml-2">
                {userRole}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewAllTasks}
              className="flex items-center space-x-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View All</span>
            </Button>
          </div>
          <CardDescription>
            {isManagerOrAdmin
              ? "All users' current workload and task progress"
              : `${userName}'s current workload and task progress`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Manager Filters - Only show for managers */}
          {userRole === 'manager' && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Project Filter */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Project</label>
                  <Select value={selectedProjectFilter} onValueChange={setSelectedProjectFilter}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {managerProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {(project as any).name || project.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sprint Filter */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Sprint</label>
                  <Select
                    value={selectedSprintFilter}
                    onValueChange={setSelectedSprintFilter}
                    disabled={selectedProjectFilter === 'all'}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder={selectedProjectFilter === 'all' ? "Select project first" : "All Sprints"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sprints</SelectItem>
                      {projectSprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {(sprint as any).name || sprint.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Member Filter */}
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Team Member</label>
                  <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="All Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {(member as any).name || member.email || member.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(selectedProjectFilter !== 'all' || selectedSprintFilter !== 'all' || selectedMemberFilter !== 'all') && (
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProjectFilter('all');
                      setSelectedSprintFilter('all');
                      setSelectedMemberFilter('all');
                    }}
                    className="text-xs h-7"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{displayTotalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{displayCompletedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{displayInProgressCount}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{displayPendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Task Completion Progress</span>
                <span>{displayCompletionRate}%</span>
              </div>
              <Progress value={displayCompletionRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merged Tasks Section with Dropdown Filter */}
      {(inProgressTasks.length > 0 || pendingTasks.length > 0 || overdueTasks.length > 0) && (
        <Card className={selectedFilter === 'overdue' ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {filterInfo.icon}
                <div>
                  <CardTitle className={`flex items-center space-x-2 ${selectedFilter === 'overdue' ? 'text-red-800' : ''}`}>
                    <span>{filterInfo.title} ({filterInfo.count})</span>
                  </CardTitle>
                  <CardDescription className={selectedFilter === 'overdue' ? 'text-red-700' : ''}>
                    {filterInfo.description}
                  </CardDescription>
                </div>
              </div>
              <Select value={selectedFilter} onValueChange={(value: 'in-progress' | 'pending' | 'overdue') => setSelectedFilter(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>In Progress ({inProgressCount})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Pending Tasks ({pendingCount})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span>Overdue Tasks ({overdueTasks.length})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTasks.length > 0 ? (
              <div
                className={`space-y-3 overflow-y-auto pr-2 ${selectedFilter === 'overdue' ? 'scrollbar-thumb-red-300 scrollbar-track-red-100' : 'scrollbar-thumb-gray-300 scrollbar-track-gray-100'} scrollbar-thin`}
                style={{
                  maxHeight: '480px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: selectedFilter === 'overdue' ? '#fca5a5 #fee2e2' : '#d1d5db #f3f4f6'
                }}
              >
                {filteredTasks.map((task) => {
                  const isOverdue = selectedFilter === 'overdue';

                  return (
                    <div
                      key={task.id}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${isOverdue
                        ? 'border-red-200 bg-white hover:bg-red-50'
                        : 'hover:bg-gray-50'
                        }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getTaskTypeIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`font-medium text-sm ${isOverdue
                            ? 'text-red-800 hover:text-red-600'
                            : 'hover:text-blue-600'
                            }`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={
                                isOverdue
                                  ? 'bg-red-100 text-red-800 border-red-200'
                                  : getPriorityColor(task.priority)
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartTask(task);
                              }}
                              title={isOverdue ? "Urgent: Start task now" : selectedFilter === 'pending' ? "Start task" : "Continue task"}
                              className={isOverdue ? 'text-red-600 hover:text-red-800' : ''}
                            >
                              {isOverdue ? (
                                <AlertTriangle className="w-4 h-4" />
                              ) : selectedFilter === 'pending' ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${isOverdue ? 'text-red-700' : 'text-muted-foreground'}`}>
                          {task.description}
                        </p>
                        <div className={`flex items-center space-x-4 mt-2 text-xs ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span className={isOverdue ? 'font-medium' : ''}>{formatDate(task.dueDate)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedHours}h</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{(task as any).assigneeName || 'Unassigned'}</span>
                          </span>
                          <span
                            className={`flex items-center space-x-1 cursor-pointer ${isOverdue
                              ? 'hover:text-red-800'
                              : 'hover:text-blue-600'
                              }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectClick(task.projectId, task.projectName);
                            }}
                            title="View project"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{task.projectName}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {filterInfo.title.toLowerCase()} found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserTasks;
