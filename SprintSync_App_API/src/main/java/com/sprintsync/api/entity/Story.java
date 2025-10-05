package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.StoryPriority;
import com.sprintsync.api.entity.converter.StoryPriorityConverter;
import com.sprintsync.api.entity.enums.StoryStatus;
import com.sprintsync.api.entity.converter.StoryStatusConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

/**
 * Story entity representing user stories in the SprintSync application.
 * Maps to the 'stories' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "stories")
public class Story extends BaseEntity {

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false)
    private String projectId;

    @Column(name = "sprint_id")
    private String sprintId;

    @Column(name = "epic_id")
    private String epicId;

    @Column(name = "release_id")
    private String releaseId;

    @NotBlank(message = "Story title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "acceptance_criteria", columnDefinition = "jsonb")
    private java.util.List<String> acceptanceCriteria;

    @NotNull(message = "Story status cannot be null")
    @Convert(converter = StoryStatusConverter.class)
    @Column(name = "status", nullable = false)
    private StoryStatus status;

    @NotNull(message = "Story priority cannot be null")
    @Convert(converter = StoryPriorityConverter.class)
    @Column(name = "priority", nullable = false)
    private StoryPriority priority;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "assignee_id")
    private String assigneeId;

    @Column(name = "reporter_id")
    private String reporterId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "labels", columnDefinition = "jsonb")
    private java.util.List<String> labels;

    @Column(name = "order_index")
    private Integer orderIndex = 0;

    @Column(name = "estimated_hours", precision = 5, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "actual_hours", precision = 5, scale = 2)
    private BigDecimal actualHours = BigDecimal.ZERO;

    // Constructors
    public Story() {}

    public Story(String projectId, String title, String description, StoryStatus status, StoryPriority priority) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
    }

    // Getters and Setters
    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getSprintId() {
        return sprintId;
    }

    public void setSprintId(String sprintId) {
        this.sprintId = sprintId;
    }

    public String getEpicId() {
        return epicId;
    }

    public void setEpicId(String epicId) {
        this.epicId = epicId;
    }

    public String getReleaseId() {
        return releaseId;
    }

    public void setReleaseId(String releaseId) {
        this.releaseId = releaseId;
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

    public java.util.List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(java.util.List<String> acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria;
    }

    public StoryStatus getStatus() {
        return status;
    }

    public void setStatus(StoryStatus status) {
        this.status = status;
    }

    public StoryPriority getPriority() {
        return priority;
    }

    public void setPriority(StoryPriority priority) {
        this.priority = priority;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
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

    public java.util.List<String> getLabels() {
        return labels;
    }

    public void setLabels(java.util.List<String> labels) {
        this.labels = labels;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
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
}