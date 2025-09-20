import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  X, 
  Star, 
  Clock,
  IndianRupee,
  Filter,
  UserCheck,
  TrendingUp,
  Target,
  Award,
  Eye,
  Settings,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface TeamMember {
  id: string;
  name: string;
  role: 'manager' | 'developer' | 'designer' | 'analyst' | 'tester' | 'devops';
  skills: string[];
  availability: number; // percentage
  department: string;
  experience: 'junior' | 'mid' | 'senior' | 'lead';
  hourlyRate: number;
  avatar?: string;
  isTeamLead?: boolean;
  performance?: {
    velocity: number;
    taskCompletion: number;
    codeQuality: number;
    rating: 'excellent' | 'good' | 'average' | 'needs_attention';
  };
  workload?: number; // current workload percentage
  projects?: number; // current project count
}

interface TeamManagerProps {
  selectedMembers?: TeamMember[];
  onMembersChange?: (members: TeamMember[]) => void;
  projectBudget?: number;
  projectDuration?: number; // in days
  projectId?: string;
  onTeamChange?: (members: TeamMember[]) => void;
}

// Pool of available team members - Updated with diverse roles ensuring no admin/manager in developer role
const availableTeamMembers: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Priya Mehta',
    role: 'manager',
    skills: ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Strategy'],
    availability: 85,
    department: 'VNIT',
    experience: 'lead',
    hourlyRate: 2500,
    isTeamLead: true,
    performance: { velocity: 120, taskCompletion: 98, codeQuality: 4.9, rating: 'excellent' },
    workload: 70,
    projects: 3
  },
  {
    id: 'tm-2',
    name: 'Rajesh Gupta',
    role: 'manager',
    skills: ['Project Management', 'Java Architecture', 'Team Leadership', 'Risk Management'],
    availability: 90,
    department: 'Dinshaw',
    experience: 'senior',
    hourlyRate: 2200,
    performance: { velocity: 115, taskCompletion: 94, codeQuality: 4.7, rating: 'excellent' },
    workload: 60,
    projects: 2
  },
  {
    id: 'tm-3',
    name: 'Rohit Kumar',
    role: 'developer',
    skills: ['Angular', 'TypeScript', 'Python', 'PostgreSQL', 'Docker'],
    availability: 95,
    department: 'VNIT',
    experience: 'mid',
    hourlyRate: 1800,
    performance: { velocity: 105, taskCompletion: 91, codeQuality: 4.4, rating: 'good' },
    workload: 55,
    projects: 1
  },
  {
    id: 'tm-4',
    name: 'Sneha Patel',
    role: 'designer',
    skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'Marketing'],
    availability: 80,
    department: 'VNIT',
    experience: 'senior',
    hourlyRate: 2000,
    performance: { velocity: 110, taskCompletion: 96, codeQuality: 4.8, rating: 'excellent' },
    workload: 75,
    projects: 4
  },
  {
    id: 'tm-5',
    name: 'Amit Patel',
    role: 'developer',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'],
    availability: 70,
    department: 'Dinshaw',
    experience: 'junior',
    hourlyRate: 1500,
    performance: { velocity: 65, taskCompletion: 42, codeQuality: 3.2, rating: 'needs_attention' },
    workload: 85,
    projects: 2
  },
  {
    id: 'tm-6',
    name: 'Neha Agarwal',
    role: 'developer',
    skills: ['Database Design', 'SQL', 'MongoDB', 'Data Analysis'],
    availability: 88,
    department: 'VNIT',
    experience: 'mid',
    hourlyRate: 1700,
    performance: { velocity: 100, taskCompletion: 89, codeQuality: 4.3, rating: 'good' },
    workload: 45,
    projects: 1
  },
  {
    id: 'tm-7',
    name: 'Vikram Singh',
    role: 'developer',
    skills: ['Maui', 'C#', '.NET', 'Mobile Development'],
    availability: 92,
    department: 'Hospy',
    experience: 'senior',
    hourlyRate: 1900,
    performance: { velocity: 108, taskCompletion: 93, codeQuality: 4.5, rating: 'good' },
    workload: 50,
    projects: 2
  },
  {
    id: 'tm-8',
    name: 'Ravi Sharma',
    role: 'developer',
    skills: ['Testing', 'Quality Assurance', 'Automation', 'Manual Testing'],
    availability: 85,
    department: 'Pharma',
    experience: 'senior',
    hourlyRate: 2400,
    performance: { velocity: 118, taskCompletion: 97, codeQuality: 4.9, rating: 'excellent' },
    workload: 65,
    projects: 3
  },
  {
    id: 'tm-9',
    name: 'Pooja Yadav',
    role: 'developer',
    skills: ['Implementation', 'System Integration', 'API Development', 'Backend'],
    availability: 75,
    department: 'Dinshaw',
    experience: 'mid',
    hourlyRate: 1600,
    performance: { velocity: 95, taskCompletion: 87, codeQuality: 4.2, rating: 'good' },
    workload: 60,
    projects: 2
  },
  {
    id: 'tm-10',
    name: 'Aarti Jain',
    role: 'designer',
    skills: ['Marketing Design', 'Brand Identity', 'UI/UX', 'Graphic Design'],
    availability: 90,
    department: 'Dinshaw',
    experience: 'senior',
    hourlyRate: 2100,
    performance: { velocity: 112, taskCompletion: 95, codeQuality: 4.6, rating: 'excellent' },
    workload: 55,
    projects: 2
  },
  {
    id: 'tm-11',
    name: 'Kiran Nair',
    role: 'designer',
    skills: ['Marketing', 'Brand Design', 'Creative Direction', 'Digital Marketing'],
    availability: 85,
    department: 'Hospy',
    experience: 'mid',
    hourlyRate: 1800,
    performance: { velocity: 95, taskCompletion: 88, codeQuality: 4.3, rating: 'good' },
    workload: 70,
    projects: 3
  },
  {
    id: 'tm-12',
    name: 'Sonia Kapoor',
    role: 'designer',
    skills: ['HR Design', 'Employee Experience', 'Training Materials', 'Documentation'],
    availability: 80,
    department: 'Pharma',
    experience: 'senior',
    hourlyRate: 1900,
    performance: { velocity: 100, taskCompletion: 92, codeQuality: 4.4, rating: 'good' },
    workload: 65,
    projects: 2
  }
];

