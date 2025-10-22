import React, { useState, useMemo, useEffect } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { userApiService } from '../services/api/entities/userApi';

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
  onAddMember?: (userId: string, role: string, isTeamLead?: boolean) => Promise<void>;
  onRemoveMember?: (userId: string) => Promise<void>;
}

// Mock data removed - only real API data will be used
const availableTeamMembers: TeamMember[] = [];

// Drag and Drop Item Types
const ItemType = {
  TEAM_MEMBER: 'team_member'
};

// Draggable Team Member Card
const DraggableTeamMember = ({ member, isSelected, onSelect, onViewDetails }: { 
  member: TeamMember; 
  isSelected: boolean; 
  onSelect?: () => void;
  onViewDetails?: () => void;
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.TEAM_MEMBER,
    item: () => {
      console.log('Drag started for:', member.name);
      return { member };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!monitor.didDrop()) {
        console.log('Drag cancelled for:', member.name);
      }
    }
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

  const getPerformanceColor = (rating: string | number) => {
    // Handle numeric performance (percentage)
    if (typeof rating === 'number') {
      if (rating >= 90) return 'text-green-600';
      if (rating >= 75) return 'text-blue-600';
      if (rating >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
    
    // Handle string rating
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
      onClick={() => {
        console.log('Card clicked for member:', member.name);
        onSelect?.();
      }}
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
              title="View user details"
              onClick={(e) => {
                e.stopPropagation();
                console.log('=== EYE BUTTON CLICKED ===');
                console.log('Eye button clicked for:', member.name);
                console.log('onViewDetails function:', onViewDetails);
                if (onViewDetails) {
                  onViewDetails();
                  console.log('onViewDetails called successfully');
                } else {
                  console.log('ERROR: onViewDetails is undefined!');
                }
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
                <span className={getPerformanceColor(typeof member.performance === 'number' ? member.performance : member.performance?.rating || 0)}>
                  {typeof member.performance === 'number' 
                    ? `${member.performance}%` 
                    : member.performance?.rating?.replace('_', ' ') || 'N/A'}
                </span>
              </div>
            )}

            {/* Rate */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Rate</span>
              <div className="flex items-center space-x-1">
                <IndianRupee className="w-3 h-3" />
                <span>{(member.hourlyRate || 0).toLocaleString()}/hr</span>
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
const SelectedTeamDropZone = ({ selectedMembers, onDrop, onRemove, onViewDetails, projectBudget, projectDuration }: { 
  selectedMembers: TeamMember[];
  onDrop: (member: TeamMember) => void;
  onRemove: (memberId: string) => void;
  onViewDetails: (member: TeamMember) => void;
  projectBudget?: number;
  projectDuration?: number;
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType.TEAM_MEMBER,
    drop: (item: { member: TeamMember }, monitor) => {
      console.log('Drop received for:', item.member.name);
      console.log('Drop zone onDrop function:', onDrop);
      onDrop(item.member);
      console.log('Drop handled successfully');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover: () => {
      console.log('Hovering over drop zone');
    }
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
      sum + (typeof member.performance === 'number' ? member.performance : (member.performance?.velocity || 80)), 0
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
        <div className="h-[500px] overflow-y-auto space-y-4 pr-4">
          {/* Selected Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {selectedMembers.map((member) => (
              <div key={member.id} className="relative overflow-hidden">
                <DraggableTeamMember 
                  member={member}
                  isSelected={true}
                    onViewDetails={() => onViewDetails(member)}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 h-5 w-5 p-0 rounded-full z-10"
                  onClick={() => {
                    console.log('Remove button clicked for:', member.name);
                    console.log('onRemove function:', onRemove);
                    onRemove(member.id);
                  }}
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
                        {(teamAnalysis.totalCost || 0).toLocaleString()}
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
                      {(selectedMembers.length < 7 || selectedMembers.length > 8) && (
                        <li className={selectedMembers.length < 7 ? 'text-orange-600' : 'text-yellow-600'}>
                          • Optimal team size is 7-8 members per project (Current: {selectedMembers.length})
                        </li>
                      )}
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
                      {selectedMembers.length >= 7 && selectedMembers.length <= 8 && 
                       selectedMembers.filter(m => m.role === 'manager').length > 0 &&
                       teamAnalysis.budgetUtilization <= 90 && (
                        <li className="text-green-600">• Team composition looks optimal! ✓</li>
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

const TeamManager = ({ 
  selectedMembers: propSelectedMembers, 
  onMembersChange, 
  projectBudget,
  projectDuration,
  projectId,
  onTeamChange,
  onAddMember,
  onRemoveMember
}: TeamManagerProps) => {
  

  const [internalSelectedMembers, setInternalSelectedMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('build');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [hasLoadedRealData, setHasLoadedRealData] = useState(false);

  // Use useRef to persist modal state across re-renders
  const modalStateRef = React.useRef({
    selectedUser: null as TeamMember | null,
    isOpen: false
  });
  
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<TeamMember | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  
  // Sync state with ref to prevent reset on re-renders
  React.useEffect(() => {
    // If ref has modal state but local state doesn't, restore it
    if (modalStateRef.current.isOpen && modalStateRef.current.selectedUser && !isUserDetailsOpen) {
      console.log('=== RESTORING MODAL STATE FROM REF ===');
      console.log('Restoring user:', modalStateRef.current.selectedUser.name);
      setIsUserDetailsOpen(true);
      setSelectedUserForDetails(modalStateRef.current.selectedUser);
    }
  }); // Run on every render to catch re-renders from parent
  
  // Use a key to force Dialog to remount when user changes, preventing auto-close
  const dialogKey = selectedUserForDetails?.id || 'no-user';

  // Fetch real users from API
  useEffect(() => {
    const fetchUsers = async (retryCount = 0) => {
      try {
        console.log(`TeamManager: Fetching users from API... (attempt ${retryCount + 1})`);
        setLoadingUsers(true);
        
        // Get fresh token from localStorage or use the hardcoded one
        const token = localStorage.getItem('authToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg';
        
        console.log('TeamManager: Making API request to:', 'http://localhost:8080/api/users');
        console.log('TeamManager: Using token:', token.substring(0, 20) + '...');
        
        const testResponse = await fetch('http://localhost:8080/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('TeamManager: Response status:', testResponse.status);
        console.log('TeamManager: Response ok:', testResponse.ok);
        
        if (!testResponse.ok) {
          const errorText = await testResponse.text();
          console.error('TeamManager: Error response:', errorText);
          throw new Error(`HTTP error! status: ${testResponse.status} - ${errorText}`);
        }
        
        const testData = await testResponse.json();
        console.log('TeamManager: Direct fetch response:', testData);
        
        // Use direct fetch data instead of userApiService
        if (testData && testData.content && Array.isArray(testData.content)) {
          console.log('TeamManager: Found', testData.content.length, 'users from direct fetch');
          console.log('TeamManager: Raw user data:', testData.content[0]); // Log first user for debugging
          
          // Map API users to TeamMember format
          const mappedUsers: TeamMember[] = testData.content.map((user: any) => {
            // Parse skills from JSON string
            let skillsArray: string[] = [];
            if (user.skills) {
              try {
                if (typeof user.skills === 'string') {
                  skillsArray = JSON.parse(user.skills);
                } else if (Array.isArray(user.skills)) {
                  skillsArray = user.skills;
                }
              } catch (e) {
                console.warn('Failed to parse skills for user:', user.name, user.skills);
                skillsArray = ['General'];
              }
            }
            
            return {
              id: user.id,
              name: user.name,
              role: user.role?.toLowerCase() || 'developer',
              skills: skillsArray,
              availability: user.availabilityPercentage || 100,
              department: user.departmentId || 'Unknown', // Use departmentId since department name might not be available
              experience: user.experience?.toLowerCase() || 'mid',
              hourlyRate: user.hourlyRate || 0,
              avatar: user.avatarUrl || '',
              isTeamLead: false,
              workload: 0,
              projects: 0
            };
          });
          
          console.log('TeamManager: Mapped users:', mappedUsers);
          setAvailableUsers(mappedUsers);
          setHasLoadedRealData(true);
          console.log('TeamManager: Successfully loaded real data from API');
        } else {
          console.log('TeamManager: No users found in direct fetch response');
          setAvailableUsers([]);
          setHasLoadedRealData(false);
        }
      } catch (error: any) {
        console.error('TeamManager: Error fetching users:', error);
        console.error('TeamManager: Error details:', {
          message: error.message,
          status: error.status,
          response: error.response?.data
        });
        
        // Retry logic - only retry once
        if (retryCount === 0) {
          console.log('TeamManager: Retrying API call...');
          setTimeout(() => fetchUsers(1), 2000); // Retry after 2 seconds
          return;
        }
        
        // API failed after retry - show empty state
        console.log('TeamManager: API failed after retry, showing empty state');
        setAvailableUsers([]);
        setHasLoadedRealData(false);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Also try to load real data whenever the component becomes visible
  useEffect(() => {
    if (!hasLoadedRealData && !loadingUsers) {
      console.log('TeamManager: No real data loaded yet, attempting secondary load...');
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const token = localStorage.getItem('authToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg';
          
          console.log('TeamManager: Secondary load - making API request...');
          const response = await fetch('http://localhost:8080/api/users', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('TeamManager: Secondary load - response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            if (data && data.content && Array.isArray(data.content)) {
              const mappedUsers = data.content.map((user: any) => ({
                id: user.id,
                name: user.name,
                role: user.role?.toLowerCase() || 'developer',
                skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
                availability: user.availabilityPercentage || 100,
                department: user.departmentId || 'Unknown',
                experience: user.experience?.toLowerCase() || 'mid',
                hourlyRate: user.hourlyRate || 0,
                avatar: user.avatarUrl || '',
                isTeamLead: false,
                workload: 0,
                projects: 0
              }));
              console.log('TeamManager: Secondary load successful:', mappedUsers.length, 'users');
              setAvailableUsers(mappedUsers);
              setHasLoadedRealData(true);
            }
          }
        } catch (error) {
          console.log('TeamManager: Secondary load failed:', error);
          console.log('TeamManager: Secondary load error details:', error);
        } finally {
          setLoadingUsers(false);
        }
      };
      
      fetchUsers();
    }
  }, [hasLoadedRealData, loadingUsers]);

  // Use prop selectedMembers if provided, otherwise use internal state
  const selectedMembers = propSelectedMembers || internalSelectedMembers;

  // Filter available members - only use real data
  const filteredMembers = useMemo(() => {
    // Only use real API data - no mock data fallback
    console.log('TeamManager: Using only real API data');
    console.log('TeamManager: Has loaded real data:', hasLoadedRealData);
    console.log('TeamManager: Available users count:', availableUsers.length);
    console.log('TeamManager: Members to filter:', availableUsers.length, 'members');
    return availableUsers.filter(member => {
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
  }, [availableUsers, searchTerm, roleFilter, experienceFilter, availabilityFilter]);

  const handleAddMember = (member: TeamMember) => {
    console.log('=== handleAddMember START ===');
    console.log('handleAddMember called for:', member.name);
    console.log('Current selected members:', selectedMembers?.length || 0);
    
    if (!selectedMembers?.find(m => m.id === member.id)) {
      const newMembers = [...(selectedMembers || []), member];
      console.log('Adding member, new count:', newMembers.length);
      
      // Update internal state if using internal state management
      if (!propSelectedMembers) {
        setInternalSelectedMembers(newMembers);
        console.log('Updated internal selected members');
      }
      
      // Call appropriate callback
      if (onMembersChange) {
        console.log('Calling onMembersChange with new members array');
        onMembersChange(newMembers);
        console.log('Called onMembersChange');
      } else if (onTeamChange) {
        console.log('Calling onTeamChange with new members array');
        onTeamChange(newMembers);
        console.log('Called onTeamChange');
      }
      
      // Also call the onAddMember callback if it exists (to trigger API call)
      if (onAddMember && projectId) {
        console.log('Calling onAddMember API callback for userId:', member.id);
        console.log('Member role:', member.role);
        console.log('Is team lead:', member.isTeamLead || false);
        onAddMember(member.id, member.role, member.isTeamLead || false);
      }
    } else {
      console.log('Member already selected:', member.name);
    }
    console.log('=== handleAddMember END ===');
  };

  const handleRemoveMember = (memberId: string) => {
    console.log('=== handleRemoveMember START ===');
    console.log('handleRemoveMember called for ID:', memberId);
    console.log('Member ID type:', typeof memberId);
    
    const newMembers = (selectedMembers || []).filter(m => m.id !== memberId);
    console.log('Removing member, new count:', newMembers.length);
    
    // Update internal state if using internal state management
    if (!propSelectedMembers) {
      setInternalSelectedMembers(newMembers);
      console.log('Updated internal selected members after removal');
    }
    
    // Call appropriate callback
    if (onMembersChange) {
      console.log('Calling onMembersChange with new members array');
      onMembersChange(newMembers);
      console.log('Called onMembersChange for removal');
    } else if (onTeamChange) {
      console.log('Calling onTeamChange with new members array');
      onTeamChange(newMembers);
      console.log('Called onTeamChange for removal');
    }
    
    // Also call the onRemoveMember callback if it exists (to trigger API call)
    if (onRemoveMember) {
      console.log('Calling onRemoveMember API callback for userId:', memberId);
      onRemoveMember(memberId);
    }
    console.log('=== handleRemoveMember END ===');
  };

  const isSelected = (memberId: string) => {
    return selectedMembers?.some(m => m.id === memberId) || false;
  };

  const handleViewUserDetails = (member: TeamMember) => {
    console.log('=== handleViewUserDetails START ===');
    console.log('handleViewUserDetails called for:', member.name);
    console.log('Setting selectedUserForDetails to:', member);
    
    // Update ref to persist across re-renders
    modalStateRef.current = {
      selectedUser: member,
      isOpen: true
    };
    
    setSelectedUserForDetails(member);
    console.log('Setting isUserDetailsOpen to: true');
    setIsUserDetailsOpen(true);
    console.log('User details modal state updated');
    console.log('=== handleViewUserDetails END ===');
  };

  // Debug: Track modal state changes
  useEffect(() => {
    console.log('=== MODAL STATE CHANGED ===');
    console.log('isUserDetailsOpen:', isUserDetailsOpen);
    console.log('selectedUserForDetails:', selectedUserForDetails?.name || 'null');
  }, [isUserDetailsOpen, selectedUserForDetails]);

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
                  <div className="flex items-center gap-2">
                  <h3 className="font-medium">Available Team Members</h3>
                    {hasLoadedRealData ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Real Data
                      </Badge>
                    ) : loadingUsers ? (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        Loading...
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        No Data
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                      {loadingUsers ? 'Loading...' : `${filteredMembers.length} available`}
                  </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        console.log('Manual refresh triggered');
                        setLoadingUsers(true);
                        // Trigger re-fetch
                        const token = localStorage.getItem('authToken') || 'eyJhbGciOiJIUzUxMiJ9.eyJyb2xlIjoiQURNSU4iLCJkb21haW4iOiJET01OMDAwMDAwMDAwMDAwMSIsIm5hbWUiOiJBZG1pbiBVc2VyIiwiZGVwYXJ0bWVudCI6IkRFUFQwMDAwMDAwMDAwMDEiLCJ1c2VySWQiOiJVU0VSMDAwMDAwMDAwMDAxIiwic3ViIjoiYWRtaW5Ac3ByaW50c3luYy5jb20iLCJpYXQiOjE3NTk3NDg0NjUsImV4cCI6MTc1OTgzNDg2NX0.QdwUhiS_AvtqzTefTe14N7TKWB1jzrQg01Sz_lNOGBleAPqfVAgTHf97-JmCUQKZyXtAqkhYD-HN3YAMDywxRg';
                        fetch('http://localhost:8080/api/users', {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        }).then(response => response.json()).then(data => {
                          if (data && data.content && Array.isArray(data.content)) {
                            const mappedUsers = data.content.map((user: any) => ({
                              id: user.id,
                              name: user.name,
                              role: user.role?.toLowerCase() || 'developer',
                              skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
                              availability: user.availabilityPercentage || 100,
                              department: user.departmentId || 'Unknown',
                              experience: user.experience?.toLowerCase() || 'mid',
                              hourlyRate: user.hourlyRate || 0,
                              avatar: user.avatarUrl || '',
                              isTeamLead: false,
                              workload: 0,
                              projects: 0
                            }));
                            console.log('Manual refresh: Loaded', mappedUsers.length, 'real users');
                            setAvailableUsers(mappedUsers);
                            setHasLoadedRealData(true);
                          }
                          setLoadingUsers(false);
                        }).catch(error => {
                          console.error('Manual refresh failed:', error);
                          setLoadingUsers(false);
                        });
                      }}
                      disabled={loadingUsers}
                    >
                      🔄
                    </Button>
                  </div>
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
                <div className="h-[500px] overflow-y-auto space-y-3 pr-4">
                    {loadingUsers ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        Loading users from database...
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No users available</p>
                        <p className="text-sm">Click the refresh button to load users from database</p>
                      </div>
                    ) : (
                      filteredMembers.map((member) => (
                      <DraggableTeamMember
                        key={member.id}
                        member={member}
                        isSelected={isSelected(member.id)}
                        onSelect={() => handleAddMember(member)}
                          onViewDetails={() => handleViewUserDetails(member)}
                      />
                      ))
                    )}
                  </div>
              </div>

              {/* Selected Team */}
              <div>
                <SelectedTeamDropZone
                  selectedMembers={selectedMembers}
                  onDrop={handleAddMember}
                  onRemove={handleRemoveMember}
                  onViewDetails={handleViewUserDetails}
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

        {/* User Details Modal */}
        <Dialog 
          key={dialogKey}
          open={isUserDetailsOpen} 
          onOpenChange={(open) => {
            console.log('=== DIALOG onOpenChange ===', open);
            console.log('Current state:', isUserDetailsOpen);
            console.log('New state:', open);
            console.log('Dialog key:', dialogKey);
            
            // Only allow manual closing (when user clicks close or outside)
            if (!open) {
              console.log('Dialog is being closed');
              modalStateRef.current = { selectedUser: null, isOpen: false };
              setSelectedUserForDetails(null);
            }
            setIsUserDetailsOpen(open);
          }}
          modal={true}
        >
          <DialogContent 
            className="max-w-2xl" 
            onInteractOutside={(e) => {
              console.log('=== INTERACT OUTSIDE DETECTED ===');
              e.preventDefault(); // Prevent closing on outside click for debugging
            }}
            onEscapeKeyDown={(e) => {
              console.log('=== ESCAPE KEY DETECTED ===');
              // Allow escape to close
            }}
          >
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View detailed information about the team member
              </DialogDescription>
            </DialogHeader>
            {selectedUserForDetails ? (
              (() => {
                console.log('=== RENDERING DIALOG CONTENT FOR ===', selectedUserForDetails.name);
                return (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedUserForDetails.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedUserForDetails.name}</h3>
                    <p className="text-muted-foreground capitalize">{selectedUserForDetails.role}</p>
                    <p className="text-sm text-muted-foreground">{selectedUserForDetails.department}</p>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedUserForDetails.availability}%</div>
                      <div className="text-sm text-muted-foreground">Availability</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {typeof selectedUserForDetails.performance === 'number' 
                          ? `${selectedUserForDetails.performance}%` 
                          : selectedUserForDetails.performance?.rating || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">Performance</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">₹{selectedUserForDetails.hourlyRate}</div>
                      <div className="text-sm text-muted-foreground">Hourly Rate</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 capitalize">{selectedUserForDetails.experience}</div>
                      <div className="text-sm text-muted-foreground">Experience</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-lg font-medium mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUserForDetails.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Workload</h4>
                    <div className="flex items-center space-x-2">
                      <Progress value={selectedUserForDetails.workload || 0} className="flex-1" />
                      <span className="text-sm">{selectedUserForDetails.workload || 0}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Active Projects</h4>
                    <div className="text-lg font-semibold">{selectedUserForDetails.projects || 0}</div>
                  </div>
                </div>
              </div>
                );
              })()
            ) : (
              (() => {
                console.log('=== NO USER SELECTED FOR DIALOG ===');
                return null;
              })()
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
};

export default TeamManager;