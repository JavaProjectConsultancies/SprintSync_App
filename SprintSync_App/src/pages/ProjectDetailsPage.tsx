import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useProjectById } from '../hooks/api/useProjectById';
import { useRequirements } from '../hooks/api/useRequirements';
import { useTeamMembers } from '../hooks/api/useTeamMembers';
import { useProjectActivities } from '../hooks/api/useActivityLogs';
import EpicManager from '../components/EpicManager';
import TeamManager from '../components/TeamManager';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { attachmentApiService } from '../services/api';
import { epicApiService } from '../services/api/entities/epicApi';
import { toast } from 'sonner';
import { Epic as ApiEpic } from '../types/api';
import { Epic, EpicStatus } from '../types';
import { 
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  GitBranch,
  Settings,
  Flag,
  Star,
  Activity,
  FileText,
  Link,
  Workflow,
  Zap,
  Plus,
  Upload,
  Download,
  Trash2,
  Eye
} from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  tasks: number;
  completedTasks: number;
}

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'mitigating' | 'resolved';
  owner: string;
}

// Helper function to convert API Epic to local Epic format
const convertApiEpicToLocal = (apiEpic: ApiEpic): Epic => {
  const mapApiStatusToLocal = (status: string): EpicStatus => {
    switch (status) {
      case 'PLANNING': return 'planning';
      case 'ACTIVE': return 'in-progress';
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      default: return 'planning';
    }
  };

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
    completedStoryPoints: 0,
    linkedMilestones: [],
    linkedStories: [],
    labels: [],
    components: [],
    theme: apiEpic.theme || '',
    businessValue: apiEpic.businessValue || '',
    acceptanceCriteria: [],
    risks: [],
    dependencies: [],
    createdAt: apiEpic.createdAt,
    updatedAt: apiEpic.updatedAt,
    completedAt: undefined
  };
};

const ProjectDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch real project data from API
  const { project, loading, error, refetch } = useProjectById(id || '');
  
  // Fetch requirements for the project
  const { requirements, createRequirement, loading: requirementsLoading } = useRequirements(id || '');
  
  // Fetch team members for the project
  const { 
    teamMembers: apiTeamMembers, 
    loading: teamLoading, 
    addTeamMemberToProject, 
    removeTeamMemberFromProject, 
    refreshTeamMembers 
  } = useTeamMembers(id || '');
  
  // Fetch all project-related activity logs (includes project creation and all activities)
  const { 
    activityLogs, 
    loading: activityLogsLoading, 
    error: activityLogsError,
    refetch: refetchActivities
  } = useProjectActivities(id || '', 30); // Last 30 days
  
  // Local state for epics to handle real-time updates
  const [localEpics, setLocalEpics] = useState<any[]>([]);
  const [localRequirements, setLocalRequirements] = useState<any[]>([]);
  const [isAddRequirementDialogOpen, setIsAddRequirementDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'requirement' | 'attachment'>('attachment');
  
  // Team management state
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);
  const [localTeamMembers, setLocalTeamMembers] = useState<any[]>([]);
  
  // Attachment state
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentUrlName, setAttachmentUrlName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Requirement form state
  const [requirementForm, setRequirementForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    type: 'functional',
    acceptanceCriteria: ''
  });
  
  // Function to fetch epics from API
  const fetchEpicsFromApi = useCallback(async () => {
    if (!id) return;
    try {
      const response = await epicApiService.getEpicsByProject(id);
      // Handle different response structures
      let epicsData: ApiEpic[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          epicsData = response.data;
        } else if (Array.isArray((response.data as any).content)) {
          epicsData = (response.data as any).content;
        } else if (Array.isArray((response.data as any).data)) {
          epicsData = (response.data as any).data;
        }
      }
      
      if (epicsData.length > 0) {
        const convertedEpics = epicsData.map(convertApiEpicToLocal);
        // Deduplicate epics by ID to prevent duplicates
        const uniqueEpics = convertedEpics.reduce((acc, epic) => {
          if (!acc.find(e => e.id === epic.id)) {
            acc.push(epic);
          }
          return acc;
        }, [] as Epic[]);
        setLocalEpics(uniqueEpics);
      } else {
        // If no epics returned, only clear if we don't have any local epics
        // This prevents clearing newly added epics before API is updated
        setLocalEpics(prev => prev.length === 0 ? [] : prev);
      }
    } catch (error) {
      console.error('Error fetching epics:', error);
      // Don't show error toast on every refresh, just log it
      // toast.error('Failed to refresh epics');
    }
  }, [id]);

  // Fetch epics on mount and when project ID changes
  useEffect(() => {
    if (id) {
      fetchEpicsFromApi();
    }
  }, [id, fetchEpicsFromApi]); // Fetch epics directly from API, not from project.epics to avoid duplicates

  // Update local requirements when API data changes
  useEffect(() => {
    setLocalRequirements(requirements);
  }, [requirements]);

  // Update local team members when API data changes
  useEffect(() => {
    console.log('ProjectDetailsPage: Team members update effect triggered', {
      apiTeamMembersCount: apiTeamMembers.length,
      apiTeamMembers: apiTeamMembers,
      projectTeamMembersCount: project?.teamMembers?.length || 0,
      projectId: id
    });
    
    if (apiTeamMembers && apiTeamMembers.length > 0) {
      console.log('Setting team members from API:', apiTeamMembers);
      setLocalTeamMembers(apiTeamMembers);
    } else if (project?.teamMembers && project.teamMembers.length > 0) {
      // Fallback to project team members if API data is not available
      console.log('Setting team members from project data:', project.teamMembers);
      setLocalTeamMembers(project.teamMembers);
    } else {
      console.log('No team members found, setting empty array');
      setLocalTeamMembers([]);
    }
  }, [apiTeamMembers, project?.teamMembers, id]);

  // Fetch attachments when project ID changes
  useEffect(() => {
    const loadAttachments = async () => {
      if (!id) return;
      try {
        setIsLoadingAttachments(true);
        const response = await attachmentApiService.getAttachmentsByEntity('project', id);
        if (response.data) {
          setAttachments(response.data);
        }
      } catch (error) {
        console.error('Error loading attachments:', error);
      } finally {
        setIsLoadingAttachments(false);
      }
    };
    loadAttachments();
  }, [id]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Handle file upload or URL submission
  const handleUploadFile = async () => {
    if (!id || !user) {
      toast.error('Project ID or user not found');
      return;
    }

    // Check if uploading a file or URL
    const isUrlUpload = attachmentUrl.trim().length > 0;
    const isFileUpload = selectedFile !== null;

    if (!isFileUpload && !isUrlUpload) {
      toast.error('Please select a file or enter a URL');
      return;
    }

    try {
      setIsUploading(true);

      if (isUrlUpload) {
        // Validate URL
        if (!isValidUrl(attachmentUrl.trim())) {
          toast.error('Please enter a valid URL (must start with http:// or https://)');
          setIsUploading(false);
          return;
        }

        // Create URL attachment record
        const attachmentData = {
          uploadedBy: user.id,
          entityType: 'project',
          entityId: id,
          fileName: attachmentUrlName.trim() || attachmentUrl.trim(),
          fileSize: undefined,
          fileType: 'url',
          fileUrl: attachmentUrl.trim(),
          attachmentType: 'url' as const,
          isPublic: false
        };

        const response = await attachmentApiService.createAttachment(attachmentData);
        
        if (response.success) {
          toast.success('URL added successfully');
          setAttachmentUrl('');
          setAttachmentUrlName('');
          
          // Reload attachments
          const refreshResponse = await attachmentApiService.getAttachmentsByEntity('project', id);
          if (refreshResponse.data) {
            setAttachments(refreshResponse.data);
          }
        } else {
          toast.error('Failed to add URL');
        }
      } else if (isFileUpload && selectedFile) {
        // Read file as base64 for now (in production, use proper file storage)
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          
          // Create file attachment record
          const attachmentData = {
            uploadedBy: user.id,
            entityType: 'project',
            entityId: id,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type,
            fileUrl: base64Data, // Store as base64, in production use proper storage URL
            attachmentType: 'file' as const,
            isPublic: false
          };

          const response = await attachmentApiService.createAttachment(attachmentData);
          
          if (response.success) {
            toast.success('File uploaded successfully');
            setSelectedFile(null);
            
            // Reload attachments
            const refreshResponse = await attachmentApiService.getAttachmentsByEntity('project', id);
            if (refreshResponse.data) {
              setAttachments(refreshResponse.data);
            }
          } else {
            toast.error('Failed to upload file');
          }
        };
        
        reader.readAsDataURL(selectedFile);
      }
    } catch (error) {
      console.error('Error uploading attachment:', error);
      toast.error('Failed to upload attachment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      const response = await attachmentApiService.deleteAttachment(attachmentId);
      if (response.success) {
        toast.success('File deleted successfully');
        // Reload attachments
        if (id) {
          const refreshResponse = await attachmentApiService.getAttachmentsByEntity('project', id);
          if (refreshResponse.data) {
            setAttachments(refreshResponse.data);
          }
        }
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file. Please try again.');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Format activity message with detailed information
  const formatActivityMessage = (activityLog: any) => {
    const action = (activityLog.action || '').toLowerCase();
    const description = activityLog.description || '';
    const entityType = activityLog.entityType || '';
    
    // If description exists, use it
    if (description) {
      return description;
    }
    
    // Format action to readable text
    const formattedAction = action
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
    
    // Parse JSON values
    let newVals: any = null;
    let oldVals: any = null;
    try {
      if (activityLog.newValues) {
        newVals = typeof activityLog.newValues === 'string' 
          ? JSON.parse(activityLog.newValues) 
          : activityLog.newValues;
      }
      if (activityLog.oldValues) {
        oldVals = typeof activityLog.oldValues === 'string' 
          ? JSON.parse(activityLog.oldValues) 
          : activityLog.oldValues;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    // Project creation
    if (entityType === 'project' && action === 'created') {
      const projectName = newVals?.name || newVals?.title || 'the project';
      return `created project "${projectName}"`;
    }
    
    // Story creation
    if (entityType === 'story' && action === 'created') {
      const storyTitle = newVals?.title || newVals?.name || 'a story';
      return `created story "${storyTitle}"`;
    }
    
    // Task creation
    if (entityType === 'task' && action === 'created') {
      const taskTitle = newVals?.title || newVals?.name || 'a task';
      return `created task "${taskTitle}"`;
    }
    
    // Epic creation
    if (entityType === 'epic' && action === 'created') {
      const epicTitle = newVals?.title || newVals?.name || 'an epic';
      return `created epic "${epicTitle}"`;
    }
    
    // Assignment changes
    if (action.includes('assign') || action === 'assigned') {
      const oldAssignee = oldVals?.assigneeId || oldVals?.assignedTo || oldVals?.assignee;
      const newAssignee = newVals?.assigneeId || newVals?.assignedTo || newVals?.assignee;
      const entityName = newVals?.title || newVals?.name || oldVals?.title || oldVals?.name || entityType;
      
      if (newAssignee && !oldAssignee) {
        return `assigned "${entityName}" to user ${newAssignee}`;
      } else if (newAssignee && oldAssignee && newAssignee !== oldAssignee) {
        return `reassigned "${entityName}" from user ${oldAssignee} to user ${newAssignee}`;
      } else if (oldAssignee && !newAssignee) {
        return `unassigned "${entityName}" from user ${oldAssignee}`;
      }
    }
    
    // Team member addition
    if (entityType === 'project_team_member' && (action === 'created' || action === 'added')) {
      const userName = newVals?.userName || newVals?.name || newVals?.userId || 'a team member';
      const role = newVals?.role || '';
      if (role) {
        return `added ${userName} as ${role} to the project`;
      }
      return `added ${userName} to the project team`;
    }
    
    // Status changes
    if (action.includes('status') || (oldVals?.status && newVals?.status && oldVals.status !== newVals.status)) {
      const entityName = newVals?.title || newVals?.name || oldVals?.title || oldVals?.name || entityType;
      const oldStatus = oldVals?.status || '';
      const newStatus = newVals?.status || '';
      if (oldStatus && newStatus) {
        return `changed status of "${entityName}" from ${oldStatus} to ${newStatus}`;
      } else if (newStatus) {
        return `set status of "${entityName}" to ${newStatus}`;
      }
    }
    
    // Priority changes
    if (action.includes('priority') || (oldVals?.priority && newVals?.priority && oldVals.priority !== newVals.priority)) {
      const entityName = newVals?.title || newVals?.name || oldVals?.title || oldVals?.name || entityType;
      const oldPriority = oldVals?.priority || '';
      const newPriority = newVals?.priority || '';
      if (oldPriority && newPriority) {
        return `changed priority of "${entityName}" from ${oldPriority} to ${newPriority}`;
      }
    }
    
    // General updates
    if (action === 'updated' || action === 'update') {
      const entityName = newVals?.title || newVals?.name || oldVals?.title || oldVals?.name || entityType;
      return `updated ${entityType} "${entityName}"`;
    }
    
    // Try to extract entity name
    const entityName = newVals?.title || newVals?.name || oldVals?.title || oldVals?.name || '';
    
    if (entityName) {
      return `${formattedAction} "${entityName}"`;
    } else if (entityType && entityType !== 'project') {
      return `${formattedAction} ${entityType}`;
    }
    
    return formattedAction;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'The requested project could not be found.'}
            </p>
            <Button onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use real milestones from API or empty array if none
  const milestones: Milestone[] = project.milestones?.map((milestone: any) => ({
    id: milestone.id,
    title: milestone.name,
    description: milestone.description || '',
    dueDate: milestone.dueDate,
    status: milestone.status === 'completed' ? 'completed' : 
            milestone.status === 'in-progress' ? 'in-progress' : 'upcoming',
    progress: milestone.progress || 0,
    tasks: 0, // Not available in current API
    completedTasks: 0 // Not available in current API
  })) || [];

  // Use real risks from API
  const risks: Risk[] = project.risks?.map((risk: any) => {
    // Find the owner name from team members
    const ownerMember = project.teamMembers?.find((member: any) => member.id === risk.owner);
    const ownerName = ownerMember ? ownerMember.name : risk.owner || 'Unknown';
    
    return {
      id: risk.id,
      title: risk.title,
      description: risk.description || '',
      probability: risk.probability as 'low' | 'medium' | 'high',
      impact: risk.impact as 'low' | 'medium' | 'high',
      mitigation: risk.mitigation || '',
      status: risk.status === 'identified' ? 'identified' : 
              risk.status === 'mitigated' ? 'mitigating' : 'resolved',
      owner: ownerName
    };
  }) || [];

  // Team management handlers
  const handleTeamMembersChange = async (newTeamMembers: any[]) => {
    setLocalTeamMembers(newTeamMembers);
    
    // Refresh the team members from API to get updated data
    await refreshTeamMembers();
    
    // Also refresh the project data to update the team count
    await refetch();
  };

  const handleAddTeamMember = async (userId: string, role: string, isTeamLead: boolean = false) => {
    if (!id) return;
    
    try {
      await addTeamMemberToProject(id, userId, role, isTeamLead);
      await handleTeamMembersChange(localTeamMembers);
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!id) return;
    
    try {
      await removeTeamMemberFromProject(id, userId);
      await handleTeamMembersChange(localTeamMembers);
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Use local team members with real workload and performance
  const teamMembers = localTeamMembers.map((member: any) => {
    // Handle performance - it can be a number or an object
    let performanceValue = 85; // Default
    if (typeof member.performance === 'number') {
      performanceValue = member.performance;
    } else if (member.performance && typeof member.performance === 'object') {
      // If it's an object, extract a numeric value (e.g., from velocity or a rating)
      performanceValue = member.performance.velocity || member.performance.rating || 85;
    }
    
    // Handle skills - can be array or string
    let skillsArray: string[] = [];
    if (Array.isArray(member.skills)) {
      skillsArray = member.skills.filter((s: any) => s && s.trim());
    } else if (typeof member.skills === 'string' && member.skills.trim()) {
      try {
        const parsed = JSON.parse(member.skills);
        skillsArray = Array.isArray(parsed) ? parsed.filter((s: any) => s && s.trim()) : [member.skills.trim()];
      } catch {
        skillsArray = member.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s && s.length > 0);
      }
    }
    
    // Handle workload - use from API or calculate from allocationPercentage
    let workloadValue = member.workload;
    if (workloadValue === undefined || workloadValue === null) {
      // Use allocationPercentage as workload if workload not provided
      workloadValue = member.allocationPercentage || 0;
    }
    
    // Handle availability - use from API or allocationPercentage
    let availabilityValue = member.availability;
    if (availabilityValue === undefined || availabilityValue === null) {
      // Use allocationPercentage as availability if availability not provided
      availabilityValue = member.allocationPercentage || 100;
    }
    
    return {
      name: member.name || 'Unknown Member',
      role: member.role || 'Team Member',
      avatar: member.avatar || member.avatarUrl || '',
      workload: Math.max(0, Math.min(100, Number(workloadValue) || 0)), // Clamp between 0-100
      performance: Math.max(0, Math.min(100, Number(performanceValue) || 85)), // Clamp between 0-100
      department: member.department || 'Unassigned',
      experience: (member.experience || 'mid').toLowerCase(),
      hourlyRate: Number(member.hourlyRate) || 0,
      availability: Math.max(0, Math.min(100, Number(availabilityValue) || 100)), // Clamp between 0-100
      isTeamLead: member.isTeamLead === true || member.isTeamLead === 'true' || member.isTeamLead === 1,
      skills: skillsArray.length > 0 ? skillsArray : [],
      id: member.id || member.userId || `member-${Date.now()}-${Math.random()}`
    };
  });


  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold">{project.name}</h1>
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {project.status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(project.priority)}>
                {project.priority.toUpperCase()} PRIORITY
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button 
            className="bg-gradient-primary text-white"
            onClick={() => {
              // Validate project exists and is valid
              if (!project || !project.id) {
                console.error('Cannot navigate to board: Project is not available');
                return;
              }
              
              // Store project ID in sessionStorage for scrum page to pick up
              try {
                sessionStorage.setItem('openProjectId', project.id);
              } catch (error) {
                console.error('Failed to store project ID:', error);
              }
              
              // Navigate to scrum board page
              navigate(`/scrum?project=${encodeURIComponent(project.id)}`);
            }}
            disabled={!project || !project.id || loading}
          >
            <Workflow className="w-4 h-4 mr-2" />
            Go to Board
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-green-600">{project.progress}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-blue-600">{localTeamMembers.length}</div>
            <div className="text-sm text-muted-foreground">Team Size</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-purple-600">{project.completedSprints}/{project.sprints}</div>
            <div className="text-sm text-muted-foreground">Sprints</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-orange-600">{project.methodology}</div>
            <div className="text-sm text-muted-foreground">Methodology</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-cyan-600">{formatCurrency(project.spent)}</div>
            <div className="text-sm text-muted-foreground">Spent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-semibold text-gray-600">
              {(() => {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return isNaN(daysLeft) ? 'N/A' : daysLeft;
              })()}
            </div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="epics">Epics</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Project Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
                <p className="text-gray-600 max-w-2xl">{project.description}</p>
                <div className="flex items-center space-x-4 mt-4">
                  <Badge className={`${getStatusColor(project.status)} text-sm px-3 py-1`}>
                    {project.status?.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {project.priority?.toUpperCase()} Priority
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {project.methodology?.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="text-3xl font-bold text-blue-600">{project.progress}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Progress */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <TrendingUp className="w-5 h-5" />
                  <span>Project Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Tasks Completed</div>
                    <div className="font-semibold text-green-600">{project.completedTasks || 0}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Tasks Remaining</div>
                    <div className="font-semibold text-orange-600">{(project.totalTasks || 0) - (project.completedTasks || 0)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Active Sprints</div>
                    <div className="font-semibold text-blue-600">{Math.max(0, (project.sprints || 0) - (project.completedSprints || 0))}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Completed Sprints</div>
                    <div className="font-semibold text-purple-600">{project.completedSprints || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-200">
                <CardTitle className="flex items-center space-x-2 text-purple-800">
                  <BarChart3 className="w-5 h-5" />
                  <span>Budget Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span className="font-medium">{((project.spent / project.budget) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(project.spent / project.budget) * 100} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Total Budget</div>
                    <div className="font-semibold">{formatCurrency(project.budget)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Spent</div>
                    <div className="font-semibold text-blue-600">{formatCurrency(project.spent)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Remaining</div>
                    <div className="font-semibold text-green-600">{formatCurrency(project.budget - project.spent)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Burn Rate</div>
                    <div className="font-semibold text-orange-600">₹2.1L/week</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Project Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Start: {formatDate(project.startDate)}</Badge>
                  <Badge variant="secondary">End: {formatDate(project.endDate)}</Badge>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {(() => {
                    const endDate = new Date(project.endDate);
                    const today = new Date();
                    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return isNaN(daysLeft) ? 'N/A' : `${daysLeft} days remaining`;
                  })()}
                </Badge>
              </div>

              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                        <Badge variant="outline" className={getStatusColor(milestone.status)}>
                          {milestone.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Due: {formatDate(milestone.dueDate)}</span>
                          <span>{milestone.completedTasks}/{milestone.tasks} tasks</span>
                        </div>
                        <div className="w-24">
                          <Progress value={milestone.progress} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {activityLogsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : activityLogsError ? (
                  <div className="flex items-center justify-center py-8 text-red-500 text-sm">
                    <p>Failed to load activity logs</p>
                  </div>
                ) : !activityLogs || activityLogs.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    <div className="text-center">
                      <p>No recent activity</p>
                      <p className="text-xs mt-1">Activity logs will appear here when actions are performed on this project</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((activityLog) => {
                      const userName = activityLog.userId || 'Unknown User';
                      const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
                      const activityMessage = formatActivityMessage(activityLog);
                      
                      return (
                        <div key={activityLog.id} className="flex items-start space-x-3">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                              {userInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-sm">
                            <span className="font-medium">{userName}</span>
                            <span className="mx-1 text-muted-foreground">{activityMessage}</span>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatTimeAgo(activityLog.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="epics" className="space-y-6">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-orange-800">Epics Management</h3>
                <p className="text-orange-600 mt-1">Manage and track project epics and their progress</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {localEpics.length || 0}
                </div>
                <div className="text-sm text-orange-500">Total Epics</div>
              </div>
            </div>
          </div>
          <EpicManager 
            epics={localEpics}
            projectId={id || ''}
            currentUserId={user?.id || ''}
            onAddEpic={async (epic) => {
              console.log('Adding epic:', epic);
              // Add the new epic to local state immediately for real-time update
              setLocalEpics(prev => {
                // Check if epic already exists to avoid duplicates
                const exists = prev.some(e => e.id === epic.id);
                if (exists) {
                  return prev; // Don't add duplicate
                }
                return [...prev, epic];
              });
              // Refresh activities to show the new epic creation
              setTimeout(() => {
                refetch();
                refetchActivities();
                fetchEpicsFromApi();
              }, 500);
            }}
            onUpdateEpic={async (epic) => {
              console.log('Updating epic:', epic);
              // Update the epic in local state
              setLocalEpics(prev => prev.map(e => e.id === epic.id ? epic : e));
              // Refresh activities to show the epic update
              setTimeout(() => {
                refetch();
                refetchActivities();
                fetchEpicsFromApi();
              }, 500);
            }}
            onDeleteEpic={async (epicId) => {
              console.log('Deleting epic:', epicId);
              // Remove the epic from local state immediately for real-time update
              setLocalEpics(prev => prev.filter(e => e.id !== epicId));
              // Refresh activities to show the epic deletion
              setTimeout(() => {
                refetch();
                refetchActivities();
                fetchEpicsFromApi();
              }, 500);
            }}
          />
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-blue-800">Project Requirements</h3>
                <p className="text-blue-600 mt-1">Manage functional and non-functional requirements for this project</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{localRequirements?.length || 0}</div>
                  <div className="text-sm text-blue-500">Total Requirements</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-blue-50"
                  onClick={() => {
                    setDialogMode('requirement');
                    setRequirementForm({
                      title: '',
                      description: '',
                      priority: 'medium',
                      type: 'functional',
                      acceptanceCriteria: ''
                    });
                    setIsAddRequirementDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            </div>
          </div>

          {requirementsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading requirements...</p>
              </div>
            </div>
          ) : localRequirements.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No requirements defined yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Add your first requirement to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {localRequirements.map((requirement: any) => (
                <Card key={requirement.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm">{requirement.title}</h4>
                          <Badge variant="outline" className={getPriorityColor(requirement.priority || 'medium')}>
                            {requirement.priority?.toUpperCase() || 'MEDIUM'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {requirement.type || 'functional'}
                          </Badge>
                        </div>
                        {requirement.description && (
                          <p className="text-sm text-muted-foreground">{requirement.description}</p>
                        )}
                        {requirement.acceptanceCriteria && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Acceptance Criteria:</p>
                            <p className="text-sm">{requirement.acceptanceCriteria}</p>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
                          {requirement.status && (
                            <Badge variant="outline" className={getStatusColor(requirement.status)}>
                              {requirement.status}
                            </Badge>
                          )}
                          {requirement.createdAt && (
                            <span>Created: {formatDate(requirement.createdAt)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            // TODO: Implement edit requirement
                            toast.info('Edit requirement functionality coming soon');
                          }}
                          title="Edit requirement"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attachments" className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-green-800">Project Attachments</h3>
                <p className="text-green-600 mt-1">Upload files and add URLs/links to this project</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{attachments?.length || 0}</div>
                  <div className="text-sm text-green-500">Total Attachments</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white hover:bg-green-50"
                  onClick={() => {
                    setDialogMode('attachment');
                    setSelectedFile(null);
                    setAttachmentUrl('');
                    setAttachmentUrlName('');
                    setIsAddRequirementDialogOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Attachment
                </Button>
              </div>
            </div>
          </div>

          {isLoadingAttachments ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading attachments...</p>
              </div>
            </div>
          ) : attachments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No attachments uploaded yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Upload your first file to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {attachments.map((attachment: any) => {
                const isUrl = attachment.attachmentType === 'url' || (!attachment.attachmentType && attachment.fileType === 'url');
                return (
                  <Card key={attachment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isUrl ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {isUrl ? (
                              <Link className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" title={attachment.fileName}>
                              {attachment.fileName}
                            </p>
                            {isUrl ? (
                              <p className="text-xs text-muted-foreground mt-1 break-all line-clamp-2" title={attachment.fileUrl}>
                                {attachment.fileUrl}
                              </p>
                            ) : attachment.fileSize ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatFileSize(attachment.fileSize)}
                              </p>
                            ) : null}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(attachment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                            title={isUrl ? "Open link" : "View file"}
                          >
                            {isUrl ? (
                              <Link className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteFile(attachment.id)}
                            title="Delete attachment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Milestones</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map(milestone => (
              <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{milestone.title}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(milestone.status)}>
                      {milestone.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {milestone.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{milestone.progress}%</span>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(milestone.dueDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{milestone.completedTasks}/{milestone.tasks} tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Team Members ({teamMembers.length})</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsTeamManagerOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
          </div>

          {teamLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading team members...</p>
              </div>
            </div>
          ) : teamMembers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground space-y-2">
                  <Users className="w-12 h-12 mx-auto opacity-50" />
                  <p className="font-medium">No team members assigned</p>
                  <p className="text-sm">Click "Manage Team" to add members to this project</p>
                </div>
              </CardContent>
            </Card>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member, index) => (
              <Card key={member.id || member.name || index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">{member.name}</h4>
                          {member.isTeamLead && (
                            <Badge variant="secondary" className="text-xs">Lead</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{member.department}</span>
                          <span>•</span>
                          <span>{member.experience}</span>
                          <span>•</span>
                          <span>₹{member.hourlyRate}</span>
                        </div>
                        {member.skills && member.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                +{member.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Workload</span>
                            <span>{member.workload}%</span>
                          </div>
                          <Progress value={member.workload} className="h-1" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="text-green-600">{member.performance}%</span>
                          </div>
                          <Progress value={member.performance} className="h-1" />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Availability</span>
                            <span className="text-blue-600">{member.availability}%</span>
                          </div>
                          <Progress value={member.availability} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>

        <TabsContent value="stakeholders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Stakeholders ({project.stakeholders?.length || 0})</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Stakeholder
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.stakeholders?.map((stakeholder: any) => (
              <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={stakeholder.avatarUrl} />
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                        {getInitials(stakeholder.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium text-sm">{stakeholder.name}</h4>
                        <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                        <p className="text-xs text-blue-600">{stakeholder.email}</p>
                      </div>
                      
                      {stakeholder.responsibilities && stakeholder.responsibilities.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Responsibilities</div>
                          <ul className="space-y-1">
                            {stakeholder.responsibilities.slice(0, 3).map((responsibility: string, index: number) => (
                              <li key={index} className="text-xs flex items-start space-x-2">
                                <div className="w-1 h-1 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                                <span>{responsibility}</span>
                              </li>
                            ))}
                            {stakeholder.responsibilities.length > 3 && (
                              <li className="text-xs text-muted-foreground">
                                +{stakeholder.responsibilities.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || []}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Project Risks ({risks.length})</h3>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Risk
            </Button>
          </div>

          <div className="space-y-4">
            {risks.map(risk => (
              <Card key={risk.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm">{risk.title}</h4>
                      <p className="text-xs text-muted-foreground">{risk.description}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(risk.status)}>
                      {risk.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Probability</div>
                      <div className={`font-medium ${getRiskColor(risk.probability)}`}>
                        {risk.probability}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Impact</div>
                      <div className={`font-medium ${getRiskColor(risk.impact)}`}>
                        {risk.impact}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground text-xs">Owner</div>
                      <div className="font-medium text-xs">{risk.owner}</div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Mitigation Plan</div>
                    <p className="text-sm">{risk.mitigation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-medium mb-2">Burndown Chart</h3>
                <p className="text-sm text-muted-foreground">Track sprint progress and velocity</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-medium mb-2">Velocity Report</h3>
                <p className="text-sm text-muted-foreground">Analyze team velocity trends</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-medium mb-2">Time Tracking</h3>
                <p className="text-sm text-muted-foreground">Detailed time analysis</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                <h3 className="font-medium mb-2">Workload Report</h3>
                <p className="text-sm text-muted-foreground">Team capacity and allocation</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Flag className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="font-medium mb-2">Risk Analysis</h3>
                <p className="text-sm text-muted-foreground">Project risk assessment</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-medium mb-2">Quality Metrics</h3>
                <p className="text-sm text-muted-foreground">Code quality and bug reports</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Configuration</CardTitle>
                <CardDescription>Basic project settings and metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input value={project.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={project.description || ''} rows={3} readOnly />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Methodology</Label>
                    <Select value={project.methodology}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scrum">Scrum</SelectItem>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={project.priority}>
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>Customize task statuses and workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Task Statuses</Label>
                  <div className="space-y-2">
                    {['Backlog', 'Sprint Ready', 'In Progress', 'Review', 'Done'].map(status => (
                      <div key={status} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{status}</span>
                        <Button variant="ghost" size="sm">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connected tools and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {project.integrations?.map((integration: any) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {integration.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{integration.name}</div>
                          <div className="text-xs text-muted-foreground">{integration.type}</div>
                        </div>
                      </div>
                      <Badge variant={integration.isEnabled ? 'default' : 'secondary'}>
                        {integration.isEnabled ? 'active' : 'inactive'}
                      </Badge>
                    </div>
                  )) || [
                    { name: 'No integrations', status: 'none' }
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">?</span>
                      </div>
                        <span className="font-medium text-sm text-muted-foreground">{integration.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Link className="w-4 h-4 mr-2" />
                  Manage Integrations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible project actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-sm text-red-900">Archive Project</span>
                  </div>
                  <p className="text-xs text-red-800 mb-3">
                    This will archive the project and make it read-only. Team members will lose edit access.
                  </p>
                  <Button variant="destructive" size="sm">
                    Archive Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Requirement/Attachment Dialog */}
      <Dialog open={isAddRequirementDialogOpen} onOpenChange={setIsAddRequirementDialogOpen}>
        <DialogContent 
          className={`max-w-[90vw] w-[90vw] ${dialogMode === 'attachment' ? 'h-[90vh] max-h-[90vh]' : 'max-h-[80vh]'} flex flex-col`}
          style={{ width: '90vw', maxWidth: '90vw', ...(dialogMode === 'attachment' ? { height: '90vh', maxHeight: '90vh' } : { maxHeight: '80vh' }) }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">
              {dialogMode === 'requirement' ? 'Add Requirement' : 'Add Attachment'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {dialogMode === 'requirement' 
                ? 'Create a new functional or non-functional requirement for this project.'
                : 'Upload files or add URLs to attach to this project. All file types are supported.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 space-y-6 overflow-y-auto">
            {dialogMode === 'requirement' ? (
              /* Requirement Form */
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requirement-title">Title *</Label>
                  <Input
                    id="requirement-title"
                    placeholder="Enter requirement title"
                    value={requirementForm.title}
                    onChange={(e) => setRequirementForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement-description">Description</Label>
                  <Textarea
                    id="requirement-description"
                    placeholder="Enter requirement description"
                    value={requirementForm.description}
                    onChange={(e) => setRequirementForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requirement-type">Type</Label>
                    <Select
                      value={requirementForm.type}
                      onValueChange={(value) => setRequirementForm(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="functional">Functional</SelectItem>
                        <SelectItem value="non-functional">Non-Functional</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="requirement-priority">Priority</Label>
                    <Select
                      value={requirementForm.priority}
                      onValueChange={(value) => setRequirementForm(prev => ({ ...prev, priority: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirement-acceptance">Acceptance Criteria</Label>
                  <Textarea
                    id="requirement-acceptance"
                    placeholder="Enter acceptance criteria"
                    value={requirementForm.acceptanceCriteria}
                    onChange={(e) => setRequirementForm(prev => ({ ...prev, acceptanceCriteria: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              /* Attachment Form */
              <>
                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {selectedFile && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <Label htmlFor="url-input">Add URL/Link</Label>
                  <div className="space-y-2">
                    <Input
                      id="url-input"
                      type="url"
                      placeholder="https://example.com/document.pdf"
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      id="url-name-input"
                      type="text"
                      placeholder="Link name (optional)"
                      value={attachmentUrlName}
                      onChange={(e) => setAttachmentUrlName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  {attachmentUrl && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <Link className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{attachmentUrlName || attachmentUrl}</p>
                          <p className="text-xs text-muted-foreground break-all">{attachmentUrl}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => {
              setIsAddRequirementDialogOpen(false);
              setSelectedFile(null);
              setAttachmentUrl('');
              setAttachmentUrlName('');
              setRequirementForm({
                title: '',
                description: '',
                priority: 'medium',
                type: 'functional',
                acceptanceCriteria: ''
              });
            }}>
              Cancel
            </Button>
            {dialogMode === 'requirement' ? (
              <Button 
                onClick={async () => {
                  if (!requirementForm.title.trim()) {
                    toast.error('Please enter a requirement title');
                    return;
                  }
                  if (!id) {
                    toast.error('Project ID not found');
                    return;
                  }
                  try {
                    const newRequirement = await createRequirement({
                      projectId: id,
                      title: requirementForm.title,
                      description: requirementForm.description || undefined,
                      type: requirementForm.type.toUpperCase() as any,
                      priority: requirementForm.priority.toUpperCase() as any,
                      acceptanceCriteria: requirementForm.acceptanceCriteria || undefined
                    });
                    if (newRequirement) {
                      toast.success('Requirement created successfully');
                      setLocalRequirements(prev => [...prev, newRequirement]);
                      setIsAddRequirementDialogOpen(false);
                      setRequirementForm({
                        title: '',
                        description: '',
                        priority: 'medium',
                        type: 'functional',
                        acceptanceCriteria: ''
                      });
                    }
                  } catch (error) {
                    console.error('Error creating requirement:', error);
                    toast.error('Failed to create requirement');
                  }
                }}
                disabled={!requirementForm.title.trim() || requirementsLoading}
              >
                {requirementsLoading ? (
                  <>
                    <Plus className="w-4 h-4 mr-2 animate-pulse" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Requirement
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleUploadFile} disabled={(!selectedFile && !attachmentUrl.trim()) || isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    {selectedFile ? 'Uploading...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {selectedFile ? (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Add URL
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Management Dialog */}
      <Dialog open={isTeamManagerOpen} onOpenChange={setIsTeamManagerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Manage Team - {project?.name}</DialogTitle>
            <DialogDescription>
              Add, remove, and manage team members for this project
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <TeamManager
              selectedMembers={localTeamMembers}
              onMembersChange={handleTeamMembersChange}
              projectBudget={project?.budget || 0}
              projectDuration={project?.duration || 30}
              projectId={id || ''}
              onAddMember={handleAddTeamMember}
              onRemoveMember={handleRemoveTeamMember}
            />
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsTeamManagerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

};

export default ProjectDetailsPage;