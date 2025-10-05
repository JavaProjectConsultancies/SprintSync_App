package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.RiskProbability;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RiskProbabilityConverter implements AttributeConverter<RiskProbability, String> {

    @Override
    public String convertToDatabaseColumn(RiskProbability attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public RiskProbability convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return RiskProbability.fromValue(dbData);
    }
}
