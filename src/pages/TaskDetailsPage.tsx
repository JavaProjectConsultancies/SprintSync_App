import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Plus, 
  MessageCircle, 
  Paperclip, 
  Clock, 
  User, 
  Target, 
  Flag,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Link,
  GitBranch,
  Activity,
  Eye,
  ThumbsUp,
  Send,
  MoreHorizontal
} from 'lucide-react';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  mentions?: string[];
  edited?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskActivity {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'status_change' | 'assignment' | 'comment' | 'attachment' | 'link';
}

const TaskDetailsPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Mock task data
  const [task, setTask] = useState({
    id: 'TASK-101',
    title: 'Implement User Authentication System',
    description: 'Design and develop a comprehensive user authentication system with JWT tokens, password reset functionality, and social login integration. This includes both frontend UI components and backend API endpoints.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Priya Mehta',
    reporter: 'Arjun Sharma',
    project: 'E-Commerce Platform',
    sprint: 'Sprint 3',
    storyPoints: 8,
    originalEstimate: 32,
    remainingEstimate: 16,
    timeLogged: 16,
    dueDate: '2024-02-15',
    createdDate: '2024-02-01',
    labels: ['authentication', 'backend', 'security']
  });

  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: 'sub-1', title: 'Design login/signup UI components', completed: true, assignee: 'Sneha Patel', dueDate: '2024-02-05' },
    { id: 'sub-2', title: 'Implement JWT token generation', completed: true, assignee: 'Priya Mehta', dueDate: '2024-02-08' },
    { id: 'sub-3', title: 'Add password reset functionality', completed: false, assignee: 'Priya Mehta', dueDate: '2024-02-12' },
    { id: 'sub-4', title: 'Integrate Google OAuth', completed: false, assignee: 'Rohit Kumar', dueDate: '2024-02-15' },
    { id: 'sub-5', title: 'Write unit tests for auth service', completed: false, assignee: 'Aman Singh', dueDate: '2024-02-18' }
  ]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: 'Arjun Sharma',
      content: 'Please make sure to follow our security guidelines for password hashing. Use bcrypt with at least 12 rounds.',
      timestamp: '2024-02-02T10:30:00Z',
      mentions: ['@priya-mehta']
    },
    {
      id: 'c2',
      author: 'Priya Mehta',
      content: 'JWT implementation is complete. Added refresh token mechanism for better security. @arjun-sharma please review.',
      timestamp: '2024-02-08T14:15:00Z',
      mentions: ['@arjun-sharma']
    },
    {
      id: 'c3',
      author: 'Sneha Patel',
      content: 'UI components are ready. Added proper validation states and error handling. Screenshots attached.',
      timestamp: '2024-02-09T09:45:00Z'
    }
  ]);

  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: 'att1',
      name: 'auth-api-documentation.pdf',
      url: '#',
      type: 'application/pdf',
      size: '2.3 MB',
      uploadedBy: 'Priya Mehta',
      uploadedAt: '2024-02-08T16:30:00Z'
    },
    {
      id: 'att2',
      name: 'login-ui-mockups.figma',
      url: '#',
      type: 'design/figma',
      size: '1.8 MB',
      uploadedBy: 'Sneha Patel',
      uploadedAt: '2024-02-05T11:20:00Z'
    }
  ]);

  const [activity, setActivity] = useState<TaskActivity[]>([
    {
      id: 'act1',
      user: 'Priya Mehta',
      action: 'moved',
      details: 'from To Do to In Progress',
      timestamp: '2024-02-08T09:00:00Z',
      type: 'status_change'
    },
    {
      id: 'act2',
      user: 'Arjun Sharma',
      action: 'assigned',
      details: 'task to Priya Mehta',
      timestamp: '2024-02-01T15:30:00Z',
      type: 'assignment'
    },
    {
      id: 'act3',
      user: 'Priya Mehta',
      action: 'logged',
      details: '4 hours of work',
      timestamp: '2024-02-08T17:00:00Z',
      type: 'comment'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffHours < 168) {
      return `${Math.floor(diffHours / 24)} days ago`;
    } else {
      return formatDate(timestamp);
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask: Subtask = {
        id: `sub-${Date.now()}`,
        title: newSubtask.trim(),
        completed: false
      };
      setSubtasks([...subtasks, subtask]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (subtaskId: string) => {
    setSubtasks(subtasks.map(sub => 
      sub.id === subtaskId ? { ...sub, completed: !sub.completed } : sub
    ));
  };

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `c-${Date.now()}`,
        author: 'Current User',
        content: newComment.trim(),
        timestamp: new Date().toISOString()
      };
      setComments([...comments, comment]);
      setNewComment('');
    }
  };

  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const progressPercentage = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Board
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="font-mono">
              {task.id}
            </Badge>
            <span className="text-muted-foreground">in</span>
            <Badge variant="secondary">{task.project}</Badge>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Watch
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                {isEditing ? (
                  <Input
                    value={task.title}
                    onChange={(e) => setTask(prev => ({ ...prev, title: e.target.value }))}
                    className="font-medium text-lg"
                  />
                ) : (
                  <h1 className="text-xl font-semibold">{task.title}</h1>
                )}
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <Badge variant="outline" className={getStatusColor(task.status)}>
                  {task.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {task.priority.toUpperCase()}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Target className="w-4 h-4" />
                  <span>{task.storyPoints} points</span>
                </div>
              </div>

              {isEditing ? (
                <Textarea
                  value={task.description}
                  onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={6}
                  className="resize-none"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p>{task.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Subtasks ({completedSubtasks}/{subtasks.length})</span>
                </CardTitle>
                <Badge variant="secondary">
                  {progressPercentage.toFixed(0)}% Complete
                </Badge>
              </div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={() => toggleSubtask(subtask.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </p>
                    {(subtask.assignee || subtask.dueDate) && (
                      <div className="flex items-center space-x-3 mt-1">
                        {subtask.assignee && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{subtask.assignee}</span>
                          </div>
                        )}
                        {subtask.dueDate && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(subtask.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="flex items-center space-x-2 pt-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
                />
                <Button size="sm" onClick={addSubtask}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Comments, Activity, Attachments */}
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0">
                <TabsList>
                  <TabsTrigger value="details">Comments ({comments.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity ({activity.length})</TabsTrigger>
                  <TabsTrigger value="attachments">Files ({attachments.length})</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="details" className="p-0">
                <CardContent className="pt-6">
                  {/* Add Comment */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                          CU
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Add a comment... Use @username to mention someone"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-muted-foreground">
                            Tip: Use @ to mention team members
                          </div>
                          <Button size="sm" onClick={addComment}>
                            <Send className="w-4 h-4 mr-2" />
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-6" />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(comment.timestamp)}
                            </span>
                            {comment.edited && (
                              <Badge variant="secondary" className="text-xs">edited</Badge>
                            )}
                          </div>
                          <div className="prose prose-sm max-w-none">
                            <p>{comment.content}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Like
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </TabsContent>

              <TabsContent value="activity" className="p-0">
                <CardContent className="pt-6">
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {activity.map((item) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{item.user}</span>
                              <span className="mx-1">{item.action}</span>
                              <span>{item.details}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTimestamp(item.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </TabsContent>

              <TabsContent value="attachments" className="p-0">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                    
                    <div className="space-y-3">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <Paperclip className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{attachment.name}</p>
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <span>{attachment.size}</span>
                                <span>•</span>
                                <span>by {attachment.uploadedBy}</span>
                                <span>•</span>
                                <span>{formatTimestamp(attachment.uploadedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Task Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={task.status} onValueChange={(value) => setTask(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">In Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={task.assignee} onValueChange={(value) => setTask(prev => ({ ...prev, assignee: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Priya Mehta">Priya Mehta</SelectItem>
                    <SelectItem value="Rohit Kumar">Rohit Kumar</SelectItem>
                    <SelectItem value="Sneha Patel">Sneha Patel</SelectItem>
                    <SelectItem value="Aman Singh">Aman Singh</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={task.priority} onValueChange={(value) => setTask(prev => ({ ...prev, priority: value }))}>
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

              {/* Story Points */}
              <div className="space-y-2">
                <Label>Story Points</Label>
                <Select value={task.storyPoints.toString()} onValueChange={(value) => setTask(prev => ({ ...prev, storyPoints: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="13">13</SelectItem>
                    <SelectItem value="21">21</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sprint */}
              <div className="space-y-2">
                <Label>Sprint</Label>
                <div className="text-sm">{task.sprint}</div>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={task.dueDate}
                  onChange={(e) => setTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              {/* Labels */}
              <div className="space-y-2">
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-1">
                  {task.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Time Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Original Estimate</Label>
                  <p className="font-medium">{task.originalEstimate}h</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Time Logged</Label>
                  <p className="font-medium text-blue-600">{task.timeLogged}h</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Remaining</Label>
                  <p className="font-medium text-orange-600">{task.remainingEstimate}h</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Progress</Label>
                  <p className="font-medium text-green-600">
                    {((task.timeLogged / task.originalEstimate) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <Progress value={(task.timeLogged / task.originalEstimate) * 100} className="h-2" />
              
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Log Work
              </Button>
            </CardContent>
          </Card>

          {/* Linked Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>Linked Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No linked issues</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Link Issue
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Git Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <GitBranch className="w-4 h-4" />
                <span>Development</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Branch:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    feature/auth-system
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Pull Requests:</span>
                  <Badge variant="secondary">2 open</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Commits:</span>
                  <span className="text-muted-foreground">8 commits</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  View on GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;