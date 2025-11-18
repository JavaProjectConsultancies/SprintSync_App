# Script to kill process using port 8080
Write-Host "Checking for processes using port 8080..."

# Find process using port 8080
$process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process(es) using port 8080: $process"
    
    foreach ($processId in $process) {
        $procInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($procInfo) {
            Write-Host "Killing process: $($procInfo.ProcessName) (PID: $processId)"
            Stop-Process -Id $processId -Force
            Write-Host "Process killed successfully!"
        }
    }
    
    # Wait a moment for port to be released
    Start-Sleep -Seconds 2
    
    # Verify port is free
    $stillInUse = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($stillInUse) {
        Write-Host "Warning: Port 8080 may still be in use. Trying again..."
        Start-Sleep -Seconds 2
        Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | ForEach-Object {
            Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Port 8080 is now free!"
    }
} else {
    Write-Host "No process found using port 8080. Port is available."
}

Write-Host "`nYou can now start your Spring Boot application."

