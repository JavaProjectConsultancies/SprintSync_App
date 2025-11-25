# Department Migration Summary

## Overview
This document summarizes the department migration from old department names to new department names across the entire SprintSync application.

## New Departments

The following 6 departments have been created with specific IDs:

1. **ERP & Strategic Technology** (ID: `550e8400-e29b-41d4-a716-446655440010`)
   - Description: ERP systems and strategic technology initiatives

2. **HIMS & Pharma ZIP** (ID: `550e8400-e29b-41d4-a716-446655440011`)
   - Description: Hospital Information Management Systems and Pharma ZIP solutions

3. **Pharma Old** (ID: `550e8400-e29b-41d4-a716-446655440012`)
   - Description: Legacy pharmaceutical systems and applications

4. **Infrastructure Management** (ID: `550e8400-e29b-41d4-a716-446655440013`)
   - Description: IT infrastructure and system management

5. **Implementation** (ID: `550e8400-e29b-41d4-a716-446655440014`)
   - Description: Project implementation and deployment services

6. **Administration** (ID: `550e8400-e29b-41d4-a716-446655440015`)
   - Description: Administrative and management services

## Migration Mapping

### Old Departments → New Departments
- **VNIT** → **ERP & Strategic Technology** (for developers and most cases)
- **Dinshaw** → **ERP & Strategic Technology** (for developers and most cases)
- **Hospy** → **HIMS & Pharma ZIP**
- **Pharma** → **Pharma Old**
- **Engineering** → **ERP & Strategic Technology**
- **IT** → **Administration** (for admin users)

### User Assignments
- **Admin users** → **Administration** department
- **Developer users** (3 users) → **ERP & Strategic Technology** department

## Files Updated

### Database Files
1. `SprintSync_App/src/database/schema.sql` - Updated department INSERT statements
2. `SprintSync_App/create-tables.sql` - Updated department INSERT statements
3. `SprintSync_App_API/setup-demo-users.sql` - Updated departments and user assignments
4. `SprintSync_App/src/database/sample-data.sql` - Updated all department references
5. `SprintSync_App/update-departments-migration.sql` - **NEW** Migration script for existing databases

### Frontend Files
1. `SprintSync_App/src/contexts/AuthContext.tsx` - Updated all hardcoded department names
2. `SprintSync_App/src/pages/ProjectsPage.tsx` - Updated project department references
3. `SprintSync_App/src/components/DashboardFilters.tsx` - Updated mock departments
4. `SprintSync_App/src/components/Login.tsx` - Updated department dropdown options
5. `SprintSync_App/src/pages/ScrumPage_Fixed.tsx` - Updated project department references
6. `SprintSync_App/src/database/README.md` - Updated documentation

## How to Run the Migration

### Option 1: Using PowerShell Script (Recommended)
```powershell
cd SprintSync_App
.\run-department-migration.ps1
```

**Note:** Before running, update the database connection parameters in `run-department-migration.ps1`:
- `$dbHost` - Database host (default: localhost)
- `$dbPort` - Database port (default: 5432)
- `$dbName` - Database name (default: sprintsync)
- `$dbUser` - Database user (default: postgres)
- `$env:PGPASSWORD` - Database password

### Option 2: Manual SQL Execution
```bash
psql -h localhost -U postgres -d sprintsync -f update-departments-migration.sql
```

### Option 3: Direct Database Connection
1. Connect to your PostgreSQL database
2. Open `SprintSync_App/update-departments-migration.sql`
3. Execute the script in your database client

## Migration Steps

The migration script performs the following operations:

1. **Update existing users:**
   - Developers → ERP & Strategic Technology
   - Admins → Administration

2. **Update existing projects:**
   - Projects with old departments → ERP & Strategic Technology (default)

3. **Delete old departments:**
   - Removes VNIT, Dinshaw, Hospy, Pharma, Engineering

4. **Insert new departments:**
   - Creates all 6 new departments with specific UUIDs

5. **Verify changes:**
   - Shows summary of departments with user and project counts

## Verification

After running the migration, verify the changes:

```sql
-- Check all departments
SELECT id, name, description FROM departments ORDER BY name;

-- Check user assignments
SELECT 
    u.name, 
    u.role, 
    d.name as department_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
ORDER BY u.role, u.name;

-- Check project assignments
SELECT 
    p.name, 
    d.name as department_name
FROM projects p
LEFT JOIN departments d ON p.department_id = d.id
ORDER BY p.name;
```

## Important Notes

1. **Department IDs**: All new departments have specific UUIDs to ensure consistency across environments.

2. **User Assignments**: 
   - The 3 developer users are assigned to "ERP & Strategic Technology"
   - The admin user is assigned to "Administration"

3. **Backward Compatibility**: The migration script handles existing data gracefully by:
   - Updating user department assignments before deleting old departments
   - Updating project department assignments before deleting old departments

4. **Forms and UI**: The frontend forms (AddUserForm, EditUserForm) use the API to fetch departments dynamically, so they will automatically show the new departments after the database migration.

## Rollback (if needed)

If you need to rollback the migration:

1. Restore from database backup (recommended)
2. Or manually recreate old departments and reassign users/projects

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify all 6 new departments exist in database
- [ ] Verify admin user is assigned to Administration
- [ ] Verify developer users are assigned to ERP & Strategic Technology
- [ ] Verify old departments are removed
- [ ] Check frontend forms show new departments
- [ ] Verify user creation/editing works with new departments
- [ ] Verify project creation works with new departments
- [ ] Test login and authentication still works

## Support

If you encounter any issues during migration:
1. Check database connection parameters
2. Verify PostgreSQL user has necessary permissions
3. Check migration script output for errors
4. Review database logs for detailed error messages

