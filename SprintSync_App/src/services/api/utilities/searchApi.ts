import { apiClient, ApiResponse, PaginationParams } from '../client';
import { API_ENDPOINTS } from '../config';
import { SearchFilters } from '../../../types/api';

// Search API Service
export class SearchApiService {
  // Global search across all entities
  async globalSearch(query: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/global`, {
      ...params,
      query,
      entityType,
    });
  }

  // Search projects
  async searchProjects(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/projects`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search sprints
  async searchSprints(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/sprints`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search stories
  async searchStories(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/stories`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search tasks
  async searchTasks(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/tasks`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search subtasks
  async searchSubtasks(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/subtasks`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search epics
  async searchEpics(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/epics`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search releases
  async searchReleases(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/releases`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Search users
  async searchUsers(query: string, filters?: SearchFilters, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/users`, {
      ...params,
      query,
      ...filters,
    });
  }

  // Advanced search with multiple criteria
  async advancedSearch(searchCriteria: any, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.SEARCH}/advanced`, searchCriteria, params);
  }

  // Search by project ID
  async searchByProjectId(projectId: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/project/${projectId}`, {
      ...params,
      entityType,
    });
  }

  // Search by story ID
  async searchByStoryId(storyId: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/story/${storyId}`, {
      ...params,
      entityType,
    });
  }

  // Search by sprint ID
  async searchBySprintId(sprintId: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/sprint/${sprintId}`, {
      ...params,
      entityType,
    });
  }

  // Search by assignee
  async searchByAssignee(assigneeId: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/assignee/${assigneeId}`, {
      ...params,
      entityType,
    });
  }

  // Search by date range
  async searchByDateRange(startDate: string, endDate: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/date-range`, {
      ...params,
      startDate,
      endDate,
      entityType,
    });
  }

  // Search by status
  async searchByStatus(status: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/status/${status}`, {
      ...params,
      entityType,
    });
  }

  // Search by priority
  async searchByPriority(priority: string, entityType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/priority/${priority}`, {
      ...params,
      entityType,
    });
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, entityType?: string): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${API_ENDPOINTS.SEARCH}/suggestions`, {
      query,
      entityType,
    });
  }

  // Get search history
  async getSearchHistory(userId?: string, limit?: number): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${API_ENDPOINTS.SEARCH}/history`, {
      userId,
      limit,
    });
  }

  // Save search query
  async saveSearchQuery(query: string, filters?: any, userId?: string): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.SEARCH}/save`, {
      query,
      filters,
      userId,
    });
  }

  // Get saved searches
  async getSavedSearches(userId?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.SEARCH}/saved`, userId ? { userId } : undefined);
  }

  // Delete saved search
  async deleteSavedSearch(searchId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.SEARCH}/saved/${searchId}`);
  }

  // Get search statistics
  async getSearchStatistics(entityType?: string, period?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SEARCH}/statistics`, {
      entityType,
      period,
    });
  }
}

// Export singleton instance
export const searchApiService = new SearchApiService();
