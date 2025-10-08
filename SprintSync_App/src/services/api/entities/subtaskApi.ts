import apiClient from '../client';
import { Subtask, Page } from '../../types/api';

const BASE_URL = '/subtasks';

export const subtaskApiService = {
  // Basic CRUD operations
  createSubtask: (subtask: Subtask) => 
    apiClient.post<Subtask>(BASE_URL, subtask),
  
  getSubtaskById: (id: string) => 
    apiClient.get<Subtask>(`${BASE_URL}/${id}`),
  
  getSubtasks: (params?: any) => 
    apiClient.get<Page<Subtask>>(BASE_URL, { params }),
  
  getAllSubtasks: () => 
    apiClient.get<Subtask[]>(`${BASE_URL}/all`),
  
  updateSubtask: (id: string, subtask: Partial<Subtask>) => 
    apiClient.put<Subtask>(`${BASE_URL}/${id}`, subtask),
  
  deleteSubtask: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Task-specific operations
  getSubtasksByTask: (taskId: string, params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/task/${taskId}`, { params }),

  // Search and filter operations
  searchSubtasks: (query: string, params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/search`, { 
      params: { ...params, query } 
    }),

  // Completion operations
  updateSubtaskCompletion: (id: string, isCompleted: boolean) => 
    apiClient.patch<Subtask>(`${BASE_URL}/${id}/completion`, { 
      isCompleted 
    }),

  getSubtasksByCompletion: (isCompleted: boolean, params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/status/${isCompleted}`, { params }),

  // Assignee operations
  updateSubtaskAssignee: (id: string, assigneeId: string) => 
    apiClient.patch<Subtask>(`${BASE_URL}/${id}/assignee`, null, { 
      params: { assigneeId } 
    }),

  getSubtasksByAssignee: (assigneeId: string, params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/assignee/${assigneeId}`, { params }),

  // Date operations
  getSubtasksByDateRange: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/date-range`, { 
      params: { ...params, startDate, endDate } 
    }),

  getOverdueSubtasks: (params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/overdue`, { params }),

  getSubtasksDueSoon: (days: number = 7, params?: any) => 
    apiClient.get<Subtask[]>(`${BASE_URL}/due-soon`, { 
      params: { ...params, days } 
    }),

  // Bulk operations
  bulkUpdateSubtaskCompletion: (subtaskIds: string[], isCompleted: boolean) => 
    apiClient.patch<Subtask[]>(`${BASE_URL}/bulk/completion`, { 
      subtaskIds, isCompleted 
    }),

  // Time tracking
  logTime: (id: string, hours: number, description?: string) => 
    apiClient.patch<Subtask>(`${BASE_URL}/${id}/time`, { 
      hours, description 
    }),

  // Statistics
  getSubtaskStatistics: (id: string) => 
    apiClient.get<any>(`${BASE_URL}/${id}/statistics`),
};
