# Domain Migration Summary

## Overview
This migration updates the SprintSync application to use only 2 domains:
1. **development** - Development and Engineering Domain
2. **management** - Management and Administration Domain

## Changes Made

### 1. Database Migration Script
- **File**: `SprintSync_App_API/src/main/resources/db/migration/update_domains_to_two_only.sql`
- **Purpose**: Migrates existing database to have only 2 domains
- **Actions**:
  - Creates 'development' and 'management' domains if they don't exist
  - Updates admin users to 'management' domain
  - Updates first 3 non-admin users to 'development' domain
  - Deletes all other domains
  - Handles foreign key constraints properly

### 2. Schema Files Updated
- **Files Updated**:
  - `SprintSync_App/src/database/schema.sql`
  - `SprintSync_App/create-tables.sql`
- **Changes**: Replaced 8 old domains with 2 new domains

### 3. Demo Users Setup
- **File**: `SprintSync_App_API/setup-demo-users.sql`
- **Changes**:
  - Updated to create only 2 domains
  - Admin user assigned to 'management' domain
  - 3 developer users assigned to 'development' domain

### 4. Frontend Components Updated
- **File**: `SprintSync_App/src/components/Login.tsx`
- **Changes**: Replaced hardcoded domain list with dynamic API call using `useDomains` hook

## User Assignment Requirements

### Current Setup (After Migration):
- **Admin User**: Assigned to 'management' domain
- **3 Development Users**: Assigned to 'development' domain

### Total Users: 4
- 1 Admin (management domain)
- 3 Developers (development domain)

## Running the Migration

### Option 1: Automatic (Flyway)
The migration script is in the Flyway migrations folder and will run automatically when the Spring Boot application starts (if Flyway is enabled).

### Option 2: Manual Execution
Run the SQL script directly on your database:
```sql
-- Connect to your database and run:
\i SprintSync_App_API/src/main/resources/db/migration/update_domains_to_two_only.sql
```

### Option 3: Using psql
```bash
psql -h <host> -U <user> -d <database> -f SprintSync_App_API/src/main/resources/db/migration/update_domains_to_two_only.sql
```

## Verification

After running the migration, verify the changes:

```sql
-- Check domains
SELECT id, name, description FROM domains ORDER BY name;

-- Check user assignments
SELECT 
    u.name as user_name,
    u.role,
    d.name as domain_name
FROM users u
LEFT JOIN domains d ON u.domain_id = d.id
ORDER BY u.role, u.name;

-- Verify counts
SELECT 
    d.name as domain_name,
    COUNT(u.id) as user_count
FROM domains d
LEFT JOIN users u ON u.domain_id = d.id
GROUP BY d.id, d.name
ORDER BY d.name;
```

## Expected Results

After migration:
- Only 2 domains should exist: 'development' and 'management'
- 1 admin user should be in 'management' domain
- 3 non-admin users should be in 'development' domain
- All forms and UI components will show only these 2 domains

## Notes

- The migration script handles foreign key constraints by temporarily setting domain_id to NULL before deleting old domains
- Users are reassigned to the correct domains after cleanup
- The migration is idempotent - it can be run multiple times safely
- Frontend components (RegistrationPage, AddUserForm, EditUserForm) already use dynamic domain fetching, so they will automatically show only the 2 domains after the database is updated


