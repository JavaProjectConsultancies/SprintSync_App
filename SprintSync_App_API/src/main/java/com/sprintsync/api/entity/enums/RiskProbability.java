package com.sprintsync.api.entity.enums;

/**
 * Risk probability enumeration for the SprintSync application.
 * Defines the different probability levels for project risks.
 * 
 * @author Mayuresh G
 */
public enum RiskProbability {
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high");

    private final String value;

    RiskProbability(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static RiskProbability fromValue(String value) {
        for (RiskProbability probability : RiskProbability.values()) {
            if (probability.value.equalsIgnoreCase(value)) {
                return probability;
            }
        }
        throw new IllegalArgumentException("Unknown risk probability: " + value);
    }
}
