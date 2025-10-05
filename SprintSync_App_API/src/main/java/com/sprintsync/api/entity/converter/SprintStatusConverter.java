package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.SprintStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class SprintStatusConverter implements AttributeConverter<SprintStatus, String> {

    @Override
    public String convertToDatabaseColumn(SprintStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public SprintStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return SprintStatus.fromValue(dbData);
    }
}
