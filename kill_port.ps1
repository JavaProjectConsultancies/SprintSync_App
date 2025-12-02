# PowerShell script to kill process using a specific port
# Usage: .\kill_port.ps1 [port_number]
# Example: .\kill_port.ps1 8080

param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 8080
)

Write-Host "Checking for processes using port $Port..."

try {
    # Find process using the specified port
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        
        Write-Host "Found process(es) using port $Port : $($processIds -join ', ')"
        
        foreach ($processId in $processIds) {
            try {
                $procInfo = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($procInfo) {
                    Write-Host "Killing process: $($procInfo.ProcessName) (PID: $processId)"
                    Stop-Process -Id $processId -Force -ErrorAction Stop
                    Write-Host "✓ Process killed successfully!"
                }
            } catch {
                Write-Host "✗ Error killing process $processId : $_"
            }
        }
        
        # Wait for port to be released
        Write-Host "Waiting for port to be released..."
        Start-Sleep -Seconds 2
        
        # Verify port is free
        $stillInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($stillInUse) {
            Write-Host "Warning: Port $Port may still be in use. Trying force kill..."
            $stillInUse | ForEach-Object {
                try {
                    Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop
                    Write-Host "Force killed process: $($_.OwningProcess)"
                } catch {
                    Write-Host "Could not kill process: $($_.OwningProcess)"
                }
            }
            Start-Sleep -Seconds 2
        }
        
        # Final check
        $finalCheck = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if (-not $finalCheck) {
            Write-Host "✓ Port $Port is now free!" -ForegroundColor Green
        } else {
            Write-Host "✗ Port $Port is still in use. You may need to restart your computer." -ForegroundColor Red
        }
    } else {
        Write-Host "✓ No process found using port $Port. Port is available." -ForegroundColor Green
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nTrying alternative method..."
    
    # Alternative: Find Java processes
    $javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
    if ($javaProcesses) {
        Write-Host "Found Java processes. Killing all Java processes..."
        $javaProcesses | ForEach-Object {
            try {
                Write-Host "Killing Java process: PID $($_.Id)"
                Stop-Process -Id $_.Id -Force -ErrorAction Stop
            } catch {
                Write-Host "Could not kill Java process: $($_.Id)"
            }
        }
        Start-Sleep -Seconds 2
        Write-Host "✓ All Java processes killed." -ForegroundColor Green
    }
}

Write-Host "`nYou can now start your Spring Boot application." -ForegroundColor Cyan

