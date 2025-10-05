package com.sprintsync.api.entity.enums;

/**
 * Sprint status enumeration for the SprintSync application.
 * Defines the different states a sprint can be in.
 * 
 * @author Mayuresh G
 */
public enum SprintStatus {
    PLANNING("planning"),
    ACTIVE("active"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    SprintStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SprintStatus fromValue(String value) {
        for (SprintStatus status : SprintStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown sprint status: " + value);
    }
}