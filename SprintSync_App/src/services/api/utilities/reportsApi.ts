import { apiClient, ApiResponse, PaginationParams } from '../client';
import { API_ENDPOINTS } from '../config';
import { ChartData } from '../../../types/api';

// Reports API Service
export class ReportsApiService {
  // Get project reports
  async getProjectReports(projectId: string, reportType?: string, params?: PaginationParams): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/projects/${projectId}`, {
      ...params,
      reportType,
    });
  }

  // Get sprint reports
  async getSprintReports(sprintId: string, reportType?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/sprints/${sprintId}`, { reportType });
  }

  // Get team performance reports
  async getTeamPerformanceReports(projectId?: string, userId?: string, period?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/team-performance`, {
      projectId,
      userId,
      period,
    });
  }

  // Get velocity reports
  async getVelocityReports(projectId?: string, sprintCount?: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/velocity`, {
      projectId,
      sprintCount,
    });
  }

  // Get burndown reports
  async getBurndownReports(sprintId: string): Promise<ApiResponse<ChartData[]>> {
    return apiClient.get<ChartData[]>(`${API_ENDPOINTS.REPORTS}/burndown/${sprintId}`);
  }

  // Get time tracking reports
  async getTimeTrackingReports(userId?: string, projectId?: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/time-tracking`, {
      userId,
      projectId,
      startDate,
      endDate,
    });
  }

  // Get productivity reports
  async getProductivityReports(userId?: string, projectId?: string, period?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/productivity`, {
      userId,
      projectId,
      period,
    });
  }

  // Get quality reports
  async getQualityReports(projectId?: string, releaseId?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/quality`, {
      projectId,
      releaseId,
    });
  }

  // Get risk reports
  async getRiskReports(projectId?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/risk`, projectId ? { projectId } : undefined);
  }

  // Get milestone reports
  async getMilestoneReports(projectId?: string, status?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/milestones`, {
      projectId,
      status,
    });
  }

  // Get release reports
  async getReleaseReports(projectId?: string, status?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/releases`, {
      projectId,
      status,
    });
  }

  // Get resource utilization reports
  async getResourceUtilizationReports(projectId?: string, period?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/resource-utilization`, {
      projectId,
      period,
    });
  }

  // Export resource utilization (resource performance) to Excel
  async exportResourceUtilizationToExcel(filters?: {
    projectName?: string;
    userKey?: string;
    sprint?: string;
    duration?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Blob> {
    const params: any = {};
    if (filters?.projectName) params.projectName = filters.projectName;
    if (filters?.userKey) params.userKey = filters.userKey;
    if (filters?.sprint) params.sprint = filters.sprint;
    if (filters?.duration && filters.duration !== 'all') params.duration = filters.duration;
    if (filters?.fromDate) params.fromDate = filters.fromDate;
    if (filters?.toDate) params.toDate = filters.toDate;

    const endpoint = `${API_ENDPOINTS.REPORTS}/export/resource-utilization/excel`;
    return apiClient.download(endpoint, Object.keys(params).length > 0 ? params : undefined);
  }

  // Get budget reports
  async getBudgetReports(projectId?: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/budget`, projectId ? { projectId } : undefined);
  }

  // Get custom reports
  async getCustomReports(reportId: string, filters?: any): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/custom/${reportId}`, filters);
  }

  // Export report data
  async exportReport(reportType: string, format: 'pdf' | 'excel' | 'csv', filters?: any): Promise<ApiResponse<Blob>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.REPORTS}/export`, {
      reportType,
      format,
      ...filters,
    });

    // Convert response to blob for download
    return {
      ...response,
      data: new Blob([response.data], { type: `application/${format}` }),
    };
  }

  // Get report templates
  async getReportTemplates(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.REPORTS}/templates`);
  }

  // Create custom report template
  async createReportTemplate(template: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.REPORTS}/templates`, template);
  }

  // Schedule report generation
  async scheduleReport(reportConfig: any): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`${API_ENDPOINTS.REPORTS}/schedule`, reportConfig);
  }

  // Get scheduled reports
  async getScheduledReports(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.REPORTS}/scheduled`);
  }

  // Get bug report data
  async getBugReport(projectId?: string): Promise<ApiResponse<any[]>> {
    if (projectId) {
      return apiClient.get<any[]>(`${API_ENDPOINTS.REPORTS}/bug-report/project/${projectId}`);
    }
    return apiClient.get<any[]>(`${API_ENDPOINTS.REPORTS}/bug-report`);
  }

  // Export bug report to Excel
  async exportBugReportToExcel(projectId?: string, sprintId?: string): Promise<Blob> {
    const params: any = {};
    if (projectId) params.projectId = projectId;
    if (sprintId) params.sprintId = sprintId;

    const endpoint = `${API_ENDPOINTS.REPORTS}/export/bug-report/excel`;
    console.log('🔵 EXPORT DEBUG - Full endpoint path:', endpoint);
    console.log('🔵 EXPORT DEBUG - API_ENDPOINTS.REPORTS:', API_ENDPOINTS.REPORTS);
    console.log('🔵 EXPORT DEBUG - Params:', params);

    return apiClient.download(endpoint, Object.keys(params).length > 0 ? params : undefined);
  }
}

// Export singleton instance
export const reportsApiService = new ReportsApiService();
