package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Notification entity operations.
 * Extends JpaRepository to provide CRUD operations and custom queries.
 * 
 * @author SprintSync
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    /**
     * Find notifications by user ID
     */
    List<Notification> findByUserId(String userId);

    /**
     * Find unread notifications by user ID
     */
    List<Notification> findByUserIdAndIsReadFalse(String userId);

    /**
     * Find notifications by user ID ordered by created date descending
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Count unread notifications by user ID
     */
    long countByUserIdAndIsReadFalse(String userId);

    /**
     * Find notifications by type
     */
    List<Notification> findByType(String type);

    /**
     * Find notifications by user ID and type
     */
    List<Notification> findByUserIdAndType(String userId, String type);
}

