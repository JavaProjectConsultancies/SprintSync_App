package com.sprintsync.api.entity.enums;

/**
 * Quality gate status enumeration for the SprintSync application.
 * Defines the different states a quality gate can be in.
 * 
 * @author Mayuresh G
 */
public enum QualityGateStatus {
    PENDING("pending"),
    PASSED("passed"),
    FAILED("failed");

    private final String value;

    QualityGateStatus(String value) {
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
