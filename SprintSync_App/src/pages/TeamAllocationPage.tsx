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
<<<<<<< HEAD
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useUsers } from '../hooks/api';
=======
import { useAuth } from '../contexts/AuthContext';
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
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
  BarChart3,
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
  Award
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
  const [autoPopulated, setAutoPopulated] = useState({
    email: false,
    role: false,
    domain: false,
    department: false,
    hourlyRate: false,
    skills: false,
    experience: false
  });

  // Get all users from API and generate realistic team allocation data
  const { data: usersResponse } = useUsers();
  const allUsers = usersResponse?.content || [];
  
  // Enhanced team member data based on real user data from AuthContext
  const teamMembers = useMemo(() => {
    return allUsers.map((user, index) => {
      // Generate realistic data based on user properties
      const baseCapacity = user.role === 'admin' ? 35 : user.role === 'manager' ? 35 : user.role === 'designer' ? 35 : 40;
      const utilization = Math.floor(Math.random() * 30) + 70; // 70-100%
      const allocated = Math.floor((utilization / 100) * baseCapacity);
      
      // Generate skills based on domain
      const getSkillsByDomain = (domain: string) => {
        const skillSets: { [key: string]: string[] } = {
          'Angular': ['Angular', 'TypeScript', 'RxJS', 'NgRx', 'Material UI'],
          'Java': ['Java', 'Spring Boot', 'Hibernate', 'Maven', 'JUnit'],
          'Maui': ['.NET MAUI', 'C#', 'Xamarin', 'MVVM', 'SQLite'],
          'Testing': ['Selenium', 'Jest', 'Cypress', 'JUnit', 'TestNG'],
          'Implementation': ['DevOps', 'CI/CD', 'Docker', 'Kubernetes', 'Jenkins'],
          'Database': ['PostgreSQL', 'MongoDB', 'Redis', 'SQL Server', 'Oracle'],
          'Marketing': ['Adobe Creative Suite', 'Figma', 'Canva', 'Analytics', 'SEO'],
          'HR': ['Recruitment', 'HRIS', 'Performance Management', 'Training', 'Compliance'],
          'System Administration': ['Linux', 'AWS', 'Docker', 'Monitoring', 'Security']
        };
        return skillSets[domain] || ['General', 'Communication', 'Problem Solving'];
      };

      // Generate project assignments based on assigned projects
      const getProjectAssignments = (): Array<{ name: string; allocation: number; role: string }> => {
        const projectNames = [
          'FinTech Mobile App', 'E-Commerce Platform', 'Banking Dashboard',
          'Healthcare Portal', 'Education Management', 'Supply Chain System',
          'CRM Solution', 'Analytics Platform', 'AI Chat Support', 'IoT Dashboard',
          'Data Analytics Platform', 'Customer Portal', 'Inventory Management',
          'Payment Gateway', 'User Authentication System', 'Reporting Dashboard'
        ];
        
        const assignments: Array<{ name: string; allocation: number; role: string }> = [];
        
        // Create more realistic project distribution
        const projectDistribution = [
          { name: 'FinTech Mobile App', teamSize: 6, hasManager: true },
          { name: 'E-Commerce Platform', teamSize: 8, hasManager: true },
          { name: 'Banking Dashboard', teamSize: 5, hasManager: true },
          { name: 'Healthcare Portal', teamSize: 7, hasManager: true },
          { name: 'Education Management', teamSize: 4, hasManager: false },
          { name: 'Supply Chain System', teamSize: 9, hasManager: true },
          { name: 'CRM Solution', teamSize: 6, hasManager: true },
          { name: 'Analytics Platform', teamSize: 5, hasManager: false },
          { name: 'AI Chat Support', teamSize: 3, hasManager: false },
          { name: 'IoT Dashboard', teamSize: 4, hasManager: false }
        ];
        
        // Assign user to 1-2 projects based on their role and availability
        const numProjects = user.role === 'manager' ? 1 : Math.floor(Math.random() * 2) + 1;
        const availableProjects = projectDistribution.filter(p => 
          user.role === 'manager' ? !p.hasManager : true
        );
        
        for (let i = 0; i < Math.min(numProjects, availableProjects.length); i++) {
          const project = availableProjects[i];
          const allocation = user.role === 'manager' ? 
            Math.floor(Math.random() * 30) + 50 : // Managers get 50-80% allocation
            Math.floor(Math.random() * 40) + 30;  // Others get 30-70% allocation
          
          assignments.push({
            name: project.name,
            allocation,
            role: getRoleInProject(user.role || 'developer', user.domain || '')
          });
        }
        
        return assignments;
      };

      const getRoleInProject = (userRole: string, domain: string) => {
        if (userRole === 'admin') return 'System Administrator';
        if (userRole === 'manager') return 'Project Manager';
        if (userRole === 'designer') return domain === 'Marketing' ? 'Marketing Lead' : 'UX/UI Designer';
        
        const devRoles: { [key: string]: string } = {
          'Angular': 'Frontend Developer',
          'Java': 'Backend Developer',
          'Maui': 'Mobile Developer',
          'Testing': 'QA Engineer',
          'Implementation': 'DevOps Engineer',
          'Database': 'Database Developer'
        };
        
        return devRoles[domain || ''] || 'Full Stack Developer';
      };

      // Generate status based on utilization
      const getStatus = (util: number) => {
        if (util > 100) return 'overloaded';
        if (util > 90) return 'busy';
        if (util < 75) return 'available';
        return 'busy';
      };

      // Generate performance metrics
      const performance = {
        velocity: Math.floor(Math.random() * 20) + 30, // 30-50
        quality: Math.floor(Math.random() * 15) + 85, // 85-100
        onTime: Math.floor(Math.random() * 20) + 80  // 80-100
      };

      // Generate availability
      const availability = {
        thisWeek: baseCapacity - Math.floor(Math.random() * 5),
        nextWeek: baseCapacity - Math.floor(Math.random() * 8),
        nextTwoWeeks: baseCapacity - Math.floor(Math.random() * 10)
      };

      // Generate hourly rate based on role and experience
      const getHourlyRate = (role: string, domain: string) => {
        const baseRates: { [key: string]: number } = {
          'admin': 3000,
          'manager': 2500,
          'designer': 2000,
          'developer': 1800
        };
        const domainMultipliers: { [key: string]: number } = {
          'Angular': 1.1,
          'Java': 1.2,
          'Maui': 1.15,
          'Testing': 0.9,
          'Implementation': 1.3,
          'Database': 1.25,
          'Marketing': 0.8,
          'HR': 0.7,
          'System Administration': 1.1
        };
        return Math.round((baseRates[role] || 1800) * (domainMultipliers[domain || ''] || 1));
      };

      // Generate budget based on hourly rate and availability
      const hourlyRate = getHourlyRate(user.role || 'developer', user.domain || '');
      const monthlyBudget = Math.round(hourlyRate * 8 * 22 * (user.availability || 100) / 100);

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        domain: user.domain,
        department: user.department,
        email: user.email,
        avatar: user.avatar,
        status: getStatus(utilization),
        currentSprint: 'Sprint 15',
        utilization,
        capacity: baseCapacity,
        allocated,
        skills: getSkillsByDomain(user.domain || ''),
        projects: getProjectAssignments(),
        performance,
        availability,
        hourlyRate,
        budget: monthlyBudget,
        experience: user.experience || 'mid'
      };
    });
  }, [allUsers]);

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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMembers = filteredMembers.length;
    const avgUtilization = Math.round(filteredMembers.reduce((sum, member) => sum + member.utilization, 0) / totalMembers);
    const availableHours = filteredMembers.reduce((sum, member) => sum + (member.capacity - member.allocated), 0);
    const overloadedCount = filteredMembers.filter(member => member.utilization > 100).length;
    
    return { totalMembers, avgUtilization, availableHours, overloadedCount };
  }, [filteredMembers]);

  // Get unique values for filters
