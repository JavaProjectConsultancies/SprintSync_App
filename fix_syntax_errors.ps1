$basePath = "C:\Users\snakhate\Desktop\SprintSync_App-1\SprintSync_App_API\src\main\java"

# Fix all Java files with syntax errors
Get-ChildItem -Path $basePath -Recurse -Filter "*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content
    
    # Fix malformed @SuppressWarnings annotations
    $content = $content -replace '`n@SuppressWarnings\("null"\)`n', "`n@SuppressWarnings(`"null`")`n"
    $content = $content -replace '@Service`n@SuppressWarnings\("null"\)`n', "@Service`n@SuppressWarnings(`"null`")`n"
    $content = $content -replace '@Component`n`n@SuppressWarnings\("null"\)`n', "@Component`n@SuppressWarnings(`"null`")`n"
    $content = $content -replace '@RestController`n@SuppressWarnings\("null"\)`n', "@RestController`n@SuppressWarnings(`"null`")`n"
    $content = $content -replace '@Configuration`n@EnableCaching`n`n@SuppressWarnings\("null"\)`n', "@Configuration`n@EnableCaching`n@SuppressWarnings(`"null`")`n"
    $content = $content -replace '@Transactional`n@SuppressWarnings\("null"\)`n', "@Transactional`n@SuppressWarnings(`"null`")`n"
    
    # Fix any remaining backtick-n patterns
    $content = $content -replace '`n', "`n"
    
    if ($content -ne $originalContent) {
        Set-Content $_.FullName $content -NoNewline
        Write-Host "Fixed: $($_.Name)"
    }
}

Write-Host "All syntax errors fixed!"

