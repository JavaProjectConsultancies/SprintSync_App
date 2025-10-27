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
<<<<<<< HEAD
        // Convert to lowercase for database storage
        return attribute.getValue().toLowerCase();
=======
        return attribute.getValue();
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    }

    @Override
    public StoryStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
<<<<<<< HEAD
        // Handle both lowercase (from database) and uppercase (from JSON) values
        return StoryStatus.fromValue(dbData.toUpperCase());
=======
        return StoryStatus.fromValue(dbData);
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    }
}
