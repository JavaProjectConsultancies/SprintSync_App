import apiClient from '../client';
import { Release, Page } from '../../types/api';

const BASE_URL = '/releases';

export const releaseApiService = {
  // Basic CRUD operations
  createRelease: (release: Release) => 
    apiClient.post<Release>(BASE_URL, release),
  
  getReleaseById: (id: string) => 
    apiClient.get<Release>(`${BASE_URL}/${id}`),
  
  getReleases: (params?: any) => 
    apiClient.get<Page<Release>>(BASE_URL, { params }),
  
  getAllReleases: () => 
    apiClient.get<Release[]>(BASE_URL),
  
  updateRelease: (id: string, release: Partial<Release>) => 
    apiClient.put<Release>(`${BASE_URL}/${id}`, release),
  
  deleteRelease: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Project-specific operations
  getReleasesByProject: (projectId: string, params?: any) => 
    apiClient.get<Release[]>(`${BASE_URL}/project/${projectId}`, { params }),

  // Search and filter operations
  searchReleases: (query: string, params?: any) => 
    apiClient.get<Release[]>(`${BASE_URL}/search`, { 
      params: { ...params, query } 
    }),

  // Status operations
  updateReleaseStatus: (id: string, status: string) => 
    apiClient.patch<Release>(`${BASE_URL}/${id}/status`, null, { 
      params: { status } 
    }),

  getReleasesByStatus: (status: string, params?: any) => 
    apiClient.get<Release[]>(`${BASE_URL}/status/${status}`, { params }),

  // Manager operations
  updateReleaseManager: (id: string, managerId: string) => 
    apiClient.patch<Release>(`${BASE_URL}/${id}/manager`, null, { 
      params: { managerId } 
    }),

  getReleasesByManager: (managerId: string, params?: any) => 
    apiClient.get<Release[]>(`${BASE_URL}/manager/${managerId}`, { params }),

  // Date operations
  getReleasesByDateRange: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<Release[]>(`${BASE_URL}/date-range`, { 
      params: { ...params, startDate, endDate } 
    }),

  getUpcomingReleases: (days: number = 30, params?: any) => 
    apiClient.get<Release[]>(`${BASE_URL}/upcoming`, { 
      params: { ...params, days } 
    }),

  // Statistics
  getReleaseStatistics: (id: string) => 
    apiClient.get<any>(`${BASE_URL}/${id}/statistics`),
};
