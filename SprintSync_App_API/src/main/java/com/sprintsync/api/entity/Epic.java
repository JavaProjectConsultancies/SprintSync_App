package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.EpicStatus;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.converter.EpicStatusConverter;
import com.sprintsync.api.entity.converter.PriorityConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Epic entity representing large features or initiatives in the SprintSync application.
 * Maps to the 'epics' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "epics")
public class Epic extends BaseEntity {

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false)
    private String projectId;

    @NotBlank(message = "Epic title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @NotNull(message = "Priority cannot be null")
    @Convert(converter = PriorityConverter.class)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @NotNull(message = "Status cannot be null")
    @Convert(converter = EpicStatusConverter.class)
    @Column(name = "status", nullable = false)
    private EpicStatus status;

    @Column(name = "assignee_id")
    private String assigneeId;

    @NotNull(message = "Owner ID cannot be null")
    @Column(name = "owner", nullable = false)
    private String owner;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Min(value = 0, message = "Progress cannot be less than 0")
    @Max(value = 100, message = "Progress cannot be more than 100")
    @Column(name = "progress")
    private Integer progress = 0;

    @Column(name = "story_points")
    private Integer storyPoints = 0;

    @Column(name = "completed_story_points")
    private Integer completedStoryPoints = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "linked_milestones", columnDefinition = "jsonb")
    private List<String> linkedMilestones;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "linked_stories", columnDefinition = "jsonb")
    private List<String> linkedStories;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "labels", columnDefinition = "jsonb")
    private List<String> labels;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "components", columnDefinition = "jsonb")
    private List<String> components;

    @Column(name = "theme")
    private String theme;

    @Column(name = "business_value", columnDefinition = "TEXT")
    private String businessValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "acceptance_criteria", columnDefinition = "jsonb")
    private List<String> acceptanceCriteria;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "risks", columnDefinition = "jsonb")
    private List<String> risks;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dependencies", columnDefinition = "jsonb")
    private List<String> dependencies;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Constructors
    public Epic() {}

    public Epic(String projectId, String title, String description, Priority priority, EpicStatus status, String owner) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.owner = owner;
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

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public EpicStatus getStatus() {
        return status;
    }

    public void setStatus(EpicStatus status) {
        this.status = status;
    }

    public String getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(String assigneeId) {
        this.assigneeId = assigneeId;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
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

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public Integer getCompletedStoryPoints() {
        return completedStoryPoints;
    }

    public void setCompletedStoryPoints(Integer completedStoryPoints) {
        this.completedStoryPoints = completedStoryPoints;
    }

    public List<String> getLinkedMilestones() {
        return linkedMilestones;
    }

    public void setLinkedMilestones(List<String> linkedMilestones) {
        this.linkedMilestones = linkedMilestones;
    }

    public List<String> getLinkedStories() {
        return linkedStories;
    }

    public void setLinkedStories(List<String> linkedStories) {
        this.linkedStories = linkedStories;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<String> getComponents() {
        return components;
    }

    public void setComponents(List<String> components) {
        this.components = components;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getBusinessValue() {
        return businessValue;
    }

    public void setBusinessValue(String businessValue) {
        this.businessValue = businessValue;
    }

    public List<String> getAcceptanceCriteria() {
        return acceptanceCriteria;
    }

    public void setAcceptanceCriteria(List<String> acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria;
    }

    public List<String> getRisks() {
        return risks;
    }

    public void setRisks(List<String> risks) {
        this.risks = risks;
    }

    public List<String> getDependencies() {
        return dependencies;
    }

    public void setDependencies(List<String> dependencies) {
        this.dependencies = dependencies;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}