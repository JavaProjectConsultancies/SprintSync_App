package com.sprintsync.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import com.sprintsync.api.entity.converter.IntegrationTypeConverter;

/**
 * Entity representing available integrations
 * Maps to the 'available_integrations' table in the database
 */
@Entity
@Table(name = "available_integrations")
public class AvailableIntegration {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @NotBlank(message = "Name cannot be blank")
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Convert(converter = IntegrationTypeConverter.class)
    @Column(name = "type")
    private IntegrationType type;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Enums
    public enum IntegrationType {
        VERSION_CONTROL("version_control"),
        COMMUNICATION("communication"),
        STORAGE("storage"),
        PROJECT_MANAGEMENT("project_management"),
        DOCUMENTATION("documentation");

        private final String value;

        IntegrationType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static IntegrationType fromValue(String value) {
            for (IntegrationType type : IntegrationType.values()) {
                if (type.value.equalsIgnoreCase(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown integration type: " + value);
        }
    }

    // Constructors
    public AvailableIntegration() {
        this.createdAt = LocalDateTime.now();
    }

    public AvailableIntegration(String name, IntegrationType type) {
        this();
        this.name = name;
        this.type = type;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public IntegrationType getType() {
        return type;
    }

    public void setType(IntegrationType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
