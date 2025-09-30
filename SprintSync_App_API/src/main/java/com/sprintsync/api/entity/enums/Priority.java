package com.sprintsync.api.entity.enums;

/**
 * Priority enumeration for the SprintSync application.
 * Defines the different priority levels used across entities.
 * 
 * @author Mayuresh G
 */
public enum Priority {
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high"),
    CRITICAL("critical");

    private final String value;

    Priority(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
