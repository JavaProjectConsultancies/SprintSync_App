import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { useUsers } from '../hooks/api/useUsers';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Calendar, 
  Plus, 
  Settings, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  Target,
  Zap,
  FileText,
  Code,
  TestTube,
  Rocket,
  Eye,
  User,
  Filter
} from 'lucide-react';
import { Milestone, MilestoneStatus, MilestoneType } from '../types';

interface MilestoneWidgetProps {
  projectId: string;
  milestones: Milestone[];
  onAddMilestone: () => void;
  onMilestoneClick: (milestone: Milestone) => void;
}

const MilestoneWidget = ({
  projectId,
  milestones,
  onAddMilestone,
  onMilestoneClick
}: MilestoneWidgetProps) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'delayed'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status'>('dueDate');

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on-track':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMilestoneIcon = (type: MilestoneType) => {
    switch (type) {
      case 'project-charter':
        return FileText;
      case 'requirements':
        return Target;
      case 'design':
        return Eye;
      case 'development':
        return Code;
      case 'testing':
        return TestTube;
      case 'deployment':
        return Rocket;
      case 'review':
        return CheckCircle2;
      case 'release':
        return Zap;
      default:
        return Flag;
    }
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'on-track':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'delayed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredMilestones = milestones
    .filter(milestone => {
      switch (filter) {
        case 'active':
          return ['on-track', 'at-risk', 'upcoming'].includes(milestone.status);
        case 'completed':
          return milestone.status === 'completed';
        case 'delayed':
          return milestone.status === 'delayed';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get real users from API
  const { data: apiUsers, loading: usersLoading } = useUsers();

  // Get user by ID from API data
  const getUserById = (userId: string) => {
    const user = apiUsers?.find(u => u.id === userId);
    return user ? { name: user.name, avatar: user.avatarUrl || '' } : { name: 'Unknown User', avatar: '' };
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-blue-600" />
              <span>Milestones</span>
            </CardTitle>
            <CardDescription>
              Track key project checkpoints and deliverables
            </CardDescription>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Open filters dialog */}}
              className="hidden sm:flex"
            >
              <Filter className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-primary border-0 text-white hover:opacity-90"
              onClick={onAddMilestone}
            >
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 px-4 pb-4 border-b">
          {[
            { key: 'all', label: 'All', count: milestones.length },
            { key: 'active', label: 'Active', count: milestones.filter(m => ['on-track', 'at-risk', 'upcoming'].includes(m.status)).length },
            { key: 'completed', label: 'Completed', count: milestones.filter(m => m.status === 'completed').length },
            { key: 'delayed', label: 'Delayed', count: milestones.filter(m => m.status === 'delayed').length }
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? 'default' : 'ghost'}
              size="sm"
              className="h-8"
              onClick={() => setFilter(tab.key as any)}
            >
              {tab.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Milestones List */}
        <ScrollArea className="h-96">
          {filteredMilestones.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No milestones found</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onAddMilestone}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Milestone
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-4">
              {filteredMilestones.map((milestone) => {
                const MilestoneIcon = getMilestoneIcon(milestone.type);
                const owner = getUserById(milestone.owner);
                const daysUntilDue = getDaysUntilDue(milestone.dueDate);
                
                return (
                  <TooltipProvider key={milestone.id}>
                    <div
                      className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => onMilestoneClick(milestone)}
                    >
                      <div className="flex items-start justify-between space-x-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            <MilestoneIcon className={`w-4 h-4 ${getPriorityColor(milestone.priority)}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium truncate">
                                {milestone.name}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(milestone.status)}
                              </div>
                            </div>
                            
                            {milestone.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {milestone.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(milestone.status)} text-xs`}
                                >
                                  {milestone.status.replace('-', ' ')}
                                </Badge>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(milestone.dueDate)}</span>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {daysUntilDue > 0 
                                        ? `${daysUntilDue} days remaining`
                                        : daysUntilDue === 0 
                                        ? 'Due today'
                                        : `${Math.abs(daysUntilDue)} days overdue`
                                      }
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Avatar className="w-6 h-6">
                                      <AvatarImage src={owner.avatar} alt={owner.name} />
                                      <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                                        {getInitials(owner.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Owner: {owner.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            
                            {milestone.progress > 0 && milestone.status !== 'completed' && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium">{milestone.progress}%</span>
                                </div>
                                <Progress value={milestone.progress} className="h-1" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMilestoneClick(milestone);
                          }}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </TooltipProvider>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Timeline View Toggle */}
        <div className="border-t p-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {/* Open timeline view */}}
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Timeline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneWidget;