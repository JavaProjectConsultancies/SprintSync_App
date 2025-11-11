# Fix User Passwords Script
# This script updates user passwords in the database with correct BCrypt hashes

$hostname = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$port = "19973"
$database = "defaultdb"
$username = "avnadmin"
$password = "AVNS_Dte-khF5WTLnyXPYp_q"

Write-Host "=== Fixing User Passwords ===" -ForegroundColor Green

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "ERROR: psql is not found in PATH. Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "Alternatively, you can run the SQL manually using any PostgreSQL client:" -ForegroundColor Yellow
    Write-Host "   Host: $hostname" -ForegroundColor Yellow
    Write-Host "   Port: $port" -ForegroundColor Yellow
    Write-Host "   Database: $database" -ForegroundColor Yellow
    Write-Host "   User: $username" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL to execute:" -ForegroundColor Yellow
    Write-Host ""
    Get-Content "$PSScriptRoot\update-user-passwords.sql"
    exit 1
}

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $password

Write-Host "Connecting to database..." -ForegroundColor Cyan

# Execute the SQL file using psql with proper connection
$sqlFile = Join-Path $PSScriptRoot "update-user-passwords.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: SQL file not found: $sqlFile" -ForegroundColor Red
    exit 1
}

try {
    # Use psql with connection parameters
    $env:PGPASSWORD = $password
    
    $psqlArgs = @(
        "-h", $hostname
        "-p", $port
        "-U", $username
        "-d", $database
        "-f", $sqlFile
        "-q"
    )
    
    Write-Host "Executing SQL updates..." -ForegroundColor Cyan
    & psql $psqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Password update completed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now login with these credentials:" -ForegroundColor Cyan
        Write-Host "  Admin:     admin@demo.com / admin123" -ForegroundColor White
        Write-Host "  Manager:   manager@demo.com / manager123" -ForegroundColor White
        Write-Host "  Developer: developer@demo.com / dev123" -ForegroundColor White
        Write-Host "  Designer:  designer@demo.com / design123" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "⚠️  Some SQL statements may have failed. Check database connection." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To execute manually, connect with:" -ForegroundColor Yellow
        Write-Host "  psql -h $hostname -p $port -U $username -d $database" -ForegroundColor White
        Write-Host ""
        Write-Host "Then run the SQL from: $sqlFile" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "ERROR: Failed to execute SQL: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix manually:" -ForegroundColor Yellow
    Write-Host "1. Connect to database using any PostgreSQL client" -ForegroundColor White
    Write-Host "2. Run the SQL from: $sqlFile" -ForegroundColor White
    exit 1
} finally {
    # Clear password from environment
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

