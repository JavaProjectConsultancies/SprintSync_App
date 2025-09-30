package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.SprintStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Sprint entity representing sprints in the SprintSync application.
 * Maps to the 'sprints' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "sprints")
public class Sprint extends BaseEntity {

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false)
    private String projectId;

    @NotBlank(message = "Sprint name cannot be blank")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "goal", columnDefinition = "TEXT")
    private String goal;

    @NotNull(message = "Sprint status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SprintStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "capacity_hours")
    private Integer capacityHours;

    @Column(name = "velocity_points")
    private Integer velocityPoints;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Sprint() {}

    public Sprint(String projectId, String name, String goal, SprintStatus status) {
        this.projectId = projectId;
        this.name = name;
        this.goal = goal;
        this.status = status;
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

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public SprintStatus getStatus() {
        return status;
    }

    public void setStatus(SprintStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getCapacityHours() {
        return capacityHours;
    }

    public void setCapacityHours(Integer capacityHours) {
        this.capacityHours = capacityHours;
    }

    public Integer getVelocityPoints() {
        return velocityPoints;
    }

    public void setVelocityPoints(Integer velocityPoints) {
        this.velocityPoints = velocityPoints;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}