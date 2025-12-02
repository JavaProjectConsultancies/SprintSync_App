import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useUsers } from '../hooks/api/useUsers';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Calendar as CalendarIcon, 
  User, 
  Plus, 
  X, 
  Target,
  FileText,
  Code,
  TestTube,
  Rocket,
  Eye,
  CheckCircle2,
  Zap,
  Flag
} from 'lucide-react';
import { Milestone, MilestoneStatus, MilestoneType, Deliverable, Epic } from '../types';
import { epicTemplates, EpicTemplate } from '../data/epicTemplates';


interface MilestoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone?: Milestone;
  projectId: string;
  onSave: (milestone: Milestone) => void;
  availableEpics?: Epic[];
}

const MilestoneDialog = ({
  open,
  onOpenChange,
  milestone,
  projectId,
  onSave,
  availableEpics = []
}: MilestoneDialogProps) => {
  const [formData, setFormData] = useState<Partial<Milestone>>({
    name: '',
    description: '',
    dueDate: '',
    status: 'upcoming',
    priority: 'medium',
    owner: '',
    progress: 0,
    type: 'custom',
    deliverables: [],
    isBlocker: false,
    linkedEpics: []
  });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [newDeliverable, setNewDeliverable] = useState('');

  // Get real team members from API
  const { data: apiUsers, loading: usersLoading } = useUsers();

  useEffect(() => {
    if (milestone) {
      setFormData(milestone);
      setSelectedDate(new Date(milestone.dueDate));
    } else {
      setFormData({
        name: '',
        description: '',
        dueDate: '',
        status: 'upcoming',
        priority: 'medium',
        owner: '',
        progress: 0,
        type: 'custom',
        deliverables: [],
        isBlocker: false
      });
      setSelectedDate(undefined);
    }
  }, [milestone, open]);

  const milestoneTypes = [
    { value: 'project-charter', label: 'Project Charter', icon: FileText },
    { value: 'requirements', label: 'Requirements', icon: Target },
    { value: 'design', label: 'Design Phase', icon: Eye },
    { value: 'development', label: 'Development', icon: Code },
    { value: 'testing', label: 'Testing Phase', icon: TestTube },
    { value: 'deployment', label: 'Deployment', icon: Rocket },
    { value: 'review', label: 'Review & QA', icon: CheckCircle2 },
    { value: 'release', label: 'Release', icon: Zap },
    { value: 'custom', label: 'Custom', icon: Flag }
  ];

  const statusOptions = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'on-track', label: 'On Track' },
    { value: 'at-risk', label: 'At Risk' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const handleSave = () => {
    if (!formData.name || !formData.dueDate || !formData.owner) {
      return; // Validation
    }

    const milestoneData: Milestone = {
      id: milestone?.id || `milestone-${Date.now()}`,
      projectId,
      name: formData.name!,
      description: formData.description || '',
      dueDate: formData.dueDate!,
      status: formData.status as MilestoneStatus,
      priority: formData.priority as 'low' | 'medium' | 'high' | 'critical',
      owner: formData.owner!,
      progress: formData.progress || 0,
      type: formData.type as MilestoneType,
      linkedTasks: formData.linkedTasks || [],
      linkedStories: formData.linkedStories || [],
      deliverables: formData.deliverables || [],
      dependencies: formData.dependencies || [],
      isBlocker: formData.isBlocker || false,
      createdAt: milestone?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: formData.status === 'completed' ? new Date().toISOString() : undefined
    };

    onSave(milestoneData);
    onOpenChange(false);
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      const deliverable: Deliverable = {
        id: `deliverable-${Date.now()}`,
        milestoneId: milestone?.id || 'new',
        name: newDeliverable.trim(),
        description: '',
        status: 'pending'
      };
      
      setFormData(prev => ({
        ...prev,
        deliverables: [...(prev.deliverables || []), deliverable]
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.filter((_, i) => i !== index) || []
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {milestone ? 'Edit Milestone' : 'Create New Milestone'}
          </DialogTitle>
          <DialogDescription>
            Define a key project checkpoint with deliverables and timeline.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Milestone Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Requirements Sign-off"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the milestone objectives and key deliverables..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Milestone Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as MilestoneType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {milestoneTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4" />
                              <span>{type.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Epic Linking */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-purple-600" />
                <h3 className="font-medium">Epic Association</h3>
              </div>
              
              <div className="space-y-2">
                <Label>Link to Epics (optional)</Label>
                <Select
                  value=""
                  onValueChange={(epicId) => {
                    if (epicId && !formData.linkedEpics?.includes(epicId)) {
                      setFormData(prev => ({
                        ...prev,
                        linkedEpics: [...(prev.linkedEpics || []), epicId]
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an epic to link..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEpics
                      .filter(epic => !formData.linkedEpics?.includes(epic.id))
                      .map((epic) => (
                        <SelectItem key={epic.id} value={epic.id}>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {epic.theme}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {epic.storyPoints} pts
                              </span>
                            </div>
                            <span className="truncate">{epic.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.linkedEpics && formData.linkedEpics.length > 0 && (
                <div className="space-y-2">
                  <Label>Linked Epics</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.linkedEpics.map((epicId) => {
                      const epic = availableEpics.find(e => e.id === epicId);
                      return epic ? (
                        <Badge 
                          key={epicId} 
                          variant="outline" 
                          className="bg-purple-50 text-purple-700 border-purple-200 flex items-center space-x-1"
                        >
                          <span className="truncate max-w-32">{epic.title}</span>
                          <button
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                linkedEpics: prev.linkedEpics?.filter(id => id !== epicId) || []
                              }));
                            }}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Timeline & Assignment */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? selectedDate.toLocaleDateString('en-IN', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setFormData(prev => ({ 
                            ...prev, 
                            dueDate: date ? date.toISOString() : '' 
                          }));
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Owner *</Label>
                  <Select
                    value={formData.owner}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, owner: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {apiUsers && apiUsers.length > 0 ? (
                        apiUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground ml-1">({user.role || 'User'})</span>
                              </div>
                            </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as MilestoneStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Progress ({formData.progress}%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      progress: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Deliverables */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Deliverables</Label>
                <Badge variant="secondary" className="text-xs">
                  {formData.deliverables?.length || 0} items
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add deliverable..."
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDeliverable()}
                  />
                  <Button onClick={addDeliverable} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.deliverables && formData.deliverables.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formData.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm flex-1">{deliverable.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => removeDeliverable(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Additional Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Critical Blocker</Label>
                  <p className="text-xs text-muted-foreground">
                    Mark if this milestone blocks other project activities
                  </p>
                </div>
                <Switch
                  checked={formData.isBlocker}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocker: checked }))}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-primary border-0 text-white hover:opacity-90"
            disabled={!formData.name || !formData.dueDate || !formData.owner}
          >
            {milestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MilestoneDialog;