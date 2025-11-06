import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useUsers, useDepartments, useDomains } from '../hooks/api';
import { useProjects } from '../hooks/api/useProjects';
import { useActiveUsers } from '../hooks/api/useUsers';
import { teamMemberApi } from '../services/api/entities/teamMemberApi';
import { userApiService } from '../services/api/entities/userApi';
import { projectApiService } from '../services/api/entities/projectApi';
import { useTeamMembers as useProjectTeamMembers } from '../hooks/api/useTeamMembers';
import { toast } from 'sonner';
import { calculateHourlyRateFromCTC } from '../utils/salaryCalculator';
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
    Award,
    Loader2,
    GripVertical
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
  ctc?: number;
  experience: string;
}

const ItemTypes = {
  TEAM_MEMBER: 'team_member',
};

const TeamAllocationPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [isAddingMember, setIsAddingMember] = useState<boolean>(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'developer' as 'developer' | 'designer' | 'manager' | 'admin',
    domain: '',
    department: '',
    password: '',
    hourlyRate: '',
    skills: [] as string[],
    ctc: '',
    experience: 'mid' as 'junior' | 'mid' | 'senior' | 'lead' | 'E1' | 'E2' | 'M1' | 'M2' | 'M3' | 'L1' | 'L2' | 'L3' | 'S1',
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

  const clearAllFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setDomainFilter('all');
    setRoleFilter('all');
  };

  // Get all users from API and generate realistic team allocation data
  const { data: users, loading: usersListLoading, refetch: refetchUsersList } = useUsers({ page: 0, size: 1000 });
  const allUsers = users || [];
  const { data: projects, loading: projectsLoading } = useProjects();
  const { data: activeUsers, loading: usersLoading, error: usersError, refetch: refetchActiveUsers } = useActiveUsers({ page: 0, size: 1000 });
  const { data: departmentsData } = useDepartments();
  const { data: domainsData } = useDomains();

  const { teamMembers: projectTeamMembers, refreshTeamMembers } = useProjectTeamMembers(selectedProjectId || undefined);

  const roleOptions = ['developer', 'designer', 'manager', 'admin'];

  // Project helpers: team members per project and manager names cache
  const [projectIdToMembers, setProjectIdToMembers] = useState<Record<string, any[]>>({});
  const [managerIdToName, setManagerIdToName] = useState<Record<string, string>>({});
  const [projectRefreshing, setProjectRefreshing] = useState<Record<string, boolean>>({});
  const [removingMember, setRemovingMember] = useState<Record<string, boolean>>({});
  const [membersLoading, setMembersLoading] = useState<boolean>(false);

  const refreshMembersForProject = useMemo(() => {
    return async (projectId: string) => {
      try {
        setProjectRefreshing(prev => ({ ...prev, [projectId]: true }));
        const list = await teamMemberApi.getTeamMembersByProject(projectId);
        setProjectIdToMembers(prev => ({ ...prev, [projectId]: list || [] }));
      } catch {
        // ignore
      } finally {
        setProjectRefreshing(prev => ({ ...prev, [projectId]: false }));
      }
    };
  }, []);

  const handleRemoveMember = useMemo(() => {
    return async (projectId: string, userId: string) => {
      const key = `${projectId}_${userId}`;
      try {
        setRemovingMember(prev => ({ ...prev, [key]: true }));
        await teamMemberApi.removeTeamMemberFromProject(projectId, userId);
        toast.success('Team member removed');
        await refreshMembersForProject(projectId);
        // After removal, project manager may have been reassigned in backend.
        // Refresh manager display by fetching updated project and manager name.
        try {
          const projResp = await projectApiService.getProjectById(projectId);
          const newManagerId = (projResp && (projResp as any).data && (projResp as any).data.managerId) || undefined;
          if (newManagerId) {
            try {
              const mgrResp = await userApiService.getUserById(newManagerId);
              const mgrName = (mgrResp && (mgrResp as any).data && (mgrResp as any).data.name) || newManagerId;
              setManagerIdToName(prev => ({ ...prev, [newManagerId]: mgrName }));
            } catch {
              // ignore errors; UI will fallback
            }
          }
        } catch {
          // ignore
        }
      } catch (e) {
        toast.error('Failed to remove team member');
      } finally {
        setRemovingMember(prev => ({ ...prev, [key]: false }));
      }
    };
  }, [refreshMembersForProject]);

  useEffect(() => {
    const loadPerProjectInfo = async () => {
      try {
        setMembersLoading(true);
        if (!projects || projects.length === 0) return;
        // Fetch team members per project
        const memberPromises = projects.map(async (p: any) => {
          try {
            const list = await teamMemberApi.getTeamMembersByProject(p.id);
            return { projectId: p.id, members: list || [] };
          } catch {
            return { projectId: p.id, members: [] };
          }
        });
        const membersResults = await Promise.all(memberPromises);
        const mapMembers: Record<string, any[]> = {};
        membersResults.forEach(r => { mapMembers[r.projectId] = r.members; });
        setProjectIdToMembers(mapMembers);

        // Fetch manager names
        const uniqueManagerIds = Array.from(new Set(projects.map((p: any) => p.managerId).filter(Boolean)));
        const managerPromises = uniqueManagerIds.map(async (id: string) => {
          try {
            const resp = await userApiService.getUserById(id);
            return { id, name: resp.data?.name || id };
          } catch {
            return { id, name: id };
          }
        });
        const managerResults = await Promise.all(managerPromises);
        const mapManagers: Record<string, string> = {};
        managerResults.forEach(r => { mapManagers[r.id] = r.name; });
        setManagerIdToName(mapManagers);
      } catch (e) {
        // silent fail
      } finally {
        setMembersLoading(false);
      }
    };
    loadPerProjectInfo();
  }, [projects]);

  // Map projectId -> projectName for quick lookup
  const projectIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    (projects || []).forEach((p: any) => { map[p.id] = p.name; });
    return map;
  }, [projects]);

  // Build memberId -> projects[] mapping from fetched per-project members
  const memberIdToProjects = useMemo(() => {
    const result: Record<string, Array<{ name: string; role?: string; availability?: number }>> = {};
    Object.entries(projectIdToMembers).forEach(([pid, members]) => {
      const pname = projectIdToName[pid] || 'Project';
      ((members as any[]) || []).forEach((m: any) => {
        const uid = m.userId || m.id;
        if (!uid) return;
        if (!result[uid]) result[uid] = [];
        result[uid].push({ name: pname, role: m.role, availability: m.availability });
      });
    });
    return result;
  }, [projectIdToMembers, projectIdToName]);

  const findProjectIdByName = (name: string) => {
    return projects?.find(p => p.name === name)?.id || null;
  };

  useEffect(() => {
    if (isAddMemberDialogOpen) {
      if (!selectedProjectId && projects && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
      // load users for picker from active users and exclude already assigned to selected project
      setLoadingUsers(true);
      const rawList = (activeUsers || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: (u.role || 'developer').toLowerCase(),
        departmentId: u.departmentId,
        domainId: u.domainId,
        avatarUrl: u.avatarUrl,
        experience: (u.experience || 'mid').toLowerCase(),
        hourlyRate: u.hourlyRate || 0,
        availabilityPercentage: u.availabilityPercentage || 100,
        skills: typeof u.skills === 'string' ? u.skills : Array.isArray(u.skills) ? u.skills.join(', ') : '',
        isActive: u.isActive,
      }));
      const assignedIds = new Set((projectTeamMembers || []).map((m: any) => m.userId));
      const filtered = rawList.filter(u => !assignedIds.has(u.id));
      setAvailableUsers(filtered);
      setLoadingUsers(false);
      if (!selectedUserId && filtered.length > 0) {
        setSelectedUserId(filtered[0].id);
      }
    }
  }, [isAddMemberDialogOpen, projects, activeUsers, projectTeamMembers, selectedProjectId]);

  const departmentIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    const list = Array.isArray(departmentsData) ? departmentsData as any[] : [];
    list.forEach((d: any) => { if (d?.id) map[d.id] = d.name; });
    return map;
  }, [departmentsData]);

  const domainIdToName = useMemo(() => {
    const map: Record<string, string> = {};
    const list = Array.isArray(domainsData) ? domainsData as any[] : [];
    list.forEach((d: any) => { if (d?.id) map[d.id] = d.name; });
    return map;
  }, [domainsData]);

  const handleUserSelection = useCallback(async (userId: string) => {
    const user = availableUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Fetch full user details from API to ensure we have all data including domain/department names
    let fullUserData = user;
    try {
      const userResponse = await userApiService.getUserById(userId);
      if (userResponse && userResponse.data) {
        fullUserData = userResponse.data;
      }
    } catch (error) {
      console.warn('Failed to fetch full user details, using available data:', error);
    }
    
    // Map domainId and departmentId to their actual names
    // First try to get from the mapping, if not found, try to get from the API data directly
    let domainName = '';
    let departmentName = '';
    
    // Try to get domain name from the fetched user data first
    if (fullUserData.domainId) {
      // Try mapping first
      domainName = domainIdToName[fullUserData.domainId] || '';
      
      // If mapping didn't work, try to find it directly from domainsData
      if (!domainName && domainsData && Array.isArray(domainsData)) {
        const domain = domainsData.find((d: any) => d.id === fullUserData.domainId);
        domainName = domain?.name || '';
      }
      
      // If still not found, try to get it from the user object directly (if it has domain name)
      if (!domainName && (fullUserData as any).domain) {
        domainName = (fullUserData as any).domain;
      }
    }
    
    // Try to get department name from the fetched user data first
    if (fullUserData.departmentId) {
      // Try mapping first
      departmentName = departmentIdToName[fullUserData.departmentId] || '';
      
      // If mapping didn't work, try to find it directly from departmentsData
      if (!departmentName && departmentsData && Array.isArray(departmentsData)) {
        const department = departmentsData.find((d: any) => d.id === fullUserData.departmentId);
        departmentName = department?.name || '';
      }
      
      // If still not found, try to get it from the user object directly (if it has department name)
      if (!departmentName && (fullUserData as any).department) {
        departmentName = (fullUserData as any).department;
      }
    }
    
    const hourlyRateValue = fullUserData.hourlyRate || user.hourlyRate || 0;
    setNewMember({
      name: fullUserData.name || user.name,
      email: fullUserData.email || user.email,
      role: fullUserData.role || user.role,
      domain: domainName,
      department: departmentName,
      password: 'password123',
      hourlyRate: hourlyRateValue.toString(),
      skills: fullUserData.skills ? (typeof fullUserData.skills === 'string' ? fullUserData.skills.split(',').map((s: string)=>s.trim()) : fullUserData.skills) : (user.skills ? (typeof user.skills === 'string' ? user.skills.split(',').map((s: string)=>s.trim()) : user.skills) : []),
      ctc: fullUserData.ctc ? fullUserData.ctc.toString() : '',
      experience: (fullUserData.experience || user.experience || 'mid'),
      availability: fullUserData.availabilityPercentage || user.availabilityPercentage || 100,
    });
    setAutoPopulated({
      email: true,
      role: true,
      domain: domainName ? true : false,
      department: departmentName ? true : false,
      hourlyRate: true,
      skills: true,
      experience: true,
    });
  }, [availableUsers, domainIdToName, departmentIdToName, domainsData, departmentsData]);

  // Auto-populate when selectedUserId is set (either automatically or manually)
  useEffect(() => {
    if (selectedUserId && availableUsers.length > 0 && isAddMemberDialogOpen) {
      handleUserSelection(selectedUserId);
    }
  }, [selectedUserId, availableUsers, isAddMemberDialogOpen, handleUserSelection]);

  const getTeamValidation = () => {
    const list = projectTeamMembers || [];
    const teamSize = list.length;
    const maxTeamSize = 9;
    return {
      isAtCapacity: teamSize >= maxTeamSize,
      isNearCapacity: teamSize >= maxTeamSize - 2,
      canAddMember: teamSize < maxTeamSize,
      hasManager: false,
      canAddManager: true,
      managerCount: 0,
      maxManagers: 0,
      teamSize,
      maxMembers: maxTeamSize,
      managerName: null,
    };
  };
  
  const normalizeRole = (role: string): string => {
    const r = (role || '').toUpperCase();
    switch (r) {
      case 'ADMIN': return 'admin';
      case 'MANAGER': return 'manager';
      case 'DEVELOPER': return 'developer';
      case 'DESIGNER': return 'designer';
      case 'TESTER': return 'tester';
      case 'ANALYST': return 'analyst';
      default: return (role || 'developer').toString().toLowerCase();
    }
  };

  // Enhanced team member data based on real user data from AuthContext
  const teamMembers = useMemo(() => {
    return allUsers.map((user, index) => {
      // Resolve role and names
      const normalizedRole = normalizeRole((user as any).role as string);
      const resolvedDomain = (user as any).domainId ? (domainIdToName[(user as any).domainId as string] || '') : ((user as any).domain || '');
      const resolvedDepartment = (user as any).departmentId ? (departmentIdToName[(user as any).departmentId as string] || '') : ((user as any).department || '');

      // Generate realistic data based on resolved values
      const baseCapacity = normalizedRole === 'admin' ? 35 : normalizedRole === 'manager' ? 35 : normalizedRole === 'designer' ? 35 : 40;
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
        const numProjects = normalizedRole === 'manager' ? 1 : Math.floor(Math.random() * 2) + 1;
        const availableProjects = projectDistribution.filter(p => 
          normalizedRole === 'manager' ? !p.hasManager : true
        );
        
        for (let i = 0; i < Math.min(numProjects, availableProjects.length); i++) {
          const project = availableProjects[i];
          const allocation = normalizedRole === 'manager' ? 
            Math.floor(Math.random() * 30) + 50 : // Managers get 50-80% allocation
            Math.floor(Math.random() * 40) + 30;  // Others get 30-70% allocation
          
          assignments.push({
            name: project.name,
            allocation,
            role: getRoleInProject(normalizedRole || 'developer', resolvedDomain || '')
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
      const hourlyRate = getHourlyRate(normalizedRole || 'developer', resolvedDomain || '');
      const monthlyBudget = Math.round(hourlyRate * 8 * 22 * (((user as any).availability || (user as any).availabilityPercentage || 100) as number) / 100);

      return {
        id: user.id,
        name: user.name,
        role: normalizedRole,
        domain: resolvedDomain,
        department: resolvedDepartment,
        email: user.email,
        avatar: (user as any).avatarUrl,
        status: getStatus(utilization),
        currentSprint: 'Sprint 15',
        utilization,
        capacity: baseCapacity,
        allocated,
        skills: getSkillsByDomain(resolvedDomain || ''),
        projects: getProjectAssignments(),
        performance,
        availability,
        hourlyRate,
        budget: monthlyBudget,
        experience: (user as any).experience || 'mid'
      };
    });
  }, [allUsers, departmentIdToName, domainIdToName]);

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
    const totalUtilization = filteredMembers.reduce((sum, member) => sum + member.utilization, 0);
    const avgUtilization = totalMembers > 0 ? Math.round(totalUtilization / totalMembers) : 0;
    const availableHours = filteredMembers.reduce((sum, member) => sum + (member.capacity - member.allocated), 0);
    const overloadedCount = filteredMembers.filter(member => member.utilization > 100).length;
    
    return { totalMembers, avgUtilization, availableHours, overloadedCount };
  }, [filteredMembers]);

  // Get unique values for filters (prefer API, fallback to team data)
  const departments = useMemo(() => {
    const apiNames = Array.isArray(departmentsData) ? (departmentsData as any[]).map((d: any) => d.name).filter(Boolean) : [];
    return apiNames.length > 0 ? apiNames : [...new Set(teamMembers.map(m => m.department))].filter(Boolean);
  }, [departmentsData, teamMembers]);
  const domains = useMemo(() => {
    const apiNames = Array.isArray(domainsData) ? (domainsData as any[]).map((d: any) => d.name).filter(Boolean) : [];
    return apiNames.length > 0 ? apiNames : [...new Set(teamMembers.map(m => m.domain))].filter(Boolean);
  }, [domainsData, teamMembers]);
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

  // Page-level loading indicator
  const isPageLoading = projectsLoading || usersListLoading || usersLoading;

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
    let experience: 'E1' | 'E2' | 'M1' | 'M2' | 'M3' | 'L1' | 'L2' | 'L3' | 'S1' = 'E1';
    let hourlyRate = 1800;
    let skills: string[] = [];

    // Role detection based on name patterns
    if (nameLower.includes('manager') || nameLower.includes('lead') || nameLower.includes('head')) {
      role = 'manager';
      experience = 'M3';
      hourlyRate = 2500;
      skills = ['Project Management', 'Leadership', 'Strategy', 'Team Management'];
    } else if (nameLower.includes('admin') || nameLower.includes('director') || nameLower.includes('ceo')) {
      role = 'admin';
      experience = 'L2';
      hourlyRate = 3000;
      skills = ['Administration', 'Strategic Planning', 'Leadership', 'System Management'];
    } else if (nameLower.includes('design') || nameLower.includes('ui') || nameLower.includes('ux')) {
      role = 'designer';
      experience = 'E1';
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
      experience = 'M3';
      hourlyRate = Math.round(hourlyRate * 1.3);
    } else if (nameLower.includes('junior') || nameLower.includes('jr') || nameLower.includes('entry')) {
      experience = 'E1';
      hourlyRate = Math.round(hourlyRate * 0.7);
    } else if (nameLower.includes('architect') || nameLower.includes('principal') || nameLower.includes('expert')) {
      experience = 'L2';
      hourlyRate = Math.round(hourlyRate * 1.5);
    }

    // Update the form with auto-populated data
    // Note: CTC should be calculated from hourly rate if needed, but for now we'll keep it empty
    // as the user will enter CTC and it will auto-calculate hourly rate
    setNewMember(prev => ({
      ...prev,
      email: email,
      role: role,
      domain: domain,
      department: department,
      hourlyRate: hourlyRate.toString(),
      skills: skills,
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

  const isFormValid = useMemo(() => {
    return (
      newMember.name.trim() !== '' &&
      newMember.email.trim() !== '' &&
      selectedUserId !== '' &&
      newMember.role !== '' &&
      newMember.domain !== '' &&
      newMember.department !== '' &&
      newMember.hourlyRate !== '' &&
      parseFloat(newMember.hourlyRate) > 0 &&
      newMember.ctc !== '' &&
      parseFloat(newMember.ctc) > 0 &&
      newMember.experience !== ''
    );
  }, [newMember, selectedUserId]);

  const handleAddMember = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }
    if (!selectedUserId) {
      toast.error('Please select a user from the dropdown first.');
      return;
    }
    // Prevent duplicate assignment client-side
    const alreadyAssigned = (projectTeamMembers || []).some((m: any) => m.userId === selectedUserId);
    if (alreadyAssigned) {
      toast.error('This user is already assigned to the selected project.');
      return;
    }
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    const validation = getTeamValidation();
    if (!validation.canAddMember) {
      toast.error(`Cannot add more members. Team is at maximum capacity (${validation.maxMembers} members).`);
      return;
    }
    if (newMember.role === 'manager' && !validation.canAddManager) {
      toast.error('Cannot add another manager. Only one manager is allowed per project.');
      return;
    }

    try {
      setIsAddingMember(true);
      await teamMemberApi.createTeamMember({
        projectId: selectedProjectId,
        userId: selectedUserId,
        role: newMember.role,
        isTeamLead: false,
        allocationPercentage: 100,
      });
      toast.success(`${newMember.name} has been added to the team!`);
      await refreshTeamMembers();
      // refresh the members shown on the project card
      await refreshMembersForProject(selectedProjectId);
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
        availability: 100,
      });
      setAutoPopulated({
        email: false,
        role: false,
        domain: false,
        department: false,
        hourlyRate: false,
        skills: false,
        experience: false,
      });
      setIsAddMemberDialogOpen(false);
    } catch (error: any) {
      const msg: string = error?.message || '';
      const duplicate = msg.includes('project_team_members_project_id_user_id_key') ||
                       error?.details?.message?.includes('project_team_members_project_id_user_id_key');
      if (duplicate) {
        toast.error('This user is already assigned to the selected project.');
      } else {
        toast.error('Failed to add team member. Please try again.');
      }
      console.error('Error adding team member:', error);
    } finally {
      setIsAddingMember(false);
    }
  };

  // Drag and drop handler for moving team members between projects
  const handleDrop = useCallback(async (droppedMember: any, targetProjectId: string) => {
    // Find source project ID
    const sourceProjectId = droppedMember.sourceProjectId || Object.keys(projectIdToMembers).find(pid => 
      (projectIdToMembers[pid] || []).some((m: any) => (m.userId || m.id) === (droppedMember.userId || droppedMember.id))
    );
    
    if (sourceProjectId === targetProjectId) {
      toast.info('User is already assigned to this project');
      return;
    }

    if (!sourceProjectId) {
      toast.error('Could not determine source project');
      return;
    }

    const userId = droppedMember.userId || droppedMember.id;
    const role = droppedMember.role || 'developer';

    try {
      // First, add member to target project
      await teamMemberApi.createTeamMember({
        projectId: targetProjectId,
        userId: userId,
        role: role,
        isTeamLead: false,
        allocationPercentage: 100,
      });
      
      // Then, remove from source project
      const key = `${sourceProjectId}_${userId}`;
      setRemovingMember(prev => ({ ...prev, [key]: true }));
      await teamMemberApi.removeTeamMemberFromProject(sourceProjectId, userId);
      setRemovingMember(prev => ({ ...prev, [key]: false }));
      
      toast.success(`${droppedMember.name} transferred to ${projectIdToName[targetProjectId]}`);
      
      // Refresh both project members
      await refreshMembersForProject(targetProjectId);
      await refreshMembersForProject(sourceProjectId);
    } catch (error: any) {
      const msg: string = error?.message || '';
      const duplicate = msg.includes('project_team_members_project_id_user_id_key');
      if (duplicate) {
        toast.error('This user is already assigned to the target project.');
      } else {
        toast.error('Failed to transfer team member. Please try again.');
      }
      console.error('Error transferring team member:', error);
    }
  }, [projectIdToMembers, projectIdToName, refreshMembersForProject, setRemovingMember]);

  // Draggable Team Member Component
  const DraggableTeamMember: React.FC<{ member: any; projectId: string }> = ({ member, projectId }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: ItemTypes.TEAM_MEMBER,
      item: { 
        userId: member.userId || member.id, 
        name: member.name, 
        role: member.role,
        sourceProjectId: projectId
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    const userId = member.userId || member.id;
    const rmKey = `${projectId}_${userId}`;
    const isRemoving = !!removingMember[rmKey];

    return (
      <div
        ref={drag}
        className={`transition-all cursor-move ${
          isDragging ? 'opacity-50 rotate-1 scale-105' : 'hover:scale-[1.01]'
        }`}
      >
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <Avatar className="h-6 w-6">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className="text-[10px] bg-gradient-to-br from-green-100 to-cyan-100">
                {String(member.name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <div className="text-xs font-medium truncate">{member.name}</div>
              {member.role && (
                <div className="text-[10px] text-muted-foreground truncate">{member.role}</div>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
            disabled={isRemoving || projectRefreshing[projectId]}
            onClick={() => handleRemoveMember(projectId, userId)}
          >
            {isRemoving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              'Remove'
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Drop Zone Component for Projects
  const ProjectDropZone: React.FC<{ 
    projectId: string; 
    children: React.ReactNode; 
  }> = ({ projectId, children }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ItemTypes.TEAM_MEMBER,
      drop: (item: any) => {
        handleDrop(item, projectId);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop}
        className={`transition-all ${isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
      >
        {children}
      </div>
    );
  };

  // Project Allocation now uses real projects from API

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Team Allocation</h1>
          <p className="text-muted-foreground">Manage team capacity and project assignments across all departments</p>
        </div>
        {/* Capacity Report button hidden per request */}
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
              <div className="flex items-center gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap text-red-600 border-red-300 hover:bg-red-50"
                  onClick={clearAllFilters}
                >
                  Clear
                </Button>
              </div>
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
          <TabsTrigger value="capacity">Capacity Utilisation</TabsTrigger>
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

                    {/* Current Projects (from DB) */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Current Projects</p>
                      <div className="space-y-1">
                        {membersLoading && (
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Loading assigned projects...
                          </div>
                        )}
                        {(memberIdToProjects[member.id] || []).slice(0, 2).map((proj, index) => (
                          <div key={index} className="text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground truncate">{proj.name}</span>
                              {proj.availability !== undefined && (
                                <span>{proj.availability}%</span>
                              )}
                            </div>
                            {proj.role && (
                              <div className="text-muted-foreground">{proj.role}</div>
                            )}
                          </div>
                        ))}
                        {(memberIdToProjects[member.id] || []).length === 0 && (
                          <div className="text-xs text-muted-foreground">No current projects</div>
                        )}
                        {(memberIdToProjects[member.id] || []).length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{(memberIdToProjects[member.id] || []).length - 2} more projects
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
                            ₹{member.hourlyRate}
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
            {(projects || []).map((p) => (
              <ProjectDropZone key={p.id} projectId={p.id}>
                <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-semibold">{p.name}</span>
                      {p.status && (
                        <Badge variant="outline" className="text-xs capitalize">{String(p.status).toLowerCase()}</Badge>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-primary border-0 text-white hover:opacity-90"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setIsAddMemberDialogOpen(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add Member
                    </Button>
                  </div>
                  {p.description && (
                    <CardDescription>
                      {p.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{(p as any).progressPercentage ?? (p as any).progress ?? 0}%</span>
                    </div>
                    <Progress value={(((p as any).progressPercentage ?? (p as any).progress ?? 0) as number)} className="h-2" />
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <p className="font-medium capitalize">{String(p.priority || 'medium').toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <div className="flex items-center space-x-1 font-medium">
                        <IndianRupee className="w-4 h-4 text-green-600" />
                        <span>{(Number(p.budget) || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Methodology</p>
                      <p className="font-medium">{p.methodology || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Manager</p>
                      <p className="font-medium">{(p.managerId && managerIdToName[p.managerId]) || '—'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dates</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <p className="font-medium truncate">
                          {p.startDate ? String(p.startDate).slice(0, 10) : '—'}
                          {' '}–{' '}
                          {p.endDate ? String(p.endDate).slice(0, 10) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Members Preview */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Team Members</span>
                      <span className="font-medium flex items-center gap-2">
                        {(projectRefreshing[p.id]) && (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                        {(projectIdToMembers[p.id] || []).length}
                      </span>
                    </div>
                    <div className="flex -space-x-2 overflow-hidden">
                      {(projectIdToMembers[p.id] || []).slice(0, 5).map((m: any) => (
                        <Avatar key={m.id} className="h-7 w-7 ring-2 ring-white">
                          <AvatarImage src={m.avatar} alt={m.name} />
                          <AvatarFallback className="text-[10px] bg-gradient-to-br from-green-100 to-cyan-100">
                            {String(m.name || '').split(' ').map((n: string) => n[0]).join('').slice(0,2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {((projectIdToMembers[p.id] || []).length > 5) && (
                        <div className="h-7 w-7 rounded-full bg-gray-100 text-gray-600 text-[10px] flex items-center justify-center ring-2 ring-white">
                          +{(projectIdToMembers[p.id] || []).length - 5}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manage Members (Remove) */}
                  <div className="space-y-2">
                    {(projectIdToMembers[p.id] || []).length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {(projectIdToMembers[p.id] || []).map((m: any) => (
                          <DraggableTeamMember key={`${p.id}_${m.userId || m.id}`} member={m} projectId={p.id} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-3">No team members assigned</div>
                    )}
                  </div>
                </CardContent>
              </Card>
              </ProjectDropZone>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Capacity Utilisation - Next 2 Weeks</CardTitle>
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
                        <p className="text-sm font-medium text-muted-foreground mb-2">CTC & Rate</p>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">CTC:</span>
                            <span className="text-sm font-medium text-green-600">₹{member.ctc || member.hourlyRate || 'N/A'}</span>
                  </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Hourly Rate:</span>
                            <span className="text-sm font-medium text-green-600">₹{member.hourlyRate || 'N/A'}</span>
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
      <Dialog open={isAddMemberDialogOpen} onOpenChange={(open) => {
        setIsAddMemberDialogOpen(open);
        if (!open) {
          // Reset form state when dialog closes
          setSelectedUserId('');
          setNewMember({
            name: '',
            email: '',
            role: 'developer',
            domain: '',
            department: '',
            password: '',
            hourlyRate: '',
            skills: [],
            ctc: '',
            experience: 'mid',
            availability: 100,
          });
          setAutoPopulated({
            email: false,
            role: false,
            domain: false,
            department: false,
            hourlyRate: false,
            skills: false,
            experience: false,
          });
        }
      }}>
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
              Create a new team member profile with comprehensive information including skills, CTC, hourly rate, and availability.
            </DialogDescription>
            
            {/* Team Status Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Team Size: {getTeamValidation().teamSize}/{getTeamValidation().maxMembers}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Managers: {getTeamValidation().managerCount}/{getTeamValidation().maxManagers}
                      {getTeamValidation().managerName && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({getTeamValidation().managerName})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedProjectId && projectRefreshing[selectedProjectId] && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  )}
                  {getTeamValidation().isAtCapacity ? (
                    <Badge variant="destructive" className="text-xs">
                      Team Full
                    </Badge>
                  ) : getTeamValidation().isNearCapacity ? (
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
                <Label htmlFor="user-picker" className="text-sm font-medium flex items-center gap-2">
                  Team Member *
                  {loadingUsers && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                </Label>
                <Select 
                  value={selectedUserId} 
                  onValueChange={(value) => {
                    setSelectedUserId(value);
                    // handleUserSelection will be called by the useEffect
                  }}
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
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  
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
                      {domainsData?.map((domain: any) => (
                        <SelectItem key={domain.id} value={domain.name}>{domain.name}</SelectItem>
                      ))}
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
                      {departmentsData?.map((department: any) => (
                        <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* CTC & Hourly Rate & Experience Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                <div className="flex items-center justify-center w-8 h-8 bg-green-50 rounded-md">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">CTC, Hourly Rate & Experience</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ctc" className="text-sm font-medium">
                    CTC (₹) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="ctc"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 500000.00"
                      value={newMember.ctc}
                      onChange={(e) => {
                        const ctcValue = e.target.value;
                        const updatedMember = { ...newMember, ctc: ctcValue };
                        
                        // Auto-calculate hourly rate when CTC or experience changes
                        if (ctcValue && parseFloat(ctcValue) > 0 && newMember.experience) {
                          try {
                            const calculatedHourlyRate = calculateHourlyRateFromCTC(parseFloat(ctcValue), newMember.experience);
                            updatedMember.hourlyRate = calculatedHourlyRate.toFixed(2);
                          } catch (error) {
                            console.error('Error calculating hourly rate:', error);
                          }
                        }
                        setNewMember(updatedMember);
                      }}
                      className="h-10 pl-8"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CTC (Cost to Company) in INR (auto-calculates hourly rate)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate" className="text-sm font-medium">
                    Hourly Rate (₹) * {autoPopulated.hourlyRate && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 1000.00"
                      value={newMember.hourlyRate}
                      readOnly={autoPopulated.hourlyRate}
                      onChange={(e) => {
                        setNewMember({ ...newMember, hourlyRate: e.target.value });
                        setAutoPopulated(prev => ({ ...prev, hourlyRate: false }));
                      }}
                      className={`h-10 pl-8 ${autoPopulated.hourlyRate ? 'bg-green-50 border-green-200' : ''}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hourly rate in INR (auto-calculated from CTC and experience, or enter manually)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">
                    Experience * {autoPopulated.experience && <span className="text-green-600 text-xs">(Auto-filled)</span>}
                  </Label>
                  <Select 
                    value={newMember.experience} 
                    onValueChange={(value: any) => {
                      const updatedMember = { ...newMember, experience: value };
                      
                      // Auto-calculate hourly rate when experience changes
                      if (newMember.ctc && parseFloat(newMember.ctc) > 0 && value) {
                        try {
                          const calculatedHourlyRate = calculateHourlyRateFromCTC(parseFloat(newMember.ctc), value);
                          updatedMember.hourlyRate = calculatedHourlyRate.toFixed(2);
                        } catch (error) {
                          console.error('Error calculating hourly rate:', error);
                        }
                      }
                      setNewMember(updatedMember);
                      setAutoPopulated(prev => ({ ...prev, experience: false }));
                    }}
                  >
                    <SelectTrigger id="experience" className={`h-10 ${autoPopulated.experience ? 'bg-green-50 border-green-200' : ''}`}>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="E1">E1 - 0-1yr</SelectItem>
                      <SelectItem value="E2">E2 - 1-3yrs</SelectItem>
                      <SelectItem value="M1">M1 - 3-7yrs</SelectItem>
                      <SelectItem value="M2">M2 - 5-8yrs</SelectItem>
                      <SelectItem value="M3">M3 - 7-10yrs</SelectItem>
                      <SelectItem value="L1">L1 - 10-15yrs</SelectItem>
                      <SelectItem value="L2">L2 - 12-18yrs</SelectItem>
                      <SelectItem value="L3">L3 - 15&above</SelectItem>
                      <SelectItem value="S1">S1 - 20yrs &above</SelectItem>
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
                      hourlyRate: '',
                      skills: [],
                      ctc: '',
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
                    if (isFormValid && !isAddingMember) {
                      handleAddMember();
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
    </DndProvider>
  );
};

export default TeamAllocationPage;