package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.math.BigDecimal;
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Task management operations.
 * Provides endpoints for CRUD operations on Task entities.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * Get all tasks with pagination
     */
    @GetMapping
    public ResponseEntity<Page<Task>> getAllTasks(Pageable pageable) {
        try {
            Page<Task> tasks = taskService.getAllTasks(pageable);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get task by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        try {
            Task task = taskService.getTaskById(id);
            if (task != null) {
                return ResponseEntity.ok(task);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new task
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        try {
            Task createdTask = taskService.createTask(task);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update an existing task
     */
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @Valid @RequestBody Task task) {
        try {
            task.setId(id);
            Task updatedTask = taskService.updateTask(task);
            if (updatedTask != null) {
                return ResponseEntity.ok(updatedTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete a task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        try {
            boolean deleted = taskService.deleteTask(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by story ID
     */
    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<Task>> getTasksByStoryId(@PathVariable String storyId) {
        try {
            List<Task> tasks = taskService.getTasksByStoryId(storyId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by assignee ID
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Task>> getTasksByAssigneeId(@PathVariable String assigneeId) {
        try {
            List<Task> tasks = taskService.getTasksByAssigneeId(assigneeId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        try {
            List<Task> tasks = taskService.getTasksByStatus(status);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Task>> getTasksByPriority(@PathVariable String priority) {
        try {
            List<Task> tasks = taskService.getTasksByPriority(priority);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update task status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable String id, @RequestBody Map<String, TaskStatus> statusUpdate) {
        try {
            TaskStatus newStatus = statusUpdate.get("status");
            Task updatedTask = taskService.updateTaskStatus(id, newStatus);
            if (updatedTask != null) {
                return ResponseEntity.ok(updatedTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Assign task to user
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Task> assignTask(@PathVariable String id, @RequestBody Map<String, String> assignment) {
        try {
            String assigneeId = assignment.get("assigneeId");
            Task updatedTask = taskService.assignTask(id, assigneeId);
            if (updatedTask != null) {
                return ResponseEntity.ok(updatedTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
<<<<<<< HEAD
     * Update task actual hours (for effort logging)
     */
    @PatchMapping("/{id}/actual-hours")
    public ResponseEntity<Task> updateTaskActualHours(@PathVariable String id, @RequestBody Map<String, Object> update) {
        try {
            Object actualHoursObj = update.get("actualHours");
            BigDecimal actualHours;
            
            // Convert to BigDecimal, handling both Integer and Double types
            if (actualHoursObj instanceof Integer) {
                actualHours = BigDecimal.valueOf((Integer) actualHoursObj);
            } else if (actualHoursObj instanceof Double) {
                actualHours = BigDecimal.valueOf((Double) actualHoursObj);
            } else if (actualHoursObj instanceof BigDecimal) {
                actualHours = (BigDecimal) actualHoursObj;
            } else {
                return ResponseEntity.badRequest().build();
            }
            
            Task updatedTask = taskService.updateTaskActualHours(id, actualHours);
            if (updatedTask != null) {
                return ResponseEntity.ok(updatedTask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
     * Get task statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getTaskStatistics() {
        try {
            Map<String, Object> statistics = taskService.getTaskStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get overdue tasks
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<Task>> getOverdueTasks() {
        try {
            List<Task> overdueTasks = taskService.getOverdueTasks();
            return ResponseEntity.ok(overdueTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks due soon (within specified days)
     */
    @GetMapping("/due-soon/{days}")
    public ResponseEntity<List<Task>> getTasksDueSoon(@PathVariable int days) {
        try {
            List<Task> tasksDueSoon = taskService.getTasksDueSoon(days);
            return ResponseEntity.ok(tasksDueSoon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search tasks by title or description
     */
    @GetMapping("/search")
    public ResponseEntity<List<Task>> searchTasks(@RequestParam String query) {
        try {
            List<Task> tasks = taskService.searchTasks(query);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by sprint ID
     */
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Task>> getTasksBySprintId(@PathVariable String sprintId) {
        try {
            List<Task> tasks = taskService.getTasksBySprintId(sprintId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get tasks by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProjectId(@PathVariable String projectId) {
        try {
            List<Task> tasks = taskService.getTasksByProjectId(projectId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Bulk update task status
     */
    @PatchMapping("/bulk/status")
    public ResponseEntity<List<Task>> bulkUpdateTaskStatus(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkUpdate.get("taskIds");
            TaskStatus newStatus = TaskStatus.valueOf((String) bulkUpdate.get("status"));
            List<Task> updatedTasks = taskService.bulkUpdateTaskStatus(taskIds, newStatus);
            return ResponseEntity.ok(updatedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get task progress by story
     */
    @GetMapping("/progress/story/{storyId}")
    public ResponseEntity<Map<String, Object>> getTaskProgressByStory(@PathVariable String storyId) {
        try {
            Map<String, Object> progress = taskService.getTaskProgressByStory(storyId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get task progress by sprint
     */
    @GetMapping("/progress/sprint/{sprintId}")
    public ResponseEntity<Map<String, Object>> getTaskProgressBySprint(@PathVariable String sprintId) {
        try {
            Map<String, Object> progress = taskService.getTaskProgressBySprint(sprintId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
