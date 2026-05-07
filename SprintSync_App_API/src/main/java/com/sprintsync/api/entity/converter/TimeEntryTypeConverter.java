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
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        String normalized = dbData.trim().toLowerCase();

        // Try exact match on value first
        for (TimeEntryType type : TimeEntryType.values()) {
            if (type.getValue().equalsIgnoreCase(normalized)) {
                return type;
            }
        }

        // Try matching with normalized hyphens/underscores
        String searchData = normalized.replace("-", "").replace("_", "");
        for (TimeEntryType type : TimeEntryType.values()) {
            String typeVal = type.getValue().toLowerCase().replace("-", "").replace("_", "");
            String typeName = type.name().toLowerCase().replace("-", "").replace("_", "");
            if (typeVal.equals(searchData) || typeName.equals(searchData)) {
                return type;
            }
        }

        // Fallback to DEVELOPMENT instead of throwing exception to prevent 500 errors
        return TimeEntryType.DEVELOPMENT;
    }
}
