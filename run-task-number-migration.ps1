# PowerShell script to run the task_number migration
# This script executes the SQL migration to add task_number column to tasks table

$ErrorActionPreference = "Stop"

Write-Host "Starting task_number migration..." -ForegroundColor Cyan

# Database connection details from application.properties
$DB_HOST = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$DB_PORT = "19973"
$DB_NAME = "defaultdb"
$DB_USER = "avnadmin"
$DB_PASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"

# Migration file path
$MIGRATION_FILE = "SprintSync_App_API\src\main\resources\db\migration\add_task_number_to_tasks.sql"

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "PostgreSQL client (psql) not found in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL client tools or add psql to your PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can run the SQL manually using any PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
    Write-Host "  Port: $DB_PORT" -ForegroundColor Gray
    Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
    Write-Host "  User: $DB_USER" -ForegroundColor Gray
    Write-Host "  File: $MIGRATION_FILE" -ForegroundColor Gray
    exit 1
}

# Check if migration file exists
if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "Migration file not found: $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "Migration file found: $MIGRATION_FILE" -ForegroundColor Green

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD

try {
    Write-Host ""
    Write-Host "Executing migration..." -ForegroundColor Cyan
    Write-Host "Connecting to: ${DB_HOST}:${DB_PORT}/${DB_NAME} as ${DB_USER}" -ForegroundColor Gray
    
    # Execute the migration
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The task_number column has been added to the tasks table." -ForegroundColor Gray
        Write-Host "Existing tasks have been assigned sequential numbers." -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Error output:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error executing migration: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
