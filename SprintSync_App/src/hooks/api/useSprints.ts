import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import {
  sprintApiService,
  Sprint,
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

// Cache configuration for sprints
const CACHE_CONFIG = {
  ...DEFAULT_CACHE_CONFIG,
  cacheKey: 'sprintsync_sprints_cache',
};

// Module-level cache for sprints
let sprintsCache: EntityCache<Sprint> = createEntityCache<Sprint>();

/**
 * Invalidate sprints cache - can be called from outside
 */
export const invalidateSprintsCache = (userId?: string) => {
  sprintsCache = invalidateEntityCache(sprintsCache, CACHE_CONFIG.cacheKey, userId);
};

/**
 * Prefetch sprints - can be called to warm up cache
 */
export const prefetchSprints = async (userId?: string): Promise<Sprint[]> => {
  const now = Date.now();

  // Check persistent cache first (fastest)
  const persistentData = getPersistentCache<Sprint>(
    CACHE_CONFIG.cacheKey,
    userId || null,
    CACHE_CONFIG.persistentCacheTTL
  );
  if (persistentData) {
    sprintsCache = {
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
    sprintsCache.data &&
    sprintsCache.userId === userId &&
    isCacheFresh(sprintsCache.timestamp, CACHE_CONFIG.staleTime)
  ) {
    return sprintsCache.data;
  }

  // Cancel any pending request if user changed
  if (sprintsCache.abortController && sprintsCache.userId !== userId) {
    sprintsCache.abortController.abort();
    sprintsCache.abortController = null;
  }

  // If there's already a pending request for same user, wait for it
  if (sprintsCache.promise && sprintsCache.userId === userId) {
    try {
      return await sprintsCache.promise;
    } catch (err) {
      // Continue with new fetch if pending request failed
    }
  }

  // Create abort controller for request cancellation
  const abortController = new AbortController();

  // Create prefetch promise
  const prefetchPromise = (async () => {
    try {
      const response = await sprintApiService.getSprints({ page: 0, size: 1000 });
      const sprintsData = normalizeApiData<Sprint>(response.data);

      const cacheData = {
        data: sprintsData,
        timestamp: now,
        promise: null,
        userId: userId || null,
        abortController: null,
      };
      sprintsCache = cacheData;
      setPersistentCache(CACHE_CONFIG.cacheKey, sprintsData, userId || null);

      return sprintsData;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      sprintsCache.promise = null;
      sprintsCache.abortController = null;
      throw err;
    }
  })();

  sprintsCache.promise = prefetchPromise;
  sprintsCache.abortController = abortController;
  sprintsCache.userId = userId || null;

  try {
    return await prefetchPromise;
  } catch (err) {
    sprintsCache.promise = null;
    sprintsCache.abortController = null;
    throw err;
  }
};

/**
 * Hook for fetching all sprints with caching
 */
export function useAllSprints() {
  // Initialize from persistent cache immediately (synchronous, instant)
  const persistentData = getPersistentCache<Sprint>(
    CACHE_CONFIG.cacheKey,
    sprintsCache.userId,
    CACHE_CONFIG.persistentCacheTTL
  );
  const initialData = persistentData || sprintsCache.data;

  const [data, setData] = useState<Sprint[] | null>(initialData);
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

  const fetchSprints = useCallback(async (skipCache: boolean = false) => {
    const now = Date.now();

    // Check persistent cache first (fastest - synchronous)
    if (!skipCache) {
      const persistent = getPersistentCache<Sprint>(
        CACHE_CONFIG.cacheKey,
        sprintsCache.userId,
        CACHE_CONFIG.persistentCacheTTL
      );
      if (persistent) {
        sprintsCache.data = persistent;
        sprintsCache.timestamp = now;
        if (isMountedRef.current) {
          setData(persistent);
          setLoading(false);
        }

        // Background refresh if data is stale but still valid
        if (!isCacheFresh(sprintsCache.timestamp, CACHE_CONFIG.staleTime) && !backgroundRefreshTimeoutRef.current) {
          backgroundRefreshTimeoutRef.current = setTimeout(() => {
            fetchSprints(true).catch(() => {
              // Silently fail background refresh
            });
            backgroundRefreshTimeoutRef.current = null;
          }, 100);
        }

        return persistent;
      }
    }

    // Check memory cache (unless skipCache is true)
    if (!skipCache && sprintsCache.data && isCacheValid(sprintsCache.timestamp, CACHE_CONFIG.cacheTTL)) {
      if (isMountedRef.current) {
        setData(sprintsCache.data);
        setLoading(false);
      }

      // Background refresh if data is stale but still valid
      if (!isCacheFresh(sprintsCache.timestamp, CACHE_CONFIG.staleTime) && !backgroundRefreshTimeoutRef.current) {
        backgroundRefreshTimeoutRef.current = setTimeout(() => {
          fetchSprints(true).catch(() => {
            // Silently fail background refresh
          });
          backgroundRefreshTimeoutRef.current = null;
        }, 100);
      }

      return sprintsCache.data;
    }

    // Cancel any pending request
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    // If there's already a pending request, wait for it
    if (sprintsCache.promise) {
      try {
        const cachedData = await sprintsCache.promise;
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

        const response = await sprintApiService.getSprints({ page: 0, size: 1000 });
        const sprintsData = normalizeApiData<Sprint>(response.data);

        // Update cache
        const cacheData = {
          data: sprintsData,
          timestamp: now,
          promise: null,
          userId: sprintsCache.userId,
          abortController: null,
        };
        sprintsCache = cacheData;
        setPersistentCache(CACHE_CONFIG.cacheKey, sprintsData, sprintsCache.userId);

        if (isMountedRef.current) {
          setData(sprintsData);
          setLoading(false);
        }

        return sprintsData;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        sprintsCache.promise = null;
        sprintsCache.abortController = null;
        const errorMessage = err?.message || 'Failed to fetch sprints';
        if (isMountedRef.current) {
          setError(new Error(errorMessage));
          setLoading(false);
        }
        throw err;
      }
    })();

    sprintsCache.promise = fetchPromise;
    sprintsCache.abortController = abortController;

    try {
      return await fetchPromise;
    } catch (err) {
      sprintsCache.promise = null;
      sprintsCache.abortController = null;
      throw err;
    } finally {
      fetchAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchSprints();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchSprints(true),
    execute: () => fetchSprints(true),
  };
}

// Hook for fetching all sprints (paginated, no caching - for specific use cases)
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
    async (sprint) => {
      const response = await sprintApiService.createSprint(sprint);
      // Invalidate cache to trigger refresh
      invalidateSprintsCache();
      return response;
    }
  );
}

// Hook for updating a sprint
export function useUpdateSprint() {
  return useApiMutation<Sprint, { id: string; sprint: Partial<Sprint> }>(
    async ({ id, sprint }) => {
      const response = await sprintApiService.updateSprint(id, sprint);
      // Invalidate cache to trigger refresh
      invalidateSprintsCache();
      return response;
    }
  );
}

// Hook for deleting a sprint
export function useDeleteSprint() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await sprintApiService.deleteSprint(id);
      // Invalidate cache to trigger refresh
      invalidateSprintsCache();
      return response;
    }
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
    (query, params) => sprintApiService.searchSprints(query, params)
  );
}

// Hook for sprints by project
export function useSprintsByProject(projectId: string, params?: PaginationParams) {
  return useApi(
    () => projectId && projectId !== 'SKIP'
      ? sprintApiService.getSprintsByProject(projectId, params)
      : Promise.resolve({ data: [] as Sprint[], success: true, message: '', status: 200 }),
    [projectId, JSON.stringify(params)],
    !!(projectId && projectId !== 'SKIP') // Only execute if projectId is valid
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
    async ({ id, status }) => {
      const response = await sprintApiService.updateSprintStatus(id, status);
      // Invalidate cache to trigger refresh
      invalidateSprintsCache();
      return response;
    }
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
    () => id && id !== 'SKIP'
      ? sprintApiService.getSprintBurndown(id)
      : Promise.resolve({ data: null, success: true, message: '', status: 200 }),
    [id],
    !!(id && id !== 'SKIP') // Only execute if id is valid
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
