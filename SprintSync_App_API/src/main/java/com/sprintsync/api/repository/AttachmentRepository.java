package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for Attachment entity.
 * Provides data access methods for file attachments.
 * 
 * @author SprintSync Team
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, String> {

    /**
     * Find all attachments by entity type and ID
     */
    List<Attachment> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);

    /**
     * Find all attachments by user ID
     */
    List<Attachment> findByUploadedByOrderByCreatedAtDesc(String uploadedBy);

    /**
     * Find all public attachments
     */
    List<Attachment> findByIsPublicTrueOrderByCreatedAtDesc();

    /**
     * Count attachments by entity type and ID
     */
    long countByEntityTypeAndEntityId(String entityType, String entityId);

    /**
     * Find attachments by entity type, entity ID, and uploader
     */
    List<Attachment> findByEntityTypeAndEntityIdAndUploadedByOrderByCreatedAtDesc(
        String entityType, String entityId, String uploadedBy);
}

