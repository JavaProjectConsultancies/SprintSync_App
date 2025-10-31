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
        if (value == null || value.trim().isEmpty()) {
            return FUNCTIONAL; // Default to functional if empty
        }
        
        // Normalize the input value - handle both underscore and hyphen variations
        String normalized = value.trim()
            .toLowerCase()
            .replace("_", "-")
            .replace(" ", "-");
        
        for (RequirementType type : RequirementType.values()) {
            if (type.value.equalsIgnoreCase(normalized) || 
                type.value.replace("-", "_").equalsIgnoreCase(normalized)) {
                return type;
            }
        }
        
        // Fallback: try common variations
        if (normalized.contains("non-functional") || normalized.contains("non_functional") || normalized.equals("nonfunctional")) {
            return NON_FUNCTIONAL;
        }
        if (normalized.contains("functional") && !normalized.contains("non")) {
            return FUNCTIONAL;
        }
        if (normalized.contains("technical")) {
            return TECHNICAL;
        }
        
        throw new IllegalArgumentException("Unknown requirement type: " + value);
    }
}
