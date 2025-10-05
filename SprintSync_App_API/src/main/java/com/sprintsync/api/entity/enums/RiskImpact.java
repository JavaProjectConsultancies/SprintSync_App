package com.sprintsync.api.entity.enums;

/**
 * Risk impact enumeration for the SprintSync application.
 * Defines the different impact levels for project risks.
 * 
 * @author Mayuresh G
 */
public enum RiskImpact {
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high");

    private final String value;

    RiskImpact(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static RiskImpact fromValue(String value) {
        for (RiskImpact impact : RiskImpact.values()) {
            if (impact.value.equalsIgnoreCase(value)) {
                return impact;
            }
        }
        throw new IllegalArgumentException("Unknown risk impact: " + value);
    }
}
