import { useApi, useApiMutation, usePaginatedApi } from './useApi';
import { 
  issueApiService
} from '../../services/api/entities/issueApi';
import { Issue, ApiResponse, PaginationParams } from '../../services/api';

// Issue Hooks (similar to Task hooks)
export function useIssues(params?: PaginationParams) {
  return useApi(
    () => issueApiService.getIssues(params),
    [JSON.stringify(params)]
  );
}

export function useIssue(id: string) {
  return useApi(
    () => issueApiService.getIssueById(id),
    [id]
  );
}

export function useCreateIssue() {
  return useApiMutation<Issue, Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>>(
    (issue) => issueApiService.createIssue(issue)
  );
}

export function useUpdateIssue() {
  return useApiMutation<Issue, { id: string; issue: Partial<Issue> }>(
    ({ id, issue }) => issueApiService.updateIssue(id, issue)
  );
}

export function useDeleteIssue() {
  return useApiMutation<void, string>(
    (id) => issueApiService.deleteIssue(id)
  );
}

export function useIssuesByStory(storyId: string, params?: PaginationParams) {
  return useApi(
    () => storyId && storyId !== 'SKIP' 
      ? issueApiService.getIssuesByStory(storyId, params) 
      : Promise.resolve({ data: [] as Issue[], success: true, message: '', status: 200 } as ApiResponse<Issue[]>),
    [storyId, JSON.stringify(params)],
    !!(storyId && storyId !== 'SKIP')
  );
}

export function useIssuesByStatus(status: string, params?: PaginationParams) {
  return useApi(
    () => issueApiService.getIssuesByStatus(status, params),
    [status, JSON.stringify(params)]
  );
}

export function useIssuesByAssignee(assigneeId: string, params?: PaginationParams) {
  return useApi(
    () => issueApiService.getIssuesByAssignee(assigneeId, params),
    [assigneeId, JSON.stringify(params)]
  );
}

export function useUpdateIssueStatus() {
  return useApiMutation<Issue, { id: string; status: string }>(
    ({ id, status }) => issueApiService.updateIssueStatus(id, status)
  );
}

export function useUpdateIssueAssignee() {
  return useApiMutation<Issue, { id: string; assigneeId: string }>(
    ({ id, assigneeId }) => issueApiService.updateIssueAssignee(id, assigneeId)
  );
}

