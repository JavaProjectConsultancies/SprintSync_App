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
        return attachmentRepository.save(attachment);
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

