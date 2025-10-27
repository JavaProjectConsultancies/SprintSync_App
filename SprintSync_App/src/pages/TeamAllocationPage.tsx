import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useUsers, useActiveUsers } from '../hooks/api';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useProjects } from '../hooks/api/useProjects';
import { useUserProjects } from '../hooks/useUserProjects';
import { userPickerApiService, UserPickerDto } from '../services/api/utilities/userPickerApi';
import { toast } from 'sonner';
import { 
  Users, 
  Plus,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  Settings,
  Zap,
  Shield,
  Code,
  Palette,
  Database,
  TestTube,
  Cog,
  Briefcase,
  Heart,
  Search,
  Filter,
  Building,
  Coffee,
  IndianRupee,
  Award,
  XCircle
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  domain: string;
  department: string;
  email: string;
  avatar?: string;
  status: string;
  currentSprint: string;
  utilization: number;
  capacity: number;
  allocated: number;
  skills: string[];
  projects: Array<{
    name: string;
    allocation: number;
    role: string;
  }>;
  performance: {
    velocity: number;
    quality: number;
    onTime: number;
  };
  availability: {
    thisWeek: number;
    nextWeek: number;
    nextTwoWeeks: number;
  };
  hourlyRate: number;
  budget: number;
  experience: string;
}

