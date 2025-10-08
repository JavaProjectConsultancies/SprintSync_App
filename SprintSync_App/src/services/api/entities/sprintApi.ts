import { apiClient, ApiResponse, PaginationParams } from '../client';
import { API_ENDPOINTS } from '../config';
import { Sprint, Story, Task, Subtask } from '../../../types/api';

// Sprint API Service
export class SprintApiService {
  // Get all sprints
  async getSprints(params?: PaginationParams): Promise<ApiResponse<Sprint[]>> {
    return apiClient.get<Sprint[]>(API_ENDPOINTS.SPRINTS, params);
  }

  // Get sprint by ID
  async getSprintById(id: string): Promise<ApiResponse<Sprint>> {
    return apiClient.get<Sprint>(`${API_ENDPOINTS.SPRINTS}/${id}`);
  }

  // Create new sprint
  async createSprint(sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Sprint>> {
    return apiClient.post<Sprint>(API_ENDPOINTS.SPRINTS, sprint);
  }

  // Update sprint
  async updateSprint(id: string, sprint: Partial<Sprint>): Promise<ApiResponse<Sprint>> {
    return apiClient.put<Sprint>(`${API_ENDPOINTS.SPRINTS}/${id}`, sprint);
  }

  // Delete sprint
  async deleteSprint(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.SPRINTS}/${id}`);
  }

  // Search sprints
  async searchSprints(query: string, params?: PaginationParams): Promise<ApiResponse<Sprint[]>> {
    return apiClient.get<Sprint[]>(`${API_ENDPOINTS.SPRINTS}/search`, {
      ...params,
      query,
    });
  }

  // Get sprints by project
  async getSprintsByProject(projectId: string, params?: PaginationParams): Promise<ApiResponse<Sprint[]>> {
    return apiClient.get<Sprint[]>(`${API_ENDPOINTS.SPRINTS}/project/${projectId}`, params);
  }

  // Get sprints by status
  async getSprintsByStatus(status: string, params?: PaginationParams): Promise<ApiResponse<Sprint[]>> {
    return apiClient.get<Sprint[]>(`${API_ENDPOINTS.SPRINTS}/status/${status}`, params);
  }

  // Get current sprint for project
  async getCurrentSprint(projectId: string): Promise<ApiResponse<Sprint>> {
    return apiClient.get<Sprint>(`${API_ENDPOINTS.SPRINTS}/current/${projectId}`);
  }

  // Get active sprints
  async getActiveSprints(params?: PaginationParams): Promise<ApiResponse<Sprint[]>> {
    return apiClient.get<Sprint[]>(`${API_ENDPOINTS.SPRINTS}/active`, params);
  }

  // Update sprint status
  async updateSprintStatus(id: string, status: string): Promise<ApiResponse<Sprint>> {
    return apiClient.patch<Sprint>(`${API_ENDPOINTS.SPRINTS}/${id}/status`, { status });
  }

  // Get sprint statistics
  async getSprintStatistics(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SPRINTS}/${id}/statistics`);
  }

  // Get sprint velocity
  async getSprintVelocity(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SPRINTS}/${id}/velocity`);
  }

  // Get sprint burndown
  async getSprintBurndown(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SPRINTS}/${id}/burndown`);
  }

  // Get sprint capacity
  async getSprintCapacity(id: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.SPRINTS}/${id}/capacity`);
  }

  // Copy sprint
  async copySprint(id: string, newSprintData: Partial<Sprint>): Promise<ApiResponse<Sprint>> {
    return apiClient.post<Sprint>(`${API_ENDPOINTS.SPRINTS}/${id}/copy`, newSprintData);
  }
}

// Story API Service
export class StoryApiService {
  // Get all stories
  async getStories(params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(API_ENDPOINTS.STORIES, params);
  }

  // Get story by ID
  async getStoryById(id: string): Promise<ApiResponse<Story>> {
    return apiClient.get<Story>(`${API_ENDPOINTS.STORIES}/${id}`);
  }

  // Create new story
  async createStory(story: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Story>> {
    return apiClient.post<Story>(API_ENDPOINTS.STORIES, story);
  }

  // Update story
  async updateStory(id: string, story: Partial<Story>): Promise<ApiResponse<Story>> {
    return apiClient.put<Story>(`${API_ENDPOINTS.STORIES}/${id}`, story);
  }

  // Delete story
  async deleteStory(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.STORIES}/${id}`);
  }

  // Search stories
  async searchStories(query: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/search`, {
      ...params,
      query,
    });
  }

  // Get stories by project
  async getStoriesByProject(projectId: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/project/${projectId}`, params);
  }

  // Get stories by sprint
  async getStoriesBySprint(sprintId: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/sprint/${sprintId}`, params);
  }

  // Get stories by epic
  async getStoriesByEpic(epicId: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/epic/${epicId}`, params);
  }

  // Get stories by release
  async getStoriesByRelease(releaseId: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/release/${releaseId}`, params);
  }

  // Get stories by status
  async getStoriesByStatus(status: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/status/${status}`, params);
  }

  // Get stories by priority
  async getStoriesByPriority(priority: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/priority/${priority}`, params);
  }

  // Get stories by assignee
  async getStoriesByAssignee(assigneeId: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/assignee/${assigneeId}`, params);
  }

  // Get backlog stories
  async getBacklogStories(projectId: string, params?: PaginationParams): Promise<ApiResponse<Story[]>> {
    return apiClient.get<Story[]>(`${API_ENDPOINTS.STORIES}/backlog/${projectId}`, params);
  }

  // Update story status
  async updateStoryStatus(id: string, status: string): Promise<ApiResponse<Story>> {
    return apiClient.patch<Story>(`${API_ENDPOINTS.STORIES}/${id}/status`, { status });
  }

  // Update story assignee
  async updateStoryAssignee(id: string, assigneeId: string): Promise<ApiResponse<Story>> {
    return apiClient.patch<Story>(`${API_ENDPOINTS.STORIES}/${id}/assignee`, { assigneeId });
  }

  // Move story to sprint
  async moveStoryToSprint(id: string, sprintId: string): Promise<ApiResponse<Story>> {
    return apiClient.patch<Story>(`${API_ENDPOINTS.STORIES}/${id}/sprint`, { sprintId });
  }
}

// Task API Service
export class TaskApiService {
  // Get all tasks
  async getTasks(params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(API_ENDPOINTS.TASKS, params);
  }

  // Get task by ID
  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    return apiClient.get<Task>(`${API_ENDPOINTS.TASKS}/${id}`);
  }

  // Create new task
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(API_ENDPOINTS.TASKS, task);
  }

  // Update task
  async updateTask(id: string, task: Partial<Task>): Promise<ApiResponse<Task>> {
    return apiClient.put<Task>(`${API_ENDPOINTS.TASKS}/${id}`, task);
  }

  // Delete task
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.TASKS}/${id}`);
  }

  // Search tasks
  async searchTasks(query: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/search`, {
      ...params,
      query,
    });
  }

  // Get tasks by story
  async getTasksByStory(storyId: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/story/${storyId}`, params);
  }

  // Get tasks by status
  async getTasksByStatus(status: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/status/${status}`, params);
  }

  // Get tasks by priority
  async getTasksByPriority(priority: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/priority/${priority}`, params);
  }

  // Get tasks by assignee
  async getTasksByAssignee(assigneeId: string, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/assignee/${assigneeId}`, params);
  }

  // Get overdue tasks
  async getOverdueTasks(params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/overdue`, params);
  }

  // Get tasks due soon
  async getTasksDueSoon(days: number = 7, params?: PaginationParams): Promise<ApiResponse<Task[]>> {
    return apiClient.get<Task[]>(`${API_ENDPOINTS.TASKS}/due-soon`, { ...params, days });
  }

  // Update task status
  async updateTaskStatus(id: string, status: string): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`${API_ENDPOINTS.TASKS}/${id}/status`, { status });
  }

  // Update task assignee
  async updateTaskAssignee(id: string, assigneeId: string): Promise<ApiResponse<Task>> {
    return apiClient.patch<Task>(`${API_ENDPOINTS.TASKS}/${id}/assignee`, { assigneeId });
  }

  // Log time to task
  async logTime(id: string, hours: number, description?: string): Promise<ApiResponse<Task>> {
    return apiClient.post<Task>(`${API_ENDPOINTS.TASKS}/${id}/log-time`, { hours, description });
  }
}

// Subtask API Service
export class SubtaskApiService {
  // Get all subtasks
  async getSubtasks(params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(API_ENDPOINTS.SUBTASKS, params);
  }

  // Get subtask by ID
  async getSubtaskById(id: string): Promise<ApiResponse<Subtask>> {
    return apiClient.get<Subtask>(`${API_ENDPOINTS.SUBTASKS}/${id}`);
  }

  // Create new subtask
  async createSubtask(subtask: Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Subtask>> {
    return apiClient.post<Subtask>(API_ENDPOINTS.SUBTASKS, subtask);
  }

  // Update subtask
  async updateSubtask(id: string, subtask: Partial<Subtask>): Promise<ApiResponse<Subtask>> {
    return apiClient.put<Subtask>(`${API_ENDPOINTS.SUBTASKS}/${id}`, subtask);
  }

  // Delete subtask
  async deleteSubtask(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.SUBTASKS}/${id}`);
  }

  // Search subtasks
  async searchSubtasks(query: string, params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/search`, {
      ...params,
      query,
    });
  }

  // Get subtasks by task
  async getSubtasksByTask(taskId: string, params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/task/${taskId}`, params);
  }

  // Get subtasks by completion status
  async getSubtasksByCompletion(isCompleted: boolean, params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/completion/${isCompleted}`, params);
  }

  // Get subtasks by assignee
  async getSubtasksByAssignee(assigneeId: string, params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/assignee/${assigneeId}`, params);
  }

  // Get overdue subtasks
  async getOverdueSubtasks(params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/overdue`, params);
  }

  // Get subtasks due soon
  async getSubtasksDueSoon(days: number = 7, params?: PaginationParams): Promise<ApiResponse<Subtask[]>> {
    return apiClient.get<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/due-soon`, { ...params, days });
  }

  // Update subtask completion
  async updateSubtaskCompletion(id: string, isCompleted: boolean): Promise<ApiResponse<Subtask>> {
    return apiClient.patch<Subtask>(`${API_ENDPOINTS.SUBTASKS}/${id}/completion`, { isCompleted });
  }

  // Update subtask assignee
  async updateSubtaskAssignee(id: string, assigneeId: string): Promise<ApiResponse<Subtask>> {
    return apiClient.patch<Subtask>(`${API_ENDPOINTS.SUBTASKS}/${id}/assignee`, { assigneeId });
  }

  // Bulk update subtask completion
  async bulkUpdateSubtaskCompletion(subtaskIds: string[], isCompleted: boolean): Promise<ApiResponse<Subtask[]>> {
    return apiClient.patch<Subtask[]>(`${API_ENDPOINTS.SUBTASKS}/bulk/completion`, { subtaskIds, isCompleted });
  }

  // Log time to subtask
  async logTime(id: string, hours: number, description?: string): Promise<ApiResponse<Subtask>> {
    return apiClient.post<Subtask>(`${API_ENDPOINTS.SUBTASKS}/${id}/log-time`, { hours, description });
  }
}

// Export singleton instances
export const sprintApiService = new SprintApiService();
export const storyApiService = new StoryApiService();
export const taskApiService = new TaskApiService();
export const subtaskApiService = new SubtaskApiService();
