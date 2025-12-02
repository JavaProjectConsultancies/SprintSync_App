import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, ApiError } from '../../services/api';

// Generic API hook for handling async operations
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiError | null>(null);

  // Use useRef to store the latest apiCall to avoid stale closures
  const apiCallRef = useRef(apiCall);
  useEffect(() => {
    apiCallRef.current = apiCall;
  }, [apiCall]);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCallRef.current();
      setData(response.data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
}

// Hook for API mutations (POST, PUT, PATCH, DELETE)
export function useApiMutation<T, P = any>(
  mutationFn: (params: P) => Promise<ApiResponse<T>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(async (params: P) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mutationFn(params);
      setData(response.data);
      return response;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

// Hook for paginated API calls
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<ApiResponse<T[]>>,
  initialParams: any = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [params, setParams] = useState(initialParams);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const fetchData = useCallback(async (newParams?: any) => {
    try {
      setLoading(true);
      setError(null);
      const currentParams = { ...params, ...newParams };
      const response = await apiCall(currentParams);
      
      if (currentParams.page === 0 || !currentParams.page) {
        // First page or no pagination
        setData(response.data);
      } else {
        // Append to existing data
        setData(prev => [...prev, ...response.data]);
      }
      
      setTotalElements(response.data.length);
      setHasMore(response.data.length === (currentParams.size || 10));
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [apiCall, params]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setParams(prev => ({ ...prev, page: (prev.page || 0) + 1 }));
    }
  }, [hasMore, loading]);

  const refresh = useCallback(() => {
    setParams(prev => ({ ...prev, page: 0 }));
    setData([]);
    setHasMore(true);
  }, []);

  const updateParams = useCallback((newParams: any) => {
    setParams(prev => ({ ...prev, ...newParams, page: 0 }));
    setData([]);
    setHasMore(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    totalElements,
    loadMore,
    refresh,
    updateParams,
    params,
  };
}

// Hook for real-time data with polling
export function usePollingApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 30000,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const response = await apiCall();
      setData(response.data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
    
    const timer = setInterval(fetchData, interval);
    
    return () => clearInterval(timer);
  }, [fetchData, interval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Hook for search with debouncing
export function useSearchApi<T>(
  apiCall: (query: string, params?: any) => Promise<ApiResponse<T[]>>,
  debounceMs: number = 300
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setData([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall(query);
        setData(response.data);
      } catch (err) {
        setError(err as ApiError);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, apiCall, debounceMs]);

  const search = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setData([]);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    query,
    search,
    clear,
  };
}
