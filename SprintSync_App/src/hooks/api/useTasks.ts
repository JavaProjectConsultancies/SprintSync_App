import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import {
  taskApiService,
  subtaskApiService,
  Task,
  Subtask,
  ApiResponse,
  PaginationParams
} from '../../services/api';
import {
  createEntityCache,
  normalizeApiData,
  getPersistentCache,
  setPersistentCache,
  clearPersistentCache,
  invalidateEntityCache,
  isCacheFresh,
  isCacheValid,
  EntityCache,
  DEFAULT_CACHE_CONFIG,
} from './cacheUtils';

// Cache configuration for tasks
const CACHE_CONFIG = {
  ...DEFAULT_CACHE_CONFIG,
  cacheKey: 'sprintsync_tasks_cache',
};

// Module-level cache for tasks
let tasksCache: EntityCache<Task> = createEntityCache<Task>();

/**
 * Invalidate tasks cache - can be called from outside
 */
export const invalidateTasksCache = (userId?: string) => {
  tasksCache = invalidateEntityCache(tasksCache, CACHE_CONFIG.cacheKey, userId);
};

/**
 * Prefetch tasks - can be called to warm up cache
 */
export const prefetchTasks = async (userId?: string): Promise<Task[]> => {
  const now = Date.now();

  // Check persistent cache first (fastest)
  const persistentData = getPersistentCache<Task>(
    CACHE_CONFIG.cacheKey,
    userId || null,
    CACHE_CONFIG.persistentCacheTTL
  );
  if (persistentData) {
    tasksCache = {
      data: persistentData,
      timestamp: now,
      promise: null,
      userId: userId || null,
      abortController: null,
    };
    return persistentData;
  }

  // Check if we have fresh cache for this user
  if (
    tasksCache.data &&
    tasksCache.userId === userId &&
    isCacheFresh(tasksCache.timestamp, CACHE_CONFIG.staleTime)
  ) {
    return tasksCache.data;
  }

  // Cancel any pending request if user changed
  if (tasksCache.abortController && tasksCache.userId !== userId) {
    tasksCache.abortController.abort();
    tasksCache.abortController = null;
  }

  // If there's already a pending request for same user, wait for it
  if (tasksCache.promise && tasksCache.userId === userId) {
    try {
      return await tasksCache.promise;
    } catch (err) {
      // Continue with new fetch if pending request failed
    }
  }

  // Create abort controller for request cancellation
  const abortController = new AbortController();

  // Create prefetch promise
  const prefetchPromise = (async () => {
    try {
      const response = await taskApiService.getAllTasks();
      const tasksData = normalizeApiData<Task>(response.data);

      const cacheData = {
        data: tasksData,
        timestamp: now,
        promise: null,
        userId: userId || null,
        abortController: null,
      };
      tasksCache = cacheData;
      setPersistentCache(CACHE_CONFIG.cacheKey, tasksData, userId || null);

      return tasksData;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      tasksCache.promise = null;
      tasksCache.abortController = null;
      throw err;
    }
  })();

  tasksCache.promise = prefetchPromise;
  tasksCache.abortController = abortController;
  tasksCache.userId = userId || null;

  try {
    return await prefetchPromise;
  } catch (err) {
    tasksCache.promise = null;
    tasksCache.abortController = null;
    throw err;
  }
};

/**
 * Hook for fetching all tasks with caching
 */
