# PowerShell script to run the due_date migration
# This script updates the stories and backlog_stories tables to replace estimated_hours with due_date

param(
    [string]$Host = "pg-36c174e-sprintsync.c.aivencloud.com",
    [int]$Port = 23096,
    [string]$Database = "defaultdb",
    [string]$User = "",
    [string]$Password = ""
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Due Date Migration Script" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for credentials if not provided
if ([string]::IsNullOrEmpty($User)) {
    $User = Read-Host "Enter database username"
}

if ([string]::IsNullOrEmpty($Password)) {
    $SecurePassword = Read-Host "Enter database password" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Build connection string
$ConnectionString = "host=$Host port=$Port dbname=$Database user=$User password=$Password"

Write-Host "Connecting to database..." -ForegroundColor Yellow

try {
    # Check if psql is available
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlPath) {
        Write-Host "ERROR: psql command not found. Please install PostgreSQL client tools." -ForegroundColor Red
        Write-Host "Alternatively, you can run the SQL commands manually in your database client." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "SQL Commands to run:" -ForegroundColor Cyan
        Write-Host "===================" -ForegroundColor Cyan
        Write-Host ""
        Get-Content "database\migrations\008_rename_estimated_hours_to_due_date_in_stories.sql"
        Write-Host ""
        Get-Content "database\migrations\009_rename_estimated_hours_to_due_date_in_backlog_stories.sql"
        exit 1
    }

    # Read migration files
    $migration1 = Get-Content "database\migrations\008_rename_estimated_hours_to_due_date_in_stories.sql" -Raw
    $migration2 = Get-Content "database\migrations\009_rename_estimated_hours_to_due_date_in_backlog_stories.sql" -Raw

    Write-Host "Running migration for stories table..." -ForegroundColor Yellow
    $migration1 | & psql $ConnectionString
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Migration 1 failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host "Running migration for backlog_stories table..." -ForegroundColor Yellow
    $migration2 | & psql $ConnectionString
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Migration 2 failed!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please restart your backend application." -ForegroundColor Yellow

} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual SQL Commands:" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "-- Migration 1: stories table"
    Write-Host "ALTER TABLE stories ADD COLUMN IF NOT EXISTS due_date DATE;"
    Write-Host "ALTER TABLE stories DROP COLUMN IF EXISTS estimated_hours;"
    Write-Host ""
    Write-Host "-- Migration 2: backlog_stories table"
    Write-Host "ALTER TABLE backlog_stories ADD COLUMN IF NOT EXISTS due_date DATE;"
    Write-Host "ALTER TABLE backlog_stories DROP COLUMN IF EXISTS estimated_hours;"
    exit 1
}

