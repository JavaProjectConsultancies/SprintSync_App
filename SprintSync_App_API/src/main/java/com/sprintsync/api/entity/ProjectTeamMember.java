package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * Entity representing project team member assignments
 * Maps to the 'project_team_members' table in the database
 */
@Entity
@Table(name = "project_team_members")
public class ProjectTeamMember {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false)
    private String projectId;

    @NotNull(message = "User ID cannot be null")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "role")
    private String role;

    @Column(name = "is_team_lead", nullable = false)
    private Boolean isTeamLead = false;

    @Min(value = 0, message = "Allocation percentage cannot be less than 0")
    @Max(value = 100, message = "Allocation percentage cannot be more than 100")
    @Column(name = "allocation_percentage", nullable = false)
    private Integer allocationPercentage = 100;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Transient
    private LocalDateTime leftAt;

    @Transient
    private Boolean isActive = true;

    // Constructors
    public ProjectTeamMember() {}

    public ProjectTeamMember(String projectId, String userId, String role) {
        this.projectId = projectId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getIsTeamLead() {
        return isTeamLead;
    }

    public void setIsTeamLead(Boolean isTeamLead) {
        this.isTeamLead = isTeamLead;
    }

    public Integer getAllocationPercentage() {
        return allocationPercentage;
    }

    public void setAllocationPercentage(Integer allocationPercentage) {
        this.allocationPercentage = allocationPercentage;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }

    public LocalDateTime getLeftAt() {
        return leftAt;
    }

    public void setLeftAt(LocalDateTime leftAt) {
        this.leftAt = leftAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
