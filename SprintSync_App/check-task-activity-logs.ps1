# PowerShell script to check if task IDs from backlog exist in activity_logs table
# Make sure PostgreSQL is running and you have psql installed

# Database connection details - adjust these based on your setup
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "sprintsync"  # Adjust if your database name is different
$DB_USER = "postgres"     # Adjust if your username is different
$DB_PASSWORD = "postgres" # Adjust if your password is different

# Task IDs from the backlog console logs
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

Write-Host "Checking if task IDs exist in activity_logs table..." -ForegroundColor Cyan
Write-Host ""

# Set PGPASSWORD environment variable for psql
$env:PGPASSWORD = $DB_PASSWORD

# Build the SQL query with all task IDs
$taskIdsList = $taskIds -join "','"
$query = @"
-- Check if these task IDs exist in activity_logs
SELECT 
  al.id,
  al.entity_type,
  al.entity_id,
  al.action,
  al.description,
  al.user_id,
  al.created_at,
  t.id as task_id,
  t.title as task_title
FROM activity_logs al
LEFT JOIN tasks t ON al.entity_id = t.id
WHERE al.entity_type = 'task'
  AND al.entity_id IN ('$taskIdsList')
ORDER BY al.created_at DESC;
"@

Write-Host "Querying activity_logs for task IDs..." -ForegroundColor Yellow
$result = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $query 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host $result
    Write-Host ""
    
    # Count matches
    $lines = $result | Select-String -Pattern "^\s*\w+\s*\|\s*" | Measure-Object
    $count = $lines.Count - 1  # Subtract header row
    Write-Host "Found $count activity logs for these task IDs" -ForegroundColor $(if ($count -gt 0) { "Green" } else { "Red" })
} else {
    Write-Host "Error querying database: $result" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking what entity_types exist in activity_logs..." -ForegroundColor Cyan
$entityTypeQuery = @"
SELECT 
  entity_type,
  COUNT(*) as count,
  COUNT(DISTINCT entity_id) as unique_entities
FROM activity_logs
GROUP BY entity_type
ORDER BY count DESC;
"@

$entityTypeResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $entityTypeQuery 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $entityTypeResult
} else {
    Write-Host "Error getting entity types: $entityTypeResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking task IDs vs activity log entity_ids (exact match)..." -ForegroundColor Cyan
$matchQuery = @"
SELECT 
  t.id as task_id,
  t.title,
  COUNT(al.id) as activity_log_count,
  MAX(al.created_at) as last_activity
FROM tasks t
LEFT JOIN activity_logs al ON al.entity_type = 'task' AND al.entity_id = t.id
WHERE t.id IN ('$taskIdsList')
GROUP BY t.id, t.title
ORDER BY activity_log_count DESC;
"@

$matchResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $matchQuery 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $matchResult
} else {
    Write-Host "Error checking matches: $matchResult" -ForegroundColor Red
}

# Clear password from environment
$env:PGPASSWORD = ""

