package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * WorkflowLane entity representing custom workflow lanes/columns in Scrum boards.
 * Maps to the 'workflow_lanes' table in the database.
 * 
 * @author SprintSync Team
 */
@Entity
@Table(name = "workflow_lanes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "display_order"}, name = "unique_project_lane_order")
})
public class WorkflowLane extends BaseEntity {

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false, length = 255)
    private String projectId;

    @Column(name = "board_id", length = 255)
    private String boardId;

    @NotBlank(message = "Lane title cannot be blank")
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "color", nullable = false, length = 50)
    private String color = "#3B82F6";

    @Column(name = "objective", columnDefinition = "TEXT")
    private String objective;

    @Column(name = "wip_limit_enabled", nullable = false)
    private Boolean wipLimitEnabled = false;

    @Column(name = "wip_limit")
    private Integer wipLimit;

    @NotNull(message = "Display order cannot be null")
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @NotBlank(message = "Status value cannot be blank")
    @Column(name = "status_value", nullable = false, length = 50)
    private String statusValue;

    // Constructors
    public WorkflowLane() {}

    public WorkflowLane(String projectId, String title, String color, String statusValue) {
        this.projectId = projectId;
        this.title = title;
        this.color = color;
        this.statusValue = statusValue;
    }

    // Getters and Setters
    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getObjective() {
        return objective;
    }

    public void setObjective(String objective) {
        this.objective = objective;
    }

    public Boolean getWipLimitEnabled() {
        return wipLimitEnabled;
    }

    public void setWipLimitEnabled(Boolean wipLimitEnabled) {
        this.wipLimitEnabled = wipLimitEnabled;
    }

    public Integer getWipLimit() {
        return wipLimit;
    }

    public void setWipLimit(Integer wipLimit) {
        this.wipLimit = wipLimit;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getStatusValue() {
        return statusValue;
    }

    public void setStatusValue(String statusValue) {
        this.statusValue = statusValue;
    }
}

