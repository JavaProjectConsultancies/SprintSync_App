package com.sprintsync.api.entity.enums;

/**
 * Task status enumeration for the SprintSync application.
 * Defines the different states a task can be in.
 * 
 * @author Mayuresh G
 */
public enum TaskStatus {
    TO_DO("to_do"),
    IN_PROGRESS("in_progress"),
    QA_REVIEW("qa_review"),
    DONE("done"),
    BLOCKED("blocked"),
    CANCELLED("cancelled");

    private final String value;

    TaskStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static TaskStatus fromValue(String value) {
        for (TaskStatus status : TaskStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown task status: " + value);
    }
}
