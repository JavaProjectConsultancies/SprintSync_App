import React, { useState, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { 
  Search,
  Filter,
  SortAsc,
  MoreHorizontal,
  GripVertical,
  Clock,
  PlayCircle,
  Shield,
  CheckCircle2,
  BookOpen,
  Star,
  Bug,
  Code,
  Database,
  Palette,
  FileText,
  Search as SearchIcon,
  X
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'backlog' | 'stories' | 'todo' | 'inprogress' | 'qa' | 'done';
  assignee?: string;
  avatar?: string;
  sprintId?: string;
  projectId?: string;
  createdAt: string;
  description?: string;
  labels?: string[];
  epic?: string;
  components?: string[];
}

interface Task {
  id: string;
  title: string;
  storyId?: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  avatar?: string;
  dueDate: string;
  status: 'todo' | 'inprogress' | 'qa' | 'done';
  progress?: number;
  labels?: string[];
  type?: 'db' | 'api' | 'ui' | 'qa' | 'devops' | 'research' | 'bug' | 'issue';
}

interface ScrumBoardEnhancedProps {
  stories: Story[];
  tasks: Task[];
  onMoveStory: (id: string, newStatus: string) => void;
  onMoveTask: (id: string, newStatus: string) => void;
  onAddStory: () => void;
  onAddTask: (status: string) => void;
}

const ScrumBoardEnhanced: React.FC<ScrumBoardEnhancedProps> = ({
  stories,
  tasks,
  onMoveStory,
  onMoveTask,
  onAddStory,
  onAddTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Get all unique values for filters
  const allLabels = [...new Set([...stories.flatMap(s => s.labels || []), ...tasks.flatMap(t => t.labels || [])])];
  const allAssignees = [...new Set([...stories.map(s => s.assignee).filter(Boolean), ...tasks.map(t => t.assignee)])];
  const allTypes = [...new Set(tasks.map(t => t.type).filter(Boolean))];

  // Filter and sort functions
  const filterItems = useCallback((items: (Story | Task)[]) => {
    return items.filter(item => {
      // Search filter
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
        return false;
      }
      
      // Assignee filter
      if (assigneeFilter !== 'all') {
        const itemAssignee = 'assignee' in item ? item.assignee : item.assignee;
        if (itemAssignee !== assigneeFilter) {
          return false;
        }
      }
      
      // Label filter
      if (labelFilter !== 'all') {
        const itemLabels = item.labels || [];
        if (!itemLabels.includes(labelFilter)) {
          return false;
        }
      }
      
      // Type filter (for tasks)
      if (typeFilter !== 'all' && 'type' in item && item.type !== typeFilter) {
        return false;
      }
      
      return true;
    });
  }, [searchTerm, priorityFilter, assigneeFilter, labelFilter, typeFilter]);

  const sortItems = useCallback((items: (Story | Task)[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'assignee':
          const aAssignee = 'assignee' in a ? a.assignee || '' : a.assignee;
          const bAssignee = 'assignee' in b ? b.assignee || '' : b.assignee;
          return aAssignee.localeCompare(bAssignee);
        case 'points':
          if ('points' in a && 'points' in b) {
            return b.points - a.points;
          }
          return 0;
        default:
          return 0;
      }
    });
  }, [sortBy]);

  // Get filtered and sorted items by status
  const getItemsByStatus = (status: string, itemType: 'story' | 'task') => {
    const items = itemType === 'story' 
      ? stories.filter(s => s.status === status)
      : tasks.filter(t => t.status === status);
    
    return sortItems(filterItems(items));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'db': return <Database className="w-3 h-3" />;
      case 'api': return <Code className="w-3 h-3" />;
      case 'ui': return <Palette className="w-3 h-3" />;
      case 'qa': return <Bug className="w-3 h-3" />;
      case 'devops': return <FileText className="w-3 h-3" />;
      case 'research': return <SearchIcon className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'db': return 'bg-blue-100 text-blue-800';
      case 'api': return 'bg-green-100 text-green-800';
      case 'ui': return 'bg-purple-100 text-purple-800';
      case 'qa': return 'bg-red-100 text-red-800';
      case 'devops': return 'bg-orange-100 text-orange-800';
      case 'research': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on items:`, selectedItems);
    setSelectedItems([]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setLabelFilter('all');
    setTypeFilter('all');
  };

  const hasActiveFilters = searchTerm || priorityFilter !== 'all' || assigneeFilter !== 'all' || labelFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Enhanced Header with Filters */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-600" />
                <Input
                  placeholder="Search stories and tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
                    Active
                  </Badge>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions ({selectedItems.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkAction('move-to-todo')}>
                      Move to To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('move-to-inprogress')}>
                      Move to In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('assign')}>
                      Assign
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="priority">Sort by Priority</SelectItem>
                  <SelectItem value="title">Sort by Title</SelectItem>
                  <SelectItem value="assignee">Sort by Assignee</SelectItem>
                  <SelectItem value="points">Sort by Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-white rounded-lg border">
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Assignee</label>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    {allAssignees.map(assignee => (
                      <SelectItem key={assignee} value={assignee}>
                        {assignee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Labels</label>
                <Select value={labelFilter} onValueChange={setLabelFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labels</SelectItem>
                    {allLabels.map(label => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {allTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="capitalize">{type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stories Column */}
        <Card className="bg-gradient-to-b from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Stories</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {getItemsByStatus('stories', 'story').length}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddStory}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Add Story
              </Button>
            </div>
            <div className="space-y-3">
              {getItemsByStatus('stories', 'story').map((story) => (
                <div
                  key={story.id}
                  className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    selectedItems.includes(story.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleItemSelect(story.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedItems.includes(story.id)}
                        onChange={() => handleItemSelect(story.id)}
                      />
                      <span className="text-xs font-medium text-green-700">{story.id}</span>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(story.priority)}`}>
                        {story.priority.charAt(0).toUpperCase()}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Story</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{story.title}</h4>
                  
                  {story.labels && story.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {story.labels.map((label, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {story.points} pts
                    </Badge>
                    {story.assignee && (
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{getInitials(story.assignee)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{story.assignee.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task Columns */}
        {[
          { status: 'todo', title: 'To Do', icon: <Clock className="w-5 h-5 text-blue-600" />, color: 'blue' },
          { status: 'inprogress', title: 'In Progress', icon: <PlayCircle className="w-5 h-5 text-orange-600" />, color: 'orange' },
          { status: 'qa', title: 'QA', icon: <Shield className="w-5 h-5 text-purple-600" />, color: 'purple' },
          { status: 'done', title: 'Done', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />, color: 'emerald' }
        ].map(({ status, title, icon, color }) => (
          <Card key={status} className={`bg-gradient-to-b from-${color}-50 to-${color}-100/50 border-${color}-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {icon}
                  <h3 className={`font-semibold text-${color}-800`}>{title}</h3>
                  <Badge variant="secondary" className={`bg-${color}-100 text-${color}-800`}>
                    {getItemsByStatus(status, 'task').length}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddTask(status)}
                  className={`border-${color}-300 text-${color}-700 hover:bg-${color}-50`}
                >
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {getItemsByStatus(status, 'task').map((task) => {
                  // Determine if it's a task or issue based on type or other criteria
                  const isIssue = task.type === 'bug' || task.type === 'issue' || task.labels?.includes('bug') || task.labels?.includes('issue');
                  
                  return (
                  <div
                    key={task.id}
                    className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      selectedItems.includes(task.id) 
                        ? 'ring-2 ring-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleItemSelect(task.id)}
                    style={{
                      backgroundColor: isIssue ? '#ff0000' : '#00ff00',
                      borderColor: isIssue ? '#cc0000' : '#00cc00',
                      borderWidth: '4px',
                      borderStyle: 'solid',
                      backgroundImage: 'none !important',
                      background: isIssue ? '#ff0000 !important' : '#00ff00 !important'
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          checked={selectedItems.includes(task.id)}
                          onChange={() => handleItemSelect(task.id)}
                        />
                        <span className="text-xs font-medium text-blue-600">{task.id}</span>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase()}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <h5 className="font-medium text-xs mb-1 line-clamp-2">{task.title}</h5>
                    
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {task.labels.map((label, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {task.type && (
                          <Badge variant="outline" className={`text-xs ${getTypeColor(task.type)}`}>
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(task.type)}
                              <span className="capitalize">{task.type}</span>
                            </div>
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-xs">{getInitials(task.assignee || 'Unassigned')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{task.assignee?.split(' ')[0] || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                ));
                })
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScrumBoardEnhanced;
