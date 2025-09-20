import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart3, 
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('last30days');

  const projectMetrics = [
    {
      name: 'E-Commerce Platform',
      progress: 85,
      velocity: 78,
      burnRate: 92,
      quality: 94,
      onTime: 88,
      budget: 85,
      team: 5,
      sprints: 15,
      stories: 124,
      bugs: 8
    },
    {
      name: 'Mobile Banking App',
      progress: 45,
      velocity: 65,
      burnRate: 78,
      quality: 91,
      onTime: 92,
      budget: 72,
      team: 4,
      sprints: 8,
      stories: 89,
      bugs: 12
    },
    {
      name: 'AI Chat Support',
      progress: 100,
      velocity: 85,
      burnRate: 95,
      quality: 96,
      onTime: 94,
      budget: 97,
      team: 3,
      sprints: 12,
      stories: 96,
      bugs: 3
    }
  ];

  const teamPerformance = [
    {
      name: 'Arjun Patel',
      role: 'Senior Developer',
      velocity: 45,
      completed: 23,
      inProgress: 3,
      quality: 94,
      onTime: 96,
      utilization: 85
    },
    {
      name: 'Priya Sharma',
      role: 'UI/UX Designer',
      velocity: 38,
      completed: 18,
      inProgress: 2,
      quality: 97,
      onTime: 89,
      utilization: 95
    },
    {
      name: 'Sneha Reddy',
      role: 'Full Stack Developer',
      velocity: 42,
      completed: 19,
      inProgress: 4,
      quality: 89,
      onTime: 85,
      utilization: 105
    },
    {
      name: 'Rahul Kumar',
      role: 'Scrum Master',
      velocity: 35,
      completed: 15,
      inProgress: 2,
      quality: 92,
      onTime: 98,
      utilization: 78
    }
  ];

  const sprintAnalytics = [
    {
      sprint: 'Sprint 15',
      planned: 89,
      completed: 78,
      velocity: 78,
      burndown: 92,
      teamSatisfaction: 8.5,
      blockers: 2,
      carryover: 11
    },
    {
      sprint: 'Sprint 14',
      planned: 82,
      completed: 82,
      velocity: 82,
      burndown: 100,
      teamSatisfaction: 9.2,
      blockers: 1,
      carryover: 0
    },
    {
      sprint: 'Sprint 13',
      planned: 76,
      completed: 69,
      velocity: 69,
      burndown: 87,
      teamSatisfaction: 7.8,
      blockers: 4,
      carryover: 7
    }
  ];

  const getPerformanceColor = (value: number, type: 'percentage' | 'rating' = 'percentage') => {
    if (type === 'rating') {
      if (value >= 8.5) return 'text-green-600';
      if (value >= 7.5) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    if (value >= 90) return 'text-green-600';
    if (value >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Target className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive project and team performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="last7days">Last 7 days</option>
            <option value="last30days">Last 30 days</option>
            <option value="last90days">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-primary border-0 text-white hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Team Velocity</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-semibold">76</p>
                  {getTrendIcon(76, 72)}
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-semibold text-green-600">91%</p>
                  {getTrendIcon(91, 88)}
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Utilization</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-semibold">86%</p>
                  {getTrendIcon(86, 89)}
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Issues</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-semibold text-orange-600">23</p>
                  {getTrendIcon(23, 28)}
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Project Reports</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="sprints">Sprint Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Overview</CardTitle>
              <CardDescription>Key metrics across all active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectMetrics.map((project) => (
                  <div key={project.name} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{project.team} team members</span>
                        <span>{project.sprints} sprints</span>
                        <span>{project.stories} stories</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className={getPerformanceColor(project.progress)}>
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Velocity</span>
                          <span className={getPerformanceColor(project.velocity)}>
                            {project.velocity}
                          </span>
                        </div>
                        <Progress value={project.velocity} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Quality</span>
                          <span className={getPerformanceColor(project.quality)}>
                            {project.quality}%
                          </span>
                        </div>
                        <Progress value={project.quality} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>On-Time</span>
                          <span className={getPerformanceColor(project.onTime)}>
                            {project.onTime}%
                          </span>
                        </div>
                        <Progress value={project.onTime} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Budget</span>
                          <span className={getPerformanceColor(project.budget)}>
                            {project.budget}%
                          </span>
                        </div>
                        <Progress value={project.budget} className="h-2" />
                      </div>
                      
                      <div className="space-y-2 text-center">
                        <div className="text-sm text-muted-foreground">Open Bugs</div>
                        <div className={`text-lg font-semibold ${
                          project.bugs > 10 ? 'text-red-600' : 
                          project.bugs > 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {project.bugs}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Analysis</CardTitle>
              <CardDescription>Individual contributor metrics and productivity insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                        {member.utilization > 100 && (
                          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                            Overloaded
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <span>Velocity: <span className="font-medium text-foreground">{member.velocity}</span></span>
                        <span>Completed: <span className="font-medium text-foreground">{member.completed}</span></span>
                        <span>In Progress: <span className="font-medium text-foreground">{member.inProgress}</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Quality</div>
                        <div className={`font-semibold ${getPerformanceColor(member.quality)}`}>
                          {member.quality}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">On-Time</div>
                        <div className={`font-semibold ${getPerformanceColor(member.onTime)}`}>
                          {member.onTime}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Utilization</div>
                        <div className={`font-semibold ${
                          member.utilization > 100 ? 'text-red-600' :
                          member.utilization > 90 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {member.utilization}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Performance Trends</CardTitle>
              <CardDescription>Historical sprint analysis and team satisfaction metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sprintAnalytics.map((sprint) => (
                  <div key={sprint.sprint} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{sprint.sprint}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-muted-foreground">
                          Team Satisfaction: 
                          <span className={`ml-1 font-medium ${getPerformanceColor(sprint.teamSatisfaction, 'rating')}`}>
                            {sprint.teamSatisfaction}/10
                          </span>
                        </span>
                        <Badge variant={sprint.blockers > 2 ? 'destructive' : 'secondary'}>
                          {sprint.blockers} Blockers
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Sprint Goal</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Completed</span>
                            <span>{sprint.completed}/{sprint.planned}</span>
                          </div>
                          <Progress value={(sprint.completed / sprint.planned) * 100} className="h-2" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Velocity</div>
                        <div className={`text-xl font-semibold ${getPerformanceColor(sprint.velocity)}`}>
                          {sprint.velocity}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Burndown</div>
                        <div className={`text-xl font-semibold ${getPerformanceColor(sprint.burndown)}`}>
                          {sprint.burndown}%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Carryover</div>
                        <div className={`text-xl font-semibold ${
                          sprint.carryover > 5 ? 'text-red-600' : 
                          sprint.carryover > 0 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {sprint.carryover}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;