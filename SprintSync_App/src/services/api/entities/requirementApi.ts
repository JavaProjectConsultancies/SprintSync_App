import { apiClient } from '../client';

export interface Requirement {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  type?: 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'TECHNICAL';
  status?: 'DRAFT' | 'APPROVED' | 'IN_DEVELOPMENT' | 'COMPLETED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  module?: string;
  acceptanceCriteria?: string;
  effortPoints?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequirementRequest {
  projectId: string;
  title: string;
  description?: string;
  type?: 'FUNCTIONAL' | 'NON_FUNCTIONAL' | 'TECHNICAL';
  status?: 'DRAFT' | 'APPROVED' | 'IN_DEVELOPMENT' | 'COMPLETED';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  module?: string;
  acceptanceCriteria?: string;
  effortPoints?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
  message?: string;
}

class RequirementApiService {
  private baseUrl = '/requirements';

  /**
   * Create a new requirement
   */
  async createRequirement(requirement: CreateRequirementRequest): Promise<ApiResponse<Requirement>> {
    try {
      const response = await apiClient.post<Requirement>(this.baseUrl, requirement);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error creating requirement:', error);
      throw error;
    }
  }

  /**
   * Get requirement by ID
   */
  async getRequirementById(id: string): Promise<ApiResponse<Requirement>> {
    try {
      const response = await apiClient.get<Requirement>(`${this.baseUrl}/${id}`);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error fetching requirement:', error);
      throw error;
    }
  }

  /**
   * Get all requirements
   */
  async getAllRequirements(): Promise<ApiResponse<Requirement[]>> {
    try {
      const response = await apiClient.get<Requirement[]>(this.baseUrl);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error fetching requirements:', error);
      throw error;
    }
  }

  /**
   * Get requirements by project ID
   */
  async getRequirementsByProjectId(projectId: string): Promise<ApiResponse<Requirement[]>> {
    try {
      const response = await apiClient.get<Requirement[]>(`${this.baseUrl}/project/${projectId}`);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error fetching requirements by project:', error);
      throw error;
    }
  }

  /**
   * Get requirements by project ID and status
   */
  async getRequirementsByProjectIdAndStatus(
    projectId: string, 
    status: string
  ): Promise<ApiResponse<Requirement[]>> {
    try {
      const response = await apiClient.get<Requirement[]>(`${this.baseUrl}/project/${projectId}/status/${status}`);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error fetching requirements by project and status:', error);
      throw error;
    }
  }

  /**
   * Update an existing requirement
   */
  async updateRequirement(id: string, requirement: Partial<Requirement>): Promise<ApiResponse<Requirement>> {
    try {
      const response = await apiClient.put<Requirement>(`${this.baseUrl}/${id}`, requirement);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error updating requirement:', error);
      throw error;
    }
  }

  /**
   * Delete a requirement
   */
  async deleteRequirement(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`);
      return {
        data: undefined as any,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error deleting requirement:', error);
      throw error;
    }
  }

  /**
   * Create multiple requirements for a project
   */
  async createRequirementsForProject(
    projectId: string, 
    requirements: CreateRequirementRequest[]
  ): Promise<ApiResponse<Requirement[]>> {
    try {
      const response = await apiClient.post<Requirement[]>(`${this.baseUrl}/project/${projectId}/batch`, requirements);
      return {
        data: response.data,
        status: response.status,
        success: true
      };
    } catch (error: any) {
      console.error('Error creating requirements for project:', error);
      throw error;
    }
  }
}

export const requirementApiService = new RequirementApiService();
