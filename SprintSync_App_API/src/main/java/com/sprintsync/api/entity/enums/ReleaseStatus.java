package com.sprintsync.api.entity.enums;

/**
 * Release status enumeration for the SprintSync application.
 * Defines the different states a release can be in.
 * 
 * @author Mayuresh G
 */
public enum ReleaseStatus {
    PLANNING("planning"),
    DEVELOPMENT("development"),
    TESTING("testing"),
    STAGING("staging"),
    READY_FOR_RELEASE("ready-for-release"),
    RELEASED("released"),
    CANCELLED("cancelled");

    private final String value;

    ReleaseStatus(String value) {
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
