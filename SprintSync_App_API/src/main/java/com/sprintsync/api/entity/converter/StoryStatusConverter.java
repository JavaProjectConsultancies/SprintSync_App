package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.StoryStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class StoryStatusConverter implements AttributeConverter<StoryStatus, String> {

    @Override
    public String convertToDatabaseColumn(StoryStatus attribute) {
        if (attribute == null) {
            return null;
        }
        // Convert to lowercase for database storage
        return attribute.getValue().toLowerCase();
    }

    @Override
    public StoryStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Handle both lowercase (from database) and uppercase (from JSON) values
        return StoryStatus.fromValue(dbData.toUpperCase());
    }
}
