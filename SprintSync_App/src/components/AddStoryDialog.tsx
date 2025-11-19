import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Plus, X, Target, User, Flag, BookOpen, CheckCircle2, FileText, Star, Bug, Code, Search, Paperclip, Link, Upload, Trash2, Eye } from 'lucide-react';
import { storyTemplates, StoryTemplate, getStoriesByType } from '../data/storyTemplates';
import { Epic } from '../types';

interface Story {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  points: number;
  status: 'stories' | 'todo' | 'inprogress' | 'qa' | 'done';
  assignee?: string;
  avatar?: string;
  description?: string;
  acceptanceCriteria?: string[];
}

interface AddStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStory: (story: Omit<Story, 'id'>) => void;
  availableEpics?: Epic[];
}

const AddStoryDialog: React.FC<AddStoryDialogProps> = ({ open, onOpenChange, onAddStory, availableEpics = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    points: 1,
    assignee: '',
    acceptanceCriteria: [''],
    templateId: 'none',
    labels: [] as string[],
    epicId: 'none'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<Array<{ url: string; name: string }>>([]);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentUrlName, setAttachmentUrlName] = useState<string>('');

  // Team members list (in real app, this would come from props or context)
  const teamMembers = [
    { name: 'Arjun Patel', avatar: '', role: 'Senior Developer' },
    { name: 'Priya Sharma', avatar: '', role: 'UI/UX Designer' },
    { name: 'Sneha Reddy', avatar: '', role: 'QA Engineer' },
    { name: 'Rahul Kumar', avatar: '', role: 'DevOps Engineer' },
    { name: 'Vikram Singh', avatar: '', role: 'Full Stack Developer' },
    { name: 'Ananya Gupta', avatar: '', role: 'Product Manager' }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Story title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Story description is required';
    }

    if (formData.points < 1 || formData.points > 21) {
      newErrors.points = 'Story points must be between 1 and 21';
    }

    if (!formData.assignee) {
      newErrors.assignee = 'Please assign someone to this story';
    }

    const validCriteria = formData.acceptanceCriteria.filter(criteria => criteria.trim());
    if (validCriteria.length === 0) {
      newErrors.acceptanceCriteria = 'At least one acceptance criteria is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const validCriteria = formData.acceptanceCriteria.filter(criteria => criteria.trim());
    
    const newStory: Omit<Story, 'id'> & { attachments?: File[]; attachmentUrls?: Array<{ url: string; name: string }> } = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      points: formData.points,
      status: 'stories',
      assignee: formData.assignee,
      acceptanceCriteria: validCriteria,
      attachments: attachments.length > 0 ? attachments : undefined,
      attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined
    };

    onAddStory(newStory);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      points: 1,
      assignee: '',
      acceptanceCriteria: [''],
      templateId: 'none',
      labels: [],
      epicId: 'none'
    });
    setErrors({});
    setAttachments([]);
    setAttachmentUrls([]);
    setAttachmentUrl('');
    setAttachmentUrlName('');
  };

  // File upload handlers
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setAttachments(prev => [...prev, ...fileArray]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // URL handlers
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    if (!attachmentUrl.trim()) {
      return;
    }

    if (!isValidUrl(attachmentUrl.trim())) {
      setErrors(prev => ({ ...prev, attachmentUrl: 'Please enter a valid URL (must start with http:// or https://)' }));
      return;
    }

    setAttachmentUrls(prev => [...prev, { url: attachmentUrl.trim(), name: attachmentUrlName.trim() || attachmentUrl.trim() }]);
    setAttachmentUrl('');
    setAttachmentUrlName('');
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.attachmentUrl;
      return newErrors;
    });
  };

  const handleRemoveUrl = (index: number) => {
    setAttachmentUrls(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const addAcceptanceCriteria = () => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: [...prev.acceptanceCriteria, '']
    }));
  };

  const removeAcceptanceCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== index)
    }));
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.map((criteria, i) => 
        i === index ? value : criteria
      )
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPointsColor = (points: number) => {
    if (points <= 3) return 'text-green-600';
    if (points <= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Template selection handlers
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') {
      setFormData(prev => ({
        ...prev,
        templateId: 'none',
        labels: []
      }));
      return;
    }

    const template = storyTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId: template.id,
        title: template.title,
        description: template.description,
        priority: template.priority,
        points: template.points,
        acceptanceCriteria: template.acceptanceCriteria,
        labels: template.labels
      }));
    }
  };

  const getStoryTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Star className="w-4 h-4" />;
      case 'enhancement': return <Target className="w-4 h-4" />;
      case 'bug-fix': return <Bug className="w-4 h-4" />;
      case 'technical': return <Code className="w-4 h-4" />;
      case 'research': return <Search className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getStoryTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-green-100 text-green-800';
      case 'enhancement': return 'bg-blue-100 text-blue-800';
      case 'bug-fix': return 'bg-red-100 text-red-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'research': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[75%] max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span>Create New User Story</span>
          </DialogTitle>
          <DialogDescription>
            Add a new user story to your product backlog. Stories represent features or functionality from the user's perspective.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-hidden px-6">
          <div
            className="h-full overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar scroll-smooth"
            style={{ maxHeight: 'calc(90vh - 160px)' }}
          >
            <div className="space-y-8 py-4 pb-6">
            {/* Template Selection */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-medium">Story Template</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Choose a template (optional)</Label>
                  <Select 
                    value={formData.templateId} 
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a story template..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No template (Custom story)</SelectItem>
                      <SelectItem value="feature-user-auth">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-green-600" />
                          <span>User Authentication Feature</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Feature</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="feature-payment">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-green-600" />
                          <span>Payment Processing Feature</span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">Feature</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="enhancement-performance">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span>Performance Optimization</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">Enhancement</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="bug-crash-fix">
                        <div className="flex items-center space-x-2">
                          <Bug className="w-4 h-4 text-red-600" />
                          <span>Application Crash Fix</span>
                          <Badge variant="outline" className="bg-red-100 text-red-800">Bug Fix</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="technical-refactor">
                        <div className="flex items-center space-x-2">
                          <Code className="w-4 h-4 text-purple-600" />
                          <span>Code Refactoring</span>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">Technical</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="research-technology">
                        <div className="flex items-center space-x-2">
                          <Search className="w-4 h-4 text-yellow-600" />
                          <span>Technology Evaluation</span>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Research</Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-3">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium">Story Details</h3>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-1">
                    <span>Story Title</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="As a user, I want to..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={errors.title ? 'border-red-300' : ''}
                  />
                  {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center space-x-1">
                    <span>Description</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed description of the user story..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`min-h-[100px] ${errors.description ? 'border-red-300' : ''}`}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Priority and Points */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: 'high' | 'medium' | 'low') => 
                        setFormData(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4 text-red-600" />
                            <span>High Priority</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4 text-yellow-600" />
                            <span>Medium Priority</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center space-x-2">
                            <Flag className="w-4 h-4 text-green-600" />
                            <span>Low Priority</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points">Story Points</Label>
                    <Select 
                      value={formData.points.toString()} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, points: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 8, 13, 21].map(point => (
                          <SelectItem key={point} value={point.toString()}>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${getPointsColor(point)}`}>{point}</span>
                              <span className="text-muted-foreground">
                                {point <= 3 && '(Small)'}
                                {point > 3 && point <= 8 && '(Medium)'}
                                {point > 8 && '(Large)'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.points && <p className="text-sm text-red-600">{errors.points}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Assignment</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignee" className="flex items-center space-x-1">
                    <span>Assign to</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.assignee} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}
                  >
                    <SelectTrigger className={errors.assignee ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Select team member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.name} value={member.name}>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{member.name}</span>
                              <span className="text-xs text-muted-foreground">{member.role}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assignee && <p className="text-sm text-red-600">{errors.assignee}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Acceptance Criteria */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium">Acceptance Criteria</h3>
                    <span className="text-red-500">*</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addAcceptanceCriteria}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Criteria</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.acceptanceCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Acceptance criteria ${index + 1}...`}
                          value={criteria}
                          onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                          className="min-h-[80px]"
                        />
                      </div>
                      {formData.acceptanceCriteria.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAcceptanceCriteria(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.acceptanceCriteria && <p className="text-sm text-red-600">{errors.acceptanceCriteria}</p>}
              </CardContent>
            </Card>

            {/* Epic Association */}
            {availableEpics.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Flag className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium">Epic Association</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="epic">Link to Epic (optional)</Label>
                    <Select 
                      value={formData.epicId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, epicId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an epic..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No epic (Standalone story)</SelectItem>
                        {availableEpics.map((epic) => (
                          <SelectItem key={epic.id} value={epic.id}>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                {epic.theme}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {epic.storyPoints} pts
                              </span>
                              <span className="truncate">{epic.title}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.epicId !== 'none' && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      {(() => {
                        const selectedEpic = availableEpics.find(epic => epic.id === formData.epicId);
                        return selectedEpic ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-purple-100 text-purple-800">
                                {selectedEpic.theme}
                              </Badge>
                              <span className="text-sm font-medium">{selectedEpic.title}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{selectedEpic.summary}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{selectedEpic.storyPoints} story points</span>
                              <span>{selectedEpic.linkedStories?.length || 0} stories</span>
                              <span>{selectedEpic.progress}% complete</span>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Labels */}
            {formData.labels.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Flag className="w-4 h-4 text-purple-600" />
                    <h3 className="font-medium">Labels</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.labels.map((label, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <h3 className="font-medium">Attachments (Optional)</h3>
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload-story">Upload File</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFileSelect(e.dataTransfer.files);
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files) handleFileSelect(target.files);
                      };
                      input.click();
                    }}
                  >
                    <div className="text-center">
                      <Paperclip className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Drop files here or click to browse</p>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                {/* URL Input Section */}
                <div className="space-y-2">
                  <Label htmlFor="url-input-story">Add URL/Link</Label>
                  <div className="space-y-2">
                    <Input
                      id="url-input-story"
                      type="url"
                      placeholder="https://example.com/document.pdf"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Input
                      id="url-name-input-story"
                      type="text"
                      placeholder="Link name (optional)"
                      value={attachmentUrlName}
                      onChange={(e) => setAttachmentUrlName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddUrl}
                      disabled={!attachmentUrl.trim()}
                      className="w-full"
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                  {errors.attachmentUrl && <p className="text-sm text-red-600">{errors.attachmentUrl}</p>}
                </div>

                {/* Files List */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Files</Label>
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URLs List */}
                {attachmentUrls.length > 0 && (
                  <div className="space-y-2">
                    <Label>Links</Label>
                    {attachmentUrls.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-green-200 rounded-lg hover:bg-green-50 bg-green-50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                            <Link className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 break-all line-clamp-1">{item.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(item.url, '_blank')}
                            title="Open link"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveUrl(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-4 h-4 text-green-600" />
                  <h3 className="font-medium">Story Preview</h3>
                </div>
                
                <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-green-700">US-NEW</span>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(formData.priority)}`}>
                        {formData.priority}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formData.points} points
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-green-900 mb-2">
                    {formData.title || 'Story title will appear here...'}
                  </h4>
                  
                  {formData.description && (
                    <p className="text-sm text-green-800 mb-3">
                      {formData.description}
                    </p>
                  )}
                  
                  {formData.assignee && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                          {getInitials(formData.assignee)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-green-800">{formData.assignee}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-6 pb-6">
          <Separator />
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90">
              Create Story
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddStoryDialog;