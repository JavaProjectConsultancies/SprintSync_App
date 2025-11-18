package com.sprintsync.api.controller;

import com.sprintsync.api.service.BatchOperationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Batch Operations.
 * Provides endpoints for bulk operations across entities.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/batch")
@CrossOrigin(origins = "*")
public class BatchOperationsController {

    @Autowired
    private BatchOperationsService batchOperationsService;

    /**
     * Bulk update task status
     */
    @PatchMapping("/tasks/status")
    public ResponseEntity<Map<String, Object>> bulkUpdateTaskStatus(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkUpdate.get("taskIds");
            String newStatus = (String) bulkUpdate.get("status");
            Map<String, Object> result = batchOperationsService.bulkUpdateTaskStatus(taskIds, newStatus);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk assign tasks
     */
    @PatchMapping("/tasks/assign")
    public ResponseEntity<Map<String, Object>> bulkAssignTasks(@RequestBody Map<String, Object> bulkAssignment) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkAssignment.get("taskIds");
            String assigneeId = (String) bulkAssignment.get("assigneeId");
            Map<String, Object> result = batchOperationsService.bulkAssignTasks(taskIds, assigneeId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk delete tasks
     */
    @DeleteMapping("/tasks")
    public ResponseEntity<Map<String, Object>> bulkDeleteTasks(@RequestBody Map<String, Object> bulkDelete) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkDelete.get("taskIds");
            Map<String, Object> result = batchOperationsService.bulkDeleteTasks(taskIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update subtask status
     */
    @PatchMapping("/subtasks/completion")
    public ResponseEntity<Map<String, Object>> bulkUpdateSubtaskCompletion(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> subtaskIds = (List<String>) bulkUpdate.get("subtaskIds");
            Boolean isCompleted = (Boolean) bulkUpdate.get("isCompleted");
            Map<String, Object> result = batchOperationsService.bulkUpdateSubtaskCompletion(subtaskIds, isCompleted);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk assign subtasks
     */
    @PatchMapping("/subtasks/assign")
    public ResponseEntity<Map<String, Object>> bulkAssignSubtasks(@RequestBody Map<String, Object> bulkAssignment) {
        try {
            @SuppressWarnings("unchecked")
            List<String> subtaskIds = (List<String>) bulkAssignment.get("subtaskIds");
            String assigneeId = (String) bulkAssignment.get("assigneeId");
            Map<String, Object> result = batchOperationsService.bulkAssignSubtasks(subtaskIds, assigneeId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk delete subtasks
     */
    @DeleteMapping("/subtasks")
    public ResponseEntity<Map<String, Object>> bulkDeleteSubtasks(@RequestBody Map<String, Object> bulkDelete) {
        try {
            @SuppressWarnings("unchecked")
            List<String> subtaskIds = (List<String>) bulkDelete.get("subtaskIds");
            Map<String, Object> result = batchOperationsService.bulkDeleteSubtasks(subtaskIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update story status
     */
    @PatchMapping("/stories/status")
    public ResponseEntity<Map<String, Object>> bulkUpdateStoryStatus(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> storyIds = (List<String>) bulkUpdate.get("storyIds");
            String newStatus = (String) bulkUpdate.get("status");
            Map<String, Object> result = batchOperationsService.bulkUpdateStoryStatus(storyIds, newStatus);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk assign stories
     */
    @PatchMapping("/stories/assign")
    public ResponseEntity<Map<String, Object>> bulkAssignStories(@RequestBody Map<String, Object> bulkAssignment) {
        try {
            @SuppressWarnings("unchecked")
            List<String> storyIds = (List<String>) bulkAssignment.get("storyIds");
            String assigneeId = (String) bulkAssignment.get("assigneeId");
            Map<String, Object> result = batchOperationsService.bulkAssignStories(storyIds, assigneeId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk delete stories
     */
    @DeleteMapping("/stories")
    public ResponseEntity<Map<String, Object>> bulkDeleteStories(@RequestBody Map<String, Object> bulkDelete) {
        try {
            @SuppressWarnings("unchecked")
            List<String> storyIds = (List<String>) bulkDelete.get("storyIds");
            Map<String, Object> result = batchOperationsService.bulkDeleteStories(storyIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update sprint status
     */
    @PatchMapping("/sprints/status")
    public ResponseEntity<Map<String, Object>> bulkUpdateSprintStatus(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> sprintIds = (List<String>) bulkUpdate.get("sprintIds");
            String newStatus = (String) bulkUpdate.get("status");
            Map<String, Object> result = batchOperationsService.bulkUpdateSprintStatus(sprintIds, newStatus);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk delete sprints
     */
    @DeleteMapping("/sprints")
    public ResponseEntity<Map<String, Object>> bulkDeleteSprints(@RequestBody Map<String, Object> bulkDelete) {
        try {
            @SuppressWarnings("unchecked")
            List<String> sprintIds = (List<String>) bulkDelete.get("sprintIds");
            Map<String, Object> result = batchOperationsService.bulkDeleteSprints(sprintIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk move tasks to sprint
     */
    @PatchMapping("/tasks/move-to-sprint")
    public ResponseEntity<Map<String, Object>> bulkMoveTasksToSprint(@RequestBody Map<String, Object> bulkMove) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkMove.get("taskIds");
            String sprintId = (String) bulkMove.get("sprintId");
            Map<String, Object> result = batchOperationsService.bulkMoveTasksToSprint(taskIds, sprintId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk move stories to sprint
     */
    @PatchMapping("/stories/move-to-sprint")
    public ResponseEntity<Map<String, Object>> bulkMoveStoriesToSprint(@RequestBody Map<String, Object> bulkMove) {
        try {
            @SuppressWarnings("unchecked")
            List<String> storyIds = (List<String>) bulkMove.get("storyIds");
            String sprintId = (String) bulkMove.get("sprintId");
            Map<String, Object> result = batchOperationsService.bulkMoveStoriesToSprint(storyIds, sprintId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk move tasks to project
     */
    @PatchMapping("/tasks/move-to-project")
    public ResponseEntity<Map<String, Object>> bulkMoveTasksToProject(@RequestBody Map<String, Object> bulkMove) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkMove.get("taskIds");
            String projectId = (String) bulkMove.get("projectId");
            Map<String, Object> result = batchOperationsService.bulkMoveTasksToProject(taskIds, projectId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk move stories to project
     */
    @PatchMapping("/stories/move-to-project")
    public ResponseEntity<Map<String, Object>> bulkMoveStoriesToProject(@RequestBody Map<String, Object> bulkMove) {
        try {
            @SuppressWarnings("unchecked")
            List<String> storyIds = (List<String>) bulkMove.get("storyIds");
            String projectId = (String) bulkMove.get("projectId");
            Map<String, Object> result = batchOperationsService.bulkMoveStoriesToProject(storyIds, projectId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update task priority
     */
    @PatchMapping("/tasks/priority")
    public ResponseEntity<Map<String, Object>> bulkUpdateTaskPriority(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> taskIds = (List<String>) bulkUpdate.get("taskIds");
            String newPriority = (String) bulkUpdate.get("priority");
            Map<String, Object> result = batchOperationsService.bulkUpdateTaskPriority(taskIds, newPriority);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update subtask priority
     */
    @PatchMapping("/subtasks/priority")
    public ResponseEntity<Map<String, Object>> bulkUpdateSubtaskPriority(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> subtaskIds = (List<String>) bulkUpdate.get("subtaskIds");
            String newPriority = (String) bulkUpdate.get("priority");
            Map<String, Object> result = batchOperationsService.bulkUpdateSubtaskPriority(subtaskIds, newPriority);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update story priority
     */
    @PatchMapping("/stories/priority")
    public ResponseEntity<Map<String, Object>> bulkUpdateStoryPriority(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            @SuppressWarnings("unchecked")
            List<String> storyIds = (List<String>) bulkUpdate.get("storyIds");
            String newPriority = (String) bulkUpdate.get("priority");
            Map<String, Object> result = batchOperationsService.bulkUpdateStoryPriority(storyIds, newPriority);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk create tasks
     */
    @PostMapping("/tasks")
    public ResponseEntity<Map<String, Object>> bulkCreateTasks(@RequestBody Map<String, Object> bulkCreate) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> taskData = (List<Map<String, Object>>) bulkCreate.get("tasks");
            Map<String, Object> result = batchOperationsService.bulkCreateTasks(taskData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk create subtasks
     */
    @PostMapping("/subtasks")
    public ResponseEntity<Map<String, Object>> bulkCreateSubtasks(@RequestBody Map<String, Object> bulkCreate) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> subtaskData = (List<Map<String, Object>>) bulkCreate.get("subtasks");
            Map<String, Object> result = batchOperationsService.bulkCreateSubtasks(subtaskData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk create stories
     */
    @PostMapping("/stories")
    public ResponseEntity<Map<String, Object>> bulkCreateStories(@RequestBody Map<String, Object> bulkCreate) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> storyData = (List<Map<String, Object>>) bulkCreate.get("stories");
            Map<String, Object> result = batchOperationsService.bulkCreateStories(storyData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk export data
     */
    @PostMapping("/export")
    public ResponseEntity<Map<String, Object>> bulkExportData(@RequestBody Map<String, Object> exportRequest) {
        try {
            String entityType = (String) exportRequest.get("entityType");
            @SuppressWarnings("unchecked")
            List<String> entityIds = (List<String>) exportRequest.get("entityIds");
            String format = (String) exportRequest.get("format");
            Map<String, Object> result = batchOperationsService.bulkExportData(entityType, entityIds, format);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk import data
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> bulkImportData(@RequestBody Map<String, Object> importRequest) {
        try {
            String entityType = (String) importRequest.get("entityType");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> entityData = (List<Map<String, Object>>) importRequest.get("data");
            Map<String, Object> result = batchOperationsService.bulkImportData(entityType, entityData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update tags
     */
    @PatchMapping("/tags")
    public ResponseEntity<Map<String, Object>> bulkUpdateTags(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            String entityType = (String) bulkUpdate.get("entityType");
            @SuppressWarnings("unchecked")
            List<String> entityIds = (List<String>) bulkUpdate.get("entityIds");
            String tags = (String) bulkUpdate.get("tags");
            Map<String, Object> result = batchOperationsService.bulkUpdateTags(entityType, entityIds, tags);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Bulk update due dates
     */
    @PatchMapping("/due-dates")
    public ResponseEntity<Map<String, Object>> bulkUpdateDueDates(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            String entityType = (String) bulkUpdate.get("entityType");
            @SuppressWarnings("unchecked")
            List<String> entityIds = (List<String>) bulkUpdate.get("entityIds");
            String dueDate = (String) bulkUpdate.get("dueDate");
            Map<String, Object> result = batchOperationsService.bulkUpdateDueDates(entityType, entityIds, dueDate);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get batch operation status
     */
    @GetMapping("/status/{operationId}")
    public ResponseEntity<Map<String, Object>> getBatchOperationStatus(@PathVariable String operationId) {
        try {
            Map<String, Object> status = batchOperationsService.getBatchOperationStatus(operationId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Cancel batch operation
     */
    @PostMapping("/cancel/{operationId}")
    public ResponseEntity<Map<String, Object>> cancelBatchOperation(@PathVariable String operationId) {
        try {
            Map<String, Object> result = batchOperationsService.cancelBatchOperation(operationId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}



