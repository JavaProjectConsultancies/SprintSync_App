import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import { 
  taskApiService, 
  subtaskApiService,
  Task, 
  Subtask,
  ApiResponse, 
  PaginationParams 
} from '../../services/api';

// Task Hooks
export function useTasks(params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasks(params),
    [JSON.stringify(params)]
  );
}

export function useTask(id: string) {
  return useApi(
    () => taskApiService.getTaskById(id),
    [id]
  );
}

export function useCreateTask() {
  return useApiMutation<Task, Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>(
    (task) => taskApiService.createTask(task)
  );
}

export function useUpdateTask() {
  return useApiMutation<Task, { id: string; task: Partial<Task> }>(
    ({ id, task }) => taskApiService.updateTask(id, task)
  );
}

export function useDeleteTask() {
  return useApiMutation<void, string>(
    (id) => taskApiService.deleteTask(id)
  );
}

export function usePaginatedTasks(initialParams?: PaginationParams) {
  return usePaginatedApi<Task>(
    (params) => taskApiService.getTasks(params),
    initialParams
  );
}

export function useSearchTasks() {
  return useSearchApi<Task>(
    (query, params) => taskApiService.searchTasks(query, undefined, params)
  );
}

export function useTasksByStory(storyId: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByStory(storyId, params),
    [storyId, JSON.stringify(params)]
  );
}

export function useTasksByStatus(status: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByStatus(status, params),
    [status, JSON.stringify(params)]
  );
}

export function useTasksByPriority(priority: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByPriority(priority, params),
    [priority, JSON.stringify(params)]
  );
}

export function useTasksByAssignee(assigneeId: string, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksByAssignee(assigneeId, params),
    [assigneeId, JSON.stringify(params)]
  );
}

export function useOverdueTasks(params?: PaginationParams) {
  return useApi(
    () => taskApiService.getOverdueTasks(params),
    [JSON.stringify(params)]
  );
}

export function useTasksDueSoon(days: number = 7, params?: PaginationParams) {
  return useApi(
    () => taskApiService.getTasksDueSoon(days, params),
    [days, JSON.stringify(params)]
  );
}

export function useUpdateTaskStatus() {
  return useApiMutation<Task, { id: string; status: string }>(
    ({ id, status }) => taskApiService.updateTaskStatus(id, status)
  );
}

export function useUpdateTaskAssignee() {
  return useApiMutation<Task, { id: string; assigneeId: string }>(
    ({ id, assigneeId }) => taskApiService.updateTaskAssignee(id, assigneeId)
  );
}

export function useLogTaskTime() {
  return useApiMutation<Task, { id: string; hours: number; description?: string }>(
    ({ id, hours, description }) => taskApiService.logTime(id, hours, description)
  );
}

// Subtask Hooks
export function useSubtasks(params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasks(params),
    [JSON.stringify(params)]
  );
}

export function useSubtask(id: string) {
  return useApi(
    () => subtaskApiService.getSubtaskById(id),
    [id]
  );
}

export function useCreateSubtask() {
  return useApiMutation<Subtask, Omit<Subtask, 'id' | 'createdAt' | 'updatedAt'>>(
    (subtask) => subtaskApiService.createSubtask(subtask)
  );
}

export function useUpdateSubtask() {
  return useApiMutation<Subtask, { id: string; subtask: Partial<Subtask> }>(
    ({ id, subtask }) => subtaskApiService.updateSubtask(id, subtask)
  );
}

export function useDeleteSubtask() {
  return useApiMutation<void, string>(
    (id) => subtaskApiService.deleteSubtask(id)
  );
}

export function usePaginatedSubtasks(initialParams?: PaginationParams) {
  return usePaginatedApi<Subtask>(
    (params) => subtaskApiService.getSubtasks(params),
    initialParams
  );
}

export function useSearchSubtasks() {
  return useSearchApi<Subtask>(
    (query, params) => subtaskApiService.searchSubtasks(query, undefined, params)
  );
}

export function useSubtasksByTask(taskId: string, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksByTask(taskId, params),
    [taskId, JSON.stringify(params)]
  );
}

export function useSubtasksByCompletion(isCompleted: boolean, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksByCompletion(isCompleted, params),
    [isCompleted, JSON.stringify(params)]
  );
}

export function useSubtasksByAssignee(assigneeId: string, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksByAssignee(assigneeId, params),
    [assigneeId, JSON.stringify(params)]
  );
}

export function useOverdueSubtasks(params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getOverdueSubtasks(params),
    [JSON.stringify(params)]
  );
}

export function useSubtasksDueSoon(days: number = 7, params?: PaginationParams) {
  return useApi(
    () => subtaskApiService.getSubtasksDueSoon(days, params),
    [days, JSON.stringify(params)]
  );
}

export function useUpdateSubtaskCompletion() {
  return useApiMutation<Subtask, { id: string; isCompleted: boolean }>(
    ({ id, isCompleted }) => subtaskApiService.updateSubtaskCompletion(id, isCompleted)
  );
}

export function useUpdateSubtaskAssignee() {
  return useApiMutation<Subtask, { id: string; assigneeId: string }>(
    ({ id, assigneeId }) => subtaskApiService.updateSubtaskAssignee(id, assigneeId)
  );
}

export function useBulkUpdateSubtaskCompletion() {
  return useApiMutation<Subtask[], { subtaskIds: string[]; isCompleted: boolean }>(
    ({ subtaskIds, isCompleted }) => subtaskApiService.bulkUpdateSubtaskCompletion(subtaskIds, isCompleted)
  );
}

export function useLogSubtaskTime() {
  return useApiMutation<Subtask, { id: string; hours: number; description?: string }>(
    ({ id, hours, description }) => subtaskApiService.logTime(id, hours, description)
  );
}
