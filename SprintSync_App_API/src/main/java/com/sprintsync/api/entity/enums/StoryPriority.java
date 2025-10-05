package com.sprintsync.api.entity.enums;

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

    public String getValue() {
        return value;
    }

    public static StoryPriority fromValue(String value) {
        for (StoryPriority priority : StoryPriority.values()) {
            if (priority.value.equalsIgnoreCase(value)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Unknown story priority: " + value);
    }
}