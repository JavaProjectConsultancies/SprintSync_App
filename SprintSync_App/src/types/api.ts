// API-specific types that match the backend entities

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// User entity
export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  domainId?: string;
  avatarUrl?: string;
  experience?: string;
  hourlyRate?: number;
  ctc?: number;
  availabilityPercentage?: number;
  skills?: string;
  isActive: boolean;
  lastLogin?: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'QA' | 'TESTER' | 'ANALYST';

// Department entity
export interface Department extends BaseEntity {
  name: string;
  description: string;
  isActive: boolean;
}

// Domain entity
export interface Domain extends BaseEntity {
  name: string;
  description: string;
  isActive: boolean;
}

// Project entity
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  methodology?: string;
  template?: string;
  departmentId?: string;
  managerId: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  progressPercentage: number;
  scope?: string;
  successCriteria?: string[];
  objectives?: string[];
  isActive: boolean;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

// Epic entity
export interface Epic extends BaseEntity {
  title: string;
  description: string;
  summary?: string;
  theme?: string;
  businessValue?: string;
  projectId: string;
  status: EpicStatus;
  priority: Priority;
  owner: string;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  storyPoints?: number;
  progress?: number;
  isActive: boolean;
}

export type EpicStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Release entity
export interface Release extends BaseEntity {
  name: string;
  description: string;
  version: string;
  projectId: string;
  releaseDate: string;
  status: ReleaseStatus;
  createdBy: string;
  isActive: boolean;
}

export type ReleaseStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// Sprint entity
export interface Sprint extends BaseEntity {
  projectId: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  capacityHours?: number;
  velocityPoints?: number;
  isActive: boolean;
}

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// Story entity
export interface Story extends BaseEntity {
  title: string;
  description: string;
  acceptanceCriteria: string[]; // Changed to array to match backend
  projectId: string;
  epicId?: string;
  sprintId?: string;
  parentId?: string;
  parentStoryTitle?: string; // Parent story title populated by backend
  releaseId?: string;
  assigneeId?: string;
  reporterId?: string;
  storyPoints?: number;
  priority: Priority;
  status: StoryStatus;
  labels?: string[];
  orderIndex?: number;
  dueDate?: string; // Date in YYYY-MM-DD format
  actualHours?: number;
  isActive: boolean;
}

export type StoryStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

// Task entity
export interface Task extends BaseEntity {
  storyId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  reporterId?: string;
  estimatedHours?: number;
  actualHours: number;
  orderIndex: number;
  taskNumber?: number;
  dueDate?: string;
  labels?: string[];
  isPulledFromBacklog?: boolean;
}

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'QA_REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED';

// Issue entity (similar to Task but without template functionality)
export interface Issue extends BaseEntity {
  storyId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  reporterId?: string;
  estimatedHours?: number;
  actualHours: number;
  orderIndex: number;
  issueNumber?: number;
  dueDate?: string;
  labels?: string[];
}

// Subtask entity
export interface Subtask extends BaseEntity {
  taskId?: string;
  issueId?: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  assigneeId?: string;
  estimatedHours?: number;
  actualHours: number;
  orderIndex: number;
  dueDate?: string;
  bugType?: string;
  severity?: string;
  category?: string;
  priority?: Priority;
  status?: TaskStatus;
  labels?: string[];
}

// Time Entry entity
export interface TimeEntry extends BaseEntity {
  userId: string;
  projectId?: string;
  storyId?: string;
  taskId?: string;
  subtaskId?: string;
  description: string;
  entryType: TimeEntryType;
  hoursWorked: number;
  workDate: string;
  startTime?: string;
  endTime?: string;
  isBillable: boolean;
}

export type TimeEntryType = 'development' | 'testing' | 'design' | 'review' | 'meeting' | 'research' | 'documentation' | 'bug_fix' | 'refactoring' | 'deployment' | 'training' | 'administrative';

// Quality Gate entity
export interface QualityGate extends BaseEntity {
  name: string;
  description: string;
  criteria: string;
  threshold: number;
  releaseId: string;
  status: QualityGateStatus;
  isActive: boolean;
}

export type QualityGateStatus = 'PENDING' | 'PASSED' | 'FAILED';

// Milestone entity
export interface Milestone extends BaseEntity {
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  status: MilestoneStatus;
  priority: Priority;
  ownerId: string;
  progress: number;
  type: MilestoneType;
  isActive: boolean;
}

export type MilestoneStatus = 'UPCOMING' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'COMPLETED' | 'CANCELLED';
export type MilestoneType = 'PROJECT_CHARTER' | 'REQUIREMENTS' | 'DESIGN' | 'DEVELOPMENT' | 'TESTING' | 'DEPLOYMENT' | 'REVIEW' | 'RELEASE' | 'CUSTOM';

// Notification entity
export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  actionUrl: string;
  isActive: boolean;
}

export type NotificationType = 'TASK_ASSIGNMENT' | 'DEADLINE_WARNING' | 'SPRINT_EVENT' | 'PROJECT_RISK' | 'TEAM_MENTION';

// Comment entity
export interface Comment extends BaseEntity {
  content: string;
  userId: string;
  entityType: CommentEntityType;
  entityId: string;
  parentId: string;
  isActive: boolean;
}

export type CommentEntityType = 'PROJECT' | 'STORY' | 'TASK' | 'SUBTASK' | 'SPRINT' | 'MILESTONE';

// Todo entity
export interface Todo extends BaseEntity {
  title: string;
  description: string;
  userId: string;
  isCompleted: boolean;
  priority: Priority;
  dueDate: string;
  category: TodoCategory;
  isActive: boolean;
}

export type TodoCategory = 'WORK' | 'PERSONAL' | 'SHOPPING' | 'HEALTH';

// Dashboard and Reports types
export interface DashboardMetrics {
  projectCount: number;
  teamMembers: number;
  sprintProgress: number;
  taskCompletion: number;
  criticalItems: number;
  upcomingDeadlines: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

// Search and Filter types
export interface SearchFilters {
  query?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
  sprintId?: string;
  epicId?: string;
  releaseId?: string;
  startDate?: string;
  endDate?: string;
  entityType?: string;
}

// Batch operation types
export interface BatchOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results: any[];
}

// Activity Log entity
export interface ActivityLog {
  id: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: string;
  newValues?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Attachment entity
export interface Attachment {
  id: string;
  uploadedBy?: string;
  entityType: string;
  entityId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  isPublic?: boolean;
  attachmentType?: 'file' | 'url'; // 'file' for file uploads, 'url' for links
  createdAt: string;
}