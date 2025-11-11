# Test script for API PUT request
Write-Host "🧪 Testing API PUT request..."

# Test data
$body = @{
    name = "Admin User Updated"
    email = "admin@demo.com"
    role = "admin"
} | ConvertTo-Json

Write-Host "📤 Request body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/users/USER0000000000001" -Method PUT -Body $body -ContentType "application/json"
    Write-Host "✅ API PUT request successful!"
    Write-Host "📥 Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "❌ API PUT request failed!"
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Response: $($_.Exception.Response)"
}
