package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.RiskImpact;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RiskImpactConverter implements AttributeConverter<RiskImpact, String> {

    @Override
    public String convertToDatabaseColumn(RiskImpact attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public RiskImpact convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return RiskImpact.fromValue(dbData);
    }
}
