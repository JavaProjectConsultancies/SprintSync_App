// API Services Index
// Export all API services for easy importing

// Core API
export { apiClient } from './client';
export { API_CONFIG, API_ENDPOINTS, HTTP_METHODS } from './config';
export type { ApiResponse, ApiError, PaginationParams, PaginatedResponse } from './config';

// Authentication API Service
export { authApiService } from './authApi';
export type { LoginRequest, LoginResponse, RegisterRequest } from './authApi';

// Entity API Services
export { userApiService } from './entities/userApi';
export { departmentApiService } from './entities/departmentApi';
export { domainApiService } from './entities/domainApi';
export { projectApiService } from './entities/projectApi';
export { epicApiService } from './entities/epicApi';
export { releaseApiService } from './entities/releaseApi';
export { sprintApiService } from './entities/sprintApi';
export { storyApiService } from './entities/storyApi';
export { taskApiService } from './entities/taskApi';
export { subtaskApiService } from './entities/subtaskApi';

// Utility API Services
export { dashboardApiService } from './utilities/dashboardApi';
export { reportsApiService } from './utilities/reportsApi';
export { searchApiService } from './utilities/searchApi';
export { batchApiService } from './utilities/batchApi';

// Re-export API types
export type {
  User,
  Department,
  Domain,
  Project,
  Epic,
  Release,
  Sprint,
  Story,
  Task,
  Subtask,
  TimeEntry,
  QualityGate,
  Milestone,
  Notification,
  Comment,
  Todo,
  DashboardMetrics,
  ChartData,
  SearchFilters,
  BatchOperationResult,
  ProjectStatus,
  EpicStatus,
  ReleaseStatus,
  SprintStatus,
  StoryStatus,
  TaskStatus,
  TimeEntryType,
  QualityGateStatus,
  MilestoneStatus,
  MilestoneType,
  NotificationType,
  CommentEntityType,
  TodoCategory,
  Priority,
} from '../../types/api';
