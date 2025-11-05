package com.sprintsync.api.service;

import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.Notification;
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

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all tasks with pagination
     */
    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable);
    }

    /**
     * Get task by ID
     * Preserves custom lane status values by fetching raw status from database
     */
    public Task getTaskById(String id) {
        Task task = taskRepository.findById(id).orElse(null);
        if (task != null) {
            try {
                String rawStatus = taskRepository.findStatusById(id);
                if (rawStatus != null) {
                    // Set the raw status if it's a custom lane status or if it doesn't match the converted status
                    if (rawStatus.startsWith("custom_lane_")) {
                        task.setRawStatus(rawStatus);
                    } else {
                        // Check if the raw status matches the converted status
                        try {
                            TaskStatus enumStatus = TaskStatus.fromValue(rawStatus);
                            // If conversion succeeds, check if it matches
                            if (!enumStatus.equals(task.getStatus())) {
                                // Status doesn't match, might be a custom value
                                task.setRawStatus(rawStatus);
                            }
                        } catch (IllegalArgumentException e) {
                            // Not a valid enum value, treat as custom
                            task.setRawStatus(rawStatus);
                        }
                    }
                }
            } catch (Exception e) {
                // If we can't get raw status, continue with converted status
                System.err.println("Error getting raw status for task " + id + ": " + e.getMessage());
            }
        }
        return task;
    }

    /**
     * Create a new task
     */
    public Task createTask(Task task) {
        if (task.getId() == null) {
            task.setId(idGenerationService.generateTaskId());
        }
        
        // Always auto-assign task number to ensure sequential numbering within each story
        // If taskNumber is null, 0, or 1 (default), calculate the next sequential number
        boolean shouldAutoAssign = task.getTaskNumber() == null || 
                                   task.getTaskNumber() == 0 || 
                                   task.getTaskNumber() == 1;
        
        if (shouldAutoAssign && task.getStoryId() != null) {
            Integer maxTaskNumber = taskRepository.findMaxTaskNumberByStoryId(task.getStoryId());
            if (maxTaskNumber == null) {
                maxTaskNumber = 0;
            }
            // Set to next number (maxTaskNumber + 1)
            // If maxTaskNumber is 0 and taskNumber was already 1, this sets it to 1 (no change, but explicit)
            // If maxTaskNumber is 2 and taskNumber was 1 (default), this sets it to 3 (correct next number)
            task.setTaskNumber(maxTaskNumber + 1);
        }
        
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        
        // Create notification if task is created with an assignee
        if (savedTask.getAssigneeId() != null && !savedTask.getAssigneeId().isEmpty()) {
            try {
                String title = "New Task Assignment";
                String message = "You have been assigned to task: " + savedTask.getTitle();
                notificationService.createNotification(
                    savedTask.getAssigneeId(),
                    title,
                    message,
                    "task",
                    "task",
                    savedTask.getId()
                );
            } catch (Exception e) {
                // Log error but don't fail the task creation
                System.err.println("Failed to create notification for task creation: " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        return savedTask;
    }

    /**
     * Update an existing task
     */
    public Task updateTask(Task task) {
        if (taskRepository.existsById(task.getId())) {
            Optional<Task> existingTaskOpt = taskRepository.findById(task.getId());
            if (existingTaskOpt.isPresent()) {
                Task existingTask = existingTaskOpt.get();
                String oldAssigneeId = existingTask.getAssigneeId();
                String newAssigneeId = task.getAssigneeId();
                
                // Check if assignee changed and create notification
                if (newAssigneeId != null && !newAssigneeId.isEmpty() && 
                    !newAssigneeId.equals(oldAssigneeId)) {
                    // Assignee changed, create notification
                    try {
                        String title = "New Task Assignment";
                        String message = "You have been assigned to task: " + task.getTitle();
                        System.out.println("Creating notification for user: " + newAssigneeId + ", task: " + task.getTitle());
                        Notification createdNotification = notificationService.createNotification(
                            newAssigneeId,
                            title,
                            message,
                            "task",
                            "task",
                            task.getId()
                        );
                        System.out.println("Notification created successfully: " + createdNotification.getId());
                    } catch (Exception e) {
                        // Log error but don't fail the update
                        System.err.println("Failed to create notification for task assignment: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
            
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
     * Preserves custom lane status values by fetching raw status from database
     */
    public List<Task> getTasksByStoryId(String storyId) {
        List<Task> tasks = taskRepository.findByStoryId(storyId);
        
        // For each task, get the raw status from database and set it if it's a custom lane status
        tasks.forEach(task -> {
            try {
                String rawStatus = taskRepository.findStatusById(task.getId());
                if (rawStatus != null) {
                    // Set the raw status if it's a custom lane status or if it doesn't match the converted status
                    if (rawStatus.startsWith("custom_lane_")) {
                        task.setRawStatus(rawStatus);
                    } else {
                        // Check if the raw status matches the converted status
                        // If not, it might be a custom status
                        try {
                            TaskStatus enumStatus = TaskStatus.fromValue(rawStatus);
                            // If conversion succeeds, check if it matches
                            if (!enumStatus.equals(task.getStatus())) {
                                // Status doesn't match, might be a custom value
                                task.setRawStatus(rawStatus);
                            }
                        } catch (IllegalArgumentException e) {
                            // Not a valid enum value, treat as custom
                            task.setRawStatus(rawStatus);
                        }
                    }
                }
            } catch (Exception e) {
                // If we can't get raw status, continue with converted status
                // Log error for debugging
                System.err.println("Error getting raw status for task " + task.getId() + ": " + e.getMessage());
            }
        });
        
        return tasks;
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
     * Supports both standard TaskStatus enum values and custom lane status values (strings)
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
     * Update task status with custom string value (for custom workflow lanes)
     */
    public Task updateTaskStatus(String id, String statusValue) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isPresent()) {
            Task task = optionalTask.get();
            try {
                // Try to convert to TaskStatus enum
                TaskStatus status = TaskStatus.fromValue(statusValue);
                task.setStatus(status);
                task.setUpdatedAt(LocalDateTime.now());
                return taskRepository.save(task);
            } catch (IllegalArgumentException e) {
                // If it's a custom lane status (starts with "custom_lane_"), 
                // we need to store it directly in the database using native query
                // The TaskStatusConverter will handle reading it back
                taskRepository.updateTaskStatusDirectly(id, statusValue);
                // Return the updated task
                return taskRepository.findById(id).orElse(null);
            }
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
            Task savedTask = taskRepository.save(task);
            
            // Create notification for the assigned user
            if (assigneeId != null && !assigneeId.isEmpty()) {
                try {
                    String title = "New Task Assignment";
                    String message = "You have been assigned to task: " + task.getTitle();
                    System.out.println("Creating notification for user: " + assigneeId + ", task: " + task.getTitle());
                    Notification createdNotification = notificationService.createNotification(
                        assigneeId,
                        title,
                        message,
                        "task",
                        "task",
                        task.getId()
                    );
                    System.out.println("Notification created successfully: " + createdNotification.getId());
                } catch (Exception e) {
                    // Log error but don't fail the assignment
                    System.err.println("Failed to create notification for task assignment: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            return savedTask;
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
