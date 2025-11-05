# PowerShell script to add category column to subtasks table
# This script connects to the PostgreSQL database and runs the migration

$SQL_COMMAND = "ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);"

# Database connection details (from application.properties)
$DB_HOST = "sprintsync-sanikasapkale20-58f9.b.aivencloud.com"
$DB_PORT = "19973"
$DB_NAME = "defaultdb"
$DB_USER = "avnadmin"
$DB_PASSWORD = "AVNS_Dte-khF5WTLnyXPYp_q"

# Construct connection string
$CONNECTION_STRING = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

Write-Host "Adding category column to subtasks table..."
Write-Host ""

# Try to use psql if available
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "Using psql command..."
    $env:PGPASSWORD = $DB_PASSWORD
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $SQL_COMMAND
    $env:PGPASSWORD = ""
} else {
    Write-Host "psql command not found."
    Write-Host ""
    Write-Host "Please run the following SQL command manually on your database:"
    Write-Host ""
    Write-Host $SQL_COMMAND
    Write-Host ""
    Write-Host "Or install PostgreSQL client tools and run this script again."
    Write-Host ""
    Write-Host "Alternatively, you can run this SQL using any PostgreSQL client:"
    Write-Host "  1. pgAdmin"
    Write-Host "  2. DBeaver"
    Write-Host "  3. VS Code PostgreSQL extension"
    Write-Host "  4. Any other PostgreSQL management tool"
}

