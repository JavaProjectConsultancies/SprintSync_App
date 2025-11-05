import { API_CONFIG, ApiResponse, ApiError, PaginationParams } from './config';

// HTTP Client for API calls
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

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
  }

  // Remove authentication token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Set demo authentication for testing (bypasses real auth)
  setDemoAuth() {
    this.defaultHeaders['Authorization'] = 'Bearer demo-token';
    this.defaultHeaders['X-Demo-Mode'] = 'true';
    console.log('Demo authentication enabled:', this.defaultHeaders);
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
  }

  // Build query string from params
  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
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
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      // Build full URL with query params
      const url = params 
        ? `${this.baseURL}${endpoint}${this.buildQueryString(params)}`
        : `${this.baseURL}${endpoint}`;

      // Merge headers
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };

      // Debug logging for API calls
      console.log('API Request:', {
        url,
        method: options.method || 'GET',
        headers,
        authorizationHeader: headers['Authorization'] || headers['authorization'],
      });

      // Create request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
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
