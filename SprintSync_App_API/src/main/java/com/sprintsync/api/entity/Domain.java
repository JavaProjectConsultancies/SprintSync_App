package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

/**
 * Domain entity representing domains in the SprintSync application.
 * Maps to the 'domains' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "domains")
public class Domain extends BaseEntity {

    @NotBlank
    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Domain() {}

    public Domain(String name, String description) {
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
