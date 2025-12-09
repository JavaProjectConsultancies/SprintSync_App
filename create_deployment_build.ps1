$ErrorActionPreference = "Stop"
$DateStr = Get-Date -Format "yyyyMMdd_HHmmss"
$DeploymentDir = "c:\Users\snakhate\Music\SprintSync_App\Deployment_Builds\SprintSync_Single_$DateStr"
$FrontendSrc = "c:\Users\snakhate\Music\SprintSync_App\SprintSync_App"
$BackendSrc = "c:\Users\snakhate\Music\SprintSync_App\SprintSync_App_API"
$BackendStatic = "$BackendSrc\src\main\resources\static"

Write-Host "Creating Single Artifact Deployment Build at $DeploymentDir..."

# Create directories
New-Item -ItemType Directory -Force -Path "$DeploymentDir\Database" | Out-Null
# No separate Frontend/Backend folders, just the JAR and DB

# --- Frontend ---
Write-Host "Building Frontend..."
Push-Location $FrontendSrc
cmd /c "npm install --legacy-peer-deps"
if ($LASTEXITCODE -ne 0) { throw "Frontend install failed" }
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { throw "Frontend build failed" }

# --- Embed Frontend in Backend ---
Write-Host "Embedding Frontend into Backend..."
if (Test-Path $BackendStatic) {
    Remove-Item -Path $BackendStatic -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $BackendStatic | Out-Null
Copy-Item -Path "build\*" -Destination $BackendStatic -Recurse -Force
Pop-Location

# --- Backend ---
Write-Host "Building Backend (with embedded Frontend)..."
Push-Location $BackendSrc
try {
    cmd /c "mvn clean package -DskipTests"
    if ($LASTEXITCODE -ne 0) { throw "Backend build failed" }
    
    # Copy the unified JAR
    Copy-Item -Path "target\*.jar" -Destination "$DeploymentDir\sprintsync-unified.jar" -Force
} finally {
    # Cleanup static resources to avoid polluting source control
    Write-Host "Cleaning up embedded static resources..."
    if (Test-Path $BackendStatic) {
        Remove-Item -Path $BackendStatic -Recurse -Force
    }
}
Pop-Location

# --- Database ---
Write-Host "Dumping Database..."
$Env:PGPASSWORD = "AVNS_fo7-HjILanrHp67LRuC"
$pgDumpPath = "pg_dump"
if (!(Get-Command $pgDumpPath -ErrorAction SilentlyContinue)) {
    Write-Warning "pg_dump not found in PATH. Skipping database dump."
} else {
    try {
        & $pgDumpPath --host=pg-36c174e-sprintsync.c.aivencloud.com --port=23096 --username=avnadmin --dbname=defaultdb --file="$DeploymentDir\Database\sprintsync_dump.sql" --clean --if-exists
        if ($LASTEXITCODE -ne 0) { Write-Warning "Database dump command finished with non-zero exit code." }
    } catch {
        Write-Warning "Database dump failed: $_"
    }
}
$Env:PGPASSWORD = $null

# Copy Migrations
Copy-Item -Path "$BackendSrc\src\main\resources\db\migration" -Destination "$DeploymentDir\Database" -Recurse -Force

# --- README ---
$ReadmeContent = @"
# SprintSync Single Artifact Build ($DateStr)

## Contents
- **sprintsync-unified.jar**: The complete application. Contains both the Backend API and the Frontend React App.
- **Database/**: Database dump and migration scripts.

## Deployment Instructions
1. **Database**: 
   - Ensure PostgreSQL is running.
   - Restore the dump: `psql -h <host> -U <user> -d <dbname> -f Database/sprintsync_dump.sql`
2. **Application**:
   - Ensure Java 17+ is installed.
   - Run: `java -jar sprintsync-unified.jar`
   - Access the application at `http://localhost:8080/` (or your server's IP). The frontend is served automatically from the root URL.

"@
Set-Content -Path "$DeploymentDir\README.md" -Value $ReadmeContent

Write-Host "Build Complete! stored in: $DeploymentDir"
