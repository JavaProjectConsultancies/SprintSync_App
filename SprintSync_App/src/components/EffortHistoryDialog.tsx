import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  History, 
  Clock, 
  User, 
  Calendar, 
  Filter, 
  Download, 
  BarChart3,
  Target,
  CheckSquare,
  DollarSign,
  Timer,
  TrendingUp,
  Search
} from 'lucide-react';

interface EffortEntry {
  id: string;
  date: string;
  timeSpent: number; // in minutes
  resource: string;
  category: string;
  description?: string;
  billable: boolean;
}

interface Task {
  id: string;
  title: string;
  storyId?: string;
  assignee: string;
  efforts: EffortEntry[];
  totalEffort?: number;
}

interface Story {
  id: string;
  title: string;
  assignee?: string;
}

interface EffortHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  story?: Story | null;
  allTasks?: Task[];
  allStories?: Story[];
}

const EffortHistoryDialog: React.FC<EffortHistoryDialogProps> = ({ 
  open, 
  onOpenChange, 
  task = null,
  story = null,
  allTasks = [],
  allStories = []
}) => {
  const [activeTab, setActiveTab] = useState('task');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Helper function to format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Helper function to get initials
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get category color and icon
  const getCategoryInfo = (category: string) => {
    const categories: { [key: string]: { icon: string; color: string } } = {
      development: { icon: '💻', color: 'text-blue-600 bg-blue-50' },
      design: { icon: '🎨', color: 'text-purple-600 bg-purple-50' },
      testing: { icon: '🧪', color: 'text-green-600 bg-green-50' },
      documentation: { icon: '📝', color: 'text-yellow-600 bg-yellow-50' },
      meeting: { icon: '👥', color: 'text-orange-600 bg-orange-50' },
      research: { icon: '🔍', color: 'text-cyan-600 bg-cyan-50' },
      review: { icon: '👁️', color: 'text-indigo-600 bg-indigo-50' },
      deployment: { icon: '🚀', color: 'text-red-600 bg-red-50' }
    };
    return categories[category] || { icon: '⚡', color: 'text-gray-600 bg-gray-50' };
  };

  // Filter efforts based on current filters
  const filterEfforts = (efforts: EffortEntry[]) => {
    return efforts.filter(effort => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!effort.description?.toLowerCase().includes(searchLower) &&
            !effort.resource.toLowerCase().includes(searchLower) &&
            !effort.category.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (filterBy !== 'all' && effort.category !== filterBy) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const effortDate = new Date(effort.date);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - effortDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'week' && diffDays > 7) return false;
        if (dateFilter === 'month' && diffDays > 30) return false;
      }

      return true;
    });
  };

  // Get all efforts for different views
  const getTaskEfforts = () => {
    if (!task) return [];
    return filterEfforts(task.efforts || []);
  };

  const getStoryEfforts = () => {
    if (!story) return [];
    const storyTasks = allTasks.filter(t => t.storyId === story.id);
    const allEfforts = storyTasks.flatMap(t => (t.efforts || []).map(e => ({ ...e, taskId: t.id, taskTitle: t.title })));
    return filterEfforts(allEfforts);
  };

  const getAllProjectEfforts = () => {
    const allEfforts = allTasks.flatMap(t => 
      (t.efforts || []).map(e => ({ 
        ...e, 
        taskId: t.id, 
        taskTitle: t.title,
        storyId: t.storyId || 'No Story'
      }))
    );
    return filterEfforts(allEfforts);
  };

  // Calculate summary statistics
  const calculateSummary = (efforts: EffortEntry[]) => {
    const totalTime = efforts.reduce((sum, effort) => sum + effort.timeSpent, 0);
    const billableTime = efforts.filter(e => e.billable).reduce((sum, effort) => sum + effort.timeSpent, 0);
    const categories = [...new Set(efforts.map(e => e.category))];
    const resources = [...new Set(efforts.map(e => e.resource))];
    
    return {
      totalTime,
      billableTime,
      nonBillableTime: totalTime - billableTime,
      entriesCount: efforts.length,
      categoriesCount: categories.length,
      resourcesCount: resources.length,
      categories,
      resources
    };
  };

  const currentEfforts = activeTab === 'task' ? getTaskEfforts() : 
                       activeTab === 'story' ? getStoryEfforts() : 
                       getAllProjectEfforts();

  const summary = calculateSummary(currentEfforts);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <History className="w-4 h-4 text-white" />
            </div>
            <span>Effort History & Analytics</span>
          </DialogTitle>
          <DialogDescription>
            View detailed time tracking history, analyze work patterns, and generate insights.
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="space-y-6 py-2 pb-6">
              
              {/* Context Information */}
              {(task || story) && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="w-4 h-4 text-green-600" />
                      <h3 className="font-medium">Context</h3>
                    </div>
                    
                    {task && (
                      <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200 mb-2">
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                          <Badge variant="outline" className="text-xs bg-blue-100">
                            {task.id}
                          </Badge>
                          <span className="text-sm font-medium text-blue-900">{task.title}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <User className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-700">{task.assignee}</span>
                        </div>
                      </div>
                    )}
                    
                    {story && (
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-200">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-green-600" />
                          <Badge variant="outline" className="text-xs bg-green-100">
                            {story.id}
                          </Badge>
                          <span className="text-sm font-medium text-green-900">{story.title}</span>
                        </div>
                        {story.assignee && (
                          <div className="flex items-center space-x-2 mt-1">
                            <User className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-700">{story.assignee}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Filters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filters & Search</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-1">
                      <Label className="text-xs">Search</Label>
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search descriptions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-7 h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Select value={filterBy} onValueChange={setFilterBy}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="research">Research</SelectItem>
                          <SelectItem value="review">Code Review</SelectItem>
                          <SelectItem value="deployment">Deployment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="space-y-1">
                      <Label className="text-xs">Time Period</Label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="week">Last Week</SelectItem>
                          <SelectItem value="month">Last Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Export */}
                    <div className="space-y-1">
                      <Label className="text-xs">Export</Label>
                      <Button variant="outline" size="sm" className="h-8 w-full text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs for different views */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="task" disabled={!task} className="flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4" />
                    <span>Task History</span>
                  </TabsTrigger>
                  <TabsTrigger value="story" disabled={!story} className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Story History</span>
                  </TabsTrigger>
                  <TabsTrigger value="project" className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Project Overview</span>
                  </TabsTrigger>
                </TabsList>

                {/* Summary Statistics */}
                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Summary Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Total Time</div>
                        <div className="text-lg font-semibold text-green-600">{formatTime(summary.totalTime)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Billable</div>
                        <div className="text-lg font-semibold text-blue-600">{formatTime(summary.billableTime)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Non-Billable</div>
                        <div className="text-lg font-semibold text-orange-600">{formatTime(summary.nonBillableTime)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Entries</div>
                        <div className="text-lg font-semibold text-purple-600">{summary.entriesCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Categories</div>
                        <div className="text-lg font-semibold text-cyan-600">{summary.categoriesCount}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Resources</div>
                        <div className="text-lg font-semibold text-indigo-600">{summary.resourcesCount}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Effort History List */}
                <TabsContent value={activeTab} className="mt-4 space-y-2">
                  {currentEfforts.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">No Effort History</h3>
                        <p className="text-sm text-muted-foreground">
                          No time entries found for the selected filters. Start logging effort to see history here.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {currentEfforts
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((effort: any) => {
                          const categoryInfo = getCategoryInfo(effort.category);
                          return (
                            <Card key={effort.id} className="hover:shadow-sm transition-shadow">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${categoryInfo.color}`}>
                                        {categoryInfo.icon}
                                      </div>
                                      <span className="text-sm font-medium capitalize">{effort.category}</span>
                                      <Badge variant={effort.billable ? "default" : "secondary"} className="text-xs">
                                        <DollarSign className="w-3 h-3 mr-1" />
                                        {effort.billable ? 'Billable' : 'Non-billable'}
                                      </Badge>
                                      {effort.taskTitle && (
                                        <Badge variant="outline" className="text-xs">
                                          {effort.taskId}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {effort.description || 'No description provided'}
                                    </p>
                                    
                                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{effort.date}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <User className="w-3 h-3" />
                                        <span>{effort.resource}</span>
                                      </div>
                                      {effort.taskTitle && (
                                        <div className="flex items-center space-x-1">
                                          <CheckSquare className="w-3 h-3" />
                                          <span className="truncate max-w-32">{effort.taskTitle}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="text-right ml-4">
                                    <div className="flex items-center space-x-1 text-lg font-semibold text-green-600">
                                      <Timer className="w-4 h-4" />
                                      <span>{formatTime(effort.timeSpent)}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Separator />
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EffortHistoryDialog;