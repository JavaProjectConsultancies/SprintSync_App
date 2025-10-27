package com.sprintsync.api.service;

import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for Task management operations.
 * Provides business logic for Task entities.
 * 
 * @author Mayuresh G
 */
@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    /**
     * Get all tasks with pagination
     */
    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable);
    }

    /**
     * Get task by ID
     */
    public Task getTaskById(String id) {
        return taskRepository.findById(id).orElse(null);
    }

    /**
     * Create a new task
     */
    public Task createTask(Task task) {
        if (task.getId() == null) {
            task.setId(idGenerationService.generateTaskId());
        }
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    /**
     * Update an existing task
     */
    public Task updateTask(Task task) {
        if (taskRepository.existsById(task.getId())) {
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepository.save(task);
        }
        return null;
    }

    /**
     * Delete a task
     */
    public boolean deleteTask(String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get tasks by story ID
     */
    public List<Task> getTasksByStoryId(String storyId) {
        return taskRepository.findByStoryId(storyId);
    }

    /**
     * Get tasks by assignee ID
     */
    public List<Task> getTasksByAssigneeId(String assigneeId) {
        return taskRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Get tasks by status
     */
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    /**
     * Get tasks by priority
     */
    public List<Task> getTasksByPriority(String priority) {
        return taskRepository.findByPriority(priority);
    }

    /**
     * Update task status
     */
    public Task updateTaskStatus(String id, TaskStatus status) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setStatus(status);
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepository.save(task);
        }
        return null;
    }

    /**
     * Assign task to user
     */
    public Task assignTask(String id, String assigneeId) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setAssigneeId(assigneeId);
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepository.save(task);
        }
        return null;
    }

    /**
     * Update task actual hours (for effort logging)
     */
    public Task updateTaskActualHours(String id, java.math.BigDecimal actualHours) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            task.setActualHours(actualHours);
            task.setUpdatedAt(LocalDateTime.now());
            return taskRepository.save(task);
        }
        return null;
    }

    /**
     * Get task statistics
     */
    public Map<String, Object> getTaskStatistics() {
        List<Task> allTasks = taskRepository.findAll();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalTasks", allTasks.size());
        
        Map<TaskStatus, Long> statusCount = allTasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        statistics.put("statusCount", statusCount);
        
        Map<String, Long> priorityCount = allTasks.stream()
            .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        statistics.put("priorityCount", priorityCount);
        
        // Overdue tasks
        long overdueTasks = allTasks.stream()
            .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
            .filter(task -> task.getStatus() != TaskStatus.DONE)
            .count();
        statistics.put("overdueTasks", overdueTasks);
        
        return statistics;
    }

    /**
     * Get overdue tasks
     */
    public List<Task> getOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        return taskRepository.findAll().stream()
            .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(now.toLocalDate()))
            .filter(task -> task.getStatus() != TaskStatus.DONE)
            .collect(Collectors.toList());
    }

    /**
     * Get tasks due soon
     */
    public List<Task> getTasksDueSoon(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueSoon = now.plusDays(days);
        
        return taskRepository.findAll().stream()
            .filter(task -> task.getDueDate() != null)
            .filter(task -> task.getDueDate().isAfter(now.toLocalDate()) && task.getDueDate().isBefore(dueSoon.toLocalDate()))
            .filter(task -> task.getStatus() != TaskStatus.DONE)
            .collect(Collectors.toList());
    }

    /**
     * Search tasks by title or description
     */
    public List<Task> searchTasks(String query) {
        return taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    /**
     * Get tasks by sprint ID
     */
    public List<Task> getTasksBySprintId(String sprintId) {
        // Note: Task entity doesn't have sprintId field - tasks are related to sprints through stories
        // This would need to be implemented by finding stories by sprintId first, then tasks by storyId
        return Collections.emptyList();
    }

    /**
     * Get tasks by project ID
     */
    public List<Task> getTasksByProjectId(String projectId) {
        // Note: Task entity doesn't have projectId field - tasks are related to projects through stories
        // This would need to be implemented by finding stories by projectId first, then tasks by storyId
        return Collections.emptyList();
    }

    /**
     * Bulk update task status
     */
    public List<Task> bulkUpdateTaskStatus(List<String> taskIds, TaskStatus status) {
        List<Task> updatedTasks = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (String taskId : taskIds) {
            Optional<Task> optionalTask = taskRepository.findById(taskId);
            if (optionalTask.isPresent()) {
                Task task = optionalTask.get();
                task.setStatus(status);
                task.setUpdatedAt(now);
                updatedTasks.add(taskRepository.save(task));
            }
        }
        
        return updatedTasks;
    }

    /**
     * Get task progress by story
     */
    public Map<String, Object> getTaskProgressByStory(String storyId) {
        List<Task> tasks = getTasksByStoryId(storyId);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("totalTasks", tasks.size());
        
        if (tasks.isEmpty()) {
            progress.put("completionPercentage", 0.0);
            progress.put("statusCount", new HashMap<>());
            return progress;
        }
        
        Map<TaskStatus, Long> statusCount = tasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        progress.put("statusCount", statusCount);
        
        long completedTasks = statusCount.getOrDefault(TaskStatus.DONE, 0L);
        double completionPercentage = (double) completedTasks / tasks.size() * 100;
        progress.put("completionPercentage", Math.round(completionPercentage * 100.0) / 100.0);
        
        return progress;
    }

    /**
     * Get task progress by sprint
     */
    public Map<String, Object> getTaskProgressBySprint(String sprintId) {
        List<Task> tasks = getTasksBySprintId(sprintId);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("totalTasks", tasks.size());
        
        if (tasks.isEmpty()) {
            progress.put("completionPercentage", 0.0);
            progress.put("statusCount", new HashMap<>());
            return progress;
        }
        
        Map<TaskStatus, Long> statusCount = tasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        progress.put("statusCount", statusCount);
        
        long completedTasks = statusCount.getOrDefault(TaskStatus.DONE, 0L);
        double completionPercentage = (double) completedTasks / tasks.size() * 100;
        progress.put("completionPercentage", Math.round(completionPercentage * 100.0) / 100.0);
        
        return progress;
    }

    /**
     * Get tasks by epic ID
     */
    public List<Task> getTasksByEpicId(String epicId) {
        // Note: Task entity doesn't have epicId field - tasks are related to epics through stories
        // This would need to be implemented by finding stories by epicId first, then tasks by storyId
        return Collections.emptyList();
    }

    /**
     * Get tasks by release ID
     */
    public List<Task> getTasksByReleaseId(String releaseId) {
        // Note: Task entity doesn't have releaseId field - tasks are related to releases through stories
        // This would need to be implemented by finding stories by releaseId first, then tasks by storyId
        return Collections.emptyList();
    }

    /**
     * Get tasks created in date range
     */
    public List<Task> getTasksCreatedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return taskRepository.findByCreatedAtBetween(startDate, endDate);
    }

    /**
     * Get tasks updated in date range
     */
    public List<Task> getTasksUpdatedBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return taskRepository.findByUpdatedAtBetween(startDate, endDate);
    }

    /**
     * Get task count by status
     */
    public long getTaskCountByStatus(TaskStatus status) {
        return taskRepository.countByStatus(status);
    }

    /**
     * Get task count by priority
     */
    public long getTaskCountByPriority(String priority) {
        return taskRepository.countByPriority(priority);
    }
}