const TeamAllocationPage: React.FC = () => {
  const { getAllUsers } = useAuth();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'developer' as 'developer' | 'designer' | 'manager' | 'admin',
    domain: '',
    department: '',
    password: '',
    hourlyRate: 0,
    skills: [] as string[],
    budget: 0,
    experience: 'mid' as 'junior' | 'mid' | 'senior' | 'lead',
    availability: 100
  });
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<UserPickerDto[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Validation: Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      newMember.name.trim() !== '' &&
      newMember.email.trim() !== '' &&
      selectedUserId !== '' &&
      newMember.role !== '' &&
      newMember.domain !== '' &&
      newMember.department !== '' &&
      newMember.hourlyRate > 0 &&
      newMember.experience !== ''
    );
  }, [newMember.name, newMember.email, selectedUserId, newMember.role, newMember.domain, newMember.department, newMember.hourlyRate, newMember.experience]);
  const [autoPopulated, setAutoPopulated] = useState({
    email: false,
    role: false,
    domain: false,
    department: false,
    hourlyRate: false,
    skills: false,
    experience: false
  });

  // Get team members from API
  const { teamMembers: apiTeamMembers, loading: teamMembersLoading, error: teamMembersError, refetch: refetchTeamMembers } = useTeamMembers();
  
  // Get projects for project allocation tab
  const { data: projects, loading: projectsLoading } = useProjects();
  
  // Get current user from auth context
  const { user } = useAuth();
  
  // Get projects where current user is allocated
  const { userProjects, loading: userProjectsLoading } = useUserProjects();
  
  // Get all users from API for adding new members
  const { data: usersResponse, loading: usersLoading, error: usersError } = useActiveUsers();
  const allUsers = usersResponse || [];
  
  // Current project ID (hardcoded for now, should be dynamic based on selected project)
  const currentProjectId = 'PROJ0000000000003';
  
  // Allow all users to be available (no filtering for duplicates)
  const availableUsersForProject = useMemo(() => {
    return allUsers;
  }, [allUsers]);
  
  // Create project mapping from projectId to project name
  const projectMapping = useMemo(() => {
    const mapping: { [key: string]: string } = {};
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        mapping[project.id] = project.name;
      });
    }
    console.log('Project mapping created:', mapping);
    return mapping;
  }, [projects]);

  
  // Load users for picker when availableUsersForProject changes
  React.useEffect(() => {
    if (availableUsersForProject && availableUsersForProject.length > 0) {
      loadUsersForPicker();
    }
  }, [availableUsersForProject]);

  // Debug logging
  console.log('=== TEAM ALLOCATION PAGE DEBUG ===');
  console.log('TeamAllocationPage: usersResponse:', usersResponse);
  console.log('TeamAllocationPage: usersLoading:', usersLoading);
  console.log('TeamAllocationPage: usersError:', usersError);
  console.log('TeamAllocationPage: allUsers length:', allUsers.length);
  console.log('TeamAllocationPage: allUsers:', allUsers);
  console.log('TeamAllocationPage: projects:', projects);
  console.log('TeamAllocationPage: projectMapping:', projectMapping);
  console.log('TeamAllocationPage: apiTeamMembers:', apiTeamMembers);
  console.log('TeamAllocationPage: availableUsers length:', availableUsers.length);
  console.log('TeamAllocationPage: availableUsers:', availableUsers);
  
  // Check if useUsers hook is working
  React.useEffect(() => {
    console.log('TeamAllocationPage: useUsers hook effect triggered');
    console.log('TeamAllocationPage: usersLoading changed to:', usersLoading);
    console.log('TeamAllocationPage: usersError changed to:', usersError);
    console.log('TeamAllocationPage: usersResponse changed to:', usersResponse);
  }, [usersLoading, usersError, usersResponse]);

  // Load users for picker when dialog opens
  React.useEffect(() => {
    if (isAddMemberDialogOpen && availableUsers.length === 0) {
      console.log('TeamAllocationPage: Dialog opened, loading users...');
      console.log('TeamAllocationPage: availableUsersForProject:', availableUsersForProject);
      
      // Use all available users (duplicates allowed)
      if (availableUsersForProject && availableUsersForProject.length > 0) {
        console.log('TeamAllocationPage: Loading all users...');
        const fallbackUsers = availableUsersForProject.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId,
          domainId: user.domainId,
          avatarUrl: user.avatarUrl,
          experience: user.experience,
          hourlyRate: user.hourlyRate,
          availabilityPercentage: user.availabilityPercentage,
          skills: user.skills,
          isActive: user.isActive
        }));
        setAvailableUsers(fallbackUsers);
        toast.success(`Loaded ${fallbackUsers.length} users`);
      } else {
        console.log('TeamAllocationPage: No users available...');
        toast.warning('No users available to add.');
      }
    }
  }, [isAddMemberDialogOpen, availableUsersForProject, allUsers]);

  // Fallback mock data if no users are available
  React.useEffect(() => {
    if (isAddMemberDialogOpen && availableUsers.length === 0 && !loadingUsers) {
      console.log('TeamAllocationPage: Using mock data as final fallback...');
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'developer',
          departmentId: 'dept-1',
          domainId: 'domain-1',
          avatarUrl: '',
          experience: 'mid',
          hourlyRate: 50,
          availabilityPercentage: 100,
          skills: 'JavaScript, React, Node.js',
          isActive: true
        },
        {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          role: 'designer',
          departmentId: 'dept-2',
          domainId: 'domain-2',
          avatarUrl: '',
          experience: 'senior',
          hourlyRate: 60,
          availabilityPercentage: 80,
          skills: 'UI/UX, Figma, Adobe Creative Suite',
          isActive: true
        },
        {
          id: 'user-3',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          role: 'manager',
          departmentId: 'dept-1',
          domainId: 'domain-1',
          avatarUrl: '',
          experience: 'senior',
          hourlyRate: 70,
          availabilityPercentage: 100,
          skills: 'Project Management, Agile, Leadership',
          isActive: true
        }
      ];
      setAvailableUsers(mockUsers);
      toast.success(`Loaded ${mockUsers.length} users (mock data)`);
    }
  }, [isAddMemberDialogOpen, availableUsers.length, loadingUsers]);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('TeamAllocationPage: Testing backend connection...');
      const response = await fetch('http://localhost:8080/api/users/active', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || 'demo-token'}`
        }
      });
      console.log('TeamAllocationPage: Backend test response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('TeamAllocationPage: Backend test data:', data);
      } else {
        console.error('TeamAllocationPage: Backend test failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('TeamAllocationPage: Backend test error:', error);
    }
  };

  // Function to load users for picker
  const loadUsersForPicker = async () => {
    console.log('TeamAllocationPage: Loading users for picker...');
    setLoadingUsers(true);
    try {
      // Use all available users (duplicates allowed)
      console.log('TeamAllocationPage: Loading all users...');
      if (availableUsersForProject && availableUsersForProject.length > 0) {
        const pickerUsers = availableUsersForProject.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          departmentId: user.departmentId,
          domainId: user.domainId,
          avatarUrl: user.avatarUrl,
          experience: user.experience,
          hourlyRate: user.hourlyRate,
          availabilityPercentage: user.availabilityPercentage,
          skills: user.skills,
          isActive: user.isActive
        }));
        setAvailableUsers(pickerUsers);
        toast.success(`Loaded ${pickerUsers.length} users`);
      } else {
        toast.warning('No users available to add.');
      }
    } catch (error) {
      console.error('TeamAllocationPage: Error loading users:', error);
      toast.error(`Failed to load users: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Function to handle user selection and auto-populate fields
  const handleUserSelection = async (userId: string) => {
    setSelectedUserId(userId);
    if (userId) {
      try {
        // Find the user in the available users list
        const user = availableUsers.find(u => u.id === userId);
        if (user) {
          setNewMember({
            name: user.name,
            email: user.email,
            role: user.role,
            domain: user.domainId || '',
            department: user.departmentId || '',
            password: 'password123', // Default password
            hourlyRate: user.hourlyRate || 0,
            skills: user.skills ? user.skills.split(',').map(s => s.trim()) : [],
            budget: user.hourlyRate ? user.hourlyRate * 176 : 0, // Calculate monthly budget
            experience: user.experience || 'mid',
            availability: user.availabilityPercentage || 100
          });
          setAutoPopulated({
            email: true,
            role: true,
            domain: true,
            department: true,
            hourlyRate: true,
            skills: true,
            experience: true
          });
          toast.success(`Auto-populated fields for ${user.name}`);
        } else {
          toast.error('User not found in available users');
        }
      } catch (error) {
        console.error('Error loading user details:', error);
        toast.error('Failed to load user details');
      }
    }
  };

  
  // Use real API data for team members instead of mock data
  const teamMembers = useMemo(() => {
    console.log('TeamAllocationPage: Using real API team members data...');
    console.log('TeamAllocationPage: apiTeamMembers length:', apiTeamMembers?.length || 0);
    console.log('TeamAllocationPage: apiTeamMembers:', apiTeamMembers);
    console.log('TeamAllocationPage: projects length:', projects?.length || 0);
    console.log('TeamAllocationPage: projects:', projects);
    
    // Use real API data from useTeamMembers hook
    if (apiTeamMembers && apiTeamMembers.length > 0) {
      try {
        return apiTeamMembers.map((member) => {
        // Calculate utilization based on allocation percentage
        const utilization = member.allocationPercentage || 0;
        const baseCapacity = 40; // Standard capacity
        const allocated = Math.floor((utilization / 100) * baseCapacity);
        
        console.log('Processing member:', member.name, 'with data:', member);
        console.log('Member projectId:', member.projectId);
        console.log('Project mapping for this projectId:', projectMapping[member.projectId]);
      



        return {
          id: member.userId || member.id || '',
          name: member.name || 'Unknown',
          email: member.email || '',
          role: (member.role as 'developer' | 'designer' | 'manager' | 'admin') || 'developer',
          domain: member.domain || 'General',
          department: member.department || 'Engineering',
          status: utilization > 100 ? 'overloaded' : utilization > 90 ? 'busy' : 'available',
          capacity: baseCapacity,
          allocated,
          utilization,
          skills: member.skills ? (Array.isArray(member.skills) ? member.skills : member.skills.split(',').map(s => s.trim())) : ['General'],
          projectAssignments: [{
            name: projectMapping[member.projectId] || member.projectName || member.project?.name || 'Unknown Project',
            allocation: member.allocationPercentage || member.allocation || 0,
            role: member.role || 'developer'
          }],
          performance: {
            velocity: Math.floor(Math.random() * 20) + 10,
            quality: Math.floor(Math.random() * 20) + 80,
            collaboration: Math.floor(Math.random() * 20) + 80
          },
          hourlyRate: member.hourlyRate || 1800,
          budget: member.hourlyRate ? member.hourlyRate * 176 : 316800,
          experience: member.experience || 'mid'
        };
        });
      } catch (error) {
        console.error('Error mapping team members:', error);
        console.error('Problematic member data:', apiTeamMembers);
        return [];
      }
    }
    
    // Return empty array if no team members
    return [];
  }, [apiTeamMembers, projects, projectMapping, refreshTrigger]);

  // Filter team members based on search and filters
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (member.role as string).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesDomain = domainFilter === 'all' || member.domain === domainFilter;
      const matchesRole = roleFilter === 'all' || (member.role as string) === roleFilter;
      
      return matchesSearch && matchesDepartment && matchesDomain && matchesRole;
    });
  }, [teamMembers, searchTerm, departmentFilter, domainFilter, roleFilter]);

  // Group team members by project for project allocation view
  const projectGroups = useMemo(() => {
    try {
      const groups: { [projectName: string]: Array<{ member: TeamMember; allocation: number; role: string }> } = {};
      
      teamMembers.forEach(member => {
        // Get project assignments from member's projectAssignments
        if (member.projectAssignments && member.projectAssignments.length > 0) {
          member.projectAssignments.forEach(assignment => {
            if (!groups[assignment.name]) {
              groups[assignment.name] = [];
            }
            groups[assignment.name].push({
              member,
              allocation: assignment.allocation,
              role: assignment.role
            });
          });
        }
      });
      
      return groups;
    } catch (error) {
      console.error('Error calculating project groups:', error);
      return {};
    }
  }, [teamMembers, refreshTrigger]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMembers = filteredMembers.length;
    const avgUtilization = Math.round(filteredMembers.reduce((sum, member) => sum + member.utilization, 0) / totalMembers);
    const availableHours = filteredMembers.reduce((sum, member) => sum + (member.capacity - member.allocated), 0);
    const overloadedCount = filteredMembers.filter(member => member.utilization > 100).length;
    
    return { totalMembers, avgUtilization, availableHours, overloadedCount };
  }, [filteredMembers]);

  // Get unique values for filters
  const departments = [...new Set(teamMembers.map(m => m.department))].filter(Boolean);
  const domains = [...new Set(teamMembers.map(m => m.domain))].filter(Boolean);
  const roles: string[] = [...new Set(teamMembers.map(m => m.role as string))].filter(Boolean) as string[];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overloaded': return 'bg-red-100 text-red-800 border-red-200';
      case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string, domain: string) => {
    if (role === 'admin') return Shield;
    if (role === 'manager') return Users;
    if (role === 'designer') {
      if (domain === 'Marketing') return Briefcase;
      if (domain === 'HR') return Heart;
      return Palette;
    }
    if (role === 'developer') {
      if (domain === 'Angular' || domain === 'Maui') return Code;
      if (domain === 'Java') return Coffee;
      if (domain === 'Testing') return TestTube;
      if (domain === 'Implementation') return Cog;
      if (domain === 'Database') return Database;
      return Code;
    }
    return Users;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 90) return 'text-orange-600';
    if (utilization > 80) return 'text-green-600';
    return 'text-blue-600';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getProjectDescription = (projectName: string) => {
    const descriptions: { [key: string]: string } = {
      'FinTech Mobile App': 'Secure mobile banking application with real-time transactions',
      'E-Commerce Platform': 'Full-stack online marketplace with payment integration',
      'Banking Dashboard': 'Financial analytics and reporting dashboard for banks',
      'Healthcare Portal': 'Patient management system with HIPAA compliance',
      'Education Management': 'Student information system for educational institutions',
      'Supply Chain System': 'End-to-end logistics and inventory management platform',
      'CRM Solution': 'Customer relationship management with sales automation',
      'Analytics Platform': 'Business intelligence and data visualization tools',
      'AI Chat Support': 'Intelligent customer support chatbot with NLP',
      'IoT Dashboard': 'Real-time monitoring dashboard for IoT devices'
    };
    return descriptions[projectName] || 'Project management and development platform';
  };

  const getTeamValidation = (projectName: string) => {
    const projectAssignments = projectGroups[projectName] || [];
    const teamSize = projectAssignments.length;
    const maxTeamSize = 9; // Maximum team size
    const maxManagers = 1; // Maximum managers per project
    
    // Check for managers both by role and by checking apiTeamMembers for isTeamLead
    const projectId = Object.keys(projectMapping).find(id => projectMapping[id] === projectName);
    const projectApiMembers = projectId 
      ? apiTeamMembers.filter(member => member.projectId === projectId)
      : [];
    
    // Count managers: check both role === 'manager' AND isTeamLead flag
    const managerCount = projectApiMembers.filter(member => 
      member.role === 'manager' || member.isTeamLead === true
    ).length;
    
    const managerInfo = projectApiMembers.find(member => 
      member.role === 'manager' || member.isTeamLead === true
    );
    
    const hasManager = managerCount > 0;
    const canAddManager = managerCount < maxManagers;
    
    return {
      isAtCapacity: teamSize >= maxTeamSize,
      isNearCapacity: teamSize >= maxTeamSize - 2,
      canAddMember: teamSize < maxTeamSize,
      needsManager: !hasManager && teamSize > 0,
      hasManager,
      canAddManager,
      managerCount,
      maxManagers,
      teamSize,
      maxMembers: maxTeamSize,
      managerName: managerInfo?.name || null
    };
  };

  // Auto-population logic based on name patterns
  const autoPopulateFromName = (name: string) => {
    if (!name || name.length < 2) return;

    const nameLower = name.toLowerCase();
    const nameParts = nameLower.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    // Generate email
    const email = `${firstName}.${lastName}@company.com`;
    
    // Determine role based on name patterns
    let role: 'developer' | 'designer' | 'manager' | 'admin' = 'developer';
    let domain = '';
    let department = '';
    let experience: 'junior' | 'mid' | 'senior' | 'lead' = 'mid';
    let hourlyRate = 1800;
    let skills: string[] = [];

    // Role detection based on name patterns
    if (nameLower.includes('manager') || nameLower.includes('lead') || nameLower.includes('head')) {
      role = 'manager';
      experience = 'senior';
      hourlyRate = 2500;
      skills = ['Project Management', 'Leadership', 'Strategy', 'Team Management'];
    } else if (nameLower.includes('admin') || nameLower.includes('director') || nameLower.includes('ceo')) {
      role = 'admin';
      experience = 'lead';
      hourlyRate = 3000;
      skills = ['Administration', 'Strategic Planning', 'Leadership', 'System Management'];
    } else if (nameLower.includes('design') || nameLower.includes('ui') || nameLower.includes('ux')) {
      role = 'designer';
      experience = 'mid';
      hourlyRate = 2000;
      skills = ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'];
    }

    // Domain detection based on name patterns
    if (nameLower.includes('angular') || nameLower.includes('frontend') || nameLower.includes('react')) {
      domain = 'Angular';
      skills = ['Angular', 'TypeScript', 'RxJS', 'Material UI', 'HTML/CSS'];
    } else if (nameLower.includes('java') || nameLower.includes('backend') || nameLower.includes('spring')) {
      domain = 'Java';
      skills = ['Java', 'Spring Boot', 'Hibernate', 'Maven', 'JUnit'];
    } else if (nameLower.includes('mobile') || nameLower.includes('maui') || nameLower.includes('flutter')) {
      domain = 'Maui';
      skills = ['.NET MAUI', 'C#', 'Xamarin', 'MVVM', 'SQLite'];
    } else if (nameLower.includes('test') || nameLower.includes('qa') || nameLower.includes('quality')) {
      domain = 'Testing';
      skills = ['Selenium', 'Jest', 'Cypress', 'JUnit', 'TestNG'];
    } else if (nameLower.includes('devops') || nameLower.includes('deploy') || nameLower.includes('infra')) {
      domain = 'Implementation';
      skills = ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Jenkins'];
    } else if (nameLower.includes('data') || nameLower.includes('database') || nameLower.includes('sql')) {
      domain = 'Database';
      skills = ['PostgreSQL', 'MongoDB', 'Redis', 'SQL Server', 'Oracle'];
    } else if (nameLower.includes('market') || nameLower.includes('brand') || nameLower.includes('social')) {
      domain = 'Marketing';
      skills = ['Digital Marketing', 'Adobe Creative Suite', 'Analytics', 'SEO', 'Social Media'];
    } else if (nameLower.includes('hr') || nameLower.includes('human') || nameLower.includes('talent')) {
      domain = 'HR';
      skills = ['Recruitment', 'HRIS', 'Performance Management', 'Training', 'Compliance'];
    } else if (nameLower.includes('system') || nameLower.includes('admin') || nameLower.includes('ops')) {
      domain = 'System Administration';
      skills = ['Linux', 'AWS', 'Docker', 'Monitoring', 'Security'];
    } else {
      // Default to Angular for developers
      domain = 'Angular';
      skills = ['Angular', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Node.js'];
    }

    // Department assignment based on name patterns
    if (nameLower.includes('vnit') || nameLower.includes('tech') || nameLower.includes('dev')) {
      department = 'VNIT';
    } else if (nameLower.includes('dinshaw') || nameLower.includes('finance') || nameLower.includes('bank')) {
      department = 'Dinshaw';
    } else if (nameLower.includes('hospy') || nameLower.includes('health') || nameLower.includes('medical')) {
      department = 'Hospy';
    } else if (nameLower.includes('pharma') || nameLower.includes('drug') || nameLower.includes('medicine')) {
      department = 'Pharma';
    } else {
      // Default department
      department = 'VNIT';
    }

    // Experience level based on name patterns
    if (nameLower.includes('senior') || nameLower.includes('sr') || nameLower.includes('lead')) {
      experience = 'senior';
      hourlyRate = Math.round(hourlyRate * 1.3);
    } else if (nameLower.includes('junior') || nameLower.includes('jr') || nameLower.includes('entry')) {
      experience = 'junior';
      hourlyRate = Math.round(hourlyRate * 0.7);
    } else if (nameLower.includes('architect') || nameLower.includes('principal') || nameLower.includes('expert')) {
      experience = 'lead';
      hourlyRate = Math.round(hourlyRate * 1.5);
    }

    // Calculate budget
    const budget = Math.round(hourlyRate * 8 * 22 * (newMember.availability || 100) / 100);

    // Update the form with auto-populated data
    setNewMember(prev => ({
      ...prev,
      email: email,
      role: role,
      domain: domain,
      department: department,
      hourlyRate: hourlyRate,
      skills: skills,
      budget: budget,
      experience: experience
    }));

    // Mark fields as auto-populated
    setAutoPopulated({
      email: true,
      role: true,
      domain: true,
      department: true,
      hourlyRate: true,
      skills: true,
      experience: true
    });
  };

  // Handle name change with auto-population
  const handleNameChange = (name: string) => {
    setNewMember(prev => ({ ...prev, name }));
    
    // Auto-populate after a short delay to avoid excessive calls
    const timeoutId = setTimeout(() => {
      autoPopulateFromName(name);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleAddMember = async () => {
    console.log('=== HANDLE ADD MEMBER DEBUG ===');
    console.log('selectedUserId:', selectedUserId);
    console.log('newMember:', newMember);
    
    if (!selectedUserId) {
      console.warn('❌ No selectedUserId, stopping');
      toast.error('Please select a user from the dropdown first.');
      return;
    }
    console.log('✅ selectedUserId check passed');
    
    if (!newMember.name || !newMember.email || !newMember.hourlyRate) {
      console.warn('❌ Missing required fields:', {
        name: newMember.name,
        email: newMember.email,
        hourlyRate: newMember.hourlyRate
      });
      toast.error('Please fill in all required fields (Name, Email, and Hourly Rate)');
      return;
    }
    console.log('✅ Required fields check passed');

    // Check team constraints - use actual project ID from apiTeamMembers
    const projectId = currentProjectId;
    console.log('Checking validation for project ID:', projectId);
    
    // Find project name from projectMapping
    const projectName = projectMapping[projectId] || 'Unknown Project';
    console.log('Project name:', projectName);
    
    const validation = getTeamValidation(projectName);
    console.log('Validation result:', {
      canAddMember: validation.canAddMember,
      canAddManager: validation.canAddManager,
      managerCount: validation.managerCount,
      hasManager: validation.hasManager,
      teamSize: validation.teamSize
    });
    
    if (!validation.canAddMember) {
      toast.error(`Cannot add more members. Team is at maximum capacity (${validation.maxMembers} members).`);
      return;
    }

    if (newMember.role === 'manager' && !validation.canAddManager) {
      console.log('❌ Manager validation failed:', {
        role: newMember.role,
        canAddManager: validation.canAddManager,
        managerCount: validation.managerCount,
        maxManagers: validation.maxManagers,
        projectName: projectName
      });
      toast.error('Cannot add another manager. Only one manager is allowed per project.');
      return;
    }

    console.log('✅ All validations passed, proceeding to add member');
    setIsAddingMember(true);
    try {
      // Calculate budget if not provided
      const budget = newMember.budget || (newMember.hourlyRate * 8 * 22 * (newMember.availability || 100) / 100);

      // First create the user if they don't exist
      const userData = {
        name: newMember.name,
        email: newMember.email,
        passwordHash: newMember.password || 'password123', // Backend expects passwordHash (should be hashed)
        role: newMember.role.toLowerCase(), // Backend expects lowercase role
        domainId: newMember.domain, // Backend expects domainId
        departmentId: newMember.department, // Backend expects departmentId
        hourlyRate: newMember.hourlyRate,
        skills: Array.isArray(newMember.skills) ? JSON.stringify(newMember.skills) : newMember.skills, // Backend expects JSON string
        experience: newMember.experience.toLowerCase(), // Backend expects lowercase
        availabilityPercentage: newMember.availability, // Backend expects availabilityPercentage
        isActive: true
      };

      console.log('Adding team member:', userData);
      console.log('Role value:', userData.role);
      console.log('Experience value:', userData.experience);
      console.log('Skills value:', userData.skills);
      console.log('PasswordHash value:', userData.passwordHash);

      // Use the selected user from the dropdown
      let createdUser;
      if (!selectedUserId) {
        toast.error('Please select a user from the dropdown first.');
        throw new Error('No user selected. Please select a user from the dropdown.');
      }

      try {
        console.log('Using selected user ID:', selectedUserId);
        const userResponse = await fetch(`http://localhost:8080/api/users/${selectedUserId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (userResponse.ok) {
          createdUser = await userResponse.json();
          console.log('Using selected user:', createdUser);
        } else {
          throw new Error(`Failed to fetch user details for ID: ${selectedUserId}`);
        }
      } catch (error) {
        console.error('Error fetching selected user:', error);
        toast.error('Failed to fetch selected user details.');
        throw error;
      }

      // Now add the user to the project team
      const projectId = currentProjectId; // Use current project ID
      
      const teamMemberData = {
        projectId: projectId,
        userId: createdUser.id,
        role: newMember.role,
        isTeamLead: newMember.role === 'manager' || newMember.role === 'admin',
        allocationPercentage: 100
      };
      
      console.log('=== TEAM MEMBER DATA ===');
      console.log('Project ID:', projectId);
      console.log('User ID:', createdUser.id);
      console.log('Role:', newMember.role);
      console.log('Is Team Lead:', teamMemberData.isTeamLead);
      console.log('Full Data:', JSON.stringify(teamMemberData, null, 2));

      console.log('Adding team member to project:', teamMemberData);

      const authToken = localStorage.getItem('authToken') || '';
      console.log('Auth Token:', authToken ? `${authToken.substring(0, 20)}...` : 'NO TOKEN');
      
      console.log('=== SENDING REQUEST ===');
      console.log('URL: http://localhost:8080/api/project-team-members/add-to-project');
      console.log('Method: POST');
      console.log('Body:', JSON.stringify(teamMemberData, null, 2));
      
      const teamMemberResponse = await fetch('http://localhost:8080/api/project-team-members/add-to-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(teamMemberData)
      });
      
      console.log('=== RESPONSE RECEIVED ===');
      console.log('Status:', teamMemberResponse.status, teamMemberResponse.statusText);
      console.log('OK:', teamMemberResponse.ok);

        if (!teamMemberResponse.ok) {
          let errorResponse;
          try {
            // Read response once - clone if needed for multiple reads
            const responseText = await teamMemberResponse.text();
            console.log('=== ERROR RESPONSE (RAW) ===');
            console.log('Response Text:', responseText);
            console.log('Response Length:', responseText.length);
            
            // Try to parse as JSON
            try {
              errorResponse = JSON.parse(responseText);
              console.log('=== ERROR RESPONSE (PARSED) ===');
              console.log('Full Error Object:', JSON.stringify(errorResponse, null, 2));
            } catch (jsonError) {
              console.error('Failed to parse as JSON:', jsonError);
              // Create a mock error response from text
              errorResponse = {
                message: responseText || `Server error: ${teamMemberResponse.status}`,
                errorCode: 'UNKNOWN_ERROR',
                details: responseText
              };
            }
          } catch (readError) {
            console.error('Failed to read error response:', readError);
            errorResponse = {
              message: `Server error: ${teamMemberResponse.status} ${teamMemberResponse.statusText}`,
              errorCode: 'READ_ERROR',
              details: readError.message
            };
          }
          
          // Handle specific error codes and messages from the backend
          // All messages are transformed to be user-friendly (UI/UX focused)
          const errorCode = errorResponse.errorCode || '';
          const errorMessage = errorResponse.message || 'Unable to add team member';
          const userName = errorResponse.userName || newMember.name;
          
          console.log('=== ERROR DETAILS ===');
          console.log('Error Code:', errorCode);
          console.log('Error Message:', errorMessage);
          console.log('User Name:', userName);
          console.log('Debug Info:', errorResponse.debug);
          
          switch (errorCode) {
            case 'ALLOCATION_EXCEEDED':
              const availableAlloc = errorResponse.availableAllocation || 0;
              const currentAlloc = errorResponse.currentAllocation || 100;
              toast.error(`${userName} is fully allocated`, {
                description: availableAlloc > 0 
                  ? `This person is working at ${currentAlloc}% capacity. You can only assign up to ${availableAlloc}% to this project.`
                  : `This person is already working at 100% capacity on other projects. Please select someone else with available time.`,
                duration: 7000
              });
              break;
              
            case 'TEAM_LEAD_EXISTS':
              const debugInfo = errorResponse.debug;
              const debugMsg = debugInfo 
                ? `Debug: Found ${debugInfo.totalMembers} members in project ${debugInfo.projectId}. Please check backend logs for details.`
                : '';
              toast.error('Cannot assign as team lead', {
                description: `This project already has a team lead. ${debugMsg} Remove the existing team lead first, or assign this person as a regular team member.`,
                duration: 7000
              });
              console.error('TEAM_LEAD_EXISTS error:', errorResponse);
              break;
              
            case 'MISSING_PROJECT_ID':
            case 'MISSING_USER_ID':
            case 'MISSING_ROLE':
              toast.error('Information missing', {
                description: 'Please fill in all required fields to add a team member.',
                duration: 4000
              });
              break;
              
            case 'INVALID_ALLOCATION':
              toast.error('Invalid allocation percentage', {
                description: 'Allocation must be between 0% and 100%. Please adjust the percentage and try again.',
                duration: 4000
              });
              break;
              
            case 'USER_NOT_FOUND':
              toast.error('Team member not found', {
                description: 'The selected person may have been removed. Please refresh the page and select someone else.',
                duration: 5000
              });
              break;
              
            case 'VALIDATION_ERROR':
              toast.error('Invalid information', {
                description: 'Please check all fields and make sure the information is correct before trying again.',
                duration: 4000
              });
              break;
              
            case 'DUPLICATE_ASSIGNMENT':
            case 'DATABASE_ERROR':
              toast.error('Database constraint error', {
                description: errorMessage || 'The database constraint may still exist. Please contact your database administrator to remove the unique constraint.',
                duration: 6000
              });
              console.error('Database constraint error:', errorResponse.details);
              break;
              
            case 'INTERNAL_ERROR':
              toast.error('Something went wrong', {
                description: 'We encountered an unexpected error. Please try again in a moment. If the problem continues, contact support.',
                duration: 6000
              });
              // Only log details to console for debugging, not to user
              if (errorResponse.details) {
                console.error('Server error details:', errorResponse.details);
              }
              break;
              
            default:
              // Fallback: check message content for common patterns and transform to user-friendly messages
              if (errorMessage.toLowerCase().includes('exceed') || errorMessage.toLowerCase().includes('allocation')) {
                // Parse allocation details from message
                const allocationMatch = errorMessage.match(/Current allocation: (\d+)%|Current: (\d+)%/);
                const requestedMatch = errorMessage.match(/Requested: (\d+)%/);
                const currentAlloc = allocationMatch ? (allocationMatch[1] || allocationMatch[2]) : '100';
                const requestedAlloc = requestedMatch ? requestedMatch[1] : '100';
                const availableAlloc = Math.max(0, 100 - parseInt(currentAlloc));
                
                toast.error(`${userName} is fully allocated`, {
                  description: `This team member is already working at ${currentAlloc}% capacity on other projects. ${availableAlloc > 0 ? `You can only assign up to ${availableAlloc}% to this project.` : 'Please select a different team member who has available capacity.'}`,
                  duration: 7000
                });
              } else if (errorMessage.toLowerCase().includes('team lead')) {
                toast.error('Cannot assign as team lead', {
                  description: 'This project already has a team lead. To assign this person as team lead, first remove the existing team lead.',
                  duration: 6000
                });
              } else {
                // Generic user-friendly error message
                toast.error('Unable to add team member', {
                  description: 'Please check the information and try again. If the problem continues, contact support.',
                  duration: 5000
                });
              }
          }
          
          throw new Error(`Failed to add team member: ${errorCode} - ${errorMessage}`);
        }

      const addedTeamMember = await teamMemberResponse.json();
      console.log('Added team member to project:', addedTeamMember);
      
      // Use backend success message if available, otherwise use generic message
      const successMessage = addedTeamMember.message || `${newMember.name} has been added to the team!`;
      toast.success(successMessage, {
        description: addedTeamMember.userName ? `Role: ${newMember.role}` : '',
        duration: 4000
      });
      
      // Refresh team members data to update the UI
      if (refetchTeamMembers) {
        await refetchTeamMembers();
      }
      
      // Reload available users to refresh the picker
      await loadUsersForPicker();
      
      // Force a UI refresh
      setRefreshTrigger(prev => prev + 1);
      
      // Reset selected user
      setSelectedUserId('');
      
      // Reset form
      setNewMember({
        name: '',
        email: '',
        role: 'developer',
        domain: '',
        department: '',
        password: '',
        hourlyRate: 0,
        skills: [],
        budget: 0,
        experience: 'mid',
        availability: 100
      });
      setAutoPopulated({
        email: false,
        role: false,
        domain: false,
        department: false,
        hourlyRate: false,
        skills: false,
        experience: false
      });
      
      setIsAddMemberDialogOpen(false);
    } catch (error) {
      // Error is already handled in the specific error handling block above
      // Only show generic error if it's a network error or unexpected error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error', {
          description: 'Unable to connect to the server. Please check your internet connection and try again.',
          duration: 6000
        });
      } else if (!(error instanceof Error && error.message.includes('Failed to add team member'))) {
        // Only show generic error if not already handled
        toast.error('Failed to add team member', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
          duration: 5000
        });
      }
      console.error('Error adding team member:', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  // Show loading state
  if (teamMembersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team members...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (teamMembersError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-red-600 mb-4">Failed to load team members</p>
          <p className="text-gray-600 mb-4">{teamMembersError}</p>
          <Button onClick={refetchTeamMembers} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Team Allocation</h1>
          <p className="text-muted-foreground">Manage team capacity and project assignments across all departments</p>
        </div>
      </div>

      {/* Single Line Search and Filters */}
      <Card className="mb-6 shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <div className="flex gap-3 items-center">
            {/* Search Input */}
            <div className="flex-1 min-w-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name, role, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                  >
                    <XCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Department Filter */}
            <div className="w-40">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span>{dept}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domain Filter */}
            <div className="w-40">
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-gray-500" />
                        <span>{domain}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="w-40">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear All Button */}
            {(searchTerm || departmentFilter !== 'all' || domainFilter !== 'all' || roleFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setDepartmentFilter('all');
                  setDomainFilter('all');
                  setRoleFilter('all');
                }}
                className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 whitespace-nowrap"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters and Results Summary */}
          <div className="flex justify-between items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                  "{searchTerm}"
                </Badge>
              )}
              {departmentFilter !== 'all' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  {departmentFilter}
                </Badge>
              )}
              {domainFilter !== 'all' && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                  {domainFilter}
                </Badge>
              )}
              {roleFilter !== 'all' && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                  {roleFilter}
                </Badge>
              )}
              {!searchTerm && departmentFilter === 'all' && domainFilter === 'all' && roleFilter === 'all' && (
                <span className="text-sm text-gray-400">No filters applied</span>
              )}
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredMembers.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{teamMembers.length}</span> members
              {filteredMembers.length !== teamMembers.length && (
                <span className="text-blue-600 ml-1">
                  ({teamMembers.length - filteredMembers.length} hidden)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="text-2xl font-semibold">{stats.totalMembers}</p>
                <p className="text-xs text-muted-foreground">Total: {teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Utilization</p>
                <p className={`text-2xl font-semibold ${getUtilizationColor(stats.avgUtilization)}`}>
                  {stats.avgUtilization}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Hours</p>
                <p className="text-2xl font-semibold">{stats.availableHours}h</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overloaded</p>
                <p className="text-2xl font-semibold text-red-600">{stats.overloadedCount}</p>
                <p className="text-xs text-muted-foreground">Need attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Allocation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Allocation</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const RoleIcon = getRoleIcon(member.role as string, member.domain as string);
              return (
                <Card 
                  key={member.id} 
                  className={`hover:shadow-md transition-shadow cursor-pointer ${
                    selectedMember === member.name ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setSelectedMember(member.name)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar || ''} alt={member.name || 'Unknown'} />
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                          {getInitials(member.name || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <RoleIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <CardDescription>{member.domain || 'General'} • {member.department || 'Engineering'}</CardDescription>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(member.status || 'available')}>
                            {(member.status || 'available').charAt(0).toUpperCase() + (member.status || 'available').slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {((member.role as string) || 'developer').charAt(0).toUpperCase() + ((member.role as string) || 'developer').slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Utilization */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span className={getUtilizationColor(member.utilization)}>
                          {member.utilization}%
                        </span>
                      </div>
                      <Progress value={Math.min(member.utilization, 100)} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {member.allocated}h / {member.capacity}h allocated
                      </div>
                    </div>

                    {/* Current Projects */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current Projects</p>
                      <div className="space-y-1">
                        {(member.projectAssignments || []).slice(0, 2).map((project, index) => (
                          <div key={index} className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground truncate">{project.name}</span>
                              <span>{project.allocation}%</span>
                            </div>
                            <div className="text-muted-foreground">{project.role}</div>
                          </div>
                        ))}
                        {(member.projectAssignments || []).length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{(member.projectAssignments || []).length - 2} more projects
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {(member.skills || []).slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {(member.skills || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(member.skills || []).length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Budget Information */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Budget</span>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            ₹{member.budget?.toLocaleString()}/month
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ₹{member.hourlyRate}/hr
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Experience</span>
                        <Badge variant="outline" className="text-xs">
                          {member.experience}
                        </Badge>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="space-y-2 pt-2 border-t">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium">{member.performance.velocity}</div>
                          <div className="text-muted-foreground">Velocity</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{member.performance.quality}%</div>
                          <div className="text-muted-foreground">Quality</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{member.performance.onTime}%</div>
                          <div className="text-muted-foreground">On Time</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(() => {
              const projectsWithMembers = Object.entries(projectGroups)
                .filter(([projectName, assignments]) => {
                  // Only show projects that have team members assigned
                  const typedAssignments = assignments as Array<{ member: TeamMember; allocation: number; role: string }>;
                  return typedAssignments.length > 0;
                });

              if (projectsWithMembers.length === 0) {
                return (
                  <div className="col-span-2 text-center py-12">
                    <div className="text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">No Projects with Team Members</h3>
                      <p className="text-sm">No projects currently have team members assigned. Add team members to see them here.</p>
                    </div>
                  </div>
                );
              }

              return projectsWithMembers.map(([projectName, assignments]) => {
              const typedAssignments = assignments as Array<{ member: TeamMember; allocation: number; role: string }>;
              const validation = getTeamValidation(projectName);
              
              // Calculate project budget and skill summary
              const projectBudget = typedAssignments.reduce((sum, { member, allocation }) => 
                sum + (member.budget * allocation / 100), 0
              );
              const allSkills = typedAssignments.flatMap(({ member }) => member.skills);
              const uniqueSkills = [...new Set(allSkills)];
              const avgAllocation = Math.round(typedAssignments.reduce((sum, a) => sum + a.allocation, 0) / typedAssignments.length);

              return (
                <Card key={projectName} className={validation.isAtCapacity ? 'border-red-200 bg-red-50' : validation.isNearCapacity ? 'border-yellow-200 bg-yellow-50' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Building className="w-5 h-5 text-blue-600" />
                        <span className="text-lg font-semibold">{projectName}</span>
                        {validation.isAtCapacity && (
                          <Badge variant="destructive" className="text-xs">
                            Team Full
                          </Badge>
                        )}
                        {validation.isNearCapacity && !validation.isAtCapacity && (
                          <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                            Near Capacity
                          </Badge>
                        )}
                      </div>
                      <Button 
                        size="sm"
                        className={`${validation.canAddMember ? 'bg-gradient-primary border-0 text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        onClick={() => validation.canAddMember && setIsAddMemberDialogOpen(true)}
                        disabled={!validation.canAddMember}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        {validation.isAtCapacity ? 'Team Full' : 'Add Member'}
                      </Button>
                    </div>
                    <CardDescription>
                      {getProjectDescription(projectName)}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-sm text-gray-600">{validation.teamSize}/{validation.maxMembers} team members • {avgAllocation}% avg allocation</span>
                        {validation.hasManager ? (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            ✓ Manager Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                            ⚠ No Manager
                          </Badge>
                        )}
                      </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          ₹{projectBudget.toLocaleString()}/month
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-muted-foreground">
                          {uniqueSkills.length} skills
                        </span>
                      </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Skills Overview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Project Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {uniqueSkills.slice(0, 6).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {uniqueSkills.length > 6 && (
                          <Badge variant="secondary" className="text-xs">
                            +{uniqueSkills.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Team Members</p>
                      {(() => {
                        // Filter apiTeamMembers by project name (projectId)
                        const projectId = Object.keys(projectMapping).find(
                          id => projectMapping[id] === projectName
                        );
                        const projectMembers = projectId 
                          ? apiTeamMembers.filter(member => member.projectId === projectId)
                          : [];
                        
                        if (projectMembers.length === 0) {
                          return (
                            <div className="text-center py-4 text-gray-500">
                              <p className="text-sm">No team members assigned yet</p>
                              <p className="text-xs">Click "Add Member" to start building your team</p>
                            </div>
                          );
                        }
                        
                        // Remove duplicates based on user ID and display unique members
                        return projectMembers.reduce((uniqueMembers, member) => {
                          if (!uniqueMembers.find(m => m.userId === member.userId)) {
                            uniqueMembers.push(member);
                          }
                          return uniqueMembers;
                        }, [] as typeof apiTeamMembers).map((member, index) => (
                          <div key={member.userId || member.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                                <p className="text-xs text-muted-foreground">{member.domain || 'N/A'}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {member.experience || 'mid'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ₹{member.hourlyRate || 0}/hr
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{member.availability || 100}%</p>
                              <p className="text-xs text-muted-foreground">available</p>
                              <p className="text-xs text-green-600 font-medium">
                                ₹{Math.round((member.budget || 0) * (member.availability || 100) / 100).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                </CardContent>
              </Card>
              );
            });
            })()}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Allocation</CardTitle>
              <CardDescription>Projects where you are allocated as a team member</CardDescription>
            </CardHeader>
            <CardContent>
              {userProjectsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your projects...</p>
                  </div>
                </div>
              ) : userProjects.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <div className="text-gray-400 mb-4">
                      <Building className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-600 mb-2">No projects assigned</p>
                    <p className="text-sm text-gray-500">You are not currently allocated to any projects</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{project.name}</CardTitle>
                            <CardDescription className="mt-2">{project.description}</CardDescription>
                          </div>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Priority</p>
                            <p className="font-medium capitalize">{project.priority}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-medium">₹{parseFloat(project.budget).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Team Members</span>
                            <span className="font-medium">{project.teamMembers?.length || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Planning - Next 2 Weeks</CardTitle>
              <CardDescription>Plan team allocation for upcoming sprints across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.domain} • {member.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(member.status)}>
                          {member.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {member.role as string}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">This Week</p>
                        <div className="space-y-1">
                          <p className="font-medium">{(member.availability?.thisWeek || member.availability || 0)}h</p>
                          <Progress value={((member.availability?.thisWeek || member.availability || 0) / member.capacity) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Next Week</p>
                        <div className="space-y-1">
                          <p className="font-medium">{(member.availability?.nextWeek || member.availability || 0)}h</p>
                          <Progress value={((member.availability?.nextWeek || member.availability || 0) / member.capacity) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Week +2</p>
                        <div className="space-y-1">
                          <p className="font-medium">{(member.availability?.nextTwoWeeks || member.availability || 0)}h</p>
                          <Progress value={((member.availability?.nextTwoWeeks || member.availability || 0) / member.capacity) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {/* Budget and Skills Info */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Budget & Rate</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Hourly Rate:</span>
                            <span className="text-sm font-medium text-green-600">₹{member.hourlyRate}/hr</span>
                  </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Monthly Budget:</span>
                            <span className="text-sm font-medium text-green-600">₹{member.budget?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {member.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{member.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent 
          className="!max-w-none !w-[75vw] max-h-[95vh] flex flex-col"
          style={{ maxWidth: '75vw', width: '75vw', display: 'flex', flexDirection: 'column' }}
        >
          <DialogHeader className="pb-6 border-b border-gray-200">
            <DialogTitle className="flex items-center space-x-3 text-2xl font-semibold text-gray-900">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <span>Add Team Member to Project</span>
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2 ml-13">
              Create a new team member profile with comprehensive information including skills, budget allocation, and availability.
            </DialogDescription>
            
            {/* Team Status Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Team Size: {getTeamValidation(projectMapping[currentProjectId] || 'Current Project').teamSize}/{getTeamValidation(projectMapping[currentProjectId] || 'Current Project').maxMembers}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Managers: {getTeamValidation(projectMapping[currentProjectId] || 'Current Project').managerCount}/{getTeamValidation(projectMapping[currentProjectId] || 'Current Project').maxManagers}
                      {getTeamValidation(projectMapping[currentProjectId] || 'Current Project').managerName && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({getTeamValidation(projectMapping[currentProjectId] || 'Current Project').managerName})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTeamValidation(projectMapping[currentProjectId] || 'Current Project').isAtCapacity ? (
                    <Badge variant="destructive" className="text-xs">
                      Team Full
                    </Badge>
                  ) : getTeamValidation(projectMapping[currentProjectId] || 'Current Project').isNearCapacity ? (
                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                      Near Capacity
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      Space Available
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6">
            <div className="grid gap-8 py-6">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-md">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
              <Input
                id="name"
                    placeholder="Enter full name (e.g., 'John Manager' or 'Sarah Angular Developer')"
                value={newMember.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="h-10"
              />
                  <p className="text-xs text-muted-foreground">
                    💡 Include role keywords in the name for auto-population (e.g., "Manager", "Angular", "Senior")
                  </p>
            </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email * {autoPopulated.email && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={newMember.email}
                    onChange={(e) => {
                      setNewMember({ ...newMember, email: e.target.value });
                      setAutoPopulated(prev => ({ ...prev, email: false }));
                    }}
                    className={`h-10 ${autoPopulated.email ? 'bg-green-50 border-green-200' : ''}`}
              />
            </div>
              </div>
            </div>

            {/* User Picker Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-md">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Select Team Member</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-picker" className="text-sm font-medium">
                  Team Member *
                </Label>
                <Select 
                  value={selectedUserId} 
                  onValueChange={handleUserSelection}
                  disabled={loadingUsers}
                >
                  <SelectTrigger id="user-picker" className="h-10">
                    <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a team member"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <span>{user.name}</span>
                          <span className="text-sm text-gray-500">({user.email})</span>
                          <Badge variant="secondary" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Select a user to auto-populate all fields with their information
                </p>
              </div>
            </div>

            {/* Role & Department Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-md">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Role & Department</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role * {autoPopulated.role && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
                  <Select 
                    value={newMember.role} 
                    onValueChange={(value: any) => {
                      setNewMember({ ...newMember, role: value });
                      setAutoPopulated(prev => ({ ...prev, role: false }));
                    }}
                  >
                    <SelectTrigger id="role" className={`h-10 ${autoPopulated.role ? 'bg-green-50 border-green-200' : ''}`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem 
                        value="manager" 
                        disabled={!getTeamValidation(projectMapping[currentProjectId] || 'Current Project').canAddManager}
                        className={!getTeamValidation(projectMapping[currentProjectId] || 'Current Project').canAddManager ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        Manager {!getTeamValidation(projectMapping[currentProjectId] || 'Current Project').canAddManager && 
                          `(Already assigned${getTeamValidation(projectMapping[currentProjectId] || 'Current Project').managerName ? `: ${getTeamValidation(projectMapping[currentProjectId] || 'Current Project').managerName}` : ''})`}
                      </SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {!getTeamValidation(projectMapping[currentProjectId] || 'Current Project').canAddManager && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Only one manager is allowed per project. Current manager: {getTeamValidation(projectMapping[currentProjectId] || 'Current Project').managerName || 'Unknown'}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-sm font-medium">
                    Domain * {autoPopulated.domain && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
              <Select 
                value={newMember.domain} 
                    onValueChange={(value) => {
                      setNewMember({ ...newMember, domain: value });
                      setAutoPopulated(prev => ({ ...prev, domain: false }));
                    }}
              >
                    <SelectTrigger id="domain" className={`h-10 ${autoPopulated.domain ? 'bg-green-50 border-green-200' : ''}`}>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Angular">Angular</SelectItem>
                  <SelectItem value="Java">Java</SelectItem>
                  <SelectItem value="Maui">Maui</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Implementation">Implementation</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="System Administration">System Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department * {autoPopulated.department && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
              <Select 
                value={newMember.department} 
                    onValueChange={(value) => {
                      setNewMember({ ...newMember, department: value });
                      setAutoPopulated(prev => ({ ...prev, department: false }));
                    }}
              >
                    <SelectTrigger id="department" className={`h-10 ${autoPopulated.department ? 'bg-green-50 border-green-200' : ''}`}>
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
          </div>

            {/* Budget & Experience Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-md">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Budget & Experience</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-sm font-medium">
                    Hourly Rate (₹) * {autoPopulated.hourlyRate && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="1800"
                    value={newMember.hourlyRate}
                    onChange={(e) => {
                      setNewMember({ ...newMember, hourlyRate: Number(e.target.value) });
                      setAutoPopulated(prev => ({ ...prev, hourlyRate: false }));
                    }}
                    className={`h-10 ${autoPopulated.hourlyRate ? 'bg-green-50 border-green-200' : ''}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-sm font-medium">Monthly Budget (₹)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="Auto-calculated"
                    value={newMember.budget}
                    onChange={(e) => setNewMember({ ...newMember, budget: Number(e.target.value) })}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated if empty
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">
                    Experience * {autoPopulated.experience && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
                  <Select 
                    value={newMember.experience} 
                    onValueChange={(value: any) => {
                      setNewMember({ ...newMember, experience: value });
                      setAutoPopulated(prev => ({ ...prev, experience: false }));
                    }}
                  >
                    <SelectTrigger id="experience" className={`h-10 ${autoPopulated.experience ? 'bg-green-50 border-green-200' : ''}`}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-sm font-medium">Availability (%)</Label>
                  <Input
                    id="availability"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    value={newMember.availability}
                    onChange={(e) => setNewMember({ ...newMember, availability: Number(e.target.value) })}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-md">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium">
                  Skills (comma-separated) {autoPopulated.skills && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                </Label>
                <Input
                  id="skills"
                  placeholder="e.g., React, TypeScript, Node.js, PostgreSQL"
                  value={newMember.skills.join(', ')}
                  onChange={(e) => {
                    setNewMember({ 
                      ...newMember, 
                      skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    });
                    setAutoPopulated(prev => ({ ...prev, skills: false }));
                  }}
                  className={`h-10 ${autoPopulated.skills ? 'bg-green-50 border-green-200' : ''}`}
                />
                <p className="text-xs text-muted-foreground">
                  Enter skills separated by commas. Skills will be used for project matching.
                </p>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-50 rounded-md">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Account Access</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Leave blank for default password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  Default password: password123
                </p>
              </div>
            </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="flex-shrink-0 pt-6 border-t border-gray-200 bg-gray-50 px-6 py-4 mt-auto">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-500">
                All fields marked with * are required
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddMemberDialogOpen(false);
                    setSelectedUserId('');
                    setNewMember({
                      name: '',
                      email: '',
                      role: 'developer',
                      domain: '',
                      department: '',
                      password: '',
                      hourlyRate: 0,
                      skills: [],
                      budget: 0,
                      experience: 'mid',
                      availability: 100
                    });
                    setAutoPopulated({
                      email: false,
                      role: false,
                      domain: false,
                      department: false,
                      hourlyRate: false,
                      skills: false,
                      experience: false
                    });
                  }}
                  className="px-6 py-2 h-10 font-medium"
                >
                  Cancel
                </Button>
                <button
                  onClick={() => {
                    console.log('=== BUTTON CLICK EVENT ===');
                    console.log('isFormValid:', isFormValid);
                    console.log('isAddingMember:', isAddingMember);
                    console.log('selectedUserId:', selectedUserId);
                    console.log('newMember:', newMember);
                    
                    if (isFormValid && !isAddingMember) {
                      console.log('✅ Form is valid, calling handleAddMember()');
                      handleAddMember();
                    } else {
                      console.warn('❌ Form is NOT valid or already adding member');
                      console.warn('isFormValid:', isFormValid);
                      console.warn('isAddingMember:', isAddingMember);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 h-12 font-medium text-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed rounded-md"
                  style={{ 
                    minWidth: '200px',
                    background: !isFormValid
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                      : isAddingMember 
                        ? 'linear-gradient(135deg, #81d5e8 0%, #5fb9c9 100%)'
                        : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: (!isFormValid || isAddingMember) ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (isFormValid && !isAddingMember) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFormValid && !isAddingMember) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
                    } else if (!isFormValid) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
                    }
                  }}
                  disabled={!isFormValid || isAddingMember}
                >
                  {isAddingMember ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add Team Member
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamAllocationPage;