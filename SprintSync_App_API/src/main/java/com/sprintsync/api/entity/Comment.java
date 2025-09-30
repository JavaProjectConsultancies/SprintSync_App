package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Comment entity representing comments in the SprintSync application.
 * Maps to the 'comments' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "comments")
public class Comment extends BaseEntity {

    @NotNull(message = "User ID cannot be null")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @NotBlank(message = "Content cannot be blank")
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private String entityId;

    @Column(name = "parent_comment_id")
    private String parentCommentId;

    // Constructors
    public Comment() {}

    public Comment(String userId, String content, String entityType, String entityId) {
        this.userId = userId;
        this.content = content;
        this.entityType = entityType;
        this.entityId = entityId;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(String parentCommentId) {
        this.parentCommentId = parentCommentId;
    }
}