export function useAllTasks() {
  // Initialize from persistent cache immediately (synchronous, instant)
  const persistentData = getPersistentCache<Task>(
    CACHE_CONFIG.cacheKey,
    tasksCache.userId,
    CACHE_CONFIG.persistentCacheTTL
  );
  const initialData = persistentData || tasksCache.data;

  const [data, setData] = useState<Task[] | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const backgroundRefreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (backgroundRefreshTimeoutRef.current) {
        clearTimeout(backgroundRefreshTimeoutRef.current);
      }
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
    };
  }, []);

  const fetchTasks = useCallback(async (skipCache: boolean = false) => {
    const now = Date.now();

    // Check persistent cache first (fastest - synchronous)
    if (!skipCache) {
      const persistent = getPersistentCache<Task>(
        CACHE_CONFIG.cacheKey,
        tasksCache.userId,
        CACHE_CONFIG.persistentCacheTTL
      );
      if (persistent) {
        tasksCache.data = persistent;
        tasksCache.timestamp = now;
        if (isMountedRef.current) {
          setData(persistent);
          setLoading(false);
        }

        // Background refresh if data is stale but still valid
        if (!isCacheFresh(tasksCache.timestamp, CACHE_CONFIG.staleTime) && !backgroundRefreshTimeoutRef.current) {
          backgroundRefreshTimeoutRef.current = setTimeout(() => {
            fetchTasks(true).catch(() => {
              // Silently fail background refresh
            });
            backgroundRefreshTimeoutRef.current = null;
          }, 100);
        }

        return persistent;
      }
    }

    // Check memory cache (unless skipCache is true)
    if (!skipCache && tasksCache.data && isCacheValid(tasksCache.timestamp, CACHE_CONFIG.cacheTTL)) {
      if (isMountedRef.current) {
        setData(tasksCache.data);
        setLoading(false);
      }

      // Background refresh if data is stale but still valid
      if (!isCacheFresh(tasksCache.timestamp, CACHE_CONFIG.staleTime) && !backgroundRefreshTimeoutRef.current) {
        backgroundRefreshTimeoutRef.current = setTimeout(() => {
          fetchTasks(true).catch(() => {
            // Silently fail background refresh
          });
          backgroundRefreshTimeoutRef.current = null;
        }, 100);
      }

      return tasksCache.data;
    }

    // Cancel any pending request
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    // If there's already a pending request, wait for it
    if (tasksCache.promise) {
      try {
        const cachedData = await tasksCache.promise;
        if (isMountedRef.current) {
          setData(cachedData);
          setLoading(false);
        }
        return cachedData;
      } catch (err) {
        // If the pending request failed, continue with new fetch
      }
    }

    // Create abort controller
    const abortController = new AbortController();
    fetchAbortRef.current = abortController;

    // Create new fetch promise
    const fetchPromise = (async () => {
      try {
        if (isMountedRef.current) {
          setLoading(true);
          setError(null);
        }

        const response = await taskApiService.getAllTasks();
        const tasksData = normalizeApiData<Task>(response.data);

        // Update cache
        const cacheData = {
          data: tasksData,
          timestamp: now,
          promise: null,
          userId: tasksCache.userId,
          abortController: null,
        };
        tasksCache = cacheData;
        setPersistentCache(CACHE_CONFIG.cacheKey, tasksData, tasksCache.userId);

        if (isMountedRef.current) {
          setData(tasksData);
          setLoading(false);
        }

        return tasksData;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        tasksCache.promise = null;
        tasksCache.abortController = null;
        const errorMessage = err?.message || 'Failed to fetch tasks';
        if (isMountedRef.current) {
          setError(new Error(errorMessage));
          setLoading(false);
        }
        throw err;
      }
    })();

    tasksCache.promise = fetchPromise;
    tasksCache.abortController = abortController;

    try {
      return await fetchPromise;
    } catch (err) {
      tasksCache.promise = null;
      tasksCache.abortController = null;
      throw err;
    } finally {
      fetchAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchTasks(true),
    execute: () => fetchTasks(true),
  };
}

// Task Hooks (original hooks without caching for specific use cases)
export function useTasks(params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasks(params),
    [JSON.stringify(params)]
  );
}

export function useTask(id: string) {
  return useApi(
    () => taskApiService.getTaskById(id),
    [id]
  );
}

export function useCreateTask() {
  return useApiMutation<Task, Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>(
    async (task) => {
      const response = await taskApiService.createTask(task as Task);
      // Invalidate cache to trigger refresh
      invalidateTasksCache();
      return response;
    }
  );
}

export function useUpdateTask() {
  return useApiMutation<Task, { id: string; task: Partial<Task> }>(
    async ({ id, task }) => {
      const response = await taskApiService.updateTask(id, task);
      // Invalidate cache to trigger refresh
      invalidateTasksCache();
      return response;
    }
  );
}

export function useDeleteTask() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await taskApiService.deleteTask(id);
      // Invalidate cache to trigger refresh
      invalidateTasksCache();
      return response;
    }
  );
}

export function usePaginatedTasks(initialParams?: PaginationParams) {
  return usePaginatedApi<Task>(
    (params) => taskApiService.getTasks(params),
    initialParams
  );
}

export function useSearchTasks() {
  return useSearchApi<Task>(
    (query, params) => taskApiService.searchTasks(query, params)
  );
}

export function useTasksByStory(storyId: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByStory(storyId, params),
    [storyId, JSON.stringify(params)]
  );
}

