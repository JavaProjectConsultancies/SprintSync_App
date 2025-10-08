import apiClient from '../client';
import { Epic, Page } from '../../types/api';

const BASE_URL = '/epics';

export const epicApiService = {
  // Basic CRUD operations
  createEpic: (epic: Epic) => 
    apiClient.post<Epic>(BASE_URL, epic),
  
  getEpicById: (id: string) => 
    apiClient.get<Epic>(`${BASE_URL}/${id}`),
  
  getEpics: (params?: any) => 
    apiClient.get<Page<Epic>>(BASE_URL, { params }),
  
  getAllEpics: () => 
    apiClient.get<Epic[]>(BASE_URL),
  
  updateEpic: (id: string, epic: Partial<Epic>) => 
    apiClient.put<Epic>(`${BASE_URL}/${id}`, epic),
  
  deleteEpic: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Project-specific operations
  getEpicsByProject: (projectId: string, params?: any) => 
    apiClient.get<Epic[]>(`${BASE_URL}/project/${projectId}`, { params }),

  // Search and filter operations
  searchEpics: (query: string, params?: any) => 
    apiClient.get<Epic[]>(`${BASE_URL}/search`, { 
      params: { ...params, query } 
    }),

  // Status operations
  updateEpicStatus: (id: string, status: string) => 
    apiClient.patch<Epic>(`${BASE_URL}/${id}/status`, null, { 
      params: { status } 
    }),

  // Assignee operations
  updateEpicAssignee: (id: string, assigneeId: string) => 
    apiClient.patch<Epic>(`${BASE_URL}/${id}/assignee`, null, { 
      params: { assigneeId } 
    }),

  getEpicsByAssignee: (assigneeId: string, params?: any) => 
    apiClient.get<Epic[]>(`${BASE_URL}/assignee/${assigneeId}`, { params }),

  // Priority operations
  getEpicsByPriority: (priority: string, params?: any) => 
    apiClient.get<Epic[]>(`${BASE_URL}/priority/${priority}`, { params }),

  // Statistics
  getEpicStatistics: (id: string) => 
    apiClient.get<any>(`${BASE_URL}/${id}/statistics`),
};
