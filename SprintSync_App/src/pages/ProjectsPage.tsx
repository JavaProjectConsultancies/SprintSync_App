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
  Rocket
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import TeamManager from '../components/TeamManager';
import MilestoneWidget from '../components/MilestoneWidget';
import MilestoneDialog from '../components/MilestoneDialog';
import EpicManager from '../components/EpicManager';
import { mockEpics } from '../data/mockEpics';
import MilestoneTimeline from '../components/MilestoneTimeline';
import { mockMilestones } from '../data/mockData';
import { Milestone } from '../types';
import ReleaseManager from '../components/ReleaseManager';
import { mockReleases } from '../data/mockReleases';
import { useAuth } from '../contexts/AuthContext';
import { mockProjects } from '../data/mockData';

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
  experience?: 'junior' | 'mid' | 'senior' | 'lead';
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
  teamMembers: TeamMember[]; // Add team members to form
}

const ProjectsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [milestoneView, setMilestoneView] = useState<'widget' | 'timeline'>('widget');

  // Deep link will run after filteredProjects is defined below
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>(mockMilestones);
  const [activeTab, setActiveTab] = useState('basic');
  const [newRequirement, setNewRequirement] = useState('');
  const [newSuccessCriteria, setNewSuccessCriteria] = useState('');
  const [newObjective, setNewObjective] = useState('');
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
    teamMembers: [] // Initialize team members
  });

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
  const projects = [
    {
      id: 1,
      name: 'E-Commerce Platform - VNIT',
      description: 'Modern online shopping experience with AI recommendations',
      status: 'active',
      progress: 85,
      priority: 'high',
      startDate: '2024-01-15',
      endDate: '2024-03-15',
      managerId: '3', // Priya Mehta (manager: proj-1, proj-2)
      department: 'VNIT',
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
      name: 'AI Chat Support - VNIT',
      description: 'Intelligent customer support automation',
      status: 'completed',
      progress: 100,
      priority: 'low',
      startDate: '2023-10-01',
      endDate: '2024-01-15',
      managerId: '4', // Rajesh Gupta (manager: proj-3, proj-4)
      department: 'VNIT',
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
      name: 'Learning Management System - VNIT',
      description: 'Online education platform with video streaming',
      status: 'planning',
      progress: 10,
      priority: 'medium',
      startDate: '2024-04-01',
      endDate: '2024-07-01',
      managerId: '5', // Anita Verma (manager: proj-5, proj-6)
      department: 'VNIT',
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
      teamMembers: [] // Reset team members
    });
    setNewRequirement('');
    setNewSuccessCriteria('');
    setNewObjective('');
    setActiveTab('basic');
  };

  const handleTemplateChange = (templateId: string) => {
    const template = projectTemplates.find(t => t.id === templateId);
    if (template) {
      setNewProject(prev => ({
        ...prev,
        template: templateId,
        projectType: templateId,
        scope: template.defaultScope,
        requirements: template.defaultRequirements.map((req, index) => ({
          id: `req-${Date.now()}-${index}`,
          title: req.title,
          description: '',
          priority: req.priority as 'critical' | 'high' | 'medium' | 'low',
          module: req.module,
          type: req.type as 'functional' | 'non-functional' | 'technical',
          acceptanceCriteria: [],
          status: 'draft' as const,
          effort: 0
        }))
      }));
    }
  };

  const handleCreateProject = () => {
    console.log('Creating new project:', newProject);
    // Here you would typically send the data to your backend
    setIsNewProjectDialogOpen(false);
    resetNewProjectForm();
    // Do not change any view state when creating project
  };

  const addSuccessCriteria = () => {
    if (newSuccessCriteria.trim() && !newProject.successCriteria.includes(newSuccessCriteria.trim())) {
      setNewProject(prev => ({
        ...prev,
        successCriteria: [...prev.successCriteria, newSuccessCriteria.trim()]
      }));
      setNewSuccessCriteria('');
    }
  };

  const removeSuccessCriteria = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      successCriteria: prev.successCriteria.filter((_, i) => i !== index)
    }));
  };

  const addObjective = () => {
    if (newObjective.trim() && !newProject.objectives.includes(newObjective.trim())) {
      setNewProject(prev => ({
        ...prev,
        objectives: [...prev.objectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    setNewProject(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
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

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
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
    } else if (user.role === 'manager') {
      return projects.filter(project => project.managerId === user.id); // Manager sees only their projects
    } else {
      // Developer and Designer see only projects they're assigned to
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
    projects: projects.map(p => ({ id: p.id, name: p.name }))
  });

  // Deep link: open a project by id via ?open= query from dashboard
  useEffect(() => {
    const target = searchParams.get('open');
    const fallback = (() => { try { return sessionStorage.getItem('openProjectId') || ''; } catch { return ''; } })();
    const wanted = target || fallback;
    if (!wanted) return;
    
    // Handle both string IDs (from Dashboard) and numeric IDs
    let match = null;
    if (wanted.startsWith('proj-')) {
      // Dashboard passes 'proj-1', we need to convert to numeric ID
      const numericId = parseInt(wanted.replace('proj-', ''));
      match = filteredProjects.find(p => p.id === numericId);
    } else {
      // Direct numeric ID or string numeric
      const numericId = parseInt(wanted);
      match = filteredProjects.find(p => p.id === numericId) || filteredProjects.find(p => p.id.toString() === wanted);
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
    return user?.role === 'admin' || user?.role === 'manager';
  };

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
                    {selectedProject.teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-muted/50 rounded-lg px-3 py-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member.name}</span>
                        <Badge variant="outline" className="text-xs">{member.role}</Badge>
                      </div>
                    ))}
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
                    milestones={getProjectMilestones(selectedProject.id)}
                    onMilestoneClick={handleMilestoneClick}
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
                                  <span>{epic.linkedStories.length} stories</span>
                                  <span>{epic.linkedMilestones.length} milestones</span>
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
                                  <span>{release.linkedStories.length} stories</span>
                                  <span>{release.linkedEpics.length} epics</span>
                                  <span>{release.linkedSprints.length} sprints</span>
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
                    {Math.round((parseInt(selectedProject.spent.replace(/[^\d]/g, '')) / parseInt(selectedProject.budget.replace(/[^\d]/g, ''))) * 100)}%
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
                {user?.role === 'developer' || user?.role === 'designer' ? ' (assigned to you)' : ''}
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

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {user?.role === 'developer' || user?.role === 'designer' ? 'No Projects Assigned' : 'No Projects Yet'}
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {user?.role === 'developer' || user?.role === 'designer' 
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
                          {new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
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
                        {project.teamMembers.slice(0, 4).map((member, index) => (
                          <Avatar key={index} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.teamMembers.length > 4 && (
                          <div className="w-6 h-6 bg-muted border-2 border-background rounded-full flex items-center justify-center text-xs">
                            +{project.teamMembers.length - 4}
                          </div>
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
                          <span>{new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{project.teamMembers.length} members</span>
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="VNIT">VNIT</SelectItem>
                        <SelectItem value="Dinshaw">Dinshaw</SelectItem>
                        <SelectItem value="Hospy">Hospy</SelectItem>
                        <SelectItem value="Pharma">Pharma</SelectItem>
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

                <div className="grid grid-cols-3 gap-4">
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

                <div className="grid grid-cols-3 gap-4">
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
                  
                  {(() => {
                    const projectEpics = mockEpics.filter(epic => epic.projectId === `proj-${newProject.id || 'new'}`);
                    return projectEpics.length > 0 ? (
                      <div className="space-y-3">
                        {projectEpics.map((epic) => (
                          <Card key={epic.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                    {epic.theme}
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {epic.storyPoints} pts
                                  </Badge>
                                </div>
                                <h5 className="font-medium">{epic.title}</h5>
                                <p className="text-sm text-gray-600 line-clamp-2">{epic.summary}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Status: {epic.status}</span>
                                  <span>Progress: {epic.progress}%</span>
                                  <span>{epic.linkedStories.length} stories</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No epics defined yet. Create epics to organize large features.</p>
                        <Button variant="outline" className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Epic
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="releases" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Project Releases</h4>
                  <div className="text-sm text-gray-600 mb-4">
                    Define product releases and deployment cycles for your project.
                  </div>
                  
                  {(() => {
                    const projectReleases = mockReleases.filter(release => release.projectId === `proj-${newProject.id || 'new'}`);
                    return projectReleases.length > 0 ? (
                      <div className="space-y-3">
                        {projectReleases.map((release) => (
                          <Card key={release.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
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
                                <h5 className="font-medium">{release.name}</h5>
                                <p className="text-sm text-gray-600 line-clamp-2">{release.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Status: {release.status}</span>
                                  <span>Progress: {release.progress}%</span>
                                  <span>{release.linkedStories.length} stories</span>
                                  <span>{release.linkedEpics.length} epics</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Rocket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No releases defined yet. Create releases to organize product deployments.</p>
                        <Button variant="outline" className="mt-4">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Release
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Project Requirements</h4>
                  {newProject.requirements.length > 0 && (
                    <div className="space-y-2">
                      {newProject.requirements.map((req, index) => (
                        <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{req.title}</span>
                              <Badge variant="outline" className={getPriorityColor(req.priority)}>
                                {req.priority}
                              </Badge>
                              <Badge variant="secondary">{req.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{req.module}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewProject(prev => ({
                              ...prev,
                              requirements: prev.requirements.filter((_, i) => i !== index)
                            }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <h5 className="font-medium">Success Criteria</h5>
                    <div className="flex space-x-2">
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
                      <div className="space-y-2">
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
                    <div className="flex space-x-2">
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
                      <div className="space-y-2">
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
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Team Assignment</h4>
                  <p className="text-sm text-muted-foreground">
                    Team members will be assigned after project creation through the Team Management interface.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="teamLead">Team Lead</Label>
                    <Input
                      id="teamLead"
                      placeholder="Assign team lead"
                      value={newProject.teamLead}
                      onChange={(e) => setNewProject({ ...newProject, teamLead: e.target.value })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Risk Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Identify and plan mitigation strategies for potential project risks.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="integration" className="space-y-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Available Integrations</h4>
                  <p className="text-sm text-muted-foreground">
                    Select integrations to connect your project with external tools and services.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
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
                disabled={!newProject.name || !newProject.description || !newProject.priority}
                className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectsPage;