# Fix: Create workflow_lanes Table

## Error
```
ERROR: relation "workflow_lanes" does not exist
```

## Solution

You need to run the SQL script to create the `workflow_lanes` table in your database.

### Option 1: Using psql (Command Line)

```bash
# Connect to your database using the connection string from application.properties
psql "postgresql://avnadmin:AVNS_Dte-khF5WTLnyXPYp_q@sprintsync-sanikasapkale20-58f9.b.aivencloud.com:19973/defaultdb?sslmode=require"

# Then run the SQL script
\i create_workflow_lanes_table_standalone.sql

# Or copy-paste the SQL directly:
```

```sql
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

CREATE INDEX IF NOT EXISTS idx_workflow_lanes_project_id ON workflow_lanes(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_lanes_display_order ON workflow_lanes(project_id, display_order);

COMMENT ON TABLE workflow_lanes IS 'Custom workflow lanes/columns for Scrum boards';
COMMENT ON COLUMN workflow_lanes.status_value IS 'Maps to task/story status value for filtering and drag-drop operations';
```

### Option 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your Aiven database:
   - Host: `sprintsync-sanikasapkale20-58f9.b.aivencloud.com`
   - Port: `19973`
   - Database: `defaultdb`
   - Username: `avnadmin`
   - Password: `AVNS_Dte-khF5WTLnyXPYp_q`
   - SSL Mode: `require`
3. Open Query Tool (Right-click database → Query Tool)
4. Copy and paste the SQL from `create_workflow_lanes_table_standalone.sql`
5. Click Execute (F5)

### Option 3: Using PowerShell Script (Windows)

```powershell
cd SprintSync_App_API
.\create-workflow-lanes-table.ps1
```

### Option 4: Direct SQL Execution via psql

```bash
# Windows PowerShell
$env:PGPASSWORD="AVNS_Dte-khF5WTLnyXPYp_q"
psql -h sprintsync-sanikasapkale20-58f9.b.aivencloud.com -p 19973 -U avnadmin -d defaultdb -f create_workflow_lanes_table_standalone.sql

# Linux/Mac
PGPASSWORD="AVNS_Dte-khF5WTLnyXPYp_q" psql -h sprintsync-sanikasapkale20-58f9.b.aivencloud.com -p 19973 -U avnadmin -d defaultdb -f create_workflow_lanes_table_standalone.sql
```

## Verify Table Creation

After running the script, verify the table exists:

```sql
-- Check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'workflow_lanes';

-- Or describe the table
\d workflow_lanes
```

## After Table Creation

Once the table is created, restart your Spring Boot application. The error should be resolved and the workflow lanes feature will work correctly.

