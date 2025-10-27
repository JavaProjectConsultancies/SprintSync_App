import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextEnhanced';
import TeamAllocationDemo from './TeamAllocationDemo';
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
import LiveStatusDashboard from './LiveStatusDashboard';
import DashboardFilters from './DashboardFilters';
import FilteredChart from './FilteredChart';
import { FilterProvider, useFilters } from '../contexts/FilterContext';
import { 
  useProjects, 
  useUsers, 
  useDepartments, 
  useDomains, 
  useEpics, 
  useReleases, 
  useSprints, 
  useStories, 
  useTasks,
  useDashboardMetrics,
  useSprintPerformanceData,
  useTaskDistributionData,
  useProjectListData,
  useTeamMemberMetrics,
  useVelocityTrendsData,
  useAggregatedDashboardData
} from '../hooks/api';
import { apiClient } from '../services/api/client';

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, canAccessProject } = useAuth();
  const { filters, getFilteredData, hasActiveFilters } = useFilters();
  const componentVisibility = filters.componentVisibility;
  
  // API authentication is now handled by AuthContext
  // No need for demo auth setup

  // API hooks for real data from all master tables
  const { data: apiProjects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: apiUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: apiDepartments, loading: departmentsLoading, error: departmentsError, refetch: refetchDepartments } = useDepartments();
  const { data: apiDomains, loading: domainsLoading, error: domainsError, refetch: refetchDomains } = useDomains();
  const { data: apiEpics, loading: epicsLoading, error: epicsError, refetch: refetchEpics } = useEpics();
  const { data: apiReleases, loading: releasesLoading, error: releasesError, refetch: refetchReleases } = useReleases();
  const { data: apiSprints, loading: sprintsLoading, error: sprintsError, refetch: refetchSprints } = useSprints();
  const { data: apiStories, loading: storiesLoading, error: storiesError, refetch: refetchStories } = useStories();
  const { data: apiTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useTasks();

  // Filter states
  const [selectedProjectForSprint, setSelectedProjectForSprint] = useState<string>('all');
  const [selectedProjectForTasks, setSelectedProjectForTasks] = useState<string>('all');

  // Filter projects based on user permissions - use API data only
  const accessibleProjects = useMemo(() => {
    if (!user) return [];
    
    // Handle both API response formats: { content: Project[] } or Project[]
    const projectData = apiProjects?.content || apiProjects || [];
    
    let filtered = projectData.filter(project => canAccessProject(project.id));
    
    // If no projects from API, create fallback projects for demo
    if (filtered.length === 0) {
      filtered = [
        {
          id: 'demo-project-1',
          name: 'E-Commerce Platform',
          description: 'Online shopping platform development',
          status: 'active',
          progress: 85
        },
        {
          id: 'demo-project-2', 
          name: 'Mobile App',
          description: 'Cross-platform mobile application',
          status: 'active',
          progress: 60
        },
        {
          id: 'demo-project-3',
          name: 'Data Analytics Dashboard',
          description: 'Business intelligence dashboard',
          status: 'planning',
          progress: 25
        }
      ];
    }
    
    return filtered;
  }, [user, canAccessProject, apiProjects]);

  // Dashboard Analytics API hooks for charts and metrics
  const { data: dashboardMetrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useDashboardMetrics(user?.id);
  const { data: apiSprintPerformanceData, loading: sprintPerfLoading, error: sprintPerfError, refetch: refetchSprintPerf } = useSprintPerformanceData(accessibleProjects.map(p => p.id), 4);
  const { data: apiTaskDistributionData, loading: taskDistLoading, error: taskDistError, refetch: refetchTaskDist } = useTaskDistributionData(accessibleProjects.map(p => p.id));
  const { data: projectListData, loading: projectListLoading, error: projectListError, refetch: refetchProjectList } = useProjectListData(user?.id, true);
  const { data: teamMemberMetrics, loading: teamMetricsLoading, error: teamMetricsError, refetch: refetchTeamMetrics } = useTeamMemberMetrics();
  const { data: velocityTrendsData, loading: velocityLoading, error: velocityError, refetch: refetchVelocity } = useVelocityTrendsData(accessibleProjects.map(p => p.id), 'monthly');

  // Get role-based metrics from API data
  const metrics = useMemo(() => {
    if (!user) return null;
    
    // Use dashboard metrics from API if available, otherwise fallback to calculated metrics
    if (dashboardMetrics) {
      return {
        projectCount: dashboardMetrics.totalProjects,
        teamMembers: dashboardMetrics.totalUsers,
        sprintProgress: dashboardMetrics.sprintVelocity,
        taskCompletion: dashboardMetrics.overallProgress,
        criticalItems: dashboardMetrics.totalTasks - dashboardMetrics.completedTasks,
        upcomingDeadlines: 0, // TODO: Calculate from task due dates
        sprintVelocity: dashboardMetrics.sprintVelocity,
        velocityTrend: dashboardMetrics.velocityTrend,
        velocityChange: dashboardMetrics.velocityChange
      };
    }
    
    // Fallback to calculated metrics from API data
    const totalProjects = apiProjects?.content?.length || 0;
    const totalUsers = apiUsers?.content?.length || 0;
    const totalTasks = apiTasks?.content?.length || 0;
    const completedTasks = apiTasks?.content?.filter(task => task.status === 'DONE').length || 0;
    
    return {
      projectCount: totalProjects,
      teamMembers: totalUsers,
      sprintProgress: 0, // TODO: Calculate from sprint data
      taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      criticalItems: apiTasks?.content?.filter(task => task.priority === 'CRITICAL').length || 0,
      upcomingDeadlines: 0, // TODO: Calculate from task due dates
      sprintVelocity: 28, // Default value
      velocityTrend: 'stable' as const,
      velocityChange: 12
    };
  }, [user, dashboardMetrics, apiProjects, apiUsers, apiTasks]);

  // Generate chart data from API data with filtering
  const sprintPerformanceChartData = useMemo(() => {
    let data = apiSprintPerformanceData || [];
    
    // Apply project filter
    if (selectedProjectForSprint !== 'all') {
      data = data.filter(sprint => sprint.projectId === selectedProjectForSprint);
    }
    
    // Apply user filters
    data = getFilteredData(data, 'sprints');
    
    // If no API data, create fallback data based on accessible projects
    if (data.length === 0 && accessibleProjects.length > 0) {
      const project = selectedProjectForSprint !== 'all' 
        ? accessibleProjects.find(p => p.id === selectedProjectForSprint)
        : accessibleProjects[0];
      
      if (project) {
        data = [
          {
            name: 'Sprint 1',
            planned: 20,
            done: 15,
            projectId: project.id
          },
          {
            name: 'Sprint 2', 
            planned: 25,
            done: 20,
            projectId: project.id
          },
          {
            name: 'Sprint 3',
            planned: 30,
            done: 25,
            projectId: project.id
          }
        ];
      }
    }
    
    return data.map(sprint => ({
      name: sprint.sprintName || sprint.name,
      planned: sprint.plannedPoints || sprint.planned,
      done: sprint.completedPoints || sprint.done
    }));
  }, [apiSprintPerformanceData, selectedProjectForSprint, getFilteredData, accessibleProjects]);

  const taskDistributionChartData = useMemo(() => {
    let data = apiTaskDistributionData || [];
    
    // Apply project filter
    if (selectedProjectForTasks !== 'all') {
      data = data.filter(task => task.projectId === selectedProjectForTasks);
    }
    
    // Apply user filters
    data = getFilteredData(data, 'tasks');
    
    // If no API data, create fallback data based on accessible projects
    if (data.length === 0 && accessibleProjects.length > 0) {
      const project = selectedProjectForTasks !== 'all' 
        ? accessibleProjects.find(p => p.id === selectedProjectForTasks)
        : accessibleProjects[0];
      
      if (project) {
        data = [
          {
            label: 'To Do',
            count: 8,
            percentage: 25,
            projectId: project.id
          },
          {
            label: 'In Progress',
            count: 12,
            percentage: 37.5,
            projectId: project.id
          },
          {
            label: 'Review',
            count: 6,
            percentage: 18.75,
            projectId: project.id
          },
          {
            label: 'Done',
            count: 6,
            percentage: 18.75,
            projectId: project.id
          }
        ];
      }
    }
    
    return data.map(task => ({
      name: task.label,
      value: task.count,
      percentage: task.percentage
    }));
  }, [apiTaskDistributionData, selectedProjectForTasks, getFilteredData, accessibleProjects]);

  const projectStatusData = useMemo(() => {
    if (!projectListData) return [];
    const filteredProjects = getFilteredData(projectListData, 'projects');
    return filteredProjects.map(project => ({
      name: project.projectName,
      value: project.progress || 0
    }));
  }, [projectListData, getFilteredData]);

  const monthlyTrendData = useMemo(() => {
    // Use velocity trends data if available
    if (velocityTrendsData) {
      return velocityTrendsData.map(trend => ({
        month: trend.period,
        projects: 1, // This would need to be calculated based on project count per period
        tasks: trend.completedPoints
      }));
    }
    
    // Fallback data
    return [
      { month: 'Jan', projects: 2, tasks: 45 },
      { month: 'Feb', projects: 3, tasks: 62 },
      { month: 'Mar', projects: 4, tasks: 78 },
      { month: 'Apr', projects: 5, tasks: 95 }
    ];
  }, [velocityTrendsData]);

  const teamPerformanceData = useMemo(() => {
    if (teamMemberMetrics) {
      return teamMemberMetrics.map(member => ({
        member: member.userName,
        tasks: member.tasksAssigned,
        completed: member.tasksCompleted,
        performance: member.completionRate > 70 ? 'good' : 'needs_attention'
      }));
    }
    
    // Fallback data
    return [
      { member: 'Team Member 1', tasks: 12, completed: 10, performance: 'good' },
      { member: 'Team Member 2', tasks: 8, completed: 7, performance: 'good' },
      { member: 'Team Member 3', tasks: 15, completed: 12, performance: 'good' }
    ];
  }, [teamMemberMetrics]);

  const aiInsights = useMemo(() => {
    // TODO: Generate AI insights from data patterns
    return [
      {
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

  // Check if any filters are active (using context hasActiveFilters)

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

  if (!user || !metrics) {
    return null;
  }

  const firstName = user.name.split(' ')[0];
  const underperformingMembers = teamPerformanceData.filter(member => member.performance === 'needs_attention');

  return (
    <div className="space-y-6 p-6">
      {/* Header with AI Status */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
            <div className="flex items-center space-x-1 text-green-600">
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


      {/* Dashboard Filters */}
      <DashboardFilters
        availableProjects={accessibleProjects}
        availableUsers={apiUsers?.content || []}
        availableDepartments={apiDepartments || []}
        availableDomains={apiDomains || []}
        availableTeams={[]}
      />

      {/* API Status Indicators - All Master Tables */}
      {componentVisibility.showApiStatusIndicators && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${projectsLoading ? 'bg-yellow-500 animate-pulse' : projectsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Projects API</span>
              {projectsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {projectsError && <span className="text-xs text-red-500" title={projectsError.message}>Error: {projectsError.status}</span>}
              {apiProjects && <span className="text-xs text-green-600">{apiProjects.length} projects</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${usersLoading ? 'bg-yellow-500 animate-pulse' : usersError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Users API</span>
              {usersLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {usersError && <span className="text-xs text-red-500" title={usersError.message}>Error: {usersError.status}</span>}
              {apiUsers && <span className="text-xs text-green-600">{apiUsers.length} users</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${departmentsLoading ? 'bg-yellow-500 animate-pulse' : departmentsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Departments API</span>
              {departmentsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {departmentsError && <span className="text-xs text-red-500" title={departmentsError.message}>Error: {departmentsError.status}</span>}
              {apiDepartments && <span className="text-xs text-green-600">{apiDepartments.length} departments</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${domainsLoading ? 'bg-yellow-500 animate-pulse' : domainsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Domains API</span>
              {domainsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {domainsError && <span className="text-xs text-red-500" title={domainsError.message}>Error: {domainsError.status}</span>}
              {apiDomains && <span className="text-xs text-green-600">{apiDomains.length} domains</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${epicsLoading ? 'bg-yellow-500 animate-pulse' : epicsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Epics API</span>
              {epicsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {epicsError && <span className="text-xs text-red-500" title={epicsError.message}>Error: {epicsError.status}</span>}
              {apiEpics && <span className="text-xs text-green-600">{apiEpics.length} epics</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${releasesLoading ? 'bg-yellow-500 animate-pulse' : releasesError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Releases API</span>
              {releasesLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {releasesError && <span className="text-xs text-red-500" title={releasesError.message}>Error: {releasesError.status}</span>}
              {apiReleases && <span className="text-xs text-green-600">{apiReleases.length} releases</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${sprintsLoading ? 'bg-yellow-500 animate-pulse' : sprintsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Sprints API</span>
              {sprintsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {sprintsError && <span className="text-xs text-red-500" title={sprintsError.message}>Error: {sprintsError.status}</span>}
              {apiSprints && <span className="text-xs text-green-600">{apiSprints.length} sprints</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-teal-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${storiesLoading ? 'bg-yellow-500 animate-pulse' : storiesError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Stories API</span>
              {storiesLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {storiesError && <span className="text-xs text-red-500" title={storiesError.message}>Error: {storiesError.status}</span>}
              {apiStories && <span className="text-xs text-green-600">{apiStories.length} stories</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${tasksLoading ? 'bg-yellow-500 animate-pulse' : tasksError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Tasks API</span>
              {tasksLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {tasksError && <span className="text-xs text-red-500" title={tasksError.message}>Error: {tasksError.status}</span>}
              {apiTasks && <span className="text-xs text-green-600">{apiTasks.length} tasks</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${(projectsLoading || usersLoading || departmentsLoading || domainsLoading || epicsLoading || releasesLoading || sprintsLoading || storiesLoading || tasksLoading) ? 'bg-yellow-500 animate-pulse' : (projectsError || usersError || departmentsError || domainsError || epicsError || releasesError || sprintsError || storiesError || tasksError) ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Data Source</span>
              {apiProjects && apiProjects.length > 0 ? (
                <span className="text-xs text-green-600">Live API Data</span>
              ) : (
                <span className="text-xs text-gray-500">Mock Data</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* API Error Alert */}
      {componentVisibility.showApiErrorAlert && (projectsError || usersError || departmentsError || domainsError || epicsError || releasesError || sprintsError || storiesError || tasksError) && (
        <Alert className="border-red-200 bg-red-50">
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

      {/* Performance Alert for Managers/Admins */}
      {componentVisibility.showPerformanceAlert && (user.role === 'admin' || user.role === 'manager') && underperformingMembers.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Performance Alert:</strong> {underperformingMembers.length} team members need attention.
            Review the Team Performance Alerts section below.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Insights Panel */}
      {componentVisibility.showAiInsights && (
      <Card className="bg-gradient-to-br from-green-50 to-cyan-50 border-green-200">
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
            {aiInsights.map((insight) => (
              <div key={insight.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
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
      )}

      {/* User Tasks & Pending Work */}
      {componentVisibility.showUserTasks && (
      <UserTasks 
        userId={user.id} 
        userRole={user.role} 
        userName={user.name} 
      />
      )}

      {/* Metrics Cards */}
      {componentVisibility.showMetricsCards && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/projects')}
          title="View all projects"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {accessibleProjects.filter(p => p.status === 'active' || p.status === 'planning').length}
            </div>
            <p className="text-xs text-blue-700">
              of {accessibleProjects.length} total
            </p>
            <Progress 
              value={accessibleProjects.length > 0 ? 
                Math.round((accessibleProjects.filter(p => p.status === 'active' || p.status === 'planning').length / accessibleProjects.length) * 100) : 0
              } 
              className="mt-2 h-1.5" 
            />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/todo-list')}
          title="View my tasks"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {apiTasks?.content?.filter(task => task.status === 'DONE').length || 
               apiTasks?.filter(task => task.status === 'DONE').length || 0}
            </div>
            <p className="text-xs text-green-700">
              of {(apiTasks?.content?.length || apiTasks?.length || 0)} total
            </p>
            <Progress 
              value={apiTasks?.content?.length || apiTasks?.length ? 
                Math.round(((apiTasks?.content?.filter(task => task.status === 'DONE').length || 
                             apiTasks?.filter(task => task.status === 'DONE').length || 0) / 
                            (apiTasks?.content?.length || apiTasks?.length || 1)) * 100) : 0
              } 
              className="mt-2 h-1.5" 
            />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => hasPermission('view_team') && navigate('/team-allocation')}
          title={hasPermission('view_team') ? "View team allocation" : "Team members"}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {apiUsers?.content?.length || apiUsers?.length || 0}
            </div>
            <p className="text-xs text-purple-700">active members</p>
            <Progress 
              value={apiUsers?.content?.length || apiUsers?.length ? 
                Math.min(((apiUsers?.content?.length || apiUsers?.length || 0) / 20) * 100, 100) : 0
              } 
              className="mt-2 h-1.5" 
            />
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/scrum')}
          title="View sprint management"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Velocity</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {apiSprints?.content?.length || apiSprints?.length || 0}
            </div>
            <div className="flex items-center text-xs text-orange-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              {apiSprints?.content?.length || apiSprints?.length ? 
                `+${Math.round(((apiSprints?.content?.length || apiSprints?.length || 0) / 10) * 100)}%` : 
                '+0%'
              }
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Team Performance Alerts - Only for Managers/Admins */}
      {componentVisibility.showTeamPerformanceAlerts && (user.role === 'admin' || user.role === 'manager') && underperformingMembers.length > 0 && (
        <Card className="border-orange-200">
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
              {underperformingMembers.map((member) => (
                <Card key={member.id} className="p-4">
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

      {/* Charts and Analytics */}
      {componentVisibility.showChartsAndAnalytics && hasPermission('view_analytics') && (
        <>
          {/* Filter Status Bar */}
          {hasActiveFilters && (
            <Card className="bg-blue-50 border-blue-200">
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
          <Card className="bg-pastel-yellow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span>{getSprintChartInfo().title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedProjectForSprint} onValueChange={setSelectedProjectForSprint}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select project"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {accessibleProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                      {accessibleProjects.length === 0 && !projectsLoading && (
                        <SelectItem value="no-projects" disabled>
                          No projects available
                        </SelectItem>
                      )}
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
              {sprintPerformanceChartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Filter className="w-8 h-8 mx-auto opacity-50" />
                    <p>No data available with current filters</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProjectForSprint('all');
                        setSelectedProjectForTasks('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sprintPerformanceChartData}>
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
              )}
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card className="bg-pastel-cyan">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-cyan-600" />
                  <span>{getTaskChartInfo().title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={selectedProjectForTasks} onValueChange={setSelectedProjectForTasks}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select project"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {accessibleProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                      {accessibleProjects.length === 0 && !projectsLoading && (
                        <SelectItem value="no-projects" disabled>
                          No projects available
                        </SelectItem>
                      )}
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
              {taskDistributionChartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Filter className="w-8 h-8 mx-auto opacity-50" />
                    <p>No data available with current filters</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProjectForSprint('all');
                        setSelectedProjectForTasks('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskDistributionChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {taskDistributionChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          </div>
        </>
      )}

      {/* Recent Projects */}
      {componentVisibility.showRecentProjects && (
      <Card>
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
            {(projectListData || accessibleProjects).slice(0, 3).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-white to-gray-50/50 cursor-pointer hover:shadow-md"
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
                      <span>{project.teamMembers.length} members</span>
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
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Quick Actions */}
      {componentVisibility.showQuickActions && (
      <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hasPermission('manage_projects') && (
              <Button
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-white hover:bg-gray-50 text-foreground border shadow-sm"
                onClick={() => navigate('/projects')}
                title="Go to Projects"
              >
                <FolderKanban className="w-6 h-6" />
                <span>Create Project</span>
              </Button>
            )}
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => navigate('/scrum?sprint-management=true')}
              title="View sprints"
            >
              <Target className="w-6 h-6" />
              <span>View Sprints</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2"
              onClick={() => navigate('/todo-list')}
              title="My assigned tasks"
            >
              <CheckCircle className="w-6 h-6" />
              <span>My Tasks</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Live Status Dashboard */}
      {componentVisibility.showLiveStatusDashboard && (
      <LiveStatusDashboard 
        projectIds={accessibleProjects.map(p => p.id)}
        refreshInterval={30000}
      />
      )}

      {/* Team Allocation Demo */}
      {componentVisibility.showTeamAllocationDemo && (
      <TeamAllocationDemo />
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <FilterProvider>
      <DashboardContent />
    </FilterProvider>
  );
};

export default Dashboard;