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
    apiClient.patch<Issue>(`${BASE_URL}/${id}`, issue),

  deleteIssue: (id: string) =>
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  updateIssueTitle: (id: string, title: string) =>
    apiClient.patch<Issue>(`${BASE_URL}/${id}/title`, { title }),

  updateIssueDescription: (id: string, description: string) =>
    apiClient.patch<Issue>(`${BASE_URL}/${id}/description`, { description }),

  // Story-specific operations
  getIssuesByStory: (storyId: string, params?: any) =>
    !storyId ? Promise.resolve({ data: [] } as any) : apiClient.get<Issue[]>(`${BASE_URL}/story/${storyId}`, { params }),

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

  updateIssueActualHours: (id: string, actualHours: number) =>
    apiClient.patch<Issue>(`${BASE_URL}/${id}/actual-hours`, { actualHours }),

  updateIssueEstimatedHours: (id: string, estimatedHours: number) =>
    apiClient.patch<Issue>(`${BASE_URL}/${id}/estimated-hours`, { estimatedHours }),

  updateIssueDueDate: (id: string, dueDate: string) =>
    apiClient.patch<Issue>(`${BASE_URL}/${id}/due-date`, { dueDate }),

  // Linked tasks
  updateIssueLinkedTaskIds: (id: string, linkedTaskIds: string[]) =>
    apiClient.patch<Issue>(`${BASE_URL}/${id}/linked-tasks`, { linkedTaskIds }),

  getIssuesByAssignee: (assigneeId: string, params?: any) =>
    apiClient.get<Issue[]>(`${BASE_URL}/assignee/${assigneeId}`, { params }),
};
