package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.ExperienceLevel;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ExperienceLevelConverter implements AttributeConverter<ExperienceLevel, String> {

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
        return ExperienceLevel.fromValue(value);
    }
}
