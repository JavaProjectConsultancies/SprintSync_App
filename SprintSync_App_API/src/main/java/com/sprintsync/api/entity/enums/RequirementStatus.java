package com.sprintsync.api.entity.enums;

/**
 * Requirement status enumeration for the SprintSync application.
 * Defines the different status levels for project requirements.
 * 
 * @author Mayuresh G
 */
public enum RequirementStatus {
    DRAFT("draft"),
    APPROVED("approved"),
    IN_DEVELOPMENT("in-development"),
    COMPLETED("completed"),
    PENDING("pending");

    private final String value;

    RequirementStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static RequirementStatus fromValue(String value) {
        for (RequirementStatus status : RequirementStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown requirement status: " + value);
    }
}
