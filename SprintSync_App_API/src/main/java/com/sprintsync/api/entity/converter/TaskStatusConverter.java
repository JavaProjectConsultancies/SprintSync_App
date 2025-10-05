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
        return attribute.getValue();
    }

    @Override
    public TaskStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return TaskStatus.fromValue(dbData);
    }
}
