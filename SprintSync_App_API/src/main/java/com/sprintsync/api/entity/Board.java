package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
/**
 * Board entity representing Scrum boards for projects.
 * Allows multiple boards per project with different workflow configurations.
 * 
 * @author SprintSync Team
 */
@Entity
@Table(name = "boards", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_id", "name"}, name = "unique_project_board_name")
})
public class Board extends BaseEntity {

    @NotNull(message = "Project ID cannot be null")
    @Column(name = "project_id", nullable = false, length = 255)
    private String projectId;

    @NotBlank(message = "Board name cannot be blank")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    // Constructors
    public Board() {}

    public Board(String projectId, String name, String description) {
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.isDefault = false;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}

