// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

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
