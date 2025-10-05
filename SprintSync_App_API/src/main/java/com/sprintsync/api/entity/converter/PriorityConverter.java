package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.Priority;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class PriorityConverter implements AttributeConverter<Priority, String> {

    @Override
    public String convertToDatabaseColumn(Priority attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public Priority convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return Priority.fromValue(dbData);
    }
}
