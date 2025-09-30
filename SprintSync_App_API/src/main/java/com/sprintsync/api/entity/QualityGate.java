package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.QualityGateStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * QualityGate entity representing quality gates in the SprintSync application.
 * Maps to the 'quality_gates' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "quality_gates")
public class QualityGate extends BaseEntity {

    @Column(name = "release_id", nullable = false)
    @NotNull
    private String releaseId;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @NotNull
    private QualityGateStatus status;

    @Column(name = "required", nullable = false)
    private Boolean required = true;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Constructors
    public QualityGate() {}

    public QualityGate(String releaseId, String name, String description, QualityGateStatus status) {
        this.releaseId = releaseId;
        this.name = name;
        this.description = description;
        this.status = status;
    }

    // Getters and Setters
    public String getReleaseId() {
        return releaseId;
    }

    public void setReleaseId(String releaseId) {
        this.releaseId = releaseId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public QualityGateStatus getStatus() {
        return status;
    }

    public void setStatus(QualityGateStatus status) {
        this.status = status;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
