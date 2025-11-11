import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient, projectApiService } from '../../services/api';
import { Project } from '../../types/api';

interface UseProjectsReturn {
  data: Project[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createProject: (project: Project) => Promise<Project>;
  updateProject: (id: string, project: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

// User-specific cache for projects
interface ProjectsCache {
  data: Project[] | null;
  timestamp: number;
  promise: Promise<Project[]> | null;
  userId: string | null;
  abortController: AbortController | null;
}

const CACHE_TTL = 300000; // 5 minutes cache
const STALE_TIME = 60000; // 1 minute - data is considered fresh
const PERSISTENT_CACHE_KEY = 'sprintsync_projects_cache';
const PERSISTENT_CACHE_TTL = 600000; // 10 minutes for persistent cache

let projectsCache: ProjectsCache = {
  data: null,
  timestamp: 0,
  promise: null,
  userId: null,
  abortController: null,
};

// Fast normalization function - optimized for performance
const normalizeProjectsData = (responseData: any): Project[] => {
  if (Array.isArray(responseData)) {
    return responseData;
  }
  if (responseData?.content && Array.isArray(responseData.content)) {
    return responseData.content;
  }
  if (responseData?.data) {
    return normalizeProjectsData(responseData.data);
  }
  return [];
};

// Persistent cache using localStorage (faster than IndexedDB for small data)
const getPersistentCache = (userId: string | null): Project[] | null => {
  try {
    const cached = localStorage.getItem(PERSISTENT_CACHE_KEY);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is valid and for the same user
    if (
      parsed.userId === userId &&
      parsed.data &&
      Array.isArray(parsed.data) &&
      (now - parsed.timestamp) < PERSISTENT_CACHE_TTL
    ) {
      return parsed.data;
    }
    
    // Clean up stale cache
    localStorage.removeItem(PERSISTENT_CACHE_KEY);
    return null;
  } catch {
    return null;
  }
};

const setPersistentCache = (data: Project[], userId: string | null) => {
  try {
    localStorage.setItem(
      PERSISTENT_CACHE_KEY,
      JSON.stringify({
        data,
        userId,
        timestamp: Date.now(),
      })
    );
  } catch {
    // Ignore localStorage errors (quota exceeded, etc.)
  }
};

const clearPersistentCache = () => {
  try {
    localStorage.removeItem(PERSISTENT_CACHE_KEY);
  } catch {
    // Ignore errors
  }
};

// Global cache invalidation function - can be called from auth context
export const invalidateProjectsCache = (userId?: string) => {
  // Cancel any pending requests
  if (projectsCache.abortController) {
    projectsCache.abortController.abort();
  }
  
  if (!userId || projectsCache.userId === userId) {
    projectsCache = {
      data: null,
      timestamp: 0,
      promise: null,
      userId: userId || null,
      abortController: null,
    };
    clearPersistentCache();
  }
};

// Prefetch projects function - can be called immediately after login
export const prefetchProjects = async (userId?: string): Promise<Project[]> => {
  const now = Date.now();
  
  // Check persistent cache first (fastest)
  const persistentData = getPersistentCache(userId || null);
  if (persistentData) {
    projectsCache = {
      data: persistentData,
      timestamp: now,
      promise: null,
      userId: userId || null,
      abortController: null,
    };
    return persistentData;
  }
  
  // Check if we have fresh cache for this user
  if (projectsCache.data && projectsCache.userId === userId && (now - projectsCache.timestamp) < STALE_TIME) {
    return projectsCache.data;
  }

  // Cancel any pending request if user changed
  if (projectsCache.abortController && projectsCache.userId !== userId) {
    projectsCache.abortController.abort();
    projectsCache.abortController = null;
  }

  // If there's already a pending request for same user, wait for it
  if (projectsCache.promise && projectsCache.userId === userId) {
    try {
      return await projectsCache.promise;
    } catch (err) {
      // Continue with new fetch if pending request failed
    }
  }

  // Create abort controller for request cancellation
  const abortController = new AbortController();
  
  // Create prefetch promise
  const prefetchPromise = (async () => {
    try {
      // Try prefetched data first (fastest path)
      const prefetched = apiClient.consumePrefetchedProjects<Project>();
      if (prefetched && prefetched.length > 0) {
        const cacheData = {
          data: prefetched,
          timestamp: now,
          promise: null,
          userId: userId || null,
          abortController: null,
        };
        projectsCache = cacheData;
        setPersistentCache(prefetched, userId || null);
        return prefetched;
      }

      // Try both endpoints in parallel with race condition
      const fetchPromises = [
        projectApiService.getAccessibleProjects().catch(() => null),
        projectApiService.getAllProjects().catch(() => null),
      ];

      // Use Promise.race to get the first successful response
      const responses = await Promise.allSettled(fetchPromises);
      
      let response: any = null;
      // Prefer accessible projects if available, otherwise use all projects
      for (const result of responses) {
        if (result.status === 'fulfilled' && result.value) {
          response = result.value;
          break; // Use first successful response
        }
      }

      if (!response) {
        throw new Error('Failed to fetch projects from all endpoints');
      }

      // Fast normalization
      const projectsData = normalizeProjectsData(response.data);

      const cacheData = {
        data: projectsData,
        timestamp: now,
        promise: null,
        userId: userId || null,
        abortController: null,
      };
      projectsCache = cacheData;
      setPersistentCache(projectsData, userId || null);

      return projectsData;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request cancelled');
      }
      projectsCache.promise = null;
      projectsCache.abortController = null;
      throw err;
    }
  })();

  projectsCache.promise = prefetchPromise;
  projectsCache.abortController = abortController;
  projectsCache.userId = userId || null;
  
  try {
    return await prefetchPromise;
  } catch (err) {
    projectsCache.promise = null;
    projectsCache.abortController = null;
    throw err;
  }
};

export const useProjects = (): UseProjectsReturn => {
  // Initialize from persistent cache immediately (synchronous, instant)
  const persistentData = getPersistentCache(projectsCache.userId);
  const initialData = persistentData || projectsCache.data;
  
  const [data, setData] = useState<Project[] | null>(initialData);
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

  const fetchProjects = useCallback(async (preferPrefetched: boolean = true, skipCache: boolean = false) => {
    const now = Date.now();
    
    // Check persistent cache first (fastest - synchronous)
    if (!skipCache) {
      const persistent = getPersistentCache(projectsCache.userId);
      if (persistent) {
        projectsCache.data = persistent;
        projectsCache.timestamp = now;
        if (isMountedRef.current) {
          setData(persistent);
          setLoading(false);
        }
        
        // Background refresh if data is stale but still valid
        if ((now - (projectsCache.timestamp || 0)) > STALE_TIME && !backgroundRefreshTimeoutRef.current) {
          backgroundRefreshTimeoutRef.current = setTimeout(() => {
            fetchProjects(preferPrefetched, true).catch(() => {
              // Silently fail background refresh
            });
            backgroundRefreshTimeoutRef.current = null;
          }, 100);
        }
        
        return persistent;
      }
    }
    
    // Check memory cache (unless skipCache is true)
    if (!skipCache && projectsCache.data && (now - projectsCache.timestamp) < CACHE_TTL) {
      if (isMountedRef.current) {
        setData(projectsCache.data);
        setLoading(false);
      }
      
      // Background refresh if data is stale but still valid
      if ((now - projectsCache.timestamp) > STALE_TIME && !backgroundRefreshTimeoutRef.current) {
        backgroundRefreshTimeoutRef.current = setTimeout(() => {
          fetchProjects(preferPrefetched, true).catch(() => {
            // Silently fail background refresh
          });
          backgroundRefreshTimeoutRef.current = null;
        }, 100);
      }
      
      return projectsCache.data;
    }

    // Cancel any pending request
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    // If there's already a pending request, wait for it
    if (projectsCache.promise) {
      try {
        const cachedData = await projectsCache.promise;
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
        
        // Try prefetched data first (non-blocking check)
        if (preferPrefetched) {
          try {
            const prefetched = apiClient.consumePrefetchedProjects<Project>();
            if (prefetched && prefetched.length > 0) {
              const cacheData = {
                data: prefetched,
                timestamp: now,
                promise: null,
                userId: projectsCache.userId,
                abortController: null,
              };
              projectsCache = cacheData;
              setPersistentCache(prefetched, projectsCache.userId);
              if (isMountedRef.current) {
                setData(prefetched);
                setLoading(false);
              }
              return prefetched;
            }
          } catch (prefetchErr) {
            // Continue to API fetch if prefetch fails
          }
        }

        // Try both endpoints in parallel - optimized
        const fetchPromises = [
          projectApiService.getAccessibleProjects().catch(() => null),
          projectApiService.getAllProjects().catch(() => null),
        ];

        const responses = await Promise.allSettled(fetchPromises);

        let response: any = null;
        // Use first successful response
        for (const result of responses) {
          if (result.status === 'fulfilled' && result.value) {
            response = result.value;
            break;
          }
        }

        if (!response) {
          throw new Error('Failed to fetch projects from all endpoints');
        }
        
        // Fast normalization
        const projectsData = normalizeProjectsData(response.data);
        
        // Update cache
        const cacheData = {
          data: projectsData,
          timestamp: now,
          promise: null,
          userId: projectsCache.userId,
          abortController: null,
        };
        projectsCache = cacheData;
        setPersistentCache(projectsData, projectsCache.userId);
        
        if (isMountedRef.current) {
          setData(projectsData);
          setLoading(false);
        }
        
        return projectsData;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        projectsCache.promise = null;
        projectsCache.abortController = null;
        const errorMessage = err?.message || 'Failed to fetch projects';
        if (isMountedRef.current) {
          setError(new Error(errorMessage));
          setLoading(false);
        }
        throw err;
      }
    })();

    projectsCache.promise = fetchPromise;
    projectsCache.abortController = abortController;
    
    try {
      return await fetchPromise;
    } catch (err) {
      projectsCache.promise = null;
      projectsCache.abortController = null;
      throw err;
    } finally {
      fetchAbortRef.current = null;
    }
  }, []);

  const createProject = async (project: Project): Promise<Project> => {
    try {
      const response = await projectApiService.createProject(project);
      // Invalidate cache and refetch
      invalidateProjectsCache();
      await fetchProjects(false, true);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create project');
    }
  };

  const updateProject = async (id: string, project: Project): Promise<Project> => {
    try {
      const response = await projectApiService.updateProject(id, project);
      // Invalidate cache and refetch
      invalidateProjectsCache();
      await fetchProjects(false, true);
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update project');
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await projectApiService.deleteProject(id);
      // Invalidate cache and refetch
      invalidateProjectsCache();
      await fetchProjects(false, true);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchProjects(false, true),
    createProject,
    updateProject,
    deleteProject,
  };
};

// Hook for creating projects
export const useCreateProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = async (project: Project): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectApiService.createProject(project);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create project');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    loading,
    error,
  };
};
