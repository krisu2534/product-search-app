# Product Search & Copy App - Setup Script
# Run this script from the project root directory

Write-Host "Setting up Product Search & Copy App..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install backend dependencies
Write-Host "`nInstalling backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing backend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Install frontend dependencies
Write-Host "`nInstalling frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Create public/images directory if it doesn't exist
Write-Host "`nSetting up images directory..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/public/images")) {
    New-Item -ItemType Directory -Path "frontend/public/images" -Force | Out-Null
    Write-Host "Created frontend/public/images directory" -ForegroundColor Green
}

# Copy images if they exist in root
if (Test-Path "images") {
    Write-Host "Copying images to frontend/public/images..." -ForegroundColor Yellow
    Copy-Item -Path "images\*" -Destination "frontend/public/images" -Recurse -Force
    Write-Host "Images copied successfully" -ForegroundColor Green
} else {
    Write-Host "Warning: images folder not found in root directory" -ForegroundColor Yellow
    Write-Host "Please manually drag the images folder into frontend/public/ using File Explorer" -ForegroundColor Yellow
    Write-Host "Or ensure product images are in frontend/public/images/" -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nTo start the application:" -ForegroundColor Cyan
Write-Host "1. Open Terminal 1 and run: cd backend && npm start" -ForegroundColor White
Write-Host "2. Open Terminal 2 and run: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
