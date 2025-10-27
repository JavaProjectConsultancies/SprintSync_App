package com.sprintsync.api.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Time entry type enumeration for the SprintSync application.
 * Defines the different types of work that can be tracked.
 * 
 * @author Mayuresh G
 */
public enum TimeEntryType {
    DEVELOPMENT("development"),
    TESTING("testing"),
    DESIGN("design"),
    REVIEW("review"),
    MEETING("meeting"),
    RESEARCH("research"),
    DOCUMENTATION("documentation"),
    BUG_FIX("bug_fix"),
    REFACTORING("refactoring"),
    DEPLOYMENT("deployment"),
    TRAINING("training"),
    ADMINISTRATIVE("administrative");

    private final String value;

    TimeEntryType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value; // Return lowercase value for JSON output
    }

    @JsonCreator
    public static TimeEntryType fromValue(String value) {
        // Accept both lowercase values and uppercase enum names
        for (TimeEntryType type : TimeEntryType.values()) {
            if (type.value.equals(value) || type.name().equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown TimeEntryType: " + value);
    }
}
