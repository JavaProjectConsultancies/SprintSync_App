package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.TaskStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class TaskStatusConverter implements AttributeConverter<TaskStatus, String> {

    @Override
    public String convertToDatabaseColumn(TaskStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // If attribute is a TaskStatus enum, return its value
        if (attribute instanceof TaskStatus) {
            return attribute.getValue();
        }
        // Otherwise, treat it as a string (for custom lane statuses)
        return attribute.toString();
    }

    @Override
    public TaskStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Check if it's a custom lane status (starts with "custom_lane_")
        if (dbData.startsWith("custom_lane_")) {
            // For custom lanes, return IN_PROGRESS as the enum value
            // The actual custom value will be preserved in the database
            // When tasks are fetched, we'll need to use a custom query to get the raw status
            return TaskStatus.IN_PROGRESS;
        }
        try {
            return TaskStatus.fromValue(dbData);
        } catch (IllegalArgumentException e) {
            // If it's not a recognized enum value, check if it's another custom status
            // Default to IN_PROGRESS for any unrecognized status
            return TaskStatus.IN_PROGRESS;
        }
    }
}
