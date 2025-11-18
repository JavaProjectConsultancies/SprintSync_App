package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Attachment;
import com.sprintsync.api.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Attachment management operations.
 * Provides endpoints for CRUD operations on Attachment entities.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    /**
     * Get all attachments by entity type and ID
     */
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            List<Attachment> attachments = attachmentService.getAttachmentsByEntity(entityType, entityId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get attachment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable String id) {
        try {
            Attachment attachment = attachmentService.getAttachmentById(id);
            if (attachment != null) {
                return ResponseEntity.ok(attachment);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new attachment
     */
    @PostMapping
    public ResponseEntity<Attachment> createAttachment(@RequestBody Attachment attachment) {
        try {
            Attachment createdAttachment = attachmentService.createAttachment(attachment);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAttachment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete an attachment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable String id) {
        try {
            boolean deleted = attachmentService.deleteAttachment(id);
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
     * Get attachments by user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByUser(@PathVariable String userId) {
        try {
            List<Attachment> attachments = attachmentService.getAttachmentsByUser(userId);
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get public attachments
     */
    @GetMapping("/public")
    public ResponseEntity<List<Attachment>> getPublicAttachments() {
        try {
            List<Attachment> attachments = attachmentService.getPublicAttachments();
            return ResponseEntity.ok(attachments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Count attachments by entity
     */
    @GetMapping("/count/entity/{entityType}/{entityId}")
    public ResponseEntity<Map<String, Long>> countAttachmentsByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId) {
        try {
            long count = attachmentService.countAttachmentsByEntity(entityType, entityId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}




