import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';
import { DashboardMetrics, ChartData } from '../../../types/api';

// Dashboard API Service
export class DashboardApiService {
  // Get dashboard metrics for user
  async getDashboardMetrics(userId?: string): Promise<ApiResponse<DashboardMetrics>> {
    return apiClient.get<DashboardMetrics>(`${API_ENDPOINTS.DASHBOARD}/metrics`, userId ? { userId } : undefined);
  }

  // Get project statistics
  async getProjectStatistics(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.DASHBOARD}/projects/${projectId}/statistics`);
  }

  // Get sprint progress data
  async getSprintProgress(projectId?: string): Promise<ApiResponse<ChartData[]>> {
    return apiClient.get<ChartData[]>(`${API_ENDPOINTS.DASHBOARD}/sprint-progress`, projectId ? { projectId } : undefined);
  }

  // Get task completion data
  async getTaskCompletion(userId?: string): Promise<ApiResponse<ChartData[]>> {
    return apiClient.get<ChartData[]>(`${API_ENDPOINTS.DASHBOARD}/task-completion`, userId ? { userId } : undefined);
  }

  // Get team performance data
  async getTeamPerformance(projectId?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/team-performance`, projectId ? { projectId } : undefined);
  }

  // Get velocity trends
  async getVelocityTrends(projectId?: string, sprintCount?: number): Promise<ApiResponse<ChartData[]>> {
    return apiClient.get<ChartData[]>(`${API_ENDPOINTS.DASHBOARD}/velocity-trends`, {
      projectId,
      sprintCount,
    });
  }

  // Get burndown chart data
  async getBurndownData(sprintId: string): Promise<ApiResponse<ChartData[]>> {
    return apiClient.get<ChartData[]>(`${API_ENDPOINTS.DASHBOARD}/burndown/${sprintId}`);
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(userId?: string, days?: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/upcoming-deadlines`, {
      userId,
      days,
    });
  }

  // Get overdue items
  async getOverdueItems(userId?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.DASHBOARD}/overdue-items`, userId ? { userId } : undefined);
  }

  // Get recent activities
  async getRecentActivities(userId?: string, limit?: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/recent-activities`, {
      userId,
      limit,
    });
  }

  // Get project health status
  async getProjectHealth(projectId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.DASHBOARD}/projects/${projectId}/health`);
  }

  // Get sprint health status
  async getSprintHealth(sprintId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.DASHBOARD}/sprints/${sprintId}/health`);
  }

  // Get workload distribution
  async getWorkloadDistribution(projectId?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/workload-distribution`, projectId ? { projectId } : undefined);
  }

  // Get risk indicators
  async getRiskIndicators(projectId?: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/risk-indicators`, projectId ? { projectId } : undefined);
  }

  // Get productivity metrics
  async getProductivityMetrics(userId?: string, period?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.DASHBOARD}/productivity-metrics`, {
      userId,
      period,
    });
  }

  // Get project timeline
  async getProjectTimeline(projectId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/projects/${projectId}/timeline`);
  }

  // Get sprint timeline
  async getSprintTimeline(sprintId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.DASHBOARD}/sprints/${sprintId}/timeline`);
  }
}

// Export singleton instance
export const dashboardApiService = new DashboardApiService();
