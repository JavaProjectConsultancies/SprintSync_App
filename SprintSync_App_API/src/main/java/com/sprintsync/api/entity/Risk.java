package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import com.sprintsync.api.entity.enums.RiskStatus;
import com.sprintsync.api.entity.enums.RiskProbability;
import com.sprintsync.api.entity.enums.RiskImpact;
import com.sprintsync.api.entity.converter.RiskStatusConverter;
import com.sprintsync.api.entity.converter.RiskProbabilityConverter;
import com.sprintsync.api.entity.converter.RiskImpactConverter;

/**
 * Entity representing project risks
 * Maps to the 'risks' table in the database
 */
@Entity
@Table(name = "risks")
public class Risk {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false)
    private String projectId;

    @NotBlank(message = "Title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Convert(converter = RiskProbabilityConverter.class)
    @Column(name = "probability", nullable = false)
    private RiskProbability probability = RiskProbability.MEDIUM;

    @Convert(converter = RiskImpactConverter.class)
    @Column(name = "impact", nullable = false)
    private RiskImpact impact = RiskImpact.MEDIUM;

    @Column(name = "mitigation", columnDefinition = "TEXT")
    private String mitigation;

    @Convert(converter = RiskStatusConverter.class)
    @Column(name = "status", nullable = false)
    private RiskStatus status = RiskStatus.IDENTIFIED;

    @Column(name = "owner_id")
    private String ownerId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    // Constructors
    public Risk() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Risk(String projectId, String title, String description) {
        this();
        this.projectId = projectId;
        this.title = title;
        this.description = description;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public RiskProbability getProbability() {
        return probability;
    }

    public void setProbability(RiskProbability probability) {
        this.probability = probability;
    }

    public RiskImpact getImpact() {
        return impact;
    }

    public void setImpact(RiskImpact impact) {
        this.impact = impact;
    }

    public String getMitigation() {
        return mitigation;
    }

    public void setMitigation(String mitigation) {
        this.mitigation = mitigation;
    }

    public RiskStatus getStatus() {
        return status;
    }

    public void setStatus(RiskStatus status) {
        this.status = status;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
