package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.TimeEntryType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter for TimeEntryType enum to handle database enum type conversion.
 * Converts between Java enum and PostgreSQL custom enum type.
 * 
 * @author Mayuresh G
 */
@Converter(autoApply = true)
public class TimeEntryTypeConverter implements AttributeConverter<TimeEntryType, String> {

    @Override
    public String convertToDatabaseColumn(TimeEntryType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public TimeEntryType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        
        for (TimeEntryType type : TimeEntryType.values()) {
            if (type.getValue().equals(dbData)) {
                return type;
            }
        }
        
        throw new IllegalArgumentException("Unknown TimeEntryType: " + dbData);
    }
}
