import apiClient from '../client';
import { Issue } from '../../../types/api';

const BASE_URL = '/issues';

export const issueApiService = {
  // Basic CRUD operations
  createIssue: (issue: Issue) => 
    apiClient.post<Issue>(BASE_URL, issue),
  
  getIssueById: (id: string) => 
    apiClient.get<Issue>(`${BASE_URL}/${id}`),
  
  getIssues: (params?: any) => 
    apiClient.get<Issue[]>(BASE_URL, { params }),
  
  getAllIssues: () => 
    apiClient.get<Issue[]>(`${BASE_URL}/all`),
  
  updateIssue: (id: string, issue: Partial<Issue>) => 
    apiClient.put<Issue>(`${BASE_URL}/${id}`, issue),
  
  deleteIssue: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Story-specific operations
  getIssuesByStory: (storyId: string, params?: any) => 
    apiClient.get<Issue[]>(`${BASE_URL}/story/${storyId}`, { params }),

  // Status operations
  updateIssueStatus: (id: string, status: string) => {
    console.log('updateIssueStatus called with:', { id, status });
    console.log('Sending body:', { status });
    return apiClient.patch<Issue>(`${BASE_URL}/${id}/status`, { status });
  },

  getIssuesByStatus: (status: string, params?: any) => 
    apiClient.get<Issue[]>(`${BASE_URL}/status/${status}`, { params }),

  // Assignee operations
  updateIssueAssignee: (id: string, assigneeId: string) => 
    apiClient.patch<Issue>(`${BASE_URL}/${id}/assignee`, { assigneeId }),

  getIssuesByAssignee: (assigneeId: string, params?: any) => 
    apiClient.get<Issue[]>(`${BASE_URL}/assignee/${assigneeId}`, { params }),
};

