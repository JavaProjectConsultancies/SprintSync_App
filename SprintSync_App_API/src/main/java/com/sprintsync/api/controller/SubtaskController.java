package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Subtask;
import com.sprintsync.api.service.SubtaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Subtask management operations.
 * Provides endpoints for CRUD operations on Subtask entities.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/subtasks")
@CrossOrigin(origins = "*")
public class SubtaskController {

    @Autowired
    private SubtaskService subtaskService;

    /**
     * Get all subtasks with pagination
     */
    @GetMapping
    public ResponseEntity<Page<Subtask>> getAllSubtasks(Pageable pageable) {
        try {
            Page<Subtask> subtasks = subtaskService.getAllSubtasks(pageable);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtask by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Subtask> getSubtaskById(@PathVariable String id) {
        try {
            Subtask subtask = subtaskService.getSubtaskById(id);
            if (subtask != null) {
                return ResponseEntity.ok(subtask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new subtask
     */
    @PostMapping
    public ResponseEntity<Subtask> createSubtask(@Valid @RequestBody Subtask subtask) {
        try {
            Subtask createdSubtask = subtaskService.createSubtask(subtask);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSubtask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update an existing subtask
     */
    @PutMapping("/{id}")
    public ResponseEntity<Subtask> updateSubtask(@PathVariable String id, @Valid @RequestBody Subtask subtask) {
        try {
            subtask.setId(id);
            Subtask updatedSubtask = subtaskService.updateSubtask(subtask);
            if (updatedSubtask != null) {
                return ResponseEntity.ok(updatedSubtask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete a subtask
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubtask(@PathVariable String id) {
        try {
            boolean deleted = subtaskService.deleteSubtask(id);
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
     * Get subtasks by task ID
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Subtask>> getSubtasksByTaskId(@PathVariable String taskId) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByTaskId(taskId);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks by assignee ID
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Subtask>> getSubtasksByAssigneeId(@PathVariable String assigneeId) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByAssigneeId(assigneeId);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks by completion status
     */
    @GetMapping("/status/{isCompleted}")
    public ResponseEntity<List<Subtask>> getSubtasksByCompletionStatus(@PathVariable boolean isCompleted) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByCompletionStatus(isCompleted);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update subtask completion status
     */
    @PatchMapping("/{id}/completion")
    public ResponseEntity<Subtask> updateSubtaskCompletion(@PathVariable String id, @RequestBody Map<String, Boolean> completionUpdate) {
        try {
            Boolean isCompleted = completionUpdate.get("isCompleted");
            Subtask updatedSubtask = subtaskService.updateSubtaskCompletion(id, isCompleted);
            if (updatedSubtask != null) {
                return ResponseEntity.ok(updatedSubtask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Assign subtask to user
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Subtask> assignSubtask(@PathVariable String id, @RequestBody Map<String, String> assignment) {
        try {
            String assigneeId = assignment.get("assigneeId");
            Subtask updatedSubtask = subtaskService.assignSubtask(id, assigneeId);
            if (updatedSubtask != null) {
                return ResponseEntity.ok(updatedSubtask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
<<<<<<< HEAD
     * Update subtask actual hours (for effort logging)
     */
    @PatchMapping("/{id}/actual-hours")
    public ResponseEntity<Subtask> updateSubtaskActualHours(@PathVariable String id, @RequestBody Map<String, Object> update) {
        try {
            Object actualHoursObj = update.get("actualHours");
            java.math.BigDecimal actualHours;
            
            // Convert to BigDecimal, handling both Integer and Double types
            if (actualHoursObj instanceof Integer) {
                actualHours = java.math.BigDecimal.valueOf((Integer) actualHoursObj);
            } else if (actualHoursObj instanceof Double) {
                actualHours = java.math.BigDecimal.valueOf((Double) actualHoursObj);
            } else if (actualHoursObj instanceof java.math.BigDecimal) {
                actualHours = (java.math.BigDecimal) actualHoursObj;
            } else {
                return ResponseEntity.badRequest().build();
            }
            
            Subtask updatedSubtask = subtaskService.updateSubtaskActualHours(id, actualHours);
            if (updatedSubtask != null) {
                return ResponseEntity.ok(updatedSubtask);
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
     * Get subtask statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSubtaskStatistics() {
        try {
            Map<String, Object> statistics = subtaskService.getSubtaskStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtask progress by task
     */
    @GetMapping("/progress/task/{taskId}")
    public ResponseEntity<Map<String, Object>> getSubtaskProgressByTask(@PathVariable String taskId) {
        try {
            Map<String, Object> progress = subtaskService.getSubtaskProgressByTask(taskId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search subtasks by title or description
     */
    @GetMapping("/search")
    public ResponseEntity<List<Subtask>> searchSubtasks(@RequestParam String query) {
        try {
            List<Subtask> subtasks = subtaskService.searchSubtasks(query);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Bulk update subtask status
     */
    @PatchMapping("/bulk/completion")
    public ResponseEntity<List<Subtask>> bulkUpdateSubtaskCompletion(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> subtaskIds = (List<String>) bulkUpdate.get("subtaskIds");
            Boolean isCompleted = (Boolean) bulkUpdate.get("isCompleted");
            List<Subtask> updatedSubtasks = subtaskService.bulkUpdateSubtaskCompletion(subtaskIds, isCompleted);
            return ResponseEntity.ok(updatedSubtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get subtasks by priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Subtask>> getSubtasksByPriority(@PathVariable String priority) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByPriority(priority);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks by story ID
     */
    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<Subtask>> getSubtasksByStoryId(@PathVariable String storyId) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByStoryId(storyId);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks by sprint ID
     */
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Subtask>> getSubtasksBySprintId(@PathVariable String sprintId) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksBySprintId(sprintId);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Subtask>> getSubtasksByProjectId(@PathVariable String projectId) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByProjectId(projectId);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get unassigned subtasks
     */
    @GetMapping("/unassigned")
    public ResponseEntity<List<Subtask>> getUnassignedSubtasks() {
        try {
            List<Subtask> unassignedSubtasks = subtaskService.getUnassignedSubtasks();
            return ResponseEntity.ok(unassignedSubtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks due soon
     */
    @GetMapping("/due-soon/{days}")
    public ResponseEntity<List<Subtask>> getSubtasksDueSoon(@PathVariable int days) {
        try {
            List<Subtask> subtasksDueSoon = subtaskService.getSubtasksDueSoon(days);
            return ResponseEntity.ok(subtasksDueSoon);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get overdue subtasks
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<Subtask>> getOverdueSubtasks() {
        try {
            List<Subtask> overdueSubtasks = subtaskService.getOverdueSubtasks();
            return ResponseEntity.ok(overdueSubtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks by effort range
     */
    @GetMapping("/effort")
    public ResponseEntity<List<Subtask>> getSubtasksByEffortRange(
            @RequestParam(required = false) Integer minEffort,
            @RequestParam(required = false) Integer maxEffort) {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksByEffortRange(minEffort, maxEffort);
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtasks with time tracking
     */
    @GetMapping("/time-tracking")
    public ResponseEntity<List<Subtask>> getSubtasksWithTimeTracking() {
        try {
            List<Subtask> subtasks = subtaskService.getSubtasksWithTimeTracking();
            return ResponseEntity.ok(subtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get subtask dependencies
     */
    @GetMapping("/{id}/dependencies")
    public ResponseEntity<List<Subtask>> getSubtaskDependencies(@PathVariable String id) {
        try {
            List<Subtask> dependencies = subtaskService.getSubtaskDependencies(id);
            return ResponseEntity.ok(dependencies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Add dependency to subtask
     */
    @PostMapping("/{id}/dependencies")
    public ResponseEntity<Subtask> addSubtaskDependency(@PathVariable String id, @RequestBody Map<String, String> dependency) {
        try {
            String dependencyId = dependency.get("dependencyId");
            Subtask updatedSubtask = subtaskService.addSubtaskDependency(id, dependencyId);
            if (updatedSubtask != null) {
                return ResponseEntity.ok(updatedSubtask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Remove dependency from subtask
     */
    @DeleteMapping("/{id}/dependencies/{dependencyId}")
    public ResponseEntity<Subtask> removeSubtaskDependency(@PathVariable String id, @PathVariable String dependencyId) {
        try {
            Subtask updatedSubtask = subtaskService.removeSubtaskDependency(id, dependencyId);
            if (updatedSubtask != null) {
                return ResponseEntity.ok(updatedSubtask);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
