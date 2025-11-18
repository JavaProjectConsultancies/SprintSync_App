package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * BacklogSubtask entity representing subtasks in the project backlog.
 * These are subtasks associated with backlog tasks.
 * Maps to the 'backlog_subtasks' table in the database.
 * 
 * @author SprintSync Team
 */
@Entity
@Table(name = "backlog_subtasks")
public class BacklogSubtask extends BaseEntity {

    @Column(name = "backlog_task_id", nullable = false)
    private String backlogTaskId;

    @Column(name = "original_subtask_id")
    private String originalSubtaskId;

    @NotBlank(message = "Subtask title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted = false;

    @Column(name = "assignee_id")
    private String assigneeId;

    @Column(name = "estimated_hours", precision = 5, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 5, scale = 2)
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "bug_type")
    private String bugType;

    @Column(name = "severity")
    private String severity;

    @Column(name = "category")
    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "labels", columnDefinition = "jsonb")
    private List<String> labels;

    // Constructors
    public BacklogSubtask() {}

    public BacklogSubtask(String backlogTaskId, String title, String description) {
        this.backlogTaskId = backlogTaskId;
        this.title = title;
        this.description = description;
    }

    // Getters and Setters
    public String getBacklogTaskId() {
        return backlogTaskId;
    }

    public void setBacklogTaskId(String backlogTaskId) {
        this.backlogTaskId = backlogTaskId;
    }

    public String getOriginalSubtaskId() {
        return originalSubtaskId;
    }

    public void setOriginalSubtaskId(String originalSubtaskId) {
        this.originalSubtaskId = originalSubtaskId;
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

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(String assigneeId) {
        this.assigneeId = assigneeId;
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

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getBugType() {
        return bugType;
    }

    public void setBugType(String bugType) {
        this.bugType = bugType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }
}

