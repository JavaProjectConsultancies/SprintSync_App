package com.sprintsync.api.entity.enums;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
/**
 * Story status enumeration for the SprintSync application.
 * Defines the different states a story can be in.
 * 
 * @author Mayuresh G
 */
public enum StoryStatus {
<<<<<<< HEAD
    BACKLOG("BACKLOG"),
    TODO("TODO"),
    IN_PROGRESS("IN_PROGRESS"),
    REVIEW("REVIEW"),
    DONE("DONE");
=======
    BACKLOG("backlog"),
    TO_DO("to_do"),
    IN_PROGRESS("in_progress"),
    QA_REVIEW("qa_review"),
    DONE("done");
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3

    private final String value;

    StoryStatus(String value) {
        this.value = value;
    }

<<<<<<< HEAD
    @JsonValue
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    public String getValue() {
        return value;
    }

<<<<<<< HEAD
    @JsonCreator
    public static StoryStatus fromValue(String value) {
        if (value == null) {
            return null;
        }
        
        // Try to match by value first (from JSON)
=======
    public static StoryStatus fromValue(String value) {
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
        for (StoryStatus status : StoryStatus.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
<<<<<<< HEAD
        
        // Try to match by enum name (from JPA)
        try {
            return StoryStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown story status: " + value);
        }
=======
        throw new IllegalArgumentException("Unknown story status: " + value);
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    }
}