package com.sprintsync.api.entity.enums;

/**
 * Story status enumeration for the SprintSync application.
 * Defines the different states a story can be in.
 * 
 * @author Mayuresh G
 */
public enum StoryStatus {
    BACKLOG("backlog"),
    TO_DO("to_do"),
    IN_PROGRESS("in_progress"),
    QA_REVIEW("qa_review"),
    DONE("done");

    private final String value;

    StoryStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}