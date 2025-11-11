# PowerShell script to create the time entry rollup trigger
# This script applies the migration to automatically update actual_hours in tasks and stories

# Database connection details (from application.properties)
$DB_HOST = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$DB_PORT = "19973"
$DB_NAME = "defaultdb"
$DB_USER = "avnadmin"
$DB_PASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"

Write-Host "Creating time entry rollup trigger..." -ForegroundColor Cyan
Write-Host ""

# Read the SQL file
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptPath "SprintSync_App_API\src\main\resources\db\migration\create_time_entry_rollup_trigger.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file not found at $sqlFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure the file exists at:" -ForegroundColor Yellow
    Write-Host "  SprintSync_App_API\src\main\resources\db\migration\create_time_entry_rollup_trigger.sql" -ForegroundColor Yellow
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
        Write-Host "✓ Time entry rollup trigger created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The trigger will now automatically update actual_hours in tasks and stories" -ForegroundColor Cyan
        Write-Host "whenever time entries are inserted, updated, or deleted." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next step: Run the backfill script to initialize actual_hours for existing data:" -ForegroundColor Yellow
        Write-Host "  .\backfill-actual-hours.ps1" -ForegroundColor Yellow
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
    Write-Host ""
    Write-Host "Alternatively, you can run this SQL using any PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "  1. pgAdmin" -ForegroundColor White
    Write-Host "  2. DBeaver" -ForegroundColor White
    Write-Host "  3. VS Code PostgreSQL extension" -ForegroundColor White
    Write-Host "  4. Any other PostgreSQL management tool" -ForegroundColor White
}

