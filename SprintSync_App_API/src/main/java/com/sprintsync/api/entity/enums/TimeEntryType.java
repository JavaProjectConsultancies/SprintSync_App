package com.sprintsync.api.entity.enums;

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

    public String getValue() {
        return value;
    }
}
