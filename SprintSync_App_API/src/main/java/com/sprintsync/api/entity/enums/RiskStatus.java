package com.sprintsync.api.entity.enums;

/**
 * Risk status enumeration for the SprintSync application.
 * Defines the different status levels for project risks.
 * 
 * @author Mayuresh G
 */
public enum RiskStatus {
    IDENTIFIED("identified"),
    MITIGATED("mitigated"),
    CLOSED("closed");

    private final String value;

    RiskStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static RiskStatus fromValue(String value) {
        for (RiskStatus status : RiskStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown risk status: " + value);
    }
}
