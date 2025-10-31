import { useState, useEffect } from 'react';
import { teamMemberApi, TeamMember, CreateTeamMemberRequest, UpdateTeamMemberRequest } from '../../services/api/entities/teamMemberApi';

export interface UseTeamMembersResult {
  teamMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  createTeamMember: (teamMember: CreateTeamMemberRequest) => Promise<TeamMember | null>;
  updateTeamMember: (id: string, updates: UpdateTeamMemberRequest) => Promise<TeamMember | null>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  addTeamMemberToProject: (projectId: string, userId: string, role: string, isTeamLead?: boolean) => Promise<TeamMember | null>;
  removeTeamMemberFromProject: (projectId: string, userId: string) => Promise<boolean>;
  refreshTeamMembers: () => Promise<void>;
}

export const useTeamMembers = (projectId?: string): UseTeamMembersResult => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const members = await teamMemberApi.getTeamMembersByProject(projectId);
      setTeamMembers(members);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
      console.error('Error fetching team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async (teamMember: CreateTeamMemberRequest): Promise<boolean> => {
    try {
      setError(null);
      await teamMemberApi.createTeamMember(teamMember);
      // Always refresh from server to ensure state matches DB and DTO shape
      await fetchTeamMembers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team member');
      console.error('Error creating team member:', err);
      return false;
    }
  };

  const updateTeamMember = async (id: string, updates: UpdateTeamMemberRequest): Promise<TeamMember | null> => {
    try {
      setError(null);
      const updatedTeamMember = await teamMemberApi.updateTeamMember(id, updates);
      
      // Update local state
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === id ? updatedTeamMember : member
        )
      );
      
      return updatedTeamMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team member');
      console.error('Error updating team member:', err);
      return null;
    }
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await teamMemberApi.deleteTeamMember(id);
      
      // Remove from local state
      setTeamMembers(prev => prev.filter(member => member.id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team member');
      console.error('Error deleting team member:', err);
      return false;
    }
  };

  const addTeamMemberToProject = async (
    projectId: string, 
    userId: string, 
    role: string, 
    isTeamLead: boolean = false
  ): Promise<boolean> => {
    try {
      setError(null);
      const teamMemberRequest: CreateTeamMemberRequest = {
        projectId,
        userId,
        role,
        isTeamLead,
        allocationPercentage: 100
      };
      
      await teamMemberApi.createTeamMember(teamMemberRequest);
      // Refresh from server to reflect DB
      await fetchTeamMembers();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team member to project');
      console.error('Error adding team member to project:', err);
      return false;
    }
  };

  const removeTeamMemberFromProject = async (projectId: string, userId: string): Promise<boolean> => {
    try {
      setError(null);
      await teamMemberApi.removeTeamMemberFromProject(projectId, userId);
      
      // Remove from local state
      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove team member from project');
      console.error('Error removing team member from project:', err);
      return false;
    }
  };

  const refreshTeamMembers = async () => {
    await fetchTeamMembers();
  };

  // Fetch team members when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchTeamMembers();
    }
  }, [projectId]);

  return {
    teamMembers,
    loading,
    error,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addTeamMemberToProject,
    removeTeamMemberFromProject,
    refreshTeamMembers
  };
};
