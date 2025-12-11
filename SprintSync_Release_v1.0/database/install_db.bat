@echo off
echo Installing SprintSync Database Schema...

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: psql is not in your PATH. Please install PostgreSQL and ensure the bin directory is in your PATH.
    pause
    exit /b 1
)

set /p DB_NAME="Enter Database Name (default: sprintsync): "
if "%DB_NAME%"=="" set DB_NAME=sprintsync

set /p DB_USER="Enter Database User (default: postgres): "
if "%DB_USER%"=="" set DB_USER=postgres

echo.
echo Running schema.sql against database %DB_NAME% as user %DB_USER%...
psql -U %DB_USER% -d %DB_NAME% -f schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database setup completed successfully!
) else (
    echo.
    echo An error occurred during database setup.
)

pause
