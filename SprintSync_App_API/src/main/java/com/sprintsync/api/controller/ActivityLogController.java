package com.sprintsync.api.controller;

import com.sprintsync.api.entity.ActivityLog;
import com.sprintsync.api.service.ActivityLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Activity Log management operations.
 * Provides endpoints for CRUD operations on ActivityLog entities.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/activity-logs")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    /**
     * Get all activity logs with pagination
     */
    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getAllActivityLogs(Pageable pageable) {
        try {
            Page<ActivityLog> activityLogs = activityLogService.getAllActivityLogs(pageable);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity log by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ActivityLog> getActivityLogById(@PathVariable String id) {
        try {
            ActivityLog activityLog = activityLogService.getActivityLogById(id);
            if (activityLog != null) {
                return ResponseEntity.ok(activityLog);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new activity log
     */
    @PostMapping
    public ResponseEntity<ActivityLog> createActivityLog(@RequestBody ActivityLog activityLog) {
        try {
            ActivityLog createdActivityLog = activityLogService.createActivityLog(activityLog);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdActivityLog);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete an activity log
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityLog(@PathVariable String id) {
        try {
            boolean deleted = activityLogService.deleteActivityLog(id);
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
     * Get activity logs by entity type and ID
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getActivityLogsByEntity(entityType, entityId);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs by entity type and ID with pagination
     */
    @GetMapping("/entity/{entityType}/{entityId}/paginated")
    public ResponseEntity<Page<ActivityLog>> getActivityLogsByEntityPaginated(
            @PathVariable String entityType,
            @PathVariable String entityId,
            Pageable pageable) {
        try {
            Page<ActivityLog> activityLogs = activityLogService.getActivityLogsByEntity(entityType, entityId, pageable);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs by user ID
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByUser(@PathVariable String userId) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getActivityLogsByUser(userId);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs by user ID with pagination
     */
    @GetMapping("/user/{userId}/paginated")
    public ResponseEntity<Page<ActivityLog>> getActivityLogsByUserPaginated(
            @PathVariable String userId,
            Pageable pageable) {
        try {
            Page<ActivityLog> activityLogs = activityLogService.getActivityLogsByUser(userId, pageable);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs by entity type
     */
    @GetMapping("/type/{entityType}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByEntityType(@PathVariable String entityType) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getActivityLogsByEntityType(entityType);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs by entity type with pagination
     */
    @GetMapping("/type/{entityType}/paginated")
    public ResponseEntity<Page<ActivityLog>> getActivityLogsByEntityTypePaginated(
            @PathVariable String entityType,
            Pageable pageable) {
        try {
            Page<ActivityLog> activityLogs = activityLogService.getActivityLogsByEntityType(entityType, pageable);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs by action
     */
    @GetMapping("/action/{action}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByAction(@PathVariable String action) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getActivityLogsByAction(action);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs within date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getActivityLogsByDateRange(startDate, endDate);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity logs within date range with pagination
     */
    @GetMapping("/date-range/paginated")
    public ResponseEntity<Page<ActivityLog>> getActivityLogsByDateRangePaginated(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        try {
            Page<ActivityLog> activityLogs = activityLogService.getActivityLogsByDateRange(startDate, endDate, pageable);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent activity logs for a user
     */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<ActivityLog>> getRecentActivityByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getRecentActivityByUser(userId, days);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent activity logs for an entity
     */
    @GetMapping("/entity/{entityType}/{entityId}/recent")
    public ResponseEntity<List<ActivityLog>> getRecentActivityByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<ActivityLog> activityLogs = activityLogService.getRecentActivityByEntity(entityType, entityId, days);
            return ResponseEntity.ok(activityLogs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Count activity logs by entity
     */
    @GetMapping("/entity/{entityType}/{entityId}/count")
    public ResponseEntity<Long> countActivityLogsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            long count = activityLogService.countActivityLogsByEntity(entityType, entityId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Count activity logs by user
     */
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> countActivityLogsByUser(@PathVariable String userId) {
        try {
            long count = activityLogService.countActivityLogsByUser(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get activity log statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getActivityLogStatistics() {
        try {
            Map<String, Object> statistics = activityLogService.getActivityLogStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}




