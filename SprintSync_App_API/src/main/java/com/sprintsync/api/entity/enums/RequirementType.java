package com.sprintsync.api.entity.enums;

/**
 * Requirement type enumeration for the SprintSync application.
 * Defines the different types of project requirements.
 * 
 * @author Mayuresh G
 */
public enum RequirementType {
    FUNCTIONAL("functional"),
    NON_FUNCTIONAL("non-functional"),
    TECHNICAL("technical");

    private final String value;

    RequirementType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static RequirementType fromValue(String value) {
        for (RequirementType type : RequirementType.values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown requirement type: " + value);
    }
}
