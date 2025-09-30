# SprintSync Database Direct Population Script
# PowerShell script to run the SQL population script directly

Write-Host "SprintSync Database Population Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Database connection parameters
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "sprintsync"
$DB_USER = "postgres"
$DB_PASSWORD = "pass121word"

Write-Host "Database: $DB_NAME on $DB_HOST`:$DB_PORT" -ForegroundColor Yellow
Write-Host "User: $DB_USER" -ForegroundColor Yellow
Write-Host ""

# Set password environment variable for non-interactive execution
$env:PGPASSWORD = $DB_PASSWORD

try {
    Write-Host "Executing database population script..." -ForegroundColor Cyan
    
    # Execute the SQL script
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "direct-db-population.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Database populated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Sample data includes:" -ForegroundColor Cyan
        Write-Host "• 5 Departments (Engineering, Product, Design, QA, Marketing)" -ForegroundColor White
        Write-Host "• 5 Domains (Web Dev, Mobile Dev, Data Analytics, DevOps, AI/ML)" -ForegroundColor White
        Write-Host "• 6 Users (Admin, PM, 2 Developers, Designer, QA)" -ForegroundColor White
        Write-Host "• 3 Projects (E-commerce, Mobile Banking, Data Analytics)" -ForegroundColor White
        Write-Host "• 6 Project Team Members" -ForegroundColor White
        Write-Host "• 3 Sprints (Authentication, Payment Gateway, Mobile Auth)" -ForegroundColor White
        Write-Host "• 3 Epics (User Auth, Payment Processing, Mobile Auth)" -ForegroundColor White
        Write-Host "• 3 Releases (v1.0 releases for each project)" -ForegroundColor White
        Write-Host "• 7 Quality Gates (Security, Performance, UAT testing)" -ForegroundColor White
        Write-Host "• 3 User Stories (Login, Registration, Biometric Auth)" -ForegroundColor White
        Write-Host "• 3 Tasks (API Implementation, UI Creation, SDK Integration)" -ForegroundColor White
        Write-Host "• 6 Subtasks (Detailed implementation steps)" -ForegroundColor White
        Write-Host "• 5 Time Entries (Realistic time tracking)" -ForegroundColor White
        Write-Host "• 3 Milestones (Project milestones with progress)" -ForegroundColor White
        Write-Host "• 3 Notifications (Task assignments, status updates)" -ForegroundColor White
        Write-Host "• 3 Comments (User interactions on tasks/stories)" -ForegroundColor White
        Write-Host "• 4 Todos (Personal todo items)" -ForegroundColor White
        Write-Host ""
        Write-Host "Total: 50+ records across 17 tables" -ForegroundColor Yellow
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Failed to populate database!" -ForegroundColor Red
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error output:" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error executing script: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clear password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
