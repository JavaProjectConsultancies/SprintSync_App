# PowerShell script to backfill actual_hours for existing tasks and stories
# This script initializes actual_hours based on existing time_entries data

# Database connection details (from application.properties)
$DB_HOST = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$DB_PORT = "19973"
$DB_NAME = "defaultdb"
$DB_USER = "avnadmin"
$DB_PASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"

Write-Host "Backfilling actual_hours for existing tasks and stories..." -ForegroundColor Cyan
Write-Host ""

# Read the SQL file
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptPath "SprintSync_App_API\src\main\resources\db\migration\backfill_actual_hours.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file not found at $sqlFile" -ForegroundColor Red
    exit 1
}

# Try to use psql if available
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "Using psql command..." -ForegroundColor Yellow
    $env:PGPASSWORD = $DB_PASSWORD
    
    # Execute the SQL file
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Actual hours backfilled successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "All existing tasks and stories now have accurate actual_hours values" -ForegroundColor Cyan
        Write-Host "based on their time_entries data." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Error executing SQL:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        exit 1
    }
    
    $env:PGPASSWORD = ""
} else {
    Write-Host "psql command not found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run the following SQL file manually on your database:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  $sqlFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or install PostgreSQL client tools and run this script again." -ForegroundColor Yellow
}

