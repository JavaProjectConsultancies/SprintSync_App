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
import { useCreateEpic } from '../hooks/api/useEpics';
import { useUsers } from '../hooks/api/useUsers';
import { Epic as ApiEpic } from '../types/api';
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

const EpicManager = ({
  epics,
  onAddEpic,
  onUpdateEpic,
  onDeleteEpic,
  projectId,
  currentUserId
}: EpicManagerProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'planned' | 'in-progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EpicTemplate | null>(null);
  
  // API integration
  const { createEpic: createEpicApi, loading: createLoading, error: createError } = useCreateEpic();
  const { data: apiUsers, loading: usersLoading, error: usersError } = useUsers();

  // Form state for creating new epic (matching project creation structure)
  const [newEpic, setNewEpic] = useState({
    name: '',
    description: '',
    summary: '',
    theme: '',
    businessValue: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'draft' as 'draft' | 'planned' | 'in-progress' | 'completed',
    startDate: '',
    endDate: '',
    assigneeId: 'unassigned',
    storyPoints: 0
  });

  // Filter epics based on search and filters
  const filteredEpics = epics.filter(epic => {
    if (!epic) return false;
    
    const matchesSearch = (epic.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (epic.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (epic.theme?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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

  // Helper function to convert API Epic to local Epic format for display
  const convertApiEpicToLocal = (apiEpic: ApiEpic): Epic => {
    // Map API status to local status
    const mapApiStatusToLocal = (status: string): EpicStatus => {
      switch (status) {
        case 'PLANNING': return 'planning';
        case 'ACTIVE': return 'in-progress';
        case 'COMPLETED': return 'completed';
        case 'CANCELLED': return 'cancelled';
        default: return 'planning';
      }
    };

    // Map API priority to local priority
    const mapApiPriorityToLocal = (priority: string): 'low' | 'medium' | 'high' | 'critical' => {
      switch (priority) {
        case 'LOW': return 'low';
        case 'MEDIUM': return 'medium';
        case 'HIGH': return 'high';
        case 'CRITICAL': return 'critical';
        default: return 'medium';
      }
    };

    return {
      id: apiEpic.id,
      projectId: apiEpic.projectId,
      title: apiEpic.title,
      description: apiEpic.description || '',
      summary: apiEpic.summary || '',
      priority: mapApiPriorityToLocal(apiEpic.priority),
      status: mapApiStatusToLocal(apiEpic.status),
      assigneeId: apiEpic.assigneeId,
      owner: apiEpic.owner,
      startDate: apiEpic.startDate || new Date().toISOString(),
      endDate: apiEpic.endDate || new Date().toISOString(),
      progress: apiEpic.progress || 0,
      storyPoints: apiEpic.storyPoints || 0,
      completedStoryPoints: 0, // API doesn't provide this, default to 0
      linkedMilestones: [], // API doesn't provide this
      linkedStories: [], // API doesn't provide this
      labels: [], // API doesn't provide this
      components: [], // API doesn't provide this
      theme: apiEpic.theme || '',
      businessValue: apiEpic.businessValue || '',
      acceptanceCriteria: [], // API doesn't provide this
      risks: [], // API doesn't provide this
      dependencies: [], // API doesn't provide this
      createdAt: apiEpic.createdAt,
      updatedAt: apiEpic.updatedAt,
      completedAt: undefined
    };
  };

  // Handle creating epic from template
  const handleCreateFromTemplate = async () => {
    if (selectedTemplate) {
      try {
        // Create epic from template (local format)
        const templateEpic = createEpicFromTemplate(selectedTemplate, projectId, currentUserId);
        
        // Map template epic data to API structure
        const apiEpicData: Omit<ApiEpic, 'id' | 'createdAt' | 'updatedAt'> = {
          title: templateEpic.title || selectedTemplate.title,
          description: templateEpic.description || selectedTemplate.description,
          summary: templateEpic.summary || selectedTemplate.summary,
          theme: templateEpic.theme || selectedTemplate.theme,
          businessValue: templateEpic.businessValue || selectedTemplate.businessValue,
          projectId: projectId,
          status: 'PLANNING', // Map 'backlog' from template to 'PLANNING' for API
          priority: mapPriorityToApi(templateEpic.priority || selectedTemplate.priority),
          owner: currentUserId,
          assigneeId: templateEpic.assigneeId || undefined,
          startDate: templateEpic.startDate ? new Date(templateEpic.startDate).toISOString().split('T')[0] : undefined,
          endDate: templateEpic.endDate ? new Date(templateEpic.endDate).toISOString().split('T')[0] : undefined,
          storyPoints: templateEpic.storyPoints || selectedTemplate.estimatedStoryPoints || 0,
          progress: 0,
          isActive: true
        };

        // Save epic to database via API
        const createdEpicResponse = await createEpicApi(apiEpicData);
        console.log('Epic created from template successfully:', createdEpicResponse);
        
        // Convert API epic to local format for display
        const localEpic = convertApiEpicToLocal(createdEpicResponse.data);
        
        // Call the parent callback to refresh the epic list with the created epic
        onAddEpic(localEpic);
        
        // Reset template selection and close dialog
        setSelectedTemplate(null);
        setShowTemplateDialog(false);
      } catch (error) {
        console.error('Failed to create epic from template:', error);
        // Error is already handled by the hook
      }
    }
  };

  // Handle creating epic manually
  const handleCreateEpic = async () => {
    if (newEpic.name.trim()) {
      try {
        // Map form data to API structure
        const apiEpicData: Omit<ApiEpic, 'id' | 'createdAt' | 'updatedAt'> = {
          title: newEpic.name.trim(),
          description: newEpic.description.trim(),
          summary: newEpic.summary.trim(),
          theme: newEpic.theme.trim(),
          businessValue: newEpic.businessValue.trim(),
          projectId: projectId,
          status: mapStatusToApi(newEpic.status),
          priority: mapPriorityToApi(newEpic.priority),
          owner: currentUserId,
          assigneeId: newEpic.assigneeId === 'unassigned' ? undefined : newEpic.assigneeId,
          startDate: newEpic.startDate || undefined,
          endDate: newEpic.endDate || undefined,
          storyPoints: newEpic.storyPoints || 0,
          progress: 0,
          isActive: true
        };

        const createdEpicResponse = await createEpicApi(apiEpicData);
        console.log('Epic created successfully:', createdEpicResponse);
        
        // Convert API epic to local format for display
        const localEpic = convertApiEpicToLocal(createdEpicResponse.data);
        
        // Call the parent callback to refresh the epic list with the created epic
        onAddEpic(localEpic);
        
        setShowAddDialog(false);
        
        // Reset form
        setNewEpic({
          name: '',
          description: '',
          summary: '',
          theme: '',
          businessValue: '',
          priority: 'medium',
          status: 'draft',
          startDate: '',
          endDate: '',
          assigneeId: 'unassigned',
          storyPoints: 0
        });
      } catch (error) {
        console.error('Failed to create epic:', error);
        // Error is already handled by the hook
      }
    }
  };

  // Helper functions to map form values to API enum values
  const mapStatusToApi = (status: string): 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' => {
    switch (status) {
      case 'draft': return 'PLANNING';
      case 'planned': return 'PLANNING';
      case 'in-progress': return 'ACTIVE';
      case 'completed': return 'COMPLETED';
      default: return 'PLANNING';
    }
  };

  const mapPriorityToApi = (priority: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    switch (priority) {
      case 'low': return 'LOW';
      case 'medium': return 'MEDIUM';
      case 'high': return 'HIGH';
      case 'critical': return 'CRITICAL';
      default: return 'MEDIUM';
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setNewEpic(prev => ({
      ...prev,
      [field]: value
    }));
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
                variant="outline"
                onClick={() => setShowAddDialog(true)}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
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
        {filteredEpics.map((epic, index) => (
          <Card key={epic.id || (epic as any)._id || `${epic.title || 'epic'}-${index}`} className="hover:shadow-lg transition-shadow">
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
                  <span>{epic.completedStoryPoints || 0}/{epic.storyPoints || 0} points</span>
                  <span>{epic.linkedStories?.length || 0} stories</span>
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
                      {getInitials(apiUsers?.find(u => u.id === epic.owner)?.name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    {apiUsers?.find(u => u.id === epic.owner)?.name || 'Unknown'}
                  </span>
                </div>
                {(epic.linkedMilestones?.length || 0) > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {epic.linkedMilestones?.length || 0} milestones
                  </Badge>
                )}
              </div>

              {/* Labels */}
              {(epic.labels?.length || 0) > 0 && (
                <div className="flex flex-wrap gap-1">
                  {epic.labels?.slice(0, 3).map((label, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-gray-50">
                      {label}
                    </Badge>
                  ))}
                  {(epic.labels?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs bg-gray-50">
                      +{(epic.labels?.length || 0) - 3}
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
          {createError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{createError}</p>
            </div>
          )}
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
                    {template.labels?.slice(0, 3).map((label, index) => (
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
            <Button 
              variant="outline" 
              onClick={() => setShowTemplateDialog(false)}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFromTemplate}
              disabled={!selectedTemplate || createLoading}
            >
              {createLoading ? 'Creating...' : 'Create Epic from Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Epic Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Add New Epic</DialogTitle>
            <DialogDescription>
              Create a new epic to organize large features and initiatives.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 px-6 max-h-[60vh]">
            {createError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{createError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="epic-name">Epic Name *</Label>
              <Input
                id="epic-name"
                placeholder="Enter epic name"
                value={newEpic.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-description">Description</Label>
              <Textarea
                id="epic-description"
                placeholder="Describe the epic"
                value={newEpic.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-summary">Summary</Label>
              <Input
                id="epic-summary"
                placeholder="Brief summary of the epic"
                value={newEpic.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-theme">Theme</Label>
              <Input
                id="epic-theme"
                placeholder="Epic theme or category"
                value={newEpic.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-business-value">Business Value</Label>
              <Textarea
                id="epic-business-value"
                placeholder="Describe the business value"
                value={newEpic.businessValue}
                onChange={(e) => handleInputChange('businessValue', e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic-priority">Priority</Label>
                <Select value={newEpic.priority} onValueChange={(value) => handleInputChange('priority', value)}>
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
              <div className="space-y-2">
                <Label htmlFor="epic-status">Status</Label>
                <Select value={newEpic.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic-assignee">Assignee</Label>
                <Select
                  value={newEpic.assigneeId}
                  onValueChange={(value) => handleInputChange('assigneeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {apiUsers && apiUsers.length > 0 ? (
                      apiUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        {usersLoading ? 'Loading users...' : 'No users available'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="epic-story-points">Story Points</Label>
                <Input
                  id="epic-story-points"
                  type="number"
                  placeholder="Estimated story points"
                  value={newEpic.storyPoints}
                  onChange={(e) => handleInputChange('storyPoints', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic-start-date">Start Date</Label>
                <Input
                  id="epic-start-date"
                  type="date"
                  value={newEpic.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="epic-end-date">End Date</Label>
                <Input
                  id="epic-end-date"
                  type="date"
                  value={newEpic.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEpic} disabled={!newEpic.name.trim() || createLoading}>
              {createLoading ? 'Creating...' : 'Add Epic'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EpicManager;
