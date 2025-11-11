package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Notification;
import com.sprintsync.api.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Notification operations.
 * Provides endpoints for notification management.
 * 
 * @author SprintSync
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all notifications for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUserId(@PathVariable String userId) {
        List<Notification> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread notifications for a user
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotificationsByUserId(@PathVariable String userId) {
        List<Notification> notifications = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Get unread count for a user
     */
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    /**
     * Get notification by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable String id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        return notification.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Mark notification as read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        Notification notification = notificationService.markAsRead(id);
        if (notification != null) {
            return ResponseEntity.ok(notification);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    /**
     * Create a notification
     */
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String title = request.get("title");
            String message = request.get("message");
            String type = request.get("type");
            String relatedEntityType = request.get("relatedEntityType");
            String relatedEntityId = request.get("relatedEntityId");

            Notification notification;
            if (relatedEntityType != null && relatedEntityId != null) {
                notification = notificationService.createNotification(
                    userId, title, message, type, relatedEntityType, relatedEntityId
                );
            } else {
                notification = notificationService.createNotification(userId, title, message, type);
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(notification);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}

