import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { 
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  GitBranch,
  Settings,
  Flag,
  Star,
  Activity,
  FileText,
  Link,
  Workflow,
  Zap
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  tasks: number;
  completedTasks: number;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'mitigating' | 'resolved';
  owner: string;
}

const ProjectDetailsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock project data
  const project = {
    id: 'PROJ-1',
    name: 'E-Commerce Platform',
    description: 'Modern online shopping experience with AI recommendations, secure payments, and comprehensive admin dashboard',
    status: 'active',
    progress: 75,
    priority: 'high',
    startDate: '2024-01-15',
    endDate: '2024-04-15',
    budget: 2500000,
    spent: 1875000,
    owner: 'Arjun Sharma',
    teamSize: 8,
    totalTasks: 156,
    completedTasks: 117,
    activeSprints: 2,
    completedSprints: 4,
    methodology: 'scrum'
  };

  const milestones: Milestone[] = [
    {
      id: 'ms-1',
      title: 'MVP Launch',
      description: 'Core e-commerce functionality with user authentication and product catalog',
      dueDate: '2024-02-28',
      status: 'completed',
      progress: 100,
      tasks: 45,
      completedTasks: 45
    },
    {
      id: 'ms-2',
      title: 'Payment Integration',
      description: 'Secure payment processing with multiple gateway support',
      dueDate: '2024-03-15',
      status: 'in-progress',
      progress: 80,
      tasks: 32,
      completedTasks: 26
    },
    {
      id: 'ms-3',
      title: 'AI Recommendations',
      description: 'Machine learning based product recommendation engine',
      dueDate: '2024-04-05',
      status: 'upcoming',
      progress: 15,
      tasks: 28,
      completedTasks: 4
    },
    {
      id: 'ms-4',
      title: 'Admin Dashboard',
      description: 'Comprehensive admin panel for inventory and order management',
      dueDate: '2024-04-15',
      status: 'upcoming',
      progress: 0,
      tasks: 51,
      completedTasks: 0
    }
  ];

  const risks: Risk[] = [
    {
      id: 'risk-1',
      title: 'Third-party API Dependencies',
      description: 'Payment gateway and shipping APIs may experience downtime or rate limiting',
      probability: 'medium',
      impact: 'high',
      mitigation: 'Implement fallback mechanisms and circuit breakers',
      status: 'mitigating',
      owner: 'Ritu Sharma'
    },
    {
      id: 'risk-2',
      title: 'Database Performance',
      description: 'Large product catalog may impact query performance',
      probability: 'high',
      impact: 'medium',
      mitigation: 'Optimize queries and implement caching layer',
      status: 'identified',
      owner: 'Rohit Kumar'
    },
    {
      id: 'risk-3',
      title: 'Mobile Responsiveness',
      description: 'Complex UI components may not render properly on mobile devices',
      probability: 'low',
      impact: 'medium',
      mitigation: 'Extensive mobile testing and responsive design review',
      status: 'resolved',
      owner: 'Sneha Patel'
    }
  ];

  const teamMembers = [
    { name: 'Arjun Sharma', role: 'Project Manager', avatar: '', workload: 85, performance: 92 },
    { name: 'Priya Mehta', role: 'Senior Developer', avatar: '', workload: 90, performance: 88 },
    { name: 'Rohit Kumar', role: 'Backend Developer', avatar: '', workload: 75, performance: 85 },
    { name: 'Sneha Patel', role: 'UI/UX Designer', avatar: '', workload: 80, performance: 94 },
    { name: 'Aman Singh', role: 'QA Engineer', avatar: '', workload: 70, performance: 87 },
    { name: 'Ritu Sharma', role: 'DevOps Engineer', avatar: '', workload: 85, performance: 91 },
    { name: 'Kavya Nair', role: 'Business Analyst', avatar: '', workload: 65, performance: 89 },
    { name: 'Ananya Iyer', role: 'Mobile Developer', avatar: '', workload: 75, performance: 86 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'upcoming': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                HIGH PRIORITY
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-gradient-primary text-white">
            <Workflow className="w-4 h-4 mr-2" />
            Go to Board
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">{project.progress}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-600">{project.teamSize}</div>
            <div className="text-sm text-muted-foreground">Team Size</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-purple-600">{project.completedTasks}/{project.totalTasks}</div>
            <div className="text-sm text-muted-foreground">Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">{project.completedSprints}</div>
            <div className="text-sm text-muted-foreground">Sprints</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-cyan-600">{formatCurrency(project.spent).replace('₹', '₹')}L</div>
            <div className="text-sm text-muted-foreground">Spent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-gray-600">
              {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Project Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Tasks Completed</div>
                    <div className="font-semibold text-green-600">{project.completedTasks}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Tasks Remaining</div>
                    <div className="font-semibold text-orange-600">{project.totalTasks - project.completedTasks}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Active Sprints</div>
                    <div className="font-semibold text-blue-600">{project.activeSprints}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Completed Sprints</div>
                    <div className="font-semibold text-purple-600">{project.completedSprints}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Budget Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span className="font-medium">{((project.spent / project.budget) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(project.spent / project.budget) * 100} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Total Budget</div>
                    <div className="font-semibold">{formatCurrency(project.budget)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Spent</div>
                    <div className="font-semibold text-blue-600">{formatCurrency(project.spent)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Remaining</div>
                    <div className="font-semibold text-green-600">{formatCurrency(project.budget - project.spent)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Burn Rate</div>
                    <div className="font-semibold text-orange-600">₹2.1L/week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Project Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Start: {formatDate(project.startDate)}</Badge>
                  <Badge variant="secondary">End: {formatDate(project.endDate)}</Badge>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                </Badge>
              </div>

              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                        <Badge variant="outline" className={getStatusColor(milestone.status)}>
                          {milestone.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                          <span>{milestone.completedTasks}/{milestone.tasks} tasks</span>
                        </div>
                        <div className="w-24">
                          <Progress value={milestone.progress} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {[
                    { user: 'Priya Mehta', action: 'completed', target: 'User Authentication API', time: '2 hours ago' },
                    { user: 'Sneha Patel', action: 'updated', target: 'Product Listing Design', time: '4 hours ago' },
                    { user: 'Aman Singh', action: 'reported bug in', target: 'Shopping Cart Component', time: '6 hours ago' },
                    { user: 'Rohit Kumar', action: 'started working on', target: 'Database Optimization', time: '1 day ago' },
                    { user: 'Ritu Sharma', action: 'deployed', target: 'Staging Environment', time: '1 day ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                          {activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{activity.user}</span>
                        <span className="mx-1">{activity.action}</span>
                        <span className="text-blue-600">{activity.target}</span>
                        <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Milestones</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map(milestone => (
              <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{milestone.title}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(milestone.status)}>
                      {milestone.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {milestone.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(milestone.dueDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{milestone.completedTasks}/{milestone.tasks} tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Team Members ({teamMembers.length})</h3>
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <Card key={member.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium text-sm">{member.name}</h4>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Workload</span>
                            <span>{member.workload}%</span>
                          </div>
                          <Progress value={member.workload} className="h-1" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="text-green-600">{member.performance}%</span>
                          </div>
                          <Progress value={member.performance} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Risks ({risks.length})</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Risk
            </Button>
          </div>

          <div className="space-y-4">
            {risks.map(risk => (
              <Card key={risk.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{risk.title}</h4>
                      <p className="text-xs text-muted-foreground">{risk.description}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Probability</div>
                      <div className={`font-medium ${getRiskColor(risk.probability)}`}>
                        {risk.probability}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Impact</div>
                      <div className={`font-medium ${getRiskColor(risk.impact)}`}>
                        {risk.impact}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Owner</div>
                      <div className="font-medium text-xs">{risk.owner}</div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Mitigation Plan</div>
                    <p className="text-sm">{risk.mitigation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-medium mb-2">Burndown Chart</h3>
                <p className="text-sm text-muted-foreground">Track sprint progress and velocity</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-medium mb-2">Velocity Report</h3>
                <p className="text-sm text-muted-foreground">Analyze team velocity trends</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-medium mb-2">Time Tracking</h3>
                <p className="text-sm text-muted-foreground">Detailed time analysis</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-medium mb-2">Workload Report</h3>
                <p className="text-sm text-muted-foreground">Team capacity and allocation</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Flag className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="font-medium mb-2">Risk Analysis</h3>
                <p className="text-sm text-muted-foreground">Project risk assessment</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-medium mb-2">Quality Metrics</h3>
                <p className="text-sm text-muted-foreground">Code quality and bug reports</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Configuration</CardTitle>
                <CardDescription>Basic project settings and metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={project.name} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={project.description} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Methodology</Label>
                    <Select value={project.methodology}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scrum">Scrum</SelectItem>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={project.priority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>Customize task statuses and workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Task Statuses</Label>
                  <div className="space-y-2">
                    {['Backlog', 'Sprint Ready', 'In Progress', 'Review', 'Done'].map(status => (
                      <div key={status} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{status}</span>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connected tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { name: 'GitHub', status: 'connected', icon: GitBranch },
                    { name: 'Slack', status: 'connected', icon: Zap },
                    { name: 'Google Drive', status: 'not-connected', icon: FileText }
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <integration.icon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-sm">{integration.name}</span>
                      </div>
                      <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Link className="w-4 h-4 mr-2" />
                  Manage Integrations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible project actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-sm text-red-900">Archive Project</span>
                  </div>
                  <p className="text-xs text-red-800 mb-3">
                    This will archive the project and make it read-only. Team members will lose edit access.
                  </p>
                  <Button variant="destructive" size="sm">
                    Archive Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };
};

export default ProjectDetailsPage;