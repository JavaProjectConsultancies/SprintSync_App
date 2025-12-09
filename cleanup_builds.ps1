$ErrorActionPreference = "Continue"

$FoldersToDelete = @(
    "c:\Users\snakhate\Music\SprintSync_App\Deployment_Build",
    "c:\Users\snakhate\Music\SprintSync_App\SprintSync_Deployment_20251208_130029",
    "c:\Users\snakhate\Music\SprintSync_App\Deployment_Builds\SprintSync_20251209_115901",
    "c:\Users\snakhate\Music\SprintSync_App\Deployment_Builds\SprintSync_20251209_115934"
)

foreach ($folder in $FoldersToDelete) {
    if (Test-Path $folder) {
        Write-Host "Deleting $folder..."
        Remove-Item -Path $folder -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "$folder not found."
    }
}

Write-Host "Cleanup complete."
