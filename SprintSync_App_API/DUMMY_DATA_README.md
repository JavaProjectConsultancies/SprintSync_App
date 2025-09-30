# SprintSync Database Dummy Data

This directory contains scripts and files for populating the SprintSync database with comprehensive dummy data.

## Files Included

- `populate-dummy-data.sql` - Main SQL script with all dummy data
- `populate-data.bat` - Windows batch script to run the SQL script
- `populate-data.ps1` - PowerShell script to run the SQL script (recommended for Windows)
- `DataController.java` - REST API endpoint for populating data programmatically

## Prerequisites

1. PostgreSQL database must be running
2. Database `sprintsync` must exist
3. Database schema must be created (run `create-tables.sql` first)
4. `psql` command-line tool must be available in PATH

## Database Connection

The scripts use these default connection parameters:
- Host: `localhost`
- Port: `5432`
- Database: `sprintsync`
- Username: `postgres`
- Password: `pass121word`

You can modify these parameters in the batch/PowerShell scripts if needed.

## How to Populate Dummy Data

### Option 1: Using PowerShell Script (Recommended for Windows)

```powershell
.\populate-data.ps1
```

### Option 2: Using Batch Script

```cmd
populate-data.bat
```

### Option 3: Using psql Directly

```bash
psql -h localhost -p 5432 -U postgres -d sprintsync -f populate-dummy-data.sql
```

### Option 4: Using REST API

Start the Spring Boot application and make a POST request:

```bash
curl -X POST http://localhost:8080/api/data/populate
```

## Sample Data Overview

The dummy data includes:

### Core Entities
- **5 Departments**: Engineering, Product, Design, QA, Marketing
- **5 Domains**: Web Development, Mobile Development, Data Analytics, DevOps, AI/ML
- **6 Users**: Admin, Product Manager, 2 Developers, Designer, QA Engineer

### Project Management
- **3 Projects**: 
  - E-commerce Platform (Active)
  - Mobile Banking App (Active)
  - Data Analytics Platform (Planning)
- **3 Epics**: User Authentication, Payment Processing, Mobile Authentication
- **3 Releases**: v1.0 releases for each project
- **7 Quality Gates**: Various testing gates for releases

### Agile Workflow
- **3 Sprints**: Authentication, Payment Gateway, Mobile Auth
- **3 User Stories**: User Login, User Registration, Biometric Login
- **3 Tasks**: API implementation, UI creation, SDK integration
- **6 Subtasks**: Detailed implementation steps

### Additional Data
- **5 Time Entries**: Sample time tracking data
- **3 Notifications**: Task assignments and status updates
- **3 Comments**: User comments on tasks and stories
- **4 Todos**: Personal todo items for users
- **3 Milestones**: Project milestones with progress

## Data Relationships

The dummy data is designed to show realistic relationships:

- Users are assigned to departments and domains
- Projects have managers and team members
- Epics belong to projects and have owners/assignees
- Releases contain epics and have quality gates
- Stories belong to epics and releases
- Tasks are part of stories
- Subtasks break down tasks
- Time entries track work on various levels
- Comments are associated with entities
- Notifications alert users to changes

## Customization

To customize the dummy data:

1. Edit `populate-dummy-data.sql` to modify the data
2. Adjust connection parameters in batch/PowerShell scripts
3. Modify the REST API endpoint in `DataController.java`

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure PostgreSQL is running
2. **Database Not Found**: Create the `sprintsync` database first
3. **Schema Not Found**: Run `create-tables.sql` before populating data
4. **Permission Denied**: Check database user permissions
5. **psql Not Found**: Install PostgreSQL client tools

### Verification

After running the script, verify data was inserted:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM epics;
-- etc.
```

## Next Steps

After populating dummy data:

1. Start the Spring Boot application
2. Test the REST API endpoints
3. Verify data relationships
4. Explore the SprintSync frontend application

## Support

For issues with dummy data population, check:

1. Database connection parameters
2. PostgreSQL service status
3. Database schema completeness
4. User permissions

---

**Note**: This dummy data is for development and testing purposes only. Do not use in production environments.
