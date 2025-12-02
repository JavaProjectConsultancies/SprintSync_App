# PowerShell script to add attachment_type column to attachments table
# This script connects to the PostgreSQL database and runs the migration

# Database connection details (from application.properties)
$DB_HOST = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$DB_PORT = "19973"
$DB_NAME = "defaultdb"
$DB_USER = "avnadmin"
$DB_PASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"

# Migration file path (relative to SprintSync_App directory)
$MIGRATION_FILE = "database\migrations\005_add_attachment_type_to_attachments.sql"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running Attachment Type Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if migration file exists
if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "Migration file not found: $MIGRATION_FILE" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "Migration file found: $MIGRATION_FILE" -ForegroundColor Green
Write-Host ""

# Try to use psql if available
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "Running migration..." -ForegroundColor Yellow
    Write-Host ""
    
    $env:PGPASSWORD = $DB_PASSWORD
    
    try {
        # Run the migration file
        psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Migration completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "The attachment_type column has been added to the attachments table." -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "Error running migration: $_" -ForegroundColor Red
        exit 1
    } finally {
        $env:PGPASSWORD = ""
    }
} else {
    Write-Host "psql command not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client tools and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can run the SQL file manually:" -ForegroundColor Yellow
    Write-Host "  File: $MIGRATION_FILE" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
