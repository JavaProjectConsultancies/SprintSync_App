import apiClient from '../client';
import { Story, Page } from '../../types/api';

const BASE_URL = '/stories';

export const storyApiService = {
  // Basic CRUD operations
  createStory: (story: Story) => 
    apiClient.post<Story>(BASE_URL, story),
  
  getStoryById: (id: string) => 
    apiClient.get<Story>(`${BASE_URL}/${id}`),
  
  getStories: (params?: any) => 
    apiClient.get<Page<Story>>(BASE_URL, { params }),
  
  getAllStories: () => 
    apiClient.get<Story[]>(`${BASE_URL}/all`),
  
  updateStory: (id: string, story: Partial<Story>) => 
    apiClient.put<Story>(`${BASE_URL}/${id}`, story),
  
  deleteStory: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Project-specific operations
  getStoriesByProject: (projectId: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/project/${projectId}`, { params }),

  // Sprint-specific operations
  getStoriesBySprint: (sprintId: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/sprint/${sprintId}`, { params }),

  // Epic-specific operations
  getStoriesByEpic: (epicId: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/epic/${epicId}`, { params }),

  // Search and filter operations
  searchStories: (query: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/search`, { 
      params: { ...params, query } 
    }),

  // Status operations
  updateStoryStatus: (id: string, status: string) => 
    apiClient.patch<Story>(`${BASE_URL}/${id}/status`, null, { 
      params: { status } 
    }),

  getStoriesByStatus: (status: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/status/${status}`, { params }),

  // Assignee operations
  updateStoryAssignee: (id: string, assigneeId: string) => 
    apiClient.patch<Story>(`${BASE_URL}/${id}/assignee`, null, { 
      params: { assigneeId } 
    }),

  getStoriesByAssignee: (assigneeId: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/assignee/${assigneeId}`, { params }),

  // Priority operations
  getStoriesByPriority: (priority: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/priority/${priority}`, { params }),

  // Date operations
  getStoriesByDateRange: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/date-range`, { 
      params: { ...params, startDate, endDate } 
    }),

  getOverdueStories: (params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/overdue`, { params }),

  getStoriesDueSoon: (days: number = 7, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/due-soon`, { 
      params: { ...params, days } 
    }),

  // Statistics
  getStoryStatistics: (id: string) => 
    apiClient.get<any>(`${BASE_URL}/${id}/statistics`),
};
