package com.sprintsync.api.entity.converter;

import com.sprintsync.api.entity.enums.UserRole;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter for UserRole enum to handle PostgreSQL enum type mapping.
 * 
 * @author Mayuresh G
 */
@Converter
public class UserRoleConverter implements AttributeConverter<UserRole, String> {

    @Override
    public String convertToDatabaseColumn(UserRole userRole) {
        if (userRole == null) {
            return null;
        }
        return userRole.getValue();
    }

    @Override
    public UserRole convertToEntityAttribute(String value) {
        if (value == null) {
            return null;
        }
        try {
            return UserRole.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown user role: " + value, e);
        }
    }
}
