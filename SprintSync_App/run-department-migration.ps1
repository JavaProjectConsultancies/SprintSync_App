# PowerShell script to run department migration
# This script updates departments in the database

Write-Host "Starting Department Migration..." -ForegroundColor Green
Write-Host ""

# Database connection parameters (from application.properties)
$env:PGPASSWORD = "AVNS_fo7-HjILanrHp67LRuC"
$dbHost = "pg-36c174e-sprintsync.c.aivencloud.com"
$dbPort = "23096"
$dbName = "defaultdb"
$dbUser = "avnadmin"
$sslMode = "require"

# SQL file path
$sqlFile = Join-Path $PSScriptRoot "update-departments-migration.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file not found at $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Executing migration script: $sqlFile" -ForegroundColor Yellow
Write-Host ""

# Execute the SQL file with SSL support
try {
    $env:PGSSLMODE = $sslMode
    $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "New Departments:" -ForegroundColor Cyan
        Write-Host "  1. ERP & Strategic Technology" -ForegroundColor White
        Write-Host "  2. HIMS & Pharma ZIP" -ForegroundColor White
        Write-Host "  3. Pharma Old" -ForegroundColor White
        Write-Host "  4. Infrastructure Management" -ForegroundColor White
        Write-Host "  5. Implementation" -ForegroundColor White
        Write-Host "  6. Administration" -ForegroundColor White
        Write-Host ""
        Write-Host "User assignments:" -ForegroundColor Cyan
        Write-Host "  - Admin users -> Administration" -ForegroundColor White
        Write-Host "  - Developer users -> ERP & Strategic Technology" -ForegroundColor White
    } else {
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error executing migration: $_" -ForegroundColor Red
    exit 1
}

