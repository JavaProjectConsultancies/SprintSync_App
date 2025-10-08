import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';
import { BatchOperationResult } from '../../../types/api';

// Batch Operations API Service
export class BatchApiService {
  // Bulk create projects
  async bulkCreateProjects(projects: any[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.post<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/projects/bulk-create`, { projects });
  }

  // Bulk update projects
  async bulkUpdateProjects(updates: { id: string; data: any }[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/projects/bulk-update`, { updates });
  }

  // Bulk delete projects
  async bulkDeleteProjects(projectIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.delete<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/projects/bulk-delete`, { projectIds });
  }

  // Bulk create sprints
  async bulkCreateSprints(sprints: any[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.post<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/sprints/bulk-create`, { sprints });
  }

  // Bulk update sprints
  async bulkUpdateSprints(updates: { id: string; data: any }[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/sprints/bulk-update`, { updates });
  }

  // Bulk delete sprints
  async bulkDeleteSprints(sprintIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.delete<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/sprints/bulk-delete`, { sprintIds });
  }

  // Bulk create stories
  async bulkCreateStories(stories: any[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.post<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/stories/bulk-create`, { stories });
  }

  // Bulk update stories
  async bulkUpdateStories(updates: { id: string; data: any }[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/stories/bulk-update`, { updates });
  }

  // Bulk delete stories
  async bulkDeleteStories(storyIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.delete<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/stories/bulk-delete`, { storyIds });
  }

  // Bulk create tasks
  async bulkCreateTasks(tasks: any[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.post<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/tasks/bulk-create`, { tasks });
  }

  // Bulk update tasks
  async bulkUpdateTasks(updates: { id: string; data: any }[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/tasks/bulk-update`, { updates });
  }

  // Bulk delete tasks
  async bulkDeleteTasks(taskIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.delete<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/tasks/bulk-delete`, { taskIds });
  }

  // Bulk create subtasks
  async bulkCreateSubtasks(subtasks: any[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.post<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/subtasks/bulk-create`, { subtasks });
  }

  // Bulk update subtasks
  async bulkUpdateSubtasks(updates: { id: string; data: any }[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/subtasks/bulk-update`, { updates });
  }

  // Bulk delete subtasks
  async bulkDeleteSubtasks(subtaskIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.delete<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/subtasks/bulk-delete`, { subtaskIds });
  }

  // Bulk update story status
  async bulkUpdateStoryStatus(storyIds: string[], status: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/stories/bulk-status`, { storyIds, status });
  }

  // Bulk update task status
  async bulkUpdateTaskStatus(taskIds: string[], status: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/tasks/bulk-status`, { taskIds, status });
  }

  // Bulk update subtask completion
  async bulkUpdateSubtaskCompletion(subtaskIds: string[], isCompleted: boolean): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/subtasks/bulk-completion`, { subtaskIds, isCompleted });
  }

  // Bulk assign stories
  async bulkAssignStories(storyIds: string[], assigneeId: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/stories/bulk-assign`, { storyIds, assigneeId });
  }

  // Bulk assign tasks
  async bulkAssignTasks(taskIds: string[], assigneeId: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/tasks/bulk-assign`, { taskIds, assigneeId });
  }

  // Bulk assign subtasks
  async bulkAssignSubtasks(subtaskIds: string[], assigneeId: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/subtasks/bulk-assign`, { subtaskIds, assigneeId });
  }

  // Bulk move stories to sprint
  async bulkMoveStoriesToSprint(storyIds: string[], sprintId: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/stories/bulk-move-sprint`, { storyIds, sprintId });
  }

  // Bulk move tasks to story
  async bulkMoveTasksToStory(taskIds: string[], storyId: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/tasks/bulk-move-story`, { taskIds, storyId });
  }

  // Bulk move subtasks to task
  async bulkMoveSubtasksToTask(subtaskIds: string[], taskId: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/subtasks/bulk-move-task`, { subtaskIds, taskId });
  }

  // Bulk update priorities
  async bulkUpdatePriorities(entityType: 'stories' | 'tasks' | 'subtasks', entityIds: string[], priority: string): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/${entityType}/bulk-priority`, { entityIds, priority });
  }

  // Bulk duplicate entities
  async bulkDuplicateEntities(entityType: 'projects' | 'sprints' | 'stories' | 'tasks' | 'subtasks', entityIds: string[], duplicateOptions?: any): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.post<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/${entityType}/bulk-duplicate`, { entityIds, duplicateOptions });
  }

  // Bulk archive entities
  async bulkArchiveEntities(entityType: 'projects' | 'sprints' | 'stories' | 'tasks' | 'subtasks', entityIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/${entityType}/bulk-archive`, { entityIds });
  }

  // Bulk restore entities
  async bulkRestoreEntities(entityType: 'projects' | 'sprints' | 'stories' | 'tasks' | 'subtasks', entityIds: string[]): Promise<ApiResponse<BatchOperationResult>> {
    return apiClient.patch<BatchOperationResult>(`${API_ENDPOINTS.BATCH_OPERATIONS}/${entityType}/bulk-restore`, { entityIds });
  }

  // Get batch operation status
  async getBatchOperationStatus(operationId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.BATCH_OPERATIONS}/status/${operationId}`);
  }

  // Get batch operation history
  async getBatchOperationHistory(userId?: string, limit?: number): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`${API_ENDPOINTS.BATCH_OPERATIONS}/history`, {
      userId,
      limit,
    });
  }

  // Cancel batch operation
  async cancelBatchOperation(operationId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${API_ENDPOINTS.BATCH_OPERATIONS}/cancel/${operationId}`);
  }
}

// Export singleton instance
export const batchApiService = new BatchApiService();
