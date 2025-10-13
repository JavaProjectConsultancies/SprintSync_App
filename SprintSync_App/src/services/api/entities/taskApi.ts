import apiClient from '../client';
import { Task } from '../../../types/api';

const BASE_URL = '/tasks';

export const taskApiService = {
  // Basic CRUD operations
  createTask: (task: Task) => 
    apiClient.post<Task>(BASE_URL, task),
  
  getTaskById: (id: string) => 
    apiClient.get<Task>(`${BASE_URL}/${id}`),
  
  getTasks: (params?: any) => 
    apiClient.get<Task[]>(BASE_URL, { params }),
  
  getAllTasks: () => 
    apiClient.get<Task[]>(`${BASE_URL}/all`),
  
  updateTask: (id: string, task: Partial<Task>) => 
    apiClient.put<Task>(`${BASE_URL}/${id}`, task),
  
  deleteTask: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Story-specific operations
  getTasksByStory: (storyId: string, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/story/${storyId}`, { params }),

  // Search and filter operations
  searchTasks: (query: string, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/search`, { 
      params: { ...params, query } 
    }),

  // Status operations
  updateTaskStatus: (id: string, status: string) => {
    console.log('updateTaskStatus called with:', { id, status });
    console.log('Sending body:', { status });
    return apiClient.patch<Task>(`${BASE_URL}/${id}/status`, { status });
  },

  getTasksByStatus: (status: string, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/status/${status}`, { params }),

  // Assignee operations
  updateTaskAssignee: (id: string, assigneeId: string) => 
    apiClient.patch<Task>(`${BASE_URL}/${id}/assignee`, { assigneeId }),

  getTasksByAssignee: (assigneeId: string, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/assignee/${assigneeId}`, { params }),

  // Priority operations
  getTasksByPriority: (priority: string, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/priority/${priority}`, { params }),

  // Date operations
  getTasksByDateRange: (startDate: string, endDate: string, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/date-range`, { 
      params: { ...params, startDate, endDate } 
    }),

  getOverdueTasks: (params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/overdue`, { params }),

  getTasksDueSoon: (days: number = 7, params?: any) => 
    apiClient.get<Task[]>(`${BASE_URL}/due-soon`, { 
      params: { ...params, days } 
    }),

  // Time tracking
  logTime: (id: string, hours: number, description?: string) => 
    apiClient.patch<Task>(`${BASE_URL}/${id}/time`, { 
      hours, description 
    }),

  updateTaskActualHours: (id: string, actualHours: number) =>
    apiClient.patch<Task>(`${BASE_URL}/${id}/actual-hours`, { actualHours }),

  // Statistics
  getTaskStatistics: (id: string) => 
    apiClient.get<any>(`${BASE_URL}/${id}/statistics`),
};
