package com.sprintsync.api.dto;

/**
 * DTO for Requirement data
 */
public class RequirementDto {
    private String id;
    private String projectId;
    private String title;
    private String description;
    private String type;
    private String status;
    private String priority;
    private String module;
    private String[] acceptanceCriteria;
    private Integer effortPoints;
    private String createdAt;
    private String updatedAt;

    // Constructors
    public RequirementDto() {}

    public RequirementDto(String id, String title, String description) {
        this.id = id;
        this.title = title;
        this.description = description;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String[] getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(String[] acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria;
    }

    public Integer getEffortPoints() {
        return effortPoints;
    }

    public void setEffortPoints(Integer effortPoints) {
        this.effortPoints = effortPoints;
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
