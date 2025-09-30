@echo off
echo Populating SprintSync database with dummy data...
echo.

REM Set database connection parameters
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=sprintsync
set DB_USER=postgres
set DB_PASSWORD=pass121word

echo Connecting to database: %DB_NAME% on %DB_HOST%:%DB_PORT%
echo.

REM Execute the SQL script
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f populate-dummy-data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Dummy data populated successfully!
    echo.
    echo Sample data includes:
    echo - 5 Departments
    echo - 5 Domains  
    echo - 6 Users
    echo - 3 Projects
    echo - 3 Epics
    echo - 3 Releases
    echo - 7 Quality Gates
    echo - 3 Sprints
    echo - 3 User Stories
    echo - 3 Tasks
    echo - 6 Subtasks
    echo - 5 Time Entries
    echo - 3 Notifications
    echo - 3 Comments
    echo - 4 Todos
    echo - 3 Milestones
    echo.
) else (
    echo.
    echo ❌ Failed to populate dummy data!
    echo Please check your database connection and try again.
    echo.
)

pause
