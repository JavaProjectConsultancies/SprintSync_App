# Migration: Add Category Column to Subtasks Table

## Problem
The database is missing the `category` column in the `subtasks` table, causing the error:
```
ERROR: column s1_0.category does not exist
```

## Solution
Run the following SQL command on your PostgreSQL database:

```sql
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);
```

## How to Run

### Option 1: Aiven Console (Recommended)
1. Go to your Aiven project: https://console.aiven.io
2. Select your PostgreSQL service
3. Click on "Service Console" or "SQL Console"
4. Run the SQL command above

### Option 2: Using Database Management Tool
If you have pgAdmin, DBeaver, or any PostgreSQL client:
1. Connect to your database using the credentials from `application.properties`
2. Open a SQL query window
3. Run the SQL command above

### Option 3: Using Command Line (if psql is installed)
```bash
psql -h sprintsync-sanikasapkale20-58f9.b.aivencloud.com -p 19973 -U avnadmin -d defaultdb -c "ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);"
```

You will be prompted for the password: `AVNS_Dte-khF5WTLnyXPYp_q`

## After Running the Migration
Once you've successfully added the column:
1. Restart your Spring Boot application (if it's running)
2. The category feature should now work correctly

## Verification
After running the migration, you can verify the column was added by running:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subtasks' AND column_name = 'category';
```

If the query returns a result, the column has been added successfully.

