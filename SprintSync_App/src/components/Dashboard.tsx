import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
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
  Eye
} from 'lucide-react';
import { 
  getDashboardMetrics, 
  getBurndownData, 
  getMonthlyTrendData, 
  getProjectStatusData, 
  mockProjects,
  getTeamPerformanceData,
  getAIInsights
} from '../data/mockData';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, hasPermission, canAccessProject } = useAuth();

  // Get role-based metrics
  const metrics = useMemo(() => {
    if (!user) return null;
    return getDashboardMetrics(user.role, user.id);
  }, [user]);

  // Filter projects based on user permissions
  const accessibleProjects = useMemo(() => {
    if (!user) return [];
    return mockProjects.filter(project => canAccessProject(project.id));
  }, [user, canAccessProject]);

  const burndownData = getBurndownData();
  const monthlyTrendData = getMonthlyTrendData();
  const projectStatusData = getProjectStatusData();
  const teamPerformanceData = getTeamPerformanceData();
  const aiInsights = getAIInsights();

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

      {/* Performance Alert for Managers/Admins */}
      {(user.role === 'admin' || user.role === 'manager') && underperformingMembers.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Performance Alert:</strong> {underperformingMembers.length} team members need attention.
            Review the Team Performance Alerts section below.
          </AlertDescription>
        </Alert>
      )}

      {/* AI Insights Panel */}
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
            <Button variant="ghost" size="sm">
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
                  <Button size="sm" variant="outline" className="text-xs">
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.projectCount}</div>
            <p className="text-xs text-blue-700">of 12 total</p>
            <Progress value={67} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">156</div>
            <p className="text-xs text-green-700">of 234 total</p>
            <Progress value={67} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{metrics.teamMembers}</div>
            <p className="text-xs text-purple-700">of 24 total</p>
            <Progress value={75} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sprint Velocity</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">28</div>
            <div className="flex items-center text-xs text-orange-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance Alerts - Only for Managers/Admins */}
      {(user.role === 'admin' || user.role === 'manager') && underperformingMembers.length > 0 && (
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
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Schedule 1-on-1
                        </Button>
                        <Button size="sm" variant="ghost">
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
              <Button variant="outline">
                <Users className="w-4 h-4 mr-1" />
                Schedule Team Review
              </Button>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-1" />
                Generate Report
              </Button>
              <Button variant="outline">
                <Coffee className="w-4 h-4 mr-1" />
                Training
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts and Analytics */}
      {hasPermission('view_analytics') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sprint Performance Chart */}
          <Card className="bg-pastel-yellow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span>Sprint Performance</span>
              </CardTitle>
              <CardDescription>Planned vs Done comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Sprint 12', planned: 45, done: 42 },
                  { name: 'Sprint 13', planned: 50, done: 48 },
                  { name: 'Sprint 14', planned: 40, done: 35 },
                  { name: 'Sprint 15', planned: 35, done: 28 }
                ]}>
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
                  <Bar dataKey="planned" fill="#06B6D4" />
                  <Bar dataKey="done" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card className="bg-pastel-cyan">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-cyan-600" />
                <span>Task Distribution</span>
              </CardTitle>
              <CardDescription>Current sprint task breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'To Do', value: 28, percentage: 19 },
                      { name: 'In Progress', value: 35, percentage: 24 },
                      { name: 'QA', value: 15, percentage: 10 },
                      { name: 'Done', value: 67, percentage: 46 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {[
                      { name: 'To Do', value: 28, percentage: 19 },
                      { name: 'In Progress', value: 35, percentage: 24 },
                      { name: 'QA', value: 15, percentage: 10 },
                      { name: 'Done', value: 67, percentage: 46 }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Projects</span>
            {hasPermission('view_projects') && (
              <Button variant="ghost" size="sm">
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
            {accessibleProjects.slice(0, 3).map((project) => (
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

      {/* Quick Actions */}
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
    </div>
  );
};

export default Dashboard;