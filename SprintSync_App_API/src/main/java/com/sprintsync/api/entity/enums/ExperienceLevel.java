package com.sprintsync.api.entity.enums;

/**
 * Enumeration for user experience levels.
 */
public enum ExperienceLevel {
    junior("junior"),
    mid("mid"), 
    senior("senior"),
    lead("lead");

    private final String value;

    ExperienceLevel(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static ExperienceLevel fromValue(String value) {
        for (ExperienceLevel level : ExperienceLevel.values()) {
            if (level.value.equals(value)) {
                return level;
            }
        }
        throw new IllegalArgumentException("Unknown experience level: " + value);
    }
}
