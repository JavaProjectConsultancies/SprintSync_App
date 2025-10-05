package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.RequirementStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RequirementStatusConverter implements AttributeConverter<RequirementStatus, String> {

    @Override
    public String convertToDatabaseColumn(RequirementStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public RequirementStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return RequirementStatus.fromValue(dbData);
    }
}
