package com.sprintsync.api.dto;

/**
 * DTO for Stakeholder data
 */
public class StakeholderDto {
    private String id;
    private String projectId;
    private String name;
    private String role;
    private String email;
    private String[] responsibilities;
    private String avatarUrl;
    private String createdAt;
    private String updatedAt;

    // Constructors
    public StakeholderDto() {}

    public StakeholderDto(String id, String name, String role) {
        this.id = id;
        this.name = name;
        this.role = role;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String[] getResponsibilities() {
        return responsibilities;
    }

    public void setResponsibilities(String[] responsibilities) {
        this.responsibilities = responsibilities;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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