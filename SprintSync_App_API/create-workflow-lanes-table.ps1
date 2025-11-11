# PowerShell script to create workflow_lanes table
# Run this script to create the table in your PostgreSQL database

Write-Host "🚀 Creating workflow_lanes table..." -ForegroundColor Cyan
Write-Host ""

# Database connection details - Update these to match your database
$DB_NAME = "sprintsync"
$DB_USER = "sprintsync_user"
$DB_HOST = "localhost"
$DB_PORT = "5432"

# Get password
$DB_PASSWORD = Read-Host "🔐 Enter password for database user '$DB_USER'" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for psql
$env:PGPASSWORD = $PlainPassword

# SQL script content
$SQL_CONTENT = @"
-- Create workflow_lanes table
CREATE TABLE IF NOT EXISTS workflow_lanes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(50) NOT NULL DEFAULT '#3B82F6',
    objective TEXT,
    wip_limit_enabled BOOLEAN DEFAULT false,
    wip_limit INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0,
    status_value VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_project_lane_order UNIQUE (project_id, display_order)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_project_id ON workflow_lanes(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_display_order ON workflow_lanes(project_id, display_order);

-- Add comments
COMMENT ON TABLE workflow_lanes IS 'Custom workflow lanes/columns for Scrum boards';
COMMENT ON COLUMN workflow_lanes.status_value IS 'Maps to task/story status value for filtering and drag-drop operations';
"@

# Write SQL to temp file
$TEMP_SQL = "$env:TEMP\create_workflow_lanes.sql"
$SQL_CONTENT | Out-File -FilePath $TEMP_SQL -Encoding UTF8

try {
    # Execute SQL script
    Write-Host "📝 Executing SQL script..." -ForegroundColor Yellow
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $TEMP_SQL 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ workflow_lanes table created successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Script execution completed with warnings:" -ForegroundColor Yellow
        Write-Host $result
    }
} catch {
    Write-Host "❌ Error executing SQL script: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Manual Instructions:" -ForegroundColor Cyan
    Write-Host "1. Open pgAdmin or psql" -ForegroundColor White
    Write-Host "2. Connect to your database: $DB_NAME" -ForegroundColor White
    Write-Host "3. Run the SQL script from: $TEMP_SQL" -ForegroundColor White
    Write-Host "   Or run: create_workflow_lanes_table_standalone.sql" -ForegroundColor White
} finally {
    # Clean up
    Remove-Item $TEMP_SQL -ErrorAction SilentlyContinue
    # Clear password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green

