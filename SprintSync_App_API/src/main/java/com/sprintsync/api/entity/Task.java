package com.sprintsync.api.entity;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.entity.converter.PriorityConverter;
import com.sprintsync.api.entity.converter.TaskStatusConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Task entity representing tasks in the SprintSync application.
 * Maps to the 'tasks' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "tasks")
public class Task extends BaseEntity {

    @NotNull(message = "Story ID cannot be null")
    @Column(name = "story_id", nullable = false)
    private String storyId;

    @NotBlank(message = "Task title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Task status cannot be null")
    @Convert(converter = TaskStatusConverter.class)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50)")
    private TaskStatus status;
    
    // Transient field to hold raw status value from database (for custom lane statuses)
    @Transient
    @JsonIgnore
    private String rawStatus;

    @NotNull(message = "Task priority cannot be null")
    @Convert(converter = PriorityConverter.class)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @Column(name = "assignee_id")
    private String assigneeId;

    @Column(name = "reporter_id")
    private String reporterId;

    @Column(name = "estimated_hours", precision = 5, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 5, scale = 2)
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "task_number")
    private Integer taskNumber;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "labels", columnDefinition = "jsonb")
    private List<String> labels;

    // Constructors
    public Task() {}

    public Task(String storyId, String title, String description, TaskStatus status, Priority priority) {
        this.storyId = storyId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    // Getters and Setters
    public String getStoryId() {
        return storyId;
    }

    public void setStoryId(String storyId) {
        this.storyId = storyId;
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

    public TaskStatus getStatus() {
        return status;
    }
    
    /**
     * Custom JSON getter for status that returns raw status if it's a custom lane status
     */
    @JsonGetter("status")
    @JsonProperty("status")
    public String getStatusAsString() {
        // If rawStatus is set and it's a custom lane status, return it
        if (rawStatus != null && rawStatus.startsWith("custom_lane_")) {
            return rawStatus;
        }
        // If rawStatus is set and it's not a standard enum value, return it
        if (rawStatus != null) {
            try {
                TaskStatus.fromValue(rawStatus);
                // If it's a valid enum value, continue to return enum value
            } catch (IllegalArgumentException e) {
                // If it's not a valid enum value (custom status), return raw status
                return rawStatus;
            }
        }
        // Otherwise return the enum value as string
        return status != null ? status.getValue() : null;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
    
    /**
     * Set raw status value from database (for custom lane statuses)
     */
    public void setRawStatus(String rawStatus) {
        this.rawStatus = rawStatus;
        // If it's a custom lane status, try to set status to IN_PROGRESS as fallback
        if (rawStatus != null && rawStatus.startsWith("custom_lane_")) {
            this.status = TaskStatus.IN_PROGRESS;
        }
    }
    
    /**
     * Get raw status value from database
     */
    @JsonIgnore
    public String getRawStatus() {
        return rawStatus;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(String assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getReporterId() {
        return reporterId;
    }

    public void setReporterId(String reporterId) {
        this.reporterId = reporterId;
    }

    public BigDecimal getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(BigDecimal estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public BigDecimal getActualHours() {
        return actualHours;
    }

    public void setActualHours(BigDecimal actualHours) {
        this.actualHours = actualHours;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public Integer getTaskNumber() {
        return taskNumber;
    }

    public void setTaskNumber(Integer taskNumber) {
        this.taskNumber = taskNumber;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }
}
