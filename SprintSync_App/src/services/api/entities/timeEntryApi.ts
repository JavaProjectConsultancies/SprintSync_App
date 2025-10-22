import apiClient from '../client';
import { TimeEntry, Page } from '../../../types/api';

const BASE_URL = '/time-entries';

export const timeEntryApiService = {
  // Basic CRUD operations
  createTimeEntry: (timeEntry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<TimeEntry>(BASE_URL, timeEntry),
  
  getTimeEntryById: (id: string) => 
    apiClient.get<TimeEntry>(`${BASE_URL}/${id}`),
  
  getTimeEntries: (params?: any) => 
    apiClient.get<Page<TimeEntry>>(BASE_URL, { params }),
  
  getAllTimeEntries: () => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/all`),
  
  updateTimeEntry: (id: string, timeEntry: Partial<TimeEntry>) => 
    apiClient.put<TimeEntry>(`${BASE_URL}/${id}`, timeEntry),
  
  deleteTimeEntry: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Task-specific operations
  getTimeEntriesByTask: (taskId: string, params?: any) => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/task/${taskId}`, { params }),

  // Subtask-specific operations
  getTimeEntriesBySubtask: (subtaskId: string, params?: any) => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/subtask/${subtaskId}`, { params }),

  // User-specific operations
  getTimeEntriesByUser: (userId: string, params?: any) => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/user/${userId}`, { params }),

  // Project-specific operations
  getTimeEntriesByProject: (projectId: string, params?: any) => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/project/${projectId}`, { params }),

  // Story-specific operations
  getTimeEntriesByStory: (storyId: string, params?: any) => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/story/${storyId}`, { params }),

  // Date range operations
  getTimeEntriesByDateRange: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<TimeEntry[]>(`${BASE_URL}/date-range`, { 
      params: { ...params, startDate, endDate } 
    }),

  // Statistics
  getTimeEntryStatistics: (taskId: string) => 
    apiClient.get<any>(`${BASE_URL}/task/${taskId}/statistics`),
};

