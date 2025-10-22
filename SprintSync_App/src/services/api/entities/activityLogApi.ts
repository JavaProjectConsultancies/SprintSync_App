import apiClient from '../client';
import { ActivityLog, Page } from '../../../types/api';

const BASE_URL = '/activity-logs';

export const activityLogApiService = {
  // Basic CRUD operations
  createActivityLog: (activityLog: Omit<ActivityLog, 'id' | 'createdAt'>) => 
    apiClient.post<ActivityLog>(BASE_URL, activityLog),
  
  getActivityLogById: (id: string) => 
    apiClient.get<ActivityLog>(`${BASE_URL}/${id}`),
  
  getActivityLogs: (params?: any) => 
    apiClient.get<Page<ActivityLog>>(BASE_URL, { params }),
  
  deleteActivityLog: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Entity-specific operations
  getActivityLogsByEntity: (entityType: string, entityId: string) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/entity/${entityType}/${entityId}`),

  getActivityLogsByEntityPaginated: (entityType: string, entityId: string, params?: any) => 
    apiClient.get<Page<ActivityLog>>(`${BASE_URL}/entity/${entityType}/${entityId}/paginated`, { params }),

  // User-specific operations
  getActivityLogsByUser: (userId: string) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/user/${userId}`),

  getActivityLogsByUserPaginated: (userId: string, params?: any) => 
    apiClient.get<Page<ActivityLog>>(`${BASE_URL}/user/${userId}/paginated`, { params }),

  // Type-specific operations
  getActivityLogsByEntityType: (entityType: string) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/type/${entityType}`),

  getActivityLogsByEntityTypePaginated: (entityType: string, params?: any) => 
    apiClient.get<Page<ActivityLog>>(`${BASE_URL}/type/${entityType}/paginated`, { params }),

  // Action-specific operations
  getActivityLogsByAction: (action: string) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/action/${action}`),

  // Date range operations
  getActivityLogsByDateRange: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/date-range`, { 
      params: { ...params, startDate, endDate } 
    }),

  getActivityLogsByDateRangePaginated: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<Page<ActivityLog>>(`${BASE_URL}/date-range/paginated`, { 
      params: { ...params, startDate, endDate } 
    }),

  // Recent activity operations
  getRecentActivityByUser: (userId: string, days: number = 7) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/user/${userId}/recent`, { 
      params: { days } 
    }),

  getRecentActivityByEntity: (entityType: string, entityId: string, days: number = 7) => 
    apiClient.get<ActivityLog[]>(`${BASE_URL}/entity/${entityType}/${entityId}/recent`, { 
      params: { days } 
    }),

  // Count operations
  countActivityLogsByEntity: (entityType: string, entityId: string) => 
    apiClient.get<number>(`${BASE_URL}/entity/${entityType}/${entityId}/count`),

  countActivityLogsByUser: (userId: string) => 
    apiClient.get<number>(`${BASE_URL}/user/${userId}/count`),

  // Statistics
  getActivityLogStatistics: () => 
    apiClient.get<any>(`${BASE_URL}/statistics`),
};

