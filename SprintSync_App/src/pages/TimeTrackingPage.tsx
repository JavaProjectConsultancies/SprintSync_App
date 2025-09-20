import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Clock, 
  Play, 
  Pause,
  Square,
  Calendar, 
  Users, 
  Timer,
  BarChart3,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';

const TimeTrackingPage: React.FC = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentTask, setCurrentTask] = useState('User Authentication Module');
  const [elapsedTime, setElapsedTime] = useState('02:34:16');

  const timeEntries = [
    {
      id: 1,
      task: 'User Authentication Module',
      project: 'E-Commerce Platform',
      user: 'Arjun Patel',
      startTime: '09:00',
      endTime: '12:30',
      duration: '3h 30m',
      date: '2024-02-23',
      status: 'completed',
      billable: true,
      category: 'Development'
    },
    {
      id: 2,
      task: 'UI Design Review',
      project: 'Mobile Banking App',
      user: 'Priya Sharma',
      startTime: '14:00',
      endTime: '16:45',
      duration: '2h 45m',
      date: '2024-02-23',
      status: 'completed',
      billable: true,
      category: 'Design'
    },
    {
      id: 3,
      task: 'Sprint Planning Meeting',
      project: 'E-Commerce Platform',
      user: 'Rahul Kumar',
      startTime: '10:00',
      endTime: '11:30',
      duration: '1h 30m',
      date: '2024-02-23',
      status: 'completed',
      billable: false,
      category: 'Meeting'
    },
    {
      id: 4,
      task: 'Payment Gateway Integration',
      project: 'E-Commerce Platform',
      user: 'Sneha Reddy',
      startTime: '13:15',
      endTime: 'Active',
      duration: '2h 34m',
      date: '2024-02-23',
      status: 'active',
      billable: true,
      category: 'Development'
    }
  ];

  const teamStats = [
    {
      name: 'Arjun Patel',
      role: 'Senior Developer',
      todayHours: '7h 30m',
      weekHours: '38h 15m',
      utilization: 95,
      avatar: ''
    },
    {
      name: 'Priya Sharma',
      role: 'UI/UX Designer',
      todayHours: '6h 45m',
      weekHours: '35h 20m',
      utilization: 88,
      avatar: ''
    },
    {
      name: 'Sneha Reddy',
      role: 'Full Stack Developer',
      todayHours: '8h 10m',
      weekHours: '40h 30m',
      utilization: 101,
      avatar: ''
    },
    {
      name: 'Rahul Kumar',
      role: 'Project Manager',
      todayHours: '5h 20m',
      weekHours: '32h 45m',
      utilization: 82,
      avatar: ''
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Development': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Design': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Meeting': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Testing': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 90) return 'text-green-600';
    if (utilization > 80) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Time Tracking</h1>
          <p className="text-muted-foreground">Track and manage work hours across projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
            <BarChart3 className="w-4 h-4 mr-2" />
            Time Reports
          </Button>
        </div>
      </div>

      {/* Active Timer */}
      <Card className="bg-gradient-light border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Timer className="w-5 h-5 text-green-600" />
                <span className="text-sm text-muted-foreground">Currently working on</span>
              </div>
              <h3 className="text-lg font-semibold">{currentTask}</h3>
              <p className="text-sm text-muted-foreground">E-Commerce Platform</p>
            </div>
            <div className="text-center space-y-4">
              <div className="text-3xl font-mono font-bold text-green-600">
                {elapsedTime}
              </div>
              <div className="flex items-center space-x-2">
                {!isTracking ? (
                  <Button 
                    onClick={() => setIsTracking(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => setIsTracking(false)}
                      variant="outline"
                      className="border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button 
                      onClick={() => {setIsTracking(false); setElapsedTime('00:00:00');}}
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Hours</p>
                <p className="text-2xl font-semibold">7h 45m</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-semibold text-green-600">38h 20m</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Average</p>
                <p className="text-2xl font-semibold">36h 40m</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-semibold text-orange-600">92%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Tracking Tabs */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Recent Entries</TabsTrigger>
          <TabsTrigger value="team">Team Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4 mt-6">
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{entry.task}</h4>
                        <Badge variant="outline" className={getStatusColor(entry.status)}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(entry.category)}>
                          {entry.category}
                        </Badge>
                        {entry.billable && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Billable
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{entry.project}</span>
                        <span>•</span>
                        <span>{entry.user}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                        <span>•</span>
                        <span>{entry.startTime} - {entry.endTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{entry.duration}</p>
                      {entry.status === 'active' && (
                        <div className="flex items-center space-x-1 text-sm text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teamStats.map((member) => (
              <Card key={member.name}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Today</p>
                          <p className="font-semibold">{member.todayHours}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">This Week</p>
                          <p className="font-semibold">{member.weekHours}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilization</span>
                          <span className={getUtilizationColor(member.utilization)}>
                            {member.utilization}%
                          </span>
                        </div>
                        <Progress value={Math.min(member.utilization, 100)} className="h-2" />
                        {member.utilization > 100 && (
                          <div className="flex items-center space-x-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            <span>Over capacity</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Time Distribution</CardTitle>
                <CardDescription>Hours by project category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Development</span>
                    </div>
                    <span className="text-sm font-medium">65% (26h)</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Design</span>
                    </div>
                    <span className="text-sm font-medium">25% (10h)</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Meetings</span>
                    </div>
                    <span className="text-sm font-medium">10% (4h)</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Productivity Insights</CardTitle>
                <CardDescription>AI-powered recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Peak Hours</p>
                    <p className="text-xs text-muted-foreground">
                      You're most productive between 10 AM - 12 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Weekly Trend</p>
                    <p className="text-xs text-muted-foreground">
                      15% increase in productivity this week
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Balance Alert</p>
                    <p className="text-xs text-muted-foreground">
                      Consider taking breaks every 2 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTrackingPage;