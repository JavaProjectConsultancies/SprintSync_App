package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.TimeEntryType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * TimeEntry entity representing time tracking entries in the SprintSync application.
 * Maps to the 'time_entries' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "time_entries")
public class TimeEntry extends BaseEntity {

    @NotNull(message = "User ID cannot be null")
    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "project_id")
    private String projectId;

    @Column(name = "story_id")
    private String storyId;

    @Column(name = "task_id")
    private String taskId;

    @Column(name = "subtask_id")
    private String subtaskId;

    @NotBlank(message = "Description cannot be blank")
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull(message = "Entry type cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private TimeEntryType entryType;

    @NotNull(message = "Hours worked cannot be null")
    @Column(name = "hours_worked", precision = 5, scale = 2, nullable = false)
    private BigDecimal hoursWorked;

    @NotNull(message = "Work date cannot be null")
    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_billable", nullable = false)
    private Boolean isBillable = true;

    // Constructors
    public TimeEntry() {}

    public TimeEntry(String userId, String description, TimeEntryType entryType, BigDecimal hoursWorked, LocalDate workDate) {
        this.userId = userId;
        this.description = description;
        this.entryType = entryType;
        this.hoursWorked = hoursWorked;
        this.workDate = workDate;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getStoryId() {
        return storyId;
    }

    public void setStoryId(String storyId) {
        this.storyId = storyId;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getSubtaskId() {
        return subtaskId;
    }

    public void setSubtaskId(String subtaskId) {
        this.subtaskId = subtaskId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TimeEntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(TimeEntryType entryType) {
        this.entryType = entryType;
    }

    public BigDecimal getHoursWorked() {
        return hoursWorked;
    }

    public void setHoursWorked(BigDecimal hoursWorked) {
        this.hoursWorked = hoursWorked;
    }

    public LocalDate getWorkDate() {
        return workDate;
    }

    public void setWorkDate(LocalDate workDate) {
        this.workDate = workDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Boolean getIsBillable() {
        return isBillable;
    }

    public void setIsBillable(Boolean isBillable) {
        this.isBillable = isBillable;
    }
}
