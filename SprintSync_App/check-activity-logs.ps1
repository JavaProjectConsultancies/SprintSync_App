# PowerShell script to check activity logs in the database
# Make sure PostgreSQL is running and you have psql installed

# Database connection details - adjust these based on your setup
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "sprintsync"  # Adjust if your database name is different
$DB_USER = "postgres"     # Adjust if your username is different
$DB_PASSWORD = "postgres" # Adjust if your password is different

# Task IDs from the console logs
$taskIds = @(
    "TASK30cfcb33fef64bada9e667ed17d6bc40",
    "TASKc034ab0f6a2a4fedb32d5e9c7e1dc8a8",
    "TASKd91c7822181c41bdbc3c9d964d996408",
    "TASK98f841d5c95d466a8ee498b1a97374cc",
    "TASK433c557a92fe4854940de584db504ec3",
    "TASK40a3ab4bc87c4755a7fdae098f424121",
    "TASKbb6991fff604439393ff04f175629f16",
    "TASK990e8400e29b41d4a716446655440002"
)

Write-Host "Checking activity logs for task IDs..." -ForegroundColor Cyan
Write-Host ""

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $DB_PASSWORD

# Check activity logs for each task
foreach ($taskId in $taskIds) {
    Write-Host "Task: $taskId" -ForegroundColor Yellow
    
    $query = @"
SELECT 
    id,
    user_id,
    entity_type,
    entity_id,
    action,
    description,
    created_at
FROM activity_logs
WHERE entity_type = 'task' AND entity_id = '$taskId'
ORDER BY created_at DESC
LIMIT 10;
"@
    
    $result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $lines = $result | Select-String -Pattern "^\s*\d+\s*\|\s*" | Measure-Object
        $count = $lines.Count
        Write-Host "  Found $count activity logs" -ForegroundColor $(if ($count -gt 0) { "Green" } else { "Red" })
        if ($count -gt 0) {
            Write-Host $result
        }
    } else {
        Write-Host "  Error querying database: $result" -ForegroundColor Red
    }
    Write-Host ""
}

# Check summary
Write-Host "Summary by entity type:" -ForegroundColor Cyan
$summaryQuery = @"
SELECT 
    entity_type,
    COUNT(*) as total_logs,
    COUNT(DISTINCT entity_id) as unique_entities
FROM activity_logs
GROUP BY entity_type
ORDER BY total_logs DESC;
"@

$summaryResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $summaryQuery 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $summaryResult
} else {
    Write-Host "Error getting summary: $summaryResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "Recent activity logs (last 30 days):" -ForegroundColor Cyan
$recentQuery = @"
SELECT 
    entity_type,
    entity_id,
    action,
    description,
    created_at
FROM activity_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 20;
"@

$recentResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $recentQuery 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $recentResult
} else {
    Write-Host "Error getting recent logs: $recentResult" -ForegroundColor Red
}

# Clear password from environment
$env:PGPASSWORD = ""

