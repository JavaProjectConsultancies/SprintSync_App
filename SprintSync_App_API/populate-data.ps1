# SprintSync Database Dummy Data Population Script
# PowerShell version for better Windows compatibility

Write-Host "Populating SprintSync database with dummy data..." -ForegroundColor Green
Write-Host ""

# Set database connection parameters
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "sprintsync"
$DB_USER = "postgres"
$DB_PASSWORD = "pass121word"

Write-Host "Connecting to database: $DB_NAME on $DB_HOST`:$DB_PORT" -ForegroundColor Yellow
Write-Host ""

# Set environment variable for password (non-interactive)
$env:PGPASSWORD = $DB_PASSWORD

try {
    # Execute the SQL script
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "populate-dummy-data.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Dummy data populated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Sample data includes:" -ForegroundColor Cyan
        Write-Host "- 5 Departments" -ForegroundColor White
        Write-Host "- 5 Domains" -ForegroundColor White
        Write-Host "- 6 Users" -ForegroundColor White
        Write-Host "- 3 Projects" -ForegroundColor White
        Write-Host "- 3 Epics" -ForegroundColor White
        Write-Host "- 3 Releases" -ForegroundColor White
        Write-Host "- 7 Quality Gates" -ForegroundColor White
        Write-Host "- 3 Sprints" -ForegroundColor White
        Write-Host "- 3 User Stories" -ForegroundColor White
        Write-Host "- 3 Tasks" -ForegroundColor White
        Write-Host "- 6 Subtasks" -ForegroundColor White
        Write-Host "- 5 Time Entries" -ForegroundColor White
        Write-Host "- 3 Notifications" -ForegroundColor White
        Write-Host "- 3 Comments" -ForegroundColor White
        Write-Host "- 4 Todos" -ForegroundColor White
        Write-Host "- 3 Milestones" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to populate dummy data!" -ForegroundColor Red
        Write-Host "Please check your database connection and try again." -ForegroundColor Red
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error executing script: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
