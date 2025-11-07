# PowerShell script to run the add issue_id to subtasks migration
# This script executes the SQL migration to add the issue_id column to the subtasks table

$dbHost = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$port = "19973"
$database = "defaultdb"
$username = "avnadmin"
$password = "AVNS_Dte-khF5WTLnyXPYp_q"

$sqlFile = "src\main\resources\db\migration\add_issue_id_to_subtasks.sql"
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Running add issue_id to subtasks migration..." -ForegroundColor Cyan
Write-Host "Connecting to: ${dbHost}:${port}/${database}"

# Try to use psql if available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    Write-Host "Using psql from: $($psqlPath.Source)"
    $env:PGPASSWORD = $password
    & psql -h $dbHost -p $port -U $username -d $database -c $sqlContent
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Migration failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
    Remove-Item Env:\PGPASSWORD
} else {
    Write-Host "psql not found. Please install PostgreSQL client tools or run the SQL manually." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SQL to execute:"
    Write-Host "================"
    Write-Host $sqlContent
    Write-Host ""
    Write-Host "Connection details:"
    Write-Host "Host: $dbHost"
    Write-Host "Port: $port"
    Write-Host "Database: $database"
    Write-Host "Username: $username"
}

