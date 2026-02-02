package com.sprintsync.api.service;

import com.sprintsync.api.entity.Attachment;
import com.sprintsync.api.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for Attachment management operations.
 * Provides business logic for file attachments.
 * 
 * @author SprintSync Team
 */
@Service
@SuppressWarnings("null")
public class AttachmentService {

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    /**
     * Get all attachments by entity type and ID
     */
    public List<Attachment> getAttachmentsByEntity(String entityType, String entityId) {
        return attachmentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    /**
     * Get attachment by ID
     */
    public Attachment getAttachmentById(String id) {
        return attachmentRepository.findById(id).orElse(null);
    }

    /**
     * Create a new attachment
     */
    @Transactional
    public Attachment createAttachment(Attachment attachment) {
        if (attachment.getId() == null || attachment.getId().isEmpty()) {
            attachment.setId(idGenerationService.generateAttachmentId());
        }
        
        // Log before saving
        System.out.println("[AttachmentService] Saving attachment to database: " +
            "ID=" + attachment.getId() +
            ", entityType=" + attachment.getEntityType() +
            ", entityId=" + attachment.getEntityId() +
            ", fileName=" + attachment.getFileName() +
            ", fileSize=" + attachment.getFileSize() +
            ", uploadedBy=" + attachment.getUploadedBy());
        
        Attachment saved = attachmentRepository.save(attachment);
        
        // Verify it was saved
        Attachment verified = attachmentRepository.findById(saved.getId()).orElse(null);
        if (verified != null) {
            System.out.println("[AttachmentService] Attachment successfully saved and verified in database: " + verified.getId());
        } else {
            System.err.println("[AttachmentService] WARNING: Attachment was not found in database after save!");
        }
        
        return saved;
    }

    /**
     * Delete an attachment
     */
    @Transactional
    public boolean deleteAttachment(String id) {
        if (attachmentRepository.existsById(id)) {
            attachmentRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get attachments by user
     */
    public List<Attachment> getAttachmentsByUser(String userId) {
        return attachmentRepository.findByUploadedByOrderByCreatedAtDesc(userId);
    }

    /**
     * Get public attachments
     */
    public List<Attachment> getPublicAttachments() {
        return attachmentRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    /**
     * Count attachments by entity
     */
    public long countAttachmentsByEntity(String entityType, String entityId) {
        return attachmentRepository.countByEntityTypeAndEntityId(entityType, entityId);
    }
}






