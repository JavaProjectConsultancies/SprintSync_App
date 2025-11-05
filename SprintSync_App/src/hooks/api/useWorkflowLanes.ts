import { useApi, useApiMutation } from './useApi';
import { workflowLaneApiService, WorkflowLane } from '../../services/api/entities/workflowLaneApi';

// Hook for fetching all workflow lanes
export function useWorkflowLanes() {
  return useApi(
    () => workflowLaneApiService.getAllLanes(),
    []
  );
}

// Hook for fetching a single workflow lane
export function useWorkflowLane(id: string) {
  return useApi(
    () => workflowLaneApiService.getLaneById(id),
    [id],
    !!id
  );
}

// Hook for fetching workflow lanes by project
export function useWorkflowLanesByProject(projectId: string) {
  return useApi(
    () => projectId && projectId !== 'SKIP' 
      ? workflowLaneApiService.getLanesByProject(projectId) 
      : Promise.resolve({ data: [] as WorkflowLane[], success: true, message: '', status: 200 }),
    [projectId],
    !!(projectId && projectId !== 'SKIP')
  );
}

// Hook for creating a workflow lane
export function useCreateWorkflowLane() {
  return useApiMutation<WorkflowLane, Partial<WorkflowLane>>(
    (lane) => workflowLaneApiService.createLane(lane)
  );
}

// Hook for updating a workflow lane
export function useUpdateWorkflowLane() {
  return useApiMutation<WorkflowLane, { id: string; lane: Partial<WorkflowLane> }>(
    ({ id, lane }) => workflowLaneApiService.updateLane(id, lane)
  );
}

// Hook for deleting a workflow lane
export function useDeleteWorkflowLane() {
  return useApiMutation<void, string>(
    (id) => workflowLaneApiService.deleteLane(id)
  );
}

// Hook for updating display order
export function useUpdateLaneDisplayOrder() {
  return useApiMutation<void, string[]>(
    (laneIds) => workflowLaneApiService.updateDisplayOrder(laneIds)
  );
}

