# PowerShell script to fix database schema for boards and workflow lanes
# This script connects to PostgreSQL and runs the SQL migration

# Database connection parameters (update these if needed)
$env:PGPASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"
$dbHost = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$dbPort = "19973"
$dbName = "defaultdb"
$dbUser = "avnadmin"

Write-Host "Connecting to database and running schema fix..." -ForegroundColor Green

# Run the SQL script
psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "fix-boards-schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema fix completed successfully!" -ForegroundColor Green
} else {
    Write-Host "Error running schema fix. Please check the error messages above." -ForegroundColor Red
    exit $LASTEXITCODE
}

