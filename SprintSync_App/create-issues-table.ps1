# PowerShell script to create the issues table in PostgreSQL
# This script runs the migration SQL file to create the issues table

Write-Host "Creating issues table..." -ForegroundColor Green

# Database connection details (from application.properties)
$DB_HOST = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$DB_PORT = "19973"
$DB_NAME = "defaultdb"
$DB_USER = "avnadmin"
$DB_PASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"

# SQL migration file path
$sqlFile = Join-Path $PSScriptRoot "database\migrations\003_create_issues_table.sql"

# Check if SQL file exists
if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: SQL file not found at $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "SQL file: $sqlFile" -ForegroundColor Yellow
Write-Host ""

# Try to use psql if available
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "Using psql command..." -ForegroundColor Yellow
    $env:PGPASSWORD = $DB_PASSWORD
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $sqlFile
    $result = $LASTEXITCODE
    $env:PGPASSWORD = ""
    
    if ($result -eq 0) {
        Write-Host ""
        Write-Host "✅ Issues table created successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Error executing SQL script" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "psql command not found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run the following SQL command manually on your database:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL file location: $sqlFile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or install PostgreSQL client tools and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can run this SQL using any PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "  1. pgAdmin" -ForegroundColor White
    Write-Host "  2. DBeaver" -ForegroundColor White
    Write-Host "  3. VS Code PostgreSQL extension" -ForegroundColor White
    Write-Host "  4. Any other PostgreSQL management tool" -ForegroundColor White
    Write-Host ""
    Write-Host "Connection details:" -ForegroundColor Yellow
    Write-Host "  Host: $DB_HOST" -ForegroundColor White
    Write-Host "  Port: $DB_PORT" -ForegroundColor White
    Write-Host "  Database: $DB_NAME" -ForegroundColor White
    Write-Host "  User: $DB_USER" -ForegroundColor White
    Write-Host ""
    exit 1
}
