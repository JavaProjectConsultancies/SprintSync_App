import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Clock, 
  Target, 
  Flag, 
  Users,
  CheckCircle2,
  AlertTriangle,
  Star,
  Briefcase,
  GitBranch,
  Zap
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'deadline' | 'milestone' | 'meeting' | 'release' | 'sprint-start' | 'sprint-end';
  priority: 'critical' | 'high' | 'medium' | 'low';
  project: string;
  assignee?: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  time?: string;
  duration?: number; // in minutes
}

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  // Mock events data
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'evt-1',
      title: 'Sprint 3 Planning',
      description: 'Plan upcoming sprint with team and stakeholders',
      date: '2024-02-19',
      time: '10:00',
      duration: 120,
      type: 'meeting',
      priority: 'high',
      project: 'E-Commerce Platform',
      assignee: 'Arjun Sharma',
      status: 'upcoming'
    },
    {
      id: 'evt-2',
      title: 'User Authentication MVP',
      description: 'Complete implementation of user authentication system',
      date: '2024-02-20',
      type: 'milestone',
      priority: 'critical',
      project: 'E-Commerce Platform',
      assignee: 'Priya Mehta',
      status: 'in-progress'
    },
    {
      id: 'evt-3',
      title: 'Mobile App Beta Release',
      description: 'Deploy beta version to app stores for testing',
      date: '2024-02-22',
      type: 'release',
      priority: 'high',
      project: 'Mobile Banking App',
      assignee: 'Ananya Iyer',
      status: 'upcoming'
    },
    {
      id: 'evt-4',
      title: 'API Documentation Review',
      description: 'Review and finalize API documentation',
      date: '2024-02-15',
      type: 'deadline',
      priority: 'medium',
      project: 'API Service',
      assignee: 'Rohit Kumar',
      status: 'overdue'
    },
    {
      id: 'evt-5',
      title: 'Sprint 2 Retrospective',
      description: 'Team retrospective for continuous improvement',
      date: '2024-02-16',
      time: '15:00',
      duration: 90,
      type: 'meeting',
      priority: 'medium',
      project: 'E-Commerce Platform',
      status: 'completed'
    },
    {
      id: 'evt-6',
      title: 'Database Performance Optimization',
      description: 'Complete database query optimization and indexing',
      date: '2024-02-25',
      type: 'deadline',
      priority: 'high',
      project: 'E-Commerce Platform',
      assignee: 'Rohit Kumar',
      status: 'upcoming'
    },
    {
      id: 'evt-7',
      title: 'UI/UX Design Review',
      description: 'Final review of user interface designs',
      date: '2024-02-18',
      time: '14:00',
      duration: 180,
      type: 'meeting',
      priority: 'medium',
      project: 'Mobile Banking App',
      assignee: 'Sneha Patel',
      status: 'upcoming'
    },
    {
      id: 'evt-8',
      title: 'Security Audit Completion',
      description: 'Complete security audit and implement recommendations',
      date: '2024-03-01',
      type: 'milestone',
      priority: 'critical',
      project: 'Mobile Banking App',
      assignee: 'Ritu Sharma',
      status: 'upcoming'
    }
  ]);

  const projects = ['E-Commerce Platform', 'Mobile Banking App', 'API Service', 'AI Chat Support'];

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return Clock;
      case 'milestone': return Target;
      case 'meeting': return Users;
      case 'release': return Zap;
      case 'sprint-start': return GitBranch;
      case 'sprint-end': return GitBranch;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200';
      case 'milestone': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'release': return 'bg-green-100 text-green-800 border-green-200';
      case 'sprint-start': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sprint-end': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle2;
      case 'overdue': return AlertTriangle;
      case 'in-progress': return Clock;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesProject = filterProject === 'all' || event.project === filterProject;
    return matchesType && matchesProject;
  });

  // Get events for current month
  const currentMonthEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear();
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return currentMonthEvents.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Project Calendar</h1>
          <p className="text-muted-foreground">Track deadlines, milestones, and important events</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
              className="h-8 px-3"
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
              className="h-8 px-3"
            >
              Week
            </Button>
            <Button
              variant={view === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('day')}
              className="h-8 px-3"
            >
              Day
            </Button>
          </div>
          <Button className="bg-gradient-primary text-white border-0 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="release">Releases</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project} value={project}>{project}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Showing {currentMonthEvents.length} events</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    {currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <div key={index} className="min-h-[120px] border rounded-lg p-1">
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-blue-600 font-bold' : 'text-gray-900'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {getEventsForDate(day).slice(0, 3).map(event => {
                            const Icon = getEventTypeIcon(event.type);
                            const StatusIcon = getStatusIcon(event.status);
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded border-l-2 cursor-pointer hover:bg-gray-50 ${
                                  getPriorityColor(event.priority)
                                }`}
                                onClick={() => setSelectedDate(new Date(event.date))}
                              >
                                <div className="flex items-center space-x-1">
                                  <Icon className="w-3 h-3" />
                                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                  <span className="truncate flex-1">{event.title}</span>
                                </div>
                                {event.time && (
                                  <div className="text-muted-foreground mt-1">
                                    {formatTime(event.time)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {getEventsForDate(day).length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{getEventsForDate(day).length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => new Date(event.date) >= today && event.status !== 'completed')
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 10)
                    .map(event => {
                      const Icon = getEventTypeIcon(event.type);
                      const StatusIcon = getStatusIcon(event.status);
                      return (
                        <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-blue-600" />
                              {StatusIcon && <StatusIcon className="w-4 h-4 text-red-600" />}
                              <span className="font-medium text-sm">{event.title}</span>
                            </div>
                            <Badge variant="outline" className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(event.date)}</span>
                              {event.time && <span>at {formatTime(event.time)}</span>}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-3 h-3" />
                              <span>{event.project}</span>
                            </div>
                            {event.assignee && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{event.assignee}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Overdue Items */}
          {filteredEvents.some(event => event.status === 'overdue') && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base text-red-600 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Overdue</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => event.status === 'overdue')
                    .map(event => {
                      const Icon = getEventTypeIcon(event.type);
                      return (
                        <div key={event.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-red-600" />
                              <span className="font-medium text-sm text-red-900">{event.title}</span>
                            </div>
                          </div>
                          <div className="text-xs text-red-700 space-y-1">
                            <div>Due: {formatDate(event.date)}</div>
                            <div>{event.project}</div>
                            {event.assignee && <div>Assigned to: {event.assignee}</div>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* This Week Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Events</span>
                  <span className="font-medium">
                    {filteredEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - today.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return eventDate >= weekStart && eventDate <= weekEnd;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Deadlines</span>
                  <span className="font-medium text-red-600">
                    {filteredEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - today.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return event.type === 'deadline' && eventDate >= weekStart && eventDate <= weekEnd;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium text-blue-600">
                    {filteredEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - today.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return event.type === 'milestone' && eventDate >= weekStart && eventDate <= weekEnd;
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Meetings</span>
                  <span className="font-medium text-purple-600">
                    {filteredEvents.filter(event => {
                      const eventDate = new Date(event.date);
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - today.getDay());
                      const weekEnd = new Date(weekStart);
                      weekEnd.setDate(weekStart.getDate() + 6);
                      return event.type === 'meeting' && eventDate >= weekStart && eventDate <= weekEnd;
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Deadlines</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Milestones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Meetings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Releases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-orange-600" />
                  <span>Sprint Events</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;