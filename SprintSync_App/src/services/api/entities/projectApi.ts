import { apiClient, ApiResponse, PaginationParams } from '../client';
import { API_ENDPOINTS } from '../config';
import { Project, Epic, Release } from '../../../types/api';

// Project API Service
export class ProjectApiService {
  // Get all projects (with pagination support)
  async getProjects(params?: PaginationParams): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<any>(API_ENDPOINTS.PROJECTS, params);
    
    // Backend returns { content: [...], totalElements: ..., ... }
    let normalized: Project[] = [];
    if (Array.isArray(response.data)) {
      normalized = response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.content)) {
      normalized = response.data.content;
    } else if (response.data?.content && Array.isArray(response.data.content)) {
      normalized = response.data.content;
    }
    
    return { ...response, data: normalized } as ApiResponse<Project[]>;
  }

  // Get all projects without pagination
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.PROJECTS}/all`);
    
    // Backend returns { content: [...], totalElements: ..., ... }
    let normalized: Project[] = [];
    if (Array.isArray(response.data)) {
      normalized = response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.content)) {
      normalized = response.data.content;
    } else if (response.data?.content && Array.isArray(response.data.content)) {
      normalized = response.data.content;
    }
    
    return { ...response, data: normalized } as ApiResponse<Project[]>;
  }

  async getAccessibleProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.PROJECTS}/accessible`);

    let normalized: Project[] = [];
    if (Array.isArray(response.data)) {
      normalized = response.data;
    } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.content)) {
      normalized = response.data.content;
    }

    return { ...response, data: normalized } as ApiResponse<Project[]>;
  }

  // Get project by ID
  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`${API_ENDPOINTS.PROJECTS}/${id}`);
  }

  // Create new project
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(API_ENDPOINTS.PROJECTS, project);
  }

  // Create new project with all related entities
  async createProjectComprehensive(projectData: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.PROJECTS}/comprehensive`, projectData);
  }

  // Update project
  async updateProject(id: string, project: Partial<Project>): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(`${API_ENDPOINTS.PROJECTS}/${id}`, project);
  }

  // Delete project
  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PROJECTS}/${id}`);
  }

  // Search projects
  async searchProjects(query: string, params?: PaginationParams): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`${API_ENDPOINTS.PROJECTS}/search`, {
      ...params,
      query,
    });
  }

  // Get projects by status
  async getProjectsByStatus(status: string, params?: PaginationParams): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`${API_ENDPOINTS.PROJECTS}/status/${status}`, params);
  }

  // Get projects by created by
  async getProjectsByCreatedBy(createdBy: string, params?: PaginationParams): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`${API_ENDPOINTS.PROJECTS}/created-by/${createdBy}`, params);
  }

  // Get active projects
  async getActiveProjects(params?: PaginationParams): Promise<ApiResponse<Project[]>> {
    return apiClient.get<Project[]>(`${API_ENDPOINTS.PROJECTS}/active`, params);
  }

  // Update project status
  async updateProjectStatus(id: string, status: string): Promise<ApiResponse<Project>> {
    return apiClient.patch<Project>(`${API_ENDPOINTS.PROJECTS}/${id}/status`, { status });
  }

  // Get project statistics
  async getProjectStatistics(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.PROJECTS}/${id}/statistics`);
  }

  // Get project timeline
  async getProjectTimeline(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.PROJECTS}/${id}/timeline`);
  }
}

// Epic API Service
export class EpicApiService {
  // Get all epics
  async getEpics(params?: PaginationParams): Promise<ApiResponse<Epic[]>> {
    return apiClient.get<Epic[]>(API_ENDPOINTS.EPICS, params);
  }

  // Get epic by ID
  async getEpicById(id: string): Promise<ApiResponse<Epic>> {
    return apiClient.get<Epic>(`${API_ENDPOINTS.EPICS}/${id}`);
  }

