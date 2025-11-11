// API Configuration
// Use environment variable if available, otherwise default to localhost
const getApiBaseUrl = () => {
  // Check for Vite environment variable (VITE_API_BASE_URL)
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Check for React environment variable (REACT_APP_API_BASE_URL)
  if ((window as any).process?.env?.REACT_APP_API_BASE_URL) {
    return (window as any).process.env.REACT_APP_API_BASE_URL;
  }
  // Default to localhost
  return 'http://localhost:8080/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 120000, // Increased to 120 seconds for very slow database queries
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Log API configuration on startup (for debugging)
console.log('API Configuration:', {
  BASE_URL: API_CONFIG.BASE_URL,
  TIMEOUT: API_CONFIG.TIMEOUT,
  ENV_VITE: import.meta.env?.VITE_API_BASE_URL,
});

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: '/auth',
  
  // Master Tables
  USERS: '/users',
  DEPARTMENTS: '/departments',
  DOMAINS: '/domains',
  
  // Core Entities
  PROJECTS: '/projects',
  EPICS: '/epics',
  RELEASES: '/releases',
  SPRINTS: '/sprints',
  STORIES: '/stories',
  TASKS: '/tasks',
  SUBTASKS: '/subtasks',
  
  // Utility APIs
  DASHBOARD: '/dashboard',
  REPORTS: '/reports',
  SEARCH: '/search',
  BATCH_OPERATIONS: '/batch',
  
  // Time Tracking
  TIME_ENTRIES: '/time-entries',
  
  // Attachments
  ATTACHMENTS: '/attachments',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Pagination
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
