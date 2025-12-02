import apiClient from '../client';
import { Story } from '../../../types/api';

const BASE_URL = '/stories';

// Helper to sanitize story data before sending to API
const sanitizeStoryData = (story: any) => {
  return {
    ...story,
    // Convert acceptanceCriteria to array if it's a string
    acceptanceCriteria: story.acceptanceCriteria 
      ? (typeof story.acceptanceCriteria === 'string' 
          ? story.acceptanceCriteria.split('\n').filter((line: string) => line.trim())
          : story.acceptanceCriteria)
      : [],
    // Convert empty strings to null for optional fields
    epicId: story.epicId || null,
    releaseId: story.releaseId || null,
    sprintId: story.sprintId || null,
    parentId: story.parentId || null,
    assigneeId: story.assigneeId || null,
    reporterId: story.reporterId || null,
    dueDate: story.dueDate || null,
    labels: (story.labels && story.labels.length > 0) ? story.labels : null,
  };
};

export const storyApiService = {
  // Basic CRUD operations
  createStory: (story: Story) => 
    apiClient.post<Story>(BASE_URL, sanitizeStoryData(story)),
  
  getStoryById: (id: string) => 
    apiClient.get<Story>(`${BASE_URL}/${id}`),
  
  getStories: (params?: any) => 
    apiClient.get<Story[]>(BASE_URL, params),
  
  getAllStories: () => 
    apiClient.get<Story[]>(`${BASE_URL}/all`),
  
  updateStory: (id: string, story: Partial<Story>) => 
    apiClient.put<Story>(`${BASE_URL}/${id}`, sanitizeStoryData(story)),
  
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
    apiClient.patch<Story>(`${BASE_URL}/${id}/status`, { status }),

  getStoriesByStatus: (status: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/status/${status}`, { params }),

  // Assignee operations
  updateStoryAssignee: (id: string, assigneeId: string) => 
    apiClient.patch<Story>(`${BASE_URL}/${id}/assignee`, { assigneeId }),

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

  // Release operations
  getStoriesByRelease: (releaseId: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/release/${releaseId}`, { params }),

  // Backlog operations
  getBacklogStories: (projectId: string, params?: any) => 
    apiClient.get<Story[]>(`${BASE_URL}/project/${projectId}/without-sprint`, { params }),

  // Sprint assignment
  moveStoryToSprint: (id: string, sprintId: string) => 
    apiClient.patch<Story>(`${BASE_URL}/${id}/move-to-sprint`, null, { sprintId }),

  // Create story from previous sprint (duplicates with new ID and copies tasks)
  createStoryFromPreviousSprint: (sourceStoryId: string, targetSprintId: string, userId: string) =>
    apiClient.post<Story>(`${BASE_URL}/from-sprint`, null, {
      sourceStoryId,
      targetSprintId,
      userId
    }),
};
