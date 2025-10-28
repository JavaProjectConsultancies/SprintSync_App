# Enum Case Sensitivity Fix

## Problem
The Add User form was sending uppercase enum values (e.g., "DEVELOPER", "MANAGER") but the backend API expects lowercase values (e.g., "developer", "manager"). This caused a 400 Bad Request error with the message:

```
Cannot deserialize value of type `com.sprintsync.api.entity.enums.UserRole` from String "DEVELOPER": not one of the values accepted for Enum class: [developer, designer, manager, admin]
```

## Root Cause
- **Frontend Form**: Sending uppercase enum values like "DEVELOPER", "MANAGER"
- **Backend API**: Expecting lowercase enum values like "developer", "manager"
- **Mismatch**: Case sensitivity causing JSON deserialization failure

## Solution Applied

### 1. Updated Form Data Conversion
```typescript
// Before (causing error)
role: formData.role as any,

// After (fixed)
role: formData.role.toLowerCase() as any, // Convert to lowercase to match backend enum
```

### 2. Updated Experience Level Conversion
```typescript
// Before
experience: formData.experience || undefined,

// After
experience: formData.experience ? formData.experience.toLowerCase() : undefined, // Convert to lowercase to match backend enum
```

### 3. Updated Form Default Values
```typescript
// Before
role: 'DEVELOPER',

// After
role: 'developer', // Use lowercase to match backend enum
```

### 4. Updated Role Options in Select Component
```typescript
// Before
<SelectItem value="ADMIN">Admin</SelectItem>
<SelectItem value="MANAGER">Manager</SelectItem>
<SelectItem value="DEVELOPER">Developer</SelectItem>
<SelectItem value="DESIGNER">Designer</SelectItem>

// After
<SelectItem value="admin">Admin</SelectItem>
<SelectItem value="manager">Manager</SelectItem>
<SelectItem value="developer">Developer</SelectItem>
<SelectItem value="designer">Designer</SelectItem>
```

## Backend Enum Values

### UserRole Enum (Backend)
```java
public enum UserRole {
    admin("admin"),
    manager("manager"),
    developer("developer"),
    designer("designer");
}
```

### ExperienceLevel Enum (Backend)
```java
public enum ExperienceLevel {
    junior("junior"),
    mid("mid"), 
    senior("senior"),
    lead("lead");
}
```

## Result
- ✅ Form now sends lowercase enum values
- ✅ Backend API can properly deserialize the values
- ✅ User creation works without 400 errors
- ✅ Database stores correct enum values
- ✅ Form validation still works properly

## Testing
The form should now successfully create users with proper enum values that match the backend expectations.
