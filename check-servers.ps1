# Quick diagnostic script to check if servers are running
Write-Host "Checking Product Search App Servers..." -ForegroundColor Cyan
Write-Host ""

# Check if Node processes are running
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}
if ($nodeProcesses) {
    Write-Host "✓ Node.js processes found:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object {
        Write-Host "  - PID: $($_.Id), Memory: $([math]::Round($_.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ No Node.js processes found. Servers may not be running." -ForegroundColor Red
}

Write-Host ""

# Check if ports are in use
Write-Host "Checking ports..." -ForegroundColor Cyan
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "✓ Port 3000 (Frontend) is in use" -ForegroundColor Green
} else {
    Write-Host "✗ Port 3000 (Frontend) is NOT in use" -ForegroundColor Red
    Write-Host "  Start frontend with: cd frontend; npm run dev" -ForegroundColor Yellow
}

if ($port3001) {
    Write-Host "✓ Port 3001 (Backend) is in use" -ForegroundColor Green
} else {
    Write-Host "✗ Port 3001 (Backend) is NOT in use" -ForegroundColor Red
    Write-Host "  Start backend with: cd backend; npm start" -ForegroundColor Yellow
}

Write-Host ""

# Check for HTTPS certificates
Write-Host "Checking HTTPS certificates..." -ForegroundColor Cyan
$certPath = "certs\cert.pem"
$keyPath = "certs\key.pem"

if ((Test-Path $certPath) -and (Test-Path $keyPath)) {
    Write-Host "✓ HTTPS certificates found" -ForegroundColor Green
} else {
    Write-Host "✗ HTTPS certificates NOT found" -ForegroundColor Yellow
    Write-Host "  Run: .\setup-https.bat to generate certificates" -ForegroundColor Yellow
    Write-Host "  Or access via HTTP: http://192.168.1.145:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor Cyan
Write-Host "1. Make sure both frontend and backend servers are running" -ForegroundColor White
Write-Host "2. Check browser console (F12) for JavaScript errors" -ForegroundColor White
Write-Host "3. Try accessing: http://192.168.1.145:3000 (without HTTPS)" -ForegroundColor White
Write-Host "4. Check backend logs for API errors" -ForegroundColor White
