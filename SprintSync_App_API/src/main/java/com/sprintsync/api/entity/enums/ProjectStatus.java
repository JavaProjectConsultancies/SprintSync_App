package com.sprintsync.api.entity.enums;

/**
 * Project status enumeration for the SprintSync application.
 * Defines the different states a project can be in.
 * 
 * @author Mayuresh G
 */
public enum ProjectStatus {
    PLANNING("planning"),
    ACTIVE("active"),
    PAUSED("paused"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    ProjectStatus(String value) {
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
