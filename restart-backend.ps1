# Quick Backend Restart Script
Write-Host "Restarting VeriGrade Backend..." -ForegroundColor Cyan

# Kill any existing process on port 3001
$connections = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
foreach ($conn in $connections) {
    $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Stopping existing backend process..." -ForegroundColor Yellow
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Start backend in new window
Write-Host "Starting backend on port 3001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\verigrade-bookkeeping-platform\backend; npm run start:ai-features"

# Wait and test
Start-Sleep -Seconds 5

# Test the backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host ""
    Write-Host "✅ Backend is running!" -ForegroundColor Green
    Write-Host "   Health check: http://localhost:3001/health" -ForegroundColor Cyan
    Write-Host "   API docs: http://localhost:3001/api" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening test page..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000/test"
} catch {
    Write-Host ""
    Write-Host "❌ Backend failed to start" -ForegroundColor Red
    Write-Host "   Check the PowerShell window that opened" -ForegroundColor Yellow
}












