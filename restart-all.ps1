# VeriGrade Platform - Restart All Services
Write-Host "🔄 Restarting VeriGrade Platform..." -ForegroundColor Cyan

# Kill existing processes on ports 3000 and 3001
Write-Host "`n📌 Stopping existing services..." -ForegroundColor Yellow

$processes3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
$processes3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes3000) {
    $processes3000 | ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "   Stopped process on port 3000 (PID: $_)" -ForegroundColor Gray
    }
}

if ($processes3001) {
    $processes3001 | ForEach-Object { 
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
        Write-Host "   Stopped process on port 3001 (PID: $_)" -ForegroundColor Gray
    }
}

Start-Sleep -Seconds 2

# Start Backend
Write-Host "`n🚀 Starting Backend (port 3001)..." -ForegroundColor Green
Set-Location C:\verigrade-bookkeeping-platform\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node ai-features-server.js" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🚀 Starting Frontend (port 3000)..." -ForegroundColor Green
Set-Location C:\verigrade-bookkeeping-platform\frontend-new
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 5

# Test connections
Write-Host "`n✅ Services Started!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n🧪 Testing backend connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Backend is responding!" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Backend not ready yet. Give it a few more seconds." -ForegroundColor Yellow
}

Write-Host "`n🌐 Opening browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host "`n✨ Platform is ready!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")



