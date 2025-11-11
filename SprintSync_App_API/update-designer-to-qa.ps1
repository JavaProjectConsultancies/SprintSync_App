# PowerShell Script: Update Designer Role to QA
# Date: 2025-11-05
# Description: Updates all Designer users to QA role in the database

param(
    [string]$DbHost = "localhost",
    [string]$Port = "5432",
    [string]$Database = "sprintsync",
    [string]$Username = "postgres",
    [string]$Password = ""
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Update Designer to QA Role Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is available
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if (-not $pgService) {
    Write-Host "Warning: PostgreSQL service not found. Please ensure PostgreSQL is running." -ForegroundColor Yellow
}

# Build connection string
if ($Password) {
    $env:PGPASSWORD = $Password
}

Write-Host "Connecting to database: $Database on ${DbHost}:${Port}" -ForegroundColor Green
Write-Host ""

# Read the SQL files
$sqlFile1 = Join-Path $PSScriptRoot "update-designer-to-qa-step1.sql"
$sqlFile2 = Join-Path $PSScriptRoot "update-designer-to-qa-step2.sql"

if (-not (Test-Path $sqlFile1)) {
    Write-Host "Error: SQL file not found: $sqlFile1" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $sqlFile2)) {
    Write-Host "Error: SQL file not found: $sqlFile2" -ForegroundColor Red
    exit 1
}

Write-Host "Executing migration script (Step 1: Adding 'qa' enum value)..." -ForegroundColor Green
Write-Host ""

# Set password if provided
if ($Password) {
    $env:PGPASSWORD = $Password
}

# Execute the SQL scripts
try {
    $psqlPath = "psql"
    
    # Step 1: Add 'qa' enum value (must be committed separately)
    Write-Host "Step 1: Adding 'qa' to user_role enum..." -ForegroundColor Yellow
    $sqlContent1 = Get-Content $sqlFile1 -Raw
    $psqlArgs1 = @(
        "-h", $DbHost
        "-p", $Port
        "-d", $Database
        "-U", $Username
        "-c", $sqlContent1
    )
    
    & $psqlPath $psqlArgs1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Step 1 failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Step 1 completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Step 2: Update users and recreate enum
    Write-Host "Step 2: Updating users and recreating enum..." -ForegroundColor Yellow
    $sqlContent2 = Get-Content $sqlFile2 -Raw
    $psqlArgs2 = @(
        "-h", $DbHost
        "-p", $Port
        "-d", $Database
        "-U", $Username
        "-c", $sqlContent2
    )
    
    & $psqlPath $psqlArgs2
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Verifying changes..." -ForegroundColor Yellow
        
        # Verify the changes
        $verifyQuery = "SELECT role, COUNT(*) as user_count FROM users GROUP BY role ORDER BY role;"
        $verifyArgs = @(
            "-h", $DbHost
            "-p", $Port
            "-d", $Database
            "-U", $Username
            "-c", $verifyQuery
        )
        
        & $psqlPath $verifyArgs
        
    } else {
        Write-Host ""
        Write-Host "Error: Step 2 failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    if ($Password) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "Migration script completed." -ForegroundColor Green

