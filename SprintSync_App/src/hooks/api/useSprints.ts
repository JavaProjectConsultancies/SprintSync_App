import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import { 
  sprintApiService, 
  Sprint, 
  ApiResponse, 
  PaginationParams 
} from '../../services/api';

// Hook for fetching all sprints
export function useSprints(params?: PaginationParams) {
  return useApi(
    () => sprintApiService.getSprints(params),
    [JSON.stringify(params)]
  );
}

// Hook for fetching a single sprint
export function useSprint(id: string) {
  return useApi(
    () => sprintApiService.getSprintById(id),
    [id]
  );
}

// Hook for creating a sprint
export function useCreateSprint() {
  return useApiMutation<Sprint, Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>>(
    (sprint) => sprintApiService.createSprint(sprint)
  );
}

// Hook for updating a sprint
export function useUpdateSprint() {
  return useApiMutation<Sprint, { id: string; sprint: Partial<Sprint> }>(
    ({ id, sprint }) => sprintApiService.updateSprint(id, sprint)
  );
}

// Hook for deleting a sprint
export function useDeleteSprint() {
  return useApiMutation<void, string>(
    (id) => sprintApiService.deleteSprint(id)
  );
}

// Hook for paginated sprints
export function usePaginatedSprints(initialParams?: PaginationParams) {
  return usePaginatedApi<Sprint>(
    (params) => sprintApiService.getSprints(params),
    initialParams
  );
}

// Hook for searching sprints
export function useSearchSprints() {
  return useSearchApi<Sprint>(
    (query, params) => sprintApiService.searchSprints(query, undefined, params)
  );
}

// Hook for sprints by project
export function useSprintsByProject(projectId: string, params?: PaginationParams) {
  return useApi(
    () => sprintApiService.getSprintsByProject(projectId, params),
    [projectId, JSON.stringify(params)]
  );
}

// Hook for sprints by status
export function useSprintsByStatus(status: string, params?: PaginationParams) {
  return useApi(
    () => sprintApiService.getSprintsByStatus(status, params),
    [status, JSON.stringify(params)]
  );
}

// Hook for current sprint
export function useCurrentSprint(projectId: string) {
  return useApi(
    () => sprintApiService.getCurrentSprint(projectId),
    [projectId]
  );
}

// Hook for active sprints
export function useActiveSprints(params?: PaginationParams) {
  return useApi(
    () => sprintApiService.getActiveSprints(params),
    [JSON.stringify(params)]
  );
}

// Hook for updating sprint status
export function useUpdateSprintStatus() {
  return useApiMutation<Sprint, { id: string; status: string }>(
    ({ id, status }) => sprintApiService.updateSprintStatus(id, status)
  );
}

// Hook for sprint statistics
export function useSprintStatistics(id: string) {
  return useApi(
    () => sprintApiService.getSprintStatistics(id),
    [id]
  );
}

// Hook for sprint velocity
export function useSprintVelocity(id: string) {
  return useApi(
    () => sprintApiService.getSprintVelocity(id),
    [id]
  );
}

// Hook for sprint burndown
export function useSprintBurndown(id: string) {
  return useApi(
    () => sprintApiService.getSprintBurndown(id),
    [id]
  );
}

// Hook for sprint capacity
export function useSprintCapacity(id: string) {
  return useApi(
    () => sprintApiService.getSprintCapacity(id),
    [id]
  );
}

// Hook for copying sprint
export function useCopySprint() {
  return useApiMutation<Sprint, { id: string; newSprintData: Partial<Sprint> }>(
    ({ id, newSprintData }) => sprintApiService.copySprint(id, newSprintData)
  );
}