<<<<<<< HEAD
  const departments = [...new Set(teamMembers.map(m => m.department))].filter(Boolean);
  const domains = [...new Set(teamMembers.map(m => m.domain))].filter(Boolean);
  const roles: string[] = [...new Set(teamMembers.map(m => m.role as string))].filter(Boolean) as string[];
=======
  const departments = [...new Set(teamMembers.map(m => m.department))];
  const domains = [...new Set(teamMembers.map(m => m.domain))];
  const roles: string[] = [...new Set(teamMembers.map(m => m.role as string))] as string[];
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3

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
    if (!newMember.name || !newMember.email || !newMember.domain || !newMember.department || !newMember.hourlyRate) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check team constraints
    const currentProject = 'Current Project'; // In real implementation, this would be the selected project
    const validation = getTeamValidation(currentProject);
    
    if (!validation.canAddMember) {
      toast.error(`Cannot add more members. Team is at maximum capacity (${validation.maxMembers} members).`);
      return;
    }

    if (newMember.role === 'manager' && !validation.canAddManager) {
      toast.error('Cannot add another manager. Only one manager is allowed per project.');
      return;
    }

    try {
      // Calculate budget if not provided
      const budget = newMember.budget || (newMember.hourlyRate * 8 * 22 * (newMember.availability || 100) / 100);

      // Mock addUser function - in real implementation, this would call the actual API
      console.log('Adding team member:', {
        name: newMember.name,
        email: newMember.email,
        password: newMember.password || 'password123',
        role: newMember.role,
        domain: newMember.domain,
        department: newMember.department,
        hourlyRate: newMember.hourlyRate,
        budget: budget,
        skills: newMember.skills,
        experience: newMember.experience,
        availability: newMember.availability
      });

      toast.success(`${newMember.name} has been added to the team!`);
      
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
      toast.error('Failed to add team member. Please try again.');
      console.error('Error adding team member:', error);
    }
  };

  // Group projects by name for project allocation tab
  const projectGroups = useMemo(() => {
    const groups: { [key: string]: Array<{ member: TeamMember; allocation: number; role: string }> } = {};
    
    // Define realistic project teams with proper composition
    const projectTeamDefinitions = [
      {
        name: 'FinTech Mobile App',
        teamSize: 6,
        roles: ['Project Manager', 'Frontend Developer', 'Backend Developer', 'Mobile Developer', 'UI/UX Designer', 'QA Engineer'],
        domains: ['Angular', 'Java', 'Maui', 'Testing'],
        hasManager: true
      },
      {
        name: 'E-Commerce Platform',
        teamSize: 8,
        roles: ['Project Manager', 'Frontend Developer', 'Backend Developer', 'Database Developer', 'DevOps Engineer', 'UI/UX Designer', 'QA Engineer', 'Marketing Lead'],
        domains: ['Angular', 'Java', 'Database', 'Implementation', 'Testing', 'Marketing'],
        hasManager: true
      },
      {
        name: 'Banking Dashboard',
        teamSize: 5,
        roles: ['Project Manager', 'Frontend Developer', 'Backend Developer', 'Database Developer', 'Security Specialist'],
        domains: ['Angular', 'Java', 'Database', 'System Administration'],
        hasManager: true
      },
      {
        name: 'Healthcare Portal',
        teamSize: 7,
        roles: ['Project Manager', 'Frontend Developer', 'Backend Developer', 'Database Developer', 'UI/UX Designer', 'QA Engineer', 'Compliance Specialist'],
        domains: ['Angular', 'Java', 'Database', 'Testing', 'HR'],
        hasManager: true
      },
      {
        name: 'Education Management',
        teamSize: 4,
        roles: ['Frontend Developer', 'Backend Developer', 'UI/UX Designer', 'QA Engineer'],
        domains: ['Angular', 'Java', 'Testing'],
        hasManager: false
      },
      {
        name: 'Supply Chain System',
        teamSize: 9,
        roles: ['Project Manager', 'Frontend Developer', 'Backend Developer', 'Database Developer', 'DevOps Engineer', 'UI/UX Designer', 'QA Engineer', 'Business Analyst', 'System Administrator'],
        domains: ['Angular', 'Java', 'Database', 'Implementation', 'Testing', 'System Administration'],
        hasManager: true
      },
      {
        name: 'CRM Solution',
        teamSize: 6,
        roles: ['Project Manager', 'Frontend Developer', 'Backend Developer', 'Database Developer', 'UI/UX Designer', 'QA Engineer'],
        domains: ['Angular', 'Java', 'Database', 'Testing'],
        hasManager: true
      },
      {
        name: 'Analytics Platform',
        teamSize: 5,
        roles: ['Frontend Developer', 'Backend Developer', 'Database Developer', 'Data Scientist', 'QA Engineer'],
        domains: ['Angular', 'Java', 'Database', 'Testing'],
        hasManager: false
      },
      {
        name: 'AI Chat Support',
        teamSize: 3,
        roles: ['Backend Developer', 'AI/ML Engineer', 'UI/UX Designer'],
        domains: ['Java', 'Angular'],
        hasManager: false
      },
      {
        name: 'IoT Dashboard',
        teamSize: 4,
        roles: ['Frontend Developer', 'Backend Developer', 'IoT Engineer', 'UI/UX Designer'],
        domains: ['Angular', 'Java', 'Implementation'],
        hasManager: false
      }
    ];

    // Create realistic team assignments
    projectTeamDefinitions.forEach(project => {
      groups[project.name] = [];
      
      // Add manager if needed
      if (project.hasManager) {
        const managers = filteredMembers.filter(m => m.role === 'manager');
        if (managers.length > 0) {
          const manager = managers[Math.floor(Math.random() * managers.length)];
          groups[project.name].push({
            member: manager,
            allocation: Math.floor(Math.random() * 30) + 50,
            role: 'Project Manager'
          });
        }
      }
      
      // Add other team members
      const remainingSlots = project.teamSize - (project.hasManager ? 1 : 0);
      const availableMembers = filteredMembers.filter(m => 
        m.role !== 'manager' && 
        project.domains.includes(m.domain) &&
        !groups[project.name].some(gm => gm.member.id === m.id)
      );
      
      for (let i = 0; i < Math.min(remainingSlots, availableMembers.length); i++) {
        const member = availableMembers[i];
        const roleIndex = (project.hasManager ? 1 : 0) + i;
        const role = project.roles[roleIndex] || project.roles[project.roles.length - 1];
        
        groups[project.name].push({
          member,
          allocation: Math.floor(Math.random() * 40) + 30,
          role
        });
      }
    });
    
    return groups;
  }, [filteredMembers]);

  // Team validation functions
  const getTeamValidation = (projectName: string) => {
    const team = projectGroups[projectName] || [];
    const teamSize = team.length;
    const managerCount = team.filter(member => member.member.role === 'manager').length;
    const hasManager = managerCount > 0;
    const isAtCapacity = teamSize >= 9;
    const isNearCapacity = teamSize >= 7;
    const canAddManager = managerCount === 0;
    
    return {
      teamSize,
      managerCount,
      hasManager,
      isAtCapacity,
      isNearCapacity,
      canAddManager,
      canAddMember: !isAtCapacity,
      maxMembers: 9,
      maxManagers: 1
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Team Allocation</h1>
          <p className="text-muted-foreground">Manage team capacity and project assignments across all departments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
            <BarChart3 className="w-4 h-4 mr-2" />
            Capacity Report
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Team Members</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, role, or domain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map(domain => (
                    <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role: string) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <RoleIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <CardDescription>{member.domain} • {member.department}</CardDescription>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getStatusColor(member.status)}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {(member.role as string).charAt(0).toUpperCase() + (member.role as string).slice(1)}
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
                        {member.projects.slice(0, 2).map((project, index) => (
                          <div key={index} className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground truncate">{project.name}</span>
                              <span>{project.allocation}%</span>
                            </div>
                            <div className="text-muted-foreground">{project.role}</div>
                          </div>
                        ))}
                        {member.projects.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{member.projects.length - 2} more projects
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Key Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {member.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{member.skills.length - 3}
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
            {Object.entries(projectGroups).map(([projectName, assignments]) => {
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
<<<<<<< HEAD
                    <CardDescription>
                      {getProjectDescription(projectName)}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-sm text-gray-600">{validation.teamSize}/{validation.maxMembers} team members • {avgAllocation}% avg allocation</span>
=======
                    <CardDescription className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span>{validation.teamSize}/{validation.maxMembers} team members • {avgAllocation}% avg allocation</span>
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
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
<<<<<<< HEAD
=======
                      <div className="text-sm text-gray-600">
                        {getProjectDescription(projectName)}
                      </div>
                    </CardDescription>
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
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
                      {typedAssignments.map(({ member, allocation, role }, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                            <div className="flex-1">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{role}</p>
                          <p className="text-xs text-muted-foreground">{member.domain}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {member.experience}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ₹{member.hourlyRate}/hr
                                </span>
                              </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{allocation}%</p>
                        <p className="text-xs text-muted-foreground">allocation</p>
                            <p className="text-xs text-green-600 font-medium">
                              ₹{Math.round(member.budget * allocation / 100).toLocaleString()}
                            </p>
                      </div>
                    </div>
                  ))}
                    </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
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
                          <p className="font-medium">{member.availability.thisWeek}h</p>
                          <Progress value={(member.availability.thisWeek / member.capacity) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Next Week</p>
                        <div className="space-y-1">
                          <p className="font-medium">{member.availability.nextWeek}h</p>
                          <Progress value={(member.availability.nextWeek / member.capacity) * 100} className="h-2" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Week +2</p>
                        <div className="space-y-1">
                          <p className="font-medium">{member.availability.nextTwoWeeks}h</p>
                          <Progress value={(member.availability.nextTwoWeeks / member.capacity) * 100} className="h-2" />
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
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] xl:max-w-[1100px] max-h-[95vh] overflow-y-auto">
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
                      Team Size: {getTeamValidation('Current Project').teamSize}/{getTeamValidation('Current Project').maxMembers}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Managers: {getTeamValidation('Current Project').managerCount}/{getTeamValidation('Current Project').maxManagers}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTeamValidation('Current Project').isAtCapacity ? (
                    <Badge variant="destructive" className="text-xs">
                      Team Full
                    </Badge>
                  ) : getTeamValidation('Current Project').isNearCapacity ? (
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
                        disabled={!getTeamValidation('Current Project').canAddManager}
                        className={!getTeamValidation('Current Project').canAddManager ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        Manager {!getTeamValidation('Current Project').canAddManager && '(Already assigned)'}
                      </SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {!getTeamValidation('Current Project').canAddManager && (
                    <p className="text-xs text-orange-600">
                      ⚠️ Only one manager is allowed per project
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

          <DialogFooter className="pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-500">
                All fields marked with * are required
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddMemberDialogOpen(false);
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
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-10 font-medium"
                  onClick={handleAddMember}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamAllocationPage;