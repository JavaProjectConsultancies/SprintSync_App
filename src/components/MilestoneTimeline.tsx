import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Flag,
  ArrowRight
} from 'lucide-react';
import { Milestone, MilestoneStatus } from '../types';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestoneClick: (milestone: Milestone) => void;
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  onMilestoneClick
}) => {
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Mock user data
  const getUserById = (userId: string) => {
    const users: { [key: string]: { name: string; avatar?: string } } = {
      'user1': { name: 'Arjun Patel', avatar: '' },
      'user2': { name: 'Priya Sharma', avatar: '' },
      'user3': { name: 'Rahul Kumar', avatar: '' },
      'user4': { name: 'Sneha Reddy', avatar: '' },
      'user5': { name: 'Vikram Singh', avatar: '' }
    };
    return users[userId] || { name: 'Unknown User' };
  };

  // Sort milestones by due date
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // Group milestones by month
  const groupedMilestones = sortedMilestones.reduce((groups, milestone) => {
    const month = formatMonth(milestone.dueDate);
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(milestone);
    return groups;
  }, {} as { [key: string]: Milestone[] });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Milestone Timeline</span>
        </CardTitle>
        <CardDescription>
          Chronological view of project milestones
        </CardDescription>
      </CardHeader>

      <CardContent>
        {Object.keys(groupedMilestones).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No milestones to display</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMilestones).map(([month, monthMilestones]) => (
              <div key={month} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{month}</h3>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                <div className="space-y-3 relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>
                  
                  {monthMilestones.map((milestone, index) => {
                    const owner = getUserById(milestone.owner);
                    const isLast = index === monthMilestones.length - 1;
                    
                    return (
                      <TooltipProvider key={milestone.id}>
                        <div
                          className="relative flex items-start space-x-4 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                          onClick={() => onMilestoneClick(milestone)}
                        >
                          {/* Timeline dot */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full border-2 border-white ${
                              milestone.status === 'completed' 
                                ? 'bg-green-500' 
                                : milestone.status === 'delayed'
                                ? 'bg-red-500'
                                : milestone.status === 'at-risk'
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}></div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1 flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-sm truncate">
                                    {milestone.name}
                                  </h4>
                                  {milestone.isBlocker && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div>
                                          <Flag className="w-3 h-3 text-red-500" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Critical Blocker</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                
                                {milestone.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {milestone.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center space-x-3">
                                  <Badge 
                                    variant="outline" 
                                    className={`${getStatusColor(milestone.status)} text-xs`}
                                  >
                                    {getStatusIcon(milestone.status)}
                                    <span className="ml-1">{milestone.status.replace('-', ' ')}</span>
                                  </Badge>
                                  
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(milestone.dueDate)}
                                  </span>
                                  
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div>
                                        <Avatar className="w-5 h-5">
                                          <AvatarImage src={owner.avatar} alt={owner.name} />
                                          <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                                            {getInitials(owner.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{owner.name}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {milestone.deliverables && milestone.deliverables.length > 0 && (
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{milestone.deliverables.length} deliverable{milestone.deliverables.length !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>
                              
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                            </div>
                          </div>
                        </div>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneTimeline;