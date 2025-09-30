package com.sprintsync.api.entity.enums;

/**
 * Epic status enumeration for the SprintSync application.
 * Defines the different states an epic can be in.
 * 
 * @author Mayuresh G
 */
public enum EpicStatus {
    BACKLOG("backlog"),
    PLANNING("planning"),
    IN_PROGRESS("in-progress"),
    REVIEW("review"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    EpicStatus(String value) {
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
