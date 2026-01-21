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
import { API_CONFIG } from '../services/api/config';

interface TeamMember {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'developer' | 'qa_manager' | 'qa_developer';
  skills: string[];
  availability: number; // percentage
  department: string;
  experience: 'E1' | 'E2' | 'M1' | 'M2' | 'M3' | 'L1' | 'L2' | 'L3' | 'S1';
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
// Draggable Team Member Card
const DraggableTeamMember = ({ member, isSelected, onSelect, onViewDetails }: {
  member: TeamMember;
  isSelected?: boolean;
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
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'developer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'qa_manager': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'qa_developer': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'master_admin': return 'bg-violet-100 text-violet-800 border-violet-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceColor = (rating: string | number) => {
    if (typeof rating === 'number') {
      if (rating >= 90) return 'text-green-600';
      if (rating >= 75) return 'text-blue-600';
      if (rating >= 60) return 'text-yellow-600';
      return 'text-red-600';
    }
    switch (rating) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'average': return 'text-yellow-600';
      case 'needs_attention': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      onClick={onSelect}
      className={`
        p-3 rounded-lg border transition-all cursor-move select-none
        ${isDragging ? 'opacity-50 ring-2 ring-blue-400 rotate-2 scale-105' : 'opacity-100 hover:shadow-md hover:border-blue-300'}
        ${isSelected ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' : 'bg-white border-gray-200'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-gray-100">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className={`text-xs ${getRoleColor(member.role)}`}>
              {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 leading-tight">{member.name}</h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-medium mt-1 inline-block ${getRoleColor(member.role)}`}>
              {member.role}
            </span>
          </div>
        </div>
        {onViewDetails && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pl-12">
        <div className="flex items-center space-x-3">
          <span title="Experience" className="flex items-center">
            {member.experience === 'S1' || member.experience.startsWith('L') ? (
              <Crown className="w-3 h-3 mr-1 text-yellow-500" />
            ) : (
              <Star className="w-3 h-3 mr-1 text-gray-400" />
            )}
            <span className="capitalize">{member.experience}</span>
          </span>
          <span title="Hourly Rate" className="flex items-center">
            <IndianRupee className="w-3 h-3 mr-0.5 text-gray-400" />
            {member.hourlyRate}/hr
          </span>
        </div>

        {member.performance && (
          <div className={`flex items-center font-medium ${getPerformanceColor(typeof member.performance === 'object' ? member.performance.rating : 0)}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {typeof member.performance === 'number' ? `${member.performance}%` : 'High'}
          </div>
        )}
      </div>

      {/* Skill tags - limit to 3 */}
      <div className="mt-3 flex flex-wrap gap-1 pl-12">
        {member.skills.slice(0, 3).map((skill, i) => (
          <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
            {skill}
          </span>
        ))}
        {member.skills.length > 3 && (
          <span className="text-[10px] text-gray-400 px-1">+ {member.skills.length - 3}</span>
        )}
      </div>
    </div>
  );
};

// Selected Team Drop Zone
const SelectedTeamDropZone = ({
  selectedMembers,
  onDrop,
  onRemove,
  onViewDetails,
  projectBudget,
  projectDuration
}: any) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType.TEAM_MEMBER,
    drop: (item: { member: TeamMember }) => onDrop(item.member),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const teamAnalysis = useMemo(() => {
    const totalCost = selectedMembers?.reduce((acc: number, m: any) => acc + (m.hourlyRate * 8 * (projectDuration || 20)), 0) || 0;
    const budgetUtilization = projectBudget ? (totalCost / projectBudget) * 100 : 0;
    const avgPerformance = selectedMembers?.length ? selectedMembers.reduce((acc: number, m: any) => acc + (typeof m.performance === 'number' ? m.performance : 85), 0) / selectedMembers.length : 0;
    const roleDistribution = selectedMembers?.reduce((acc: any, m: any) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {}) || {};

    return { totalCost, budgetUtilization, avgPerformance, roleDistribution, avgExperience: 2 };
  }, [selectedMembers, projectBudget, projectDuration]);

  return (
    <div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      className={`
        bg-white rounded-lg border-2 border-dashed h-full flex flex-col transition-colors
        ${isOver ? 'border-green-500 bg-green-50/50' : 'border-gray-200'}
      `}
    >
      <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between rounded-t-lg">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          <span>Selected Team ({selectedMembers?.length || 0})</span>
        </h3>
        {selectedMembers && selectedMembers.length > 0 && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Team Performance: {teamAnalysis.avgPerformance.toFixed(0)}%
          </Badge>
        )}
      </div>

      {!selectedMembers || selectedMembers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Build Your Dream Team</h4>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Drag and drop team members from the left panel here to assign them to this project.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Selected Members Grid */}
            <div className="grid grid-cols-1 gap-3">
              {selectedMembers.map((member: TeamMember) => (
                <div key={member.id} className="relative group">
                  <DraggableTeamMember
                    member={member}
                    isSelected={true}
                    onViewDetails={() => onViewDetails && onViewDetails(member)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => onRemove && onRemove(member.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Team Analysis Footer */}
          <div className="p-4 bg-gray-50 border-t space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Role Distribution
              </span>
              <div className="flex -space-x-1">
                {Object.entries(teamAnalysis.roleDistribution).map(([role, count]: [string, any]) => (
                  <div key={role} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700" title={`${role}: ${count}`}>
                    {count}
                  </div>
                ))}
              </div>
            </div>

            {projectBudget && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Budget Usage</span>
                  <span className={
                    teamAnalysis.budgetUtilization > 100 ? 'text-red-600 font-bold' :
                      teamAnalysis.budgetUtilization > 90 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'
                  }>
                    {teamAnalysis.budgetUtilization.toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(teamAnalysis.budgetUtilization, 100)} className={`h-1.5 ${teamAnalysis.budgetUtilization > 100 ? 'bg-red-100' : ''}`} />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center"><IndianRupee className="w-2 h-2 mr-0.5" /> {teamAnalysis.totalCost.toLocaleString()}</span>
                  <span>Budget: <IndianRupee className="w-2 h-2 inline ml-0.5" /> {projectBudget.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
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

        console.log('TeamManager: Making API request to:', `${API_CONFIG.BASE_URL}/users`);
        console.log('TeamManager: Using token:', token.substring(0, 20) + '...');

        const testResponse = await fetch(`${API_CONFIG.BASE_URL}/users?size=1000`, {
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
              role: user.role || 'developer',
              skills: skillsArray,
              availability: user.availabilityPercentage || 100,
              department: user.departmentId || 'Unknown', // Use departmentId since department name might not be available
              experience: user.experience || 'M1',
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
          const response = await fetch(`${API_CONFIG.BASE_URL}/users?size=1000`, {
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
                role: user.role || 'developer',
                skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
                availability: user.availabilityPercentage || 100,
                department: user.departmentId || 'Unknown',
                experience: user.experience || 'M1',
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
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="build">Build Team</TabsTrigger>
            {/* COMMENTED FOR FUTURE USE - Team Analysis and Resource Allocation tabs
            <TabsTrigger value="analyze">Team Analysis</TabsTrigger>
            <TabsTrigger value="allocation">Resource Allocation</TabsTrigger>
            */}
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
                        fetch(`${API_CONFIG.BASE_URL}/users?size=1000`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        }).then(response => response.json()).then(data => {
                          if (data && data.content && Array.isArray(data.content)) {
                            const mappedUsers = data.content.map((user: any) => ({
                              id: user.id,
                              name: user.name,
                              role: user.role || 'developer',
                              skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
                              availability: user.availabilityPercentage || 100,
                              department: user.departmentId || 'Unknown',
                              experience: user.experience || 'M1',
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
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="qa_manager">QA Manager</SelectItem>
                        <SelectItem value="qa_developer">QA Developer</SelectItem>
                        <SelectItem value="master_admin">Master Admin</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="S1">S1 - Senior Level</SelectItem>
                        <SelectItem value="L3">L3 - Lead Level 3</SelectItem>
                        <SelectItem value="L2">L2 - Lead Level 2</SelectItem>
                        <SelectItem value="L1">L1 - Lead Level 1</SelectItem>
                        <SelectItem value="M3">M3 - Mid Level 3</SelectItem>
                        <SelectItem value="M2">M2 - Mid Level 2</SelectItem>
                        <SelectItem value="M1">M1 - Mid Level 1</SelectItem>
                        <SelectItem value="E2">E2 - Entry Level 2</SelectItem>
                        <SelectItem value="E1">E1 - Entry Level 1</SelectItem>
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

          {/* COMMENTED FOR FUTURE USE - Team Analysis Tab Content
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
          */}

          {/* COMMENTED FOR FUTURE USE - Resource Allocation Tab Content
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
          */}
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
                          <div className="text-sm text-muted-foreground">CTC</div>
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