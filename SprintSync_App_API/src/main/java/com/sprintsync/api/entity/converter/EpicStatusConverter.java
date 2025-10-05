package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.EpicStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class EpicStatusConverter implements AttributeConverter<EpicStatus, String> {

    @Override
    public String convertToDatabaseColumn(EpicStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public EpicStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return EpicStatus.fromValue(dbData);
    }
}
