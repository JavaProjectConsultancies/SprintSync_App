import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar as CalendarIcon,
  User,
  Target,
  Flag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  Code,
  Database,
  Palette,
  Shield,
  Zap,
  FileText,
  Rocket,
  Search as SearchIcon,
  TrendingUp,
  Users
} from 'lucide-react';
import { Epic, EpicStatus } from '../types';
import { epicTemplates, EpicTemplate, createEpicFromTemplate } from '../data/epicTemplates';

interface EpicManagerProps {
  epics: Epic[];
  onAddEpic: (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateEpic: (epic: Epic) => void;
  onDeleteEpic: (epicId: string) => void;
  projectId: string;
  currentUserId: string;
}

const EpicManager: React.FC<EpicManagerProps> = ({
  epics,
  onAddEpic,
  onUpdateEpic,
  onDeleteEpic,
  projectId,
  currentUserId
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EpicStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EpicTemplate | null>(null);

  // Mock team members
  const teamMembers = [
    { id: 'user1', name: 'Arjun Patel', role: 'Product Manager', avatar: '' },
    { id: 'user2', name: 'Priya Sharma', role: 'Tech Lead', avatar: '' },
    { id: 'user3', name: 'Rahul Kumar', role: 'Scrum Master', avatar: '' },
    { id: 'user4', name: 'Sneha Reddy', role: 'Architect', avatar: '' },
    { id: 'user5', name: 'Vikram Singh', role: 'DevOps Lead', avatar: '' }
  ];

  // Filter epics based on search and filters
  const filteredEpics = epics.filter(epic => {
    const matchesSearch = epic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         epic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         epic.theme?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || epic.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || epic.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Get epic type icon
  const getEpicTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Star className="w-4 h-4" />;
      case 'platform': return <Code className="w-4 h-4" />;
      case 'infrastructure': return <Database className="w-4 h-4" />;
      case 'integration': return <Target className="w-4 h-4" />;
      case 'migration': return <Rocket className="w-4 h-4" />;
      case 'research': return <SearchIcon className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get epic type color
  const getEpicTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800';
      case 'platform': return 'bg-blue-100 text-blue-800';
      case 'infrastructure': return 'bg-purple-100 text-purple-800';
      case 'integration': return 'bg-orange-100 text-orange-800';
      case 'migration': return 'bg-red-100 text-red-800';
      case 'research': return 'bg-yellow-100 text-yellow-800';
      case 'performance': return 'bg-indigo-100 text-indigo-800';
      case 'security': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: EpicStatus) => {
    switch (status) {
      case 'backlog': return 'bg-gray-100 text-gray-800';
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'review': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Calculate epic statistics
  const epicStats = {
    total: epics.length,
    inProgress: epics.filter(e => e.status === 'in-progress').length,
    completed: epics.filter(e => e.status === 'completed').length,
    totalStoryPoints: epics.reduce((sum, epic) => sum + epic.storyPoints, 0),
    completedStoryPoints: epics.reduce((sum, epic) => sum + epic.completedStoryPoints, 0)
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      const newEpic = createEpicFromTemplate(selectedTemplate, projectId, currentUserId);
      onAddEpic(newEpic);
      setSelectedTemplate(null);
      setShowTemplateDialog(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Flag className="w-5 h-5 text-blue-600" />
                <span>Epic Management</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Organize and track large features and initiatives
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(true)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4 mr-2" />
                From Template
              </Button>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Epic
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{epicStats.total}</div>
              <div className="text-sm text-gray-600">Total Epics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{epicStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{epicStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{epicStats.totalStoryPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {epicStats.totalStoryPoints > 0 
                  ? Math.round((epicStats.completedStoryPoints / epicStats.totalStoryPoints) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search epics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
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

      {/* Epic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpics.map((epic) => (
          <Card key={epic.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">{epic.title}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className={`text-xs ${getStatusColor(epic.status)}`}>
                      {epic.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(epic.priority)}`}>
                      {epic.priority}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Epic</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Link Stories</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{epic.summary}</p>

              {/* Theme and Business Value */}
              {epic.theme && (
                <div className="flex items-center space-x-2">
                  <Flag className="w-4 h-4 text-purple-600" />
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {epic.theme}
                  </Badge>
                </div>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{epic.progress}%</span>
                </div>
                <Progress 
                  value={epic.progress} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{epic.completedStoryPoints}/{epic.storyPoints} points</span>
                  <span>{epic.linkedStories.length} stories</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{new Date(epic.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(epic.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Owner */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(teamMembers.find(m => m.id === epic.owner)?.name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    {teamMembers.find(m => m.id === epic.owner)?.name || 'Unknown'}
                  </span>
                </div>
                {epic.linkedMilestones.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {epic.linkedMilestones.length} milestones
                  </Badge>
                )}
              </div>

              {/* Labels */}
              {epic.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {epic.labels.slice(0, 3).map((label, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                      {label}
                    </Badge>
                  ))}
                  {epic.labels.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      +{epic.labels.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEpics.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No epics found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to see more epics.'
                : 'Create your first epic to start organizing large features and initiatives.'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Epic
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Epic Template</DialogTitle>
            <DialogDescription>
              Choose from predefined epic templates to quickly create common project initiatives.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {epicTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{template.title}</CardTitle>
                    <Badge variant="outline" className={`${getEpicTypeColor(template.type)}`}>
                      <div className="flex items-center space-x-1">
                        {getEpicTypeIcon(template.type)}
                        <span className="capitalize">{template.type}</span>
                      </div>
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`text-xs w-fit ${getPriorityColor(template.priority)}`}>
                    {template.priority} priority
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{template.summary}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{template.estimatedStoryPoints} story points</span>
                    <span className="text-gray-500">{template.estimatedDuration} weeks</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.labels.slice(0, 3).map((label, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFromTemplate}
              disabled={!selectedTemplate}
            >
              Create Epic from Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Epic Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Epic</DialogTitle>
            <DialogDescription>
              Create a new epic to organize and track large features or initiatives.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Epic Title *</Label>
              <Input id="title" placeholder="Enter epic title..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary *</Label>
              <Textarea id="summary" placeholder="Brief description of the epic..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)}>
              Create Epic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EpicManager;
