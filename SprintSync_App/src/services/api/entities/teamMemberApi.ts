import { apiClient } from '../client';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  availability?: number;
  isTeamLead?: boolean;
  email?: string;
  avatar?: string;
  skills?: string[];
  hourlyRate?: number;
  performance?: number;
}

export interface CreateTeamMemberRequest {
  projectId: string;
  userId: string;
  role: string;
  isTeamLead?: boolean;
  allocationPercentage?: number;
}

export interface UpdateTeamMemberRequest {
  role?: string;
  isTeamLead?: boolean;
  allocationPercentage?: number;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

export const teamMemberApi = {
  // Get all team members
  async getAllTeamMembers(): Promise<TeamMember[]> {
    try {
      const response = await apiClient.get<TeamMember[]>('/project-team-members');
      return response.data;
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  },

  // Get team members by project ID
  async getTeamMembersByProject(projectId: string): Promise<TeamMember[]> {
    try {
      const response = await apiClient.get<TeamMember[]>(`/project-team-members/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team members for project:', error);
      throw error;
    }
  },

  // Create a new team member
  async createTeamMember(teamMember: CreateTeamMemberRequest): Promise<TeamMember> {
    try {
      const response = await apiClient.post<TeamMember>('/project-team-members/add-to-project', teamMember);
      return response.data;
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  },

  // Update a team member
  async updateTeamMember(id: string, updates: UpdateTeamMemberRequest): Promise<TeamMember> {
    try {
      const response = await apiClient.put<TeamMember>(`/project-team-members/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
  },

  // Delete a team member
  async deleteTeamMember(id: string): Promise<void> {
    try {
      await apiClient.delete(`/project-team-members/${id}`);
    } catch (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  },

  // Add multiple team members to a project
  async addTeamMembersToProject(projectId: string, teamMembers: CreateTeamMemberRequest[]): Promise<TeamMember[]> {
    try {
      const response = await apiClient.post<TeamMember[]>(`/project-team-members/project/${projectId}/batch`, teamMembers);
      return response.data;
    } catch (error) {
      console.error('Error adding team members to project:', error);
      throw error;
    }
  },

  // Remove team member from project
  async removeTeamMemberFromProject(projectId: string, userId: string): Promise<void> {
    try {
      console.log(`Removing team member ${userId} from project ${projectId}`);
      const response = await apiClient.delete(`/project-team-members/project/${projectId}/user/${userId}`);
      console.log('Remove team member response:', response.data);
    } catch (error) {
      console.error('Error removing team member from project:', error);
      throw error;
    }
  }
};
