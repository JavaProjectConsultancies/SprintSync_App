import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import {
  storyApiService,
  Story,
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

// Cache configuration for stories
const CACHE_CONFIG = {
  ...DEFAULT_CACHE_CONFIG,
  cacheKey: 'sprintsync_stories_cache',
};

// Module-level cache for stories
let storiesCache: EntityCache<Story> = createEntityCache<Story>();

/**
 * Invalidate stories cache - can be called from outside
 */
export const invalidateStoriesCache = (userId?: string) => {
  storiesCache = invalidateEntityCache(storiesCache, CACHE_CONFIG.cacheKey, userId);
};

/**
 * Prefetch stories - can be called to warm up cache
 */
export const prefetchStories = async (userId?: string): Promise<Story[]> => {
  const now = Date.now();

  // Check persistent cache first (fastest)
  const persistentData = getPersistentCache<Story>(
    CACHE_CONFIG.cacheKey,
    userId || null,
    CACHE_CONFIG.persistentCacheTTL
  );
  if (persistentData) {
    storiesCache = {
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
    storiesCache.data &&
    storiesCache.userId === userId &&
    isCacheFresh(storiesCache.timestamp, CACHE_CONFIG.staleTime)
  ) {
    return storiesCache.data;
  }

  // Cancel any pending request if user changed
  if (storiesCache.abortController && storiesCache.userId !== userId) {
    storiesCache.abortController.abort();
    storiesCache.abortController = null;
  }

  // If there's already a pending request for same user, wait for it
  if (storiesCache.promise && storiesCache.userId === userId) {
    try {
      return await storiesCache.promise;
    } catch (err) {
      // Continue with new fetch if pending request failed
    }
  }

  // Create abort controller for request cancellation
  const abortController = new AbortController();

  // Create prefetch promise
  const prefetchPromise = (async () => {
    try {
      const response = await storyApiService.getAllStories();
      const storiesData = normalizeApiData<Story>(response.data);

      const cacheData = {
        data: storiesData,
        timestamp: now,
        promise: null,
        userId: userId || null,
        abortController: null,
      };
      storiesCache = cacheData;
      setPersistentCache(CACHE_CONFIG.cacheKey, storiesData, userId || null);

      return storiesData;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      storiesCache.promise = null;
      storiesCache.abortController = null;
      throw err;
    }
  })();

  storiesCache.promise = prefetchPromise;
  storiesCache.abortController = abortController;
  storiesCache.userId = userId || null;

  try {
    return await prefetchPromise;
  } catch (err) {
    storiesCache.promise = null;
    storiesCache.abortController = null;
    throw err;
  }
};

/**
 * Hook for fetching all stories with caching
 */
export function useAllStories() {
  // Initialize from persistent cache immediately (synchronous, instant)
  const persistentData = getPersistentCache<Story>(
    CACHE_CONFIG.cacheKey,
    storiesCache.userId,
    CACHE_CONFIG.persistentCacheTTL
  );
  const initialData = persistentData || storiesCache.data;

  const [data, setData] = useState<Story[] | null>(initialData);
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

  const fetchStories = useCallback(async (skipCache: boolean = false) => {
    const now = Date.now();

    // Check persistent cache first (fastest - synchronous)
    if (!skipCache) {
      const persistent = getPersistentCache<Story>(
        CACHE_CONFIG.cacheKey,
        storiesCache.userId,
        CACHE_CONFIG.persistentCacheTTL
      );
      if (persistent) {
        storiesCache.data = persistent;
        storiesCache.timestamp = now;
        if (isMountedRef.current) {
          setData(persistent);
          setLoading(false);
        }

        // Background refresh if data is stale but still valid
        if (!isCacheFresh(storiesCache.timestamp, CACHE_CONFIG.staleTime) && !backgroundRefreshTimeoutRef.current) {
          backgroundRefreshTimeoutRef.current = setTimeout(() => {
            fetchStories(true).catch(() => {
              // Silently fail background refresh
            });
            backgroundRefreshTimeoutRef.current = null;
          }, 100);
        }

        return persistent;
      }
    }

    // Check memory cache (unless skipCache is true)
    if (!skipCache && storiesCache.data && isCacheValid(storiesCache.timestamp, CACHE_CONFIG.cacheTTL)) {
      if (isMountedRef.current) {
        setData(storiesCache.data);
        setLoading(false);
      }

      // Background refresh if data is stale but still valid
      if (!isCacheFresh(storiesCache.timestamp, CACHE_CONFIG.staleTime) && !backgroundRefreshTimeoutRef.current) {
        backgroundRefreshTimeoutRef.current = setTimeout(() => {
          fetchStories(true).catch(() => {
            // Silently fail background refresh
          });
          backgroundRefreshTimeoutRef.current = null;
        }, 100);
      }

      return storiesCache.data;
    }

    // Cancel any pending request
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    // If there's already a pending request, wait for it
    if (storiesCache.promise) {
      try {
        const cachedData = await storiesCache.promise;
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

        const response = await storyApiService.getAllStories();
        const storiesData = normalizeApiData<Story>(response.data);

        // Update cache
        const cacheData = {
          data: storiesData,
          timestamp: now,
          promise: null,
          userId: storiesCache.userId,
          abortController: null,
        };
        storiesCache = cacheData;
        setPersistentCache(CACHE_CONFIG.cacheKey, storiesData, storiesCache.userId);

        if (isMountedRef.current) {
          setData(storiesData);
          setLoading(false);
        }

        return storiesData;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        storiesCache.promise = null;
        storiesCache.abortController = null;
        const errorMessage = err?.message || 'Failed to fetch stories';
        if (isMountedRef.current) {
          setError(new Error(errorMessage));
          setLoading(false);
        }
        throw err;
      }
    })();

    storiesCache.promise = fetchPromise;
    storiesCache.abortController = abortController;

    try {
      return await fetchPromise;
    } catch (err) {
      storiesCache.promise = null;
      storiesCache.abortController = null;
      throw err;
    } finally {
      fetchAbortRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchStories(true),
    execute: () => fetchStories(true),
  };
}

// Hook for fetching all stories (paginated, no caching)
export function useStories(params?: PaginationParams) {
  return useApi(
    () => storyApiService.getStories(params),
    [JSON.stringify(params)]
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
    async (story) => {
      const response = await storyApiService.createStory(story as Story);
      // Invalidate cache to trigger refresh
      invalidateStoriesCache();
      return response;
    }
  );
}

// Hook for updating a story
export function useUpdateStory() {
  return useApiMutation<Story, { id: string; story: Partial<Story> }>(
    async ({ id, story }) => {
      const response = await storyApiService.updateStory(id, story);
      // Invalidate cache to trigger refresh
      invalidateStoriesCache();
      return response;
    }
  );
}

// Hook for deleting a story
export function useDeleteStory() {
  return useApiMutation<void, string>(
    async (id) => {
      const response = await storyApiService.deleteStory(id);
      // Invalidate cache to trigger refresh
      invalidateStoriesCache();
      return response;
    }
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
    async ({ id, status }) => {
      const response = await storyApiService.updateStoryStatus(id, status);
      // Invalidate cache to trigger refresh
      invalidateStoriesCache();
      return response;
    }
  );
}

// Hook for updating story assignee
export function useUpdateStoryAssignee() {
  return useApiMutation<Story, { id: string; assigneeId: string }>(
    async ({ id, assigneeId }) => {
      const response = await storyApiService.updateStoryAssignee(id, assigneeId);
      // Invalidate cache to trigger refresh
      invalidateStoriesCache();
      return response;
    }
  );
}

// Hook for moving story to sprint
export function useMoveStoryToSprint() {
  return useApiMutation<Story, { id: string; sprintId: string }>(
    async ({ id, sprintId }) => {
      const response = await storyApiService.moveStoryToSprint(id, sprintId);
      // Invalidate cache to trigger refresh
      invalidateStoriesCache();
      return response;
    }
  );
}
