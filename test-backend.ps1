# Test Backend Connection Script
Write-Host "Testing LocalMart Backend Connection..." -ForegroundColor Green

# Test URLs
$localUrl = "http://localhost:5183/api/User"
$prodUrl = "https://localmartonline-1.onrender.com/api/User"

Write-Host "`n1. Testing Local Backend ($localUrl)..." -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri $localUrl -Method GET -TimeoutSec 10
    Write-Host "Local Backend Status: $($localResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Local Backend Response Length: $($localResponse.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Local Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing Production Backend ($prodUrl)..." -ForegroundColor Yellow
try {
    $prodResponse = Invoke-WebRequest -Uri $prodUrl -Method GET -TimeoutSec 30
    Write-Host "Production Backend Status: $($prodResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Production Backend Response Length: $($prodResponse.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Production Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing Network Connectivity..." -ForegroundColor Yellow
try {
    $ping = Test-NetConnection -ComputerName "google.com" -Port 80 -WarningAction SilentlyContinue
    if ($ping.TcpTestSucceeded) {
        Write-Host "Internet Connection: OK" -ForegroundColor Green
    } else {
        Write-Host "Internet Connection: Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Network Test Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
