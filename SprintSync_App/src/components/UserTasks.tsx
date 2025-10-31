import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
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
import { useTasksByAssignee } from '../hooks/api/useTasks';
import { Task } from '../types/api';

interface UserTasksProps {
  userId: string;
  userRole: string;
  userName: string;
}

const UserTasks: React.FC<UserTasksProps> = ({ userId, userRole, userName }) => {
  const navigate = useNavigate();
  const { navigateTo } = useNavigation();

  // Fetch user's tasks from API
  const { data: assignedTasksData, loading: tasksLoading, error: tasksError } = useTasksByAssignee(userId);

  // Extract tasks from API response
  const assignedTasks = useMemo(() => {
    if (!assignedTasksData) return [];
    return Array.isArray(assignedTasksData) 
      ? assignedTasksData 
      : (assignedTasksData as any).data || (assignedTasksData as any).content || [];
  }, [assignedTasksData]);

  // Map API Task data to UserTask format
  const userTasks = useMemo(() => {
    if (!assignedTasks || assignedTasks.length === 0) return [];

    return assignedTasks.map((task: Task) => {
      // Map API status to display status
      const statusMap: Record<string, 'pending' | 'in-progress' | 'completed'> = {
        'TO_DO': 'pending',
        'IN_PROGRESS': 'in-progress',
        'QA_REVIEW': 'in-progress',
        'DONE': 'completed',
        'BLOCKED': 'pending',
        'CANCELLED': 'completed'
      };

      // Map API priority to display priority
      const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
        'CRITICAL': 'critical',
        'HIGH': 'high',
        'MEDIUM': 'medium',
        'LOW': 'low'
      };

      return {
        id: task.id,
        title: task.title,
        description: task.description || 'No description provided',
        status: statusMap[task.status] || 'pending',
        priority: priorityMap[task.priority] || 'medium',
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

  // Filter tasks by status
  const pendingTasks = userTasks.filter(task => task.status === 'pending');
  const inProgressTasks = userTasks.filter(task => task.status === 'in-progress');
  const completedTasks = userTasks.filter(task => task.status === 'completed');

  // Calculate task statistics
  const totalTasks = userTasks.length;
  const completedCount = completedTasks.length;
  const inProgressCount = inProgressTasks.length;
  const pendingCount = pendingTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Calculate overdue tasks
  const today = new Date();
  const overdueTasks = userTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== 'completed';
  });

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
            <span>My Tasks & Pending Work</span>
            <Badge variant="outline" className="ml-2">
              {userRole}
            </Badge>
          </CardTitle>
          <CardDescription>
            {userName}'s current workload and task progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">Loading your tasks...</span>
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
            Unable to fetch tasks for {userName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600 mb-4">{tasksError.message || 'An error occurred while loading tasks'}</p>
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
            <span>My Tasks & Pending Work</span>
            <Badge variant="outline" className="ml-2">
              {userRole}
            </Badge>
          </CardTitle>
          <CardDescription>
            {userName}'s current workload and task progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks assigned yet</p>
            <p className="text-sm">When tasks are assigned to you, they will appear here</p>
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
              <span>My Tasks & Pending Work</span>
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
            {userName}'s current workload and task progress
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

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>In Progress ({inProgressTasks.length})</span>
            </CardTitle>
            <CardDescription>Tasks currently being worked on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTaskTypeIcon(task.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm hover:text-blue-600">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTask(task);
                          }}
                          title="Continue task"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedHours}h</span>
                      </span>
                      <span 
                        className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer"
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Pending Tasks ({pendingTasks.length})</span>
            </CardTitle>
            <CardDescription>Tasks waiting to be started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTaskTypeIcon(task.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm hover:text-blue-600">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTask(task);
                          }}
                          title="Start task"
                        >
                          <CheckSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedHours}h</span>
                      </span>
                      <span 
                        className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer"
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Overdue Tasks ({overdueTasks.length})</span>
            </CardTitle>
            <CardDescription className="text-red-700">
              These tasks are past their due date and need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start space-x-3 p-3 border border-red-200 rounded-lg bg-white cursor-pointer hover:bg-red-50 transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getTaskTypeIcon(task.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm text-red-800 hover:text-red-600">{task.title}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          {task.priority}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTask(task);
                          }}
                          title="Urgent: Start task now"
                          className="text-red-600 hover:text-red-800"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{task.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-red-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span className="font-medium">{formatDate(task.dueDate)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.estimatedHours}h</span>
                      </span>
                      <span 
                        className="flex items-center space-x-1 hover:text-red-800 cursor-pointer"
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserTasks;
