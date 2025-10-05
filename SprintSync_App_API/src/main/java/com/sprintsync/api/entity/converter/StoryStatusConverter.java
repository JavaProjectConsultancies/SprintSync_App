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
        return attribute.getValue();
    }

    @Override
    public StoryStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return StoryStatus.fromValue(dbData);
    }
}
