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
  Loader2
} from 'lucide-react';
import { UserTask } from '../types';
import { useTasksByAssignee, useTasks } from '../hooks/api/useTasks';
import { useProjects } from '../hooks/api/useProjects';
import { useStories } from '../hooks/api/useStories';
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

  // Check if user is manager/admin
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager';
  
  // Fetch projects and stories to filter tasks by manager's projects
  const { data: apiProjects } = useProjects();
  const { data: apiStories } = useStories();
  
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
    if (userRole !== 'manager' || managerProjectIds.size === 0) return new Set<string>();
    
    const stories = normalizeApiData(apiStories);
    return new Set(
      stories
        .filter(story => {
          const storyProjectId = (story as any).projectId || (story as any).project?.id || (story as any).project_id;
          return storyProjectId && managerProjectIds.has(storyProjectId);
        })
        .map(story => story.id)
    );
  }, [apiStories, managerProjectIds, userRole]);
  
  // Fetch tasks based on role:
  // - Admins: Fetch ALL tasks
  // - Managers: Fetch tasks from their projects only
  // - Other users: Fetch only their assigned tasks
  const { data: allTasksData, loading: allTasksLoading, error: allTasksError } = useTasks();
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
    
    // For managers: Filter tasks to only include tasks from their projects
    // Only filter if we have story IDs, otherwise return empty array (don't show all tasks)
    if (userRole === 'manager') {
      if (managerStoryIds.size === 0) {
        // If no stories found for manager's projects yet, return empty array
        // This prevents showing all tasks while stories are loading
        console.log('[UserTasks] Manager task filtering: No stories found yet, returning empty tasks');
        return [];
      }
      
      const beforeCount = tasks.length;
      tasks = tasks.filter((task: Task) => {
        if (!task || !task.id) return false;
        const taskStoryId = (task as any).storyId || (task as any).story?.id;
        if (!taskStoryId) {
          // Tasks without storyId can't be filtered - skip them for managers
          return false;
        }
        const belongsToManagerProject = managerStoryIds.has(taskStoryId);
        
        // Removed per-task logging to reduce console noise
        // Summary logging is done after filtering
        
        return belongsToManagerProject;
      });
      
      console.log('[UserTasks] Manager task filtering result:', {
        userId,
        userRole,
        beforeCount,
        afterCount: tasks.length,
        managerStoryIdsCount: managerStoryIds.size,
        filteredOut: beforeCount - tasks.length
      });
    }
    
    return tasks;
  }, [rawTasksData, userRole, managerStoryIds]);

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
        type: 'development' // Default type
      } as UserTask;
    });
  }, [assignedTasks]);

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

  // Get filtered tasks based on selected dropdown option
  const getFilteredTasks = () => {
    switch (selectedFilter) {
      case 'in-progress':
        return inProgressTasks;
      case 'pending':
        return pendingTasks;
      case 'overdue':
        return overdueTasks;
      default:
        return inProgressTasks;
    }
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{inProgressCount}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Task Completion Progress</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{remainingHours}h</span> remaining of {totalEstimatedHours}h estimated
                </span>
              </div>
              {overdueTasks.length > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">
                    <span className="font-medium">{overdueTasks.length}</span> overdue tasks
                  </span>
                </div>
              )}
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
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        isOverdue 
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
                          <h4 className={`font-medium text-sm ${
                            isOverdue 
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
                          <span 
                            className={`flex items-center space-x-1 cursor-pointer ${
                              isOverdue 
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
