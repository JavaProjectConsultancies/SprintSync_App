export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  assignedProjects?: string[];
  department?: string;
  domain?: string;
}

export type UserRole = 'admin' | 'manager' | 'developer' | 'designer';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  scrums: Scrum[];
  createdBy: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

export interface Scrum {
  id: string;
  projectId: string;
  name: string;
  description: string;
  sprints: Sprint[];
  backlog: Story[];
  createdAt: string;
}

export interface Sprint {
  id: string;
  scrumId: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  stories: Story[];
  capacity: number;
  commitment: number;
}

export type SprintStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: StoryStatus;
  assigneeId?: string;
  tasks: Task[];
  sprintId?: string;
  createdAt: string;
}

export type StoryStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
  id: string;
  storyId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId?: string;
  estimatedHours: number;
  actualHours?: number;
  subtasks: Subtask[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  assigneeId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export type NotificationType = 'task-assignment' | 'deadline-warning' | 'sprint-event' | 'project-risk' | 'team-mention';

export interface Permission {
  action: string;
  resource: string;
}

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

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  dueDate: string;
  status: MilestoneStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner: string; // User ID
  progress: number; // 0-100
  type: MilestoneType;
  linkedTasks?: string[]; // Task IDs
  linkedStories?: string[]; // Story IDs
  deliverables: Deliverable[];
  dependencies?: string[]; // Other milestone IDs
  isBlocker: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type MilestoneStatus = 'upcoming' | 'on-track' | 'at-risk' | 'delayed' | 'completed' | 'cancelled';

export type MilestoneType = 'project-charter' | 'requirements' | 'design' | 'development' | 'testing' | 'deployment' | 'review' | 'release' | 'custom';

export interface Deliverable {
  id: string;
  milestoneId: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assigneeId?: string;
  dueDate?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'shopping' | 'health';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}