package com.sprintsync.api.entity.enums;

/**
 * Epic status enumeration for the SprintSync application.
 * Defines the different states an epic can be in.
 * 
 * @author Mayuresh G
 */
public enum EpicStatus {
    BACKLOG("backlog"),
    PLANNING("planning"),
    IN_PROGRESS("in-progress"),
    REVIEW("review"),
    COMPLETED("completed"),
<<<<<<< HEAD
    CANCELLED("cancelled"),
	DRAFT("draft");
=======
    CANCELLED("cancelled");
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3

    private final String value;

    EpicStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }

    public static EpicStatus fromValue(String value) {
        for (EpicStatus status : EpicStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown epic status: " + value);
    }
}
