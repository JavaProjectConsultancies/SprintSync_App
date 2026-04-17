import { useState, useEffect } from 'react';
import { useApi, useApiMutation } from './useApi';
import { workflowLaneApiService, WorkflowLane } from '../../services/api/entities/workflowLaneApi';

// Cache for workflow lanes to support prefetching
interface WorkflowLanesCache {
  data: WorkflowLane[] | null;
  timestamp: number;
  promise: Promise<WorkflowLane[]> | null;
}

let workflowLanesCache: WorkflowLanesCache = {
  data: null,
  timestamp: 0,
  promise: null,
};

const LANES_CACHE_TTL = 300000; // 5 minutes

// Prefetch workflow lanes function
export const prefetchWorkflowLanes = async (projectId?: string): Promise<WorkflowLane[]> => {
  const now = Date.now();

  // If projectId is provided, we might want to skip the global cache or have a per-project cache.
  // For now, let's focus on the global lanes (or simple global prefetch).
  
  if (!projectId && workflowLanesCache.data && (now - workflowLanesCache.timestamp) < LANES_CACHE_TTL) {
    return workflowLanesCache.data;
  }

  if (!projectId && workflowLanesCache.promise) {
    return workflowLanesCache.promise;
  }

  const fetchPromise = (async () => {
    try {
      const response = projectId 
        ? await workflowLaneApiService.getLanesByProject(projectId)
        : await workflowLaneApiService.getAllLanes();
      
      const lanes = Array.isArray(response.data) ? response.data : [];
      
      if (!projectId) {
        workflowLanesCache = {
          data: lanes,
          timestamp: Date.now(),
          promise: null,
        };
      }
      return lanes;
    } catch (err) {
      if (!projectId) workflowLanesCache.promise = null;
      throw err;
    }
  })();

  if (!projectId) workflowLanesCache.promise = fetchPromise;
  return fetchPromise;
};

// Hook for fetching all workflow lanes
export function useWorkflowLanes() {
  const [data, setData] = useState<WorkflowLane[] | null>(workflowLanesCache.data);
  const [loading, setLoading] = useState(!workflowLanesCache.data);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadLanes = async () => {
      try {
        if (!workflowLanesCache.data || (Date.now() - workflowLanesCache.timestamp) > LANES_CACHE_TTL) {
          setLoading(true);
        }
        const lanes = await prefetchWorkflowLanes();
        setData(lanes);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadLanes();
  }, []);

  return { data, loading, error, refetch: () => {
    workflowLanesCache.data = null;
    workflowLanesCache.timestamp = 0;
    prefetchWorkflowLanes();
  }};
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

