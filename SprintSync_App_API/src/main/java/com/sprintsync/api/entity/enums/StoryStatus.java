package com.sprintsync.api.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Story status enumeration for the SprintSync application.
 * Defines the different states a story can be in.
 * 
 * @author Mayuresh G
 */
public enum StoryStatus {
    BACKLOG("BACKLOG"),
    TODO("TODO"),
    IN_PROGRESS("IN_PROGRESS"),
    REVIEW("REVIEW"),
    DONE("DONE");

    private final String value;

    StoryStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static StoryStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        
        // Try to match by value first (from JSON)
        for (StoryStatus status : StoryStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        
        // Try to match by enum name (from JPA)
        try {
            return StoryStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown story status: " + value);
        }
    }
}
