package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Department entity representing departments in the SprintSync application.
 * Maps to the 'departments' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "departments")
public class Department extends BaseEntity {

    @NotBlank
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // TODO: Add is_active column to database - temporarily returning true without database column
    @Transient
    private Boolean isActive = true;

    // Constructors
    public Department() {}

    public Department(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