  // Create new epic
  async createEpic(epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Epic>> {
    return apiClient.post<Epic>(API_ENDPOINTS.EPICS, epic);
  }

  // Update epic
  async updateEpic(id: string, epic: Partial<Epic>): Promise<ApiResponse<Epic>> {
    return apiClient.put<Epic>(`${API_ENDPOINTS.EPICS}/${id}`, epic);
  }

  // Delete epic
  async deleteEpic(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.EPICS}/${id}`);
  }

  // Search epics
  async searchEpics(query: string, params?: PaginationParams): Promise<ApiResponse<Epic[]>> {
    return apiClient.get<Epic[]>(`${API_ENDPOINTS.EPICS}/search`, {
      ...params,
      query,
    });
  }

  // Get epics by project
  async getEpicsByProject(projectId: string, params?: PaginationParams): Promise<ApiResponse<Epic[]>> {
    return apiClient.get<Epic[]>(`${API_ENDPOINTS.EPICS}/project/${projectId}`, params);
  }

  // Get epics by status
  async getEpicsByStatus(status: string, params?: PaginationParams): Promise<ApiResponse<Epic[]>> {
    return apiClient.get<Epic[]>(`${API_ENDPOINTS.EPICS}/status/${status}`, params);
  }

  // Get epics by priority
  async getEpicsByPriority(priority: string, params?: PaginationParams): Promise<ApiResponse<Epic[]>> {
    return apiClient.get<Epic[]>(`${API_ENDPOINTS.EPICS}/priority/${priority}`, params);
  }

  // Get active epics
  async getActiveEpics(params?: PaginationParams): Promise<ApiResponse<Epic[]>> {
    return apiClient.get<Epic[]>(`${API_ENDPOINTS.EPICS}/active`, params);
  }

  // Update epic status
  async updateEpicStatus(id: string, status: string): Promise<ApiResponse<Epic>> {
    return apiClient.patch<Epic>(`${API_ENDPOINTS.EPICS}/${id}/status`, { status });
  }
}

// Release API Service
export class ReleaseApiService {
  // Get all releases
  async getReleases(params?: PaginationParams): Promise<ApiResponse<Release[]>> {
    return apiClient.get<Release[]>(API_ENDPOINTS.RELEASES, params);
  }

  // Get release by ID
  async getReleaseById(id: string): Promise<ApiResponse<Release>> {
    return apiClient.get<Release>(`${API_ENDPOINTS.RELEASES}/${id}`);
  }

  // Create new release
  async createRelease(release: Omit<Release, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Release>> {
    return apiClient.post<Release>(API_ENDPOINTS.RELEASES, release);
  }

  // Update release
  async updateRelease(id: string, release: Partial<Release>): Promise<ApiResponse<Release>> {
    return apiClient.put<Release>(`${API_ENDPOINTS.RELEASES}/${id}`, release);
  }

  // Delete release
  async deleteRelease(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.RELEASES}/${id}`);
  }

  // Search releases
  async searchReleases(query: string, params?: PaginationParams): Promise<ApiResponse<Release[]>> {
    return apiClient.get<Release[]>(`${API_ENDPOINTS.RELEASES}/search`, {
      ...params,
      query,
    });
  }

  // Get releases by project
  async getReleasesByProject(projectId: string, params?: PaginationParams): Promise<ApiResponse<Release[]>> {
    return apiClient.get<Release[]>(`${API_ENDPOINTS.RELEASES}/project/${projectId}`, params);
  }

  // Get releases by status
  async getReleasesByStatus(status: string, params?: PaginationParams): Promise<ApiResponse<Release[]>> {
    return apiClient.get<Release[]>(`${API_ENDPOINTS.RELEASES}/status/${status}`, params);
  }

  // Get active releases
  async getActiveReleases(params?: PaginationParams): Promise<ApiResponse<Release[]>> {
    return apiClient.get<Release[]>(`${API_ENDPOINTS.RELEASES}/active`, params);
  }

  // Update release status
  async updateReleaseStatus(id: string, status: string): Promise<ApiResponse<Release>> {
    return apiClient.patch<Release>(`${API_ENDPOINTS.RELEASES}/${id}/status`, { status });
  }

  // Get upcoming releases
  async getUpcomingReleases(days: number = 30): Promise<ApiResponse<Release[]>> {
    return apiClient.get<Release[]>(`${API_ENDPOINTS.RELEASES}/upcoming`, { days });
  }
}

// Export singleton instances
export const projectApiService = new ProjectApiService();
export const epicApiService = new EpicApiService();
export const releaseApiService = new ReleaseApiService();
