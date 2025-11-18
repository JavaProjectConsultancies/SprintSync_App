package com.sprintsync.api.entity;

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
 * BacklogTask entity representing tasks in the project backlog.
 * These are tasks associated with backlog stories.
 * Maps to the 'backlog_tasks' table in the database.
 * 
 * @author SprintSync Team
 */
@Entity
@Table(name = "backlog_tasks")
public class BacklogTask extends BaseEntity {

    @NotNull(message = "Backlog Story ID cannot be null")
    @Column(name = "backlog_story_id", nullable = false)
    private String backlogStoryId;

    @Column(name = "original_task_id")
    private String originalTaskId;

    @NotBlank(message = "Task title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Task status cannot be null")
    @Convert(converter = TaskStatusConverter.class)
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(50)")
    private TaskStatus status;

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

    @Column(name = "is_overdue")
    private Boolean isOverdue = false;

    // Constructors
    public BacklogTask() {}

    public BacklogTask(String backlogStoryId, String title, String description, TaskStatus status, Priority priority) {
        this.backlogStoryId = backlogStoryId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    // Getters and Setters
    public String getBacklogStoryId() {
        return backlogStoryId;
    }

    public void setBacklogStoryId(String backlogStoryId) {
        this.backlogStoryId = backlogStoryId;
    }

    public String getOriginalTaskId() {
        return originalTaskId;
    }

    public void setOriginalTaskId(String originalTaskId) {
        this.originalTaskId = originalTaskId;
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

    public void setStatus(TaskStatus status) {
        this.status = status;
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

    public Boolean getIsOverdue() {
        return isOverdue;
    }

    public void setIsOverdue(Boolean isOverdue) {
        this.isOverdue = isOverdue;
    }
}

