package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.ReleaseStatus;
import com.sprintsync.api.entity.converter.ReleaseStatusConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Release entity representing releases in the SprintSync application.
 * Maps to the 'releases' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "releases")
public class Release extends BaseEntity {

    @Column(name = "project_id", nullable = false)
    @NotNull
    private String projectId;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank
    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Release status cannot be null")
    @Convert(converter = ReleaseStatusConverter.class)
    @Column(name = "status", nullable = false)
    private ReleaseStatus status;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "progress", nullable = false)
    private Integer progress = 0;

<<<<<<< HEAD
    @Column(name = "linked_epics", columnDefinition = "TEXT")
    private String linkedEpics;

    @Column(name = "linked_stories", columnDefinition = "TEXT")
    private String linkedStories;

    @Column(name = "linked_sprints", columnDefinition = "TEXT")
=======
    @Column(name = "linked_epics", columnDefinition = "jsonb")
    private String linkedEpics;

    @Column(name = "linked_stories", columnDefinition = "jsonb")
    private String linkedStories;

    @Column(name = "linked_sprints", columnDefinition = "jsonb")
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    private String linkedSprints;

    @Column(name = "release_notes", columnDefinition = "TEXT")
    private String releaseNotes;

<<<<<<< HEAD
    @Column(name = "risks", columnDefinition = "TEXT")
    private String risks;

    @Column(name = "dependencies", columnDefinition = "TEXT")
=======
    @Column(name = "risks", columnDefinition = "jsonb")
    private String risks;

    @Column(name = "dependencies", columnDefinition = "jsonb")
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    private String dependencies;

    @Column(name = "created_by", nullable = false)
    @NotNull
    private String createdBy;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    // Constructors
    public Release() {}

    public Release(String projectId, String name, String version, String description, ReleaseStatus status, String createdBy) {
        this.projectId = projectId;
        this.name = name;
        this.version = version;
        this.description = description;
        this.status = status;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ReleaseStatus getStatus() {
        return status;
    }

    public void setStatus(ReleaseStatus status) {
        this.status = status;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getLinkedEpics() {
        return linkedEpics;
    }

    public void setLinkedEpics(String linkedEpics) {
        this.linkedEpics = linkedEpics;
    }

    public String getLinkedStories() {
        return linkedStories;
    }

    public void setLinkedStories(String linkedStories) {
        this.linkedStories = linkedStories;
    }

    public String getLinkedSprints() {
        return linkedSprints;
    }

    public void setLinkedSprints(String linkedSprints) {
        this.linkedSprints = linkedSprints;
    }

    public String getReleaseNotes() {
        return releaseNotes;
    }

    public void setReleaseNotes(String releaseNotes) {
        this.releaseNotes = releaseNotes;
    }

    public String getRisks() {
        return risks;
    }

    public void setRisks(String risks) {
        this.risks = risks;
    }

    public String getDependencies() {
        return dependencies;
    }

    public void setDependencies(String dependencies) {
        this.dependencies = dependencies;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDate getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDate completedAt) {
        this.completedAt = completedAt;
    }
}
