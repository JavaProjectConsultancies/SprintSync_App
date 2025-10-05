package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.StoryPriority;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StoryPriorityConverter implements AttributeConverter<StoryPriority, String> {

    @Override
    public String convertToDatabaseColumn(StoryPriority attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public StoryPriority convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return StoryPriority.fromValue(dbData);
    }
}
