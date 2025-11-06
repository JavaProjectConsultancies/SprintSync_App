package com.sprintsync.api.entity.enums;

/**
 * Enumeration for user experience levels.
 */
public enum ExperienceLevel {
    E1("E1"),
    E2("E2"),
    M1("M1"),
    M2("M2"),
    M3("M3"),
    L1("L1"),
    L2("L2"),
    L3("L3"),
    S1("S1");

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
