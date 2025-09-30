package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.LocalDate;

/**
 * Milestone entity representing project milestones in the SprintSync application.
 * Maps to the 'milestones' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "milestones")
public class Milestone extends BaseEntity {

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false)
    private String projectId;

    @NotBlank(message = "Milestone title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    @Min(value = 0, message = "Progress percentage cannot be less than 0")
    @Max(value = 100, message = "Progress percentage cannot be more than 100")
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    // Constructors
    public Milestone() {}

    public Milestone(String projectId, String title, String description) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
    }

    // Getters and Setters
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}
