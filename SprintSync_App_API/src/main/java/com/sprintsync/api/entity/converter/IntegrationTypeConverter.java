package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.AvailableIntegration.IntegrationType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class IntegrationTypeConverter implements AttributeConverter<IntegrationType, String> {

    @Override
    public String convertToDatabaseColumn(IntegrationType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public IntegrationType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return IntegrationType.fromValue(dbData);
    }
}
