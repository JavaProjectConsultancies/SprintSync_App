import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import {
  storyApiService,
  Story,
  ApiResponse,
  PaginationParams
} from '../../services/api';

// Hook for fetching all stories
export function useStories(params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStories(params),
    [JSON.stringify(params)]
  );
}

export function useAllStories() {
  return useApi(
    () => storyApiService.getAllStories(),
    []
  );
}

// Hook for fetching a single story
export function useStory(id: string) {
  return useApi(
    () => storyApiService.getStoryById(id),
    [id]
  );
}

// Hook for creating a story
export function useCreateStory() {
  return useApiMutation<Story, Omit<Story, 'id' | 'createdAt' | 'updatedAt'>>(
    (story) => storyApiService.createStory(story as Story)
  );
}

// Hook for updating a story
export function useUpdateStory() {
  return useApiMutation<Story, { id: string; story: Partial<Story> }>(
    ({ id, story }) => storyApiService.updateStory(id, story)
  );
}

// Hook for deleting a story
export function useDeleteStory() {
  return useApiMutation<void, string>(
    (id) => storyApiService.deleteStory(id)
  );
}

// Hook for paginated stories
export function usePaginatedStories(initialParams?: PaginationParams) {
  return usePaginatedApi<Story>(
    (params) => storyApiService.getStories(params),
    initialParams
  );
}

// Hook for searching stories
export function useSearchStories() {
  return useSearchApi<Story>(
    (query, params) => storyApiService.searchStories(query, params)
  );
}

// Hook for stories by project
export function useStoriesByProject(projectId: string, params?: PaginationParams) {
  return useApi(
    () => projectId && projectId !== 'SKIP'
      ? storyApiService.getStoriesByProject(projectId, params)
      : Promise.resolve({ data: [] as Story[], success: true, message: '', status: 200 }),
    [projectId, JSON.stringify(params)],
    !!(projectId && projectId !== 'SKIP') // Only execute if projectId is valid
  );
}

// Hook for stories by sprint
export function useStoriesBySprint(sprintId: string, params?: PaginationParams) {
  return useApi(
    () => sprintId && sprintId !== 'SKIP'
      ? storyApiService.getStoriesBySprint(sprintId, params)
      : Promise.resolve({ data: [] as Story[], success: true, message: '', status: 200 }),
    [sprintId, JSON.stringify(params)],
    !!(sprintId && sprintId !== 'SKIP') // Only execute if sprintId is valid
  );
}

// Hook for stories by epic
export function useStoriesByEpic(epicId: string, params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStoriesByEpic(epicId, params),
    [epicId, JSON.stringify(params)]
  );
}

// Hook for stories by release
export function useStoriesByRelease(releaseId: string, params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStoriesByRelease(releaseId, params),
    [releaseId, JSON.stringify(params)]
  );
}

// Hook for stories by status
export function useStoriesByStatus(status: string, params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStoriesByStatus(status, params),
    [status, JSON.stringify(params)]
  );
}

// Hook for stories by priority
export function useStoriesByPriority(priority: string, params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStoriesByPriority(priority, params),
    [priority, JSON.stringify(params)]
  );
}

// Hook for stories by assignee
export function useStoriesByAssignee(assigneeId: string, params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStoriesByAssignee(assigneeId, params),
    [assigneeId, JSON.stringify(params)]
  );
}

// Hook for backlog stories
export function useBacklogStories(projectId: string, params?: PaginationParams) {
  return useApi(
    () => storyApiService.getBacklogStories(projectId, params),
    [projectId, JSON.stringify(params)]
  );
}

// Hook for updating story status
export function useUpdateStoryStatus() {
  return useApiMutation<Story, { id: string; status: string }>(
    ({ id, status }) => storyApiService.updateStoryStatus(id, status)
  );
}

// Hook for updating story assignee
export function useUpdateStoryAssignee() {
  return useApiMutation<Story, { id: string; assigneeId: string }>(
    ({ id, assigneeId }) => storyApiService.updateStoryAssignee(id, assigneeId)
  );
}

// Hook for moving story to sprint
export function useMoveStoryToSprint() {
  return useApiMutation<Story, { id: string; sprintId: string }>(
    ({ id, sprintId }) => storyApiService.moveStoryToSprint(id, sprintId)
  );
}
