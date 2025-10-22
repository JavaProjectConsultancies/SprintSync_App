package com.sprintsync.api.dto;

/**
 * DTO for Release data that matches frontend interface
 */
public class ReleaseDto {
    private String id;
    private String projectId;
    private String name;
    private String description;
    private String version;
    private String status;
    private Integer progress;
    private String releaseDate;
    private String targetDate;
    private String completedAt;
    private String releaseNotes;
    private String risks;
    private String dependencies;
    private String createdBy;
    private String linkedEpics;
    private String linkedStories;
    private String linkedSprints;
    private String createdAt;
    private String updatedAt;

    // Constructors
    public ReleaseDto() {}

    public ReleaseDto(String id, String projectId, String name) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(String targetDate) {
        this.targetDate = targetDate;
    }

    public String getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(String completedAt) {
        this.completedAt = completedAt;
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

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