export function useTasksByStatus(status: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByStatus(status, params),
    [status, JSON.stringify(params)]
  );
}

export function useTasksByPriority(priority: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByPriority(priority, params),
    [priority, JSON.stringify(params)]
  );
}

export function useTasksByAssignee(assigneeId: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByAssignee(assigneeId, params),
    [assigneeId, JSON.stringify(params)]
  );
}

export function useOverdueTasks(params?: PaginationParams) {
  return useApi(
    () => taskApiService.getOverdueTasks(params),
    [JSON.stringify(params)]
  );
}

export function useTasksDueSoon(days: number = 7, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksDueSoon(days, params),
    [days, JSON.stringify(params)]
  );
}

export function useUpdateTaskStatus() {
  return useApiMutation<Task, { id: string; status: string }>(
    async ({ id, status }) => {
      const response = await taskApiService.updateTaskStatus(id, status);
      // Invalidate cache to trigger refresh
      invalidateTasksCache();
      return response;
    }
  );
}

export function useUpdateTaskAssignee() {
  return useApiMutation<Task, { id: string; assigneeId: string }>(
    async ({ id, assigneeId }) => {
      const response = await taskApiService.updateTaskAssignee(id, assigneeId);
      // Invalidate cache to trigger refresh
      invalidateTasksCache();
      return response;
    }
  );
}

export function useLogTaskTime() {
  return useApiMutation<Task, { id: string; hours: number; description?: string }>(
    ({ id, hours, description }) => taskApiService.logTime(id, hours, description)
  );
}

// Subtask Hooks
export function useSubtasks(params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasks(params),
    [JSON.stringify(params)]
  );
}

export function useSubtask(id: string) {
  return useApi(
    () => subtaskApiService.getSubtaskById(id),
    [id]
  );
}

export function useCreateSubtask() {
  return useApiMutation<Subtask, Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>>(
    (subtask) => subtaskApiService.createSubtask(subtask)
  );
}

export function useUpdateSubtask() {
  return useApiMutation<Subtask, { id: string; subtask: Partial<Subtask> }>(
    ({ id, subtask }) => subtaskApiService.updateSubtask(id, subtask)
  );
}

export function useDeleteSubtask() {
  return useApiMutation<void, string>(
    (id) => subtaskApiService.deleteSubtask(id)
  );
}

export function usePaginatedSubtasks(initialParams?: PaginationParams) {
  return usePaginatedApi<Subtask>(
    (params) => subtaskApiService.getSubtasks(params),
    initialParams
  );
}

export function useSearchSubtasks() {
  return useSearchApi<Subtask>(
    (query, params) => subtaskApiService.searchSubtasks(query, params)
  );
}

export function useSubtasksByTask(taskId: string, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksByTask(taskId, params),
    [taskId, JSON.stringify(params)]
  );
}

export function useSubtasksByCompletion(isCompleted: boolean, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksByCompletion(isCompleted, params),
    [isCompleted, JSON.stringify(params)]
  );
}

export function useSubtasksByAssignee(assigneeId: string, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksByAssignee(assigneeId, params),
    [assigneeId, JSON.stringify(params)]
  );
}

export function useOverdueSubtasks(params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getOverdueSubtasks(params),
    [JSON.stringify(params)]
  );
}

export function useSubtasksDueSoon(days: number = 7, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksDueSoon(days, params),
    [days, JSON.stringify(params)]
  );
}

export function useUpdateSubtaskCompletion() {
  return useApiMutation<Subtask, { id: string; isCompleted: boolean }>(
    ({ id, isCompleted }) => subtaskApiService.updateSubtaskCompletion(id, isCompleted)
  );
}

export function useUpdateSubtaskAssignee() {
  return useApiMutation<Subtask, { id: string; assigneeId: string }>(
    ({ id, assigneeId }) => subtaskApiService.updateSubtaskAssignee(id, assigneeId)
  );
}

export function useBulkUpdateSubtaskCompletion() {
  return useApiMutation<Subtask[], { subtaskIds: string[]; isCompleted: boolean }>(
    ({ subtaskIds, isCompleted }) => subtaskApiService.bulkUpdateSubtaskCompletion(subtaskIds, isCompleted)
  );
}

export function useLogSubtaskTime() {
  return useApiMutation<Subtask, { id: string; hours: number; description?: string }>(
    ({ id, hours, description }) => subtaskApiService.logTime(id, hours, description)
  );
}
