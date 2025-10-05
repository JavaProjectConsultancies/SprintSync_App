package com.sprintsync.api.dto;

import java.time.LocalDate;

/**
 * DTO for Milestone data
 */
public class MilestoneDto {
    private String id;
    private String name;
    private String description;
    private LocalDate dueDate;
    private String status; // 'pending' | 'in-progress' | 'completed' | 'overdue'
    private Integer progress; // percentage
    private String priority; // 'low' | 'medium' | 'high' | 'critical'
    private String projectId;

    // Constructors
    public MilestoneDto() {}

    public MilestoneDto(String id, String name, LocalDate dueDate) {
        this.id = id;
        this.name = name;
        this.dueDate = dueDate;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
