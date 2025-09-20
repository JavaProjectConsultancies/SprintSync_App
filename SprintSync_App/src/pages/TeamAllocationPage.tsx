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
import { useAuth } from '../contexts/AuthContext';
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
  Coffee
} from 'lucide-react';

const TeamAllocationPage: React.FC = () => {
  const { getAllUsers } = useAuth();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Get all users from AuthContext and generate realistic team allocation data
  const allUsers = getAllUsers();
  
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
      const getProjectAssignments = () => {
        const projectNames = [
          'FinTech Mobile App', 'E-Commerce Platform', 'Banking Dashboard',
          'Healthcare Portal', 'Education Management', 'Supply Chain System',
          'CRM Solution', 'Analytics Platform', 'AI Chat Support', 'IoT Dashboard'
        ];
        
        const assignments = [];
        const numProjects = Math.min(user.assignedProjects?.length || 1, 3);
        
        for (let i = 0; i < numProjects; i++) {
          const allocation = i === 0 ? Math.floor(Math.random() * 40) + 50 : Math.floor(Math.random() * 30) + 20;
          assignments.push({
            name: projectNames[i % projectNames.length],
            allocation,
            role: getRoleInProject(user.role, user.domain)
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
        
        return devRoles[domain] || 'Full Stack Developer';
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
        skills: getSkillsByDomain(user.domain),
        projects: getProjectAssignments(),
        performance,
        availability
      };
    });
  }, [allUsers]);

  // Filter team members based on search and filters
  const filteredMembers = useMemo(() => {
    return teamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesDomain = domainFilter === 'all' || member.domain === domainFilter;
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      
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
  const departments = [...new Set(teamMembers.map(m => m.department))];
  const domains = [...new Set(teamMembers.map(m => m.domain))];
  const roles = [...new Set(teamMembers.map(m => m.role))];

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

  // Group projects by name for project allocation tab
  const projectGroups = useMemo(() => {
    const groups: { [key: string]: Array<{ member: any; allocation: number; role: string }> } = {};
    
    filteredMembers.forEach(member => {
      member.projects.forEach(project => {
        if (!groups[project.name]) {
          groups[project.name] = [];
        }
        groups[project.name].push({
          member,
          allocation: project.allocation,
          role: project.role
        });
      });
    });
    
    return groups;
  }, [filteredMembers]);

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
          <Button className="bg-gradient-primary border-0 text-white hover:opacity-90">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Team Member
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
                  {roles.map(role => (
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
              const RoleIcon = getRoleIcon(member.role, member.domain);
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
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
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
            {Object.entries(projectGroups).slice(0, 6).map(([projectName, assignments]) => (
              <Card key={projectName}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    <span>{projectName}</span>
                  </CardTitle>
                  <CardDescription>
                    {assignments.length} team members • 
                    {Math.round(assignments.reduce((sum, a) => sum + a.allocation, 0) / assignments.length)}% avg allocation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assignments.map(({ member, allocation, role }, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-green-100 to-cyan-100">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{role}</p>
                          <p className="text-xs text-muted-foreground">{member.domain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{allocation}%</p>
                        <p className="text-xs text-muted-foreground">allocation</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
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
                          {member.role}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamAllocationPage;