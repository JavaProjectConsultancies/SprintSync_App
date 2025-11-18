package com.sprintsync.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintsync.api.entity.ActivityLog;
import com.sprintsync.api.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service class for ActivityLog management operations.
 * Provides business logic for activity log tracking.
 * 
 * @author SprintSync Team
 */
@Service
@SuppressWarnings("null")
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get all activity logs with pagination
     */
    public Page<ActivityLog> getAllActivityLogs(Pageable pageable) {
        return activityLogRepository.findAll(pageable);
    }

    /**
     * Get activity log by ID
     */
    public ActivityLog getActivityLogById(String id) {
        return activityLogRepository.findById(id).orElse(null);
    }

    /**
     * Create a new activity log entry
     */
    public ActivityLog createActivityLog(ActivityLog activityLog) {
        if (activityLog.getId() == null || activityLog.getId().isEmpty()) {
            activityLog.setId(idGenerationService.generateActivityLogId());
        }
        if (activityLog.getCreatedAt() == null) {
            activityLog.setCreatedAt(LocalDateTime.now());
        }
        return activityLogRepository.save(activityLog);
    }

    /**
     * Log an activity for an entity
     */
    public ActivityLog logActivity(String userId, String entityType, String entityId, String action, 
                                   String description, Object oldValues, Object newValues) {
        ActivityLog log = new ActivityLog();
        log.setUserId(userId);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setDescription(description);

        try {
            if (oldValues != null) {
                log.setOldValues(objectMapper.writeValueAsString(oldValues));
            }
            if (newValues != null) {
                log.setNewValues(objectMapper.writeValueAsString(newValues));
            }
        } catch (Exception e) {
            // Log error but don't fail the activity logging
            System.err.println("Error serializing values for activity log: " + e.getMessage());
        }

        return createActivityLog(log);
    }

    /**
     * Delete an activity log
     */
    public boolean deleteActivityLog(String id) {
        if (activityLogRepository.existsById(id)) {
            activityLogRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get activity logs by entity type and ID
     */
    public List<ActivityLog> getActivityLogsByEntity(String entityType, String entityId) {
        return activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    /**
     * Get activity logs by entity type and ID with pagination
     */
    public Page<ActivityLog> getActivityLogsByEntity(String entityType, String entityId, Pageable pageable) {
        return activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable);
    }

    /**
     * Get activity logs by user ID
     */
    public List<ActivityLog> getActivityLogsByUser(String userId) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get activity logs by user ID with pagination
     */
    public Page<ActivityLog> getActivityLogsByUser(String userId, Pageable pageable) {
        return activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    /**
     * Get activity logs by entity type
     */
    public List<ActivityLog> getActivityLogsByEntityType(String entityType) {
        return activityLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType);
    }

    /**
     * Get activity logs by entity type with pagination
     */
    public Page<ActivityLog> getActivityLogsByEntityType(String entityType, Pageable pageable) {
        return activityLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable);
    }

    /**
     * Get activity logs by action
     */
    public List<ActivityLog> getActivityLogsByAction(String action) {
        return activityLogRepository.findByActionOrderByCreatedAtDesc(action);
    }

    /**
     * Get activity logs within date range
     */
    public List<ActivityLog> getActivityLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return activityLogRepository.findByDateRange(startDate, endDate);
    }

    /**
     * Get activity logs within date range with pagination
     */
    public Page<ActivityLog> getActivityLogsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return activityLogRepository.findByDateRange(startDate, endDate, pageable);
    }

    /**
     * Get recent activity logs for a user
     */
    public List<ActivityLog> getRecentActivityByUser(String userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return activityLogRepository.findRecentActivityByUser(userId, since);
    }

    /**
     * Get recent activity logs for an entity
     */
    public List<ActivityLog> getRecentActivityByEntity(String entityType, String entityId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return activityLogRepository.findRecentActivityByEntity(entityType, entityId, since);
    }

    /**
     * Count activity logs by entity
     */
    public long countActivityLogsByEntity(String entityType, String entityId) {
        return activityLogRepository.countByEntityTypeAndEntityId(entityType, entityId);
    }

    /**
     * Count activity logs by user
     */
    public long countActivityLogsByUser(String userId) {
        return activityLogRepository.countByUserId(userId);
    }

    /**
     * Get activity log statistics
     */
    public Map<String, Object> getActivityLogStatistics() {
        long totalLogs = activityLogRepository.count();
        
        return Map.of(
            "totalLogs", totalLogs,
            "last24Hours", getRecentActivityByEntity("all", "all", 1).size(),
            "last7Days", getRecentActivityByEntity("all", "all", 7).size(),
            "last30Days", getRecentActivityByEntity("all", "all", 30).size()
        );
    }

    /**
     * Delete old activity logs (cleanup)
     */
    public void deleteOldActivityLogs(int daysToKeep) {
        LocalDateTime before = LocalDateTime.now().minusDays(daysToKeep);
        activityLogRepository.deleteOldLogs(before);
    }
}





