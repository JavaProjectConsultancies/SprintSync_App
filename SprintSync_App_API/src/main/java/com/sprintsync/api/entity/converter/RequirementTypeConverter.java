package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.RequirementType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RequirementTypeConverter implements AttributeConverter<RequirementType, String> {

    @Override
    public String convertToDatabaseColumn(RequirementType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public RequirementType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return RequirementType.fromValue(dbData);
    }
}
