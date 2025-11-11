# PostgreSQL Enum Type Fix

## Problem
The application was encountering a `DataIntegrityViolationException` with the error:
```
ERROR: column "role" is of type user_role but expression is of type character varying
Hint: You will need to rewrite or cast the expression.
```

## Root Cause
PostgreSQL has custom enum types (`user_role`, `experience_level`) defined in the database, but Hibernate was trying to insert string values directly without proper type casting.

## Solution Applied

### 1. Created UserRoleConverter
```java
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
```

### 2. Updated User Entity
```java
// Before (causing error)
@Enumerated(EnumType.STRING)
@Column(name = "role", nullable = false)
@NotNull
private UserRole role;

// After (fixed)
@Convert(converter = UserRoleConverter.class)
@Column(name = "role", nullable = false, columnDefinition = "user_role")
@NotNull
private UserRole role;
```

### 3. Updated Experience Field
```java
// Before
@Convert(converter = ExperienceLevelConverter.class)
@Column(name = "experience")
private ExperienceLevel experience;

// After (added columnDefinition)
@Convert(converter = ExperienceLevelConverter.class)
@Column(name = "experience", columnDefinition = "experience_level")
private ExperienceLevel experience;
```

## Database Schema
The database has these custom enum types defined:
```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer', 'designer');
CREATE TYPE experience_level AS ENUM ('junior', 'mid', 'senior', 'lead');
```

## Key Changes Made

1. **UserRoleConverter**: Handles conversion between Java enum and PostgreSQL enum type
2. **Column Definition**: Added `columnDefinition = "user_role"` to specify PostgreSQL enum type
3. **Experience Level**: Added `columnDefinition = "experience_level"` for consistency
4. **Proper Type Casting**: Converters ensure proper type casting for PostgreSQL

## Result
- ✅ PostgreSQL enum types are properly handled
- ✅ No more DataIntegrityViolationException
- ✅ User creation works with proper enum values
- ✅ Database stores correct enum types
- ✅ Type safety maintained

## Testing
The form should now successfully create users with proper PostgreSQL enum type handling.
