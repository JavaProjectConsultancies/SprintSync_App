@echo off
REM Quick fix script to add estimated_hours column to stories table
REM This fixes the 500 error on /api/stories endpoint

echo.
echo ============================================
echo Fixing stories table - Adding estimated_hours column
echo ============================================
echo.

REM Database connection details from application.properties
set DB_HOST=pg-36c174e-sprintsync.c.aivencloud.com
set DB_PORT=23096
set DB_NAME=defaultdb
set DB_USER=avnadmin
set DB_PASSWORD=AVNS_fo7-HjILanrHp67LRuC

echo Connecting to database...
echo.

REM Run the SQL fix
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f run_fix.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS! Column added successfully.
    echo Please restart your Spring Boot application.
    echo ============================================
) else (
    echo.
    echo ============================================
    echo ERROR: Failed to add column.
    echo Please check your database connection.
    echo ============================================
)

pause

