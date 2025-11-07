import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { 
  FolderKanban, 
  Plus, 
  Calendar, 
  Users, 
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  Briefcase,
  FileText,
  ListChecks,
  X,
  Circle,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
  GitBranch,
  Workflow,
  UserCheck,
  Zap,
  Database,
  Cloud,
  Code,
  Smartphone,
  Monitor,
  BarChart3,
  Link,
  Star,
  Flag,
  Rocket,
  Trash2,
  Loader2,
  Upload,
  Eye
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../components/ui/dropdown-menu';
import TeamManager from '../components/TeamManager';
import MilestoneWidget from '../components/MilestoneWidget';
import MilestoneDialog from '../components/MilestoneDialog';
import EpicManager from '../components/EpicManager';
import { mockEpics } from '../data/mockEpics';
import MilestoneTimeline from '../components/MilestoneTimeline';
// Removed mock milestones import - using API data only
import { Milestone } from '../types';
import ReleaseManager from '../components/ReleaseManager';
import { mockReleases } from '../data/mockReleases';
import { useAuth } from '../contexts/AuthContextEnhanced';
// Removed mock data import - using API data only
import { useProjects, useUsers, useDepartments, useDomains, useEpics, useReleases, useSprints, useStories, useTasks } from '../hooks/api';
import { apiClient } from '../services/api/client';
import { projectApiService } from '../services/api/entities/projectApi';
import { attachmentApiService } from '../services/api';
import { toast } from 'sonner';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  avatar?: string;
}

interface Requirement {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  module: string;
  type: 'functional' | 'non-functional' | 'technical';
  acceptanceCriteria: string[];
  status: 'draft' | 'approved' | 'in-development' | 'completed';
  effort: number; // story points
}

interface Risk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'mitigated' | 'closed';
}

interface Integration {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  description: string;
}

interface TeamMember { // Add interface for team members
  id?: string;
  name: string;
  role: string;
  skills?: string[];
  availability?: number; // percentage
  department?: string;
  experience?: 'E1' | 'E2' | 'M1' | 'M2' | 'M3' | 'L1' | 'L2' | 'L3' | 'S1';
  hourlyRate?: number;
  avatar?: string;
  isTeamLead?: boolean;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  progress: number;
  priority: string;
  startDate: string;
  endDate: string;
  managerId: string; // Manager ID
  department: string;
  teamMembers: TeamMember[]; // Add team members to form
  sprints: number;
  completedSprints: number;
  budget: string;
  spent: string;
  scope?: string;
  requirements?: string[];
  stakeholders?: Stakeholder[];
  risks?: Risk[];
  integrations?: Integration[];
  template?: string;
  methodology?: string;
  successCriteria?: string[];
}

interface NewProjectForm {
  name: string;
  description: string;
  priority: string;
  startDate: string;
  endDate: string;
  budget: string;
  scope: string;
  requirements: Requirement[];
  teamLead: string;
  department: string;
  projectType: string;
  template: string;
  methodology: string;
  stakeholders: Stakeholder[];
  risks: Risk[];
  integrations: Integration[];
  successCriteria: string[];
  objectives: string[];
  teamMembers: TeamMember[];
  epics: any[]; // Add epics to form
  releases: any[]; // Add releases to form
}

const ProjectsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // API authentication is now handled by AuthContext
  // No need for demo auth setup

  // API hooks for real data
  const { data: apiProjects, loading: projectsLoading, error: projectsError, deleteProject, refetch } = useProjects();
  const { data: apiUsers, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers({ page: 0, size: 1000 });
  const { data: apiDepartments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [isStakeholderDialogOpen, setIsStakeholderDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [milestoneView, setMilestoneView] = useState<'widget' | 'timeline'>('widget');

  // Deep link will run after filteredProjects is defined below
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSuccessCriteria, setNewSuccessCriteria] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newEpic, setNewEpic] = useState('');
  const [newRelease, setNewRelease] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [newStakeholder, setNewStakeholder] = useState('');
  const [isEpicDialogOpen, setIsEpicDialogOpen] = useState(false);
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
  const [isRiskDialogOpen, setIsRiskDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentEpic, setCurrentEpic] = useState({
    name: '',
    description: '',
    summary: '',
    theme: '',
    businessValue: '',
    priority: 'medium',
    status: 'draft',
    startDate: '',
    endDate: '',
    assigneeId: '',
    storyPoints: 0
  });
  const [currentRelease, setCurrentRelease] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    status: 'planned',
    releaseDate: '',
    targetDate: '',
    releaseNotes: '',
    risks: '',
    dependencies: '',
    createdBy: '',
    progress: 0,
    linkedEpics: '',
    linkedStories: '',
    linkedSprints: '',
    completedAt: '',
    // New fields for list management
    risksList: [] as string[],
    dependenciesList: [] as string[],
    newRisk: '',
    newDependency: '',
    selectedEpics: [] as string[]
  });
  const [currentRisk, setCurrentRisk] = useState({
    title: '',
    description: '',
    probability: 'medium',
    impact: 'medium',
    mitigation: '',
    status: 'identified',
    owner: ''
  });
  const [currentStakeholder, setCurrentStakeholder] = useState({
    name: '',
    role: '',
    responsibilities: [] as string[],
    newResponsibility: ''
  });
  const [newProject, setNewProject] = useState<NewProjectForm>({
    name: '',
    description: '',
    priority: '',
    startDate: '',
    endDate: '',
    budget: '',
    scope: '',
    requirements: [],
    teamLead: '',
    department: '',
    projectType: '',
    template: '',
    methodology: '',
    stakeholders: [],
    risks: [],
    integrations: [],
    successCriteria: [],
    objectives: [],
    teamMembers: [],
    epics: [],
    releases: []
  });
  const [hasUserAddedRequirements, setHasUserAddedRequirements] = useState(false);

  // Attachment state for new project form
  const [pendingAttachments, setPendingAttachments] = useState<{ file: File; name: string; size: number; type: string; url: string }[]>([]);
  const [isAddAttachmentDialogOpen, setIsAddAttachmentDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Project Templates
  const projectTemplates = [
    {
      id: 'web-app',
      name: 'Web Application',
      description: 'Full-stack web application with modern frameworks',
      defaultScope: 'Develop a responsive web application with user authentication, data management, and API integration.',
      defaultRequirements: [
        { title: 'User Authentication', module: 'Auth', priority: 'critical', type: 'functional' },
        { title: 'Responsive Design', module: 'UI/UX', priority: 'high', type: 'functional' },
        { title: 'API Integration', module: 'Backend', priority: 'high', type: 'technical' },
        { title: 'Performance Optimization', module: 'Performance', priority: 'medium', type: 'non-functional' }
      ],
      icon: Monitor
    },
    {
      id: 'mobile-app',
      name: 'Mobile Application',
      description: 'Native or cross-platform mobile application',
      defaultScope: 'Create a mobile application with offline capability, push notifications, and native performance.',
      defaultRequirements: [
        { title: 'Cross-platform Compatibility', module: 'Platform', priority: 'critical', type: 'technical' },
        { title: 'Offline Mode', module: 'Data', priority: 'high', type: 'functional' },
        { title: 'Push Notifications', module: 'Notifications', priority: 'medium', type: 'functional' },
        { title: 'App Store Compliance', module: 'Deployment', priority: 'high', type: 'non-functional' }
      ],
      icon: Smartphone
    },
    {
      id: 'api-service',
      name: 'API Service',
      description: 'RESTful API or microservice architecture',
      defaultScope: 'Build scalable API service with authentication, rate limiting, and comprehensive documentation.',
      defaultRequirements: [
        { title: 'RESTful API Design', module: 'API', priority: 'critical', type: 'technical' },
        { title: 'Authentication & Authorization', module: 'Security', priority: 'critical', type: 'functional' },
        { title: 'Rate Limiting', module: 'Performance', priority: 'high', type: 'non-functional' },
        { title: 'API Documentation', module: 'Documentation', priority: 'medium', type: 'functional' }
      ],
      icon: Code
    },
    {
      id: 'data-analytics',
      name: 'Data Analytics',
      description: 'Business intelligence and analytics platform',
      defaultScope: 'Develop analytics platform with data visualization, reporting, and real-time insights.',
      defaultRequirements: [
        { title: 'Data Visualization', module: 'Visualization', priority: 'critical', type: 'functional' },
        { title: 'Real-time Processing', module: 'Data Processing', priority: 'high', type: 'technical' },
        { title: 'Custom Reports', module: 'Reporting', priority: 'high', type: 'functional' },
        { title: 'Data Security', module: 'Security', priority: 'critical', type: 'non-functional' }
      ],
      icon: BarChart3
    }
  ];

  // Available Integrations
  const availableIntegrations = [
    { id: 'github', name: 'GitHub', type: 'Version Control', description: 'Link commits and PRs to tasks' },
    { id: 'gitlab', name: 'GitLab', type: 'Version Control', description: 'Repository management and CI/CD' },
    { id: 'slack', name: 'Slack', type: 'Communication', description: 'Team notifications and updates' },
    { id: 'teams', name: 'Microsoft Teams', type: 'Communication', description: 'Collaboration and meetings' },
    { id: 'gdrive', name: 'Google Drive', type: 'Storage', description: 'Document and file sharing' },
    { id: 'onedrive', name: 'OneDrive', type: 'Storage', description: 'Microsoft cloud storage' },
    { id: 'jira', name: 'Jira', type: 'Project Management', description: 'Issue tracking and project management' },
    { id: 'confluence', name: 'Confluence', type: 'Documentation', description: 'Team documentation and wikis' }
  ];

  // Project data aligned with AuthContext user assignments - Team sizes 6-7 members
  const mockProjectsData = [
    {
      id: 1,
      name: 'E-Commerce Platform',
      description: 'Modern online shopping experience with AI recommendations',
      status: 'active',
      progress: 85,
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      managerId: '3', // Priya Mehta (manager: proj-1, proj-2)
      department: 'DEPT0000000000001', // Engineering
      teamMembers: [
        { name: 'Rohit Kumar', role: 'Angular Developer', avatar: '' }, // ID 7: assigned proj-1, proj-3
        { name: 'Sneha Patel', role: 'Designer', avatar: '' }, // ID 31: assigned proj-1, proj-2
        { name: 'Sunita Gupta', role: 'Tester', avatar: '' }, // ID 20: assigned proj-1, proj-2
        { name: 'Rekha Jain', role: 'Implementation', avatar: '' }, // ID 24: assigned proj-1, proj-4
        { name: 'Vinod Agarwal', role: 'Database', avatar: '' }, // ID 27: assigned proj-1, proj-5
        { name: 'Priyanka Verma', role: 'Marketing', avatar: '' }, // ID 35: assigned proj-1, proj-5
        { name: 'Priya Mehta', role: 'Manager', avatar: '' }
      ],
      sprints: 5,
      completedSprints: 4,
      budget: '₹25,00,000',
      spent: '₹21,25,000',
      template: 'web-app',
      methodology: 'scrum'
    },
    {
      id: 2,
      name: 'Mobile Banking App - Dinshaw',
      description: 'Secure and user-friendly banking solution',
      status: 'planning',
      progress: 15,
      priority: 'medium',
      startDate: '2024-03-01',
      endDate: '2024-06-01',
      managerId: '3', // Priya Mehta (manager: proj-1, proj-2)
      department: 'Dinshaw',
      teamMembers: [
        { name: 'Sanjay Reddy', role: 'Angular Developer', avatar: '' }, // ID 9: assigned proj-2, proj-4
        { name: 'Amit Patel', role: 'Java Developer', avatar: '' }, // ID 11: assigned proj-2, proj-4
        { name: 'Arun Ghosh', role: 'Maui Developer', avatar: '' }, // ID 17: assigned proj-2, proj-7
        { name: 'Sneha Patel', role: 'Designer', avatar: '' }, // ID 31: assigned proj-1, proj-2
        { name: 'Sunita Gupta', role: 'Tester', avatar: '' }, // ID 20: assigned proj-1, proj-2
        { name: 'Suresh Bhat', role: 'Implementation', avatar: '' }, // ID 23: assigned proj-2, proj-8
        { name: 'Priya Mehta', role: 'Manager', avatar: '' }
      ],
      sprints: 8,
      completedSprints: 1,
      budget: '₹40,00,000',
      spent: '₹6,00,000',
      template: 'mobile-app',
      methodology: 'kanban'
    },
    {
      id: 3,
      name: 'AI Chat Support',
      description: 'Intelligent customer support automation',
      status: 'completed',
      progress: 100,
      priority: 'low',
      startDate: '2023-10-01',
      endDate: '2024-01-15',
      managerId: '4', // Rajesh Gupta (manager: proj-3, proj-4)
      department: 'DEPT0000000000001', // Engineering
      teamMembers: [
        { name: 'Rohit Kumar', role: 'Angular Developer', avatar: '' }, // ID 7: assigned proj-1, proj-3
        { name: 'Ravi Sharma', role: 'Java Developer', avatar: '' }, // ID 12: assigned proj-1, proj-3
        { name: 'Vikram Singh', role: 'Maui Developer', avatar: '' }, // ID 15: assigned proj-3, proj-6
        { name: 'Manoj Kumar', role: 'Tester', avatar: '' }, // ID 21: assigned proj-3, proj-5
        { name: 'Geetha Krishnan', role: 'Implementation', avatar: '' }, // ID 26: assigned proj-3, proj-6
        { name: 'Manisha Gupta', role: 'HR', avatar: '' }, // ID 38: assigned proj-1, proj-3
        { name: 'Rajesh Gupta', role: 'Manager', avatar: '' }
      ],
      sprints: 6,
      completedSprints: 6,
      budget: '₹15,00,000',
      spent: '₹14,50,000',
      template: 'api-service',
      methodology: 'scrum'
    },
    {
      id: 4,
      name: 'Hospital Management System - Hospy',
      description: 'Comprehensive healthcare management platform',
      status: 'active',
      progress: 60,
      priority: 'high',
      startDate: '2024-02-01',
      endDate: '2024-05-01',
      managerId: '4', // Rajesh Gupta (manager: proj-3, proj-4)
      department: 'Hospy',
      teamMembers: [
        { name: 'Sanjay Reddy', role: 'Angular Developer', avatar: '' }, // ID 9: assigned proj-2, proj-4
        { name: 'Amit Patel', role: 'Java Developer', avatar: '' }, // ID 11: assigned proj-2, proj-4
        { name: 'Divya Menon', role: 'Maui Developer', avatar: '' }, // ID 18: assigned proj-4, proj-8
        { name: 'Ravi Shankar', role: 'Tester', avatar: '' }, // ID 19: assigned proj-4, proj-7
        { name: 'Rekha Jain', role: 'Implementation', avatar: '' }, // ID 24: assigned proj-1, proj-4
        { name: 'Aarti Jain', role: 'Marketing', avatar: '' }, // ID 32: assigned proj-3, proj-4
        { name: 'Rajesh Gupta', role: 'Manager', avatar: '' }
      ],
      sprints: 7,
      completedSprints: 4,
      budget: '₹35,00,000',
      spent: '₹21,00,000',
      template: 'web-app',
      methodology: 'scrum'
    },
    {
      id: 5,
      name: 'Pharmaceutical Inventory - Pharma',
      description: 'Drug inventory and supply chain management',
      status: 'active',
      progress: 45,
      priority: 'medium',
      startDate: '2024-01-20',
      endDate: '2024-04-20',
      managerId: '5', // Anita Verma (manager: proj-5, proj-6)
      department: 'Pharma',
      teamMembers: [
        { name: 'Neha Agarwal', role: 'Angular Developer', avatar: '' }, // ID 8: assigned proj-5, proj-6
        { name: 'Pooja Yadav', role: 'Java Developer', avatar: '' }, // ID 13: assigned proj-5, proj-7
        { name: 'Shreya Kapoor', role: 'Maui Developer', avatar: '' }, // ID 16: assigned proj-1, proj-5
        { name: 'Manoj Kumar', role: 'Tester', avatar: '' }, // ID 21: assigned proj-3, proj-5
        { name: 'Ashok Reddy', role: 'Implementation', avatar: '' }, // ID 25: assigned proj-5, proj-7
        { name: 'Kiran Nair', role: 'Marketing', avatar: '' }, // ID 33: assigned proj-5, proj-6
        { name: 'Anita Verma', role: 'Manager', avatar: '' }
      ],
      sprints: 6,
      completedSprints: 3,
      budget: '₹20,00,000',
      spent: '₹9,00,000',
      template: 'web-app',
      methodology: 'kanban'
    },
    {
      id: 6,
      name: 'Learning Management System',
      description: 'Online education platform with video streaming',
      status: 'planning',
      progress: 10,
      priority: 'medium',
      startDate: '2024-04-01',
      endDate: '2024-07-01',
      managerId: '5', // Anita Verma (manager: proj-5, proj-6)
      department: 'DEPT0000000000001', // Engineering
      teamMembers: [
        { name: 'Neha Agarwal', role: 'Angular Developer', avatar: '' }, // ID 8: assigned proj-5, proj-6
        { name: 'Karthik Nair', role: 'Java Developer', avatar: '' }, // ID 14: assigned proj-6, proj-8
        { name: 'Vikram Singh', role: 'Maui Developer', avatar: '' }, // ID 15: assigned proj-3, proj-6
        { name: 'Lakshmi Pillai', role: 'Tester', avatar: '' }, // ID 22: assigned proj-6, proj-8
        { name: 'Geetha Krishnan', role: 'Implementation', avatar: '' }, // ID 26: assigned proj-3, proj-6
        { name: 'Kiran Nair', role: 'Marketing', avatar: '' }, // ID 33: assigned proj-5, proj-6
        { name: 'Anita Verma', role: 'Manager', avatar: '' }
      ],
      sprints: 8,
      completedSprints: 1,
      budget: '₹30,00,000',
      spent: '₹3,00,000',
      template: 'web-app',
      methodology: 'scrum'
    },
    {
      id: 7,
      name: 'Financial Analytics - Dinshaw',
      description: 'Business intelligence and financial reporting',
      status: 'active',
      progress: 75,
      priority: 'high',
      startDate: '2023-11-01',
      endDate: '2024-02-01',
      managerId: '6', // Deepak Joshi (manager: proj-7, proj-8)
      department: 'Dinshaw',
      teamMembers: [
        { name: 'Meera Iyer', role: 'Angular Developer', avatar: '' }, // ID 10: assigned proj-7, proj-8
        { name: 'Pooja Yadav', role: 'Java Developer', avatar: '' }, // ID 13: assigned proj-5, proj-7
        { name: 'Arun Ghosh', role: 'Maui Developer', avatar: '' }, // ID 17: assigned proj-2, proj-7
        { name: 'Ravi Shankar', role: 'Tester', avatar: '' }, // ID 19: assigned proj-4, proj-7
        { name: 'Ashok Reddy', role: 'Implementation', avatar: '' }, // ID 25: assigned proj-5, proj-7
        { name: 'Deepika Shetty', role: 'Marketing', avatar: '' }, // ID 34: assigned proj-7, proj-8
        { name: 'Deepak Joshi', role: 'Manager', avatar: '' }
      ],
      sprints: 5,
      completedSprints: 4,
      budget: '₹18,00,000',
      spent: '₹13,50,000',
      template: 'data-analytics',
      methodology: 'scrum'
    },
    {
      id: 8,
      name: 'Patient Portal - Hospy',
      description: 'Patient appointment and health records portal',
      status: 'completed',
      progress: 100,
      priority: 'medium',
      startDate: '2023-09-01',
      endDate: '2023-12-01',
      managerId: '6', // Deepak Joshi (manager: proj-7, proj-8)
      department: 'Hospy',
      teamMembers: [
        { name: 'Meera Iyer', role: 'Angular Developer', avatar: '' }, // ID 10: assigned proj-7, proj-8
        { name: 'Karthik Nair', role: 'Java Developer', avatar: '' }, // ID 14: assigned proj-6, proj-8
        { name: 'Divya Menon', role: 'Maui Developer', avatar: '' }, // ID 18: assigned proj-4, proj-8
        { name: 'Lakshmi Pillai', role: 'Tester', avatar: '' }, // ID 22: assigned proj-6, proj-8
        { name: 'Suresh Bhat', role: 'Implementation', avatar: '' }, // ID 23: assigned proj-2, proj-8
        { name: 'Nandini Joshi', role: 'Database', avatar: '' }, // ID 30: assigned proj-4, proj-8
        { name: 'Deepak Joshi', role: 'Manager', avatar: '' }
      ],
      sprints: 6,
      completedSprints: 6,
      budget: '₹22,00,000',
      spent: '₹21,50,000',
      template: 'web-app',
      methodology: 'kanban'
    }
  ];

  // Use API data only - normalize projects: ensure teamMembers is always an array
  const projects = (apiProjects || []).map(project => ({
    ...project,
    teamMembers: Array.isArray((project as any).teamMembers) ? (project as any).teamMembers : [],
    // Normalize API fields to local format
    progress: project.progressPercentage ?? 0,
    completedSprints: 0, // TODO: Add sprint tracking
    sprints: 0, // TODO: Add sprint tracking
    department: project.departmentId ?? ''
  }));

  const resetNewProjectForm = () => {
    setNewProject({
      name: '',
      description: '',
      priority: '',
      startDate: '',
      endDate: '',
      budget: '',
      scope: '',
      requirements: [],
      teamLead: '',
      department: '',
      projectType: '',
      template: '',
      methodology: '',
      stakeholders: [],
      risks: [],
      integrations: [],
      successCriteria: [],
      objectives: [],
      teamMembers: [],
      epics: [],
      releases: []
    });
    setHasUserAddedRequirements(false); // Reset the flag
    setNewRequirement('');
    setNewSuccessCriteria('');
    setNewObjective('');
    setNewEpic('');
    setNewRelease('');
    setNewRisk('');
    setNewStakeholder('');
    setIsEpicDialogOpen(false);
    setIsReleaseDialogOpen(false);
    setIsRiskDialogOpen(false);
    setCurrentEpic({
      name: '',
      description: '',
      summary: '',
      theme: '',
      businessValue: '',
      priority: 'medium',
      status: 'draft',
      startDate: '',
      endDate: '',
      assigneeId: '',
      storyPoints: 0
    });
    setCurrentRelease({
      name: '',
      description: '',
      version: '1.0.0',
      status: 'planned',
      releaseDate: '',
      targetDate: '',
      releaseNotes: '',
      risks: '',
      dependencies: '',
      createdBy: ''
    });
    setCurrentRisk({
      title: '',
      description: '',
      probability: 'medium',
      impact: 'medium',
      mitigation: '',
      status: 'identified',
      owner: ''
    });
    setActiveTab('basic');
    // Reset attachment state
    setPendingAttachments([]);
    setIsAddAttachmentDialogOpen(false);
    setSelectedFile(null);
    setIsUploading(false);
  };

  const handleTemplateChange = (templateId: string) => {
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      setNewProject(prev => ({
        ...prev,
        template: templateId,
        projectType: templateId,
        scope: template.defaultScope,
        // Only set default requirements if user hasn't added any custom requirements
        requirements: !hasUserAddedRequirements ? template.defaultRequirements.map((req, index) => ({
          id: `req-${Date.now()}-${index}`,
          title: req.title,
          description: '',
          priority: req.priority as 'critical' | 'high' | 'medium' | 'low',
          module: req.module,
          type: req.type as 'functional' | 'non-functional' | 'technical',
          acceptanceCriteria: [],
          status: 'draft' as const,
          effort: 0
        })) : prev.requirements
      }));
    }
  };

  const handleCreateProject = async () => {
    // Prevent multiple submissions
    if (isCreatingProject) {
      console.log('Project creation already in progress...');
      return;
    }

    try {
      setIsCreatingProject(true);
      console.log('Creating comprehensive project:', newProject);
      
      // Validate required fields
      if (!newProject.teamLead) {
        alert('Please select a team lead before creating the project.');
        setIsCreatingProject(false);
        return;
      }
      
      if (!newProject.department) {
        alert('Please select a department before creating the project.');
        setIsCreatingProject(false);
        return;
      }
      
      // Debug: Log the team lead value before sending
      console.log('Team Lead Selection Debug:', {
        teamLead: newProject.teamLead,
        teamLeadType: typeof newProject.teamLead,
        selectedUser: apiUsers?.find(u => u.id === newProject.teamLead),
        allUsers: apiUsers?.map(u => ({ id: u.id, name: u.name, role: u.role }))
      });
      
      // Validate that team lead is selected and exists
      if (!newProject.teamLead || newProject.teamLead.trim() === '') {
        alert('Please select a team lead before creating the project.');
        setIsCreatingProject(false);
        return;
      }
      
      // Verify the selected team lead exists in the users list
      const selectedTeamLeadUser = apiUsers?.find(u => u.id === newProject.teamLead);
      if (!selectedTeamLeadUser) {
        console.error('Selected team lead not found in users list:', newProject.teamLead);
        alert(`Error: Selected team lead (${newProject.teamLead}) not found. Please select a valid team lead.`);
        setIsCreatingProject(false);
        return;
      }
      
      // Prepare comprehensive project data for the new API
      const comprehensiveProjectData = {
        name: newProject.name,
        description: newProject.description,
        priority: newProject.priority?.toLowerCase(),
        startDate: newProject.startDate,
        endDate: newProject.endDate,
        budget: newProject.budget ? parseFloat(newProject.budget.replace(/[₹,]/g, '')).toString() : '0',
        scope: newProject.scope,
        methodology: newProject.methodology,
        template: newProject.template,
        projectType: newProject.projectType,
        departmentId: newProject.department,
        managerId: newProject.teamLead, // Use the selected team lead ID
        // Set default values for required fields
        status: 'planning',
        progress: 0,
        spent: '0',
        
        // Requirements
        requirements: newProject.requirements.map(req => {
          // Normalize requirement type: backend expects "functional", "non-functional", "technical"
          let reqType = req.type?.toLowerCase() || 'functional';
          // Convert common variations to backend format
          if (reqType === 'non_functional' || reqType === 'nonfunctional') {
            reqType = 'non-functional';
          } else if (reqType === 'non-functional') {
            reqType = 'non-functional'; // Already correct
          } else if (reqType !== 'functional' && reqType !== 'technical') {
            reqType = 'functional'; // Default fallback
          }
          
          // Normalize requirement status - backend expects: draft, approved, in-development, completed, pending
          let reqStatus = req.status?.toLowerCase() || 'draft';
          if (reqStatus === 'in_progress' || reqStatus === 'inprogress') {
            reqStatus = 'in-development';
          } else if (!['draft', 'approved', 'in-development', 'completed', 'pending'].includes(reqStatus)) {
            reqStatus = 'draft'; // Default fallback
          }
          
          // Normalize priority - backend expects: low, medium, high, critical
          let reqPriority = req.priority?.toLowerCase() || 'medium';
          if (!['low', 'medium', 'high', 'critical'].includes(reqPriority)) {
            reqPriority = 'medium'; // Default fallback
          }
          
          return {
            title: req.title,
            description: req.description || '',
            type: reqType, // Use normalized type (functional, non-functional, technical)
            status: reqStatus, // Use normalized status
            priority: reqPriority, // Use normalized priority
            module: req.module || '',
            acceptanceCriteria: req.acceptanceCriteria ? (typeof req.acceptanceCriteria === 'string' ? req.acceptanceCriteria : JSON.stringify(req.acceptanceCriteria)) : '[]',
            effortPoints: req.effort || 0
          };
        }),

        // Risks
        risks: newProject.risks.map(risk => ({
          title: risk.title,
          description: risk.description || '',
          probability: risk.probability?.toLowerCase(),
          impact: risk.impact?.toLowerCase(),
          mitigation: risk.mitigation || '',
          status: risk.status?.toLowerCase() || 'identified',
          owner: risk.owner || ''
        })),

        // Stakeholders
        stakeholders: newProject.stakeholders.map(stakeholder => ({
          name: stakeholder.name,
          role: stakeholder.role,
          email: stakeholder.email || '',
          responsibilities: JSON.stringify(stakeholder.responsibilities || [])
        })),

        // Team Members - Include the selected team lead if not already in the list
        teamMembers: (() => {
          const existingTeamMembers = newProject.teamMembers || [];
          const teamLeadInList = existingTeamMembers.find(m => (m.id || m.name) === newProject.teamLead);
          
          // If team lead is not in the list, add them
          if (newProject.teamLead && !teamLeadInList) {
            const teamLeadUser = apiUsers?.find(u => u.id === newProject.teamLead);
            if (teamLeadUser) {
              return [
                {
                  userId: teamLeadUser.id,
                  role: teamLeadUser.role || 'manager',
                  isTeamLead: true,
                  allocatedHours: 0,
                  startDate: '',
                  endDate: ''
                },
                ...existingTeamMembers.map(member => ({
                  userId: member.id || member.name,
                  role: member.role,
                  isTeamLead: member.isTeamLead || false,
                  allocatedHours: member.allocatedHours || 0,
                  startDate: '',
                  endDate: ''
                }))
              ];
            }
          }
          
          // If team lead is already in list, ensure isTeamLead is set correctly
          return existingTeamMembers.map(member => ({
            userId: member.id || member.name,
            role: member.role,
            isTeamLead: (member.id || member.name) === newProject.teamLead || member.isTeamLead || false,
            allocatedHours: member.allocatedHours || 0,
            startDate: '',
            endDate: ''
          }));
        })(),

        // Epics
        epics: newProject.epics.map(epic => ({
          title: epic.title || epic.name,
          description: epic.description || '',
          summary: epic.summary || '',
          theme: epic.theme || '',
          businessValue: epic.businessValue || '',
          priority: epic.priority?.toLowerCase(),
          status: (epic.status?.toLowerCase() === 'planned' ? 'planning' : epic.status?.toLowerCase()) || 'draft',
          startDate: epic.startDate || '',
          endDate: epic.endDate || '',
          assigneeId: epic.assigneeId || '',
          owner: epic.owner || '',
          progress: epic.progress || 0,
          storyPoints: epic.storyPoints || 0
        })),

        // Releases
        releases: newProject.releases.map(release => ({
          name: release.name,
          description: release.description || '',
          version: release.version || '1.0.0',
          status: (release.status?.toLowerCase() === 'planned' ? 'planning' : release.status?.toLowerCase()) || 'planning',
          releaseDate: release.releaseDate || '',
          targetDate: release.targetDate || '',
          releaseNotes: release.releaseNotes || '',
          risks: release.risks || '[]',
          dependencies: release.dependencies || '[]',
          createdBy: release.createdBy || '',
          progress: release.progress || 0,
          linkedEpics: release.linkedEpics || '[]',
          linkedStories: release.linkedStories || '[]',
          linkedSprints: release.linkedSprints || '[]',
          completedAt: release.completedAt || null
        })),

        // Success Criteria and Objectives
        successCriteria: newProject.successCriteria || [],
        objectives: newProject.objectives || []
      };

      console.log('Sending comprehensive project data:', comprehensiveProjectData);
      console.log('Team Lead being sent:', {
        managerId: comprehensiveProjectData.managerId,
        teamMembersWithLead: comprehensiveProjectData.teamMembers?.filter(tm => tm.isTeamLead),
        totalTeamMembers: comprehensiveProjectData.teamMembers?.length || 0
      });

      // Create project with all related entities in one API call
      const response = await projectApiService.createProjectComprehensive(comprehensiveProjectData);
      
      if (response && response.success) {
        console.log('Project and all entities created successfully:', response);
        
        // Get the created project ID
        const createdProjectId = response.data?.project?.id || response.data?.projectId;
        
        // Upload pending attachments if any
        if (createdProjectId && pendingAttachments.length > 0 && user) {
          try {
            console.log('Uploading pending attachments:', pendingAttachments.length);
            for (const attachment of pendingAttachments) {
              const attachmentData = {
                uploadedBy: user.id,
                entityType: 'project',
                entityId: createdProjectId,
                fileName: attachment.name,
                fileSize: attachment.size,
                fileType: attachment.type,
                fileUrl: attachment.url, // Base64 data
                isPublic: false
              };
              
              const attachmentResponse = await attachmentApiService.createAttachment(attachmentData);
              if (attachmentResponse.success) {
                console.log('Attachment uploaded successfully:', attachment.name);
              } else {
                console.error('Failed to upload attachment:', attachment.name);
              }
            }
            console.log('All attachments uploaded successfully');
          } catch (attachmentError) {
            console.error('Error uploading attachments:', attachmentError);
            // Don't fail the project creation if attachment upload fails
          }
        }
        
        // Close dialog and reset form
    setIsNewProjectDialogOpen(false);
    resetNewProjectForm();
        
        // Show success message
        alert(`Project and all related entities created successfully! Total entities created: ${response.data?.totalEntitiesCreated || 'Unknown'}`);
        
        // Optionally refresh the projects list
        window.location.reload(); // Simple refresh for now
        
      } else {
        console.error('Failed to create comprehensive project:', response);
        alert(`Failed to create project: ${response.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error creating comprehensive project:', error);
      const errorMessage = error?.message || error?.details?.message || 'Unknown error occurred';
      alert(`Error creating project: ${errorMessage}\n\nPlease check:\n1. All required fields are filled\n2. Date formats are correct\n3. Status and priority values are valid`);
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Helper function to create related entities
  const createRelatedEntities = async (projectId: string, epics: any[], releases: any[], requirements: any[], risks: any[], stakeholders: any[], teamMembers: any[]) => {
    try {
      console.log('Creating related entities for project:', projectId);
      console.log('Epics to create:', epics);
      console.log('Releases to create:', releases);
      console.log('Requirements to create:', requirements);
      console.log('Risks to create:', risks);
      console.log('Stakeholders to create:', stakeholders);
      console.log('Team members to create:', teamMembers);

      // Create Requirements
      if (requirements && requirements.length > 0) {
        const requirementsData = requirements.map(req => ({
          projectId: projectId,
          title: req.title,
          description: req.description || '',
          type: req.type?.toUpperCase().replace('-', '_'),
          status: req.status?.toUpperCase(),
          priority: req.priority?.toUpperCase(),
          module: req.module || '',
          acceptanceCriteria: JSON.stringify(req.acceptanceCriteria || []),
          effortPoints: req.effort || 0
        }));
        
        console.log('Requirements data to send:', requirementsData);
        await apiClient.post(`/requirements/project/${projectId}/batch`, requirementsData);
        console.log('Requirements created successfully');
      }

      // Create Risks
      if (risks && risks.length > 0) {
        const risksData = risks.map(risk => ({
          projectId: projectId,
          title: risk.title,
          description: risk.description || '',
          probability: risk.probability?.toUpperCase(),
          impact: risk.impact?.toUpperCase(),
          mitigation: risk.mitigation || '',
          status: risk.status?.toUpperCase(),
          owner: risk.owner || newProject.teamLead // Default to project manager
        }));
        
        await apiClient.post(`/risks/project/${projectId}/batch`, risksData);
        console.log('Risks created successfully');
      }

      // Create Stakeholders
      if (stakeholders && stakeholders.length > 0) {
        const stakeholdersData = stakeholders.map(stakeholder => ({
          projectId: projectId,
          name: stakeholder.name,
          role: stakeholder.role,
          email: stakeholder.email || '',
          responsibilities: JSON.stringify(stakeholder.responsibilities || []),
          avatarUrl: stakeholder.avatar || ''
        }));
        
        await apiClient.post(`/stakeholders/project/${projectId}/batch`, stakeholdersData);
        console.log('Stakeholders created successfully');
      }

      // Create Team Members (Project Team Members)
      if (teamMembers && teamMembers.length > 0) {
        const teamMembersData = teamMembers.map(member => ({
          projectId: projectId,
          userId: member.id || member.name, // Use ID if available, otherwise name
          role: member.role,
          isTeamLead: member.isTeamLead || false,
          allocatedHours: member.allocatedHours || 0,
          startDate: '',
          endDate: ''
        }));
        
        await apiClient.post(`/project-team-members/project/${projectId}/batch`, teamMembersData);
        console.log('Team members created successfully');
      }

      // Create Epics
      if (epics && epics.length > 0) {
        console.log('Creating epics for project:', projectId);
        console.log('Epics to create:', epics);
        
        const epicsData = epics.map(epic => ({
          projectId: projectId,
          title: epic.title || epic.name, // Backend uses 'title' not 'name'
          description: epic.description || '',
          summary: epic.summary || '',
          theme: epic.theme || '',
          businessValue: epic.businessValue || '',
          priority: epic.priority?.toUpperCase(),
          status: epic.status?.toUpperCase() || 'DRAFT',
          startDate: epic.startDate || '',
          endDate: epic.endDate || '',
          assigneeId: epic.assigneeId || '',
          owner: epic.owner || '',
          progress: epic.progress || 0,
          storyPoints: epic.storyPoints || 0
        }));
        
        console.log('Epics data to send:', epicsData);
        
        await apiClient.post(`/epics/project/${projectId}/batch`, epicsData);
        console.log('Epics created successfully');
      } else {
        console.log('No epics to create for project:', projectId);
      }

      // Create Releases
      if (releases && releases.length > 0) {
        console.log('Creating releases for project:', projectId);
        console.log('Releases to create (from state):', releases);
        const releasesData = releases.map(release => ({
          projectId: projectId,
          name: release.name,
          description: release.description || '',
          version: release.version || '1.0.0',
          status: release.status?.toUpperCase() || 'PLANNING',
          releaseDate: release.releaseDate || '',
          targetDate: release.targetDate || '',
          releaseNotes: release.releaseNotes || '',
          risks: release.risks || '[]',
          dependencies: release.dependencies || '[]',
          createdBy: release.createdBy || '',
          progress: release.progress || 0,
          linkedEpics: release.linkedEpics || '[]',
          linkedStories: release.linkedStories || '[]',
          linkedSprints: release.linkedSprints || '[]',
          completedAt: release.completedAt || null
        }));
        console.log('Releases data to send:', releasesData);
        
        await apiClient.post(`/releases/project/${projectId}/batch`, releasesData);
        console.log('Releases created successfully');
      } else {
        console.log('No releases to create.');
      }

    } catch (error) {
      console.error('Error creating related entities:', error);
      // Don't throw error here, just log it - project is already created
    }
  };

  // Add Epic
  const addEpic = () => {
    setIsEpicDialogOpen(true);
    setCurrentEpic({
      name: '',
      description: '',
      summary: '',
      theme: '',
      businessValue: '',
      priority: 'medium',
      status: 'draft',
      startDate: newProject.startDate || '',
      endDate: newProject.endDate || '',
      assigneeId: '',
      storyPoints: 0
    });
  };

  const saveEpic = () => {
    if (currentEpic.name.trim()) {
      const newEpic = {
        id: `epic-${Date.now()}`,
        title: currentEpic.name.trim(), // Backend uses 'title' not 'name'
        description: currentEpic.description.trim(),
        summary: currentEpic.summary.trim(),
        theme: currentEpic.theme.trim(),
        businessValue: currentEpic.businessValue.trim(),
        priority: currentEpic.priority,
        status: currentEpic.status,
        startDate: currentEpic.startDate,
        endDate: currentEpic.endDate,
        assigneeId: currentEpic.assigneeId,
        owner: newProject.teamLead || 'USER0000000000001', // Set owner
        progress: 0,
        storyPoints: currentEpic.storyPoints || 0
      };
      
      console.log('Adding epic:', newEpic);
      
      setNewProject(prev => {
        const updatedProject = {
          ...prev,
          epics: [...prev.epics, newEpic]
        };
        console.log('Updated project epics:', updatedProject.epics);
        return updatedProject;
      });
      
      setIsEpicDialogOpen(false);
      setCurrentEpic({
        name: '',
        description: '',
        priority: 'medium',
        status: 'draft',
        startDate: '',
        endDate: ''
      });
    }
  };

  const removeEpic = (index: number) => {
      setNewProject(prev => ({
        ...prev,
      epics: prev.epics.filter((_, i) => i !== index)
    }));
  };

  // Add Release
  const addRelease = () => {
    setIsReleaseDialogOpen(true);
    setCurrentRelease({
      name: '',
      description: '',
      version: '1.0.0',
      status: 'planned',
      releaseDate: newProject.endDate || '',
      targetDate: newProject.endDate || '',
      releaseNotes: '',
      risks: '',
      dependencies: '',
      createdBy: newProject.teamLead || '',
      progress: 0,
      linkedEpics: '',
      linkedStories: '',
      linkedSprints: '',
      completedAt: '',
      // New fields for list management
      risksList: [],
      dependenciesList: [],
      newRisk: '',
      newDependency: '',
      selectedEpics: []
    });
  };

  const saveRelease = () => {
    if (currentRelease.name.trim()) {
      setNewProject(prev => ({
        ...prev,
        releases: [...prev.releases, {
          id: `release-${Date.now()}`,
          name: currentRelease.name.trim(),
          description: currentRelease.description.trim(),
          version: currentRelease.version,
          status: currentRelease.status,
          releaseDate: currentRelease.releaseDate,
          targetDate: currentRelease.targetDate,
          releaseNotes: currentRelease.releaseNotes.trim(),
          risks: JSON.stringify(currentRelease.risksList || []),
          dependencies: JSON.stringify(currentRelease.dependenciesList || []),
          createdBy: currentRelease.createdBy || newProject.teamLead || 'USER0000000000001',
          progress: 0, // Always 0 during project creation
          linkedEpics: JSON.stringify(currentRelease.selectedEpics || []),
          linkedStories: '[]', // Empty during project creation
          linkedSprints: '[]', // Empty during project creation
          completedAt: currentRelease.completedAt
        }]
      }));
      setIsReleaseDialogOpen(false);
      setCurrentRelease({
        name: '',
        description: '',
        version: '1.0.0',
        status: 'planned',
        releaseDate: '',
        targetDate: '',
        releaseNotes: '',
        risks: '',
        dependencies: '',
        createdBy: '',
        progress: 0,
        linkedEpics: '',
        linkedStories: '',
        linkedSprints: '',
        completedAt: '',
        // Reset new fields
        risksList: [],
        dependenciesList: [],
        newRisk: '',
        newDependency: '',
        selectedEpics: []
      });
    }
  };

  const removeRelease = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      releases: prev.releases.filter((_, i) => i !== index)
    }));
  };

  // Add Risk
  const addRisk = () => {
    setIsRiskDialogOpen(true);
    setCurrentRisk({
      title: '',
      description: '',
      probability: 'medium',
      impact: 'medium',
      mitigation: '',
      status: 'identified',
      owner: newProject.teamLead || ''
    });
  };

  const saveRisk = () => {
    if (currentRisk.title.trim()) {
      setNewProject(prev => ({
        ...prev,
        risks: [...prev.risks, {
          id: `risk-${Date.now()}`,
          title: currentRisk.title.trim(),
          description: currentRisk.description.trim(),
          probability: currentRisk.probability,
          impact: currentRisk.impact,
          mitigation: currentRisk.mitigation.trim(),
          status: currentRisk.status,
          owner: currentRisk.owner || newProject.teamLead || ''
        }]
      }));
      setIsRiskDialogOpen(false);
      setCurrentRisk({
        title: '',
        description: '',
        probability: 'medium',
        impact: 'medium',
        mitigation: '',
        status: 'identified',
        owner: ''
      });
    }
  };

  const removeRisk = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      risks: prev.risks.filter((_, i) => i !== index)
    }));
  };

  // Add Requirement
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setHasUserAddedRequirements(true); // Mark that user has added requirements
      setNewProject(prev => ({
        ...prev,
        requirements: [...prev.requirements, {
          id: `req-${Date.now()}`,
          title: newRequirement.trim(),
          description: '',
          type: 'functional',
          status: 'draft',
          priority: 'medium',
          module: '',
          acceptanceCriteria: [],
          effort: 0
        }]
      }));
      setNewRequirement('');
    }
  };

  // Remove Requirement
  const removeRequirement = (index: number) => {
    setNewProject(prev => {
      const newRequirements = prev.requirements.filter((_, i) => i !== index);
      // If no requirements left, reset the flag so template can populate defaults
      if (newRequirements.length === 0) {
        setHasUserAddedRequirements(false);
      }
      return {
        ...prev,
        requirements: newRequirements
      };
    });
  };

  // Attachment handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !user) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);

      // Read file as base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        
        // Add to pending attachments
        setPendingAttachments(prev => [...prev, {
          file: selectedFile,
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          url: base64Data
        }]);
        
        setSelectedFile(null);
        setIsUploading(false);
        toast.success('File added successfully');
      };
      
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read file. Please try again.');
      setIsUploading(false);
    }
  };

  const handleDeletePendingFile = (index: number) => {
    if (confirm('Are you sure you want to remove this file?')) {
      setPendingAttachments(prev => prev.filter((_, i) => i !== index));
      toast.success('File removed successfully');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Add Stakeholder
  const addStakeholder = () => {
    setIsStakeholderDialogOpen(true);
    setCurrentStakeholder({
      name: '',
      role: '',
      responsibilities: [],
      newResponsibility: ''
    });
  };

  const saveStakeholder = () => {
    if (currentStakeholder.name.trim()) {
      setNewProject(prev => ({
        ...prev,
        stakeholders: [...prev.stakeholders, {
          id: `stakeholder-${Date.now()}`,
          name: currentStakeholder.name.trim(),
          role: currentStakeholder.role.trim(),
          email: '',
          responsibilities: currentStakeholder.responsibilities,
          avatar: ''
        }]
      }));
      setIsStakeholderDialogOpen(false);
      setCurrentStakeholder({
        name: '',
        role: '',
        responsibilities: [],
        newResponsibility: ''
      });
    }
  };

  // Add Objective
  const addObjective = () => {
    if (newObjective.trim() && !newProject.objectives.includes(newObjective.trim())) {
      setNewProject(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  // Add Success Criteria
  const addSuccessCriteria = () => {
    if (newSuccessCriteria.trim() && !newProject.successCriteria.includes(newSuccessCriteria.trim())) {
      setNewProject(prev => ({
        ...prev,
        successCriteria: [...prev.successCriteria, newSuccessCriteria.trim()]
      }));
      setNewSuccessCriteria('');
    }
  };

  // Remove functions
  const removeObjective = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }));
  };

  const removeSuccessCriteria = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      successCriteria: prev.successCriteria.filter((_, i) => i !== index)
    }));
  };

  const removeStakeholder = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter((_, i) => i !== index)
    }));
  };


  const toggleIntegration = (integrationId: string) => {
    setNewProject(prev => ({
      ...prev,
      integrations: prev.integrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case 'scrum': return Target;
      case 'kanban': return Workflow;
      case 'waterfall': return GitBranch;
      default: return Target;
    }
  };

  const getTemplateIcon = (template: string) => {
    const templateObj = projectTemplates.find(t => t.id === template);
    return templateObj?.icon || Monitor;
  };

  const handleMilestoneSave = (milestone: Milestone) => {
    setProjectMilestones(prev => {
      const existing = prev.find(m => m.id === milestone.id);
      if (existing) {
        return prev.map(m => m.id === milestone.id ? milestone : m);
      } else {
        return [...prev, milestone];
      }
    });
  };

  const handleMilestoneClick = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsMilestoneDialogOpen(true);
  };

  const handleProjectClick = (project: any) => {
    navigate(`/projects/${project.id}`);
  };

  // Handle delete project
  const handleDeleteClick = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteProject(projectToDelete.id.toString());
      
      // Close dialogs and reset state
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
      
      // Refresh projects list
      refetch();
      
      // Close project details if it was the deleted project
      if (selectedProject && selectedProject.id === projectToDelete.id) {
        setSelectedProject(null);
        setShowProjectDetails(false);
      }
      
      // Show success message (you can use toast if available)
      alert(`Project "${projectToDelete.name}" has been deleted successfully.`);
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(`Failed to delete project: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const getProjectMilestones = (projectId: number) => {
    return projectMilestones.filter(m => m.projectId === `proj-${projectId}`);
  };


  // Filter projects based on user role and access
  const getFilteredProjects = () => {
    // For debugging: show all projects regardless of user role
    // TODO: Restore proper filtering once user authentication is working
    return projects;
    
    // Original filtering logic (commented out for debugging):
    /*
    if (!user) return [];

    if (user.role === 'admin') {
      return projects; // Admin can see all projects
    } else if (user.role === 'manager' || user.role === 'qa') {
      return projects.filter(project => project.managerId === user.id); // Manager and QA see their projects
    } else {
      // Developer and QA see only projects they're assigned to
      return projects.filter(project => 
        user.assignedProjects?.some(assignedId => `proj-${project.id}` === assignedId)
      );
    }
    */
  };

  const filteredProjects = getFilteredProjects();
  
  // Debug logging
  console.log('ProjectsPage Debug:', {
    user: user,
    projectsCount: projects.length,
    filteredProjectsCount: filteredProjects.length,
    projects: projects.map(p => ({ id: p.id, name: p.name, teamMembersCount: (p.teamMembers || []).length }))
  });

  // Deep link: open a project by id via ?open= query from dashboard
  useEffect(() => {
    const target = searchParams.get('open');
    const fallback = (() => { try { return sessionStorage.getItem('openProjectId') || ''; } catch { return ''; } })();
    const wanted = target || fallback;
    if (!wanted) return;
    
    // Handle both string IDs (from Dashboard) and numeric IDs
    let match: any = undefined;
    if (wanted.startsWith('proj-')) {
      // Dashboard passes 'proj-1', we need to convert to numeric ID
      const numericId = parseInt(wanted.replace('proj-', ''));
      match = filteredProjects.find((p: any) => p.id === numericId || p.id === numericId.toString());
    } else {
      // Direct numeric ID or string numeric
      const numericId = parseInt(wanted);
      match = filteredProjects.find((p: any) => p.id === numericId || p.id.toString() === wanted);
    }
    
    if (match) {
      handleProjectClick(match);
      try { sessionStorage.removeItem('openProjectId'); } catch {}
      // Clean the URL so sidebar nav back to Projects doesn't re-open details
      navigate('/projects', { replace: true });
    }
  }, [searchParams, filteredProjects, navigate]);

  // Check if user can add projects/milestones
  const canAddProject = () => {
    return user?.role === 'admin' || user?.role === 'manager' || user?.role === 'qa';
  };

  // Handle create project query param from Dashboard
  useEffect(() => {
    const createParam = searchParams.get('create');
    if (createParam === 'true' && canAddProject() && !isNewProjectDialogOpen) {
      setIsNewProjectDialogOpen(true);
      // Remove the query param from URL
      navigate('/projects', { replace: true });
    }
  }, [searchParams, canAddProject, isNewProjectDialogOpen, navigate]);

  // Render different views based on state
  if (showProjectDetails && selectedProject) {
    return (
      <div className="space-y-6">
        {/* Back button and project header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowProjectDetails(false);
              setSelectedProject(null);
            }}
          >
            ← Back to Projects
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground">{selectedProject.name}</h1>
            <p className="text-muted-foreground">{selectedProject.description}</p>
          </div>
        </div>

        {/* Project Details View */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Project Info */}
          <div className="xl:col-span-8 min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Badge variant="outline" className={getStatusColor(selectedProject.status)}>
                      {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline" className={getPriorityColor(selectedProject.priority)}>
                      {selectedProject.priority.charAt(0).toUpperCase() + selectedProject.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedProject.progress} className="flex-1" />
                    <span className="text-sm font-medium">{selectedProject.progress}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <p className="text-sm">{new Date(selectedProject.startDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <p className="text-sm">{new Date(selectedProject.endDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Budget</Label>
                    <p className="text-sm">{selectedProject.budget}</p>
                  </div>
                  <div>
                    <Label>Spent</Label>
                    <p className="text-sm">{selectedProject.spent}</p>
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label>Team Members</Label>
                    <div className="flex flex-wrap gap-2">
                      {(selectedProject.teamMembers || []).length > 0 ? (
                        (selectedProject.teamMembers || []).map((member, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{member.name}</span>
                            <Badge variant="outline" className="text-xs">{member.role}</Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No team members assigned</p>
                      )}
                    </div>
                  </div>
              </CardContent>
            </Card>

            {/* Team Management */}
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>Manage project team members and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamManager projectId={selectedProject.id.toString()} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            {/* Milestones Widget */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Project Milestones</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMilestoneView(milestoneView === 'widget' ? 'timeline' : 'widget')}
                    >
                      {milestoneView === 'widget' ? <ListChecks className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                    </Button>
                    {canAddProject() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMilestone(null);
                          setIsMilestoneDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {milestoneView === 'widget' ? (
                  <MilestoneWidget
                    projectId={selectedProject.id?.toString() || ''}
                    milestones={getProjectMilestones(selectedProject.id)}
                    onMilestoneClick={handleMilestoneClick}
                    onAddMilestone={() => {
                      setSelectedMilestone(null);
                      setIsMilestoneDialogOpen(true);
                    }}
                  />
                ) : (
                  <MilestoneTimeline
                    milestones={getProjectMilestones(selectedProject.id)}
                    onMilestoneClick={handleMilestoneClick}
                  />
                )}
              </CardContent>
            </Card>

            {/* Project Epics */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Project Epics</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Add Epic')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Epic
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const projectEpics = mockEpics.filter(epic => epic.projectId === `proj-${selectedProject.id}`);
                  return projectEpics.length > 0 ? (
                    <div className="space-y-3">
                      {projectEpics.slice(0, 3).map((epic) => (
                        <div key={epic.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {epic.theme}
                                </Badge>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {epic.storyPoints} pts
                                </Badge>
                                <Badge variant="outline" className={`${
                                  epic.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  epic.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                                  epic.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {epic.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <h5 className="font-medium text-sm">{epic.title}</h5>
                              <p className="text-xs text-gray-600 line-clamp-2">{epic.summary}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>{epic.linkedStories?.length || 0} stories</span>
                                  <span>{epic.linkedMilestones?.length || 0} milestones</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{epic.progress}%</span>
                                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 transition-all" 
                                      style={{ width: `${epic.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {projectEpics.length > 3 && (
                        <div className="text-center py-2">
                          <Button variant="ghost" size="sm" className="text-blue-600">
                            View all {projectEpics.length} epics
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No epics defined yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create epics to organize large features</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Project Releases */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Project Releases</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log('Add Release')}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Release
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const projectReleases = mockReleases.filter(release => release.projectId === `proj-${selectedProject.id}`);
                  return projectReleases.length > 0 ? (
                    <div className="space-y-3">
                      {projectReleases.slice(0, 3).map((release) => (
                        <div key={release.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                  {release.version}
                                </Badge>
                                <Badge variant="outline" className={`${
                                  release.status === 'released' ? 'bg-green-100 text-green-800' :
                                  release.status === 'development' ? 'bg-orange-100 text-orange-800' :
                                  release.status === 'testing' ? 'bg-purple-100 text-purple-800' :
                                  release.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {release.status.replace('-', ' ')}
                                </Badge>
                              </div>
                              <h5 className="font-medium text-sm">{release.name}</h5>
                              <p className="text-xs text-gray-600 line-clamp-2">{release.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>{release.linkedStories?.length || 0} stories</span>
                                  <span>{release.linkedEpics?.length || 0} epics</span>
                                  <span>{release.linkedSprints?.length || 0} sprints</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">{release.progress}%</span>
                                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-purple-500 transition-all" 
                                      style={{ width: `${release.progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {projectReleases.length > 3 && (
                        <div className="text-center py-2">
                          <Button variant="ghost" size="sm" className="text-purple-600">
                            View all {projectReleases.length} releases
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Rocket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">No releases defined yet</p>
                      <p className="text-xs text-gray-400 mt-1">Create releases to organize product deployments</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sprint Progress</span>
                  <span className="font-medium">{selectedProject.completedSprints} / {selectedProject.sprints}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Budget Utilization</span>
                  <span className="font-medium">
                    {selectedProject.spent && selectedProject.budget ? 
                      Math.round((parseInt(selectedProject.spent.replace(/[^\d]/g, '')) / parseInt(selectedProject.budget.replace(/[^\d]/g, ''))) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Team Size</span>
                  <span className="font-medium">{selectedProject.teamMembers.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Methodology</span>
                  <div className="flex items-center space-x-1">
                    {React.createElement(getMethodologyIcon(selectedProject.methodology || 'scrum'), {
                      className: "w-4 h-4"
                    })}
                    <span className="font-medium capitalize">{selectedProject.methodology}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Milestone Dialog */}
        <MilestoneDialog
          open={isMilestoneDialogOpen}
          onOpenChange={(open) => {
            setIsMilestoneDialogOpen(open);
            if (!open) setSelectedMilestone(null);
          }}
          milestone={selectedMilestone}
          projectId={`proj-${selectedProject.id}`}
          onSave={handleMilestoneSave}
          availableEpics={mockEpics.filter(epic => epic.projectId === `proj-${selectedProject.id}`)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <FolderKanban className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
              <p className="text-muted-foreground">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} available
                {user?.role === 'developer' || user?.role === 'qa' ? ' (assigned to you)' : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
              className="rounded-none"
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
              className="rounded-none"
            >
              <div className="flex flex-col space-y-1 w-4 h-4">
                <div className="w-4 h-0.5 bg-current rounded"></div>
                <div className="w-4 h-0.5 bg-current rounded"></div>
                <div className="w-4 h-0.5 bg-current rounded"></div>
              </div>
            </Button>
          </div>
          {canAddProject() && (
            <Button onClick={() => setIsNewProjectDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* API Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${projectsLoading ? 'bg-yellow-500 animate-pulse' : projectsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Projects API</span>
              {projectsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {projectsError && <span className="text-xs text-red-500">Error</span>}
              {apiProjects && <span className="text-xs text-green-600">{apiProjects.length} projects</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${usersLoading ? 'bg-yellow-500 animate-pulse' : usersError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Users API</span>
              {usersLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {usersError && <span className="text-xs text-red-500">Error</span>}
              {apiUsers && <span className="text-xs text-green-600">{apiUsers.length} users</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${departmentsLoading ? 'bg-yellow-500 animate-pulse' : departmentsError ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Departments API</span>
              {departmentsLoading && <span className="text-xs text-gray-500">Loading...</span>}
              {departmentsError && <span className="text-xs text-red-500">Error</span>}
              {apiDepartments && <span className="text-xs text-green-600">{apiDepartments.length} departments</span>}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${(projectsLoading || usersLoading || departmentsLoading) ? 'bg-yellow-500 animate-pulse' : (projectsError || usersError || departmentsError) ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <span className="text-sm font-medium">Data Source</span>
              {apiProjects && apiProjects.length > 0 ? (
                <span className="text-xs text-green-600">Live API Data</span>
              ) : (
                <span className="text-xs text-gray-500">Mock Data</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {user?.role === 'developer' || user?.role === 'qa' ? 'No Projects Assigned' : 'No Projects Yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {user?.role === 'developer' || user?.role === 'qa' 
                ? 'You haven\'t been assigned to any projects yet. Contact your manager to get assigned to projects.'
                : 'Get started by creating your first project to organize your work and track progress.'
              }
            </p>
            {canAddProject() && (
              <Button onClick={() => setIsNewProjectDialogOpen(true)} className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProjects.map((project) => (
            <Card 
              key={project.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${view === 'list' ? 'p-6' : ''}`}
              onClick={() => handleProjectClick(project)}
            >
              {view === 'grid' ? (
                <>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg">
                          {React.createElement(getTemplateIcon(project.template || 'web-app'), {
                            className: "w-5 h-5 text-green-600"
                          })}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-medium leading-tight">{project.name}</CardTitle>
                          <Badge variant="outline" className={`mt-1 ${getStatusColor(project.status)}`}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleProjectClick(project); }}>
                            View Details
                          </DropdownMenuItem>
                          {canAddProject() && (
                            <>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                Edit Project
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                Manage Team
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteClick(project, e)}
                                className="text-gray-900 hover:text-gray-900 hover:bg-red-50 focus:text-gray-900 focus:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="text-sm line-clamp-2 mt-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No date'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{project.teamMembers.length} members</span>
                      </div>
                    </div>

                    {/* Priority and Methodology */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        {React.createElement(getMethodologyIcon(project.methodology || 'scrum'), {
                          className: "w-3 h-3"
                        })}
                        <span className="capitalize">{project.methodology}</span>
                      </div>
                    </div>

                    {/* Team Avatars */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2 overflow-hidden">
                        {(project.teamMembers || []).slice(0, 4).map((member, index) => (
                          <Avatar key={index} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {(project.teamMembers || []).length > 4 && (
                          <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center text-xs">
                            +{(project.teamMembers || []).length - 4}
                          </div>
                        )}
                        {(project.teamMembers || []).length === 0 && (
                          <div className="text-xs text-muted-foreground">No team members</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {project.completedSprints}/{project.sprints} sprints
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-cyan-100 rounded-lg">
                    {React.createElement(getTemplateIcon(project.template || 'web-app'), {
                      className: "w-6 h-6 text-green-600"
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(project.status)}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(project.priority)}>
                          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{(project.teamMembers || []).length} members</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={project.progress} className="w-20 h-2" />
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Dialog - Only show if user can add projects */}
      {canAddProject() && (
        <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
          <DialogContent className="w-[75%] max-w-[75%] h-[75vh] max-h-[75vh] overflow-y-auto" style={{ width: '75%', maxWidth: '75%', height: '75vh', maxHeight: '75vh' }}>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill out the project details to get started with your new project.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="epics">Epics</TabsTrigger>
                <TabsTrigger value="releases">Releases</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="team">Team & Risk</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter project name"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={newProject.department} onValueChange={(value) => setNewProject({ ...newProject, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentsLoading ? (
                          <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                        ) : departmentsError ? (
                          <SelectItem value="error" disabled>Error loading departments</SelectItem>
                        ) : apiDepartments && apiDepartments.length > 0 ? (
                          apiDepartments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-departments" disabled>No departments available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select value={newProject.priority} onValueChange={(value) => setNewProject({ ...newProject, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
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
                    <Label htmlFor="template">Template *</Label>
                    <Select value={newProject.template} onValueChange={handleTemplateChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="methodology">Methodology *</Label>
                    <Select value={newProject.methodology} onValueChange={(value) => setNewProject({ ...newProject, methodology: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select methodology" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scrum">Scrum</SelectItem>
                        <SelectItem value="kanban">Kanban</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newProject.endDate}
                      onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget *</Label>
                    <Input
                      id="budget"
                      placeholder="₹0"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scope">Project Scope</Label>
                  <Textarea
                    id="scope"
                    placeholder="Define the scope of your project"
                    value={newProject.scope}
                    onChange={(e) => setNewProject({ ...newProject, scope: e.target.value })}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="epics" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Project Epics</h4>
                  <div className="text-sm text-gray-600 mb-4">
                    Define large features and initiatives that will be broken down into stories and tasks.
                  </div>
                  
                  {newProject.epics.length > 0 ? (
                      <div className="space-y-3">
                      {newProject.epics.map((epic, index) => (
                          <Card key={epic.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                  {epic.priority || 'medium'}
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {epic.status || 'draft'}
                                  </Badge>
                                </div>
                                <h5 className="font-medium">{epic.title}</h5>
                              <p className="text-sm text-gray-600 line-clamp-2">{epic.summary || epic.description || 'No description provided'}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Status: {epic.status || 'draft'}</span>
                                <span>Priority: {epic.priority || 'medium'}</span>
                                {epic.storyPoints > 0 && <span>{epic.storyPoints} pts</span>}
                                {epic.theme && <span>Theme: {epic.theme}</span>}
                                </div>
                              {(epic.startDate || epic.endDate) && (
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  {epic.startDate && <span>Start: {epic.startDate}</span>}
                                  {epic.endDate && <span>End: {epic.endDate}</span>}
                              </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeEpic(index)}>
                              <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No epics defined yet. Create epics to organize large features.</p>
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={addEpic}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Epic
                        </Button>
                      </div>

                </div>
              </TabsContent>

              <TabsContent value="releases" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Project Releases</h4>
                  <div className="text-sm text-gray-600 mb-4">
                    Define product releases and deployment cycles for your project.
                  </div>
                  
                  {newProject.releases.length > 0 ? (
                      <div className="space-y-3">
                      {newProject.releases.map((release, index) => (
                          <Card key={release.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                  {release.version || '1.0.0'}
                                  </Badge>
                                  <Badge variant="outline" className={`${
                                    release.status === 'released' ? 'bg-green-100 text-green-800' :
                                    release.status === 'development' ? 'bg-orange-100 text-orange-800' :
                                    release.status === 'testing' ? 'bg-purple-100 text-purple-800' :
                                  release.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                  {release.status || 'planned'}
                                  </Badge>
                                </div>
                                <h5 className="font-medium">{release.name}</h5>
                              <p className="text-sm text-gray-600 line-clamp-2">{release.releaseNotes || release.description || 'No description provided'}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>Status: {release.status || 'planned'}</span>
                                <span>Version: {release.version || '1.0.0'}</span>
                                {release.createdBy && <span>By: {release.createdBy}</span>}
                                </div>
                              {(release.targetDate || release.releaseDate) && (
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  {release.targetDate && <span>Target: {release.targetDate}</span>}
                                  {release.releaseDate && <span>Release: {release.releaseDate}</span>}
                              </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeRelease(index)}>
                              <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Rocket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No releases defined yet. Create releases to organize product deployments.</p>
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={addRelease}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Release
                        </Button>
                      </div>

                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-6">
                <div className="space-y-6">
                  <h4 className="font-medium text-xl">Project Attachments</h4>
                  <p className="text-base text-gray-600">Upload files to attach to this project. All file types are supported.</p>
                  
                  {pendingAttachments.length === 0 ? (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingAttachments.map((attachment, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate" title={attachment.name}>
                                    {attachment.name}
                                  </p>
                                  {attachment.size && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeletePendingFile(index)}
                                  title="Remove file"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={() => setIsAddAttachmentDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Attachment
                    </Button>
                  </div>

                  <Separator className="my-6" />

                    <h5 className="font-medium">Success Criteria</h5>
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Add success criteria"
                        value={newSuccessCriteria}
                        onChange={(e) => setNewSuccessCriteria(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSuccessCriteria()}
                      />
                      <Button type="button" onClick={addSuccessCriteria}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {newProject.successCriteria.length > 0 && (
                      <div className="space-y-3">
                        {newProject.successCriteria.map((criteria, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{criteria}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSuccessCriteria(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <h5 className="font-medium">Objectives</h5>
                    <div className="flex space-x-3">
                      <Input
                        placeholder="Add project objective"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addObjective()}
                      />
                      <Button type="button" onClick={addObjective}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {newProject.objectives.length > 0 && (
                      <div className="space-y-3">
                        {newProject.objectives.map((objective, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{objective}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeObjective(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <div className="space-y-6">
                  <h4 className="font-medium">Team Assignment</h4>
                  <p className="text-sm text-muted-foreground">
                    Team members will be assigned after project creation through the Team Management interface.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="teamLead">Team Lead *</Label>
                    <Select 
                      value={newProject.teamLead}
                      onValueChange={(value) => {
                        console.log('Team lead selected:', value);
                        setNewProject({ ...newProject, teamLead: value });
                      }}
                      disabled={usersLoading || !apiUsers || apiUsers.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          usersLoading ? 'Loading users...' : 
                          !apiUsers || apiUsers.length === 0 ? 'No users available' : 
                          'Select team lead'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {apiUsers && apiUsers.length > 0 ? (
                          apiUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-users" disabled>
                            {usersLoading ? 'Loading...' : 'No users available'}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h4 className="font-medium">Stakeholders</h4>
                  <p className="text-sm text-muted-foreground">
                    Identify key stakeholders and their roles in the project.
                  </p>
                  
                  {newProject.stakeholders.length > 0 && (
                    <div className="space-y-3">
                      {newProject.stakeholders.map((stakeholder, index) => (
                        <div key={stakeholder.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{stakeholder.name}</span>
                              <Badge variant="outline">{stakeholder.role || 'Stakeholder'}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{stakeholder.email || 'No email provided'}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStakeholder(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={addStakeholder}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stakeholder
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h4 className="font-medium">Risk Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Identify and plan mitigation strategies for potential project risks.
                  </p>
                  
                  {newProject.risks.length > 0 && (
                    <div className="space-y-3">
                      {newProject.risks.map((risk, index) => (
                        <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{risk.title}</span>
                              <Badge variant="outline" className={getPriorityColor(risk.probability)}>
                                {risk.probability}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(risk.impact)}>
                                {risk.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Status: {risk.status}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRisk(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center mt-6">
                    <Button variant="outline" onClick={addRisk}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Risk
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="integration" className="space-y-6">
                <div className="space-y-6">
                  <h4 className="font-medium">Available Integrations</h4>
                  <p className="text-sm text-muted-foreground">
                    Select integrations to connect your project with external tools and services.
                  </p>

                  <div className="grid grid-cols-2 gap-6">
                    {availableIntegrations.map((integration) => (
                      <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium">{integration.name}</h5>
                            <Badge variant="secondary" className="text-xs">{integration.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                        </div>
                        <Switch
                          checked={newProject.integrations.some(i => i.id === integration.id && i.enabled)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewProject(prev => ({
                                ...prev,
                                integrations: [...prev.integrations, { ...integration, enabled: true }]
                              }));
                            } else {
                              setNewProject(prev => ({
                                ...prev,
                                integrations: prev.integrations.filter(i => i.id !== integration.id)
                              }));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateProject}
                disabled={!newProject.name || !newProject.description || !newProject.priority || isCreatingProject}
                className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
              >
                {isCreatingProject ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Epic Dialog */}
      <Dialog open={isEpicDialogOpen} onOpenChange={setIsEpicDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Add New Epic</DialogTitle>
            <DialogDescription>
              Create a new epic to organize large features and initiatives.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 px-6 max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="epic-name">Epic Name *</Label>
              <Input
                id="epic-name"
                placeholder="Enter epic name"
                value={currentEpic.name}
                onChange={(e) => setCurrentEpic(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-description">Description</Label>
              <Textarea
                id="epic-description"
                placeholder="Describe the epic"
                value={currentEpic.description}
                onChange={(e) => setCurrentEpic(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-summary">Summary</Label>
              <Input
                id="epic-summary"
                placeholder="Brief summary of the epic"
                value={currentEpic.summary}
                onChange={(e) => setCurrentEpic(prev => ({ ...prev, summary: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-theme">Theme</Label>
              <Input
                id="epic-theme"
                placeholder="Epic theme or category"
                value={currentEpic.theme}
                onChange={(e) => setCurrentEpic(prev => ({ ...prev, theme: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="epic-business-value">Business Value</Label>
              <Textarea
                id="epic-business-value"
                placeholder="Describe the business value"
                value={currentEpic.businessValue}
                onChange={(e) => setCurrentEpic(prev => ({ ...prev, businessValue: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic-priority">Priority</Label>
                <Select value={currentEpic.priority} onValueChange={(value) => setCurrentEpic(prev => ({ ...prev, priority: value }))}>
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
                <Select value={currentEpic.status} onValueChange={(value) => setCurrentEpic(prev => ({ ...prev, status: value }))}>
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
                  value={currentEpic.assigneeId}
                  onValueChange={(value) => setCurrentEpic(prev => ({ ...prev, assigneeId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiUsers && apiUsers.length > 0 ? (
                      apiUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-users" disabled>
                        No users available
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
                  value={currentEpic.storyPoints}
                  onChange={(e) => setCurrentEpic(prev => ({ ...prev, storyPoints: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="epic-start-date">Start Date</Label>
                <Input
                  id="epic-start-date"
                  type="date"
                  value={currentEpic.startDate}
                  onChange={(e) => setCurrentEpic(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="epic-end-date">End Date</Label>
                <Input
                  id="epic-end-date"
                  type="date"
                  value={currentEpic.endDate}
                  onChange={(e) => setCurrentEpic(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsEpicDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEpic} disabled={!currentEpic.name.trim()}>
              Add Epic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Release Dialog */}
      <Dialog open={isReleaseDialogOpen} onOpenChange={setIsReleaseDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Add New Release</DialogTitle>
            <DialogDescription>
              Create a new release to organize product deployments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 px-6 max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="release-name">Release Name *</Label>
              <Input
                id="release-name"
                placeholder="Enter release name"
                value={currentRelease.name}
                onChange={(e) => setCurrentRelease(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-description">Description</Label>
              <Textarea
                id="release-description"
                placeholder="Describe the release"
                value={currentRelease.description}
                onChange={(e) => setCurrentRelease(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="release-version">Version</Label>
                <Input
                  id="release-version"
                  placeholder="e.g., 1.0.0"
                  value={currentRelease.version}
                  onChange={(e) => setCurrentRelease(prev => ({ ...prev, version: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release-status">Status</Label>
                <Select value={currentRelease.status} onValueChange={(value) => setCurrentRelease(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="ready-for-release">Ready for Release</SelectItem>
                    <SelectItem value="released">Released</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-notes">Release Notes</Label>
              <Textarea
                id="release-notes"
                placeholder="Detailed release notes and changelog"
                value={currentRelease.releaseNotes}
                onChange={(e) => setCurrentRelease(prev => ({ ...prev, releaseNotes: e.target.value }))}
                rows={3}
              />
            </div>
            
            {/* Risks List */}
            <div className="space-y-2">
              <Label>Risks</Label>
              <div className="space-y-2">
                {currentRelease.risksList && currentRelease.risksList.length > 0 ? (
                  <div className="space-y-2">
                    {currentRelease.risksList.map((risk, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{risk}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newRisks = currentRelease.risksList.filter((_, i) => i !== index);
                            setCurrentRelease(prev => ({ ...prev, risksList: newRisks }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No risks added yet</p>
                )}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a risk"
                    value={currentRelease.newRisk}
                    onChange={(e) => setCurrentRelease(prev => ({ ...prev, newRisk: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentRelease.newRisk.trim()) {
                        const newRisks = [...(currentRelease.risksList || []), currentRelease.newRisk.trim()];
                        setCurrentRelease(prev => ({ ...prev, risksList: newRisks, newRisk: '' }));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentRelease.newRisk.trim()) {
                        const newRisks = [...(currentRelease.risksList || []), currentRelease.newRisk.trim()];
                        setCurrentRelease(prev => ({ ...prev, risksList: newRisks, newRisk: '' }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Dependencies List */}
            <div className="space-y-2">
              <Label>Dependencies</Label>
              <div className="space-y-2">
                {currentRelease.dependenciesList && currentRelease.dependenciesList.length > 0 ? (
                  <div className="space-y-2">
                    {currentRelease.dependenciesList.map((dependency, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{dependency}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDependencies = currentRelease.dependenciesList.filter((_, i) => i !== index);
                            setCurrentRelease(prev => ({ ...prev, dependenciesList: newDependencies }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No dependencies added yet</p>
                )}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a dependency"
                    value={currentRelease.newDependency}
                    onChange={(e) => setCurrentRelease(prev => ({ ...prev, newDependency: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentRelease.newDependency.trim()) {
                        const newDependencies = [...(currentRelease.dependenciesList || []), currentRelease.newDependency.trim()];
                        setCurrentRelease(prev => ({ ...prev, dependenciesList: newDependencies, newDependency: '' }));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentRelease.newDependency.trim()) {
                        const newDependencies = [...(currentRelease.dependenciesList || []), currentRelease.newDependency.trim()];
                        setCurrentRelease(prev => ({ ...prev, dependenciesList: newDependencies, newDependency: '' }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="release-created-by">Created By</Label>
                <Input
                  id="release-created-by"
                  placeholder="Release creator/owner"
                  value={currentRelease.createdBy}
                  onChange={(e) => setCurrentRelease(prev => ({ ...prev, createdBy: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release-target-date">Target Date</Label>
                <Input
                  id="release-target-date"
                  type="date"
                  value={currentRelease.targetDate}
                  onChange={(e) => setCurrentRelease(prev => ({ ...prev, targetDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="release-date">Release Date</Label>
                <Input
                  id="release-date"
                  type="date"
                  value={currentRelease.releaseDate}
                  onChange={(e) => setCurrentRelease(prev => ({ ...prev, releaseDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="release-completed-at">Completed At</Label>
                <Input
                  id="release-completed-at"
                  type="date"
                  value={currentRelease.completedAt}
                  onChange={(e) => setCurrentRelease(prev => ({ ...prev, completedAt: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="release-progress">Progress (%)</Label>
              <Input
                id="release-progress"
                type="number"
                min="0"
                max="100"
                value="0"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Progress starts at 0% during project creation</p>
            </div>
            
            {/* Linked Epics Selection */}
            <div className="space-y-2">
              <Label>Linked Epics</Label>
              <div className="space-y-2">
                {newProject.epics && newProject.epics.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {newProject.epics.map((epic, index) => (
                      <div key={epic.id} className="flex items-center space-x-2 p-2 border rounded">
                        <input
                          type="checkbox"
                          id={`epic-${epic.id}`}
                          checked={currentRelease.selectedEpics?.includes(epic.id) || false}
                          onChange={(e) => {
                            const selectedEpics = currentRelease.selectedEpics || [];
                            if (e.target.checked) {
                              setCurrentRelease(prev => ({
                                ...prev,
                                selectedEpics: [...selectedEpics, epic.id]
                              }));
                            } else {
                              setCurrentRelease(prev => ({
                                ...prev,
                                selectedEpics: selectedEpics.filter(id => id !== epic.id)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <label htmlFor={`epic-${epic.id}`} className="flex-1 text-sm cursor-pointer">
                          <span className="font-medium">{epic.title || epic.name}</span>
                          <span className="text-muted-foreground ml-2">({epic.status})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">No epics added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add epics first to link them to this release</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsReleaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRelease} disabled={!currentRelease.name.trim()}>
              Add Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Risk Dialog */}
      <Dialog open={isRiskDialogOpen} onOpenChange={setIsRiskDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Add New Risk</DialogTitle>
            <DialogDescription>
              Identify and assess potential project risks with mitigation strategies.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 px-6 max-h-[60vh]">
            <div className="space-y-2">
              <Label htmlFor="risk-title">Risk Title *</Label>
              <Input
                id="risk-title"
                placeholder="Enter risk title"
                value={currentRisk.title}
                onChange={(e) => setCurrentRisk(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-description">Description</Label>
              <Textarea
                id="risk-description"
                placeholder="Describe the risk in detail"
                value={currentRisk.description}
                onChange={(e) => setCurrentRisk(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-probability">Probability</Label>
                <Select value={currentRisk.probability} onValueChange={(value) => setCurrentRisk(prev => ({ ...prev, probability: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-impact">Impact</Label>
                <Select value={currentRisk.impact} onValueChange={(value) => setCurrentRisk(prev => ({ ...prev, impact: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk-mitigation">Mitigation Strategy</Label>
              <Textarea
                id="risk-mitigation"
                placeholder="Describe how to mitigate this risk"
                value={currentRisk.mitigation}
                onChange={(e) => setCurrentRisk(prev => ({ ...prev, mitigation: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="risk-status">Status</Label>
                <Select value={currentRisk.status} onValueChange={(value) => setCurrentRisk(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="mitigated">Mitigated</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk-owner">Risk Owner</Label>
                <Input
                  id="risk-owner"
                  placeholder="Assign risk owner"
                  value={currentRisk.owner}
                  onChange={(e) => setCurrentRisk(prev => ({ ...prev, owner: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsRiskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveRisk} disabled={!currentRisk.title.trim()}>
              Add Risk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stakeholder Dialog */}
      <Dialog open={isStakeholderDialogOpen} onOpenChange={setIsStakeholderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Add Stakeholder</DialogTitle>
            <DialogDescription>
              Add a new stakeholder to the project with their role and responsibilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 px-6 max-h-[60vh]">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stakeholder-name">Name *</Label>
                <Input
                  id="stakeholder-name"
                  placeholder="Enter stakeholder name"
                  value={currentStakeholder.name}
                  onChange={(e) => setCurrentStakeholder(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stakeholder-role">Role *</Label>
                <Input
                  id="stakeholder-role"
                  placeholder="e.g., Product Owner, Sponsor, User"
                  value={currentStakeholder.role}
                  onChange={(e) => setCurrentStakeholder(prev => ({ ...prev, role: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Responsibilities</Label>
              <div className="space-y-2">
                {currentStakeholder.responsibilities.length > 0 ? (
                  <div className="space-y-2">
                    {currentStakeholder.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">{responsibility}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newResponsibilities = currentStakeholder.responsibilities.filter((_, i) => i !== index);
                            setCurrentStakeholder(prev => ({ ...prev, responsibilities: newResponsibilities }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No responsibilities added yet</p>
                )}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a responsibility"
                    value={currentStakeholder.newResponsibility}
                    onChange={(e) => setCurrentStakeholder(prev => ({ ...prev, newResponsibility: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentStakeholder.newResponsibility.trim()) {
                        const newResponsibilities = [...currentStakeholder.responsibilities, currentStakeholder.newResponsibility.trim()];
                        setCurrentStakeholder(prev => ({ ...prev, responsibilities: newResponsibilities, newResponsibility: '' }));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (currentStakeholder.newResponsibility.trim()) {
                        const newResponsibilities = [...currentStakeholder.responsibilities, currentStakeholder.newResponsibility.trim()];
                        setCurrentStakeholder(prev => ({ ...prev, responsibilities: newResponsibilities, newResponsibility: '' }));
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-white">
            <Button variant="outline" onClick={() => setIsStakeholderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveStakeholder} disabled={!currentStakeholder.name.trim() || !currentStakeholder.role.trim()}>
              Add Stakeholder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Attachment Dialog */}
      <Dialog open={isAddAttachmentDialogOpen} onOpenChange={setIsAddAttachmentDialogOpen}>
        <DialogContent 
          className="max-w-[90vw] w-[90vw] h-[90vh] max-h-[90vh] flex flex-col"
          style={{ width: '90vw', height: '90vh', maxWidth: '90vw', maxHeight: '90vh' }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl">Upload Attachment</DialogTitle>
            <DialogDescription className="text-base">
              Upload files to attach to this project. All file types are supported.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
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
          </div>
          
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => {
              setIsAddAttachmentDialogOpen(false);
              setSelectedFile(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleUploadFile} disabled={!selectedFile || isUploading}>
              {isUploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Delete Project</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone and will permanently remove the project from the database.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {projectToDelete && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium text-red-900">Project: {projectToDelete.name}</p>
                <p className="text-sm text-red-700 mt-1">{projectToDelete.description || 'No description'}</p>
              </div>
            )}
            <div className="mt-4 flex items-start space-x-3 text-sm text-gray-600">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Warning:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>This will permanently delete the project from the database</li>
                  <li>All associated data (sprints, stories, tasks, etc.) may also be deleted</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProjectToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-white hover:bg-red-50 text-black hover:text-black border-2 border-red-300 hover:border-red-400 font-medium"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;