package com.sprintsync.api.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Story priority enumeration for the SprintSync application.
 * Defines the different priority levels for stories.
 * 
 * @author Mayuresh G
 */
public enum StoryPriority {
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high"),
    CRITICAL("critical");

    private final String value;

    StoryPriority(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static StoryPriority fromValue(String value) {
        if (value == null) {
            return null;
        }

        // Try to match by value first (from JSON)
        for (StoryPriority priority : StoryPriority.values()) {
            if (priority.value.equalsIgnoreCase(value)) {
                return priority;
            }
        }

        // Try to match by enum name (from JPA)
        try {
            return StoryPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown story priority: " + value);
        }
    }
}