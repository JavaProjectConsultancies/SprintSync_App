import { API_CONFIG, API_ENDPOINTS, ApiResponse, ApiError, PaginationParams } from './config';

// HTTP Client for API calls
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private projectPrefetchPromise: Promise<void> | null = null;
  private projectPrefetchCompleted = false;
  private projectPrefetchError: ApiError | null = null;
  private prefetchedProjects: any[] | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = { ...API_CONFIG.HEADERS };
  }

  // Set authentication token
  setAuthToken(token: string) {
    console.log('Setting auth token in apiClient:', token);
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('Updated headers:', this.defaultHeaders);
    this.resetProjectPrefetchState();
    this.startProjectPrefetch();
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
    delete this.defaultHeaders['X-Demo-Mode'];
    delete this.defaultHeaders['X-Test-Mode'];
    this.resetProjectPrefetchState();
  }

  // Set demo authentication for testing (bypasses real auth)
  setDemoAuth() {
    this.defaultHeaders['Authorization'] = 'Bearer demo-token';
    this.defaultHeaders['X-Demo-Mode'] = 'true';
    console.log('Demo authentication enabled:', this.defaultHeaders);
    this.resetProjectPrefetchState();
    this.startProjectPrefetch();
  }

  // Check if we're in demo mode
  isDemoMode(): boolean {
    return this.defaultHeaders['X-Demo-Mode'] === 'true';
  }

  // Try different authentication methods
  setTestAuth() {
    // Try different auth formats that might work with your backend
    this.defaultHeaders['Authorization'] = 'Bearer test-token';
    this.defaultHeaders['X-Test-Mode'] = 'true';
    console.log('Test authentication enabled:', this.defaultHeaders);
    this.resetProjectPrefetchState();
    this.startProjectPrefetch();
  }

  private resetProjectPrefetchState() {
    this.projectPrefetchPromise = null;
    this.projectPrefetchCompleted = false;
    this.projectPrefetchError = null;
    this.prefetchedProjects = null;
  }

  private normalizeProjectList(data: any): any[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (data?.data) {
      return this.normalizeProjectList(data.data);
    }

    if (Array.isArray(data?.content)) {
      return data.content;
    }

    return [];
  }

  private shouldSkipPrefetchGate(endpoint: string, method: string): boolean {
    if (!this.defaultHeaders['Authorization']) {
      return true;
    }

    if (!method || method.toUpperCase() !== 'GET') {
      return true;
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    if (normalizedEndpoint.startsWith(API_ENDPOINTS.AUTH)) {
      return true;
    }

    if (normalizedEndpoint.startsWith(API_ENDPOINTS.PROJECTS)) {
      return true;
    }

    return false;
  }

  private async waitForProjectPrefetch(endpoint: string, method: string): Promise<void> {
    if (this.projectPrefetchCompleted) {
      return;
    }

    if (this.shouldSkipPrefetchGate(endpoint, method)) {
      return;
    }

    if (!this.projectPrefetchPromise) {
      this.startProjectPrefetch();
    }

    if (this.projectPrefetchPromise) {
      try {
        await this.projectPrefetchPromise;
      } catch (error) {
        console.warn('Project prefetch failed before completing request:', error);
      }
    }
  }

  private startProjectPrefetch() {
    if (this.projectPrefetchPromise || this.projectPrefetchCompleted) {
      return;
    }

    if (!this.defaultHeaders['Authorization']) {
      return;
    }

    const performPrefetch = async () => {
      try {
        console.log('[apiClient] Prefetching accessible projects...');
        const accessibleResponse = await this.request<any>(
          `${API_ENDPOINTS.PROJECTS}/accessible`,
          { method: 'GET' },
          undefined,
          true
        );

        const projects = this.normalizeProjectList(accessibleResponse.data);
        this.prefetchedProjects = projects;
        this.projectPrefetchError = null;

        if (projects.length > 0) {
          return;
        }

        console.warn('[apiClient] Accessible projects prefetch returned empty list, attempting fallback.');
      } catch (error) {
        console.warn('[apiClient] Failed to prefetch accessible projects, attempting fallback:', error);
      }

      try {
        const fallbackResponse = await this.request<any>(
          `${API_ENDPOINTS.PROJECTS}/all`,
          { method: 'GET' },
          undefined,
          true
        );

        const projects = this.normalizeProjectList(fallbackResponse.data);
        this.prefetchedProjects = projects;
        this.projectPrefetchError = null;
      } catch (error) {
        this.prefetchedProjects = null;
        this.projectPrefetchError = error as ApiError;
        console.error('[apiClient] Failed to prefetch projects from fallback endpoint:', error);
      }
    };

    this.projectPrefetchPromise = performPrefetch()
      .catch(error => {
        this.projectPrefetchError = error as ApiError;
      })
      .finally(() => {
        this.projectPrefetchCompleted = true;
        this.projectPrefetchPromise = null;
      });
  }

  async waitForProjectsPrefetch(): Promise<void> {
    if (this.projectPrefetchPromise) {
      try {
        await this.projectPrefetchPromise;
      } catch {
        // already logged in startProjectPrefetch
      }
    }
  }

  consumePrefetchedProjects<T = any>(): T[] | null {
    if (!this.prefetchedProjects) {
      return null;
    }

    const snapshot = [...this.prefetchedProjects] as T[];
    this.prefetchedProjects = null;
    return snapshot;
  }

  private normalizeParams(params?: Record<string, any>): Record<string, any> | undefined {
    if (!params || typeof params !== 'object') {
      return undefined;
    }

    const normalized: Record<string, any> = {};

    const process = (source: Record<string, any>) => {
      Object.entries(source).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }

        if (key === 'params' && value && typeof value === 'object' && !Array.isArray(value)) {
          process(value as Record<string, any>);
          return;
        }

        normalized[key] = value;
      });
    };

    process(params);

    return Object.keys(normalized).length > 0 ? normalized : undefined;
  }

  // Build query string from params
  private buildQueryString(params?: Record<string, any>): string {
    if (!params) {
      return '';
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString());
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, any>,
    bypassPrefetchGate = false
  ): Promise<ApiResponse<T>> {
    const method = (options.method?.toString().toUpperCase() || 'GET');
    const requestOptions: RequestInit = { ...options, method };

    try {
      if (!bypassPrefetchGate) {
        await this.waitForProjectPrefetch(endpoint, method);
      }

      // Build full URL with query params
      const normalizedParams = this.normalizeParams(params);
      const url = normalizedParams
        ? `${this.baseURL}${endpoint}${this.buildQueryString(normalizedParams)}`
        : `${this.baseURL}${endpoint}`;

      // Merge headers
      const headers = {
        ...this.defaultHeaders,
        ...requestOptions.headers,
      };

      // Debug logging for API calls
      console.log('API Request:', {
        url,
        method,
        headers,
        authorizationHeader: headers['Authorization'] || headers['authorization'],
      });

      // Create request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...requestOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        let errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Provide more specific error messages for common HTTP status codes
        switch (response.status) {
          case 401:
            errorMessage = 'Authentication required. Please log in to access this resource.';
            break;
          case 403:
            errorMessage = 'Access denied. You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            break;
        }
        
        const error: ApiError = {
          message: errorMessage,
          status: response.status,
          code: data.code || `HTTP_${response.status}`,
          details: data,
        };
        throw error;
      }

      return {
        data,
        status: response.status,
        success: true,
        message: data.message,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timeout - The server took too long to respond',
            status: 408,
            code: 'TIMEOUT',
          } as ApiError;
        }
        
        // Provide more helpful error messages for network errors
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = `Cannot connect to backend API at ${this.baseURL}. Please ensure:
1. The backend server is running on port 8080
2. The server URL is correct
3. CORS is properly configured
4. There are no firewall or network restrictions`;
        }
        
        throw {
          message: errorMessage,
          status: 0,
          code: 'NETWORK_ERROR',
          details: {
            baseURL: this.baseURL,
            endpoint,
            originalError: error.message,
          },
        } as ApiError;
      }
      
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, params);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Default export for convenience
export default apiClient;

// Export types
export type { ApiResponse, ApiError, PaginationParams };
