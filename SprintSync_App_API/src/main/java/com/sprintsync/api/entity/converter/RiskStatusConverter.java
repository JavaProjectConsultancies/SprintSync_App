package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.RiskStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class RiskStatusConverter implements AttributeConverter<RiskStatus, String> {

    @Override
    public String convertToDatabaseColumn(RiskStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public RiskStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return RiskStatus.fromValue(dbData);
    }
}