// Drag and Drop Item Types
const ItemType = {
  TEAM_MEMBER: 'team_member'
};

// Draggable Team Member Card
const DraggableTeamMember: React.FC<{ 
  member: TeamMember; 
  isSelected: boolean; 
  onSelect?: () => void;
  onViewDetails?: () => void;
}> = ({ member, isSelected, onSelect, onViewDetails }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.TEAM_MEMBER,
    item: { member },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'developer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'designer': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'analyst': return 'bg-green-100 text-green-800 border-green-200';
      case 'tester': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'devops': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'needs_attention': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getExperienceIcon = (experience: string) => {
    switch (experience) {
      case 'lead': return <Crown className="w-3 h-3 text-yellow-600" />;
      case 'senior': return <Star className="w-3 h-3 text-blue-600" />;
      case 'mid': return <Award className="w-3 h-3 text-green-600" />;
      case 'junior': return <Target className="w-3 h-3 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div 
      ref={drag}
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
      onClick={onSelect}
    >
      <Card 
        className={`h-full ${isSelected ? 'ring-2 ring-primary bg-gradient-light' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {member.isTeamLead && (
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center border border-white shadow-sm">
                    <Crown className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{member.name}</h4>
                <div className="flex items-center space-x-1 mt-1">
                  <Badge variant="outline" className={`text-xs ${getRoleColor(member.role)}`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                  {getExperienceIcon(member.experience)}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.();
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>

          <div className="space-y-2">
            {/* Availability */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Availability</span>
              <span className={member.availability >= 80 ? 'text-green-600' : member.availability >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                {member.availability}%
              </span>
            </div>
            <Progress value={member.availability} className="h-1" />

            {/* Performance */}
            {member.performance && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Performance</span>
                <span className={getPerformanceColor(member.performance.rating)}>
                  {member.performance.rating.replace('_', ' ')}
                </span>
              </div>
            )}

            {/* Rate */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rate</span>
              <div className="flex items-center space-x-1">
                <IndianRupee className="w-3 h-3" />
                <span>{member.hourlyRate.toLocaleString()}/hr</span>
              </div>
            </div>

            {/* Skills Preview */}
            <div className="flex flex-wrap gap-1 mt-2">
              {member.skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{member.skills.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Drop Zone for Selected Team
const SelectedTeamDropZone: React.FC<{ 
  selectedMembers: TeamMember[];
  onDrop: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
  projectBudget?: number;
  projectDuration?: number;
}> = ({ selectedMembers, onDrop, onRemove, projectBudget, projectDuration }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType.TEAM_MEMBER,
    drop: (item: { member: TeamMember }) => {
      onDrop(item.member);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Calculate team composition analysis
  const teamAnalysis = useMemo(() => {
    if (!selectedMembers || selectedMembers.length === 0) {
      return {
        totalCost: 0,
        roleDistribution: {},
        avgExperience: 0,
        avgPerformance: 0,
        budgetUtilization: 0
      };
    }

    const totalCost = selectedMembers.reduce((sum, member) => 
      sum + (member.hourlyRate * (projectDuration || 40) * 8), 0
    );
    
    const roleDistribution = selectedMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgExperience = selectedMembers.reduce((sum, member) => {
      const expValue = { junior: 1, mid: 2, senior: 3, lead: 4 }[member.experience] || 1;
      return sum + expValue;
    }, 0) / (selectedMembers.length || 1);

    const avgPerformance = selectedMembers.reduce((sum, member) => 
      sum + (member.performance?.velocity || 80), 0
    ) / (selectedMembers.length || 1);

    return {
      totalCost,
      roleDistribution,
      avgExperience,
      avgPerformance,
      budgetUtilization: projectBudget ? (totalCost / projectBudget) * 100 : 0
    };
  }, [selectedMembers, projectBudget, projectDuration]);

  return (
    <div 
      ref={drop}
      className={`min-h-[300px] p-4 border-2 border-dashed rounded-lg transition-colors ${
        isOver ? 'border-primary bg-gradient-light' : 'border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>Selected Team ({selectedMembers?.length || 0})</span>
        </h3>
        {selectedMembers && selectedMembers.length > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Team Performance: {teamAnalysis.avgPerformance.toFixed(0)}%
          </Badge>
        )}
      </div>

      {!selectedMembers || selectedMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <UserPlus className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-muted-foreground">Drag team members here to build your project team</p>
          <p className="text-sm text-muted-foreground mt-1">or click on members to add them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedMembers.map((member) => (
              <div key={member.id} className="relative overflow-hidden">
                <DraggableTeamMember 
                  member={member}
                  isSelected={true}
                  onViewDetails={() => {/* Handle view details */}}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full z-10"
                  onClick={() => onRemove(member.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Team Analysis */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Team Composition Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role Distribution */}
              <div>
                <Label className="text-xs text-muted-foreground">Role Distribution</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(teamAnalysis.roleDistribution).map(([role, count]) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Budget Analysis */}
              {projectBudget && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Estimated Cost</Label>
                    <div className="flex items-center space-x-1 mt-1">
                      <IndianRupee className="w-3 h-3" />
                      <span className="text-sm font-medium">
                        {teamAnalysis.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Budget Usage</Label>
                    <div className="mt-1">
                      <div className="flex justify-between text-xs">
                        <span>{teamAnalysis.budgetUtilization.toFixed(1)}%</span>
                        <span className={
                          teamAnalysis.budgetUtilization > 90 ? 'text-red-600' :
                          teamAnalysis.budgetUtilization > 75 ? 'text-yellow-600' : 'text-green-600'
                        }>
                          {teamAnalysis.budgetUtilization > 90 ? 'Over Budget' :
                           teamAnalysis.budgetUtilization > 75 ? 'High Usage' : 'Within Budget'}
                        </span>
                      </div>
                      <Progress value={teamAnalysis.budgetUtilization} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-3 bg-gradient-light rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Team Recommendations</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      {selectedMembers.filter(m => m.role === 'manager').length === 0 && (
                        <li>• Consider adding a project manager for better coordination</li>
                      )}
                      {selectedMembers.filter(m => m.role === 'tester').length === 0 && (
                        <li>• Add a tester to ensure quality assurance</li>
                      )}
                      {teamAnalysis.avgExperience < 2 && (
                        <li>• Team may benefit from more senior members for mentoring</li>
                      )}
                      {teamAnalysis.budgetUtilization > 90 && (
                        <li>• Consider optimizing team composition to reduce costs</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const TeamManager: React.FC<TeamManagerProps> = ({ 
  selectedMembers: propSelectedMembers, 
  onMembersChange, 
  projectBudget,
  projectDuration,
  projectId,
  onTeamChange
}) => {
  const [internalSelectedMembers, setInternalSelectedMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('build');

  // Use prop selectedMembers if provided, otherwise use internal state
  const selectedMembers = propSelectedMembers || internalSelectedMembers;

  // Filter available members
  const filteredMembers = useMemo(() => {
    return availableTeamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesExperience = experienceFilter === 'all' || member.experience === experienceFilter;
      const matchesAvailability = availabilityFilter === 'all' || 
                                 (availabilityFilter === 'high' && member.availability >= 80) ||
                                 (availabilityFilter === 'medium' && member.availability >= 60 && member.availability < 80) ||
                                 (availabilityFilter === 'low' && member.availability < 60);
      
      return matchesSearch && matchesRole && matchesExperience && matchesAvailability;
    });
  }, [searchTerm, roleFilter, experienceFilter, availabilityFilter]);

  const handleAddMember = (member: TeamMember) => {
    if (!selectedMembers?.find(m => m.id === member.id)) {
      const newMembers = [...(selectedMembers || []), member];
      
      // Update internal state if using internal state management
      if (!propSelectedMembers) {
        setInternalSelectedMembers(newMembers);
      }
      
      // Call appropriate callback
      if (onMembersChange) {
        onMembersChange(newMembers);
      } else if (onTeamChange) {
        onTeamChange(newMembers);
      }
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const newMembers = (selectedMembers || []).filter(m => m.id !== memberId);
    
    // Update internal state if using internal state management
    if (!propSelectedMembers) {
      setInternalSelectedMembers(newMembers);
    }
    
    // Call appropriate callback
    if (onMembersChange) {
      onMembersChange(newMembers);
    } else if (onTeamChange) {
      onTeamChange(newMembers);
    }
  };

  const isSelected = (memberId: string) => {
    return selectedMembers?.some(m => m.id === memberId) || false;
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="build">Build Team</TabsTrigger>
            <TabsTrigger value="analyze">Team Analysis</TabsTrigger>
            <TabsTrigger value="allocation">Resource Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Available Members */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Available Team Members</h3>
                  <Badge variant="secondary">
                    {filteredMembers.length} available
                  </Badge>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="tester">Tester</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="high">High (80%+)</SelectItem>
                        <SelectItem value="medium">Medium (60-80%)</SelectItem>
                        <SelectItem value="low">Low (&lt;60%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Available Members List */}
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3 pr-4">
                    {filteredMembers.map((member) => (
                      <DraggableTeamMember
                        key={member.id}
                        member={member}
                        isSelected={isSelected(member.id)}
                        onSelect={() => handleAddMember(member)}
                        onViewDetails={() => {/* Handle view details */}}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Selected Team */}
              <div>
                <SelectedTeamDropZone
                  selectedMembers={selectedMembers}
                  onDrop={handleAddMember}
                  onRemove={handleRemoveMember}
                  projectBudget={projectBudget}
                  projectDuration={projectDuration}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed analysis of your selected team composition and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Team analytics will be displayed here</p>
                  <p className="text-sm">Add team members to see detailed performance insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation Planning</CardTitle>
                <CardDescription>
                  Optimize team member allocation across project phases and manage workloads
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Resource allocation planning will be displayed here</p>
                  <p className="text-sm">Plan sprint allocations and manage team capacity</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DndProvider>
  );
};

export default TeamManager;