package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity class for File Attachments.
 * Supports attachments for projects, stories, tasks, and comments.
 * 
 * @author SprintSync Team
 */
@Entity
@Table(name = "attachments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attachment {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "uploaded_by")
    private String uploadedBy;

    @NotBlank(message = "Entity type cannot be blank")
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType; // 'project', 'story', 'task', 'comment'

    @NotBlank(message = "Entity ID cannot be blank")
    @Column(name = "entity_id", nullable = false)
    private String entityId;

    @NotBlank(message = "File name cannot be blank")
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type", length = 100)
    private String fileType;

    @NotBlank(message = "File URL cannot be blank")
    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "is_public")
    private Boolean isPublic = false;

    @Column(name = "attachment_type", length = 20)
    private String attachmentType = "file"; // 'file' or 'url'

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

