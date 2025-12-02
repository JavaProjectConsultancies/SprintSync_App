$servicePath = "C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\service"
$controllerPath = "C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\controller"

# Fix service files
Get-ChildItem "$servicePath\*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '`n', "`n"
    $content = $content -replace '@SuppressWarnings\("null"\)', ''
    $content = $content -replace '@Service\s*\n\s*@SuppressWarnings\("null"\)', '@Service'
    $content = $content -replace '@Transactional\s*\n\s*@SuppressWarnings\("null"\)', '@Transactional'
    Set-Content $_.FullName $content
    Write-Host "Fixed and cleaned $($_.Name)"
}

# Fix controller files
Get-ChildItem "$controllerPath\*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '@SuppressWarnings\("null"\)', ''
    Set-Content $_.FullName $content
    Write-Host "Fixed and cleaned $($_.Name)"
}

# Fix config files
$configPath = "C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\config"
Get-ChildItem "$configPath\*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '@SuppressWarnings\("null"\)', ''
    Set-Content $_.FullName $content
    Write-Host "Fixed and cleaned $($_.Name)"
}

# Fix security files
$securityPath = "C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java\com\sprintsync\api\security"
Get-ChildItem "$securityPath\*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '@SuppressWarnings\("null"\)', ''
    Set-Content $_.FullName $content
    Write-Host "Fixed and cleaned $($_.Name)"
}
