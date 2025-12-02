package com.sprintsync.api.service;

import com.sprintsync.api.entity.Notification;
import com.sprintsync.api.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Notification operations.
 * Provides business logic for Notification entities.
 * 
 * @author SprintSync
 */
@Service
@SuppressWarnings("null")
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    /**
     * Create a new notification
     */
    @Transactional
    public Notification createNotification(String userId, String title, String message, String type) {
        System.out.println("NotificationService.createNotification called with:");
        System.out.println("  userId: " + userId);
        System.out.println("  title: " + title);
        System.out.println("  message: " + message);
        System.out.println("  type: " + type);
        
        Notification notification = new Notification();
        notification.setId(idGenerationService.generateNotificationId());
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());
        
        Notification saved = notificationRepository.save(notification);
        System.out.println("Notification saved with ID: " + saved.getId());
        System.out.println("Notification userId: " + saved.getUserId());
        
        return saved;
    }

    /**
     * Create a notification with related entity
     */
    @Transactional
    public Notification createNotification(String userId, String title, String message, String type, 
                                          String relatedEntityType, String relatedEntityId) {
        Notification notification = createNotification(userId, title, message, type);
        notification.setRelatedEntityType(relatedEntityType);
        notification.setRelatedEntityId(relatedEntityId);
        
        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getNotificationsByUserId(String userId) {
        System.out.println("NotificationService.getNotificationsByUserId called with userId: " + userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        System.out.println("Found " + notifications.size() + " notifications for user: " + userId);
        if (notifications.size() > 0) {
            System.out.println("First notification userId: " + notifications.get(0).getUserId());
        }
        return notifications;
    }

    /**
     * Get unread notifications for a user
     */
    public List<Notification> getUnreadNotificationsByUserId(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    /**
     * Get notification by ID
     */
    public Optional<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public Notification markAsRead(String notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification.setUpdatedAt(LocalDateTime.now());
            return notificationRepository.save(notification);
        }
        return null;
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(now);
            notification.setUpdatedAt(now);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    /**
     * Get unread count for a user
     */
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Delete notification
     */
    @Transactional
    public void deleteNotification(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}







