package com.sprintsync.api.repository;

import com.sprintsync.api.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for ActivityLog entity.
 * Provides data access methods for activity logs.
 * 
 * @author SprintSync Team
 */
@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {

    /**
     * Find all activity logs by entity type and ID
     */
    List<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);

    /**
     * Find all activity logs by entity type and ID with pagination
     */
    Page<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId, Pageable pageable);

    /**
     * Find all activity logs by user ID
     */
    List<ActivityLog> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Find all activity logs by user ID with pagination
     */
    Page<ActivityLog> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Find all activity logs by entity type
     */
    List<ActivityLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);

    /**
     * Find all activity logs by entity type with pagination
     */
    Page<ActivityLog> findByEntityTypeOrderByCreatedAtDesc(String entityType, Pageable pageable);

    /**
     * Find all activity logs by action
     */
    List<ActivityLog> findByActionOrderByCreatedAtDesc(String action);

    /**
     * Find all activity logs within date range
     */
    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    /**
     * Find all activity logs within date range with pagination
     */
    @Query("SELECT a FROM ActivityLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<ActivityLog> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    /**
     * Find recent activity logs for a user
     */
    @Query("SELECT a FROM ActivityLog a WHERE a.userId = :userId AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentActivityByUser(@Param("userId") String userId, @Param("since") LocalDateTime since);

    /**
     * Find recent activity logs for an entity
     */
    @Query("SELECT a FROM ActivityLog a WHERE a.entityType = :entityType AND a.entityId = :entityId AND a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<ActivityLog> findRecentActivityByEntity(@Param("entityType") String entityType, @Param("entityId") String entityId, @Param("since") LocalDateTime since);

    /**
     * Count activity logs by entity type and ID
     */
    long countByEntityTypeAndEntityId(String entityType, String entityId);

    /**
     * Count activity logs by user ID
     */
    long countByUserId(String userId);

    /**
     * Delete old activity logs
     */
    @Query("DELETE FROM ActivityLog a WHERE a.createdAt < :before")
    void deleteOldLogs(@Param("before") LocalDateTime before);
}

