package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.ReleaseStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ReleaseStatusConverter implements AttributeConverter<ReleaseStatus, String> {

    @Override
    public String convertToDatabaseColumn(ReleaseStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public ReleaseStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return ReleaseStatus.fromValue(dbData);
    }
}
