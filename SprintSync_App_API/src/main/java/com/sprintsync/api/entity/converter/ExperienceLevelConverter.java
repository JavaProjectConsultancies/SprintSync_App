package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.ExperienceLevel;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.logging.Logger;

@Converter
public class ExperienceLevelConverter implements AttributeConverter<ExperienceLevel, String> {

    private static final Logger logger = Logger.getLogger(ExperienceLevelConverter.class.getName());

    @Override
    public String convertToDatabaseColumn(ExperienceLevel experienceLevel) {
        if (experienceLevel == null) {
            return null;
        }
        return experienceLevel.getValue();
    }

    @Override
    public ExperienceLevel convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }
        
        try {
            return ExperienceLevel.fromValue(value);
        } catch (IllegalArgumentException e) {
            // Handle unknown values gracefully
            logger.warning("Unknown experience level value: " + value + ". Defaulting to 'M1'.");
            
            // Map common variations/typos to valid values
            String normalizedValue = value.toUpperCase().trim();
            switch (normalizedValue) {
                case "JUNIOR":
                case "E0":
                    return ExperienceLevel.E1;
                case "MID":
                case "INTERMEDIATE":
                case "M4":
                    return ExperienceLevel.M2;
                case "SENIOR":
                case "S2":
                    return ExperienceLevel.S1;
                case "LEAD":
                case "L0":
                    return ExperienceLevel.L1;
                default:
                    // Default to M1 for any other unknown value
                    return ExperienceLevel.M1;
            }
        }
    }
}
