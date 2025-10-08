import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useProjectById } from '../hooks/api/useProjectById';
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
  Zap,
  Plus
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

const ProjectDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Fetch real project data from API
  const { project, loading, error } = useProjectById(id || '');

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'The requested project could not be found.'}
            </p>
            <Button onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use real milestones from API or empty array if none
  const milestones: Milestone[] = project.milestones?.map((milestone: any) => ({
    id: milestone.id,
    title: milestone.name,
    description: milestone.description || '',
    dueDate: milestone.dueDate,
    status: milestone.status === 'completed' ? 'completed' : 
            milestone.status === 'in-progress' ? 'in-progress' : 'upcoming',
    progress: milestone.progress || 0,
    tasks: 0, // Not available in current API
    completedTasks: 0 // Not available in current API
  })) || [];

  // Use real risks from API
  const risks: Risk[] = project.risks?.map((risk: any) => {
    // Find the owner name from team members
    const ownerMember = project.teamMembers?.find((member: any) => member.id === risk.owner);
    const ownerName = ownerMember ? ownerMember.name : risk.owner || 'Unknown';
    
    return {
      id: risk.id,
      title: risk.title,
      description: risk.description || '',
      probability: risk.probability as 'low' | 'medium' | 'high',
      impact: risk.impact as 'low' | 'medium' | 'high',
      mitigation: risk.mitigation || '',
      status: risk.status === 'identified' ? 'identified' : 
              risk.status === 'mitigated' ? 'mitigating' : 'resolved',
      owner: ownerName
    };
  }) || [];

  // Use real team members from project data with real workload and performance
  const teamMembers = project.teamMembers.map(member => ({
    name: member.name,
    role: member.role,
    avatar: member.avatar || '',
    workload: member.workload || 0, // Real workload data from API
    performance: member.performance || 85, // Real performance data from API, default to 85
    department: member.department || '',
    experience: member.experience || 'mid',
    hourlyRate: member.hourlyRate || 0,
    availability: member.availability || 100,
    isTeamLead: member.isTeamLead || false,
    skills: member.skills || [] // Include skills from API
  }));


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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
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
              <Badge variant="outline" className={getPriorityColor(project.priority)}>
                {project.priority.toUpperCase()} PRIORITY
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
            <div className="text-2xl font-semibold text-blue-600">{project.teamMembers.length}</div>
            <div className="text-sm text-muted-foreground">Team Size</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-purple-600">{project.completedSprints}/{project.sprints}</div>
            <div className="text-sm text-muted-foreground">Sprints</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">{project.methodology}</div>
            <div className="text-sm text-muted-foreground">Methodology</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-cyan-600">{formatCurrency(project.spent)}</div>
            <div className="text-sm text-muted-foreground">Spent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-gray-600">
              {(() => {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return isNaN(daysLeft) ? 'N/A' : daysLeft;
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
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
                    <div className="font-semibold text-green-600">{project.completedTasks || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Tasks Remaining</div>
                    <div className="font-semibold text-orange-600">{(project.totalTasks || 0) - (project.completedTasks || 0)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Active Sprints</div>
                    <div className="font-semibold text-blue-600">{Math.max(0, (project.sprints || 0) - (project.completedSprints || 0))}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Completed Sprints</div>
                    <div className="font-semibold text-purple-600">{project.completedSprints || 0}</div>
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
                  {(() => {
                    const endDate = new Date(project.endDate);
                    const today = new Date();
                    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return isNaN(daysLeft) ? 'N/A' : `${daysLeft} days remaining`;
                  })()}
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

        <TabsContent value="requirements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Requirements ({project.requirements?.length || 0})</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Requirement
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.requirements?.map((requirement: any) => (
              <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{requirement.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(requirement.priority)}>
                        {requirement.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(requirement.status)}>
                        {requirement.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {requirement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Type</div>
                      <div className="font-medium">{requirement.type}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Module</div>
                      <div className="font-medium">{requirement.module}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Effort Points</div>
                      <div className="font-medium">{requirement.effortPoints}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Status</div>
                      <div className="font-medium">{requirement.status}</div>
                    </div>
                  </div>

                  {requirement.acceptanceCriteria && requirement.acceptanceCriteria.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">Acceptance Criteria</div>
                      <ul className="space-y-1">
                        {requirement.acceptanceCriteria.map((criteria: string, index: number) => (
                          <li key={index} className="text-sm flex items-start space-x-2">
                            <CheckCircle2 className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{criteria}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )) || []}
          </div>
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
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">{member.name}</h4>
                          {member.isTeamLead && (
                            <Badge variant="secondary" className="text-xs">Lead</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{member.department}</span>
                          <span>•</span>
                          <span>{member.experience}</span>
                          <span>•</span>
                          <span>₹{member.hourlyRate}/hr</span>
                        </div>
                        {member.skills && member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{member.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
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

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Availability</span>
                            <span className="text-blue-600">{member.availability}%</span>
                          </div>
                          <Progress value={member.availability} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Stakeholders ({project.stakeholders?.length || 0})</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Stakeholder
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.stakeholders?.map((stakeholder: any) => (
              <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={stakeholder.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                        {getInitials(stakeholder.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium text-sm">{stakeholder.name}</h4>
                        <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                        <p className="text-xs text-blue-600">{stakeholder.email}</p>
                      </div>
                      
                      {stakeholder.responsibilities && stakeholder.responsibilities.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Responsibilities</div>
                          <ul className="space-y-1">
                            {stakeholder.responsibilities.slice(0, 3).map((responsibility: string, index: number) => (
                              <li key={index} className="text-xs flex items-start space-x-2">
                                <div className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span>{responsibility}</span>
                              </li>
                            ))}
                            {stakeholder.responsibilities.length > 3 && (
                              <li className="text-xs text-muted-foreground">
                                +{stakeholder.responsibilities.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
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
                  {project.integrations?.map((integration: any) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {integration.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{integration.name}</div>
                          <div className="text-xs text-muted-foreground">{integration.type}</div>
                        </div>
                      </div>
                      <Badge variant={integration.isEnabled ? 'default' : 'secondary'}>
                        {integration.isEnabled ? 'active' : 'inactive'}
                      </Badge>
                    </div>
                  )) || [
                    { name: 'No integrations', status: 'none' }
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">?</span>
                        </div>
                        <span className="font-medium text-sm text-muted-foreground">{integration.name}</span>
                      </div>
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

};

export default ProjectDetailsPage;