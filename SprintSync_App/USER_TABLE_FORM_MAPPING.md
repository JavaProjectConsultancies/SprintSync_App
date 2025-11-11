# User Table to Add User Form Mapping

## Database Schema Alignment

This document provides a comprehensive mapping between the User database table, API entity fields, and the Add User form sections to ensure perfect data consistency.

## User Table Schema (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id UUID REFERENCES departments(id),
    domain_id UUID REFERENCES domains(id),
    avatar_url TEXT,
    experience experience_level DEFAULT 'mid',
    hourly_rate DECIMAL(10,2),
    availability_percentage INTEGER DEFAULT 100 CHECK (availability_percentage >= 0 AND availability_percentage <= 100),
    skills JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Form Section Mapping

### 1. Basic Information Section
| **Form Field** | **Database Column** | **API Entity Field** | **Data Type** | **Constraints** | **Validation** |
|----------------|---------------------|---------------------|---------------|-----------------|----------------|
| First Name + Last Name | `name` | `name` | `VARCHAR(255)` | NOT NULL | Required, 2-255 chars |
| Email | `email` | `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Required, valid email, unique |
| Password | `password_hash` | `passwordHash` | `VARCHAR(255)` | NOT NULL | Required, min 6 chars, hashed by backend |
| Confirm Password | - | - | - | - | Must match password |

### 2. Role & Organization Section
| **Form Field** | **Database Column** | **API Entity Field** | **Data Type** | **Constraints** | **Validation** |
|----------------|---------------------|---------------------|---------------|-----------------|----------------|
| Role | `role` | `role` | `user_role` ENUM | NOT NULL | Required, valid enum value |
| Department | `department_id` | `departmentId` | `UUID` | Foreign Key | Optional, valid department ID |
| Domain | `domain_id` | `domainId` | `UUID` | Foreign Key | Optional, valid domain ID |
| Account Status | `is_active` | `isActive` | `BOOLEAN` | DEFAULT true | Active/Inactive selection |

### 3. Professional Details Section
| **Form Field** | **Database Column** | **API Entity Field** | **Data Type** | **Constraints** | **Validation** |
|----------------|---------------------|---------------------|---------------|-----------------|----------------|
| Hourly Rate | `hourly_rate` | `hourlyRate` | `DECIMAL(10,2)` | Optional | Positive number, max 999999.99 |
| Availability % | `availability_percentage` | `availabilityPercentage` | `INTEGER` | DEFAULT 100, CHECK 0-100 | 0-100 range |
| Experience Level | `experience` | `experience` | `experience_level` ENUM | DEFAULT 'mid' | Valid enum value |
| Skills | `skills` | `skills` | `JSONB` | DEFAULT '[]' | Comma-separated, stored as JSON array |

### 4. Profile Section
| **Form Field** | **Database Column** | **API Entity Field** | **Data Type** | **Constraints** | **Validation** |
|----------------|---------------------|---------------------|---------------|-----------------|----------------|
| Avatar URL | `avatar_url` | `avatarUrl` | `TEXT` | Optional | Valid image URL |

## Data Type Conversions

### Form to Database Mapping
```typescript
const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
  // Required fields (matching database NOT NULL constraints)
  email: formData.email.trim(),
  passwordHash: formData.password, // Will be hashed by backend
  name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
  role: formData.role as any,
  isActive: formData.isActive,
  
  // Optional fields (matching database nullable columns)
  departmentId: formData.departmentId === 'none' ? undefined : formData.departmentId,
  domainId: formData.domainId === 'none' ? undefined : formData.domainId,
  avatarUrl: formData.avatarUrl.trim() || undefined,
  experience: formData.experience || undefined,
  hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
  availabilityPercentage: parseInt(formData.availabilityPercentage) || 100,
  skills: formData.skills.trim() ? JSON.stringify(formData.skills.split(',').map(s => s.trim())) : undefined
};
```

## Validation Rules

### Required Fields (Database NOT NULL)
- **Name**: 2-255 characters, required
- **Email**: Valid email format, unique, max 255 characters
- **Password**: Minimum 6 characters, will be hashed
- **Role**: Must be valid enum value

### Optional Fields (Database NULLABLE)
- **Department ID**: Valid UUID or null
- **Domain ID**: Valid UUID or null  
- **Avatar URL**: Valid image URL format
- **Hourly Rate**: Positive decimal number
- **Availability**: Integer 0-100
- **Experience**: Valid enum value
- **Skills**: JSON array format

## Database Constraints Enforced

1. **Email Uniqueness**: Handled by backend validation
2. **Availability Range**: 0-100 with CHECK constraint
3. **Hourly Rate Precision**: DECIMAL(10,2) format
4. **Skills JSON Format**: Properly serialized as JSONB
5. **Foreign Key References**: Valid department/domain IDs

## Form Features

### Data Type Indicators
- Field descriptions show database storage format
- Input constraints match database limits
- Validation messages explain requirements

### User Experience
- Clear section organization
- Real-time validation feedback
- Helpful field descriptions
- Proper error handling

## API Integration

The form sends data to the backend API endpoint:
- **Endpoint**: `POST /api/users`
- **Data Format**: Matches User entity structure
- **Validation**: Backend validates all constraints
- **Response**: Created user with generated ID and timestamps

## Testing Checklist

- [ ] All required fields validated
- [ ] Optional fields handled correctly
- [ ] Data type conversions working
- [ ] Database constraints respected
- [ ] API integration functional
- [ ] Error handling comprehensive
- [ ] User experience smooth

## Notes

- Password is hashed by the backend service
- Skills are converted from comma-separated string to JSON array
- Department and Domain IDs are validated against existing records
- All timestamps are automatically managed by the database
- Form resets after successful submission
- Real-time validation provides immediate feedback
